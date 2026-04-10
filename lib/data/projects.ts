// ─────────────────────────────────────────────────────────────────────────────
// DOMANI PROJECTS — Single source of truth
//
// HOW TO EDIT:
//   • Change title, client, year, tagline, intro, challenge, approach,
//     deliverables, outcome, metrics — edit the fields directly below
//   • Images: place files in /public/work/projects/[slug]/
//     covers[]:  array of cover images that cycle on hover (cover.jpg, cover-2.jpg, ...)
//     thumb:     small thumbnail for index list mode
//     video:     hover preview video (preview.mp4) — optional
//   • Music: place .mp3 in /public/work/audio/[slug].mp3
//     Set music: "/work/audio/[slug].mp3"  — plays on case study page
//     Leave music undefined to play nothing
//   • next: set to the id of the next project in the chain
// ─────────────────────────────────────────────────────────────────────────────

export interface Metric      { label: string; value: string }
export interface CaseImage   { src: string; caption?: string; span?: "full"|"half" }

export interface Project {
  id:           string
  index:        string
  title:        string
  client:       string
  year:         string
  status:       string
  category:     string
  services:     string[]
  location:     string
  color:        string    // hex accent colour
  bg:           string    // subtle list-mode tint
  covers:       string[]  // array — cycles on hover. At minimum: [cover.jpg]
  thumb:        string    // small thumbnail
  video?:       string    // hover preview mp4 (optional)
  music?:       string    // project page ambient audio (optional)
  tagline:      string    // short punchy line
  intro:        string    // 2–3 sentence overview shown on index hover
  challenge:    string    // full paragraph
  approach:     string[]  // 3–6 bullet points
  deliverables: string[]
  outcome:      string    // full paragraph
  metrics:      Metric[]
  images:       CaseImage[]
  next:         string    // id of next project
}

const B = "/work/projects"   // base path shorthand

export const PROJECTS: Project[] = [

  // ── 001 ──────────────────────────────────────────────────────────────────────
  {
    id: "monolith-brand", index: "001",
    title: "Monolith",
    client: "Monolith Capital",
    year: "2024", status: "Delivered", category: "Brand Identity",
    services: ["Naming", "Brand Identity", "Visual System", "Guidelines", "Collateral"],
    location: "Lagos, Nigeria",
    color: "#B8F0FF", bg: "#f0f6fa",
    covers: [
      `${B}/01-monolith-brand/cover.jpg`,
      `${B}/01-monolith-brand/cover-2.jpg`,
    ],
    thumb: `${B}/01-monolith-brand/thumb.jpg`,
    // video: `${B}/01-monolith-brand/preview.mp4`,
    music: "/work/audio/monolith-brand.mp3",
    tagline: "Identity for a firm that intends to be permanent.",
    intro: "A complete brand identity for one of West Africa's fastest-growing private equity firms — built to read as institutional before a word is spoken.",
    challenge: "Monolith was raising a Series A at a time when African PE firms were routinely dismissed by international LPs as operationally immature. They needed a visual identity that communicated institutional readiness — while remaining unmistakably rooted in the African context.",
    approach: [
      "Competitive audit of 40 PE firms across Africa, the Middle East, and Southeast Asia — mapping the visual territory and the white space.",
      "Named for permanence and mass — 'Monolith' communicates solidity, singular conviction, and the geological patience required to build a lasting fund.",
      "Mark developed from Brutalist architectural forms in Lagos and Johannesburg — structures built to outlast the people who commissioned them.",
      "Typography system using only weight and spacing. No colour, no illustration — pure typographic authority.",
      "120-page brand guidelines document designed to be handed to any agency or printer worldwide without interpretation.",
    ],
    deliverables: ["Brand mark & wordmark", "Full visual identity system", "Brand guidelines (120pp)", "Investor deck template", "Website design direction", "Business card & stationery suite", "Email signature system", "Office environmental brief"],
    outcome: "Monolith closed their Series A at $40M within three months of the rebrand. Three LPs cited the identity as communicating institutional readiness they had not previously encountered from an African manager at this stage.",
    metrics: [
      { label: "Series A raised",  value: "$40M"     },
      { label: "LP close rate",    value: "+68%"      },
      { label: "Time to close",    value: "3 months"  },
      { label: "Guidelines",       value: "120 pages" },
    ],
    images: [
      { src: `${B}/01-monolith-brand/cover.jpg`,   span: "full", caption: "Primary brand mark — final form" },
      { src: `${B}/01-monolith-brand/thumb.jpg`,   span: "half", caption: "Business card system" },
      { src: `${B}/01-monolith-brand/thumb.jpg`,   span: "half", caption: "Brand guidelines cover" },
    ],
    next: "syntri-ai",
  },

  // ── 002 ──────────────────────────────────────────────────────────────────────
  {
    id: "syntri-ai", index: "002",
    title: "SyntriAI",
    client: "Domani Ventures",
    year: "2025", status: "Live (Beta)", category: "AI Systems",
    services: ["Product Strategy", "AI Architecture", "UI/UX Design", "Full-Stack Engineering", "API Design"],
    location: "Worldwide",
    color: "#60d4f0", bg: "#f0f8fa",
    covers: [
      `${B}/02-syntri-ai/cover.jpg`,
      `${B}/02-syntri-ai/cover-2.jpg`,
    ],
    thumb: `${B}/02-syntri-ai/thumb.jpg`,
    // video: `${B}/01-monolith-brand/preview.mp4`,
    music: "/work/audio/syntri-ai.mp3",
    tagline: "Organisational knowledge, made queryable.",
    intro: "SyntriAI turns unstructured organisational knowledge into a structured intelligence layer any team member can interrogate in plain language.",
    challenge: "Enterprise organisations accumulate years of institutional knowledge across siloed formats. Existing solutions index documents. SyntriAI understands them — creating semantic relationships and answering questions the way a knowledgeable colleague would.",
    approach: [
      "6-week discovery sprint across 3 enterprise clients to map knowledge architectures and identify the highest-value retrieval patterns.",
      "Knowledge graph architecture that creates semantic relationships between documents rather than keyword indexing.",
      "Natural language query interface that disambiguates intent — users ask questions the way they think.",
      "Unified connector architecture integrating the 12 most common enterprise tool stacks.",
      "Confidence scoring system so every answer surfaces its sources, building organisational trust over time.",
    ],
    deliverables: ["AI architecture design", "Knowledge graph system", "NL query interface", "12-tool connector suite", "Enterprise admin dashboard", "Mobile companion app", "Public API + documentation", "SOC2 compliance docs"],
    outcome: "In private beta with 4 enterprise clients across financial services and healthcare. Processing 2M+ documents monthly. Average query time under 1.4 seconds.",
    metrics: [
      { label: "Docs / month",    value: "2M+"    },
      { label: "Query time",      value: "< 1.4s" },
      { label: "Enterprise beta", value: "4"       },
      { label: "Integrations",    value: "12"      },
    ],
    images: [
      { src: `${B}/02-syntri-ai/cover.jpg`, span: "full", caption: "Query interface — production" },
      { src: `${B}/02-syntri-ai/thumb.jpg`, span: "half", caption: "Knowledge graph view" },
      { src: `${B}/02-syntri-ai/thumb.jpg`, span: "half", caption: "Enterprise dashboard" },
    ],
    next: "veyra",
  },

  // ── 003 ──────────────────────────────────────────────────────────────────────
  {
    id: "veyra", index: "003",
    title: "Veyra",
    client: "Domani Ventures",
    year: "2025", status: "Pre-launch", category: "Product Design",
    services: ["Brand Identity", "Product Design", "iOS Engineering", "AI Integration", "Content Strategy"],
    location: "Lagos · London",
    color: "#f0a0c0", bg: "#faf0f4",
    covers: [
      `${B}/03-veyra/cover.jpg`,
      `${B}/03-veyra/cover-2.jpg`,
    ],
    thumb: `${B}/03-veyra/thumb.jpg`,
    // video: `${B}/01-monolith-brand/preview.mp4`,
    music: "/work/audio/veyra.mp3",
    tagline: "For the woman who already knows who she is.",
    intro: "Body-aware styling, outfit generation, and daily look intelligence for confident, taste-led women — without the noise.",
    challenge: "Existing wardrobe apps ignore the African consumer entirely, or globalise a Western fashion logic that doesn't apply. Veyra had to be built from that cultural context — not adapted to it.",
    approach: [
      "34 in-depth interviews with women aged 22–38 across Lagos, Accra, and London — mapping wardrobe psychology and daily dressing friction.",
      "Proprietary body graph system that maps proportions, undertone, and personal aesthetic vocabulary — not just size.",
      "AI styling engine that weighs occasion, weather, cultural context, and the user's own past choices together.",
      "Editorial content system so the app feels like a trusted stylist, not a recommendation algorithm.",
      "Pre-registration campaign across Instagram and TikTok — 8,400 waitlist signups before a line of code.",
    ],
    deliverables: ["Brand identity & visual language", "iOS app (Swift/SwiftUI)", "Wardrobe graph system", "AI styling engine", "Body-aware recommendations", "Editorial content pipeline", "Social campaign assets", "Press kit"],
    outcome: "Pre-launch waitlist of 8,400 across Nigeria, Ghana, and the UK. Featured in Bella Naija and Guardian Style. Seed term sheet signed. iOS launch scheduled Q2 2025.",
    metrics: [
      { label: "Waitlist",       value: "8,400"  },
      { label: "Avg session",    value: "11 min" },
      { label: "Press features", value: "12"     },
      { label: "Seed funding",   value: "Signed" },
    ],
    images: [
      { src: `${B}/03-veyra/cover.jpg`, span: "full", caption: "Veyra — home screen" },
      { src: `${B}/03-veyra/thumb.jpg`, span: "half", caption: "Outfit builder interface" },
      { src: `${B}/03-veyra/thumb.jpg`, span: "half", caption: "Brand identity system" },
    ],
    next: "ydbi",
  },

  // ── 004 ──────────────────────────────────────────────────────────────────────
  {
    id: "ydbi", index: "004",
    title: "YDBI",
    client: "Domani Ventures",
    year: "2025", status: "In Development", category: "AI Systems",
    services: ["Product Architecture", "Voice AI", "iOS Engineering", "Android Engineering", "API Design"],
    location: "Worldwide",
    color: "#a0d0ff", bg: "#f0f4fa",
    covers: [`${B}/04-ydbi/cover.jpg`],
    thumb: `${B}/04-ydbi/thumb.jpg`,
    // video: `${B}/01-monolith-brand/preview.mp4`,
    music: "/work/audio/syntri-ai.mp3",
    tagline: "The intelligence layer you never have to think about.",
    intro: "A voice-first AI butler that learns how you work and quietly handles the operational layer of your life.",
    challenge: "Every AI assistant on the market requires the user to adapt to it. YDBI inverts this — ambient, frictionless, contextually aware enough that using it feels like thinking out loud.",
    approach: [
      "Mapped 200 most common high-friction micro-tasks across 50 professionals and built the first version exclusively around those.",
      "Voice-first as the primary interaction paradigm — no typing, no navigation, no mode-switching.",
      "Persistent memory and context engine using pgvector retaining preferences across sessions indefinitely.",
      "Whisper for speech recognition, ElevenLabs for synthesis — the voice had to feel like a person.",
      "API gateway for B2B deployment so enterprises can white-label YDBI as an internal productivity layer.",
    ],
    deliverables: ["Postgres schema (29 tables, 16 migrations)", "Voice interaction system", "iOS app (Swift)", "Android app (Kotlin)", "API gateway & auth", "Memory & context engine", "Admin dashboard", "B2B deployment docs"],
    outcome: "Phase 1 infrastructure complete. 4 enterprise partners signed for B2B pilot. Consumer beta opening Q3 2025.",
    metrics: [
      { label: "DB tables",         value: "29"       },
      { label: "Enterprise pilots", value: "4 signed" },
      { label: "Voice latency",     value: "< 800ms"  },
      { label: "Memory",            value: "Unlimited" },
    ],
    images: [
      { src: `${B}/04-ydbi/cover.jpg`, span: "full", caption: "YDBI — voice interface" },
      { src: `${B}/04-ydbi/thumb.jpg`, span: "half", caption: "Mobile app iOS" },
      { src: `${B}/04-ydbi/thumb.jpg`, span: "half", caption: "Memory graph view" },
    ],
    next: "meridian-bank",
  },

  // ── 005 ──────────────────────────────────────────────────────────────────────
  {
    id: "meridian-bank", index: "005",
    title: "Meridian",
    client: "Meridian MFB",
    year: "2024", status: "Delivered", category: "Brand Identity",
    services: ["Naming", "Brand Identity", "Product UI/UX", "Campaign Strategy", "Environmental Design"],
    location: "Abuja, Nigeria",
    color: "#90d090", bg: "#f0f8f0",
    covers: [`${B}/05-meridian-bank/cover.jpg`],
    thumb: `${B}/05-meridian-bank/thumb.jpg`,
    video: `${B}/05-meridian-bank/preview.mp4`,
    music: "/work/audio/meridian-bank.mp3",
    tagline: "From last-resort lender to trusted financial partner.",
    intro: "Complete repositioning of a micro-finance bank — from a last-resort lender to a proactive partner for Nigeria's emerging middle class.",
    challenge: "Meridian had strong fundamentals but a brand that communicated desperation rather than aspiration. Their target customer associated them with people who couldn't get credit anywhere else.",
    approach: [
      "Brand perception research across 200 customers in Abuja, Kaduna, and Jos — mapping the exact source of the trust deficit.",
      "Repositioned around 'financial partnership' — not lending, not banking, but a long-term relationship with your growth.",
      "Redesigned every physical and digital touchpoint simultaneously — branch, app, marketing — for consistent experience shift.",
      "New visual identity drawing from Nigerian architectural modernism: clean, geometric, confident, African.",
      "12-week campaign anchored in real customer stories, not product features.",
    ],
    deliverables: ["New brand name & identity", "Branch interior brief", "Mobile banking UI (60+ screens)", "ATM interface redesign", "Marketing campaign (OOH, digital, radio)", "Staff guidelines", "Digital onboarding", "Annual report"],
    outcome: "Customer acquisition +340% in 6 months. App rated 4.8 on App Store within 30 days. Branch foot traffic +180%. NPL ratio down 12%.",
    metrics: [
      { label: "Acquisition",    value: "+340%" },
      { label: "App Store",      value: "4.8 ★" },
      { label: "Branch traffic", value: "+180%" },
      { label: "NPL ratio",      value: "−12%"  },
    ],
    images: [
      { src: `${B}/05-meridian-bank/cover.jpg`, span: "full", caption: "Meridian — brand identity" },
      { src: `${B}/05-meridian-bank/thumb.jpg`, span: "half", caption: "Mobile app home" },
      { src: `${B}/05-meridian-bank/thumb.jpg`, span: "half", caption: "Branch interior" },
    ],
    next: "zehn-identity",
  },

  // ── 006 ──────────────────────────────────────────────────────────────────────
  {
    id: "zehn-identity", index: "006",
    title: "Zehn",
    client: "Zehn Logistics",
    year: "2023", status: "Delivered", category: "Brand Identity",
    services: ["Brand Strategy", "Visual Identity", "Motion System", "Vehicle Livery", "Environmental Design"],
    location: "Lagos · Abuja · Port Harcourt",
    color: "#f0d060", bg: "#faf8f0",
    covers: [`${B}/06-zehn-identity/cover.jpg`],
    thumb: `${B}/06-zehn-identity/thumb.jpg`,
    tagline: "Speed made visible.",
    intro: "A precision logistics brand built to communicate speed, reliability, and intelligence — at boardroom level and at 120km/h on the expressway.",
    challenge: "Nigeria's logistics sector is dominated by brands that look either corporate-generic or scrappy-startup. Zehn wanted to own the idea of precision — and needed a brand that could command that meaning visually, at scale, across 200+ vehicles.",
    approach: [
      "Entire identity system built on a strict 10-degree angle — every element derives from this single formal constraint.",
      "Yellow-black colour system tested at distance, in rain, at night, and in sunlight before finalisation.",
      "Motion identity — animated transitions and loading states — communicating the sensation of controlled speed.",
      "Fleet livery specified across 7 vehicle types: motorcycles to 40-tonne articulated lorries.",
      "B2B sales system — deck templates, pricing matrices, case study formats — to support enterprise acquisition.",
    ],
    deliverables: ["Brand identity system", "Motion identity & animations", "Fleet livery (200+ vehicles)", "Driver uniform design", "B2B sales collateral", "Digital & OOH ad campaign", "App icon & UI direction", "Depot environmental design"],
    outcome: "3 major FMCG clients onboarded within 60 days. 22% uplift in enterprise inbound enquiries attributable to fleet visibility. Expanded to Port Harcourt 4 months ahead of schedule.",
    metrics: [
      { label: "Clients in 60d",  value: "3"      },
      { label: "Inbound uplift",  value: "+22%"   },
      { label: "Fleet size",      value: "200+"   },
      { label: "Expansion",       value: "4mo early" },
    ],
    images: [
      { src: `${B}/06-zehn-identity/cover.jpg`, span: "full", caption: "Zehn — fleet livery" },
      { src: `${B}/06-zehn-identity/thumb.jpg`, span: "half", caption: "Brand mark" },
      { src: `${B}/06-zehn-identity/thumb.jpg`, span: "half", caption: "Motion identity" },
    ],
    next: "forge-platform",
  },

  // ── 007 ──────────────────────────────────────────────────────────────────────
  {
    id: "forge-platform", index: "007",
    title: "Forge",
    client: "Forge Labs",
    year: "2024", status: "Delivered", category: "Product Engineering",
    services: ["Product Design", "Full-Stack Engineering", "AI Integration", "Infrastructure Architecture"],
    location: "Remote",
    color: "#c090f0", bg: "#f8f0fa",
    covers: [`${B}/07-forge-platform/cover.jpg`],
    thumb: `${B}/07-forge-platform/thumb.jpg`,
    tagline: "AI-native developer tooling.",
    intro: "A developer tooling platform automating code review, documentation generation, and technical debt analysis for engineering teams.",
    challenge: "Engineering teams spend 30–40% of their time on process overhead. Forge Labs needed a platform that didn't just surface these problems — but solved them automatically, in the context of the specific codebase.",
    approach: [
      "Embedded with 3 engineering teams for 4 weeks to map exact workflow pain points and identify the highest-value automation targets.",
      "Code review engine that understands intent, not just syntax — flagging logic errors, security issues, and architectural violations.",
      "Documentation generator that writes in the voice of the codebase — matching existing patterns and terminology.",
      "Technical debt dashboard quantifying debt in estimated fix time and risk score for non-technical stakeholders.",
      "Direct GitHub and GitLab integration — no context switching from existing workflows.",
    ],
    deliverables: ["Platform architecture", "AI code review engine", "Documentation generator", "Technical debt dashboard", "GitHub & GitLab integrations", "Team collaboration features", "Analytics module", "Enterprise SSO"],
    outcome: "Adopted by 14 engineering teams in 90 days. PR review time −68%. Documentation coverage from 23% to 91%. Two enterprise annual contracts signed.",
    metrics: [
      { label: "Teams adopted", value: "14"    },
      { label: "PR review time", value: "−68%" },
      { label: "Doc coverage",   value: "91%"  },
      { label: "Enterprise ARR", value: "Signed" },
    ],
    images: [
      { src: `${B}/07-forge-platform/cover.jpg`, span: "full", caption: "Forge — code review" },
      { src: `${B}/07-forge-platform/thumb.jpg`, span: "half", caption: "Technical debt dashboard" },
      { src: `${B}/07-forge-platform/thumb.jpg`, span: "half", caption: "Documentation generator" },
    ],
    next: "nova-health",
  },

  // ── 008 ──────────────────────────────────────────────────────────────────────
  {
    id: "nova-health", index: "008",
    title: "Nova Health",
    client: "Nova Health Systems",
    year: "2024", status: "Delivered", category: "Strategy",
    services: ["Strategic Consulting", "Brand Architecture", "Digital Platform", "Patient UX", "Environmental Design"],
    location: "Accra, Ghana",
    color: "#60e0c0", bg: "#f0faf8",
    covers: [`${B}/08-nova-health/cover.jpg`],
    thumb: `${B}/08-nova-health/thumb.jpg`,
    tagline: "Rebuilding healthcare trust, systematically.",
    intro: "Strategic and brand infrastructure for a multi-site healthcare network — rebuilding trust, identity, and operational systems simultaneously.",
    challenge: "Nova had acquired 3 independent clinics that operated under different names with inconsistent patient experiences. Patients had no reason to know they were part of the same network — and no reason to trust that consistency even if they did.",
    approach: [
      "Patient research across 180 existing and 80 lapsed patients — mapping the specific nature of trust concerns at each site.",
      "Brand architecture unifying 3 clinics under a Nova family while preserving local equity built in each neighbourhood.",
      "Patient portal as the primary trust-building mechanism — clear, human, and responsive in a sector known for opacity.",
      "Staff experience programme so internal culture shifted alongside the external brand.",
      "Physical environments of all 3 sites redesigned simultaneously for a consistent sensory experience.",
    ],
    deliverables: ["Brand architecture (6 sub-brands)", "Patient portal platform", "Staff experience programme", "Environmental wayfinding (3 sites)", "Telemedicine UI design", "Brand rollout playbook", "Annual communications calendar"],
    outcome: "Patient NPS 34 → 71. Telemedicine hit 40% of all appointments within 6 months. 3 clinics unified. 4th site now opening.",
    metrics: [
      { label: "Patient NPS",   value: "34 → 71" },
      { label: "Telemedicine",  value: "40%"      },
      { label: "Sites unified", value: "3"         },
      { label: "New sites",     value: "+1"        },
    ],
    images: [
      { src: `${B}/08-nova-health/cover.jpg`, span: "full", caption: "Nova Health — brand system" },
      { src: `${B}/08-nova-health/thumb.jpg`, span: "half", caption: "Patient portal" },
      { src: `${B}/08-nova-health/thumb.jpg`, span: "half", caption: "Environmental wayfinding" },
    ],
    next: "axiom-strategy",
  },

  // ── 009 ──────────────────────────────────────────────────────────────────────
  {
    id: "axiom-strategy", index: "009",
    title: "Axiom",
    client: "Axiom Advisory",
    year: "2023", status: "Delivered", category: "Strategy",
    services: ["Strategic Consulting", "Brand Positioning", "Visual Identity", "Executive Communications"],
    location: "London · Lagos",
    color: "#f0b860", bg: "#faf8f0",
    covers: [`${B}/09-axiom-strategy/cover.jpg`],
    thumb: `${B}/09-axiom-strategy/thumb.jpg`,
    tagline: "Africa's global strategy firm.",
    intro: "Repositioning an established consultancy as the definitive strategic partner for African organisations scaling internationally.",
    challenge: "Axiom was caught in a positioning trap — too international for African companies wanting local context, too African for international firms questioning global capability. Losing pitches at both ends.",
    approach: [
      "12 stakeholder interviews with clients, lost prospects, and internal partners to precisely diagnose the positioning failure.",
      "Clear white space identified: the advisor combining genuine African market depth with world-class strategic rigour.",
      "New positioning narrative: 'Africa's global strategy firm' — geography as asset, not qualifier.",
      "Identity refresh carrying the authority of a global firm while retaining visible African authorship.",
      "Thought leadership content programme to demonstrate the positioning, not just claim it.",
    ],
    deliverables: ["Market positioning strategy", "Brand identity refresh", "Thought leadership platform", "New business presentation system", "Executive communications framework", "Website redesign", "Quarterly insight publications"],
    outcome: "4 new international clients in Q1 post-relaunch. International revenue 8% → 35% within 12 months. FT Top 50 African Management Consultancy recognition.",
    metrics: [
      { label: "Intl. revenue",  value: "8% → 35%"  },
      { label: "New clients",    value: "4 in Q1"    },
      { label: "FT ranking",     value: "Top 50"     },
      { label: "Pitch win rate", value: "+44%"       },
    ],
    images: [
      { src: `${B}/09-axiom-strategy/cover.jpg`, span: "full", caption: "Axiom — identity system" },
      { src: `${B}/09-axiom-strategy/thumb.jpg`, span: "half", caption: "Thought leadership" },
      { src: `${B}/09-axiom-strategy/thumb.jpg`, span: "half", caption: "New business deck" },
    ],
    next: "echo-system",
  },

  // ── 010 ──────────────────────────────────────────────────────────────────────
  {
    id: "echo-system", index: "010",
    title: "Echo",
    client: "Echo Infrastructure",
    year: "2025", status: "Live", category: "AI Systems",
    services: ["AI Architecture", "Data Engineering", "Product Strategy", "API Design", "Dashboard Design"],
    location: "Remote",
    color: "#80a8f0", bg: "#f0f2fa",
    covers: [`${B}/10-echo-system/cover.jpg`],
    thumb: `${B}/10-echo-system/thumb.jpg`,
    tagline: "Infrastructure that predicts its own failures.",
    intro: "An AI-driven monitoring system that predicts, diagnoses, and resolves server and network anomalies before they become incidents.",
    challenge: "Traditional monitoring tools are reactive — they tell you something broke after it broke. Most incidents are predictable if you have the right model looking at the right signals with enough context.",
    approach: [
      "Analysed 18 months of incident logs from 3 enterprise clients to identify precursor signal patterns.",
      "ML anomaly detection pipeline that learns what 'normal' looks like for each specific environment.",
      "Automated remediation engine with human-in-the-loop controls — acts on low-risk anomalies, escalates on high-risk.",
      "Dashboard surfacing the 5 most important things at any moment, not a firehose of alerts.",
      "Multi-cloud integrations for AWS, GCP, and Azure with a shared abstraction layer.",
    ],
    deliverables: ["ML anomaly detection pipeline", "Real-time monitoring dashboard", "Automated remediation engine", "Multi-cloud integration (AWS/GCP/Azure)", "Alert & escalation system", "Analytics module", "Public API", "Runbook automation templates"],
    outcome: "MTTD reduced 91%. 3 major outages prevented in first 60 days. 40,000+ endpoints monitored across 8 clients. 2 additional enterprise deployments signed.",
    metrics: [
      { label: "MTTD reduction",    value: "91%"     },
      { label: "Outages prevented", value: "3 in 60d" },
      { label: "Endpoints",         value: "40,000+" },
      { label: "Clients live",      value: "8"        },
    ],
    images: [
      { src: `${B}/10-echo-system/cover.jpg`, span: "full", caption: "Echo — monitoring dashboard" },
      { src: `${B}/10-echo-system/thumb.jpg`, span: "half", caption: "Anomaly detection" },
      { src: `${B}/10-echo-system/thumb.jpg`, span: "half", caption: "Multi-cloud topology" },
    ],
    next: "monolith-brand",
  },
]

export const getProject     = (id: string) => PROJECTS.find(p => p.id === id)
export const getNextProject = (id: string) => { const p = getProject(id); return p ? getProject(p.next) : undefined }