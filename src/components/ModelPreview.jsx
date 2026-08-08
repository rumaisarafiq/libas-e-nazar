import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { formatPKR } from "../data/garments";
import {
  getModelImage,
  hasModelPhoto,
  PHOTO_AVAILABLE_SIZE,
} from "../data/models";
import { useWardrobe } from "../context/WardrobeContext";
import { useCart } from "../context/CartContext";
import PlaceholderArt from "./PlaceholderArt";

export default function ModelPreview({
  selectedGarment,
  purchasableItems,
  size,
  modelVariant,
  onChangeSize,
  onChangeModel,
  onTryOn,
  onReset,
  onDownload,
  isGenerating,
  resultImage,
  readyToTryOn,
  className = "",
  selectedCoat,
  onRemoveCoat,
}) {
  const { style } = useWardrobe();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [imageFailed, setImageFailed] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const baseModelImage = getModelImage(style, size, modelVariant);
  const displayedImage = resultImage || baseModelImage;

  useEffect(() => {
    setImageFailed(false);
  }, [displayedImage]);

  const photoAvailable = hasModelPhoto(style, size);
  const canTryOn =
    (readyToTryOn !== undefined ? readyToTryOn : !!selectedGarment) &&
    photoAvailable;

  // Fall back to treating selectedGarment as a single purchasable item if
  // the caller didn't pass an explicit list (keeps this component usable
  // stand-alone).
  const itemsToPurchase =
    purchasableItems ?? (selectedGarment?.id ? [selectedGarment] : []);
  const canBuy = itemsToPurchase.length > 0;

  const handleAddToCart = () => {
    if (!canBuy) return;
    itemsToPurchase.forEach((item) => addItem(item, { size, style, qty: 1 }));
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const handleBuyNow = () => {
    if (!canBuy) return;
    itemsToPurchase.forEach((item) => addItem(item, { size, style, qty: 1 }));
    navigate("/cart");
  };

  return (
    <aside
      className={`rounded-2xl border border-white/40 bg-white/80 p-5 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] lg:sticky lg:top-28 ${className}`}
    >
      <p className="text-xs font-semibold tracking-widest2 text-charcoal/40 dark:text-cream/40">
        MODEL PREVIEW
      </p>

      <div className="mt-4 flex gap-3">
        <div className="relative aspect-[3/5] w-full flex-1 overflow-hidden rounded-2xl bg-[#ECE7E0] dark:bg-white/5">
          {displayedImage && !imageFailed ? (
            <img
              src={displayedImage}
              alt={
                resultImage
                  ? "Generated try-on result"
                  : `Model wearing size ${size}`
              }
              className="h-full w-full object-contain"
              onError={() => {
                console.warn(`Could not load image at ${displayedImage}`);
                setImageFailed(true);
              }}
            />
          ) : (
            <PlaceholderArt
              label={resultImage ? "result" : selectedGarment?.name || "model"}
              variant="model"
              className="h-full w-full"
            />
          )}
          {resultImage && (
            <span className="absolute left-3 top-3 rounded-full bg-charcoal/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-cream">
              Generated
            </span>
          )}
          <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-charcoal shadow-soft dark:bg-charcoal/80 dark:text-cream">
            Size: {size}
          </span>
        </div>

        {/* Selected coat shows beside the model preview, not in a list —
            per spec, coats aren't browsed in the gallery, just picked from
            Recommended Coats and shown here once chosen. */}
        {selectedCoat && (
          <div className="relative w-20 shrink-0 overflow-hidden rounded-xl bg-white shadow-soft dark:bg-white/[0.06]">
            <button
              onClick={onRemoveCoat}
              aria-label="Remove coat"
              className="focus-ring absolute right-1 top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-charcoal/70 text-[10px] text-cream hover:bg-red-500"
            >
              ✕
            </button>
            <div className="aspect-square w-full bg-white p-1.5 dark:bg-white/[0.06]">
              <img
                src={selectedCoat.image}
                alt={selectedCoat.name}
                className="h-full w-full object-contain"
              />
            </div>
            <p className="px-1.5 pb-1.5 text-[9px] font-semibold leading-tight text-charcoal/70 dark:text-cream/70 line-clamp-2">
              {selectedCoat.name}
            </p>
          </div>
        )}
      </div>

      {onChangeModel && (
        <button
          onClick={onChangeModel}
          disabled={!photoAvailable}
          className="focus-ring mt-4 w-full rounded-full border border-charcoal/15 py-2.5 text-xs font-semibold tracking-wide text-charcoal/70 transition-colors duration-200 hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:text-cream/70"
        >
          Change Model
        </button>
      )}

      <div className="mt-5 space-y-1">
        <p className="text-xs font-semibold tracking-widest2 text-charcoal/40 dark:text-cream/40">
          SELECTED GARMENT
        </p>
        <p className="font-display text-lg text-charcoal dark:text-cream">
          {selectedGarment ? selectedGarment.name : "None selected"}
        </p>
        {typeof selectedGarment?.price === "number" && (
          <p className="text-sm font-semibold text-gold">
            {formatPKR(selectedGarment.price)}
          </p>
        )}
        <Link
          to="/size-guide"
          className="focus-ring mt-1 inline-block text-xs font-semibold text-gold underline-offset-2 hover:underline"
        >
          View model measurements →
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={onTryOn}
          disabled={!canTryOn || isGenerating}
          title={
            !photoAvailable
              ? `Try-on requires size ${PHOTO_AVAILABLE_SIZE}`
              : undefined
          }
          className="focus-ring btn-gold flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold text-charcoal shadow-card transition-all duration-300"
        >
          {isGenerating && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {isGenerating ? "Generating..." : "Try On"}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleAddToCart}
            disabled={!canBuy}
            className={`focus-ring rounded-full border py-3 text-sm font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
              justAdded
                ? "border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400"
                : "border-charcoal/15 text-charcoal/70 hover:border-gold hover:text-gold dark:border-white/15 dark:text-cream/70"
            }`}
          >
            {justAdded ? "Added ✓" : "Add to Cart"}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!canBuy}
            className="focus-ring rounded-full bg-charcoal py-3 text-sm font-semibold text-cream transition-colors duration-200 hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white/10 dark:hover:bg-white/20"
          >
            Buy Now
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onReset}
            className="focus-ring rounded-full border border-charcoal/15 py-3 text-sm font-semibold text-charcoal/70 transition-colors duration-200 hover:border-charcoal hover:text-charcoal dark:border-white/15 dark:text-cream/70 dark:hover:border-cream dark:hover:text-cream"
          >
            Reset
          </button>
          <button
            onClick={onDownload}
            disabled={!resultImage}
            className="focus-ring rounded-full bg-charcoal py-3 text-sm font-semibold text-cream transition-colors duration-200 hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white/10 dark:hover:bg-white/20"
          >
            Download
          </button>
        </div>
      </div>
    </aside>
  );
}
