import { useState, useEffect } from "react";
import ConfidenceArc from "../components/ConfidenceArc";
import BarChart from "../components/BarChart";

function ResultPage({ result, setActivePage, setResult, setInputVal }) {
  const [show, setShow] = useState(false);
  useEffect(() => { setTimeout(() => setShow(true), 60); }, []);
  const sStyle = (i) => ({ opacity: show ? 1 : 0, transform: show ? "translateY(0)" : "translateY(22px)", transition: `opacity 0.55s ease ${i * 90}ms, transform 0.55s ease ${i * 90}ms` });

  return (
    <section style={{ padding:"56px clamp(20px,5vw,72px) 100px" }}>
      <div style={{ maxWidth:1060, margin:"0 auto" }}>
        <div style={{ ...sStyle(0), display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:36 }}>
          <button onClick={() => { setActivePage("checker"); setResult(null); setInputVal(""); }}
            style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.08)", color:"#6B7A99", padding:"8px 20px", borderRadius:50, cursor:"pointer", fontSize:13, fontFamily:"inherit", transition:"all 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.color="#F0F4FF"}
            onMouseLeave={e=>e.currentTarget.style.color="#6B7A99"}>
            ← New Analysis
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(0,212,170,0.07)", border:"1px solid rgba(0,212,170,0.15)", borderRadius:50, padding:"8px 18px" }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:"#00D4AA", display:"inline-block", animation:"pulse-dot 2s infinite" }} />
            <span style={{ fontSize:13, color:"#00D4AA", fontWeight:600 }}>Analysis complete</span>
          </div>
        </div>

        {/* EMERGENCY BANNER */}
        {result.isEmergency && (
          <div style={{ ...sStyle(0.5), background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", borderRadius:16, padding:"18px 24px", marginBottom:20, display:"flex", gap:14, alignItems:"flex-start" }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ flexShrink:0, marginTop:1 }}><path d="M11 2L1 20h20L11 2z" stroke="#EF4444" strokeWidth="2" strokeLinejoin="round"/><path d="M11 9v5M11 16.5h.01" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/></svg>
            <div>
              <p style={{ fontSize:15, fontWeight:700, color:"#EF4444", marginBottom:4 }}>⚠️ EMERGENCY — Immediate Medical Attention Required</p>
              <p style={{ fontSize:13, color:"rgba(239,68,68,0.8)", lineHeight:1.65, margin:0 }}>
                This condition may require urgent medical intervention. Please call emergency services (102 / 108) or visit the nearest hospital immediately. Do not delay seeking professional help.
              </p>
            </div>
          </div>
        )}

        {/* LOW CONFIDENCE BANNER */}
        {result.confidence < 60 && (
          <div style={{ ...sStyle(0.8), background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:16, padding:"16px 20px", marginBottom:20, display:"flex", gap:12, alignItems:"flex-start" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0, marginTop:1 }}><path d="M12 9v4m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <div>
              <p style={{ fontSize:14, fontWeight:600, color:"#F59E0B", marginBottom:2, marginTop:0 }}>Low Confidence Alert</p>
              <p style={{ fontSize:12.5, color:"rgba(245,158,11,0.8)", lineHeight:1.6, margin:0 }}>
                This assessment is based on limited symptom indicators (Confidence: {result.confidence}%). For a more precise assessment, please try adding more symptoms or describing your condition in greater detail.
              </p>
            </div>
          </div>
        )}

        {/* HERO RESULT */}
        <div style={{ ...sStyle(1), background:"rgba(10,15,24,0.95)", border:"1px solid rgba(0,212,170,0.12)", borderRadius:24, padding:"36px 40px", marginBottom:20, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent 10%,#00D4AA 50%,transparent 90%)" }} />
          <div style={{ position:"absolute", top:"-60%", right:"-10%", width:"40%", height:"200%", background:"radial-gradient(ellipse,rgba(0,212,170,0.04) 0%,transparent 60%)", pointerEvents:"none" }} />
          <div className="result-top" style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:32, position:"relative", zIndex:1 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, color:"rgba(107,122,153,0.8)", fontWeight:600, letterSpacing:"0.09em", textTransform:"uppercase", marginBottom:10 }}>Primary Diagnosis</div>
              <h2 style={{ fontSize:"clamp(28px,3.5vw,46px)", fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.08, marginBottom:18, color:"#F0F4FF" }}>{result.disease}</h2>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, flexWrap:"wrap" }}>
                <span style={{ background:result.severityBg, border:`1px solid ${result.severityBorder}`, color:result.severityColor, fontSize:11, fontWeight:700, padding:"5px 14px", borderRadius:50, letterSpacing:"0.07em", textTransform:"uppercase" }}>{result.severity} Severity</span>
              </div>
              <p style={{ fontSize:15, color:"#8A94A8", lineHeight:1.75, maxWidth:480 }}>{result.description}</p>
            </div>
            <div style={{ flexShrink:0 }}><ConfidenceArc value={result.confidence} /></div>
          </div>
        </div>

        <div className="result-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:18, marginBottom:18 }}>
          <div style={{ ...sStyle(2) }} className="result-panel">
            <div style={{ fontSize:11, color:"rgba(107,122,153,0.7)", fontWeight:600, letterSpacing:"0.09em", textTransform:"uppercase", marginBottom:18 }}>Detected Symptoms</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {result.symptoms.map((s, i) => (
                <div key={s.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", animation:`step-appear 0.35s ease ${i*80}ms both` }}>
                  <span className="symptom-pill">{s.name}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:52, height:3, background:"rgba(255,255,255,0.06)", borderRadius:2, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${s.weight}%`, background:"linear-gradient(90deg,#3B8BFF,#00D4AA)", borderRadius:2, transition:`width 1s ease ${i*100}ms` }} />
                    </div>
                    <span style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:"rgba(107,122,153,0.7)", minWidth:28 }}>{s.weight}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...sStyle(3) }} className="result-panel">
            <div style={{ fontSize:11, color:"rgba(107,122,153,0.7)", fontWeight:600, letterSpacing:"0.09em", textTransform:"uppercase", marginBottom:18 }}>Differential Analysis</div>
            <BarChart diseases={result.matchedDiseases} />
            <div style={{ marginTop:18, paddingTop:16, borderTop:"1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize:12, color:"rgba(107,122,153,0.6)", lineHeight:1.6 }}>Top match based on symptom cluster overlap and pattern frequency.</div>
            </div>
          </div>

          <div style={{ ...sStyle(4) }} className="result-panel">
            <div style={{ fontSize:11, color:"rgba(107,122,153,0.7)", fontWeight:600, letterSpacing:"0.09em", textTransform:"uppercase", marginBottom:18 }}>Recommended Precautions</div>
            {result.precautions.map((p, i) => (
              <div className="precaution-row" key={i} style={{ animation:`step-appear 0.35s ease ${i*80}ms both` }}>
                <div style={{ width:24, height:24, borderRadius:"50%", background:"rgba(0,212,170,0.1)", border:"1px solid rgba(0,212,170,0.2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1.5 5.5L4 8l4.5-5.5" stroke="#00D4AA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span style={{ fontSize:13, color:"#8A94A8", lineHeight:1.65 }}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...sStyle(5), background:"rgba(245,158,11,0.05)", border:"1px solid rgba(245,158,11,0.14)", borderRadius:16, padding:"18px 24px", display:"flex", gap:14, alignItems:"flex-start" }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink:0, marginTop:1 }}><path d="M9 2L1 16h16L9 2z" stroke="#F59E0B" strokeWidth="1.5" strokeLinejoin="round"/><path d="M9 8v4M9 14h.01" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <p style={{ fontSize:13, color:"rgba(245,158,11,0.75)", lineHeight:1.7, margin:0 }}>
            <strong style={{ color:"#F59E0B" }}>Medical disclaimer:</strong> This is an AI-generated analysis for informational purposes only. It does not constitute a medical diagnosis. Always consult a qualified healthcare professional before making health decisions.
          </p>
        </div>

        <div style={{ ...sStyle(6), textAlign:"center", marginTop:40 }}>
          <button className="btn-ghost" style={{ padding:"14px 40px", fontSize:15 }} onClick={() => { setActivePage("checker"); setResult(null); setInputVal(""); }}>
            Check Again →
          </button>
        </div>
      </div>
    </section>
  );
}

export default ResultPage;
