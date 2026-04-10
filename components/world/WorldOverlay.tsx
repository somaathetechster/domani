"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { audio } from "@/lib/audio/AudioManager";

interface Props {
  scrollT:       number;  // 0→1
  buildComplete: boolean; // true once world finishes building
}

// ─── FONTS ────────────────────────────────────────────────────────────────────
const mono  = (e?: React.CSSProperties): React.CSSProperties => ({ fontFamily:"'DM Mono','Courier New',monospace", ...e });
const serif = (e?: React.CSSProperties): React.CSSProperties => ({ fontFamily:"'Bodoni Moda',Georgia,serif", ...e });

// ─── CURSOR ───────────────────────────────────────────────────────────────────
function WorldCursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot  = useRef<HTMLDivElement>(null);
  const pos  = useRef({cx:0,cy:0,mx:0,my:0});
  const raf  = useRef(0);
  useEffect(()=>{
    const mv=(e:MouseEvent)=>{pos.current.mx=e.clientX;pos.current.my=e.clientY;};
    window.addEventListener("mousemove",mv);
    const tick=()=>{
      raf.current=requestAnimationFrame(tick);
      const p=pos.current;
      p.cx+=(p.mx-p.cx)*0.10; p.cy+=(p.my-p.cy)*0.10;
      if(ring.current){ring.current.style.left=p.cx+"px";ring.current.style.top=p.cy+"px";}
      if(dot.current){dot.current.style.left=p.mx+"px";dot.current.style.top=p.my+"px";}
    };
    raf.current=requestAnimationFrame(tick);
    return()=>{window.removeEventListener("mousemove",mv);cancelAnimationFrame(raf.current);};
  },[]);
  return (
    <>
      <div ref={ring} style={{position:"fixed",zIndex:999,pointerEvents:"none",transform:"translate(-50%,-50%)",width:28,height:28,border:"1px solid rgba(184,240,255,0.45)",borderRadius:"50%",transition:"width .4s,height .4s"}}/>
      <div ref={dot}  style={{position:"fixed",zIndex:1000,pointerEvents:"none",transform:"translate(-50%,-50%)",width:4,height:4,borderRadius:"50%",background:"#B8F0FF",boxShadow:"0 0 8px #B8F0FF"}}/>
    </>
  );
}

// ─── AUDIO TOGGLE ─────────────────────────────────────────────────────────────
function AudioToggle() {
  const [muted,setMuted]=useState(false);
  const toggle=useCallback(()=>{
    muted ? audio.setAmbientVolume(0.55) : audio.setAmbientVolume(0);
    setMuted(m=>!m);
  },[muted]);
  return (
    <button onClick={toggle} style={{background:"none",border:"none",padding:0,display:"flex",alignItems:"center",gap:8,cursor:"none",opacity:0.65,transition:"opacity .3s"}}
      onMouseOver={e=>(e.currentTarget.style.opacity="1")} onMouseOut={e=>(e.currentTarget.style.opacity="0.65")}>
      <div style={{display:"flex",alignItems:"flex-end",gap:2,height:14}}>
        {[4,9,13,9,5].map((h,i)=>(
          <div key={i} style={{width:2,height:muted?2:h,background:"#B8F0FF",borderRadius:1,transition:"height .3s",opacity:muted?0.25:1}}/>
        ))}
      </div>
      <span style={mono({fontSize:7,letterSpacing:"0.22em",color:"rgba(184,240,255,0.55)",textTransform:"uppercase"})}>
        {muted?"Muted":"Sound"}
      </span>
    </button>
  );
}

// ─── CONTENT BLOCK — fades in/out based on scroll position ───────────────────
interface BlockProps {
  scrollT:  number;
  inStart:  number; // scrollT at which block fades IN
  inEnd:    number; // fully visible by
  outStart: number; // begins fading out
  outEnd:   number; // fully gone
  children: React.ReactNode;
  style?:   React.CSSProperties;
}
function ScrollBlock({scrollT,inStart,inEnd,outStart,outEnd,children,style}:BlockProps) {
  let opacity=0;
  if(scrollT>=inStart && scrollT<inEnd)
    opacity=(scrollT-inStart)/(inEnd-inStart);
  else if(scrollT>=inEnd && scrollT<outStart)
    opacity=1;
  else if(scrollT>=outStart && scrollT<outEnd)
    opacity=1-(scrollT-outStart)/(outEnd-outStart);

  const transform = scrollT<inStart
    ? `translateY(28px)`
    : scrollT<inEnd
    ? `translateY(${28*(1-(scrollT-inStart)/(inEnd-inStart))}px)`
    : scrollT>outStart
    ? `translateY(${-20*((scrollT-outStart)/(outEnd-outStart))}px)`
    : "translateY(0)";

  return (
    <div style={{...style,opacity,transform,transition:"none",willChange:"opacity,transform"}}>
      {children}
    </div>
  );
}

// ─── STAGGERED WORD REVEAL ────────────────────────────────────────────────────
function WordReveal({text,show,delay=0,style}:{text:string,show:boolean,delay?:number,style?:React.CSSProperties}) {
  const words=text.split(" ");
  return (
    <span style={{display:"inline-block",...style}}>
      {words.map((w,i)=>(
        <span key={i} style={{
          display:"inline-block",
          opacity:show?1:0,
          transform:show?"translateY(0)":"translateY(16px)",
          transition:`opacity 0.7s ease ${delay+i*0.08}s, transform 0.7s ease ${delay+i*0.08}s`,
          marginRight:"0.28em",
        }}>{w}</span>
      ))}
    </span>
  );
}

// ─── SCANLINE ─────────────────────────────────────────────────────────────────
function ScanLine({vis}:{vis:boolean}) {
  return (
    <>
      <div style={{position:"fixed",left:0,right:0,height:1,zIndex:20,pointerEvents:"none",
        background:"linear-gradient(90deg,transparent,rgba(184,240,255,0.05) 40%,rgba(184,240,255,0.09) 50%,rgba(184,240,255,0.05) 60%,transparent)",
        opacity:vis?1:0,transition:"opacity 1.5s",animation:"scanLine 18s linear infinite"}}/>
      <style>{`@keyframes scanLine{0%{top:-1px}100%{top:100vh}}`}</style>
    </>
  );
}

// ─── CORNER MARKS ─────────────────────────────────────────────────────────────
function Corners({vis}:{vis:boolean}) {
  const style=(pos:string):React.CSSProperties=>({
    position:"fixed",width:18,height:18,pointerEvents:"none",zIndex:50,
    opacity:vis?1:0,transition:"opacity 1.4s",
    ...(pos==="tl"?{top:24,left:24}:pos==="tr"?{top:24,right:24,transform:"scaleX(-1)"}:
        pos==="bl"?{bottom:24,left:24,transform:"scaleY(-1)"}:{bottom:24,right:24,transform:"scale(-1,-1)"}),
  });
  const svg=(
    <svg viewBox="0 0 18 18" fill="none" width="100%" height="100%">
      <path d="M1 9L1 1L9 1" stroke="rgba(184,240,255,0.40)" strokeWidth="1"/>
    </svg>
  );
  return <>{["tl","tr","bl","br"].map(p=><div key={p} style={style(p)}>{svg}</div>)}</>;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export function WorldOverlay({scrollT,buildComplete}:Props) {
  const [vis,     setVis]     = useState(false);
  const [showHero,setShowHero]= useState(false);

  // UI fades in after world starts
  useEffect(()=>{ const t=setTimeout(()=>setVis(true),800); return()=>clearTimeout(t); },[]);

  // Hero "WE ARE TOMORROW" shows after build completes
  useEffect(()=>{
    if(buildComplete) setTimeout(()=>setShowHero(true),400);
  },[buildComplete]);

  // Hero hides when scroll begins
  const heroVisible = showHero && scrollT < 0.04;

  const C = "rgba(184,240,255,";
  const fade = (d=0):React.CSSProperties=>({opacity:vis?1:0,transition:`opacity 1.6s ease ${d}s`});

  // Scroll range helpers
  // Total scroll 0→1 maps to camera walking 0→42 units into world
  // Content zones:
  // 0.00–0.04  Hero "WE ARE TOMORROW"
  // 0.04–0.16  What is Domani
  // 0.16–0.30  Philosophy / manifesto
  // 0.30–0.44  Services
  // 0.44–0.58  Products (Infinitswap, YDBI, Veyra)
  // 0.58–0.72  Process / method
  // 0.72–0.85  Positioning
  // 0.85–1.00  Contact / CTA

  return (
    <>
      <WorldCursor />
      <ScanLine vis={vis} />
      <Corners vis={vis} />

      {/* ── PERSISTENT TOP BAR ───────────────────────────────────────────────── */}
      <div style={{position:"fixed",top:0,left:0,right:0,display:"flex",justifyContent:"space-between",
        padding:"26px 40px 0",zIndex:50,pointerEvents:"none",...fade(0)}}>
        {/* Wordmark */}
        <div>
          <div style={mono({fontSize:10,fontWeight:300,letterSpacing:"0.55em",color:C+"0.68)",textTransform:"uppercase",userSelect:"none"})}>
            DOMANI
          </div>
          <div style={{marginTop:5,width:28,height:1,background:`linear-gradient(90deg,${C+"0.45)"},transparent)`}}/>
        </div>

        {/* Scroll depth indicator */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
          <div style={mono({fontSize:7,letterSpacing:"0.22em",color:C+"0.22)",textTransform:"uppercase"})}>
            {Math.round(scrollT*100).toString().padStart(3,"0")}
          </div>
          <div style={{width:80,height:1,background:C+"0.08)"}}>
            <div style={{height:1,width:`${scrollT*100}%`,background:"#B8F0FF",boxShadow:`0 0 6px ${C+"0.5)"}`}}/>
          </div>
        </div>
      </div>

      {/* ── LEFT EDGE ─────────────────────────────────────────────────────────── */}
      <div style={{position:"fixed",left:16,top:"50%",transform:"translateY(-50%)",zIndex:50,pointerEvents:"none",...fade(0.3)}}>
        <div style={{writingMode:"vertical-rl",transform:"rotate(180deg)",
          ...mono({fontSize:7,letterSpacing:"0.28em",color:C+"0.16)",textTransform:"uppercase"}),userSelect:"none"}}>
          The Great Architect of Tomorrow
        </div>
      </div>

      {/* ── BOTTOM RIGHT — audio + scroll hint ───────────────────────────────── */}
      <div style={{position:"fixed",bottom:28,right:36,zIndex:50,pointerEvents:"all",
        display:"flex",flexDirection:"column",alignItems:"flex-end",gap:14,...fade(0.5)}}>
        <AudioToggle />
        {/* Scroll hint — more visible */}
        <div style={{
          opacity:scrollT<0.03&&vis?1:0,transition:"opacity 0.8s",pointerEvents:"none",
          display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8,
        }}>
          <div style={mono({fontSize:8,letterSpacing:"0.30em",color:C+"0.50)",textTransform:"uppercase",
            textShadow:`0 0 20px ${C+"0.25)"}`})}>
            Scroll to explore
          </div>
          {/* Animated chevrons */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            {[0,1,2].map(i=>(
              <div key={i} style={{
                width:10,height:6,
                borderRight:`1px solid ${C+"0.55)"}`,
                borderBottom:`1px solid ${C+"0.55)"}`,
                transform:"rotate(45deg)",
                animation:`chevronPulse 1.6s ease-in-out ${i*0.18}s infinite`,
                boxShadow:`2px 2px 6px ${C+"0.20)"}`,
              }}/>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM LEFT — persistent tagline ─────────────────────────────────── */}
      <div style={{position:"fixed",bottom:28,left:36,zIndex:50,pointerEvents:"none",...fade(0.6)}}>
        <div style={serif({fontSize:"clamp(9px,1vw,12px)",fontStyle:"italic",
          color:C+"0.22)",letterSpacing:"0.02em",lineHeight:1.7,maxWidth:300})}>
          Precise. Inevitable. Earned.
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── HERO — WE ARE TOMORROW ─────────────────────────────────────────── */}
      {/* Shows after build, disappears on scroll */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      <div style={{
        position:"fixed",top:"50%",left:"50%",
        transform:"translate(-50%,-50%)",
        zIndex:5,pointerEvents:"none",textAlign:"center",
        opacity:heroVisible?1:0,
        transition:"opacity 1.2s ease",
        willChange:"opacity",
      }}>
        {/* Ghost scale word */}
        <div style={serif({
          fontSize:"clamp(72px,13vw,180px)",
          fontStyle:"italic",fontWeight:400,
          color:C+"0.055)",
          letterSpacing:"-0.02em",lineHeight:0.9,
          userSelect:"none",whiteSpace:"nowrap",
          textShadow:`0 0 120px ${C+"0.12)"}, 0 0 40px ${C+"0.08)"}`,
        })}>
          We Are Tomorrow
        </div>
        {/* Readable version on top */}
        <div style={{marginTop:"-0.55em",position:"relative"}}>
          <div style={serif({
            fontSize:"clamp(15px,1.8vw,22px)",
            fontStyle:"italic",fontWeight:400,
            color:C+"0.65)",
            letterSpacing:"0.06em",lineHeight:1,
          })}>
            <WordReveal text="We Are Tomorrow" show={showHero} delay={0.3}/>
          </div>
        </div>
        {/* Line */}
        <div style={{margin:"18px auto 0",width:48,height:1,
          background:`linear-gradient(90deg,transparent,${C+"0.40)"},transparent)`,
          opacity:showHero?1:0,transition:"opacity 1.2s ease 0.8s"}}/>
        {/* Sub */}
        <div style={{marginTop:12,opacity:showHero?1:0,transition:"opacity 1.2s ease 1s",
          ...mono({fontSize:8,letterSpacing:"0.35em",color:C+"0.30)",textTransform:"uppercase"})}}>
          DOM·ANI · MMXXVI
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ── SCROLL-DRIVEN CONTENT BLOCKS ──────────────────────────────────── */}
      {/* ════════════════════════════════════════════════════════════════════════ */}

      {/* 01 — WHAT IS DOMANI (0.06 → 0.18) */}
      <ScrollBlock scrollT={scrollT} inStart={0.05} inEnd={0.10} outStart={0.16} outEnd={0.20}
        style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
          zIndex:10,pointerEvents:"none",textAlign:"center",width:"min(680px,80vw)"}}>
        <div style={mono({fontSize:8,letterSpacing:"0.35em",color:C+"0.35)",textTransform:"uppercase",marginBottom:20})}>
          01 — Studio
        </div>
        <div style={serif({
          fontSize:"clamp(28px,5vw,64px)",
          fontStyle:"italic",fontWeight:400,
          color:C+"0.82)",lineHeight:1.05,letterSpacing:"-0.01em",
        })}>
          Design and technology<br/>for the systems age.
        </div>
        <div style={{margin:"24px auto",width:40,height:1,background:`linear-gradient(90deg,transparent,${C+"0.35)"},transparent)`}}/>
        <div style={mono({fontSize:9,letterSpacing:"0.14em",color:C+"0.38)",lineHeight:1.9,maxWidth:460,margin:"0 auto"})}>
          Domani builds brands, products, and AI systems<br/>
          for organisations that intend to be permanent.
        </div>
      </ScrollBlock>

      {/* 02 — PHILOSOPHY (0.18 → 0.30) */}
      <ScrollBlock scrollT={scrollT} inStart={0.17} inEnd={0.22} outStart={0.28} outEnd={0.32}
        style={{position:"fixed",top:"50%",left:60,transform:"translateY(-50%)",
          zIndex:10,pointerEvents:"none",maxWidth:520}}>
        <div style={mono({fontSize:7,letterSpacing:"0.30em",color:C+"0.28)",textTransform:"uppercase",marginBottom:18})}>
          02 — Philosophy
        </div>
        <div style={serif({
          fontSize:"clamp(22px,3.5vw,48px)",
          fontStyle:"italic",fontWeight:400,
          color:C+"0.78)",lineHeight:1.10,
        })}>
          Companies should behave like systems.
        </div>
        <div style={{marginTop:28}}>
          {[
            "Not collections of people. Not collections of tasks.",
            "Systems with intent. With logic. With inevitability.",
            "We build the architecture that makes that possible.",
          ].map((line,i)=>(
            <div key={i} style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:14}}>
              <div style={{width:16,height:1,background:C+"0.30)",flexShrink:0,marginTop:8}}/>
              <div style={mono({fontSize:9,letterSpacing:"0.10em",color:C+"0.42)",lineHeight:1.8})}>{line}</div>
            </div>
          ))}
        </div>
      </ScrollBlock>

      {/* 03 — SERVICES (0.32 → 0.44) */}
      <ScrollBlock scrollT={scrollT} inStart={0.30} inEnd={0.35} outStart={0.42} outEnd={0.46}
        style={{position:"fixed",top:"50%",right:60,transform:"translateY(-50%)",
          zIndex:10,pointerEvents:"none",maxWidth:480,textAlign:"right"}}>
        <div style={mono({fontSize:7,letterSpacing:"0.30em",color:C+"0.28)",textTransform:"uppercase",marginBottom:18})}>
          03 — Services
        </div>
        <div style={serif({fontSize:"clamp(20px,3vw,40px)",fontStyle:"italic",fontWeight:400,color:C+"0.75)",lineHeight:1.1,marginBottom:28})}>
          Four disciplines.<br/>One system.
        </div>
        {[
          {n:"01",t:"Brand Identity",d:"Marks, systems, and voice that compound over time."},
          {n:"02",t:"Product Engineering",d:"Full-stack builds from architecture to deployment."},
          {n:"03",t:"AI Systems",d:"Intelligent infrastructure that learns and scales."},
          {n:"04",t:"Strategic Infrastructure",d:"The operating system behind your organisation."},
        ].map(({n,t,d})=>(
          <div key={n} style={{display:"flex",flexDirection:"column",alignItems:"flex-end",marginBottom:16,paddingBottom:16,borderBottom:`1px solid ${C+"0.06)"}`}}>
            <div style={{display:"flex",alignItems:"baseline",gap:12}}>
              <div style={mono({fontSize:7,letterSpacing:"0.2em",color:C+"0.25)"})}>{n}</div>
              <div style={mono({fontSize:11,letterSpacing:"0.12em",color:C+"0.70)",fontWeight:400})}>{t}</div>
            </div>
            <div style={mono({fontSize:8,letterSpacing:"0.08em",color:C+"0.35)",lineHeight:1.7,marginTop:4})}>{d}</div>
          </div>
        ))}
      </ScrollBlock>

      {/* 04 — VENTURES / PRODUCTS (0.46 → 0.58) */}
      <ScrollBlock scrollT={scrollT} inStart={0.44} inEnd={0.49} outStart={0.56} outEnd={0.60}
        style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
          zIndex:10,pointerEvents:"none",textAlign:"center",width:"min(740px,82vw)"}}>
        <div style={mono({fontSize:7,letterSpacing:"0.30em",color:C+"0.28)",textTransform:"uppercase",marginBottom:20})}>
          04 — In-house Ventures
        </div>
        <div style={serif({fontSize:"clamp(22px,3.5vw,48px)",fontStyle:"italic",fontWeight:400,color:C+"0.76)",lineHeight:1.1,marginBottom:32})}>
          We don't just build for clients.<br/>We build for tomorrow.
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:24}}>
          {[
            {name:"Infinitswap",tag:"Crypto-Fiat Exchange",desc:"WhatsApp-native P2P exchange operating across Nigeria, Ghana, Tanzania & South Africa."},
            {name:"YDBI",tag:"AI Butler",desc:"Your personal intelligence layer. Ambient, voice-first, context-aware across all your devices."},
            {name:"Veyra",tag:"Fashion Intelligence",desc:"AI-powered wardrobe and styling for the woman who knows who she is."},
          ].map(({name,tag,desc})=>(
            <div key={name} style={{padding:"20px 16px",border:`1px solid ${C+"0.08)"}`,textAlign:"left"}}>
              <div style={mono({fontSize:7,letterSpacing:"0.2em",color:C+"0.28)",textTransform:"uppercase",marginBottom:8})}>{tag}</div>
              <div style={mono({fontSize:12,letterSpacing:"0.08em",color:C+"0.75)",marginBottom:10})}>{name}</div>
              <div style={mono({fontSize:8,letterSpacing:"0.06em",color:C+"0.38)",lineHeight:1.75})}>{desc}</div>
            </div>
          ))}
        </div>
      </ScrollBlock>

      {/* 05 — METHOD (0.60 → 0.72) */}
      <ScrollBlock scrollT={scrollT} inStart={0.58} inEnd={0.63} outStart={0.70} outEnd={0.74}
        style={{position:"fixed",top:"50%",left:60,transform:"translateY(-50%)",
          zIndex:10,pointerEvents:"none",maxWidth:500}}>
        <div style={mono({fontSize:7,letterSpacing:"0.30em",color:C+"0.28)",textTransform:"uppercase",marginBottom:18})}>
          05 — Method
        </div>
        <div style={serif({fontSize:"clamp(20px,3vw,42px)",fontStyle:"italic",fontWeight:400,color:C+"0.76)",lineHeight:1.1,marginBottom:28})}>
          Precise. Inevitable.<br/>Earned.
        </div>
        {[
          {step:"Diagnose",text:"We start with the system, not the symptom. Strategy before aesthetics."},
          {step:"Architect",text:"Every deliverable — brand, product, AI — designed to compound."},
          {step:"Build",text:"Production-grade execution. No prototypes left in drawers."},
          {step:"Evolve",text:"We stay. Infrastructure doesn't end at launch."},
        ].map(({step,text},i)=>(
          <div key={step} style={{display:"flex",gap:20,marginBottom:18}}>
            <div style={mono({fontSize:8,letterSpacing:"0.1em",color:C+"0.22)",flexShrink:0,paddingTop:2})}>
              {String(i+1).padStart(2,"0")}
            </div>
            <div>
              <div style={mono({fontSize:10,letterSpacing:"0.14em",color:C+"0.65)",marginBottom:5})}>{step}</div>
              <div style={mono({fontSize:8,letterSpacing:"0.08em",color:C+"0.36)",lineHeight:1.8})}>{text}</div>
            </div>
          </div>
        ))}
      </ScrollBlock>

      {/* 06 — POSITIONING (0.74 → 0.86) */}
      <ScrollBlock scrollT={scrollT} inStart={0.72} inEnd={0.77} outStart={0.84} outEnd={0.88}
        style={{position:"fixed",top:"50%",right:60,transform:"translateY(-50%)",
          zIndex:10,pointerEvents:"none",maxWidth:460,textAlign:"right"}}>
        <div style={mono({fontSize:7,letterSpacing:"0.30em",color:C+"0.28)",textTransform:"uppercase",marginBottom:18})}>
          06 — The Standard
        </div>
        <div style={serif({fontSize:"clamp(24px,4vw,56px)",fontStyle:"italic",fontWeight:400,color:C+"0.78)",lineHeight:1.05,marginBottom:28})}>
          Africa's most precise<br/>design studio.
        </div>
        <div style={mono({fontSize:9,letterSpacing:"0.10em",color:C+"0.40)",lineHeight:1.9})}>
          We work with founders, operators, and institutions<br/>
          who understand that design is not decoration —<br/>
          it is infrastructure.
        </div>
        <div style={{marginTop:28,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
          {["Worldwide delivery","Abuja headquarters","Systems-first thinking"].map(t=>(
            <div key={t} style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={mono({fontSize:8,letterSpacing:"0.12em",color:C+"0.38)"})}>{t}</div>
              <div style={{width:20,height:1,background:C+"0.25)"}}/>
            </div>
          ))}
        </div>
      </ScrollBlock>

      {/* 07 — CTA (0.88 → 1.00) */}
      <ScrollBlock scrollT={scrollT} inStart={0.86} inEnd={0.91} outStart={1.1} outEnd={1.2}
        style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
          zIndex:10,pointerEvents:"none",textAlign:"center",width:"min(600px,82vw)"}}>
        <div style={mono({fontSize:7,letterSpacing:"0.30em",color:C+"0.25)",textTransform:"uppercase",marginBottom:20})}>
          07 — Begin
        </div>
        <div style={serif({fontSize:"clamp(28px,5.5vw,72px)",fontStyle:"italic",fontWeight:400,
          color:C+"0.85)",lineHeight:1.0,letterSpacing:"-0.01em",marginBottom:16,
          textShadow:`0 0 80px ${C+"0.15)"}`,})}>
          Ready to build<br/>something permanent?
        </div>
        <div style={mono({fontSize:9,letterSpacing:"0.12em",color:C+"0.40)",lineHeight:1.9,marginBottom:32})}>
          We take on a small number of engagements each quarter.<br/>
          If you are building something that matters, let's talk.
        </div>
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:24}}>
          <div style={{padding:"12px 36px",border:`1px solid ${C+"0.35)"}`,
            ...mono({fontSize:9,letterSpacing:"0.30em",color:C+"0.70)",textTransform:"uppercase"})}}>
            hello@domani.studio
          </div>
          <div style={mono({fontSize:8,letterSpacing:"0.20em",color:C+"0.28)",textTransform:"uppercase"})}>
            @domanimedia
          </div>
        </div>
      </ScrollBlock>

      {/* ── PORTAL INDICATOR — appears when near end of scroll ───────────────── */}
      <div style={{
        position:"fixed",bottom:52,left:"50%",transform:"translateX(-50%)",
        zIndex:50,pointerEvents:"none",textAlign:"center",
        opacity: scrollT>0.82&&vis ? Math.min((scrollT-0.82)/0.06,1) : 0,
        transition:"opacity 0.6s ease",
      }}>
        <div style={{
          display:"flex",flexDirection:"column",alignItems:"center",gap:10,
          padding:"14px 28px",
          border:`1px solid ${C+"0.20)"}`,
          background:"rgba(0,0,0,0.6)",
          backdropFilter:"blur(8px)",
          boxShadow:`0 0 40px ${C+"0.06)"}, inset 0 0 20px ${C+"0.02)"}`,
        }}>
          {/* Pulsing portal icon */}
          <div style={{position:"relative",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{
              position:"absolute",width:32,height:32,borderRadius:"50%",
              border:`1px solid ${C+"0.45)"}`,
              animation:"portalRing 2s ease-in-out infinite",
              boxShadow:`0 0 12px ${C+"0.25)"}`,
            }}/>
            <div style={{
              position:"absolute",width:20,height:20,borderRadius:"50%",
              border:`1px solid ${C+"0.25)"}`,
              animation:"portalRing 2s ease-in-out 0.4s infinite",
            }}/>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#B8F0FF",
              boxShadow:`0 0 10px #B8F0FF`}}/>
          </div>
          <div style={mono({fontSize:8,letterSpacing:"0.28em",color:C+"0.65)",textTransform:"uppercase"})}>
            Click the monolith
          </div>
          <div style={mono({fontSize:7,letterSpacing:"0.18em",color:C+"0.30)",textTransform:"uppercase"})}>
            to open navigation
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scrollPulse{
          0%,100%{opacity:0.3;transform:scaleY(0.5);transform-origin:top}
          50%{opacity:1;transform:scaleY(1);transform-origin:top}
        }
        @keyframes chevronPulse{
          0%,100%{opacity:0.2;transform:rotate(45deg) translateY(-2px)}
          50%{opacity:1;transform:rotate(45deg) translateY(2px)}
        }
        @keyframes portalRing{
          0%,100%{opacity:0.4;transform:scale(1)}
          50%{opacity:1;transform:scale(1.12)}
        }
      `}</style>
    </>
  );
}