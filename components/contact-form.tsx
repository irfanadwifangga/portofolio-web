"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { sendEmail } from "@/app/actions/send-email";
import { useToast } from "@/components/toast";
import type { Dictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/locales";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

const MAX_BODY = 2000;

const INITIAL = { name: "", email: "", subject: "", body: "" };

type Field = keyof typeof INITIAL;

/* -------------------------------------------------------------------------- */
/*  Icons                                                                     */
/* -------------------------------------------------------------------------- */

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22 11 13 2 9z" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function ComposeIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0 text-accent"
    >
      <path d="M12 20h9" />
      <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
      <path d="m15 5 3 3" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function ContactForm({
  locale,
  copy
}: {
  locale: Locale;
  copy: Dictionary["contact"]["form"];
}) {
  const { toast } = useToast();
  const [form, setForm] = React.useState(INITIAL);
  const [errors, setErrors] = React.useState<Partial<Record<Field, string>>>(
    {}
  );
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);

  /* ---- helpers ---- */

  const set = (field: Field) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value =
      field === "body"
        ? e.target.value.slice(0, MAX_BODY)
        : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateAll = (): boolean => {
    const next: Partial<Record<Field, string>> = {};
    if (!form.name.trim()) next.name = copy.errors.nameRequired;
    if (!form.email.trim()) next.email = copy.errors.emailRequired;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = copy.errors.emailInvalid;
    if (!form.subject.trim()) next.subject = copy.errors.subjectRequired;
    if (!form.body.trim()) next.body = copy.errors.bodyRequired;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  /* ---- submit ---- */

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (sending || !validateAll()) return;
    setSending(true);
    try {
      const result = await sendEmail(locale, form);
      if (result.ok) {
        toast(result.message, "success");
        setForm(INITIAL);
        setSent(true);
        setTimeout(() => setSent(false), 3000);
      } else {
        toast(result.message, "error");
      }
    } catch {
      toast(copy.unexpected, "error");
    } finally {
      setSending(false);
    }
  };

  /* Ctrl + Enter to send */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="mx-auto w-full max-w-xl"
      noValidate
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-shadow/25 transition-shadow duration-300 hover:shadow-shadow/40">
        {/* ---- Title bar ---- */}
        <div className="flex items-center gap-2.5 border-b border-border bg-surface-2 px-5 py-3">
          <ComposeIcon />
          <span className="font-mono text-sm text-foreground">
            {copy.title}
          </span>
        </div>

        {/* ---- Fields ---- */}
        <div className="divide-y divide-border">
          <FormField
            label={copy.from}
            type="text"
            placeholder={copy.namePlaceholder}
            value={form.name}
            onChange={set("name")}
            error={errors.name}
            autoComplete="name"
          />
          <FormField
            label={copy.email}
            type="email"
            placeholder={copy.emailPlaceholder}
            value={form.email}
            onChange={set("email")}
            error={errors.email}
            autoComplete="email"
          />
          <FormField
            label={copy.subject}
            type="text"
            placeholder={copy.subjectPlaceholder}
            value={form.subject}
            onChange={set("subject")}
            error={errors.subject}
          />
        </div>

        {/* ---- Message body ---- */}
        <div className="relative">
          <textarea
            placeholder={copy.bodyPlaceholder}
            value={form.body}
            onChange={set("body")}
            rows={6}
            className="w-full resize-none bg-transparent px-5 py-4 font-mono text-sm leading-relaxed text-foreground placeholder:text-muted-2/50 focus:outline-none"
          />
          {/* Character count */}
          <span
            className={`absolute bottom-3 right-4 font-mono text-xs transition-colors ${
              form.body.length > MAX_BODY * 0.9
                ? "text-red-400 light:text-red-600"
                : "text-muted-2"
            }`}
          >
            {form.body.length}/{MAX_BODY}
          </span>
          {errors.body && (
            <p className="px-5 pb-3 font-mono text-xs text-red-400 light:text-red-600">
              {errors.body}
            </p>
          )}
        </div>

        {/* ---- Footer / actions ---- */}
        <div className="flex items-center justify-between border-t border-border px-5 py-3">
          <button
            type="submit"
            disabled={sending}
            className="group relative flex items-center gap-2.5 rounded-xl bg-accent px-5 py-2.5 font-mono text-sm font-medium text-on-accent shadow-lg shadow-accent/20 transition-all duration-200 hover:bg-accent/90 hover:shadow-accent/30 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <AnimatePresence mode="wait" initial={false}>
              {sending ? (
                <motion.span
                  key="spin"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.15 }}
                >
                  <SpinnerIcon className="animate-spin" />
                </motion.span>
              ) : sent ? (
                <motion.svg
                  key="check"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M20 6 9 17l-5-5" />
                </motion.svg>
              ) : (
                <motion.span
                  key="send"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.15 }}
                >
                  <SendIcon className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </motion.span>
              )}
            </AnimatePresence>
            {sending ? copy.sending : sent ? copy.sent : copy.send}
          </button>

          <span className="hidden font-mono text-xs text-muted-2 sm:block">
            {copy.shortcut}
          </span>
        </div>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/*  Single form row — label : input side by side                              */
/* -------------------------------------------------------------------------- */

function FormField({
  label,
  type,
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
}: {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  autoComplete?: string;
}) {
  return (
    <div className="group relative flex items-center gap-0">
      <label className="w-20 shrink-0 px-5 py-3 font-mono text-xs text-muted-2 transition-colors group-focus-within:text-accent">
        {label}
      </label>
      <div className="flex-1">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className={`w-full bg-transparent py-3 pr-5 font-mono text-sm text-foreground placeholder:text-muted-2/50 focus:outline-none ${
            error ? "text-red-400 light:text-red-600" : ""
          }`}
        />
      </div>
      {/* Inline error icon */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute right-4 flex items-center"
            title={error}
          >
            <svg
              width={14}
              height={14}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-400 light:text-red-600"
              aria-hidden
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
