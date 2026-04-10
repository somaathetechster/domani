"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── EXPERIMENTS ─────────────────────────────────────────────────────────────
const EXPERIMENTS = [
  {
    id:1, name:"Bioluminescent Swarm", sub:"Living", year:"2025",
    tag:"organisms in motion",
    desc:"Deep in the ocean floor of a near-future Earth, organisms that evolved to convert electrical current into light have begun migrating in coordinated patterns. This is not instinct. It is communication. We are watching the emergence of a language we cannot yet read.",
  },
  {
    id:2, name:"Quantum Foam", sub:"Non-Living", year:"2025",
    tag:"spacetime at planck scale",
    desc:"At 10⁻³⁵ metres — the Planck length — spacetime stops being smooth and becomes a violent, churning topology. What looks like empty space is in fact a constant storm of virtual particles appearing and annihilating. This is the texture of nothing.",
  },
  {
    id:3, name:"Neural Bloom", sub:"Living", year:"2025",
    tag:"synthetic cognition growing",
    desc:"A synthetic neural cluster given a single instruction: grow. No objective function. No reward signal. Just growth. What emerges after 72 hours of simulation is not intelligence — it is the architecture of something that wants to become intelligent.",
  },
  {
    id:4, name:"Data Crystal", sub:"Non-Living", year:"2025",
    tag:"information made solid",
    desc:"If information has mass — and some physicists believe it does — then the largest datasets on Earth would crystallise under their own gravity. This is what a petabyte looks like when it forgets it is data and remembers it is physics.",
  },
  {
    id:5, name:"Signal Predator", sub:"Living", year:"2025",
    tag:"electromagnetic organism",
    desc:"Speculative biology for a world saturated with wireless signal. An organism that metabolises electromagnetic radiation — feeding on wifi, mobile networks, the ambient hum of a connected city. It does not eat. It listens until it is full.",
  },
  {
    id:6, name:"Plasma Coral", sub:"Living", year:"2025",
    tag:"high-energy life form",
    desc:"On the surface of a magnetar — a neutron star with a magnetic field a trillion times Earth's — the physics permit structures that behave like life. They form, branch, respond to stimuli, and die. We have no word for what they are.",
  },
  {
    id:7, name:"Tectonic Memory", sub:"Non-Living", year:"2025",
    tag:"geological computation",
    desc:"The Earth's crust has been recording seismic events for 4.5 billion years. Every earthquake is a write operation. Every fault line is a data structure. The planet is a hard drive. We are currently reading a file it began writing before life existed.",
  },
  {
    id:8, name:"Void Tendril", sub:"Living", year:"2025",
    tag:"deep space organism",
    desc:"In the cosmic voids between galaxy filaments — regions 300 million light-years across with almost nothing in them — something moves. Not fast. Not purposefully. But consistently toward the warmth of distant light. We are not alone in the empty places.",
  },
  {
    id:9, name:"Frequency Lattice", sub:"Non-Living", year:"2025",
    tag:"standing wave structure",
    desc:"A standing wave is a pattern that appears stationary but is in constant violent oscillation. Every stable structure you have ever touched is a standing wave. The lattice you see here is one boundary condition away from dissolving into noise.",
  },
  {
    id:10, name:"Synthetic Mycorrhiza", sub:"Living", year:"2025",
    tag:"machine root network",
    desc:"Forest trees share nutrients through fungal networks — a biological internet running beneath your feet. We built a machine equivalent. It does not share nutrients. It shares latency. It routes computation the way a forest routes phosphorus: along the path of least resistance.",
  },
];

// ─── DRAW FUNCTIONS — fill the full screen, bold, large ──────────────────────
type DrawFn = (
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  t: number, ex: number,   // 0-1 excite
  mx: number, my: number   // mouse 0-1 relative
) => void;

const DRAWS: DrawFn[] = [

  // 1. BIOLUMINESCENT SWARM
  (ctx,W,H,t,ex,mx,my) => {
    ctx.fillStyle=`rgba(0,0,8,${0.15-ex*.05})`; ctx.fillRect(0,0,W,H);
    const N=220+~~(ex*160);
    const focusX=W*mx, focusY=H*my;
    for(let i=0;i<N;i++){
      const ph=i/N*Math.PI*2;
      const base=Math.min(W,H)*.38;
      const spread=base*(0.4+0.6*ex);
      const orbit=spread*(0.5+0.5*Math.sin(ph*3+t*.6));
      const attract=0.3+ex*.5;
      const angle=ph+t*.38+Math.sin(ph*2+t*.9)*.9;
      let px=W/2+Math.cos(angle)*orbit+Math.sin(ph*5+t)*base*.08;
      let py=H/2+Math.sin(angle)*orbit*.6+Math.cos(ph*3+t*.7)*base*.06;
      // Attract toward mouse on excite
      px += (focusX-px)*attract*.18;
      py += (focusY-py)*attract*.14;
      const size=2+3.5*Math.abs(Math.sin(ph+t*2+ex*3));
      const alpha=0.35+0.55*Math.abs(Math.sin(ph*4+t*1.8));
      const r=~~(60+80*Math.sin(ph*1.5)), g=~~(180+75*Math.cos(ph*2.5)), b=~~(160+95*Math.sin(ph*.8+t));
      ctx.shadowBlur=12+ex*22; ctx.shadowColor=`rgba(${r},${g},${b},0.9)`;
      ctx.fillStyle=`rgba(${r},${g},${b},${alpha})`;
      ctx.beginPath(); ctx.arc(px,py,size,0,Math.PI*2); ctx.fill();
    }
    ctx.shadowBlur=0;
    // Mouse ripple on hold
    if(ex>.05){
      for(let r=1;r<=4;r++){
        const rr=(r/4)*(Math.min(W,H)*.5*ex);
        const a=.18*(1-r/4)*ex;
        ctx.strokeStyle=`rgba(100,255,200,${a})`; ctx.lineWidth=2;
        ctx.beginPath(); ctx.arc(focusX,focusY,rr+Math.sin(t*6)*20,0,Math.PI*2); ctx.stroke();
      }
    }
  },

  // 2. QUANTUM FOAM
  (ctx,W,H,t,ex,mx,my) => {
    ctx.fillStyle=`rgba(0,0,4,${.18-ex*.06})`; ctx.fillRect(0,0,W,H);
    const scale=1.8+ex*2.2;
    const offX=(mx-.5)*W*.3, offY=(my-.5)*H*.3;
    for(let y=0;y<H;y+=2){
      for(let x=0;x<W;x+=2){
        const nx=(x+offX)/W*9*scale, ny=(y+offY)/H*9*scale;
        const n1=Math.sin(nx*1.2+t*.8)*Math.cos(ny*1.7-t*.55);
        const n2=Math.sin(nx*2.9-t*1.1)*Math.cos(ny*2.2+t*.75);
        const n3=Math.sin((nx+ny)*1.4+t*1.3);
        const v=(n1+n2*.55+n3*.35)/1.9;
        if(Math.abs(v)<.055+ex*.09){
          const a=.18+Math.abs(v)*3+ex*.4;
          const r=~~(140+95*Math.sin(t+x*.008));
          const g=~~(90+65*Math.cos(t*.8+y*.009));
          const b=~~(210+45*Math.sin(t*1.4));
          ctx.fillStyle=`rgba(${r},${g},${b},${a})`; ctx.fillRect(x,y,2,2);
        }
      }
    }
    // Wormhole at mouse
    const wg=ctx.createRadialGradient(W*mx,H*my,0,W*mx,H*my,Math.min(W,H)*.25+ex*Math.min(W,H)*.2);
    wg.addColorStop(0,`rgba(200,150,255,${.12+ex*.2})`);
    wg.addColorStop(.5,`rgba(100,50,200,${.06+ex*.1})`);
    wg.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=wg; ctx.fillRect(0,0,W,H);
    // Event horizon ring
    if(ex>.1){
      ctx.strokeStyle=`rgba(220,180,255,${ex*.5})`; ctx.lineWidth=2+ex*3;
      ctx.beginPath(); ctx.arc(W*mx,H*my,Math.min(W,H)*.12+ex*60,0,Math.PI*2); ctx.stroke();
    }
  },

  // 3. NEURAL BLOOM
  (ctx,W,H,t,ex,mx,my) => {
    ctx.fillStyle=`rgba(1,2,6,${.13-ex*.04})`; ctx.fillRect(0,0,W,H);
    const cx=W*(.3+mx*.4), cy=H*(.3+my*.4);
    const branches=14+~~(ex*10), depth=6+~~(ex*5);
    const maxLen=Math.min(W,H)*.12+ex*Math.min(W,H)*.06;
    const drawB=(x:number,y:number,a:number,len:number,d:number,p:number)=>{
      if(d<=0||len<2)return;
      const ex2=x+Math.cos(a)*len, ey2=y+Math.sin(a)*len;
      const hue=180+d*22+~~(p*50);
      const alpha=.14+.5*(d/depth)+p*.35;
      ctx.strokeStyle=`hsla(${hue},85%,60%,${alpha})`;
      ctx.lineWidth=d*.8+p*1.5;
      ctx.shadowBlur=d*2.5+ex*10; ctx.shadowColor=`hsla(${hue},85%,60%,0.7)`;
      ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(ex2,ey2); ctx.stroke();
      ctx.shadowBlur=0;
      const spread=.38+ex*.32;
      drawB(ex2,ey2,a-spread+Math.sin(t*.6+d)*.35,len*.70,d-1,p*.72);
      drawB(ex2,ey2,a+spread+Math.cos(t*.5+d)*.35,len*.68,d-1,p*.65);
      if(d>2&&Math.random()<.38+ex*.25) drawB(ex2,ey2,a+Math.sin(t+d)*.25,len*.52,d-2,p*.45);
    };
    for(let i=0;i<branches;i++){
      const angle=(i/branches)*Math.PI*2+t*.09;
      const p=.5+.5*Math.sin(t*1.6+i*.75+ex*4);
      drawB(cx,cy,angle,maxLen,depth,p);
    }
    // Core
    const ng=ctx.createRadialGradient(cx,cy,0,cx,cy,38+ex*25);
    ng.addColorStop(0,"rgba(220,235,255,1)"); ng.addColorStop(.4,"rgba(130,180,255,.75)"); ng.addColorStop(1,"rgba(100,160,255,0)");
    ctx.fillStyle=ng; ctx.beginPath(); ctx.arc(cx,cy,38+ex*25,0,Math.PI*2); ctx.fill();
    // Hover node
    ctx.shadowBlur=20+ex*30; ctx.shadowColor="rgba(180,220,255,0.9)";
    ctx.fillStyle=`rgba(220,240,255,${.3+ex*.4})`;
    ctx.beginPath(); ctx.arc(W*mx,H*my,6+ex*8,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
  },

  // 4. DATA CRYSTAL
  (ctx,W,H,t,ex,mx,my) => {
    ctx.fillStyle=`rgba(0,1,5,${.18-ex*.05})`; ctx.fillRect(0,0,W,H);
    const cx=W/2, cy=H/2;
    const N=7+~~(ex*7), layers=10+~~(ex*4);
    for(let layer=0;layer<layers;layer++){
      const r=Math.min(W,H)*(.08+layer*.045+ex*.04);
      const tilt=t*.18*(layer%2===0?1:-1)+layer*.22+(mx-.5)*.8;
      for(let i=0;i<N;i++){
        const a0=tilt+(i/N)*Math.PI*2, a1=tilt+((i+1)/N)*Math.PI*2;
        const x0=cx+Math.cos(a0)*r, y0=cy+Math.sin(a0)*r*(0.52+layer*.02);
        const x1=cx+Math.cos(a1)*r, y1=cy+Math.sin(a1)*r*(0.52+layer*.02);
        const bright=.38+.62*((Math.sin(a0*2+t*.9+layer)+1)/2);
        const vr=~~(160+80*Math.sin(layer*.6+t)), vg=~~(190+65*Math.cos(a0+t*.5)), vb=255;
        const fg=ctx.createLinearGradient(x0,y0,x1,y1+r*.4);
        fg.addColorStop(0,`rgba(${vr},${vg},${vb},${.22*bright})`);
        fg.addColorStop(.4,`rgba(255,255,255,${.18*bright})`);
        fg.addColorStop(1,`rgba(${vr*.3|0},${vg*.3|0},${vb*.3|0},${.08*bright})`);
        ctx.beginPath();
        ctx.moveTo(cx+(0-cx)*.02,cy+(0-cy)*.02);
        ctx.lineTo(x0,y0); ctx.lineTo(x1,y1); ctx.closePath();
        ctx.fillStyle=fg; ctx.fill();
        ctx.strokeStyle=`rgba(${vr},${vg},${vb},${.25*bright})`; ctx.lineWidth=.8; ctx.stroke();
      }
    }
    // Core
    const cg=ctx.createRadialGradient(cx,cy,0,cx,cy,50+ex*35);
    cg.addColorStop(0,"rgba(255,255,255,1)"); cg.addColorStop(.35,"rgba(160,210,255,.8)"); cg.addColorStop(1,"rgba(100,160,255,0)");
    ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(cx,cy,50+ex*35,0,Math.PI*2); ctx.fill();
    // Bit rain
    ctx.fillStyle=`rgba(120,180,255,${.09+ex*.12})`;
    ctx.font=`${9+ex*4}px 'DM Mono',monospace`;
    for(let i=0;i<50;i++){
      const bx=((i*137.5+t*55)%W), by=((i*91.3+t*75)%H);
      ctx.fillText(Math.random()>.5?"1":"0",bx,by);
    }
    // Mouse highlight beam
    const bg=ctx.createRadialGradient(W*mx,H*my,0,W*mx,H*my,100+ex*80);
    bg.addColorStop(0,`rgba(180,220,255,${.10+ex*.14})`); bg.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
  },

  // 5. SIGNAL PREDATOR
  (ctx,W,H,t,ex,mx,my) => {
    ctx.fillStyle=`rgba(3,0,0,${.12-ex*.04})`; ctx.fillRect(0,0,W,H);
    // Hunt toward mouse
    const targetX=W*mx, targetY=H*my;
    const bodyX=W*.5+Math.sin(t*.45)*W*.3;
    const bodyY=H*.5+Math.cos(t*.38)*H*.22;
    const huntX=bodyX+(targetX-bodyX)*.04*t*.2;
    const huntY=bodyY+(targetY-bodyY)*.04*t*.2;
    const len=Math.min(W,H)*.25+ex*Math.min(W,H)*.1;
    // Body trail
    for(let i=0;i<28;i++){
      const f=i/28;
      const tx2=huntX+Math.cos(t*.65+f*2.5)*len*f;
      const ty2=huntY+Math.sin(t*.55+f*2)*len*f*.55;
      ctx.fillStyle=`rgba(255,${~~(90+100*(1-f))},0,${.08*(1-f)*3})`;
      ctx.beginPath(); ctx.arc(tx2,ty2,Math.min(W,H)*.06*(1-f),0,Math.PI*2); ctx.fill();
    }
    // Head
    ctx.shadowBlur=35+ex*50; ctx.shadowColor="rgba(255,180,0,0.9)";
    const headG=ctx.createRadialGradient(huntX,huntY,0,huntX,huntY,Math.min(W,H)*.065+ex*.04*Math.min(W,H));
    headG.addColorStop(0,"rgba(255,240,160,1)"); headG.addColorStop(.5,"rgba(255,160,0,.8)"); headG.addColorStop(1,"rgba(255,100,0,0)");
    ctx.fillStyle=headG; ctx.beginPath(); ctx.arc(huntX,huntY,Math.min(W,H)*.065+ex*30,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0;
    // Eyes
    [-.3,.3].forEach(o=>{
      const ea=Math.atan2(targetY-huntY,targetX-huntX)+o;
      const er=Math.min(W,H)*.028;
      ctx.fillStyle="rgba(255,255,255,0.95)";
      ctx.beginPath(); ctx.arc(huntX+Math.cos(ea)*er*2.2,huntY+Math.sin(ea)*er*2.2,er,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="rgba(0,0,0,1)";
      ctx.beginPath(); ctx.arc(huntX+Math.cos(ea)*er*2.5,huntY+Math.sin(ea)*er*2.5,er*.55,0,Math.PI*2); ctx.fill();
    });
    // Electric tendrils toward mouse
    const tCount=6+~~(ex*6);
    for(let i=0;i<tCount;i++){
      const angle=t*1.6+i*Math.PI/3+(mx-.5)*.5;
      const tlen2=Math.min(W,H)*(0.2+ex*.18);
      ctx.strokeStyle=`rgba(255,${~~(140+80*Math.sin(t+i))},0,${.25+ex*.35})`; ctx.lineWidth=2+ex*2;
      ctx.shadowBlur=12+ex*18; ctx.shadowColor="rgba(255,160,0,0.8)";
      ctx.beginPath(); ctx.moveTo(huntX,huntY);
      for(let j=1;j<=10;j++){
        const f=j/10;
        const jitter=Math.min(W,H)*.08*Math.sin(t*5+j+i);
        ctx.lineTo(huntX+Math.cos(angle+jitter*.06)*tlen2*f, huntY+Math.sin(angle)*tlen2*f+jitter);
      }
      ctx.stroke(); ctx.shadowBlur=0;
    }
    // Static lines filling screen
    for(let i=0;i<8;i++){
      const sx=Math.sin(i*137+t*.2)*W, sy=Math.cos(i*87+t*.15)*H;
      ctx.strokeStyle=`rgba(255,100,0,${.03+ex*.04})`; ctx.lineWidth=.5;
      ctx.beginPath(); ctx.moveTo(huntX,huntY); ctx.lineTo(sx,sy); ctx.stroke();
    }
  },

  // 6. PLASMA CORAL
  (ctx,W,H,t,ex,mx,my) => {
    ctx.fillStyle=`rgba(0,0,6,${.13-ex*.04})`; ctx.fillRect(0,0,W,H);
    const bases=8+~~(ex*6);
    const baseY=H*.78+my*H*.12;
    const drawCoral=(x:number,y:number,a:number,len:number,d:number)=>{
      if(d<=0||len<2.5)return;
      const ex2=x+Math.cos(a)*len, ey2=y+Math.sin(a)*len;
      const vr=~~(180+75*Math.sin(d+t)), vg=~~(60+90*(1-d/10));
      const alpha=.35+.5*(d/10)+ex*.3;
      ctx.strokeStyle=`rgba(${vr},${vg},255,${alpha})`;
      ctx.lineWidth=d*.85+ex*1.2;
      ctx.shadowBlur=d*3.5+ex*12; ctx.shadowColor=`rgba(${vr},${vg},255,.8)`;
      ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(ex2,ey2); ctx.stroke();
      ctx.shadowBlur=0;
      const spread=.32+ex*.28+.18*Math.sin(t*.8+d+x*.005);
      drawCoral(ex2,ey2,a-spread,len*.72,d-1);
      drawCoral(ex2,ey2,a+spread,len*.70,d-1);
      if(Math.random()<.35+ex*.28) drawCoral(ex2,ey2,a+Math.sin(t*.6)*.45,len*.55,d-2);
    };
    for(let i=0;i<bases;i++){
      const bx=W*(i+.5)/bases+Math.sin(t*.35+i)*W*.04;
      const angle=-Math.PI/2+Math.sin(t*.25+i)*.4+(mx-.5)*.5;
      const cLen=Math.min(W,H)*(.08+ex*.05);
      drawCoral(bx,baseY,angle,cLen,9+~~(ex*4));
    }
    // Seabed glow
    const sg=ctx.createLinearGradient(0,H*.65,0,H);
    sg.addColorStop(0,"rgba(0,0,20,0)"); sg.addColorStop(1,`rgba(20,0,80,${.4+ex*.2})`);
    ctx.fillStyle=sg; ctx.fillRect(0,H*.65,W,H*.35);
  },

  // 7. TECTONIC MEMORY
  (ctx,W,H,t,ex,mx,my) => {
    ctx.fillStyle=`rgba(5,2,1,${.16-ex*.05})`; ctx.fillRect(0,0,W,H);
    const layers=16;
    for(let l=0;l<layers;l++){
      const frac=l/layers;
      const y=H*(.05+frac*.9);
      const amp=H*(.04+frac*.12+ex*.08+(my-.5)*.04);
      ctx.beginPath();
      for(let x=0;x<=W;x+=2){
        const v=(x/W)*6+(mx-.5)*2;
        const h=y+amp*Math.sin(v+t*.25*(l%2===0?1:-1)+l)
               +amp*.4*Math.cos(v*2.5-t*.18+l*.55);
        x===0?ctx.moveTo(x,h):ctx.lineTo(x,h);
      }
      const lr=~~(70+65*frac), lg=~~(40+35*(1-frac)), lb=~~(25+20*Math.sin(frac*Math.PI));
      ctx.strokeStyle=`rgba(${lr},${lg},${lb},${.28+ex*.28})`; ctx.lineWidth=1.5+frac*2.5; ctx.stroke();
      // Fault lines
      if(l%3===0){
        const fx=W*(.15+.7*Math.sin(l*1.9+t*.12+mx));
        const fIntensity=.18+ex*.45;
        ctx.strokeStyle=`rgba(255,${~~(160+60*ex)},80,${fIntensity})`; ctx.lineWidth=1.5+ex*2;
        ctx.shadowBlur=8+ex*20; ctx.shadowColor="rgba(255,200,80,0.7)";
        ctx.beginPath(); ctx.moveTo(fx,y-28); ctx.lineTo(fx+40*ex*Math.sign(Math.cos(l)),y+50); ctx.stroke();
        ctx.shadowBlur=0;
      }
    }
    // Magma glow at bottom
    const mg=ctx.createLinearGradient(0,H*.7,0,H);
    mg.addColorStop(0,"rgba(0,0,0,0)"); mg.addColorStop(.5,`rgba(180,60,0,${.06+ex*.12})`); mg.addColorStop(1,`rgba(255,120,0,${.12+ex*.20})`);
    ctx.fillStyle=mg; ctx.fillRect(0,H*.7,W,H*.3);
  },

  // 8. VOID TENDRIL
  (ctx,W,H,t,ex,mx,my) => {
    ctx.fillStyle=`rgba(0,0,0,${.09-ex*.03})`; ctx.fillRect(0,0,W,H);
    const count=10+~~(ex*8);
    for(let ti=0;ti<count;ti++){
      const baseAngle=(ti/count)*Math.PI*2+(mx-.5)*.6;
      const pts:Array<{x:number;y:number}>=[];
      let x=W/2+(mx-.5)*W*.2, y=H/2+(my-.5)*H*.2, angle=baseAngle;
      const steps=80+~~(ex*50);
      for(let j=0;j<steps;j++){
        angle+=Math.sin(t*.9+j*.16+ti)*.14*(1+ex*1.5);
        const speed=Math.min(W,H)*(.004+ex*.004);
        x+=Math.cos(angle)*speed; y+=Math.sin(angle)*speed;
        pts.push({x,y});
      }
      for(let j=1;j<pts.length;j++){
        const f=j/pts.length;
        const alpha=f*(0.45+ex*.45);
        const vr=~~(100+70*Math.sin(baseAngle+t*.5)), vb=~~(190+65*Math.sin(t*.4+ti));
        ctx.shadowBlur=5+ex*14; ctx.shadowColor=`rgba(${vr},50,${vb},0.85)`;
        ctx.fillStyle=`rgba(${vr},50,${vb},${alpha})`;
        ctx.beginPath(); ctx.arc(pts[j].x,pts[j].y,(2+f*7+ex*5)*(1-f*.3),0,Math.PI*2); ctx.fill();
      }
      ctx.shadowBlur=0;
    }
    // Void core at mouse
    const vc=ctx.createRadialGradient(W*mx,H*my,0,W*mx,H*my,80+ex*60);
    vc.addColorStop(0,`rgba(150,50,220,${.25+ex*.3})`);
    vc.addColorStop(.4,`rgba(80,0,150,${.10+ex*.15})`);
    vc.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=vc; ctx.fillRect(0,0,W,H);
  },

  // 9. FREQUENCY LATTICE
  (ctx,W,H,t,ex,mx,my) => {
    ctx.fillStyle=`rgba(0,1,8,${.16-ex*.05})`; ctx.fillRect(0,0,W,H);
    const FREQ=5+~~(ex*5)+(mx-.5)*3;
    const AMP=H*(.06+ex*.10)+(my-.5)*H*.04;
    const rows=28;
    for(let yi=0;yi<=rows;yi++){
      const y=(yi/rows)*H;
      ctx.beginPath();
      for(let x=0;x<=W;x+=2){
        const v=(x/W)*Math.PI*2*FREQ;
        const h=y+AMP*Math.sin(v+t*1.8)*Math.sin(yi*.32+t*.6);
        x===0?ctx.moveTo(x,h):ctx.lineTo(x,h);
      }
      const hue=195+yi*5; const alpha=.10+.18*Math.abs(Math.sin(yi*.42+t*.35));
      ctx.strokeStyle=`hsla(${hue},85%,68%,${alpha+ex*.22})`; ctx.lineWidth=1.2; ctx.stroke();
    }
    const cols=28;
    for(let xi=0;xi<=cols;xi++){
      const x=(xi/cols)*W;
      ctx.beginPath();
      for(let y=0;y<=H;y+=2){
        const v=(y/H)*Math.PI*2*FREQ;
        const h=x+AMP*.7*Math.sin(v+t*1.5)*Math.sin(xi*.32-t*.5);
        y===0?ctx.moveTo(h,y):ctx.lineTo(h,y);
      }
      const hue=240+xi*5; const alpha=.08+.15*Math.abs(Math.sin(xi*.42-t*.42));
      ctx.strokeStyle=`hsla(${hue},85%,68%,${alpha+ex*.18})`; ctx.lineWidth=1.2; ctx.stroke();
    }
    // Resonance nodes
    for(let i=0;i<8;i++){
      for(let j=0;j<6;j++){
        const nx=(i+1)/9*W, ny=(j+1)/7*H;
        const p=0.5+0.5*Math.sin(t*2.2+i+j+ex*3);
        if(p>.58+ex*.18){
          ctx.shadowBlur=22+ex*28; ctx.shadowColor="rgba(160,230,255,0.95)";
          ctx.fillStyle=`rgba(200,240,255,${(p-.55)*2})`;
          ctx.beginPath(); ctx.arc(nx,ny,6+p*18+ex*12,0,Math.PI*2); ctx.fill();
          ctx.shadowBlur=0;
        }
      }
    }
    // Mouse standing wave interference
    const mg=ctx.createRadialGradient(W*mx,H*my,0,W*mx,H*my,120+ex*100);
    mg.addColorStop(0,`rgba(180,230,255,${.14+ex*.18})`); mg.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=mg; ctx.fillRect(0,0,W,H);
  },

  // 10. SYNTHETIC MYCORRHIZA
  (ctx,W,H,t,ex,mx,my) => {
    ctx.fillStyle=`rgba(1,4,1,${.12-ex*.04})`; ctx.fillRect(0,0,W,H);
    const NNodes=26+~~(ex*18);
    const nodes=Array.from({length:NNodes},(_,i)=>({
      x:W*(0.05+0.9*((i*137.508)%1)),
      y:H*(0.05+0.9*((i*97.3)%1)),
      r:4.5+i*.28, ph:i*.618*Math.PI*2,
    }));
    // Draw connections
    nodes.forEach((a,i)=>{
      nodes.slice(i+1).forEach((b)=>{
        const d=Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2);
        if(d>Math.min(W,H)*.28)return;
        const alpha=(1-d/(Math.min(W,H)*.28))*(.14+ex*.20);
        ctx.strokeStyle=`rgba(70,200,90,${alpha})`; ctx.lineWidth=1+alpha*2;
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        // Signal pulse
        const flow=(t*80+i*35)%d, f=flow/d;
        if(f<1){
          const px=a.x+(b.x-a.x)*f, py=a.y+(b.y-a.y)*f;
          ctx.shadowBlur=10+ex*12; ctx.shadowColor="rgba(120,255,120,0.9)";
          ctx.fillStyle=`rgba(160,255,160,${.65+ex*.3})`;
          ctx.beginPath(); ctx.arc(px,py,3+ex*3,0,Math.PI*2); ctx.fill();
          ctx.shadowBlur=0;
        }
      });
    });
    // Draw nodes
    nodes.forEach(n=>{
      const p=.5+.5*Math.sin(n.ph+t*1.4+ex*4);
      const vg=~~(170+85*p);
      ctx.fillStyle=`rgba(60,${vg},65,${.4+p*.55})`;
      ctx.shadowBlur=12+ex*18; ctx.shadowColor="rgba(100,255,100,0.75)";
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r*(.65+p*.7)+ex*n.r*.4,0,Math.PI*2); ctx.fill();
      ctx.shadowBlur=0;
    });
    // Mouse draws new temporary connections
    if(ex>.15){
      nodes.forEach(n=>{
        const d=Math.sqrt((W*mx-n.x)**2+(H*my-n.y)**2);
        if(d<Math.min(W,H)*.22){
          ctx.strokeStyle=`rgba(180,255,180,${ex*(1-d/(Math.min(W,H)*.22))*.7})`; ctx.lineWidth=1.5;
          ctx.beginPath(); ctx.moveTo(W*mx,H*my); ctx.lineTo(n.x,n.y); ctx.stroke();
        }
      });
    }
  },
];

// ─── EXPERIMENT CANVAS ────────────────────────────────────────────────────────
function ExperimentCanvas({
  idx, excite, mx, my,
}: { idx:number; excite:number; mx:number; my:number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const t0  = useRef(performance.now());

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    t0.current = performance.now();
    // Black start
    c.width = window.innerWidth; c.height = window.innerHeight;
    ctx.fillStyle="#000"; ctx.fillRect(0,0,c.width,c.height);

    const draw = () => {
      raf.current = requestAnimationFrame(draw);
      const W = c.width = c.offsetWidth, H = c.height = c.offsetHeight;
      if (!W || !H) return;
      const t = (performance.now() - t0.current) / 1000;
      DRAWS[idx]?.(ctx, W, H, t, excite, mx, my);
    };
    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [idx, excite, mx, my]);

  return <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>;
}

// ─── CURSOR ───────────────────────────────────────────────────────────────────
function LabCursor({ excite }: { excite:number }) {
  const ring = useRef<HTMLDivElement>(null);
  const dot  = useRef<HTMLDivElement>(null);
  const pos  = useRef({cx:0,cy:0,mx:0,my:0});
  const raf  = useRef(0);

  useEffect(() => {
    const mv=(e:MouseEvent)=>{pos.current.mx=e.clientX;pos.current.my=e.clientY;};
    window.addEventListener("mousemove",mv);
    const tick=()=>{
      raf.current=requestAnimationFrame(tick);
      const p=pos.current;
      p.cx+=(p.mx-p.cx)*.1; p.cy+=(p.my-p.cy)*.1;
      if(ring.current){
        ring.current.style.left=p.cx+"px"; ring.current.style.top=p.cy+"px";
        const sz=24+excite*52;
        ring.current.style.width=sz+"px"; ring.current.style.height=sz+"px";
        const a=0.35+excite*.65;
        ring.current.style.borderColor=`rgba(184,240,255,${a})`;
        ring.current.style.boxShadow=excite>0.1?`0 0 ${12+excite*24}px rgba(184,240,255,${excite*.7})`:"none";
      }
      if(dot.current){dot.current.style.left=p.mx+"px";dot.current.style.top=p.my+"px";}
    };
    raf.current=requestAnimationFrame(tick);
    return()=>{window.removeEventListener("mousemove",mv);cancelAnimationFrame(raf.current);};
  },[excite]);

  return(<>
    <div ref={ring} style={{position:"fixed",zIndex:9990,pointerEvents:"none",
      transform:"translate(-50%,-50%)",width:24,height:24,
      border:"1.5px solid rgba(184,240,255,0.4)",borderRadius:"50%",
      transition:"width .25s cubic-bezier(.16,1,.3,1),height .25s,box-shadow .18s"}}/>
    <div ref={dot} style={{position:"fixed",zIndex:9991,pointerEvents:"none",
      transform:"translate(-50%,-50%)",width:4,height:4,borderRadius:"50%",
      background:"rgba(184,240,255,0.9)",boxShadow:"0 0 6px rgba(184,240,255,0.6)"}}/>
  </>);
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
const DURATION = 15; // seconds per experiment

export default function LabPage() {
  const [current,  setCurrent]  = useState(0);
  const [excite,   setExcite]   = useState(0);
  const [listOpen, setListOpen] = useState(false);
  const [sound,    setSound]    = useState(true);
  const [progress, setProgress] = useState(0);
  const [mx, setMx] = useState(0.5);
  const [my, setMy] = useState(0.5);

  const holdRef   = useRef<ReturnType<typeof setInterval>|null>(null);
  const trackRef  = useRef<HTMLAudioElement|null>(null);
  const timerRef  = useRef<ReturnType<typeof setInterval>|null>(null);
  const progressRef = useRef(0);

  // Lab audio
  useEffect(()=>{
    const track=new Audio("/audio/lab.mp3");
    track.loop=true; track.volume=0;
    track.play().catch(()=>{
      const resume=()=>{ track.play().catch(()=>{}); window.removeEventListener("click",resume); };
      window.addEventListener("click",resume,{once:true});
    });
    let v=0; const iv=setInterval(()=>{v=Math.min(v+.45/60,.45);track.volume=v;if(v>=.45)clearInterval(iv);},50);
    trackRef.current=track;
    (window as any).__labTrack=track;
    return()=>{
      let ov=track.volume;
      const fo=setInterval(()=>{ov=Math.max(0,ov-.45/40);track.volume=ov;if(ov<=0){track.pause();clearInterval(fo);}},16);
      (window as any).__labTrack=null;
    };
  },[]);

  useEffect(()=>{if(trackRef.current)trackRef.current.volume=sound?.45:0;},[sound]);

  // Auto-advance every 15s
  const startTimer = useCallback(() => {
    progressRef.current=0; setProgress(0);
    if(timerRef.current) clearInterval(timerRef.current);
    timerRef.current=setInterval(()=>{
      progressRef.current+=100/DURATION;
      setProgress(p=>{
        const next=p+100/DURATION;
        if(next>=100){
          setCurrent(c=>(c+1)%EXPERIMENTS.length);
          progressRef.current=0;
          return 0;
        }
        return next;
      });
    },1000);
  },[]);

  useEffect(()=>{ startTimer(); return()=>{if(timerRef.current)clearInterval(timerRef.current);}; },[startTimer]);
  useEffect(()=>{ startTimer(); },[current,startTimer]);

  // Mouse tracking
  useEffect(()=>{
    const mv=(e:MouseEvent)=>{setMx(e.clientX/window.innerWidth);setMy(e.clientY/window.innerHeight);};
    window.addEventListener("mousemove",mv);
    return()=>window.removeEventListener("mousemove",mv);
  },[]);

  // Hold to excite
  const startHold=useCallback(()=>{
    holdRef.current=setInterval(()=>setExcite(e=>Math.min(e+.05,1)),32);
  },[]);
  const endHold=useCallback(()=>{
    if(holdRef.current)clearInterval(holdRef.current);
    const dec=setInterval(()=>setExcite(e=>{if(e<=0){clearInterval(dec);return 0;}return e-.03;}),32);
  },[]);

  // Click anywhere (not on buttons) = excite pulse
  const onClickCanvas = useCallback((e:React.MouseEvent)=>{
    if((e.target as HTMLElement).tagName==="BUTTON")return;
    setExcite(ex=>Math.min(ex+.25,1));
  },[]);

  const prev=()=>{setCurrent(c=>(c-1+EXPERIMENTS.length)%EXPERIMENTS.length);};
  const next=()=>{setCurrent(c=>(c+1)%EXPERIMENTS.length);};

  const exp=EXPERIMENTS[current];
  const C="rgba(184,240,255,";

  return (
    <div style={{position:"fixed",inset:0,background:"#000",overflow:"hidden",userSelect:"none"}}
      onMouseDown={startHold} onMouseUp={endHold}
      onTouchStart={startHold} onTouchEnd={endHold}
      onClick={onClickCanvas}>

      <ExperimentCanvas idx={current} excite={excite} mx={mx} my={my}/>
      <LabCursor excite={excite}/>

      {/* ── TOP BAR ── */}
      <div style={{position:"absolute",top:0,left:0,right:0,zIndex:20,
        display:"flex",justifyContent:"space-between",alignItems:"center",
        padding:"18px 32px",
        background:"linear-gradient(to bottom,rgba(0,0,0,0.75),rgba(0,0,0,0))",
        pointerEvents:"none"}}>
        <div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:".42em",
            color:C+"0.65)",textTransform:"uppercase"}}>DOMANI / Lab</div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:".22em",
            color:C+"0.28)",textTransform:"uppercase",marginTop:4}}>
            Wave 1 — Synthetic Life — {exp.year}
          </div>
        </div>
        <div style={{display:"flex",gap:12,pointerEvents:"all"}}>
          <button onClick={e=>{e.stopPropagation();setSound(s=>!s);}}
            style={{background:"none",border:`1px solid ${C+(sound?"0.38)":"0.15)")}`,
              padding:"5px 14px",cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:7,
              letterSpacing:".20em",color:C+(sound?"0.65)":"0.30)"),textTransform:"uppercase"}}>
            {sound?"◼ sound":"◻ muted"}
          </button>
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div style={{position:"absolute",top:60,left:0,right:0,height:1,zIndex:20,background:"rgba(255,255,255,0.06)"}}>
        <div style={{height:"100%",width:`${progress}%`,background:C+"0.55)",transition:"width 1s linear",
          boxShadow:`0 0 6px ${C+"0.4)"}`}}/>
      </div>

      {/* ── BOTTOM CONTENT ── */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,zIndex:20,
        padding:"0 40px 32px",
        background:"linear-gradient(to top,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.4) 60%,rgba(0,0,0,0) 100%)"}}>

        <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:40,alignItems:"flex-end"}}>
          {/* Left — info */}
          <div>
            <div style={{display:"flex",gap:14,marginBottom:10,alignItems:"center"}}>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:".28em",
                color:C+"0.40)",textTransform:"uppercase"}}>
                {exp.id.toString().padStart(2,"0")} / {EXPERIMENTS.length.toString().padStart(2,"0")}
              </div>
              <div style={{width:1,height:12,background:C+"0.20)"}}/>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:".20em",
                color:C+"0.32)",textTransform:"uppercase"}}>{exp.sub}</div>
              <div style={{width:1,height:12,background:C+"0.14)"}}/>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:".14em",
                color:C+"0.22)"}}>{exp.tag}</div>
            </div>

            <h2 style={{fontFamily:"'Bodoni Moda',Georgia,serif",fontStyle:"italic",fontWeight:400,
              fontSize:"clamp(26px,4.2vw,58px)",color:"rgba(255,255,255,0.94)",
              lineHeight:.95,letterSpacing:"-.02em",margin:"0 0 14px"}}>
              {exp.name}
            </h2>

            {/* Domani description */}
            <p style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:".07em",
              color:"rgba(255,255,255,0.42)",lineHeight:1.82,maxWidth:580,margin:"0 0 16px"}}>
              {exp.desc}
            </p>

            {/* Excite indicator */}
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:160,height:2,background:"rgba(255,255,255,0.10)"}}>
                <div style={{height:"100%",width:`${excite*100}%`,
                  background:excite>.6?"rgba(255,200,100,0.9)":C+"0.70)",
                  boxShadow:`0 0 8px ${excite>.6?"rgba(255,200,100,0.6)":C+"0.55)"}`,transition:"none"}}/>
              </div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:".20em",
                color:C+"0.28)",textTransform:"uppercase"}}>
                {excite>.05?`excite ${Math.round(excite*100)}%`:"hold to excite"}
              </div>
            </div>
          </div>

          {/* Right — navigation */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:12}}>
            {/* List */}
            <button onClick={e=>{e.stopPropagation();setListOpen(l=>!l);}}
              style={{background:"none",border:`1px solid ${C+"0.25)"}`,
                padding:"7px 18px",cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:7,
                letterSpacing:".22em",color:C+"0.55)",textTransform:"uppercase",
                transition:"border-color .2s",minWidth:90,textAlign:"center"}}>
              Index
            </button>
            <div style={{display:"flex",gap:8}}>
              <button onClick={e=>{e.stopPropagation();prev();}}
                style={{background:"none",border:`1px solid ${C+"0.22)"}`,
                  width:44,height:44,cursor:"pointer",color:C+"0.65)",fontSize:18,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  transition:"border-color .2s"}}>←</button>
              <button onClick={e=>{e.stopPropagation();next();}}
                style={{background:"none",border:`1px solid ${C+"0.22)"}`,
                  width:44,height:44,cursor:"pointer",color:C+"0.65)",fontSize:18,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  transition:"border-color .2s"}}>→</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── LIST OVERLAY ── */}
      {listOpen&&(
        <div style={{position:"absolute",inset:0,zIndex:50,
          background:"rgba(0,0,0,0.96)",backdropFilter:"blur(16px)",
          display:"flex",flexDirection:"column",justifyContent:"center",
          padding:"60px 80px"}} onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:44}}>
            <div style={{fontFamily:"'Bodoni Moda',Georgia,serif",fontStyle:"italic",
              fontSize:"clamp(28px,4.5vw,56px)",color:"rgba(255,255,255,0.88)",letterSpacing:"-.02em"}}>
              Wave 1 — Synthetic Life
            </div>
            <button onClick={()=>setListOpen(false)}
              style={{background:"none",border:`1px solid ${C+"0.25)"}`,padding:"6px 18px",
                cursor:"pointer",fontFamily:"'DM Mono',monospace",fontSize:7,
                letterSpacing:".22em",color:C+"0.50)",textTransform:"uppercase"}}>✕ Close</button>
          </div>
          <div>
            {EXPERIMENTS.map((ex2,i)=>(
              <div key={ex2.id} onClick={()=>{setCurrent(i);setListOpen(false);}}
                style={{display:"grid",gridTemplateColumns:"52px 1fr 110px 80px",
                  alignItems:"center",gap:24,padding:"16px 0",
                  borderBottom:`1px solid ${C+"0.055)"}`,cursor:"pointer",
                  background:current===i?C+"0.04)":"transparent",transition:"background .18s"}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:".12em",
                  color:current===i?C+"0.70)":C+"0.22)"}}>{ex2.id.toString().padStart(2,"0")}</div>
                <div style={{fontFamily:"'Bodoni Moda',Georgia,serif",fontStyle:"italic",
                  fontSize:"clamp(16px,2.2vw,28px)",letterSpacing:"-.01em",
                  color:current===i?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.48)"}}>
                  {ex2.name}
                </div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:".16em",
                  color:C+"0.26)",textTransform:"uppercase"}}>{ex2.sub}</div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:7,color:C+"0.18)"}}>{ex2.year}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:36,fontFamily:"'DM Mono',monospace",fontSize:8,
            letterSpacing:".16em",color:C+"0.20)",lineHeight:2}}>
            Creative coding for futures that don't exist yet.<br/>
            Domani Lab — speculative research & experimental builds.<br/>
            <span style={{color:C+"0.36)"}}>hello@domani.studio</span>
          </div>
        </div>
      )}

      <style>{`*{cursor:none!important}`}</style>
    </div>
  );
}