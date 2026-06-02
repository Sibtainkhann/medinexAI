import FadeIn from "../components/FadeIn";
import DottedSurface from "../components/DottedSurface";
import AnimatedPlaceholder from "../components/AnimatedPlaceholder";

const PLACEHOLDER_CYCLE = [
  "I've had a throbbing headache and high fever since yesterday...",
  "My stomach hurts badly and I keep feeling nauseous...",
  "Sore throat, body chills and extreme fatigue since morning...",
  "Sharp chest tightness with shortness of breath...",
  "Skin rash spreading with itching and mild fever...",
];

function CheckerPage({ inputVal, setInputVal, inputFocused, setInputFocused, analyzing, analysisStep, ANALYSIS_STEPS, handleAnalyze, error }) {
  const suggestions = [
    "I have fever and severe body pain",
    "Feeling dizzy and very nauseous",
    "Sore throat with headache",
    "Chest pain and short of breath",
  ];

  return (
    <section style={{ minHeight:"92vh", padding:"64px clamp(20px,5vw,72px)", display:"flex", alignItems:"center", position:"relative", overflow:"hidden" }}>

      {/* ── DOTTED SURFACE LAYER ── */}
      <DottedSurface />

      {/* Top vignette */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:"30%",
        background:"linear-gradient(to bottom, #06090F 0%, transparent 100%)",
        pointerEvents:"none", zIndex:1,
      }} />
      {/* Bottom vignette */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0, height:"30%",
        background:"linear-gradient(to top, #06090F 0%, transparent 100%)",
        pointerEvents:"none", zIndex:1,
      }} />
      {/* Side vignettes */}
      <div style={{
        position:"absolute", inset:0,
        background:"radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, #06090F 100%)",
        pointerEvents:"none", zIndex:1,
      }} />

      {/* Content */}
      <div style={{ maxWidth:760, width:"100%", margin:"0 auto", position:"relative", zIndex:2 }}>
        <FadeIn>
          <div style={{ marginBottom:52, textAlign:"center" }}>
            <div style={{ fontSize:11, color:"#00D4AA", fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:14 }}>Symptom Checker</div>
            <h1 style={{ fontSize:"clamp(28px,4vw,46px)", fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.1, marginBottom:14 }}>How are you feeling today?</h1>
            <p style={{ fontSize:16, color:"#6B7A99", lineHeight:1.65 }}>Describe your symptoms naturally. Our AI understands plain language.</p>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div style={{ background:"rgba(10,15,24,0.85)", border:`1px solid ${inputFocused ? "rgba(0,212,170,0.35)" : "rgba(255,255,255,0.06)"}`, borderRadius:24, padding:28, transition:"all 0.3s", boxShadow: inputFocused ? "0 0 0 4px rgba(0,212,170,0.06), 0 24px 60px rgba(0,0,0,0.35)" : "0 20px 50px rgba(0,0,0,0.25)", backdropFilter:"blur(16px)" }}>
            <div style={{ position:"relative", marginBottom:20 }}>
              {!inputVal && (
                <div style={{ position:"absolute", top:22, left:24, fontSize:16, lineHeight:1.65, pointerEvents:"none", zIndex:1 }}>
                  {inputFocused
                    ? <span style={{ color:"rgba(107,122,153,0.45)" }}>Start typing your symptoms...</span>
                    : <AnimatedPlaceholder texts={PLACEHOLDER_CYCLE} />
                  }
                </div>
              )}
              <textarea
                className="sym-textarea"
                rows={5}
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
              />
              <div style={{ position:"absolute", bottom:16, left:24, right:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:12, color:"rgba(107,122,153,0.5)", fontFamily:"'JetBrains Mono',monospace" }}>{inputVal.length} chars</span>
                {inputVal.length > 0 && (
                  <button onClick={() => setInputVal("")} style={{ background:"none", border:"none", color:"rgba(107,122,153,0.5)", cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>clear</button>
                )}
              </div>
            </div>

            {error && (
              <div style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)", borderRadius:12, padding:"12px 16px", marginBottom:16, display:"flex", gap:10, alignItems:"flex-start" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0, marginTop:1 }}><circle cx="8" cy="8" r="7" stroke="#EF4444" strokeWidth="1.5"/><path d="M8 5v3.5M8 10.5h.01" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <span style={{ fontSize:13, color:"rgba(239,68,68,0.85)", lineHeight:1.5 }}>{error}</span>
              </div>
            )}

            {analyzing ? (
              <div style={{ padding:"20px 0" }}>
                <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:20 }}>
                  <div style={{ display:"flex", gap:5 }}>
                    {[0,1,2].map(i => <span key={i} style={{ width:7, height:7, borderRadius:"50%", background:"#00D4AA", display:"inline-block", animation:`blink 1.2s ${i*200}ms infinite` }} />)}
                  </div>
                  <span style={{ fontSize:14, color:"#00D4AA", fontWeight:500 }}>{ANALYSIS_STEPS[analysisStep]}</span>
                </div>
                <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:50, height:3, overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:50, background:"linear-gradient(90deg,#00D4AA,#3B8BFF)", transition:"width 0.5s ease", width:`${((analysisStep + 1) / ANALYSIS_STEPS.length) * 100}%` }} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
                  {ANALYSIS_STEPS.map((step, i) => (
                    <span key={i} style={{ fontSize:10, color: i <= analysisStep ? "#00D4AA" : "rgba(107,122,153,0.4)", transition:"color 0.3s", letterSpacing:"0.04em" }}>{step.replace("...","")}</span>
                  ))}
                </div>
              </div>
            ) : (
              <button
                className="btn-primary"
                style={{ width:"100%", padding:"15px", fontSize:16, opacity: inputVal.trim() ? 1 : 0.45, cursor: inputVal.trim() ? "pointer" : "not-allowed" }}
                onClick={handleAnalyze}
                disabled={!inputVal.trim()}
              >
                Analyze Symptoms →
              </button>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={180}>
          <div style={{ marginTop:30 }}>
            <div style={{ fontSize:12, color:"rgba(107,122,153,0.6)", marginBottom:13, letterSpacing:"0.04em" }}>Quick examples:</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:9 }}>
              {suggestions.map(s => (
                <button key={s} onClick={() => setInputVal(s)}
                  style={{ background:"rgba(12,18,30,0.75)", border:"1px solid rgba(255,255,255,0.07)", color:"#6B7A99", fontSize:13, padding:"8px 17px", borderRadius:50, cursor:"pointer", transition:"all 0.2s", fontFamily:"inherit", backdropFilter:"blur(8px)" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(0,212,170,0.3)"; e.currentTarget.style.color="#C8D0E0"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; e.currentTarget.style.color="#6B7A99"; }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default CheckerPage;
