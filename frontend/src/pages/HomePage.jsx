import FadeIn from "../components/FadeIn";
import MedinexLogo from "../components/MedinexLogo";

const FEATURES = [
  { num: "01", title: "Conversational Input", desc: "No dropdowns, no checkboxes. Type exactly how you'd describe it to a friend." },
  { num: "02", title: "NLP Symptom Extraction", desc: "Understands synonyms, informal language and typos — maps to clinical terms." },
  { num: "03", title: "Instant ML Prediction", desc: "Trained on thousands of clinical cases, results return in under a second." },
  { num: "04", title: "Confidence Scoring", desc: "Every result carries a calibrated confidence percentage so you understand certainty." },
  { num: "05", title: "Severity Triage", desc: "Know whether your condition needs urgent attention or routine care." },
  { num: "06", title: "Precaution Plans", desc: "Actionable, condition-specific next steps and care recommendations." },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Describe", body: "Type your symptoms naturally. No structured input required — just plain language." },
  { step: "02", title: "Extract", body: "NLP engine identifies and normalizes every symptom with fuzzy matching." },
  { step: "03", title: "Analyze", body: "ML model cross-references symptom clusters against 132+ disease patterns." },
  { step: "04", title: "Predict", body: "Get your full report — disease, confidence score, severity, and precautions." },
];

function HomePage({ featuresRef, howRef, aboutRef, setActivePage }) {
  return (
    <>
      {/* HERO */}
      <section style={{ position:"relative", minHeight:"92vh", display:"flex", alignItems:"center", padding:"80px clamp(20px,5vw,72px) 60px", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"-30%", right:"-10%", width:"55vw", height:"55vw", borderRadius:"50%", background:"radial-gradient(circle,rgba(59,139,255,0.07) 0%,transparent 65%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"-20%", left:"-8%", width:"50vw", height:"50vw", borderRadius:"50%", background:"radial-gradient(circle,rgba(0,212,170,0.06) 0%,transparent 65%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,0.028) 1px,transparent 1px)", backgroundSize:"30px 30px", pointerEvents:"none" }} />

        <div className="hero-grid" style={{ display:"flex", alignItems:"center", gap:64, width:"100%", maxWidth:1160, margin:"0 auto", position:"relative", zIndex:1 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(0,212,170,0.08)", border:"1px solid rgba(0,212,170,0.18)", borderRadius:50, padding:"6px 16px", marginBottom:32 }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:"#00D4AA", display:"inline-block", animation:"pulse-dot 2s infinite" }} />
              <span style={{ fontSize:12, fontWeight:600, color:"#00D4AA", letterSpacing:"0.06em", textTransform:"uppercase" }}>AI Healthcare Intelligence</span>
            </div>

            <h1 className="hero-h1" style={{ fontSize:"clamp(40px,5vw,68px)", fontWeight:800, lineHeight:1.06, letterSpacing:"-0.035em", marginBottom:24 }}>
              Tell us how you feel.<br />
              <span style={{ background:"linear-gradient(90deg,#00D4AA 0%,#3B8BFF 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                We'll tell you why.
              </span>
            </h1>

            <p style={{ fontSize:18, color:"#6B7A99", lineHeight:1.7, maxWidth:460, marginBottom:40 }}>
              Medinex AI understands natural language. Describe how you feel and our engine extracts symptoms, analyzes patterns, and delivers precise disease predictions.
            </p>

            <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
              <button className="btn-primary" style={{ padding:"15px 36px", fontSize:16 }} onClick={() => { setActivePage("checker"); window.scrollTo({top:0,behavior:"smooth"}); }}>
                Check Symptoms Now
              </button>
              <button className="btn-ghost" style={{ padding:"15px 28px", fontSize:16 }} onClick={() => howRef.current?.scrollIntoView({behavior:"smooth"})}>
                See How It Works
              </button>
            </div>

            <div style={{ display:"flex", gap:36, marginTop:52, flexWrap:"wrap" }}>
              {[["132+","Diseases"], ["< 1s","Analysis"], ["NLP","Powered"]].map(([n,l]) => (
                <div key={l}>
                  <div style={{ fontSize:22, fontWeight:800, color:"#00D4AA", letterSpacing:"-0.02em" }}>{n}</div>
                  <div style={{ fontSize:12, color:"#6B7A99", marginTop:3, letterSpacing:"0.03em" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-mock" style={{ flex:"0 0 380px", animation:"float 5s ease-in-out infinite" }}>
            <div style={{ background:"rgba(12,18,30,0.9)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:24, padding:28, boxShadow:"0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,212,170,0.04), inset 0 1px 0 rgba(255,255,255,0.06)", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:"linear-gradient(90deg,transparent,#00D4AA,transparent)" }} />
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18 }}>
                <div style={{ width:26, height:26, borderRadius:7, background:"linear-gradient(135deg,#054a38,#0a6b52)", border:"1px solid rgba(0,212,170,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <MedinexLogo size={17} style={{ color:"#00D4AA" }} />
                </div>
                <span style={{ fontSize:11, color:"#6B7A99", letterSpacing:"0.08em", textTransform:"uppercase", fontWeight:600 }}>Live preview</span>
              </div>
              <div style={{ background:"rgba(59,139,255,0.07)", border:"1px solid rgba(59,139,255,0.12)", borderRadius:12, padding:"14px 16px", marginBottom:16 }}>
                <div style={{ fontSize:11, color:"rgba(107,122,153,0.8)", marginBottom:5 }}>Patient input</div>
                <div style={{ fontSize:14, color:"#C8D0E0", lineHeight:1.55 }}>"Severe headache and high fever since last night…"</div>
              </div>
              <div style={{ fontSize:11, color:"#6B7A99", marginBottom:10 }}>Extracted symptoms</div>
              <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
                {["headache","fever"].map(s => <span key={s} style={{ background:"rgba(0,212,170,0.1)", border:"1px solid rgba(0,212,170,0.22)", color:"#00D4AA", fontSize:12, padding:"5px 12px", borderRadius:50, fontFamily:"'JetBrains Mono',monospace" }}>{s}</span>)}
              </div>
              <div style={{ background:"rgba(0,212,170,0.05)", border:"1px solid rgba(0,212,170,0.14)", borderRadius:16, padding:"18px 20px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:11, color:"#6B7A99", marginBottom:6 }}>Top prediction</div>
                    <div style={{ fontSize:18, fontWeight:700, color:"#F0F4FF", marginBottom:8 }}>Viral Fever</div>
                    <span style={{ background:"rgba(245,158,11,0.12)", border:"1px solid rgba(245,158,11,0.25)", color:"#F59E0B", fontSize:11, fontWeight:600, padding:"4px 12px", borderRadius:50, letterSpacing:"0.05em", textTransform:"uppercase" }}>Medium</span>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:28, fontWeight:800, background:"linear-gradient(135deg,#00D4AA,#3B8BFF)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>87%</div>
                    <div style={{ fontSize:10, color:"#6B7A99" }}>confidence</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div style={{ borderTop:"1px solid rgba(255,255,255,0.04)", borderBottom:"1px solid rgba(255,255,255,0.04)", padding:"32px clamp(20px,5vw,72px)" }}>
        <div className="stats-bar" style={{ display:"flex", justifyContent:"center", gap:0, maxWidth:960, margin:"0 auto" }}>
          {[
            ["No jargon","describe it in your own words"],
            ["No guessing","structured clinical insights, instantly"],
            ["No waiting","results before you finish your sentence"],
            ["No forms","pure conversational AI experience"],
          ].map(([n, l], i) => (
            <div key={n} style={{ textAlign:"center", flex:1, padding:"0 24px", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <div style={{ fontSize:17, fontWeight:800, color:"#00D4AA", marginBottom:5, letterSpacing:"-0.01em" }}>{n}</div>
              <div style={{ fontSize:12, color:"#6B7A99", lineHeight:1.5 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section ref={featuresRef} style={{ padding:"110px clamp(20px,5vw,72px) 80px" }}>
        <FadeIn>
          <div style={{ maxWidth:580, marginBottom:64 }}>
            <div style={{ fontSize:12, color:"#00D4AA", fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:14 }}>Features</div>
            <h2 style={{ fontSize:"clamp(28px,3.5vw,44px)", fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.12, marginBottom:16 }}>Built for how people actually describe illness</h2>
            <p style={{ fontSize:16, color:"#6B7A99", lineHeight:1.7 }}>No medical jargon required. Medinex AI bridges the gap between how you feel and what it means.</p>
          </div>
        </FadeIn>
        <div className="feat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18, maxWidth:1100, margin:"0 auto" }}>
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 70}>
              <div className="feat-card">
                <div style={{ fontSize:12, fontFamily:"'JetBrains Mono',monospace", color:"rgba(0,212,170,0.5)", marginBottom:20, fontWeight:500 }}>{f.num}</div>
                <div style={{ fontSize:17, fontWeight:700, marginBottom:10, color:"#E8EDF5", letterSpacing:"-0.01em" }}>{f.title}</div>
                <div style={{ fontSize:14, color:"#6B7A99", lineHeight:1.7 }}>{f.desc}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section ref={howRef} style={{ padding:"0 clamp(20px,5vw,72px) 110px" }}>
        <FadeIn>
          <div style={{ textAlign:"center", marginBottom:68 }}>
            <div style={{ fontSize:12, color:"#3B8BFF", fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:14 }}>Process</div>
            <h2 style={{ fontSize:"clamp(26px,3.5vw,44px)", fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.1, marginBottom:14 }}>You describe it. The AI decodes it.</h2>
            <p style={{ fontSize:16, color:"#6B7A99", maxWidth:420, margin:"0 auto" }}>Four steps. Plain language in, clinical intelligence out.</p>
          </div>
        </FadeIn>
        <div className="steps-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:18, maxWidth:1100, margin:"0 auto" }}>
          {HOW_IT_WORKS.map((s, i) => (
            <FadeIn key={s.step} delay={i * 90}>
              <div className="step-card">
                <div style={{ fontSize:40, fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:"rgba(59,139,255,0.1)", lineHeight:1, marginBottom:20 }}>{s.step}</div>
                <div style={{ fontSize:18, fontWeight:700, color:"#E8EDF5", letterSpacing:"-0.015em", marginBottom:10 }}>{s.title}</div>
                <div style={{ fontSize:14, color:"#6B7A99", lineHeight:1.65 }}>{s.body}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section ref={aboutRef} style={{ padding:"0 clamp(20px,5vw,72px) 110px" }}>
        <FadeIn>
          <div style={{ background:"rgba(12,18,30,0.7)", border:"1px solid rgba(0,212,170,0.1)", borderRadius:28, padding:"72px clamp(28px,6vw,80px)", maxWidth:1100, margin:"0 auto", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:"-40%", right:"-10%", width:"50%", height:"200%", background:"radial-gradient(ellipse,rgba(0,212,170,0.06) 0%,transparent 60%)", pointerEvents:"none" }} />
            <div style={{ position:"absolute", bottom:"-40%", left:"-5%", width:"40%", height:"180%", background:"radial-gradient(ellipse,rgba(59,139,255,0.05) 0%,transparent 60%)", pointerEvents:"none" }} />
            <div style={{ position:"relative", zIndex:1, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:40 }}>
              <div style={{ maxWidth:520 }}>
                <div style={{ fontSize:12, color:"#00D4AA", fontWeight:600, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:16 }}>About Medinex AI</div>
                <h2 style={{ fontSize:"clamp(26px,3.5vw,42px)", fontWeight:800, letterSpacing:"-0.03em", lineHeight:1.1, marginBottom:18 }}>Transforming healthcare access through AI</h2>
                <p style={{ fontSize:16, color:"#6B7A99", lineHeight:1.75, marginBottom:16 }}>Medinex AI bridges the gap between how people describe symptoms and what those symptoms mean clinically. Built on a trained ML model with an NLP pipeline designed for real human language.</p>
                <p style={{ fontSize:16, color:"#6B7A99", lineHeight:1.75 }}>Our mission is to make preliminary health intelligence accessible, fast, and accurate — so no one has to wait days for a first answer.</p>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {[["132+","Disease conditions"],["NLP","Symptom extraction"],["Fuzzy","Spell tolerance"],["< 1s","Prediction time"]].map(([n,l]) => (
                  <div key={l} style={{ display:"flex", alignItems:"center", gap:16, background:"rgba(10,15,24,0.6)", border:"1px solid rgba(255,255,255,0.055)", borderRadius:12, padding:"14px 20px" }}>
                    <div style={{ fontSize:18, fontWeight:800, color:"#00D4AA", minWidth:48, fontFamily:"'JetBrains Mono',monospace" }}>{n}</div>
                    <div style={{ fontSize:13, color:"#6B7A99" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:"1px solid rgba(255,255,255,0.045)", padding:"36px clamp(20px,5vw,72px)", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:14 }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#054a38,#0a6b52)", border:"1px solid rgba(0,212,170,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <MedinexLogo size={20} style={{ color:"#00D4AA" }} />
          </div>
          <span style={{ fontWeight:700, fontSize:16, color:"#F0F4FF" }}>Medinex<span style={{ color:"#00D4AA" }}> AI</span></span>
        </div>
        <div style={{ fontSize:12, color:"rgba(107,122,153,0.7)", textAlign:"center" }}>Not a substitute for professional medical advice.</div>
        <div style={{ fontSize:12, color:"rgba(107,122,153,0.5)" }}>© 2025 Medinex AI</div>
      </footer>
    </>
  );
}

export default HomePage;
