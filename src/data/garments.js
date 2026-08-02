// Placeholder garment catalogue.
// Replace `image` values with real paths from `public/clothes/` once assets are ready,
// e.g. "/clothes/eastern/kurta-01.jpg"

export const CATEGORIES = {
  eastern: [
    { id: "kurta", label: "Kurta" },
    { id: "shalwar-kameez", label: "Shalwar Kameez" },
    { id: "kurta-pajama", label: "Kurta Pajama" },
    { id: "sherwani", label: "Sherwani" },
    { id: "prince-coat", label: "Prince Coat" },
    { id: "pashmina-shawl", label: "Pashmina Shawl" },
  ],
  western: [
    {
      group: "Upper Body",
      items: [
        { id: "shirts", label: "Shirts" },
        { id: "polo-shirts", label: "Polo Shirts" },
        { id: "sweatshirts", label: "Sweatshirts" },
      ],
    },
    {
      group: "Lower Body",
      items: [
        { id: "pants", label: "Pants" },
        { id: "corduroy-pants", label: "Corduroy Pants", comingSoon: true },
      ],
    },
  ],
};

// Coats (Suit Coats / Coats & Jackets / Waistcoats) are intentionally NOT a
// browsable sidebar category for Western — per spec, they're surfaced via
// "Recommended Coats" (contextual, based on the picked shirt+pants) instead
// of being listed all together in the gallery. The GARMENTS data below
// still has all of them; only the CATEGORIES sidebar list excludes them.

// Flat set of category ids not yet available for virtual try-on (still
// browsable in the gallery, just without a working "Select"/Try On flow).
export const COMING_SOON_CATEGORY_IDS = new Set(
  CATEGORIES.western
    .flatMap((group) => group.items)
    .filter((item) => item.comingSoon)
    .map((item) => item.id),
);

export function isComingSoonCategory(categoryId) {
  return COMING_SOON_CATEGORY_IDS.has(categoryId);
}

export const UPPER_BODY_CATEGORY_IDS = CATEGORIES.western[0].items.map(
  (i) => i.id,
);
export const LOWER_BODY_CATEGORY_IDS = CATEGORIES.western[1].items.map(
  (i) => i.id,
);

export function isUpperBodyCategory(categoryId) {
  return UPPER_BODY_CATEGORY_IDS.includes(categoryId);
}

export function isLowerBodyCategory(categoryId) {
  return LOWER_BODY_CATEGORY_IDS.includes(categoryId);
}

// Categories that represent layer-able outerwear ("coats"), used for the
// optional coat step after the base outfit try-on is generated.
export const COAT_CATEGORY_IDS = {
  eastern: ["waistcoat"],
  western: ["suit-coats", "western-coats", "waistcoats"],
};

// Same as getCoatOptions, but grouped by category instead of flattened —
// Western has 3 distinct coat categories (Suit Coat / Coat & Jacket /
// Waistcoat) so the "Complete the Look" UI needs to let people switch
// between them, unlike Eastern which only ever pairs with a Waistcoat.
export function getCoatCategoryGroups(style) {
  const ids = COAT_CATEGORY_IDS[style] || [];
  const categoryLabels = {
    "prince-coat": "Prince Coat",
    waistcoat: "Waistcoat",
    "suit-coats": "Suit Coat",
    "western-coats": "Coat & Jacket",
    waistcoats: "Waistcoat",
  };
  return ids
    .map((id) => ({
      id,
      label: categoryLabels[id] || id,
      items: GARMENTS[id] || [],
    }))
    .filter((group) => group.items.length > 0);
}

// A simple, honest recommendation: tries to find coats whose name shares a
// color word with the picked shirt/pants (e.g. a "Navy Blue Shirt" nudges
// "Dark Navy Blue Overcoat" up), then fills any remaining slots with one
// pick from each coat category so there's always a spread of options
// rather than duplicates from a single category. Not real styling logic —
// just enough to feel more tailored than a static list.
const COLOR_WORDS = [
  "black",
  "white",
  "cream",
  "ivory",
  "navy",
  "blue",
  "royal",
  "sky",
  "grey",
  "gray",
  "charcoal",
  "maroon",
  "burgundy",
  "red",
  "pink",
  "blush",
  "green",
  "emerald",
  "olive",
  "forest",
  "brown",
  "camel",
  "tan",
  "beige",
  "khaki",
  "gold",
  "mustard",
  "orange",
  "purple",
];

function colorsIn(name = "") {
  const lower = name.toLowerCase();
  return COLOR_WORDS.filter((c) => lower.includes(c));
}

export function getRecommendedCoats(
  style,
  { topName, bottomName, excludeId, limit = 6 } = {},
) {
  const groups = getCoatCategoryGroups(style);
  const all = groups
    .flatMap((g) =>
      g.items.map((item) => ({ ...item, categoryLabel: g.label })),
    )
    .filter((item) => item.id !== excludeId);

  const referenceColors = new Set([
    ...colorsIn(topName),
    ...colorsIn(bottomName),
  ]);
  const scored = all.map((item) => {
    const itemColors = colorsIn(item.name);
    const matches = itemColors.filter((c) => referenceColors.has(c)).length;
    return { item, matches };
  });

  scored.sort((a, b) => b.matches - a.matches);
  const picked = [];
  const usedIds = new Set();
  const usedCategories = new Set();

  // First pass: best color matches, one per category for variety.
  for (const { item, matches } of scored) {
    if (picked.length >= limit) break;
    if (matches === 0) continue;
    if (usedCategories.has(item.categoryLabel)) continue;
    picked.push(item);
    usedIds.add(item.id);
    usedCategories.add(item.categoryLabel);
  }

  // Fill remaining slots with one from each category not yet represented,
  // then just take whatever's left, so there's always a full set to show.
  for (const { item } of scored) {
    if (picked.length >= limit) break;
    if (usedIds.has(item.id)) continue;
    if (usedCategories.has(item.categoryLabel)) continue;
    picked.push(item);
    usedIds.add(item.id);
    usedCategories.add(item.categoryLabel);
  }
  for (const { item } of scored) {
    if (picked.length >= limit) break;
    if (usedIds.has(item.id)) continue;
    picked.push(item);
    usedIds.add(item.id);
  }

  return picked;
}

// Flattened list of coat garments available for the given wardrobe style,
// each tagged with its source category label.
export function getCoatOptions(style) {
  const ids = COAT_CATEGORY_IDS[style] || [];
  const categoryLabels = {
    "prince-coat": "Prince Coat",
    waistcoat: "Waistcoat",
    "suit-coats": "Suit Coat",
    "western-coats": "Coat & Jacket",
    waistcoats: "Waistcoat",
  };
  return ids.flatMap((id) =>
    (GARMENTS[id] || []).map((g) => ({
      ...g,
      categoryLabel: categoryLabels[id] || id,
    })),
  );
}

// Flat list used by the gallery, keyed by category id.
// Images live in public/clothes/<region>/<category>/ — see README for how to
// add more.
export const GARMENTS = {
  kurta: [
    {
      id: "kurta-01",
      name: "Mustard Gold Kurta",
      image: "/clothes/eastern/kurta/kurta1.png",
      price: 3500,
    },
    {
      id: "kurta-02",
      name: "Light Beige Kurta",
      image: "/clothes/eastern/kurta/kurta2.png",
      price: 2900,
    },
    {
      id: "kurta-03",
      name: "Sand Beige Kurta",
      image: "/clothes/eastern/kurta/kurta3.png",
      price: 4500,
    },
    {
      id: "kurta-04",
      name: "Stone Grey Kurta",
      image: "/clothes/eastern/kurta/kurta4.png",
      price: 4300,
    },
    {
      id: "kurta-05",
      name: "Light Ash Grey Kurta",
      image: "/clothes/eastern/kurta/kurta5.png",
      price: 4200,
    },
    {
      id: "kurta-06",
      name: "Dark Beige Kurta",
      image: "/clothes/eastern/kurta/kurta6.png",
      price: 3600,
    },
    {
      id: "kurta-07",
      name: "Mid Grey Kurta",
      image: "/clothes/eastern/kurta/kurta7.png",
      price: 3400,
    },
    {
      id: "kurta-08",
      name: "Dark Grey Kurta",
      image: "/clothes/eastern/kurta/kurta8.png",
      price: 6200,
    },
    {
      id: "kurta-09",
      name: "Cream Linen Kurta",
      image: "/clothes/eastern/kurta/kurta9.png",
      price: 3300,
    },
    {
      id: "kurta-10",
      name: "Cream Kurta",
      image: "/clothes/eastern/kurta/kurta10.png",
      price: 6500,
    },
    {
      id: "kurta-11",
      name: "Sienna Brown Kurta",
      image: "/clothes/eastern/kurta/kurta11.png",
      price: 5500,
    },
    {
      id: "kurta-12",
      name: "Dark Navy Blue Kurta",
      image: "/clothes/eastern/kurta/kurta12.png",
      price: 3000,
    },
  ],
  "shalwar-kameez": [
    {
      id: "sk-01",
      name: "Emerald Green Shalwar Kameez",
      image: "/clothes/eastern/shalwar-kameez/ShalwarKameez1.png",
      price: 2900,
    },
    {
      id: "sk-02",
      name: "Maroon Shalwar Kameez",
      image: "/clothes/eastern/shalwar-kameez/ShalwarKameez2.png",
      price: 3300,
    },
    {
      id: "sk-03",
      name: "Slate Grey Shalwar Kameez",
      image: "/clothes/eastern/shalwar-kameez/ShalwarKameez3.png",
      price: 4100,
    },
    {
      id: "sk-04",
      name: "Mustard Yellow Shalwar Kameez",
      image: "/clothes/eastern/shalwar-kameez/ShalwarKameez4.png",
      price: 4200,
    },
    {
      id: "sk-05",
      name: "Purple Shalwar Kameez",
      image: "/clothes/eastern/shalwar-kameez/ShalwarKameez5.png",
      price: 6000,
    },
    {
      id: "sk-06",
      name: "Navy Blue Shalwar Kameez",
      image: "/clothes/eastern/shalwar-kameez/ShalwarKameez6.png",
      price: 2900,
    },
    {
      id: "sk-07",
      name: "Rust Orange Shalwar Kameez",
      image: "/clothes/eastern/shalwar-kameez/ShalwarKameez7.png",
      price: 6300,
    },
    {
      id: "sk-08",
      name: "Olive Green Shalwar Kameez",
      image: "/clothes/eastern/shalwar-kameez/ShalwarKameez8.png",
      price: 4000,
    },
    {
      id: "sk-09",
      name: "Jet Black Shalwar Kameez",
      image: "/clothes/eastern/shalwar-kameez/ShalwarKameez9.png",
      price: 6200,
    },
    {
      id: "sk-10",
      name: "Beige Shalwar Kameez",
      image: "/clothes/eastern/shalwar-kameez/ShalwarKameez10.png",
      price: 5400,
    },
    {
      id: "sk-11",
      name: "Sky Blue Shalwar Kameez",
      image: "/clothes/eastern/shalwar-kameez/ShalwarKameez11.png",
      price: 4200,
    },
    {
      id: "sk-12",
      name: "Cream Shalwar Kameez",
      image: "/clothes/eastern/shalwar-kameez/ShalwarKameez12.png",
      price: 5600,
    },
    {
      id: "sk-13",
      name: "Ivory Shalwar Kameez",
      image: "/clothes/eastern/shalwar-kameez/ShalwarKameez13.png",
      price: 6500,
    },
  ],
  "kurta-pajama": [
    {
      id: "kp-01",
      name: "Off-White Kurta Pajama",
      image: "/clothes/eastern/kurta-pajama/KurtaPajama1.png",
      price: 4500,
    },
    {
      id: "kp-02",
      name: "Rust Orange Kurta Pajama",
      image: "/clothes/eastern/kurta-pajama/KurtaPajama2.png",
      price: 2800,
    },
    {
      id: "kp-03",
      name: "Royal Blue Kurta Pajama",
      image: "/clothes/eastern/kurta-pajama/KurtaPajama3.png",
      price: 3800,
    },
    {
      id: "kp-04",
      name: "Mustard Yellow Kurta Pajama",
      image: "/clothes/eastern/kurta-pajama/KurtaPajama4.png",
      price: 5500,
    },
    {
      id: "kp-05",
      name: "Slate Grey Kurta Pajama",
      image: "/clothes/eastern/kurta-pajama/KurtaPajama5.png",
      price: 4900,
    },
    {
      id: "kp-06",
      name: "Olive Green Kurta Pajama",
      image: "/clothes/eastern/kurta-pajama/KurtaPajama6.png",
      price: 4500,
    },
    {
      id: "kp-07",
      name: "Jet Black Kurta Pajama",
      image: "/clothes/eastern/kurta-pajama/KurtaPajama7.png",
      price: 3700,
    },
    {
      id: "kp-08",
      name: "Navy Blue Kurta Pajama",
      image: "/clothes/eastern/kurta-pajama/KurtaPajama8.png",
      price: 4100,
    },
    {
      id: "kp-09",
      name: "Pure White Kurta Pajama",
      image: "/clothes/eastern/kurta-pajama/KurtaPajama9.png",
      price: 4900,
    },
    {
      id: "kp-10",
      name: "Maroon Kurta Pajama",
      image: "/clothes/eastern/kurta-pajama/KurtaPajama10.png",
      price: 3400,
    },
  ],
  sherwani: [
    {
      id: "sherwani-01",
      name: "Pearl White Sherwani",
      image: "/clothes/eastern/sherwani/sherwani1.png",
      price: 22700,
    },
    {
      id: "sherwani-02",
      name: "Classic Black Sherwani",
      image: "/clothes/eastern/sherwani/sherwani2.png",
      price: 37400,
    },
    {
      id: "sherwani-03",
      name: "Royal Gold Sherwani",
      image: "/clothes/eastern/sherwani/sherwani3.png",
      price: 22900,
    },
    {
      id: "sherwani-04",
      name: "Wedding Maroon Sherwani",
      image: "/clothes/eastern/sherwani/sherwani4.png",
      price: 36300,
    },
    {
      id: "sherwani-05",
      name: "Navy Sherwani",
      image: "/clothes/eastern/sherwani/sherwani5.png",
      price: 35600,
    },
    {
      id: "sherwani-06",
      name: "Deep Red Sherwani",
      image: "/clothes/eastern/sherwani/sherwani6.png",
      price: 31500,
    },
  ],
  "prince-coat": [
    {
      id: "pc-01",
      name: "Off-White Prince Coat",
      image: "/clothes/eastern/prince-coat/princeCoat1.png",
      price: 20200,
    },
    {
      id: "pc-02",
      name: "Jet Black Prince Coat",
      image: "/clothes/eastern/prince-coat/princeCoat2.png",
      price: 41500,
    },
    {
      id: "pc-03",
      name: "Emerald Green Prince Coat",
      image: "/clothes/eastern/prince-coat/princeCoat3.png",
      price: 45400,
    },
    {
      id: "pc-04",
      name: "Maroon Prince Coat",
      image: "/clothes/eastern/prince-coat/princeCoat4.png",
      price: 24300,
    },
    {
      id: "pc-05",
      name: "Navy Blue Embellished Prince Coat",
      image: "/clothes/eastern/prince-coat/princeCoat5.png",
      price: 37300,
    },
    {
      id: "pc-06",
      name: "Charcoal Embellished Prince Coat",
      image: "/clothes/eastern/prince-coat/princeCoat6.png",
      price: 22000,
    },
  ],
  waistcoat: [
    {
      id: "wc-01",
      name: "Brocade Waistcoat",
      image: "/clothes/eastern/waistcoat/waistcoat1.png",
      price: 7000,
    },
    {
      id: "wc-02",
      name: "Maroon Waistcoat",
      image: "/clothes/eastern/waistcoat/waistcoat2.png",
      price: 5300,
    },
    {
      id: "wc-03",
      name: "Navy Waistcoat",
      image: "/clothes/eastern/waistcoat/waistcoat3.png",
      price: 7500,
    },
    {
      id: "wc-04",
      name: "Rust Orange Waistcoat",
      image: "/clothes/eastern/waistcoat/waistcoat4.png",
      price: 7400,
    },
    {
      id: "wc-05",
      name: "Cream Waistcoat",
      image: "/clothes/eastern/waistcoat/waistcoat5.png",
      price: 5800,
    },
    {
      id: "wc-06",
      name: "Beige Waistcoat",
      image: "/clothes/eastern/waistcoat/waistcoat6.png",
      price: 7100,
    },
    {
      id: "wc-07",
      name: "Charcoal Grey Textured Waistcoat",
      image: "/clothes/eastern/waistcoat/waistcoat7.png",
      price: 4700,
    },
    {
      id: "wc-08",
      name: "Jet Black Waistcoat",
      image: "/clothes/eastern/waistcoat/waistcoat8.png",
      price: 8000,
    },
  ],
  // NOTE: prices below are still placeholders — swap in the real ones
  // whenever you have them (search this file for "ps-0" to find all three).
  "pashmina-shawl": [
    {
      id: "ps-01",
      name: "Maroon Pashmina Shawl",
      image: "/clothes/eastern/pashmina-shawl/pashmina-shawl-1.png",
      price: 6500,
    },
    {
      id: "ps-02",
      name: "Camel Pashmina Shawl",
      image: "/clothes/eastern/pashmina-shawl/pashmina-shawl-2.png",
      price: 6500,
    },
    {
      id: "ps-03",
      name: "Charcoal Grey Pashmina Shawl",
      image: "/clothes/eastern/pashmina-shawl/pashmina-shawl-3.png",
      price: 6500,
    },
  ],
  shirts: [
    {
      id: "shirt-02",
      name: "Classic White Dress Shirt",
      image: "/clothes/western/shirts/shirt2.png",
      price: 2300,
    },
    {
      id: "shirt-05",
      name: "Royal Blue Shirt",
      image: "/clothes/western/shirts/shirt5.png",
      price: 4600,
    },
    {
      id: "shirt-03",
      name: "Pink Casual Shirt",
      image: "/clothes/western/shirts/shirt3.png",
      price: 4300,
    },
    {
      id: "shirt-04",
      name: "Grey Casual Shirt",
      image: "/clothes/western/shirts/shirt4.png",
      price: 2900,
    },
    {
      id: "shirt-06",
      name: "Dark Brown Shirt",
      image: "/clothes/western/shirts/shirt6.png",
      price: 3100,
    },
    {
      id: "shirt-07",
      name: "Grey Western Shirt",
      image: "/clothes/western/shirts/shirt7.png",
      price: 2400,
    },
    {
      id: "shirt-10",
      name: "Jet Black Dress Shirt",
      image: "/clothes/western/shirts/shirt10.png",
      price: 3400,
    },
    {
      id: "shirt-09",
      name: "Mint Green Shirt",
      image: "/clothes/western/shirts/shirt9.png",
      price: 2500,
    },
    {
      id: "shirt-08",
      name: "Color-Block Western Shirt",
      image: "/clothes/western/shirts/shirt8.png",
      price: 2900,
    },
    {
      id: "shirt-01",
      name: "Rainbow Gradient Western Shirt",
      image: "/clothes/western/shirts/shirt1.png",
      price: 2400,
    },
  ],
  "polo-shirts": [
    {
      id: "polo-01",
      name: "White Polo",
      image: "/clothes/western/polo-shirts/polo1.png",
      price: 3000,
    },
    {
      id: "polo-02",
      name: "Dark Navy Blue Polo",
      image: "/clothes/western/polo-shirts/polo2.png",
      price: 3600,
    },
    {
      id: "polo-03",
      name: "Grey Polo",
      image: "/clothes/western/polo-shirts/polo3.png",
      price: 4200,
    },
    {
      id: "polo-04",
      name: "Maroon Polo",
      image: "/clothes/western/polo-shirts/polo4.png",
      price: 4800,
    },
    {
      id: "polo-05",
      name: "Forest Green Polo",
      image: "/clothes/western/polo-shirts/polo5.png",
      price: 3300,
    },
    {
      id: "polo-06",
      name: "Tan Polo",
      image: "/clothes/western/polo-shirts/polo6.png",
      price: 2700,
    },
    {
      id: "polo-07",
      name: "Royal Blue Polo",
      image: "/clothes/western/polo-shirts/polo7.png",
      price: 3300,
    },
    {
      id: "polo-08",
      name: "Deep Maroon Polo",
      image: "/clothes/western/polo-shirts/polo8.png",
      price: 3300,
    },
    {
      id: "polo-09",
      name: "Light Grey Polo",
      image: "/clothes/western/polo-shirts/polo9.png",
      price: 2800,
    },
    {
      id: "polo-10",
      name: "Navy Blue Polo",
      image: "/clothes/western/polo-shirts/polo10.png",
      price: 4300,
    },
    {
      id: "polo-11",
      name: "Black Polo",
      image: "/clothes/western/polo-shirts/polo11.png",
      price: 3400,
    },
  ],
  // Colors were matched to the existing try-on results (sweatshirt-01..05)
  // by comparing hue signatures between these flat photos and the on-model
  // result photos — same fabric color, different lighting/exposure, so
  // exact RGB didn't match but hue did closely (within a few degrees for
  // every one). Prices are still placeholders — search "sweatshirt-0" to
  // find all 5 if you want to swap in real prices.
  sweatshirts: [
    {
      id: "sweatshirt-01",
      name: "Heather Grey Sweatshirt",
      image: "/clothes/western/sweatshirts/sweatshirt-01.png",
      price: 3800,
    },
    {
      id: "sweatshirt-02",
      name: "Cream Sweatshirt",
      image: "/clothes/western/sweatshirts/sweatshirt-02.png",
      price: 3800,
    },
    {
      id: "sweatshirt-03",
      name: "Blush Pink Sweatshirt",
      image: "/clothes/western/sweatshirts/sweatshirt-03.png",
      price: 3800,
    },
    {
      id: "sweatshirt-04",
      name: "Sky Blue Sweatshirt",
      image: "/clothes/western/sweatshirts/sweatshirt-04.png",
      price: 3800,
    },
    {
      id: "sweatshirt-05",
      name: "Camel Sweatshirt",
      image: "/clothes/western/sweatshirts/sweatshirt-05.png",
      price: 3800,
    },
  ],
  "suit-coats": [
    {
      id: "suit-01",
      name: "Black Suit Coat",
      image: "/clothes/western/suit-coats/Suitcoat1.png",
      price: 3000,
    },
    {
      id: "suit-02",
      name: "Navy Suit Coat",
      image: "/clothes/western/suit-coats/Suitcoat2.png",
      price: 4400,
    },
    {
      id: "suit-03",
      name: "Grey Suit Coat",
      image: "/clothes/western/suit-coats/Suitcoat3.png",
      price: 4300,
    },
    {
      id: "suit-04",
      name: "Maroon Suit Coat",
      image: "/clothes/western/suit-coats/Suitcoat4.png",
      price: 4200,
    },
    {
      id: "suit-05",
      name: "Camel Suit Coat",
      image: "/clothes/western/suit-coats/Suitcoat5.png",
      price: 2400,
    },
    {
      id: "suit-06",
      name: "Emerald Green Suit Coat",
      image: "/clothes/western/suit-coats/Suitcoat6.png",
      price: 4100,
    },
    {
      id: "suit-07",
      name: "Royal Blue Suit Coat",
      image: "/clothes/western/suit-coats/Suitcoat7.png",
      price: 4200,
    },
    {
      id: "suit-08",
      name: "Dark Red Suit Coat",
      image: "/clothes/western/suit-coats/Suitcoat8.png",
      price: 2700,
    },
    {
      id: "suit-09",
      name: "Light Grey Suit Coat",
      image: "/clothes/western/suit-coats/Suitcoat9.png",
      price: 3900,
    },
    {
      id: "suit-10",
      name: "Dark Navy Blue Suit Coat",
      image: "/clothes/western/suit-coats/Suitcoat10.png",
      price: 4500,
    },
  ],
  "western-coats": [
    {
      id: "coat-01",
      name: "Forest Green Overcoat",
      image: "/clothes/western/western-coats/westernCoat1.png",
      price: 2900,
    },
    {
      id: "coat-02",
      name: "Dark Navy Blue Overcoat",
      image: "/clothes/western/western-coats/westernCoat2.png",
      price: 2700,
    },
    {
      id: "coat-03",
      name: "Slate Grey Overcoat",
      image: "/clothes/western/western-coats/westernCoat3.png",
      price: 3600,
    },
    {
      id: "coat-04",
      name: "Jet Black Overcoat",
      image: "/clothes/western/western-coats/westernCoat4.png",
      price: 3400,
    },
    {
      id: "coat-05",
      name: "Maroon Overcoat",
      image: "/clothes/western/western-coats/westernCoat5.png",
      price: 3000,
    },
    {
      id: "coat-06",
      name: "Camel Overcoat",
      image: "/clothes/western/western-coats/westernCoat6.png",
      price: 4200,
    },
    {
      id: "coat-07",
      name: "Royal Blue Overcoat",
      image: "/clothes/western/western-coats/westernCoat7.png",
      price: 4400,
    },
    {
      id: "coat-08",
      name: "Burgundy Overcoat",
      image: "/clothes/western/western-coats/westernCoat8.png",
      price: 3900,
    },
    {
      id: "coat-09",
      name: "Light Grey Overcoat",
      image: "/clothes/western/western-coats/westernCoat9.png",
      price: 2900,
    },
    {
      id: "coat-10",
      name: "Dark Navy Blue Overcoat",
      image: "/clothes/western/western-coats/westernCoat10.png",
      price: 4300,
    },
  ],
  waistcoats: [
    {
      id: "wwc-01",
      name: "Black Waistcoat",
      image: "/clothes/western/waistcoats/Waistcoat1.png",
      price: 5800,
    },
    {
      id: "wwc-02",
      name: "Navy Waistcoat",
      image: "/clothes/western/waistcoats/Waistcoat2.png",
      price: 4100,
    },
    {
      id: "wwc-03",
      name: "Dark Blue Waistcoat",
      image: "/clothes/western/waistcoats/Waistcoat3.png",
      price: 5200,
    },
    {
      id: "wwc-04",
      name: "Maroon Waistcoat",
      image: "/clothes/western/waistcoats/Waistcoat4.png",
      price: 4000,
    },
    {
      id: "wwc-05",
      name: "Textured Charcoal Grey Waistcoat",
      image: "/clothes/western/waistcoats/Waistcoat5.png",
      price: 5800,
    },
    {
      id: "wwc-06",
      name: "Forest Green Waistcoat",
      image: "/clothes/western/waistcoats/Waistcoat6.png",
      price: 6300,
    },
    {
      id: "wwc-07",
      name: "Deep Maroon Waistcoat",
      image: "/clothes/western/waistcoats/Waistcoat7.png",
      price: 5500,
    },
    {
      id: "wwc-08",
      name: "Bright Royal Blue Waistcoat",
      image: "/clothes/western/waistcoats/Waistcoat8.png",
      price: 4200,
    },
    {
      id: "wwc-09",
      name: "Light Grey Textured Waistcoat",
      image: "/clothes/western/waistcoats/Waistcoat9.png",
      price: 5100,
    },
    {
      id: "wwc-10",
      name: "Deep Navy Blue Waistcoat",
      image: "/clothes/western/waistcoats/Waistcoat10.png",
      price: 7400,
    },
  ],
  pants: [
    {
      id: "pants-01",
      name: "Maroon Pants",
      image: "/clothes/western/pants/pant1.png",
      price: 4400,
    },
    {
      id: "pants-02",
      name: "Olive Green Pants",
      image: "/clothes/western/pants/pant2.png",
      price: 3200,
    },
    {
      id: "pants-03",
      name: "Brown Pants",
      image: "/clothes/western/pants/pant3.png",
      price: 2800,
    },
    {
      id: "pants-04",
      name: "Grey Pants",
      image: "/clothes/western/pants/pant4.png",
      price: 4200,
    },
    {
      id: "pants-05",
      name: "Tan Pants",
      image: "/clothes/western/pants/pant5.png",
      price: 3700,
    },
    {
      id: "pants-06",
      name: "Camel Pants",
      image: "/clothes/western/pants/pant6.png",
      price: 3400,
    },
    {
      id: "pants-07",
      name: "Pastel Sky Blue Pants",
      image: "/clothes/western/pants/pant7.png",
      price: 4200,
    },
    {
      id: "pants-08",
      name: "Candy Pink Pants",
      image: "/clothes/western/pants/pant8.png",
      price: 3600,
    },
    {
      id: "pants-09",
      name: "Black Dress Pants",
      image: "/clothes/western/pants/pant9.png",
      price: 2600,
    },
    {
      id: "pants-10",
      name: "White Pants",
      image: "/clothes/western/pants/pant10.png",
      price: 3000,
    },
    {
      id: "pants-11",
      name: "Navy Blue Pants",
      image: "/clothes/western/pants/pant11.png",
      price: 2600,
    },
  ],
  "corduroy-pants": [
    {
      id: "cord-01",
      name: "Cream Corduroy Pants",
      image: "/clothes/western/corduroy-pants/CorduroyPants1.png",
      price: 2900,
    },
    {
      id: "cord-02",
      name: "Navy Blue Corduroy Pants",
      image: "/clothes/western/corduroy-pants/CorduroyPants2.png",
      price: 4500,
    },
    {
      id: "cord-03",
      name: "Olive Green Corduroy Pants",
      image: "/clothes/western/corduroy-pants/CorduroyPants3.png",
      price: 3900,
    },
    {
      id: "cord-04",
      name: "Burgundy Corduroy Pants",
      image: "/clothes/western/corduroy-pants/CorduroyPants4.png",
      price: 3900,
    },
    {
      id: "cord-05",
      name: "Dark Chocolate Brown Corduroy Pants",
      image: "/clothes/western/corduroy-pants/CorduroyPants5.png",
      price: 3000,
    },
    {
      id: "cord-06",
      name: "Charcoal Grey Corduroy Pants",
      image: "/clothes/western/corduroy-pants/CorduroyPants6.png",
      price: 4500,
    },
    {
      id: "cord-07",
      name: "Mustard Yellow Corduroy Pants",
      image: "/clothes/western/corduroy-pants/CorduroyPants7.png",
      price: 4000,
    },
    {
      id: "cord-08",
      name: "Rust Orange Corduroy Pants",
      image: "/clothes/western/corduroy-pants/CorduroyPants8.png",
      price: 3500,
    },
    {
      id: "cord-09",
      name: "Kelly Green Corduroy Pants",
      image: "/clothes/western/corduroy-pants/CorduroyPants9.png",
      price: 4000,
    },
    {
      id: "cord-10",
      name: "Jet Black Corduroy Pants",
      image: "/clothes/western/corduroy-pants/CorduroyPants10.png",
      price: 3400,
    },
  ],
};

export const SIZES = ["XS", "S", "M", "L", "XL"];

export function formatPKR(amount) {
  if (typeof amount !== "number") return "";
  return `PKR ${amount.toLocaleString("en-PK")}`;
}
