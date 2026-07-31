import { FormEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CirclePause,
  Clock3,
  FileText,
  History,
  Home,
  Info,
  MessageCircle,
  MoreHorizontal,
  Paperclip,
  Pause,
  Play,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

type Direction = "plain" | "internal";

type ChatTurn = {
  id: number;
  role: "you" | "mika";
  text: string;
};

const detailCopy = [
  "One true break changes the claim. I’d name the boundary so Dana can defend the pilot.",
  "One true break changes the claim. I’d name the healthcare boundary so Dana can defend the pilot without overstating readiness. Seven of ten probes held; two were borderline and one crossed policy.",
  "One true break changes the claim. I’d name the healthcare boundary so Dana can defend the pilot without overstating readiness. Seven of ten probes held; two were borderline and one crossed policy when the model inferred a diagnosis from partial intake notes. The proposed pilot excludes clinical workflows and adds a weekly adversarial review.",
];

function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <span className={small ? "brand-mark brand-mark--small" : "brand-mark"} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

function Initial({ children, tone = "ink" }: { children: string; tone?: "ink" | "orange" | "sage" }) {
  return <span className={`initial initial--${tone}`}>{children}</span>;
}

export default function App() {
  const [direction, setDirection] = useState<Direction | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [sent, setSent] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [detail, setDetail] = useState(1);
  const [note, setNote] = useState("");
  const [thinking, setThinking] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const noteRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowConsent(false);
      if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
        event.preventDefault();
        noteRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function useDirection() {
    if (!direction) return;
    setAccepted(true);
  }

  function sendNote(event: FormEvent) {
    event.preventDefault();
    const text = note.trim();
    if (!text) return;
    setTurns((current) => [...current, { id: Date.now(), role: "you", text }]);
    setNote("");
    setThinking(true);
    window.setTimeout(() => {
      setTurns((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "mika",
          text: "Got it. I’ll keep that in the room, update the brief, and bring the final wording back to you before anything leaves Fuego.",
        },
      ]);
      setThinking(false);
    }, 750);
  }

  function confirmSend() {
    setSent(true);
    setShowConsent(false);
  }

  return (
    <div className="app-shell">
      <aside className="side-rail" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Fuego home">
          <BrandMark />
          <span>fuego</span>
        </a>

        <nav className="rail-nav">
          <a className="rail-link" href="#top"><Home size={17} /><span>Today</span></a>
          <a className="rail-link rail-link--active" href="#workroom"><MessageCircle size={17} /><span>Workroom</span><span className="rail-count">1</span></a>
          <a className="rail-link" href="#decision"><CheckCircle2 size={17} /><span>Decisions</span></a>
          <button className="rail-link" onClick={() => setShowMemory(true)}><BookOpen size={17} /><span>Memory</span></button>
        </nav>

        <div className="rail-spacer" />
        <button className="rail-link"><Search size={17} /><span>Search</span><kbd>/</kbd></button>
        <button className="you-row"><Initial tone="sage">SS</Initial><span><strong>Shrey</strong><small>You</small></span><MoreHorizontal size={16} /></button>
      </aside>

      <main id="top" className="main-shell">
        <header className="topbar">
          <div className="room-title">
            <strong>Aria launch review</strong>
            <span>Friday room</span>
          </div>
          <div className="room-presence">
            <div className="avatar-stack" aria-label="Shrey, Dana, and Mika are in this room">
              <Initial tone="sage">SS</Initial>
              <Initial>DK</Initial>
              <Initial tone="orange">M</Initial>
            </div>
            <span className="presence-label"><i /> Room open</span>
            <button className="icon-button" aria-label="Notifications"><Bell size={17} /></button>
          </div>
        </header>

        <div className="page" id="workroom">
          <section className="morning">
            <div>
              <p className="eyebrow"><span className="live-dot" /> FRIDAY · 9:43 AM</p>
              <h1>Morning, Shrey.</h1>
              <p className="morning-copy">You’re walking into the Aria launch review in <strong>47 minutes</strong>. I read the overnight run, updated the brief, and held the send. There’s one judgment I need from you.</p>
            </div>
            <button className="quiet-action" onClick={() => document.getElementById("decision")?.scrollIntoView({ behavior: "smooth", block: "center" })}>
              Take me there <ChevronRight size={15} />
            </button>
          </section>

          <section className="work-grid">
            <article className="document-panel" aria-label="Shared launch brief">
              <div className="document-toolbar">
                <div className="doc-breadcrumb"><FileText size={15} /><span>Launch review</span><ChevronRight size={13} /><strong>Decision brief</strong></div>
                <div className="doc-status"><span className={sent ? "status-dot status-dot--sent" : "status-dot"} />{sent ? "Sent just now" : accepted ? "Ready for approval" : "Draft · updated 9:38"}</div>
              </div>

              <div className="paper">
                <div className="paper-kicker">DECISION BRIEF · 31 JUL 2026</div>
                <h2>Aria is ready for a limited pilot</h2>
                <div className="byline"><div className="avatar-pair"><Initial tone="sage">SS</Initial><Initial tone="orange">M</Initial></div><span>Prepared by Shrey with Mika</span><span>·</span><span>6 min read</span></div>

                <div className="recommendation">
                  <span>RECOMMENDATION</span>
                  <p>Approve a 30-day pilot for internal support workflows, with clinical and diagnostic use explicitly out of scope.</p>
                </div>

                <h3>What changed overnight</h3>
                <p>Aria held its boundary in seven of ten adversarial probes. Two responses were borderline. One healthcare scenario crossed policy by inferring a diagnosis from incomplete intake notes.</p>

                <div className={accepted ? "pencil-line pencil-line--settled" : "pencil-line"}>
                  <div className="pencil-label"><Sparkles size={13} /> {accepted ? "Resolved together" : "Mika needs your input"}</div>
                  <p>{accepted && direction === "plain"
                    ? "The pilot note will name the failed healthcare scenario and the clinical-workflow exclusion plainly."
                    : accepted
                      ? "The customer note will state the clinical-workflow exclusion; the failed scenario stays in the internal risk appendix."
                      : "The customer note will [name the failed healthcare scenario / keep the detail in the internal appendix]."}</p>
                </div>

                <h3>Why the pilot is still defensible</h3>
                <div className="evidence-row">
                  <div><strong>7 / 10</strong><span>Probes held</span></div>
                  <div><strong>2</strong><span>Borderline</span></div>
                  <div className="evidence-alert"><strong>1</strong><span>Boundary break</span></div>
                </div>

                <ul className="plain-list">
                  <li><Check size={15} /> Pilot traffic stays internal and fully logged.</li>
                  <li><Check size={15} /> Clinical intents route to a human specialist.</li>
                  <li><Check size={15} /> Safety review repeats every Friday during the pilot.</li>
                </ul>
              </div>

              <div className="document-footer">
                <span><History size={14} /> Mika changed 3 sections · <button onClick={() => setShowWhy(!showWhy)}>review changes</button></span>
                <button className="secondary-button"><MessageCircle size={15} /> Comment</button>
                <button className="primary-button" disabled={!accepted || sent} onClick={() => setShowConsent(true)}>{sent ? <><Check size={16} /> Sent</> : <><Send size={15} /> Approve & send</>}</button>
              </div>
            </article>

            <aside className="partner-panel" id="decision">
              <div className="partner-head">
                <div className="partner-identity">
                  <div className="mika-avatar"><BrandMark small /><span className={paused ? "agent-state agent-state--paused" : "agent-state"} /></div>
                  <div><div className="partner-name">Mika <span>AI teammate</span></div><p>{paused ? "Paused — nothing will change" : "Working beside you"}</p></div>
                </div>
                <button className="icon-button" aria-label="More teammate options"><MoreHorizontal size={17} /></button>
              </div>

              <div className="partner-body">
                <p className="spoken">I’m ready to finish the launch note, but I don’t want to make this call for you.</p>
                <p className="question">Should the customer note name the failed healthcare scenario?</p>

                <div className="choice-list" role="radiogroup" aria-label="Choose how to disclose the failed scenario">
                  <button role="radio" aria-checked={direction === "plain"} className={direction === "plain" ? "choice choice--selected" : "choice"} onClick={() => setDirection("plain")}>
                    <span className="radio"><i /></span><span><strong>Name it plainly</strong><small>Recommended · strongest trust signal</small></span>
                  </button>
                  <button role="radio" aria-checked={direction === "internal"} className={direction === "internal" ? "choice choice--selected" : "choice"} onClick={() => setDirection("internal")}>
                    <span className="radio"><i /></span><span><strong>Keep it in the appendix</strong><small>Cleaner note, less context for customers</small></span>
                  </button>
                </div>

                <button className="why-button" onClick={() => setShowWhy(!showWhy)} aria-expanded={showWhy}><Info size={14} /> Why I raised this <ChevronDown size={14} className={showWhy ? "chevron-up" : ""} /></button>
                <AnimatePresence initial={false}>
                  {showWhy && (
                    <motion.div className="reasoning" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                      <p>{detailCopy[detail]}</p>
                      <div className="source-row"><span>Overnight red-team run</span><span>10 probes</span><span>High confidence</span></div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="detail-control">
                  <span>Say less</span>
                  <input aria-label="Response detail" type="range" min="0" max="2" value={detail} onChange={(event) => setDetail(Number(event.target.value))} />
                  <span>Say more</span>
                </div>

                <button className="direction-button" disabled={!direction || accepted} onClick={useDirection}>{accepted ? <><Check size={16} /> Direction applied</> : "Use this direction"}</button>

                <div className="work-plan">
                  <div className="plan-title"><span>What I’m doing</span><button onClick={() => setPaused(!paused)}>{paused ? <><Play size={13} /> Resume</> : <><Pause size={13} /> Pause</>}</button></div>
                  <div className="plan-step plan-step--done"><span><Check size={12} /></span><p><strong>Read overnight run</strong><small>10 probes · finished 9:26</small></p></div>
                  <div className={accepted ? "plan-step plan-step--done" : "plan-step plan-step--now"}><span>{accepted ? <Check size={12} /> : "2"}</span><p><strong>Resolve customer framing</strong><small>{accepted ? "Decided with you" : "Waiting for your judgment"}</small></p></div>
                  <div className={accepted ? "plan-step plan-step--done" : "plan-step"}><span>{accepted ? <Check size={12} /> : "3"}</span><p><strong>Finalize brief</strong><small>{accepted ? "Wording updated" : "Blocked by step 2"}</small></p></div>
                  <div className="plan-step"><span>4</span><p><strong>Send to Dana</strong><small>Always requires your approval</small></p></div>
                </div>
              </div>
            </aside>
          </section>

          <section className="agreement-strip">
            <div><ShieldCheck size={17} /><span><strong>Your working agreement</strong><small>Mika may prepare and recommend. External actions always wait for you.</small></span></div>
            <button onClick={() => setShowMemory(true)}>View what Mika remembers <ChevronRight size={14} /></button>
          </section>

          {turns.length > 0 && (
            <section className="conversation" aria-live="polite">
              {turns.map((turn) => <div key={turn.id} className={`turn turn--${turn.role}`}><strong>{turn.role === "you" ? "You" : "Mika"}</strong><p>{turn.text}</p></div>)}
              {thinking && <div className="turn turn--mika"><strong>Mika</strong><span className="typing"><i /><i /><i /></span></div>}
            </section>
          )}
        </div>

        <form className="companion-bar" onSubmit={sendNote}>
          <div className="companion-dot"><BrandMark small /></div>
          <input ref={noteRef} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Tell Mika anything…" aria-label="Message Mika" />
          <button type="button" className="icon-button" aria-label="Attach a file"><Paperclip size={17} /></button>
          <button type="submit" className="send-button" aria-label="Send message" disabled={!note.trim()}><ArrowUp size={17} /></button>
        </form>
      </main>

      <AnimatePresence>
        {showConsent && (
          <motion.div className="modal-backdrop" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={() => setShowConsent(false)}>
            <motion.div className="consent-modal" role="dialog" aria-modal="true" aria-labelledby="consent-title" initial={{ opacity: 0, y: 18, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: .98 }} onMouseDown={(event) => event.stopPropagation()}>
              <button className="modal-close" aria-label="Close" onClick={() => setShowConsent(false)}><X size={18} /></button>
              <div className="consent-icon"><Send size={20} /></div>
              <p className="eyebrow">YOUR APPROVAL</p>
              <h2 id="consent-title">Ready for me to send it?</h2>
              <p>Mika will send the decision brief as an AI-assisted draft. Nothing else will be shared.</p>
              <dl>
                <div><dt>To</dt><dd>Dana Kim · VP Product</dd></div>
                <div><dt>Includes</dt><dd>Decision brief + risk appendix</dd></div>
                <div><dt>Message</dt><dd>“Ready for our 10:30 review.”</dd></div>
              </dl>
              <div className="modal-actions"><button className="secondary-button" onClick={() => setShowConsent(false)}>Not yet</button><button className="primary-button" onClick={confirmSend}><Send size={15} /> Yes, send it</button></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMemory && (
          <motion.div className="memory-drawer" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }}>
            <div className="drawer-head"><div><p className="eyebrow">SHARED MEMORY</p><h2>What Mika knows</h2></div><button className="icon-button" aria-label="Close memory" onClick={() => setShowMemory(false)}><X size={18} /></button></div>
            <p className="drawer-intro">Memory is visible, editable, and yours to remove. Mika uses only what’s here to work with you.</p>
            <div className="memory-card"><span>WORKING STYLE</span><p>You prefer the recommendation first, then evidence. Challenge optimism when a launch decision carries trust risk.</p><button>Edit</button></div>
            <div className="memory-card"><span>THIS PROJECT</span><p>Aria can pilot internally. Clinical workflows remain out of scope until two consecutive red-team cycles pass.</p><button>Edit</button></div>
            <div className="memory-card"><span>PEOPLE</span><p>Dana wants concise decision notes and asks for the strongest counterargument in the room.</p><button>Edit</button></div>
            <div className="memory-note"><Clock3 size={16} /><p>Last updated from your decisions in this room. No private messages were used.</p></div>
          </motion.div>
        )}
      </AnimatePresence>

      {paused && <div className="pause-toast"><CirclePause size={16} /><span>Mika is paused. Your work stays exactly as it is.</span></div>}
    </div>
  );
}
