import { useState, useEffect, useRef } from "react";
import { predictSymptoms } from "./services/api";
import MedinexLogo from "./components/MedinexLogo";
import HomePage from "./pages/HomePage";
import CheckerPage from "./pages/CheckerPage";
import ResultPage from "./pages/ResultPage";
import logo from "./assets/MedinexAI_logo.png";

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
            <img src={logo} alt="Medinex AI Logo" style={{ width:"100%", height:"100%", objectFit:"contain", display:"block" }} />
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
