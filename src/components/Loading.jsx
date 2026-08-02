import { useEffect, useState } from "react";

const DEFAULT_STAGES = [
  "Preparing your outfit...",
  "Analyzing selected garments...",
  "Rendering virtual try-on...",
  "Almost done...",
];

// Premium-feeling loading state: rotates through stage messages, a
// shimmering progress bar, and a subtle scanning animation. If the caller
// passes an explicit `message` (e.g. real backend polling status), that's
// shown as the headline and the stage rotation becomes secondary flavor
// text underneath instead of replacing it.
export default function Loading({ message, subtext }) {
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(6);

  useEffect(() => {
    const stageTimer = setInterval(() => {
      setStageIndex((i) => (i + 1) % DEFAULT_STAGES.length);
    }, 1400);
    // Climbs toward ~92% and holds — it never claims to finish before the
    // real result actually arrives (the component just unmounts then).
    const progressTimer = setInterval(() => {
      setProgress((p) => (p < 92 ? p + (92 - p) * 0.08 + 0.5 : p));
    }, 200);
    return () => {
      clearInterval(stageTimer);
      clearInterval(progressTimer);
    };
  }, []);

  const headline = message || DEFAULT_STAGES[stageIndex];
  const flavor = message ? DEFAULT_STAGES[stageIndex] : null;

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
      <div className="relative h-24 w-24">
        <div className="absolute inset-0 animate-spinSlow rounded-full border border-dashed border-gold/40" />
        <div className="absolute inset-3 animate-spin rounded-full border-2 border-charcoal/10 border-t-gold dark:border-white/10" />
        {/* AI "scanning" sweep */}
        <div className="absolute inset-3 overflow-hidden rounded-full">
          <div className="absolute inset-x-0 h-1/3 w-full animate-scanSweep bg-gradient-to-b from-gold/0 via-gold/50 to-gold/0" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="h-2 w-2 animate-pulse rounded-full bg-gold" />
        </div>
      </div>

      <div>
        <p className="font-display text-lg text-charcoal dark:text-cream">
          {headline}
        </p>
        <p className="mt-2 text-sm text-charcoal/50 dark:text-cream/50">
          {flavor ||
            subtext ||
            "This can take a moment — don't lose your patience."}
        </p>
      </div>

      <div className="h-1.5 w-64 max-w-[80vw] overflow-hidden rounded-full bg-charcoal/10 dark:bg-white/10">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#C79B4E,#E5C98B)] transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 92)}%` }}
        />
      </div>

      {/* Rotating dots, purely decorative */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold/70"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
