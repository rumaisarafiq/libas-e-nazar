import { useState } from "react";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder: real implementation will POST to a FastAPI contact endpoint
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-32 lg:px-10 lg:pt-40">
      <div className="text-center">
        <p className="text-xs font-semibold tracking-widest2 text-gold">
          GET IN TOUCH
        </p>
        <h1 className="mt-3 font-display text-3xl text-charcoal dark:text-cream sm:text-4xl">
          Questions about the project?
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-charcoal/60 dark:text-cream/60">
          Send a message and the team will get back to you.
        </p>
      </div>

      <div className="mt-12 rounded-2xl bg-white p-8 shadow-soft dark:bg-white/[0.03] sm:p-10">
        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center animate-fadeIn">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold">
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7"
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
            <h3 className="font-display text-xl text-charcoal dark:text-cream">
              Message sent
            </h3>
            <p className="text-sm text-charcoal/60 dark:text-cream/60">
              Thanks for reaching out — we'll reply soon.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="focus-ring mt-4 text-sm font-semibold text-gold hover:underline"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold tracking-wide text-charcoal/50 dark:text-cream/50">
                  Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  className="focus-ring mt-2 w-full rounded-xl border border-charcoal/10 bg-cream px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 dark:border-white/10 dark:bg-white/5 dark:text-cream"
                />
              </div>
              <div>
                <label className="text-xs font-semibold tracking-wide text-charcoal/50 dark:text-cream/50">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="focus-ring mt-2 w-full rounded-xl border border-charcoal/10 bg-cream px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 dark:border-white/10 dark:bg-white/5 dark:text-cream"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold tracking-wide text-charcoal/50 dark:text-cream/50">
                Message
              </label>
              <textarea
                required
                rows={5}
                placeholder="Tell us what you'd like to know..."
                className="focus-ring mt-2 w-full resize-none rounded-xl border border-charcoal/10 bg-cream px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/30 dark:border-white/10 dark:bg-white/5 dark:text-cream"
              />
            </div>
            <button
              type="submit"
              className="focus-ring btn-gold w-full rounded-full py-4 text-sm font-semibold text-charcoal shadow-card transition-transform duration-300 hover:-translate-y-0.5"
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
