import { createContext, useContext, useState } from "react";

const WardrobeContext = createContext(null);

export function WardrobeProvider({ children }) {
  const [style, setStyle] = useState("eastern"); // 'eastern' | 'western'
  // Set by the Navbar's search suggestions (or Enter) when the person
  // picks a category word (e.g. "Kurta") — the Try-On page watches this
  // and switches straight to that category, then clears it.
  // { categoryId } | null
  const [pendingCategory, setPendingCategory] = useState(null);

  // Lets the Navbar know whether a try-on result is currently on screen —
  // clicking "Western Wear"/"Eastern Wear" for the wardrobe you're
  // already in doesn't normally navigate anywhere (same route, same
  // style), so without this the click would silently do nothing. Kept in
  // sync by the Try-On page itself.
  const [hasActiveResult, setHasActiveResult] = useState(false);

  // A simple counter the Navbar bumps (after the person confirms) to ask
  // the Try-On page to clear its current result and go back to the
  // gallery — a signal rather than a direct function reference, so
  // neither side needs to import the other.
  const [backToGallerySignal, setBackToGallerySignal] = useState(0);
  const requestBackToGallery = () => setBackToGallerySignal((n) => n + 1);

  return (
    <WardrobeContext.Provider
      value={{
        style,
        setStyle,
        pendingCategory,
        setPendingCategory,
        hasActiveResult,
        setHasActiveResult,
        backToGallerySignal,
        requestBackToGallery,
      }}
    >
      {children}
    </WardrobeContext.Provider>
  );
}

export function useWardrobe() {
  const ctx = useContext(WardrobeContext);
  if (!ctx) throw new Error("useWardrobe must be used within WardrobeProvider");
  return ctx;
}
