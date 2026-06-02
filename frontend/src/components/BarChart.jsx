function BarChart({ diseases }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {diseases.map((d, i) => (
        <div key={d.name}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: i === 0 ? "#F0F4FF" : "#6B7A99" }}>{d.name}</span>
            <span style={{ fontSize: 13, fontFamily: "'JetBrains Mono',monospace", color: i === 0 ? "#00D4AA" : "#6B7A99" }}>{d.confidence}%</span>
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 4, width: `${d.confidence}%`, background: i === 0 ? "linear-gradient(90deg,#3B8BFF,#00D4AA)" : "rgba(255,255,255,0.12)", boxShadow: i === 0 ? "0 0 12px rgba(0,212,170,0.4)" : "none", transition: `width 1.2s cubic-bezier(0.34,1.56,0.64,1) ${i * 150}ms` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default BarChart;
