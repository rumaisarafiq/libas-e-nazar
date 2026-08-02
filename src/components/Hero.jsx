import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PlaceholderArt from "./PlaceholderArt";
import { GARMENTS } from "../data/garments";

// A little hover-cycling showcase, like the secondary product shots you see
// on most clothing sites: a garment detail, a couple of pieces, then the
// full look on a model.
//
// Deliberately picked by id (not array position) — array order changes
// when the catalog gets reordered/edited, and this showcase should always
// feature the same presentable pieces regardless of where they land in
// the gallery.
const SHOWCASE_SHIRT =
  GARMENTS.shirts.find((s) => s.id === "shirt-02") || GARMENTS.shirts[0]; // Classic White Dress Shirt
const SHOWCASE_PANTS =
  GARMENTS.pants.find((p) => p.id === "pants-10") || GARMENTS.pants[0]; // White Pants

const SHOWCASE_SLIDES = [
  {
    image: GARMENTS.sherwani[0].image,
    label: GARMENTS.sherwani[0].name,
    tag: "Sherwani",
  },
  {
    image: SHOWCASE_SHIRT.image,
    label: SHOWCASE_SHIRT.name,
    tag: "Shirt",
  },
  {
    image: SHOWCASE_PANTS.image,
    label: SHOWCASE_PANTS.name,
    tag: "Trousers",
  },
  {
    // A real generated look (Grey Casual Shirt + Black Dress Pants) rather
    // than a plain placeholder photo, so the "full outfit" slide actually
    // shows off what the AI produces.
    image: "/results/western/shirt-pant/shirt-04__pants-09.jpg",
    label: "Grey Shirt + Black Dress Pants",
    tag: "Full Outfit",
  },
];

export default function Hero() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (!isHovering) return undefined;
    const delay = activeIndex === 0 ? 1100 : 1700;
    const timeoutId = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
    }, delay);
    return () => clearTimeout(timeoutId);
  }, [isHovering, activeIndex]);

  const startCycle = () => setIsHovering(true);
  const stopCycle = () => setIsHovering(false);

  const active = SHOWCASE_SLIDES[activeIndex];

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-24 pb-16">
      {/* Ambient backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -right-24 h-[420px] w-[420px] rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-[380px] w-[380px] rounded-full bg-beige/30 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-16 px-4 lg:grid-cols-2 lg:px-8">
        <div className="animate-fadeIn">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs font-semibold tracking-widest2 text-gold">
            AI · COMPUTER VISION · FYP 2026
          </span>

          <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-charcoal/40 dark:text-cream/40">
            Libas-e-Nazar
          </p>
          <h1 className="mt-2 font-display text-4xl leading-[1.1] text-charcoal dark:text-cream sm:text-5xl lg:text-6xl">
            Experience{" "}
            <span className="relative italic text-gold">AI-Powered</span>{" "}
            Virtual Try-On
          </h1>

          <p className="mt-6 max-w-md text-balance font-body text-base leading-relaxed text-charcoal/70 dark:text-cream/70">
            See yourself in Eastern and Western menswear before you buy. Our
            system uses pose estimation and computer vision to render garments
            on a realistic model, instantly and accurately.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              onClick={() => navigate("/try-on")}
              className="focus-ring group relative overflow-hidden rounded-full bg-charcoal px-8 py-4 text-sm font-semibold tracking-wide text-cream shadow-lift transition-transform duration-300 hover:-translate-y-0.5 dark:bg-[linear-gradient(90deg,#C79B4E,#D8B36A)]"
            >
              <span className="relative z-10">Start Try-On</span>
              <span className="absolute inset-0 -z-0 translate-x-[-100%] bg-[linear-gradient(90deg,#C79B4E,#D8B36A)] transition-transform duration-500 group-hover:translate-x-0 dark:bg-charcoal" />
            </button>
            <a
              href="#how-it-works"
              className="focus-ring text-sm font-semibold text-charcoal/70 underline-offset-4 hover:text-gold hover:underline dark:text-cream/70"
            >
              How it works →
            </a>
          </div>

          <div className="mt-14 flex items-center gap-10">
            <div>
              <p className="font-display text-2xl text-charcoal dark:text-cream">
                12+
              </p>
              <p className="text-xs tracking-wide text-charcoal/50 dark:text-cream/50">
                Garment styles
              </p>
            </div>
            <div className="h-8 w-px bg-charcoal/10 dark:bg-cream/10" />
            <div>
              <p className="font-display text-2xl text-charcoal dark:text-cream">
                2
              </p>
              <p className="text-xs tracking-wide text-charcoal/50 dark:text-cream/50">
                Wardrobes: East &amp; West
              </p>
            </div>
            <div className="h-8 w-px bg-charcoal/10 dark:bg-cream/10" />
            <div>
              <p className="font-display text-2xl text-charcoal dark:text-cream">
                AI
              </p>
              <p className="text-xs tracking-wide text-charcoal/50 dark:text-cream/50">
                Pose-aware rendering
              </p>
            </div>
          </div>
        </div>

        <div className="relative animate-fadeInSlow">
          <div
            onMouseMove={startCycle}
            onMouseLeave={stopCycle}
            className="relative mx-auto aspect-[3/4] w-full max-w-sm cursor-pointer overflow-hidden rounded-[2rem] bg-white shadow-lift ring-1 ring-charcoal/5 dark:bg-white/5 dark:ring-white/10"
          >
            {SHOWCASE_SLIDES.map((slide, i) =>
              slide.image ? (
                <img
                  key={slide.tag}
                  src={slide.image}
                  alt={slide.label}
                  className={`absolute inset-0 h-full w-full object-contain p-6 transition-opacity duration-500 ${
                    i === activeIndex ? "opacity-100" : "opacity-0"
                  }`}
                />
              ) : null,
            )}
            {!active?.image && (
              <PlaceholderArt
                label="sherwani"
                variant="hero"
                className="h-full w-full"
              />
            )}

            <span className="absolute right-4 top-4 rounded-full bg-charcoal/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-cream">
              {active.tag}
            </span>
            <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1.5 pb-4">
              {SHOWCASE_SLIDES.map((slide, i) => (
                <span
                  key={slide.tag}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? "w-5 bg-charcoal"
                      : "w-1.5 bg-charcoal/20"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white px-5 py-4 shadow-card dark:bg-surfaceRaised">
            <p className="text-xs font-semibold tracking-wide text-charcoal/50 dark:text-cream/50">
              Now Trying
            </p>
            <p className="font-display text-lg text-charcoal dark:text-cream">
              {active.label}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
