"use client";
import { useRef, useEffect, useCallback } from "react";
import { useDomaniStore } from "@/lib/store/useDomaniStore";

// 3D Projection Math
function project(x: number, y: number, z: number, fov: number, dist: number, w: number, h: number) {
  const scale = fov / (fov + z + dist);
  return {
    x: x * scale + w / 2,
    y: y * scale + h / 2,
    scale: scale
  };
}

export function SystemCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const { loadProgress, siteState } = useDomaniStore();
  const mouse = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const draw = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    c.width = window.innerWidth;
    c.height = window.innerHeight;
    const W = c.width, H = c.height;
    const t = performance.now() / 1000;
    const pct = loadProgress / 100;

    // Smooth mouse interpolation
    mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.1;
    mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.1;
    const mx = mouse.current.x;
    const my = mouse.current.y;

    ctx.fillStyle = "#010203";
    ctx.fillRect(0, 0, W, H);

    // ── THE BENDING GRID (Topography) ──
    ctx.strokeStyle = `rgba(184,240,255,${0.03 + (pct * 0.05)})`;
    ctx.lineWidth = 1;
    const gridSize = 40;
    
    ctx.beginPath();
    for (let x = -W; x < W * 2; x += gridSize) {
      for (let y = -H; y < H * 2; y += gridSize) {
        // Space bending math based on mouse proximity
        const dx = x - (W/2 + mx * W/2);
        const dy = y - (H/2 + my * H/2);
        const dist = Math.sqrt(dx*dx + dy*dy);
        const bend = Math.max(0, 300 - dist) * 0.15;
        
        const bx = x + (dx / dist) * bend;
        const by = y + (dy / dist) * bend;
        
        if (y === -H) ctx.moveTo(bx, by);
        else ctx.lineTo(bx, by);
      }
    }
    for (let y = -H; y < H * 2; y += gridSize) {
      for (let x = -W; x < W * 2; x += gridSize) {
        const dx = x - (W/2 + mx * W/2);
        const dy = y - (H/2 + my * H/2);
        const dist = Math.sqrt(dx*dx + dy*dy);
        const bend = Math.max(0, 300 - dist) * 0.15;
        
        const bx = x + (dx / dist) * bend;
        const by = y + (dy / dist) * bend;
        
        if (x === -W) ctx.moveTo(bx, by);
        else ctx.lineTo(bx, by);
      }
    }
    ctx.stroke();

    // ── THE ARCHITECTURE (Hypercube unfolding) ──
    const nodes: Array<{ x: number; y: number; scale: number }> = [];
    const size = Math.min(W, H) * 0.3 * (0.2 + (pct * 0.8)); // Grows as it loads
    const fov = 800;
    const dist = 400 + (Math.sin(t) * 100);

    // Generate a 3D box that twists
    for (let i = -1; i <= 1; i += 2) {
      for (let j = -1; j <= 1; j += 2) {
        for (let k = -1; k <= 1; k += 2) {
          let nx = i * size; let ny = j * size; let nz = k * size;
          
          // Rotation matrices
          const rotX = t * 0.5 + (mx * 0.5);
          const rotY = t * 0.3 + (my * 0.5);
          
          let y1 = ny * Math.cos(rotX) - nz * Math.sin(rotX);
          let z1 = ny * Math.sin(rotX) + nz * Math.cos(rotX);
          let x2 = nx * Math.cos(rotY) - z1 * Math.sin(rotY);
          let z2 = nx * Math.sin(rotY) + z1 * Math.cos(rotY);

          // Explosive distortion when complete
          if (siteState === "enter") {
             const pulse = Math.sin(t * 10) * 20;
             x2 += i * pulse; y1 += j * pulse; z2 += k * pulse;
          }

          nodes.push(project(x2, y1, z2, fov, dist, W, H));
        }
      }
    }

    // Draw the hyper-structure
    ctx.strokeStyle = `rgba(184,240,255,${0.2 + (pct * 0.6)})`;
    ctx.lineWidth = siteState === "enter" ? 3 : 1;
    ctx.beginPath();
    // Connect the 8 corners
    const edges = [
      [0,1],[1,3],[3,2],[2,0], [4,5],[5,7],[7,6],[6,4],
      [0,4],[1,5],[2,6],[3,7]
    ];
    
    edges.forEach(([a, b]) => {
      // Only draw edges if they have "loaded"
      if ((a+b)/14 <= pct) {
        ctx.moveTo(nodes[a].x, nodes[a].y);
        ctx.lineTo(nodes[b].x, nodes[b].y);
      }
    });
    ctx.stroke();
    
    // Draw joints
    ctx.fillStyle = "#B8F0FF";
    nodes.forEach((n, i) => {
      if (i/8 <= pct) {
        ctx.fillRect(n.x - 2, n.y - 2, 4, 4);
      }
    });

    rafRef.current = requestAnimationFrame(draw);
  }, [loadProgress, siteState]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }} />;
}