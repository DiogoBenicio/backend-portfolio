export function OpenWeatherLogo({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-label="OpenWeather"
    >
      {/* Sun */}
      <circle cx="26" cy="24" r="11" fill="#EB6E4B" />
      {/* Sun rays */}
      <line x1="26" y1="8"  x2="26" y2="5"  stroke="#EB6E4B" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="26" y1="40" x2="26" y2="43" stroke="#EB6E4B" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="10" y1="24" x2="7"  y2="24" stroke="#EB6E4B" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="42" y1="24" x2="45" y2="24" stroke="#EB6E4B" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="14" y1="13" x2="12" y2="11" stroke="#EB6E4B" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="38" y1="35" x2="40" y2="37" stroke="#EB6E4B" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="38" y1="13" x2="40" y2="11" stroke="#EB6E4B" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="14" y1="35" x2="12" y2="37" stroke="#EB6E4B" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Cloud */}
      <ellipse cx="38" cy="46" rx="18" ry="11" fill="#f97316" opacity="0.9"/>
      <ellipse cx="27" cy="44" rx="11" ry="9"  fill="#fb923c" />
      <ellipse cx="46" cy="43" rx="9"  ry="8"  fill="#fb923c" />
    </svg>
  )
}
