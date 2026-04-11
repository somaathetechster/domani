"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── TYPES ────────────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  category: string;
  name: string;
  tagline: string;
  desc: string;
  longDesc: string;
  price: number | 0; // 0 = free
  badge?: string;
  tags: string[];
  accent: string;
  previewBg: string;
}

// ─── PRODUCT DATA ─────────────────────────────────────────────────────────────
export const PRODUCTS: Product[] = [
  {
    id: "ydbi-pro",
    category: "AI TOOLS",
    name: "YDBI Pro",
    tagline: "Your Digital Butler Intelligence",
    desc: "Spatial AI presence. Voice-native, context-aware, always on.",
    longDesc: "YDBI Pro is Domani's flagship AI assistant platform. Connect it to your calendar, files, email, and browser. It thinks ahead, surfaces what you need before you ask, and executes tasks in natural language. Built on Claude, powered by Domani's orchestration layer.",
    price: 49,
    badge: "New",
    tags: ["AI", "Voice", "Automation", "Calendar", "Email"],
    accent: "#B8F0FF",
    previewBg: "#02080F",
  },
  {
    id: "syntri",
    category: "AI TOOLS",
    name: "SyntriAI",
    tagline: "Intelligent data synthesis engine",
    desc: "Connect disparate data sources. Real-time synthesis and signal extraction.",
    longDesc: "SyntriAI connects your data warehouse, APIs, and analytics platforms into a single intelligent layer. It detects patterns, generates insights, and surfaces anomalies — all in real time. Embeddable via REST API or as a standalone dashboard.",
    price: 120,
    badge: "Beta",
    tags: ["Data", "AI", "Analytics", "API", "Real-time"],
    accent: "#4DFFA8",
    previewBg: "#021208",
  },
  {
    id: "orbit-brand-kit",
    category: "BRAND KITS",
    name: "Orbit Brand Kit",
    tagline: "The complete Domani identity system",
    desc: "Full brand system: mark, type scales, tokens, motion specs, Figma library.",
    longDesc: "Everything Domani uses internally — the Orbit mark in every format (SVG, AI, EPS, PNG, WebP), the complete type scale, color token system, spacing system, motion specification document, and a fully structured Figma library with auto-layout components.",
    price: 299,
    tags: ["Figma", "SVG", "Design Tokens", "Identity", "Motion"],
    accent: "#FFB347",
    previewBg: "#100800",
  },
  {
    id: "system-one",
    category: "INFRASTRUCTURE",
    name: "System One",
    tagline: "Next.js 15 production scaffold",
    desc: "The exact Domani stack. Next.js 15, R3F, GSAP, Lenis. Launch-ready.",
    longDesc: "System One is the production scaffold Domani uses internally. Next.js 15 App Router, React Three Fiber for canvas, GSAP for complex animations, Lenis for smooth scroll, custom cursor, page transitions, loading screen system, DM Mono + Bodoni Moda typography pre-configured.",
    price: 189,
    badge: "Popular",
    tags: ["Next.js", "R3F", "GSAP", "TypeScript", "Tailwind"],
    accent: "#A78BFF",
    previewBg: "#060010",
  },
  {
    id: "flow-templates",
    category: "TEMPLATES",
    name: "Flow Templates",
    tagline: "Motion-first landing templates",
    desc: "12 premium landing page templates. Canvas animations, scroll choreography.",
    longDesc: "Twelve production-ready landing page templates built on Domani's design system. Each includes full canvas animation system, scroll-choreographed reveals, mobile-optimised layouts, and a component library that works standalone or with any React framework.",
    price: 149,
    tags: ["Templates", "Motion", "React", "Mobile", "12 layouts"],
    accent: "#B8F0FF",
    previewBg: "#020508",
  },
  {
    id: "design-tokens",
    category: "TEMPLATES",
    name: "Design Token System",
    tagline: "Cross-platform design foundations",
    desc: "Semantic tokens: Figma variables, CSS props, JS/TS exports, dark/light.",
    longDesc: "A production-ready semantic token architecture for enterprise design systems. Ships with Figma variables (auto-syncing), CSS custom properties, JavaScript/TypeScript exports, and dark/light theme primitives. Includes motion, spacing, elevation, and color tokens.",
    price: 0,
    tags: ["Open Source", "Figma", "CSS", "TypeScript", "Dark Mode"],
    accent: "#4DFFA8",
    previewBg: "#010A04",
  },
  {
    id: "infinitswap-api",
    category: "INFRASTRUCTURE",
    name: "Infinitswap API",
    tagline: "Crypto-fiat exchange infrastructure",
    desc: "WhatsApp-native crypto exchange backend. Multi-country, KYC tiers, P2P.",
    longDesc: "Production-grade WhatsApp-native crypto-fiat exchange system. Covers Nigeria, Ghana, Tanzania, South Africa. Includes four-tier KYC (SmileID), P2P ledger with perspective entries, multi-rail payouts (bank + MoMo), Redis locks, Flutterwave, Paystack, Reloadly integrations.",
    price: -1, // contact
    tags: ["Fintech", "Node.js", "Fastify", "Prisma", "Multi-country"],
    accent: "#B8F0FF",
    previewBg: "#020408",
  },
  {
    id: "veyra-kit",
    category: "AI TOOLS",
    name: "Veyra Starter Kit",
    tagline: "Fashion AI integration layer",
    desc: "Wardrobe intelligence API. Context engine, styling recommendations.",
    longDesc: "The wardrobe intelligence API powering Veyra. Includes the user model (style DNA, body model, preference graph), wardrobe graph (items, outfits, occasions), context engine (weather, events, mood), and styling recommendation API. Plug into any fashion app.",
    price: 79,
    badge: "New",
    tags: ["Fashion", "AI", "API", "Node.js", "pgvector"],
    accent: "#FFB8D9",
    previewBg: "#100208",
  },
];

export const CATEGORIES = ["ALL", "AI TOOLS", "BRAND KITS", "INFRASTRUCTURE", "TEMPLATES"];

// ─── MINI CANVAS PREVIEW ─────────────────────────────────────────────────────
function MiniPreview({ product, visible }: { product: Product; visible: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const t0 = useRef(performance.now());

  useEffect(() => {
    if (!visible || !ref.current) return;
    const c = ref.current;
    const ctx = c.getContext("2d")!;

    const draw = () => {
      raf.current = requestAnimationFrame(draw);
      const W = c.width = c.offsetWidth || 320;
      const H = c.height = c.offsetHeight || 240;
      const t = (performance.now() - t0.current) / 1000;
      const accent = product.accent;

      // hex to rgb
      const hex = accent.replace("#", "");
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const aC = (a: number) => `rgba(${r},${g},${b},${a})`;

      // Background
      const bg = product.previewBg;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Abstract visualisation — orbit spiral mini
      ctx.save();
      ctx.translate(W * 0.5, H * 0.5);
      ctx.rotate(t * 0.2);

      for (let arm = 0; arm < 4; arm++) {
        const off = (arm / 4) * Math.PI * 2;
        const scale = Math.min(W, H) * 0.28;
        ctx.beginPath();
        for (let i = 0; i <= 80; i++) {
          const theta = 0.1 + (i / 80) * Math.PI * 1.5;
          const ro = scale * 0.08 * Math.exp(0.295 * theta);
          const x = Math.cos(theta + off) * ro;
          const y = Math.sin(theta + off) * ro;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        const emissive = 0.5 + 0.5 * Math.sin(t * 1.3 + arm * 0.7);
        ctx.shadowBlur = 12;
        ctx.shadowColor = aC(emissive * 0.6);
        ctx.strokeStyle = aC(emissive * 0.75);
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Core
      const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, 8);
      cg.addColorStop(0, `rgba(255,255,255,0.9)`);
      cg.addColorStop(1, aC(0));
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Product name ghost
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.font = `italic 300 ${H * 0.45}px 'Bodoni Moda',Georgia,serif`;
      ctx.fillStyle = accent;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(product.name[0], W * 0.5, H * 0.5);
      ctx.restore();

      // Vignette
      const vg = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.7);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.75)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
    };

    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [visible, product]);

  return (
    <canvas
      ref={ref}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

// ─── PRODUCT ROW ─────────────────────────────────────────────────────────────
function ProductRow({ product, index }: { product: Product; index: number }) {
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

  const priceLabel =
    product.price === -1 ? "Contact" :
    product.price === 0 ? "Free" :
    `$${product.price}`;

  const handleOpen = () => {
    router.push(`/store/${product.id}`);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleOpen}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        cursor: "none",
        position: "relative",
        overflow: "hidden",
        background: hovered ? "rgba(255,255,255,0.03)" : "transparent",
        transition: "background 0.2s",
      }}
    >
      {/* Hover image — right side, absolutely positioned */}
      <div style={{
        position: "absolute",
        right: 180,
        top: "50%",
        transform: `translateY(-50%) scale(${hovered ? 1 : 0.92})`,
        width: 240,
        height: 160,
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.35s ease, transform 0.35s ease",
        zIndex: 2,
        pointerEvents: "none",
        border: `1px solid ${product.accent}22`,
        overflow: "hidden",
      }}>
        <MiniPreview product={product} visible={hovered} />
        {/* Open button overlay */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          background: "rgba(0,0,0,0.6)",
          border: "1px solid rgba(255,255,255,0.25)",
          padding: "6px 16px",
          fontFamily: "'DM Mono',monospace",
          fontSize: 9,
          letterSpacing: "0.20em",
          color: "rgba(255,255,255,0.85)",
          textTransform: "uppercase",
          backdropFilter: "blur(8px)",
        }}>Open</div>
      </div>

      {/* Left: Name + tagline */}
      <div style={{ padding: "28px 0", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 20, flexWrap: "wrap" }}>
          <span style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: 9,
            letterSpacing: "0.16em",
            color: "rgba(255,255,255,0.25)",
            minWidth: 32,
          }}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span style={{
            fontFamily: "var(--font-display, 'Bodoni Moda',Georgia,serif)",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(22px, 3.5vw, 48px)",
            letterSpacing: "-0.02em",
            lineHeight: 1,
            color: hovered ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.85)",
            transition: "color 0.2s",
          }}>
            {product.name}
          </span>
          {product.badge && (
            <span style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: 7,
              letterSpacing: "0.20em",
              color: product.accent,
              border: `1px solid ${product.accent}66`,
              padding: "2px 8px",
              textTransform: "uppercase",
            }}>{product.badge}</span>
          )}
        </div>
        <div style={{
          fontFamily: "'DM Mono',monospace",
          fontSize: 8,
          letterSpacing: "0.10em",
          color: "rgba(255,255,255,0.30)",
          marginTop: 6,
          paddingLeft: 52,
        }}>{product.tagline}</div>
      </div>

      {/* Right: price */}
      <div style={{
        padding: "28px 0",
        textAlign: "right",
        zIndex: 1,
        minWidth: 120,
      }}>
        <span style={{
          fontFamily: "'DM Mono',monospace",
          fontSize: product.price === -1 ? 10 : 16,
          letterSpacing: product.price === -1 ? "0.16em" : "0.02em",
          color: product.price === 0 ? product.accent : "rgba(255,255,255,0.75)",
          fontWeight: 300,
        }}>{priceLabel}</span>
      </div>
    </div>
  );
}

// ─── MAIN STORE PAGE ─────────────────────────────────────────────────────────
export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [menuOpen, setMenuOpen] = useState(false);

  const filtered = activeCategory === "ALL"
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0D0C0B",
      color: "#fff",
      paddingTop: 60,
    }}>
      {/* ── TOP NAV ── */}
      <div style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        height: 60,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 clamp(20px, 5vw, 60px)",
        background: "rgba(13,12,11,0.92)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: 10,
            letterSpacing: "0.48em",
            color: "rgba(184,240,255,0.80)",
            textTransform: "uppercase",
          }}>DOMANI</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link href="/store/cart" style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: 8,
            letterSpacing: "0.22em",
            color: "rgba(255,255,255,0.55)",
            textDecoration: "none",
            textTransform: "uppercase",
          }}>Cart (0)</Link>
          <Link href="/store/account" style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: 8,
            letterSpacing: "0.22em",
            color: "rgba(255,255,255,0.55)",
            textDecoration: "none",
            textTransform: "uppercase",
          }}>Login</Link>
          <button
            onClick={() => setMenuOpen(true)}
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: 8,
              letterSpacing: "0.22em",
              color: "rgba(255,255,255,0.55)",
              background: "none",
              border: "none",
              cursor: "none",
              textTransform: "uppercase",
            }}>Menu</button>
        </div>
      </div>

      {/* ── HERO ── */}
      <div style={{
        padding: "clamp(48px,8vw,100px) clamp(20px,5vw,60px) clamp(32px,5vw,60px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <h1 style={{
          fontFamily: "'DM Mono',monospace",
          fontSize: "clamp(40px,8vw,120px)",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 0.88,
          color: "#fff",
          margin: 0,
          textTransform: "uppercase",
        }}>
          Domani<br/>
          <span style={{ color: "rgba(255,255,255,0.28)" }}>Store</span>
        </h1>
      </div>

      {/* ── CATEGORY FILTER ── */}
      <div style={{
        display: "flex",
        gap: 0,
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        overflowX: "auto",
        msOverflowStyle: "none",
        scrollbarWidth: "none",
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: 8,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              padding: "16px clamp(16px,3vw,32px)",
              background: "none",
              border: "none",
              borderBottom: activeCategory === cat ? "2px solid #fff" : "2px solid transparent",
              color: activeCategory === cat ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.30)",
              cursor: "none",
              whiteSpace: "nowrap",
              transition: "color 0.2s, border-color 0.2s",
              flexShrink: 0,
            }}
          >{cat}</button>
        ))}
      </div>

      {/* ── PRODUCT LIST ── */}
      <div style={{ padding: "0 clamp(20px,5vw,60px)" }}>
        {filtered.map((product, i) => (
          <ProductRow key={product.id} product={product} index={i} />
        ))}
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        padding: "clamp(32px,5vw,60px)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        fontFamily: "'DM Mono',monospace",
        fontSize: 7,
        letterSpacing: "0.18em",
        color: "rgba(255,255,255,0.18)",
        textTransform: "uppercase",
        lineHeight: 2,
      }}>
        All digital products. Instant delivery.<br />
        Enterprise licensing available — <a href="/contact" style={{ color: "rgba(255,255,255,0.40)", textDecoration: "none" }}>contact us</a>.
      </div>

      <style>{`
        ::-webkit-scrollbar { display: none; }
        * { cursor: none !important; box-sizing: border-box; }
        @media (max-width: 768px) {
          * { cursor: auto !important; }
        }
      `}</style>
    </div>
  );
}