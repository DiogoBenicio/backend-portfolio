// Elastic official logo mark (simplified SVG)
export function ElasticLogo({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-label="Elasticsearch"
    >
      <path
        d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2z"
        fill="#FEC514"
      />
      <path
        d="M20.5 11.5H11c-.828 0-1.5.672-1.5 1.5v2c0 .828.672 1.5 1.5 1.5h9.5c.828 0 1.5-.672 1.5-1.5V13c0-.828-.672-1.5-1.5-1.5z"
        fill="#00BFB3"
      />
      <path
        d="M21 16.5H11c-.828 0-1.5.672-1.5 1.5v2c0 .828.672 1.5 1.5 1.5h10c.828 0 1.5-.672 1.5-1.5V18c0-.828-.672-1.5-1.5-1.5z"
        fill="#F04E98"
      />
      <path
        d="M10.5 11.5c-.828 0-1.5.672-1.5 1.5v8c0 .828.672 1.5 1.5 1.5S12 21.828 12 21v-8c0-.828-.672-1.5-1.5-1.5z"
        fill="#1BA9F5"
      />
    </svg>
  )
}
