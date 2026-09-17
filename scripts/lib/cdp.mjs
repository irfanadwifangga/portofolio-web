// Minimal Chrome DevTools Protocol client for local measurement scripts.
// scripts/theme-audit.mjs predates this and keeps its own copy.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BROWSER =
  process.env.BROWSER_PATH ?? "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function connect(url) {
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

/**
 * Starts headless Edge with its GPU enabled. Software rendering makes the
 * WebGL hero starve the main thread and would distort every timing measured.
 * Returns the first page's DevTools URL and a close() that cleans up.
 */
export async function launch(prefix = "cdp-") {
  if (!existsSync(BROWSER)) {
    throw new Error(`No browser at ${BROWSER}. Set BROWSER_PATH to a Chromium-based browser.`);
  }
  const profile = mkdtempSync(join(tmpdir(), prefix));
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

  const close = async () => {
    try {
      const control = await connect(version.webSocketDebuggerUrl);
      control.send("Browser.close").catch(() => {});
    } catch {
      // the browser may already be gone
    }
    await sleep(1000);
    if (proc.exitCode === null) proc.kill();
    try {
      rmSync(profile, { recursive: true, force: true });
    } catch {
      // Windows can hold the profile briefly after exit; it lives in the OS temp dir.
    }
  };

  return { pageUrl: page.webSocketDebuggerUrl, close };
}
