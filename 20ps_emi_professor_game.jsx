import { useEffect, useState } from "react";
import { downloadResultsCsv, fetchResultsSummary, submitGameResult } from "./src/resultsApi.js";

/* ─── DATA ──────────────────────────────────────────────────────────────── */
const LEVELS = [
  {
    key: "MEGA", label: "MEGA", sublabel: "Structural Conditions",
    hue: "#B5451B", soft: "#FDF0EB", border: "#E8A98A",
    description: "Global & institutional context shaping EMI policy and positioning.",
    icon: "◈"
  },
  {
    key: "MACRO", label: "MACRO", sublabel: "Instructional Architecture",
    hue: "#1B5E8A", soft: "#EBF4FD", border: "#8AC3E8",
    description: "Curriculum and lesson design integrating content and language.",
    icon: "◧"
  },
  {
    key: "MESO", label: "MESO", sublabel: "Interactive Classroom",
    hue: "#3D6B35", soft: "#EDF5EC", border: "#8EC487",
    description: "Discourse strategies promoting dialogic engagement.",
    icon: "◉"
  },
  {
    key: "MICRO", label: "MICRO", sublabel: "Learning Mediation",
    hue: "#6B3580", soft: "#F5EDFA", border: "#C48EDA",
    description: "Cognitive scaffolding, formative feedback, and comprehension support.",
    icon: "◎"
  },
  {
    key: "MENANO", label: "ME·NANO", sublabel: "Reflective Agency",
    hue: "#4A5D2E", soft: "#F0F4E8", border: "#A8BE80",
    description: "Professional identity, collaboration, and reflective praxis.",
    icon: "◐"
  },
];

const CARDS = [
  { id:"policy",       name:"Policy",        level:"MEGA",   meaning:"Understanding and critically analysing national and institutional bilingual/EMI policy frameworks.", scenario:"A provost task-force reviews whether the university's EMI mandate aligns with Taiwan's 2030 Bilingual Policy targets. Which P anchors their deliberation?", theory:"Language policy studies; EMI policy research", challenge:"Policies often lag behind classroom realities — how do you bridge the gap?"},
  { id:"purpose",      name:"Purpose",       level:"MEGA",   meaning:"Articulating a clear, evidence-based rationale for why EMI is implemented and what learning outcomes it serves.", scenario:"Before redesigning a Business Law EMI course, the department asks: 'What learning goals justify teaching this in English rather than Chinese?' Which P drives that question?", theory:"CLIL 4Cs framework; Outcome-based education", challenge:"Purpose can become rhetorical rather than operational. How do you keep it actionable?"},
  { id:"positioning",  name:"Positioning",   level:"MEGA",   meaning:"Determining EMI's curricular role and its relationship to disciplinary goals, programme identity, and degree requirements.", scenario:"A faculty senate debates whether EMI electives should carry language credit, content credit, or both — and how they fit the major's learning map.", theory:"Curriculum policy studies; English as a Lingua Franca", challenge:"Positioning is contested political territory. Who has the authority to decide?"},
  { id:"perspective",  name:"Perspective",   level:"MEGA",   meaning:"Situating local EMI practice within global internationalisation trends and multilingual education research.", scenario:"An instructor reads recent European and East Asian EMI literature to contextualise why students code-switch — and what the research says about allowing it.", theory:"Global EMI research; Multilingualism studies", challenge:"Global frameworks don't always translate to local classrooms. What do you adapt?"},

  { id:"planning",     name:"Planning",      level:"MACRO",  meaning:"Designing lessons with dual objectives: disciplinary content mastery and language development scaffolded in tandem.", scenario:"A Chemistry professor writes both 'Students will explain oxidation-reduction reactions' and 'Students will use hedging language when presenting experimental uncertainty.'", theory:"Curriculum design theory; Backward design (Wiggins & McTighe)", challenge:"Dual-objective planning doubles cognitive demand on the instructor. What's your workflow?"},
  { id:"preparation",  name:"Preparation",   level:"MACRO",  meaning:"Curating materials, building linguistic scaffolding, and organising resources to lower the access barrier to disciplinary content.", scenario:"Before a lecture on contract law, a professor prepares a bilingual key-term glossary, sentence frames for case analysis, and a visual flowchart of legal procedure.", theory:"CLIL pedagogy; Scaffolded instruction", challenge:"Over-scaffolding can reduce cognitive challenge. Where's the balance?"},
  { id:"pacing",       name:"Pacing",        level:"MACRO",  meaning:"Calibrating instructional tempo to manage cognitive load, allow processing time, and sustain engagement in an L2 environment.", scenario:"After noticing glazed expressions at minute 25, a professor inserts a 90-second pair-summary task before resuming the lecture on monetary policy.", theory:"Cognitive Load Theory (Sweller); Instructional pacing research", challenge:"Pacing is dynamic and hard to pre-script. How do you read the room reliably?"},
  { id:"presentation", name:"Presentation",  level:"MACRO",  meaning:"Structuring explanations with multi-modal support — visuals, examples, analogies — to make complex disciplinary ideas accessible in English.", scenario:"A professor uses colour-coded concept maps, numbered steps projected simultaneously with spoken explanation, and a worked example before releasing students to independent tasks.", theory:"Instructional communication research; Dual Coding Theory", challenge:"Presentation can become performance rather than pedagogy. How do you ensure transfer?"},

  { id:"participation",name:"Participation", level:"MESO",   meaning:"Designing structured interaction that ensures all students — not just confident speakers — engage in substantive English-medium dialogue.", scenario:"Instead of open Q&A, a professor uses Think-Pair-Share with assigned roles (reporter, recorder, challenger) to ensure every student produces academic English.", theory:"Sociocultural theory (Vygotsky); Cooperative learning", challenge:"Quiet students may mask comprehension failure. How do you surface it?"},
  { id:"prompting",    name:"Prompting",     level:"MESO",   meaning:"Using strategic questioning sequences to scaffold reasoning, deepen analysis, and shift discourse from recall to critical thinking.", scenario:"A professor responds to a student's surface-level answer with: 'That's one interpretation. What evidence would challenge that claim?' — moving from recall to evaluation.", theory:"Dialogic teaching (Alexander); Socratic questioning", challenge:"Professors often answer their own questions. How do you resist that reflex?"},
  { id:"practice",     name:"Practice",      level:"MESO",   meaning:"Creating meaningful opportunities for students to apply disciplinary knowledge through English, reinforcing both content and language simultaneously.", scenario:"After a lecture on urban planning theory, students negotiate a mock zoning decision in English, applying the concepts just taught under time pressure.", theory:"Classroom discourse research; Task-based language teaching", challenge:"Practice tasks can feel artificial. How do you design for authentic disciplinary use?"},
  { id:"presence",     name:"Presence",      level:"MESO",   meaning:"Projecting clear communication, intellectual authority, and psychological safety so students feel empowered to take risks in English.", scenario:"A professor explicitly says, 'I welcome imperfect English here — what matters is your thinking,' then models self-correction when they stumble on a term.", theory:"Teacher presence research; Affective filter hypothesis (Krashen)", challenge:"Presence can veer into performance anxiety for both professors and students. How do you manage it?"},

  { id:"priorknowledge",name:"Prior Knowledge",level:"MICRO", meaning:"Deliberately activating students' existing conceptual and linguistic resources before introducing new disciplinary content.", scenario:"A professor opens a seminar on post-colonial theory by asking students to free-write for 90 seconds — in any language — what they already know or associate with 'colonialism.'", theory:"Constructivist learning theory; Schema theory", challenge:"Students often underestimate what they already know. How do you surface tacit knowledge?"},
  { id:"processing",   name:"Processing",    level:"MICRO",  meaning:"Supporting meaning-making through structured pauses, guided re-reading, and metacognitive prompts that help students internalise content in L2.", scenario:"A professor hands out a partially-completed graphic organiser. After reading a dense policy excerpt, students complete it collaboratively — forcing active processing rather than passive reception.", theory:"Cognitive processing theory; Elaborative interrogation", challenge:"Processing takes time that content delivery competes for. How do you protect it?"},
  { id:"production",   name:"Production",    level:"MICRO",  meaning:"Integrating spoken or written output tasks that require students to articulate disciplinary understanding — pushing language development alongside content learning.", scenario:"At the end of each seminar, students write a 60-word 'muddiest point' response in English, identifying what remains unclear and why — submitted before they leave.", theory:"Output hypothesis (Swain); CLIL cognition dimension", challenge:"Students may produce English that hides conceptual misunderstanding. How do you distinguish the two?"},
  { id:"progress",     name:"Progress",      level:"MICRO",  meaning:"Continuously monitoring individual and cohort learning trajectories through formative assessment, adjusting instruction in real time.", scenario:"A professor uses anonymous digital polls mid-lecture. When 40% of responses reveal a misconception about statistical significance, they pause and re-teach before moving on.", theory:"Formative assessment research (Black & Wiliam); Assessment for learning", challenge:"Formative data can feel overwhelming in large EMI cohorts. What systems make it manageable?"},

  { id:"portfolio",    name:"Portfolio",     level:"MENANO", meaning:"Systematically documenting EMI teaching experiences, student feedback, and instructional artefacts as evidence of professional growth.", scenario:"A professor maintains a semesterly teaching journal — including anonymised student comments, video clips of classroom discourse, and reflective annotations — to present at a tenure review.", theory:"Teacher professional development; Evidence-based teaching portfolios", challenge:"Portfolios can become compliance documents rather than genuine reflection tools. How do you keep them alive?"},
  { id:"professionalism",name:"Professionalism",level:"MENANO",meaning:"Upholding ethical responsibility, disciplinary integrity, and a commitment to continuous pedagogical improvement within the EMI context.", scenario:"A professor declines to simply translate lectures into English without redesigning them for EMI — recognising that ethical EMI practice demands pedagogical transformation, not mere transliteration.", theory:"Teacher identity research; Professional ethics in HE", challenge:"Professionalism is shaped by institutional incentive structures. How do you maintain it when the system doesn't reward it?"},
  { id:"partnership",  name:"Partnership",   level:"MENANO", meaning:"Building collaborative relationships with colleagues, language specialists, and disciplinary experts to co-design and co-deliver effective EMI.", scenario:"A Physics professor and an EAP lecturer jointly design a lab-report writing module — the physicist ensures disciplinary accuracy, the language specialist designs the writing scaffold.", theory:"Collaborative teaching research; Team teaching in EMI", challenge:"Disciplinary and language specialists often have different professional cultures. How do you bridge them?"},
  { id:"praxis",       name:"Praxis",        level:"MENANO", meaning:"Closing the loop between EMI theory and classroom practice through systematic action research, peer observation, and iterative course redesign.", scenario:"After reading that translanguaging improves comprehension in EMI contexts, a professor trials structured L1-L2 switching in tutorials, collects student outcome data, and revises the approach — then shares findings at a faculty symposium.", theory:"Action research; Reflective practice (Schön); Praxis-oriented teacher development", challenge:"Praxis requires institutional time and trust. How do you create space for it in a research-heavy university?"},
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const levelOf = key => LEVELS.find(l => l.key === key);

function buildLevelBreakdown(answers) {
  return LEVELS.reduce((summary, level) => {
    const items = answers.filter(answer => answer.correct_level === level.key);
    summary[level.key] = {
      correct: items.filter(answer => answer.correct).length,
      total: items.length,
    };
    return summary;
  }, {});
}

function elapsedSeconds(startedAt) {
  return Math.max(0, Math.round((Date.now() - startedAt) / 1000));
}

/* ─── SHARED STYLES ─────────────────────────────────────────────────────── */
const BASE = {
  fontFamily: "'Cormorant Garamond', 'Georgia', serif",
  bg: "#FAFAF7",
  ink: "#1C1C1A",
  muted: "#7A7A72",
  rule: "#E2E0D8",
};

function SaveStatus({ status }) {
  if (status === "idle") return null;
  const messages = {
    saving: "Saving anonymous result…",
    saved: "Anonymous result saved.",
    disabled: "Result collection is not configured yet.",
    error: "Could not save the result. The game still works normally.",
  };
  const colors = {
    saving: BASE.muted,
    saved: "#3D6B35",
    disabled: BASE.muted,
    error: "#B5451B",
  };

  return (
    <div style={{
      marginTop: 10,
      fontFamily: "'DM Mono'",
      fontSize: 11,
      letterSpacing: "0.04em",
      color: colors[status] || BASE.muted,
    }}>
      {messages[status] || messages.error}
    </div>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #FAFAF7; }
  ::selection { background: #B5451B22; }

  .card-drag { cursor: grab; transition: box-shadow 0.2s, transform 0.15s; }
  .card-drag:active { cursor: grabbing; }
  .card-drag:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }

  .drop-zone { transition: background 0.2s, border-color 0.2s; }
  .drop-zone.over { background: #FDF0EB !important; border-color: #B5451B !important; }

  .btn-primary {
    background: #1C1C1A; color: #FAFAF7; border: none;
    padding: 12px 28px; font-family: 'DM Mono', monospace; font-size: 13px;
    letter-spacing: 0.08em; cursor: pointer; border-radius: 2px;
    transition: background 0.15s, transform 0.1s;
  }
  .btn-primary:hover { background: #B5451B; transform: translateY(-1px); }
  .btn-primary:disabled { background: #BDBDB5; cursor: default; transform: none; }

  .btn-ghost {
    background: transparent; color: #7A7A72; border: 1px solid #E2E0D8;
    padding: 10px 20px; font-family: 'DM Mono', monospace; font-size: 12px;
    letter-spacing: 0.08em; cursor: pointer; border-radius: 2px;
    transition: border-color 0.15s, color 0.15s;
  }
  .btn-ghost:hover { border-color: #1C1C1A; color: #1C1C1A; }

  .option-btn {
    width: 100%; text-align: left; background: white; border: 1px solid #E2E0D8;
    padding: 16px 20px; cursor: pointer; border-radius: 4px;
    font-family: 'Cormorant Garamond', serif; font-size: 17px; line-height: 1.5;
    transition: border-color 0.15s, background 0.15s; color: #1C1C1A;
  }
  .option-btn:hover:not(:disabled) { border-color: #1C1C1A; background: #F7F6F2; }
  .option-btn:disabled { cursor: default; }
  .option-btn.correct { border-color: #3D6B35; background: #EDF5EC; color: #2A4D25; }
  .option-btn.wrong { border-color: #B5451B; background: #FDF0EB; color: #8A2E0D; }
  .option-btn.neutral-show { border-color: #3D6B35; background: #EDF5EC; color: #2A4D25; }

  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  .fade-in { animation: fadeIn 0.35s ease forwards; }
  @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  .slide-up { animation: slideUp 0.4s ease forwards; }

  .progress-bar { height: 3px; background: #E2E0D8; border-radius: 99px; overflow: hidden; }
  .progress-fill { height: 100%; background: #B5451B; border-radius: 99px; transition: width 0.5s ease; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #DDDDD5; border-radius: 3px; }
`;

/* ─── HOME SCREEN ───────────────────────────────────────────────────────── */
function HomeScreen({ onStart }) {
  return (
    <div style={{ minHeight: "100vh", background: BASE.bg, display: "flex", flexDirection: "column" }}>
      <style>{css}</style>

      {/* Nav */}
      <nav style={{ borderBottom: `1px solid ${BASE.rule}`, padding: "20px 48px", display: "flex", alignItems: "baseline", gap: 16 }}>
        <span style={{ fontFamily: "'DM Mono'", fontSize: 12, color: BASE.muted, letterSpacing: "0.12em", textTransform: "uppercase" }}>EMI · Pedagogy Lab</span>
        <span style={{ color: BASE.rule }}>—</span>
        <span style={{ fontFamily: "'DM Mono'", fontSize: 12, color: BASE.muted }}>Yi-hung Liao · NKNU 2026</span>
      </nav>

      {/* Hero */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 48px", maxWidth: 960, margin: "0 auto", width: "100%" }}>
        
        <div className="fade-in" style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ fontFamily: "'DM Mono'", fontSize: 11, letterSpacing: "0.2em", color: BASE.muted, textTransform: "uppercase", marginBottom: 24 }}>
            A Conceptual Toolkit for Bilingual & English-Medium Instruction
          </div>
          <h1 style={{ fontSize: "clamp(44px, 7vw, 80px)", fontWeight: 300, lineHeight: 1.05, color: BASE.ink, marginBottom: 8 }}>
            The 20<span style={{ fontStyle: "italic", color: "#B5451B" }}>Ps</span> Framework
          </h1>
          <h2 style={{ fontSize: "clamp(18px, 2.5vw, 26px)", fontWeight: 300, color: BASE.muted, fontStyle: "italic" }}>
            for Effective EMI Teaching
          </h2>
        </div>

        {/* Level legend */}
        <div className="fade-in" style={{ display: "flex", gap: 0, marginBottom: 60, border: `1px solid ${BASE.rule}`, borderRadius: 4, overflow: "hidden" }}>
          {LEVELS.map((l, i) => (
            <div key={l.key} style={{
              padding: "14px 24px", background: i % 2 === 0 ? "white" : BASE.bg,
              borderRight: i < 4 ? `1px solid ${BASE.rule}` : "none",
              textAlign: "center", minWidth: 120,
            }}>
              <div style={{ fontSize: 22, marginBottom: 6, color: l.hue }}>{l.icon}</div>
              <div style={{ fontFamily: "'DM Mono'", fontSize: 11, color: l.hue, letterSpacing: "0.08em" }}>{l.label}</div>
              <div style={{ fontSize: 12, color: BASE.muted, marginTop: 2, lineHeight: 1.3 }}>{l.sublabel}</div>
            </div>
          ))}
        </div>

        {/* Mode selection */}
        <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, width: "100%", maxWidth: 720, marginBottom: 48 }}>
          {[
            {
              mode: "puzzle",
              title: "Sorting Puzzle",
              subtitle: "Classify & Justify",
              desc: "Assign all 20 P-cards to their correct ecological level. Designed to surface tacit assumptions about EMI pedagogy.",
              icon: "◫",
              time: "10–15 min"
            },
            {
              mode: "quiz",
              title: "Scenario Quiz",
              subtitle: "Analyse & Reflect",
              desc: "Twenty rich classroom vignettes drawn from higher-education EMI contexts. Identify which P each scenario enacts — and why it matters.",
              icon: "◬",
              time: "15–20 min"
            },
          ].map(m => (
            <div
              key={m.mode}
              onClick={() => onStart(m.mode)}
              style={{
                background: "white", border: `1px solid ${BASE.rule}`, borderRadius: 4,
                padding: "32px 28px", cursor: "pointer",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#B5451B"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BASE.rule; e.currentTarget.style.boxShadow = "none"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <span style={{ fontSize: 28, color: "#B5451B" }}>{m.icon}</span>
                <span style={{ fontFamily: "'DM Mono'", fontSize: 11, color: BASE.muted }}>{m.time}</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, color: BASE.ink, marginBottom: 4 }}>{m.title}</div>
              <div style={{ fontFamily: "'DM Mono'", fontSize: 11, color: "#B5451B", letterSpacing: "0.08em", marginBottom: 16 }}>{m.subtitle}</div>
              <div style={{ fontSize: 15, color: BASE.muted, lineHeight: 1.7 }}>{m.desc}</div>
              <div style={{ marginTop: 20, fontFamily: "'DM Mono'", fontSize: 12, color: "#B5451B" }}>Begin →</div>
            </div>
          ))}
        </div>

        <div style={{ fontFamily: "'DM Mono'", fontSize: 11, color: "#BDBDB5", textAlign: "center", lineHeight: 1.8 }}>
          20 Ps · 5 Ecological Levels · Mega → Macro → Meso → Micro → Me·Nano
        </div>
      </div>
    </div>
  );
}

/* ─── PUZZLE MODE ───────────────────────────────────────────────────────── */
function PuzzleMode({ onBack }) {
  const [cards, setCards] = useState(() => shuffle(CARDS).map(c => ({ ...c, placed: null })));
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [startedAt, setStartedAt] = useState(() => Date.now());

  const unplaced = cards.filter(c => !c.placed);
  const allPlaced = unplaced.length === 0;

  function drop(levelKey) {
    if (!dragging) return;
    setCards(prev => prev.map(c => c.id === dragging.id ? { ...c, placed: levelKey } : c));
    setDragging(null); setDragOver(null); setChecked(false); setScore(null);
  }
  function dropBack() {
    if (!dragging) return;
    setCards(prev => prev.map(c => c.id === dragging.id ? { ...c, placed: null } : c));
    setDragging(null); setDragOver(null);
  }
  async function savePuzzleResult(n) {
    const answers = cards.map(card => ({
      id: card.id,
      name: card.name,
      correct_level: card.level,
      selected_level: card.placed,
      correct: card.placed === card.level,
    }));

    setSubmitStatus("saving");
    try {
      const result = await submitGameResult({
        mode: "puzzle",
        score: n,
        total: cards.length,
        duration_seconds: elapsedSeconds(startedAt),
        answers,
        level_breakdown: buildLevelBreakdown(answers),
      });
      setSubmitStatus(result.skipped ? "disabled" : "saved");
    } catch (error) {
      console.warn("Could not save puzzle result:", error);
      setSubmitStatus("error");
    }
  }
  function check() {
    const n = cards.filter(c => c.placed === c.level).length;
    setScore(n); setChecked(true);
    void savePuzzleResult(n);
  }
  function revealAll() {
    setCards(prev => prev.map(c => ({ ...c, placed: c.level })));
    setChecked(true); setRevealed(true); setScore(cards.filter(c => c.placed === c.level).length);
  }
  function reset() {
    setCards(shuffle(CARDS).map(c => ({ ...c, placed: null })));
    setChecked(false); setRevealed(false); setScore(null); setExpandedCard(null);
    setSubmitStatus("idle"); setStartedAt(Date.now());
  }

  function cardStatus(card) {
    if (!checked || !card.placed) return "neutral";
    return card.placed === card.level ? "correct" : "wrong";
  }

  return (
    <div style={{ minHeight: "100vh", background: BASE.bg, fontFamily: "'Cormorant Garamond', serif" }}>
      <style>{css}</style>

      {/* Top bar */}
      <div style={{ borderBottom: `1px solid ${BASE.rule}`, padding: "16px 32px", background: "white", display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, zIndex: 100 }}>
        <button className="btn-ghost" onClick={onBack}>← Back</button>
        <div style={{ fontFamily: "'DM Mono'", fontSize: 12, color: BASE.muted, letterSpacing: "0.08em" }}>
          SORTING PUZZLE
        </div>
        <div style={{ flex: 1 }}>
          <div className="progress-bar" style={{ maxWidth: 200 }}>
            <div className="progress-fill" style={{ width: `${((20 - unplaced.length) / 20) * 100}%` }} />
          </div>
        </div>
        <span style={{ fontFamily: "'DM Mono'", fontSize: 12, color: BASE.muted }}>{20 - unplaced.length}/20 placed</span>
        {allPlaced && !checked && <button className="btn-primary" onClick={check}>Check Answers</button>}
        <button className="btn-ghost" onClick={revealAll}>Reveal</button>
        <button className="btn-ghost" onClick={reset}>Reset</button>
      </div>

      {/* Score */}
      {checked && score !== null && (
        <div className="fade-in" style={{
          background: score === 20 ? "#EDF5EC" : score >= 14 ? "#EBF4FD" : "#FDF0EB",
          borderBottom: `1px solid ${score === 20 ? "#8EC487" : score >= 14 ? "#8AC3E8" : "#E8A98A"}`,
          padding: "14px 32px", textAlign: "center",
          fontFamily: "'DM Mono'", fontSize: 13, color: score === 20 ? "#2A4D25" : score >= 14 ? "#1B3D5E" : "#8A2E0D",
          letterSpacing: "0.06em",
        }}>
          {score === 20 ? "✦ Perfect — all 20 correctly classified." : `${score}/20 correct · ${20 - score} to review.`}
          {checked && !revealed && score < 20 && <span style={{ marginLeft: 16, opacity: 0.7 }}>Click 'Reveal' to see correct placements.</span>}
          <SaveStatus status={submitStatus} />
        </div>
      )}

      <div style={{ display: "flex", height: "calc(100vh - 57px)", overflow: "hidden" }}>

        {/* Pool */}
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={dropBack}
          style={{ width: 260, borderRight: `1px solid ${BASE.rule}`, overflowY: "auto", padding: "20px 16px", background: "white", flexShrink: 0 }}
        >
          <div style={{ fontFamily: "'DM Mono'", fontSize: 10, letterSpacing: "0.16em", color: BASE.muted, textTransform: "uppercase", marginBottom: 14 }}>
            Unplaced · {unplaced.length}
          </div>
          {unplaced.map(card => {
            const isActive = dragging?.id === card.id;
            return (
              <div
                key={card.id}
                className="card-drag"
                draggable
                onDragStart={() => setDragging(card)}
                onDragEnd={() => { setDragging(null); setDragOver(null); }}
                style={{
                  background: BASE.bg, border: `1px solid ${BASE.rule}`, borderRadius: 4,
                  padding: "12px 14px", marginBottom: 8,
                  opacity: isActive ? 0.3 : 1,
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 600, color: BASE.ink, marginBottom: 2 }}>{card.name}</div>
                <div style={{ fontSize: 12, color: BASE.muted, lineHeight: 1.4 }}>{card.meaning.slice(0, 64)}…</div>
              </div>
            );
          })}
          {unplaced.length === 0 && (
            <div style={{ fontSize: 14, color: BASE.muted, fontStyle: "italic", textAlign: "center", marginTop: 32 }}>
              All cards placed.
            </div>
          )}
        </div>

        {/* Levels */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {LEVELS.map(level => {
            const levelCards = cards.filter(c => c.placed === level.key);
            const isOver = dragOver === level.key;
            return (
              <div
                key={level.key}
                className={`drop-zone ${isOver ? "over" : ""}`}
                onDragOver={e => { e.preventDefault(); setDragOver(level.key); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={() => drop(level.key)}
                style={{
                  border: `1px solid ${isOver ? level.hue : level.border}`,
                  borderRadius: 4, padding: "16px 18px",
                  background: isOver ? level.soft : "white",
                  minHeight: 88,
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 18, color: level.hue }}>{level.icon}</span>
                  <span style={{ fontFamily: "'DM Mono'", fontSize: 13, color: level.hue, letterSpacing: "0.06em" }}>{level.label}</span>
                  <span style={{ fontSize: 15, color: BASE.muted, fontStyle: "italic" }}>{level.sublabel}</span>
                  <span style={{ marginLeft: "auto", fontFamily: "'DM Mono'", fontSize: 11, color: BASE.muted }}>{levelCards.length}/4</span>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {levelCards.length === 0 && (
                    <div style={{
                      border: `1px dashed ${level.border}`, borderRadius: 4,
                      padding: "8px 16px", fontSize: 13, color: level.border,
                      fontStyle: "italic",
                    }}>Drop P-cards here</div>
                  )}
                  {levelCards.map(card => {
                    const st = cardStatus(card);
                    const expanded = expandedCard === card.id;
                    return (
                      <div
                        key={card.id}
                        draggable={!checked}
                        onDragStart={() => !checked && setDragging(card)}
                        onDragEnd={() => { setDragging(null); setDragOver(null); }}
                        onClick={() => setExpandedCard(expanded ? null : card.id)}
                        style={{
                          background: st === "correct" ? "#EDF5EC" : st === "wrong" ? "#FDF0EB" : level.soft,
                          border: `1px solid ${st === "correct" ? "#8EC487" : st === "wrong" ? "#E8A98A" : level.border}`,
                          borderRadius: 4, padding: "8px 12px", cursor: checked ? "pointer" : "grab",
                          maxWidth: expanded ? "100%" : "auto",
                          width: expanded ? "100%" : "auto",
                          transition: "all 0.2s",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {st === "correct" && <span style={{ color: "#3D6B35", fontSize: 12 }}>✓</span>}
                          {st === "wrong" && <span style={{ color: "#B5451B", fontSize: 12 }}>✗</span>}
                          <span style={{ fontSize: 15, fontWeight: 600, color: st === "correct" ? "#2A4D25" : st === "wrong" ? "#8A2E0D" : BASE.ink }}>{card.name}</span>
                          {checked && <span style={{ fontSize: 11, color: BASE.muted, marginLeft: 4 }}>▾</span>}
                        </div>
                        {expanded && checked && (
                          <div className="fade-in" style={{ marginTop: 10, borderTop: `1px solid ${level.border}`, paddingTop: 10 }}>
                            {st === "wrong" && (
                              <div style={{ fontFamily: "'DM Mono'", fontSize: 11, color: "#B5451B", marginBottom: 6 }}>
                                Correct level: {levelOf(card.level)?.label}
                              </div>
                            )}
                            <div style={{ fontSize: 14, color: BASE.muted, lineHeight: 1.6, marginBottom: 8 }}>{card.meaning}</div>
                            <div style={{ fontFamily: "'DM Mono'", fontSize: 11, color: BASE.muted }}>📚 {card.theory}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Discussion prompts after checking */}
          {checked && (
            <div className="fade-in" style={{ border: `1px solid ${BASE.rule}`, borderRadius: 4, padding: 24, background: "white", marginTop: 8 }}>
              <div style={{ fontFamily: "'DM Mono'", fontSize: 11, letterSpacing: "0.12em", color: BASE.muted, textTransform: "uppercase", marginBottom: 16 }}>
                Reflection Prompts
              </div>
              {[
                "Which P-card generated the most uncertainty in your sorting? What does that uncertainty reveal about how you conceptualise EMI?",
                "Were there any Ps you placed correctly for the wrong reasons? How would you reframe your rationale?",
                "Which level do you find most underrepresented in your current EMI practice — and why?",
              ].map((q, i) => (
                <div key={i} style={{ display: "flex", gap: 14, marginBottom: 14, alignItems: "flex-start" }}>
                  <span style={{ fontFamily: "'DM Mono'", fontSize: 12, color: "#B5451B", flexShrink: 0, marginTop: 2 }}>0{i + 1}</span>
                  <span style={{ fontSize: 16, color: BASE.ink, lineHeight: 1.6, fontStyle: "italic" }}>{q}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── QUIZ MODE ─────────────────────────────────────────────────────────── */
function QuizMode({ onBack }) {
  const [phase, setPhase] = useState("intro"); // intro | quiz | result
  const [queue] = useState(() => shuffle(CARDS));
  const [optionsByCard] = useState(() => Object.fromEntries(CARDS.map(card => {
    const correctLevel = levelOf(card.level);
    const distractors = shuffle(LEVELS.filter(l => l.key !== card.level)).slice(0, 3);
    return [card.id, shuffle([correctLevel, ...distractors])];
  })));
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [log, setLog] = useState([]);
  const [showChallenge, setShowChallenge] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [submitted, setSubmitted] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());

  const card = queue[idx];
  const level = card ? levelOf(card.level) : null;

  const options = card ? optionsByCard[card.id] : [];

  useEffect(() => {
    if (phase !== "result" || submitted) return;

    const answers = log.map(entry => ({
      id: entry.card.id,
      name: entry.card.name,
      correct_level: entry.card.level,
      selected_level: entry.selected,
      correct: entry.correct,
    }));

    setSubmitted(true);
    setSubmitStatus("saving");
    submitGameResult({
      mode: "quiz",
      score,
      total: queue.length,
      duration_seconds: elapsedSeconds(startedAt),
      answers,
      level_breakdown: buildLevelBreakdown(answers),
    })
      .then(result => setSubmitStatus(result.skipped ? "disabled" : "saved"))
      .catch(error => {
        console.warn("Could not save quiz result:", error);
        setSubmitStatus("error");
      });
  }, [phase, submitted, log, score, queue.length, startedAt]);

  function select(lKey) {
    if (showAnswer) return;
    setSelected(lKey);
    setShowAnswer(true);
    const correct = lKey === card.level;
    if (correct) setScore(s => s + 1);
    setLog(l => [...l, { card, selected: lKey, correct }]);
  }

  function next() {
    if (idx + 1 >= queue.length) { setPhase("result"); return; }
    setIdx(i => i + 1); setSelected(null); setShowAnswer(false); setShowChallenge(false);
  }

  function restart() {
    setPhase("intro");
    setIdx(0); setSelected(null); setShowAnswer(false); setScore(0); setLog([]); setShowChallenge(false);
    setSubmitStatus("idle"); setSubmitted(false); setStartedAt(Date.now());
  }

  if (phase === "intro") return (
    <div style={{ minHeight: "100vh", background: BASE.bg, fontFamily: "'Cormorant Garamond', serif" }}>
      <style>{css}</style>
      <div style={{ borderBottom: `1px solid ${BASE.rule}`, padding: "16px 32px", background: "white", display: "flex", alignItems: "center", gap: 16 }}>
        <button className="btn-ghost" onClick={onBack}>← Back</button>
        <div style={{ fontFamily: "'DM Mono'", fontSize: 12, color: BASE.muted, letterSpacing: "0.08em" }}>SCENARIO QUIZ</div>
      </div>
      <div style={{ maxWidth: 640, margin: "80px auto", padding: "0 32px" }}>
        <div className="slide-up">
          <div style={{ fontFamily: "'DM Mono'", fontSize: 11, color: BASE.muted, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 24 }}>How it works</div>
          <h2 style={{ fontSize: 36, fontWeight: 300, color: BASE.ink, marginBottom: 24, lineHeight: 1.2 }}>
            Twenty vignettes from <em>real</em> EMI classrooms.
          </h2>
          <p style={{ fontSize: 18, color: BASE.muted, lineHeight: 1.8, marginBottom: 32 }}>
            Each scenario describes a moment in an English-medium higher-education classroom. Your task: identify which of the 20 Ps the professor is enacting — and what level of the ecological framework it belongs to.
          </p>
          <div style={{ borderLeft: `3px solid #B5451B`, paddingLeft: 20, marginBottom: 40 }}>
            <p style={{ fontSize: 15, color: BASE.muted, lineHeight: 1.7, fontStyle: "italic" }}>
              This is not a recall test. It is an analytical exercise designed to sharpen your conceptual precision — and to surface the assumptions you bring to EMI teaching.
            </p>
          </div>
          {[
            ["20", "classroom scenarios"],
            ["5", "ecological levels to classify"],
            ["Reflection", "after each answer — including a professional challenge"],
          ].map(([n, l]) => (
            <div key={n} style={{ display: "flex", gap: 20, alignItems: "baseline", marginBottom: 12, borderBottom: `1px solid ${BASE.rule}`, paddingBottom: 12 }}>
              <span style={{ fontFamily: "'DM Mono'", fontSize: 16, color: "#B5451B", minWidth: 80 }}>{n}</span>
              <span style={{ fontSize: 17, color: BASE.muted }}>{l}</span>
            </div>
          ))}
          <button className="btn-primary" style={{ marginTop: 32 }} onClick={() => { setStartedAt(Date.now()); setPhase("quiz"); }}>Begin Quiz →</button>
        </div>
      </div>
    </div>
  );

  if (phase === "result") {
    const wrong = log.filter(l => !l.correct);
    const pct = Math.round((score / 20) * 100);
    return (
      <div style={{ minHeight: "100vh", background: BASE.bg, fontFamily: "'Cormorant Garamond', serif" }}>
        <style>{css}</style>
        <div style={{ borderBottom: `1px solid ${BASE.rule}`, padding: "16px 32px", background: "white", display: "flex", gap: 16 }}>
          <button className="btn-ghost" onClick={onBack}>← Back</button>
          <div style={{ fontFamily: "'DM Mono'", fontSize: 12, color: BASE.muted, letterSpacing: "0.08em" }}>RESULTS</div>
        </div>
        <div style={{ maxWidth: 760, margin: "60px auto", padding: "0 32px" }}>
          <div className="slide-up">
            <div style={{ display: "flex", gap: 48, alignItems: "flex-end", marginBottom: 48, paddingBottom: 48, borderBottom: `1px solid ${BASE.rule}` }}>
              <div>
                <div style={{ fontFamily: "'DM Mono'", fontSize: 11, color: BASE.muted, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 12 }}>Final Score</div>
                <div style={{ fontSize: 72, fontWeight: 300, color: BASE.ink, lineHeight: 1 }}>{score}<span style={{ fontSize: 28, color: BASE.muted }}>/20</span></div>
                <div style={{ fontSize: 20, color: BASE.muted, fontStyle: "italic", marginTop: 8 }}>
                  {pct === 100 ? "Complete mastery of the 20Ps." : pct >= 75 ? "Strong conceptual grasp — refine the edges." : pct >= 50 ? "Solid foundation — revisit the weaker levels." : "Good starting point — the framework takes time to internalise."}
                </div>
                <SaveStatus status={submitStatus} />
              </div>
              <div style={{ flex: 1 }}>
                {LEVELS.map(lv => {
                  const total = log.filter(l => l.card.level === lv.key).length;
                  const correct = log.filter(l => l.card.level === lv.key && l.correct).length;
                  return (
                    <div key={lv.key} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      <span style={{ fontFamily: "'DM Mono'", fontSize: 11, color: lv.hue, width: 70 }}>{lv.label}</span>
                      <div style={{ flex: 1, background: "#E2E0D8", borderRadius: 2, height: 6, overflow: "hidden" }}>
                        <div style={{ width: `${total > 0 ? (correct / total) * 100 : 0}%`, height: "100%", background: lv.hue, transition: "width 0.8s ease" }} />
                      </div>
                      <span style={{ fontFamily: "'DM Mono'", fontSize: 11, color: BASE.muted, width: 32, textAlign: "right" }}>{correct}/{total}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {wrong.length > 0 && (
              <>
                <div style={{ fontFamily: "'DM Mono'", fontSize: 11, letterSpacing: "0.14em", color: BASE.muted, textTransform: "uppercase", marginBottom: 20 }}>
                  Items to Revisit ({wrong.length})
                </div>
                {wrong.map((entry, i) => {
                  const correctLv = levelOf(entry.card.level);
                  const selectedLv = levelOf(entry.selected);
                  return (
                    <div key={i} style={{ border: `1px solid ${BASE.rule}`, borderRadius: 4, padding: 24, marginBottom: 16, background: "white" }}>
                      <div style={{ display: "flex", gap: 12, alignItems: "baseline", marginBottom: 12 }}>
                        <span style={{ fontFamily: "'DM Mono'", fontSize: 12, color: "#B5451B", minWidth: 24 }}>{String(i + 1).padStart(2, "0")}</span>
                        <span style={{ fontSize: 20, fontWeight: 600 }}>{entry.card.name}</span>
                      </div>
                      <div style={{ fontSize: 15, color: BASE.muted, fontStyle: "italic", marginBottom: 14, lineHeight: 1.6, paddingLeft: 36 }}>{entry.card.scenario}</div>
                      <div style={{ paddingLeft: 36, display: "flex", gap: 24 }}>
                        <div>
                          <div style={{ fontFamily: "'DM Mono'", fontSize: 10, color: "#B5451B", letterSpacing: "0.1em", marginBottom: 4 }}>YOUR ANSWER</div>
                          <div style={{ fontSize: 14, color: "#B5451B" }}>{selectedLv?.label} · {selectedLv?.sublabel}</div>
                        </div>
                        <div>
                          <div style={{ fontFamily: "'DM Mono'", fontSize: 10, color: "#3D6B35", letterSpacing: "0.1em", marginBottom: 4 }}>CORRECT</div>
                          <div style={{ fontSize: 14, color: "#3D6B35" }}>{correctLv?.label} · {correctLv?.sublabel}</div>
                        </div>
                      </div>
                      <div style={{ paddingLeft: 36, marginTop: 14, fontSize: 14, color: BASE.muted, lineHeight: 1.6 }}>
                        {entry.card.meaning}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 40 }}>
              <button className="btn-primary" onClick={restart}>Try Again</button>
              <button className="btn-ghost" onClick={onBack}>Back to Menu</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz question
  return (
    <div style={{ minHeight: "100vh", background: BASE.bg, fontFamily: "'Cormorant Garamond', serif" }}>
      <style>{css}</style>
      <div style={{ borderBottom: `1px solid ${BASE.rule}`, padding: "14px 32px", background: "white", display: "flex", alignItems: "center", gap: 16, position: "sticky", top: 0, zIndex: 100 }}>
        <button className="btn-ghost" onClick={onBack}>← Back</button>
        <div style={{ fontFamily: "'DM Mono'", fontSize: 12, color: BASE.muted, letterSpacing: "0.08em" }}>SCENARIO QUIZ</div>
        <div style={{ flex: 1, maxWidth: 300 }}>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(idx / 20) * 100}%` }} />
          </div>
        </div>
        <span style={{ fontFamily: "'DM Mono'", fontSize: 12, color: BASE.muted }}>{idx + 1} / 20</span>
        <span style={{ fontFamily: "'DM Mono'", fontSize: 12, color: "#B5451B" }}>✦ {score}</span>
      </div>

      <div style={{ maxWidth: 720, margin: "48px auto", padding: "0 32px" }}>
        <div key={idx} className="slide-up">

          {/* Scenario */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: "'DM Mono'", fontSize: 10, letterSpacing: "0.18em", color: BASE.muted, textTransform: "uppercase", marginBottom: 16 }}>
              Scenario {String(idx + 1).padStart(2, "0")} · Identify the P
            </div>
            <div style={{
              borderLeft: `3px solid #1C1C1A`, paddingLeft: 24,
              fontSize: 20, lineHeight: 1.8, color: BASE.ink, fontStyle: "italic",
            }}>
              {card.scenario}
            </div>
          </div>

          <div style={{ fontFamily: "'DM Mono'", fontSize: 11, color: BASE.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16 }}>
            Which ecological level does this P belong to?
          </div>

          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {options.map(opt => {
              let cls = "option-btn";
              if (showAnswer) {
                if (opt.key === card.level) cls += " correct";
                else if (opt.key === selected) cls += " wrong";
              }
              return (
                <button
                  key={opt.key}
                  className={cls}
                  disabled={showAnswer}
                  onClick={() => select(opt.key)}
                >
                  <span style={{ fontFamily: "'DM Mono'", fontSize: 12, marginRight: 12, color: "inherit", opacity: 0.6 }}>{opt.icon}</span>
                  <strong style={{ fontFamily: "'DM Mono'", fontSize: 13, marginRight: 8 }}>{opt.label}</strong>
                  <span style={{ fontSize: 15, opacity: 0.8 }}>{opt.sublabel}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback panel */}
          {showAnswer && (
            <div className="fade-in" style={{
              border: `1px solid ${selected === card.level ? "#8EC487" : "#E8A98A"}`,
              borderRadius: 4, padding: 28, marginBottom: 24,
              background: selected === card.level ? "#EDF5EC" : "#FDF0EB",
            }}>
              <div style={{ fontFamily: "'DM Mono'", fontSize: 11, letterSpacing: "0.1em", color: selected === card.level ? "#2A4D25" : "#8A2E0D", marginBottom: 16, textTransform: "uppercase" }}>
                {selected === card.level ? "✓ Correct" : `✗ This belongs to ${level?.label} · ${level?.sublabel}`}
              </div>

              <div style={{ fontSize: 17, fontWeight: 600, color: BASE.ink, marginBottom: 8 }}>{card.name}</div>
              <div style={{ fontSize: 16, color: BASE.muted, lineHeight: 1.7, marginBottom: 16 }}>{card.meaning}</div>

              <div style={{ fontFamily: "'DM Mono'", fontSize: 11, color: BASE.muted, marginBottom: 8 }}>Theoretical basis</div>
              <div style={{ fontSize: 14, color: BASE.muted, marginBottom: 20, lineHeight: 1.6 }}>{card.theory}</div>

              <div
                style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8, marginBottom: showChallenge ? 12 : 0 }}
                onClick={() => setShowChallenge(s => !s)}
              >
                <span style={{ fontFamily: "'DM Mono'", fontSize: 11, color: "#B5451B", letterSpacing: "0.1em" }}>
                  {showChallenge ? "▾" : "▸"} PROFESSIONAL CHALLENGE
                </span>
              </div>
              {showChallenge && (
                <div className="fade-in" style={{ borderLeft: `2px solid #B5451B`, paddingLeft: 16, fontSize: 16, color: BASE.ink, lineHeight: 1.7, fontStyle: "italic" }}>
                  {card.challenge}
                </div>
              )}
            </div>
          )}

          {showAnswer && (
            <button className="btn-primary" onClick={next}>
              {idx + 1 >= queue.length ? "View Results →" : "Next Scenario →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── ADMIN DASHBOARD ──────────────────────────────────────────────────── */
function ResultsDashboard({ onBack }) {
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem("20ps-results-token") || "");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadResults(token = adminToken) {
    setLoading(true);
    setError("");
    try {
      const summary = await fetchResultsSummary(token.trim());
      setData(summary);
      if (token.trim()) sessionStorage.setItem("20ps-results-token", token.trim());
    } catch (err) {
      setError(err.message || "Could not load results.");
    } finally {
      setLoading(false);
    }
  }

  async function exportCsv() {
    setError("");
    try {
      await downloadResultsCsv(adminToken.trim());
    } catch (err) {
      setError(err.message || "Could not export CSV.");
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: BASE.bg, fontFamily: "'Cormorant Garamond', serif" }}>
      <style>{css}</style>
      <div style={{ borderBottom: `1px solid ${BASE.rule}`, padding: "16px 32px", background: "white", display: "flex", alignItems: "center", gap: 16 }}>
        <button className="btn-ghost" onClick={onBack}>← Back</button>
        <div style={{ fontFamily: "'DM Mono'", fontSize: 12, color: BASE.muted, letterSpacing: "0.08em" }}>ADMIN DASHBOARD</div>
      </div>

      <div style={{ maxWidth: 980, margin: "48px auto", padding: "0 32px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 42, fontWeight: 300, color: BASE.ink, lineHeight: 1.1, marginBottom: 8 }}>Admin</h1>
          <div style={{ fontSize: 16, color: BASE.muted, lineHeight: 1.6 }}>
            Review anonymous attempts, level accuracy, and export records for analysis.
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 32 }}>
          <input
            value={adminToken}
            onChange={e => setAdminToken(e.target.value)}
            type="password"
            placeholder="Admin token"
            style={{
              flex: 1,
              border: `1px solid ${BASE.rule}`,
              borderRadius: 4,
              padding: "12px 14px",
              fontFamily: "'DM Mono'",
              fontSize: 12,
              color: BASE.ink,
              background: "white",
            }}
          />
          <button className="btn-primary" onClick={() => loadResults()} disabled={loading}>
            {loading ? "Loading…" : "Load Results"}
          </button>
          {data && (
            <button className="btn-ghost" onClick={exportCsv}>
              Export CSV
            </button>
          )}
        </div>

        {error && (
          <div className="fade-in" style={{ border: "1px solid #E8A98A", background: "#FDF0EB", color: "#8A2E0D", padding: 16, borderRadius: 4, marginBottom: 24, fontFamily: "'DM Mono'", fontSize: 12 }}>
            {error}
          </div>
        )}

        {data && (
          <div className="slide-up">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 16, marginBottom: 32 }}>
              {data.totals.map(total => (
                <div key={total.mode} style={{ background: "white", border: `1px solid ${BASE.rule}`, borderRadius: 4, padding: 24 }}>
                  <div style={{ fontFamily: "'DM Mono'", fontSize: 11, color: BASE.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>{total.mode}</div>
                  <div style={{ fontSize: 48, fontWeight: 300, color: BASE.ink, lineHeight: 1 }}>{total.attempts}</div>
                  <div style={{ fontSize: 15, color: BASE.muted, marginTop: 8 }}>
                    Avg. score {total.average_score} · Avg. time {total.average_seconds}s
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: "white", border: `1px solid ${BASE.rule}`, borderRadius: 4, padding: 24, marginBottom: 32 }}>
              <div style={{ fontFamily: "'DM Mono'", fontSize: 11, color: BASE.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 18 }}>Level Accuracy</div>
              {LEVELS.map(level => {
                const stats = data.level_totals[level.key] || { correct: 0, total: 0, accuracy: 0 };
                return (
                  <div key={level.key} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                    <span style={{ fontFamily: "'DM Mono'", fontSize: 11, color: level.hue, width: 78 }}>{level.label}</span>
                    <div style={{ flex: 1, height: 7, borderRadius: 99, background: BASE.rule, overflow: "hidden" }}>
                      <div style={{ width: `${stats.accuracy}%`, height: "100%", background: level.hue }} />
                    </div>
                    <span style={{ fontFamily: "'DM Mono'", fontSize: 11, color: BASE.muted, width: 112, textAlign: "right" }}>
                      {stats.correct}/{stats.total} · {stats.accuracy}%
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ background: "white", border: `1px solid ${BASE.rule}`, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ padding: "18px 20px", borderBottom: `1px solid ${BASE.rule}`, fontFamily: "'DM Mono'", fontSize: 11, color: BASE.muted, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Recent Attempts
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Time", "Mode", "Score", "Duration"].map(label => (
                        <th key={label} style={{ textAlign: "left", padding: "12px 20px", borderBottom: `1px solid ${BASE.rule}`, fontFamily: "'DM Mono'", fontSize: 10, color: BASE.muted, letterSpacing: "0.1em" }}>{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent.map(row => (
                      <tr key={row.id}>
                        <td style={{ padding: "12px 20px", borderBottom: `1px solid ${BASE.rule}`, fontSize: 14, color: BASE.muted }}>{formatDate(row.created_at)}</td>
                        <td style={{ padding: "12px 20px", borderBottom: `1px solid ${BASE.rule}`, fontFamily: "'DM Mono'", fontSize: 12, color: BASE.ink }}>{row.mode}</td>
                        <td style={{ padding: "12px 20px", borderBottom: `1px solid ${BASE.rule}`, fontSize: 15, color: BASE.ink }}>{row.score}/{row.total}</td>
                        <td style={{ padding: "12px 20px", borderBottom: `1px solid ${BASE.rule}`, fontSize: 15, color: BASE.muted }}>{row.duration_seconds ?? "—"}s</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

/* ─── APP ROOT ──────────────────────────────────────────────────────────── */
export default function App() {
  const initialScreen = window.location.pathname.startsWith("/admin") ? "results" : "home";
  const [screen, setScreen] = useState(initialScreen);

  useEffect(() => {
    function syncPath() {
      setScreen(window.location.pathname.startsWith("/admin") ? "results" : "home");
    }
    window.addEventListener("popstate", syncPath);
    return () => window.removeEventListener("popstate", syncPath);
  }, []);

  function goHome() {
    window.history.pushState(null, "", "/");
    setScreen("home");
  }

  if (screen === "puzzle") return <PuzzleMode onBack={goHome} />;
  if (screen === "quiz")   return <QuizMode   onBack={goHome} />;
  if (screen === "results") return <ResultsDashboard onBack={goHome} />;
  return <HomeScreen onStart={setScreen} />;
}
