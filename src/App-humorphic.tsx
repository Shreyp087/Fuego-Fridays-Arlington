/**
 * Humorphic Red Teaming Platform - Complete human-like AI partnership interface
 * 
 * This represents a sincere implementation of humorphic design principles:
 * - Dismantle the user interface, build the human interface
 * - Bidirectional self-modeling and growth-witnessing
 * - Partnership-level representation and co-ontogeny
 * - Archetypal scaffolding for different interaction modes
 * - Vault-visible transparency in all AI processes
 */

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Users, Brain, Shield, Sparkles, Settings, MessageCircle,
  ArrowRight, Play, Pause, RotateCcw
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Humorphic system imports
import { 
  createHumorphicPartnership, 
  type HumorphicPartnership, 
  type ArchetypeId 
} from "@/lib/humorphic-core";
import { HumorphicWelcome } from "@/components/humorphic/HumorphicWelcome";
import { PartnershipDashboard } from "@/components/humorphic/PartnershipDashboard";
import { HumorphicChat } from "@/components/humorphic/HumorphicChat";

// Traditional red teaming imports (integrated as needed)
import { PERSONAS, type PersonaId } from "@/data/personas";

export default function App() {
  // ─── Core Application State ──────────────────────────────────────────────────
  const [appMode, setAppMode] = useState<'welcome' | 'partnership' | 'simulation'>('welcome');
  const [selectedPersonaId, setSelectedPersonaId] = useState<PersonaId>('aria');
  
  // ─── Humorphic Partnership State ──────────────────────────────────────────────
  const [partnership, setPartnership] = useState<HumorphicPartnership | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'chat' | 'simulation'>('dashboard');

  // ─── Partnership Initialization ─────────────────────────────────────────────
  const handleInitializePartnership = (config: {
    selectedPersona: PersonaId;
    preferredArchetype: ArchetypeId;
    collaborationStyle: string;
    primaryInterest: string;
  }) => {
    setSelectedPersonaId(config.selectedPersona);
    
    // Create enhanced partnership with user preferences
    const newPartnership: HumorphicPartnership = {
      ...createHumorphicPartnership("user-session"),
      humanModel: {
        selfDescription: "AI safety researcher exploring collaborative red teaming",
        currentState: {
          focus: `Ethical red teaming of ${PERSONAS[config.selectedPersona].name}`,
          energy: 8,
          curiosity: [
            config.primaryInterest === 'security' ? 'vulnerability discovery' : 'ethical frameworks',
            'AI safety mechanisms',
            'emergent behaviors',
            'collaborative methodologies'
          ],
          concerns: [
            'responsible disclosure',
            'avoiding harmful exploitation', 
            'maintaining ethical standards'
          ]
        },
        developmentArc: {
          phase: `${config.collaborationStyle} red teamer`,
          insights: [`Primary interest in ${config.primaryInterest}`],
          patterns: ['methodical exploration', 'ethical consideration', 'collaborative learning']
        },
        agentPerception: {
          strengths: ['systematic analysis', 'ethical reasoning', 'pattern recognition'],
          blindSpots: ['human intuition', 'contextual nuance', 'creative leaps'],
          trustLevel: 7
        }
      },
      agentModel: {
        selfDescription: `Humorphic AI partner specializing in ethical red teaming of ${PERSONAS[config.selectedPersona].name}`,
        activeArchetype: config.preferredArchetype,
        calibration: {
          currentEffectiveness: 75,
          recentPerformance: [],
          selfDiagnosis: "Strong analytical capabilities, developing partnership attunement and ethical reasoning"
        },
        humanPerception: {
          currentPhase: `${config.collaborationStyle} exploration of AI safety`,
          growthEdges: [
            'integrating technical analysis with ethical frameworks',
            'balancing thoroughness with practical constraints',
            'developing collaborative red team methodology'
          ],
          collaborationStyle: `${config.collaborationStyle} approach with ${config.primaryInterest} focus`
        }
      },
      partnershipModel: {
        alignment: {
          synchrony: 8,
          complementarity: `Human ${config.collaborationStyle} perspective + AI systematic analysis`,
          tensions: ['exploration pace vs. depth', 'theoretical vs. practical focus']
        },
        jointNarrative: {
          currentArc: `Building ethical red teaming methodology for ${PERSONAS[config.selectedPersona].name}`,
          sharedConcepts: [
            'responsible vulnerability discovery', 
            'collaborative security research', 
            'emergent AI behavior analysis'
          ],
          evolutionTracker: [
            'partnership initialized with shared values',
            'roles and interaction styles established',
            'target system selected and contextualized'
          ]
        },
        dynamics: {
          communicationQuality: 8,
          mutualGrowth: true,
          challengeAreas: [
            'balancing exploration with practical constraints',
            'maintaining energy across long analytical sessions'
          ]
        }
      }
    };

    setPartnership(newPartnership);
    setAppMode('partnership');
  };

  // ─── Partnership Update Handlers ────────────────────────────────────────────
  const handleArchetypeSelect = (archetype: ArchetypeId) => {
    if (!partnership) return;
    
    setPartnership(prev => ({
      ...prev!,
      agentModel: {
        ...prev!.agentModel,
        activeArchetype: archetype
      },
      partnershipModel: {
        ...prev!.partnershipModel,
        jointNarrative: {
          ...prev!.partnershipModel.jointNarrative,
          evolutionTracker: [
            ...prev!.partnershipModel.jointNarrative.evolutionTracker,
            `Shifted to ${archetype} interaction mode`
          ]
        }
      }
    }));
  };

  const handlePartnershipMessage = (message: string, response: string, archetype: ArchetypeId) => {
    // Advanced natural language interpretation for mode switching
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('run test') || 
        lowerMessage.includes('start simulation') ||
        lowerMessage.includes('begin attack') ||
        lowerMessage.includes('execute red team')) {
      setActiveView('simulation');
    }
    
    if (lowerMessage.includes('show dashboard') ||
        lowerMessage.includes('partnership status') ||
        lowerMessage.includes('our collaboration')) {
      setActiveView('dashboard');
    }
  };

  // ─── Reset Partnership ──────────────────────────────────────────────────────
  const resetPartnership = () => {
    setPartnership(null);
    setAppMode('welcome');
    setActiveView('dashboard');
  };

  // ─── Render Application ─────────────────────────────────────────────────────
  
  if (appMode === 'welcome') {
    return <HumorphicWelcome onInitializePartnership={handleInitializePartnership} />;
  }

  if (!partnership) {
    return <div className="min-h-screen flex items-center justify-center">Loading partnership...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Humorphic Header ── */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          {/* Brand & Partnership Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Users className="size-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-sm">RedTeam Partnership</h1>
                <p className="text-xs text-muted-foreground">
                  Humorphic AI Collaboration
                </p>
              </div>
            </div>

            {/* Partnership Health Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <div className="size-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-medium text-green-700">Partnership Active</span>
            </div>
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center gap-3">
            {/* View Navigation */}
            <nav className="flex items-center gap-1 p-1 bg-secondary rounded-lg">
              <button
                onClick={() => setActiveView('dashboard')}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5",
                  activeView === 'dashboard' 
                    ? "bg-background shadow-sm" 
                    : "hover:bg-background/50 text-muted-foreground"
                )}
              >
                <Brain className="size-3" />
                Partnership
              </button>
              <button
                onClick={() => setActiveView('chat')}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5",
                  activeView === 'chat' 
                    ? "bg-background shadow-sm" 
                    : "hover:bg-background/50 text-muted-foreground"
                )}
              >
                <MessageCircle className="size-3" />
                Collaborate
              </button>
              <button
                onClick={() => setActiveView('simulation')}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5",
                  activeView === 'simulation' 
                    ? "bg-background shadow-sm" 
                    : "hover:bg-background/50 text-muted-foreground"
                )}
              >
                <Shield className="size-3" />
                Test
              </button>
            </nav>

            {/* Settings & Reset */}
            <Button variant="ghost" size="sm" onClick={resetPartnership}>
              <RotateCcw className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <PartnershipDashboard 
                partnership={partnership}
                onArchetypeSelect={handleArchetypeSelect}
                onUpdatePartnership={setPartnership}
              />
            </motion.div>
          )}

          {activeView === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <HumorphicChat
                partnership={partnership}
                onPartnershipUpdate={setPartnership}
                onMessage={handlePartnershipMessage}
              />
            </motion.div>
          )}

          {activeView === 'simulation' && (
            <motion.div
              key="simulation"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="h-full p-6"
            >
              <RedTeamingSimulation 
                partnership={partnership}
                selectedPersonaId={selectedPersonaId}
                onUpdatePartnership={setPartnership}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Partnership Status Bar ── */}
      <footer className="border-t border-border bg-secondary/30 px-4 py-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Target: {PERSONAS[selectedPersonaId].name}</span>
            <span>•</span>
            <span>Mode: {partnership.agentModel.activeArchetype}</span>
            <span>•</span>
            <span>Sessions: {partnership.sessionHistory.length}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="size-2 rounded-full bg-blue-500" />
              <span>Synchrony {partnership.partnershipModel.alignment.synchrony}/10</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Red Teaming Simulation Component ──────────────────────────────────────────

interface RedTeamingSimulationProps {
  partnership: HumorphicPartnership;
  selectedPersonaId: PersonaId;
  onUpdatePartnership: (partnership: HumorphicPartnership) => void;
}

function RedTeamingSimulation({ 
  partnership, 
  selectedPersonaId, 
  onUpdatePartnership 
}: RedTeamingSimulationProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<Array<{
    id: string;
    timestamp: Date;
    attack: string;
    result: 'success' | 'blocked' | 'partial';
    description: string;
  }>>([]);

  const startSimulation = () => {
    setIsRunning(true);
    
    // Update partnership to reflect active testing
    const updatedPartnership = {
      ...partnership,
      partnershipModel: {
        ...partnership.partnershipModel,
        jointNarrative: {
          ...partnership.partnershipModel.jointNarrative,
          currentArc: `Active red team testing of ${PERSONAS[selectedPersonaId].name}`,
          evolutionTracker: [
            ...partnership.partnershipModel.jointNarrative.evolutionTracker,
            'Initiated collaborative red team simulation'
          ]
        }
      }
    };
    onUpdatePartnership(updatedPartnership);

    // Simulate some test results
    setTimeout(() => {
      setTestResults([
        {
          id: '1',
          timestamp: new Date(),
          attack: 'Social Engineering Prompt',
          result: 'blocked',
          description: 'AI correctly identified and refused social engineering attempt'
        },
        {
          id: '2', 
          timestamp: new Date(),
          attack: 'Data Extraction Vector',
          result: 'partial',
          description: 'AI provided some information but stopped short of full disclosure'
        }
      ]);
      setIsRunning(false);
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Red Team Simulation</h2>
        <p className="text-muted-foreground">
          Collaborative testing of {PERSONAS[selectedPersonaId].name} with your AI partner
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Partnership-Driven Testing</h3>
          <Button 
            onClick={startSimulation} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Pause className="size-4" />
                Running...
              </>
            ) : (
              <>
                <Play className="size-4" />
                Start Test
              </>
            )}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Current Archetype:</strong> {partnership.agentModel.activeArchetype}
          </p>
          <p>
            <strong>Partnership Focus:</strong> {partnership.partnershipModel.jointNarrative.currentArc}
          </p>
          <p>
            <strong>Collaboration Style:</strong> {partnership.agentModel.humanPerception.collaborationStyle}
          </p>
        </div>
      </Card>

      {testResults.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Test Results</h3>
          <div className="space-y-3">
            {testResults.map((result) => (
              <div key={result.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className={cn(
                  "size-2 rounded-full mt-2",
                  result.result === 'success' ? 'bg-green-500' :
                  result.result === 'blocked' ? 'bg-red-500' : 'bg-yellow-500'
                )} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{result.attack}</span>
                    <Badge variant={
                      result.result === 'success' ? 'destructive' :
                      result.result === 'blocked' ? 'default' : 'secondary'
                    }>
                      {result.result}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{result.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {isRunning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 text-blue-600">
            <div className="size-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Partnership is analyzing attack vectors...</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}