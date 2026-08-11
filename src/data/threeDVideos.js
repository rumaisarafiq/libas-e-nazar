// Shared between ResultScreen.jsx (the generated result) and
// ModelPreview.jsx (the builder, before generating) so both places offer
// the same 2D/3D toggle, driven by the same data — one source of truth
// instead of two copies that could drift out of sync.

// 3D showcase videos exist only for these categories — from the 4
// finished Tripo Studio Eastern renders plus 3 Western ones (the usable
// grey-clay results out of the 7 test videos). Pashmina Shawl and
// Corduroy Pants have no 3D video at all, so the toggle simply won't
// appear for those.
export const THREE_D_VIDEOS = {
  "prince-coat": "/models3d/prince-coat-metallic.mp4",
  kurta: "/models3d/kurta-pajama-metallic.mp4",
  "kurta-pajama": "/models3d/kurta-pajama-metallic.mp4",
  "shalwar-kameez": "/models3d/shalwar-kameez-metallic.mp4",
  sherwani: "/models3d/sherwani-metallic.mp4",
  shirts: "/models3d/shirts.mp4",
  "polo-shirts": "/models3d/polo.mp4",
  sweatshirts: "/models3d/sweatshirt.mp4",
  // No dedicated pants-only video exists — the 3 Western combo videos
  // each already show pants (paired with a shirt/polo/sweatshirt), so
  // all 3 are offered here as cycle-through options instead of picking
  // just one arbitrarily. Consuming components should check for an
  // array and render cycle arrows, same idea as the angle-cycling
  // pattern used for multi-angle 2D results.
  pants: [
    "/models3d/shirts.mp4",
    "/models3d/polo.mp4",
    "/models3d/sweatshirt.mp4",
  ],
};

// Approximates a colorway via CSS filter on the pre-rendered video, since
// there's no real 3D mesh to recolor. Matched against keywords in the
// garment's own name so the 3D view reflects the actual piece someone
// picked, automatically.
//
// Each source video has a different native color — Prince Coat is
// off-white, Kurta Pajama is brown, Shalwar Kameez is light grey,
// Sherwani is black — so "white" doesn't mean "no filter" the same way
// for all of them. These tables are per-category so "white" actually
// means "brighten toward white from THIS video's own starting point."
//
// Honest limit worth knowing: Sherwani's source is close to true black,
// and CSS brightness/saturate filters are multiplicative — they can't
// turn near-zero pixels into white no matter how high you push them.
// "Pearl White Sherwani" will look like a lightened dark grey here, not
// genuinely white — that's a hard ceiling of working from video instead
// of a real recolorable material, not something a better filter fixes.
export const CATEGORY_COLOR_FILTERS = {
  "prince-coat": [
    {
      keywords: ["black", "jet", "charcoal"],
      filter: "brightness(0.3) saturate(0.3)",
    },
    {
      keywords: ["navy"],
      filter: "sepia(0.7) hue-rotate(190deg) saturate(4) brightness(0.5)",
    },
    {
      keywords: ["maroon", "wine", "burgundy", "red"],
      filter: "sepia(0.7) hue-rotate(305deg) saturate(4) brightness(0.55)",
    },
    {
      keywords: ["green", "emerald", "olive"],
      filter: "sepia(0.7) hue-rotate(75deg) saturate(3) brightness(0.55)",
    },
    {
      keywords: ["white", "pearl", "cream", "ivory", "off-white"],
      filter: "none",
    },
  ],
  kurta: [
    { keywords: ["black", "jet"], filter: "brightness(0.28) saturate(0.4)" },
    {
      keywords: ["charcoal", "slate", "grey", "gray", "ash"],
      filter: "sepia(0) saturate(0.15) brightness(0.85)",
    },
    {
      keywords: ["navy", "blue"],
      filter: "sepia(0.5) hue-rotate(180deg) saturate(3.5) brightness(0.55)",
    },
    {
      keywords: ["maroon", "wine", "burgundy"],
      filter: "sepia(0.5) hue-rotate(300deg) saturate(3) brightness(0.55)",
    },
    {
      keywords: ["mustard", "gold", "yellow"],
      filter: "saturate(1.6) brightness(1.05)",
    },
    {
      keywords: ["beige", "sand", "tan", "cream", "off-white", "white"],
      filter: "saturate(0.6) brightness(1.35)",
    },
    { keywords: ["brown", "sienna"], filter: "none" },
  ],
  "shalwar-kameez": [
    { keywords: ["black", "jet"], filter: "brightness(0.32) saturate(0.4)" },
    {
      keywords: ["navy", "blue"],
      filter: "sepia(0.6) hue-rotate(190deg) saturate(3.5) brightness(0.6)",
    },
    {
      keywords: ["maroon", "wine", "burgundy"],
      filter: "sepia(0.6) hue-rotate(305deg) saturate(3.5) brightness(0.55)",
    },
    {
      keywords: ["green", "emerald", "olive"],
      filter: "sepia(0.6) hue-rotate(75deg) saturate(3) brightness(0.55)",
    },
    {
      keywords: ["mustard", "gold", "yellow", "rust", "orange"],
      filter: "sepia(0.7) hue-rotate(20deg) saturate(2.5) brightness(0.9)",
    },
    {
      keywords: ["purple"],
      filter: "sepia(0.6) hue-rotate(230deg) saturate(3.5) brightness(0.55)",
    },
    {
      keywords: ["beige", "cream", "ivory", "white", "off-white"],
      filter: "brightness(1.3) saturate(0.4)",
    },
    { keywords: ["grey", "gray", "slate"], filter: "none" },
  ],
  sherwani: [
    {
      keywords: ["navy"],
      filter: "brightness(0.9) sepia(0.5) hue-rotate(190deg) saturate(3)",
    },
    {
      keywords: ["maroon", "wine", "burgundy", "red"],
      filter: "brightness(0.9) sepia(0.5) hue-rotate(305deg) saturate(3)",
    },
    {
      keywords: ["green", "emerald", "olive"],
      filter: "brightness(0.9) sepia(0.5) hue-rotate(75deg) saturate(2.5)",
    },
    {
      keywords: ["gold"],
      filter: "brightness(1.1) sepia(0.6) saturate(2) hue-rotate(10deg)",
    },
    {
      keywords: ["white", "pearl", "cream", "ivory", "off-white"],
      filter: "brightness(3) contrast(0.6) saturate(0.15)",
      approximate: true,
    },
    { keywords: ["black"], filter: "none" },
  ],
};

// The 3 Western videos are all neutral medium-grey clay renders (no
// texture/color baked in at all) — actually the best-case source for this
// trick, since true grey takes a hue-rotate cleanly, unlike the
// already-colored Eastern videos. One shared table since all 3 share the
// same starting grey.
export const WESTERN_COLOR_FILTERS = [
  { keywords: ["black", "jet"], filter: "brightness(0.35) saturate(0.2)" },
  {
    keywords: ["charcoal", "heather", "grey", "gray", "slate"],
    filter: "brightness(0.75) saturate(0.1)",
  },
  {
    keywords: ["navy", "royal", "sky", "blue"],
    filter: "sepia(0.6) hue-rotate(185deg) saturate(3.5) brightness(0.75)",
  },
  {
    keywords: ["maroon", "wine", "burgundy", "red"],
    filter: "sepia(0.6) hue-rotate(305deg) saturate(3.5) brightness(0.65)",
  },
  {
    keywords: ["green", "emerald", "mint", "olive"],
    filter: "sepia(0.6) hue-rotate(75deg) saturate(3) brightness(0.7)",
  },
  {
    keywords: ["pink", "blush"],
    filter: "sepia(0.5) hue-rotate(300deg) saturate(2.5) brightness(1.1)",
  },
  {
    keywords: ["mustard", "gold", "yellow"],
    filter: "sepia(0.7) hue-rotate(15deg) saturate(2.5) brightness(0.95)",
  },
  {
    keywords: ["tan", "camel", "beige", "sand"],
    filter: "sepia(0.5) saturate(1.3) brightness(1)",
  },
  {
    keywords: ["brown", "sienna", "dark brown"],
    filter: "sepia(0.7) saturate(1.6) brightness(0.7)",
  },
  {
    keywords: ["white", "cream", "ivory", "off-white"],
    filter: "brightness(1.5) saturate(0.15)",
  },
];

export function filterForGarment(category, name = "") {
  const table =
    CATEGORY_COLOR_FILTERS[category] ||
    (category === "kurta-pajama" ? CATEGORY_COLOR_FILTERS.kurta : null) ||
    (["shirts", "polo-shirts", "sweatshirts", "pants"].includes(category)
      ? WESTERN_COLOR_FILTERS
      : null) ||
    CATEGORY_COLOR_FILTERS["prince-coat"];
  const lower = name.toLowerCase();
  const match = table.find((c) => c.keywords.some((k) => lower.includes(k)));
  return match || { filter: "none", approximate: false };
}
