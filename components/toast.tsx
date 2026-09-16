"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";

type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

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

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

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
        aria-label="Notifications"
        className="fixed bottom-6 right-6 z-[100] flex flex-col-reverse gap-3 pointer-events-none"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, scale: 0.95, filter: "blur(4px)" }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
              className={`pointer-events-auto flex items-center gap-3 rounded-xl border ${BORDER_COLOR[t.variant]} bg-surface/90 px-4 py-3 shadow-2xl shadow-shadow/30 backdrop-blur-md`}
            >
              {ICON[t.variant]}
              <span className="font-mono text-sm text-foreground">
                {t.message}
              </span>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
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
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
