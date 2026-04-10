"use client";
import { useRef, useEffect, useCallback, useMemo } from "react";

interface LoaderSceneProps {
  progress:  number;
  siteState: string;
}

interface Particle {
  x: number; y: number; vx: number; vy: number;
  z: number; r: number; phase: number; speed: number;
}

export function LoaderScene({ progress, siteState }: LoaderSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const mouseRef  = useRef({ x: 0, y: 0 });
  const startRef  = useRef(performance.now());

  const particles = useMemo<Particle[]>(() =>
    Array.from({ length: 180 }, () => ({
      x:     Math.random() * 2 - 1,
      y:     Math.random() * 2 - 1,
      vx:    (Math.random() - 0.5) * 0.00028,
      vy:    (Math.random() - 0.5) * 0.00028,
      z:     Math.random(),
      r:     Math.random() * 1.4 + 0.3,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.7,
    })), []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const W = canvas.width, H = canvas.height;
    const t   = (performance.now() - startRef.current) / 1000;
    const pct = progress / 100;
    const { x: mx, y: my } = mouseRef.current;

    // Base
    ctx.fillStyle = "#020408";
    ctx.fillRect(0, 0, W, H);

    // Atmospheric depth glow
    const cxC = W * 0.5, cyC = H * 0.5;
    const g1 = ctx.createRadialGradient(cxC, cyC, 0, cxC, cyC, Math.max(W, H) * 0.65);
    g1.addColorStop(0,   "rgba(10,35,55,0.88)");
    g1.addColorStop(0.5, "rgba(4,12,22,0.72)");
    g1.addColorStop(1,   "rgba(2,4,8,0)");
    ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);

    // Pulsing cyan core
    const intensity = 0.06 + pct * 0.10 + (siteState === "enter" ? 0.08 + Math.sin(t * 1.8) * 0.04 : 0);
    const g2 = ctx.createRadialGradient(cxC, cyC, 0, cxC, cyC, Math.min(W, H) * 0.40);
    g2.addColorStop(0,   `rgba(0,80,120,${intensity})`);
    g2.addColorStop(0.6, `rgba(0,40,70,${intensity * 0.4})`);
    g2.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);

    // Mouse-reactive glow
    const g3 = ctx.createRadialGradient(mx, my, 0, mx, my, 300);
    g3.addColorStop(0, `rgba(184,240,255,${0.018 + pct * 0.012})`);
    g3.addColorStop(1, "rgba(184,240,255,0)");
    ctx.fillStyle = g3; ctx.fillRect(0, 0, W, H);

    // Particles
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -1) p.x = 1; if (p.x > 1) p.x = -1;
      if (p.y < -1) p.y = 1; if (p.y > 1) p.y = -1;
      const sx    = (p.x + 1) * 0.5 * W;
      const sy    = (p.y + 1) * 0.5 * H;
      const pulse = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.5 * p.speed + p.phase));
      const alpha = (0.10 + pct * 0.22) * pulse * p.z;
      const rad   = p.r * p.z;
      ctx.beginPath(); ctx.arc(sx, sy, rad, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(184,240,255,${alpha})`; ctx.fill();
      if (alpha > 0.08) {
        const pg = ctx.createRadialGradient(sx, sy, 0, sx, sy, rad * 5);
        pg.addColorStop(0, `rgba(184,240,255,${alpha * 0.3})`);
        pg.addColorStop(1, "rgba(184,240,255,0)");
        ctx.beginPath(); ctx.arc(sx, sy, rad * 5, 0, Math.PI * 2);
        ctx.fillStyle = pg; ctx.fill();
      }
    }

    // Vignette
    const vg = ctx.createRadialGradient(cxC, cyC, Math.min(W, H) * 0.25, cxC, cyC, Math.max(W, H) * 0.78);
    vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,0.78)");
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

    // Scan lines
    ctx.strokeStyle = "rgba(184,240,255,0.018)"; ctx.lineWidth = 0.5;
    for (let y = 0; y < H; y += 4) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    rafRef.current = requestAnimationFrame(draw);
  }, [progress, siteState, particles]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  return (
    <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />
  );
}
