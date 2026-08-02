export default function Footer() {
  return (
    <footer className="mt-24 border-t border-charcoal/10 bg-white/40 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="mx-auto max-w-[1600px] px-4 py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-lg tracking-widest2 text-charcoal dark:text-cream">
                LIBAS-E-NAZAR
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              <span className="text-xs font-semibold tracking-widest2 text-gold">
                AI TRY-ON
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-charcoal/60 dark:text-cream/60">
              An AI-assisted, pose-aware virtual garment preview system for
              men's Eastern and Western wardrobes — built as a Final Year
              Project.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest2 text-charcoal/40 dark:text-cream/40">
              PROJECT
            </p>
            <ul className="mt-4 space-y-2 text-sm text-charcoal/70 dark:text-cream/70">
              <li>AI-Assisted Pose-Aware Virtual Garment Preview System</li>
              <li>Final Year Project · 2026</li>
              <li>Computer Vision &amp; Pose Estimation</li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest2 text-charcoal/40 dark:text-cream/40">
              UNIVERSITY
            </p>
            <ul className="mt-4 space-y-2 text-sm text-charcoal/70 dark:text-cream/70">
              <li>Department of Computer Science</li>
              <li>Faculty of Information Technology</li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest2 text-charcoal/40 dark:text-cream/40">
              DEVELOPER TEAM
            </p>
            <ul className="mt-4 space-y-2 text-sm text-charcoal/70 dark:text-cream/70">
              <li>Team Lead &amp; Full-Stack Developer</li>
              <li>AI / Computer Vision Engineer</li>
              <li>UI / UX Designer</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-charcoal/10 pt-6 dark:border-white/10 sm:flex-row">
          <p className="text-xs text-charcoal/50 dark:text-cream/50">
            © {new Date().getFullYear()} Libas-e-Nazar. All rights reserved.
          </p>
          <p className="text-xs text-charcoal/40 dark:text-cream/40">
            Built with React, Vite &amp; Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}
