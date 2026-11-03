export type FeedbackMessage = {
  type: "success" | "error";
  message: string;
};

type FeedbackProps = FeedbackMessage & {
  onClose?: () => void;
  closeLabel?: string;
};

const styles: Record<FeedbackMessage["type"], string> = {
  success: "border-green-300 bg-green-50 text-green-800",
  error: "border-red-300 bg-red-50 text-red-800",
};

export function Feedback({ type, message, onClose, closeLabel }: FeedbackProps) {
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`flex items-start justify-between gap-4 rounded-md border px-4 py-3 text-sm ${styles[type]}`}
    >
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="cursor-pointer leading-none opacity-60 hover:opacity-100"
        >
          ✕
        </button>
      )}
    </div>
  );
}
