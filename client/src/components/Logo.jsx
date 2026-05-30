// DOMS brand mark — a depot haulage truck in a rounded brand-green badge.
// Self-contained (own background gradient) so it works on any surface.
export default function Logo({ size = 36, className = "", rounded = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="DOMS"
      className={className}
    >
      <defs>
        <linearGradient id="domsbg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#127A52" />
          <stop offset="1" stopColor="#0B4D34" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx={rounded} fill="url(#domsbg)" />
      {/* motion lines */}
      <g stroke="#F4B740" strokeWidth="2.4" strokeLinecap="round">
        <path d="M5 25h7" />
        <path d="M4 30.5h6" />
        <path d="M6 36h6" />
      </g>
      {/* trailer + cab */}
      <rect x="13" y="21" width="24" height="15" rx="2.6" fill="#ffffff" />
      <path d="M37 36V27h7l6 5v4z" fill="#ffffff" />
      <rect x="40" y="29" width="3.4" height="3" rx="0.6" fill="#0B4D34" />
      {/* wheels */}
      <circle cx="21" cy="38" r="4.2" fill="#ffffff" />
      <circle cx="44" cy="38" r="4.2" fill="#ffffff" />
      <circle cx="21" cy="38" r="1.9" fill="#0B4D34" />
      <circle cx="44" cy="38" r="1.9" fill="#0B4D34" />
    </svg>
  );
}
