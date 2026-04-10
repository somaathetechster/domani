"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useDomaniStore }  from "@/lib/store/useDomaniStore";
import { audio }           from "@/lib/audio/AudioManager";

// Raw memory addresses for visual effect
const HEX = ["0x0A4F", "0x1B22", "0x9F0C", "0x44A1", "0x00FF", "0xCC33", "0x110A"];

const STAGES = [
  { p: 15,  l: "ALLOCATING_SPATIAL_MEMORY" },
  { p: 35,  l: "COMPILING_GEOMETRY" },
  { p: 60,  l: "CALIBRATING_OPTICS" },
  { p: 85,  l: "MOUNTING_ENVIRONMENT" },
  { p: 100, l: "DOMANI_OS_READY" },
];

export function LoaderHUD() {
  const { siteState, loadProgress, loadLabel, setLoadProgress, setSiteState } = useDomaniStore();
  const [hexCode, setHexCode] = useState(HEX[0]);
  const stageRef = useRef(0);

  // Boot sequence
  const runStage = useCallback(() => {
    if (stageRef.current >= STAGES.length) return;
    const { p, l } = STAGES[stageRef.current++];
    const delay = 100 + Math.random() * 200; // Much faster, aggressive timing
    const dur   = 200 + Math.random() * 300;
    
    setTimeout(() => {
      const from = useDomaniStore.getState().loadProgress;
      const t0   = performance.now();
      setLoadProgress(from, l);
      
      const go = (now: number) => {
        const t = Math.min((now - t0) / dur, 1);
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // Savage easeInOut
        setLoadProgress(from + (p - from) * e, l);
        
        setHexCode(HEX[Math.floor(Math.random() * HEX.length)]); // Flash hex codes
        
        if (t < 1) requestAnimationFrame(go);
        else if (p >= 100) setTimeout(() => setSiteState("enter"), 100);
        else runStage();
      };
      requestAnimationFrame(go);
    }, delay);
  }, [setLoadProgress, setSiteState]);

  useEffect(() => {
    const t = setTimeout(() => runStage(), 500);
    return () => clearTimeout(t);
  }, [runStage]);

  const handleEnter = useCallback(() => {
    if (siteState !== "enter") return;
    setSiteState("transition");
    audio.boot();
    audio.resume();
    audio.playClick();
    setTimeout(() => audio.playTransition(), 50);
    setTimeout(() => audio.playAmbientTrack(), 1500);
  }, [siteState, setSiteState]);

  const isEnter = siteState === "enter";
  const isTransition = siteState === "transition";

  return (
    <div 
      style={{ position: "fixed", inset: 0, zIndex: 50, pointerEvents: isEnter ? "all" : "none" }}
      onClick={isEnter ? handleEnter : undefined}
    >
      
      {/* MASSIVE BACKGROUND TEXT */}
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        fontFamily: "'Barlow Condensed', sans-serif", fontSize: "20vw", fontWeight: 900,
        color: "rgba(184,240,255,0.03)", letterSpacing: "-0.04em", whiteSpace: "nowrap",
        pointerEvents: "none"
      }}>
        TOMORROW
      </div>

      {/* TOP LEFT DATA STREAM */}
      <div style={{ position: "absolute", top: 40, left: 40, fontFamily: "'DM Mono', monospace", color: "#B8F0FF", fontSize: 10, letterSpacing: "0.2em", opacity: 0.6 }}>
        <div style={{ marginBottom: 4 }}>SYS.VER: 2026.1</div>
        <div>MEM: {hexCode}</div>
      </div>

      {/* BOTTOM RIGHT COORDINATES */}
      <div style={{ position: "absolute", bottom: 40, right: 40, fontFamily: "'DM Mono', monospace", color: "#B8F0FF", fontSize: 10, letterSpacing: "0.2em", textAlign: "right", opacity: 0.6 }}>
        <div style={{ marginBottom: 4 }}>LAT: 34.0522</div>
        <div>LNG: -118.2437</div>
      </div>

      {/* PROGRESS TRACKER */}
      <div style={{
        position: "absolute", bottom: 80, left: 40,
        fontFamily: "'DM Mono', monospace", color: "#B8F0FF",
        transition: "opacity 0.4s",
        opacity: isEnter || isTransition ? 0 : 1
      }}>
        <div style={{ fontSize: 48, fontWeight: 300, letterSpacing: "-0.05em", lineHeight: 1 }}>
          {String(Math.floor(loadProgress)).padStart(3, "0")}
        </div>
        <div style={{ fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase", marginTop: 4, opacity: 0.5 }}>
          {loadLabel}
        </div>
      </div>

      {/* THE "CLICK TO ENTER" LOCK SCREEN */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        opacity: isEnter && !isTransition ? 1 : 0,
        transition: "opacity 0.5s",
        cursor: "none"
      }}>
        <div style={{
          fontFamily: "'DM Mono', monospace", color: "#B8F0FF",
          fontSize: 12, letterSpacing: "0.5em", textTransform: "uppercase",
          animation: "blink 1s infinite",
          border: "1px solid rgba(184,240,255,0.3)",
          padding: "20px 40px",
          background: "rgba(184,240,255,0.05)"
        }}>
          SYSTEM READY // CLICK TO INITIALIZE
        </div>
      </div>

      <style>{`@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
    </div>
  );
}