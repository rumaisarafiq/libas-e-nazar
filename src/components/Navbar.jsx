import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";
import { useWardrobe } from "../context/WardrobeContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { CATEGORIES } from "../data/garments";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

// Flattened label lists used purely for display inside the mega-menu — these
// are NOT clickable, they just preview what's inside each wardrobe style.
const EASTERN_PREVIEW = CATEGORIES.eastern.map((c) => c.label);
const WESTERN_PREVIEW = CATEGORIES.western.flatMap((g) =>
  g.items.map((i) => i.label),
);

export default function Navbar() {
  const { setStyle } = useWardrobe();
  const { totals } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tryOnMenuOpen, setTryOnMenuOpen] = useState(false);
  const [mobileTryOnOpen, setMobileTryOnOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToWardrobe = (nextStyle) => {
    setStyle(nextStyle);
    setTryOnMenuOpen(false);
    setMenuOpen(false);
    setMobileTryOnOpen(false);
    navigate("/try-on");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-cream/90 dark:bg-surface/90 backdrop-blur-md shadow-soft"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4 lg:px-8">
        {/* Logo */}
        <NavLink
          to="/"
          className="flex items-center gap-2 focus-ring rounded-md"
        >
          <span className="font-display text-xl tracking-widest2 text-charcoal dark:text-cream">
            LIBAS-E-NAZAR
          </span>
          <span className="hidden h-1.5 w-1.5 rounded-full bg-gold sm:block" />
          <span className="hidden font-body text-xs font-semibold tracking-widest2 text-gold sm:block">
            AI TRY-ON
          </span>
        </NavLink>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 lg:flex">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `focus-ring relative text-sm font-medium tracking-wide transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:h-[1.5px] after:w-0 after:bg-gold after:transition-all after:duration-300 hover:text-gold hover:after:w-full ${
                isActive
                  ? "text-gold after:w-full"
                  : "text-charcoal/80 dark:text-cream/80"
              }`
            }
          >
            Home
          </NavLink>

          {/* Virtual Try-On mega-menu trigger */}
          <div
            className="relative"
            onMouseEnter={() => setTryOnMenuOpen(true)}
            onMouseLeave={() => setTryOnMenuOpen(false)}
          >
            <NavLink
              to="/try-on"
              className={({ isActive }) =>
                `focus-ring relative flex items-center gap-1 text-sm font-medium tracking-wide transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:h-[1.5px] after:w-0 after:bg-gold after:transition-all after:duration-300 hover:text-gold hover:after:w-full ${
                  isActive
                    ? "text-gold after:w-full"
                    : "text-charcoal/80 dark:text-cream/80"
                }`
              }
            >
              Virtual Try-On
              <svg
                viewBox="0 0 24 24"
                className={`h-3.5 w-3.5 transition-transform duration-200 ${tryOnMenuOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M6 9l6 6 6-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </NavLink>

            <div
              className={`absolute left-1/2 top-full z-50 w-[420px] -translate-x-1/2 pt-3 transition-all duration-200 ${
                tryOnMenuOpen
                  ? "pointer-events-auto translate-y-0 opacity-100"
                  : "pointer-events-none -translate-y-2 opacity-0"
              }`}
            >
              <div className="grid grid-cols-2 gap-6 rounded-2xl border border-charcoal/10 bg-white p-6 shadow-lift dark:border-white/10 dark:bg-surface">
                <div>
                  <button
                    onClick={() => goToWardrobe("eastern")}
                    className="focus-ring text-left text-sm font-semibold tracking-wide text-charcoal transition-colors duration-200 hover:text-gold dark:text-cream"
                  >
                    Eastern Wear →
                  </button>
                  <ul className="mt-3 space-y-1.5">
                    {EASTERN_PREVIEW.map((label) => (
                      <li
                        key={label}
                        className="cursor-default select-none text-xs text-charcoal/50 dark:text-cream/50"
                      >
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <button
                    onClick={() => goToWardrobe("western")}
                    className="focus-ring text-left text-sm font-semibold tracking-wide text-charcoal transition-colors duration-200 hover:text-gold dark:text-cream"
                  >
                    Western Wear →
                  </button>
                  <ul className="mt-3 space-y-1.5">
                    {WESTERN_PREVIEW.map((label) => (
                      <li
                        key={label}
                        className="cursor-default select-none text-xs text-charcoal/50 dark:text-cream/50"
                      >
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {links.slice(1).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `focus-ring relative text-sm font-medium tracking-wide transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:h-[1.5px] after:w-0 after:bg-gold after:transition-all after:duration-300 hover:text-gold hover:after:w-full ${
                  isActive
                    ? "text-gold after:w-full"
                    : "text-charcoal/80 dark:text-cream/80"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Right controls */}
        <div className="hidden items-center gap-3 lg:flex">
          {/* Cart */}
          <NavLink
            to="/cart"
            aria-label="Cart"
            className="focus-ring relative flex h-10 w-10 items-center justify-center rounded-full text-charcoal/70 transition-colors duration-200 hover:text-gold dark:text-cream/70"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path
                d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {totals.itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-charcoal">
                {totals.itemCount}
              </span>
            )}
          </NavLink>

          {/* Auth */}
          {user ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-charcoal/70 dark:text-cream/70">
              <span>Hi, {user.name?.split(" ")[0] || "there"}</span>
              <button
                onClick={logout}
                className="focus-ring rounded-full border border-charcoal/15 px-3 py-1.5 transition-colors duration-200 hover:border-gold hover:text-gold dark:border-white/15"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className="focus-ring rounded-full border border-charcoal/15 px-4 py-1.5 text-xs font-semibold text-charcoal/70 transition-colors duration-200 hover:border-gold hover:text-gold dark:border-white/15 dark:text-cream/70"
              >
                Log In
              </NavLink>
              <NavLink
                to="/signup"
                className="focus-ring btn-gold rounded-full px-4 py-1.5 text-xs font-semibold text-charcoal shadow-soft"
              >
                Sign Up
              </NavLink>
            </div>
          )}

          <DarkModeToggle />
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 lg:hidden">
          <NavLink
            to="/cart"
            aria-label="Cart"
            className="focus-ring relative flex h-10 w-10 items-center justify-center rounded-full text-charcoal/70 dark:text-cream/70"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path
                d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {totals.itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-charcoal">
                {totals.itemCount}
              </span>
            )}
          </NavLink>
          <button
            className="focus-ring flex h-10 w-10 items-center justify-center rounded-full"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <div className="flex flex-col gap-1.5">
              <span
                className={`h-[1.5px] w-6 bg-charcoal transition-transform duration-300 dark:bg-cream ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
              />
              <span
                className={`h-[1.5px] w-6 bg-charcoal transition-opacity duration-300 dark:bg-cream ${menuOpen ? "opacity-0" : ""}`}
              />
              <span
                className={`h-[1.5px] w-6 bg-charcoal transition-transform duration-300 dark:bg-cream ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden transition-all duration-300 lg:hidden ${
          menuOpen ? "max-h-[36rem] overflow-y-auto" : "max-h-0"
        }`}
      >
        <div className="flex flex-col gap-4 bg-cream/95 px-6 pb-6 dark:bg-surface/95">
          <NavLink
            to="/"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `focus-ring text-sm font-medium ${isActive ? "text-gold" : "text-charcoal/80 dark:text-cream/80"}`
            }
          >
            Home
          </NavLink>

          {/* Mobile Try-On accordion */}
          <div>
            <button
              onClick={() => setMobileTryOnOpen((v) => !v)}
              className="focus-ring flex w-full items-center justify-between text-sm font-medium text-charcoal/80 dark:text-cream/80"
            >
              Virtual Try-On
              <svg
                viewBox="0 0 24 24"
                className={`h-3.5 w-3.5 transition-transform duration-200 ${mobileTryOnOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M6 9l6 6 6-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${mobileTryOnOpen ? "max-h-[28rem] mt-3" : "max-h-0"}`}
            >
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-white/60 p-4 dark:bg-white/5">
                <div>
                  <button
                    onClick={() => goToWardrobe("eastern")}
                    className="focus-ring text-left text-xs font-semibold text-charcoal dark:text-cream"
                  >
                    Eastern Wear →
                  </button>
                  <ul className="mt-2 space-y-1">
                    {EASTERN_PREVIEW.map((label) => (
                      <li
                        key={label}
                        className="text-[11px] text-charcoal/50 dark:text-cream/50"
                      >
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <button
                    onClick={() => goToWardrobe("western")}
                    className="focus-ring text-left text-xs font-semibold text-charcoal dark:text-cream"
                  >
                    Western Wear →
                  </button>
                  <ul className="mt-2 space-y-1">
                    {WESTERN_PREVIEW.map((label) => (
                      <li
                        key={label}
                        className="text-[11px] text-charcoal/50 dark:text-cream/50"
                      >
                        {label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {links.slice(1).map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `focus-ring text-sm font-medium ${isActive ? "text-gold" : "text-charcoal/80 dark:text-cream/80"}`
              }
            >
              {link.label}
            </NavLink>
          ))}

          <div className="flex items-center justify-end pt-2">
            <DarkModeToggle />
          </div>

          {user ? (
            <div className="flex items-center justify-between text-xs font-semibold text-charcoal/70 dark:text-cream/70">
              <span>Hi, {user.name?.split(" ")[0] || "there"}</span>
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="focus-ring rounded-full border border-charcoal/15 px-4 py-2 dark:border-white/15"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <NavLink
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="focus-ring flex-1 rounded-full border border-charcoal/15 py-2.5 text-center text-xs font-semibold text-charcoal/70 dark:border-white/15 dark:text-cream/70"
              >
                Log In
              </NavLink>
              <NavLink
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="focus-ring btn-gold flex-1 rounded-full py-2.5 text-center text-xs font-semibold text-charcoal"
              >
                Sign Up
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
