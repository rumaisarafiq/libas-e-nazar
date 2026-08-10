import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
import PlaceholderArt from "../components/PlaceholderArt";
import { GARMENTS, formatPKR } from "../data/garments";

const STEPS = [
  {
    title: "Pick your wardrobe",
    desc: "Choose Eastern or Western menswear, then browse curated categories.",
  },
  {
    title: "Select a garment",
    desc: "Browse the gallery and pick the piece you want to see on yourself.",
  },
  {
    title: "Generate your try-on",
    desc: "Our AI model renders the garment on a pose-matched preview in seconds.",
  },
];

const COLLECTIONS = [
  {
    name: "Sherwani Edit",
    tag: "Eastern",
    image: GARMENTS.sherwani[0].image,
    style: "eastern",
    fromPrice: Math.min(...GARMENTS.sherwani.map((g) => g.price)),
  },
  {
    name: "Everyday Shirts",
    tag: "Western",
    image: GARMENTS.shirts[1].image,
    style: "western",
    fromPrice: Math.min(...GARMENTS.shirts.map((g) => g.price)),
  },
  {
    name: "Winter Overcoats",
    tag: "Western",
    image: GARMENTS["western-coats"][3].image,
    style: "western",
    fromPrice: Math.min(...GARMENTS["western-coats"].map((g) => g.price)),
  },
];

// Every 3D model currently available — the 7 finished, fully-textured
// showcase renders plus the 3 hologram-style ones (same source batch,
// rendered in Tripo Studio's wireframe/x-ray view instead of solid
// shading). All loop continuously, muted, like the rest of the site's
// video previews.
const MODELS_3D = [
  {
    src: "/models3d/prince-coat-metallic.mp4",
    label: "Prince Coat",
    tag: "Metallic",
  },
  {
    src: "/models3d/prince-coat-hologram.mp4",
    label: "Prince Coat",
    tag: "Hologram",
  },
  {
    src: "/models3d/shalwar-kameez-metallic.mp4",
    label: "Shalwar Kameez",
    tag: "Metallic",
  },
  {
    src: "/models3d/shalwar-kameez-hologram.mp4",
    label: "Shalwar Kameez",
    tag: "Hologram",
  },
  {
    src: "/models3d/sherwani-metallic.mp4",
    label: "Sherwani",
    tag: "Metallic",
  },
  {
    src: "/models3d/sherwani-hologram.mp4",
    label: "Sherwani",
    tag: "Hologram",
  },
  {
    src: "/models3d/kurta-pajama-metallic.mp4",
    label: "Kurta Pajama & Kurta",
    tag: "Metallic",
  },
  {
    src: "/models3d/kurta-pajama-hologram.mp4",
    label: "Kurta Pajama & Kurta",
    tag: "Hologram",
  },
  { src: "/models3d/shirts.mp4", label: "Shirt + Pants", tag: "Western" },
  { src: "/models3d/polo.mp4", label: "Polo + Pants", tag: "Western" },
  {
    src: "/models3d/sweatshirt.mp4",
    label: "Sweatshirt + Pants",
    tag: "Western",
  },
  {
    src: "/models3d/holo-shirt.mp4",
    label: "Shirt + Pants",
    tag: "Hologram",
  },
  { src: "/models3d/holo-polo.mp4", label: "Polo + Pants", tag: "Hologram" },
  {
    src: "/models3d/holo-sweatshirt.mp4",
    label: "Sweatshirt + Pants",
    tag: "Hologram",
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <Hero />

      {/* How it works */}
      <section
        id="how-it-works"
        className="mx-auto max-w-[1600px] px-4 py-20 lg:px-8"
      >
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold tracking-widest2 text-gold">
            THE PROCESS
          </p>
          <h2 className="mt-3 font-display text-3xl text-charcoal dark:text-cream sm:text-4xl">
            How the fitting room works
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="group rounded-2xl bg-white p-8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card dark:bg-white/[0.03]"
            >
              <span className="font-display text-3xl text-gold/40 transition-colors duration-300 group-hover:text-gold">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-xl text-charcoal dark:text-cream">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/60 dark:text-cream/60">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3D Model Gallery */}
      <section className="mx-auto max-w-[1600px] px-4 py-8 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold tracking-widest2 text-gold">
            INTERACTIVE 3D
          </p>
          <h2 className="mt-3 font-display text-3xl text-charcoal dark:text-cream sm:text-4xl">
            Explore in 3D
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {MODELS_3D.map((m) => (
            <div
              key={m.src}
              className="group overflow-hidden rounded-2xl bg-black shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
            >
              <div className="relative aspect-square w-full">
                <video
                  src={m.src}
                  className="h-full w-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
                <span className="absolute left-3 top-3 rounded-full bg-charcoal/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cream">
                  {m.tag}
                </span>
              </div>
              <p className="px-4 py-3 text-sm font-medium text-cream">
                {m.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Collections */}
      <section className="mx-auto max-w-[1600px] px-4 py-8 lg:px-8">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest2 text-gold">
              CURATED
            </p>
            <h2 className="mt-3 font-display text-3xl text-charcoal dark:text-cream sm:text-4xl">
              Featured collections
            </h2>
          </div>
          <button
            onClick={() => navigate("/try-on")}
            className="focus-ring hidden text-sm font-semibold text-charcoal/70 underline-offset-4 hover:text-gold hover:underline dark:text-cream/70 sm:block"
          >
            View all →
          </button>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {COLLECTIONS.map((c) => (
            <button
              key={c.name}
              onClick={() => navigate("/try-on")}
              className="focus-ring group relative overflow-hidden rounded-2xl shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="aspect-[4/5] w-full bg-white dark:bg-white/5">
                {c.image ? (
                  <img
                    src={c.image}
                    alt={c.name}
                    className="h-full w-full object-contain p-8 transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <PlaceholderArt
                    label={c.name}
                    className="h-full w-full transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/70 to-transparent p-5 text-left">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-beige">
                  {c.tag}
                </span>
                <p className="mt-1 font-display text-lg text-cream">{c.name}</p>
                {typeof c.fromPrice === "number" && (
                  <p className="mt-0.5 text-xs font-semibold text-gold">
                    From {formatPKR(c.fromPrice)}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="mx-auto max-w-[1600px] px-4 py-20 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-charcoal px-8 py-16 text-center shadow-lift dark:bg-white/5">
          <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />
          <h2 className="font-display text-3xl text-cream sm:text-4xl">
            Ready to see it on yourself?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-cream/70">
            Jump into the fitting room and try on your first garment in under a
            minute.
          </p>
          <button
            onClick={() => navigate("/try-on")}
            className="focus-ring btn-gold mt-8 rounded-full px-8 py-4 text-sm font-semibold text-charcoal shadow-card transition-transform duration-300 hover:-translate-y-0.5"
          >
            Start Try-On
          </button>
        </div>
      </section>
    </div>
  );
}
