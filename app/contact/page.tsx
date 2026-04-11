"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONTACT METHODS ─────────────────────────────────────────────────────────
const SLICES = [
  {
    id: "email",
    label: "Email",
    value: 32,
    color: "#B8F0FF",
    detail: "hello@domani.studio",
    action: "mailto:hello@domani.studio",
    desc: "For project enquiries, partnerships, and general questions. We respond within 24 hours.",
    cta: "Send Email →",
  },
  {
    id: "instagram",
    label: "Instagram",
    value: 22,
    color: "#FF7AB5",
    detail: "@domanimedia",
    action: "https://instagram.com/domanimedia",
    desc: "See our work in progress, brand explorations, and studio life in real time.",
    cta: "Follow @domanimedia →",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    value: 18,
    color: "#5B8AF0",
    detail: "Domani Studio",
    action: "https://linkedin.com/company/domanimedia",
    desc: "Long-form thinking on design, systems, and the future of intelligent companies.",
    cta: "Connect on LinkedIn →",
  },
  {
    id: "x",
    label: "X / Twitter",
    value: 14,
    color: "#D4D4D4",
    detail: "@domanimedia",
    action: "https://x.com/domanimedia",
    desc: "Hot takes, system thinking threads, and the occasional launch announcement.",
    cta: "Follow on X →",
  },
  {
    id: "calendar",
    label: "Book a Call",
    value: 14,
    color: "#A78BFF",
    detail: "30 min · Free",
    action: "#",
    desc: "Schedule a 30-minute discovery call directly. No forms, no friction.",
    cta: "Book a Call →",
  },
];

// Compute cumulative angles
function buildSlices(slices: typeof SLICES) {
  const total = slices.reduce((s, sl) => s + sl.value, 0);
  let cum = -Math.PI / 2; // start at top
  return slices.map(sl => {
    const angle = (sl.value / total) * Math.PI * 2;
    const start = cum;
    const end = cum + angle;
    const mid = start + angle / 2;
    cum = end;
    return { ...sl, start, end, mid, angle };
  });
}

const BUILT = buildSlices(SLICES);

// ─── PIE CANVAS ───────────────────────────────────────────────────────────────
function PieCanvas({
  activeSlice,
  onSliceHover,
  scrollProgress,
}: {
  activeSlice: number;
  onSliceHover: (i: number) => void;
  scrollProgress: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const t0 = useRef(performance.now());
  const mouse = useRef({ x: 0, y: 0 });

  const getSliceAt = useCallback((mx: number, my: number, cx: number, cy: number, radius: number) => {
    const dx = mx - cx, dy = my - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < radius * 0.22 || dist > radius) return -1;
    let angle = Math.atan2(dy, dx);
    // Normalize to [-π/2, 3π/2]
    if (angle < -Math.PI / 2) angle += Math.PI * 2;
    for (let i = 0; i < BUILT.length; i++) {
      let s = BUILT[i].start, e = BUILT[i].end;
      if (s < -Math.PI / 2) { s += Math.PI * 2; e += Math.PI * 2; }
      if (angle >= s && angle <= e) return i;
    }
    return -1;
  }, []);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const W = canvas.width, H = canvas.height;
      const cx = W * 0.5, cy = H * 0.5;
      const radius = Math.min(W, H) * 0.42;
      const i = getSliceAt(mouse.current.x, mouse.current.y, cx, cy, radius);
      onSliceHover(i);
    };

    canvas.addEventListener("mousemove", handleMove);
    return () => canvas.removeEventListener("mousemove", handleMove);
  }, [getSliceAt, onSliceHover]);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const draw = () => {
      raf.current = requestAnimationFrame(draw);
      const W = canvas.width = canvas.offsetWidth || 600;
      const H = canvas.height = canvas.offsetHeight || 600;
      const t = (performance.now() - t0.current) / 1000;

      ctx.clearRect(0, 0, W, H);

      const cx = W * 0.5;
      const cy = H * 0.5;
      const baseRadius = Math.min(W, H) * 0.42;

      // Parallax: pie breathes with scroll
      const breathe = 1 + 0.04 * Math.sin(t * 0.5);
      const parallaxScale = 1 + scrollProgress * 0.08;
      const radius = baseRadius * breathe * parallaxScale;

      // Rotate slowly
      const globalRot = t * 0.04;

      BUILT.forEach((sl, i) => {
        const isActive = activeSlice === i;
        const expandR = isActive ? radius + 18 : radius;
        const innerR = radius * 0.28;

        // Segment
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, expandR, sl.start + globalRot, sl.end + globalRot);
        ctx.closePath();

        // Fill
        const hex = sl.color.replace("#", "");
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);

        if (isActive) {
          ctx.fillStyle = `rgba(${r},${g},${b},0.22)`;
          ctx.shadowBlur = 32;
          ctx.shadowColor = `rgba(${r},${g},${b},0.60)`;
        } else {
          ctx.fillStyle = `rgba(${r},${g},${b},0.06)`;
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Stroke
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, expandR, sl.start + globalRot, sl.end + globalRot);
        ctx.closePath();
        ctx.strokeStyle = isActive
          ? `rgba(${r},${g},${b},0.80)`
          : `rgba(${r},${g},${b},0.20)`;
        ctx.lineWidth = isActive ? 1.5 : 0.8;
        ctx.stroke();

        // Inner arc cutout stroke
        ctx.beginPath();
        ctx.arc(cx, cy, innerR, sl.start + globalRot, sl.end + globalRot);
        ctx.strokeStyle = `rgba(${r},${g},${b},${isActive ? 0.50 : 0.12})`;
        ctx.lineWidth = isActive ? 1 : 0.5;
        ctx.stroke();

        // Label at midpoint
        const midAngle = sl.mid + globalRot;
        const labelR = radius * 0.65;
        const lx = cx + Math.cos(midAngle) * labelR;
        const ly = cy + Math.sin(midAngle) * labelR;

        ctx.save();
        ctx.globalAlpha = isActive ? 1 : 0.45;
        ctx.font = `300 ${isActive ? 11 : 9}px 'DM Mono',monospace`;
        ctx.fillStyle = sl.color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.letterSpacing = "0.12em";
        ctx.fillText(sl.label.toUpperCase(), lx, ly);

        // Percentage
        ctx.font = `300 7px 'DM Mono',monospace`;
        ctx.fillStyle = `rgba(${r},${g},${b},0.55)`;
        ctx.fillText(`${sl.value}%`, lx, ly + 14);
        ctx.restore();

        // Tick mark at segment edge
        const tickAngle = sl.end + globalRot;
        const tx1 = cx + Math.cos(tickAngle) * (innerR + 2);
        const ty1 = cy + Math.sin(tickAngle) * (innerR + 2);
        const tx2 = cx + Math.cos(tickAngle) * (expandR - 2);
        const ty2 = cy + Math.sin(tickAngle) * (expandR - 2);
        ctx.beginPath();
        ctx.moveTo(tx1, ty1);
        ctx.lineTo(tx2, ty2);
        ctx.strokeStyle = `rgba(${r},${g},${b},0.15)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // ── Centre ring ──
      // Outer rings
      for (let ring = 0; ring < 3; ring++) {
        const ringR = radius * 0.28 * (1 - ring * 0.18);
        const pulse = 0.5 + 0.5 * Math.sin(t * (0.8 + ring * 0.2));
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(184,240,255,${0.06 + pulse * 0.04})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // Centre label
      if (activeSlice >= 0) {
        const sl = BUILT[activeSlice];
        const hex = sl.color.replace("#", "");
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);

        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.font = `italic 300 ${radius * 0.12}px 'Bodoni Moda',Georgia,serif`;
        ctx.fillStyle = `rgba(${r},${g},${b},0.90)`;
        ctx.fillText(sl.label, cx, cy - radius * 0.04);

        ctx.font = `300 8px 'DM Mono',monospace`;
        ctx.fillStyle = `rgba(${r},${g},${b},0.55)`;
        ctx.fillText(sl.detail, cx, cy + radius * 0.08);
        ctx.restore();
      } else {
        ctx.save();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = `italic 300 ${radius * 0.09}px 'Bodoni Moda',Georgia,serif`;
        ctx.fillStyle = `rgba(255,255,255,0.20)`;
        ctx.fillText("Contact", cx, cy - radius * 0.04);
        ctx.font = `300 7px 'DM Mono',monospace`;
        ctx.fillStyle = `rgba(255,255,255,0.12)`;
        ctx.fillText("hover a slice", cx, cy + radius * 0.08);
        ctx.restore();
      }
    };

    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [activeSlice, scrollProgress]);

  return (
    <canvas
      ref={ref}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

// ─── CONTACT PAGE ─────────────────────────────────────────────────────────────
export default function ContactPage() {
  const [activeSlice, setActiveSlice] = useState(-1);
  const [scrollY, setScrollY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const totalHeight = 3000; // scroll length
  const scrollProgress = Math.min(scrollY / totalHeight, 1);

  // Which slice is "revealed" by scroll position
  const scrollSlice = Math.floor(scrollProgress * SLICES.length);
  const displaySlice = activeSlice >= 0 ? activeSlice : scrollSlice < SLICES.length ? scrollSlice : -1;

  const activeData = displaySlice >= 0 ? BUILT[displaySlice] : null;

  return (
    <div ref={containerRef} style={{ height: totalHeight + "px", position: "relative", background: "#080706" }}>
      {/* ── FIXED FULL-SCREEN STAGE ── */}
      <div style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
      }}>
        {/* LEFT: Pie canvas */}
        <div style={{
          position: "relative",
          transform: `translateY(${-scrollY * 0.06}px)`, // parallax
          transition: "transform 0.05s linear",
        }}>
          <PieCanvas
            activeSlice={displaySlice}
            onSliceHover={setActiveSlice}
            scrollProgress={scrollProgress}
          />
        </div>

        {/* RIGHT: Detail panel */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 clamp(32px,5vw,80px)",
          borderLeft: "1px solid rgba(255,255,255,0.06)",
          transform: `translateY(${-scrollY * 0.03}px)`,
          transition: "transform 0.05s linear",
        }}>
          {/* Header — always visible */}
          <div style={{ marginBottom: 56 }}>
            <div style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: 7, letterSpacing: "0.32em",
              color: "rgba(255,255,255,0.22)", textTransform: "uppercase", marginBottom: 16,
            }}>Domani — Contact</div>
            <h1 style={{
              fontFamily: "'Bodoni Moda',Georgia,serif",
              fontStyle: "italic", fontWeight: 400,
              fontSize: "clamp(40px,6vw,88px)",
              letterSpacing: "-0.03em", lineHeight: 0.90,
              color: "#fff", margin: 0,
            }}>
              Let's<br/>
              <span style={{ color: "rgba(255,255,255,0.28)" }}>Build.</span>
            </h1>
          </div>

          {/* Active slice detail */}
          {activeData ? (
            <div key={activeData.id} style={{ animation: "fadeUp 0.4s ease" }}>
              <div style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: 7, letterSpacing: "0.28em",
                color: activeData.color,
                textTransform: "uppercase", marginBottom: 16,
                opacity: 0.75,
              }}>
                {activeData.value}% of our reach
              </div>

              <h2 style={{
                fontFamily: "'Bodoni Moda',Georgia,serif",
                fontStyle: "italic", fontWeight: 400,
                fontSize: "clamp(28px,4vw,56px)",
                letterSpacing: "-0.02em", lineHeight: 1,
                color: "#fff", margin: "0 0 8px",
              }}>{activeData.label}</h2>

              <div style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: 11, letterSpacing: "0.08em",
                color: activeData.color,
                marginBottom: 24,
              }}>{activeData.detail}</div>

              <p style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: 8.5, letterSpacing: "0.07em",
                color: "rgba(255,255,255,0.40)", lineHeight: 1.85, margin: "0 0 32px",
              }}>{activeData.desc}</p>

              <a href={activeData.action} target="_blank" rel="noopener noreferrer" style={{
                display: "inline-block",
                fontFamily: "'DM Mono',monospace",
                fontSize: 8, letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: "rgba(8,7,6,1)",
                background: activeData.color,
                padding: "13px 28px",
                textDecoration: "none",
                boxShadow: `0 0 32px ${activeData.color}44`,
                transition: "box-shadow 0.3s",
              }}>{activeData.cta}</a>
            </div>
          ) : (
            <div>
              <p style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: 8.5, letterSpacing: "0.07em",
                color: "rgba(255,255,255,0.28)", lineHeight: 1.9, marginBottom: 32,
              }}>
                We exist across five channels.<br/>
                Hover the chart or scroll to explore each one.<br/>
                Building something that matters? We want to hear it.
              </p>
              {/* Location coordinates */}
              <div style={{
                fontFamily: "'DM Mono',monospace",
                fontSize: 7, letterSpacing: "0.18em",
                color: "rgba(255,255,255,0.16)", lineHeight: 2.2,
              }}>
                9.0577° N, 7.4951° E<br/>
                Abuja, Nigeria — Worldwide<br/>
                Dom-001 · 2026
              </div>
            </div>
          )}

          {/* Scroll cue — fades out as you scroll */}
          <div style={{
            position: "absolute", bottom: 36, left: "50%",
            transform: "translateX(-50%)",
            opacity: Math.max(0, 1 - scrollProgress * 5),
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          }}>
            <div style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: 6.5, letterSpacing: "0.22em",
              color: "rgba(255,255,255,0.22)", textTransform: "uppercase",
            }}>Scroll to explore</div>
            <div style={{
              width: 1, height: 32,
              background: "linear-gradient(to bottom, rgba(255,255,255,0.25), transparent)",
              animation: "scrollPulse 2s ease-in-out infinite",
            }}/>
          </div>
        </div>
      </div>

      {/* ── SCROLL MARKERS — trigger section reveals ── */}
      {/* These are invisible elements that set scroll context */}
      {SLICES.map((sl, i) => (
        <div key={sl.id} style={{
          position: "absolute",
          top: `${(i / SLICES.length) * 100}%`,
          left: 0, right: 0, height: 1,
          pointerEvents: "none",
        }}/>
      ))}

      {/* ── FOOTER at bottom of scroll ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "clamp(32px,5vw,60px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        flexWrap: "wrap", gap: 20,
      }}>
        <div style={{
          fontFamily: "'DM Mono',monospace",
          fontSize: 7, letterSpacing: "0.18em",
          color: "rgba(255,255,255,0.15)", lineHeight: 2,
          textTransform: "uppercase",
        }}>
          Domani Studio · Dom-001 · 2026
        </div>
        <a href="mailto:hello@domani.studio" style={{
          fontFamily: "'Bodoni Moda',Georgia,serif",
          fontStyle: "italic", fontSize: "clamp(16px,2.5vw,28px)",
          color: "rgba(255,255,255,0.45)", textDecoration: "none",
          borderBottom: "1px solid rgba(255,255,255,0.18)", paddingBottom: 2,
        }}>hello@domani.studio →</a>
      </div>

      <style>{`
        * { box-sizing: border-box; cursor: none !important; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scrollPulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        @media (max-width: 768px) {
          * { cursor: auto !important; }
          div[style*="grid-template-columns: 1fr 1fr"] {
            display: flex !important; flex-direction: column !important;
          }
          div[style*="border-left: 1px solid rgba(255,255,255,0.06)"] {
            border-left: none !important;
            border-top: 1px solid rgba(255,255,255,0.06) !important;
          }
        }
      `}</style>
    </div>
  );
}