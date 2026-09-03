export default function Logo({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="iqamah-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#12967d" />
          <stop offset="1" stopColor="#0a5347" />
        </linearGradient>
        <linearGradient id="iqamah-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f2cf7e" />
          <stop offset="1" stopColor="#d9a441" />
        </linearGradient>
      </defs>

      <rect width="100" height="100" rx="22" fill="url(#iqamah-bg)" />

      <g fill="#f4faf7">
        <rect x="19" y="46" width="7" height="30" rx="1.5" />
        <polygon points="19,46 26,46 22.5,38" />
        <circle cx="22.5" cy="35.5" r="1.6" />

        <rect x="74" y="46" width="7" height="30" rx="1.5" />
        <polygon points="74,46 81,46 77.5,38" />
        <circle cx="77.5" cy="35.5" r="1.6" />
      </g>

      <rect x="28" y="66" width="44" height="10" rx="1.5" fill="#f4faf7" />

      <path
        d="M32 66 C32 52 38 44 50 44 C62 44 68 52 68 66 Z"
        fill="#f4faf7"
      />
      <path
        d="M50 22 C41 22 37 31 37 38 C37 41.5 42.5 44 50 44 C57.5 44 63 41.5 63 38 C63 31 59 22 50 22 Z"
        fill="#f4faf7"
      />
      <rect x="49" y="14" width="2" height="9" fill="#f4faf7" />
      <circle cx="50" cy="12.5" r="2.4" fill="url(#iqamah-gold)" />

      <path
        d="M46 66 L46 58 C46 54.5 47.8 52 50 52 C52.2 52 54 54.5 54 58 L54 66 Z"
        fill="#0a5347"
      />

      <path
        d="M81 17 a9 9 0 1 0 0.6 15.6 a11.5 11.5 0 1 1 -0.6 -15.6 Z"
        fill="url(#iqamah-gold)"
      />
    </svg>
  );
}
