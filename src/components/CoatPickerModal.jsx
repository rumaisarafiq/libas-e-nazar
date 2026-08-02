import { useState } from "react";
import { getCoatCategoryGroups, formatPKR } from "../data/garments";

// A dedicated "choose a coat" screen, shown when the person says yes to
// pairing a coat with their outfit. Lets them browse by type (tabs, if
// there's more than one coat category for this style) and pick one —
// clicking a coat selects it and closes this screen.
export default function CoatPickerModal({
  open,
  style,
  onSelect,
  onSkip,
  onClose,
}) {
  const groups = getCoatCategoryGroups(style);
  const [groupIndex, setGroupIndex] = useState(0);

  if (!open) return null;

  const activeGroup = groups[groupIndex] || groups[0];
  const items = activeGroup?.items || [];

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
              Choose a Coat
            </h3>
            <p className="mt-1 text-sm text-charcoal/60 dark:text-cream/60">
              Pick one to pair with your outfit, or skip this step.
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

        {groups.length > 1 && (
          <div className="flex gap-1 border-b border-charcoal/10 px-6 pt-4 dark:border-white/10">
            {groups.map((g, i) => (
              <button
                key={g.id}
                onClick={() => setGroupIndex(i)}
                className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
                  i === groupIndex
                    ? "bg-white text-charcoal dark:bg-white/10 dark:text-cream"
                    : "text-charcoal/50 hover:text-charcoal dark:text-cream/50 dark:hover:text-cream"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            {items.map((coat) => (
              <button
                key={coat.id}
                onClick={() => onSelect(coat)}
                className="focus-ring group overflow-hidden rounded-xl bg-white text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card dark:bg-white/[0.04]"
              >
                <div className="aspect-[3/4] w-full overflow-hidden bg-white dark:bg-white/[0.06]">
                  <img
                    src={coat.image}
                    alt={coat.name}
                    className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-charcoal dark:text-cream">
                    {coat.name}
                  </p>
                  <p className="text-xs font-semibold text-gold">
                    {formatPKR(coat.price)}
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
            Continue without a coat
          </button>
        </div>
      </div>
    </div>
  );
}
