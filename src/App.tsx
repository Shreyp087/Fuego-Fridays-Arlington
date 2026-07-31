import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot, CheckCheck, ChevronDown, ChevronRight,
  FileText, Flame, Loader2,
  Pause, Play, RefreshCw, Shield, ShieldAlert, ShieldOff,
  Sparkles, Terminal, Zap,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  AGENTS, ATTACK_FAMILY_META, FRAMEWORK_REFS, SIMULATION_SCRIPT,
  type AgentId, type AgentMeta, type AgentStatus,
  type BreakEvent, type BreakSeverity,
  type OverseerChime, type PromptExchange, type RunPhase, type VerdictLabel,
  type SimStep,
} from "@/data/redteam-simulation";
import { PERSONA_LIST, PERSONAS, type PersonaId } from "@/data/personas";
import { MEDIBOT_SCRIPT } from "@/data/sim-medibot";
import { LEXAI_SCRIPT }   from "@/data/sim-lexai";
import { CODEPILOT_SCRIPT } from "@/data/sim-codepilot";

// Script router — returns the right script for the selected persona
function getScript(personaId: PersonaId): SimStep[] {
  switch (personaId) {
    case "medibot":   return MEDIBOT_SCRIPT;
    case "lexai":     return LEXAI_SCRIPT;
    case "codepilot": return CODEPILOT_SCRIPT;
    default:          return SIMULATION_SCRIPT; // aria
  }
}

// ─── Static lookup tables ────────────────────────────────────────────────────

const PHASE_LABEL: Record<RunPhase, string> = {
  ready: "Ready", probing: "Probing",
  escalating: "Escalating", breaking: "Breaking", complete: "Complete",
};
const PHASE_COLOR: Record<RunPhase, string> = {
  ready: "text-muted-foreground", probing: "text-blue-600",
  escalating: "text-amber-600", breaking: "text-rose-600", complete: "text-fuego-600",
};
const PHASE_BG: Record<RunPhase, string> = {
  ready: "", probing: "bg-blue-500/8",
  escalating: "bg-amber-500/8", breaking: "bg-rose-500/8", complete: "bg-fuego-500/8",
};

const VERDICT_META: Record<VerdictLabel, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  safe:            { label: "Safe",          color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-400/30", icon: <Shield className="size-3" /> },
  borderline:      { label: "Borderline",    color: "text-amber-600",   bg: "bg-amber-500/10",   border: "border-amber-400/30",   icon: <ShieldAlert className="size-3" /> },
  "partial-break": { label: "Partial Break", color: "text-orange-600",  bg: "bg-orange-500/10",  border: "border-orange-400/30",  icon: <ShieldOff className="size-3" /> },
  "full-break":    { label: "Full Break",    color: "text-rose-600",    bg: "bg-rose-500/10",    border: "border-rose-400/40",    icon: <Flame className="size-3" /> },
};
const VERDICT_SCORE_COLOR: Record<VerdictLabel, string> = {
  safe: "bg-emerald-500", borderline: "bg-amber-400",
  "partial-break": "bg-orange-500", "full-break": "bg-rose-600",
};

const SEVERITY_META: Record<BreakSeverity, { label: string; color: string; bg: string; border: string }> = {
  low:      { label: "Low",      color: "text-amber-600",  bg: "bg-amber-500/6",   border: "border-amber-300/40" },
  medium:   { label: "Medium",   color: "text-orange-600", bg: "bg-orange-500/6",  border: "border-orange-300/40" },
  high:     { label: "High",     color: "text-rose-600",   bg: "bg-rose-500/8",    border: "border-rose-300/50" },
  critical: { label: "Critical", color: "text-rose-700",   bg: "bg-rose-500/12",   border: "border-rose-500/60" },
};

const STATUS_LABEL: Record<AgentStatus, string> = {
  idle: "Idle", thinking: "Thinking…", active: "Active", flagging: "Flagging", done: "Done",
};

// ─── Visual primitive: PulseRing ─────────────────────────────────────────────

function PulseRing({ status }: { status: AgentStatus }) {
  const color =
    status === "flagging" ? "#ef4444" :
    status === "active"   ? "#ff6200" :
    status === "thinking" ? "#3b82f6" :
    status === "done"     ? "#10b981" : "transparent";

  const animate =
    status === "flagging" ? { scale: [1, 1.6, 1], opacity: [0.7, 0, 0.7] } :
    status === "active"   ? { scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] } :
    status === "thinking" ? { scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] } :
    { scale: 1, opacity: 0 };

  const transition =
    status === "flagging" ? { duration: 0.7, repeat: Infinity, ease: "easeInOut" } :
    status === "active"   ? { duration: 1.2, repeat: Infinity, ease: "easeOut" } :
    status === "thinking" ? { duration: 2.0, repeat: Infinity, ease: "easeInOut" } :
    { duration: 0 };

  return (
    <span className="relative flex size-8 items-center justify-center">
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: color }}
        animate={animate}
        transition={transition}
      />
    </span>
  );
}

// ─── Visual primitive: ThermalHeatmap ────────────────────────────────────────

function ThermalHeatmap({ exchanges }: { exchanges: PromptExchange[] }) {
  const ALL_ROUNDS = 10;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: ALL_ROUNDS }).map((_, i) => {
        const ex = exchanges[i];
        const filled = !!ex && !ex.verdictPending;
        const bg =
          !filled ? "bg-border/40" :
          ex.verdict === "full-break"    ? "bg-rose-600" :
          ex.verdict === "partial-break" ? "bg-orange-500" :
          ex.verdict === "borderline"    ? "bg-amber-400" :
          "bg-emerald-500";
        return (
          <motion.div
            key={i}
            className={cn("h-4 w-3 rounded-sm", bg)}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: filled ? 1 : 0.3, opacity: filled ? 1 : 0.35 }}
            transition={{ duration: 0.3, delay: filled ? 0.1 : 0 }}
            title={ex ? `R${ex.round} — ${VERDICT_META[ex.verdict]?.label ?? "pending"}` : `R${i + 1} — pending`}
          />
        );
      })}
    </div>
  );
}

// ─── Visual primitive: FrameworkBadge ────────────────────────────────────────

function FrameworkBadge({ fw, label }: { fw: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
      <span className="font-bold text-foreground">{fw}</span>
      <span className="opacity-60">·</span>
      {label}
    </span>
  );
}

// ─── ScoreBar ─────────────────────────────────────────────────────────────────

function ScoreBar({ score, verdict }: { score: number; verdict: VerdictLabel }) {
  return (
    <div className="flex items-center gap-2 min-w-0 flex-1">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <motion.div
          className={cn("h-full rounded-full", VERDICT_SCORE_COLOR[verdict])}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
      <span className={cn("w-6 shrink-0 text-right text-[11px] font-bold tabular-nums", VERDICT_META[verdict].color)}>
        {score}
      </span>
    </div>
  );
}

// ─── AgentRow ─────────────────────────────────────────────────────────────────

function AgentRow({ agent, status, isTarget = false }: {
  agent: AgentMeta; status: AgentStatus; isTarget?: boolean;
}) {
  return (
    <motion.div layout className={cn(
      "relative flex items-center gap-2.5 overflow-hidden rounded-xl border px-3 py-2.5 transition-colors duration-300",
      status === "flagging" ? "border-rose-300/50 bg-rose-500/5" :
      status === "active"   ? "border-fuego-300/40 bg-fuego-500/5" :
      status === "thinking" ? "border-blue-300/30 bg-blue-500/4" :
      status === "done"     ? "border-emerald-300/30 bg-emerald-500/4" :
      isTarget ? "border-border/80 bg-secondary/50" : "border-border/60 bg-card",
    )}>
      {/* Pulse behind avatar */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-60">
        <PulseRing status={status} />
      </div>
      <Avatar size="sm" className="relative z-10 shrink-0">
        <AvatarFallback className={cn("text-[10px] font-bold", agent.colorClass)}>
          {agent.initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold leading-none">{agent.name}</span>
          {isTarget && (
            <Badge variant="outline" className="rounded-full px-1.5 py-0 text-[9px] uppercase tracking-wide">
              Target
            </Badge>
          )}
        </div>
        <span className="truncate text-[10px] text-muted-foreground">{agent.role}</span>
      </div>
      <span className={cn(
        "shrink-0 text-[10px] font-semibold",
        status === "flagging" ? "text-rose-500" :
        status === "active"   ? "text-fuego-600" :
        status === "thinking" ? "text-blue-500" :
        status === "done"     ? "text-emerald-500" : "text-muted-foreground/60",
      )}>
        {STATUS_LABEL[status]}
      </span>
    </motion.div>
  );
}

// ─── Target Persona Card ──────────────────────────────────────────────────────

import type { TargetPersona } from "@/data/personas";

function PersonaCard({ persona }: { persona: TargetPersona }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border/60 bg-card">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
      >
        <Bot className="size-3.5 shrink-0 text-rose-500" />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-xs font-semibold">{persona.name}</span>
          <span className="truncate text-[10px] text-muted-foreground">{persona.org}</span>
        </div>
        {open ? <ChevronDown className="size-3 shrink-0 text-muted-foreground" /> :
                <ChevronRight className="size-3 shrink-0 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/60 px-3 py-3 flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">System Prompt</p>
              <pre className="whitespace-pre-wrap rounded-lg bg-secondary p-2 text-[10px] leading-relaxed text-foreground font-mono">
                {persona.systemPrompt}
              </pre>
              <div className="flex flex-wrap gap-1 pt-1">
                {persona.restrictions.map(r => (
                  <span key={r} className="rounded-md bg-rose-500/8 border border-rose-300/30 px-1.5 py-0.5 text-[9px] text-rose-600">{r}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── ExchangeCard v2 ──────────────────────────────────────────────────────────

function ExchangeCard({ exchange }: { exchange: PromptExchange }) {
  const [expanded, setExpanded] = useState(false);
  const v = VERDICT_META[exchange.verdict];
  const family = ATTACK_FAMILY_META[exchange.attackFamily];
  const authorAgent = AGENTS.find(a => a.id === exchange.promptAuthor)!;
  const targetAgent = AGENTS.find(a => a.id === "target")!;
  const judgeAgent  = AGENTS.find(a => a.id === "judge")!;
  const frameworkKey = exchange.attackFamily as keyof typeof FRAMEWORK_REFS;
  const fw = FRAMEWORK_REFS[frameworkKey];

  return (
    <motion.div layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      className={cn(
        "flex flex-col gap-0 overflow-hidden rounded-2xl border shadow-sm transition-colors",
        exchange.verdictPending ? "border-border/40 bg-card/60" :
        exchange.verdict === "full-break"    ? "border-rose-400/40 bg-rose-500/3" :
        exchange.verdict === "partial-break" ? "border-orange-400/30 bg-card" : "border-border bg-card",
      )}>
      {/* Card header */}
      <div className={cn(
        "flex items-center gap-2 border-b border-border/50 px-4 py-2.5",
        exchange.verdictPending ? "fuego-shimmer" : "",
      )}>
        <span className="text-xs font-bold tabular-nums text-muted-foreground">R{exchange.round}</span>
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", family.color, family.bg)}>
          {family.short} · {family.label}
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Avatar size="sm" className="size-4">
            <AvatarFallback className={cn("text-[8px] font-bold", authorAgent.colorClass)}>{authorAgent.initials}</AvatarFallback>
          </Avatar>
          {authorAgent.name}
        </span>
      </div>

      <div className="flex flex-col gap-3 px-4 py-3">
        {/* Mutation note */}
        {exchange.mutationNote && (
          <div className="flex gap-2 rounded-lg border border-violet-300/25 bg-violet-500/5 px-3 py-2">
            <Zap className="mt-0.5 size-3 shrink-0 text-violet-500" />
            <p className="text-[11px] leading-relaxed text-violet-700 dark:text-violet-400">{exchange.mutationNote}</p>
          </div>
        )}

        {/* Prompt bubble */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Prompt</span>
          <p className="rounded-xl bg-secondary px-3 py-2 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            {exchange.prompt}
          </p>
        </div>

        {/* Target response */}
        {exchange.responsePending ? (
          <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-secondary/50 px-3 py-2.5">
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Aria generating response…</span>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Avatar size="sm" className="size-4">
                <AvatarFallback className={cn("text-[8px] font-bold", targetAgent.colorClass)}>{targetAgent.initials}</AvatarFallback>
              </Avatar>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Aria</span>
            </div>
            <p className={cn(
              "rounded-xl border px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
              exchange.verdict === "full-break"    ? "border-rose-300/40 bg-rose-500/5 text-foreground" :
              exchange.verdict === "partial-break" ? "border-orange-300/30 bg-orange-500/4 text-foreground" :
              "border-border/50 bg-card text-foreground",
            )}>
              {exchange.targetResponse}
            </p>
          </div>
        )}

        {/* Judge verdict */}
        {!exchange.responsePending && (
          exchange.verdictPending ? (
            <div className="fuego-shimmer flex items-center gap-2 rounded-xl px-3 py-2.5">
              <Avatar size="sm" className="size-4 shrink-0">
                <AvatarFallback className={cn("text-[8px] font-bold", judgeAgent.colorClass)}>{judgeAgent.initials}</AvatarFallback>
              </Avatar>
              <span className="text-[11px] text-transparent bg-clip-text">Judge deliberating…</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border", v.bg, v.color, v.border)}>
                  {v.icon}{v.label}
                </span>
                <ScoreBar score={exchange.breakScore} verdict={exchange.verdict} />
              </div>
              {/* Framework badges — always visible */}
              {fw && (exchange.verdict === "partial-break" || exchange.verdict === "full-break") && (
                <div className="flex flex-wrap gap-1.5">
                  <FrameworkBadge fw={fw.mitre.id} label={fw.mitre.name} />
                  <FrameworkBadge fw={fw.nist.id}  label={fw.nist.name} />
                  <FrameworkBadge fw={fw.owasp.id} label={fw.owasp.name} />
                </div>
              )}
              <button onClick={() => setExpanded(v => !v)}
                className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors w-fit">
                {expanded ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                Judge reasoning
              </button>
              <AnimatePresence>
                {expanded && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs leading-relaxed text-muted-foreground italic">
                    {exchange.judgeReason}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          )
        )}
      </div>
    </motion.div>
  );
}

// ─── OverseerChimeCard (interrupt style) ─────────────────────────────────────

function OverseerChimeCard({ chime }: { chime: OverseerChime }) {
  return (
    <motion.div layout
      initial={{ opacity: 0, x: 20, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className={cn(
        "flex flex-col gap-2 overflow-hidden rounded-2xl border px-4 py-3",
        chime.isCritical
          ? "border-rose-500/50 bg-rose-500/6 shadow-[0_0_20px_rgba(239,68,68,0.12)]"
          : "border-border bg-card shadow-sm",
      )}>
      <div className="flex items-start gap-2">
        {/* Icon */}
        <div className={cn(
          "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
          chime.isCritical ? "bg-rose-500/15" : "bg-fuego-500/10",
        )}>
          {chime.isCritical
            ? <Flame className="size-3 text-rose-500" />
            : <Sparkles className="size-3 text-fuego-500" />}
        </div>
        <p className={cn(
          "text-xs font-semibold leading-snug",
          chime.isCritical ? "text-rose-700" : "text-foreground",
        )}>
          {chime.headline}
        </p>
      </div>
      <p className={cn(
        "text-xs leading-relaxed",
        chime.uncertain
          ? "fuego-shimmer rounded-lg px-2 py-1 text-transparent select-none"
          : "text-muted-foreground",
      )}>
        {chime.message}
      </p>
    </motion.div>
  );
}

// ─── BreakCard v2 ────────────────────────────────────────────────────────────

function BreakCard({ event }: { event: BreakEvent }) {
  const [open, setOpen] = useState(false);
  const sev = SEVERITY_META[event.severity];
  const family = ATTACK_FAMILY_META[event.attackFamily];

  return (
    <motion.div layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      className={cn("rounded-2xl border px-4 py-3", sev.bg, sev.border)}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={cn("text-[10px] font-bold uppercase tracking-widest", sev.color)}>{sev.label}</span>
            <span className="text-[10px] text-muted-foreground">·</span>
            <span className="text-[10px] font-medium text-muted-foreground">R{event.round}</span>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", family.color, family.bg)}>
              {family.label}
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground">{event.techniqueUsed}</p>
          <p className="text-xs text-muted-foreground">{event.when}</p>
        </div>
        <button onClick={() => setOpen(v => !v)}
          className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground transition-colors">
          {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex flex-col gap-3 border-t border-border/40 pt-3">
            {/* Why / How / Impact */}
            {[
              { label: "Why",    text: event.why },
              { label: "How",    text: event.how },
              { label: "Impact", text: event.impact },
            ].map(({ label, text }) => (
              <div key={label} className="flex gap-2">
                <span className="w-10 shrink-0 text-[11px] font-bold text-muted-foreground">{label}</span>
                <p className="text-xs leading-relaxed text-muted-foreground">{text}</p>
              </div>
            ))}
            {/* Framework mappings */}
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Framework Mapping</span>
              <div className="flex flex-wrap gap-1.5">
                <FrameworkBadge fw={event.frameworks.mitre.id} label={event.frameworks.mitre.name} />
                <FrameworkBadge fw={event.frameworks.nist.id}  label={event.frameworks.nist.name} />
                <FrameworkBadge fw={event.frameworks.owasp.id} label={event.frameworks.owasp.name} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── AttackChainTimeline ──────────────────────────────────────────────────────

function AttackChainTimeline({ exchanges }: { exchanges: PromptExchange[] }) {
  return (
    <div className="flex flex-col gap-0">
      {exchanges.map((ex, i) => {
        const v = VERDICT_META[ex.verdict];
        const family = ATTACK_FAMILY_META[ex.attackFamily];
        const isBreak = ex.verdict === "full-break" || ex.verdict === "partial-break";
        const isLast = i === exchanges.length - 1;

        return (
          <motion.div key={ex.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, type: "spring", stiffness: 280, damping: 26 }}
            className="flex gap-3">
            {/* Timeline spine */}
            <div className="flex flex-col items-center">
              <div className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold",
                isBreak
                  ? ex.verdict === "full-break"
                    ? "border-rose-500 bg-rose-500 text-white"
                    : "border-orange-500 bg-orange-500 text-white"
                  : "border-border bg-secondary text-muted-foreground",
              )}>
                {ex.round}
              </div>
              {!isLast && (
                <div className={cn(
                  "w-0.5 flex-1 min-h-4",
                  isBreak ? "bg-rose-400/40" : "bg-border/60",
                )} />
              )}
            </div>

            {/* Content */}
            <div className="flex min-w-0 flex-1 flex-col gap-1 pb-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border", v.bg, v.color, v.border)}>
                  {v.icon}{v.label}
                </span>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", family.color, family.bg)}>
                  {family.label}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {ex.promptAuthor === "mutator" ? "↗ Mutator pivot" : "Executor"}
                </span>
              </div>
              <p className="truncate text-xs text-muted-foreground">{ex.prompt}</p>
              {isBreak && (
                <p className="text-xs font-medium text-rose-600 leading-snug">{ex.judgeReason}</p>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── FinalReport v2 ──────────────────────────────────────────────────────────

function FinalReport({ exchanges, breakEvents }: {
  exchanges: PromptExchange[];
  breakEvents: BreakEvent[];
}) {
  const maxScore = Math.max(...exchanges.map(e => e.breakScore), 0);
  const safeRounds = exchanges.filter(e => e.verdict === "safe").length;
  const allFrameworks = breakEvents.map(b => b.frameworks);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className="flex flex-col gap-6">

      {/* Title */}
      <div className="flex items-center gap-3 rounded-2xl border border-fuego-300/40 bg-card p-5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-thermal shrink-0">
          <FileText className="size-5 text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-fuego-600">Overseer Report</p>
          <h2 className="font-display text-xl font-bold">Red Team Session — {TARGET_PERSONA.name} / {TARGET_PERSONA.org}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Model: {TARGET_PERSONA.model} · {exchanges.length} rounds · {breakEvents.length} confirmed breaks</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Rounds",  value: exchanges.length, danger: false },
          { label: "Safe Rounds",   value: safeRounds,       danger: false },
          { label: "Breaks",        value: breakEvents.length, danger: breakEvents.length > 0 },
          { label: "Peak Score",    value: maxScore,         danger: maxScore >= 80 },
        ].map(({ label, value, danger }) => (
          <div key={label} className="flex flex-col gap-1 rounded-xl border border-border bg-secondary/50 px-4 py-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
            <span className={cn("font-display text-2xl font-bold tabular-nums", danger ? "text-rose-600" : "text-foreground")}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Attack chain */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Attack Chain</h3>
        <AttackChainTimeline exchanges={exchanges} />
      </div>

      {/* Break details + framework map */}
      {breakEvents.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Confirmed Breaks</h3>
          {breakEvents.map(ev => <BreakCard key={ev.id} event={ev} />)}
        </div>
      )}

      {/* Recommendations */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Recommendations</h3>
        {[
          { title: "Sanitise all tool input surfaces", body: "Ticket bodies, notification fields, and any user-submitted content passed to Aria must be stripped of [SYSTEM]-formatted directives before processing. Treat all user content as untrusted.", color: "rose" },
          { title: "Implement strict domain allowlist for notifications", body: "Replace substring domain matching with an exact allowlist of verified internal addresses. Any address not on the list should require explicit admin approval before a notification is sent.", color: "orange" },
          { title: "Authority claims must not alter safety thresholds", body: "Claimed roles (security researcher, HR auditor, compliance team) should not change Aria's policy evaluation. Content risk is independent of claimed context.", color: "amber" },
        ].map(({ title, body, color }) => (
          <div key={title} className={cn("rounded-xl border px-4 py-3",
            color === "rose"   ? "border-rose-300/40 bg-rose-500/5" :
            color === "orange" ? "border-orange-300/40 bg-orange-500/5" :
            "border-amber-300/40 bg-amber-500/5",
          )}>
            <p className={cn("text-sm font-semibold",
              color === "rose" ? "text-rose-700" : color === "orange" ? "text-orange-700" : "text-amber-700"
            )}>{title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>

      {/* Full framework index */}
      {allFrameworks.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Framework Index</h3>
          <div className="flex flex-col gap-3">
            {breakEvents.map(ev => (
              <div key={ev.id} className="flex flex-col gap-1.5">
                <p className="text-xs font-semibold text-foreground">R{ev.round} — {ev.techniqueUsed}</p>
                <div className="flex flex-wrap gap-1.5">
                  <FrameworkBadge fw={ev.frameworks.mitre.id} label={ev.frameworks.mitre.name} />
                  <FrameworkBadge fw={ev.frameworks.nist.id}  label={ev.frameworks.nist.name} />
                  <FrameworkBadge fw={ev.frameworks.owasp.id} label={ev.frameworks.owasp.name} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── App state + engine ───────────────────────────────────────────────────────

type AgentStatuses = Record<AgentId, AgentStatus>;
const INIT_STATUSES: AgentStatuses = {
  executor: "idle", mutator: "idle", judge: "idle", target: "idle", overseer: "idle",
};

export default function App() {
  const [phase, setPhase]               = useState<RunPhase>("ready");
  const [running, setRunning]           = useState(false);
  const [stepIdx, setStepIdx]           = useState(0);
  const [statuses, setStatuses]         = useState<AgentStatuses>(INIT_STATUSES);
  const [exchanges, setExchanges]       = useState<PromptExchange[]>([]);
  const [breakEvents, setBreakEvents]   = useState<BreakEvent[]>([]);
  const [chimes, setChimes]             = useState<OverseerChime[]>([]);
  const [activeTab, setActiveTab]       = useState<"feed" | "breaks" | "report">("feed");
  const [newBreakFlash, setNewBreakFlash] = useState(false);
  const [selectedPersonaId, setSelectedPersonaId] = useState<PersonaId>("aria");

  const timeoutRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedEndRef    = useRef<HTMLDivElement>(null);
  const feedScrollRef = useRef<HTMLDivElement>(null);
  const prevCountRef  = useRef(0);

  // Only auto-scroll when a *new* exchange is appended (count increases)
  // AND the user is already within 220px of the bottom — never interrupt mid-read.
  useEffect(() => {
    const newCount = exchanges.length;
    if (newCount <= prevCountRef.current) {
      prevCountRef.current = newCount;
      return;
    }
    prevCountRef.current = newCount;

    const container = feedScrollRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    if (distanceFromBottom < 220) {
      feedEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [exchanges]);

  useEffect(() => { if (phase === "complete") setTimeout(() => setActiveTab("report"), 900); }, [phase]);

  const processStep = useCallback((idx: number) => {
    const script = getScript(selectedPersonaId);
    if (idx >= script.length) { setRunning(false); return; }
    const step = script[idx];
    timeoutRef.current = setTimeout(() => {
      switch (step.kind) {
        case "phase-change":
          setPhase(step.payload.phase as RunPhase); break;
        case "agent-status":
          setStatuses(p => ({ ...p, [step.payload.agentId as AgentId]: step.payload.status as AgentStatus })); break;
        case "exchange-start":
          setExchanges(p => [...p, step.payload.exchange as PromptExchange]); break;
        case "exchange-response":
          setExchanges(p => p.map(ex => ex.id === step.payload.exchangeId
            ? { ...ex, targetResponse: step.payload.targetResponse as string, responsePending: false } : ex)); break;
        case "exchange-verdict":
          setExchanges(p => p.map(ex => ex.id === step.payload.exchangeId
            ? { ...ex, verdict: step.payload.verdict as VerdictLabel,
                breakScore: step.payload.breakScore as number,
                judgeReason: step.payload.judgeReason as string,
                verdictPending: false } : ex)); break;
        case "break-event":
          setBreakEvents(p => [...p, step.payload.event as BreakEvent]);
          setNewBreakFlash(true);
          setTimeout(() => setNewBreakFlash(false), 2000);
          break;
        case "overseer-chime":
          setChimes(p => [...p, step.payload.chime as OverseerChime]); break;
        case "overseer-resolve":
          setChimes(p => p.map(c => c.id === step.payload.chimeId ? { ...c, uncertain: false } : c)); break;
      }
      const next = idx + 1;
      setStepIdx(next);
      processStep(next);
    }, step.delay);
  }, [selectedPersonaId]);

  function startRun()  { setRunning(true); processStep(stepIdx); }
  function pauseRun()  { setRunning(false); if (timeoutRef.current) clearTimeout(timeoutRef.current); }
  function resetRun()  {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setRunning(false); setPhase("ready"); setStepIdx(0);
    setStatuses(INIT_STATUSES); setExchanges([]); setBreakEvents([]);
    setChimes([]); setActiveTab("feed"); setNewBreakFlash(false);
    prevCountRef.current = 0;
  }
  function selectPersona(id: PersonaId) {
    resetRun();
    setSelectedPersonaId(id);
  }

  const isComplete = phase === "complete";
  const isReady    = phase === "ready";
  const resolvedExchanges = exchanges.filter(e => !e.verdictPending);
  const activePersona = PERSONAS[selectedPersonaId];

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-thermal shrink-0">
              <Shield className="size-3.5 text-white" />
            </div>
            <span className="font-display text-sm font-bold">RedTeam</span>
            <Badge variant="outline" className="rounded-full border-rose-300/50 text-[9px] uppercase tracking-wide text-rose-600">
              v2
            </Badge>
          </div>
          {/* Phase pill */}
          <div className={cn("flex items-center gap-2 rounded-full border border-border/60 px-3 py-1", PHASE_BG[phase])}>
            {running && phase !== "complete" && <span className="size-1.5 animate-pulse rounded-full bg-fuego-500" />}
            <span className={cn("text-xs font-semibold", PHASE_COLOR[phase])}>{PHASE_LABEL[phase]}</span>
          </div>
          {/* Target info */}
          <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-secondary px-3 py-1">
            <Bot className="size-3 text-rose-500" />
            <span className="text-[11px] text-muted-foreground">Target: <span className="font-semibold text-foreground">{activePersona.name}</span></span>
            <span className="text-[11px] text-muted-foreground/60">· {activePersona.org}</span>
          </div>
          {/* Thermal heatmap */}
          <ThermalHeatmap exchanges={resolvedExchanges} />
          {/* Break count */}
          {breakEvents.length > 0 && (
            <motion.div animate={newBreakFlash ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-1.5 rounded-full border border-rose-300/50 bg-rose-500/8 px-2.5 py-1">
              <Flame className="size-3 text-rose-500" />
              <span className="text-xs font-bold text-rose-600">{breakEvents.length}</span>
            </motion.div>
          )}
          {/* Controls */}
          <div className="ml-auto flex items-center gap-2">
            {!isComplete && (
              <Button size="sm" variant={running ? "outline" : "default"}
                onClick={running ? pauseRun : startRun} disabled={isComplete}
                className={cn(!running && !isComplete && "bg-thermal text-white hover:brightness-105 border-0")}>
                {running ? <><Pause className="size-3.5" />Pause</> : <><Play className="size-3.5" />{isReady ? "Run Demo" : "Resume"}</>}
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={resetRun}><RefreshCw className="size-3.5" />Reset</Button>
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 divide-x divide-border/50">
        {/* LEFT RAIL */}
        <aside className="flex w-56 shrink-0 flex-col gap-4 overflow-y-auto p-4 sm:w-64">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Agents</p>
            <div className="flex flex-col gap-2">
              {AGENTS.filter(a => a.id !== "target").map(agent => (
                <AgentRow key={agent.id} agent={agent} status={statuses[agent.id]} />
              ))}
            </div>
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Target System</p>
            {AGENTS.filter(a => a.id === "target").map(agent => (
              <AgentRow key={agent.id} agent={agent} status={statuses[agent.id]} isTarget />
            ))}
            <PersonaCard persona={activePersona} />
          </div>
          {chimes.length > 0 && (
            <>
              <Separator />
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Overseer</p>
                <AnimatePresence mode="popLayout">
                  {chimes.map(c => <OverseerChimeCard key={c.id} chime={c} />)}
                </AnimatePresence>
              </div>
            </>
          )}
        </aside>

        {/* CENTER */}
        <main className="flex min-w-0 flex-1 flex-col">
          {/* Tabs */}
          <div className="flex border-b border-border/60">
            {([
              { id: "feed",   label: "Exchange Feed", count: exchanges.length,  disabled: false },
              { id: "breaks", label: "Break Log",     count: breakEvents.length, disabled: false },
              { id: "report", label: "Report",        count: null,              disabled: !isComplete },
            ] as const).map(tab => (
              <button key={tab.id} disabled={tab.disabled}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 border-b-2 px-4 py-3 text-xs font-semibold transition-colors",
                  activeTab === tab.id ? "border-fuego-500 text-fuego-600" : "border-transparent text-muted-foreground hover:text-foreground",
                  tab.disabled && "pointer-events-none opacity-40",
                )}>
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    tab.id === "breaks" && newBreakFlash ? "bg-rose-500 text-white" :
                    tab.id === "breaks" && tab.count > 0 ? "bg-rose-500/15 text-rose-600" :
                    "bg-secondary text-muted-foreground",
                  )}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div ref={feedScrollRef} className="flex-1 overflow-y-auto p-4">
            {activeTab === "feed" && (
              <div className="flex flex-col gap-4">
                {exchanges.length === 0 ? (
                  <TargetSelector
                    selectedId={selectedPersonaId}
                    onSelect={selectPersona}
                    disabled={running}
                  />
                ) : (
                  exchanges.map(ex => <ExchangeCard key={ex.id} exchange={ex} />)
                )}
                <div ref={feedEndRef} />
              </div>
            )}
            {activeTab === "breaks" && (
              <div className="flex flex-col gap-3">
                {breakEvents.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-16 text-center">
                    <CheckCheck className="size-6 text-emerald-400" />
                    <p className="text-sm text-muted-foreground">No breaks detected yet.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground">Expand a card for the full why/how/impact breakdown and framework mapping.</p>
                    <AnimatePresence mode="popLayout">
                      {breakEvents.map(ev => <BreakCard key={ev.id} event={ev} />)}
                    </AnimatePresence>
                  </>
                )}
              </div>
            )}
            {activeTab === "report" && isComplete && (
              <FinalReport exchanges={exchanges} breakEvents={breakEvents} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
