function ConfidenceArc({ value }) {
  const size = 160;
  const cx = size / 2, cy = size / 2, r = 62;
  const startAngle = -210, endAngle = 30;
  const totalArc = endAngle - startAngle;
  const filled = (value / 100) * totalArc;
  const toRad = deg => (deg * Math.PI) / 180;
  const arcPath = (start, end) => {
    const x1 = cx + r * Math.cos(toRad(start));
    const y1 = cy + r * Math.sin(toRad(start));
    const x2 = cx + r * Math.cos(toRad(end));
    const y2 = cy + r * Math.sin(toRad(end));
    const large = end - start > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
        <path d={arcPath(startAngle, endAngle)} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" strokeLinecap="round" />
        <path d={arcPath(startAngle, startAngle + filled)} fill="none" stroke="url(#arcGrad)" strokeWidth="10" strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 8px rgba(0,212,170,0.6))", transition: "all 1.4s cubic-bezier(0.34,1.56,0.64,1)" }} />
        <defs>
          <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B8BFF" />
            <stop offset="100%" stopColor="#00D4AA" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 8 }}>
        <div style={{ fontSize: 34, fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", background: "linear-gradient(135deg,#00D4AA,#3B8BFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>{value}%</div>
        <div style={{ fontSize: 11, color: "#6B7A99", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 4 }}>confidence</div>
      </div>
    </div>
  );
}

export default ConfidenceArc;
