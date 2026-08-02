import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

// React Router doesn't reset scroll position on navigation by default —
// without this, switching pages via the navbar keeps whatever scroll
// position you were at on the previous page. Mounted once near the root,
// below <Routes>, so every route change scrolls back to the top.
export default function ScrollToTop() {
  const { pathname, key } = useLocation();

  useLayoutEffect(() => {
    // Setting scrollTop directly (rather than window.scrollTo) skips the
    // site's global `scroll-behavior: smooth` CSS, so this is an instant
    // jump to the top rather than an animated scroll. useLayoutEffect
    // (rather than useEffect) runs before the browser paints, so there's
    // no visible flash of the old scroll position on the new page.
    // Depending on `key` (not just `pathname`) also covers navigating to
    // the same path again (e.g. clicking a nav link while already there).
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [pathname, key]);

  return null;
}
