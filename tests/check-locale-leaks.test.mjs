import { test } from "node:test";
import assert from "node:assert/strict";
import { englishOnly, findLeaks, localizedPairs } from "../scripts/check-locale-leaks.mjs";

test("englishOnly keeps English strings that differ in Indonesian and are long enough to matter", () => {
  assert.deepEqual(
    englishOnly(
      { a: "Currently building", b: "Fullstack Developer", c: "Short", d: ["Showing the whole list"] },
      { a: "Sedang dibangun", b: "Fullstack Developer", c: "Pendek", d: ["Menampilkan seluruh daftar"] }
    ),
    ["Currently building", "Showing the whole list"]
  );
});

test("localizedPairs collects the English side of every { en, id } pair in content", () => {
  assert.deepEqual(
    localizedPairs([
      {
        name: "Seria",
        role: { en: "Freelance Fullstack Developer", id: "Fullstack Developer Freelance" },
        bullets: { en: ["Built the storefront end to end"], id: ["Membangun storefront dari awal"] },
        location: { en: "Bandar Lampung, Indonesia", id: "Bandar Lampung, Indonesia" }
      }
    ]),
    ["Freelance Fullstack Developer", "Built the storefront end to end"]
  );
});

test("findLeaks reports only the English strings present in the page text", () => {
  assert.deepEqual(
    findLeaks("Sedang dibangun Currently building Tiga sistem produksi", [
      "Currently building",
      "Not on the page at all"
    ]),
    ["Currently building"]
  );
});
