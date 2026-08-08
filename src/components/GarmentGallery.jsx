import { useState } from "react";
import { GARMENTS, formatPKR, isComingSoonCategory } from "../data/garments";
import { hasWesternResult } from "../data/westernTryOnResults";
import PlaceholderArt from "./PlaceholderArt";

// Categories where coverage varies garment-by-garment (some shirts have a
// try-on result, some don't) rather than being all-or-nothing for the
// whole category (like Corduroy Pants, which has none at all).
const PER_ITEM_GATED_CATEGORIES = [
  "shirts",
  "polo-shirts",
  "sweatshirts",
  "pants",
];

export default function GarmentGallery({
  categoryId,
  selectedGarmentId,
  onSelectGarment,
}) {
  const items = GARMENTS[categoryId] || [];
  const categoryComingSoon = isComingSoonCategory(categoryId);
  const isPerItemGated = PER_ITEM_GATED_CATEGORIES.includes(categoryId);
  const [failedIds, setFailedIds] = useState(() => new Set());
  const markFailed = (id) => setFailedIds((prev) => new Set(prev).add(id));

  const someItemsComingSoon =
    isPerItemGated && items.some((g) => !hasWesternResult(g.id));

  return (
    <div className="rounded-2xl bg-white/60 p-5 shadow-soft dark:bg-white/[0.02]">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-xs font-semibold tracking-widest2 text-charcoal/40 dark:text-cream/40">
          GARMENT GALLERY
        </p>
        <p className="text-xs text-charcoal/40 dark:text-cream/40">
          {items.length} item{items.length !== 1 ? "s" : ""}
        </p>
      </div>

      {categoryComingSoon && (
        <div className="mb-5 rounded-xl bg-gold/10 px-4 py-3 text-xs font-medium text-charcoal/70 dark:text-cream/70">
          Virtual try-on for this category is coming soon — you can browse the
          pieces below, but they can't be tried on or added to cart yet.
        </div>
      )}
      {!categoryComingSoon && someItemsComingSoon && (
        <div className="mb-5 rounded-xl bg-gold/10 px-4 py-3 text-xs font-medium text-charcoal/70 dark:text-cream/70">
          Pieces marked "Coming Soon" don't have a virtual try-on ready yet —
          everything else below can be tried on and added to cart normally.
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-charcoal/15 py-16 text-center dark:border-white/15">
          <p className="text-sm text-charcoal/50 dark:text-cream/50">
            Select a category to see garments here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((garment, i) => {
            const isSelected = selectedGarmentId === garment.id;
            const comingSoon =
              categoryComingSoon ||
              (isPerItemGated && !hasWesternResult(garment.id));
            return (
              <button
                key={garment.id}
                onClick={() => !comingSoon && onSelectGarment(garment)}
                disabled={comingSoon}
                style={{ animationDelay: `${i * 40}ms` }}
                className={`focus-ring group animate-fadeIn overflow-hidden rounded-xl bg-white text-left shadow-soft transition-all duration-300 dark:bg-white/[0.04] ${
                  comingSoon
                    ? "cursor-default opacity-60"
                    : "hover:-translate-y-1 hover:shadow-card"
                } ${isSelected ? "ring-2 ring-gold" : "ring-1 ring-transparent"}`}
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-white dark:bg-white/[0.06]">
                  {garment.image && !failedIds.has(garment.id) ? (
                    <img
                      src={garment.image}
                      alt={garment.name}
                      className={`h-full w-full object-contain p-3 transition-transform duration-500 ${
                        comingSoon ? "blur-sm" : "group-hover:scale-105"
                      }`}
                      onError={() => markFailed(garment.id)}
                    />
                  ) : (
                    <PlaceholderArt
                      label={garment.name}
                      className={`h-full w-full transition-transform duration-500 ${
                        comingSoon ? "blur-sm" : "group-hover:scale-105"
                      }`}
                    />
                  )}
                  {comingSoon && (
                    <div className="absolute inset-0 flex items-center justify-center bg-charcoal/40 backdrop-blur-[1px] dark:bg-black/50">
                      <span className="rounded-full bg-charcoal/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-cream shadow-soft dark:bg-cream/90 dark:text-charcoal">
                        Coming Soon
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium text-charcoal dark:text-cream">
                    {garment.name}
                  </p>
                  {typeof garment.price === "number" && !comingSoon && (
                    <p className="mt-0.5 text-xs font-semibold text-gold">
                      {formatPKR(garment.price)}
                    </p>
                  )}
                  {!comingSoon && (
                    <span
                      className={`mt-2 inline-flex w-full items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold transition-colors duration-300 ${
                        isSelected
                          ? "btn-gold text-charcoal"
                          : "bg-cream text-charcoal group-hover:bg-charcoal group-hover:text-cream dark:bg-white/5 dark:text-cream dark:group-hover:bg-cream dark:group-hover:text-charcoal"
                      }`}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
