"use client";

import * as React from "react";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  /** Playing its exit transition; removed once that has run. */
  leaving: boolean;
}

/** Matches the exit transition's duration in the markup below. */
const EXIT_MS = 250;

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

const ICON: Record<ToastVariant, React.ReactNode> = {
  success: (
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
      className="shrink-0 text-emerald-400 light:text-emerald-600"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  error: (
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
      className="shrink-0 text-red-400 light:text-red-600"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  info: (
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
      className="shrink-0 text-accent"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

const BORDER_COLOR: Record<ToastVariant, string> = {
  success: "border-emerald-400/20 light:border-emerald-600/30",
  error: "border-red-400/20 light:border-red-600/30",
  info: "border-accent/20",
};

const DEFAULT_LABELS = { region: "Notifications", dismiss: "Dismiss" };

export function ToastProvider({
  children,
  labels = DEFAULT_LABELS
}: {
  children: React.ReactNode;
  labels?: { region: string; dismiss: string };
}) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, EXIT_MS);
  }, []);

  const addToast = React.useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, variant, leaving: false }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const value = React.useMemo(
    () => ({ toast: addToast }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast container — bottom-right, stacks upward */}
      <div
        aria-live="polite"
        aria-label={labels.region}
        className="fixed bottom-6 right-6 z-[100] flex flex-col-reverse gap-3 pointer-events-none"
      >
        {toasts.map((t) => (
          // Enters from @starting-style and leaves through the `leaving` classes;
          // the item is removed after EXIT_MS, so the exit is seen.
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 rounded-xl border ${BORDER_COLOR[t.variant]} bg-surface/90 px-4 py-3 shadow-2xl shadow-shadow/30 backdrop-blur-md transition-[opacity,translate,scale,filter] duration-300 ease-out starting:translate-y-5 starting:scale-95 starting:opacity-0 starting:blur-sm motion-reduce:transition-none ${
              t.leaving ? "-translate-y-2.5 scale-95 opacity-0 blur-sm" : "translate-y-0 scale-100 opacity-100 blur-none"
            }`}>
            {ICON[t.variant]}
            <span className="font-mono text-sm text-foreground">
              {t.message}
            </span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label={labels.dismiss}
              className="ml-2 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:text-foreground"
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
                aria-hidden
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
