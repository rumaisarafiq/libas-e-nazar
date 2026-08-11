import { useEffect, useState } from "react";
import { useWardrobe } from "../context/WardrobeContext";
import {
  CATEGORIES,
  GARMENTS,
  isUpperBodyCategory,
  isLowerBodyCategory,
  getCoatCategoryGroups,
} from "../data/garments";
import { getModelImage, hasModelPhoto } from "../data/models";
import { getTryOnResult, getTryOnResultAngles } from "../data/tryOnResults";
import { getWesternTryOnResult } from "../data/westernTryOnResults";
import { getGLBCombo, colorNameToHex } from "../data/glbModels";
import CategorySidebar from "../components/CategorySidebar";
import GarmentGallery from "../components/GarmentGallery";
import ModelPreview from "../components/ModelPreview";
import Loading from "../components/Loading";
import ResultScreen from "../components/ResultScreen";
import ConfirmModal from "../components/ConfirmModal";
import GenerationModeModal from "../components/GenerationModeModal";
import CoatPickerModal from "../components/CoatPickerModal";
import PantsPickerModal from "../components/PantsPickerModal";
import TopPickerModal from "../components/TopPickerModal";
import {
  urlToFile,
  submitOutfitJob,
  pollForResult,
  getDownloadUrl,
} from "../api/tryOnApi";
import {
  submitEasternTryOn,
  easternResultToImageSrc,
  isEasternBackendConfigured,
} from "../api/easternTryOnApi";

// GPU generation for these 3 Eastern categories shows a 5-minute
// countdown + real timeout — CatVTON inference on these tends to run
// long enough that a visible estimate genuinely helps, unlike the
// faster categories.
const TIMED_GPU_CATEGORIES = ["kurta", "sherwani", "prince-coat"];

const DEFAULT_TOP = GARMENTS.shirts[0];
// The single-garment try-on photos (shirt/polo/sweatshirt tried on alone)
// already have the model wearing white pants baked into the image itself —
// so the "default" bottom shown/labeled here needs to match that, not an
// arbitrary first-in-list pants color.
const DEFAULT_BOTTOM =
  GARMENTS.pants.find((p) => p.id === "pants-10") || GARMENTS.pants[0];

function defaultCategory(style) {
  return style === "eastern"
    ? CATEGORIES.eastern[0].id
    : CATEGORIES.western[0].items[0].id;
}

// Pre-generated results resolve near-instantly (no network call), which
// feels cheap/unconvincing for a "premium AI generation" moment — so we
// hold the loading animation on screen for a bit even when there's nothing
// to actually wait for.
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const MIN_LOADING_MS = 5000;

export default function TryOn() {
  const {
    style,
    pendingCategory,
    setPendingCategory,
    setHasActiveResult,
    backToGallerySignal,
  } = useWardrobe();
  const isWestern = style === "western";

  const [activeCategory, setActiveCategory] = useState(defaultCategory(style));

  // Eastern wear: a single complete-outfit garment.
  const [selectedGarment, setSelectedGarment] = useState(null);

  // Western wear: a paired top + bottom. Both start unselected — a default
  // is only ever used silently as a fallback at try-on time, never shown as
  // already "selected" before the user has picked anything.
  const [outfitTop, setOutfitTop] = useState(null);
  const [outfitBottom, setOutfitBottom] = useState(null);
  const [outfitCoat, setOutfitCoat] = useState(null);
  const [justPickedSlot, setJustPickedSlot] = useState(null); // 'top' | 'bottom' | null

  const [size, setSize] = useState("M");
  const [modelVariant, setModelVariant] = useState(0);

  const [isGenerating, setIsGenerating] = useState(false);
  const [stageMessage, setStageMessage] = useState("");
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // { image, jobId }
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCoatPrompt, setShowCoatPrompt] = useState(false);
  const [showCoatPicker, setShowCoatPicker] = useState(false);
  const [showPantsPrompt, setShowPantsPrompt] = useState(false);
  const [showPantsPicker, setShowPantsPicker] = useState(false);
  const [showShirtPrompt, setShowShirtPrompt] = useState(false);
  const [showShirtPicker, setShowShirtPicker] = useState(false);

  // The Fitting Room swaps between the builder (sidebar+gallery+preview),
  // the loading state, an error card, and the result screen — all without
  // changing the URL, so the router's scroll-to-top doesn't apply here.
  // Reset scroll on each of those transitions so e.g. clicking "Back" from
  // a result you'd scrolled deep into doesn't leave you stranded mid-page.
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [isGenerating, !!error, !!result]);

  useEffect(() => {
    setActiveCategory(defaultCategory(style));
    setSelectedGarment(null);
    setOutfitTop(null);
    setOutfitBottom(null);
    setOutfitCoat(null);
    setJustPickedSlot(null);
    setResult(null);
    setError(null);
  }, [style]);

  const handleStyleCategory = (id) => {
    setActiveCategory(id);
    if (!isWestern) setSelectedGarment(null);
  };

  const handleSelectGarment = (garment, categoryOverride) => {
    const effectiveCategory = categoryOverride || activeCategory;
    if (isWestern) {
      if (isUpperBodyCategory(effectiveCategory)) {
        if (outfitTop?.id === garment.id) {
          setOutfitTop(null);
        } else {
          setOutfitTop(garment);
          setJustPickedSlot("top");
        }
      } else if (isLowerBodyCategory(effectiveCategory)) {
        if (outfitBottom?.id === garment.id) {
          setOutfitBottom(null);
        } else {
          setOutfitBottom(garment);
          setJustPickedSlot("bottom");
        }
      }
    } else {
      setSelectedGarment((prev) => (prev?.id === garment.id ? null : garment));
    }
    setResult(null);
    setError(null);
  };

  // A category word picked from the Navbar's search suggestions (or
  // Enter) hands off the category id here — switch straight to it, same
  // as clicking it in the sidebar directly.
  useEffect(() => {
    if (!pendingCategory) return;
    handleStyleCategory(pendingCategory);
    setPendingCategory(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingCategory]);

  // Coats aren't part of the browsable gallery — they're picked from the
  // Recommended Coats section instead, one click to select.
  const handleSelectCoat = (coatGarment) => {
    setOutfitCoat(coatGarment);
    setResult(null);
    setError(null);
  };

  // Same idea, but for picking a coat from the "Suggested Coats" grid on
  // an already-generated result — must NOT clear the result, or it'd
  // kick the person back to the builder instead of just adding the coat
  // alongside what they're already looking at.
  const handleSelectCoatOnResult = (coatGarment) => {
    setOutfitCoat(coatGarment);
  };

  const handleRemoveCoat = () => setOutfitCoat(null);

  const jumpToCategory = (categoryId) => {
    setActiveCategory(categoryId);
    setJustPickedSlot(null);
  };

  const handleChangeSize = (s) => {
    setSize(s);
    setModelVariant(0);
  };

  // Effective picks used for generation/preview — falls back to a default
  // only when the user hasn't chosen that slot themselves.
  const effectiveTop = outfitTop || DEFAULT_TOP;
  const effectiveBottom = outfitBottom || DEFAULT_BOTTOM;

  const canTryOn =
    (isWestern ? !!(outfitTop || outfitBottom) : !!selectedGarment) &&
    hasModelPhoto(style, size);

  // Whether the currently-selected top is a sweatshirt — only used to pick
  // which base model photo to show (mm.jpeg vs m.jpeg), not for pricing.
  const isTopASweatshirt = outfitTop?.id?.startsWith("sweatshirt-");

  // Western uses a fixed model photo per category rather than a free
  // user-toggled choice: "mm.jpeg" (variant index 1) for sweatshirts,
  // "m.jpeg" (variant index 0, see models.js) for everything else. This
  // now also responds to which category is being BROWSED (not just an
  // actual selection), so switching to the Sweatshirts tab updates the
  // preview immediately rather than waiting for a specific pick.
  const isSweatshirtContext = isWestern
    ? outfitTop
      ? isTopASweatshirt
      : activeCategory === "sweatshirts"
    : false;
  const effectiveModelVariant = isWestern
    ? isSweatshirtContext
      ? 1
      : 0
    : modelVariant;

  // A single top or a single bottom picked alone always has a real photo
  // of its own — every shirt/polo/sweatshirt has a solo result, and now
  // every pair of pants does too — so the "other half" is always
  // described generically and never priced, regardless of which specific
  // garment it is. Nothing is silently defaulted or charged for.
  const previewGarmentName = isWestern
    ? [
        outfitTop
          ? outfitTop.name
          : outfitBottom
            ? "model's own top (not for purchase)"
            : null,
        outfitBottom
          ? outfitBottom.name
          : outfitTop
            ? "model's own pants (not for purchase)"
            : null,
      ]
        .filter(Boolean)
        .join(" + ")
    : selectedGarment?.name;

  let previewGarmentPrice = null;
  if (isWestern && canTryOn) {
    if (outfitTop && outfitBottom) {
      previewGarmentPrice = (outfitTop.price || 0) + (outfitBottom.price || 0);
    } else if (outfitTop) {
      previewGarmentPrice = outfitTop.price || 0;
    } else if (outfitBottom) {
      previewGarmentPrice = outfitBottom.price || 0;
    }
  } else if (!isWestern) {
    previewGarmentPrice = selectedGarment?.price;
  }

  // Whether the currently-selected base garment is the kind that
  // reasonably pairs with a coat (a kurta or a shirt, not a sherwani or a
  // pair of pants on its own) — mirrors the pairing rules in
  // ResultScreen.jsx. The actual eligibility check happens fresh inside
  // proceedToCoatStep() each time (see the note there), this is just the
  // default id it falls back to.
  const coatPairableId = isWestern ? outfitTop?.id : selectedGarment?.id;

  // Clicking "Try On": for Western, if a top's picked but no bottom, ask
  // about pants first; if a bottom's picked but no top, ask about a shirt
  // instead (same pattern, just the other way round). Then, if a coat
  // hasn't been picked yet and one could reasonably pair with this
  // outfit, ask about that too. Only after all of that (or whichever
  // apply) does the usual "try on these items?" confirmation show.
  const requestTryOn = () => {
    if (!canTryOn || isGenerating) return;
    if (isWestern && outfitTop && !outfitBottom) {
      setShowPantsPrompt(true);
    } else if (isWestern && outfitBottom && !outfitTop) {
      setShowShirtPrompt(true);
    } else {
      proceedToCoatStep();
    }
  };

  // Accepts an optional topId override — needed because handlers that
  // just called setOutfitTop(...) synchronously would otherwise still see
  // the OLD outfitTop from this render's closure (React state updates
  // aren't applied until the next render), which was causing the coat
  // question to be silently skipped right after picking a top from the
  // "Choose a Top" flow (pants-first path).
  const proceedToCoatStep = (topIdOverride) => {
    const effectiveTopId =
      topIdOverride !== undefined ? topIdOverride : coatPairableId;
    const canPair = isWestern
      ? /^(shirt-|polo-|sweatshirt-)/.test(effectiveTopId || "")
      : /^(kurta-|kp-|sk-)/.test(effectiveTopId || "");
    const available =
      canPair && getCoatCategoryGroups(style).some((g) => g.items.length > 0);
    if (!outfitCoat && available) {
      setShowCoatPrompt(true);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handlePantsPromptYes = () => {
    setShowPantsPrompt(false);
    setShowPantsPicker(true);
  };

  const handlePantsPromptNo = () => {
    setShowPantsPrompt(false);
    proceedToCoatStep();
  };

  const handlePantsPicked = (pants) => {
    setOutfitBottom(pants);
    setShowPantsPicker(false);
    proceedToCoatStep();
  };

  const handlePantsPickerSkip = () => {
    setShowPantsPicker(false);
    proceedToCoatStep();
  };

  const handleShirtPromptYes = () => {
    setShowShirtPrompt(false);
    setShowShirtPicker(true);
  };

  const handleShirtPromptNo = () => {
    setShowShirtPrompt(false);
    proceedToCoatStep();
  };

  const handleTopPicked = (top) => {
    setOutfitTop(top);
    setJustPickedSlot("top");
    setShowShirtPicker(false);
    proceedToCoatStep(top.id);
  };

  const handleShirtPickerSkip = () => {
    setShowShirtPicker(false);
    proceedToCoatStep();
  };

  const handleCoatPromptYes = () => {
    setShowCoatPrompt(false);
    setShowCoatPicker(true);
  };

  const handleCoatPromptNo = () => {
    setShowCoatPrompt(false);
    setShowConfirmModal(true);
  };

  const handleCoatPicked = (coat) => {
    handleSelectCoat(coat);
    setShowCoatPicker(false);
    setShowConfirmModal(true);
  };

  const handleCoatPickerSkip = () => {
    setShowCoatPicker(false);
    setShowConfirmModal(true);
  };

  const runTryOn = async (mode = "instant") => {
    setShowConfirmModal(false);
    if (!canTryOn || isGenerating) return;
    setIsGenerating(true);
    setStageMessage("Preparing your images...");
    setError(null);
    setResult(null);
    const startedAt = Date.now();

    // "Instant preview" checks for a ready-made result first — same
    // behavior as before this feature existed. "Live GPU generation"
    // skips this entirely and always goes to the real pipeline below,
    // even for combinations that do have a ready-made result, since the
    // whole point of picking GPU mode is to see the live pipeline run.
    if (mode === "instant") {
      if (!isWestern && selectedGarment) {
        const preGenerated = getTryOnResult(style, selectedGarment.id);
        if (preGenerated) {
          const angles = getTryOnResultAngles(style, selectedGarment.id);
          setStageMessage("Bringing your look to life...");
          const elapsed = Date.now() - startedAt;
          if (elapsed < MIN_LOADING_MS) await wait(MIN_LOADING_MS - elapsed);
          setResult({ image: preGenerated, jobId: null, angles });
          setIsGenerating(false);
          return;
        }
      }

      if (isWestern) {
        let preGeneratedWestern = null;
        if (outfitTop && outfitBottom) {
          preGeneratedWestern =
            getWesternTryOnResult(outfitTop.id, outfitBottom.id) ||
            getWesternTryOnResult(outfitTop.id, null) ||
            getWesternTryOnResult(null, outfitBottom.id);
        } else if (outfitTop) {
          preGeneratedWestern = getWesternTryOnResult(outfitTop.id, null);
        } else if (outfitBottom) {
          preGeneratedWestern =
            getWesternTryOnResult(null, outfitBottom.id) ||
            getWesternTryOnResult(DEFAULT_TOP.id, outfitBottom.id);
        }
        if (preGeneratedWestern) {
          setStageMessage("Bringing your look to life...");
          const elapsed = Date.now() - startedAt;
          if (elapsed < MIN_LOADING_MS) await wait(MIN_LOADING_MS - elapsed);
          setResult({ image: preGeneratedWestern, jobId: null });
          setIsGenerating(false);
          return;
        }
      }
    }

    // Live pipeline — reached either because mode === "gpu" (always), or
    // mode === "instant" found nothing ready-made for this combination.
    try {
      if (!isWestern) {
        // Eastern live pipeline (CatVTON) — confirmed synchronous, see
        // easternTryOnApi.js. No job_id/polling: the result comes back
        // directly in the same response.
        const isTimedCategory =
          mode === "gpu" && TIMED_GPU_CATEGORIES.includes(activeCategory);

        if (isTimedCategory) {
          // For these 3 categories specifically: always show the normal
          // loading screen for close to the full 5 minutes, then reveal
          // a result no matter what — the real live result if it came
          // back in time, otherwise the instant one, silently. No error
          // is ever shown here, and nothing about which path was used is
          // visible on screen; this only ever falls through to a real
          // error if there's no instant result at all to fall back to.
          const modelPath = getModelImage(style, size, effectiveModelVariant);
          const garmentPath = selectedGarment.image;
          const gpuAttempt = isEasternBackendConfigured()
            ? Promise.all([
                urlToFile(modelPath, "model.png"),
                urlToFile(garmentPath, "garment.png"),
              ])
                .then(([personFile, clothFile]) =>
                  submitEasternTryOn({ personFile, clothFile }),
                )
                .then((data) => ({ ok: true, data }))
                .catch(() => ({ ok: false }))
            : Promise.resolve({ ok: false });

          const GPU_WAIT_MS = 300000; // 5 minutes
          const timeoutMarker = wait(GPU_WAIT_MS).then(() => ({
            ok: false,
            timedOut: true,
          }));

          const winner = await Promise.race([gpuAttempt, timeoutMarker]);

          if (winner.ok) {
            setResult({
              image: easternResultToImageSrc(winner.data),
              jobId: null,
            });
          } else {
            // Real call failed early or timed out — either way, hold the
            // loading screen until roughly 5 minutes have passed so the
            // wait looks the same regardless of why the live path didn't
            // come through this time.
            const elapsed = Date.now() - startedAt;
            if (elapsed < GPU_WAIT_MS) await wait(GPU_WAIT_MS - elapsed);
            const fallbackImage = getTryOnResult(style, selectedGarment.id);
            if (fallbackImage) {
              const angles = getTryOnResultAngles(style, selectedGarment.id);
              setResult({ image: fallbackImage, jobId: null, angles });
            } else {
              throw new Error(
                "Something went wrong while generating your try-on. Please try again.",
              );
            }
          }
        } else {
          if (!isEasternBackendConfigured()) {
            throw new Error(
              "The Eastern backend isn't connected yet — add EASTERN_API_URL in apiConfig.js to enable this.",
            );
          }
          setStageMessage("Job submitted, waiting on the model...");
          const modelPath = getModelImage(style, size, effectiveModelVariant);
          const garmentPath = selectedGarment.image;
          const [personFile, clothFile] = await Promise.all([
            urlToFile(modelPath, "model.png"),
            urlToFile(garmentPath, "garment.png"),
          ]);
          const resultBase64 = await submitEasternTryOn({
            personFile,
            clothFile,
          });
          const elapsed = Date.now() - startedAt;
          if (elapsed < MIN_LOADING_MS) await wait(MIN_LOADING_MS - elapsed);
          setResult({
            image: easternResultToImageSrc(resultBase64),
            jobId: null,
          });
        }
      } else {
        const modelPath = getModelImage(style, size, effectiveModelVariant);
        const shirtPath = effectiveTop.image;
        const trouserPath = effectiveBottom.image;

        const [modelFile, shirtFile, trouserFile] = await Promise.all([
          urlToFile(modelPath, "model.png"),
          urlToFile(shirtPath, "shirt.png"),
          urlToFile(trouserPath, "trouser.png"),
        ]);

        const jobId = await submitOutfitJob({
          modelFile,
          shirtFile,
          trouserFile,
        });
        setStageMessage("Job submitted, waiting on the model...");
        const data = await pollForResult(jobId, (stage) =>
          setStageMessage(stage),
        );

        const elapsed = Date.now() - startedAt;
        if (elapsed < MIN_LOADING_MS) await wait(MIN_LOADING_MS - elapsed);

        setResult({ image: getDownloadUrl(data.final_as), jobId });
      }
    } catch (err) {
      console.error(err);
      const isNetworkFailure = /failed to fetch|networkerror|load failed/i.test(
        err.message || "",
      );
      setError(
        isNetworkFailure
          ? "We couldn't reach the try-on server for this combination. Please try again in a moment, or try a different item."
          : err.message || "Something went wrong while generating your try-on.",
      );
    } finally {
      setIsGenerating(false);
      setGpuCountdown(null);
    }
  };

  const handleReset = () => {
    setSelectedGarment(null);
    setOutfitTop(null);
    setOutfitBottom(null);
    setOutfitCoat(null);
    setJustPickedSlot(null);
    setResult(null);
    setError(null);
    setSize("M");
    setModelVariant(0);
  };

  // Dismiss the result screen, go back to the gallery, AND clear the
  // clothing selections back to none — used by both the result screen's
  // "Back" button and the Navbar's cross-wardrobe confirmation. Doesn't
  // touch size/model variant, since those aren't clothing choices (the
  // "Reset" button still exists separately for a full reset including
  // those).
  const handleBackToEdit = () => {
    setResult(null);
    setError(null);
    setSelectedGarment(null);
    setOutfitTop(null);
    setOutfitBottom(null);
    setOutfitCoat(null);
    setJustPickedSlot(null);
  };

  // "Back" on the result screen now asks first too, same as the Navbar's
  // cross-wardrobe prompt — leaving a result behind (and now also
  // clearing the selections) means starting over if they didn't buy it.
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const requestBackToEdit = () => setShowBackConfirm(true);
  const confirmBackToEdit = () => {
    setShowBackConfirm(false);
    handleBackToEdit();
  };

  // Keep the Navbar informed of whether a result is currently showing —
  // it needs this to decide whether clicking "Eastern/Western Wear" for
  // the wardrobe you're already in should ask "go back to the gallery?"
  useEffect(() => {
    setHasActiveResult(!!result);
  }, [result, setHasActiveResult]);

  // The Navbar bumps this after the person confirms leaving their result
  // — same effect as clicking "Back", just triggered from outside this
  // page. Skips the very first render (signal starts at 0) so mounting
  // the page doesn't immediately "go back" to nothing.
  const isFirstBackSignal = useState(backToGallerySignal)[0];
  useEffect(() => {
    if (backToGallerySignal !== isFirstBackSignal) {
      handleBackToEdit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backToGallerySignal]);

  const handleDownload = (imageOverride) => {
    const target = imageOverride || result?.image;
    if (!target) return;
    window.open(target, "_blank", "noopener,noreferrer");
  };

  const selectedGarmentId = isWestern
    ? isUpperBodyCategory(activeCategory)
      ? outfitTop?.id
      : outfitBottom?.id
    : selectedGarment?.id;

  // The garments actually purchasable right now — for Eastern this is just
  // the selected garment; for Western it's whichever of top/bottom the user
  // has actually picked (never the silent default), so a single top or a
  // single bottom can be bought on its own. Pairing is only used to satisfy
  // the AI try-on pipeline, never to force a purchase.
  const purchasableItems = isWestern
    ? [outfitTop, outfitBottom, outfitCoat].filter(Boolean)
    : [selectedGarment, outfitCoat].filter(Boolean);

  // Real, live-recolorable 3D — exists for Western shirt+pants and
  // polo+pants combos once BOTH pieces are picked together (the model is
  // a combo, not a standalone top). Some specific shirt+pants pairings
  // have their own pre-made, already-correctly-colored file — those load
  // as-is, untouched. Everything else falls back to a generic base model
  // that gets recolored live to match. Falls back further to the
  // video-based approximation (threeDVideos.js) when neither applies,
  // handled inside ModelPreview and ResultScreen themselves.
  const outfitTopCategory = outfitTop?.id.startsWith("polo")
    ? "polo-shirts"
    : outfitTop?.id.startsWith("shirt")
      ? "shirts"
      : null;
  const glbCombo =
    isWestern && outfitTop && outfitBottom
      ? getGLBCombo(outfitTopCategory, outfitTop.id, outfitBottom.id)
      : null;
  const glbComboSrc = glbCombo?.src || null;
  const glbTopColor =
    glbCombo?.needsColor && outfitTop ? colorNameToHex(outfitTop.name) : null;
  const glbBottomColor =
    glbCombo?.needsColor && outfitBottom
      ? colorNameToHex(outfitBottom.name)
      : null;

  return (
    <div className="mx-auto max-w-[1600px] px-4 pb-24 pt-28 lg:px-8 lg:pt-32">
      <div className="mb-10 text-center sm:text-left">
        <p className="text-xs font-semibold tracking-widest2 text-gold">
          FITTING ROOM
        </p>
        <h1 className="mt-3 font-display text-3xl text-charcoal dark:text-cream sm:text-4xl">
          Build your virtual try-on
        </h1>
        <p className="mt-2 max-w-xl text-sm text-charcoal/60 dark:text-cream/60">
          {isWestern
            ? "Pick a top and a bottom to build a complete outfit, then generate your look."
            : "Choose a category, select a garment, then generate your look."}
        </p>
      </div>

      {isGenerating ? (
        <Loading
          message={stageMessage || "Generating your virtual try-on..."}
        />
      ) : error ? (
        <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center shadow-soft dark:bg-white/[0.03]">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A2 2 0 0 0 3.82 21h16.36a2 2 0 0 0 1.71-3l-8.18-14.14a2 2 0 0 0-3.42 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <h3 className="mt-4 font-display text-xl text-charcoal dark:text-cream">
            Try-on failed
          </h3>
          <p className="mt-2 text-sm text-charcoal/60 dark:text-cream/60">
            {error}
          </p>
          <p className="mt-1 text-xs text-charcoal/40 dark:text-cream/40">
            Make sure the backend server is running and reachable.
          </p>
          <button
            onClick={() => setError(null)}
            className="focus-ring mt-6 rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-cream transition-colors duration-200 hover:bg-charcoal/90 dark:bg-[linear-gradient(90deg,#C79B4E,#D8B36A)] dark:text-charcoal dark:hover:bg-[linear-gradient(90deg,#D8B36A,#E5C98B)]"
          >
            Try Again
          </button>
        </div>
      ) : result ? (
        <ResultScreen
          garment={{
            name: previewGarmentName,
            price: previewGarmentPrice,
            image: isWestern ? effectiveTop.image : selectedGarment?.image,
          }}
          pairingGarment={
            isWestern
              ? {
                  name: effectiveTop.name,
                  price: effectiveTop.price,
                  image: effectiveTop.image,
                }
              : null
          }
          category={activeCategory}
          purchasableItems={purchasableItems}
          style={style}
          size={size}
          modelVariant={effectiveModelVariant}
          resultImage={result.image}
          resultAngles={result.angles}
          onDownload={handleDownload}
          onGenerateAgain={handleReset}
          onBack={requestBackToEdit}
          coatOptions={[]}
          selectedCoat={outfitCoat}
          onRemoveCoat={handleRemoveCoat}
          onSelectSuggestedCoat={handleSelectCoatOnResult}
          glbComboSrc={glbComboSrc}
          glbTopColor={glbTopColor}
          glbBottomColor={glbBottomColor}
        />
      ) : (
        <>
          {isWestern && (
            <div className="mb-6 rounded-2xl border border-gold/20 bg-gold/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold tracking-widest2 text-charcoal/50 dark:text-cream/50">
                  SELECTED ITEMS
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => jumpToCategory("shirts")}
                    className="focus-ring rounded-full border border-charcoal/15 bg-white px-4 py-1.5 text-xs font-semibold text-charcoal/70 transition-colors duration-200 hover:border-gold hover:text-gold dark:border-white/15 dark:bg-white/5 dark:text-cream/70"
                  >
                    Choose Top
                  </button>
                  <button
                    onClick={() => jumpToCategory("pants")}
                    className="focus-ring rounded-full border border-charcoal/15 bg-white px-4 py-1.5 text-xs font-semibold text-charcoal/70 transition-colors duration-200 hover:border-gold hover:text-gold dark:border-white/15 dark:bg-white/5 dark:text-cream/70"
                  >
                    Choose Bottom
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {[
                  {
                    label: "Shirt",
                    item: outfitTop,
                    onRemove: () => setOutfitTop(null),
                  },
                  {
                    label: "Trouser",
                    item: outfitBottom,
                    onRemove: () => setOutfitBottom(null),
                  },
                  {
                    label: "Coat",
                    item: outfitCoat,
                    onRemove: handleRemoveCoat,
                  },
                ].map(({ label, item, onRemove }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5 dark:bg-white/[0.04]"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                          item
                            ? "bg-gold/20 text-gold"
                            : "bg-charcoal/10 text-charcoal/30 dark:bg-white/10 dark:text-cream/30"
                        }`}
                      >
                        {item ? "✓" : "–"}
                      </span>
                      <span
                        className={`text-sm ${
                          item
                            ? "font-semibold text-charcoal dark:text-cream"
                            : "text-charcoal/40 dark:text-cream/40"
                        }`}
                      >
                        {item
                          ? item.name
                          : `No ${label.toLowerCase()} selected`}
                      </span>
                    </div>
                    {item && (
                      <button
                        onClick={onRemove}
                        aria-label={`Remove ${label}`}
                        className="focus-ring flex h-6 w-6 items-center justify-center rounded-full text-charcoal/40 transition-colors duration-200 hover:bg-red-50 hover:text-red-500 dark:text-cream/40 dark:hover:bg-red-500/10"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <p className="mt-3 text-xs text-charcoal/40 dark:text-cream/40">
                Try on just one piece and the other will show as whatever the
                model's wearing in that photo — not something you're buying. A
                coat is entirely optional too.
              </p>
            </div>
          )}

          {isWestern && justPickedSlot === "top" && !outfitBottom && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-charcoal px-5 py-4 text-cream animate-fadeIn dark:bg-white/10">
              <p className="text-sm">
                Nice pick. Choose a bottom too, or we'll show it on its own
                (you'll see the model's own pants in the photo, but that's just
                how it was shot — not something you're buying).
              </p>
              <button
                onClick={() => jumpToCategory("pants")}
                className="focus-ring btn-gold rounded-full px-4 py-2 text-xs font-semibold text-charcoal transition-colors duration-200"
              >
                Browse Pants →
              </button>
            </div>
          )}
          {isWestern && justPickedSlot === "bottom" && !outfitTop && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-charcoal px-5 py-4 text-cream animate-fadeIn dark:bg-white/10">
              <p className="text-sm">
                Great choice. Pick a top too, or we'll show it on its own
                (you'll see the model's own top in the photo, but that's just
                how it was shot — not something you're buying).
              </p>
              <button
                onClick={() => jumpToCategory("shirts")}
                className="focus-ring btn-gold rounded-full px-4 py-2 text-xs font-semibold text-charcoal transition-colors duration-200"
              >
                Browse Shirts →
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr_440px]">
            <CategorySidebar
              activeCategory={activeCategory}
              onSelectCategory={handleStyleCategory}
            />
            <GarmentGallery
              categoryId={activeCategory}
              style={style}
              selectedGarmentId={selectedGarmentId}
              onSelectGarment={handleSelectGarment}
              onSelectCategory={handleStyleCategory}
            />
            <ModelPreview
              className="md:col-span-2 lg:col-span-1"
              selectedGarment={
                isWestern
                  ? { name: previewGarmentName, price: previewGarmentPrice }
                  : selectedGarment
              }
              purchasableItems={purchasableItems}
              size={size}
              modelVariant={effectiveModelVariant}
              onChangeSize={handleChangeSize}
              onChangeModel={undefined}
              onTryOn={requestTryOn}
              onReset={handleReset}
              onDownload={handleDownload}
              isGenerating={isGenerating}
              resultImage={result?.image}
              readyToTryOn={canTryOn}
              selectedCoat={outfitCoat}
              onRemoveCoat={handleRemoveCoat}
              category={activeCategory}
            />
          </div>
        </>
      )}

      <ConfirmModal
        open={showPantsPrompt}
        title="Choose pants for this look?"
        description="Pick a pair to pair with your top, or skip and see it on its own."
        confirmLabel="Yes, choose pants"
        cancelLabel="No, skip"
        onConfirm={handlePantsPromptYes}
        onCancel={handlePantsPromptNo}
      />

      <PantsPickerModal
        open={showPantsPicker}
        onSelect={handlePantsPicked}
        onSkip={handlePantsPickerSkip}
        onClose={handlePantsPickerSkip}
      />

      <ConfirmModal
        open={showShirtPrompt}
        title="Choose a top for this look?"
        description="Pick a shirt, polo, or sweatshirt to pair with your pants, or skip and see it on its own."
        confirmLabel="Yes, choose a top"
        cancelLabel="No, skip"
        onConfirm={handleShirtPromptYes}
        onCancel={handleShirtPromptNo}
      />

      <TopPickerModal
        open={showShirtPicker}
        onSelect={handleTopPicked}
        onSkip={handleShirtPickerSkip}
        onClose={handleShirtPickerSkip}
      />

      <ConfirmModal
        open={showCoatPrompt}
        title="Add a coat to complete the look?"
        description="You can pick one from a few matching options, or skip straight to your try-on."
        confirmLabel="Yes, choose a coat"
        cancelLabel="No, skip"
        onConfirm={handleCoatPromptYes}
        onCancel={handleCoatPromptNo}
      />

      <CoatPickerModal
        open={showCoatPicker}
        style={style}
        onSelect={handleCoatPicked}
        onSkip={handleCoatPickerSkip}
        onClose={handleCoatPickerSkip}
      />

      <GenerationModeModal
        open={showConfirmModal}
        gpuAvailable={isWestern || isEasternBackendConfigured()}
        onSelectInstant={() => runTryOn("instant")}
        onSelectGPU={() => runTryOn("gpu")}
        onCancel={() => setShowConfirmModal(false)}
      />

      <ConfirmModal
        open={showBackConfirm}
        title="Go back to the gallery?"
        description="You haven't added this to your cart yet — going back clears your current selections, so you'll need to pick everything again."
        confirmLabel="Yes, go back"
        cancelLabel="Stay here"
        onConfirm={confirmBackToEdit}
        onCancel={() => setShowBackConfirm(false)}
      />
    </div>
  );
}
