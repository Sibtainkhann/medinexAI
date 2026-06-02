function MedinexLogo({ size = 34, className = "", style = {} }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ color:"#00D4AA", ...style }}
    >
      {/* ── grid lines ── */}
      {/* verticals */}
      <line x1="22" y1="8"  x2="22" y2="92" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.35"/>
      <line x1="38" y1="4"  x2="38" y2="96" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.35"/>
      <line x1="62" y1="4"  x2="62" y2="96" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.35"/>
      <line x1="78" y1="8"  x2="78" y2="92" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.35"/>
      {/* horizontals */}
      <line x1="8"  y1="22" x2="92" y2="22" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.35"/>
      <line x1="4"  y1="38" x2="96" y2="38" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.35"/>
      <line x1="4"  y1="62" x2="96" y2="62" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.35"/>
      <line x1="8"  y1="78" x2="92" y2="78" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.35"/>

      {/* ── S-curve / DNA interweave path ── */}
      <path
        d="
          M 14 50
          C 14 36, 26 26, 38 26
          C 50 26, 50 38, 62 38
          C 74 38, 86 28, 86 38
          C 86 50, 74 50, 62 50
          C 50 50, 50 62, 38 62
          C 26 62, 14 72, 14 62
          C 14 50, 14 50, 14 50
        "
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.6"
      />
      <path
        d="
          M 14 38
          C 14 28, 26 22, 38 22
          C 50 22, 62 22, 62 38
          C 62 50, 50 50, 50 50
          C 50 50, 38 50, 38 62
          C 38 74, 50 78, 62 78
          C 74 78, 86 72, 86 62
        "
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="1"
      />

      {/* ── accent dots ── */}
      <circle cx="66" cy="30" r="4.5" fill="currentColor" fillOpacity="0.9"/>
      <circle cx="30" cy="72" r="4.5" fill="currentColor" fillOpacity="0.9"/>
    </svg>
  );
}

export default MedinexLogo;
