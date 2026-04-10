"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const S = [
  { n:"01", title:"Brand Identity",       tag:"SYSTEM.IDENTITY",     col:"#FF2D55",
    desc:"We don't make logos. We build the architecture that determines how power reads you before you speak. Marks, systems, voice, motion — every signal calibrated to compound.",
    del:["Naming","Visual Identity","Brand Systems","Motion Identity","Guidelines"] },
  { n:"02", title:"Product Engineering",  tag:"SYSTEM.BUILD",        col:"#FF9500",
    desc:"From schema to production — no prototypes left in drawers. We architect for the company you intend to become, not the one you are. Technical decisions made in week two carry weight in year three.",
    del:["Web Applications","iOS & Android","API Design","Infrastructure","DevOps"] },
  { n:"03", title:"AI Systems",           tag:"SYSTEM.INTELLIGENCE", col:"#00C7BE",
    desc:"We design and deploy intelligence infrastructure — from model architecture to the interfaces through which humans interact with machine reasoning. AI as infrastructure, not feature.",
    del:["LLM Integration","AI Architecture","Voice AI","Knowledge Systems","ML Pipelines"] },
  { n:"04", title:"Strategic Consulting", tag:"SYSTEM.STRATEGY",     col:"#5E5CE6",
    desc:"Strategy is the decision that makes all other decisions easier. We work at inflection points — where the next move determines the next five years. Diagnosis before prescription. Every time.",
    del:["Market Positioning","Brand Strategy","Growth Strategy","Executive Advisory","Market Entry"] },
  { n:"05", title:"Digital Experience",   tag:"SYSTEM.INTERFACE",    col:"#30D158",
    desc:"Your website is the one territory you control entirely. We build digital experiences that convert, retain, and represent — not portfolios but working infrastructure. The interface is the argument.",
    del:["Website Design","Design Systems","UX Research","Interaction Design","Accessibility"] },
  { n:"06", title:"Content & Editorial",  tag:"SYSTEM.SIGNAL",       col:"#FF375F",
    desc:"We build content infrastructure — strategy, production, distribution, and measurement — for organisations that want to own a conversation, not rent attention. Thought leadership as proof of work.",
    del:["Content Strategy","Copywriting","Editorial Design","Campaign Production","Social Systems"] },
  { n:"07", title:"Innovation Labs",      tag:"SYSTEM.RESEARCH",     col:"#0A84FF",
    desc:"R&D engagements for organisations willing to explore what comes next. Generative systems, spatial computing, emerging protocols. We build the thing before the category exists to name it.",
    del:["Prototyping","Emerging Tech","Spatial Computing","Generative AI","R&D Sprints"] },
];

function rgb(h:string):[number,number,number]{
  const c=h.replace("#","");
  return [parseInt(c.slice(0,2),16)||0,parseInt(c.slice(2,4),16)||0,parseInt(c.slice(4,6),16)||0];
}

// ─── DECRYPT ──────────────────────────────────────────────────────────────────
const GL="!<>-_\\/[]{}=+*^?#@~;:|$%░▒";
function useDecrypt(text:string,trig:number,spd=0.7,delay=0){
  const [d,setD]=useState("");
  const iv=useRef<any>(null),to=useRef<any>(null);
  useEffect(()=>{
    if(iv.current)clearInterval(iv.current);
    if(to.current)clearTimeout(to.current);
    setD("");
    to.current=setTimeout(()=>{
      let it=0;
      iv.current=setInterval(()=>{
        setD(text.split("").map((ch,i)=>{
          if(ch===" ")return " ";
          if(i<it)return text[i];
          return GL[Math.floor(Math.random()*GL.length)];
        }).join(""));
        it+=spd;
        if(it>=text.length){setD(text);clearInterval(iv.current);}
      },18);
    },delay);
    return()=>{if(iv.current)clearInterval(iv.current);if(to.current)clearTimeout(to.current);};
  },[trig,text,spd,delay]);
  return d;
}

// ─── CURSOR ───────────────────────────────────────────────────────────────────
function Cursor({col,hot}:{col:string;hot:boolean}){
  const ring=useRef<HTMLDivElement>(null),dot=useRef<HTMLDivElement>(null);
  const trail=useRef<HTMLDivElement[]>([]),hist=useRef<{x:number;y:number}[]>([]);
  const pos=useRef({cx:0,cy:0,mx:0,my:0}),raf=useRef(0);
  useEffect(()=>{
    const mv=(e:MouseEvent)=>{
      pos.current.mx=e.clientX;pos.current.my=e.clientY;
      hist.current.push({x:e.clientX,y:e.clientY});
      if(hist.current.length>18)hist.current.shift();
    };
    window.addEventListener("mousemove",mv);
    const tick=()=>{
      raf.current=requestAnimationFrame(tick);
      const p=pos.current;p.cx+=(p.mx-p.cx)*.10;p.cy+=(p.my-p.cy)*.10;
      if(ring.current){
        ring.current.style.left=p.cx+"px";ring.current.style.top=p.cy+"px";
        ring.current.style.width=hot?"60px":"18px";ring.current.style.height=hot?"60px":"18px";
        ring.current.style.borderColor=hot?col:"rgba(255,255,255,0.30)";
        ring.current.style.borderRadius=hot?"6px":"50%";
        ring.current.style.boxShadow=hot?`0 0 20px ${col}70`:"none";
      }
      if(dot.current){
        dot.current.style.left=p.mx+"px";dot.current.style.top=p.my+"px";
        dot.current.style.background=hot?col:"rgba(255,255,255,0.8)";
        dot.current.style.width=hot?"0":"3px";dot.current.style.height=hot?"0":"3px";
      }
      trail.current.forEach((el,i)=>{
        const h=hist.current[hist.current.length-1-Math.floor(i*2)];
        if(!h||!el)return;
        el.style.left=h.x+"px";el.style.top=h.y+"px";
        el.style.opacity=String((1-i/9)*(hot?.20:.09));
        el.style.background=hot?col:"rgba(255,255,255,0.5)";
        const sz=(3-i*.28)+"px";el.style.width=sz;el.style.height=sz;
      });
    };
    raf.current=requestAnimationFrame(tick);
    return()=>{window.removeEventListener("mousemove",mv);cancelAnimationFrame(raf.current);};
  },[hot,col]);
  return(<>
    <div ref={ring} style={{position:"fixed",zIndex:9990,pointerEvents:"none",transform:"translate(-50%,-50%)",width:18,height:18,borderRadius:"50%",border:"1px solid rgba(255,255,255,0.30)",transition:"width .30s cubic-bezier(.16,1,.3,1),height .30s,border-color .18s,border-radius .25s,box-shadow .18s"}}/>
    <div ref={dot}  style={{position:"fixed",zIndex:9991,pointerEvents:"none",transform:"translate(-50%,-50%)",width:3,height:3,borderRadius:"50%",background:"rgba(255,255,255,0.8)",transition:"background .15s,width .18s,height .18s"}}/>
    {Array.from({length:9},(_,i)=><div key={i} ref={el=>{if(el)trail.current[i]=el;}} style={{position:"fixed",zIndex:9989,pointerEvents:"none",transform:"translate(-50%,-50%)",width:3,height:3,borderRadius:"50%",background:"rgba(255,255,255,0.4)"}}/>)}
  </>);
}

// ─── 7 GENERATIVE VISUALISATIONS ──────────────────────────────────────────────
// Each fills its full canvas at maximum drama — no more small timid marks.
// The canvas is the stage. The visualisation owns the entire right panel.
type DrawFn=(ctx:CanvasRenderingContext2D,W:number,H:number,t:number,r:number,g:number,b:number)=>void;

const VIS:DrawFn[]=[

  // 01 BRAND IDENTITY — Architectural mark construction at scale
  (ctx,W,H,t,r,g,b)=>{
    ctx.fillStyle="rgba(0,0,0,0.055)";ctx.fillRect(0,0,W,H);
    const cx=W*.52,cy=H*.50;
    const S=Math.min(W,H)*.42;

    // Blueprint grid — fills entire canvas
    ctx.strokeStyle=`rgba(${r},${g},${b},0.045)`;ctx.lineWidth=.5;
    const gs=S*.22;
    for(let x=cx%gs-gs;x<W;x+=gs){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=cy%gs-gs;y<H;y+=gs){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

    // Four concentric construction arcs at large radii
    const arcs=[S*.35,S*.62,S*.88,S*1.15];
    const speeds=[.24,.16,.11,.07];
    arcs.forEach((rad,i)=>{
      const a0=t*speeds[i];
      const span=Math.PI*(.60+.20*Math.sin(t*.12+i));
      const alpha=.08+i*.045;
      ctx.strokeStyle=`rgba(${r},${g},${b},${alpha})`;ctx.lineWidth=.9;
      ctx.beginPath();ctx.arc(cx,cy,rad,a0,a0+span);ctx.stroke();
      // Leading tick — large and bright
      ctx.strokeStyle=`rgba(${r},${g},${b},0.55)`;ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(cx+Math.cos(a0+span)*rad,cy+Math.sin(a0+span)*rad);ctx.lineTo(cx+Math.cos(a0+span)*(rad+14),cy+Math.sin(a0+span)*(rad+14));ctx.stroke();
    });

    // Central mark — rotates, fills entire centre stage
    ctx.save();ctx.translate(cx,cy);ctx.rotate(t*.18);
    // Ghost outer ring
    const grd=ctx.createRadialGradient(0,0,S*.28,0,0,S*.34);
    grd.addColorStop(0,`rgba(${r},${g},${b},0.12)`);grd.addColorStop(1,`rgba(${r},${g},${b},0)`);
    ctx.fillStyle=grd;ctx.beginPath();ctx.arc(0,0,S*.34,0,Math.PI*2);ctx.fill();
    // Outer square
    ctx.strokeStyle=`rgba(${r},${g},${b},0.75)`;ctx.lineWidth=2;
    ctx.strokeRect(-S*.30,-S*.30,S*.60,S*.60);
    // Inner at 45deg
    ctx.rotate(Math.PI/4);ctx.strokeStyle=`rgba(${r},${g},${b},0.35)`;ctx.lineWidth=1.2;
    ctx.strokeRect(-S*.21,-S*.21,S*.42,S*.42);ctx.rotate(-Math.PI/4);
    // Cross hairs
    ctx.strokeStyle=`rgba(${r},${g},${b},0.22)`;ctx.lineWidth=.8;
    ctx.beginPath();ctx.moveTo(-S*.30,0);ctx.lineTo(S*.30,0);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,-S*.30);ctx.lineTo(0,S*.30);ctx.stroke();
    // Corner registration
    [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx,sy])=>{
      const mk=18;
      ctx.strokeStyle=`rgba(${r},${g},${b},0.50)`;ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(sx*S*.30,sy*S*.30);ctx.lineTo(sx*(S*.30+mk),sy*S*.30);ctx.stroke();
      ctx.beginPath();ctx.moveTo(sx*S*.30,sy*S*.30);ctx.lineTo(sx*S*.30,sy*(S*.30+mk));ctx.stroke();
    });
    // Centre dot — large glow
    ctx.shadowBlur=22;ctx.shadowColor=`rgba(${r},${g},${b},1)`;
    ctx.fillStyle=`rgba(${r},${g},${b},1)`;ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;ctx.restore();

    // Witness lines — full width
    ctx.strokeStyle=`rgba(${r},${g},${b},0.08)`;ctx.lineWidth=.5;ctx.setLineDash([3,8]);
    ctx.beginPath();ctx.moveTo(0,cy);ctx.lineTo(W,cy);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx,0);ctx.lineTo(cx,H);ctx.stroke();
    ctx.setLineDash([]);

    // Floating measurements
    ctx.fillStyle=`rgba(${r},${g},${b},0.22)`;ctx.font=`7px 'DM Mono',monospace`;
    ctx.fillText(`Ø${(S*.60).toFixed(0)}u`,cx+S*.32,cy-6);
    ctx.fillText(`${(S*.30).toFixed(0)}u`,cx+6,cy-S*.32);
  },

  // 02 PRODUCT ENGINEERING — System topology, data packets racing
  (ctx,W,H,t,r,g,b)=>{
    ctx.fillStyle="rgba(0,0,0,0.055)";ctx.fillRect(0,0,W,H);
    const layers=[
      {y:H*.16,nodes:[W*.22,W*.50,W*.78],           label:"CLIENT"},
      {y:H*.36,nodes:[W*.14,W*.38,W*.60,W*.84],     label:"API GATEWAY"},
      {y:H*.56,nodes:[W*.24,W*.50,W*.76],            label:"SERVICES"},
      {y:H*.76,nodes:[W*.18,W*.46,W*.74],            label:"DATA LAYER"},
    ];
    // Draw edges
    for(let li=0;li<layers.length-1;li++){
      const la=layers[li],lb=layers[li+1];
      la.nodes.forEach((nx,ni)=>{
        lb.nodes.slice(Math.max(0,ni-1),ni+2).forEach((tx,ti)=>{
          ctx.strokeStyle=`rgba(${r},${g},${b},0.09)`;ctx.lineWidth=1;
          ctx.beginPath();ctx.moveTo(nx,la.y);ctx.lineTo(tx,lb.y);ctx.stroke();
          // Racing packet
          const phase=((t*.55+ni*.33+li*.21+ti*.14)%1);
          const px=nx+(tx-nx)*phase,py=la.y+(lb.y-la.y)*phase;
          const alpha=Math.sin(phase*Math.PI)*.90;
          ctx.shadowBlur=10;ctx.shadowColor=`rgba(${r},${g},${b},0.8)`;
          ctx.fillStyle=`rgba(${r},${g},${b},${alpha})`;
          ctx.beginPath();ctx.arc(px,py,2.5,0,Math.PI*2);ctx.fill();
          ctx.shadowBlur=0;
        });
      });
    }
    // Draw nodes
    layers.forEach((layer,li)=>{
      layer.nodes.forEach((nx,ni)=>{
        const pulse=.5+.5*Math.sin(t*1.9+li*1.2+ni);
        ctx.strokeStyle=`rgba(${r},${g},${b},${.15+pulse*.30})`;ctx.lineWidth=1.2;
        ctx.beginPath();ctx.arc(nx,layer.y,9+pulse*5,0,Math.PI*2);ctx.stroke();
        ctx.shadowBlur=pulse*14;ctx.shadowColor=`rgba(${r},${g},${b},0.6)`;
        ctx.fillStyle=`rgba(${r},${g},${b},${.55+pulse*.40})`;
        ctx.beginPath();ctx.arc(nx,layer.y,5,0,Math.PI*2);ctx.fill();
        ctx.shadowBlur=0;
      });
      ctx.fillStyle=`rgba(${r},${g},${b},0.20)`;
      ctx.font=`6px 'DM Mono',monospace`;
      ctx.fillText(layer.label,18,layer.y+3);
      ctx.strokeStyle=`rgba(${r},${g},${b},0.05)`;ctx.lineWidth=.5;ctx.setLineDash([3,9]);
      ctx.beginPath();ctx.moveTo(90,layer.y);ctx.lineTo(W-18,layer.y);ctx.stroke();
      ctx.setLineDash([]);
    });
    // Active connection highlight — sweeps between selected layers
    const hi=Math.floor(t*.4)%3;
    const la2=layers[hi],lb2=layers[hi+1];
    la2.nodes.forEach(nx=>{lb2.nodes.forEach(tx=>{
      ctx.strokeStyle=`rgba(${r},${g},${b},0.22)`;ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(nx,la2.y);ctx.lineTo(tx,lb2.y);ctx.stroke();
    });});
  },

  // 03 AI SYSTEMS — Dense phyllotaxis particle field, golden-angle spiral
  (ctx,W,H,t,r,g,b)=>{
    ctx.fillStyle="rgba(0,0,0,0.065)";ctx.fillRect(0,0,W,H);
    const cx=W*.52,cy=H*.50;
    const PHI=2.399;
    const N=2600;
    const maxR=Math.min(W,H)*.48;
    for(let i=0;i<N;i++){
      const norm=i/N;
      const angle=i*PHI+t*.07*(i%3===0?1:i%3===1?-.6:.3);
      const baseR=Math.sqrt(norm)*maxR;
      const breathe=1+.14*Math.sin(t*.8-norm*Math.PI*2.5);
      const ripple=.09*Math.sin(baseR*.042-t*1.9);
      const finalR=baseR*breathe*(1+ripple);
      const px=cx+Math.cos(angle)*finalR;
      const py=cy+Math.sin(angle)*finalR*.88;
      const brightness=.14+.58*Math.abs(Math.sin(t*.5+norm*Math.PI*3));
      const sz=.5+1.4*(1-norm)*Math.abs(Math.sin(i*.4+t*.3));
      ctx.fillStyle=i%5===0?`rgba(255,255,255,${brightness*.38})`:`rgba(${r},${g},${b},${brightness})`;
      ctx.fillRect(px,py,sz,sz);
    }
    // Core
    const cR=Math.min(W,H)*.06,pf=1+.28*Math.sin(t*2.3);
    const cg2=ctx.createRadialGradient(cx,cy,0,cx,cy,cR*pf);
    cg2.addColorStop(0,"rgba(255,255,255,0.98)");cg2.addColorStop(.3,`rgba(${r},${g},${b},0.85)`);cg2.addColorStop(.75,`rgba(${r},${g},${b},0.18)`);cg2.addColorStop(1,`rgba(${r},${g},${b},0)`);
    ctx.fillStyle=cg2;ctx.beginPath();ctx.arc(cx,cy,cR*pf,0,Math.PI*2);ctx.fill();
    // Pulse rings from core
    for(let p=0;p<5;p++){
      const phase=((t*.45+p*.2)%1);
      const pR=phase*maxR*.70;
      ctx.strokeStyle=`rgba(${r},${g},${b},${(1-phase)*.15})`;ctx.lineWidth=1;
      ctx.beginPath();ctx.arc(cx,cy,pR,0,Math.PI*2);ctx.stroke();
    }
  },

  // 04 STRATEGIC CONSULTING — Full-screen precision radar, sweeping
  (ctx,W,H,t,r,g,b)=>{
    ctx.fillStyle="rgba(0,0,0,0.055)";ctx.fillRect(0,0,W,H);
    const cx=W*.52,cy=H*.52,maxR=Math.min(W,H)*.46;
    // Concentric range rings
    [.20,.40,.60,.80,1].forEach((f,i)=>{
      const rr=maxR*f;
      ctx.strokeStyle=`rgba(${r},${g},${b},${.05+i*.028})`;ctx.lineWidth=.8;
      ctx.beginPath();ctx.arc(cx,cy,rr,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle=`rgba(${r},${g},${b},0.14)`;ctx.font=`5px 'DM Mono',monospace`;
      if(i<4)ctx.fillText(`${(f*100).toFixed(0)}km`,cx+rr+3,cy-3);
    });
    // 12 bearing lines
    for(let i=0;i<12;i++){
      const a=(i/12)*Math.PI*2;
      ctx.strokeStyle=`rgba(${r},${g},${b},0.048)`;ctx.lineWidth=.5;
      ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*maxR,cy+Math.sin(a)*maxR);ctx.stroke();
    }
    // Sweep cone — 40 trailing lines
    const sweepA=(t*.62)%(Math.PI*2);
    const SWEEP=Math.PI*.48;
    for(let s=50;s>=0;s--){
      const a=sweepA-SWEEP*(s/50);
      ctx.strokeStyle=`rgba(${r},${g},${b},${(1-s/50)*.26})`;ctx.lineWidth=3;
      ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*maxR,cy+Math.sin(a)*maxR);ctx.stroke();
    }
    // Leading edge
    ctx.strokeStyle=`rgba(${r},${g},${b},0.95)`;ctx.lineWidth=2;
    ctx.shadowBlur=14;ctx.shadowColor=`rgba(${r},${g},${b},0.8)`;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(sweepA)*maxR,cy+Math.sin(sweepA)*maxR);ctx.stroke();
    ctx.shadowBlur=0;
    // Blips
    [{a:.65,rf:.52,lbl:"MKT A"},{a:1.95,rf:.72,lbl:"MKT B"},{a:2.80,rf:.39,lbl:"OPP"},{a:4.20,rf:.78,lbl:"MKT C"},{a:5.10,rf:.60,lbl:"RISK"},{a:3.50,rf:.46,lbl:"TARGET"}].forEach(bl=>{
      const diff=((sweepA-bl.a)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
      const age=diff/(Math.PI*2);
      const alpha=Math.max(0,1-age*2.8);
      if(alpha<.005)return;
      const bx=cx+Math.cos(bl.a)*maxR*bl.rf,by=cy+Math.sin(bl.a)*maxR*bl.rf;
      ctx.shadowBlur=16*alpha;ctx.shadowColor=`rgba(${r},${g},${b},${alpha})`;
      ctx.fillStyle=`rgba(${r},${g},${b},${alpha})`;
      ctx.beginPath();ctx.arc(bx,by,4+alpha*4,0,Math.PI*2);ctx.fill();
      ctx.shadowBlur=0;
      ctx.strokeStyle=`rgba(${r},${g},${b},${alpha*.38})`;ctx.lineWidth=1;
      ctx.beginPath();ctx.arc(bx,by,9+age*36,0,Math.PI*2);ctx.stroke();
      if(alpha>.28){ctx.fillStyle=`rgba(${r},${g},${b},${alpha*.65})`;ctx.font=`6px 'DM Mono',monospace`;ctx.fillText(bl.lbl,bx+10,by-5);}
    });
    // Crosshair
    ctx.strokeStyle=`rgba(${r},${g},${b},0.55)`;ctx.lineWidth=1;
    const ch=10;
    ctx.beginPath();ctx.moveTo(cx-ch,cy);ctx.lineTo(cx+ch,cy);ctx.stroke();
    ctx.beginPath();ctx.moveTo(cx,cy-ch);ctx.lineTo(cx,cy+ch);ctx.stroke();
    ctx.shadowBlur=8;ctx.shadowColor=`rgba(${r},${g},${b},0.9)`;
    ctx.fillStyle=`rgba(${r},${g},${b},1)`;ctx.beginPath();ctx.arc(cx,cy,3.5,0,Math.PI*2);ctx.fill();
    ctx.shadowBlur=0;
  },

  // 05 DIGITAL EXPERIENCE — Wireframe assembling itself, full-screen
  (ctx,W,H,t,r,g,b)=>{
    ctx.fillStyle="rgba(0,0,0,0.065)";ctx.fillRect(0,0,W,H);
    const p=24,fw=W-p*2,fh=H-p*2,ox=p,oy=p;
    // Outer frame draws itself
    const total=2*(fw+fh);
    const drawn=Math.min(total,(t*.14%(total+2))*total);
    ctx.strokeStyle=`rgba(${r},${g},${b},0.42)`;ctx.lineWidth=1.2;
    ctx.beginPath();let rem=drawn;ctx.moveTo(ox,oy);
    if(rem>0){const d=Math.min(rem,fw);ctx.lineTo(ox+d,oy);rem-=d;}
    if(rem>0){const d=Math.min(rem,fh);ctx.lineTo(ox+fw,oy+d);rem-=d;}
    if(rem>0){const d=Math.min(rem,fw);ctx.lineTo(ox+fw-d,oy+fh);rem-=d;}
    if(rem>0){const d=Math.min(rem,fh);ctx.lineTo(ox,oy+fh-d);rem-=d;}
    ctx.stroke();
    // Corner pins
    [[ox,oy],[ox+fw,oy],[ox+fw,oy+fh],[ox,oy+fh]].forEach(([px,py])=>{ctx.fillStyle=`rgba(${r},${g},${b},0.60)`;ctx.fillRect(px-2.5,py-2.5,5,5);});
    // NAV
    const navH=fh*.07;
    ctx.strokeStyle=`rgba(${r},${g},${b},0.20)`;ctx.lineWidth=.8;ctx.strokeRect(ox,oy,fw,navH);
    ctx.fillStyle=`rgba(${r},${g},${b},0.32)`;ctx.fillRect(ox+14,oy+navH*.28,fw*.09,navH*.44);
    [.38,.50,.62,.74].forEach(xf=>{const lw=fw*.075+Math.sin(t*.4+xf*10)*fw*.012;ctx.fillStyle=`rgba(${r},${g},${b},0.18)`;ctx.fillRect(ox+fw*xf,oy+navH*.32,lw,navH*.36);});
    ctx.strokeStyle=`rgba(${r},${g},${b},0.45)`;ctx.lineWidth=.9;ctx.strokeRect(ox+fw*.83,oy+navH*.22,fw*.12,navH*.55);
    // HERO
    const heroY=oy+navH+4,heroH=fh*.30;
    ctx.strokeStyle=`rgba(${r},${g},${b},0.10)`;ctx.lineWidth=.6;ctx.strokeRect(ox,heroY,fw,heroH);
    const hlP=Math.min(1,Math.max(0,Math.sin(t*.12)*.5+.8));
    [[.62,.18,.11],[.46,.35,.075],[.30,.50,.058]].forEach(([wf,yf,hf],i)=>{
      const p2=Math.max(0,hlP-i*.12);
      ctx.fillStyle=`rgba(${r},${g},${b},${(.36+i*.08)*p2})`;
      ctx.fillRect(ox+fw*.06,heroY+heroH*yf,fw*wf*p2,heroH*hf);
    });
    ctx.strokeStyle=`rgba(${r},${g},${b},0.32)`;ctx.lineWidth=.8;ctx.strokeRect(ox+fw*.06,heroY+heroH*.70,fw*.16,heroH*.12);
    if(Math.floor(t*2)%2===0){ctx.fillStyle=`rgba(${r},${g},${b},0.80)`;ctx.fillRect(ox+fw*.68,heroY+heroH*.18,1.5,heroH*.10);}
    // CARDS
    const cardY=heroY+heroH+4,cardH=fh*.35,cw=(fw-8)/3;
    [0,1,2].forEach(ci=>{
      const cx2=ox+ci*(cw+4);
      ctx.strokeStyle=`rgba(${r},${g},${b},0.10)`;ctx.lineWidth=.6;ctx.strokeRect(cx2,cardY,cw,cardH);
      ctx.fillStyle=`rgba(${r},${g},${b},0.065)`;ctx.fillRect(cx2+4,cardY+4,cw-8,cardH*.42);
      for(let li=0;li<3;li++){const lw=(.76-li*.18)*cw;ctx.fillStyle=`rgba(${r},${g},${b},${.17-li*.03})`;ctx.fillRect(cx2+6,cardY+cardH*.52+li*14,lw,5);}
    });
  },

  // 06 CONTENT & EDITORIAL — Scrolling word columns, full-screen type cascade
  (ctx,W,H,t,r,g,b)=>{
    ctx.fillStyle="rgba(0,0,0,0.048)";ctx.fillRect(0,0,W,H);
    const WORDS=["NARRATIVE","SIGNAL","STRATEGY","AUDIENCE","RHYTHM","PROOF","AUTHORITY","CONTENT","EDITORIAL","BRIEF","PUBLISH","DISTRIBUTE","OWN","TRUST","REACH","MEASURE","VOICE","PLATFORM","SYSTEM","COMPOUND","CRAFT"];
    const SIZES=[9,11,15,9,20,9,11,24,9,13];
    const lineH=28,cols=3,colW=W/cols;
    for(let col=0;col<cols;col++){
      const colX=col*colW+18;
      const speed=1.0+col*.18;
      const scrollPx=(t*speed*13)%(lineH*WORDS.length);
      const linesVis=Math.ceil(H/lineH)+2;
      const startLine=Math.floor(scrollPx/lineH);
      for(let li=0;li<linesVis;li++){
        const gl=startLine+li+(col*7);
        const wIdx=((gl*3+col*13)%WORDS.length+WORDS.length)%WORDS.length;
        const sIdx=((gl*7+col*5)%SIZES.length+SIZES.length)%SIZES.length;
        const y=li*lineH-(scrollPx%lineH);
        const edgeDist=Math.min(y/70,(H-y)/70);
        const edgeFade=Math.max(0,Math.min(1,edgeDist));
        const pulse=.5+.5*Math.sin(t*.4+gl*.5+col*1.1);
        const isHero=(gl%(7+col*2)===0);
        const alpha=(isHero?.18+pulse*.55:.06+pulse*.22)*edgeFade*(col===0?1:col===1?.70:.45);
        const finalSz=isHero?SIZES[sIdx]*1.4:SIZES[sIdx];
        ctx.fillStyle=`rgba(${r},${g},${b},${Math.min(.92,alpha)})`;
        ctx.font=`${isHero?600:300} ${finalSz}px 'DM Mono',monospace`;
        ctx.fillText(WORDS[wIdx],colX,y+lineH);
        if(gl%5===0&&!isHero){ctx.strokeStyle=`rgba(${r},${g},${b},${.055*edgeFade})`;ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(colX,y+lineH+5);ctx.lineTo(colX+colW-22,y+lineH+5);ctx.stroke();}
      }
      if(col<cols-1){ctx.strokeStyle=`rgba(${r},${g},${b},0.06)`;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo((col+1)*colW,0);ctx.lineTo((col+1)*colW,H);ctx.stroke();}
    }
    // Live write cursor
    const curY=((t*13)%H);
    if(Math.floor(t*2.5)%2===0){ctx.shadowBlur=8;ctx.shadowColor=`rgba(${r},${g},${b},0.8)`;ctx.fillStyle=`rgba(${r},${g},${b},0.85)`;ctx.fillRect(20,curY,2,14);ctx.shadowBlur=0;}
  },

  // 07 INNOVATION LABS — Wave interference field, full-screen, iridescent
  (ctx,W,H,t,r,g,b)=>{
    ctx.fillStyle="rgba(0,0,0,0.062)";ctx.fillRect(0,0,W,H);
    const orbitR=Math.min(W,H)*.14,orbitT=t*.12;
    const s1x=W*.5+Math.cos(orbitT)*orbitR,s1y=H*.5+Math.sin(orbitT)*orbitR*.5;
    const s2x=W*.5+Math.cos(orbitT+Math.PI)*orbitR,s2y=H*.5+Math.sin(orbitT+Math.PI)*orbitR*.5;
    const freq=.038,spd=1.6,step=5;
    for(let y=0;y<H;y+=step){
      for(let x=0;x<W;x+=step){
        const d1=Math.sqrt((x-s1x)**2+(y-s1y)**2);
        const d2=Math.sqrt((x-s2x)**2+(y-s2y)**2);
        const v=(Math.sin(d1*freq-t*spd)+Math.sin(d2*freq-t*spd))*.5;
        if(Math.abs(v)<.18)continue;
        const pd=(d1-d2)*.01+t*.3;
        const ri=Math.max(0,Math.min(255,r+Math.sin(pd)*50|0));
        const gi=Math.max(0,Math.min(255,g+Math.sin(pd+2.09)*40|0));
        const bi2=Math.max(0,Math.min(255,b+Math.sin(pd+4.19)*50|0));
        ctx.fillStyle=`rgba(${ri},${gi},${bi2},${Math.abs(v)*.58})`;
        ctx.fillRect(x,y,step,step);
      }
    }
    // Sources
    [[s1x,s1y],[s2x,s2y]].forEach(([sx,sy],si)=>{
      for(let ri2=0;ri2<5;ri2++){
        const phase=((t*spd*.45+si*.5+ri2*.2)%1);
        ctx.strokeStyle=`rgba(${r},${g},${b},${(1-phase)*.24})`;ctx.lineWidth=.9;
        ctx.beginPath();ctx.arc(sx,sy,phase*Math.min(W,H)*.38,0,Math.PI*2);ctx.stroke();
      }
      ctx.shadowBlur=20;ctx.shadowColor=`rgba(${r},${g},${b},0.9)`;
      ctx.fillStyle="rgba(255,255,255,0.98)";ctx.beginPath();ctx.arc(sx,sy,5,0,Math.PI*2);ctx.fill();
      ctx.shadowBlur=0;
      ctx.fillStyle=`rgba(${r},${g},${b},0.38)`;ctx.font=`6px 'DM Mono',monospace`;ctx.fillText(`SRC.0${si+1}`,sx+8,sy-7);
    });
  },
];

// ─── CANVAS COMPONENT ─────────────────────────────────────────────────────────
function VisCanvas({idx,col,active}:{idx:number;col:string;active:boolean}){
  const ref=useRef<HTMLCanvasElement>(null);
  const raf=useRef(0);
  const t0=useRef(performance.now());
  const [r,g,b]=rgb(col);
  useEffect(()=>{
    const c=ref.current;if(!c)return;
    const ctx=c.getContext("2d",{alpha:false})!;
    t0.current=performance.now();
    const draw=()=>{
      raf.current=requestAnimationFrame(draw);
      const W=c.width=c.offsetWidth,H=c.height=c.offsetHeight;
      if(!W||!H)return;
      const t=(performance.now()-t0.current)/1000;
      if(!active){ctx.fillStyle="#000";ctx.fillRect(0,0,W,H);return;}
      VIS[idx]?.(ctx,W,H,t,r,g,b);
    };
    raf.current=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(raf.current);
  },[idx,active,col]);
  return <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}/>;
}

// ─── FLASH — fires on every service switch ────────────────────────────────────
function Flash({trig,col}:{trig:number;col:string}){
  const ref=useRef<HTMLDivElement>(null);
  const prev=useRef(trig);
  useEffect(()=>{
    if(trig===prev.current||!ref.current)return;
    prev.current=trig;
    const el=ref.current;
    const [r,g,b]=rgb(col);
    el.style.background=`rgba(${r},${g},${b},0.18)`;
    el.style.opacity="1";
    const to=setTimeout(()=>{el.style.opacity="0";},80);
    return()=>clearTimeout(to);
  },[trig,col]);
  return <div ref={ref} style={{position:"absolute",inset:0,zIndex:50,pointerEvents:"none",opacity:0,transition:"opacity 0.4s ease"}}/>;
}

// ─── AUDIO ────────────────────────────────────────────────────────────────────
function useServicesAudio(){
  useEffect(()=>{
    const track=new Audio("/audio/services.mp3");
    track.loop=true;track.volume=0;
    track.play().catch(()=>{const r=()=>{track.play().catch(()=>{});window.removeEventListener("click",r);};window.addEventListener("click",r,{once:true});});
    let v=0;const fi=setInterval(()=>{v=Math.min(v+.55/80,.55);track.volume=v;if(v>=.55)clearInterval(fi);},40);
    (window as any).__servicesTrack=track;
    return()=>{let ov=track.volume;const fo=setInterval(()=>{ov=Math.max(0,ov-.55/40);track.volume=ov;if(ov<=0){track.pause();clearInterval(fo);}},40);(window as any).__servicesTrack=null;};
  },[]);
}

const SND=(()=>{let C:AudioContext|null=null;const AC=()=>C||(C=new((window as any).AudioContext||(window as any).webkitAudioContext)());
return{
  sel(){try{const c=AC(),o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.setValueAtTime(660,c.currentTime);o.frequency.exponentialRampToValueAtTime(220,c.currentTime+.08);g.gain.setValueAtTime(.07,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.12);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.14);}catch{}},
  hov(){try{const c=AC(),o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.value=1100;g.gain.setValueAtTime(.018,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.05);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.06);}catch{}},
};})();

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function ServicesPage(){
  const [active,setActive]=useState(0);
  const [trig,setTrig]=useState(0);
  const [hot,setHot]=useState(false);
  useServicesAudio();

  useEffect(()=>{
    document.body.style.overflow="hidden";document.body.style.height="100vh";document.body.style.background="#000";
    return()=>{document.body.style.overflow="";document.body.style.height="";document.body.style.background="";};
  },[]);

  const sel=useCallback((i:number)=>{
    if(i===active)return;
    SND.sel();setActive(i);setTrig(t=>t+1);
  },[active]);

  const svc=S[active];
  const [r,g,b]=rgb(svc.col);
  const c=`${r},${g},${b}`;

  const decTag =useDecrypt(svc.tag,  trig,1.6, 0);
  const decName=useDecrypt(svc.title,trig,1.1,40);
  const decDesc=useDecrypt(svc.desc, trig,0.5,110);

  return(
    <div style={{position:"fixed",inset:0,background:"#000",
      display:"grid",gridTemplateColumns:"36% 64%",
      overflow:"hidden",fontFamily:"'DM Mono','Courier New',monospace"}}>

      <Cursor col={svc.col} hot={hot}/>

      {/* ══ LEFT — TERMINAL ══ */}
      <div style={{display:"flex",flexDirection:"column",
        borderRight:`1px solid rgba(${c},0.12)`,
        overflow:"hidden",position:"relative",
        transition:"border-color .5s"}}>

        {/* Subtle left bg tint matching active service */}
        <div style={{position:"absolute",inset:0,pointerEvents:"none",
          background:`radial-gradient(ellipse at 0% 50%,rgba(${c},0.04) 0%,transparent 70%)`,
          transition:"background .6s"}}/>

        {/* Header */}
        <div style={{padding:"68px 44px 22px",borderBottom:"1px solid rgba(255,255,255,0.04)",flexShrink:0,position:"relative"}}>
          <div style={{fontSize:6,letterSpacing:".44em",color:"rgba(255,255,255,0.15)",textTransform:"uppercase",marginBottom:8}}>
            DOMANI.STUDIO
          </div>
          <div style={{fontSize:6,letterSpacing:".28em",color:`rgba(${c},0.45)`,textTransform:"uppercase",transition:"color .4s"}}>
            SYSTEM.EXECUTE(SERVICES)
          </div>
          {/* Blink indicator */}
          <div style={{position:"absolute",top:72,right:44,display:"flex",alignItems:"center",gap:7}}>
            <div style={{width:4,height:4,borderRadius:"50%",background:svc.col,boxShadow:`0 0 7px ${svc.col}`,animation:"blnk 1.3s ease-in-out infinite",transition:"background .3s"}}/>
            <span style={{fontSize:5,letterSpacing:".22em",color:`rgba(${c},0.45)`,textTransform:"uppercase",transition:"color .3s"}}>LIVE</span>
          </div>
        </div>

        {/* Service list */}
        <div style={{flex:1,overflowY:"auto",padding:"4px 0"}}>
          {S.map((s,i)=>{
            const isA=active===i;
            const [sr,sg,sb]=rgb(s.col);
            const sc=`${sr},${sg},${sb}`;
            return(
              <div key={s.n}
                onMouseEnter={()=>{setHot(true);SND.hov();}}
                onMouseLeave={()=>setHot(false)}
                onClick={()=>sel(i)}
                style={{
                  display:"flex",alignItems:"center",gap:16,
                  padding:`${isA?19:15}px 44px`,
                  cursor:"none",position:"relative",
                  borderBottom:"1px solid rgba(255,255,255,0.035)",
                  background:isA?`rgba(${sc},0.07)`:"transparent",
                  transition:"background .22s,padding .22s",
                }}>

                {/* Active bar */}
                <div style={{position:"absolute",left:0,top:0,bottom:0,
                  width:isA?3:0,background:s.col,
                  boxShadow:isA?`0 0 18px ${s.col}70`:"none",
                  transition:"width .20s,box-shadow .20s"}}/>

                {/* Hover ambient sweep */}
                {isA&&<div style={{position:"absolute",inset:0,pointerEvents:"none",
                  background:`linear-gradient(90deg,rgba(${sc},0.07),transparent)`,
                  animation:"swp 2.4s ease-in-out infinite"}}/>}

                {/* Number */}
                <span style={{fontSize:8,letterSpacing:".12em",flexShrink:0,
                  color:isA?`rgba(${sc},0.60)`:"rgba(255,255,255,0.14)",
                  transition:"color .2s",fontVariantNumeric:"tabular-nums"}}>[{s.n}]</span>

                {/* Title */}
                <span style={{
                  fontFamily:"'Barlow Condensed','DM Mono',monospace",
                  fontWeight:isA?700:400,
                  fontSize:"clamp(13px,1.55vw,20px)",
                  letterSpacing:".04em",textTransform:"uppercase",
                  color:isA?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.25)",
                  transition:"color .2s,font-weight .15s",
                  flex:1,
                }}>{s.title}</span>

                {/* Right: arrow shows when active */}
                <div style={{
                  width:isA?24:0,height:1,flexShrink:0,
                  background:s.col,boxShadow:isA?`0 0 8px ${s.col}`:"none",
                  transition:"width .35s cubic-bezier(.16,1,.3,1),box-shadow .2s",
                }}/>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{padding:"12px 44px",flexShrink:0,borderTop:"1px solid rgba(255,255,255,0.04)",
          display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:5,letterSpacing:".22em",color:"rgba(255,255,255,0.10)"}}>
            {String(active+1).padStart(2,"0")} / {String(S.length).padStart(2,"0")}
          </span>
          <span style={{fontSize:5,letterSpacing:".16em",color:"rgba(255,255,255,0.08)"}}>
            DOMANI — {new Date().getFullYear()}
          </span>
        </div>
      </div>

      {/* ══ RIGHT — FULL-BLEED CANVAS + FLOATING HUD ══ */}
      <div style={{position:"relative",overflow:"hidden",background:"#000"}}>

        {/* Canvas layers — all present, only active renders */}
        {S.map((s,i)=>(
          <div key={i} style={{
            position:"absolute",inset:0,
            opacity:active===i?1:0,
            transition:"opacity 0.40s ease",
            zIndex:1,
          }}>
            <VisCanvas idx={i} col={s.col} active={active===i}/>
          </div>
        ))}

        {/* Flash on switch */}
        <Flash trig={trig} col={svc.col}/>

        {/* Vignette */}
        <div style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",
          background:"radial-gradient(ellipse at 50% 50%,transparent 35%,rgba(0,0,0,0.42) 100%)"}}/>

        {/* Scanlines */}
        <div style={{position:"absolute",inset:0,zIndex:3,pointerEvents:"none",
          backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.018) 3px,rgba(0,0,0,0.018) 4px)"}}/>

        {/* ── HUD OVERLAY — readout floats over canvas ── */}
        <div style={{
          position:"absolute",inset:0,zIndex:10,
          display:"flex",flexDirection:"column",justifyContent:"flex-end",
          padding:"60px 48px 36px",
          // Gradient only at bottom — canvas visible at top
          background:"linear-gradient(to top,rgba(0,0,0,0.82) 0%,rgba(0,0,0,0.35) 38%,rgba(0,0,0,0.0) 62%)",
        }}>

          {/* Top-left: system tag */}
          <div style={{position:"absolute",top:58,left:48,zIndex:15}}>
            <div style={{fontSize:6,letterSpacing:".34em",color:`rgba(${c},0.52)`,
              textTransform:"uppercase",transition:"color .4s",minHeight:"1em"}}>
              {decTag||"//"}
            </div>
          </div>

          {/* Top-right: connection status + index number */}
          <div style={{position:"absolute",top:52,right:40,textAlign:"right",zIndex:15}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:100,
              fontSize:"clamp(52px,7vw,88px)",lineHeight:1,letterSpacing:"-.03em",
              color:`rgba(${c},0.14)`,transition:"color .4s",userSelect:"none"}}>
              {svc.n}
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6,marginTop:4}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:svc.col,
                boxShadow:`0 0 8px ${svc.col}`,animation:"blnk 1.2s ease-in-out infinite",
                transition:"background .3s"}}/>
              <span style={{fontSize:5,letterSpacing:".26em",
                color:`rgba(${c},0.52)`,textTransform:"uppercase",
                transition:"color .3s"}}>Secure Connection</span>
            </div>
          </div>

          {/* Bottom: title + desc + chips */}
          <div>
            {/* Giant service name */}
            <div style={{
              fontFamily:"'Barlow Condensed',sans-serif",
              fontWeight:900,
              fontSize:"clamp(48px,6vw,82px)",
              lineHeight:.86,
              letterSpacing:"-0.025em",
              textTransform:"uppercase",
              color:"rgba(255,255,255,0.97)",
              textShadow:`0 0 55px rgba(${c},0.42),0 2px 35px rgba(0,0,0,0.9)`,
              marginBottom:16,
              transition:"text-shadow .4s",
              minHeight:".86em",
            }}>
              {decName||svc.title}
            </div>

            {/* Accent line under title */}
            <div style={{
              width:"100%",height:1,
              background:`linear-gradient(90deg,rgba(${c},0.65),rgba(${c},0.0))`,
              marginBottom:16,
              transition:"background .4s",
            }}/>

            {/* Description */}
            <div style={{
              fontSize:"clamp(10px,1.1vw,13px)",
              lineHeight:1.88,
              color:"rgba(255,255,255,0.48)",
              maxWidth:460,
              marginBottom:20,
              minHeight:"3.5em",
              textShadow:"0 1px 8px rgba(0,0,0,0.9)",
            }}>
              {decDesc}
            </div>

            {/* Deliverable chips */}
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {svc.del.map((d,i)=>(
                <span key={`${active}-${d}`} style={{
                  fontSize:6,letterSpacing:".14em",textTransform:"uppercase",
                  color:`rgba(${c},0.72)`,
                  border:`1px solid rgba(${c},0.22)`,
                  padding:"4px 11px",
                  background:"rgba(0,0,0,0.55)",
                  backdropFilter:"blur(4px)",
                  opacity:0,
                  animation:`fin .35s ease ${55+i*60}ms forwards`,
                  transition:"border-color .4s,color .4s",
                }}>{d}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom-right: system tag label */}
        <div style={{position:"absolute",bottom:16,right:20,zIndex:11,pointerEvents:"none",
          fontSize:5,letterSpacing:".28em",color:`rgba(${c},0.20)`,
          textTransform:"uppercase",fontFamily:"'DM Mono',monospace",
          transition:"color .4s"}}>
          {svc.tag} — LIVE
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@100;700;900&display=swap');
        @keyframes swp  { 0%{transform:translateX(-100%)} 100%{transform:translateX(280%)} }
        @keyframes blnk { 0%,100%{opacity:1} 50%{opacity:.10} }
        @keyframes fin  { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:none} }
        * { cursor:none!important }
        body { overflow:hidden!important }
      `}</style>
    </div>
  );
}