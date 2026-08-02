import { GARMENTS, formatPKR } from "../data/garments";
import { hasWesternResult } from "../data/westernTryOnResults";

// The same idea as CoatPickerModal, but for pants: a dedicated "choose
// your trouser" screen shown when the person says yes to picking pants,
// instead of letting the outfit default to "model's own pants." Only
// shows pants that actually have a try-on result — same per-item
// availability rule as the main gallery.
export default function PantsPickerModal({ open, onSelect, onSkip, onClose }) {
  if (!open) return null;

  const items = (GARMENTS.pants || []).filter((p) => hasWesternResult(p.id));

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/70 p-4 backdrop-blur-sm animate-fadeInSlow"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-4xl animate-modalPop flex-col overflow-hidden rounded-2xl border border-white/10 bg-cream shadow-lift backdrop-blur-xl dark:bg-surface"
      >
        <div className="flex items-start justify-between gap-4 border-b border-charcoal/10 p-6 dark:border-white/10">
          <div>
            <p className="text-xs font-semibold tracking-widest2 text-gold">
              COMPLETE THE LOOK
            </p>
            <h3 className="mt-1 font-display text-2xl text-charcoal dark:text-cream">
              Choose Pants
            </h3>
            <p className="mt-1 text-sm text-charcoal/60 dark:text-cream/60">
              Pick a pair to pair with your top, or skip this step.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-charcoal/50 hover:bg-charcoal/5 hover:text-charcoal dark:text-cream/50 dark:hover:bg-white/10 dark:hover:text-cream"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            {items.map((pants) => (
              <button
                key={pants.id}
                onClick={() => onSelect(pants)}
                className="focus-ring group overflow-hidden rounded-xl bg-white text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card dark:bg-white/[0.04]"
              >
                <div className="aspect-[3/4] w-full overflow-hidden bg-white dark:bg-white/[0.06]">
                  <img
                    src={pants.image}
                    alt={pants.name}
                    className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-charcoal dark:text-cream">
                    {pants.name}
                  </p>
                  <p className="text-xs font-semibold text-gold">
                    {formatPKR(pants.price)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-charcoal/10 p-4 dark:border-white/10">
          <button
            onClick={onSkip}
            className="focus-ring w-full rounded-full border border-charcoal/15 py-3 text-sm font-semibold text-charcoal/70 transition-colors duration-200 hover:border-charcoal hover:text-charcoal dark:border-white/15 dark:text-cream/70 dark:hover:border-cream dark:hover:text-cream"
          >
            Continue without picking pants
          </button>
        </div>
      </div>
    </div>
  );
}
