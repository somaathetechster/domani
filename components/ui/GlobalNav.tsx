"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTransition } from "@/lib/transitions/TransitionContext";

// ─── GLOBAL SOUND STATE ───────────────────────────────────────────────────────
let _globalMuted = false;
const _listeners: Set<(m: boolean) => void> = new Set();
function setGlobalMuted(m: boolean) {
  _globalMuted = m;
  _listeners.forEach(fn => fn(m));
}

// ─── CUSTOM CURSOR ────────────────────────────────────────────────────────────
// Renders a always-visible God's Eye cursor across all inner pages
export function GlobalCursor() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const pos   = useRef({ x: -100, y: -100 });
  const outer = useRef({ x: -100, y: -100 });
  const raf   = useRef(0);
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (innerRef.current) {
        innerRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
      }
    };

    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const isClickable = !!(t.closest("button,a,[data-hover]") || t.style.cursor === "none");
      setHovering(isClickable);
    };

    const down = () => setClicking(true);
    const up   = () => setClicking(false);

    // Smooth outer follow
    const animate = () => {
      raf.current = requestAnimationFrame(animate);
      outer.current.x += (pos.current.x - outer.current.x) * 0.12;
      outer.current.y += (pos.current.y - outer.current.y) * 0.12;
      if (outerRef.current) {
        outerRef.current.style.transform =
          `translate(${outer.current.x - 16}px, ${outer.current.y - 16}px) scale(${clicking ? 0.75 : hovering ? 1.6 : 1})`;
      }
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    raf.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      cancelAnimationFrame(raf.current);
    };
  }, [clicking, hovering]);

  return (
    <>
      {/* Outer ring — lags behind */}
      <div ref={outerRef} style={{
        position:"fixed",zIndex:99999,pointerEvents:"none",
        width:32,height:32,
        border:`1px solid ${hovering ? "rgba(184,240,255,0.90)" : "rgba(184,240,255,0.55)"}`,
        borderRadius:"50%",
        transition:"border-color 0.2s, opacity 0.3s",
        willChange:"transform",
        mixBlendMode:"normal",
      }}/>

      {/* Inner dot — snaps to cursor */}
      <div ref={innerRef} style={{
        position:"fixed",zIndex:99999,pointerEvents:"none",
        width:8,height:8,
        background: hovering ? "rgba(184,240,255,1)" : "rgba(184,240,255,0.70)",
        borderRadius:"50%",
        boxShadow: `0 0 ${hovering ? "16px 4px" : "8px 2px"} rgba(184,240,255,0.60)`,
        transition:"background 0.15s, box-shadow 0.15s",
        willChange:"transform",
      }}/>

      <style>{`
        *, *::before, *::after { cursor: none !important; }
      `}</style>
    </>
  );
}

// ─── SOUND TOGGLE ─────────────────────────────────────────────────────────────
function SoundToggle({ light = false }: { light?: boolean }) {
  const [muted, setMuted] = useState(_globalMuted);
  useEffect(() => {
    const fn = (m: boolean) => setMuted(m);
    _listeners.add(fn);
    return () => { _listeners.delete(fn); };
  }, []);

  const toggle = useCallback(() => {
    const next = !_globalMuted;
    setGlobalMuted(next);
    try {
      const { audio } = require("@/lib/audio/AudioManager");
      if (next) { audio.setAmbientVolume(0); }
      else { audio.setAmbientVolume(0.55); }
    } catch {}
  }, []);

  const cyan = "rgba(184,240,255,";
  const barColor = light ? "rgba(0,0,0,0.70)" : "#B8F0FF";

  return (
    <button onClick={toggle} title={muted ? "Unmute" : "Mute"} style={{
      background:"none",border:"none",padding:"5px 8px",
      cursor:"none",display:"flex",alignItems:"center",gap:7,
      opacity:0.75,transition:"opacity .25s",
    }}
      onMouseOver={e=>(e.currentTarget.style.opacity="1")}
      onMouseOut={e=>(e.currentTarget.style.opacity="0.75")}
    >
      <div style={{display:"flex",alignItems:"flex-end",gap:2,height:14}}>
        {[4,9,13,9,5].map((h,i)=>(
          <div key={i} style={{
            width:2,borderRadius:2,
            height:muted?1.5:h,
            background:barColor,
            transition:`height .3s ease ${i*0.04}s`,
            opacity:muted?0.2:0.85,
            boxShadow:!muted&&!light?`0 0 3px rgba(184,240,255,0.8)`:"none",
          }}/>
        ))}
      </div>
    </button>
  );
}

// ─── MINI MENU (inner pages) ──────────────────────────────────────────────────
function MiniMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { navigate } = useTransition();
  const [vis, setVis] = useState(false);

  useEffect(() => {
    if (open) { const t = setTimeout(() => setVis(true), 16); return () => clearTimeout(t); }
    else setVis(false);
  }, [open]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setVis(false); setTimeout(onClose, 400); }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  const NAV = [
    { n:"00", label:"Work",     href:"/work"     },
    { n:"01", label:"Services", href:"/services" },
    { n:"02", label:"Lab",      href:"/lab"      },
    { n:"03", label:"Ventures", href:"/ventures" },
    { n:"04", label:"Store",    href:"/store"    },
    { n:"05", label:"Careers",  href:"/careers"  },
    { n:"06", label:"Contact",  href:"/contact"  },
  ];

  const go = (href: string) => {
    setVis(false);
    setTimeout(() => { onClose(); navigate(href, "ink"); }, 200);
  };

  if (!open) return null;

  const cyan = "rgba(184,240,255,";

  return (
    <div style={{
      position:"fixed",inset:0,zIndex:9000,
      background:`rgba(2,4,8,${vis?0.97:0})`,
      transition:"background 0.4s ease",
      display:"flex",alignItems:"center",justifyContent:"center",
      backdropFilter:vis?"blur(12px)":"none",
    }}>
      {/* Scanline */}
      <div style={{position:"absolute",inset:0,pointerEvents:"none",
        backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.10) 2px,rgba(0,0,0,0.10) 3px)"}}/>

      {/* Close */}
      <button onClick={() => { setVis(false); setTimeout(onClose, 400); }}
        style={{
          position:"absolute",top:24,right:44,background:"none",
          border:`1px solid ${cyan}0.20)`,padding:"8px 22px",cursor:"none",
          fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:"0.26em",
          color:`${cyan}0.55)`,textTransform:"uppercase",
          transition:"border-color 0.2s",
        }}
        onMouseOver={e=>(e.currentTarget.style.borderColor=`${cyan}0.55)`)}
        onMouseOut={e=>(e.currentTarget.style.borderColor=`${cyan}0.20)`)}
      >
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" style={{marginRight:8}}>
          <path d="M1 1L8 8M8 1L1 8" stroke={`${cyan}0.55)`} strokeWidth="1.2"/>
        </svg>
        Esc
      </button>

      {/* DOMANI wordmark */}
      <div style={{
        position:"absolute",top:24,left:44,
        fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"0.52em",
        color:`${cyan}0.55)`,textTransform:"uppercase",
        opacity:vis?1:0,transition:"opacity 0.5s ease 0.1s",
      }}>DOMANI</div>

      {/* Nav items */}
      <nav style={{display:"flex",flexDirection:"column",gap:0,minWidth:"min(420px,80vw)"}}>
        {NAV.map((item,i)=>(
          <div
            key={item.n}
            onClick={()=>go(item.href)}
            style={{
              display:"flex",alignItems:"baseline",gap:24,
              padding:"20px 0",
              borderBottom:`1px solid ${cyan}0.06)`,
              cursor:"none",
              opacity:vis?1:0,
              transform:vis?"none":"translateX(24px)",
              transition:`opacity 0.5s ease ${0.06+i*0.05}s, transform 0.5s ease ${0.06+i*0.05}s`,
              position:"relative",
            }}
            onMouseEnter={e=>{
              const t = e.currentTarget.querySelector(".mnlabel") as HTMLElement;
              const d = e.currentTarget.querySelector(".mnnum") as HTMLElement;
              if(t) t.style.color = `${cyan}0.95)`;
              if(d) d.style.color = `${cyan}0.45)`;
            }}
            onMouseLeave={e=>{
              const t = e.currentTarget.querySelector(".mnlabel") as HTMLElement;
              const d = e.currentTarget.querySelector(".mnnum") as HTMLElement;
              if(t) t.style.color = `${cyan}0.45)`;
              if(d) d.style.color = `${cyan}0.18)`;
            }}
          >
            <span className="mnnum" style={{
              fontFamily:"'DM Mono',monospace",fontSize:8,
              letterSpacing:"0.14em",color:`${cyan}0.18)`,
              minWidth:28,transition:"color .2s",
            }}>{item.n}</span>
            <span className="mnlabel" style={{
              fontFamily:"'Bodoni Moda',Georgia,serif",fontStyle:"italic",fontWeight:400,
              fontSize:"clamp(28px,4.5vw,56px)",letterSpacing:"-.01em",lineHeight:1,
              color:`${cyan}0.45)`,transition:"color .2s",
            }}>{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Bottom meta */}
      <div style={{
        position:"absolute",bottom:32,left:44,right:44,
        display:"flex",justifyContent:"space-between",alignItems:"flex-end",
        opacity:vis?1:0,transition:"opacity 0.5s ease 0.5s",
      }}>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:6.5,letterSpacing:"0.18em",
          color:`${cyan}0.16)`,textTransform:"uppercase",lineHeight:2}}>
          Dom-001 · 2026 · Worldwide
        </span>
        <span style={{fontFamily:"'DM Mono',monospace",fontSize:6.5,letterSpacing:"0.18em",
          color:`${cyan}0.16)`,textTransform:"uppercase"}}>
          hello@domani.studio
        </span>
      </div>
    </div>
  );
}

// ─── GLOBAL NAV ───────────────────────────────────────────────────────────────
export function GlobalNav({ light = false }: { light?: boolean }) {
  const pathname   = usePathname();
  const { navigate } = useTransition();
  const [menuOpen, setMenuOpen]  = useState(false);
  const [scrolled, setScrolled]  = useState(false);
  const [hovWord,  setHovWord]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname === "/") return null;

  const cyan = "rgba(184,240,255,";
  const wordColor = light ? "rgba(0,0,0,0.68)" : `${cyan}${hovWord ? 0.95 : 0.65})`;
  const bg = scrolled
    ? (light ? "rgba(237,233,226,0.96)" : "rgba(5,6,12,0.94)")
    : (light ? "rgba(237,233,226,0.90)" : "rgba(5,6,12,0.70)");

  // Determine current section label
  const SECTION_LABELS: Record<string, string> = {
    "/work":"Work","/services":"Services","/lab":"Lab","/ventures":"Ventures",
    "/store":"Store","/careers":"Careers","/contact":"Contact",
  };
  const currentSection = SECTION_LABELS[pathname] ?? "";

  return (
    <>
      <GlobalCursor />

      <div style={{
        position:"fixed",top:0,left:0,right:0,zIndex:8000,
        height:60,
        display:"flex",alignItems:"center",justifyContent:"space-between",
        background:bg,
        backdropFilter:"blur(20px)",
        borderBottom:`1px solid ${light ? "rgba(0,0,0,0.06)" : `${cyan}${scrolled ? 0.08 : 0.04})`}`,
        transition:"background 0.4s,border-color 0.4s",
        padding:"0 44px",
      }}>
        {/* Left: Wordmark + breadcrumb */}
        <div style={{display:"flex",alignItems:"center",gap:0}}>
          <button
            onClick={() => navigate("/", "split")}
            onMouseEnter={() => setHovWord(true)}
            onMouseLeave={() => setHovWord(false)}
            style={{
              background:"none",border:"none",cursor:"none",padding:0,
              display:"flex",alignItems:"center",gap:0,
              position:"relative",
            }}
          >
            {/* The wordmark — separated letters for micro-animation */}
            <span style={{
              fontFamily:"'DM Mono',monospace",fontSize:9.5,
              letterSpacing:"0.52em",
              color:wordColor,
              textTransform:"uppercase",
              transition:"color 0.25s, text-shadow 0.25s",
              textShadow: hovWord && !light ? `0 0 20px ${cyan}0.35)` : "none",
            }}>DOMANI</span>
          </button>

          {/* Separator + section label */}
          {currentSection && (
            <>
              <span style={{
                display:"inline-block",width:1,height:16,
                background: light ? "rgba(0,0,0,0.18)" : `${cyan}0.15)`,
                margin:"0 18px",
              }}/>
              <span style={{
                fontFamily:"'DM Mono',monospace",fontSize:7,
                letterSpacing:"0.22em",
                color: light ? "rgba(0,0,0,0.35)" : `${cyan}0.28)`,
                textTransform:"uppercase",
              }}>{currentSection}</span>
            </>
          )}
        </div>

        {/* Right: compact control cluster */}
        <div style={{
          display:"flex",alignItems:"center",
          gap:0,
          border: light ? "1px solid rgba(0,0,0,0.10)" : `1px solid ${cyan}0.10)`,
          background: light ? "rgba(0,0,0,0.03)" : `${cyan}0.02)`,
          padding:"0 2px",
        }}>
          <SoundToggle light={light}/>

          {/* Divider */}
          <div style={{
            width:1,height:28,
            background: light ? "rgba(0,0,0,0.12)" : `${cyan}0.10)`,
          }}/>

          {/* Menu button — redesigned as a two-column grid mark */}
          <MenuTrigger onClick={() => setMenuOpen(true)} light={light}/>
        </div>
      </div>

      <MiniMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

// ─── MENU TRIGGER — the new design ────────────────────────────────────────────
// A 2×3 grid of dots that morph to a slanted stack on hover
function MenuTrigger({ onClick, light }: { onClick: () => void; light: boolean }) {
  const [hov, setHov] = useState(false);
  const cyan = "rgba(184,240,255,";
  const dotColor = hov
    ? (light ? "rgba(0,0,0,0.85)" : `${cyan}0.95)`)
    : (light ? "rgba(0,0,0,0.45)" : `${cyan}0.45)`);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background:"none",border:"none",cursor:"none",
        padding:"10px 18px",
        display:"flex",alignItems:"center",gap:10,
      }}
    >
      {/* 2×3 dot grid → animated lines */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(3,4px)",
        gridTemplateRows:"repeat(2,4px)",
        gap:"4px",
        transition:"gap 0.2s",
      }}>
        {[0,1,2,3,4,5].map(i=>(
          <div key={i} style={{
            width: hov ? (i%3===0 ? 12 : i%3===1 ? 8 : 4) : 4,
            height:4,
            borderRadius:2,
            background:dotColor,
            transition:`all 0.25s ease ${i*0.03}s`,
            boxShadow: hov && !light ? `0 0 4px ${cyan}0.6)` : "none",
          }}/>
        ))}
      </div>

      <span style={{
        fontFamily:"'DM Mono',monospace",fontSize:7,
        letterSpacing:"0.22em",textTransform:"uppercase",
        color: hov
          ? (light ? "rgba(0,0,0,0.85)" : `${cyan}0.90)`)
          : (light ? "rgba(0,0,0,0.45)" : `${cyan}0.45)`),
        transition:"color 0.22s",
      }}>
        Menu
      </span>
    </button>
  );
}

export { SoundToggle };