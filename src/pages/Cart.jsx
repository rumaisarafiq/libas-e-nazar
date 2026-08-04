import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPKR } from "../data/garments";
import PlaceholderArt from "../components/PlaceholderArt";

// Infers a human-readable role (Shirt / Trouser / Coat / ...) from a
// garment id's prefix, for the line-item badges. Falls back to "Item" for
// anything that doesn't match a known pattern rather than guessing wrong.
export function roleForItem(id = "") {
  if (/^(shirt-|polo-|sweatshirt-)/.test(id)) return "Shirt";
  if (/^(pants-|cord-)/.test(id)) return "Trouser";
  if (/^(suit-|coat-|wwc-|pc-|wc-)/.test(id)) return "Coat";
  if (/^kurta-/.test(id)) return "Kurta";
  if (/^sk-/.test(id)) return "Shalwar Kameez";
  if (/^kp-/.test(id)) return "Kurta Pajama";
  if (/^sherwani-/.test(id)) return "Sherwani";
  if (/^ps-/.test(id)) return "Shawl";
  return "Item";
}

export default function Cart() {
  const { items, removeItem, updateQty, totals } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 pb-16 pt-28 text-center lg:pt-32">
        <h1 className="font-display text-2xl text-charcoal dark:text-cream">
          Your cart is empty
        </h1>
        <p className="mt-2 text-sm text-charcoal/60 dark:text-cream/60">
          Browse the fitting room and add a garment to get started.
        </p>
        <Link
          to="/try-on"
          className="focus-ring btn-gold mt-8 rounded-full px-8 py-3.5 text-sm font-semibold text-charcoal shadow-card"
        >
          Go to Fitting Room
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 lg:px-8 lg:pt-32">
      <p className="text-xs font-semibold tracking-widest2 text-gold">
        YOUR BAG
      </p>
      <h1 className="mt-3 font-display text-4xl text-charcoal dark:text-cream">
        Shopping Cart
      </h1>
      <p className="mt-2 text-sm text-charcoal/50 dark:text-cream/50">
        {totals.itemCount} item{totals.itemCount !== 1 ? "s" : ""} ready for
        checkout
      </p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px]">
        {/* Line items */}
        <div className="space-y-5">
          {items.map((item, i) => (
            <div
              key={item.lineId}
              style={{ animationDelay: `${i * 60}ms` }}
              className="flex animate-fadeIn gap-5 rounded-2xl bg-white p-5 shadow-soft transition-shadow duration-300 hover:shadow-card dark:bg-white/[0.03]"
            >
              <div className="h-36 w-28 shrink-0 overflow-hidden rounded-xl bg-[#ECE7E0] dark:bg-white/5">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <PlaceholderArt label={item.name} className="h-full w-full" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold">
                      {roleForItem(item.id)}
                    </span>
                    <p className="mt-1.5 font-display text-lg text-charcoal dark:text-cream">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-xs text-charcoal/50 dark:text-cream/50">
                      Size: {item.size}
                      {item.style
                        ? ` · ${item.style === "eastern" ? "Eastern" : "Western"}`
                        : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.lineId)}
                    className="focus-ring text-xs font-semibold text-charcoal/40 transition-colors duration-200 hover:text-red-500 dark:text-cream/40"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex items-end justify-between">
                  <div className="flex items-center gap-3 rounded-full border border-charcoal/15 dark:border-white/15">
                    <button
                      onClick={() => updateQty(item.lineId, item.qty - 1)}
                      className="focus-ring h-9 w-9 rounded-full text-base font-semibold text-charcoal/70 transition-colors duration-200 hover:bg-cream dark:text-cream/70 dark:hover:bg-white/10"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-semibold text-charcoal dark:text-cream">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(item.lineId, item.qty + 1)}
                      className="focus-ring h-9 w-9 rounded-full text-base font-semibold text-charcoal/70 transition-colors duration-200 hover:bg-cream dark:text-cream/70 dark:hover:bg-white/10"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-charcoal/40 dark:text-cream/40">
                      {formatPKR(item.price)} each
                    </p>
                    <p className="text-lg font-semibold text-gold">
                      {formatPKR(item.price * item.qty)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <aside className="h-fit rounded-2xl border border-white/40 bg-white/80 p-7 shadow-lift backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] lg:sticky lg:top-28">
          <p className="text-xs font-semibold tracking-widest2 text-charcoal/40 dark:text-cream/40">
            ORDER SUMMARY
          </p>

          <div className="mt-5 space-y-3 border-b border-charcoal/10 pb-5 dark:border-white/10">
            {items.map((item) => (
              <div
                key={item.lineId}
                className="flex justify-between gap-3 text-sm"
              >
                <span className="text-charcoal/70 dark:text-cream/70">
                  {roleForItem(item.id)}: {item.name}
                  {item.qty > 1 ? ` ×${item.qty}` : ""}
                </span>
                <span className="shrink-0 font-medium text-charcoal dark:text-cream">
                  {formatPKR(item.price * item.qty)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2.5 text-sm">
            <div className="flex justify-between text-charcoal/70 dark:text-cream/70">
              <span>
                Subtotal ({totals.itemCount} item
                {totals.itemCount !== 1 ? "s" : ""})
              </span>
              <span>{formatPKR(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-charcoal/70 dark:text-cream/70">
              <span>Shipping</span>
              <span>
                {totals.shipping === 0 ? "Free" : formatPKR(totals.shipping)}
              </span>
            </div>
            <div className="flex justify-between text-charcoal/70 dark:text-cream/70">
              <span>Tax (5%)</span>
              <span>{formatPKR(totals.tax)}</span>
            </div>
            {totals.shipping > 0 && (
              <p className="pt-1 text-[11px] text-charcoal/40 dark:text-cream/40">
                Free shipping on orders over{" "}
                {formatPKR(totals.freeShippingThreshold)}.
              </p>
            )}
          </div>

          <div className="mt-5 flex justify-between border-t border-charcoal/10 pt-5 font-display text-2xl text-charcoal dark:border-white/10 dark:text-cream">
            <span>Total</span>
            <span className="text-gold">{formatPKR(totals.total)}</span>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="focus-ring btn-gold mt-7 w-full rounded-full py-4 text-sm font-semibold text-charcoal shadow-card transition-all duration-300 hover:shadow-lift"
          >
            Proceed to Checkout
          </button>
          <Link
            to="/try-on"
            className="focus-ring mt-3 block w-full rounded-full border border-charcoal/15 py-3.5 text-center text-sm font-semibold text-charcoal/70 transition-colors duration-200 hover:border-charcoal dark:border-white/15 dark:text-cream/70"
          >
            Continue Shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
