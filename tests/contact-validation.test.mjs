import { test } from "node:test";
import assert from "node:assert/strict";
import { validateContact } from "../lib/contact-validation.ts";

const VALID = { name: "Irfana", email: "irfana@example.com", subject: "Hello", body: "A message" };

test("a complete message passes", () => {
  assert.equal(validateContact(VALID), null);
});

test("missing or malformed fields are reported by key", () => {
  assert.equal(validateContact({ ...VALID, name: "  " }), "nameRequired");
  assert.equal(validateContact({ ...VALID, email: "not-an-email" }), "emailInvalid");
  assert.equal(validateContact({ ...VALID, subject: "" }), "subjectRequired");
  assert.equal(validateContact({ ...VALID, body: "\n" }), "bodyRequired");
});

test("length limits are enforced", () => {
  assert.equal(validateContact({ ...VALID, name: "a".repeat(101) }), "nameTooLong");
  assert.equal(validateContact({ ...VALID, email: `${"a".repeat(310)}@example.com` }), "emailTooLong");
  assert.equal(validateContact({ ...VALID, subject: "a".repeat(201) }), "subjectTooLong");
  assert.equal(validateContact({ ...VALID, body: "a".repeat(5001) }), "bodyTooLong");
});

test("the first problem in form order wins", () => {
  assert.equal(validateContact({ name: "", email: "x", subject: "", body: "" }), "nameRequired");
});
