import { useTheme } from "../context/ThemeContext";

export default function DarkModeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      className="focus-ring relative flex h-9 w-16 items-center rounded-full border border-charcoal/10 bg-white/70 px-1 shadow-inner transition-colors duration-300 dark:border-white/10 dark:bg-white/5"
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full bg-charcoal text-cream shadow-soft transition-transform duration-300 ease-out dark:bg-cream dark:text-charcoal ${
          isDark ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {isDark ? (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M21 12.4A9 9 0 1 1 11.6 3a7 7 0 0 0 9.4 9.4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <circle cx="12" cy="12" r="4.2" />
            <path
              d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
