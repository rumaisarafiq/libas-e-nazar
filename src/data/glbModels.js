// Converts a garment's catalog name (e.g. "Classic White Dress Shirt")
// into an actual hex color, for recoloring real 3D materials via
// material.color.set(hex). Only used for combos that DON'T have their
// own pre-made, already-colored 3D file (see SPECIFIC_COMBOS below) —
// for those, the file's own baked-in colors are used as-is, untouched.
const COLOR_HEX = [
  { keywords: ["black", "jet"], hex: "#1a1a1a" },
  { keywords: ["white", "pearl", "off-white", "ivory"], hex: "#f5f3ee" },
  { keywords: ["cream"], hex: "#f0e6d2" },
  { keywords: ["charcoal"], hex: "#3a3a3a" },
  { keywords: ["heather grey", "grey", "gray", "slate", "ash"], hex: "#8a8a8a" },
  { keywords: ["navy"], hex: "#1e2a4a" },
  { keywords: ["royal blue"], hex: "#2547c7" },
  { keywords: ["sky blue", "pastel sky blue"], hex: "#a8d4ee" },
  { keywords: ["blue"], hex: "#3b5bab" },
  { keywords: ["maroon", "wine", "burgundy"], hex: "#5c1f24" },
  { keywords: ["deep red", "red"], hex: "#8b1e1e" },
  { keywords: ["rust", "orange"], hex: "#b5541f" },
  { keywords: ["green", "emerald"], hex: "#1f5c3a" },
  { keywords: ["olive"], hex: "#5c6b32" },
  { keywords: ["mint green"], hex: "#a8dfc0" },
  { keywords: ["mustard", "gold"], hex: "#c9a13b" },
  { keywords: ["yellow"], hex: "#e0c343" },
  { keywords: ["purple"], hex: "#4a2f6b" },
  { keywords: ["pink", "blush", "candy pink"], hex: "#e5a3b0" },
  { keywords: ["brown", "sienna", "dark brown"], hex: "#6b4226" },
  { keywords: ["tan", "camel"], hex: "#c2a878" },
  { keywords: ["beige", "sand"], hex: "#d9c9ab" },
];

export function colorNameToHex(name = "", fallback = "#cfcfcf") {
  const lower = name.toLowerCase();
  const match = COLOR_HEX.find((c) => c.keywords.some((k) => lower.includes(k)));
  return match ? match.hex : fallback;
}

// The two generic base models — used as the fallback whenever no
// specific pre-made combo file exists for the exact shirt+pants (or
// polo+pants) pairing someone picked. These get recolored live via
// material.color.set(), since they're one generic mesh standing in for
// many different color combinations.
//
// IMPORTANT: place the actual files at these exact paths once available:
//   public/models3d-real/shirt_pant_base.glb
//   public/models3d-real/polo_pant_base.glb
const GENERIC_BASE_MODELS = {
  shirts: "/models3d-real/shirt_pant_base.glb",
  "polo-shirts": "/models3d-real/polo_pant_base.glb",
};

// Specific shirt+pants pairs that already have their own dedicated,
// correctly-colored 3D file — 36 combos: 6 shirts × 6 pants (shirt-02,
// 03, 04, 06, 07, 09 × pants-03, 04, 05, 09, 10, 11). These should NOT
// be recolored — the file's own baked-in colors are already correct for
// that exact pairing. Anything outside this set falls back to the
// generic base model + live recoloring.
//
// IMPORTANT: place each combo file at this exact naming convention once
// available (adjust the folder/filenames below to match whatever you
// actually name them when uploading):
//   public/models3d-real/combos/shirt{N}_pant{M}.glb
// e.g. shirt2_pant3.glb, shirt9_pant11.glb, etc. — no spaces or
// parentheses, since those cause problems in URLs/file paths.
const COMBO_SHIRT_NUMS = [2, 3, 4, 6, 7, 9];
const COMBO_PANT_NUMS = [3, 4, 5, 9, 10, 11];
const SPECIFIC_COMBOS = new Set();
for (const s of COMBO_SHIRT_NUMS) {
  for (const p of COMBO_PANT_NUMS) {
    SPECIFIC_COMBOS.add(`${s}-${p}`);
  }
}

function trailingNumber(id) {
  const m = id?.match(/(\d+)$/);
  return m ? parseInt(m[1], 10) : null;
}

// Given the picked top (shirt or polo) and bottom (pants) garment ids,
// returns { src, needsColor } — src is which .glb to load, needsColor
// says whether it should be live-recolored or left exactly as authored.
export function getGLBCombo(topCategoryId, topId, pantId) {
  if (topCategoryId === "shirts") {
    const s = trailingNumber(topId);
    const p = trailingNumber(pantId);
    if (s != null && p != null && SPECIFIC_COMBOS.has(`${s}-${p}`)) {
      return {
        src: `/models3d-real/combos/shirt${s}_pant${p}.glb`,
        needsColor: false,
      };
    }
    return { src: GENERIC_BASE_MODELS.shirts, needsColor: true };
  }
  if (topCategoryId === "polo-shirts") {
    // No specific pre-made polo combos yet — always the generic base,
    // live-recolored. Update this the same way as shirts above if
    // specific polo+pants combo files become available later.
    return { src: GENERIC_BASE_MODELS["polo-shirts"], needsColor: true };
  }
  return null;
}
