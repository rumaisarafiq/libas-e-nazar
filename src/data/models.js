// Base model photos shown in the Model Preview panel before a try-on is
// generated.
//
// Only the M (medium) size has real photography for each wardrobe style:
//   - Eastern  -> the new studio shot (eastern-m.png)
//   - Western  -> the two original shots (m.jpeg / mm.jpeg), unchanged
//
// XS / S / L / XL still work as selectable sizes everywhere else (garment
// pricing, cart, checkout) but there is no model photo for them, so the
// Model Preview panel falls back to the placeholder art for those sizes
// instead of trying to show a (non-existent) photo.

export const BASE_MODEL_IMAGES = {
  eastern: {
    XS: [],
    S: [],
    M: ["/models/eastern-m.png"],
    L: [],
    XL: [],
  },
  western: {
    XS: [],
    S: [],
    M: ["/models/m.jpeg", "/models/mm.jpeg"],
    L: [],
    XL: [],
  },
};

// Only sizes with real photography can show a model preview / be sent to
// the AI try-on pipeline.
export const PHOTO_AVAILABLE_SIZE = "M";

export function getModelVariants(style, size) {
  return BASE_MODEL_IMAGES[style]?.[size] || [];
}

export function getModelImage(style, size, variantIndex = 0) {
  const variants = getModelVariants(style, size);
  if (variants.length === 0) return null;
  return variants[variantIndex % variants.length];
}

export function hasModelPhoto(style, size) {
  return getModelVariants(style, size).length > 0;
}
