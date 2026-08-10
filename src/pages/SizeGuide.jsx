import { useState } from "react";

// Standard menswear grading, with M matching the model actually shown
// throughout the fitting room. Values stored separately per unit so the
// toggle below can switch display without any conversion math (and
// without risking rounding drift between in/cm).
const SIZE_CHART = [
  {
    size: "XS",
    height: { in: "5'5\" – 5'7\"", cm: "165–170 cm" },
    chest: { in: '36"', cm: "91 cm" },
    waist: { in: '28"', cm: "71 cm" },
    hip: { in: '35"', cm: "89 cm" },
    shoulder: { in: '16.5"', cm: "42 cm" },
    sleeve: { in: '23.5"', cm: "60 cm" },
    inseam: { in: '30"', cm: "76 cm" },
    neck: { in: '14"', cm: "36 cm" },
  },
  {
    size: "S",
    height: { in: "5'7\" – 5'9\"", cm: "170–175 cm" },
    chest: { in: '38"', cm: "97 cm" },
    waist: { in: '30"', cm: "76 cm" },
    hip: { in: '37"', cm: "94 cm" },
    shoulder: { in: '17.25"', cm: "44 cm" },
    sleeve: { in: '24.25"', cm: "62 cm" },
    inseam: { in: '31"', cm: "79 cm" },
    neck: { in: '14.75"', cm: "37 cm" },
  },
  {
    size: "M",
    height: { in: "5'9\" – 6'1\"", cm: "175–185 cm" },
    chest: { in: '40"', cm: "102 cm" },
    waist: { in: '32"', cm: "81 cm" },
    hip: { in: '39"', cm: "99 cm" },
    shoulder: { in: '18"', cm: "46 cm" },
    sleeve: { in: '25"', cm: "64 cm" },
    inseam: { in: '32"', cm: "81 cm" },
    neck: { in: '15.5"', cm: "39 cm" },
    isShown: true,
  },
  {
    size: "L",
    height: { in: "6'0\" – 6'2\"", cm: "183–188 cm" },
    chest: { in: '42"', cm: "107 cm" },
    waist: { in: '34"', cm: "86 cm" },
    hip: { in: '41"', cm: "104 cm" },
    shoulder: { in: '18.75"', cm: "48 cm" },
    sleeve: { in: '25.75"', cm: "65 cm" },
    inseam: { in: '33"', cm: "84 cm" },
    neck: { in: '16.25"', cm: "41 cm" },
  },
  {
    size: "XL",
    height: { in: "6'1\" – 6'4\"", cm: "185–193 cm" },
    chest: { in: '44"', cm: "112 cm" },
    waist: { in: '36"', cm: "91 cm" },
    hip: { in: '43"', cm: "109 cm" },
    shoulder: { in: '19.5"', cm: "50 cm" },
    sleeve: { in: '26.5"', cm: "67 cm" },
    inseam: { in: '34"', cm: "86 cm" },
    neck: { in: '17"', cm: "43 cm" },
  },
];

const ROWS = [
  { key: "height", label: "Height" },
  { key: "chest", label: "Chest" },
  { key: "waist", label: "Waist" },
  { key: "hip", label: "Hip" },
  { key: "shoulder", label: "Shoulder Width" },
  { key: "sleeve", label: "Sleeve Length" },
  { key: "inseam", label: "Inseam" },
  { key: "neck", label: "Neck" },
];

function formatValue(field, unit) {
  return unit === "cm" ? field.cm : field.in;
}

// A stylized front-view figure with dashed measurement guide lines and
// callouts — the same visual language real clothing size charts use.
// Deliberately simplified/iconic rather than photorealistic; the point is
// legibility, not anatomical precision. Shows the Size M figures, since
// that's the size actually photographed.
function BodyDiagram({ unit }) {
  const m = SIZE_CHART.find((s) => s.size === "M");
  const v = (field) => formatValue(m[field], unit);

  return (
    <svg viewBox="0 0 480 480" className="h-full w-full">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-charcoal/25 dark:text-cream/25"
      >
        <circle cx="240" cy="55" r="30" />
        <path d="M195 95 Q240 80 285 95 L295 190 Q240 210 185 190 Z" />
        <path d="M185 110 L140 220 M295 110 L340 220" strokeLinecap="round" />
        <path d="M198 205 L188 420 L220 420 L235 260 L245 260 L260 420 L292 420 L282 205" />
        <path
          d="M188 420 L180 440 L228 440 M292 420 L300 440 L252 440"
          strokeLinecap="round"
        />
      </g>

      <line
        x1="210"
        y1="88"
        x2="270"
        y2="88"
        strokeDasharray="3 4"
        className="stroke-gold"
        strokeWidth="1.5"
      />
      <line
        x1="150"
        y1="150"
        x2="330"
        y2="150"
        strokeDasharray="3 4"
        className="stroke-gold"
        strokeWidth="1.5"
      />
      <line
        x1="170"
        y1="205"
        x2="310"
        y2="205"
        strokeDasharray="3 4"
        className="stroke-gold"
        strokeWidth="1.5"
      />
      <line
        x1="175"
        y1="235"
        x2="305"
        y2="235"
        strokeDasharray="3 4"
        className="stroke-gold"
        strokeWidth="1.5"
      />
      <line
        x1="185"
        y1="98"
        x2="295"
        y2="98"
        strokeDasharray="3 4"
        className="stroke-gold"
        strokeWidth="1.5"
      />
      <line
        x1="295"
        y1="98"
        x2="340"
        y2="220"
        strokeDasharray="3 4"
        className="stroke-gold"
        strokeWidth="1.5"
      />
      <line
        x1="240"
        y1="260"
        x2="240"
        y2="420"
        strokeDasharray="3 4"
        className="stroke-gold"
        strokeWidth="1.5"
      />

      <g className="fill-charcoal/70 text-[13px] font-medium dark:fill-cream/70">
        <text x="276" y="85">
          Neck — {v("neck")}
        </text>
        <text x="336" y="148">
          Chest — {v("chest")}
        </text>
        <text x="316" y="203">
          Waist — {v("waist")}
        </text>
        <text x="311" y="238">
          Hip — {v("hip")}
        </text>
        <text x="150" y="96" textAnchor="end">
          Shoulder — {v("shoulder")}
        </text>
        <text x="350" y="165">
          Sleeve — {v("sleeve")}
        </text>
        <text x="300" y="345">
          Inseam — {v("inseam")}
        </text>
      </g>
    </svg>
  );
}

function UnitToggle({ unit, setUnit }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-charcoal/15 bg-cream p-1 text-xs font-semibold dark:border-white/15 dark:bg-white/5">
      {[
        { id: "in", label: "in" },
        { id: "cm", label: "cm" },
      ].map((opt) => (
        <button
          key={opt.id}
          onClick={() => setUnit(opt.id)}
          className={`rounded-full px-3.5 py-1.5 transition-colors duration-200 ${
            unit === opt.id
              ? "bg-charcoal text-cream shadow-soft dark:bg-cream dark:text-charcoal"
              : "text-charcoal/60 hover:text-charcoal dark:text-cream/60 dark:hover:text-cream"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function SizeGuide() {
  const [unit, setUnit] = useState("in");
  const [wardrobeView, setWardrobeView] = useState("western");
  const m = SIZE_CHART.find((s) => s.size === "M");

  return (
    <div className="mx-auto max-w-7xl px-4 pb-14 pt-20 lg:px-6 lg:pt-24">
      <p className="text-xs font-semibold tracking-widest2 text-gold">
        SIZE &amp; FIT
      </p>
      <h1 className="mt-2 font-display text-4xl text-charcoal dark:text-cream">
        Model Measurements
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-charcoal/60 dark:text-cream/60">
        Instead of asking you to upload a personal photo, Libas-e-Nazar shows
        every garment on a real, professionally measured model — and we publish
        exact measurements for every size here. Compare your own chest, waist,
        and shoulder measurements to the chart below to judge how a piece will
        actually sit, without ever sharing an image of yourself.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            title: "No photo required",
            body: "Try-on happens on our model, not your own image — nothing personal to upload, store, or risk exposing.",
          },
          {
            title: "Every size, real numbers",
            body: "A full XS–XL chart, graded the same way a tailor would size a pattern — not estimated from a single photo.",
          },
          {
            title: "Compare, don't guess",
            body: "Hold a tape measure to yourself and line it up against the numbers here for a genuine sense of fit.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-2xl bg-white p-5 shadow-soft dark:bg-white/[0.03]"
          >
            <p className="font-display text-base text-charcoal dark:text-cream">
              {card.title}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-charcoal/55 dark:text-cream/55">
              {card.body}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 shadow-soft dark:bg-white/[0.03] sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl text-charcoal dark:text-cream">
              Our Model
            </h2>
            <p className="mt-1 text-sm text-charcoal/40 dark:text-cream/40">
              Photographed at Size M — see the full size chart below for every
              other size.
            </p>
          </div>
          <UnitToggle unit={unit} setUnit={setUnit} />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[320px_1fr_300px]">
          <div className="relative mx-auto w-full max-w-[320px] overflow-hidden rounded-2xl bg-[#ECE7E0] shadow-lift dark:bg-white/5">
            <img
              src={
                wardrobeView === "eastern"
                  ? "/models/eastern-m.png"
                  : "/models/m.jpeg"
              }
              alt="Our fit model"
              className="h-full w-full object-cover"
            />
            <button
              onClick={() =>
                setWardrobeView((v) =>
                  v === "western" ? "eastern" : "western",
                )
              }
              aria-label="Previous wardrobe"
              className="focus-ring absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-soft transition-colors duration-200 hover:text-gold dark:bg-charcoal/80 dark:text-cream"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M15 18l-6-6 6-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={() =>
                setWardrobeView((v) =>
                  v === "western" ? "eastern" : "western",
                )
              }
              aria-label="Next wardrobe"
              className="focus-ring absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-charcoal shadow-soft transition-colors duration-200 hover:text-gold dark:bg-charcoal/80 dark:text-cream"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  d="M9 18l6-6-6-6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <span className="absolute left-3 top-3 rounded-full bg-charcoal/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-cream dark:bg-white/80 dark:text-charcoal">
              {wardrobeView === "eastern" ? "Eastern" : "Western"}
            </span>
          </div>

          <div className="flex items-center justify-center rounded-2xl bg-cream/60 p-3 dark:bg-white/[0.02]">
            <div className="aspect-square w-full max-w-[480px] text-charcoal dark:text-cream">
              <BodyDiagram unit={unit} />
            </div>
          </div>

          <div className="space-y-2">
            {ROWS.map((row) => (
              <div
                key={row.key}
                className="flex items-center justify-between rounded-xl bg-cream/60 px-4 py-2.5 dark:bg-white/[0.03]"
              >
                <span className="text-sm text-charcoal/60 dark:text-cream/60">
                  {row.label}
                </span>
                <span className="text-sm font-semibold text-charcoal dark:text-cream">
                  {formatValue(m[row.key], unit)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-soft dark:bg-white/[0.03] sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-charcoal dark:text-cream">
              Full Size Chart
            </h2>
            <p className="mt-1 text-xs text-charcoal/40 dark:text-cream/40">
              XS through XL — Size M (highlighted) is the size shown in the
              fitting room photos.
            </p>
          </div>
          <UnitToggle unit={unit} setUnit={setUnit} />
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-charcoal/10 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-charcoal/40 dark:border-white/10 dark:text-cream/40">
                  Measurement
                </th>
                {SIZE_CHART.map((s) => (
                  <th
                    key={s.size}
                    className={`border-b px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide dark:border-white/10 ${
                      s.isShown
                        ? "border-gold/40 bg-gold/10 text-gold"
                        : "border-charcoal/10 text-charcoal/40 dark:text-cream/40"
                    }`}
                  >
                    {s.size}
                    {s.isShown && (
                      <span className="ml-1 font-normal normal-case">
                        (shown)
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr
                  key={row.key}
                  className={
                    i % 2 === 1 ? "bg-cream/40 dark:bg-white/[0.02]" : ""
                  }
                >
                  <td className="px-3 py-2.5 text-charcoal/70 dark:text-cream/70">
                    {row.label}
                  </td>
                  {SIZE_CHART.map((s) => (
                    <td
                      key={s.size}
                      className={`px-3 py-2.5 text-center ${
                        s.isShown
                          ? "bg-gold/5 font-semibold text-charcoal dark:text-cream"
                          : "text-charcoal/60 dark:text-cream/60"
                      }`}
                    >
                      {formatValue(s[row.key], unit)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-gold/20 bg-gold/5 p-5 sm:p-6">
          <h3 className="font-display text-xl text-charcoal dark:text-cream">
            How to compare your own measurements
          </h3>
          <ol className="mt-4 space-y-2.5 text-sm text-charcoal/70 dark:text-cream/70">
            <li>
              <span className="font-semibold text-gold">1.</span> Measure
              yourself the same way — chest around the fullest part, waist at
              the navel, shoulders point to point across the back.
            </li>
            <li>
              <span className="font-semibold text-gold">2.</span> Find the
              column above closest to your own numbers — that's your size,
              regardless of which one is shown in the photos.
            </li>
            <li>
              <span className="font-semibold text-gold">3.</span> Use the
              garment's own fit notes (slim, regular, relaxed) alongside this
              chart — they affect how forgiving small differences will be.
            </li>
          </ol>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-gold/5 p-5 sm:p-6">
          <h3 className="font-display text-xl text-charcoal dark:text-cream">
            Quick tips for accurate results
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-charcoal/70 dark:text-cream/70">
            <li className="flex gap-2.5">
              <span className="text-gold">•</span>
              Measure over light clothing, not bulky layers — they can add an
              inch or more to every number.
            </li>
            <li className="flex gap-2.5">
              <span className="text-gold">•</span>
              Keep the tape snug against your body but not pulled tight — you
              should be able to slide a finger underneath.
            </li>
            <li className="flex gap-2.5">
              <span className="text-gold">•</span>
              If you're between two sizes, size up for a relaxed fit or down for
              a slimmer one.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
