import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// A small theme-aware show/hide eye icon, since the browser's native
// password-reveal icon doesn't adapt to dark mode.
function EyeToggle({ shown, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={shown ? "Hide password" : "Show password"}
      tabIndex={-1}
      className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 transition-colors duration-200 hover:text-gold dark:text-cream/50"
    >
      {shown ? (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.4 5.3A9.6 9.6 0 0 1 12 5c5 0 9 4.5 10 7-.4 1-1.2 2.3-2.3 3.5M6.3 6.9C4.3 8.3 2.9 10.2 2 12c1 2.5 5 7 10 7 1.4 0 2.7-.3 3.9-.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </button>
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || "Could not log in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 pb-16 pt-28 lg:pt-32">
      <p className="text-xs font-semibold tracking-widest2 text-gold">
        WELCOME BACK
      </p>
      <h1 className="mt-3 font-display text-3xl text-charcoal dark:text-cream">
        Log in to your account
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="text-xs font-semibold tracking-wide text-charcoal/60 dark:text-cream/60">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="focus-ring mt-2 w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 text-sm text-charcoal outline-none dark:border-white/15 dark:bg-white/5 dark:text-cream"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="text-xs font-semibold tracking-wide text-charcoal/60 dark:text-cream/60">
            Password
          </label>
          <div className="relative mt-2">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-ring w-full rounded-xl border border-charcoal/15 bg-white px-4 py-3 pr-11 text-sm text-charcoal outline-none dark:border-white/15 dark:bg-white/5 dark:text-cream"
              placeholder="••••••••"
            />
            <EyeToggle
              shown={showPassword}
              onClick={() => setShowPassword((v) => !v)}
            />
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="focus-ring btn-gold w-full rounded-full py-3.5 text-sm font-semibold text-charcoal shadow-card transition-all duration-300"
        >
          {isSubmitting ? "Logging in..." : "Log In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-charcoal/60 dark:text-cream/60">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="font-semibold text-gold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
