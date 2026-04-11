"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CartItem { id: string; name: string; price: number; accent: string; }

type PayMethod = "stripe" | "paystack" | "flutterwave";

export default function PaymentPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [method, setMethod] = useState<PayMethod>("stripe");
  const [done, setDone] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = JSON.parse(sessionStorage.getItem("domani_cart") || "[]");
    setItems(stored);
  }, []);

  const total = items.reduce((s, i) => s + (i.price > 0 ? i.price : 0), 0);

  const handlePay = () => {
    setDone(true);
    sessionStorage.removeItem("domani_cart");
    setTimeout(() => router.push("/store?success=1"), 2200);
  };

  const METHODS: { id: PayMethod; label: string; sub: string; note?: string }[] = [
    { id: "stripe",       label: "Stripe",       sub: "Card / Apple Pay / Google Pay" },
    { id: "paystack",     label: "Paystack",      sub: "Card + Bank Transfer (Africa)" },
    { id: "flutterwave",  label: "Flutterwave",   sub: "Card + Mobile Money + USSD", note: "+ VAT may apply" },
  ];

  if (done) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0D0C0B", display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28,
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, color: "#fff",
          boxShadow: "0 0 48px rgba(184,240,255,0.20)",
        }}>✓</div>
        <div style={{
          fontFamily: "'Bodoni Moda',Georgia,serif",
          fontStyle: "italic", fontSize: "clamp(36px,6vw,72px)",
          color: "#fff", letterSpacing: "-0.02em",
        }}>Payment confirmed.</div>
        <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.12em", color: "rgba(255,255,255,0.35)", textAlign: "center" }}>
          Your download link is on its way.<br/>Redirecting to store…
        </p>
      </div>
    );
  }

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
          <Link href="/store/cart" style={{ textDecoration: "none" }}>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.20em", color: "rgba(255,255,255,0.40)", textTransform: "uppercase" }}>Cart</span>
          </Link>
          <span style={{ color: "rgba(255,255,255,0.20)", fontSize: 12 }}>/</span>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.20em", color: "rgba(255,255,255,0.65)", textTransform: "uppercase" }}>Payment</span>
        </div>
      </div>

      {/* LAYOUT */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr clamp(300px,38vw,520px)",
        minHeight: "calc(100vh - 60px)",
      }}>
        {/* LEFT: Payment method */}
        <div style={{ padding: "clamp(32px,5vw,72px) clamp(20px,5vw,60px)", borderRight: "1px solid rgba(255,255,255,0.07)" }}>
          <h1 style={{
            fontFamily: "'Bodoni Moda',Georgia,serif",
            fontStyle: "italic", fontWeight: 400,
            fontSize: "clamp(40px,7vw,96px)",
            letterSpacing: "-0.03em", lineHeight: 0.88,
            color: "#fff", margin: "0 0 48px",
          }}>Payment</h1>

          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 7, letterSpacing: "0.22em", color: "rgba(255,255,255,0.30)", textTransform: "uppercase", marginBottom: 20 }}>
            Select Payment System
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {METHODS.map(m => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "20px 24px",
                  border: "1px solid",
                  borderColor: method === m.id ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.10)",
                  background: method === m.id ? "rgba(255,255,255,0.05)" : "transparent",
                  cursor: "none", textAlign: "left",
                  transition: "border-color 0.2s, background 0.2s",
                  marginBottom: 8,
                }}
              >
                <div>
                  <div style={{ fontFamily: "'Bodoni Moda',Georgia,serif", fontStyle: "italic", fontSize: 26, color: "#fff", lineHeight: 1 }}>{m.label}</div>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 7, letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)", marginTop: 6 }}>{m.sub}</div>
                  {m.note && (
                    <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 7, letterSpacing: "0.12em", color: "rgba(255,200,100,0.60)", marginTop: 4 }}>{m.note}</div>
                  )}
                </div>
                <div style={{
                  width: 14, height: 14, borderRadius: "50%",
                  border: `1px solid ${method === m.id ? "#fff" : "rgba(255,255,255,0.25)"}`,
                  background: method === m.id ? "#fff" : "transparent",
                  flexShrink: 0,
                }}/>
              </button>
            ))}
          </div>

          {/* VAT note */}
          {method === "flutterwave" && (
            <div style={{
              marginTop: 24, padding: "16px 20px",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 7.5, letterSpacing: "0.08em", color: "rgba(255,255,255,0.45)", lineHeight: 1.8, margin: 0 }}>
                <strong style={{ color: "rgba(255,255,255,0.70)" }}>When using Flutterwave, VAT may be added to the final price.</strong><br/>
                The tax amount is calculated automatically by the payment provider in accordance with the customer's local tax regulations.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT: Summary */}
        <div style={{ padding: "clamp(32px,5vw,72px) clamp(24px,4vw,48px)", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 7, letterSpacing: "0.22em", color: "rgba(255,255,255,0.30)", textTransform: "uppercase", marginBottom: 8 }}>
            Order Summary
          </div>

          {items.map(item => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{
                  width: 36, height: 36,
                  border: `1px solid ${item.accent}33`,
                  background: "#050505",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontFamily: "'Bodoni Moda',Georgia,serif", fontStyle: "italic", fontSize: 16, color: item.accent }}>{item.name[0]}</span>
                </div>
                <span style={{ fontFamily: "'Bodoni Moda',Georgia,serif", fontStyle: "italic", fontSize: 18, color: "#fff" }}>{item.name}</span>
              </div>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, color: "#fff" }}>
                {item.price === 0 ? "Free" : `$${item.price}.00`}
              </span>
            </div>
          ))}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 8 }}>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.20em", color: "rgba(255,255,255,0.80)", textTransform: "uppercase" }}>Total</span>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 26, color: "#fff" }}>${total}.00</span>
          </div>

          <button
            onClick={handlePay}
            style={{
              width: "100%", background: "#fff", color: "#0D0C0B",
              border: "none", fontFamily: "'DM Mono',monospace", fontSize: 8,
              letterSpacing: "0.26em", textTransform: "uppercase",
              padding: "16px", cursor: "none", marginTop: 8,
            }}>
            Pay ${total}.00 →
          </button>

          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 7, letterSpacing: "0.12em", color: "rgba(255,255,255,0.18)", lineHeight: 2, textAlign: "center" }}>
            256-bit encrypted · Instant delivery<br/>
            Refund policy: 14 days for unused licenses
          </div>
        </div>
      </div>

      <style>{`
        * { cursor: none !important; box-sizing: border-box; }
        @media (max-width: 768px) {
          * { cursor: auto !important; }
          div[style*="grid-template-columns: 1fr clamp(300px,38vw"] {
            display: flex !important; flex-direction: column !important;
          }
        }
      `}</style>
    </div>
  );
}