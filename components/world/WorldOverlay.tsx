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
function WorldCursor({ isMobile }: { isMobile: boolean }) {
  const ring = useRef<HTMLDivElement>(null);
  const dot  = useRef<HTMLDivElement>(null);
  const pos  = useRef({cx:0,cy:0,mx:0,my:0});
  const raf  = useRef(0);

  useEffect(()=>{
    if (isMobile) return; 
    const mv=(e:MouseEvent)=>{pos.current.mx=e.clientX;pos.current.my=e.clientY;};
    window.addEventListener("mousemove",mv);
    const tick=()=>{
      raf.current=requestAnimationFrame(tick);
      const p=pos.current;
      p.cx+=(p.mx-p.cx)*0.15; p.cy+=(p.my-p.cy)*0.15;
      if(ring.current){ring.current.style.left=p.cx+"px";ring.current.style.top=p.cy+"px";}
      if(dot.current){dot.current.style.left=p.mx+"px";dot.current.style.top=p.my+"px";}
    };
    raf.current=requestAnimationFrame(tick);
    return()=>{window.removeEventListener("mousemove",mv);cancelAnimationFrame(raf.current);};
  },[isMobile]);

  if (isMobile) return null;

  return (
    <>
      <div ref={ring} style={{position:"fixed",zIndex:999,pointerEvents:"none",transform:"translate(-50%,-50%)",width:28,height:28,border:"1px solid rgba(184,240,255,0.35)",borderRadius:"50%",transition:"width .4s,height .4s"}}/>
      <div ref={dot}  style={{position:"fixed",zIndex:1000,pointerEvents:"none",transform:"translate(-50%,-50%)",width:4,height:4,borderRadius:"50%",background:"#B8F0FF",boxShadow:"0 0 10px #B8F0FF, 0 0 20px rgba(184,240,255,0.4)"}}/>
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
      <span style={mono({fontSize:7,letterSpacing:"0.22em",color:"rgba(184,240,255,0.65)",textTransform:"uppercase"})}>
        {muted?"Muted":"Sound"}
      </span>
    </button>
  );
}

// ─── LUXURY GLASS SCROLL BLOCK (RESPONSIVE) ───────────────────────────────────
interface BlockProps {
  scrollT:  number;
  inStart:  number; 
  inEnd:    number; 
  outStart: number; 
  outEnd:   number; 
  children: React.ReactNode;
  style?:   React.CSSProperties;
  isCenter?: boolean; 
  isMobile?: boolean;
}
function ScrollBlock({scrollT,inStart,inEnd,outStart,outEnd,children,style,isCenter,isMobile}:BlockProps) {
  let opacity=0;
  if(scrollT>=inStart && scrollT<inEnd) opacity=(scrollT-inStart)/(inEnd-inStart);
  else if(scrollT>=inEnd && scrollT<outStart) opacity=1;
  else if(scrollT>=outStart && scrollT<outEnd) opacity=1-(scrollT-outStart)/(outEnd-outStart);

  const xTrans = isCenter ? "translateX(-50%) " : "";
  // Changed base translate to 30px for tighter vertical movement
  const transform = scrollT<inStart
    ? `${xTrans}translateY(30px)`
    : scrollT<inEnd
    ? `${xTrans}translateY(${30*(1-(scrollT-inStart)/(inEnd-inStart))}px)`
    : scrollT>outStart
    ? `${xTrans}translateY(${-20*((scrollT-outStart)/(outEnd-outStart))}px)`
    : `${xTrans}translateY(0)`;

  return (
    <div className="glass-scroll-block" style={{
      ...style,
      opacity,
      transform,
      transition:"none",
      willChange:"opacity,transform",
      background: "rgba(2, 4, 8, 0.40)",
      backdropFilter: "blur(24px) saturate(120%)",
      border: "1px solid rgba(184, 240, 255, 0.12)",
      padding: isMobile ? "24px 20px" : "clamp(24px, 4vh, 48px) clamp(32px, 4vw, 56px)",
      borderRadius: isMobile ? "16px" : "24px",
      boxShadow: "0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
      maxHeight: "85dvh",
      overflowY: "auto",
      pointerEvents: opacity > 0.5 ? "auto" : "none" // Prevents clicking invisible elements
    }}>
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

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export function WorldOverlay({scrollT,buildComplete}:Props) {
  const [vis,     setVis]     = useState(false);
  const [showHero,setShowHero]= useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); 
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(()=>{ const t=setTimeout(()=>setVis(true),800); return()=>clearTimeout(t); },[]);
  useEffect(()=>{ if(buildComplete) setTimeout(()=>setShowHero(true),400); },[buildComplete]);

  const heroVisible = showHero && scrollT < 0.04;
  const C = "rgba(184,240,255,";
  const fade = (d=0):React.CSSProperties=>({opacity:vis?1:0,transition:`opacity 1.6s ease ${d}s`});

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, pointerEvents: "none", cursor: isMobile ? "auto" : "none" }}>
      <WorldCursor isMobile={isMobile} />
      <ScanLine vis={vis} />

      <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:1,
        background:"radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
        opacity:vis?1:0,transition:"opacity 2s ease"}}/>

      {/* ── PERSISTENT TOP BAR ───────────────────────────────────────────────── */}
      <div style={{position:"absolute",top:0,left:0,right:0,display:"flex",justifyContent:"space-between",
        padding: isMobile ? "24px 24px 0" : "clamp(16px, 3vh, 32px) clamp(24px, 4vw, 48px) 0",zIndex:50,pointerEvents:"none",...fade(0)}}>
        <div>
          <div style={mono({fontSize:11,fontWeight:600,letterSpacing:"0.6em",color:C+"0.85)",textTransform:"uppercase"})}>
            DOMANI
          </div>
          <div style={{marginTop:8,width:40,height:1,background:`linear-gradient(90deg,${C+"0.6)"},transparent)`}}/>
        </div>
        
        {!isMobile && (
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
            <div style={mono({fontSize:8,letterSpacing:"0.22em",color:C+"0.45)",textTransform:"uppercase"})}>
              DEPTH_V / {Math.round(scrollT*100).toString().padStart(3,"0")}
            </div>
            <div style={{width:100,height:1,background:C+"0.1)"}}>
              <div style={{height:1,width:`${scrollT*100}%`,background:"#B8F0FF",boxShadow:`0 0 8px ${C+"0.8)"}`}}/>
            </div>
          </div>
        )}
      </div>

      {/* ── LEFT EDGE ─────────────────────────────────────────────────────────── */}
      {!isMobile && (
        <div style={{position:"absolute",left:24,top:"50%",transform:"translateY(-50%)",zIndex:50,...fade(0.3)}}>
          <div style={{writingMode:"vertical-rl",transform:"rotate(180deg)",
            ...mono({fontSize:7,letterSpacing:"0.35em",color:C+"0.25)",textTransform:"uppercase"})}}>
            The Great Architect of Tomorrow
          </div>
        </div>
      )}

      {/* ── BOTTOM RIGHT — audio + scroll hint ───────────────────────────────── */}
      <div style={{position:"absolute",bottom: isMobile ? 24 : "clamp(16px, 3vh, 32px)",right: isMobile ? 24 : "clamp(24px, 4vw, 48px)",zIndex:50,pointerEvents:"all",
        display:"flex",flexDirection:"column",alignItems:"flex-end",gap:20,...fade(0.5)}}>
        <AudioToggle />
        <div style={{
          opacity:scrollT<0.03&&vis?1:0,transition:"opacity 0.8s",pointerEvents:"none",
          display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8,
        }}>
          <div style={mono({fontSize:8,letterSpacing:"0.30em",color:C+"0.60)",textTransform:"uppercase",textShadow:`0 0 20px ${C+"0.25)"}`})}>
            Scroll to explore
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            {[0,1,2].map(i=>(
              <div key={i} style={{ width:10,height:6,borderRight:`1px solid ${C+"0.55)"}`,borderBottom:`1px solid ${C+"0.55)"}`,transform:"rotate(45deg)",animation:`chevronPulse 1.6s ease-in-out ${i*0.18}s infinite`}}/>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM LEFT — persistent tagline ─────────────────────────────────── */}
      {!isMobile && (
        <div style={{position:"absolute",bottom:"clamp(16px, 3vh, 32px)",left:"clamp(24px, 4vw, 48px)",zIndex:50,...fade(0.6)}}>
          <div style={serif({fontSize:"clamp(10px,1.2vw,14px)",fontStyle:"italic",color:C+"0.35)",letterSpacing:"0.04em",lineHeight:1.7,maxWidth:300})}>
            Precise. Inevitable. Earned.
          </div>
        </div>
      )}

      {/* ── HERO — WE ARE TOMORROW ─────────────────────────────────────────── */}
      <div style={{
        position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
        zIndex:5,textAlign:"center",opacity:heroVisible?1:0,transition:"opacity 1.2s ease", width: "100%"
      }}>
        <div style={serif({
          fontSize:"clamp(48px,14vw,220px)", fontStyle:"italic",fontWeight:400,
          color:C+"0.03)", letterSpacing:"-0.03em",lineHeight:0.9, whiteSpace:"nowrap",
          textShadow:`0 0 80px ${C+"0.08)"}`,
        })}>
          We Are Tomorrow
        </div>
        <div style={{marginTop:"-0.55em",position:"relative"}}>
          <div style={serif({
            fontSize:"clamp(16px,2.2vw,28px)", fontStyle:"italic",fontWeight:400,
            color:"#FFFFFF", letterSpacing:"0.08em",lineHeight:1,
            textShadow: "0 10px 40px rgba(0,0,0,0.9), 0 2px 10px rgba(0,0,0,0.8), 0 0 30px rgba(184,240,255,0.3)" 
          })}>
            <WordReveal text="We Are Tomorrow" show={showHero} delay={0.3}/>
          </div>
        </div>
        <div style={{margin:"24px auto 0",width:60,height:1,background:`linear-gradient(90deg,transparent,${C+"0.80)"},transparent)`,opacity:showHero?1:0,transition:"opacity 1.2s ease 0.8s", boxShadow: `0 0 10px ${C+"0.5)"}`}}/>
        <div style={{marginTop:16,opacity:showHero?1:0,transition:"opacity 1.2s ease 1s",
          ...mono({fontSize: isMobile?8:9,letterSpacing:"0.4em",color:C+"0.70)",textTransform:"uppercase", fontWeight:600})}}>
          DOM·ANI · MMXXVI
        </div>
      </div>

      {/* ── SCROLL-DRIVEN CONTENT BLOCKS ──────────────────────────────────── */}
      
      {/* 01 — WHAT IS DOMANI */}
      <ScrollBlock scrollT={scrollT} inStart={0.05} inEnd={0.10} outStart={0.16} outEnd={0.20} isCenter={true} isMobile={isMobile}
        style={{position:"absolute",top:"44%",left:"50%",textAlign:"center",width: isMobile ? "90vw" : "min(700px,85vw)"}}>
        <div style={mono({fontSize:8,letterSpacing:"0.4em",color:C+"0.5)",textTransform:"uppercase",marginBottom:"clamp(12px, 2vh, 20px)", fontWeight:600})}>
          01 — Studio
        </div>
        <div style={serif({fontSize:"clamp(24px,5vw,60px)",fontStyle:"italic",color:"#FFFFFF",lineHeight:1.1,letterSpacing:"-0.02em"})}>
          Design and technology<br/>for the systems age.
        </div>
        <div style={{margin:"24px auto",width:60,height:1,background:`linear-gradient(90deg,transparent,${C+"0.6)"},transparent)`}}/>
        <div style={mono({fontSize: isMobile?9:10,letterSpacing:"0.12em",color:C+"0.75)",lineHeight:1.8,maxWidth:480,margin:"0 auto"})}>
          Domani builds brands, products, and AI systems<br/>for organisations that intend to be permanent.
        </div>
      </ScrollBlock>

      {/* 02 — PHILOSOPHY */}
      <ScrollBlock scrollT={scrollT} inStart={0.17} inEnd={0.22} outStart={0.28} outEnd={0.32} isCenter={isMobile} isMobile={isMobile}
        style={{position:"absolute",top:"48%",left: isMobile ? "50%" : "clamp(40px, 6vw, 80px)",maxWidth: isMobile ? "90vw" : 560, textAlign: isMobile ? "center" : "left"}}>
        <div style={mono({fontSize:8,letterSpacing:"0.35em",color:C+"0.5)",textTransform:"uppercase",marginBottom:"clamp(12px, 2vh, 20px)", fontWeight:600})}>
          02 — Philosophy
        </div>
        <div style={serif({fontSize:"clamp(24px,4vw,50px)",fontStyle:"italic",color:"#FFFFFF",lineHeight:1.1})}>
          Companies should behave like systems.
        </div>
        <div style={{marginTop: "clamp(16px, 3vh, 32px)", display: "flex", flexDirection: "column", alignItems: isMobile ? "center" : "flex-start"}}>
          {["Not collections of people. Not collections of tasks.", "Systems with intent. With logic. With inevitability.", "We build the architecture that makes that possible."].map((line,i)=>(
            <div key={i} style={{display:"flex",flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "center" : "flex-start",gap: isMobile ? 6 : 16,marginBottom:"clamp(8px, 1.5vh, 16px)"}}>
              <div style={{width:20,height:1,background:C+"0.60)",flexShrink:0,marginTop: isMobile ? 0 : 10}}/>
              <div style={mono({fontSize: isMobile?9:10,letterSpacing:"0.12em",color:C+"0.75)",lineHeight:1.6})}>{line}</div>
            </div>
          ))}
        </div>
      </ScrollBlock>

      {/* 03 — SERVICES */}
      <ScrollBlock scrollT={scrollT} inStart={0.30} inEnd={0.35} outStart={0.42} outEnd={0.46} isCenter={isMobile} isMobile={isMobile}
        style={{position:"absolute",top:"48%",right: isMobile ? "auto" : "clamp(40px, 6vw, 80px)", left: isMobile ? "50%" : "auto", maxWidth: isMobile ? "90vw" : 520, textAlign: isMobile ? "center" : "right"}}>
        <div style={mono({fontSize:8,letterSpacing:"0.35em",color:C+"0.5)",textTransform:"uppercase",marginBottom:"clamp(12px, 2vh, 20px)", fontWeight:600})}>
          03 — Services
        </div>
        <div style={serif({fontSize:"clamp(24px,3.5vw,44px)",fontStyle:"italic",color:"#FFFFFF",lineHeight:1.1,marginBottom:"clamp(16px, 3vh, 32px)"})}>
          Four disciplines.<br/>One system.
        </div>
        {[
          {n:"01",t:"Brand Identity",d:"Marks, systems, and voice that compound."},
          {n:"02",t:"Product Engineering",d:"Full-stack builds from architecture to deployment."},
          {n:"03",t:"AI Systems",d:"Intelligent infrastructure that learns and scales."},
          {n:"04",t:"Strategic Infrastructure",d:"The operating system behind your organisation."},
        ].map(({n,t,d})=>(
          <div key={n} style={{display:"flex",flexDirection:"column",alignItems: isMobile ? "center" : "flex-end",marginBottom:"clamp(8px, 1.5vh, 16px)",paddingBottom:"clamp(8px, 1.5vh, 16px)",borderBottom:`1px solid ${C+"0.1)"}`}}>
            <div style={{display:"flex",alignItems:"baseline",gap:12}}>
              <div style={mono({fontSize:8,letterSpacing:"0.2em",color:C+"0.4)", fontWeight:600})}>{n}</div>
              <div style={mono({fontSize: isMobile?11:12,letterSpacing:"0.12em",color:"#FFFFFF",fontWeight:400})}>{t}</div>
            </div>
            <div style={mono({fontSize: isMobile?8:9,letterSpacing:"0.1em",color:C+"0.6)",lineHeight:1.6,marginTop:4})}>{d}</div>
          </div>
        ))}
      </ScrollBlock>

      {/* 04 — VENTURES / PRODUCTS */}
      <ScrollBlock scrollT={scrollT} inStart={0.44} inEnd={0.49} outStart={0.56} outEnd={0.60} isCenter={true} isMobile={isMobile}
        style={{position:"absolute",top:"44%",left:"50%",textAlign:"center",width: isMobile ? "90vw" : "min(850px,85vw)"}}>
        <div style={mono({fontSize:8,letterSpacing:"0.35em",color:C+"0.5)",textTransform:"uppercase",marginBottom:"clamp(12px, 2vh, 20px)", fontWeight:600})}>
          04 — In-house Ventures
        </div>
        <div style={serif({fontSize:"clamp(24px,3.5vw,50px)",fontStyle:"italic",color:"#FFFFFF",lineHeight:1.1,marginBottom:"clamp(16px, 3vh, 32px)"})}>
          We don't just build for clients.<br/>We build for tomorrow.
        </div>
        <div style={{display:"grid",gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)",gap:"clamp(12px, 2vw, 24px)"}}>
          {[
            {name:"SyntriAI",tag:"Spatial Intelligence",desc:"Moving beyond static data processing to interact with the physical world."},
            {name:"YDBI",tag:"AI Butler",desc:"Your personal intelligence layer. Ambient, voice-first, context-aware."},
            {name:"Veyra",tag:"Fashion Intelligence",desc:"AI-powered wardrobe and styling for the woman who knows who she is."},
          ].map(({name,tag,desc})=>(
            <div key={name} style={{padding:"clamp(16px, 2vh, 24px)",background:"rgba(0,0,0,0.4)",border:`1px solid ${C+"0.1)"}`,borderRadius:"12px",textAlign: isMobile ? "center" : "left"}}>
              <div style={mono({fontSize:7,letterSpacing:"0.2em",color:C+"0.4)",textTransform:"uppercase",marginBottom:8})}>{tag}</div>
              <div style={mono({fontSize:12,letterSpacing:"0.1em",color:"#FFFFFF",marginBottom:10,fontWeight:600})}>{name}</div>
              <div style={mono({fontSize: isMobile?8:9,letterSpacing:"0.08em",color:C+"0.6)",lineHeight:1.6})}>{desc}</div>
            </div>
          ))}
        </div>
      </ScrollBlock>

      {/* 05 — METHOD */}
      <ScrollBlock scrollT={scrollT} inStart={0.58} inEnd={0.63} outStart={0.70} outEnd={0.74} isCenter={isMobile} isMobile={isMobile}
        style={{position:"absolute",top:"48%",left: isMobile ? "50%" : "clamp(40px, 6vw, 80px)",maxWidth: isMobile ? "90vw" : 520, textAlign: isMobile ? "center" : "left"}}>
        <div style={mono({fontSize:8,letterSpacing:"0.35em",color:C+"0.5)",textTransform:"uppercase",marginBottom:"clamp(12px, 2vh, 20px)", fontWeight:600})}>
          05 — Method
        </div>
        <div style={serif({fontSize:"clamp(24px,3.5vw,44px)",fontStyle:"italic",color:"#FFFFFF",lineHeight:1.1,marginBottom:"clamp(16px, 3vh, 32px)"})}>
          Precise. Inevitable.<br/>Earned.
        </div>
        <div style={{display: "flex", flexDirection: "column", alignItems: isMobile ? "center" : "flex-start"}}>
          {[
            {step:"Diagnose",text:"We start with the system, not the symptom."},
            {step:"Architect",text:"Every deliverable designed to compound."},
            {step:"Build",text:"Production-grade execution. No prototypes."},
            {step:"Evolve",text:"We stay. Infrastructure doesn't end at launch."},
          ].map(({step,text},i)=>(
            <div key={step} style={{display:"flex",flexDirection: isMobile ? "column" : "row", gap: isMobile ? 6 : 16, marginBottom:"clamp(12px, 2vh, 20px)"}}>
              <div style={mono({fontSize:9,letterSpacing:"0.1em",color:C+"0.4)",flexShrink:0,paddingTop:2})}>
                {String(i+1).padStart(2,"0")}
              </div>
              <div>
                <div style={mono({fontSize:11,letterSpacing:"0.14em",color:"#FFFFFF",marginBottom:4, fontWeight:600})}>{step}</div>
                <div style={mono({fontSize: isMobile?8:9,letterSpacing:"0.08em",color:C+"0.65)",lineHeight:1.6})}>{text}</div>
              </div>
            </div>
          ))}
        </div>
      </ScrollBlock>

      {/* 06 — POSITIONING */}
      <ScrollBlock scrollT={scrollT} inStart={0.72} inEnd={0.77} outStart={0.84} outEnd={0.88} isCenter={isMobile} isMobile={isMobile}
        style={{position:"absolute",top:"48%",right: isMobile ? "auto" : "clamp(40px, 6vw, 80px)", left: isMobile ? "50%" : "auto", maxWidth: isMobile ? "90vw" : 500, textAlign: isMobile ? "center" : "right"}}>
        <div style={mono({fontSize:8,letterSpacing:"0.35em",color:C+"0.5)",textTransform:"uppercase",marginBottom:"clamp(12px, 2vh, 20px)", fontWeight:600})}>
          06 — The Standard
        </div>
        <div style={serif({fontSize:"clamp(24px,4vw,50px)",fontStyle:"italic",color:"#FFFFFF",lineHeight:1.05,marginBottom:"clamp(16px, 3vh, 28px)"})}>
          World's most precise<br/>design studio.
        </div>
        <div style={mono({fontSize: isMobile?9:10,letterSpacing:"0.12em",color:C+"0.7)",lineHeight:1.8})}>
          We work with founders, operators, and institutions<br/>
          who understand that design is not decoration —<br/>
          it is infrastructure.
        </div>
        <div style={{marginTop:"clamp(16px, 3vh, 32px)",display:"flex",flexDirection:"column",alignItems: isMobile ? "center" : "flex-end",gap:12}}>
          {["Worldwide delivery","Remote headquarters","Systems-first thinking"].map(t=>(
            <div key={t} style={{display:"flex",flexDirection: isMobile ? "column" : "row", alignItems:"center",gap:12}}>
              <div style={mono({fontSize:8,letterSpacing:"0.15em",color:C+"0.5)"})}>{t}</div>
              <div style={{width:24,height:1,background:C+"0.3)"}}/>
            </div>
          ))}
        </div>
      </ScrollBlock>

      {/* 07 — CTA (Now with functional links) */}
      <ScrollBlock scrollT={scrollT} inStart={0.86} inEnd={0.91} outStart={1.1} outEnd={1.2} isCenter={true} isMobile={isMobile}
        style={{position:"absolute",top:"44%",left:"50%",textAlign:"center",width: isMobile ? "90vw" : "min(650px,85vw)"}}>
        <div style={mono({fontSize:8,letterSpacing:"0.35em",color:C+"0.5)",textTransform:"uppercase",marginBottom:"clamp(12px, 2vh, 20px)", fontWeight:600})}>
          07 — Begin
        </div>
        <div style={serif({fontSize:"clamp(24px,4.5vw,64px)",fontStyle:"italic",color:"#FFFFFF",lineHeight:1.0,letterSpacing:"-0.01em",marginBottom:"clamp(12px, 2vh, 20px)", textShadow:`0 0 60px ${C+"0.3)"}`,})}>
          Ready to build<br/>something permanent?
        </div>
        <div style={mono({fontSize: isMobile?9:10,letterSpacing:"0.14em",color:C+"0.7)",lineHeight:1.8,marginBottom:"clamp(12px, 2vh, 20px)"})}>
          We take on a small number of engagements each quarter.<br/>
          If you are building something that matters, let's talk.
        </div>
        <div style={{display:"flex", flexDirection: isMobile ? "column" : "row", justifyContent:"center",alignItems:"center",gap:"clamp(12px, 2vw, 24px)"}}>
          <a 
            href="mailto:info@domanimedia.com" 
            style={{
              padding:"12px 28px",background:"rgba(184,240,255,0.1)",border:`1px solid ${C+"0.4)"}`,borderRadius:"100px",
              ...mono({fontSize:9,letterSpacing:"0.30em",color:"#FFFFFF",textTransform:"uppercase",fontWeight:600}),
              textDecoration:"none", cursor: isMobile ? "pointer" : "none",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = "rgba(184,240,255,0.2)"; e.currentTarget.style.borderColor = C+"0.8)"; }}
            onMouseOut={(e) => { e.currentTarget.style.background = "rgba(184,240,255,0.1)"; e.currentTarget.style.borderColor = C+"0.4)"; }}
          >
            info@domanimedia.com
          </a>
          <a 
            href="https://instagram.com/domanimedia" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              ...mono({fontSize:8,letterSpacing:"0.25em",color:C+"0.5)",textTransform:"uppercase"}),
              textDecoration:"none", cursor: isMobile ? "pointer" : "none",
              padding: "10px", transition: "color 0.3s ease"
            }}
            onMouseOver={(e) => { e.currentTarget.style.color = "#FFFFFF"; }}
            onMouseOut={(e) => { e.currentTarget.style.color = C+"0.5)"; }}
          >
            @domanimedia
          </a>
        </div>
      </ScrollBlock>

      {/* ── PORTAL INDICATOR ─────────────────────────────────────────────────── */}
      <div style={{
        position:"absolute",bottom: isMobile ? 24 : "clamp(16px, 4vh, 32px)",left:"50%",transform:"translateX(-50%)",
        textAlign:"center", opacity: scrollT>0.82&&vis ? Math.min((scrollT-0.82)/0.06,1) : 0,
        transition:"opacity 0.6s ease", pointerEvents:"none"
      }}>
        <div style={{
          display:"flex",flexDirection:"column",alignItems:"center",gap:8,
          padding: isMobile ? "12px 20px" : "16px 32px", borderRadius:"24px",
          border:`1px solid ${C+"0.20)"}`, background:"rgba(2,4,8,0.7)",
          backdropFilter:"blur(16px) saturate(120%)", boxShadow:`0 30px 60px rgba(0,0,0,0.6), inset 0 0 20px ${C+"0.08)"}`,
        }}>
          <div style={{position:"relative",width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{position:"absolute",width:32,height:32,borderRadius:"50%",border:`1px solid ${C+"0.6)"}`,animation:"portalRing 2s ease-in-out infinite",boxShadow:`0 0 16px ${C+"0.4)"}`}}/>
            <div style={{position:"absolute",width:20,height:20,borderRadius:"50%",border:`1px solid ${C+"0.3)"}`,animation:"portalRing 2s ease-in-out 0.4s infinite"}}/>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#B8F0FF",boxShadow:`0 0 12px #B8F0FF`}}/>
          </div>
          <div style={mono({fontSize:8,letterSpacing:"0.3em",color:"#FFFFFF",textTransform:"uppercase", marginTop:"6px", fontWeight:600})}>
            Click the monolith
          </div>
          <div style={mono({fontSize:7,letterSpacing:"0.2em",color:C+"0.5)",textTransform:"uppercase"})}>
            to open navigation
          </div>
        </div>
      </div>

      <style>{`
        .glass-scroll-block::-webkit-scrollbar { display: none; }
        .glass-scroll-block { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes scrollPulse{ 0%,100%{opacity:0.3;transform:scaleY(0.5);transform-origin:top} 50%{opacity:1;transform:scaleY(1);transform-origin:top} }
        @keyframes chevronPulse{ 0%,100%{opacity:0.2;transform:rotate(45deg) translateY(-2px)} 50%{opacity:1;transform:rotate(45deg) translateY(2px)} }
        @keyframes portalRing{ 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:1;transform:scale(1.12)} }
      `}</style>
    </div>
  );
}