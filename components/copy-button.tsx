"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";

/**
 * Copy-to-clipboard control.
 *
 * The two icons cross-fade with scale + blur rather than toggling visibility,
 * and the accessible name changes with the state — motion is never the only
 * signal that the copy landed. A live region announces it for screen readers,
 * since the icon swap is purely visual.
 */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    if (!copied && !failed) return;
    const t = setTimeout(() => {
      setCopied(false);
      setFailed(false);
    }, 2000);
    return () => clearTimeout(t);
  }, [copied, failed]);

  /**
   * Falls back to a temporary selection + execCommand.
   *
   * navigator.clipboard does not exist at all on an insecure origin, which is
   * exactly what you get testing over a LAN IP from a phone — without this the
   * button would be silently dead there. Deprecated, but it is the graceful
   * degradation path and costs nothing when the modern API works.
   */
  const legacyCopy = (text: string) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      return;
    } catch {
      // fall through to the legacy path
    }
    if (legacyCopy(value)) setCopied(true);
    else setFailed(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label={
          copied ? `${label} copied` : failed ? `Could not copy ${label}` : `Copy ${label}`
        }
        className="relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted transition-[color,background-color,scale] duration-150 ease-out hover:bg-surface-2 hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none active:scale-[0.96]">
        <AnimatePresence initial={false} mode="wait">
          {copied ? (
            <motion.svg
              key="check"
              initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
              transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="absolute text-accent">
              <path d="M20 6 9 17l-5-5" />
            </motion.svg>
          ) : (
            <motion.svg
              key="copy"
              initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
              transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className={failed ? "absolute text-amber-400" : "absolute"}>
              <rect x="9" y="9" width="12" height="12" rx="2" />
              <path d="M5 15V5a2 2 0 0 1 2-2h10" />
            </motion.svg>
          )}
        </AnimatePresence>
      </button>

      <span aria-live="polite" className="sr-only">
        {copied
          ? `${label} copied to clipboard`
          : failed
            ? `Could not copy ${label}. Select it manually.`
            : ""}
      </span>
    </>
  );
}
