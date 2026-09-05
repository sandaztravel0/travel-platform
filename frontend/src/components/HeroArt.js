// A hand-built illustration of a hill-country road at sunrise — tea terraces,
// a palm silhouette, and a tuk-tuk on the road. Keeps the homepage from
// opening on a generic gradient block, and ties directly to the subject matter.
export default function HeroArt() {
  return (
    <svg className="hero-art" viewBox="0 0 480 420" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustration of a hill-country road in Sri Lanka">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F2A93B" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#F3F6F1" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="480" height="420" fill="url(#sky)" />
      <circle cx="120" cy="120" r="52" fill="#F2A93B" opacity="0.85" />

      {/* Distant hills */}
      <path d="M0 260 Q80 210 160 250 T320 240 T480 255 V420 H0 Z" fill="#B9CBBE" />
      {/* Tea terrace mid-ground, banded to suggest terracing */}
      <path d="M0 300 Q100 265 220 290 T480 285 V420 H0 Z" fill="#5C8672" />
      <path d="M0 330 Q100 305 220 320 T480 315 V420 H0 Z" fill="#3C6E56" />
      <path d="M0 365 Q120 345 240 358 T480 352 V420 H0 Z" fill="#0B3D2E" />

      {/* Palm silhouette */}
      <g transform="translate(372,150)">
        <rect x="-4" y="0" width="8" height="130" rx="3" fill="#082C21" />
        <path d="M0 0 C -40 -8 -60 -34 -66 -54 C -40 -46 -12 -28 0 8 Z" fill="#0B3D2E" />
        <path d="M0 0 C 40 -10 62 -30 70 -50 C 42 -40 14 -22 0 8 Z" fill="#0B3D2E" />
        <path d="M0 -2 C -30 -22 -34 -46 -30 -66 C -14 -46 -4 -24 0 4 Z" fill="#114B5F" />
        <path d="M0 -2 C 32 -18 40 -42 38 -62 C 18 -44 6 -22 0 4 Z" fill="#114B5F" />
      </g>

      {/* Road */}
      <path d="M40 420 C 120 340 180 340 220 300 C 250 270 300 270 340 300 C 380 330 430 340 480 320 V420 Z" fill="#E4DCC6" />
      <path d="M180 366 l10 -8 M230 340 l10 -8 M290 330 l10 -6" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.7" />

      {/* Tuk-tuk */}
      <g transform="translate(215,318)">
        <rect x="0" y="-28" width="46" height="28" rx="10" fill="#F2A93B" />
        <rect x="-10" y="-20" width="14" height="20" rx="6" fill="#D9911F" />
        <circle cx="6" cy="4" r="8" fill="#16211C" />
        <circle cx="38" cy="4" r="8" fill="#16211C" />
        <rect x="18" y="-40" width="4" height="14" fill="#16211C" />
      </g>
    </svg>
  );
}
