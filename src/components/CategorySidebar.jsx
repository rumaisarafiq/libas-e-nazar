import { CATEGORIES, isComingSoonCategory } from "../data/garments";
import { useWardrobe } from "../context/WardrobeContext";

export default function CategorySidebar({ activeCategory, onSelectCategory }) {
  const { style } = useWardrobe();

  return (
    <aside className="rounded-2xl bg-white p-5 shadow-soft dark:bg-white/[0.03] lg:sticky lg:top-28">
      <p className="text-xs font-semibold tracking-widest2 text-charcoal/40 dark:text-cream/40">
        {style === "eastern" ? "EASTERN WEAR" : "WESTERN WEAR"}
      </p>

      {style === "eastern" ? (
        <ul className="mt-4 space-y-2">
          {CATEGORIES.eastern.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => onSelectCategory(cat.id)}
                className={`focus-ring w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat.id
                    ? "bg-charcoal text-cream shadow-card dark:bg-cream dark:text-charcoal"
                    : "text-charcoal/70 hover:bg-beige/30 dark:text-cream/70 dark:hover:bg-white/5"
                }`}
              >
                {cat.label}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 space-y-6">
          {CATEGORIES.western.map((group) => (
            <div key={group.group}>
              <p className="mb-2 text-[11px] font-semibold tracking-wide text-charcoal/40 dark:text-cream/40">
                {group.group}
              </p>
              <ul className="space-y-2">
                {group.items.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => onSelectCategory(cat.id)}
                      className={`focus-ring flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200 ${
                        activeCategory === cat.id
                          ? "bg-charcoal text-cream shadow-card dark:bg-cream dark:text-charcoal"
                          : "text-charcoal/70 hover:bg-beige/30 dark:text-cream/70 dark:hover:bg-white/5"
                      }`}
                    >
                      <span>{cat.label}</span>
                      {isComingSoonCategory(cat.id) && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${
                            activeCategory === cat.id
                              ? "bg-cream/20 text-cream dark:bg-charcoal/20 dark:text-charcoal"
                              : "bg-gold/15 text-gold"
                          }`}
                        >
                          Soon
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
