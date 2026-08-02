export default function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Yes",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/70 p-4 backdrop-blur-sm animate-fadeInSlow"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm animate-modalPop rounded-2xl border border-white/10 bg-cream/95 p-6 text-center shadow-lift backdrop-blur-xl dark:bg-surface/90"
      >
        <h3 className="font-display text-xl text-charcoal dark:text-cream">
          {title}
        </h3>
        {description && (
          <p className="mt-2 text-sm text-charcoal/60 dark:text-cream/60">
            {description}
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            className="focus-ring flex-1 rounded-full border border-charcoal/15 py-3 text-sm font-semibold text-charcoal/70 transition-colors duration-200 hover:border-charcoal hover:text-charcoal dark:border-white/15 dark:text-cream/70 dark:hover:border-cream dark:hover:text-cream"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="focus-ring btn-gold flex-1 rounded-full py-3 text-sm font-semibold text-charcoal shadow-card transition-colors duration-200"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
