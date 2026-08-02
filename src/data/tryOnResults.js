// Connects each garment in the catalogue (see src/data/garments.js) to a
// pre-generated AI try-on result image, if one exists. These are the real
// outputs already produced by the try-on pipeline (saved under
// public/results/eastern/... and public/results/western/...), so the site
// can show them instantly instead of calling the live backend every time.
//
// Kept as two separate maps — EASTERN and WESTERN — so the two wardrobes
// never get mixed up, since they're sourced from separate batches of
// result files. Lookup is by garment id, e.g.
// TRY_ON_RESULTS.eastern["kurta-01"].

// ---------------------------------------------------------------------
// EASTERN
// ---------------------------------------------------------------------
// HOW EACH EASTERN CATEGORY WAS MATCHED:
// - Kurta Pajama & Shalwar Kameez: the result filenames were the exact same
//   product-photo names used in garments.js (KurtaPajama1.png,
//   ShalwarKameez1.png, ...), so these map 1:1 with certainty.
// - Sherwani & Prince Coat: 6 result files for 6 catalog items each, mapped
//   in file order (try on 1 -> the 1st catalog entry, and so on).
// - Kurta: there are 14 result files but only 12 kurta entries in the
//   catalog. The first 12 (in numeric order) are mapped 1:1 below; results
//   13 and 14 are extra takes that don't have a catalog slot yet — swap
//   the numbers below if a different pairing is correct, or add 2 more
//   kurta entries to garments.js to use them.
// - Pashmina Shawl: 6 result files (2 angles — "(a)" and "(b)" — for each
//   of 3 shawls), now matched to the 3 catalog entries (ps-01/02/03) below.
//   ASSUMPTION: the result files' numbering (1/2/3) is assumed to be in
//   the same order as the catalog photos you sent (Maroon, Camel, Charcoal
//   = 1, 2, 3). I can't visually confirm that from here — if a shawl shows
//   the wrong color in its try-on result, swap the numbers below.

const EASTERN_RESULTS = {
  // Kurta (1st 12 of 14 results — see note above)
  "kurta-01": "/results/eastern/kurta/kurta-01.jpeg",
  "kurta-02": "/results/eastern/kurta/kurta-02.jpeg",
  "kurta-03": "/results/eastern/kurta/kurta-03.jpeg",
  "kurta-04": "/results/eastern/kurta/kurta-04.jpeg",
  "kurta-05": "/results/eastern/kurta/kurta-05.jpeg",
  "kurta-06": "/results/eastern/kurta/kurta-06.jpeg",
  "kurta-07": "/results/eastern/kurta/kurta-07.jpeg",
  "kurta-08": "/results/eastern/kurta/kurta-08.jpeg",
  "kurta-09": "/results/eastern/kurta/kurta-09.jpeg",
  "kurta-10": "/results/eastern/kurta/kurta-10.jpeg",
  "kurta-11": "/results/eastern/kurta/kurta-11.jpeg",
  "kurta-12": "/results/eastern/kurta/kurta-12.jpeg",

  // Shalwar Kameez (sk-01..sk-13, exact filename match)
  "sk-01": "/results/eastern/shalwar-kameez/sk-01.png",
  "sk-02": "/results/eastern/shalwar-kameez/sk-02.png",
  "sk-03": "/results/eastern/shalwar-kameez/sk-03.png",
  "sk-04": "/results/eastern/shalwar-kameez/sk-04.png",
  "sk-05": "/results/eastern/shalwar-kameez/sk-05.png",
  "sk-06": "/results/eastern/shalwar-kameez/sk-06.png",
  "sk-07": "/results/eastern/shalwar-kameez/sk-07.png",
  "sk-08": "/results/eastern/shalwar-kameez/sk-08.png",
  "sk-09": "/results/eastern/shalwar-kameez/sk-09.png",
  "sk-10": "/results/eastern/shalwar-kameez/sk-10.png",
  "sk-11": "/results/eastern/shalwar-kameez/sk-11.png",
  "sk-12": "/results/eastern/shalwar-kameez/sk-12.png",
  "sk-13": "/results/eastern/shalwar-kameez/sk-13.png",

  // Kurta Pajama (kp-01..kp-10, exact filename match)
  "kp-01": "/results/eastern/kurta-pajama/kp-01.png",
  "kp-02": "/results/eastern/kurta-pajama/kp-02.png",
  "kp-03": "/results/eastern/kurta-pajama/kp-03.png",
  "kp-04": "/results/eastern/kurta-pajama/kp-04.png",
  "kp-05": "/results/eastern/kurta-pajama/kp-05.png",
  "kp-06": "/results/eastern/kurta-pajama/kp-06.png",
  "kp-07": "/results/eastern/kurta-pajama/kp-07.png",
  "kp-08": "/results/eastern/kurta-pajama/kp-08.png",
  "kp-09": "/results/eastern/kurta-pajama/kp-09.png",
  "kp-10": "/results/eastern/kurta-pajama/kp-10.png",

  // Sherwani (sherwani-01..06, file order)
  "sherwani-01": "/results/eastern/sherwani/sherwani-01.jpeg",
  "sherwani-02": "/results/eastern/sherwani/sherwani-02.jpeg",
  "sherwani-03": "/results/eastern/sherwani/sherwani-03.jpeg",
  "sherwani-04": "/results/eastern/sherwani/sherwani-04.jpeg",
  "sherwani-05": "/results/eastern/sherwani/sherwani-05.jpeg",
  "sherwani-06": "/results/eastern/sherwani/sherwani-06.jpeg",

  // Prince Coat (pc-01..06, file order)
  "pc-01": "/results/eastern/prince-coat/pc-01.jpeg",
  "pc-02": "/results/eastern/prince-coat/pc-02.jpeg",
  "pc-03": "/results/eastern/prince-coat/pc-03.jpeg",
  "pc-04": "/results/eastern/prince-coat/pc-04.jpeg",
  "pc-05": "/results/eastern/prince-coat/pc-05.jpeg",
  "pc-06": "/results/eastern/prince-coat/pc-06.jpeg",

  // Pashmina Shawl (ps-01..03) — see ASSUMPTION note above. Each shawl had
  // 2 result angles; the "(a)" angle is used as the primary result, the
  // "(b)" angle is listed in EASTERN_UNMATCHED below as a spare.
  "ps-01": "/results/eastern/pashmina-shawl/pashmina-01.jpeg", // Maroon, angle (a)
  "ps-02": "/results/eastern/pashmina-shawl/pashmina-03.jpeg", // Camel, angle (a)
  "ps-03": "/results/eastern/pashmina-shawl/pashmina-05.jpeg", // Charcoal Grey, angle (a)
};

// Eastern result files that exist but aren't connected to a catalog id yet
// (see the notes above).
const EASTERN_UNMATCHED = {
  kurta: [
    "/results/eastern/kurta/kurta-13.jpeg",
    "/results/eastern/kurta/kurta-14.jpeg",
  ],
};

// Extra photo angles for a garment beyond its primary result (index 0 in
// EASTERN_RESULTS). Each shawl was shot from two angles — "(a)" (used as
// the primary result above) and "(b)" (listed here) — so the person can
// flip between them on the result screen instead of only ever seeing one.
const EASTERN_ALT_ANGLES = {
  "ps-01": ["/results/eastern/pashmina-shawl/pashmina-02.jpeg"], // Maroon, angle (b)
  "ps-02": ["/results/eastern/pashmina-shawl/pashmina-04.png"], // Camel, angle (b)
  "ps-03": ["/results/eastern/pashmina-shawl/pashmina-06.jpeg"], // Charcoal Grey, angle (b)
};

const WESTERN_ALT_ANGLES = {};

// ---------------------------------------------------------------------
// WESTERN
// ---------------------------------------------------------------------
// Empty for now — send over the Western result files (shirts, polos, suit
// coats, western coats, waistcoats, pants, corduroy pants) and I'll drop
// them into public/results/western/<category>/ and fill this in the same
// way as EASTERN_RESULTS above, keyed by the western garment ids from
// garments.js (e.g. "shirt-01", "polo-01", "pants-01", ...).

const WESTERN_RESULTS = {
  // "shirt-01": "/results/western/shirts/shirt-01.jpeg",
};

const WESTERN_UNMATCHED = {};

// ---------------------------------------------------------------------

export const TRY_ON_RESULTS = {
  eastern: EASTERN_RESULTS,
  western: WESTERN_RESULTS,
};

const ALT_ANGLES = {
  eastern: EASTERN_ALT_ANGLES,
  western: WESTERN_ALT_ANGLES,
};

export const UNMATCHED_RESULTS = {
  eastern: EASTERN_UNMATCHED,
  western: WESTERN_UNMATCHED,
};

// Returns the pre-generated try-on image for a garment id under the given
// wardrobe style ("eastern" | "western"), or null if none exists yet (the
// live AI pipeline should be used instead in that case).
export function getTryOnResult(style, garmentId) {
  return TRY_ON_RESULTS[style]?.[garmentId] || null;
}

// Returns every available photo angle for a garment — the primary result
// first, followed by any alternates (e.g. a shawl's front vs. draped-back
// shot). Always an array; empty if there's no pre-generated result at all.
export function getTryOnResultAngles(style, garmentId) {
  const primary = getTryOnResult(style, garmentId);
  if (!primary) return [];
  const alternates = ALT_ANGLES[style]?.[garmentId] || [];
  return [primary, ...alternates];
}
