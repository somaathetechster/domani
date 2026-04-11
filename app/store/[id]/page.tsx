"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PRODUCTS, Product } from "../page";

// ─── LARGE PRODUCT CANVAS ────────────────────────────────────────────────────
function ProductCanvas({ product }: { product: Product }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const t0 = useRef(performance.now());

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;

    const hex = product.accent.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const aC = (a: number) => `rgba(${r},${g},${b},${a})`;

    const draw = () => {
      raf.current = requestAnimationFrame(draw);
      const W = c.width = c.offsetWidth || 640;
      const H = c.height = c.offsetHeight || 480;
      const t = (performance.now() - t0.current) / 1000;

      ctx.fillStyle = product.previewBg;
      ctx.fillRect(0, 0, W, H);

      const cx = W * 0.5, cy = H * 0.5;
      const scale = Math.min(W, H) * 0.32;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.15);

      // 4-arm spiral
      for (let arm = 0; arm < 4; arm++) {
        const off = (arm / 4) * Math.PI * 2;
        const pts: {x:number;y:number}[] = [];
        for (let i = 0; i <= 100; i++) {
          const theta = 0.1 + (i / 100) * Math.PI * 1.54;
          const ro = scale * 0.082 * Math.exp(0.295 * theta);
          pts.push({ x: Math.cos(theta + off) * ro, y: Math.sin(theta + off) * ro });
        }
        const nrm = pts.map((_, i) => {
          const p = pts[Math.max(0, i - 1)], n = pts[Math.min(100, i + 1)];
          const dx = n.x - p.x, dy = n.y - p.y, len = Math.sqrt(dx*dx + dy*dy) || 1;
          return { nx: -dy/len, ny: dx/len };
        });
        const hw = (u: number) => scale * (2.8 + u * 9.5) * 0.012;

        ctx.beginPath();
        pts.forEach((p, i) => {
          const w = hw(i / 100);
          i === 0 ? ctx.moveTo(p.x + nrm[i].nx * w, p.y + nrm[i].ny * w)
                  : ctx.lineTo(p.x + nrm[i].nx * w, p.y + nrm[i].ny * w);
        });
        const lp = pts[100], ln = nrm[100], lw = hw(1);
        ctx.arc(lp.x, lp.y, lw, Math.atan2(ln.ny, ln.nx) - Math.PI/2, Math.atan2(ln.ny, ln.nx) + Math.PI/2);
        for (let i = 100; i >= 0; i--) {
          const w = hw(i / 100);
          ctx.lineTo(pts[i].x - nrm[i].nx * w, pts[i].y - nrm[i].ny * w);
        }
        const fp = pts[0], fn = nrm[0], fw = hw(0);
        ctx.arc(fp.x, fp.y, fw, Math.atan2(fn.ny, fn.nx) + Math.PI/2, Math.atan2(fn.ny, fn.nx) - Math.PI/2);
        ctx.closePath();

        ctx.fillStyle = "rgba(5,5,8,0.88)";
        ctx.fill();
        const gl = ctx.createLinearGradient(-scale*.3, -scale*.3, scale*.3, scale*.3);
        gl.addColorStop(0, aC(0.05));
        gl.addColorStop(0.28, aC(0.25));
        gl.addColorStop(0.55, aC(0.07));
        gl.addColorStop(1, "rgba(0,0,0,0.4)");
        ctx.fillStyle = gl;
        ctx.fill();

        const emissive = 0.55 + 0.45 * Math.sin(t * 1.3 + arm * 0.6);
        ctx.shadowBlur = 18;
        ctx.shadowColor = aC(emissive * 0.65);
        ctx.beginPath();
        pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.strokeStyle = aC(emissive * 0.85);
        ctx.lineWidth = scale * 0.022;
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = aC(0.35);
        ctx.lineWidth = scale * 0.006;
        ctx.stroke();
      }

      // Core
      const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, scale * 0.05);
      cg.addColorStop(0, "rgba(255,255,255,1)");
      cg.addColorStop(0.4, aC(0.9));
      cg.addColorStop(1, aC(0));
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(0, 0, scale * 0.05, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Ghost letter
      ctx.save();
      ctx.globalAlpha = 0.055;
      ctx.font = `italic 300 ${H * 0.65}px 'Bodoni Moda',Georgia,serif`;
      ctx.fillStyle = product.accent;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(product.name[0], cx, cy);
      ctx.restore();

      // Ambient glow
      const amb = ctx.createRadialGradient(cx, cy, 0, cx, cy, scale * 1.8);
      amb.addColorStop(0, aC(0.07));
      amb.addColorStop(1, aC(0));
      ctx.fillStyle = amb;
      ctx.fillRect(0, 0, W, H);

      // Vignette
      const vg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.75);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.80)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
    };

    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [product]);

  return <canvas ref={ref} style={{ width: "100%", height: "100%", display: "block" }} />;
}

// ─── PAGE ────────────────────────────────────────────────────────────────────
export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const product = PRODUCTS.find(p => p.id === params.id);
  const [cartAdded, setCartAdded] = useState(false);

  if (!product) {
    return (
      <div style={{ minHeight: "100vh", background: "#0D0C0B", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'DM Mono',monospace", color: "rgba(255,255,255,0.40)", letterSpacing: "0.20em" }}>PRODUCT NOT FOUND</span>
      </div>
    );
  }

  const priceLabel =
    product.price === -1 ? "Contact us" :
    product.price === 0  ? "Free" :
    `$${product.price}.00`;

  const handleAddToCart = () => {
    // Store in sessionStorage for cart
    const existing = JSON.parse(sessionStorage.getItem("domani_cart") || "[]");
    const already = existing.find((i: any) => i.id === product.id);
    if (!already) {
      existing.push({ id: product.id, name: product.name, price: product.price, accent: product.accent });
      sessionStorage.setItem("domani_cart", JSON.stringify(existing));
    }
    setCartAdded(true);
    setTimeout(() => router.push("/store/cart"), 800);
  };

  const catIdx = PRODUCTS.findIndex(p => p.id === product.id);
  const prev = PRODUCTS[catIdx - 1];
  const next = PRODUCTS[catIdx + 1];

  return (
    <div style={{ minHeight: "100vh", background: "#0D0C0B", color: "#fff", paddingTop: 60 }}>
      {/* TOP NAV */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 60, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(20px,5vw,60px)",
        background: "rgba(13,12,11,0.92)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.48em", color: "rgba(184,240,255,0.80)", textTransform: "uppercase" }}>DOMANI</span>
          </Link>
          <span style={{ color: "rgba(255,255,255,0.20)", fontSize: 12 }}>/</span>
          <Link href="/store" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.20em", color: "rgba(255,255,255,0.40)", textTransform: "uppercase" }}>Store</span>
          </Link>
          <span style={{ color: "rgba(255,255,255,0.20)", fontSize: 12 }}>/</span>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.20em", color: "rgba(255,255,255,0.65)", textTransform: "uppercase" }}>{product.name}</span>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          <Link href="/store/cart" style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.22em", color: "rgba(255,255,255,0.45)", textDecoration: "none", textTransform: "uppercase" }}>Cart</Link>
          <Link href="/store/account" style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.22em", color: "rgba(255,255,255,0.45)", textDecoration: "none", textTransform: "uppercase" }}>Login</Link>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr clamp(320px,38vw,520px)",
        minHeight: "calc(100vh - 60px)",
      }}>
        {/* LEFT: Canvas */}
        <div style={{
          position: "sticky",
          top: 60,
          height: "calc(100vh - 60px)",
          overflow: "hidden",
        }}>
          <ProductCanvas product={product} />
          {/* Prev/next arrows */}
          <div style={{
            position: "absolute", left: 0, right: 0, bottom: 0,
            display: "flex", justifyContent: "space-between",
            padding: "24px clamp(20px,3vw,40px)",
          }}>
            {prev ? (
              <Link href={`/store/${prev.id}`} style={{
                fontFamily: "'DM Mono',monospace", fontSize: 7, letterSpacing: "0.18em",
                color: "rgba(255,255,255,0.28)", textDecoration: "none",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                ← {prev.name}
              </Link>
            ) : <div/>}
            {next ? (
              <Link href={`/store/${next.id}`} style={{
                fontFamily: "'DM Mono',monospace", fontSize: 7, letterSpacing: "0.18em",
                color: "rgba(255,255,255,0.28)", textDecoration: "none",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                {next.name} →
              </Link>
            ) : <div/>}
          </div>
        </div>

        {/* RIGHT: Product info — scrollable */}
        <div style={{
          borderLeft: "1px solid rgba(255,255,255,0.07)",
          padding: "clamp(32px,5vw,64px) clamp(24px,4vw,52px)",
          display: "flex", flexDirection: "column", gap: 32,
          overflowY: "auto",
        }}>
          {/* Category */}
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 7, letterSpacing: "0.26em", color: "rgba(255,255,255,0.30)", textTransform: "uppercase" }}>
            {product.category}
            {product.badge && (
              <span style={{ marginLeft: 12, color: product.accent, border: `1px solid ${product.accent}55`, padding: "2px 8px" }}>{product.badge}</span>
            )}
          </div>

          {/* Name */}
          <div>
            <h1 style={{
              fontFamily: "'Bodoni Moda',Georgia,serif",
              fontStyle: "italic", fontWeight: 400,
              fontSize: "clamp(32px,4.5vw,64px)",
              letterSpacing: "-0.02em", lineHeight: 0.95,
              color: "#fff", margin: 0,
            }}>{product.name}</h1>
            <p style={{
              fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.08em",
              color: "rgba(255,255,255,0.40)", margin: "12px 0 0",
            }}>{product.tagline}</p>
          </div>

          {/* Description */}
          <p style={{
            fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.06em",
            color: "rgba(255,255,255,0.55)", lineHeight: 1.85, margin: 0,
          }}>{product.longDesc}</p>

          {/* Tags */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {product.tags.map(tag => (
              <span key={tag} style={{
                fontFamily: "'DM Mono',monospace", fontSize: 7, letterSpacing: "0.16em",
                color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.12)",
                padding: "4px 10px", textTransform: "uppercase",
              }}>{tag}</span>
            ))}
          </div>

          {/* Price + CTA */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 24 }}>
            <div style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: product.price === -1 ? 12 : 28,
              letterSpacing: product.price === -1 ? "0.20em" : "0.02em",
              color: product.price === 0 ? product.accent : "#fff",
              marginBottom: 20,
            }}>{priceLabel}</div>

            {product.price === -1 ? (
              <Link href="/contact" style={{
                display: "block", textAlign: "center",
                background: "#fff", color: "#0D0C0B",
                fontFamily: "'DM Mono',monospace", fontSize: 8,
                letterSpacing: "0.26em", textTransform: "uppercase",
                textDecoration: "none", padding: "16px",
              }}>Contact Us →</Link>
            ) : (
              <button
                onClick={handleAddToCart}
                style={{
                  width: "100%",
                  background: cartAdded ? "rgba(255,255,255,0.15)" : "#fff",
                  color: "#0D0C0B",
                  border: "none",
                  fontFamily: "'DM Mono',monospace", fontSize: 8,
                  letterSpacing: "0.26em", textTransform: "uppercase",
                  padding: "16px", cursor: "none",
                  transition: "background 0.3s, color 0.3s",
                }}
              >
                {cartAdded ? "Added — Going to cart..." : product.price === 0 ? "Download Free →" : "Add to Cart →"}
              </button>
            )}
          </div>

          {/* Requires note */}
          <div style={{
            fontFamily: "'DM Mono',monospace", fontSize: 7, letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.18)", lineHeight: 2,
          }}>
            Digital product. Instant delivery.<br/>
            License: single studio / individual.
          </div>
        </div>
      </div>

      <style>{`
        * { cursor: none !important; box-sizing: border-box; }
        @media (max-width: 768px) {
          * { cursor: auto !important; }
        }
        @media (max-width: 900px) {
          div[style*="grid-template-columns"] {
            display: flex !important;
            flex-direction: column !important;
          }
          div[style*="position: sticky"] {
            position: relative !important;
            height: 40vh !important;
            top: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}