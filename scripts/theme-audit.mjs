// Browser audit for the light and dark themes.
//
// Drives a Chromium browser (Edge by default) over the DevTools Protocol using
// Node's built-in fetch and WebSocket, so it needs no dependencies. It checks
// text contrast and brand-mark contrast in both themes at three widths,
// screenshots every section, the header and the open menu, and exercises the
// theme toggle's behaviour.
//
// Usage:
//   bun run build && bun run start -p 3300      (leave running)
//   bun run audit:theme [url]                   (default http://localhost:3300)
//
// Output: .theme-audit/report.json and .theme-audit/<theme>-<width>-<name>.png.
// Exits 1 on any contrast, mark, behaviour or console failure. Text drawn over
// a canvas, image or video cannot be judged from the DOM, so it is listed for
// manual review in the report and never counted as a pass.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { inflateSync } from "node:zlib";
import { composite, contrast } from "./lib/contrast.mjs";

const TARGET = process.argv[2] ?? "http://localhost:3300";
const OUT = ".theme-audit";
const BROWSER =
  process.env.BROWSER_PATH ?? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const SECTIONS = ["top", "building", "deep-dives", "side-project", "stack", "experience", "contact"];
const VIEWPORTS = [
  { width: 1440, height: 900, mobile: false },
  { width: 1024, height: 800, mobile: false },
  { width: 390, height: 844, mobile: true }
];
const THEMES = ["dark", "light"];
const TEXT_MIN = 4.5;
const LARGE_TEXT_MIN = 3;
const MARK_MIN = 3;
const TOGGLE = 'button[aria-label^="Switch"]';
// Vercel Web Analytics serves its script only on Vercel deployments. Locally it
// 404s on every page load in either theme, so it is not a finding here.
const IGNORED_CONSOLE = [/\/_vercel\/insights\//];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ----------------------------- DevTools Protocol ----------------------------- */

async function connect(url) {
  const socket = new WebSocket(url);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  let nextId = 0;
  const pending = new Map();
  const listeners = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id !== undefined) {
      const entry = pending.get(message.id);
      pending.delete(message.id);
      if (!entry) return;
      if (message.error) entry.reject(new Error(`${entry.method}: ${message.error.message}`));
      else entry.resolve(message.result);
      return;
    }
    for (const listener of listeners.get(message.method) ?? []) listener(message.params);
  });
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, { resolve, reject, method });
      socket.send(JSON.stringify({ id, method, params }));
    });
  const off = (method, listener) =>
    listeners.set(method, (listeners.get(method) ?? []).filter((l) => l !== listener));
  const on = (method, listener) => listeners.set(method, [...(listeners.get(method) ?? []), listener]);
  const once = (method, timeout = 30000) =>
    new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        off(method, listener);
        reject(new Error(`timed out waiting for ${method}`));
      }, timeout);
      const listener = (params) => {
        clearTimeout(timer);
        off(method, listener);
        resolve(params);
      };
      on(method, listener);
    });
  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    }
    return result.result.value;
  };
  return { send, on, once, evaluate };
}

async function launch() {
  if (!existsSync(BROWSER)) {
    throw new Error(`No browser at ${BROWSER}. Set BROWSER_PATH to a Chromium-based browser.`);
  }
  const profile = mkdtempSync(join(tmpdir(), "theme-audit-"));
  const proc = spawn(
    BROWSER,
    [
      "--headless=new",
      "--no-first-run",
      "--no-default-browser-check",
      "--hide-scrollbars",
      `--user-data-dir=${profile}`,
      "--remote-debugging-port=0",
      "about:blank"
    ],
    { stdio: "ignore" }
  );
  let port = "";
  for (let attempt = 0; attempt < 80 && !port; attempt++) {
    try {
      port = readFileSync(join(profile, "DevToolsActivePort"), "utf8").split("\n")[0].trim();
    } catch {
      // not written yet
    }
    if (!port) await sleep(250);
  }
  if (!port) {
    proc.kill();
    throw new Error("the browser never opened a DevTools port");
  }
  const version = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = targets.find((target) => target.type === "page");
  return { proc, profile, browserUrl: version.webSocketDebuggerUrl, pageUrl: page.webSocketDebuggerUrl };
}

async function load(page, url) {
  const loaded = page.once("Page.loadEventFired");
  await page.send("Page.navigate", { url });
  await loaded;
  await sleep(2500); // hydration, fonts and the first reveals
}

/* ---------------------------------- Images ---------------------------------- */

/** Minimal PNG decoder for the 8-bit RGB/RGBA screenshots Chromium produces. */
function decodePng(buffer) {
  let offset = 8;
  let width = 0;
  let height = 0;
  let channels = 0;
  const idat = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      if (data[8] !== 8 || data[12] !== 0) throw new Error("unsupported PNG (bit depth or interlace)");
      channels = data[9] === 6 ? 4 : data[9] === 2 ? 3 : 0;
      if (!channels) throw new Error(`unsupported PNG colour type ${data[9]}`);
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset += 12 + length;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const pixels = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const left = x >= channels ? pixels[y * stride + x - channels] : 0;
      const up = y > 0 ? pixels[(y - 1) * stride + x] : 0;
      const upLeft = y > 0 && x >= channels ? pixels[(y - 1) * stride + x - channels] : 0;
      let value = line[x];
      if (filter === 1) value += left;
      else if (filter === 2) value += up;
      else if (filter === 3) value += (left + up) >> 1;
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        value += pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
      }
      pixels[y * stride + x] = value & 255;
    }
  }
  return { width, height, channels, pixels };
}

async function capture(page, clip, { beyond = false } = {}) {
  const shot = await page.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: beyond,
    clip: { ...clip, scale: 1 }
  });
  return Buffer.from(shot.data, "base64");
}

function markRatio(png, box, mark) {
  const pad = 4;
  const clamp = (value, max) => Math.max(0, Math.min(max, value));
  const left = clamp(Math.round(mark.x - box.x) - pad, png.width - 1);
  const top = clamp(Math.round(mark.y - box.y) - pad, png.height - 1);
  const right = clamp(Math.round(mark.x - box.x + mark.width) + pad, png.width - 1);
  const bottom = clamp(Math.round(mark.y - box.y + mark.height) + pad, png.height - 1);
  const pixel = (x, y) => {
    const i = (y * png.width + x) * png.channels;
    return [png.pixels[i], png.pixels[i + 1], png.pixels[i + 2], 1];
  };
  const ring = [];
  for (let x = left; x <= right; x++) ring.push(pixel(x, top), pixel(x, bottom));
  for (let y = top; y <= bottom; y++) ring.push(pixel(left, y), pixel(right, y));
  const median = (channel) => ring.map((p) => p[channel]).sort((a, b) => a - b)[ring.length >> 1];
  const background = [median(0), median(1), median(2), 1];
  const ratios = [];
  for (let y = top + pad; y <= bottom - pad; y++) {
    for (let x = left + pad; x <= right - pad; x++) ratios.push(contrast(pixel(x, y), background));
  }
  ratios.sort((a, b) => b - a);
  return ratios[Math.min(15, ratios.length - 1)] ?? 1;
}

/* ------------------------------ In-page functions ------------------------------ */

function marksIn(selector) {
  const region = document.querySelector(selector);
  if (!region) return [];
  const opacityOf = (el) => {
    let opacity = 1;
    for (let node = el; node; node = node.parentElement) opacity *= Number(getComputedStyle(node).opacity);
    return opacity;
  };
  return [...region.querySelectorAll("[data-tech-mark]")]
    .map((el) => ({ el, rect: el.getBoundingClientRect() }))
    .filter(
      ({ el, rect }) =>
        rect.width > 1 &&
        rect.height > 1 &&
        rect.right > 0 &&
        rect.left < innerWidth &&
        getComputedStyle(el).visibility !== "hidden" &&
        opacityOf(el) > 0.05
    )
    .map(({ el, rect }) => ({
      label: el.getAttribute("data-tech-mark"),
      x: rect.left + scrollX,
      y: rect.top + scrollY,
      width: rect.width,
      height: rect.height
    }));
}

function textsIn(selector) {
  const region = document.querySelector(selector);
  if (!region) return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const rgba = (css) => {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "transparent";
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return [r, g, b, a / 255];
  };
  const media = [...document.querySelectorAll("canvas, img, video")]
    .filter((el) => getComputedStyle(el).position !== "fixed")
    .map((el) => ({ el, rect: el.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 1 && rect.height > 1);
  const overMedia = (el, cx, cy) =>
    media.some(({ el: item, rect }) => {
      if (cx < rect.left || cx > rect.right || cy < rect.top || cy > rect.bottom) return false;
      if (el.contains(item)) return false;
      for (let node = el; node && !node.contains(item); node = node.parentElement) {
        if (rgba(getComputedStyle(node).backgroundColor)[3] >= 1) return false;
      }
      return true;
    });
  const opacityOf = (el) => {
    let opacity = 1;
    for (let node = el; node; node = node.parentElement) opacity *= Number(getComputedStyle(node).opacity);
    return opacity;
  };
  const layersOf = (el) => {
    const layers = [];
    for (let node = el; node; node = node.parentElement) {
      const colour = rgba(getComputedStyle(node).backgroundColor);
      if (colour[3] > 0) layers.push(colour);
      if (colour[3] >= 1) break;
    }
    if (!layers.length || layers[layers.length - 1][3] < 1) layers.push([255, 255, 255, 1]);
    return layers;
  };

  const texts = [];
  for (const el of [region, ...region.querySelectorAll("*")]) {
    const own = [...el.childNodes]
      .filter((node) => node.nodeType === 3)
      .map((node) => node.textContent)
      .join("")
      .trim();
    if (!own) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 1 || rect.height <= 1 || rect.right <= 0 || rect.left >= innerWidth) continue;
    const style = getComputedStyle(el);
    if (style.visibility === "hidden") continue;
    const opacity = opacityOf(el);
    if (opacity < 0.05) continue;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const fg = rgba(style.color);
    texts.push({
      text: own.slice(0, 60),
      where: `${el.tagName.toLowerCase()}.${(el.getAttribute("class") ?? "").split(" ").slice(0, 3).join(".")}`,
      fg: [fg[0], fg[1], fg[2], fg[3] * opacity],
      layers: layersOf(el),
      fontSize: parseFloat(style.fontSize),
      fontWeight: Number(style.fontWeight),
      disabled: Boolean(el.closest(":disabled")),
      overMedia: overMedia(el, cx, cy)
    });
  }
  const box = region.getBoundingClientRect();
  return { texts, box: { x: box.left + scrollX, y: box.top + scrollY, width: box.width, height: box.height } };
}

/* --------------------------------- Checks --------------------------------- */

async function settle(page, selector, { report, theme, width }) {
  await sleep(400);
  const started = Date.now();
  let fewest = Infinity;
  let progressAt = started;
  let moving = 0;
  for (;;) {
    moving = await page.evaluate(`(() => {
      const region = document.querySelector(${JSON.stringify(selector)});
      if (!region) return 0;
      const animating = document.getAnimations().filter((animation) => {
        const target = animation.effect && animation.effect.target;
        return target && region.contains(target) && animation.playState !== "finished" &&
          animation.effect.getComputedTiming().iterations !== Infinity;
      }).length;
      const fading = [region, ...region.querySelectorAll("*")].filter((el) => {
        const inline = el.style && el.style.opacity;
        return inline !== "" && inline !== undefined && Number(inline) < 0.98;
      }).length;
      const scrambling = region.querySelectorAll(".text-encrypted").length;
      return animating + fading + scrambling;
    })()`);
    if (moving === 0) break;
    const now = Date.now();
    if (moving < fewest) {
      fewest = moving;
      progressAt = now;
    }
    if (now - progressAt > 3000 || now - started > 60000) break;
    await sleep(250);
  }
  if (moving > 0) {
    report.behaviour.push({
      name: `${selector} settles before it is measured (${theme} ${width})`,
      pass: false,
      detail: { stillMoving: moving, waitedMs: Date.now() - started }
    });
  }
  await sleep(300);
}

function textRatio(entry) {
  let background = entry.layers[entry.layers.length - 1];
  for (let i = entry.layers.length - 2; i >= 0; i--) background = composite(entry.layers[i], background);
  return contrast(composite(entry.fg, background), background);
}

const signature = (marks) => marks.map((m) => `${m.label}@${Math.round(m.x)},${Math.round(m.y)}`).join("|");

async function auditRegion(page, report, { theme, width, name, selector }) {
  const region = await page.evaluate(`(${textsIn.toString()})(${JSON.stringify(selector)})`);
  if (!region) {
    report.behaviour.push({ name: `${theme} ${width}: ${selector} exists`, pass: false, detail: "missing" });
    return null;
  }
  for (const entry of region.texts) {
    if (entry.disabled) continue;
    const ratio = textRatio(entry);
    const large = entry.fontSize >= 24 || (entry.fontSize >= 18.66 && entry.fontWeight >= 700);
    const row = {
      theme,
      width,
      region: name,
      text: entry.text,
      where: entry.where,
      ratio: Number(ratio.toFixed(2)),
      required: large ? LARGE_TEXT_MIN : TEXT_MIN
    };
    report.textsChecked++;
    if (entry.overMedia) report.manual.push(row);
    else if (ratio < row.required) report.contrastFailures.push(row);
  }

  const fits = await page.evaluate(`(() => {
    const rect = document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();
    if (rect.height > innerHeight) return false;
    if (rect.top < 0 || rect.bottom > innerHeight) window.scrollTo(0, rect.top + scrollY);
    return true;
  })()`);
  if (fits) await sleep(300);
  const shoot = () => capture(page, region.box, { beyond: !fits });

  const marksExpression = `(${marksIn.toString()})(${JSON.stringify(selector)})`;
  let marks = [];
  let image = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    marks = await page.evaluate(marksExpression);
    image = await shoot();
    if (signature(await page.evaluate(marksExpression)) === signature(marks)) break;
  }
  if (marks.length) {
    const png = decodePng(image);
    const low = [];
    for (const mark of marks) {
      report.marksChecked++;
      const ratio = markRatio(png, region.box, mark);
      if (ratio < MARK_MIN) low.push({ label: mark.label, ratio });
    }
    if (low.length) {
      let again = [];
      for (let attempt = 0; attempt < 10; attempt++) {
        await sleep(500);
        again = await page.evaluate(marksExpression);
        if (low.every((entry) => again.some((m) => m.label === entry.label))) break;
      }
      const retake = decodePng(await shoot());
      for (const entry of low) {
        const mark = again.find((m) => m.label === entry.label);
        const ratio = mark ? Math.max(entry.ratio, markRatio(retake, region.box, mark)) : entry.ratio;
        if (ratio < MARK_MIN) {
          report.markFailures.push({ theme, width, region: name, label: entry.label, ratio: Number(ratio.toFixed(2)) });
        }
      }
    }
  }
  return image;
}

async function behaviour(page) {
  const results = [];
  const check = (name, pass, detail) => results.push({ name, pass: Boolean(pass), detail });
  const theme = () => page.evaluate("document.documentElement.dataset.theme ?? null");
  const stored = () => page.evaluate("localStorage.getItem('theme')");
  const setSystem = (value) =>
    page.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value }] });

  await page.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await setSystem("dark");
  await load(page, TARGET);
  await page.evaluate("localStorage.removeItem('theme')");
  await load(page, TARGET);

  check("no stored choice follows a dark system", (await theme()) === "dark", await theme());
  const label = await page.evaluate(`document.querySelector(${JSON.stringify(TOGGLE)})?.getAttribute("aria-label") ?? null`);
  check("the header toggle offers the light theme", label === "Switch to light theme", label);
  if (!label) return results;

  const swap = await page.evaluate(`new Promise((resolve) => {
    const running = (el) => getComputedStyle(el).transitionDuration.split(",").some((d) => parseFloat(d) > 0);
    const moving = [...document.querySelectorAll("body *")].filter((el) => !el.closest("[data-theme-motion]") && running(el));
    new MutationObserver((_, observer) => {
      observer.disconnect();
      resolve({
        sampled: moving.length,
        marker: document.documentElement.hasAttribute("data-theme-switching"),
        stillRunning: moving.filter(running).length
      });
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    document.querySelector(${JSON.stringify(TOGGLE)}).click();
  })`);
  check("transitions are off on the swap frame", swap.sampled > 0 && swap.marker && swap.stillRunning === 0, swap);

  const settled = await page.evaluate(`new Promise((resolve) => {
    const report = (framesRan) => resolve({
      framesRan,
      visibility: document.visibilityState,
      marker: document.documentElement.hasAttribute("data-theme-switching")
    });
    const timer = setTimeout(() => report(false), 2000);
    requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => {
      clearTimeout(timer);
      report(true);
    })));
  })`);
  check("the marker is removed once frames have painted", settled.framesRan && !settled.marker, settled);

  const afterAway = { theme: await theme(), stored: await stored() };
  check("toggling away from a dark system stores light", afterAway.theme === "light" && afterAway.stored === "light", afterAway);

  await load(page, TARGET);
  check("the stored choice survives a reload", (await theme()) === "light", await theme());

  await page.evaluate(`document.querySelector(${JSON.stringify(TOGGLE)}).click()`);
  await sleep(200);
  const afterBack = { theme: await theme(), stored: await stored() };
  check("toggling back to the system theme clears the stored choice", afterBack.theme === "dark" && afterBack.stored === null, afterBack);

  await setSystem("light");
  await sleep(400);
  check("with no stored choice, a system change applies live", (await theme()) === "light", await theme());

  await page.evaluate("document.querySelector('.sm-toggle').click()");
  await sleep(1000);
  const whileOpen = await page.evaluate(`(() => {
    const actions = document.querySelector(".sm-header-actions");
    return actions ? { inert: actions.inert, visibility: getComputedStyle(actions).visibility } : null;
  })()`);
  check("the toggle is hidden and inert while the menu is open", whileOpen?.inert && whileOpen.visibility === "hidden", whileOpen);
  await page.evaluate("document.querySelector('.sm-toggle').click()");
  await sleep(800);

  await page.send("Emulation.setEmulatedMedia", { features: [] });
  return results;
}

async function matrix(page, report) {
  for (const theme of THEMES) {
    const { identifier } = await page.send("Page.addScriptToEvaluateOnNewDocument", {
      source: `try { localStorage.setItem("theme", ${JSON.stringify(theme)}); } catch {}`
    });
    for (const viewport of VIEWPORTS) {
      const { width } = viewport;
      const tag = `${theme}-${width}`;
      const save = (image, name) => {
        if (!image) return;
        writeFileSync(join(OUT, `${tag}-${name}.png`), image);
        report.screenshots++;
      };
      await page.send("Emulation.setDeviceMetricsOverride", {
        width,
        height: viewport.height,
        deviceScaleFactor: 1,
        mobile: viewport.mobile
      });
      await load(page, TARGET);
      const applied = await page.evaluate("document.documentElement.dataset.theme ?? null");
      report.behaviour.push({ name: `${tag}: stored theme applied on load`, pass: applied === theme, detail: applied });

      save(await auditRegion(page, report, { theme, width, name: "header", selector: ".staggered-menu-header" }), "header");

      for (const id of SECTIONS) {
        await page.evaluate(`(async () => {
          const section = document.getElementById(${JSON.stringify(id)});
          if (!section) return;
          const top = section.getBoundingClientRect().top + scrollY - 56;
          for (let y = top; y < top + section.offsetHeight; y += innerHeight * 0.6) {
            window.scrollTo(0, y);
            await new Promise((resolve) => setTimeout(resolve, 250));
          }
          window.scrollTo(0, top);
        })()`);
        await settle(page, `#${id}`, { report, theme, width });
        save(await auditRegion(page, report, { theme, width, name: `#${id}`, selector: `#${id}` }), id);
      }

      await page.evaluate("window.scrollTo(0, 0); document.querySelector('.sm-toggle')?.click()");
      await sleep(600);
      await settle(page, ".staggered-menu-panel", { report, theme, width });
      await auditRegion(page, report, { theme, width, name: "menu panel", selector: ".staggered-menu-panel" });
      save(await capture(page, { x: 0, y: 0, width, height: viewport.height }), "menu");
      await page.evaluate("document.querySelector('.sm-toggle')?.click()");
      await sleep(700);
    }
    await page.send("Page.removeScriptToEvaluateOnNewDocument", { identifier });
  }
}

/* ---------------------------------- Main ---------------------------------- */

function printRows(title, rows, format) {
  console.log(`${title}: ${rows.length}`);
  for (const row of rows.slice(0, 30)) console.log(`  ${format(row)}`);
  if (rows.length > 30) console.log(`  … ${rows.length - 30} more in ${OUT}/report.json`);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const report = {
    target: TARGET,
    textsChecked: 0,
    marksChecked: 0,
    screenshots: 0,
    contrastFailures: [],
    markFailures: [],
    manual: [],
    behaviour: [],
    console: []
  };
  const noteConsole = (type, text) => {
    if (IGNORED_CONSOLE.some((pattern) => pattern.test(text))) return;
    report.console.push({ type, text: text.slice(0, 300) });
  };

  const browser = await launch();
  const page = await connect(browser.pageUrl);
  page.on("Runtime.consoleAPICalled", ({ type, args }) => {
    const text = args.map((arg) => arg.value ?? arg.description ?? "").join(" ");
    if (type === "error" || (type === "warning" && /hydrat/i.test(text))) noteConsole(type, text);
  });
  page.on("Runtime.exceptionThrown", ({ exceptionDetails }) => {
    noteConsole("exception", String(exceptionDetails.exception?.description ?? exceptionDetails.text));
  });
  page.on("Log.entryAdded", ({ entry }) => {
    if (entry.level === "error") noteConsole(`log:${entry.source}`, `${entry.text} ${entry.url ?? ""}`);
  });

  try {
    await page.send("Page.enable");
    await page.send("Runtime.enable");
    await page.send("Log.enable");
    await page.send("Emulation.setFocusEmulationEnabled", { enabled: true });
    await page.send("Page.bringToFront");
    report.behaviour.push(...(await behaviour(page)));
    await matrix(page, report);
  } finally {
    try {
      const control = await connect(browser.browserUrl);
      control.send("Browser.close").catch(() => {});
    } catch {
      // the browser may already be gone
    }
    await sleep(1000);
    if (browser.proc.exitCode === null) browser.proc.kill();
    try {
      rmSync(browser.profile, { recursive: true, force: true });
    } catch {
      // Windows can hold the profile briefly after exit; it lives in the OS temp dir.
    }
  }

  writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2));

  const failedBehaviour = report.behaviour.filter((row) => !row.pass);
  console.log(
    `theme-audit: ${report.textsChecked} text elements, ${report.marksChecked} marks, ${report.screenshots} screenshots → ${OUT}/`
  );
  printRows("contrast failures", report.contrastFailures, (r) =>
    `${r.theme} ${r.width} ${r.region}  ${r.ratio}:1 < ${r.required}  "${r.text}"  (${r.where})`
  );
  printRows("mark failures", report.markFailures, (r) => `${r.theme} ${r.width} ${r.region}  ${r.label}  ${r.ratio}:1 < ${MARK_MIN}`);
  printRows("behaviour failures", failedBehaviour, (r) => `${r.name}  ${JSON.stringify(r.detail)}`);
  printRows("console errors", report.console, (r) => `${r.type}  ${r.text}`);
  const manualByRegion = {};
  for (const row of report.manual) manualByRegion[row.region] = (manualByRegion[row.region] ?? 0) + 1;
  console.log(
    `manual review (text over a canvas, image or video): ${report.manual.length} rows — ` +
      Object.entries(manualByRegion).map(([region, count]) => `${region} ${count}`).join(", ")
  );

  const failures = report.contrastFailures.length + report.markFailures.length + failedBehaviour.length + report.console.length;
  process.exit(failures ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
