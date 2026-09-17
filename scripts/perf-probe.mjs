// Measures a production build's load, scroll and idle cost in headless Edge.
//
// Usage: bun run build && bun run start -p 3300    (second terminal)
//        bun run perf:probe [baseUrl]
// Output: .perf/report.json and a summary table. It changes nothing.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { connect, launch, sleep } from "./lib/cdp.mjs";

const BASE = process.argv[2] ?? "http://localhost:3300";
const OUT = ".perf";
const PATHS = ["/", "/id", "/nope"];
const PROFILES = [
  // Lighthouse's mobile profile: a mid-range phone on a slow 4G link.
  {
    name: "mobile",
    width: 390,
    height: 844,
    scale: 2.625,
    mobile: true,
    cpu: 4,
    network: { latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 }
  },
  { name: "desktop", width: 1440, height: 900, scale: 1, mobile: false, cpu: 1, network: null }
];

// Buffered observers installed before any page script runs.
const OBSERVERS = `(() => {
  const perf = (window.__perf = { lcp: 0, cls: 0, longTasks: [] });
  const watch = (type, onEntry) => {
    try {
      new PerformanceObserver((list) => list.getEntries().forEach(onEntry)).observe({ type, buffered: true });
    } catch {}
  };
  watch("largest-contentful-paint", (entry) => { perf.lcp = entry.startTime; });
  watch("layout-shift", (entry) => { if (!entry.hadRecentInput) perf.cls += entry.value; });
  watch("longtask", (entry) => { perf.longTasks.push({ start: entry.startTime, duration: entry.duration }); });
})();`;

async function documentWeight(path) {
  const response = await fetch(new URL(path, BASE));
  const html = Buffer.from(await response.arrayBuffer());
  return {
    status: response.status,
    htmlKb: Math.round(html.length / 1024),
    htmlGzipKb: Math.round(gzipSync(html).length / 1024)
  };
}

function loadMetrics(page) {
  return page.evaluate(`(() => {
    const perf = window.__perf;
    const nav = performance.getEntriesByType("navigation")[0];
    const resources = performance.getEntriesByType("resource");
    const sum = (list, key) => list.reduce((total, entry) => total + (entry[key] || 0), 0);
    const pick = (test) => resources.filter((entry) => test(entry.name, entry.initiatorType));
    const scripts = pick((name) => /\\.js(\\?|$)/.test(name));
    const fonts = pick((name) => /\\.(woff2?|ttf|otf)(\\?|$)/.test(name));
    const images = pick((name, type) => type === "img" || /\\.(png|jpe?g|webp|avif|svg)(\\?|$)/.test(name));
    return {
      lcpMs: Math.round(perf.lcp),
      cls: Number(perf.cls.toFixed(3)),
      totalBlockingMs: Math.round(perf.longTasks.reduce((total, task) => total + Math.max(0, task.duration - 50), 0)),
      longTasks: perf.longTasks.length,
      loadMs: Math.round(nav.loadEventEnd),
      requests: resources.length + 1,
      transferKb: Math.round((nav.transferSize + sum(resources, "transferSize")) / 1024),
      jsKb: Math.round(sum(scripts, "transferSize") / 1024),
      jsDecodedKb: Math.round(sum(scripts, "decodedBodySize") / 1024),
      fontKb: Math.round(sum(fonts, "transferSize") / 1024),
      fonts: fonts.map((entry) => entry.name.split("/").pop()),
      imageKb: Math.round(sum(images, "transferSize") / 1024)
    };
  })()`);
}

// Scrolls the whole page top to bottom over eight seconds, one step per frame,
// and records frame times and long tasks while it does.
function scrollMetrics(page) {
  return page.evaluate(`new Promise((resolve) => {
    window.__perf.longTasks = [];
    const end = document.documentElement.scrollHeight - innerHeight;
    const duration = 8000;
    const frames = [];
    const started = performance.now();
    let last = started;
    const step = (now) => {
      frames.push(now - last);
      last = now;
      const progress = Math.min(1, (now - started) / duration);
      window.scrollTo(0, end * progress);
      if (progress < 1) return requestAnimationFrame(step);
      const sorted = frames.slice(1).sort((a, b) => a - b);
      const at = (q) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))] || 0;
      const tasks = window.__perf.longTasks;
      resolve({
        fps: Math.round((sorted.length / duration) * 1000),
        p95FrameMs: Math.round(at(0.95)),
        worstFrameMs: Math.round(sorted[sorted.length - 1] || 0),
        jankFrames: sorted.filter((ms) => ms > 33.4).length,
        longTasks: tasks.length,
        longestTaskMs: Math.round(Math.max(0, ...tasks.map((task) => task.duration)))
      });
    };
    requestAnimationFrame(step);
  })`);
}

// Share of wall time the main thread is busy while the page sits still.
async function idleCost(page, anchor) {
  await page.evaluate(`(() => {
    const el = ${anchor ? `document.querySelector(${JSON.stringify(anchor)})` : "null"};
    window.scrollTo(0, el ? el.getBoundingClientRect().top + scrollY - 56 : 0);
  })()`);
  await sleep(2500);
  const read = async () =>
    Object.fromEntries((await page.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]));
  const before = await read();
  await sleep(5000);
  const after = await read();
  const seconds = after.Timestamp - before.Timestamp;
  return {
    busyPercent: Math.round(((after.TaskDuration - before.TaskDuration) / seconds) * 100),
    scriptPercent: Math.round(((after.ScriptDuration - before.ScriptDuration) / seconds) * 100)
  };
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await launch("perf-probe-");
  const page = await connect(browser.pageUrl);
  const rows = [];

  try {
    await page.send("Page.enable");
    await page.send("Network.enable");
    await page.send("Performance.enable");
    await page.send("Emulation.setFocusEmulationEnabled", { enabled: true });
    await page.send("Page.addScriptToEvaluateOnNewDocument", { source: OBSERVERS });
    await page.send("Network.setCacheDisabled", { cacheDisabled: true });

    for (const path of PATHS) {
      const weight = await documentWeight(path);
      for (const profile of PROFILES) {
        await page.send("Emulation.setDeviceMetricsOverride", {
          width: profile.width,
          height: profile.height,
          deviceScaleFactor: profile.scale,
          mobile: profile.mobile
        });
        await page.send("Emulation.setCPUThrottlingRate", { rate: profile.cpu });
        await page.send("Network.emulateNetworkConditions", {
          offline: false,
          ...(profile.network ?? { latency: 0, downloadThroughput: -1, uploadThroughput: -1 })
        });

        const loaded = page.once("Page.loadEventFired", 90000);
        await page.send("Page.navigate", { url: new URL(path, BASE).href });
        await loaded;
        await sleep(5000);

        const load = await loadMetrics(page);
        const scroll = path === "/nope" ? null : await scrollMetrics(page);
        await page.send("Emulation.setCPUThrottlingRate", { rate: 1 });
        const idle =
          profile.name === "desktop" && path !== "/nope"
            ? { hero: await idleCost(page, null), stack: await idleCost(page, "#stack") }
            : null;

        rows.push({ path, profile: profile.name, ...weight, load, scroll, idle });
        console.log(`measured ${path} (${profile.name})`);
      }
    }
  } finally {
    await browser.close();
  }

  writeFileSync(join(OUT, "report.json"), JSON.stringify({ base: BASE, measuredAt: new Date().toISOString(), rows }, null, 2));
  console.table(
    rows.map((r) => ({
      path: r.path,
      profile: r.profile,
      status: r.status,
      "html kB (gz)": `${r.htmlKb} (${r.htmlGzipKb})`,
      "LCP ms": r.load.lcpMs,
      CLS: r.load.cls,
      "TBT ms": r.load.totalBlockingMs,
      "transfer kB": r.load.transferKb,
      "JS kB": r.load.jsKb,
      "scroll fps": r.scroll?.fps ?? "-",
      "p95 frame ms": r.scroll?.p95FrameMs ?? "-",
      "jank frames": r.scroll?.jankFrames ?? "-",
      "idle busy % (hero/stack)": r.idle ? `${r.idle.hero.busyPercent}/${r.idle.stack.busyPercent}` : "-"
    }))
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
