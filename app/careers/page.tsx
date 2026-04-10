"use client";
import { useState, useEffect, useRef } from "react";

const ROLES = [
  {
    id: "sr-frontend",
    dept: "Engineering",
    index: "C001",
    title: "Senior Frontend Engineer",
    type: "Full-time · Remote",
    desc: "Own the visual layer of Domani's product suite. Expert-level Next.js, R3F, GSAP. You care about 60fps and elegant code in equal measure.",
    reqs: ["Next.js 15+","React Three Fiber","GSAP / Lenis","TypeScript","WebGL fundamentals"],
    accent: [0.72, 0.94, 1.0] as [number,number,number],
    open: true,
  },
  {
    id: "ai-engineer",
    dept: "AI & Systems",
    index: "C002",
    title: "AI Systems Engineer",
    type: "Full-time · Remote",
    desc: "Build the intelligence layer across YDBI, SyntriAI, and client systems. LLM orchestration, embeddings, RAG pipelines, real-time voice.",
    reqs: ["Python / Node.js","Anthropic / OpenAI APIs","pgvector","Whisper STT","ElevenLabs TTS"],
    accent: [0.3, 0.9, 0.6] as [number,number,number],
    open: true,
  },
  {
    id: "brand-designer",
    dept: "Design",
    index: "C003",
    title: "Brand & Motion Designer",
    type: "Contract · Remote",
    desc: "Extend the Domani visual system across campaigns, product surfaces, and client deliverables. Figma-native, motion-fluent, typographically obsessed.",
    reqs: ["Figma / FigJam","After Effects","SVG / Lottie","Brand systems","Editorial design"],
    accent: [1.0, 0.6, 0.2] as [number,number,number],
    open: true,
  },
  {
    id: "backend-engineer",
    dept: "Engineering",
    index: "C004",
    title: "Backend Engineer",
    type: "Full-time · Remote",
    desc: "Core infrastructure: Fastify APIs, Postgres, Redis, webhooks, fintech rails. You care about correctness, edge cases, and zero-downtime deploys.",
    reqs: ["Node.js / Fastify","Prisma / Postgres","Redis","Fintech APIs","Docker / Render"],
    accent: [0.7, 0.4, 1.0] as [number,number,number],
    open: true,
  },
  {
    id: "strategy-lead",
    dept: "Strategy",
    index: "C005",
    title: "Digital Strategy Lead",
    type: "Part-time · Remote",
    desc: "Shape how Domani positions its services and products. Market analysis, client workshops, growth architecture, and competitive intelligence.",
    reqs: ["Brand strategy","Market research","Workshop facilitation","Business writing","Startup ecosystem knowledge"],
    accent: [0.2, 0.7, 1.0] as [number,number,number],
    open: false,
  },
];

function RoleRow({ role, hovered, onHover, onLeave, onApply }: {
  role: typeof ROLES[0];
  hovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onApply: () => void;
}) {
  const [ar,ag,ab] = role.accent;
  const sC = (a: number) => `rgba(${Math.round(ar*255)},${Math.round(ag*255)},${Math.round(ab*255)},${a})`;
  const cyan = "rgba(184,240,255,";

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        display:"grid",
        gridTemplateColumns:"48px 1fr auto",
        gap:"0 32px",
        alignItems:"center",
        padding:"22px 0",
        borderBottom:`1px solid ${hovered ? sC(0.22) : "rgba(184,240,255,0.06)"}`,
        cursor:"none",
        background: hovered ? sC(0.03) : "transparent",
        transition:"all 0.2s",
        position:"relative",overflow:"hidden",
        opacity: role.open ? 1 : 0.45,
      }}
    >
      {hovered && role.open && <div style={{
        position:"absolute",inset:0,pointerEvents:"none",
        background:`linear-gradient(90deg,${sC(0)},${sC(0.05)},${sC(0)})`,
        animation:"storeSweep 1.6s ease-in-out infinite",
      }}/>}

      <span style={{
        fontFamily:"'DM Mono',monospace",fontSize:7.5,letterSpacing:"0.16em",
        color:`${cyan}0.20)`,paddingLeft:2,
      }}>{role.index}</span>

      <div style={{display:"flex",flexDirection:"column",gap:5}}>
        <div style={{display:"flex",alignItems:"baseline",gap:14,flexWrap:"wrap"}}>
          <span style={{
            fontFamily:"'Bodoni Moda',Georgia,serif",fontStyle:"italic",fontWeight:400,
            fontSize:"clamp(17px,2.1vw,26px)",letterSpacing:"-0.01em",lineHeight:1,
            color: hovered ? "rgba(255,255,255,0.95)" : `${cyan}0.55)`,
            textShadow: hovered ? `0 0 30px ${sC(0.22)}` : "none",
            transition:"color 0.2s",
          }}>{role.title}</span>
          <span style={{
            fontFamily:"'DM Mono',monospace",fontSize:6.5,letterSpacing:"0.18em",
            color:sC(0.60),border:`1px solid ${sC(0.28)}`,padding:"2px 8px",
          }}>{role.dept.toUpperCase()}</span>
          {!role.open && (
            <span style={{
              fontFamily:"'DM Mono',monospace",fontSize:6.5,letterSpacing:"0.18em",
              color:"rgba(184,240,255,0.30)",border:"1px solid rgba(184,240,255,0.12)",
              padding:"2px 8px",
            }}>FILLED</span>
          )}
        </div>
        <span style={{
          fontFamily:"'DM Mono',monospace",fontSize:7.5,letterSpacing:"0.08em",
          color:`${cyan}${hovered ? 0.30 : 0.16})`,transition:"color 0.2s",
        }}>{role.type}</span>
        {hovered && role.open && (
          <div style={{marginTop:8,animation:"fadeUp 0.3s ease"}}>
            <p style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:"0.06em",
              color:"rgba(255,255,255,0.28)",lineHeight:1.8,margin:"0 0 10px"}}>{role.desc}</p>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {role.reqs.map(r=>(
                <span key={r} style={{fontFamily:"'DM Mono',monospace",fontSize:6.5,
                  letterSpacing:"0.14em",color:sC(0.55),border:`1px solid ${sC(0.18)}`,
                  padding:"2px 8px"}}>{r}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{paddingRight:4,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
        {hovered && role.open && (
          <button onClick={onApply} style={{
            fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:"0.22em",
            textTransform:"uppercase",color:"rgba(8,7,6,1)",
            background:`rgba(${Math.round(ar*255)},${Math.round(ag*255)},${Math.round(ab*255)},1)`,
            border:"none",padding:"9px 22px",cursor:"none",
            animation:"fadeUp 0.25s ease",
            boxShadow:`0 0 24px ${sC(0.4)}`,
            whiteSpace:"nowrap",
          }}>Apply →</button>
        )}
      </div>
    </div>
  );
}

// ─── APPLY PANEL ──────────────────────────────────────────────────────────────
function ApplyPanel({ role, onClose }: { role: typeof ROLES[0]; onClose: () => void }) {
  const [ar,ag,ab] = role.accent;
  const sC = (a: number) => `rgba(${Math.round(ar*255)},${Math.round(ag*255)},${Math.round(ab*255)},${a})`;
  const [form, setForm] = useState({name:"",email:"",portfolio:"",note:""});
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if(form.name && form.email) setSent(true);
  };

  return (
    <div style={{position:"fixed",inset:0,zIndex:9500,display:"flex"}}>
      <div onClick={onClose} style={{flex:1,background:"rgba(2,4,8,0.80)"}}/>
      <div style={{
        width:"clamp(380px,35vw,500px)",
        background:"rgba(10,10,12,0.98)",
        borderLeft:`1px solid ${sC(0.20)}`,
        display:"flex",flexDirection:"column",
        overflowY:"auto",
      }}>
        <div style={{padding:"36px 40px 24px",borderBottom:"1px solid rgba(184,240,255,0.07)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:"0.24em",
                color:sC(0.50),textTransform:"uppercase",marginBottom:8}}>{role.dept} — {role.index}</div>
              <div style={{fontFamily:"'Bodoni Moda',Georgia,serif",fontStyle:"italic",
                fontSize:"clamp(24px,3.5vw,40px)",letterSpacing:"-0.02em",
                color:"rgba(255,255,255,0.92)",lineHeight:1.1}}>{role.title}</div>
            </div>
            <button onClick={onClose} style={{background:"none",border:"none",cursor:"none",
              color:"rgba(184,240,255,0.40)",fontSize:18,padding:4}}>✕</button>
          </div>
        </div>

        <div style={{padding:"28px 40px",flex:1}}>
          {sent ? (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",gap:20,paddingTop:40}}>
              <div style={{width:60,height:60,borderRadius:"50%",border:`1px solid ${sC(0.50)}`,
                display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 40px ${sC(0.30)}`}}>
                <span style={{fontSize:22,color:sC(1)}}>✓</span>
              </div>
              <div>
                <div style={{fontFamily:"'Bodoni Moda',Georgia,serif",fontStyle:"italic",
                  fontSize:32,color:"rgba(255,255,255,0.90)",marginBottom:12}}>Applied.</div>
                <p style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:"0.10em",
                  color:"rgba(255,255,255,0.30)",lineHeight:1.8,maxWidth:280}}>
                  We review applications weekly. If there's a fit, we'll reach out within 7 days.
                </p>
              </div>
              <button onClick={onClose} style={{marginTop:16,fontFamily:"'DM Mono',monospace",
                fontSize:7,letterSpacing:"0.22em",textTransform:"uppercase",background:"none",
                border:"1px solid rgba(184,240,255,0.18)",padding:"10px 24px",cursor:"none",
                color:"rgba(184,240,255,0.50)"}}>Back to Careers</button>
            </div>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:20}}>
              {[
                {key:"name",label:"Full Name",placeholder:"Your name"},
                {key:"email",label:"Email",placeholder:"your@email.com"},
                {key:"portfolio",label:"Portfolio / GitHub",placeholder:"https://..."},
              ].map(({key,label,placeholder})=>(
                <div key={key}>
                  <label style={{fontFamily:"'DM Mono',monospace",fontSize:7.5,letterSpacing:"0.18em",
                    color:"rgba(184,240,255,0.40)",textTransform:"uppercase",display:"block",marginBottom:8}}>
                    {label}
                  </label>
                  <input
                    value={form[key as keyof typeof form]}
                    onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                    placeholder={placeholder}
                    style={{width:"100%",background:"rgba(184,240,255,0.03)",
                      border:`1px solid ${form[key as keyof typeof form] ? sC(0.35) : "rgba(184,240,255,0.12)"}`,
                      padding:"12px 14px",fontFamily:"'DM Mono',monospace",fontSize:9,
                      letterSpacing:"0.08em",color:"rgba(255,255,255,0.80)",outline:"none",
                      boxSizing:"border-box" as const,transition:"border-color 0.2s"}}
                  />
                </div>
              ))}
              <div>
                <label style={{fontFamily:"'DM Mono',monospace",fontSize:7.5,letterSpacing:"0.18em",
                  color:"rgba(184,240,255,0.40)",textTransform:"uppercase",display:"block",marginBottom:8}}>
                  Cover Note
                </label>
                <textarea
                  value={form.note}
                  onChange={e=>setForm(f=>({...f,note:e.target.value}))}
                  placeholder="Why Domani? What will you build here?"
                  rows={4}
                  style={{width:"100%",background:"rgba(184,240,255,0.03)",
                    border:`1px solid ${form.note ? sC(0.35) : "rgba(184,240,255,0.12)"}`,
                    padding:"12px 14px",fontFamily:"'DM Mono',monospace",fontSize:9,
                    letterSpacing:"0.06em",color:"rgba(255,255,255,0.80)",outline:"none",
                    boxSizing:"border-box" as const,resize:"vertical" as const,lineHeight:1.7,
                    transition:"border-color 0.2s"}}
                />
              </div>
              <button onClick={handleSubmit} style={{
                marginTop:8,width:"100%",
                background: form.name && form.email
                  ? `rgba(${Math.round(ar*255)},${Math.round(ag*255)},${Math.round(ab*255)},1)`
                  : "rgba(184,240,255,0.12)",
                border:"none",cursor:"none",
                fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:"0.26em",
                textTransform:"uppercase",
                color: form.name && form.email ? "rgba(8,7,6,1)" : "rgba(184,240,255,0.30)",
                padding:"16px",transition:"all 0.2s",
                boxShadow: form.name && form.email ? `0 0 32px ${sC(0.35)}` : "none",
              }}>Submit Application →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CAREERS PAGE ─────────────────────────────────────────────────────────────
export default function CareersPage() {
  const [hoveredRole, setHoveredRole] = useState<string|null>(null);
  const [applyRole, setApplyRole] = useState<typeof ROLES[0]|null>(null);
  const cyan = "rgba(184,240,255,";

  return (
    <div style={{minHeight:"100vh",background:"rgba(8,7,6,1)",paddingTop:80}}>
      {/* Hero */}
      <div style={{padding:"80px 80px 48px",borderBottom:`1px solid ${cyan}0.07)`}}>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:"0.32em",
          color:`${cyan}0.28)`,textTransform:"uppercase",marginBottom:16}}>
          Domani — Careers
        </div>
        <h1 style={{fontFamily:"'Bodoni Moda',Georgia,serif",fontStyle:"italic",fontWeight:400,
          fontSize:"clamp(52px,8vw,110px)",letterSpacing:"-0.03em",lineHeight:0.92,
          color:"rgba(255,255,255,0.90)",margin:"0 0 24px"}}>
          Build<br/>
          <span style={{color:`${cyan}0.45)`,textShadow:`0 0 80px ${cyan}0.18)`}}>Tomorrow.</span>
        </h1>
        <p style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:"0.08em",
          color:`${cyan}0.30)`,maxWidth:520,lineHeight:1.8,margin:0}}>
          Domani is a small studio doing outsized work. We build with precision, think in systems, and ship things that last. If that sounds like you — we should talk.
        </p>

        {/* Stats */}
        <div style={{marginTop:48,display:"flex",gap:56,flexWrap:"wrap"}}>
          {[
            {n:"100%","l":"Remote First"},
            {n:"4","l":"Open Roles"},
            {n:"3","l":"In-house Products"},
            {n:"∞","l":"Ambition"},
          ].map(({n,l})=>(
            <div key={l}>
              <div style={{fontFamily:"'Bodoni Moda',Georgia,serif",fontStyle:"italic",
                fontSize:40,color:`${cyan}0.80)`,lineHeight:1}}>{n}</div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:"0.22em",
                color:`${cyan}0.28)`,textTransform:"uppercase",marginTop:6}}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Roles list */}
      <div style={{padding:"0 80px"}}>
        {ROLES.map(role=>(
          <RoleRow
            key={role.id}
            role={role}
            hovered={hoveredRole===role.id}
            onHover={()=>setHoveredRole(role.id)}
            onLeave={()=>setHoveredRole(null)}
            onApply={()=>setApplyRole(role)}
          />
        ))}

        {/* Open application */}
        <div style={{padding:"48px 0 80px"}}>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:"0.22em",
            color:`${cyan}0.22)`,textTransform:"uppercase",marginBottom:14}}>
            Don't see your role?
          </div>
          <a href="mailto:hello@domani.studio" style={{
            display:"inline-flex",alignItems:"center",gap:16,
            textDecoration:"none",
            fontFamily:"'Bodoni Moda',Georgia,serif",fontStyle:"italic",
            fontSize:"clamp(18px,2.5vw,32px)",
            color:`${cyan}0.60)`,
            borderBottom:`1px solid ${cyan}0.20)`,
            paddingBottom:4,
            transition:"color 0.2s,border-color 0.2s",
          }}
            onMouseOver={e=>{
              (e.currentTarget as HTMLElement).style.color=`${cyan}0.90)`;
              (e.currentTarget as HTMLElement).style.borderColor=`${cyan}0.50)`;
            }}
            onMouseOut={e=>{
              (e.currentTarget as HTMLElement).style.color=`${cyan}0.60)`;
              (e.currentTarget as HTMLElement).style.borderColor=`${cyan}0.20)`;
            }}
          >
            hello@domani.studio →
          </a>
        </div>
      </div>

      {applyRole && <ApplyPanel role={applyRole} onClose={()=>setApplyRole(null)}/>}

      <style>{`
        @keyframes storeSweep{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        input::placeholder,textarea::placeholder{color:rgba(184,240,255,0.18);}
        input:focus,textarea:focus{outline:none;}
        *{box-sizing:border-box;}
      `}</style>
    </div>
  );
}