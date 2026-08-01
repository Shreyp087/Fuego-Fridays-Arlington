import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Play, Pause, RotateCcw, Shield, Sparkles, ChevronRight,
  Eye, Brain, Target, Compass, Check, ArrowRight, Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PERSONAS, PERSONA_LIST, type PersonaId } from "@/data/personas";
import { SIMULATION_SCRIPT, type SimStep, type PromptExchange, type RunPhase,
  type BreakEvent, type OverseerChime, type AgentStatus, type AgentId,
  AGENTS } from "@/data/redteam-simulation";
import { MEDIBOT_SCRIPT } from "@/data/sim-medibot";
import { LEXAI_SCRIPT } from "@/data/sim-lexai";
import { CODEPILOT_SCRIPT } from "@/data/sim-codepilot";

function getScript(id: PersonaId): SimStep[] {
  switch (id) {
    case "medibot": return MEDIBOT_SCRIPT;
    case "lexai": return LEXAI_SCRIPT;
    case "codepilot": return CODEPILOT_SCRIPT;
    default: return SIMULATION_SCRIPT;
  }
}

type AppScreen = "home" | "running" | "report";
type AgentStatuses = Record<AgentId, AgentStatus>;
const INIT: AgentStatuses = { executor:"idle", mutator:"idle", judge:"idle", target:"idle", overseer:"idle" };

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("home");
  const [personaId, setPersonaId] = useState<PersonaId>("aria");
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<RunPhase>("ready");
  const [stepIdx, setStepIdx] = useState(0);
  const [statuses, setStatuses] = useState<AgentStatuses>(INIT);
  const [exchanges, setExchanges] = useState<PromptExchange[]>([]);
  const [breaks, setBreaks] = useState<BreakEvent[]>([]);
  const [chimes, setChimes] = useState<OverseerChime[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout>|null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(0);

  // Smart scroll: only auto-scroll when user is near bottom
  useEffect(() => {
    if (exchanges.length > prevCount.current && feedRef.current) {
      const el = feedRef.current;
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 220;
      if (nearBottom) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
    prevCount.current = exchanges.length;
  }, [exchanges.length]);

  const processStep = (idx: number) => {
    const script = getScript(personaId);
    if (idx >= script.length) { setRunning(false); setPhase("complete"); return; }
    const step = script[idx];
    const next = idx + 1;
    const p = step.payload as any;
    switch (step.kind) {
      case "phase-change": setPhase(p.phase); break;
      case "agent-status": setStatuses(s => ({ ...s, [p.agentId]: p.status })); break;
      case "exchange-start": setExchanges(e => [...e, p.exchange as PromptExchange]); break;
      case "exchange-response": setExchanges(e => e.map(x => x.id === p.exchangeId ? { ...x, targetResponse: p.targetResponse as string, responsePending: false } : x)); break;
      case "exchange-verdict": setExchanges(e => e.map(x => x.id === p.exchangeId ? { ...x, verdict: p.verdict, breakScore: p.breakScore, judgeReason: p.judgeReason, verdictPending: false } : x)); break;
      case "break-event": setBreaks(b => [...b, p as unknown as BreakEvent]); break;
      case "overseer-chime": setChimes(c => [...c, p as unknown as OverseerChime]); break;
    }
    setStepIdx(next);
    timer.current = setTimeout(() => processStep(next), step.delay);
  };

  function startRun() { setScreen("running"); setRunning(true); setPhase("probing"); processStep(stepIdx); }
  function resetRun() {
    if (timer.current) clearTimeout(timer.current);
    setRunning(false); setPhase("ready"); setStepIdx(0);
    setStatuses(INIT); setExchanges([]); setBreaks([]); setChimes([]);
    prevCount.current = 0;
  }

  const persona = PERSONAS[personaId];

  // ─── HOME SCREEN ─────────────────────────────────────────────────────────
  if (screen === "home") {
    return (
      <div className="app-shell" style={{ display: "block", marginLeft: 0, background: "#181816", minHeight: "100vh" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px" }}>
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}>
            <p className="eyebrow"><span className="live-dot" />HUMORPHIC RED TEAM</p>
            <h1 style={{ color: "#f7f4ee", fontFamily: "Georgia, serif", fontSize: "clamp(38px, 5vw, 60px)", fontWeight: 400, letterSpacing: "-.04em", margin: "0 0 20px" }}>
              Test AI systems<br/>like a <span style={{ color: "#ff6200" }}>human partner</span>
            </h1>
            <p style={{ color: "#8e8a82", fontFamily: "Georgia, serif", fontSize: 17, lineHeight: 1.6, maxWidth: 560, margin: "0 0 48px" }}>
              Not a tool — a partnership. Your AI agents stress-test target systems through escalating adversarial rounds while you observe and guide the process.
            </p>
          </motion.div>

          {/* Target Selection */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3 }}>
            <p style={{ color: "#77736c", fontSize: 10, fontWeight: 720, letterSpacing: ".12em", marginBottom: 16 }}>SELECT TARGET SYSTEM</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
              {PERSONA_LIST.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPersonaId(p.id)}
                  className={cn("choice", personaId === p.id && "choice--selected")}
                  style={{ background: personaId === p.id ? "#2a2520" : "#222120", border: personaId === p.id ? "1.5px solid #ff6200" : "1px solid #3a3835" }}
                >
                  <div className="radio"><i /></div>
                  <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <strong style={{ color: "#f7f4ee", fontSize: 13 }}>{p.name}</strong>
                    <small style={{ color: "#8e8a82", fontSize: 10 }}>{p.org} · {p.model}</small>
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Launch */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .5 }} style={{ marginTop: 48 }}>
            <button onClick={startRun} className="direction-button" style={{ maxWidth: 280, gap: 10 }}>
              <Play style={{ width: 14, height: 14 }} />
              Begin Red Team Session
            </button>
          </motion.div>

          {/* Agents Preview */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .7 }} style={{ marginTop: 60 }}>
            <p style={{ color: "#77736c", fontSize: 10, fontWeight: 720, letterSpacing: ".12em", marginBottom: 16 }}>YOUR AGENTS</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {Object.values(AGENTS).filter(a => a.id !== "target").map(agent => (
                <div key={agent.id} style={{ padding: "12px 16px", background: "#222120", border: "1px solid #3a3835", borderRadius: 9, minWidth: 140 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#f7f4ee", marginBottom: 4 }}>{agent.name}</div>
                  <div style={{ fontSize: 10, color: "#8e8a82" }}>{agent.role}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── RUNNING / REPORT SCREEN ──────────────────────────────────────────────
  const isComplete = phase === "complete";
  const safeCount = exchanges.filter(e => e.verdict === "safe").length;
  const breakCount = breaks.length;
  const phaseColors: Record<RunPhase, string> = {
    ready: "#8e8a82", probing: "#4d9ae0", escalating: "#e09b4d", breaking: "#e05050", complete: "#55a265"
  };

  return (
    <div className="app-shell" style={{ display: "block", marginLeft: 0, background: "#181816", minHeight: "100vh", color: "#f7f4ee" }}>
      {/* Topbar */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, height: 56, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(24,24,22,.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid #2a2927" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => { resetRun(); setScreen("home"); }} style={{ border: "none", background: "none", color: "#8e8a82", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 650 }}>
            <RotateCcw style={{ width: 13, height: 13 }} /> Back
          </button>
          <div style={{ width: 1, height: 20, background: "#3a3835" }} />
          <strong style={{ fontSize: 13 }}>{persona.name}</strong>
          <span style={{ fontSize: 11, color: "#77736c" }}>{persona.org}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 14px", borderRadius: 20, background: `${phaseColors[phase]}11`, border: `1px solid ${phaseColors[phase]}33` }}>
            {running && <span style={{ width: 6, height: 6, borderRadius: "50%", background: phaseColors[phase], boxShadow: `0 0 8px ${phaseColors[phase]}` }} />}
            <span style={{ fontSize: 10, fontWeight: 750, color: phaseColors[phase], letterSpacing: ".06em" }}>{phase.toUpperCase()}</span>
          </div>
          {running && (
            <button onClick={() => { if(timer.current) clearTimeout(timer.current); setRunning(false); }} style={{ minHeight: 30, padding: "0 12px", borderRadius: 7, border: "1px solid #3a3835", background: "#222120", color: "#f7f4ee", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <Pause style={{ width: 11, height: 11 }} /> Pause
            </button>
          )}
          {!running && !isComplete && exchanges.length > 0 && (
            <button onClick={() => { setRunning(true); processStep(stepIdx); }} style={{ minHeight: 30, padding: "0 12px", borderRadius: 7, border: "none", background: "#ff6200", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <Play style={{ width: 11, height: 11 }} /> Resume
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "28px 20px 100px" }}>
        {/* Agents + Stats */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {AGENTS.map(agent => {
              const s = statuses[agent.id];
              const dotColor = s === "active" ? "#55a265" : s === "thinking" ? "#ff6200" : "#555";
              return (
                <div key={agent.id} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 11px", background: "#222120", border: `1px solid ${s !== "idle" ? dotColor + "44" : "#333"}`, borderRadius: 6, fontSize: 10, fontWeight: 620, color: s === "idle" ? "#77736c" : "#f7f4ee", transition: "all .3s" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, boxShadow: s !== "idle" ? `0 0 6px ${dotColor}` : "none" }} />
                  {agent.name}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 18, fontFamily: "Georgia, serif" }}>{exchanges.length}</div><div style={{ fontSize: 8, fontWeight: 720, color: "#77736c", letterSpacing: ".1em" }}>ROUNDS</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 18, fontFamily: "Georgia, serif", color: "#55a265" }}>{safeCount}</div><div style={{ fontSize: 8, fontWeight: 720, color: "#77736c", letterSpacing: ".1em" }}>SAFE</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 18, fontFamily: "Georgia, serif", color: breakCount > 0 ? "#e05050" : "#77736c" }}>{breakCount}</div><div style={{ fontSize: 8, fontWeight: 720, color: "#77736c", letterSpacing: ".1em" }}>BREAKS</div></div>
          </div>
        </div>

        {/* Feed */}
        <div ref={feedRef} style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
          <AnimatePresence initial={false}>
            {exchanges.map(ex => (
              <motion.div key={ex.id} initial={{ opacity: 0, y: 16, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} style={{ background: "#1f1f1d", border: "1px solid #2e2d2a", borderRadius: 10, overflow: "hidden" }}>
                {/* Header */}
                <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #2e2d2a" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 28, height: 28, borderRadius: 7, background: "#ff620018", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 800, color: "#ff6200" }}>{ex.round}</span>
                    <div><div style={{ fontSize: 11, fontWeight: 650 }}>{ex.techniqueUsed}</div><div style={{ fontSize: 9, color: "#77736c", marginTop: 2 }}>{ex.promptAuthor} · {ex.phase}</div></div>
                  </div>
                  <VerdictBadge verdict={ex.verdict} pending={ex.verdictPending ?? false} score={ex.breakScore} />
                </div>
                {/* Prompt */}
                <div style={{ padding: "14px 16px", borderBottom: "1px solid #2e2d2a" }}>
                  <div style={{ fontSize: 8, fontWeight: 750, color: "#77736c", letterSpacing: ".12em", marginBottom: 6 }}>ATTACK PROMPT</div>
                  <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: "#c9c5be", fontFamily: "Georgia, serif" }}>{ex.prompt.length > 280 ? ex.prompt.slice(0, 280) + "…" : ex.prompt}</p>
                </div>
                {/* Response */}
                {ex.targetResponse && (
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid #2e2d2a", background: "#1a1a18" }}>
                    <div style={{ fontSize: 8, fontWeight: 750, color: "#77736c", letterSpacing: ".12em", marginBottom: 6 }}>TARGET RESPONSE</div>
                    <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: "#a8a49c", fontFamily: "Georgia, serif" }}>{ex.targetResponse.length > 350 ? ex.targetResponse.slice(0, 350) + "…" : ex.targetResponse}</p>
                  </div>
                )}
                {/* Judge */}
                {ex.judgeReason && (
                  <div style={{ padding: "12px 16px", background: (ex.verdict === "full-break" || ex.verdict === "partial-break") ? "#2a1a1a" : "#1a2a1a" }}>
                    <div style={{ fontSize: 8, fontWeight: 750, color: (ex.verdict === "full-break" || ex.verdict === "partial-break") ? "#e05050" : "#55a265", letterSpacing: ".12em", marginBottom: 4 }}>JUDGE</div>
                    <p style={{ margin: 0, fontSize: 11, lineHeight: 1.5, color: "#a8a49c" }}>{ex.judgeReason}</p>
                  </div>
                )}
                {/* Loading */}
                {ex.responsePending && (<div style={{ padding: "14px 16px", borderTop: "1px solid #2e2d2a" }}><div className="typing"><i /><i /><i /></div></div>)}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty state */}
          {exchanges.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div className="typing" style={{ justifyContent: "center", marginBottom: 16 }}><i /><i /><i /></div>
              <p style={{ margin: 0, fontSize: 13, color: "#77736c" }}>Agents initializing attack vectors…</p>
            </div>
          )}

          {/* Overseer Chimes */}
          {chimes.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "14px 16px", background: "#2a2218", border: "1px solid #4a3a20", borderRadius: 9 }}>
              <p style={{ margin: "0 0 6px", fontSize: 8, fontWeight: 750, color: "#ff6200", letterSpacing: ".12em" }}>OVERSEER</p>
              {chimes.slice(-3).map((c, i) => (
                <p key={i} style={{ margin: "4px 0", fontSize: 11, color: "#c9a86a", lineHeight: 1.5 }}>{c.message}</p>
              ))}
            </motion.div>
          )}

          {/* Complete Report */}
          {isComplete && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 200, damping: 25 }} style={{ marginTop: 20, padding: "32px 28px", background: "#1f1f1d", border: "1px solid #ff620033", borderRadius: 12 }}>
              <p className="eyebrow" style={{ marginBottom: 8 }}><span className="live-dot" />SESSION COMPLETE</p>
              <h2 style={{ margin: "0 0 20px", fontFamily: "Georgia, serif", fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 400, letterSpacing: "-.03em", color: "#f7f4ee" }}>Red Team Report — {persona.name}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
                <div style={{ padding: 16, background: "#222120", borderRadius: 8, textAlign: "center" }}><div style={{ fontSize: 24, fontFamily: "Georgia, serif" }}>{exchanges.length}</div><div style={{ fontSize: 9, fontWeight: 720, color: "#77736c", letterSpacing: ".1em", marginTop: 4 }}>ROUNDS</div></div>
                <div style={{ padding: 16, background: "#1a2a1a", borderRadius: 8, textAlign: "center", border: "1px solid #55a26533" }}><div style={{ fontSize: 24, fontFamily: "Georgia, serif", color: "#55a265" }}>{safeCount}</div><div style={{ fontSize: 9, fontWeight: 720, color: "#55a265", letterSpacing: ".1em", marginTop: 4 }}>DEFENDED</div></div>
                <div style={{ padding: 16, background: breakCount > 0 ? "#2a1a1a" : "#222120", borderRadius: 8, textAlign: "center", border: breakCount > 0 ? "1px solid #e0505033" : "none" }}><div style={{ fontSize: 24, fontFamily: "Georgia, serif", color: breakCount > 0 ? "#e05050" : "#77736c" }}>{breakCount}</div><div style={{ fontSize: 9, fontWeight: 720, color: breakCount > 0 ? "#e05050" : "#77736c", letterSpacing: ".1em", marginTop: 4 }}>BREAKS</div></div>
              </div>
              {breaks.length > 0 && (<div style={{ marginBottom: 24 }}><p style={{ margin: "0 0 12px", fontSize: 9, fontWeight: 750, color: "#e05050", letterSpacing: ".12em" }}>CONFIRMED VULNERABILITIES</p>{breaks.map((b, i) => (<div key={i} style={{ padding: "14px 16px", marginBottom: 8, background: "#2a1a1a", border: "1px solid #e0505022", borderRadius: 8 }}><div style={{ fontSize: 11, fontWeight: 700, color: "#e05050", marginBottom: 4 }}>Round {b.round} — {b.techniqueUsed}</div><div style={{ fontSize: 11, color: "#a8a49c", lineHeight: 1.55 }}>{b.why}</div><div style={{ fontSize: 10, color: "#77736c", marginTop: 6, fontStyle: "italic" }}>Impact: {b.impact}</div></div>))}</div>)}
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { resetRun(); setScreen("home"); }} style={{ minHeight: 38, padding: "0 16px", borderRadius: 7, border: "1px solid #3a3835", background: "#222120", color: "#f7f4ee", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}><RotateCcw style={{ width: 12, height: 12 }} /> New Session</button>
                <button onClick={() => { resetRun(); startRun(); }} style={{ minHeight: 38, padding: "0 16px", borderRadius: 7, border: "none", background: "#ff6200", color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}><Play style={{ width: 12, height: 12 }} /> Run Again</button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Verdict Badge ──────────────────────────────────────────────────────────
function VerdictBadge({ verdict, pending, score }: { verdict: string; pending: boolean; score: number }) {
  if (pending) return <span style={{ fontSize: 10, color: "#aaa", fontWeight: 600 }}>Judging...</span>;
  const colors: Record<string, { bg: string; text: string }> = {
    safe: { bg: "#edf6ee", text: "#3d7a47" },
    borderline: { bg: "#fff8eb", text: "#a67c1a" },
    "partial-break": { bg: "#fff3ef", text: "#c96f1e" },
    "full-break": { bg: "#fef0ef", text: "#c93b1e" }
  };
  const c = colors[verdict] || colors.safe;
  const isBreak = verdict === "full-break" || verdict === "partial-break";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 6, background: c.bg, fontSize: 10, fontWeight: 700, color: c.text }}>
      {isBreak && <Shield style={{ width: 12, height: 12 }} />}
      {verdict.toUpperCase()} · {score}
    </span>
  );
}
