"use client";
/**
 * DOMANI / WORK — V3: THE DARK ROOM  (rebuilt)
 *
 * What changed vs previous:
 * • VIDEO: each print has a <video> element hidden beneath the image.
 * On hover: video plays, cross-fades in over the still poster.
 * At rest: the poster image (= cover.jpg) sits frozen — no movement.
 * On leave: video pauses and opacity-fades back to still.
 * • Prints have more physical depth — 3D perspective on hover with rotateY
 * • Overlapping is stronger — z-index strategy means some prints naturally
 * sit on top of others, making the table feel real
 * • Hover also reveals a tight info strip with services tags
 * • Developing animation: image filter transitions from amber-tinted dark →
 * full colour as if physically processing in developer solution
 * • Expansion overlay uses the video src if available
 * • More darkroom atmosphere — vignette, grain, chemical texture
 * • Ticker now shows project currently being hovered, not just services
 * • PHYSICS: Cards now float gently at rest, bounce off the edges of the 
 * screen, and collide/interact with each other using a custom 2D engine.
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useTransition } from "@/lib/transitions/TransitionContext";
import { PROJECTS }      from "@/lib/data/projects";

function rgb(h: string) {
  const c=h.replace("#","");
  const r=parseInt(c.slice(0,2),16)||184,g=parseInt(c.slice(2,4),16)||240,b=parseInt(c.slice(4,6),16)||255;
  return `${r},${g},${b}`;
}

const SND=(() => {
  let C:AudioContext|null=null;
  const AC=()=>C||(C=new((window as any).AudioContext||(window as any).webkitAudioContext)());
  return {
    develop(){
      try{const c=AC(),len=~~(c.sampleRate*.08),buf=c.createBuffer(1,len,c.sampleRate),d=buf.getChannelData(0);
        for(let i=0;i<len;i++){const t=i/c.sampleRate;d[i]=(Math.random()*2-1)*Math.exp(-t*10)*.07;}
        const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
        f.type="lowpass";f.frequency.value=400;g.gain.value=.7;
        s.buffer=buf;s.connect(f);f.connect(g);g.connect(c.destination);s.start();}catch{}
    },
    lift(){
      try{const c=AC(),o=c.createOscillator(),g=c.createGain();
        o.type="sine";o.frequency.setValueAtTime(260,c.currentTime);
        o.frequency.exponentialRampToValueAtTime(80,c.currentTime+.12);
        g.gain.setValueAtTime(.10,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.15);
        o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.17);}catch{}
    },
    explode(){
      try{const c=AC(),len=~~(c.sampleRate*.22),buf=c.createBuffer(1,len,c.sampleRate),d=buf.getChannelData(0);
        for(let i=0;i<len;i++){const t=i/c.sampleRate;d[i]=(Math.random()*2-1)*Math.exp(-t*5)*.20;}
        const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();
        f.type="lowpass";f.frequency.value=700;g.gain.value=.65;
        s.buffer=buf;s.connect(f);f.connect(g);g.connect(c.destination);s.start();}catch{}
    },
  };
})();

// Tighter, more overlapping layout — feels like a real table of prints
const LAYOUT=[
  {lx: 1, ly: 4,  rot:-3.5, w:29, z:4},
  {lx:28, ly: 1,  rot: 2.0, w:27, z:6},
  {lx:57, ly: 2,  rot:-1.8, w:28, z:3},
  {lx:70, ly:19,  rot: 3.8, w:26, z:7},
  {lx:53, ly:33,  rot:-2.5, w:28, z:5},
  {lx:26, ly:35,  rot: 2.3, w:29, z:8},
  {lx: 1, ly:36,  rot:-4.2, w:27, z:2},
  {lx: 6, ly:63,  rot: 1.6, w:29, z:6},
  {lx:32, ly:60,  rot:-2.1, w:28, z:4},
  {lx:61, ly:58,  rot: 3.2, w:27, z:5},
];

export default function WorkV3Page() {
  const { navigate } = useTransition();
  const navigateRef  = useRef(navigate);
  useEffect(()=>{ navigateRef.current=navigate; },[navigate]);

  const tickerRef    = useRef<HTMLDivElement>(null);
  const tickerTL     = useRef<gsap.core.Timeline|null>(null);
  const ringRef      = useRef<HTMLDivElement>(null);
  const dotRef       = useRef<HTMLDivElement>(null);
  const expandRef    = useRef<HTMLDivElement>(null);
  const expandImgRef = useRef<HTMLImageElement>(null);
  const expandVidRef = useRef<HTMLVideoElement>(null);
  const tickerLabelRef = useRef<HTMLDivElement>(null);

  // Per-print refs
  const printRefs  = useRef<HTMLDivElement[]>([]);
  const imgRefs    = useRef<HTMLImageElement[]>([]);
  const vidRefs    = useRef<HTMLVideoElement[]>([]);
  const titleRefs  = useRef<HTMLDivElement[]>([]);
  const infoRefs   = useRef<HTMLDivElement[]>([]);
  const tagRefs    = useRef<HTMLDivElement[]>([]);
  const tintRefs   = useRef<HTMLDivElement[]>([]);
  const accentBars = useRef<HTMLDivElement[]>([]);

  // ── PHYSICS STATE ────────────────────────────────────────────────────────
  const physicsState = useRef(LAYOUT.map(l => ({
    x: l.lx,
    y: l.ly,
    vx: (Math.random() - 0.5) * 0.1, // Initial X velocity
    vy: (Math.random() - 0.5) * 0.1, // Initial Y velocity
    w: l.w,
    isHovered: false
  })));

  // ── VIDEO CONTROL ─────────────────────────────────────────────────────────
  function startVideo(i: number) {
    const vid=vidRefs.current[i]; if(!vid||!PROJECTS[i].video)return;
    vid.src=PROJECTS[i].video!;
    vid.load();
    vid.play().catch(()=>{});
    gsap.to(vid,{opacity:1,duration:.4,ease:"power2.out"});
  }
  function stopVideo(i: number) {
    const vid=vidRefs.current[i]; if(!vid)return;
    gsap.to(vid,{opacity:0,duration:.3,ease:"power2.in",onComplete(){
      vid.pause(); vid.src=""; // release memory
    }});
  }

  // ── HOVER ON ─────────────────────────────────────────────────────────────
  function onEnter(i: number) {
    const el=printRefs.current[i]; if(!el)return;
    const p=PROJECTS[i];
    const c=rgb(p.color);

    // Freeze physics drift for this card
    physicsState.current[i].isHovered = true;

    SND.develop(); SND.lift();

    // Physical lift with perspective tilt
    gsap.to(el,{
      rotation:0, scale:1.05, y:-14, zIndex:100,
      rotationY:2, rotationX:-1,
      duration:.45, ease:"back.out(1.2)",
    });

    // Image develops — amber tint fades, colour saturates
    const img=imgRefs.current[i];
    if(img) gsap.to(img,{filter:"brightness(0.52) saturate(1.0) contrast(1.04)",duration:.55,ease:"power2.out"});

    // Amber tint overlay fades out
    const tint=tintRefs.current[i];
    if(tint) gsap.to(tint,{opacity:0,duration:.5});

    // White border lights up
    el.style.outlineColor="rgba(255,255,255,0.88)";
    el.style.boxShadow=`0 28px 70px rgba(0,0,0,0.92), 0 0 0 1px rgba(${c},0.30), 0 0 50px rgba(${c},0.12)`;

    // Title rises from bottom
    const title=titleRefs.current[i];
    if(title) gsap.fromTo(title,{y:16,opacity:0},{y:0,opacity:1,duration:.32,ease:"power2.out",delay:.06});

    // Info strip (client, year) slides in
    const info=infoRefs.current[i];
    if(info) gsap.fromTo(info,{y:10,opacity:0},{y:0,opacity:1,duration:.28,ease:"power2.out",delay:.14});

    // Service tags appear
    const tags=tagRefs.current[i];
    if(tags) gsap.fromTo(tags,{opacity:0},{opacity:1,duration:.25,delay:.20});

    // Accent bar races across bottom
    const bar=accentBars.current[i];
    if(bar){gsap.set(bar,{scaleX:0,transformOrigin:"left center"});gsap.to(bar,{scaleX:1,duration:.4,ease:"expo.out",delay:.05});}

    // Play video if available
    if(p.video) startVideo(i);

    // Update ticker label
    if(tickerLabelRef.current) tickerLabelRef.current.textContent=p.title.toUpperCase();
  }

  // ── HOVER OFF ────────────────────────────────────────────────────────────
  function onLeave(i: number) {
    const el=printRefs.current[i]; if(!el)return;
    const lay=LAYOUT[i];

    // Resume physics drift for this card
    physicsState.current[i].isHovered = false;

    gsap.to(el,{
      rotation:lay.rot, scale:1.0, y:0, zIndex:lay.z,
      rotationY:0, rotationX:0,
      duration:.5, ease:"power2.inOut",
    });

    const img=imgRefs.current[i];
    if(img) gsap.to(img,{filter:"brightness(0.22) saturate(0.12) contrast(1.0)",duration:.55,ease:"power2.inOut"});

    const tint=tintRefs.current[i];
    if(tint) gsap.to(tint,{opacity:1,duration:.5});

    el.style.outlineColor="rgba(255,255,255,0.07)";
    el.style.boxShadow="0 6px 24px rgba(0,0,0,0.75)";

    const title=titleRefs.current[i];
    if(title) gsap.to(title,{y:8,opacity:0,duration:.2,ease:"power2.in"});
    const info=infoRefs.current[i];
    if(info) gsap.to(info,{opacity:0,duration:.18,ease:"power2.in"});
    const tags=tagRefs.current[i];
    if(tags) gsap.to(tags,{opacity:0,duration:.15});
    const bar=accentBars.current[i];
    if(bar) gsap.to(bar,{scaleX:0,transformOrigin:"left center",duration:.3});

    // Pause video
    stopVideo(i);

    if(tickerLabelRef.current) tickerLabelRef.current.textContent="Archive";
  }

  // ── EXPAND + NAVIGATE ────────────────────────────────────────────────────
  function expandProject(i: number) {
    const p=PROJECTS[i];
    const print=printRefs.current[i]; if(!print)return;
    
    // Freeze physics on expand
    physicsState.current.forEach(state => state.isHovered = true);
    
    SND.explode();

    const rect=print.getBoundingClientRect();
    const W=window.innerWidth, H=window.innerHeight;
    const overlay=expandRef.current; if(!overlay)return;

    // Set up overlay at print position
    const img=expandImgRef.current!;
    const vid=expandVidRef.current!;

    if(p.video){
      img.style.display="none";
      vid.style.display="block";
      vid.src=p.video;
      vid.poster=p.covers[0];
      vid.play().catch(()=>{});
    } else {
      vid.style.display="none";
      img.style.display="block";
      img.src=p.covers[0];
    }

    gsap.set(overlay,{
      display:"block",opacity:1,
      left:rect.left, top:rect.top,
      width:rect.width, height:rect.height,
    });
    gsap.to(overlay,{
      left:0, top:0, width:W, height:H,
      duration:.65, ease:"expo.inOut",
      onComplete(){ navigateRef.current(`/work/${p.id}`,"ink"); },
    });
  }

  // ── TICKER ────────────────────────────────────────────────────────────────
  function buildTicker() {
    const el=tickerRef.current; if(!el)return;
    const items:string[]=[];
    PROJECTS.forEach(p=>{items.push(`[ ${p.title.toUpperCase()} ]`);p.services.forEach(s=>items.push(s.toUpperCase()));});
    const text=items.join("  —  ")+"  —  ";
    el.innerHTML="";
    for(let i=0;i<3;i++){const s=document.createElement("span");s.textContent=text;s.style.cssText="display:inline-block;white-space:nowrap";el.appendChild(s);}
    requestAnimationFrame(()=>{
      const w=(el.children[0] as HTMLElement).offsetWidth;
      tickerTL.current?.kill();
      tickerTL.current=gsap.timeline({repeat:-1});
      tickerTL.current.to(el,{x:-w,duration:w/55,ease:"none",onRepeat(){gsap.set(el,{x:0});}});
    });
  }

  useEffect(()=>{
    document.body.style.cssText="overflow:hidden;height:100vh;background:#010101";
    buildTicker();

    // Cursor & Physics Loop
    const pos={cx:0,cy:0};
    const onMM=(e:MouseEvent)=>{
      if(dotRef.current){dotRef.current.style.left=e.clientX+"px";dotRef.current.style.top=e.clientY+"px";}
      pos.cx+=(e.clientX-pos.cx)*.09;pos.cy+=(e.clientY-pos.cy)*.09;
    };
    window.addEventListener("mousemove",onMM);
    
    let raf=0;
    const tick=()=>{
      // Cursor update
      if(ringRef.current){ringRef.current.style.left=pos.cx+"px";ringRef.current.style.top=pos.cy+"px";}

      // Physics Engine Update
      const W = window.innerWidth;
      const H = window.innerHeight;
      
      if (W && H) {
        const state = physicsState.current;

        // 1. Apply velocity & Edge collisions
        for(let i=0; i<state.length; i++) {
          const p = state[i];
          if (p.isHovered) continue;

          p.x += p.vx;
          p.y += p.vy;

          const pw = (p.w / 100) * W;
          const ph = pw * 0.68; // 68% padding bottom aspect ratio
          const h_pct = (ph / H) * 100;

          if (p.x <= 0) { p.x = 0; p.vx *= -1; }
          if (p.x + p.w >= 100) { p.x = 100 - p.w; p.vx *= -1; }
          if (p.y <= 0) { p.y = 0; p.vy *= -1; }
          if (p.y + h_pct >= 100) { p.y = 100 - h_pct; p.vy *= -1; }
        }

        // 2. Object Collisions (Circle-based intersection)
        for(let i=0; i<state.length; i++) {
          for(let j=i+1; j<state.length; j++) {
            const p1 = state[i];
            const p2 = state[j];

            const pw1 = (p1.w / 100) * W;
            const ph1 = pw1 * 0.68;
            const cx1 = (p1.x / 100) * W + pw1/2;
            const cy1 = (p1.y / 100) * H + ph1/2;
            const r1 = Math.min(pw1, ph1) * 0.55; // .55 allows slight natural overlap

            const pw2 = (p2.w / 100) * W;
            const ph2 = pw2 * 0.68;
            const cx2 = (p2.x / 100) * W + pw2/2;
            const cy2 = (p2.y / 100) * H + ph2/2;
            const r2 = Math.min(pw2, ph2) * 0.55;

            const dx = cx2 - cx1;
            const dy = cy2 - cy1;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const minDist = r1 + r2;

            if (dist < minDist && dist > 0) {
              const overlap = minDist - dist;
              const nx = dx / dist;
              const ny = dy / dist;

              // Resolve penetration (push them apart)
              const moveX = (nx * overlap / 2);
              const moveY = (ny * overlap / 2);

              if (!p1.isHovered) {
                p1.x -= (moveX / W) * 100;
                p1.y -= (moveY / H) * 100;
              }
              if (!p2.isHovered) {
                p2.x += (moveX / W) * 100;
                p2.y += (moveY / H) * 100;
              }

              // Elastic velocity exchange
              const vx1_px = (p1.vx / 100) * W;
              const vy1_px = (p1.vy / 100) * H;
              const vx2_px = (p2.vx / 100) * W;
              const vy2_px = (p2.vy / 100) * H;

              const p_col = (nx * (vx1_px - vx2_px) + ny * (vy1_px - vy2_px));
              const restitution = 1.02; // Add tiny energy to keep them moving

              p1.vx = ((vx1_px - p_col * nx * restitution) / W) * 100;
              p1.vy = ((vy1_px - p_col * ny * restitution) / H) * 100;
              p2.vx = ((vx2_px + p_col * nx * restitution) / W) * 100;
              p2.vy = ((vy2_px + p_col * ny * restitution) / H) * 100;

              // Speed limits
              const maxV = 0.15;
              p1.vx = Math.max(-maxV, Math.min(maxV, p1.vx));
              p1.vy = Math.max(-maxV, Math.min(maxV, p1.vy));
              p2.vx = Math.max(-maxV, Math.min(maxV, p2.vx));
              p2.vy = Math.max(-maxV, Math.min(maxV, p2.vy));
            }
          }
        }

        // 3. Apply calculated state to DOM
        for(let i=0; i<state.length; i++) {
          const el = printRefs.current[i];
          if (el && !state[i].isHovered) { // Skip DOM update if GSAP is handling hover state
            el.style.left = state[i].x + '%';
            el.style.top = state[i].y + '%';
          }
        }
      }

      raf=requestAnimationFrame(tick);
    };
    raf=requestAnimationFrame(tick);

    return()=>{
      document.body.style.cssText="";
      tickerTL.current?.kill();
      window.removeEventListener("mousemove",onMM);
      cancelAnimationFrame(raf);
    };
  },[]);

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@200;700;900&display=swap');
        *{cursor:none!important} body{overflow:hidden!important}
        @keyframes fadeout{to{opacity:0}}
      `}</style>
      <div style={{position:"fixed",inset:0,background:"#010101",overflow:"hidden"}}>

        {/* Darkroom safelight — deep amber/red radial */}
        <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:0,
          background:"radial-gradient(ellipse at 50% 60%,rgba(52,10,6,0.45) 0%,rgba(0,0,0,0) 62%)"}}/>

        {/* Grain texture */}
        <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:1,opacity:.04,
          backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.88' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize:"180px"}}/>

        {/* Cursor */}
        <div ref={ringRef} style={{position:"fixed",zIndex:9990,pointerEvents:"none",
          transform:"translate(-50%,-50%)",width:22,height:22,borderRadius:"50%",
          border:"1px solid rgba(200,110,80,0.38)"}}/>
        <div ref={dotRef} style={{position:"fixed",zIndex:9991,pointerEvents:"none",
          transform:"translate(-50%,-50%)",width:3,height:3,borderRadius:"50%",
          background:"rgba(220,120,80,0.7)"}}/>

        {/* Header */}
        <div style={{position:"absolute",top:72,left:52,zIndex:50,pointerEvents:"none"}}>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:".38em",
            color:"rgba(210,140,110,0.26)",textTransform:"uppercase"}}>Domani / Work</div>
          <div style={{fontFamily:"'Bodoni Moda',Georgia,serif",fontStyle:"italic",
            fontSize:"clamp(24px,3.5vw,46px)",color:"rgba(255,255,255,0.08)",
            lineHeight:1,letterSpacing:"-.025em",marginTop:5}}>Selected</div>
        </div>

        {/* Count */}
        <div style={{position:"absolute",top:72,right:52,zIndex:50,pointerEvents:"none",textAlign:"right"}}>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:100,
            fontSize:60,lineHeight:1,color:"rgba(255,255,255,0.05)"}}>
            {String(PROJECTS.length).padStart(2,"0")}
          </div>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:".22em",
            color:"rgba(210,140,110,0.20)",textTransform:"uppercase"}}>Projects</div>
        </div>

        {/* ── PHOTO PRINTS ── */}
        <div style={{position:"absolute",inset:0,paddingTop:52,paddingBottom:34,
          perspective:"1200px", perspectiveOrigin:"50% 40%"}}>
          {PROJECTS.map((p,i)=>{
            const lay=LAYOUT[i];
            const c=rgb(p.color);
            return(
              <div
                key={p.id}
                ref={el=>{if(el) printRefs.current[i]=el;}}
                onMouseEnter={()=>onEnter(i)}
                onMouseLeave={()=>onLeave(i)}
                onClick={()=>expandProject(i)}
                style={{
                  position:"absolute",
                  left:`${lay.lx}%`, top:`${lay.ly}%`,
                  width:`${lay.w}%`,
                  transform:`rotate(${lay.rot}deg)`,
                  transformOrigin:"center center",
                  zIndex:lay.z,
                  cursor:"none",
                  outline:"8px solid rgba(255,255,255,0.07)",
                  boxShadow:"0 6px 24px rgba(0,0,0,0.75)",
                  transition:"outline-color .3s,box-shadow .3s",
                  willChange:"transform, left, top",
                }}>
                <div style={{position:"relative",paddingBottom:"68%",overflow:"hidden",background:"#080808"}}>

                  {/* Cover image — the "still poster" at rest */}
                  <img
                    ref={el=>{if(el) imgRefs.current[i]=el;}}
                    src={p.covers[0]}
                    alt={p.title}
                    style={{
                      position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",
                      filter:"brightness(0.22) saturate(0.12)",
                      zIndex:1,
                    }}
                  />

                  {/* Video — only shows on hover if project.video exists */}
                  <video
                    ref={el=>{if(el) vidRefs.current[i]=el;}}
                    muted loop playsInline
                    poster={p.covers[0]}
                    style={{
                      position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",
                      opacity:0, zIndex:2,
                      filter:"brightness(0.52) saturate(1.0)",
                    }}
                  />

                  {/* Amber chemical tint — darkroom developing effect */}
                  <div
                    ref={el=>{if(el) tintRefs.current[i]=el;}}
                    style={{
                      position:"absolute",inset:0,zIndex:3,
                      background:"rgba(58,15,6,0.28)",
                      mixBlendMode:"multiply",
                      pointerEvents:"none",
                    }}
                  />

                  {/* Bottom gradient — always present */}
                  <div style={{position:"absolute",inset:0,zIndex:4,pointerEvents:"none",
                    background:"linear-gradient(to top,rgba(0,0,0,0.85) 0%,transparent 55%)"}}/>

                  {/* Accent bar — races across bottom on hover */}
                  <div
                    ref={el=>{if(el) accentBars.current[i]=el;}}
                    style={{
                      position:"absolute",bottom:0,left:0,right:0,height:2,zIndex:8,
                      background:`rgb(${c})`,
                      boxShadow:`0 0 12px rgba(${c},0.7)`,
                      transform:"scaleX(0)",transformOrigin:"left center",
                    }}
                  />

                  {/* Title — emerges from bottom on hover */}
                  <div
                    ref={el=>{if(el) titleRefs.current[i]=el;}}
                    style={{
                      position:"absolute",bottom:28,left:10,right:10,zIndex:7,
                      opacity:0, transform:"translateY(16px)",
                      fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,
                      fontSize:"clamp(16px,3.2vw,30px)",letterSpacing:".005em",
                      textTransform:"uppercase",color:"rgba(255,255,255,0.94)",lineHeight:1,
                    }}
                  >{p.title}</div>

                  {/* Info strip — client + year */}
                  <div
                    ref={el=>{if(el) infoRefs.current[i]=el;}}
                    style={{
                      position:"absolute",bottom:10,left:10,right:10,zIndex:7,
                      opacity:0,
                      display:"flex",gap:8,alignItems:"center",
                    }}
                  >
                    <span style={{fontFamily:"'DM Mono',monospace",fontSize:6,letterSpacing:".14em",
                      color:`rgba(${c},0.70)`,textTransform:"uppercase"}}>{p.client}</span>
                    <span style={{width:1,height:8,background:`rgba(${c},0.3)`,display:"inline-block"}}/>
                    <span style={{fontFamily:"'DM Mono',monospace",fontSize:6,letterSpacing:".14em",
                      color:"rgba(255,255,255,0.32)"}}>{p.year}</span>
                    {p.video&&<span style={{fontFamily:"'DM Mono',monospace",fontSize:6,letterSpacing:".12em",
                      color:`rgba(${c},0.55)`,marginLeft:"auto"}}>▶</span>}
                  </div>

                  {/* Service tags — compact strip */}
                  <div
                    ref={el=>{if(el) tagRefs.current[i]=el;}}
                    style={{
                      position:"absolute",top:8,left:8,right:8,zIndex:7,
                      display:"flex",flexWrap:"wrap",gap:3,opacity:0,
                    }}
                  >
                    {p.services.slice(0,3).map(s=>(
                      <span key={s} style={{
                        fontFamily:"'DM Mono',monospace",fontSize:5,letterSpacing:".12em",
                        color:`rgba(${c},0.70)`,textTransform:"uppercase",
                        background:`rgba(${c},0.10)`,
                        border:`1px solid rgba(${c},0.20)`,
                        padding:"1px 5px",backdropFilter:"blur(2px)",
                      }}>{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Instruction */}
        <div style={{position:"absolute",bottom:38,left:"50%",transform:"translateX(-50%)",
          zIndex:50,pointerEvents:"none",textAlign:"center",
          fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:".22em",
          color:"rgba(200,130,100,0.20)",textTransform:"uppercase",
          animation:"fadeout 1.2s ease 4s forwards"}}>
          Hover to develop · Click to open
        </div>

        {/* ── EXPANSION OVERLAY ── */}
        <div ref={expandRef} style={{
          position:"fixed",zIndex:9980,overflow:"hidden",background:"#000",
          display:"none",
        }}>
          <img ref={expandImgRef} alt="" style={{width:"100%",height:"100%",objectFit:"cover",
            filter:"brightness(0.42)",position:"absolute",inset:0}}/>
          <video ref={expandVidRef} muted loop playsInline style={{
            width:"100%",height:"100%",objectFit:"cover",filter:"brightness(0.42)",
            position:"absolute",inset:0,display:"none"}}/>
        </div>

        {/* ── TICKER ── */}
        <div style={{position:"fixed",bottom:0,left:0,right:0,height:28,zIndex:100,
          background:"rgba(0,0,0,0.94)",borderTop:"1px solid rgba(200,110,80,0.08)",
          display:"flex",alignItems:"center",overflow:"hidden"}}>
          <div ref={tickerLabelRef} style={{
            flexShrink:0,padding:"0 14px",
            fontFamily:"'DM Mono',monospace",fontSize:6,letterSpacing:".28em",
            color:"rgba(210,130,90,0.45)",textTransform:"uppercase",
            borderRight:"1px solid rgba(200,110,80,0.08)",
            height:"100%",display:"flex",alignItems:"center",whiteSpace:"nowrap",
            transition:"color .3s",
          }}>Archive</div>
          <div style={{flex:1,overflow:"hidden"}}>
            <div ref={tickerRef} style={{display:"inline-block",whiteSpace:"nowrap",
              fontFamily:"'Barlow Condensed',sans-serif",fontSize:10,fontWeight:300,letterSpacing:".18em",
              color:"rgba(200,110,80,0.28)"}}/>
          </div>
        </div>
      </div>
    </>
  );
}