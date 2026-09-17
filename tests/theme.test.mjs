import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BOOT_SCRIPT,
  STORAGE_KEY,
  resolveTheme,
  revealRadius,
  storedAfterToggle,
  toggleTheme
} from "../lib/theme.ts";

// A minimal browser: storage, matchMedia, <html> and rAF. Only what
// lib/theme.ts touches.
function fakeBrowser({
  stored = null,
  systemDark = false,
  theme,
  storageThrows = false,
  reducedMotion = false,
  viewTransitions = false
} = {}) {
  const store = new Map(stored === null ? [] : [[STORAGE_KEY, stored]]);
  const attributes = new Map();
  const frames = [];
  const root = {
    dataset: theme ? { theme } : {},
    style: {},
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: (name) => attributes.delete(name),
    hasAttribute: (name) => attributes.has(name),
    animations: [],
    animate(keyframes, options) {
      this.animations.push({ keyframes, options });
    }
  };
  // View transitions: the update callback is held until the test runs it,
  // the way a browser runs it only after snapshotting the old view.
  const transitions = [];
  const blocked = () => {
    throw new Error("storage blocked");
  };
  globalThis.localStorage = storageThrows
    ? { getItem: blocked, setItem: blocked, removeItem: blocked }
    : {
        getItem: (key) => store.get(key) ?? null,
        setItem: (key, value) => store.set(key, String(value)),
        removeItem: (key) => store.delete(key)
      };
  globalThis.window = {
    innerWidth: 1000,
    innerHeight: 800,
    matchMedia: (query) => ({ matches: query.includes("reduced-motion") ? reducedMotion : systemDark })
  };
  globalThis.document = { documentElement: root };
  if (viewTransitions) {
    globalThis.document.startViewTransition = (update) => {
      let markReady;
      const transition = {
        update,
        skipped: false,
        ready: new Promise((resolve) => (markReady = resolve)),
        finished: new Promise(() => {}),
        skipTransition() {
          this.skipped = true;
        },
        run() {
          update();
          markReady();
        }
      };
      transitions.push(transition);
      return transition;
    };
  }
  globalThis.getComputedStyle = () => ({ backgroundColor: "" });
  globalThis.requestAnimationFrame = (callback) => frames.push(callback);
  return {
    store,
    root,
    transitions,
    runFrame: () => frames.splice(0).forEach((callback) => callback())
  };
}

test("an explicit stored choice wins over the system", () => {
  assert.equal(resolveTheme("light", true), "light");
  assert.equal(resolveTheme("dark", false), "dark");
});

test("no stored choice, or an unknown one, follows the system", () => {
  assert.equal(resolveTheme(null, true), "dark");
  assert.equal(resolveTheme(null, false), "light");
  assert.equal(resolveTheme("sepia", true), "dark");
});

test("toggling to the system's own theme clears the override", () => {
  assert.deepEqual(storedAfterToggle("dark", false), { next: "light", stored: null });
  assert.deepEqual(storedAfterToggle("light", true), { next: "dark", stored: null });
});

test("toggling away from the system's theme stores the choice", () => {
  assert.deepEqual(storedAfterToggle("dark", true), { next: "light", stored: "light" });
  assert.deepEqual(storedAfterToggle("light", false), { next: "dark", stored: "dark" });
});

test("the boot script agrees with resolveTheme for every input", () => {
  for (const stored of [null, "light", "dark", "sepia"]) {
    for (const systemDark of [true, false]) {
      const { root } = fakeBrowser({ stored, systemDark });
      new Function(BOOT_SCRIPT)();
      const expected = resolveTheme(stored, systemDark);
      assert.equal(root.dataset.theme, expected, `stored=${stored} systemDark=${systemDark}`);
      assert.equal(root.style.colorScheme, expected);
    }
  }
});

test("the boot script falls back to the system when storage throws", () => {
  const { root } = fakeBrowser({ systemDark: false, storageThrows: true });
  new Function(BOOT_SCRIPT)();
  assert.equal(root.dataset.theme, "light");
});

test("toggleTheme applies the next theme and follows the storage rule", () => {
  const { store, root } = fakeBrowser({ theme: "dark", systemDark: true });
  assert.equal(toggleTheme(), "light");
  assert.equal(root.dataset.theme, "light");
  assert.equal(root.style.colorScheme, "light");
  assert.equal(store.get(STORAGE_KEY), "light");

  assert.equal(toggleTheme(), "dark");
  assert.equal(store.has(STORAGE_KEY), false, "back to the system theme clears the key");
});

test("transitions stay suppressed for two frames after a swap", () => {
  const { root, runFrame } = fakeBrowser({ theme: "dark", systemDark: true });
  toggleTheme();
  assert.equal(root.hasAttribute("data-theme-switching"), true);
  runFrame();
  assert.equal(root.hasAttribute("data-theme-switching"), true, "still set after one frame");
  runFrame();
  assert.equal(root.hasAttribute("data-theme-switching"), false);
});

test("toggleTheme still works when storage is blocked", () => {
  const { root } = fakeBrowser({ theme: "dark", systemDark: true, storageThrows: true });
  assert.equal(toggleTheme(), "light");
  assert.equal(root.dataset.theme, "light");
});

test("the reveal radius reaches the farthest corner", () => {
  assert.equal(revealRadius(0, 0, 300, 400), 500);
  assert.equal(revealRadius(300, 400, 300, 400), 500);
  assert.equal(revealRadius(150, 0, 300, 400), Math.hypot(150, 400));
});

test("with no view transitions, a toggle from the button swaps at once", () => {
  const { root } = fakeBrowser({ theme: "dark", systemDark: true });
  assert.equal(toggleTheme({ x: 10, y: 10 }), "light");
  assert.equal(root.dataset.theme, "light");
  assert.equal(root.animations.length, 0);
});

test("reduced motion swaps at once even where view transitions exist", () => {
  const { root, transitions } = fakeBrowser({ theme: "dark", systemDark: true, reducedMotion: true, viewTransitions: true });
  toggleTheme({ x: 10, y: 10 });
  assert.equal(root.dataset.theme, "light");
  assert.equal(transitions.length, 0);
});

test("a toggle without an origin swaps at once", () => {
  const { root, transitions } = fakeBrowser({ theme: "dark", systemDark: true, viewTransitions: true });
  toggleTheme();
  assert.equal(root.dataset.theme, "light");
  assert.equal(transitions.length, 0);
});

test("a toggle from the button reveals the new theme from that point", async () => {
  const { root, transitions } = fakeBrowser({ theme: "dark", systemDark: true, viewTransitions: true });
  assert.equal(toggleTheme({ x: 900, y: 20 }), "light");
  assert.equal(transitions.length, 1);
  assert.equal(root.dataset.theme, "dark", "applied inside the transition, after the snapshot");

  transitions[0].run();
  assert.equal(root.dataset.theme, "light");
  await transitions[0].ready;
  await Promise.resolve();

  assert.equal(root.animations.length, 1);
  const { keyframes, options } = root.animations[0];
  const radius = revealRadius(900, 20, 1000, 800);
  assert.deepEqual(keyframes.clipPath, ["circle(0px at 900px 20px)", `circle(${radius}px at 900px 20px)`]);
  assert.equal(options.pseudoElement, "::view-transition-new(root)");
});

test("two clicks before the first transition applies still alternate", () => {
  const { root, store, transitions } = fakeBrowser({ theme: "dark", systemDark: true, viewTransitions: true });
  assert.equal(toggleTheme({ x: 0, y: 0 }), "light");
  assert.equal(toggleTheme({ x: 0, y: 0 }), "dark");
  assert.equal(store.has(STORAGE_KEY), false);
  transitions[0].run();
  transitions[1].run();
  assert.equal(root.dataset.theme, "dark");
});
