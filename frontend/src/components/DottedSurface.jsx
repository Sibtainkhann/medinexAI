import { useEffect, useRef } from "react";

function DottedSurface() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const COLS = 34, ROWS = 22;
    const DOT_R = 1.6;
    const WAVE_AMP = 0.38;
    const DR = 0, DG = 212, DB = 170;
    let raf, t = 0;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const gx = canvas.width  / (COLS - 1);
      const gy = canvas.height / (ROWS - 1);
      const amp = gy * WAVE_AMP;

      for (let col = 0; col < COLS; col++) {
        for (let row = 0; row < ROWS; row++) {
          const wave =
            Math.sin((col + t) * 0.30) * amp +
            Math.sin((row + t) * 0.50) * amp;
          const x = col * gx;
          const y = row * gy + wave;
          const norm  = wave / (amp * 2) + 0.5;
          const alpha = (0.08 + norm * 0.24).toFixed(3);
          ctx.beginPath();
          ctx.arc(x, y, DOT_R, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${DR},${DG},${DB},${alpha})`;
          ctx.fill();
        }
      }
      t += 0.045;
      raf = requestAnimationFrame(draw);
    };

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);
    resize();
    draw();

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:"absolute", inset:0, zIndex:0,
        width:"100%", height:"100%",
        pointerEvents:"none", display:"block",
      }}
    />
  );
}

export default DottedSurface;
