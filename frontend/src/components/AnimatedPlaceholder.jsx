import { useState, useEffect } from "react";

function AnimatedPlaceholder({ texts }) {
  const [idx, setIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    const current = texts[idx];
    let t;
    if (!deleting && charIdx < current.length) {
      t = setTimeout(() => setCharIdx(c => c + 1), 42);
    } else if (!deleting && charIdx === current.length) {
      t = setTimeout(() => setDeleting(true), 2200);
    } else if (deleting && charIdx > 0) {
      t = setTimeout(() => setCharIdx(c => c - 1), 20);
    } else {
      setDeleting(false);
      setIdx(i => (i + 1) % texts.length);
    }
    setDisplayed(current.slice(0, charIdx));
    return () => clearTimeout(t);
  }, [charIdx, deleting, idx, texts]);

  return (
    <span style={{ color: "rgba(107,122,153,0.65)", pointerEvents: "none", userSelect: "none" }}>
      {displayed}<span style={{ animation: "blink 1s step-end infinite", opacity: 0.5 }}>|</span>
    </span>
  );
}

export default AnimatedPlaceholder;
