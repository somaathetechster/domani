"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useTransition } from "@/lib/transitions/TransitionContext";

// ─── PRODUCT DATA ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all",          label: "All Systems" },
  { id: "ai",          label: "AI Tools"     },
  { id: "brand",       label: "Brand Kits"   },
  { id: "infra",       label: "Infrastructure" },
  { id: "templates",   label: "Templates"    },
];

interface Product {
  id:       string;
  category: string;
  index:    string;
  name:     string;
  tagline:  string;
  desc:     string;
  price:    number | "Free" | "Contact";
  badge?:   string;
  tags:     string[];
  accent:   [number,number,number];
  visual:   "orbit" | "grid" | "wave" | "node" | "pulse";
}

const PRODUCTS: Product[] = [
  {
    id:       "ydbi-pro",
    category: "ai",
    index:    "001",
    name:     "YDBI Pro",
    tagline:  "Your Digital Butler Intelligence",
    desc:     "Spatial AI presence for high-performing teams. Voice-native, context-aware, always on. Connects to your calendar, files, email and thinks ahead.",
    price:    49,
    badge:    "New",
    tags:     ["AI", "Voice", "Automation"],
    accent:   [0.72, 0.94, 1.0],
    visual:   "orbit",
  },
  {
    id:       "syntri",
    category: "ai",
    index:    "002",
    name:     "SyntriAI",
    tagline:  "Intelligent data synthesis engine",
    desc:     "Connect disparate data sources into a single intelligent layer. Real-time synthesis, pattern recognition, and actionable signal extraction.",
    price:    120,
    badge:    "Beta",
    tags:     ["Data", "AI", "Analytics"],
    accent:   [0.3, 0.9, 0.6],
    visual:   "wave",
  },
  {
    id:       "orbit-brand-kit",
    category: "brand",
    index:    "003",
    name:     "Orbit Brand Kit",
    tagline:  "The complete Domani identity system",
    desc:     "Full brand system: Orbit mark in all formats, type scales, color tokens, motion specs, Figma library, and usage guidelines. 400+ assets.",
    price:    299,
    tags:     ["Figma", "SVG", "Design Tokens"],
    accent:   [1.0, 0.6, 0.2],
    visual:   "node",
  },
  {
    id:       "system-one",
    category: "infra",
    index:    "004",
    name:     "System One",
    tagline:  "Next.js 15 production scaffold",
    desc:     "The exact Domani website stack. Next.js 15, R3F, GSAP, Lenis, custom cursor, transitions, loading screen. Launch-ready in under a day.",
    price:    189,
    badge:    "Popular",
    tags:     ["Next.js", "R3F", "GSAP"],
    accent:   [0.7, 0.4, 1.0],
    visual:   "grid",
  },
  {
    id:       "flow-templates",
    category: "templates",
    index:    "005",
    name:     "Flow Templates",
    tagline:  "Motion-first landing templates",
    desc:     "12 premium landing page templates built on Domani's design system. Canvas animations, scroll choreography, and component library included.",
    price:    149,
    tags:     ["Templates", "Motion", "Tailwind"],
    accent:   [0.2, 0.7, 1.0],
    visual:   "pulse",
  },
  {
    id:       "infinitswap-api",
    category: "infra",
    index:    "006",
    name:     "Infinitswap API",
    tagline:  "Crypto-fiat exchange infrastructure",
    desc:     "Production-grade WhatsApp-native crypto exchange backend. Multi-country, multi-rail, KYC tiers, P2P ledger, webhook routing. Nigeria, Ghana, Tanzania, SA.",
    price:    "Contact",
    tags:     ["Fintech", "API", "Multi-country"],
    accent:   [0.72, 0.94, 1.0],
    visual:   "node",
  },
  {
    id:       "veyra-kit",
    category: "ai",
    index:    "007",
    name:     "Veyra Starter Kit",
    tagline:  "Fashion AI integration layer",
    desc:     "The wardrobe intelligence API powering Veyra. Context engine, user model, styling recommendations, and outfit graph. Plug into any fashion app.",
    price:    79,
    badge:    "New",
    tags:     ["Fashion", "AI", "API"],
    accent:   [1.0, 0.75, 0.85],
    visual:   "wave",
  },
  {
    id:       "design-tokens",
    category: "brand",
    index:    "008",
    name:     "Design Token System",
    tagline:  "Cross-platform design foundations",
    desc:     "Semantic token architecture for enterprise design systems. Figma variables, CSS custom props, JS/TS exports, dark/light themes, motion primitives.",
    price:    "Free",
    tags:     ["Open Source", "Figma", "CSS"],
    accent:   [0.3, 0.9, 0.6],
    visual:   "grid",
  },
];

// ─── PRODUCT VISUAL (mini canvas per product) ─────────────────────────────────
function ProductVisual({ visual, accent, active }: {
  visual: Product["visual"];
  accent: [number,number,number];
  active: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const t0  = useRef(performance.now());

  useEffect(() => {
    if (!ref.current || !active) return;
    const c = ref.current;
    const ctx = c.getContext("2d")!;
    const [ar,ag,ab] = accent;
    const aC = (a: number) => `rgba(${Math.round(ar*255)},${Math.round(ag*255)},${Math.round(ab*255)},${a})`;

    const draw = () => {
      raf.current = requestAnimationFrame(draw);
      const W = c.width  = c.offsetWidth;
      const H = c.height = c.offsetHeight;
      const t = (performance.now() - t0.current) / 1000;

      ctx.clearRect(0,0,W,H);
      ctx.fillStyle = "rgba(8,7,6,1)";
      ctx.fillRect(0,0,W,H);

      const cx = W/2, cy = H/2;

      switch(visual) {
        case "orbit": {
          // Mini orbit spiral
          ctx.save(); ctx.translate(cx,cy);
          const rot = t*0.3;
          ctx.rotate(rot);
          for(let arm=0;arm<4;arm++) {
            const off=(arm/4)*Math.PI*2;
            const pts=[];
            for(let i=0;i<=60;i++){
              const theta=0.1+(i/60)*Math.PI*1.5;
              const r=Math.min(W,H)*0.04*Math.exp(0.295*theta);
              pts.push({x:Math.cos(theta+off)*r,y:Math.sin(theta+off)*r});
            }
            ctx.beginPath();
            pts.forEach((p,i)=>i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
            const emissive=0.5+0.5*Math.sin(t*1.3+arm*0.6);
            ctx.strokeStyle=aC(emissive*0.8);ctx.lineWidth=1.5;ctx.lineCap="round";ctx.stroke();
          }
          ctx.restore();
          // Ambient
          const g=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.min(W,H)*0.4);
          g.addColorStop(0,aC(0.06));g.addColorStop(1,aC(0));
          ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
          break;
        }
        case "wave": {
          for(let y=0;y<H;y+=4){
            ctx.beginPath();
            for(let x=0;x<=W;x+=2){
              const w1=Math.sin(x*0.02+t*0.8)*0.5+0.5;
              const w2=Math.sin(x*0.015-t*0.6+y*0.01)*0.5+0.5;
              const dy=Math.sin((w1+w2)/2*Math.PI*2)*10;
              x===0?ctx.moveTo(x,y+dy):ctx.lineTo(x,y+dy);
            }
            ctx.strokeStyle=aC(0.07);ctx.lineWidth=0.8;ctx.stroke();
          }
          // Node
          ctx.beginPath();ctx.arc(cx,cy,3,0,Math.PI*2);
          ctx.fillStyle=aC(0.8);ctx.fill();
          break;
        }
        case "grid": {
          ctx.strokeStyle=aC(0.06);ctx.lineWidth=0.5;
          for(let x=0;x<W;x+=18){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
          for(let y=0;y<H;y+=18){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
          // Scan
          const sweep=(t*0.5)%1;
          const sg=ctx.createLinearGradient(0,0,0,H);
          sg.addColorStop(Math.max(0,sweep-0.1),aC(0));
          sg.addColorStop(sweep,aC(0.3));
          sg.addColorStop(Math.min(1,sweep+0.05),aC(0));
          ctx.fillStyle=sg;ctx.fillRect(0,0,W,H);
          break;
        }
        case "node": {
          const nodes=[{x:0.25,y:0.3},{x:0.75,y:0.3},{x:0.5,y:0.65},{x:0.5,y:0.2}];
          nodes.forEach((n,i)=>{
            nodes.forEach((m,j)=>{
              if(j<=i)return;
              ctx.beginPath();ctx.moveTo(n.x*W,n.y*H);ctx.lineTo(m.x*W,m.y*H);
              ctx.strokeStyle=aC(0.08);ctx.lineWidth=0.5;ctx.stroke();
            });
            const p=0.5+0.5*Math.sin(t*1.1+i*1.3);
            ctx.beginPath();ctx.arc(n.x*W,n.y*H,3+p*2,0,Math.PI*2);
            ctx.fillStyle=aC(0.1);ctx.fill();
            ctx.beginPath();ctx.arc(n.x*W,n.y*H,2,0,Math.PI*2);
            ctx.fillStyle=aC(0.6+p*0.3);ctx.fill();
          });
          break;
        }
        case "pulse": {
          for(let i=0;i<4;i++){
            const phase=((t*0.5+i*0.25)%1);
            const r=phase*Math.min(W,H)*0.42;
            const a=(1-phase)*0.20;
            ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);
            ctx.strokeStyle=aC(a);ctx.lineWidth=1.2;ctx.stroke();
          }
          ctx.beginPath();ctx.arc(cx,cy,4,0,Math.PI*2);
          ctx.fillStyle=aC(0.9);ctx.fill();
          break;
        }
      }
    };
    raf.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf.current);
  }, [active, visual, accent]);

  return <canvas ref={ref} style={{width:"100%",height:"100%",display:"block"}}/>;
}

// ─── PRODUCT ROW ──────────────────────────────────────────────────────────────
function ProductRow({
  product, idx, onBuy, hovered, onHover, onLeave
}: {
  product: Product;
  idx: number;
  onBuy: (p: Product) => void;
  hovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const [ar,ag,ab] = product.accent;
  const sC = (a: number) => `rgba(${Math.round(ar*255)},${Math.round(ag*255)},${Math.round(ab*255)},${a})`;
  const cyan = "rgba(184,240,255,";

  const priceLabel =
    product.price === "Free"    ? "Free"        :
    product.price === "Contact" ? "Get in touch" :
    `$${product.price}`;

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        display:"grid",
        gridTemplateColumns:"48px 1fr auto",
        alignItems:"center",
        gap:"0 32px",
        padding:"20px 0",
        borderBottom:`1px solid ${hovered ? sC(0.20) : "rgba(184,240,255,0.06)"}`,
        cursor:"none",
        background: hovered ? sC(0.03) : "transparent",
        transition:"background 0.2s,border-color 0.2s",
        position:"relative",
        overflow:"hidden",
      }}
    >
      {/* Beam on hover */}
      {hovered && <div style={{
        position:"absolute",inset:0,pointerEvents:"none",
        background:`linear-gradient(90deg,${sC(0)},${sC(0.06)},${sC(0)})`,
        animation:"storeSweep 1.6s ease-in-out infinite",
      }}/>}

      {/* Index */}
      <span style={{
        fontFamily:"'DM Mono',monospace",fontSize:8,
        letterSpacing:"0.18em",color:`${cyan}0.22)`,
        paddingLeft:2,
      }}>{product.index}</span>

      {/* Main content */}
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        <div style={{display:"flex",alignItems:"baseline",gap:14,flexWrap:"wrap"}}>
          <span style={{
            fontFamily:"'Bodoni Moda',Georgia,serif",fontStyle:"italic",fontWeight:400,
            fontSize:"clamp(18px,2.2vw,28px)",letterSpacing:"-0.01em",lineHeight:1,
            color: hovered ? "rgba(255,255,255,0.95)" : `${cyan}0.55)`,
            textShadow: hovered ? `0 0 30px ${sC(0.25)}` : "none",
            transition:"color 0.2s,text-shadow 0.2s",
          }}>{product.name}</span>
          {product.badge && (
            <span style={{
              fontFamily:"'DM Mono',monospace",fontSize:6,letterSpacing:"0.22em",
              color:sC(0.90),border:`1px solid ${sC(0.40)}`,
              padding:"2px 7px",textTransform:"uppercase",
            }}>{product.badge}</span>
          )}
        </div>
        <span style={{
          fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:"0.10em",
          color:`${cyan}${hovered ? 0.35 : 0.18})`,transition:"color 0.2s",
        }}>{product.tagline}</span>
        {hovered && (
          <div style={{
            marginTop:6,display:"flex",gap:8,flexWrap:"wrap",
            animation:"fadeUp 0.3s ease",
          }}>
            {product.tags.map(tag=>(
              <span key={tag} style={{
                fontFamily:"'DM Mono',monospace",fontSize:6.5,letterSpacing:"0.15em",
                color:sC(0.55),border:`1px solid ${sC(0.18)}`,padding:"2px 8px",
              }}>{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Price + action */}
      <div style={{
        display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8,
        paddingRight:4, minWidth:120,
      }}>
        <span style={{
          fontFamily:"'DM Mono',monospace",
          fontSize: product.price === "Contact" ? 9 : 14,
          letterSpacing: product.price === "Contact" ? "0.16em" : "0.04em",
          color: product.price === "Free" ? sC(0.80) : `${cyan}0.80)`,
          fontWeight:300,
        }}>{priceLabel}</span>
        {hovered && (
          <button
            onClick={() => onBuy(product)}
            style={{
              fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:"0.22em",
              textTransform:"uppercase",color:"rgba(8,7,6,1)",
              background: `rgba(${Math.round(ar*255)},${Math.round(ag*255)},${Math.round(ab*255)},1)`,
              border:"none",padding:"8px 20px",cursor:"none",
              animation:"fadeUp 0.25s ease",
              boxShadow:`0 0 24px ${sC(0.5)}`,
              whiteSpace:"nowrap",
            }}
          >
            {product.price === "Contact" ? "Contact Us →" : product.price === "Free" ? "Download →" : "Get →"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── PRODUCT PREVIEW PANEL ────────────────────────────────────────────────────
function PreviewPanel({ product }: { product: Product | null }) {
  const [ar,ag,ab] = product?.accent ?? [0.72,0.94,1.0];
  const sC = (a: number) => product
    ? `rgba(${Math.round(ar*255)},${Math.round(ag*255)},${Math.round(ab*255)},${a})`
    : `rgba(184,240,255,${a})`;

  return (
    <div style={{
      position:"sticky",top:100,
      width:"100%",aspectRatio:"1/1.1",
      border:`1px solid ${sC(product ? 0.18 : 0.06)}`,
      background:"rgba(8,7,6,0.95)",
      transition:"border-color 0.4s",
      overflow:"hidden",display:"flex",flexDirection:"column",
    }}>
      {/* Canvas area */}
      <div style={{flex:1,position:"relative"}}>
        {product ? (
          <ProductVisual visual={product.visual} accent={product.accent} active={true}/>
        ) : (
          <div style={{
            position:"absolute",inset:0,display:"flex",alignItems:"center",
            justifyContent:"center",
          }}>
            <span style={{
              fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:"0.24em",
              color:"rgba(184,240,255,0.16)",textTransform:"uppercase",
            }}>Hover to preview</span>
          </div>
        )}
      </div>

      {/* Meta */}
      {product && (
        <div style={{padding:"20px 24px",borderTop:`1px solid ${sC(0.10)}`}}>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:"0.22em",
            color:sC(0.50),textTransform:"uppercase",marginBottom:8}}>
            {product.category.toUpperCase()} — {product.index}
          </div>
          <div style={{fontFamily:"'Bodoni Moda',Georgia,serif",fontStyle:"italic",
            fontSize:22,letterSpacing:"-0.01em",color:"rgba(255,255,255,0.88)",
            marginBottom:10}}>{product.name}</div>
          <p style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:"0.06em",
            color:"rgba(255,255,255,0.30)",lineHeight:1.8,margin:0}}>{product.desc}</p>
        </div>
      )}
    </div>
  );
}

// ─── CHECKOUT PANEL ───────────────────────────────────────────────────────────
function CheckoutPanel({ product, onClose }: { product: Product; onClose: () => void }) {
  const [ar,ag,ab] = product.accent;
  const sC = (a: number) => `rgba(${Math.round(ar*255)},${Math.round(ag*255)},${Math.round(ab*255)},${a})`;
  const [step, setStep] = useState<"cart"|"pay"|"done">("cart");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  return (
    <div style={{
      position:"fixed",inset:0,zIndex:9500,
      display:"flex",
    }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{flex:1,background:"rgba(2,4,8,0.80)"}}/>

      {/* Panel */}
      <div style={{
        width:"clamp(380px,35vw,520px)",
        background:"rgba(10,10,12,0.98)",
        borderLeft:`1px solid ${sC(0.18)}`,
        display:"flex",flexDirection:"column",
        overflowY:"auto",
      }}>
        {/* Header */}
        <div style={{
          padding:"36px 40px 24px",
          borderBottom:`1px solid rgba(184,240,255,0.07)`,
        }}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:"0.24em",
                color:sC(0.50),textTransform:"uppercase",marginBottom:8}}>
                {step === "cart" ? "Your Order" : step === "pay" ? "Payment" : "Confirmed"}
              </div>
              <div style={{fontFamily:"'Bodoni Moda',Georgia,serif",fontStyle:"italic",
                fontSize:"clamp(32px,4vw,52px)",letterSpacing:"-0.02em",
                color:"rgba(255,255,255,0.92)",lineHeight:1}}>
                {step === "cart" ? "Cart" : step === "pay" ? "Checkout" : "Done."}
              </div>
            </div>
            <button onClick={onClose} style={{
              background:"none",border:"none",cursor:"none",
              color:"rgba(184,240,255,0.40)",fontSize:18,padding:4,
            }}>✕</button>
          </div>
        </div>

        <div style={{padding:"28px 40px",flex:1}}>
          {step === "cart" && (
            <>
              {/* Product row */}
              <div style={{
                display:"flex",gap:16,alignItems:"center",
                padding:"16px 0",borderBottom:`1px solid rgba(184,240,255,0.07)`,
              }}>
                <div style={{width:48,height:48,border:`1px solid ${sC(0.20)}`,
                  background:"rgba(8,7,6,1)",flexShrink:0,overflow:"hidden"}}>
                  <ProductVisual visual={product.visual} accent={product.accent} active={true}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'Bodoni Moda',Georgia,serif",fontStyle:"italic",
                    fontSize:18,color:"rgba(255,255,255,0.88)"}}>{product.name}</div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:7.5,letterSpacing:"0.10em",
                    color:"rgba(255,255,255,0.28)",marginTop:3}}>{product.tagline}</div>
                </div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:13,
                  color:"rgba(184,240,255,0.80)",letterSpacing:"0.02em"}}>
                  {product.price === "Free" ? "Free" : product.price === "Contact" ? "—" : `$${product.price}`}
                </div>
              </div>

              {/* Totals */}
              <div style={{marginTop:24,display:"flex",flexDirection:"column",gap:10}}>
                {[
                  ["Subtotal", product.price === "Contact" ? "—" : product.price === "Free" ? "$0" : `$${product.price}`],
                  ["Discount", "$0.00"],
                ].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:"0.14em",
                      color:"rgba(184,240,255,0.28)",textTransform:"uppercase"}}>{l}</span>
                    <span style={{fontFamily:"'DM Mono',monospace",fontSize:8,color:"rgba(184,240,255,0.50)"}}>{v}</span>
                  </div>
                ))}
                <div style={{borderTop:`1px solid rgba(184,240,255,0.10)`,paddingTop:12,
                  display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                  <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"0.16em",
                    color:"rgba(255,255,255,0.75)",textTransform:"uppercase"}}>Total</span>
                  <span style={{fontFamily:"'DM Mono',monospace",fontSize:20,
                    color:"rgba(255,255,255,0.90)",letterSpacing:"-0.01em"}}>
                    {product.price === "Contact" ? "Custom" : product.price === "Free" ? "Free" : `$${product.price}`}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setStep(product.price === "Contact" ? "done" : "pay")}
                style={{
                  marginTop:32,width:"100%",
                  background:`rgba(${Math.round(ar*255)},${Math.round(ag*255)},${Math.round(ab*255)},1)`,
                  border:"none",cursor:"none",
                  fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:"0.26em",
                  textTransform:"uppercase",color:"rgba(8,7,6,1)",
                  padding:"16px",
                  boxShadow:`0 0 32px ${sC(0.35)}`,
                }}>
                {product.price === "Contact" ? "Send Enquiry →" : "Continue →"}
              </button>
            </>
          )}

          {step === "pay" && (
            <>
              <div style={{display:"flex",flexDirection:"column",gap:20}}>
                {/* Email */}
                <div>
                  <label style={{fontFamily:"'DM Mono',monospace",fontSize:7.5,letterSpacing:"0.18em",
                    color:"rgba(184,240,255,0.40)",textTransform:"uppercase",display:"block",marginBottom:8}}>
                    E-Mail
                  </label>
                  <input
                    value={email}
                    onChange={e=>setEmail(e.target.value)}
                    placeholder="your@email.com"
                    style={{
                      width:"100%",background:"rgba(184,240,255,0.03)",
                      border:`1px solid ${email ? sC(0.35) : "rgba(184,240,255,0.12)"}`,
                      padding:"12px 14px",
                      fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:"0.08em",
                      color:"rgba(255,255,255,0.80)",outline:"none",
                      boxSizing:"border-box",
                      transition:"border-color 0.2s",
                    }}
                  />
                </div>
                {/* Name */}
                <div>
                  <label style={{fontFamily:"'DM Mono',monospace",fontSize:7.5,letterSpacing:"0.18em",
                    color:"rgba(184,240,255,0.40)",textTransform:"uppercase",display:"block",marginBottom:8}}>
                    Your Name
                  </label>
                  <input
                    value={name}
                    onChange={e=>setName(e.target.value)}
                    placeholder="Full name"
                    style={{
                      width:"100%",background:"rgba(184,240,255,0.03)",
                      border:`1px solid ${name ? sC(0.35) : "rgba(184,240,255,0.12)"}`,
                      padding:"12px 14px",
                      fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:"0.08em",
                      color:"rgba(255,255,255,0.80)",outline:"none",
                      boxSizing:"border-box",
                      transition:"border-color 0.2s",
                    }}
                  />
                </div>

                {/* Payment methods */}
                <div style={{marginTop:8}}>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:"0.22em",
                    color:"rgba(184,240,255,0.30)",textTransform:"uppercase",marginBottom:14}}>
                    Select Payment
                  </div>
                  {["Stripe","Paystack","Flutterwave"].map((method,i)=>(
                    <div key={method} style={{
                      border:`1px solid ${i===0?sC(0.35):"rgba(184,240,255,0.10)"}`,
                      padding:"14px 18px",marginBottom:8,cursor:"none",
                      display:"flex",justifyContent:"space-between",alignItems:"center",
                      background: i===0 ? sC(0.04) : "transparent",
                    }}>
                      <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,
                        color: i===0 ? "rgba(255,255,255,0.80)" : "rgba(184,240,255,0.28)",
                        letterSpacing:"0.08em"}}>{method}</span>
                      {i===0&&<div style={{width:6,height:6,borderRadius:"50%",background:sC(0.90)}}/>}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => { if(email && name) setStep("done"); }}
                  style={{
                    marginTop:8,width:"100%",
                    background: email && name
                      ? `rgba(${Math.round(ar*255)},${Math.round(ag*255)},${Math.round(ab*255)},1)`
                      : "rgba(184,240,255,0.12)",
                    border:"none",cursor:"none",
                    fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:"0.26em",
                    textTransform:"uppercase",
                    color: email && name ? "rgba(8,7,6,1)" : "rgba(184,240,255,0.30)",
                    padding:"16px",
                    transition:"background 0.2s,color 0.2s",
                    boxShadow: email && name ? `0 0 32px ${sC(0.35)}` : "none",
                  }}>
                  Complete Purchase →
                </button>
              </div>
            </>
          )}

          {step === "done" && (
            <div style={{
              display:"flex",flexDirection:"column",alignItems:"center",
              justifyContent:"center",textAlign:"center",gap:20,paddingTop:40,
            }}>
              <div style={{
                width:60,height:60,borderRadius:"50%",
                border:`1px solid ${sC(0.50)}`,
                display:"flex",alignItems:"center",justifyContent:"center",
                boxShadow:`0 0 40px ${sC(0.30)}`,
              }}>
                <span style={{fontSize:22,color:sC(1)}}>✓</span>
              </div>
              <div>
                <div style={{fontFamily:"'Bodoni Moda',Georgia,serif",fontStyle:"italic",
                  fontSize:32,color:"rgba(255,255,255,0.90)",marginBottom:12}}>
                  {product.price === "Contact" ? "Received." : "Done."}
                </div>
                <p style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:"0.10em",
                  color:"rgba(255,255,255,0.30)",lineHeight:1.8,maxWidth:280}}>
                  {product.price === "Contact"
                    ? "Your enquiry has been sent. We'll respond within 24 hours."
                    : `A link to access ${product.name} has been sent to your email.`}
                </p>
              </div>
              <button onClick={onClose} style={{
                marginTop:16,fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:"0.22em",
                textTransform:"uppercase",background:"none",border:`1px solid rgba(184,240,255,0.18)`,
                padding:"10px 24px",cursor:"none",color:"rgba(184,240,255,0.50)",
              }}>Back to Store</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN STORE PAGE ──────────────────────────────────────────────────────────
export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);

  const filtered = activeCategory === "all"
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === activeCategory);

  const hovered = PRODUCTS.find(p => p.id === hoveredProduct) ?? null;
  const cyan = "rgba(184,240,255,";

  return (
    <div style={{
      minHeight:"100vh",background:"rgba(8,7,6,1)",
      paddingTop:80,
    }}>
      {/* Hero */}
      <div style={{
        padding:"80px 80px 40px",
        borderBottom:`1px solid ${cyan}0.07)`,
      }}>
        <div style={{
          fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:"0.32em",
          color:`${cyan}0.28)`,textTransform:"uppercase",marginBottom:16,
        }}>Domani — Systems Marketplace</div>
        <h1 style={{
          fontFamily:"'Bodoni Moda',Georgia,serif",fontStyle:"italic",fontWeight:400,
          fontSize:"clamp(52px,8vw,120px)",letterSpacing:"-0.03em",lineHeight:0.92,
          color:"rgba(255,255,255,0.90)",margin:"0 0 24px",
        }}>
          Tools.<br/>
          <span style={{color:`${cyan}0.45)`,textShadow:`0 0 80px ${cyan}0.20)`}}>Systems.</span><br/>
          Infrastructure.
        </h1>
        <p style={{
          fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:"0.08em",
          color:`${cyan}0.32)`,maxWidth:480,lineHeight:1.8,margin:"0 0 48px",
        }}>
          Production-grade tools and systems from the Domani studio. Built for founders, designers, and engineers who build with precision.
        </p>

        {/* Category filter */}
        <div style={{display:"flex",gap:2,flexWrap:"wrap"}}>
          {CATEGORIES.map(cat=>{
            const isActive=activeCategory===cat.id;
            return(
              <button key={cat.id}
                onClick={()=>setActiveCategory(cat.id)}
                style={{
                  fontFamily:"'DM Mono',monospace",fontSize:7.5,letterSpacing:"0.20em",
                  textTransform:"uppercase",
                  padding:"8px 20px",cursor:"none",
                  border:`1px solid ${isActive ? cyan+"0.50)" : cyan+"0.12)"}`,
                  color: isActive ? `${cyan}0.90)` : `${cyan}0.35)`,
                  background: isActive ? `${cyan}0.06)` : "transparent",
                  transition:"all 0.2s",
                  boxShadow: isActive ? `0 0 16px ${cyan}0.10)` : "none",
                }}>
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body: list + preview */}
      <div style={{
        display:"grid",gridTemplateColumns:"1fr clamp(280px,28vw,380px)",
        gap:0,alignItems:"start",
      }}>
        {/* Product list */}
        <div style={{padding:"0 80px"}}>
          {filtered.map((product,idx)=>(
            <ProductRow
              key={product.id}
              product={product}
              idx={idx}
              onBuy={setCheckoutProduct}
              hovered={hoveredProduct===product.id}
              onHover={()=>setHoveredProduct(product.id)}
              onLeave={()=>setHoveredProduct(null)}
            />
          ))}

          {/* Footer note */}
          <div style={{
            padding:"48px 0 80px",
            fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:"0.18em",
            color:`${cyan}0.18)`,lineHeight:2,
          }}>
            All digital products. Instant delivery.<br/>
            Enterprise licensing available — <a href="/contact" style={{color:`${cyan}0.45)`,textDecoration:"none"}}>contact us</a>.
          </div>
        </div>

        {/* Preview panel */}
        <div style={{padding:"32px 48px 32px 0"}}>
          <PreviewPanel product={hovered}/>
        </div>
      </div>

      {/* Checkout modal */}
      {checkoutProduct && (
        <CheckoutPanel
          product={checkoutProduct}
          onClose={()=>setCheckoutProduct(null)}
        />
      )}

      <style>{`
        @keyframes storeSweep{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        input::placeholder{color:rgba(184,240,255,0.18);}
        input:focus{outline:none;}
        *{box-sizing:border-box;}
      `}</style>
    </div>
  );
}