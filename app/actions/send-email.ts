"use server";

import nodemailer from "nodemailer";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface SendEmailResult {
  ok: boolean;
  message: string;
}

interface FormPayload {
  name: string;
  email: string;
  subject: string;
  body: string;
}

/* -------------------------------------------------------------------------- */
/*  In-memory rate limiter — 1 email per IP per 60 s                          */
/* -------------------------------------------------------------------------- */

const recentSenders = new Map<string, number>();
const COOLDOWN_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const last = recentSenders.get(ip);
  if (last && Date.now() - last < COOLDOWN_MS) return true;
  recentSenders.set(ip, Date.now());
  // Prevent the map from growing unbounded in long-running processes.
  if (recentSenders.size > 500) {
    const now = Date.now();
    for (const [k, v] of recentSenders) {
      if (now - v > COOLDOWN_MS) recentSenders.delete(k);
    }
  }
  return false;
}

/* -------------------------------------------------------------------------- */
/*  Validation                                                                */
/* -------------------------------------------------------------------------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(data: FormPayload): string | null {
  if (!data.name.trim()) return "Name is required.";
  if (data.name.length > 100) return "Name is too long.";
  if (!EMAIL_RE.test(data.email)) return "Please enter a valid email address.";
  if (data.email.length > 320) return "Email address is too long.";
  if (!data.subject.trim()) return "Subject is required.";
  if (data.subject.length > 200) return "Subject is too long.";
  if (!data.body.trim()) return "Message is required.";
  if (data.body.length > 5000) return "Message is too long (max 5 000 chars).";
  return null;
}

/* -------------------------------------------------------------------------- */
/*  Transporter                                                               */
/* -------------------------------------------------------------------------- */

function createTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

/* -------------------------------------------------------------------------- */
/*  Server Action                                                             */
/* -------------------------------------------------------------------------- */

export async function sendEmail(
  payload: FormPayload
): Promise<SendEmailResult> {
  /* --- env guard --- */
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error("[send-email] Missing GMAIL_USER or GMAIL_APP_PASSWORD");
    return { ok: false, message: "Mail service is not configured." };
  }

  /* --- validation --- */
  const error = validate(payload);
  if (error) return { ok: false, message: error };

  /* --- rate limit (best-effort — no real IP in dev) --- */
  const ip = payload.email; // use sender email as key since we don't have req headers in Server Actions
  if (isRateLimited(ip)) {
    return {
      ok: false,
      message: "You've sent a message recently. Please wait a minute.",
    };
  }

  /* --- send --- */
  try {
    const transport = createTransport();
    await transport.sendMail({
      from: `"${payload.name}" <${process.env.GMAIL_USER}>`,
      replyTo: `"${payload.name}" <${payload.email}>`,
      to: process.env.GMAIL_USER,
      subject: `[Portfolio] ${payload.subject}`,
      text: [
        `From: ${payload.name} <${payload.email}>`,
        `Subject: ${payload.subject}`,
        "",
        payload.body,
      ].join("\n"),
      html: `
        <div style="font-family: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 0;">
          <!-- Branding -->
          <p style="margin: 0 0 32px; font-family: monospace; font-size: 12px; color: #9ca3af; letter-spacing: 0.3px;">irfana.web.id · contact form</p>

          <!-- Meta -->
          <p style="margin: 0; font-size: 15px; color: #111;">
            <strong>${payload.name}</strong>
            <span style="color: #9ca3af;"> · </span>
            <a href="mailto:${payload.email}" style="color: #6b7280; text-decoration: none;">${payload.email}</a>
          </p>
          <p style="margin: 6px 0 0; font-size: 13px; color: #9ca3af;">${payload.subject}</p>

          <!-- Divider -->
          <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />

          <!-- Body -->
          <div style="font-size: 14px; line-height: 1.75; color: #374151; white-space: pre-wrap;">${payload.body}</div>

          <!-- Footer -->
          <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 32px 0 16px;" />
          <p style="margin: 0; font-size: 11px; color: #c4c4c4;">${new Date().toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}</p>
        </div>
      `,
    });

    return { ok: true, message: "Message sent! I'll get back to you soon." };
  } catch (err) {
    console.error("[send-email]", err);
    return {
      ok: false,
      message: "Failed to send message. Please try again later.",
    };
  }
}
