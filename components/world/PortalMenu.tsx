"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useTransition } from "@/lib/transitions/TransitionContext";
import { audio } from "@/lib/audio/AudioManager";

interface Props { open: boolean; onClose: (navigating?: boolean) => void; }

const SECTIONS = [
  {
    id: "work",       index: "00", title: "Work",
    sub: "Selected engagements", years: "2022 —",
    line1: "Real organisations.", line2: "Real constraints.", line3: "Real systems.",
    href: "/work",
    bg: "#020610",
    accent: "#3AB5FF",
    textAccent: "#6DD0FF",
  },
  {
    id: "services",   index: "01", title: "Services",
    sub: "What we build and how", years: "Always",
    line1: "Brand. Product.", line2: "AI. Infrastructure.", line3: "One system.",
    href: "/services",
    bg: "#021008",
    accent: "#3AFFB0",
    textAccent: "#6AFFC0",
  },
  {
    id: "lab",        index: "02", title: "Lab",
    sub: "Open research", years: "Continuous",
    line1: "Experiments.", line2: "Artefacts.", line3: "Edge thinking.",
    href: "/lab",
    bg: "#07021A",
    accent: "#9B6AFF",
    textAccent: "#BC9AFF",
  },
  {
    id: "ventures",   index: "03", title: "Ventures",
    sub: "SyntriAI · YDBI · Veyra", years: "2025 —",
    line1: "We build", line2: "for ourselves", line3: "as well.",
    href: "/ventures",
    bg: "#120400",
    accent: "#FF8C3A",
    textAccent: "#FFB070",
  },
  {
    id: "store",      index: "04", title: "Store",
    sub: "Tools · Systems · Kits", years: "2026 —",
    line1: "Production tools.", line2: "Ship faster.", line3: "Build smarter.",
    href: "/store",
    bg: "#020A10",
    accent: "#B8F0FF",
    textAccent: "#D4F7FF",
  },
  {
    id: "careers",    index: "05", title: "Careers",
    sub: "Build tomorrow with us", years: "Open",
    line1: "Join the studio.", line2: "Think in systems.", line3: "Ship things that last.",
    href: "/careers",
    bg: "#060210",
    accent: "#8B78FF",
    textAccent: "#B0A0FF",
  },
  {
    id: "contact",    index: "06", title: "Contact",
    sub: "hello@domani.studio", years: "Open",
    line1: "Building something", line2: "that matters?", line3: "Let's talk.",
    href: "/contact",
    bg: "#010810",
    accent: "#B8F0FF",
    textAccent: "#D4F7FF",
  },
];

// ─── SECTION CANVAS (full-bleed, per-section) ─────────────────────────────────
function SectionCanvas({ sectionIdx }: { sectionIdx: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const t0 = useRef(performance.now());

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const s = SECTIONS[sectionIdx];
    const hex = s.accent.replace("#", "");
    const R = parseInt(hex.slice(0, 2), 16);
    const G = parseInt(hex.slice(2, 4), 16);
    const B = parseInt(hex.slice(4, 6), 16);
    const aC = (a: number) => `rgba(${R},${G},${B},${a})`;

    const draw = () => {
      raf.current = requestAnimationFrame(draw);
      const W = c.width = c.offsetWidth || 800;
      const H = c.height = c.offsetHeight || 600;
      const t = (performance.now() - t0.current) / 1000;

      ctx.fillStyle = s.bg;
      ctx.fillRect(0, 0, W, H);

      const cx = W * 0.5, cy = H * 0.5;
      const scale = Math.min(W, H) * 0.30;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.12);

      // Full Orbit spiral arms
      for (let arm = 0; arm < 4; arm++) {
        const off = (arm / 4) * Math.PI * 2;
        const pts: {x:number;y:number}[] = [];
        for (let i = 0; i <= 100; i++) {
          const theta = 0.1 + (i / 100) * Math.PI * 1.54;
          const r = scale * 0.082 * Math.exp(0.295 * theta);
          pts.push({ x: Math.cos(theta + off) * r, y: Math.sin(theta + off) * r });
        }
        const nrm = pts.map((_, i) => {
          const p = pts[Math.max(0, i - 1)], n = pts[Math.min(100, i + 1)];
          const dx = n.x - p.x, dy = n.y - p.y, len = Math.sqrt(dx*dx+dy*dy)||1;
          return { nx: -dy/len, ny: dx/len };
        });
        const hw = (u: number) => scale * (2.8 + u * 9.5) * 0.010;

        ctx.beginPath();
        pts.forEach((p, i) => {
          const w = hw(i/100);
          i===0 ? ctx.moveTo(p.x+nrm[i].nx*w, p.y+nrm[i].ny*w) : ctx.lineTo(p.x+nrm[i].nx*w, p.y+nrm[i].ny*w);
        });
        const lp=pts[100],ln=nrm[100],lw=hw(1);
        ctx.arc(lp.x,lp.y,lw,Math.atan2(ln.ny,ln.nx)-Math.PI/2,Math.atan2(ln.ny,ln.nx)+Math.PI/2);
        for (let i=100;i>=0;i--){const w=hw(i/100);ctx.lineTo(pts[i].x-nrm[i].nx*w,pts[i].y-nrm[i].ny*w);}
        const fp=pts[0],fn=nrm[0],fw=hw(0);
        ctx.arc(fp.x,fp.y,fw,Math.atan2(fn.ny,fn.nx)+Math.PI/2,Math.atan2(fn.ny,fn.nx)-Math.PI/2);
        ctx.closePath();

        ctx.fillStyle="rgba(4,6,10,0.88)";
        ctx.fill();

        const emissive=0.55+0.45*Math.sin(t*1.3+arm*0.6);
        ctx.shadowBlur=16; ctx.shadowColor=aC(emissive*0.55);
        ctx.beginPath();
        pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
        ctx.strokeStyle=aC(emissive*0.78);
        ctx.lineWidth=scale*0.020; ctx.lineCap="round"; ctx.stroke();
        ctx.shadowBlur=0;
        ctx.strokeStyle=aC(0.28); ctx.lineWidth=scale*0.005; ctx.stroke();
      }

      // Core
      const cg=ctx.createRadialGradient(0,0,0,0,0,scale*0.045);
      cg.addColorStop(0,"rgba(255,255,255,1)");
      cg.addColorStop(0.4,aC(0.9)); cg.addColorStop(1,aC(0));
      ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(0,0,scale*0.045,0,Math.PI*2); ctx.fill();
      ctx.restore();

      // Ambient
      const amb=ctx.createRadialGradient(cx,cy,0,cx,cy,scale*2.2);
      amb.addColorStop(0,aC(0.07)); amb.addColorStop(1,aC(0));
      ctx.fillStyle=amb; ctx.fillRect(0,0,W,H);

      // Ghost big letter
      ctx.save();
      ctx.globalAlpha=0.04;
      ctx.font=`italic 300 ${Math.min(W,H)*0.7}px 'Bodoni Moda',Georgia,serif`;
      ctx.fillStyle=s.accent;
      ctx.textAlign="center"; ctx.textBaseline="middle";
      ctx.fillText(s.title[0],cx,cy);
      ctx.restore();

      // Vignette
      const vg=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(W,H)*0.75);
      vg.addColorStop(0,"rgba(0,0,0,0)"); vg.addColorStop(1,"rgba(0,0,0,0.88)");
      ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);

      // Horizontal scanline
      const scanY=(t*40)%H;
      ctx.fillStyle=aC(0.015);
      ctx.fillRect(0,scanY,W,1);
    };

    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [sectionIdx]);

  return <canvas ref={ref} style={{ width:"100%", height:"100%", display:"block", position:"absolute", inset:0 }}/>;
}

// ─── PORTAL MENU — Elite redesign ─────────────────────────────────────────────
export function PortalMenu({ open, onClose }: Props) {
  const { navigate } = useTransition();
  const [vis,     setVis]     = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [active,  setActive]  = useState(-1); // clicked section
  const [focused, setFocused] = useState(0);  // keyboard/hover focus
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Audio: kill music on open (mobile fix) ─────────────────────────────────
  useEffect(() => {
    if (open) {
      // Pause ambient audio on mobile when menu opens
      try {
        audio.setAmbientVolume(0);
        const svcTrack = (window as any).__servicesTrack;
        if (svcTrack) svcTrack.volume = 0;
        const labTrack = (window as any).__labTrack;
        if (labTrack) labTrack.volume = 0;
        const projTrack = (window as any).__projectTrack;
        if (projTrack) projTrack.volume = 0;
      } catch {}
    } else {
      // Restore on close (only if not globally muted)
      try {
        const { _globalMuted } = require("./GlobalNav");
        if (!_globalMuted) audio.setAmbientVolume(0.55);
      } catch {
        try { audio.setAmbientVolume(0.55); } catch {}
      }
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      setLeaving(false); setActive(-1); setFocused(0);
      const t = setTimeout(() => setVis(true), 20);
      return () => clearTimeout(t);
    } else { setVis(false); }
  }, [open]);

  const close = useCallback(() => {
    setLeaving(true); setVis(false); setActive(-1);
    setTimeout(() => { setLeaving(false); onClose(); }, 550);
  }, [onClose]);

  const handleSelect = useCallback((i: number) => {
    if (audio.isBooted) audio.playClick();
    setActive(i);
    setTimeout(() => {
      setVis(false);
      onClose(true);
      setTimeout(() => navigate(SECTIONS[i].href, "ink"), 200);
    }, 480);
  }, [navigate, onClose]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") { close(); return; }
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        setFocused(f => Math.min(f + 1, SECTIONS.length - 1));
      }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        setFocused(f => Math.max(f - 1, 0));
      }
      if (e.key === "Enter") handleSelect(focused);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, close, focused, handleSelect]);

  if (!open && !leaving) return null;

  const currentSection = active >= 0 ? SECTIONS[active] : SECTIONS[focused];

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        overflow: "hidden",
      }}
    >
      {/* ── Full-bleed canvas background — current focused section ── */}
      <div style={{
        position: "absolute", inset: 0,
        opacity: vis ? 1 : 0,
        transition: "opacity 0.55s ease",
      }}>
        <SectionCanvas sectionIdx={focused} />
      </div>

      {/* ── Frosted glass overlay ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: `rgba(4,6,10,${vis ? 0.65 : 0})`,
        backdropFilter: "blur(0px)",
        transition: "background 0.55s ease",
      }}/>

      {/* ── Scanlines ── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 3px)",
      }}/>

      {/* ── TOP BAR ── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "clamp(16px,2.5vw,24px) clamp(20px,4vw,44px)",
        opacity: vis && active < 0 ? 1 : 0,
        transition: "opacity 0.35s ease",
      }}>
        <span style={{
          fontFamily: "'DM Mono',monospace", fontSize: 9,
          letterSpacing: "0.48em", color: "rgba(255,255,255,0.60)",
          textTransform: "uppercase",
        }}>DOMANI</span>

        {/* Pill close button */}
        <button
          onClick={close}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: 100,
            padding: "8px 20px", cursor: "none",
            fontFamily: "'DM Mono',monospace", fontSize: 7,
            letterSpacing: "0.24em", color: "rgba(255,255,255,0.65)",
            textTransform: "uppercase",
            transition: "all 0.25s ease",
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.14)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.40)";
            e.currentTarget.style.color = "rgba(255,255,255,0.95)";
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.07)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
            e.currentTarget.style.color = "rgba(255,255,255,0.65)";
          }}
        >
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
            <path d="M1 1L8 8M8 1L1 8" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
          Esc
        </button>
      </div>

      {/* ── MAIN NAVIGATION AREA ── */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex",
        alignItems: "stretch",
        opacity: vis && active < 0 ? 1 : 0,
        transition: "opacity 0.35s ease",
        pointerEvents: vis && active < 0 ? "auto" : "none",
      }}>
        {/* LEFT: big editorial copy of focused section */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 clamp(20px,5vw,60px) clamp(32px,5vw,60px)",
          pointerEvents: "none",
        }}>
          {/* Section index */}
          <div style={{
            fontFamily: "'DM Mono',monospace", fontSize: 7,
            letterSpacing: "0.28em", color: `${currentSection.textAccent}88`,
            textTransform: "uppercase", marginBottom: 16,
            opacity: vis ? 1 : 0,
            transform: vis ? "none" : "translateY(10px)",
            transition: "opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s",
          }}>
            {currentSection.index} — {currentSection.years}
          </div>

          {/* Large editorial text */}
          <div style={{
            fontFamily: "'Bodoni Moda',Georgia,serif",
            fontStyle: "italic", fontWeight: 400,
            fontSize: "clamp(36px,6.5vw,88px)",
            lineHeight: 0.92, letterSpacing: "-0.03em",
            color: "rgba(255,255,255,0.90)",
            textShadow: `0 0 80px ${currentSection.accent}44`,
            marginBottom: 20,
            opacity: vis ? 1 : 0,
            transform: vis ? "none" : "translateY(14px)",
            transition: "opacity 0.45s ease 0.12s, transform 0.45s ease 0.12s",
          }}>
            {currentSection.line1}<br/>
            {currentSection.line2}<br/>
            {currentSection.line3}
          </div>

          {/* Sub */}
          <div style={{
            fontFamily: "'DM Mono',monospace", fontSize: 8,
            letterSpacing: "0.12em", color: "rgba(255,255,255,0.30)",
            lineHeight: 1.7,
            opacity: vis ? 1 : 0,
            transition: "opacity 0.4s ease 0.18s",
          }}>{currentSection.sub}</div>
        </div>

        {/* RIGHT: vertical section list */}
        <div style={{
          width: "clamp(220px,28vw,380px)",
          borderLeft: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflowY: "auto",
          // Custom scrollbar hidden
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}>
          {SECTIONS.map((s, i) => {
            const isFocused = focused === i;
            const isDimmed = !isFocused;

            return (
              <div
                key={s.id}
                onClick={() => handleSelect(i)}
                onMouseEnter={() => {
                  setFocused(i);
                  if (audio.isBooted) audio.playHover();
                }}
                style={{
                  padding: "clamp(14px,2vw,22px) clamp(20px,3vw,36px)",
                  borderBottom: `1px solid ${isFocused ? s.accent + "33" : "rgba(255,255,255,0.04)"}`,
                  cursor: "none",
                  background: isFocused ? s.accent + "0A" : "transparent",
                  transition: "background 0.2s, border-color 0.2s",
                  position: "relative",
                  overflow: "hidden",
                  opacity: vis ? (isDimmed ? 0.30 : 1) : 0,
                  transform: vis ? "none" : "translateX(24px)",
                  transitionProperty: "opacity, transform, background, border-color",
                  transitionDuration: `0.5s, 0.5s, 0.2s, 0.2s`,
                  transitionDelay: `${0.06 + i * 0.04}s, ${0.06 + i * 0.04}s, 0s, 0s`,
                  transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
                } as React.CSSProperties}
              >
                {/* Hover sheen */}
                {isFocused && (
                  <div style={{
                    position: "absolute", inset: 0, pointerEvents: "none",
                    background: `linear-gradient(90deg, transparent, ${s.accent}18, transparent)`,
                    animation: "sheen 1.8s ease-in-out infinite",
                  }}/>
                )}

                {/* Index row */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginBottom: 5,
                }}>
                  <span style={{
                    fontFamily: "'DM Mono',monospace", fontSize: 7.5,
                    letterSpacing: "0.16em",
                    color: isFocused ? s.accent : "rgba(255,255,255,0.25)",
                    transition: "color 0.2s",
                  }}>{s.index}</span>

                  {isFocused && (
                    <div style={{
                      width: 18, height: 1,
                      background: s.accent,
                      boxShadow: `0 0 6px ${s.accent}99`,
                    }}/>
                  )}
                </div>

                {/* Title */}
                <div style={{
                  fontFamily: "'Bodoni Moda',Georgia,serif",
                  fontStyle: "italic", fontWeight: 400,
                  fontSize: "clamp(18px,2.2vw,30px)",
                  lineHeight: 1, letterSpacing: "-0.015em",
                  color: isFocused ? "#fff" : "rgba(255,255,255,0.50)",
                  textShadow: isFocused ? `0 0 24px ${s.accent}55` : "none",
                  transition: "color 0.2s, text-shadow 0.2s",
                }}>{s.title}</div>
              </div>
            );
          })}

          {/* Meta footer */}
          <div style={{
            padding: "16px clamp(20px,3vw,36px)",
            marginTop: "auto",
            opacity: 0.5,
          }}>
            <div style={{
              fontFamily: "'DM Mono',monospace", fontSize: 6,
              letterSpacing: "0.20em", color: "rgba(255,255,255,0.18)",
              textTransform: "uppercase", lineHeight: 2.2,
            }}>
              Dom-001 · 2026 · Worldwide
            </div>
          </div>
        </div>
      </div>

      {/* ── ACTIVE SECTION TAKEOVER ── */}
      {active >= 0 && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 20,
          display: "flex", alignItems: "center", justifyContent: "center",
          pointerEvents: "none",
          animation: "takeover 0.55s cubic-bezier(0.16,1,0.3,1) forwards",
        }}>
          <div style={{
            fontFamily: "'Bodoni Moda',Georgia,serif",
            fontStyle: "italic", fontWeight: 400,
            fontSize: "clamp(64px,14vw,180px)",
            color: "rgba(255,255,255,0.92)",
            letterSpacing: "-0.04em",
            textAlign: "center",
            textShadow: `0 0 80px ${SECTIONS[active].accent}55`,
          }}>
            {SECTIONS[active].title}
          </div>
        </div>
      )}

      {/* ── KEYBOARD HINT ── */}
      <div style={{
        position: "absolute", bottom: 24, left: "50%",
        transform: "translateX(-50%)",
        display: "flex", gap: 14, alignItems: "center",
        opacity: vis && active < 0 ? 0.35 : 0,
        transition: "opacity 0.4s ease 0.5s",
        pointerEvents: "none",
      }}>
        {["↑ ↓", "Navigate", "· Enter", "Select", "· Esc", "Close"].map((t, i) => (
          <span key={i} style={{
            fontFamily: "'DM Mono',monospace", fontSize: 6.5,
            letterSpacing: "0.16em", color: "#fff",
            textTransform: "uppercase",
          }}>{t}</span>
        ))}
      </div>

      <style>{`
        @keyframes sheen { 0%{transform:translateX(-150%)} 100%{transform:translateX(250%)} }
        @keyframes takeover {
          0%  { transform: scale(0.88); opacity: 0; filter: blur(16px); }
          100% { transform: scale(1);   opacity: 1; filter: blur(0px);  }
        }
        * { box-sizing: border-box; }
        @media (max-width: 640px) {
          /* Stack left + right on mobile */
        }
      `}</style>
    </div>
  );
}