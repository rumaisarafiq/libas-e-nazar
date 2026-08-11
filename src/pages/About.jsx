const PILLARS = [
  {
    title: "Artificial Intelligence",
    desc: "A deep learning pipeline predicts how garments drape and fit on a given body shape, generating a realistic composite image.",
  },
  {
    title: "Computer Vision",
    desc: "Image segmentation isolates the person and the garment separately, so textures and folds blend naturally in the final render.",
  },
  {
    title: "Virtual Try-On",
    desc: "The core experience: warping and rendering a chosen garment onto a model image without any physical fitting.",
  },
  {
    title: "3D Visualization",
    desc: "Explore every garment in an interactive 3D view — rotate it, inspect the fit, and see it from every angle before you decide.",
  },
];

export default function About() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-32 lg:px-10 lg:pt-40">
      <div className="text-center">
        <p className="text-xs font-semibold tracking-widest2 text-gold">
          ABOUT THE PROJECT
        </p>
        <h1 className="mt-3 font-display text-3xl text-charcoal dark:text-cream sm:text-4xl">
          Rethinking how men shop for clothes
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-xs font-semibold uppercase tracking-widest text-charcoal/40 dark:text-cream/40">
          Libas-e-Nazar: AI-Assisted Pose-Aware Virtual Garment Preview System
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-charcoal/60 dark:text-cream/60">
          Libas-e-Nazar is a Final Year Project that lets men preview Eastern
          and Western garments on a virtual model before committing to a
          purchase — removing the guesswork from online shopping and reducing
          costly returns.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {PILLARS.map((p) => (
          <div
            key={p.title}
            className="rounded-2xl bg-white p-8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card dark:bg-white/[0.03]"
          >
            <h3 className="font-display text-xl text-charcoal dark:text-cream">
              {p.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-charcoal/60 dark:text-cream/60">
              {p.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-2xl bg-white p-8 shadow-soft dark:bg-white/[0.03] sm:p-10">
        <h2 className="font-display text-2xl text-charcoal dark:text-cream">
          Project scope
        </h2>
        <ul className="mt-6 space-y-4 text-sm leading-relaxed text-charcoal/70 dark:text-cream/70">
          <li className="flex gap-3">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
            Frontend built with React, Vite and Tailwind CSS for a responsive,
            premium shopping experience.
          </li>
          <li className="flex gap-3">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
            Backend planned with FastAPI, serving the trained try-on model and
            garment catalogue through REST APIs.
          </li>
          <li className="flex gap-3">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
            Covers both Eastern menswear (kurta, sherwani, waistcoat) and
            Western menswear (shirts, polos, pants).
          </li>
        </ul>
      </div>
    </div>
  );
}
