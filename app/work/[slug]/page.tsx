"use client";
import { useState, useEffect, useRef, use } from "react";
import gsap from "gsap";
import { usePageEntry }    from "@/lib/transitions/usePageEntry";
import { useTransition }   from "@/lib/transitions/TransitionContext";
import { getProject, getNextProject } from "@/lib/data/projects";
import { TransitionLink } from "@/components/ui/TransitionLink";

// ─── PROJECT MUSIC HOOK ───────────────────────────────────────────────────────
function useProjectMusic(src: string | undefined) {
  useEffect(() => {
    if (!src) return;
    const track = new Audio(src);
    track.loop = true;
    track.volume = 0;
    (window as any).__projectTrack = track;

    track.play().catch(() => {
      const resume = () => { track.play().catch(() => {}); window.removeEventListener("click", resume); };
      window.addEventListener("click", resume, { once: true });
    });

    // Fade in — 1.5s
    let vol = 0;
    const target = 0.52;
    const fi = setInterval(() => {
      vol = Math.min(vol + target/90, target);
      track.volume = vol;
      if (vol >= target) clearInterval(fi);
    }, 16);

    return () => {
      clearInterval(fi);
      // Fade out — 0.8s
      let v = track.volume;
      const fo = setInterval(() => {
        v = Math.max(0, v - 0.52/48);
        track.volume = v;
        if (v <= 0) { track.pause(); clearInterval(fo); (window as any).__projectTrack = null; }
      }, 16);
    };
  }, [src]);
}

// ─── SOUND ────────────────────────────────────────────────────────────────────
const S = (() => {
  let ctx: AudioContext | null = null;
  const C = () => ctx || (ctx = new ((window as any).AudioContext || (window as any).webkitAudioContext)());
  return {
    tick(f=1){try{const c=C(),b=c.createBuffer(1,~~(c.sampleRate*.03),c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.exp(-i/(c.sampleRate*.005))*.16;const s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();fl.type="bandpass";fl.frequency.value=2800*f;fl.Q.value=3;g.gain.value=.38;s.buffer=b;s.connect(fl);fl.connect(g);g.connect(c.destination);s.start();}catch{}},
    pop(){try{const c=C(),o=c.createOscillator(),g=c.createGain();o.type="sine";o.frequency.setValueAtTime(180,c.currentTime);o.frequency.exponentialRampToValueAtTime(55,c.currentTime+.12);g.gain.setValueAtTime(.2,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+.16);o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.18);}catch{}},
  };
})();

// ─── CURSOR ───────────────────────────────────────────────────────────────────
function Cursor({ hov }: { hov: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const p   = useRef({ cx:0, cy:0, mx:0, my:0 });
  const raf = useRef(0);
  useEffect(() => {
    const mv = (e: MouseEvent) => { p.current.mx = e.clientX; p.current.my = e.clientY; };
    window.addEventListener("mousemove", mv);
    const t = () => { raf.current = requestAnimationFrame(t); const s=p.current; s.cx+=(s.mx-s.cx)*.1;s.cy+=(s.my-s.cy)*.1; if(ref.current){ref.current.style.left=s.cx+"px";ref.current.style.top=s.cy+"px";}};
    raf.current = requestAnimationFrame(t);
    return () => { window.removeEventListener("mousemove", mv); cancelAnimationFrame(raf.current); };
  }, []);
  return (
    <div ref={ref} style={{
      position:"fixed", zIndex:9989, pointerEvents:"none",
      transform:"translate(-50%,-50%)",
      width:hov?60:16, height:hov?60:16,
      border:`1.5px solid ${hov?"rgba(0,0,0,0.7)":"rgba(0,0,0,0.4)"}`,
      borderRadius:hov?"4px":"50%",
      transition:"width .36s cubic-bezier(.16,1,.3,1),height .36s,border-radius .3s,border-color .2s",
      display:"flex",alignItems:"center",justifyContent:"center",
    }}>
      {hov&&<span style={{fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:".14em",color:"rgba(0,0,0,.55)",textTransform:"uppercase"}}>View</span>}
    </div>
  );
}

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────────
function Counter({ value, label, color }: { value: string; label: string; color: string }) {
  const ref    = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setShow(true); }, { threshold:.5 });
    obs.observe(ref.current); return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ textAlign:"center", padding:"40px 20px" }}>
      <div style={{
        fontFamily:"'Bodoni Moda',Georgia,serif", fontStyle:"italic", fontWeight:400,
        fontSize:"clamp(40px,5.5vw,72px)", color: show ? color : "rgba(0,0,0,.10)",
        lineHeight:1, letterSpacing:"-.02em",
        transition:"color 1.0s ease",
        textShadow: show ? `0 0 60px ${color}40` : "none",
      }}>{value}</div>
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, letterSpacing:".25em",
        color:"rgba(0,0,0,.30)", textTransform:"uppercase", marginTop:12 }}>{label}</div>
    </div>
  );
}

// ─── IMAGE BLOCK ─────────────────────────────────────────────────────────────
function ImageBlock({ src, caption, span, color }: { src:string; caption?:string; span?:"full"|"half"; color:string }) {
  const ref  = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setOn(true);
        if (ref.current) gsap.fromTo(ref.current, { clipPath:"inset(100% 0 0 0)" }, { clipPath:"inset(0% 0 0 0)", duration:1.1, ease:"power3.inOut" });
      }
    }, { threshold:.22 });
    obs.observe(ref.current); return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ position:"relative", overflow:"hidden",
      clipPath:"inset(100% 0 0 0)" }}>
      <img src={src} alt={caption||""} style={{
        width:"100%", display:"block", objectFit:"cover",
        height: span==="full" ? "65vh" : "50vh",
        filter:"brightness(0.96) saturate(0.95)",
        transition:"transform .6s ease",
      }}
        onMouseEnter={e => (e.currentTarget.style.transform="scale(1.025)")}
        onMouseLeave={e => (e.currentTarget.style.transform="scale(1)")}
      />
      {/* Accent border bottom */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2,
        background:color, boxShadow:`0 0 20px ${color}80`, opacity:on?.9:0,
        transition:"opacity .8s ease .6s" }}/>
      {caption && (
        <div style={{ position:"absolute", bottom:16, left:20,
          fontFamily:"'DM Mono',monospace", fontSize:7, letterSpacing:".18em",
          color:"rgba(255,255,255,.65)", textTransform:"uppercase",
          background:"rgba(0,0,0,.45)", padding:"4px 10px", backdropFilter:"blur(4px)" }}>
          {caption}
        </div>
      )}
    </div>
  );
}

// ─── SCROLL PROGRESS ─────────────────────────────────────────────────────────
function ScrollProgress({ color }: { color: string }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const fn = () => {
      const h = document.documentElement;
      setPct(h.scrollTop / (h.scrollHeight - h.clientHeight));
    };
    window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <div style={{ position:"fixed", left:0, top:0, bottom:0, width:2, zIndex:300, pointerEvents:"none" }}>
      <div style={{ height:`${pct*100}%`, background:color,
        boxShadow:`0 0 12px ${color}`, transition:"height .08s linear" }}/>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { navigate } = useTransition();
  const pageRef      = usePageEntry({ delay:.05 });

  const p    = getProject(slug);
  const next = getNextProject(slug);
  const [hov, setHov] = useState(false);

  // ── Play project music if defined ──
  useProjectMusic(p?.music);

  useEffect(() => {
    document.body.style.overflowY = "auto";
    document.body.style.background = "#EDE9E2";
    const t = setTimeout(() => {
      const h = document.querySelector<HTMLElement>(".cs-title");
      if (h) gsap.fromTo(h, { y:40, opacity:0 }, { y:0, opacity:1, duration:1, ease:"power3.out", delay:.1 });
      const sub = document.querySelectorAll("[data-entry]");
      gsap.fromTo(sub, { y:20, opacity:0 }, { y:0, opacity:1, duration:.75, stagger:.07, ease:"power2.out", delay:.25 });
    }, 50);
    return () => { clearTimeout(t); document.body.style.overflowY=""; document.body.style.background=""; };
  }, [slug]);

  if (!p) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh",
      fontFamily:"'DM Mono',monospace", fontSize:10, color:"rgba(0,0,0,.4)" }}>
      Project not found.{" "}
      <button onClick={() => navigate("/work","ink")}
        style={{marginLeft:12,color:"#000",background:"none",border:"none",cursor:"none",textDecoration:"underline",fontFamily:"'DM Mono',monospace",fontSize:10}}>
        ← Work
      </button>
    </div>
  );

  return (
    <div ref={pageRef} style={{ background:"#EDE9E2", minHeight:"100vh" }}>
      <Cursor hov={hov}/>
      <ScrollProgress color={p.color}/>

      {/* ── CASE STUDY SUB-HEADER — back, breadcrumb, close, next ── */}
      <header style={{
        position:"fixed", top:60, left:0, right:0, zIndex:190,
        background:"rgba(237,233,226,.95)", backdropFilter:"blur(18px)",
        borderBottom:"1px solid rgba(0,0,0,.06)",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        padding:"0 64px", height:44,
      }}>
        {/* Back + breadcrumb */}
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <button onClick={() => { S.tick(); navigate("/work", "ink"); }}
            style={{ background:"none", border:"none", cursor:"none",
              fontFamily:"'DM Mono',monospace", fontSize:8, letterSpacing:".18em",
              color:"rgba(0,0,0,.40)", textTransform:"uppercase", padding:"0 10px 0 0",
              borderRight:"1px solid rgba(0,0,0,.10)", display:"flex", alignItems:"center", gap:8 }}
            onMouseEnter={e=>(e.currentTarget.style.color="rgba(0,0,0,.72)")}
            onMouseLeave={e=>(e.currentTarget.style.color="rgba(0,0,0,.40)")}>
            ← Back
          </button>
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:8, letterSpacing:".15em", color:"rgba(0,0,0,.28)", padding:"0 8px" }}>Work</span>
          <span style={{ color:"rgba(0,0,0,.18)" }}>/</span>
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:8, letterSpacing:".14em", color:p.color, padding:"0 8px" }}>{p.title}</span>
        </div>

        {/* Right: index + close list + next */}
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:7, letterSpacing:".20em", color:"rgba(0,0,0,.24)", textTransform:"uppercase" }}>
            {p.index} / 010
          </span>
          <button onClick={() => { S.tick(); navigate("/work", "ink"); }}
            style={{ background:"rgba(0,0,0,.05)", border:"1px solid rgba(0,0,0,.12)",
              padding:"4px 14px", cursor:"none",
              fontFamily:"'DM Mono',monospace", fontSize:7, letterSpacing:".18em",
              color:"rgba(0,0,0,.40)", textTransform:"uppercase",
              transition:"border-color .2s,color .2s,background .2s" }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(0,0,0,.08)";e.currentTarget.style.color="rgba(0,0,0,.72)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(0,0,0,.05)";e.currentTarget.style.color="rgba(0,0,0,.40)";}}>
            ✕ Close
          </button>
          {next && (
            <button onClick={() => { S.pop(); navigate(`/work/${next.id}`, "ink"); }}
              style={{ background:"none", border:`1px solid ${p.color}40`,
                padding:"4px 14px", cursor:"none",
                fontFamily:"'DM Mono',monospace", fontSize:7, letterSpacing:".18em",
                color:p.color, textTransform:"uppercase",
                transition:"border-color .2s,background .2s" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=p.color;e.currentTarget.style.background=`${p.color}10`;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=`${p.color}40`;e.currentTarget.style.background="none";}}>
              Next →
            </button>
          )}
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 01 — HERO */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section style={{ height:"100vh", position:"relative", overflow:"hidden", paddingTop:104 }}>
        <img src={p.cover} alt={p.title} style={{
          position:"absolute", inset:0, width:"100%", height:"100%",
          objectFit:"cover", filter:"brightness(.40) saturate(.9)",
        }}/>
        <div style={{ position:"absolute", inset:0,
          background:"linear-gradient(to bottom,rgba(0,0,0,.3) 0%,rgba(0,0,0,.02) 45%,rgba(0,0,0,.02) 65%,rgba(0,0,0,.80) 100%)" }}/>

        {/* Accent line */}
        <div style={{ position:"absolute", left:64, top:"50%", transform:"translateY(-50%)",
          width:2, height:"35%", background:p.color,
          boxShadow:`0 0 30px ${p.color}`, opacity:.7 }}/>

        <div style={{ position:"absolute", bottom:80, left:80, right:80 }}>
          <div data-entry style={{ fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:".30em",
            color:"rgba(255,255,255,.40)", textTransform:"uppercase", marginBottom:24,
            display:"flex", gap:20 }}>
            <span>{p.index}</span>
            <span>·</span>
            <span>{p.category}</span>
            <span>·</span>
            <span>{p.client}</span>
            <span>·</span>
            <span>{p.year}</span>
          </div>
          <h1 className="cs-title" style={{
            fontFamily:"'Bodoni Moda',Georgia,serif", fontStyle:"italic", fontWeight:400,
            fontSize:"clamp(64px,9.5vw,130px)", color:"#fff",
            lineHeight:.88, letterSpacing:"-.03em", margin:"0 0 32px",
            textShadow:`0 0 120px ${p.color}40`,
          }}>{p.title}</h1>
          <p data-entry style={{ fontFamily:"'DM Mono',monospace", fontSize:11,
            letterSpacing:".07em", color:"rgba(255,255,255,.55)", lineHeight:1.85,
            maxWidth:600, margin:0 }}>{p.tagline}</p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 02 — INTRO + METRICS */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section style={{ padding:"120px 80px", maxWidth:1200, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:80, alignItems:"start" }}>
          <div>
            <div data-entry style={{ fontFamily:"'DM Mono',monospace", fontSize:7, letterSpacing:".32em",
              color:"rgba(0,0,0,.28)", textTransform:"uppercase", marginBottom:28 }}>
              02 — Overview
            </div>
            <p data-entry style={{ fontFamily:"'Bodoni Moda',Georgia,serif", fontStyle:"italic",
              fontSize:"clamp(19px,2.4vw,28px)", lineHeight:1.55, color:"rgba(0,0,0,.72)",
              margin:0 }}>
              {p.intro}
            </p>
          </div>
          <div>
            <div data-entry style={{ fontFamily:"'DM Mono',monospace", fontSize:7, letterSpacing:".32em",
              color:"rgba(0,0,0,.28)", textTransform:"uppercase", marginBottom:28 }}>
              Services delivered
            </div>
            <div data-entry style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {p.services.map(s => (
                <div key={s} style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ width:20, height:1, background:p.color, boxShadow:`0 0 8px ${p.color}80`, flexShrink:0 }}/>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:".10em", color:"rgba(0,0,0,.55)" }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Metrics grid */}
        <div data-entry style={{ marginTop:80, display:"grid",
          gridTemplateColumns:`repeat(${p.metrics.length},1fr)`,
          borderTop:"1px solid rgba(0,0,0,.08)", borderLeft:"1px solid rgba(0,0,0,.08)" }}>
          {p.metrics.map(m => (
            <div key={m.label} style={{ borderRight:"1px solid rgba(0,0,0,.08)", borderBottom:"1px solid rgba(0,0,0,.08)" }}>
              <Counter value={m.value} label={m.label} color={p.color}/>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 03 — FIRST IMAGE */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section style={{ margin:"0 80px" }}>
        <ImageBlock src={p.cover} caption={`${p.title} — Primary visual`} span="full" color={p.color}/>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 04 — CHALLENGE */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section style={{ padding:"120px 80px", maxWidth:1200, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:60 }}>
          <div>
            <div data-entry style={{ fontFamily:"'DM Mono',monospace", fontSize:7, letterSpacing:".32em",
              color:"rgba(0,0,0,.28)", textTransform:"uppercase" }}>
              03 — The Challenge
            </div>
          </div>
          <div>
            <p data-entry style={{ fontFamily:"'Bodoni Moda',Georgia,serif", fontStyle:"italic",
              fontSize:"clamp(18px,2.2vw,26px)", lineHeight:1.65, color:"rgba(0,0,0,.68)", margin:0 }}>
              {p.challenge}
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 05 — APPROACH */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section style={{ background:"rgba(0,0,0,.025)", padding:"120px 80px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto" }}>
          <div data-entry style={{ fontFamily:"'DM Mono',monospace", fontSize:7, letterSpacing:".32em",
            color:"rgba(0,0,0,.28)", textTransform:"uppercase", marginBottom:60 }}>
            04 — Our Approach
          </div>
          <div style={{ display:"grid", gap:0 }}>
            {p.approach.map((step, i) => (
              <div key={i} data-entry style={{
                display:"grid", gridTemplateColumns:"64px 1fr",
                gap:40, padding:"36px 0",
                borderTop:"1px solid rgba(0,0,0,.07)",
              }}>
                <div style={{ fontFamily:"'Bodoni Moda',Georgia,serif", fontStyle:"italic",
                  fontSize:48, color:p.color, lineHeight:1, opacity:.6 }}>
                  {String(i+1).padStart(2,"0")}
                </div>
                <p style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:".07em",
                  color:"rgba(0,0,0,.60)", lineHeight:1.88, margin:"10px 0 0" }}>
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 06 — SECOND IMAGE PAIR */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section style={{ margin:"80px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:2 }}>
        <ImageBlock src={p.thumb} caption="Process" span="half" color={p.color}/>
        <ImageBlock src={p.thumb} caption="Detail" span="half" color={p.color}/>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 07 — DELIVERABLES */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section style={{ padding:"80px 80px 120px", maxWidth:1200, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:60 }}>
          <div>
            <div data-entry style={{ fontFamily:"'DM Mono',monospace", fontSize:7, letterSpacing:".32em",
              color:"rgba(0,0,0,.28)", textTransform:"uppercase" }}>
              05 — Deliverables
            </div>
          </div>
          <div data-entry style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px 40px" }}>
            {p.deliverables.map(d => (
              <div key={d} style={{ display:"flex", alignItems:"flex-start", gap:14, padding:"10px 0",
                borderBottom:"1px solid rgba(0,0,0,.06)" }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:p.color,
                  flexShrink:0, marginTop:5, boxShadow:`0 0 6px ${p.color}` }}/>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:".09em",
                  color:"rgba(0,0,0,.55)", lineHeight:1.6 }}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* 08 — OUTCOME + THIRD IMAGE */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <section style={{ position:"relative" }}>
        <div style={{ margin:"0 80px 2px" }}>
          <ImageBlock src={p.cover} caption="Outcome" span="full" color={p.color}/>
        </div>
        <div style={{ position:"relative", padding:"100px 80px", background:"rgba(0,0,0,.03)" }}>
          {/* Large section number ghost */}
          <div style={{ position:"absolute", right:80, top:40,
            fontFamily:"'Bodoni Moda',Georgia,serif", fontStyle:"italic",
            fontSize:"clamp(100px,16vw,200px)", color:"rgba(0,0,0,.04)",
            lineHeight:1, userSelect:"none", pointerEvents:"none" }}>
            06
          </div>
          <div style={{ maxWidth:1200, margin:"0 auto" }}>
            <div data-entry style={{ fontFamily:"'DM Mono',monospace", fontSize:7, letterSpacing:".32em",
              color:"rgba(0,0,0,.28)", textTransform:"uppercase", marginBottom:40 }}>
              06 — Outcome
            </div>
            <p data-entry style={{ fontFamily:"'Bodoni Moda',Georgia,serif", fontStyle:"italic",
              fontSize:"clamp(20px,2.6vw,32px)", lineHeight:1.6, color:"rgba(0,0,0,.70)",
              maxWidth:800, margin:0 }}>
              {p.outcome}
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* NEXT PROJECT */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {next && (
        <section style={{ position:"relative", height:"55vh", overflow:"hidden", cursor:"none" }}
          onMouseEnter={() => { setHov(true); S.tick(1.1); }}
          onMouseLeave={() => setHov(false)}
          onClick={() => { S.pop(); navigate(`/work/${next.id}`, "ink"); }}>
          <img src={next.cover} alt={next.title} style={{
            position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover",
            filter:`brightness(${hov?.45:.30}) saturate(.9)`,
            transform: hov?"scale(1.04)":"scale(1)",
            transition:"filter .5s,transform .8s cubic-bezier(.16,1,.3,1)",
          }}/>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,.7),rgba(0,0,0,.1))" }}/>
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column",
            justifyContent:"center", alignItems:"center", gap:16 }}>
            <div style={{ fontFamily:"'DM Mono',monospace", fontSize:8, letterSpacing:".32em",
              color:"rgba(255,255,255,.40)", textTransform:"uppercase" }}>
              Next project — {next.index}
            </div>
            <div style={{ fontFamily:"'Bodoni Moda',Georgia,serif", fontStyle:"italic", fontWeight:400,
              fontSize:"clamp(40px,6vw,84px)", color:"#fff",
              lineHeight:.9, letterSpacing:"-.025em",
              textShadow: hov ? `0 0 80px ${next.color}55` : "none",
              transition:"text-shadow .4s" }}>
              {next.title}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginTop:8 }}>
              <div style={{ width:hov?44:18, height:1, background:hov?next.color:"rgba(255,255,255,.4)",
                transition:"width .4s,background .3s",
                boxShadow:hov?`0 0 14px ${next.color}`:"none" }}/>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:8, letterSpacing:".24em",
                color:"rgba(255,255,255,.50)", textTransform:"uppercase",
                opacity:hov?1:0, transition:"opacity .3s" }}>
                View case study
              </span>
            </div>
          </div>
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:hov?3:1.5,
            background:next.color, boxShadow:hov?`0 0 28px ${next.color}`:"none",
            transition:"height .3s,box-shadow .3s" }}/>
        </section>
      )}

      {/* FOOTER */}
      <footer style={{ padding:"40px 80px", borderTop:"1px solid rgba(0,0,0,.07)",
        display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:7, letterSpacing:".22em",
          color:"rgba(0,0,0,.20)", textTransform:"uppercase" }}>
          Domani Studio — {new Date().getFullYear()}
        </span>
        <TransitionLink href="/work" transition="ink" onClick={() => S.tick()}
          style={{ fontFamily:"'DM Mono',monospace", fontSize:8, letterSpacing:".22em",
            color:"rgba(0,0,0,.35)", textTransform:"uppercase" }}>
          ← All Work
        </TransitionLink>
      </footer>

      <style>{`* { cursor: none !important; }`}</style>
    </div>
  );
}