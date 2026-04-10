"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useTransition } from "@/lib/transitions/TransitionContext";
import { audio } from "@/lib/audio/AudioManager";

interface Props { open: boolean; onClose: (navigating?: boolean) => void; }

// ─── NAV DATA — now includes Store + Careers ──────────────────────────────────
const SECTIONS = [
  {
    id: "work",
    index: "00",
    title: "Work",
    sub: "Selected engagements",
    years: "2022 —",
    line1: "Real organisations.",
    line2: "Real constraints.",
    line3: "Real systems.",
    href: "/work",
    bg: [0.004, 0.008, 0.018],
    accent: [0.2, 0.7, 1.0],
  },
  {
    id: "services",
    index: "01",
    title: "Services",
    sub: "What we build and how",
    years: "Always",
    line1: "Brand. Product.",
    line2: "AI. Infrastructure.",
    line3: "One system.",
    href: "/services",
    bg: [0.005, 0.010, 0.008],
    accent: [0.3, 0.9, 0.6],
  },
  {
    id: "lab",
    index: "02",
    title: "Lab",
    sub: "Open research",
    years: "Continuous",
    line1: "Experiments.",
    line2: "Artefacts.",
    line3: "Edge thinking.",
    href: "/lab",
    bg: [0.010, 0.006, 0.018],
    accent: [0.7, 0.4, 1.0],
  },
  {
    id: "ventures",
    index: "03",
    title: "Ventures",
    sub: "SyntriAI · YDBI · Veyra",
    years: "2025 —",
    line1: "We build",
    line2: "for ourselves",
    line3: "as well.",
    href: "/ventures",
    bg: [0.014, 0.008, 0.004],
    accent: [1.0, 0.6, 0.2],
  },
  {
    id: "store",
    index: "04",
    title: "Store",
    sub: "Tools · Systems · Kits",
    years: "2026 —",
    line1: "Production tools.",
    line2: "Ship faster.",
    line3: "Build smarter.",
    href: "/store",
    bg: [0.006, 0.012, 0.014],
    accent: [0.72, 0.94, 1.0],
  },
  {
    id: "careers",
    index: "05",
    title: "Careers",
    sub: "Build tomorrow with us",
    years: "Open",
    line1: "Join the studio.",
    line2: "Think in systems.",
    line3: "Ship things that last.",
    href: "/careers",
    bg: [0.010, 0.008, 0.016],
    accent: [0.6, 0.5, 1.0],
  },
  {
    id: "contact",
    index: "06",
    title: "Contact",
    sub: "hello@domani.studio",
    years: "Open",
    line1: "Building something",
    line2: "that matters?",
    line3: "Let's talk.",
    href: "/contact",
    bg: [0.004, 0.012, 0.018],
    accent: [0.72, 0.94, 1.0],
  },
];

// ─── CANVAS RENDERER ──────────────────────────────────────────────────────────
class SectionRenderer {
  canvas: HTMLCanvasElement;
  ctx:    CanvasRenderingContext2D;
  idx:    number;
  t0:     number;
  raf:    number = 0;
  particles: { x:number;y:number;vx:number;vy:number;life:number;maxLife:number;size:number }[] = [];

  constructor(canvas: HTMLCanvasElement, idx: number) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext("2d")!;
    this.idx    = idx;
    this.t0     = performance.now();
    for (let i = 0; i < 80; i++) this.spawnParticle();
  }

  spawnParticle() {
    this.particles.push({
      x: Math.random() * (this.canvas.width  || 800),
      y: Math.random() * (this.canvas.height || 600),
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.3,
      life: 0,
      maxLife: 120 + Math.random() * 180,
      size: 0.5 + Math.random() * 2,
    });
  }

  draw() {
    const c = this.ctx;
    const W = this.canvas.width  = this.canvas.offsetWidth;
    const H = this.canvas.height = this.canvas.offsetHeight;
    const t = (performance.now() - this.t0) / 1000;
    const s = SECTIONS[this.idx];
    const [r,g,b] = s.bg;
    const [ar,ag,ab] = s.accent;
    const aC = (a:number) => `rgba(${Math.round(ar*255)},${Math.round(ag*255)},${Math.round(ab*255)},${a})`;

    c.fillStyle = `rgb(${Math.round(r*255)},${Math.round(g*255)},${Math.round(b*255)})`;
    c.fillRect(0, 0, W, H);

    this.drawEnvironment(c, W, H, t, aC);

    this.particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy; p.life++;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      if (p.life > p.maxLife) {
        this.particles[i] = { x: Math.random()*W, y: Math.random()*H, vx:(Math.random()-.5)*.5, vy:(Math.random()-.5)*.3, life:0, maxLife:120+Math.random()*180, size:.5+Math.random()*2 };
      }
      const progress = p.life / p.maxLife;
      const alpha = progress < 0.1 ? progress*10 : progress > 0.85 ? (1-progress)*6.67 : 1;
      c.beginPath(); c.arc(p.x, p.y, p.size, 0, Math.PI*2);
      c.fillStyle = aC(alpha * 0.25); c.fill();
    });

    const vg = c.createRadialGradient(W*.5,H*.5,0,W*.5,H*.5,Math.max(W,H)*.7);
    vg.addColorStop(0,"rgba(0,0,0,0)"); vg.addColorStop(1,"rgba(0,0,0,0.85)");
    c.fillStyle=vg; c.fillRect(0,0,W,H);

    this.raf = requestAnimationFrame(() => this.draw());
  }

  drawEnvironment(c: CanvasRenderingContext2D, W: number, H: number, t: number, aC: (a:number)=>string) {
    switch(this.idx) {
      case 0: this.drawWork(c,W,H,t,aC); break;
      case 1: this.drawServices(c,W,H,t,aC); break;
      case 2: this.drawLab(c,W,H,t,aC); break;
      case 3: this.drawVentures(c,W,H,t,aC); break;
      case 4: this.drawStore(c,W,H,t,aC); break;
      case 5: this.drawCareers(c,W,H,t,aC); break;
      case 6: this.drawContact(c,W,H,t,aC); break;
    }
  }

  drawWork(c:CanvasRenderingContext2D,W:number,H:number,t:number,aC:(a:number)=>string){
    const vp = { x: W*0.5, y: H*0.42 };
    const LINES = 14;
    for (let i=0; i<=LINES; i++) {
      const x = W * (i/LINES);
      const alpha = 0.03 + 0.04*Math.abs(Math.sin(t*0.3+i*0.5));
      c.beginPath(); c.moveTo(x,H); c.lineTo(vp.x,vp.y);
      c.strokeStyle=aC(alpha); c.lineWidth=0.6; c.stroke();
    }
    for (let j=1; j<=8; j++) {
      const progress = j/8;
      const eased = Math.pow(progress,1.5);
      const y = vp.y + (H-vp.y)*eased;
      const xLeft  = vp.x - (vp.x)*(1-eased*0.5);
      const xRight = vp.x + (W-vp.x)*(1-eased*0.5);
      const alpha  = 0.02 + 0.05*(1-progress);
      c.beginPath(); c.moveTo(xLeft,y); c.lineTo(xRight,y);
      c.strokeStyle=aC(alpha); c.lineWidth=0.6; c.stroke();
    }
    const frames = [{x:W*.18,y:H*.15,w:W*.22,h:H*.30},{x:W*.56,y:H*.12,w:W*.20,h:H*.28},{x:W*.35,y:H*.45,w:W*.18,h:H*.25}];
    frames.forEach((f,i)=>{
      const phase = t*0.4 + i*1.2;
      const yOff  = Math.sin(phase)*6;
      const alpha = 0.06 + 0.04*Math.sin(phase);
      c.strokeStyle=aC(alpha); c.lineWidth=0.7;
      c.strokeRect(f.x,f.y+yOff,f.w,f.h);
      for(let l=0;l<4;l++){
        const ly=f.y+yOff+f.h*0.7+l*8;
        c.beginPath(); c.moveTo(f.x+12,ly); c.lineTo(f.x+f.w*(0.4+Math.random()*0.4),ly);
        c.strokeStyle=aC(alpha*0.6); c.lineWidth=0.5; c.stroke();
      }
      const sweep = (t*0.3+i*0.7)%1;
      c.fillStyle=aC(alpha*2);
      c.fillRect(f.x, f.y+yOff+f.h*sweep, f.w, 1);
    });
    c.save(); c.globalAlpha=0.04;
    c.font=`italic 400 ${H*0.65}px 'Bodoni Moda',Georgia,serif`;
    c.fillStyle=aC(1); c.textAlign="center"; c.textBaseline="middle";
    c.fillText("W",W*.5,H*.5); c.restore();
  }

  drawServices(c:CanvasRenderingContext2D,W:number,H:number,t:number,aC:(a:number)=>string){
    const services = ["Brand","Product","AI","Infra"];
    const colW = W/5;
    services.forEach((s,i)=>{
      const x = colW*(i+0.75);
      const maxH = H*(0.35 + i*0.07);
      const currentH = maxH*(0.6+0.4*Math.sin(t*0.5+i*0.8));
      const y = H*0.88 - currentH;
      const pulse = 0.5+0.5*Math.sin(t*0.9+i*0.7);
      c.fillStyle=`rgba(5,15,10,0.6)`;
      c.fillRect(x-colW*0.3, y, colW*0.6, currentH);
      const grd=c.createLinearGradient(0,y,0,y+colW*0.4);
      grd.addColorStop(0,aC(0.20*pulse)); grd.addColorStop(1,aC(0));
      c.fillStyle=grd; c.fillRect(x-colW*0.3,y,colW*0.6,colW*0.4);
      c.strokeStyle=aC(0.12*pulse); c.lineWidth=0.8;
      c.strokeRect(x-colW*0.3,y,colW*0.6,currentH);
      const streamProgress=(t*0.4+i*0.25)%1;
      const sy=y+currentH*(1-streamProgress);
      c.beginPath(); c.arc(x,sy,1.5,0,Math.PI*2);
      c.fillStyle=aC(0.5*pulse); c.fill();
      c.fillStyle=aC(0.20+pulse*0.1);
      c.font=`300 7px 'DM Mono',monospace`;
      c.textAlign="center"; c.fillText(s.toUpperCase(),x,H*0.88+14);
    });
    c.strokeStyle=aC(0.035); c.lineWidth=0.4;
    for(let gx=0;gx<W;gx+=28){c.beginPath();c.moveTo(gx,0);c.lineTo(gx,H);c.stroke();}
    for(let gy=0;gy<H;gy+=28){c.beginPath();c.moveTo(0,gy);c.lineTo(W,gy);c.stroke();}
    c.save(); c.globalAlpha=0.03;
    c.font=`italic 400 ${H*0.6}px 'Bodoni Moda',Georgia,serif`;
    c.fillStyle=aC(1); c.textAlign="center"; c.textBaseline="middle";
    c.fillText("S",W*.5,H*.5); c.restore();
  }

  drawLab(c:CanvasRenderingContext2D,W:number,H:number,t:number,aC:(a:number)=>string){
    for(let y=0; y<H; y+=3){
      c.beginPath();
      for(let x=0; x<=W; x+=2){
        const w1=Math.sin(x*0.018+t*0.7)*0.5+0.5;
        const w2=Math.sin(x*0.012-t*0.5+y*0.008)*0.5+0.5;
        const w3=Math.sin(x*0.025+y*0.01+t*0.3)*0.5+0.5;
        const interference=(w1+w2+w3)/3;
        const dy=Math.sin(interference*Math.PI*2)*12;
        x===0?c.moveTo(x,y+dy):c.lineTo(x,y+dy);
      }
      c.strokeStyle=aC(0.015+0.02*Math.sin(y*0.08+t*0.4)); c.lineWidth=0.8; c.stroke();
    }
    for(let i=0;i<16;i++){
      const nx=W*(0.1+0.8*((i*137.5)%100)/100);
      const ny=H*(0.1+0.8*((i*87.3+50)%100)/100);
      const nodeAlpha=0.15+0.25*Math.abs(Math.sin(t*1.2+i*0.7));
      const nodeR=1+2*Math.abs(Math.sin(t*0.8+i));
      c.beginPath(); c.arc(nx,ny,nodeR,0,Math.PI*2);
      c.fillStyle=aC(nodeAlpha); c.fill();
      const ringR=nodeR+(t*20+i*15)%35;
      const ringA=nodeAlpha*(1-ringR/35)*0.4;
      if(ringA>0){c.beginPath();c.arc(nx,ny,ringR,0,Math.PI*2);c.strokeStyle=aC(ringA);c.lineWidth=0.5;c.stroke();}
    }
    c.save(); c.globalAlpha=0.03;
    c.font=`italic 400 ${H*0.6}px 'Bodoni Moda',Georgia,serif`;
    c.fillStyle=aC(1); c.textAlign="center"; c.textBaseline="middle";
    c.fillText("L",W*.5,H*.5); c.restore();
  }

  drawVentures(c:CanvasRenderingContext2D,W:number,H:number,t:number,aC:(a:number)=>string){
    const products=[{name:"SyntriAI",x:0.28,y:0.30,r:22},{name:"YDBI",x:0.72,y:0.28,r:18},{name:"Veyra",x:0.50,y:0.68,r:20}];
    const cx=W*0.5,cy=H*0.5;
    [W*0.38,W*0.28,W*0.18].forEach((r,i)=>{
      c.beginPath(); c.arc(cx,cy,r,0,Math.PI*2);
      c.strokeStyle=aC(0.04+0.02*Math.sin(t*0.5+i)); c.lineWidth=0.5; c.stroke();
    });
    [0.14,0.22,0.31].forEach((speed,i)=>{
      const orbitR=[W*0.38,W*0.28,W*0.18][i];
      const angle=t*speed+(i*2.1);
      const ox=cx+Math.cos(angle)*orbitR, oy=cy+Math.sin(angle)*orbitR;
      c.beginPath(); c.arc(ox,oy,2,0,Math.PI*2);
      c.fillStyle=aC(0.4); c.fill();
    });
    products.forEach((p,i)=>{
      const px=p.x*W,py=p.y*H;
      const pulse=0.5+0.5*Math.sin(t*1.1+i*2.1);
      c.beginPath(); c.moveTo(cx,cy); c.lineTo(px,py);
      c.strokeStyle=aC(0.05+0.03*pulse); c.lineWidth=0.5; c.stroke();
      [p.r*2.5,p.r*1.5,p.r].forEach((r,hi)=>{
        c.beginPath(); c.arc(px,py,r,0,Math.PI*2);
        c.strokeStyle=aC([0.04,0.08,0.16][hi]*pulse); c.lineWidth=0.5; c.stroke();
      });
      c.beginPath(); c.arc(px,py,3.5,0,Math.PI*2);
      c.fillStyle=aC(0.5+pulse*0.4); c.fill();
      c.fillStyle=aC(0.22+pulse*0.12);
      c.font=`300 8px 'DM Mono',monospace`; c.textAlign="center";
      c.fillText(p.name,px,py-p.r-8);
    });
    const cg=c.createRadialGradient(cx,cy,0,cx,cy,45);
    cg.addColorStop(0,aC(0.08)); cg.addColorStop(1,aC(0));
    c.fillStyle=cg; c.beginPath(); c.arc(cx,cy,45,0,Math.PI*2); c.fill();
    c.beginPath(); c.arc(cx,cy,3,0,Math.PI*2); c.fillStyle=aC(0.7); c.fill();
    c.save(); c.globalAlpha=0.025;
    c.font=`italic 400 ${H*0.55}px 'Bodoni Moda',Georgia,serif`;
    c.fillStyle=aC(1); c.textAlign="center"; c.textBaseline="middle";
    c.fillText("V",W*.5,H*.5); c.restore();
  }

  drawStore(c:CanvasRenderingContext2D,W:number,H:number,t:number,aC:(a:number)=>string){
    const shelves=4;
    for(let s=0;s<shelves;s++){
      const y=H*(0.20+s*0.18);
      const progress=(t*0.2+s*0.4)%1;
      c.beginPath(); c.moveTo(0,y); c.lineTo(W,y);
      c.strokeStyle=aC(0.05); c.lineWidth=0.5; c.stroke();
      for(let p=0;p<5;p++){
        const px=W*(0.06+p*0.19);
        const ph=H*(0.06+Math.sin(t*0.4+s*0.9+p*1.1)*0.02);
        const blockAlpha=0.05+0.04*Math.sin(t*0.6+p*0.8+s);
        c.fillStyle=`rgba(5,10,15,0.7)`;
        c.fillRect(px,y-ph,W*0.14,ph);
        c.strokeStyle=aC(blockAlpha); c.lineWidth=0.6;
        c.strokeRect(px,y-ph,W*0.14,ph);
        c.fillStyle=aC(blockAlpha*2);
        c.fillRect(px,y-ph,W*0.14,1.5);
      }
    }
    const streamY=(t*60)%H;
    c.strokeStyle=aC(0.12); c.lineWidth=0.8;
    c.setLineDash([4,8]);
    c.beginPath(); c.moveTo(W*0.85,0); c.lineTo(W*0.85,H); c.stroke();
    c.setLineDash([]);
    for(let i=0;i<6;i++){
      const ty=(streamY+i*(H/6))%H;
      c.fillStyle=aC(0.14-i*0.02);
      c.font=`300 7px 'DM Mono',monospace`; c.textAlign="left";
      c.fillText(`$${(49+i*40).toString()}`,W*0.87,ty);
    }
    c.save(); c.globalAlpha=0.03;
    c.font=`italic 400 ${H*0.6}px 'Bodoni Moda',Georgia,serif`;
    c.fillStyle=aC(1); c.textAlign="center"; c.textBaseline="middle";
    c.fillText("∑",W*.5,H*.5); c.restore();
  }

  drawCareers(c:CanvasRenderingContext2D,W:number,H:number,t:number,aC:(a:number)=>string){
    const nodes=[
      {x:0.50,y:0.20,label:"Studio"},
      {x:0.28,y:0.42,label:"Design"},
      {x:0.72,y:0.42,label:"Eng"},
      {x:0.50,y:0.62,label:"AI"},
      {x:0.18,y:0.64,label:"Strategy"},
      {x:0.82,y:0.64,label:"Ventures"},
    ];
    const edges=[[0,1],[0,2],[0,3],[1,4],[2,5],[1,3],[2,3]];
    edges.forEach(([a,b])=>{
      const na=nodes[a],nb=nodes[b];
      const pulse=0.5+0.5*Math.sin(t*0.6+a*0.4+b*0.3);
      c.beginPath();
      c.moveTo(na.x*W,na.y*H);
      c.lineTo(nb.x*W,nb.y*H);
      c.strokeStyle=aC(0.04+0.04*pulse); c.lineWidth=0.6; c.stroke();
      const edgeProg=((t*0.3+a*0.2)%1);
      const ex=na.x*W+(nb.x*W-na.x*W)*edgeProg;
      const ey=na.y*H+(nb.y*H-na.y*H)*edgeProg;
      c.beginPath(); c.arc(ex,ey,1.5,0,Math.PI*2);
      c.fillStyle=aC(0.35*pulse); c.fill();
    });
    nodes.forEach((n,i)=>{
      const pulse=0.5+0.5*Math.sin(t*1.0+i*0.9);
      const r=i===0?8:5;
      [r*3,r*1.8,r].forEach((rad,hi)=>{
        c.beginPath(); c.arc(n.x*W,n.y*H,rad,0,Math.PI*2);
        c.strokeStyle=aC([0.03,0.07,0.14][hi]*pulse); c.lineWidth=0.5; c.stroke();
      });
      c.beginPath(); c.arc(n.x*W,n.y*H,r*0.5,0,Math.PI*2);
      c.fillStyle=aC(0.55+pulse*0.35); c.fill();
      c.fillStyle=aC(0.20+pulse*0.10);
      c.font=`300 7px 'DM Mono',monospace`; c.textAlign="center";
      c.fillText(n.label.toUpperCase(),n.x*W,n.y*H-r*1.6-4);
    });
    const positions=["SR. ENGINEER","AI SYSTEMS","BRAND DESIGN","STRATEGY"];
    positions.forEach((p,i)=>{
      const x=W*0.06, y=H*0.22+i*18;
      const a=0.08+0.06*Math.sin(t*0.5+i*0.4);
      c.fillStyle=aC(a);
      c.font=`300 6px 'DM Mono',monospace`; c.textAlign="left";
      c.fillText(`→ ${p}`,x,y);
    });
    c.save(); c.globalAlpha=0.025;
    c.font=`italic 400 ${H*0.55}px 'Bodoni Moda',Georgia,serif`;
    c.fillStyle=aC(1); c.textAlign="center"; c.textBaseline="middle";
    c.fillText("C",W*.5,H*.5); c.restore();
  }

  drawContact(c:CanvasRenderingContext2D,W:number,H:number,t:number,aC:(a:number)=>string){
    const cx=W*0.5,cy=H*0.5;
    c.strokeStyle=aC(0.06); c.lineWidth=0.5;
    c.beginPath();c.moveTo(cx,0);c.lineTo(cx,H);c.stroke();
    c.beginPath();c.moveTo(0,cy);c.lineTo(W,cy);c.stroke();
    for(let i=1;i<=8;i++){
      const r=i*(Math.min(W,H)*0.055);
      c.strokeStyle=aC(0.05-i*0.004);
      c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);c.stroke();
    }
    for(let p=0;p<3;p++){
      const phase=((t*0.35+p*(1/3))%1);
      const angle=phase*Math.PI*2;
      const len=Math.min(W,H)*0.42;
      const trailLen=Math.PI*0.8;
      c.save();
      c.beginPath(); c.moveTo(cx,cy);
      c.arc(cx,cy,len,angle-trailLen,angle);
      c.closePath(); c.fillStyle=aC(0.06); c.fill();
      c.beginPath(); c.moveTo(cx,cy);
      c.lineTo(cx+Math.cos(angle)*len,cy+Math.sin(angle)*len);
      c.strokeStyle=aC(0.20); c.lineWidth=1; c.stroke();
      c.restore();
    }
    for(let p=0;p<3;p++){
      const phase=((t*0.4+p*0.33)%1);
      const r=phase*Math.min(W,H)*0.44;
      const a=(1-phase)*0.18;
      c.beginPath();c.arc(cx,cy,r,0,Math.PI*2);
      c.strokeStyle=aC(a);c.lineWidth=1.2;c.stroke();
    }
    c.beginPath();c.arc(cx,cy,4,0,Math.PI*2);c.fillStyle=aC(0.9);c.fill();
    c.fillStyle=aC(0.18);c.font=`300 8px 'DM Mono',monospace`;c.textAlign="center";
    c.fillText(`9.0577°N   7.4951°E`,cx,H-28);
    c.fillText(`Abuja, Nigeria — Worldwide`,cx,H-16);
    c.save(); c.globalAlpha=0.035;
    c.font=`italic 400 ${H*0.6}px 'Bodoni Moda',Georgia,serif`;
    c.fillStyle=aC(1);c.textAlign="center";c.textBaseline="middle";
    c.fillText("C",W*.5,H*.45);c.restore();
  }

  start() { this.raf = requestAnimationFrame(() => this.draw()); }
  stop()  { cancelAnimationFrame(this.raf); }
}

// ─── CANVAS COMPONENT ─────────────────────────────────────────────────────────
function LiveCanvas({ idx, active }: { idx: number; active: boolean }) {
  const ref      = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<SectionRenderer | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    renderer.current = new SectionRenderer(ref.current, idx);
    if (active) renderer.current.start();
    return () => renderer.current?.stop();
  }, [idx]);

  useEffect(() => {
    if (active) renderer.current?.start();
    else        renderer.current?.stop();
  }, [active]);

  return <canvas ref={ref} style={{ width:"100%", height:"100%", display:"block" }} />;
}

// ─── IDLE ORBIT CANVAS ────────────────────────────────────────────────────────
function OrbitCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const t0  = useRef(performance.now());

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    const aC  = (a: number) => `rgba(184,240,255,${a})`;

    const draw = () => {
      raf.current = requestAnimationFrame(draw);
      const W = c.width  = c.offsetWidth;
      const H = c.height = c.offsetHeight;
      const t = (performance.now() - t0.current) / 1000;

      ctx.fillStyle = "rgba(1,2,5,1)"; ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = aC(0.025); ctx.lineWidth = 0.4;
      for (let x=0;x<W;x+=36) { ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke(); }
      for (let y=0;y<H;y+=36) { ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke(); }

      const cx = W*0.5, cy = H*0.5;
      const scale = Math.min(W,H)*0.33;
      const rot   = t * 0.16;

      [[scale*1.8,0.06],[scale*1.2,0.10],[scale*0.7,0.16]].forEach(([r,a])=>{
        const g=ctx.createRadialGradient(cx,cy,0,cx,cy,r);
        g.addColorStop(0,aC(a as number)); g.addColorStop(1,aC(0));
        ctx.fillStyle=g; ctx.beginPath();ctx.arc(cx,cy,r as number,0,Math.PI*2);ctx.fill();
      });

      ctx.save(); ctx.translate(cx,cy); ctx.rotate(rot);

      for (let arm=0; arm<4; arm++) {
        const off = (arm/4)*Math.PI*2;
        const a_coeff = scale*0.082, b_coeff = 0.295;
        const tS = 0.10, tE = Math.PI*1.54;
        const N  = 100;
        const pts: {x:number;y:number}[] = [];
        for (let i=0;i<=N;i++) {
          const theta = tS+(i/N)*(tE-tS);
          const r     = a_coeff*Math.exp(b_coeff*theta);
          pts.push({x:Math.cos(theta+off)*r, y:Math.sin(theta+off)*r});
        }
        const nrm = pts.map((_,i)=>{
          const p=pts[Math.max(0,i-1)],n=pts[Math.min(N,i+1)];
          const dx=n.x-p.x,dy=n.y-p.y,len=Math.sqrt(dx*dx+dy*dy)||1;
          return {nx:-dy/len,ny:dx/len};
        });
        const hw=(u:number)=>scale*(2.8+u*9.5)*0.012;
        ctx.beginPath();
        pts.forEach((p,i)=>{const w=hw(i/N);if(i===0)ctx.moveTo(p.x+nrm[i].nx*w,p.y+nrm[i].ny*w);else ctx.lineTo(p.x+nrm[i].nx*w,p.y+nrm[i].ny*w);});
        const lp=pts[N],ln=nrm[N],lw=hw(1);
        ctx.arc(lp.x,lp.y,lw,Math.atan2(ln.ny,ln.nx)-Math.PI/2,Math.atan2(ln.ny,ln.nx)+Math.PI/2);
        for(let i=N;i>=0;i--){const w=hw(i/N);ctx.lineTo(pts[i].x-nrm[i].nx*w,pts[i].y-nrm[i].ny*w);}
        const fp=pts[0],fn=nrm[0],fw=hw(0);
        ctx.arc(fp.x,fp.y,fw,Math.atan2(fn.ny,fn.nx)+Math.PI/2,Math.atan2(fn.ny,fn.nx)-Math.PI/2);
        ctx.closePath();
        ctx.fillStyle="rgba(3,7,14,0.90)"; ctx.fill();
        const gl=ctx.createLinearGradient(-scale*.3,-scale*.3,scale*.3,scale*.3);
        gl.addColorStop(0,aC(0.06)); gl.addColorStop(0.28,aC(0.28)); gl.addColorStop(0.55,aC(0.08)); gl.addColorStop(1,"rgba(0,0,0,0.5)");
        ctx.fillStyle=gl; ctx.fill();
        const emissive = 0.55+0.45*Math.sin(t*1.3+arm*0.6);
        ctx.shadowBlur=14; ctx.shadowColor=aC(emissive*0.6);
        ctx.beginPath(); pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
        ctx.strokeStyle=aC(emissive*0.80); ctx.lineWidth=scale*0.024; ctx.lineCap="round"; ctx.stroke();
        ctx.shadowBlur=0;
        ctx.strokeStyle=aC(0.40); ctx.lineWidth=scale*0.007; ctx.stroke();
      }

      const cg=ctx.createRadialGradient(0,0,0,0,0,scale*0.048);
      cg.addColorStop(0,"rgba(255,255,255,1)");cg.addColorStop(0.4,aC(0.9));cg.addColorStop(1,aC(0));
      ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(0,0,scale*0.048,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="rgba(255,255,255,0.95)"; ctx.beginPath(); ctx.arc(0,0,scale*0.018,0,Math.PI*2); ctx.fill();
      ctx.restore();

      ctx.fillStyle=aC(0.18+0.06*Math.sin(t*0.8));
      ctx.font=`300 10px 'DM Mono',monospace`;
      ctx.textAlign="center"; ctx.letterSpacing="4px";
      ctx.fillText("DOMANI", cx, cy+scale*1.18);
      ctx.fillStyle=aC(0.10+0.05*Math.sin(t*1.1));
      ctx.font=`300 7px 'DM Mono',monospace`; ctx.letterSpacing="2px";
      ctx.fillText("Select a section", cx, cy+scale*1.36);
    };

    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return <canvas ref={ref} style={{width:"100%",height:"100%",display:"block"}}/>;
}

// ─── MAIN PORTAL MENU ─────────────────────────────────────────────────────────
export function PortalMenu({ open, onClose }: Props) {
  const { navigate } = useTransition();
  const [vis,     setVis]     = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [active,  setActive]  = useState(-1);
  const [hovered, setHovered] = useState(-1);

  useEffect(() => {
    if (open) {
      setLeaving(false); setActive(-1); setHovered(-1);
      const t = setTimeout(() => setVis(true), 20);
      return () => clearTimeout(t);
    } else { setVis(false); }
  }, [open]);

  const close = useCallback(() => {
    setLeaving(true); setVis(false); setActive(-1);
    setTimeout(() => { setLeaving(false); onClose(); }, 600);
  }, [onClose]);

  const handleHover = useCallback((i: number) => {
    setHovered(i);
    if (audio.isBooted) audio.playHover();
  }, []);

  const handleClick = useCallback((i: number) => {
    if (audio.isBooted) audio.playClick();
    setActive(i);
    setTimeout(() => {
      setVis(false);
      onClose(true);
      setTimeout(() => navigate(SECTIONS[i].href, "ink"), 200);
    }, 500);
  }, [navigate, onClose]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [close]);

  if (!open && !leaving) return null;

  const aC = (a: number) => `rgba(184,240,255,${a})`;
  const idle = hovered < 0;

  return (
    <div style={{
      position:"fixed",inset:0,zIndex:200,
      background:`rgba(2,4,8,${vis?0.85:0})`,
      backdropFilter: vis ? "blur(16px) saturate(120%)" : "blur(0px) saturate(100%)",
      transition:"background 0.55s ease, backdrop-filter 0.55s ease",
      overflow:"hidden",
    }}>

      {/* Canvas layers */}
      <div style={{position:"absolute",inset:0,zIndex:0}}>
        <div style={{position:"absolute",inset:0,opacity:idle&&vis?1:0,transition:"opacity 0.5s ease"}}>
          <OrbitCanvas />
        </div>
        {SECTIONS.map((_,i)=>(
          <div key={i} style={{position:"absolute",inset:0,opacity:hovered===i&&vis?1:0,transition:"opacity 0.4s ease"}}>
            <LiveCanvas idx={i} active={hovered===i&&vis}/>
          </div>
        ))}
        {active>=0&&(
          <div style={{position:"absolute",inset:0,opacity:1,
            background:`rgb(${SECTIONS[active].bg.map(v=>Math.round(v*255)).join(",")})`,
            transition:"opacity 0.5s ease"}}>
            <LiveCanvas idx={active} active={true}/>
          </div>
        )}
      </div>

      {/* Subtle Scanline + Vignette Overlay */}
      <div style={{
        position:"absolute",inset:0,zIndex:1,pointerEvents:"none",
        backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.1) 2px,rgba(0,0,0,0.1) 3px)",
        backgroundSize: "100% 3px"
      }}/>
      <div style={{
        position:"absolute",inset:0,zIndex:1,pointerEvents:"none",
        background:"radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)"
      }}/>

      {/* Top bar */}
      <div style={{
        position:"absolute",top:0,left:0,right:0,zIndex:10,
        display:"flex",justifyContent:"space-between",alignItems:"center",
        padding:"22px 44px",
        borderBottom: `1px solid transparent`,
        borderImage: `linear-gradient(to right, ${aC(0.0)}, ${aC(0.1)}, ${aC(0.0)}) 1`,
        opacity:vis&&active<0?1:0,transition:"opacity 0.4s ease",
      }}>
        <div style={{display:"flex",alignItems:"center",gap:20}}>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"0.52em",fontWeight:700,
            color:aC(0.90),textTransform:"uppercase"}}>DOMANI</span>
          <span style={{width:1,height:14,background:aC(0.14),display:"block"}}/>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:"0.24em",
            color:aC(0.40),textTransform:"uppercase"}}>
            {hovered>=0 ? `${SECTIONS[hovered].index} — ${SECTIONS[hovered].id.toUpperCase()}` : "Studio Navigation"}
          </span>
        </div>

        <button onClick={close} style={{
          background:aC(0.03), border:`1px solid ${aC(0.15)}`, padding:"8px 24px", cursor:"none",
          display:"flex", alignItems:"center", gap:10, borderRadius: "100px",
          fontFamily:"'DM Mono',monospace", fontSize:7, letterSpacing:"0.26em", fontWeight: 600,
          color:aC(0.70), textTransform:"uppercase", transition:"all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          backdropFilter: "blur(8px)"
        }}
          onMouseOver={e=>{e.currentTarget.style.borderColor=aC(0.60);e.currentTarget.style.background=aC(0.1);e.currentTarget.style.color=aC(1);}}
          onMouseOut={e=>{e.currentTarget.style.borderColor=aC(0.15);e.currentTarget.style.background=aC(0.03);e.currentTarget.style.color=aC(0.70);}}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
          Close
        </button>
      </div>

      {/* Section info panel — left */}
      <div style={{
        position:"absolute",top:"50%",left:44,
        transform:"translateY(-50%)",zIndex:10,
        opacity:hovered>=0&&vis&&active<0?1:0,
        transition:"opacity 0.4s ease",
        pointerEvents:"none",maxWidth:380,
      }}>
        {hovered>=0&&(()=>{
          const s=SECTIONS[hovered];
          const [ar,ag,ab]=s.accent;
          const sC=(a:number)=>`rgba(${Math.round(ar*255)},${Math.round(ag*255)},${Math.round(ab*255)},${a})`;
          return(
            <div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:"0.30em",
                color:sC(0.60),textTransform:"uppercase",marginBottom:16}}>{s.years}</div>
              
              <div style={{fontFamily:"'Bodoni Moda',Georgia,serif",fontStyle:"italic",fontWeight:400,
                fontSize:"clamp(38px,5.5vw,72px)",lineHeight:0.90,letterSpacing:"-0.03em",
                color:"rgba(255,255,255,0.95)",
                textShadow:`0 0 80px ${sC(0.40)}, 0 4px 24px rgba(0,0,0,0.8)`,marginBottom:24}}>
                {s.line1}<br/>{s.line2}<br/>{s.line3}
              </div>

              <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:"0.14em",
                color:"rgba(255,255,255,0.45)",lineHeight:1.8}}>{s.sub}</div>
              
              <div style={{marginTop:32,display:"flex",alignItems:"center",gap:16}}>
                <div style={{width:40,height:1,background:sC(0.8),boxShadow:`0 0 12px ${sC(0.6)}`, position: "relative"}}>
                  {/* Subtle pulsing indicator */}
                  <div style={{position: "absolute", top: -1, right: 0, width: 3, height: 3, background: "#fff", borderRadius: "50%", boxShadow: `0 0 8px ${sC(1)}`, animation: "pulse 1.5s infinite"}}/>
                </div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:"0.24em",
                  color:sC(0.70),textTransform:"uppercase"}}>Click to enter</div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Nav list — right */}
      <div style={{
        position:"absolute",right:0,top:0,bottom:0,zIndex:10,
        width:"clamp(260px,30vw,420px)",
        borderLeft: `1px solid transparent`,
        borderImage: `linear-gradient(to bottom, transparent, ${aC(0.1)}, transparent) 1`,
        display:"flex",flexDirection:"column",justifyContent:"center",
        opacity:vis&&active<0?1:0,transition:"opacity 0.4s ease",
        overflowY:"auto",
      }}>
        {SECTIONS.map((s,i)=>{
          const isHov=hovered===i;
          const isOther=hovered>=0&&!isHov;
          const [ar,ag,ab]=s.accent;
          const sC=(a:number)=>`rgba(${Math.round(ar*255)},${Math.round(ag*255)},${Math.round(ab*255)},${a})`;
          return(
            <div
              key={s.id}
              onClick={()=>handleClick(i)}
              onMouseEnter={()=>handleHover(i)}
              onMouseLeave={()=>setHovered(-1)}
              style={{
                padding:"20px 40px",
                borderBottom:`1px solid ${isHov?sC(0.30):aC(0.04)}`,
                cursor:"none",
                background:isHov?`rgba(${Math.round(ar*255)},${Math.round(ag*255)},${Math.round(ab*255)},0.08)`:"transparent",
                opacity:vis?(isOther?0.25:1):0,
                // Physical push effect on hover
                transform:vis?(isHov?"translateX(12px)":"translateX(0px)"):"translateX(20px)",
                transitionProperty:"opacity, transform, background, border-color",
                transitionDuration:`${isOther?"0.3s":"0.4s"}, 0.4s, 0.3s, 0.3s`,
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                transitionDelay:`${isOther?"0s":`${0.05+i*0.04}s`}, 0s, 0s, 0s`,
                position:"relative",overflow:"hidden",
              } as React.CSSProperties}
            >
              {/* Soft sheen on hover */}
              {isHov&&<div style={{
                position:"absolute",inset:0,pointerEvents:"none",
                background:`linear-gradient(90deg, transparent, ${sC(0.15)}, transparent)`,
                animation:"sheen 1.8s ease-in-out infinite",
              }}/>}

              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <span style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:"0.14em",fontWeight: 600,
                  color:isHov?sC(0.80):aC(0.30),transition:"color 0.3s"}}>{s.index}</span>
                {isHov&&<div style={{width:20,height:1,background:sC(0.80),boxShadow:`0 0 8px ${sC(0.6)}`}}/>}
              </div>

              <div style={{
                fontFamily:"'Bodoni Moda',Georgia,serif",fontStyle:"italic",fontWeight:400,
                fontSize:"clamp(20px,2.5vw,32px)",lineHeight:1.0,letterSpacing:"-0.02em",
                color:isHov?"rgba(255,255,255,1)":aC(0.45),
                transition:"color 0.3s",
                textShadow:isHov?`0 0 20px ${sC(0.40)}`:"none",
              }}>
                {s.title}
              </div>
            </div>
          );
        })}

        <div style={{padding:"24px 40px",marginTop:"auto"}}>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:6,letterSpacing:"0.20em",
            color:aC(0.20),textTransform:"uppercase",lineHeight:2.2}}>
            Dom-001<br/>2026<br/>Worldwide
          </div>
        </div>
      </div>

      {/* Active takeover cinematic animation */}
      {active>=0&&(()=>{
        const s=SECTIONS[active];
        return(
          <div style={{position:"absolute",inset:0,zIndex:20,
            display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none", mixBlendMode: "screen"}}>
            <div style={{fontFamily:"'Bodoni Moda',Georgia,serif",fontStyle:"italic",fontWeight:400,
              fontSize:"clamp(60px,12vw,160px)",color:"rgba(255,255,255,0.95)",
              letterSpacing:"-0.03em",textAlign:"center", textShadow: "0 10px 40px rgba(0,0,0,0.5)",
              animation: "takeover 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards"
            }}>
              {s.title}
            </div>
          </div>
        );
      })()}

      <style>{`
        @keyframes sheen { 0% { transform: translateX(-150%) } 100% { transform: translateX(250%) } }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.8); } }
        @keyframes takeover {
          0% { transform: scale(0.9); opacity: 0; filter: blur(12px); }
          100% { transform: scale(1); opacity: 1; filter: blur(0px); }
        }
      `}</style>
    </div>
  );
} //