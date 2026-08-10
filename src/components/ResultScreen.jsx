import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getModelImage } from "../data/models";
import { formatPKR, GARMENTS, getCoatCategoryGroups } from "../data/garments";
import { THREE_D_VIDEOS, filterForGarment } from "../data/threeDVideos";
import GLBViewer from "./GLBViewer";
import { useCart } from "../context/CartContext";
import PlaceholderArt from "./PlaceholderArt";

export default function ResultScreen({
  garment,
  purchasableItems,
  style,
  category,
  size = "M",
  modelVariant = 0,
  resultImage,
  resultAngles,
  onDownload,
  onGenerateAgain,
  onBack,
  coatOptions = [],
  onApplyCoat,
  isApplyingCoat = false,
  coatError,
  appliedCoatId,
  selectedCoat,
  onRemoveCoat,
  onSelectSuggestedCoat,
  glbComboSrc,
  glbTopColor,
  glbBottomColor,
}) {
  const [showAfter, setShowAfter] = useState(true);
  const [viewMode, setViewMode] = useState("2d"); // "2d" | "3d"
  const video3DEntry = THREE_D_VIDEOS[category];
  const video3DOptions = Array.isArray(video3DEntry)
    ? video3DEntry
    : video3DEntry
      ? [video3DEntry]
      : [];
  const [videoIndex, setVideoIndex] = useState(0);
  const video3D =
    video3DOptions[videoIndex % Math.max(video3DOptions.length, 1)];
  const videoColorMatch = filterForGarment(category, garment?.name);
  const has3D = Boolean(glbComboSrc || video3D);
  const [imageFailed, setImageFailed] = useState(false);
  const { addItem } = useCart();
  const navigate = useNavigate();
  const beforeImage = getModelImage(style, size, modelVariant);

  const angles =
    resultAngles && resultAngles.length > 0 ? resultAngles : [resultImage];
  const [angleIndex, setAngleIndex] = useState(0);
  useEffect(() => {
    setAngleIndex(0);
  }, [resultImage]);
  useEffect(() => {
    setVideoIndex(0);
  }, [category]);
  const currentResultImage = angles[angleIndex % angles.length] || resultImage;
  const cycleAngle = (direction) => {
    if (angles.length < 2) return;
    setAngleIndex((prev) => (prev + direction + angles.length) % angles.length);
  };

  const activeImage = showAfter ? currentResultImage : beforeImage;

  useEffect(() => {
    setImageFailed(false);
  }, [activeImage]);

  const itemsToPurchase = purchasableItems || [];
  const canBuy = itemsToPurchase.length > 0;

  const PAIRS_WITH_WAISTCOAT = ["kurta", "kurta-pajama", "shalwar-kameez"];
  const WESTERN_PAIRABLE_CATEGORIES = ["shirts", "polo-shirts", "sweatshirts"];

  const coatGroups =
    style === "eastern" && PAIRS_WITH_WAISTCOAT.includes(category)
      ? [
          {
            id: "waistcoat",
            label: "Waistcoat",
            items: (GARMENTS.waistcoat || []).filter(
              (w) => w.id !== garment?.id,
            ),
          },
        ].filter((g) => g.items.length > 0)
      : style === "western" && WESTERN_PAIRABLE_CATEGORIES.includes(category)
        ? getCoatCategoryGroups("western")
            .map((g) => ({
              ...g,
              items: g.items.filter((item) => item.id !== garment?.id),
            }))
            .filter((g) => g.items.length > 0)
        : [];

  const [groupIndex, setGroupIndex] = useState(0);
  useEffect(() => {
    setGroupIndex(0);
  }, [garment?.id, category]);

  const activeGroup = coatGroups[groupIndex % Math.max(coatGroups.length, 1)];
  const groupItems = activeGroup?.items || [];

  const handleSelectGroup = (nextIndex) => {
    setGroupIndex(nextIndex);
  };

  const handleAddToCart = () => {
    if (!canBuy) return;
    itemsToPurchase.forEach((item) => addItem(item, { size, style, qty: 1 }));
  };

  const handleBuyNow = () => {
    if (!canBuy) return;
    itemsToPurchase.forEach((item) => addItem(item, { size, style, qty: 1 }));
    navigate("/cart");
  };

  const canApplyLive = coatOptions.length > 0;
  const handleCoatClick = (coat) => {
    if (canApplyLive) {
      onApplyCoat?.(coat);
    } else {
      onSelectSuggestedCoat?.(coat);
    }
  };

  return (
    <div className="animate-fadeIn rounded-2xl bg-white p-6 shadow-soft dark:bg-white/[0.03]">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="rounded-full bg-gold/10 px-4 py-1 text-xs font-semibold tracking-widest2 text-gold">
          TRY-ON COMPLETE
        </span>
        <h3 className="font-display text-2xl text-charcoal dark:text-cream">
          Here's your {garment?.name || "look"}
        </h3>
        <p className="max-w-md text-sm text-charcoal/60 dark:text-cream/60">
          Compare the before and after, then download, add it to your cart, or
          try another garment.
        </p>
        {typeof garment?.price === "number" && (
          <p className="text-sm font-semibold text-gold">
            {formatPKR(garment.price)}
          </p>
        )}
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-[1200px] flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center lg:gap-10">
        {/* LEFT COLUMN (MODEL) */}
        <div className="flex w-full flex-col max-w-[650px] lg:flex-1">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center justify-center gap-1 rounded-full border border-charcoal/10 bg-cream p-1 text-xs font-semibold dark:border-white/10 dark:bg-white/5">
              <button
                onClick={() => setShowAfter(false)}
                disabled={viewMode === "3d"}
                className={`w-20 rounded-full py-2 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
                  !showAfter
                    ? "bg-charcoal text-cream dark:bg-cream dark:text-charcoal"
                    : "text-charcoal/60 dark:text-cream/60"
                }`}
              >
                Before
              </button>
              <button
                onClick={() => setShowAfter(true)}
                disabled={viewMode === "3d"}
                className={`w-20 rounded-full py-2 transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${
                  showAfter
                    ? "bg-charcoal text-cream dark:bg-cream dark:text-charcoal"
                    : "text-charcoal/60 dark:text-cream/60"
                }`}
              >
                After
              </button>
            </div>

            {has3D && (
              <div className="flex items-center justify-center gap-1 rounded-full border border-gold/30 bg-gold/5 p-1 text-xs font-semibold">
                <button
                  onClick={() => setViewMode("2d")}
                  className={`w-16 rounded-full py-2 transition-colors duration-200 ${
                    viewMode === "2d"
                      ? "bg-charcoal text-cream dark:bg-cream dark:text-charcoal"
                      : "text-charcoal/60 dark:text-cream/60"
                  }`}
                >
                  2D
                </button>
                <button
                  onClick={() => setViewMode("3d")}
                  className={`w-16 rounded-full py-2 transition-colors duration-200 ${
                    viewMode === "3d"
                      ? "btn-gold text-charcoal"
                      : "text-charcoal/60 dark:text-cream/60"
                  }`}
                >
                  3D
                </button>
              </div>
            )}
          </div>

          <div className="relative mt-6 aspect-[2/3] w-full overflow-hidden rounded-2xl bg-[#ECE7E0] shadow-lift dark:bg-white/5">
            {viewMode === "3d" && glbComboSrc ? (
              <GLBViewer
                key={glbComboSrc}
                src={glbComboSrc}
                topColor={glbTopColor}
                bottomColor={glbBottomColor}
                className="h-full w-full"
              />
            ) : viewMode === "3d" && video3D ? (
              <>
                <video
                  key={video3D}
                  src={video3D}
                  style={{ filter: videoColorMatch.filter }}
                  className="h-full w-full bg-black object-cover transition-[filter] duration-300"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
                {video3DOptions.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setVideoIndex(
                          (i) =>
                            (i - 1 + video3DOptions.length) %
                            video3DOptions.length,
                        )
                      }
                      aria-label="Previous style"
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
                        setVideoIndex((i) => (i + 1) % video3DOptions.length)
                      }
                      aria-label="Next style"
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
                    <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-charcoal/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-cream dark:bg-white/80 dark:text-charcoal">
                      Style {videoIndex + 1} of {video3DOptions.length}
                    </span>
                  </>
                )}
                {videoColorMatch.approximate && video3DOptions.length <= 1 && (
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-charcoal/80 px-3 py-1 text-[10px] font-semibold text-cream dark:bg-white/80 dark:text-charcoal">
                    Closest 3D color approximation
                  </span>
                )}
              </>
            ) : activeImage && !imageFailed ? (
              <img
                src={activeImage}
                alt={
                  showAfter
                    ? `${garment?.name || "Garment"} try-on result`
                    : "Base model"
                }
                className="h-full w-full object-contain"
                onError={() => {
                  console.warn(`Could not load image at ${activeImage}`);
                  setImageFailed(true);
                }}
              />
            ) : (
              <PlaceholderArt
                label={showAfter ? garment?.name : "base model"}
                variant="model"
                className="h-full w-full"
              />
            )}
            {isApplyingCoat && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-charcoal/60 backdrop-blur-sm">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <p className="text-sm font-semibold text-white">
                  Applying coat...
                </p>
              </div>
            )}
            {viewMode === "2d" &&
              showAfter &&
              angles.length > 1 &&
              !isApplyingCoat && (
                <>
                  <button
                    onClick={() => cycleAngle(-1)}
                    aria-label="Previous angle"
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
                    onClick={() => cycleAngle(1)}
                    aria-label="Next angle"
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
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-charcoal/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-cream dark:bg-white/80 dark:text-charcoal">
                    Angle {(angleIndex % angles.length) + 1} of {angles.length}
                  </span>
                </>
              )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onBack}
              className="focus-ring flex flex-1 items-center justify-center gap-1.5 rounded-full border border-charcoal/15 px-4 py-3 text-sm font-semibold text-charcoal/70 transition-colors duration-200 hover:border-charcoal hover:text-charcoal dark:border-white/15 dark:text-cream/70 dark:hover:border-cream dark:hover:text-cream"
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
              Back
            </button>
            <button
              onClick={onGenerateAgain}
              className="focus-ring flex-1 rounded-full border border-charcoal/15 py-3 text-sm font-semibold text-charcoal/70 transition-colors duration-200 hover:border-charcoal hover:text-charcoal dark:border-white/15 dark:text-cream/70 dark:hover:border-cream dark:hover:text-cream"
            >
              Generate Again
            </button>
            <button
              onClick={() => onDownload?.(currentResultImage)}
              className="focus-ring flex-1 rounded-full btn-gold py-3 text-sm font-semibold text-charcoal shadow-card transition-colors duration-200"
            >
              Download
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            <button
              onClick={handleAddToCart}
              disabled={!canBuy}
              className="focus-ring flex-1 rounded-full border border-charcoal/15 py-3 text-sm font-semibold text-charcoal/70 transition-colors duration-200 hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/15 dark:text-cream/70"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!canBuy}
              className="focus-ring flex-1 rounded-full bg-charcoal py-3 text-sm font-semibold text-cream transition-colors duration-200 hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white/10 dark:hover:bg-white/20"
            >
              Buy Now
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN (COAT) */}
        {selectedCoat ? (
          <div className="flex w-full flex-col lg:w-[450px] lg:shrink-0 lg:mt-[64px]">
            <div className="mb-5 text-center lg:text-left">
              <p className="text-xs font-semibold uppercase tracking-widest2 text-gold">
                Your Coat
              </p>
              <h4 className="mt-1 font-display text-2xl text-charcoal dark:text-cream">
                {selectedCoat.name}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-charcoal/60 dark:text-cream/60">
                {appliedCoatId === selectedCoat.id
                  ? "Layered onto your photo and included in your cart total."
                  : "This coat couldn't be layered onto the photo automatically — but it's included in your cart."}
              </p>
            </div>

            <div className="relative w-full overflow-hidden rounded-xl bg-cream shadow-soft dark:bg-white/[0.04]">
              <button
                onClick={onRemoveCoat}
                aria-label="Remove coat"
                className="focus-ring absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-charcoal/80 text-sm text-cream hover:bg-red-500 transition-colors"
              >
                ✕
              </button>
              <div className="aspect-[3/4] w-full bg-white dark:bg-white/[0.06]">
                <img
                  src={selectedCoat.image}
                  alt={selectedCoat.name}
                  className="h-full w-full object-contain p-5"
                />
              </div>
              <div className="p-5">
                <p className="truncate text-xl font-medium text-charcoal dark:text-cream">
                  {selectedCoat.name}
                </p>
                <p className="mt-1 text-base font-semibold text-gold">
                  {formatPKR(selectedCoat.price)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          (coatGroups.length > 0 || coatOptions.length > 0) && (
            <div className="flex w-full flex-col lg:w-[450px] lg:shrink-0 lg:mt-[64px]">
              <div className="mb-5 text-center lg:text-left">
                <p className="text-xs font-semibold uppercase tracking-widest2 text-gold">
                  Optional
                </p>
                <h4 className="mt-1 font-display text-2xl text-charcoal dark:text-cream">
                  Suggested Coats
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-charcoal/50 dark:text-cream/50">
                  {canApplyLive
                    ? "Tap one to layer it onto your photo."
                    : "Tap one to select it — you'll see it here, and it'll be added along with your garment."}
                </p>

                {coatError && (
                  <p className="mt-3 text-xs text-red-500">{coatError}</p>
                )}

                {/* FIXED TOGGLE TABS: Changed to `inline-flex` and removed `flex-wrap` so the container tightly wraps the buttons */}
                {coatGroups.length > 1 && (
                  <div className="mt-4 inline-flex items-center gap-1 rounded-full border border-charcoal/10 bg-cream p-1 text-xs font-semibold dark:border-white/10 dark:bg-white/5">
                    {coatGroups.map((g, i) => (
                      <button
                        key={g.id}
                        onClick={() => handleSelectGroup(i)}
                        className={`whitespace-nowrap rounded-full px-4 py-2 transition-all duration-200 ${
                          i === groupIndex
                            ? "bg-charcoal text-cream shadow-soft dark:bg-cream dark:text-charcoal"
                            : "text-charcoal/60 hover:text-charcoal dark:text-cream/60 dark:hover:text-cream"
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid w-full grid-cols-2 gap-4">
                {(groupItems.length > 0 ? groupItems : coatOptions).map(
                  (coat) => {
                    const isApplied = appliedCoatId === coat.id;
                    return (
                      <button
                        key={coat.id}
                        onClick={() => handleCoatClick(coat)}
                        disabled={isApplyingCoat}
                        className={`focus-ring group overflow-hidden rounded-xl bg-cream text-left shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/[0.04] ${
                          isApplied
                            ? "ring-2 ring-gold"
                            : "ring-1 ring-transparent"
                        }`}
                      >
                        <div className="aspect-[3/4] w-full bg-white dark:bg-white/[0.06]">
                          <img
                            src={coat.image}
                            alt={coat.name}
                            className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-4">
                          <p className="truncate text-base font-medium text-charcoal dark:text-cream">
                            {coat.name}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-gold">
                            {formatPKR(coat.price)}
                          </p>
                          {isApplied && (
                            <span className="btn-gold mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold text-charcoal">
                              Applied
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
