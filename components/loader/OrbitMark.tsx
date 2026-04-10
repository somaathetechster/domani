"use client";
import { useRef, useEffect, useCallback } from "react";

interface OrbitCanvasProps {
  progress:            number;
  siteState:           string;
  transitionStartTime: number;
}

function spiralPt(u: number, tS: number, tE: number, a: number, b: number, off: number) {
  const theta = tS + u * (tE - tS);
  const r     = a * Math.exp(b * theta);
  return { x: Math.cos(theta + off) * r, y: Math.sin(theta + off) * r };
}

function buildArmGeometry(N: number, scale: number, offset: number, twist: number, elong: number) {
  const a = scale * 0.082, b = 0.295;
  const tS = 0.10, tE = Math.PI * 1.54 + twist;
  const halfW = (u: number) => scale * (2.8 + u * 9.5) * elong * 0.012;

  const pts = Array.from({ length: N + 1 }, (_, i) => spiralPt(i / N, tS, tE, a, b, offset));
  const nrm = pts.map((_, i) => {
    const p = pts[Math.max(0, i - 1)], n = pts[Math.min(pts.length - 1, i + 1)];
    const dx = n.x - p.x, dy = n.y - p.y, len = Math.sqrt(dx * dx + dy * dy) || 1;
    return { nx: -dy / len, ny: dx / len };
  });
  return { pts, nrm, halfW };
}

function pathBody(ctx: CanvasRenderingContext2D, pts: any[], nrm: any[], halfW: (u: number) => number) {
  ctx.beginPath();
  pts.forEach((p, i) => {
    const w = halfW(i / (pts.length - 1));
    if (i === 0) ctx.moveTo(p.x + nrm[i].nx * w, p.y + nrm[i].ny * w);
    else ctx.lineTo(p.x + nrm[i].nx * w, p.y + nrm[i].ny * w);
  });
  const lp = pts[pts.length - 1], ln = nrm[nrm.length - 1], lw = halfW(1);
  ctx.arc(lp.x, lp.y, lw, Math.atan2(ln.ny, ln.nx) - Math.PI / 2, Math.atan2(ln.ny, ln.nx) + Math.PI / 2);
  for (let i = pts.length - 1; i >= 0; i--) {
    const w = halfW(i / (pts.length - 1));
    ctx.lineTo(pts[i].x - nrm[i].nx * w, pts[i].y - nrm[i].ny * w);
  }
  const fp = pts[0], fn = nrm[0], fw = halfW(0);
  ctx.arc(fp.x, fp.y, fw, Math.atan2(fn.ny, fn.nx) + Math.PI / 2, Math.atan2(fn.ny, fn.nx) - Math.PI / 2);
  ctx.closePath();
}

function pathLine(ctx: CanvasRenderingContext2D, pts: any[]) {
  ctx.beginPath();
  pts.forEach((p, i) => { if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); });
}

export function drawOrbitToCanvas(
  canvas: HTMLCanvasElement,
  t: number, progress: number, siteState: string,
  transT: number, mouseX: number, mouseY: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.translate(W * 0.5, H * 0.5);

  // Mouse tilt
  const tx = (mouseX / W - 0.5) * 0.18;
  const ty = (mouseY / H - 0.5) * 0.18;
  ctx.transform(1, ty * 0.28, -tx * 0.28, 1, 0, 0);

  const pct       = progress / 100;
  const baseScale = Math.min(W, H) * 0.41;
  const scale     =
    siteState === "loading"    ? baseScale * Math.min(pct / 0.32, 1) :
    siteState === "enter"      ? baseScale * (1 + Math.sin(t * 1.4) * 0.02) :
                                  baseScale * (1 + transT * 0.35);

  const rot =
    siteState === "loading"    ? t * 0.22 :
    siteState === "enter"      ? t * 0.13 :
                                  t * 0.13 + transT * transT * 0.9;

  // Ambient glow
  if (pct > 0.05) {
    const gi  = pct * (siteState === "enter" ? 0.22 + Math.sin(t * 1.8) * 0.06 : 0.14);
    const ag  = ctx.createRadialGradient(0, 0, 0, 0, 0, scale * 1.6);
    ag.addColorStop(0,   `rgba(0,140,200,${gi})`);
    ag.addColorStop(0.5, `rgba(0,60,110,${gi * 0.35})`);
    ag.addColorStop(1,   "rgba(0,0,0,0)");
    ctx.fillStyle = ag;
    ctx.beginPath(); ctx.arc(0, 0, scale * 1.6, 0, Math.PI * 2); ctx.fill();
  }

  ctx.rotate(rot);
  const emissive = 0.06 + pct * 0.44 + (siteState === "enter" ? Math.sin(t * 1.7) * 0.09 : 0);

  for (let arm = 0; arm < 4; arm++) {
    const off   = (arm / 4) * Math.PI * 2;
    const twist = siteState === "enter" ? Math.sin(t * 0.8 + arm) * 0.05 : 0;
    const elong = siteState === "transition" ? 1 + transT * 0.28 : 1;
    const { pts, nrm, halfW } = buildArmGeometry(140, scale, off, twist, elong);

    ctx.save();

    // Dark body
    pathBody(ctx, pts, nrm, halfW);
    ctx.fillStyle = `rgba(5,14,26,${0.88 - pct * 0.08})`;
    ctx.fill();

    // Glass gradient
    pathBody(ctx, pts, nrm, halfW);
    const sg = ctx.createLinearGradient(-scale * 0.35, -scale * 0.35, scale * 0.35, scale * 0.35);
    sg.addColorStop(0,    `rgba(210,245,255,${0.10 + emissive * 0.10})`);
    sg.addColorStop(0.20, `rgba(255,255,255,${0.40 + emissive * 0.18})`);
    sg.addColorStop(0.45, `rgba(90,190,225,${0.18 + emissive * 0.14})`);
    sg.addColorStop(0.72, `rgba(12,65,100,${0.28 + emissive * 0.10})`);
    sg.addColorStop(1,    "rgba(4,18,32,0.58)");
    ctx.fillStyle = sg; ctx.fill();

    // Cyan glow channel
    ctx.shadowBlur = 20; ctx.shadowColor = `rgba(184,240,255,${emissive * 0.65})`;
    pathLine(ctx, pts);
    ctx.strokeStyle = `rgba(184,240,255,${emissive * 0.92})`; ctx.lineWidth = scale * 0.028;
    ctx.lineCap = "round"; ctx.stroke(); ctx.shadowBlur = 0;

    // Hot core
    pathLine(ctx, pts);
    ctx.strokeStyle = `rgba(225,252,255,${emissive * 0.72})`; ctx.lineWidth = scale * 0.011; ctx.stroke();

    // White specular
    pathLine(ctx, pts);
    ctx.strokeStyle = `rgba(255,255,255,${0.18 + emissive * 0.20})`; ctx.lineWidth = scale * 0.0045; ctx.stroke();

    // Chrome offset
    ctx.save(); ctx.translate(scale * 0.004, -scale * 0.005);
    pathLine(ctx, pts);
    ctx.strokeStyle = `rgba(255,255,255,${0.12 + emissive * 0.10})`; ctx.lineWidth = scale * 0.007; ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  // Centre core
  const coreR = scale * 0.042;
  const coreA = pct * (siteState === "enter" ? 0.95 + Math.sin(t * 2.5) * 0.05 : 0.90);

  for (const [r, a] of [[scale * 0.55, 0.04], [scale * 0.28, 0.11], [scale * 0.14, 0.26]] as [number, number][]) {
    const hg = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    hg.addColorStop(0, `rgba(100,220,255,${a * Math.min(pct * 6, 1)})`);
    hg.addColorStop(1, "rgba(100,220,255,0)");
    ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  }

  ctx.shadowBlur = 28; ctx.shadowColor = `rgba(184,240,255,${coreA * 0.8})`;
  const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR);
  cg.addColorStop(0, "rgba(255,255,255,1)"); cg.addColorStop(0.4, "rgba(200,248,255,0.95)"); cg.addColorStop(1, "rgba(80,200,240,0)");
  ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(0, 0, coreR, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = `rgba(255,255,255,${coreA})`;
  ctx.beginPath(); ctx.arc(0, 0, coreR * 0.36, 0, Math.PI * 2); ctx.fill();

  ctx.restore();
}

export function OrbitCanvas({ progress, siteState, transitionStartTime }: OrbitCanvasProps) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const rafRef       = useRef<number>(0);
  const mouseRef     = useRef({ x: 0, y: 0 });
  const startRef     = useRef(performance.now());

  useEffect(() => {
    const onMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const t      = (performance.now() - startRef.current) / 1000;
    const transT = transitionStartTime > 0 ? (performance.now() - transitionStartTime) / 1000 : 0;
    drawOrbitToCanvas(canvas, t, progress, siteState, transT, mouseRef.current.x, mouseRef.current.y);
    rafRef.current = requestAnimationFrame(animate);
  }, [progress, siteState, transitionStartTime]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 2, pointerEvents: "none" }} />;
}
