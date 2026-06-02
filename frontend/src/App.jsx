import { useState, useEffect, useRef } from "react";
import { predictSymptoms } from "./services/api";
import MedinexLogo from "./components/MedinexLogo";
import HomePage from "./pages/HomePage";
import CheckerPage from "./pages/CheckerPage";
import ResultPage from "./pages/ResultPage";

// Logo base64 image data from the approved design
const LOGO_IMG = "data:image/png;base64,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";

const ANALYSIS_STEPS = ["Parsing natural language...", "Extracting symptoms...", "Running ML model...", "Generating report..."];

export default function App() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [result, setResult] = useState(null);
  const [activePage, setActivePage] = useState("home");
  const [error, setError] = useState(null);

  const featuresRef = useRef(null);
  const howRef = useRef(null);
  const aboutRef = useRef(null);

  useEffect(() => {
    const s = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", s);
    return () => window.removeEventListener("scroll", s);
  }, []);

  const scrollTo = (ref) => {
    if (activePage !== "home") {
      setActivePage("home");
      setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    } else {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleAnalyze = async () => {
    if (!inputVal.trim()) return;
    setAnalyzing(true);
    setAnalysisStep(0);
    setResult(null);
    setError(null);

    // Animate through analysis steps while API call runs
    let step = 0;
    const stepTimer = setInterval(() => {
      step++;
      if (step < ANALYSIS_STEPS.length) {
        setAnalysisStep(step);
      }
    }, 520);

    try {
      const res = await predictSymptoms(inputVal);

      clearInterval(stepTimer);

      // Check if it's an error response (no symptoms found)
      if (res.error) {
        setAnalyzing(false);
        setError(res.error);
        return;
      }

      // Animate through remaining steps quickly
      setAnalysisStep(ANALYSIS_STEPS.length - 1);
      await new Promise(r => setTimeout(r, 400));

      // Map API response to frontend result format
      const mappedResult = {
        disease: res.predicted_disease,
        confidence: Math.round(res.confidence),
        severity: res.severity,
        severityColor: res.severity_color,
        severityBg: res.severity_bg,
        severityBorder: res.severity_border,
        symptoms: res.detected_symptoms || [],
        precautions: res.precautions || [],
        description: res.description || "",
        matchedDiseases: (res.matched_diseases || []).map(d => ({
          name: d.name,
          confidence: Math.round(d.confidence),
        })),
        isEmergency: res.is_emergency || false,
      };

      setAnalyzing(false);
      setResult(mappedResult);
      setActivePage("result");
      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (err) {
      clearInterval(stepTimer);
      setAnalyzing(false);
      setError("Unable to connect to the analysis server. Please check your connection and try again.");
      console.error("Prediction error:", err);
    }
  };

  return (
    <div style={{ background: "#06090F", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#F0F4FF", overflowX: "hidden" }}>

      {/* NAV */}
      <nav style={{ position:"sticky", top:0, zIndex:200, height:64, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 clamp(20px,5vw,72px)", background: navScrolled ? "rgba(6,9,15,0.88)" : "transparent", backdropFilter: navScrolled ? "blur(24px)" : "none", borderBottom: navScrolled ? "1px solid rgba(255,255,255,0.055)" : "1px solid transparent", transition:"all 0.35s ease" }}>
        <button onClick={() => { setActivePage("home"); window.scrollTo({top:0,behavior:"smooth"}); }} style={{ display:"flex", alignItems:"center", gap:10, background:"none", border:"none", cursor:"pointer", padding:0 }}>
          <div style={{ width:38, height:38, borderRadius:10, border:"1px solid rgba(0,212,170,0.35)", boxShadow:"0 4px 20px rgba(0,212,170,0.22)", flexShrink:0, overflow:"hidden" }}>
            <img src={LOGO_IMG} alt="Medinex AI Logo" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
          </div>
          <span style={{ fontFamily:"inherit", fontWeight:700, fontSize:17, letterSpacing:"-0.02em", color:"#F0F4FF" }}>
            Medinex<span style={{ color:"#00D4AA" }}> AI</span>
          </span>
        </button>

        <div className="mobile-hide" style={{ display:"flex", alignItems:"center", gap:36 }}>
          <button className="nav-a" onClick={() => scrollTo(featuresRef)}>Features</button>
          <button className="nav-a" onClick={() => scrollTo(howRef)}>How It Works</button>
          <button className="nav-a" onClick={() => scrollTo(aboutRef)}>About</button>
        </div>

        <button className="btn-primary" style={{ padding:"10px 24px", fontSize:14 }} onClick={() => { setActivePage("checker"); window.scrollTo({top:0,behavior:"smooth"}); }}>
          Get Started →
        </button>
      </nav>

      {activePage === "home" && <HomePage featuresRef={featuresRef} howRef={howRef} aboutRef={aboutRef} setActivePage={setActivePage} />}
      {activePage === "checker" && (
        <CheckerPage
          inputVal={inputVal} setInputVal={setInputVal}
          inputFocused={inputFocused} setInputFocused={setInputFocused}
          analyzing={analyzing} analysisStep={analysisStep}
          ANALYSIS_STEPS={ANALYSIS_STEPS} handleAnalyze={handleAnalyze}
          error={error}
        />
      )}
      {activePage === "result" && result && (
        <ResultPage result={result} setActivePage={setActivePage} setResult={setResult} setInputVal={setInputVal} />
      )}
    </div>
  );
}
