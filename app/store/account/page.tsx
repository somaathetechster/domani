"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Mode = "signin" | "register" | "loggedin";

export default function AccountPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const user = sessionStorage.getItem("domani_user");
    if (user) setMode("loggedin");
  }, []);

  const handleSignIn = () => {
    setError("");
    if (!email) { setError("Email required."); return; }
    if (!password) { setError("Password required."); return; }
    setLoading(true);
    setTimeout(() => {
      sessionStorage.setItem("domani_user", JSON.stringify({ email, name: email.split("@")[0] }));
      setMode("loggedin");
      setLoading(false);
    }, 900);
  };

  const handleRegister = () => {
    setError("");
    if (!email) { setError("Email required."); return; }
    if (!name) { setError("Name required."); return; }
    setLoading(true);
    setTimeout(() => {
      // Save lead email — in production this would POST to /api/leads
      const leads = JSON.parse(localStorage.getItem("domani_leads") || "[]");
      if (!leads.includes(email)) { leads.push(email); localStorage.setItem("domani_leads", JSON.stringify(leads)); }
      sessionStorage.setItem("domani_user", JSON.stringify({ email, name }));
      setMode("loggedin");
      setLoading(false);
    }, 1100);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("domani_user");
    setMode("signin");
    setEmail(""); setName(""); setPassword("");
  };

  const user = mode === "loggedin"
    ? JSON.parse(sessionStorage.getItem("domani_user") || "null")
    : null;

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
        </div>
        <Link href="/store/cart" style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.22em", color: "rgba(255,255,255,0.45)", textDecoration: "none", textTransform: "uppercase" }}>Cart</Link>
      </div>

      {/* MAIN */}
      <div style={{
        minHeight: "calc(100vh - 60px)",
        display: "flex",
        alignItems: "stretch",
      }}>
        {/* LEFT: Big type */}
        <div style={{
          flex: 1,
          padding: "clamp(32px,6vw,80px) clamp(20px,5vw,60px)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
        }}>
          <h1 style={{
            fontFamily: "'Bodoni Moda',Georgia,serif",
            fontStyle: "italic", fontWeight: 400,
            fontSize: "clamp(40px,8vw,120px)",
            letterSpacing: "-0.03em", lineHeight: 0.88,
            color: "#fff", margin: 0,
          }}>
            {mode === "loggedin" ? "Welcome." :
             mode === "register" ? "Create\nAccount" :
             "Sign In"}
          </h1>

          {mode !== "loggedin" && (
            <div style={{ marginTop: "auto", paddingTop: 48 }}>
              <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.10em", color: "rgba(255,255,255,0.28)", lineHeight: 1.9 }}>
                Create an account to access your purchases,<br/>
                download history, and Domani updates.
              </p>
              <div style={{ marginTop: 24, fontFamily: "'DM Mono',monospace", fontSize: 7, letterSpacing: "0.18em", color: "rgba(255,255,255,0.15)", lineHeight: 2 }}>
                Dom-001 · 2026 · hello@domani.studio
              </div>
            </div>
          )}

          {mode === "loggedin" && user && (
            <div style={{ marginTop: 40 }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, letterSpacing: "0.14em", color: "rgba(255,255,255,0.40)", marginBottom: 8 }}>Signed in as</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12, color: "rgba(184,240,255,0.80)", letterSpacing: "0.06em" }}>{user.email}</div>

              <div style={{ marginTop: 40 }}>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 7, letterSpacing: "0.22em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 20 }}>Your Account</div>
                {[
                  { label: "Purchases", href: "#" },
                  { label: "Downloads", href: "#" },
                  { label: "Licenses", href: "#" },
                ].map(({ label, href }) => (
                  <Link key={label} href={href} style={{
                    display: "block", padding: "16px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    fontFamily: "'Bodoni Moda',Georgia,serif", fontStyle: "italic",
                    fontSize: 24, color: "rgba(255,255,255,0.70)",
                    textDecoration: "none",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.70)")}
                  >{label}</Link>
                ))}
              </div>

              <button onClick={handleLogout} style={{
                marginTop: 32, background: "none", border: "1px solid rgba(255,255,255,0.18)",
                padding: "10px 24px", cursor: "none",
                fontFamily: "'DM Mono',monospace", fontSize: 7,
                letterSpacing: "0.22em", color: "rgba(255,255,255,0.40)",
                textTransform: "uppercase",
              }}>Sign Out</button>
            </div>
          )}
        </div>

        {/* RIGHT: Form */}
        {mode !== "loggedin" && (
          <div style={{
            width: "clamp(320px,38vw,500px)",
            padding: "clamp(32px,5vw,72px) clamp(24px,4vw,52px)",
            display: "flex", flexDirection: "column", gap: 24,
          }}>
            {/* Google OAuth button */}
            <button style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
              width: "100%", padding: "13px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.14)",
              cursor: "none",
              fontFamily: "'DM Mono',monospace", fontSize: 8,
              letterSpacing: "0.20em", color: "rgba(255,255,255,0.65)",
              textTransform: "uppercase",
            }}>
              {/* Google "G" icon */}
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.10)" }}/>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 7, letterSpacing: "0.16em", color: "rgba(255,255,255,0.25)" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.10)" }}/>
            </div>

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {mode === "register" && (
                <Field label="Your Name" value={name} onChange={setName} placeholder="Full name" />
              )}
              <Field label="E-Mail" value={email} onChange={setEmail} placeholder="your@email.com" type="email" />
              {mode === "signin" && (
                <Field label="Password" value={password} onChange={setPassword} placeholder="••••••••" type="password" />
              )}
            </div>

            {error && (
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 7.5, letterSpacing: "0.12em", color: "#FF8080" }}>{error}</div>
            )}

            {mode === "register" && (
              <p style={{ fontFamily: "'DM Mono',monospace", fontSize: 7.5, letterSpacing: "0.08em", color: "rgba(255,255,255,0.30)", lineHeight: 1.8, margin: 0 }}>
                A link to set a new password will be sent to your email address.
              </p>
            )}

            {/* Submit */}
            <button
              onClick={mode === "signin" ? handleSignIn : handleRegister}
              style={{
                width: "100%", background: "#fff", color: "#0D0C0B",
                border: "none", fontFamily: "'DM Mono',monospace", fontSize: 8,
                letterSpacing: "0.26em", textTransform: "uppercase",
                padding: "16px", cursor: "none",
                opacity: loading ? 0.6 : 1,
                transition: "opacity 0.2s",
              }}>
              {loading ? "..." : mode === "signin" ? "Sign In →" : "Register →"}
            </button>

            {/* Toggle mode */}
            <div style={{ textAlign: "center" }}>
              {mode === "signin" ? (
                <button onClick={() => { setMode("register"); setError(""); }} style={{
                  background: "none", border: "none", cursor: "none",
                  fontFamily: "'DM Mono',monospace", fontSize: 7.5,
                  letterSpacing: "0.14em", color: "rgba(184,240,255,0.55)",
                  textDecoration: "underline",
                }}>Don't have an account? Register</button>
              ) : (
                <button onClick={() => { setMode("signin"); setError(""); }} style={{
                  background: "none", border: "none", cursor: "none",
                  fontFamily: "'DM Mono',monospace", fontSize: 7.5,
                  letterSpacing: "0.14em", color: "rgba(184,240,255,0.55)",
                  textDecoration: "underline",
                }}>Already have an account? Sign in</button>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        * { cursor: none !important; box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.20); }
        input:focus { outline: none; border-color: rgba(255,255,255,0.40) !important; }
        @media (max-width: 768px) {
          * { cursor: auto !important; }
          div[style*="display: flex; align-items: stretch"] {
            flex-direction: column !important;
          }
          div[style*="width: clamp(320px,38vw"] {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text"
}: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <div>
      <label style={{
        display: "block",
        fontFamily: "'DM Mono',monospace", fontSize: 7.5, letterSpacing: "0.20em",
        color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 8,
      }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.12)",
          padding: "12px 16px",
          fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.06em",
          color: "#fff", outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.2s",
        }}
      />
    </div>
  );
}