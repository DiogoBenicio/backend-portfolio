export function OpenMeteoLogo({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-label="Open-Meteo"
    >
      {/* Cloud body */}
      <ellipse cx="34" cy="40" rx="22" ry="13" fill="#93c5fd" />
      <ellipse cx="24" cy="38" rx="12" ry="10" fill="#bfdbfe" />
      <ellipse cx="44" cy="37" rx="10" ry="9" fill="#bfdbfe" />
      {/* Sun */}
      <circle cx="22" cy="22" r="10" fill="#fbbf24" />
      {/* Sun rays */}
      <line x1="22" y1="8"  x2="22" y2="5"  stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="22" y1="36" x2="22" y2="39" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="8"  y1="22" x2="5"  y2="22" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="36" y1="22" x2="39" y2="22" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="11" y1="11" x2="9"  y2="9"  stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="33" y1="33" x2="35" y2="35" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="33" y1="11" x2="35" y2="9"  stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="11" y1="33" x2="9"  y2="35" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}
