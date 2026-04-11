"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useDomaniStore } from "@/lib/store/useDomaniStore";
import { audio } from "@/lib/audio/AudioManager";

// ─── MICRO-CURSOR (Bypasses global cursor:none) ─────────────────────────
function MicroCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div 
      ref={dotRef} 
      style={{
        position: "fixed", top: -4, left: -4, width: 8, height: 8,
        background: "#B8F0FF", borderRadius: "50%", pointerEvents: "none",
        zIndex: 10000, mixBlendMode: "difference", 
        boxShadow: "0 0 10px #B8F0FF"
      }} 
    />
  );
}

// ─── PARAMETRIC 3D MATH ───────────────────────────────────────────────────
const getTorusKnot = (t: number, p: number, q: number, radius: number, tube: number) => {
  const r = radius + tube * Math.cos(q * t);
  const x = r * Math.cos(p * t);
  const y = r * Math.sin(p * t);
  const z = tube * Math.sin(q * t);
  return { x, y, z };
};

const project = (x: number, y: number, z: number, w: number, h: number, fov: number, dist: number) => {
  const scale = fov / (fov + z + dist);
  return {
    x: x * scale + w / 2,
    y: y * scale + h / 2,
    scale
  };
};

export function LoaderGate() {
  const { siteState, loadProgress, setSiteState, setLoadProgress, loadLabel } = useDomaniStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  
  const [phase, setPhase] = useState<"booting" | "ready" | "igniting">("booting");

  useEffect(() => {
    let frame = 0;
    const duration = 160; 
    
    const bootMessages = [
      "WEAVING_FIBER_OPTICS...",
      "CALCULATING_BEZIER_CURVES...",
      "RENDERING_LIGHT_BOUNCES...",
      "ESTABLISHING_VIBES...",
      "TYPOGRAPHY_LOCKED...",
      "THE_STAGE_IS_SET."
    ];

    const boot = () => {
      frame++;
      const progress = Math.min((frame / duration) * 100, 100);
      const easedProgress = 100 * (1 - Math.pow(1 - progress / 100, 4));
      let currentLabel = bootMessages[Math.floor((easedProgress / 100) * (bootMessages.length - 1))];
      setLoadProgress(easedProgress, currentLabel);

      if (frame < duration) requestAnimationFrame(boot);
      else setPhase("ready");
    };
    
    requestAnimationFrame(boot);

    const onMove = (e: MouseEvent) => {
      mouse.current.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [setLoadProgress]);

  const handleIgnition = () => {
    if (phase !== "ready") return;
    setPhase("igniting");

    audio.boot();
    audio.resume();
    audio.playClick();
    setTimeout(() => audio.playTransition(), 100);
    setTimeout(() => audio.playAmbientTrack(), 1800);

    const tl = gsap.timeline({
      onComplete: () => {
        setSiteState("transition");
      }
    });

    // Explosive zoom into the dark void
    tl.to(containerRef.current, {
      scale: 15,
      opacity: 0,
      duration: 1.4,
      ease: "power3.inOut"
    });
  };

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    let w = c.width = window.innerWidth;
    let h = c.height = window.innerHeight;
    
    let raf = 0;
    const render = () => {
      mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.08;
      mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.08;
      
      // Deep dark background matching the home page
      ctx.fillStyle = "#020408";
      ctx.fillRect(0, 0, w, h);

      // 'Screen' blend mode makes overlapping lines glow brightly
      ctx.globalCompositeOperation = "screen";

      const time = performance.now() / 1000;
      const pct = useDomaniStore.getState().loadProgress / 100;
      
      const baseRadius = Math.min(w, h) * 0.15 + (pct * Math.min(w, h) * 0.1);
      const tubeRadius = baseRadius * 0.4;
      
      // Cyber/Glass colors mapping to the home page's cyan/white glow
      const ribbons = [
  { color: "rgba(255, 255, 255, 0.15)", offset: 0, p: 3, q: 4 },     // Icy White
  { color: "rgba(184, 240, 255, 0.25)", offset: 2.1, p: 3, q: 4 },   // Domani Cyan
  { color: "rgba(100, 200, 255, 0.15)", offset: 4.2, p: 3, q: 4 }    // Deep Electric Blue
];

      ribbons.forEach((ribbon) => {
        ctx.beginPath();
        const resolution = 50 + (pct * 250); 
        
        
        for (let i = 0; i <= resolution; i++) {
          const t_param = (i / resolution) * Math.PI * 2;
          let { x, y, z } = getTorusKnot(t_param, ribbon.p, ribbon.q, baseRadius, tubeRadius);
          
          const rotX = time * 0.3 + ribbon.offset + (mouse.current.y * 0.5);
          const rotY = time * 0.5 + (mouse.current.x * 0.5);
          
          const y1 = y * Math.cos(rotX) - z * Math.sin(rotX);
          const z1 = y * Math.sin(rotX) + z * Math.cos(rotX);
          const x2 = x * Math.cos(rotY) - z1 * Math.sin(rotY);
          const z2 = x * Math.sin(rotY) + z1 * Math.cos(rotY);

          const p2d = project(x2, y1, z2, w, h, 800, 600);

          if (i === 0) ctx.moveTo(p2d.x, p2d.y);
          else ctx.lineTo(p2d.x, p2d.y);
        }

        ctx.strokeStyle = ribbon.color;
        ctx.lineWidth = 0.5 + (pct * 2) + (Math.sin(time * 3 + ribbon.offset) * 1);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
      });

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(render);
    };
    
    raf = requestAnimationFrame(render);

    const resize = () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight; };
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  if (siteState === "transition") return null;

  return (
    <main 
      ref={containerRef}
      style={{ 
        position: "fixed", inset: 0, zIndex: 9999, 
        background: "#020408", overflow: "hidden",
        transformOrigin: "center center",
      }}
    >
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "4vw", pointerEvents: "none" }}>
        
        {/* TOP */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontFamily: "'Inter', 'Helvetica Neue', sans-serif", fontSize: "14px", fontWeight: 700, color: "#fff", letterSpacing: "0.05em" }}>
            DOMANI®
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "11px", color: "rgba(184, 240, 255, 0.6)", textAlign: "right", textTransform: "uppercase" }}>
            <div style={{ fontWeight: 700, color: "#fff", marginBottom: 4 }}>{loadLabel}</div>
            <div>{new Date().getFullYear()} / STUDIO</div>
          </div>
        </div>

        {/* MIDDLE */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          
          {/* ARCHITECTURAL GLASS NUMBERS */}
          <div style={{
            fontFamily: "'Bodoni Moda', Georgia, serif", fontStyle: "italic",
            fontSize: "clamp(120px, 22vw, 400px)", // Scaled up
            color: "rgba(184, 240, 255, 0.08)",    // Higher opacity base
            WebkitTextStroke: "1px rgba(184, 240, 255, 0.4)", // Sharp neon outline
            textShadow: "0 0 40px rgba(184, 240, 255, 0.2)",  // Ambient glow
            lineHeight: 0.8, letterSpacing: "-0.05em",
            position: "absolute", top: "50%", transform: "translateY(-50%)",
            opacity: phase === "booting" ? 1 : 0, transition: "opacity 0.8s ease"
          }}>
            {Math.floor(loadProgress)}
          </div>

          <button
            onClick={handleIgnition}
            style={{
              opacity: phase === "ready" ? 1 : 0,
              pointerEvents: phase === "ready" ? "auto" : "none",
              transform: phase === "ready" ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
              background: "rgba(184, 240, 255, 0.1)", border: "1px solid rgba(184, 240, 255, 0.3)", outline: "none",
              padding: "18px 40px", borderRadius: "100px", backdropFilter: "blur(8px)",
              cursor: "none", // Let the micro-cursor handle it
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(184, 240, 255, 0.2)";
              e.currentTarget.style.borderColor = "rgba(184, 240, 255, 0.8)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(184, 240, 255, 0.1)";
              e.currentTarget.style.borderColor = "rgba(184, 240, 255, 0.3)";
            }}
          >
            <span style={{ 
              fontFamily: "'DM Mono', monospace", fontSize: "12px", fontWeight: 600, color: "#B8F0FF",
              letterSpacing: "0.2em", textTransform: "uppercase"
            }}>
              Unfold Experience
            </span>
          </button>
        </div>

        {/* BOTTOM */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "rgba(184, 240, 255, 0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          <div>Design & Engineering</div>
          <div>We Build Tomorrow</div>
        </div>

      </div>

      <MicroCursor />
    </main>
  );
}