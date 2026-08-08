import { useEffect, useState } from "react";

// Sequential steps shown one at a time, each checked off as it "completes"
// — the same pattern LLM tool-call/thinking indicators use. Deliberately
// avoids the word "rendering" (or anything else that reveals technical
// pipeline details) in favor of plain, checkout-style language.
const STEPS = [
  "Preparing your selections",
  "Analyzing garment details",
  "Bringing your look to life",
  "Finishing touches",
];

const STEP_DURATION_MS = 1300;

// Premium-feeling loading state: an hourglass, a sequential step
// checklist (steps get ticked off one by one, LLM-thinking-style), and a
// progress bar. If the caller passes an explicit `message` (e.g. real
// backend polling status), that becomes the headline and the step list
// still runs underneath as supporting detail.
export default function Loading({ message, subtext }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(6);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, STEP_DURATION_MS);
    // Climbs toward ~92% and holds — it never claims to finish before the
    // real result actually arrives (the component just unmounts then).
    const progressTimer = setInterval(() => {
      setProgress((p) => (p < 92 ? p + (92 - p) * 0.08 + 0.5 : p));
    }, 200);
    return () => {
      clearInterval(stepTimer);
      clearInterval(progressTimer);
    };
  }, []);

  const headline = message || "Generating...";

  return (
    <div className="flex flex-col items-center justify-center gap-7 py-20 text-center">
      {/* Hourglass */}
      <div className="relative h-20 w-20">
        <div className="absolute inset-0 animate-spinSlow rounded-full border border-dashed border-gold/30" />
        <div className="flex h-full w-full items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            className="h-10 w-10 animate-hourglassFlip text-gold"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              d="M6 2h12M6 22h12M6 2c0 5 3.5 6.5 3.5 8s-3.5 3-3.5 8M18 2c0 5-3.5 6.5-3.5 8s3.5 3 3.5 8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M9 4.2h6M9 19.8h6" strokeLinecap="round" opacity="0.5" />
          </svg>
        </div>
      </div>

      <div>
        <p className="font-display text-lg text-charcoal dark:text-cream">
          {headline}
        </p>
        <p className="mt-2 text-sm text-charcoal/50 dark:text-cream/50">
          {subtext || "This can take a moment — don't lose your patience."}
        </p>
      </div>

      {/* Sequential step checklist */}
      <ul className="w-full max-w-xs space-y-2.5 text-left">
        {STEPS.map((step, i) => {
          const isDone = i < stepIndex;
          const isActive = i === stepIndex;
          return (
            <li key={step} className="flex items-center gap-3">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] transition-colors duration-300 ${
                  isDone
                    ? "bg-gold text-charcoal"
                    : isActive
                      ? "border-2 border-gold text-gold"
                      : "border border-charcoal/20 text-transparent dark:border-white/20"
                }`}
              >
                {isDone ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : isActive ? (
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
                ) : (
                  "•"
                )}
              </span>
              <span
                className={`text-sm transition-colors duration-300 ${
                  isDone
                    ? "text-charcoal/40 line-through dark:text-cream/40"
                    : isActive
                      ? "font-medium text-charcoal dark:text-cream"
                      : "text-charcoal/30 dark:text-cream/30"
                }`}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="h-1.5 w-64 max-w-[80vw] overflow-hidden rounded-full bg-charcoal/10 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#C79B4E,#E5C98B)] transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 92)}%` }}
        />
      </div>
    </div>
  );
}
