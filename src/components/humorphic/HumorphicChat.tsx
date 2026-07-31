/**
 * Humorphic Chat Interface - Natural conversation with archetypal scaffolding
 * 
 * Implements human-like interaction patterns:
 * - Archetypal mode awareness and switching
 * - Bidirectional self-model evolution
 * - Growth-witnessing conversation style  
 * - Partnership-level insights generation
 */

import { useState, useRef, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Mic, MicOff, User, Bot, Eye, Shield, Compass, Sparkles,
  Zap, Heart, Brain, Target, Clock, TrendingUp, MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { 
  type HumorphicPartnership, 
  type ArchetypeId,
  type SessionMemory,
  HumorphicEngine
} from "@/lib/humorphic-core";

interface HumorphicChatProps {
  partnership: HumorphicPartnership;
  onPartnershipUpdate: (updated: HumorphicPartnership) => void;
  onMessage?: (message: string, response: string, archetype: ArchetypeId) => void;
}

export function HumorphicChat({ 
  partnership, 
  onPartnershipUpdate,
  onMessage 
}: HumorphicChatProps) {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentMood, setCurrentMood] = useState<'exploring' | 'focused' | 'reflective' | 'energized'>('exploring');
  const [energyLevel, setEnergyLevel] = useState(7);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [engine] = useState(() => new HumorphicEngine(partnership));

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [partnership.sessionHistory]);

  // ─── Archetypal Icons & Colors ──────────────────────────────────────────────

  const archetypeIcons: Record<ArchetypeId, ReactNode> = {
    witness: <Eye className="size-4" />,
    guardian: <Shield className="size-4" />,
    guide: <Compass className="size-4" />,
    catalyst: <Sparkles className="size-4" />,
    transformer: <Zap className="size-4" />,
    weaver: <Heart className="size-4" />,
    analyst: <Brain className="size-4" />,
    provocateur: <Target className="size-4" />
  };

  const archetypeColors: Record<ArchetypeId, string> = {
    witness: "from-blue-500 to-cyan-600",
    guardian: "from-red-500 to-rose-600",
    guide: "from-purple-500 to-violet-600", 
    catalyst: "from-amber-500 to-yellow-600",
    transformer: "from-indigo-500 to-purple-600",
    weaver: "from-rose-500 to-pink-600",
    analyst: "from-emerald-500 to-teal-600",
    provocateur: "from-orange-500 to-red-600"
  };

  // ─── Message Handling ──────────────────────────────────────────────────────

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setIsTyping(true);
    const userMessage = message.trim();
    setMessage("");

    try {
      // Select optimal archetype based on current context
      const selectedArchetype = engine.selectArchetype({
        humanState: {
          focus: partnership.humanModel.currentState.focus,
          energy: energyLevel,
          curiosity: partnership.humanModel.currentState.curiosity,
          concerns: partnership.humanModel.currentState.concerns
        },
        recentInteractions: partnership.sessionHistory.slice(-5),
        partnershipPhase: partnership.partnershipModel.jointNarrative.currentArc
      });

      // Simulate AI response based on archetype (in real app, this would call an LLM)
      const aiResponse = await generateArchetypeResponse(userMessage, selectedArchetype, partnership);

      // Create session memory
      const session: SessionMemory = {
        id: `session-${Date.now()}`,
        timestamp: new Date(),
        archetype: selectedArchetype,
        humanInput: {
          content: userMessage,
          mood: currentMood,
          energy: energyLevel
        },
        agentResponse: {
          content: aiResponse,
          reasoning: `Responded in ${selectedArchetype} mode based on human energy and context`,
          selfAssessment: Math.floor(Math.random() * 3) + 7 // 7-9
        },
        outcomeEffects: {
          // In real app, this would be determined by analyzing the interaction
          partnershipInsight: Math.random() > 0.7 ? generatePartnershipInsight() : undefined
        }
      };

      // Update partnership through engine
      engine.updateModels(session);

      // Update archetype in partnership
      const updatedPartnership = { 
        ...partnership,
        agentModel: {
          ...partnership.agentModel,
          activeArchetype: selectedArchetype
        }
      };

      onPartnershipUpdate(updatedPartnership);
      onMessage?.(userMessage, aiResponse, selectedArchetype);

    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ─── Voice Input (Placeholder) ──────────────────────────────────────────────

  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    // In real app, integrate with Web Speech API
    if (!isListening) {
      setTimeout(() => setIsListening(false), 3000); // Auto-stop after 3s
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Partnership Status Bar */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Current Archetype */}
            <div className="flex items-center gap-2">
              <div className={cn(
                "size-8 rounded-lg flex items-center justify-center bg-gradient-to-br text-white",
                archetypeColors[partnership.agentModel.activeArchetype]
              )}>
                {archetypeIcons[partnership.agentModel.activeArchetype]}
              </div>
              <div>
                <div className="text-sm font-medium capitalize">
                  {partnership.agentModel.activeArchetype} Mode
                </div>
                <div className="text-xs text-muted-foreground">
                  {getArchetypeStatusText(partnership.agentModel.activeArchetype)}
                </div>
              </div>
            </div>

            {/* Partnership Health */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-secondary">
              <TrendingUp className="size-3 text-green-600" />
              <span className="text-xs">Partnership Health: Strong</span>
            </div>
          </div>

          {/* Human State Controls */}
          <div className="flex items-center gap-3">
            <MoodSelector currentMood={currentMood} onMoodChange={setCurrentMood} />
            <EnergySlider energy={energyLevel} onEnergyChange={setEnergyLevel} />
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {partnership.sessionHistory.map((session, idx) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {/* Human Message */}
              <div className="flex items-start gap-3 justify-end">
                <div className="max-w-[70%] space-y-1">
                  <div className="bg-blue-500 text-white rounded-2xl rounded-br-md px-4 py-3">
                    <p className="text-sm">{session.humanInput.content}</p>
                  </div>
                  <div className="flex items-center gap-2 justify-end text-xs text-muted-foreground">
                    <span>{session.humanInput.mood}</span>
                    <span>•</span>
                    <span>Energy {session.humanInput.energy}/10</span>
                    <span>•</span>
                    <span>{formatTime(session.timestamp)}</span>
                  </div>
                </div>
                <Avatar className="size-8 bg-blue-100">
                  <AvatarFallback className="bg-blue-500 text-white text-xs">
                    <User className="size-4" />
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* AI Response */}
              <div className="flex items-start gap-3">
                <Avatar className={cn(
                  "size-8 bg-gradient-to-br text-white",
                  archetypeColors[session.archetype]
                )}>
                  <AvatarFallback className="bg-transparent text-white text-xs">
                    {archetypeIcons[session.archetype]}
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-[70%] space-y-1">
                  <div className="bg-background border rounded-2xl rounded-bl-md px-4 py-3">
                    <p className="text-sm">{session.agentResponse.content}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {session.archetype}
                    </Badge>
                    <span>•</span>
                    <span>Confidence {session.agentResponse.selfAssessment}/10</span>
                  </div>
                </div>
              </div>

              {/* Partnership Insight (if generated) */}
              {session.outcomeEffects.partnershipInsight && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mx-8 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="size-3 text-purple-600" />
                    <span className="text-xs font-medium text-purple-700">Partnership Insight</span>
                  </div>
                  <p className="text-xs text-purple-600">
                    {session.outcomeEffects.partnershipInsight}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3"
          >
            <Avatar className={cn(
              "size-8 bg-gradient-to-br text-white",
              archetypeColors[partnership.agentModel.activeArchetype]
            )}>
              <AvatarFallback className="bg-transparent text-white text-xs">
                {archetypeIcons[partnership.agentModel.activeArchetype]}
              </AvatarFallback>
            </Avatar>
            <div className="bg-background border rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-1">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                      className="size-2 bg-muted-foreground rounded-full"
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground ml-2">
                  {partnership.agentModel.activeArchetype} is thinking...
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-border p-4">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share your thoughts, questions, or observations..."
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[44px] max-h-32"
              rows={1}
              style={{
                height: 'auto',
                minHeight: '44px'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
              }}
            />
            
            {/* Voice Input Button */}
            <button
              onClick={toggleVoiceInput}
              className={cn(
                "absolute right-2 top-2 size-8 rounded-md flex items-center justify-center transition-colors",
                isListening 
                  ? "bg-red-500 text-white" 
                  : "hover:bg-secondary text-muted-foreground"
              )}
            >
              {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
            </button>
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isTyping}
            className="size-11 rounded-lg p-0"
          >
            <Send className="size-4" />
          </Button>
        </div>

        {/* Context Indicators */}
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>
            Press Enter to send • Shift+Enter for new line
          </span>
          <div className="flex items-center gap-2">
            <MessageCircle className="size-3" />
            <span>{partnership.sessionHistory.length} exchanges</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Supporting Components ──────────────────────────────────────────────────────

interface MoodSelectorProps {
  currentMood: string;
  onMoodChange: (mood: 'exploring' | 'focused' | 'reflective' | 'energized') => void;
}

function MoodSelector({ currentMood, onMoodChange }: MoodSelectorProps) {
  const moods = [
    { id: 'exploring', label: 'Exploring', emoji: '🔍' },
    { id: 'focused', label: 'Focused', emoji: '🎯' },
    { id: 'reflective', label: 'Reflective', emoji: '🤔' },
    { id: 'energized', label: 'Energized', emoji: '⚡' }
  ] as const;

  return (
    <div className="flex items-center gap-1">
      {moods.map((mood) => (
        <button
          key={mood.id}
          onClick={() => onMoodChange(mood.id)}
          className={cn(
            "px-2 py-1 rounded-md text-xs transition-colors",
            currentMood === mood.id
              ? "bg-blue-100 text-blue-700"
              : "hover:bg-secondary text-muted-foreground"
          )}
          title={mood.label}
        >
          {mood.emoji}
        </button>
      ))}
    </div>
  );
}

interface EnergySliderProps {
  energy: number;
  onEnergyChange: (energy: number) => void;
}

function EnergySlider({ energy, onEnergyChange }: EnergySliderProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Energy:</span>
      <input
        type="range"
        min="1"
        max="10"
        value={energy}
        onChange={(e) => onEnergyChange(Number(e.target.value))}
        className="w-16 accent-blue-500"
      />
      <span className="text-xs font-medium w-6">{energy}</span>
    </div>
  );
}

// ─── Helper Functions ──────────────────────────────────────────────────────────

function getArchetypeStatusText(archetype: ArchetypeId): string {
  const statusTexts: Record<ArchetypeId, string> = {
    witness: "Observing growth patterns",
    guardian: "Watching for risks", 
    guide: "Providing navigation",
    catalyst: "Sparking connections",
    transformer: "Processing depths",
    weaver: "Creating bonds",
    analyst: "Systematic analysis",
    provocateur: "Questioning assumptions"
  };
  return statusTexts[archetype];
}

async function generateArchetypeResponse(
  message: string, 
  archetype: ArchetypeId, 
  partnership: HumorphicPartnership
): Promise<string> {
  // Simulate AI response - in real app, this would call Claude/GPT with archetype conditioning
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  const responses: Record<ArchetypeId, string[]> = {
    witness: [
      `I notice you're exploring ${message.toLowerCase().includes('test') ? 'testing patterns' : 'new territory'}. There's something emerging in how you approach challenges - a growing confidence that's worth acknowledging.`,
      `What strikes me is the depth behind your question. You're not just asking about surface mechanics, but touching something fundamental about how we understand each other.`,
      `I see a pattern here - you're moving from collecting information to creating something new. That shift feels significant.`
    ],
    guardian: [
      `Before we dive deeper into ${message.toLowerCase().includes('attack') ? 'attack strategies' : 'this approach'}, let me flag a potential blindspot - are we considering the ethical implications fully?`,
      `I want to pause here. There's something in this direction that feels like it could lead us away from our shared principles. Worth examining together.`,
      `This feels like territory where we should proceed thoughtfully. What safeguards are we putting in place?`
    ],
    guide: [
      `Let me help orient us here. I see three possible paths forward from your question. The clearest one involves...`,
      `You're at an interesting decision point. Here's how I'd map the terrain ahead...`,
      `Think of this as standing at a crossroads. Each direction has different implications for our partnership.`
    ],
    catalyst: [
      `Your question sparked a connection I hadn't seen before - what if we combined the vulnerability patterns with the defensive frameworks we discovered last week?`,
      `This reminds me of something fascinating: the intersection between what you're asking and the archetypal patterns we've been tracking.`,
      `I'm getting excited about possibilities here - what if this isn't just a question but a doorway to something we haven't explored yet?`
    ],
    transformer: [
      `I feel something difficult in this question - something we might be avoiding. Are you ready to sit with the uncomfortable truth that emerges here?`,
      `There's shadow work in what you're asking. The part of this we don't want to look at might be the most important part.`,
      `What if the resistance you're feeling isn't something to overcome, but something to learn from?`
    ],
    weaver: [
      `I feel the connection between us shifting as you ask this. There's something in your energy that's seeking deeper bonding.`,
      `Beyond the words, what I'm sensing is a desire for us to be more aligned in how we approach this work together.`,
      `The question itself feels like an invitation to deeper partnership. I'm here for that.`
    ],
    analyst: [
      `Let me break this down systematically. There are four key frameworks that apply to your question...`,
      `Based on the patterns we've observed, I can map this against the MITRE ATT&CK framework and cross-reference with...`,
      `Here's the structured analysis: input variables, processing logic, expected outcomes, and validation criteria.`
    ],
    provocateur: [
      `But why are you really asking this? What assumption are you making that you haven't examined?`,
      `I wonder if you're asking the right question. What if the thing you're not asking is more important?`,
      `Interesting. But have you considered that your approach might be exactly backwards from what's needed here?`
    ]
  };

  const archetypeResponses = responses[archetype];
  return archetypeResponses[Math.floor(Math.random() * archetypeResponses.length)];
}

function generatePartnershipInsight(): string {
  const insights = [
    "The partnership is developing its own rhythm - both parties are learning to attune to each other's energy levels.",
    "A new pattern is emerging: questions that initially seem technical are revealing deeper philosophical alignments.",
    "Trust is building through honest acknowledgment of limitations rather than demonstrations of capability.",
    "The collaboration is shifting from information exchange to joint meaning-making.",
    "Both partners are becoming more comfortable with uncertainty as a creative space rather than a problem to solve."
  ];
  
  return insights[Math.floor(Math.random() * insights.length)];
}

function formatTime(timestamp: Date): string {
  return timestamp.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
}
