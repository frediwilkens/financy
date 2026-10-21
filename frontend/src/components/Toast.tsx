import { CheckCircle2, Info, X } from "lucide-react";
import { useEffect } from "react";
import { create } from "zustand";

interface ToastState {
  message: string;
  kind: "success" | "error" | "info";
  visible: boolean;
  show: (message: string, kind?: ToastState["kind"]) => void;
  dismiss: () => void;
}

const useToastStore = create<ToastState>((set) => ({
  message: "",
  kind: "info",
  visible: false,
  show: (message, kind = "info") => set({ message, kind, visible: true }),
  dismiss: () => set({ visible: false }),
}));

export const toast = {
  success: (message: string) => useToastStore.getState().show(message, "success"),
  error: (message: string) => useToastStore.getState().show(message, "error"),
  info: (message: string) => useToastStore.getState().show(message, "info"),
};

export function ToastViewport() {
  const { message, kind, visible, dismiss } = useToastStore();
  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(dismiss, 3600);
    return () => window.clearTimeout(timer);
  }, [visible, dismiss]);

  if (!visible) return null;
  const Icon = kind === "success" ? CheckCircle2 : Info;
  return (
    <div className={`toast toast--${kind}`} role="status" aria-live="polite">
      <Icon size={18} />
      <span>{message}</span>
      <button type="button" aria-label="Fechar notificação" onClick={dismiss}>
        <X size={16} />
      </button>
    </div>
  );
}
