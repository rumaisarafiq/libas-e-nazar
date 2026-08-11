export default function GenerationModeModal({
  open,
  onSelectInstant,
  onSelectGPU,
  onCancel,
  gpuAvailable = true,
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/70 p-4 backdrop-blur-sm animate-fadeInSlow"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md animate-modalPop rounded-2xl bg-white p-6 shadow-lift dark:bg-surfaceRaised"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-xl text-charcoal dark:text-cream">
          Try on these selected items?
        </h3>
        <p className="mt-1.5 text-sm text-charcoal/60 dark:text-cream/60">
          Choose how you'd like your result generated.
        </p>

        <div className="mt-5 space-y-3">
          <button
            onClick={onSelectInstant}
            className="focus-ring flex w-full items-start gap-3 rounded-xl border border-charcoal/15 px-4 py-3.5 text-left transition-colors duration-200 hover:border-gold dark:border-white/15"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-gold">
              <span className="h-2 w-2 rounded-full bg-gold" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-charcoal dark:text-cream">
                Instant preview
              </span>
              <span className="block text-xs text-charcoal/50 dark:text-cream/50">
                Uses a ready-made result — fast.
              </span>
            </span>
          </button>

          <button
            onClick={gpuAvailable ? onSelectGPU : undefined}
            disabled={!gpuAvailable}
            className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-colors duration-200 ${
              gpuAvailable
                ? "focus-ring border-charcoal/15 hover:border-gold dark:border-white/15"
                : "cursor-not-allowed border-charcoal/10 opacity-50 dark:border-white/10"
            }`}
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-charcoal/30 dark:border-cream/30" />
            <span>
              <span className="block text-sm font-semibold text-charcoal dark:text-cream">
                Live GPU generation
              </span>
              <span className="block text-xs text-charcoal/50 dark:text-cream/50">
                {gpuAvailable
                  ? "Runs the actual AI pipeline — slower, needs the backend running."
                  : "Not connected for this wardrobe yet."}
              </span>
            </span>
          </button>

          <button
            onClick={onCancel}
            className="focus-ring flex w-full items-start gap-3 rounded-xl border border-charcoal/15 px-4 py-3.5 text-left transition-colors duration-200 hover:border-charcoal dark:border-white/15"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-charcoal/30 dark:border-cream/30" />
            <span className="block text-sm font-semibold text-charcoal dark:text-cream">
              No
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
