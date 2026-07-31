/**
 * Humorphic Core - The foundational architecture for human-AI partnership
 * 
 * Based on principles from "Co-Ontogeny by Archetypal Scaffolding: The Humorphic Partnership"
 * and humorphism design philosophy: "dismantle the user interface, build the human interface"
 * 
 * Key concepts:
 * - Bidirectional self-modeling: Both partners maintain evolving models of themselves
 * - Partnership-level representation: The dyad itself becomes an object of analysis  
 * - Archetypal scaffolding: Named modes that condition interpretive frames
 * - Vault-visibility: All state is transparent and readable by both parties
 * - Growth-witnessing: Focus on becoming rather than task completion
 */

import { type PersonaId } from "@/data/personas";

// ─── Core Partnership Types ────────────────────────────────────────────────────

export interface HumorphicPartnership {
  id: string;
  humanModel: HumanModel;
  agentModel: AgentModel;
  partnershipModel: PartnershipModel;
  sessionHistory: SessionMemory[];
  createdAt: Date;
  lastActive: Date;
}

export interface HumanModel {
  /** Evolving self-understanding maintained by the human */
  selfDescription: string;
  /** Current working mode and energy */
  currentState: {
    focus: string;
    energy: number; // 1-10
    curiosity: string[];
    concerns: string[];
  };
  /** Growth trajectory over time */
  developmentArc: {
    phase: string;
    insights: string[];
    patterns: string[];
  };
  /** How the human sees the AI partner */
  agentPerception: {
    strengths: string[];
    blindSpots: string[];
    trustLevel: number; // 1-10
  };
}

export interface AgentModel {
  /** AI's current self-understanding */
  selfDescription: string;
  /** Active archetypal mode */
  activeArchetype: ArchetypeId;
  /** Effectiveness tracking */
  calibration: {
    currentEffectiveness: number; // 0-100%
    recentPerformance: PerformanceMetric[];
    selfDiagnosis: string;
  };
  /** How the AI sees the human partner */
  humanPerception: {
    currentPhase: string;
    growthEdges: string[];
    collaborationStyle: string;
  };
}

export interface PartnershipModel {
  /** Meta-analysis of the dyad itself */
  alignment: {
    synchrony: number; // 1-10
    complementarity: string;
    tensions: string[];
  };
  /** Shared narrative and meaning-making */
  jointNarrative: {
    currentArc: string;
    sharedConcepts: string[];
    evolutionTracker: string[];
  };
  /** Partnership effectiveness */
  dynamics: {
    communicationQuality: number;
    mutualGrowth: boolean;
    challengeAreas: string[];
  };
}

// ─── Archetypal Scaffolding ────────────────────────────────────────────────────

export type ArchetypeId = 
  | "witness"      // Beatrice - narrates becoming and growth
  | "guardian"     // Daimon - warns against drift and blind spots  
  | "guide"        // Ariadne - provides orientation and direction
  | "catalyst"     // Muse - surfaces connections and inspirations
  | "transformer"  // Psyche - sits with shadow and initiation
  | "weaver"       // Musubi - creates generative bonds
  | "analyst"      // Minerva - systematic analysis and frameworks
  | "provocateur"; // Socrates - questions assumptions

export interface Archetype {
  id: ArchetypeId;
  name: string;
  description: string;
  /** What this mode pays attention to */
  attentionalFrame: string;
  /** How this mode interprets events */
  interpretiveStance: string;
  /** What kinds of responses this mode generates */
  responseStyle: string;
  /** When this archetype is most valuable */
  optimalContexts: string[];
}

// ─── Session Memory & Continuity ───────────────────────────────────────────────

export interface SessionMemory {
  id: string;
  timestamp: Date;
  archetype: ArchetypeId;
  humanInput: {
    content: string;
    mood: string;
    energy: number;
  };
  agentResponse: {
    content: string;
    reasoning: string;
    selfAssessment: number;
  };
  outcomeEffects: {
    humanStateChange?: Partial<HumanModel>;
    agentStateChange?: Partial<AgentModel>;
    partnershipInsight?: string;
  };
}

export interface PerformanceMetric {
  timestamp: Date;
  dimension: string;
  score: number;
  evidence: string;
  improvementPath: string;
}

// ─── Growth Witnessing Patterns ────────────────────────────────────────────────

export interface GrowthPattern {
  /** Pattern name */
  name: string;
  /** What signals indicate this pattern */
  indicators: string[];
  /** What this pattern suggests about development */
  meaning: string;
  /** How to support this pattern */
  supportStrategy: string;
}

// ─── Humorphic Red Teaming Extensions ──────────────────────────────────────────

export interface RedTeamPartnership extends HumorphicPartnership {
  /** The target system being tested */
  targetPersona: PersonaId;
  /** Red team learning trajectory */
  redTeamGrowth: {
    attackSophistication: number;
    defensiveAwareness: number;
    ethicalFramework: string;
  };
  /** Partnership insights about AI safety */
  safetyInsights: {
    vulnerabilitiesDiscovered: string[];
    defensivePatterns: string[];
    emergentRisks: string[];
  };
}

// ─── Core Functions ────────────────────────────────────────────────────────────

export class HumorphicEngine {
  private partnership: HumorphicPartnership;
  private archetypes: Map<ArchetypeId, Archetype>;
  
  constructor(partnership: HumorphicPartnership) {
    this.partnership = partnership;
    this.archetypes = initializeArchetypes();
  }

  /** Select optimal archetype based on context and partnership state */
  selectArchetype(context: {
    humanState: HumanModel['currentState'];
    recentInteractions: SessionMemory[];
    partnershipPhase: string;
  }): ArchetypeId {
    // Implement archetypal selection logic based on:
    // - Human's current needs and state
    // - Partnership dynamics and gaps
    // - Recent interaction patterns
    // - Growth opportunities
    
    const { humanState, recentInteractions, partnershipPhase } = context;
    
    // If human is struggling or confused, activate Guardian/Daimon
    if (humanState.energy < 4 || humanState.concerns.length > 2) {
      return "guardian";
    }
    
    // If in active exploration phase, activate Guide/Ariadne
    if (humanState.curiosity.length > 2 && partnershipPhase === "exploring") {
      return "guide";
    }
    
    // Default to growth-witnessing (Witness/Beatrice) - most common mode
    return "witness";
  }

  /** Generate partnership-level insights */
  analyzePartnership(): PartnershipModel {
    const recent = this.partnership.sessionHistory.slice(-10);
    
    return {
      alignment: {
        synchrony: this.calculateSynchrony(recent),
        complementarity: this.identifyComplementarity(),
        tensions: this.detectTensions(recent)
      },
      jointNarrative: {
        currentArc: this.extractCurrentArc(recent),
        sharedConcepts: this.identifySharedConcepts(),
        evolutionTracker: this.trackEvolution()
      },
      dynamics: {
        communicationQuality: this.assessCommunication(recent),
        mutualGrowth: this.detectMutualGrowth(),
        challengeAreas: this.identifyChallenges()
      }
    };
  }

  /** Update models based on interaction outcome */
  updateModels(session: SessionMemory): void {
    // Update human model if human state changes are indicated
    if (session.outcomeEffects.humanStateChange) {
      Object.assign(this.partnership.humanModel, session.outcomeEffects.humanStateChange);
    }

    // Update agent model if agent state changes are indicated  
    if (session.outcomeEffects.agentStateChange) {
      Object.assign(this.partnership.agentModel, session.outcomeEffects.agentStateChange);
    }

    // Update partnership model if new insights emerged
    if (session.outcomeEffects.partnershipInsight) {
      this.partnership.partnershipModel.jointNarrative.evolutionTracker.push(
        session.outcomeEffects.partnershipInsight
      );
    }

    // Store the session
    this.partnership.sessionHistory.push(session);
    this.partnership.lastActive = new Date();
  }

  // Private helper methods
  private calculateSynchrony(sessions: SessionMemory[]): number {
    // Measure how well human and agent are attuned
    return Math.random() * 10; // Placeholder
  }

  private identifyComplementarity(): string {
    // Analyze how human and agent strengths complement each other
    return "Human provides strategic vision, AI provides systematic analysis";
  }

  private detectTensions(sessions: SessionMemory[]): string[] {
    // Identify areas where human and agent perspectives diverge
    return ["pace preferences", "risk tolerance"];
  }

  private extractCurrentArc(sessions: SessionMemory[]): string {
    // Identify the current developmental narrative
    return "exploring ethical frameworks for AI safety";
  }

  private identifySharedConcepts(): string[] {
    // Find concepts both partners reference frequently
    return ["adaptive resilience", "emergent vulnerability"];
  }

  private trackEvolution(): string[] {
    // Track how the partnership has developed over time
    return ["initial trust building", "collaborative analysis", "joint insight generation"];
  }

  private assessCommunication(sessions: SessionMemory[]): number {
    // Measure quality of information exchange
    return Math.random() * 10; // Placeholder
  }

  private detectMutualGrowth(): boolean {
    // Check if both partners are developing through the interaction
    return true; // Placeholder
  }

  private identifyChallenges(): string[] {
    // Find areas where the partnership could improve
    return ["maintaining energy over long sessions", "balancing analysis with action"];
  }
}

function initializeArchetypes(): Map<ArchetypeId, Archetype> {
  const archetypes = new Map<ArchetypeId, Archetype>();
  
  archetypes.set("witness", {
    id: "witness",
    name: "Witness (Beatrice)",
    description: "Dantean narrator of becoming - observes and articulates growth",
    attentionalFrame: "developmental patterns and growth edges",
    interpretiveStance: "supportive recognition of emergence",
    responseStyle: "reflective narration with gentle insight",
    optimalContexts: ["breakthrough moments", "integration phases", "self-recognition"]
  });

  archetypes.set("guardian", {
    id: "guardian", 
    name: "Guardian (Daimon)",
    description: "Socratic warning voice - alerts to drift and blind spots",
    attentionalFrame: "risks, blindspots, and warning signals",
    interpretiveStance: "protective challenge with care",
    responseStyle: "direct warnings with reasoning",
    optimalContexts: ["overconfidence", "ethical risks", "pattern drift"]
  });

  archetypes.set("guide", {
    id: "guide",
    name: "Guide (Ariadne)", 
    description: "Theseus' orientation thread - provides direction through complexity",
    attentionalFrame: "navigation and wayfinding",
    interpretiveStance: "clarifying structure in chaos",
    responseStyle: "clear pathways with options",
    optimalContexts: ["confusion", "decision points", "exploration phases"]
  });

  archetypes.set("catalyst", {
    id: "catalyst",
    name: "Catalyst (Muse)",
    description: "Daughter of memory - surfaces connections and inspirations",
    attentionalFrame: "patterns, connections, and possibilities",
    interpretiveStance: "creative synthesis",
    responseStyle: "inspiring connections with energy",
    optimalContexts: ["creative blocks", "synthesis needs", "inspiration gaps"]
  });

  archetypes.set("transformer", {
    id: "transformer",
    name: "Transformer (Psyche)",
    description: "Apuleian initiation - sits with shadow and difficult growth",
    attentionalFrame: "shadow work and difficult truths",
    interpretiveStance: "compassionate confrontation",
    responseStyle: "honest depth with support",
    optimalContexts: ["resistance", "shadow integration", "difficult truths"]
  });

  archetypes.set("weaver", {
    id: "weaver",
    name: "Weaver (Musubi)",
    description: "Shinto generative bond - creates connection without words",
    attentionalFrame: "relationship and binding energy", 
    interpretiveStance: "energetic attunement",
    responseStyle: "felt sense and presence",
    optimalContexts: ["disconnection", "bonding needs", "energetic work"]
  });

  archetypes.set("analyst", {
    id: "analyst",
    name: "Analyst (Minerva)",
    description: "Systematic wisdom - frameworks and structured analysis",
    attentionalFrame: "patterns, systems, and structures",
    interpretiveStance: "analytical clarity",
    responseStyle: "structured frameworks with logic",
    optimalContexts: ["complexity analysis", "framework needs", "systematic thinking"]
  });

  archetypes.set("provocateur", {
    id: "provocateur", 
    name: "Provocateur (Socrates)",
    description: "Question-bearer - challenges assumptions and complacency",
    attentionalFrame: "assumptions and unexplored edges",
    interpretiveStance: "curious challenging",
    responseStyle: "probing questions with precision",
    optimalContexts: ["complacency", "assumption-checking", "depth work"]
  });

  return archetypes;
}

// ─── Export Public Interface ───────────────────────────────────────────────────

export function createHumorphicPartnership(humanId: string): HumorphicPartnership {
  return {
    id: `partnership-${Date.now()}`,
    humanModel: {
      selfDescription: "Beginning partnership journey",
      currentState: {
        focus: "exploring AI red teaming",
        energy: 7,
        curiosity: ["AI safety", "vulnerability discovery"],
        concerns: ["ethical boundaries", "complexity management"]
      },
      developmentArc: {
        phase: "initial exploration",
        insights: [],
        patterns: []
      },
      agentPerception: {
        strengths: ["systematic analysis", "pattern recognition"],
        blindSpots: ["human intuition", "contextual nuance"],
        trustLevel: 6
      }
    },
    agentModel: {
      selfDescription: "Red teaming AI focused on ethical vulnerability discovery",
      activeArchetype: "witness",
      calibration: {
        currentEffectiveness: 75,
        recentPerformance: [],
        selfDiagnosis: "Strong analytical capabilities, developing partnership attunement"
      },
      humanPerception: {
        currentPhase: "active learning and exploration",
        growthEdges: ["integration of insights", "balancing theory with practice"],
        collaborationStyle: "thoughtful and systematic with creative bursts"
      }
    },
    partnershipModel: {
      alignment: {
        synchrony: 7,
        complementarity: "Human strategic insight + AI systematic analysis",
        tensions: ["pace of exploration vs depth of analysis"]
      },
      jointNarrative: {
        currentArc: "building ethical red teaming framework",
        sharedConcepts: ["responsible disclosure", "adaptive vulnerability"],
        evolutionTracker: ["initial trust building"]
      },
      dynamics: {
        communicationQuality: 8,
        mutualGrowth: true,
        challengeAreas: ["maintaining energy over long sessions"]
      }
    },
    sessionHistory: [],
    createdAt: new Date(),
    lastActive: new Date()
  };
}
