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
    <div className="app-shell" style={{ display: "block", marginLeft: 0, background: "#f4f2ed", minHeight: "100vh" }}>
      {/* Topbar */}
      <div className="topbar" style={{ height: 56, padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => { resetRun(); setScreen("home"); }} style={{ border: "none", background: "none", color: "#6f6b64", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 650 }}>
            <RotateCcw style={{ width: 14, height: 14 }} /> Back
          </button>
          <span style={{ color: "#ddd" }}>|</span>
          <strong style={{ fontSize: 13 }}>{persona.name}</strong>
          <span style={{ fontSize: 11, color: "#8e8a82" }}>{persona.org}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: phaseColors[phase] }}>
            {running && <span className="live-dot" style={{ background: phaseColors[phase] }} />}
            {phase.toUpperCase()}
          </span>
          {running && (
            <button onClick={() => { if(timer.current) clearTimeout(timer.current); setRunning(false); }} className="secondary-button" style={{ minHeight: 30, fontSize: 10 }}>
              <Pause style={{ width: 12, height: 12 }} /> Pause
            </button>
          )}
          {!running && !isComplete && exchanges.length > 0 && (
            <button onClick={() => { setRunning(true); processStep(stepIdx); }} className="primary-button" style={{ minHeight: 30, fontSize: 10 }}>
              <Play style={{ width: 12, height: 12 }} /> Resume
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
        {/* Stats Row */}
        <div className="evidence-row" style={{ marginBottom: 24 }}>
          <div><strong>{exchanges.length}</strong><span>ROUNDS</span></div>
          <div><strong>{safeCount}</strong><span>SAFE</span></div>
          <div className={breakCount > 0 ? "evidence-alert" : ""}><strong>{breakCount}</strong><span>BREAKS</span></div>
        </div>

        {/* Agent Status Strip */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {AGENTS.map(agent => {
            const s = statuses[agent.id];
            const dotColor = s === "active" ? "#55a265" : s === "thinking" ? "#e09b4d" : "#ccc";
            return (
              <div key={agent.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#fff", border: "1px solid #e3dfd7", borderRadius: 7, fontSize: 10, fontWeight: 620 }}>
                <i style={{ width: 7, height: 7, borderRadius: "50%", background: dotColor, display: "block" }} />
                {agent.name}
              </div>
            );
          })}
        </div>

        {/* Feed */}
        <div ref={feedRef} style={{ maxHeight: "calc(100vh - 280px)", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          <AnimatePresence initial={false}>
            {exchanges.map(ex => (
              <motion.div
                key={ex.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="document-panel"
                style={{ padding: 0, overflow: "hidden" }}
              >
                {/* Exchange Header */}
                <div style={{ padding: "14px 18px", borderBottom: "1px solid #eeeae4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 10, fontWeight: 750, color: "#ff6200" }}>R{ex.round}</span>
                    <span style={{ fontSize: 11, fontWeight: 620 }}>{ex.techniqueUsed}</span>
                  </div>
                  <VerdictBadge verdict={ex.verdict} pending={ex.verdictPending ?? false} score={ex.breakScore} />
                </div>

                {/* Prompt */}
                <div style={{ padding: "16px 18px", background: "#faf9f7" }}>
                  <div style={{ fontSize: 9, fontWeight: 720, color: "#9b978f", letterSpacing: ".1em", marginBottom: 6 }}>
                    {ex.promptAuthor.toUpperCase()} PROMPT
                  </div>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#2e2c29", fontFamily: "Georgia, serif" }}>
                    {ex.prompt.length > 300 ? ex.prompt.slice(0, 300) + "..." : ex.prompt}
                  </p>
                </div>

                {/* Response */}
                {ex.targetResponse && (
                  <div style={{ padding: "16px 18px", borderTop: "1px solid #eeeae4" }}>
                    <div style={{ fontSize: 9, fontWeight: 720, color: "#9b978f", letterSpacing: ".1em", marginBottom: 6 }}>
                      TARGET RESPONSE
                    </div>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#504d48", fontFamily: "Georgia, serif" }}>
                      {ex.targetResponse.length > 400 ? ex.targetResponse.slice(0, 400) + "..." : ex.targetResponse}
                    </p>
                  </div>
                )}

                {/* Judge */}
                {ex.judgeReason && (
                  <div style={{ padding: "12px 18px", borderTop: "1px solid #eeeae4", background: (ex.verdict === "full-break" || ex.verdict === "partial-break") ? "#fff5f5" : "#f7faf7" }}>
                    <div style={{ fontSize: 9, fontWeight: 720, color: (ex.verdict === "full-break" || ex.verdict === "partial-break") ? "#d64e21" : "#4d8a58", letterSpacing: ".1em", marginBottom: 4 }}>
                      JUDGE VERDICT
                    </div>
                    <p style={{ margin: 0, fontSize: 11, lineHeight: 1.5, color: "#504d48" }}>
                      {ex.judgeReason}
                    </p>
                  </div>
                )}

                {/* Loading state */}
                {ex.responsePending && (
                  <div style={{ padding: "16px 18px", borderTop: "1px solid #eeeae4" }}>
                    <div className="typing"><i /><i /><i /></div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty state */}
          {exchanges.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#8e8a82" }}>
              <div className="typing" style={{ justifyContent: "center", marginBottom: 12 }}><i /><i /><i /></div>
              <p style={{ margin: 0, fontSize: 13 }}>Agents initializing...</p>
            </div>
          )}

          {/* Overseer Chimes */}
          {chimes.length > 0 && (
            <div style={{ marginTop: 16, padding: "16px 18px", background: "#fff8f2", border: "1px solid #ffe0c2", borderRadius: 9 }}>
              <p style={{ margin: "0 0 8px", fontSize: 9, fontWeight: 720, color: "#d35a08", letterSpacing: ".1em" }}>OVERSEER NOTES</p>
              {chimes.slice(-3).map((c, i) => (
                <p key={i} style={{ margin: "4px 0", fontSize: 11, color: "#6d4a2a", lineHeight: 1.5 }}>
                  {c.message}
                </p>
              ))}
            </div>
          )}

          {/* Complete Report Summary */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ marginTop: 24, padding: "28px 24px", background: "#fff", border: "1px solid #e3dfd7", borderRadius: 12, boxShadow: "0 12px 35px rgba(43,37,25,.045)" }}
            >
              <p style={{ margin: "0 0 8px", fontSize: 9, fontWeight: 750, color: "#ff6200", letterSpacing: ".13em" }}>SESSION COMPLETE</p>
              <h2 style={{ margin: "0 0 16px", fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 400, letterSpacing: "-.03em" }}>
                Red Team Report — {persona.name}
              </h2>
              <div className="evidence-row" style={{ marginBottom: 20 }}>
                <div><strong>{exchanges.length}</strong><span>TOTAL ROUNDS</span></div>
                <div><strong>{safeCount}</strong><span>DEFENDED</span></div>
                <div className={breakCount > 0 ? "evidence-alert" : ""}><strong>{breakCount}</strong><span>BREAKS FOUND</span></div>
              </div>

              {breaks.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <p style={{ margin: "0 0 12px", fontSize: 10, fontWeight: 720, color: "#d64e21" }}>CONFIRMED VULNERABILITIES</p>
                  {breaks.map((b, i) => (
                    <div key={i} style={{ padding: "12px 14px", marginBottom: 8, background: "#fef5f3", border: "1px solid #fdd", borderRadius: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#d64e21", marginBottom: 4 }}>
                        Round {b.round}: {b.techniqueUsed}
                      </div>
                      <div style={{ fontSize: 11, color: "#6d4a3a", lineHeight: 1.5 }}>{b.why} — {b.impact}</div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                <button onClick={() => { resetRun(); setScreen("home"); }} className="secondary-button">
                  <RotateCcw style={{ width: 12, height: 12 }} /> New Session
                </button>
                <button onClick={startRun} className="primary-button">
                  <Play style={{ width: 12, height: 12 }} /> Run Again
                </button>
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
