"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PRODUCTS } from "../page";

interface CartItem { id: string; name: string; price: number; accent: string; }

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = JSON.parse(sessionStorage.getItem("domani_cart") || "[]");
    setItems(stored);
  }, []);

  const remove = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    sessionStorage.setItem("domani_cart", JSON.stringify(updated));
  };

  const subtotal = items.reduce((sum, i) => sum + (i.price > 0 ? i.price : 0), 0);
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  return (
    <div style={{ minHeight: "100vh", background: "#0D0C0B", color: "#fff", paddingTop: 60 }}>
      {/* TOP NAV */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 60, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 clamp(20px,5vw,60px)",
        background: "rgba(13,12,11,0.95)", backdropFilter: "blur(16px)",
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
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.20em", color: "rgba(255,255,255,0.65)", textTransform: "uppercase" }}>Cart</span>
        </div>
        <Link href="/store/account" style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.22em", color: "rgba(255,255,255,0.45)", textDecoration: "none", textTransform: "uppercase" }}>Login</Link>
      </div>

      {/* LAYOUT */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr clamp(300px,36vw,480px)",
        minHeight: "calc(100vh - 60px)",
      }}>
        {/* LEFT: Items */}
        <div style={{ padding: "clamp(32px,5vw,72px) clamp(20px,5vw,60px)", borderRight: "1px solid rgba(255,255,255,0.07)" }}>
          {/* Cart header */}
          <h1 style={{
            fontFamily: "'Bodoni Moda',Georgia,serif",
            fontStyle: "italic", fontWeight: 400,
            fontSize: "clamp(40px,7vw,96px)",
            letterSpacing: "-0.03em", lineHeight: 0.88,
            color: "#fff", margin: "0 0 48px",
          }}>
            Cart
            {items.length > 0 && (
              <sup style={{ fontFamily: "'DM Mono',monospace", fontStyle: "normal", fontSize: "0.30em", letterSpacing: "0.08em", color: "rgba(255,255,255,0.40)", verticalAlign: "super" }}>
                ({items.length})
              </sup>
            )}
          </h1>

          {/* Items */}
          {items.length === 0 ? (
            <div style={{ paddingTop: 40 }}>
              <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.12em", color: "rgba(255,255,255,0.30)", marginBottom: 24 }}>
                Your cart is empty.
              </p>
              <Link href="/store" style={{
                fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.22em",
                color: "rgba(255,255,255,0.70)", textDecoration: "none",
                textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.25)", paddingBottom: 2,
              }}>Browse Products →</Link>
            </div>
          ) : (
            <div>
              {/* Column headers */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr auto auto",
                gap: "0 24px",
                padding: "0 0 12px",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                marginBottom: 8,
              }}>
                {["Product", "Regular Price", "Today's Price"].map(h => (
                  <span key={h} style={{ fontFamily: "'DM Mono',monospace", fontSize: 7, letterSpacing: "0.20em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase" }}>{h}</span>
                ))}
              </div>

              {items.map(item => (
                <div key={item.id} style={{
                  display: "grid", gridTemplateColumns: "1fr auto auto",
                  gap: "0 24px",
                  padding: "20px 0",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  alignItems: "center",
                }}>
                  {/* Product info */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{
                      width: 44, height: 44,
                      border: `1px solid ${item.accent}33`,
                      background: "#050505",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <span style={{ fontFamily: "'Bodoni Moda',Georgia,serif", fontStyle: "italic", fontSize: 18, color: item.accent }}>{item.name[0]}</span>
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Bodoni Moda',Georgia,serif", fontStyle: "italic", fontSize: 20, color: "#fff", lineHeight: 1 }}>{item.name}</div>
                      <button onClick={() => remove(item.id)} style={{
                        background: "none", border: "none", cursor: "none", padding: 0,
                        fontFamily: "'DM Mono',monospace", fontSize: 7, letterSpacing: "0.16em",
                        color: "rgba(255,255,255,0.25)", marginTop: 6, textTransform: "uppercase",
                        textDecoration: "underline",
                      }}>Remove</button>
                    </div>
                  </div>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 14, color: "rgba(255,255,255,0.50)", textAlign: "right" }}>
                    {item.price === 0 ? "Free" : `$${item.price}.00`}
                  </span>
                  <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 14, color: "#fff", textAlign: "right" }}>
                    {item.price === 0 ? "Free" : `$${item.price}.00`}
                  </span>
                </div>
              ))}

              {/* Add more */}
              <div style={{ padding: "20px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <Link href="/store" style={{
                  display: "flex", alignItems: "center", gap: 12,
                  fontFamily: "'DM Mono',monospace", fontSize: 8,
                  letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)",
                  textDecoration: "none", textTransform: "uppercase",
                }}>
                  <span style={{
                    width: 24, height: 24, border: "1px solid rgba(255,255,255,0.20)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, color: "rgba(255,255,255,0.40)",
                  }}>+</span>
                  Add Product
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Summary */}
        <div style={{ padding: "clamp(32px,5vw,72px) clamp(24px,4vw,48px)", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Coupon */}
          <div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 7, letterSpacing: "0.22em", color: "rgba(255,255,255,0.30)", textTransform: "uppercase", marginBottom: 10 }}>
              Coupon Code
            </div>
            <div style={{ display: "flex", gap: 0 }}>
              <input
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
                placeholder="DOMANI10"
                style={{
                  flex: 1, background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.12)", borderRight: "none",
                  padding: "10px 14px",
                  fontFamily: "'DM Mono',monospace", fontSize: 9, letterSpacing: "0.08em",
                  color: "#fff", outline: "none",
                }}
              />
              <button
                onClick={() => { if (coupon.length > 3) setCouponApplied(true); }}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  padding: "10px 16px", cursor: "none",
                  fontFamily: "'DM Mono',monospace", fontSize: 7,
                  letterSpacing: "0.18em", color: "rgba(255,255,255,0.60)",
                  textTransform: "uppercase",
                }}>Apply</button>
            </div>
            {couponApplied && (
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 7, letterSpacing: "0.14em", color: "#4DFFA8", marginTop: 6 }}>
                ✓ 10% discount applied
              </div>
            )}
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }}/>

          {/* Totals */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { l: "Subtotal", v: items.length ? `$${subtotal}.00` : "—" },
              { l: "Discount", v: discount ? `-$${discount}.00` : "$0.00" },
            ].map(({ l, v }) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.16em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>{l}</span>
                <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, color: "rgba(255,255,255,0.55)" }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.10)" }}>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.20em", color: "rgba(255,255,255,0.80)", textTransform: "uppercase" }}>Total</span>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 26, letterSpacing: "0.01em", color: "#fff" }}>
                {items.length ? `$${total}.00` : "—"}
              </span>
            </div>
          </div>

          {/* Terms */}
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "none" }}>
            <input type="checkbox" style={{ marginTop: 3, accentColor: "#fff" }}/>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 7, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>
              I have read and agree to the{" "}
              <a href="/terms" style={{ color: "rgba(255,255,255,0.55)" }}>Terms</a>
            </span>
          </label>

          {/* Next */}
          <button
            onClick={() => items.length ? router.push("/store/payment") : null}
            style={{
              width: "100%",
              background: items.length ? "#fff" : "rgba(255,255,255,0.10)",
              color: items.length ? "#0D0C0B" : "rgba(255,255,255,0.25)",
              border: "none",
              fontFamily: "'DM Mono',monospace", fontSize: 8,
              letterSpacing: "0.26em", textTransform: "uppercase",
              padding: "16px", cursor: items.length ? "none" : "none",
              transition: "background 0.2s, color 0.2s",
            }}>
            Next →
          </button>
        </div>
      </div>

      <style>{`
        * { cursor: none !important; box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.20); }
        input:focus { outline: none; border-color: rgba(255,255,255,0.35) !important; }
        @media (max-width: 768px) {
          * { cursor: auto !important; }
          div[style*="grid-template-columns: 1fr clamp(300px"] {
            display: flex !important; flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  );
}