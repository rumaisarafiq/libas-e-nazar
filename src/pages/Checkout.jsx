import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { formatPKR } from "../data/garments";
import { generateInvoicePDF } from "../utils/generateInvoicePDF";
import { roleForItem } from "./Cart";

function makeOrderId() {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LEN-${Date.now().toString().slice(-6)}${rand}`;
}

// Every order needs a customer identifier — a real Firebase UID for
// logged-in users, but guests need one too so their orders aren't just
// stamped null. This generates a persistent guest ID once per browser
// (stored in localStorage) so the same guest's orders can still be
// grouped together, clearly prefixed so it's obvious in the database
// which orders came from a guest vs. a real account.
const GUEST_ID_KEY = "len_guest_id_v1";
function getOrCreateGuestId() {
  try {
    let id = localStorage.getItem(GUEST_ID_KEY);
    if (!id) {
      id = `guest-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(GUEST_ID_KEY, id);
    }
    return id;
  } catch {
    // localStorage unavailable (e.g. private browsing) — fall back to a
    // one-off id that just won't persist across orders.
    return `guest-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  }
}

// Writes the order to the real "orders" collection in Firestore.
// serverTimestamp() records when Firestore actually received it — more
// reliable than trusting the browser's clock for the authoritative
// record (the human-readable date/time on the object itself is still
// built from the browser clock, which is fine for display purposes).
async function saveOrderToDatabase(purchase) {
  await addDoc(collection(db, "orders"), {
    ...purchase,
    createdAtServer: serverTimestamp(),
  });
}

const PAKISTAN_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Hyderabad",
  "Sialkot",
];

export default function Checkout() {
  const { items, totals, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    postalCode: "",
  });
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [errors, setErrors] = useState({});
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [placed, setPlaced] = useState(false);
  const [lastPurchase, setLastPurchase] = useState(null);

  const updateField = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = "Required";
    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    )
      next.email = "Enter a valid email address";
    if (!form.phone.trim()) next.phone = "Required";
    else if (!/^[\d+\-\s]{7,}$/.test(form.phone.trim()))
      next.phone = "Enter a valid phone number";
    if (!form.address.trim()) next.address = "Required";
    if (!form.city.trim()) next.city = "Required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!validate()) return;

    const now = new Date();
    const purchase = {
      orderId: makeOrderId(),
      userName: form.fullName.trim(),
      userEmail: form.email.trim() || user?.email || null,
      userUid: user?.uid || getOrCreateGuestId(),
      shipping_details: {
        phone: form.phone.trim(),
        address: form.address.trim(),
        apartment: form.apartment.trim() || null,
        city: form.city.trim(),
        postalCode: form.postalCode.trim() || null,
        country: "Pakistan",
      },
      shippingMethod,
      paymentMethod,
      items: items.map((i) => ({
        name: i.name,
        role: roleForItem(i.id),
        size: i.size,
        style: i.style,
        qty: i.qty,
        price: i.price,
      })),
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      tax: totals.tax,
      grandTotal: totals.total,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      createdAt: now.toISOString(),
    };

    setIsPlacingOrder(true);
    setOrderError(null);
    try {
      await saveOrderToDatabase(purchase);
      setLastPurchase(purchase);
      clearCart();
      setPlaced(true);
    } catch (err) {
      console.error("Failed to save order:", err);
      setOrderError(
        "Couldn't reach the database to save your order. Check your connection and try again.",
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (lastPurchase) generateInvoicePDF(lastPurchase);
  };

  if (placed) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 pb-16 pt-28 text-center lg:pt-32">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold">
          <svg
            viewBox="0 0 24 24"
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M5 13l4 4L19 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h1 className="mt-6 font-display text-2xl text-charcoal dark:text-cream">
          Order placed!
        </h1>
        <p className="mt-2 text-sm text-charcoal/60 dark:text-cream/60">
          Thanks, {lastPurchase?.userName} — your order{" "}
          <span className="font-semibold text-gold">
            {lastPurchase?.orderId}
          </span>{" "}
          will be delivered to {lastPurchase?.shipping_details?.city}. This is a
          demo checkout, so no payment was actually taken.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={handleDownloadInvoice}
            className="focus-ring btn-gold rounded-full px-8 py-3.5 text-sm font-semibold text-charcoal shadow-card"
          >
            Download Invoice (PDF)
          </button>
          <Link
            to="/try-on"
            className="focus-ring rounded-full border border-charcoal/15 px-8 py-3.5 text-sm font-semibold text-charcoal/70 dark:border-white/15 dark:text-cream/70"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 pb-16 pt-28 text-center lg:pt-32">
        <h1 className="font-display text-2xl text-charcoal dark:text-cream">
          Your cart is empty
        </h1>
        <p className="mt-2 text-sm text-charcoal/60 dark:text-cream/60">
          Add something from the fitting room before checking out.
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

  const inputClass = (field) =>
    `focus-ring w-full rounded-xl border bg-white px-4 py-3 text-sm text-charcoal outline-none dark:bg-white/5 dark:text-cream ${
      errors[field]
        ? "border-red-400"
        : "border-charcoal/15 dark:border-white/15"
    }`;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-28 lg:px-8 lg:pt-32">
      <p className="text-xs font-semibold tracking-widest2 text-gold">
        CHECKOUT
      </p>
      <h1 className="mt-3 font-display text-4xl text-charcoal dark:text-cream">
        Delivery Details
      </h1>

      <form
        onSubmit={handlePlaceOrder}
        className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_400px]"
      >
        {/* Left: delivery form */}
        <div className="space-y-8">
          <section className="rounded-2xl bg-white p-6 shadow-soft dark:bg-white/[0.03]">
            <h2 className="font-display text-lg text-charcoal dark:text-cream">
              Contact & Delivery
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-charcoal/60 dark:text-cream/60">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={updateField("fullName")}
                  placeholder="e.g. Muhammad Ali Khan"
                  className={`mt-1.5 ${inputClass("fullName")}`}
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-charcoal/60 dark:text-cream/60">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={updateField("email")}
                  placeholder="e.g. muhammad.ali.khan@gmail.com"
                  className={`mt-1.5 ${inputClass("email")}`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-charcoal/60 dark:text-cream/60">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={updateField("phone")}
                  placeholder="0321-4567890"
                  className={`mt-1.5 ${inputClass("phone")}`}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-charcoal/60 dark:text-cream/60">
                  Address
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={updateField("address")}
                  placeholder="e.g. House 12-B, Street 5, Gulshan-e-Iqbal"
                  className={`mt-1.5 ${inputClass("address")}`}
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-red-500">{errors.address}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-charcoal/60 dark:text-cream/60">
                  Apartment, Suite, etc. (optional)
                </label>
                <input
                  type="text"
                  value={form.apartment}
                  onChange={updateField("apartment")}
                  className="mt-1.5 focus-ring w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none dark:border-white/15 dark:bg-white/5 dark:text-cream"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal/60 dark:text-cream/60">
                  City
                </label>
                <input
                  list="pk-cities"
                  value={form.city}
                  onChange={updateField("city")}
                  placeholder="e.g. Karachi"
                  className={`mt-1.5 ${inputClass("city")}`}
                />
                <datalist id="pk-cities">
                  {PAKISTAN_CITIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                {errors.city && (
                  <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal/60 dark:text-cream/60">
                  Postal Code (optional)
                </label>
                <input
                  type="text"
                  value={form.postalCode}
                  onChange={updateField("postalCode")}
                  placeholder="e.g. 75300"
                  className="mt-1.5 focus-ring w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none dark:border-white/15 dark:bg-white/5 dark:text-cream"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-charcoal/60 dark:text-cream/60">
                  Country
                </label>
                <input
                  type="text"
                  value="Pakistan"
                  disabled
                  className="mt-1.5 w-full rounded-xl border border-charcoal/15 bg-cream px-4 py-3 text-sm text-charcoal/60 dark:border-white/15 dark:bg-white/[0.02] dark:text-cream/50"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-soft dark:bg-white/[0.03]">
            <h2 className="font-display text-lg text-charcoal dark:text-cream">
              Shipping Method
            </h2>
            <div className="mt-4 space-y-3">
              {[
                {
                  id: "standard",
                  label: "Standard Delivery",
                  note: "3–5 business days",
                  cost: totals.shipping,
                },
                {
                  id: "express",
                  label: "Express Delivery",
                  note: "1–2 business days",
                  cost: totals.shipping + 500,
                },
              ].map((option) => (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3.5 transition-colors duration-200 ${
                    shippingMethod === option.id
                      ? "border-gold bg-gold/5"
                      : "border-charcoal/15 dark:border-white/15"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={shippingMethod === option.id}
                      onChange={() => setShippingMethod(option.id)}
                      className="accent-gold"
                    />
                    <span>
                      <span className="block text-sm font-medium text-charcoal dark:text-cream">
                        {option.label}
                      </span>
                      <span className="block text-xs text-charcoal/50 dark:text-cream/50">
                        {option.note}
                      </span>
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-charcoal dark:text-cream">
                    {option.cost === 0 ? "Free" : formatPKR(option.cost)}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-soft dark:bg-white/[0.03]">
            <h2 className="font-display text-lg text-charcoal dark:text-cream">
              Payment
            </h2>
            <p className="mt-1 text-xs text-charcoal/50 dark:text-cream/50">
              Demo checkout — no real payment is processed either way.
            </p>
            <div className="mt-4 space-y-3">
              {[
                { id: "cod", label: "Cash on Delivery", disabled: false },
                { id: "card", label: "Debit / Credit Card", disabled: true },
              ].map((option) => (
                <label
                  key={option.id}
                  className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors duration-200 ${
                    option.disabled
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  } ${
                    paymentMethod === option.id
                      ? "border-gold bg-gold/5"
                      : "border-charcoal/15 dark:border-white/15"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === option.id}
                    onChange={() => setPaymentMethod(option.id)}
                    disabled={option.disabled}
                    className="accent-gold"
                  />
                  <span className="text-sm font-medium text-charcoal dark:text-cream">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Right: order summary */}
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
              <span>Subtotal</span>
              <span>{formatPKR(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-charcoal/70 dark:text-cream/70">
              <span>Shipping</span>
              <span>
                {(shippingMethod === "express"
                  ? totals.shipping + 500
                  : totals.shipping) === 0
                  ? "Free"
                  : formatPKR(
                      shippingMethod === "express"
                        ? totals.shipping + 500
                        : totals.shipping,
                    )}
              </span>
            </div>
            <div className="flex justify-between text-charcoal/70 dark:text-cream/70">
              <span>Tax (5%)</span>
              <span>{formatPKR(totals.tax)}</span>
            </div>
          </div>
          <div className="mt-5 flex justify-between border-t border-charcoal/10 pt-5 font-display text-2xl text-charcoal dark:border-white/10 dark:text-cream">
            <span>Total</span>
            <span className="text-gold">
              {formatPKR(
                totals.subtotal +
                  (shippingMethod === "express"
                    ? totals.shipping + 500
                    : totals.shipping) +
                  totals.tax,
              )}
            </span>
          </div>

          <button
            type="submit"
            disabled={isPlacingOrder}
            className="focus-ring btn-gold mt-7 w-full rounded-full py-4 text-sm font-semibold text-charcoal shadow-card transition-all duration-300 hover:shadow-lift disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPlacingOrder ? "Placing Order..." : "Place Order"}
          </button>
          {orderError && (
            <p className="mt-3 text-center text-xs text-red-500">
              {orderError}
            </p>
          )}
          <Link
            to="/cart"
            className="focus-ring mt-3 block w-full rounded-full border border-charcoal/15 py-3.5 text-center text-sm font-semibold text-charcoal/70 transition-colors duration-200 hover:border-charcoal dark:border-white/15 dark:text-cream/70"
          >
            Back to Cart
          </Link>
        </aside>
      </form>
    </div>
  );
}
