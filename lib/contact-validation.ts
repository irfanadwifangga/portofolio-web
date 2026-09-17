/**
 * Server-side validation for the contact form.
 *
 * Returns a message key rather than a sentence, so the action can answer in
 * the visitor's language. Import-free, so the test loads it straight into Node.
 */

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  body: string;
}

export type ContactErrorKey =
  | "nameRequired"
  | "nameTooLong"
  | "emailInvalid"
  | "emailTooLong"
  | "subjectRequired"
  | "subjectTooLong"
  | "bodyRequired"
  | "bodyTooLong";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(data: ContactPayload): ContactErrorKey | null {
  if (!data.name.trim()) return "nameRequired";
  if (data.name.length > 100) return "nameTooLong";
  if (!EMAIL_RE.test(data.email)) return "emailInvalid";
  if (data.email.length > 320) return "emailTooLong";
  if (!data.subject.trim()) return "subjectRequired";
  if (data.subject.length > 200) return "subjectTooLong";
  if (!data.body.trim()) return "bodyRequired";
  if (data.body.length > 5000) return "bodyTooLong";
  return null;
}
