"use client";
import { useState, useEffect, useRef } from "react";

const VENTURES = [
  {
    id: "ydbi",
    name: "YDBI",
    full: "Your Digital Butler Intelligence",
    tagline: "The AI that thinks ahead.",
    desc: "YDBI is a spatial AI presence for high-performing individuals and teams. Voice-native, context-aware, memory-rich. It connects to your calendar, files, email and anticipates your next move before you ask.",
    status: "In Development",
    year: "2025",
    stack: ["Anthropic Claude", "Next.js 15", "Swift / SwiftUI", "Kotlin", "pgvector"],
    accent: "#B8F0FF",
    category: "AI Product",
    phase: "Phase 3 — Butler Orchestration",
    metrics: [{ l: "SQL Migrations", v: "16" }, { l: "DB Tables", v: "29" }, { l: "Platforms", v: "3" }],
    href: "#",
  },
  {
    id: "infinitswap",
    name: "Infinitswap",
    full: "The WhatsApp Exchange",
    tagline: "Crypto-fiat for the continent.",
    desc: "Infinitswap is a USDT-native crypto-fiat exchange that runs entirely inside WhatsApp. Four countries. Four-tier KYC. P2P ledger. Bank + Mobile Money rails. Built for the 600 million unbanked Africans who already have WhatsApp.",
    status: "Active Engineering",
    year: "2024",
    stack: ["Node.js / Fastify", "Prisma / Postgres", "Redis", "Infobip", "Flutterwave"],
    accent: "#FF9A3C",
    category: "Fintech",
    phase: "Active — Production",
    metrics: [{ l: "Countries", v: "4" }, { l: "KYC Tiers", v: "4" }, { l: "Payment Rails", v: "6+" }],
    href: "#",
  },
  {
    id: "veyra",
    name: "Veyra",
    full: "Fashion Intelligence",
    tagline: "Your wardrobe, made intelligent.",
    desc: "Veyra is an AI-powered fashion intelligence app for women 20–35. It builds a style DNA profile, maps your wardrobe graph, and answers the question you ask every morning: what should I wear today?",
    status: "In Development",
    year: "2025",
    stack: ["Next.js 15", "Anthropic Claude", "pgvector", "Figma", "React Native"],
    accent: "#FFB8D9",
    category: "Consumer AI",
    phase: "Phase 1 — Product Design",
    metrics: [{ l: "Core Screens", v: "6" }, { l: "AI Layers", v: "4" }, { l: "Wardrobe APIs", v: "1" }],
    href: "#",
  },
  {
    id: "syntri",
    name: "SyntriAI",
    full: "Data Synthesis Intelligence",
    tagline: "Signal from noise, in real time.",
    desc: "SyntriAI connects disparate data sources into a single intelligent synthesis layer. It detects patterns, generates insights, and surfaces anomalies — whether you're monitoring a product, a market, or an operation.",
    status: "Beta",
    year: "2026",
    stack: ["Python", "FastAPI", "PostgreSQL", "Redis", "Anthropic Claude"],
    accent: "#4DFFA8",
    category: "Data Intelligence",
    phase: "Beta — First Customers",
    metrics: [{ l: "Data Sources", v: "20+" }, { l: "Latency", v: "<2s" }, { l: "Uptime", v: "99.9%" }],
    href: "#",
  },
];

// ─── ORBIT CANVAS (background) ────────────────────────────────────────────────
function OrbitBg() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const t0 = useRef(performance.now());

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;

    const draw = () => {
      raf.current = requestAnimationFrame(draw);
      const W = c.width = c.offsetWidth || 800;
      const H = c.height = c.offsetHeight || 600;
      const t = (performance.now() - t0.current) / 1000;
      const cx = W * 0.5, cy = H * 0.5;

      ctx.fillStyle = "rgba(8,7,6,1)";
      ctx.fillRect(0, 0, W, H);

      // Grain
      ctx.save();
      for (let i = 0; i < 800; i++) {
        const x = Math.random() * W;
        const y = Math.random() * H;
        const a = Math.random() * 0.015;
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fillRect(x, y, 1, 1);
      }
      ctx.restore();

      // Elliptical orbits for each venture
      const orbitData = [
        { rx: W * 0.38, ry: H * 0.22, rot: 0.1, speed: 0.12, color: "#B8F0FF", r: 4 },
        { rx: W * 0.28, ry: H * 0.32, rot: 0.6, speed: -0.08, color: "#FF9A3C", r: 3.5 },
        { rx: W * 0.45, ry: H * 0.18, rot: -0.3, speed: 0.06, color: "#FFB8D9", r: 3 },
        { rx: W * 0.20, ry: H * 0.38, rot: 1.1, speed: 0.15, color: "#4DFFA8", r: 3 },
      ];

      orbitData.forEach((o, i) => {
        const angle = t * o.speed + o.rot;
        const ox = cx + Math.cos(angle) * o.rx;
        const oy = cy + Math.sin(angle) * o.ry;
        const hex = o.color.replace("#", "");
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.1 + i * 1.3);

        // Trail
        for (let tr = 1; tr <= 18; tr++) {
          const ta = angle - tr * 0.06;
          const tx = cx + Math.cos(ta) * o.rx;
          const ty = cy + Math.sin(ta) * o.ry;
          ctx.beginPath();
          ctx.arc(tx, ty, o.r * (1 - tr / 18), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${(0.06 * (1 - tr / 18)) * pulse})`;
          ctx.fill();
        }

        // Dot
        ctx.beginPath();
        ctx.arc(ox, oy, o.r, 0, Math.PI * 2);
        ctx.shadowBlur = 12;
        ctx.shadowColor = `rgba(${r},${g},${b},0.8)`;
        ctx.fillStyle = `rgba(${r},${g},${b},${0.6 + pulse * 0.3})`;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Orbit path (very faint)
        ctx.save();
        ctx.translate(cx, cy);
        ctx.beginPath();
        ctx.ellipse(0, 0, o.rx, o.ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r},${g},${b},0.04)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.restore();
      });

      // Vignette
      const vg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7);
      vg.addColorStop(0.3, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(8,7,6,0.90)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
    };

    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <canvas ref={ref} style={{
      position: "absolute", inset: 0, width: "100%", height: "100%", display: "block",
    }}/>
  );
}

// ─── VENTURE CARD ──────────────────────────────────────────────────────────────
function VentureCard({ venture, index, expanded, onExpand }: {
  venture: typeof VENTURES[0];
  index: number;
  expanded: boolean;
  onExpand: () => void;
}) {
  const hex = venture.accent.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const aC = (a: number) => `rgba(${r},${g},${b},${a})`;

  return (
    <div
      onClick={onExpand}
      style={{
        borderBottom: `1px solid ${expanded ? aC(0.25) : "rgba(255,255,255,0.07)"}`,
        background: expanded ? aC(0.04) : "transparent",
        transition: "background 0.3s, border-color 0.3s",
        cursor: "none",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Beam on expand */}
      {expanded && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `linear-gradient(180deg, ${aC(0.08)} 0%, transparent 100%)`,
        }}/>
      )}

      {/* Header row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "40px 1fr auto auto",
        alignItems: "center",
        gap: "0 24px",
        padding: "clamp(20px,3vw,32px) clamp(20px,5vw,60px)",
      }}>
        {/* Index */}
        <span style={{
          fontFamily: "'DM Mono',monospace", fontSize: 8,
          letterSpacing: "0.18em", color: "rgba(255,255,255,0.22)",
        }}>{String(index + 1).padStart(2, "0")}</span>

        {/* Name */}
        <div>
          <div style={{
            fontFamily: "'Bodoni Moda',Georgia,serif",
            fontStyle: "italic", fontWeight: 400,
            fontSize: "clamp(24px,3.5vw,52px)",
            letterSpacing: "-0.02em", lineHeight: 1,
            color: expanded ? "#fff" : "rgba(255,255,255,0.80)",
            textShadow: expanded ? `0 0 40px ${aC(0.30)}` : "none",
            transition: "color 0.2s, text-shadow 0.2s",
          }}>{venture.name}</div>
          {!expanded && (
            <div style={{
              fontFamily: "'DM Mono',monospace", fontSize: 7.5,
              letterSpacing: "0.10em", color: "rgba(255,255,255,0.28)", marginTop: 4,
            }}>{venture.full}</div>
          )}
        </div>

        {/* Status badge */}
        <div style={{
          fontFamily: "'DM Mono',monospace", fontSize: 6.5,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: aC(0.80), border: `1px solid ${aC(0.35)}`,
          padding: "3px 10px", whiteSpace: "nowrap",
        }}>{venture.status}</div>

        {/* Toggle */}
        <div style={{
          width: 24, height: 24,
          border: "1px solid rgba(255,255,255,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "rgba(255,255,255,0.40)", fontSize: 14,
          transform: expanded ? "rotate(45deg)" : "none",
          transition: "transform 0.3s",
        }}>+</div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{
          padding: "0 clamp(20px,5vw,60px) clamp(24px,4vw,48px)",
          paddingLeft: "calc(clamp(20px,5vw,60px) + 64px)",
          animation: "expandIn 0.35s ease",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr clamp(180px,25vw,280px)", gap: 48, alignItems: "start" }}>
            {/* Left */}
            <div>
              <p style={{
                fontFamily: "'DM Mono',monospace", fontSize: 8.5,
                letterSpacing: "0.07em", color: "rgba(255,255,255,0.45)",
                lineHeight: 1.9, margin: "0 0 24px",
              }}>{venture.desc}</p>

              {/* Stack */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 6.5, letterSpacing: "0.22em", color: "rgba(255,255,255,0.22)", textTransform: "uppercase", marginBottom: 10 }}>Stack</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {venture.stack.map(s => (
                    <span key={s} style={{
                      fontFamily: "'DM Mono',monospace", fontSize: 7,
                      letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)",
                      border: "1px solid rgba(255,255,255,0.10)", padding: "3px 10px",
                    }}>{s}</span>
                  ))}
                </div>
              </div>

              <div style={{
                fontFamily: "'DM Mono',monospace", fontSize: 7,
                letterSpacing: "0.14em", color: aC(0.60),
                marginBottom: 20,
              }}>{venture.phase}</div>
            </div>

            {/* Right: metrics */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {venture.metrics.map(m => (
                <div key={m.l} style={{
                  padding: "16px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div style={{
                    fontFamily: "'Bodoni Moda',Georgia,serif", fontStyle: "italic",
                    fontSize: 36, color: aC(0.90), lineHeight: 1,
                  }}>{m.v}</div>
                  <div style={{
                    fontFamily: "'DM Mono',monospace", fontSize: 7,
                    letterSpacing: "0.16em", color: "rgba(255,255,255,0.25)",
                    textTransform: "uppercase", marginTop: 4,
                  }}>{m.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── VENTURES PAGE ────────────────────────────────────────────────────────────
export default function VenturesPage() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div style={{ minHeight: "100vh", background: "#080706", color: "#fff", paddingTop: 60, position: "relative", overflow: "hidden" }}>
      {/* Background orbit canvas */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, opacity: 0.7 }}>
        <OrbitBg />
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Hero */}
        <div style={{
          padding: "clamp(48px,8vw,100px) clamp(20px,5vw,60px) clamp(32px,5vw,60px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          <div style={{
            fontFamily: "'DM Mono',monospace", fontSize: 7,
            letterSpacing: "0.32em", color: "rgba(255,255,255,0.22)",
            textTransform: "uppercase", marginBottom: 20,
          }}>Domani — Ventures</div>

          <h1 style={{
            fontFamily: "'Bodoni Moda',Georgia,serif",
            fontStyle: "italic", fontWeight: 400,
            fontSize: "clamp(52px,10vw,140px)",
            letterSpacing: "-0.04em", lineHeight: 0.86,
            color: "#fff", margin: "0 0 20px",
          }}>
            We build<br/>
            <span style={{ color: "rgba(255,255,255,0.22)" }}>for ourselves</span><br/>
            as well.
          </h1>

          <p style={{
            fontFamily: "'DM Mono',monospace", fontSize: 8.5,
            letterSpacing: "0.07em", color: "rgba(255,255,255,0.30)",
            maxWidth: 480, lineHeight: 1.85, margin: 0,
          }}>
            Domani is simultaneously a studio and a product company. These are the systems we're building for ourselves — and, eventually, for you.
          </p>
        </div>

        {/* Venture list */}
        <div>
          {VENTURES.map((v, i) => (
            <VentureCard
              key={v.id}
              venture={v}
              index={i}
              expanded={expanded === i}
              onExpand={() => setExpanded(expanded === i ? null : i)}
            />
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: "clamp(32px,5vw,60px)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          fontFamily: "'DM Mono',monospace", fontSize: 7,
          letterSpacing: "0.18em", color: "rgba(255,255,255,0.15)",
          lineHeight: 2, textTransform: "uppercase",
        }}>
          Domani Ventures — Dom-001 · 2026<br/>
          Building the companies of tomorrow.
        </div>
      </div>

      <style>{`
        * { cursor: none !important; box-sizing: border-box; }
        @keyframes expandIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 768px) {
          * { cursor: auto !important; }
          div[style*="grid-template-columns: 1fr clamp(180px"] {
            display: flex !important; flex-direction: column !important;
            gap: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}