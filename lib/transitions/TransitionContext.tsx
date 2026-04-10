"use client";

import {
  createContext, useContext, useRef, useState,
  useCallback, useEffect, ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import gsap from "gsap";
import { audio } from "@/lib/audio/AudioManager";


export type TransitionType = "split" | "diagonal" | "ink" | "curtain"  |  "particles";

interface TransitionCtx {
  navigate:        (href: string, type?: TransitionType) => void;
  isTransitioning: boolean;
}

const Ctx = createContext<TransitionCtx>({ navigate: () => {}, isTransitioning: false });
export const useTransition = () => useContext(Ctx);

function setLabel(text: string) {
  const el = document.getElementById("dom-transition-label");
  if (el) el.textContent = text;
}

// ─── INK WIPE ─────────────────────────────────────────────────────────────────
// Diagonal slab sweeps left→right covering 100% BEFORE router.push fires.
// Then retracts right→off after the new page is mounted underneath.
function inkWipe(
  canvas:     HTMLCanvasElement,
  onMidpoint: () => void,
  onComplete: () => void
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) { onMidpoint(); setTimeout(onComplete, 100); return; }

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const W = canvas.width, H = canvas.height;
  const SKEW = H * 0.55;       // diagonal slant
  const SLAB = W + SKEW;       // slab width needed to cover screen

  // Start: slab fully off left — lead edge at -SKEW
  let leadX      = -SKEW;
  let phase: "in"|"hold"|"out" = "in";
  let holdFrames = 0;
  let midFired   = false;
  let raf        = 0;

  // Travel distance = W + SKEW*2 (start off left, end past right including diagonal)
  const TRAVEL    = W + SKEW * 2 + 60;
  const SPEED_IN  = TRAVEL / 22;   // ~367ms at 60fps
  const SPEED_OUT = TRAVEL / 18;   // ~300ms at 60fps

  const paint = () => {
    ctx.clearRect(0, 0, W, H);

    // Shadow slab slightly behind — depth effect
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.beginPath();
    ctx.moveTo(leadX - 36,        0);
    ctx.lineTo(leadX,              0);
    ctx.lineTo(leadX - SKEW,       H);
    ctx.lineTo(leadX - 36 - SKEW,  H);
    ctx.closePath();
    ctx.fill();

    // Main obsidian slab
    ctx.fillStyle = "#020408";
    ctx.beginPath();
    ctx.moveTo(leadX - SLAB, 0);
    ctx.lineTo(leadX,         0);
    ctx.lineTo(leadX - SKEW,  H);
    ctx.lineTo(leadX - SLAB - SKEW, H);
    ctx.closePath();
    ctx.fill();

    // Cyan leading-edge glow (only during entry)
    if (phase !== "out") {
      const g = ctx.createLinearGradient(leadX - 60, 0, leadX + 8, 0);
      g.addColorStop(0, "rgba(184,240,255,0)");
      g.addColorStop(0.55, "rgba(184,240,255,0.38)");
      g.addColorStop(1, "rgba(184,240,255,0.05)");
      ctx.save();
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(leadX - 60,        0);
      ctx.lineTo(leadX + 8,          0);
      ctx.lineTo(leadX + 8 - SKEW,   H);
      ctx.lineTo(leadX - 60 - SKEW,  H);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  };

  const draw = () => {
    raf = requestAnimationFrame(draw);

    if (phase === "in") {
      leadX += SPEED_IN;
      // Full coverage = the bottom-right corner of the diagonal slab has cleared
      // Bottom-right corner x = leadX - SKEW (due to diagonal)
      // Need leadX - SKEW >= W to guarantee NO pixel of old page is visible
      if (leadX >= W + SKEW + 30 && !midFired) {
        midFired = true;
        phase    = "hold";
        onMidpoint();
      }
    } else if (phase === "hold") {
      holdFrames++;
      // 12 frames ≈ 200ms — enough for Next.js to fully commit + paint the new page
      if (holdFrames >= 12) phase = "out";
    } else {
      leadX += SPEED_OUT;
      // Trailing edge (bottom-left corner = leadX - SLAB - SKEW... but we want
      // the FRONT left corner = leadX - SLAB to clear the left side,
      // and for retraction we move right so we just need leadX - SLAB > W + 20
      if (leadX - SLAB > W + 30) {
        cancelAnimationFrame(raf);
        ctx.clearRect(0, 0, W, H);
        onComplete();
        return;
      }
    }

    paint();
  };

  raf = requestAnimationFrame(draw);
}

// ─── SPLIT CURTAIN ────────────────────────────────────────────────────────────
function splitCurtain(
  top:    HTMLDivElement,
  bottom: HTMLDivElement,
  seam:   HTMLDivElement,
  label:  HTMLDivElement,
  onMidpoint: () => void,
  onComplete: () => void
) {
  gsap.timeline()
    .set([top, bottom], { visibility: "visible" })
    .to(top,    { y: "0%",    duration: 0.52, ease: "power3.inOut" }, 0)
    .to(bottom, { y: "0%",    duration: 0.52, ease: "power3.inOut" }, 0)
    .to(seam,   { opacity: 1, duration: 0.10, ease: "power2.in"    }, 0.42)
    .to(label,  { opacity: 1, duration: 0.20, ease: "power2.out"   }, 0.43)
    // Fire at full coverage — panels fully closed at 0.52s, fire at 0.56s
    .call(onMidpoint, [], 0.56)
    .to({}, { duration: 0.18 })
    .to(seam,   { opacity: 0, duration: 0.14 }, 0.76)
    .to(label,  { opacity: 0, duration: 0.16 }, 0.76)
    .to(top,    { y: "-100%", duration: 0.58, ease: "power3.inOut" }, 0.80)
    .to(bottom, { y:  "100%", duration: 0.58, ease: "power3.inOut" }, 0.80)
    .call(onComplete);
}

// ─── PROVIDER ─────────────────────────────────────────────────────────────────
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();

  // Ref so navigate() is never recreated on pathname change
  const pathnameRef = useRef(pathname);
  useEffect(() => { pathnameRef.current = pathname; }, [pathname]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const topRef    = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const seamRef   = useRef<HTMLDivElement>(null);
  const labelRef  = useRef<HTMLDivElement>(null);

  const busy        = useRef(false);
  const pendingHref = useRef<string | null>(null);
  const [trans, setTrans] = useState(false);

  const navigate = useCallback((href: string, type?: TransitionType) => {
    if (busy.current) return;
    if (href === pathnameRef.current && href !== "/") return;

    busy.current        = true;
    pendingHref.current = href;
    setTrans(true);

    // Label text
    const parts = href.split("/").filter(Boolean);
    const raw   = parts[parts.length - 1] ?? "Studio";
    setLabel(raw.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()));

    // Audio routing — ambient only on homepage
    if (pathnameRef.current === "/" && href !== "/") {
      audio.stopAmbientTrack(600);
    }

    const onMid = () => {
      if (pendingHref.current) router.push(pendingHref.current);
    };

    const onDone = () => {
      setTrans(false);
      busy.current        = false;
      pendingHref.current = null;
      if (topRef.current)    gsap.set(topRef.current,    { y: "-100%" });
      if (bottomRef.current) gsap.set(bottomRef.current, { y:  "100%" });
    };

    const kind: TransitionType = type ?? (href === "/" ? "split" : "ink");

    if (kind === "split" || kind === "curtain") {
      const t = topRef.current, b = bottomRef.current,
            s = seamRef.current, l = labelRef.current;
      if (t && b && s && l) splitCurtain(t, b, s, l, onMid, onDone);
      else { onMid(); setTimeout(onDone, 800); }
    } else {
      const c = canvasRef.current;
      if (c) inkWipe(c, onMid, onDone);
      else { onMid(); setTimeout(onDone, 600); }
    }
  // navigate is stable — router from useRouter is stable, pathnameRef is a ref
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // Intercept ALL internal <a> clicks — capture phase so portal's stopPropagation doesn't matter
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("mailto") || href.startsWith("#")) return;
      e.preventDefault();
      e.stopPropagation();
      navigate(href);
    };
    document.addEventListener("click", handler, true); // capture phase
    return () => document.removeEventListener("click", handler, true);
  }, [navigate]);

  // Dispatch page-enter event whenever pathname changes
  useEffect(() => {
    const t = setTimeout(() => {
      window.dispatchEvent(new CustomEvent("domani:page-enter", { detail: { pathname } }));
    }, 60);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <Ctx.Provider value={{ navigate, isTransitioning: trans }}>
      {children}

      {/* Ink wipe canvas */}
      <canvas ref={canvasRef} style={{
        position:"fixed",inset:0,zIndex:9998,
        pointerEvents:"none",width:"100%",height:"100%",
      }}/>

      {/* Split top */}
      <div ref={topRef} style={{
        position:"fixed",top:0,left:0,right:0,
        height:"51%",background:"#020408",zIndex:9998,
        transform:"translateY(-100%)",pointerEvents:"none",willChange:"transform",
      }}/>
      {/* Split bottom */}
      <div ref={bottomRef} style={{
        position:"fixed",bottom:0,left:0,right:0,
        height:"51%",background:"#020408",zIndex:9998,
        transform:"translateY(100%)",pointerEvents:"none",willChange:"transform",
      }}/>
      {/* Seam */}
      <div ref={seamRef} style={{
        position:"fixed",top:"50%",left:0,right:0,
        height:2,background:"#B8F0FF",zIndex:9999,opacity:0,
        pointerEvents:"none",willChange:"opacity",
        boxShadow:"0 0 40px #B8F0FF,0 0 80px rgba(184,240,255,0.4)",
      }}/>
      {/* Label */}
      <div ref={labelRef} style={{
        position:"fixed",top:"50%",left:"50%",
        transform:"translate(-50%,-50%)",
        zIndex:10000,opacity:0,pointerEvents:"none",
        willChange:"opacity",textAlign:"center",
      }}>
        <div id="dom-transition-label" style={{
          fontFamily:"'DM Mono','Courier New',monospace",
          fontSize:9,letterSpacing:"0.42em",
          color:"rgba(184,240,255,0.55)",textTransform:"uppercase",
        }}/>
      </div>
    </Ctx.Provider>
  );
}