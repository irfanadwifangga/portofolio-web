import { test } from "node:test";
import assert from "node:assert/strict";
import { chooseLocale } from "../lib/i18n/choose-locale.ts";

const CHROME =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";

test("a stored choice beats the country", () => {
  assert.equal(chooseLocale({ cookie: "en", country: "ID", userAgent: CHROME }), "en");
  assert.equal(chooseLocale({ cookie: "id", country: "US", userAgent: CHROME }), "id");
});

test("an unknown cookie value is ignored", () => {
  assert.equal(chooseLocale({ cookie: "fr", country: "ID", userAgent: CHROME }), "id");
  assert.equal(chooseLocale({ cookie: "", country: null, userAgent: CHROME }), "en");
});

test("crawlers and link previews always get English, even from Indonesia", () => {
  for (const userAgent of [
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "WhatsApp/2.23.20.0",
    "LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)",
    "Twitterbot/1.0",
    "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
    "TelegramBot (like TwitterBot)",
    "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)"
  ]) {
    assert.equal(chooseLocale({ cookie: null, country: "ID", userAgent }), "en", userAgent);
  }
});

test("visitors in Indonesia get Indonesian", () => {
  assert.equal(chooseLocale({ cookie: null, country: "ID", userAgent: CHROME }), "id");
  assert.equal(chooseLocale({ cookie: undefined, country: "id", userAgent: CHROME }), "id");
});

test("everyone else gets English", () => {
  for (const country of ["US", "SG", "MY", null, undefined, ""]) {
    assert.equal(chooseLocale({ cookie: null, country, userAgent: CHROME }), "en", String(country));
  }
});
