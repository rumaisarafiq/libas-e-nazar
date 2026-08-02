// A tasteful stand-in for real photography: a soft gradient swatch with a
// garment silhouette line-icon, so the UI never shows a broken image or a
// generic grey box while real assets are pending.

const SILHOUETTES = {
  kurta: 'M12 3c1 1.5 2.2 2 4 2s3-.5 4-2l3 3-2 2v14H11V8L9 6l3-3z',
  sherwani: 'M12 2c1 2 2.4 2.8 4.5 2.8S20 4 21 2l2 3-2.5 2V21H5.5V7L3 5l2-3c1 2 2.4 2.8 4.5 2.8S11 4 12 2z',
  shirt: 'M8 3 4 6l2 3v12h12V9l2-3-4-3-2 2h-4L8 3z',
  polo: 'M9 3 5 6l2 3v11h10V9l2-3-4-3-1.5 1.5h-3L9 3z',
  pants: 'M6 2h12l1 8-1 12h-4l-1-9-1 9H8L7 10 6 2z',
  waistcoat: 'M8 3h8l2 4-2 2v12H8V9L6 7l2-4z',
  default: 'M9 3h6l4 4-3 3v11H8V10L5 7l4-4z',
}

function pickSilhouette(name = '') {
  const key = name.toLowerCase()
  if (key.includes('sherwani')) return SILHOUETTES.sherwani
  if (key.includes('kurta')) return SILHOUETTES.kurta
  if (key.includes('polo')) return SILHOUETTES.polo
  if (key.includes('shirt')) return SILHOUETTES.shirt
  if (key.includes('waistcoat')) return SILHOUETTES.waistcoat
  if (key.includes('pant') || key.includes('corduroy')) return SILHOUETTES.pants
  return SILHOUETTES.default
}

export default function PlaceholderArt({ label = '', className = '', variant = 'card' }) {
  const path = pickSilhouette(label)
  const gradients = {
    card: 'from-beige/70 via-cream to-gold/20',
    hero: 'from-gold/25 via-cream to-beige/40',
    model: 'from-charcoal/5 via-beige/30 to-gold/15',
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${gradients[variant] || gradients.card} dark:from-white/5 dark:via-white/[0.02] dark:to-gold/10 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-1/3 h-1/3 text-charcoal/20 dark:text-white/15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <path d={path} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_1px_1px,#2D2D2D_1px,transparent_0)] [background-size:16px_16px]" />
    </div>
  )
}
