"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useI18n } from "@/i18n/provider";

export type ToastMessage = {
  type: "success" | "error";
  message: string;
};

type Toast = ToastMessage & { id: number };

const TOAST_DURATION_MS = 5_000;

const styles: Record<ToastMessage["type"], string> = {
  success: "border-green-300 bg-green-50 text-green-800",
  error: "border-red-300 bg-red-50 text-red-800",
};

const ToastContext = createContext<((toast: ToastMessage) => void) | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback((toast: ToastMessage) => {
    const id = ++nextId.current;
    setToasts((current) => [{ ...toast, id }, ...current]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="fixed inset-x-4 top-4 z-50 mx-auto flex max-w-md flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
  const { t } = useI18n();

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className={`flex w-full items-start justify-between gap-4 rounded-md border px-4 py-3 text-sm shadow-md ${styles[toast.type]}`}
    >
      <span>{toast.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label={t.toast.close}
        className="cursor-pointer leading-none opacity-60 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
