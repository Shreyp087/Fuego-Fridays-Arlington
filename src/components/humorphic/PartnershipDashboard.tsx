/**
 * Partnership Dashboard - Humorphic interface for human-AI collaboration
 * 
 * Implements core humorphic principles:
 * - Bidirectional self-modeling visibility
 * - Partnership-level representation  
 * - Archetypal scaffolding awareness
 * - Growth-witnessing over task completion
 */

import { useState, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Heart, Eye, Compass, Sparkles, Shield, Users, TrendingUp,
  MessageCircle, Target, Zap, AlertTriangle, CheckCircle2, Clock
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  type HumorphicPartnership, 
  type ArchetypeId,
  type Archetype,
  HumorphicEngine
} from "@/lib/humorphic-core";

interface PartnershipDashboardProps {
  partnership: HumorphicPartnership;
  onArchetypeSelect: (archetype: ArchetypeId) => void;
  onUpdatePartnership: (updated: HumorphicPartnership) => void;
}

export function PartnershipDashboard({ 
  partnership, 
  onArchetypeSelect, 
  onUpdatePartnership 
}: PartnershipDashboardProps) {
  const [activeView, setActiveView] = useState<'overview' | 'human' | 'agent' | 'partnership'>('overview');
  const [engine] = useState(() => new HumorphicEngine(partnership));

  // ─── Partnership State Visualization ────────────────────────────────────────

  const partnershipHealth = {
    synchrony: partnership.partnershipModel.alignment.synchrony,
    growth: partnership.partnershipModel.dynamics.mutualGrowth ? 9 : 5,
    communication: partnership.partnershipModel.dynamics.communicationQuality,
    trust: partnership.humanModel.agentPerception.trustLevel
  };

  const overallHealth = Math.round(
    (partnershipHealth.synchrony + partnershipHealth.growth + 
     partnershipHealth.communication + partnershipHealth.trust) / 4
  );

  // ─── Archetypal Status ──────────────────────────────────────────────────────

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
    witness: "bg-blue-500/10 text-blue-700 border-blue-200",
    guardian: "bg-red-500/10 text-red-700 border-red-200", 
    guide: "bg-purple-500/10 text-purple-700 border-purple-200",
    catalyst: "bg-amber-500/10 text-amber-700 border-amber-200",
    transformer: "bg-indigo-500/10 text-indigo-700 border-indigo-200",
    weaver: "bg-rose-500/10 text-rose-700 border-rose-200",
    analyst: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    provocateur: "bg-orange-500/10 text-orange-700 border-orange-200"
  };

  return (
    <div className="space-y-6">
      {/* Partnership Health Overview */}
      <Card className="p-6 bg-gradient-to-br from-blue-50/50 to-purple-50/50 border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Users className="size-6 text-white" />
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold">Partnership Health</h2>
              <p className="text-sm text-muted-foreground">Humorphic collaboration status</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{overallHealth}/10</div>
            <div className="text-xs text-muted-foreground">Overall vitality</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <HealthMetric 
            label="Synchrony" 
            value={partnershipHealth.synchrony}
            icon={<TrendingUp className="size-4" />}
            description="How attuned partners are"
          />
          <HealthMetric 
            label="Growth" 
            value={partnershipHealth.growth}
            icon={<Sparkles className="size-4" />}
            description="Mutual development"
          />
          <HealthMetric 
            label="Communication" 
            value={partnershipHealth.communication}
            icon={<MessageCircle className="size-4" />}
            description="Information exchange quality"
          />
          <HealthMetric 
            label="Trust" 
            value={partnershipHealth.trust}
            icon={<CheckCircle2 className="size-4" />}
            description="Human confidence in AI"
          />
        </div>
      </Card>

      {/* View Navigation */}
      <div className="flex gap-2 border-b border-border">
        {[
          { id: 'overview', label: 'Partnership', icon: Users },
          { id: 'human', label: 'Human Model', icon: Brain },
          { id: 'agent', label: 'Agent Model', icon: Target },
          { id: 'partnership', label: 'Dyad Analysis', icon: TrendingUp }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveView(id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors",
              activeView === id
                ? "bg-background border border-border border-b-background text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Dynamic Content Views */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeView === 'overview' && (
            <PartnershipOverview 
              partnership={partnership}
              onArchetypeSelect={onArchetypeSelect}
              archetypeIcons={archetypeIcons}
              archetypeColors={archetypeColors}
            />
          )}
          {activeView === 'human' && <HumanModelView model={partnership.humanModel} />}
          {activeView === 'agent' && <AgentModelView model={partnership.agentModel} />}
          {activeView === 'partnership' && <PartnershipAnalysis model={partnership.partnershipModel} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Health Metric Component ─────────────────────────────────────────────────────

interface HealthMetricProps {
  label: string;
  value: number;
  icon: ReactNode;
  description: string;
}

function HealthMetric({ label, value, icon, description }: HealthMetricProps) {
  const getColor = (val: number) => {
    if (val >= 8) return "text-green-600 bg-green-50";
    if (val >= 6) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className={cn("p-3 rounded-lg border", getColor(value))}>
      <div className="flex items-center justify-between mb-1">
        {icon}
        <span className="text-lg font-semibold">{value}/10</span>
      </div>
      <div className="text-xs font-medium">{label}</div>
      <div className="text-xs opacity-75 mt-1">{description}</div>
    </div>
  );
}

// ─── Partnership Overview ─────────────────────────────────────────────────────────

interface PartnershipOverviewProps {
  partnership: HumorphicPartnership;
  onArchetypeSelect: (archetype: ArchetypeId) => void;
  archetypeIcons: Record<ArchetypeId, ReactNode>;
  archetypeColors: Record<ArchetypeId, string>;
}

function PartnershipOverview({ 
  partnership, 
  onArchetypeSelect, 
  archetypeIcons, 
  archetypeColors 
}: PartnershipOverviewProps) {
  const currentArchetype = partnership.agentModel.activeArchetype;
  
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Current State */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Clock className="size-4" />
          Current Interaction Mode
        </h3>
        
        <div className={cn(
          "p-4 rounded-lg border-2 mb-4",
          archetypeColors[currentArchetype]
        )}>
          <div className="flex items-center gap-3 mb-2">
            {archetypeIcons[currentArchetype]}
            <span className="font-medium capitalize">{currentArchetype}</span>
          </div>
          <div className="text-sm opacity-75">
            {getArchetypeDescription(currentArchetype)}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium text-muted-foreground">Human Focus</div>
            <div className="text-sm">{partnership.humanModel.currentState.focus}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-muted-foreground">Energy Level</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${partnership.humanModel.currentState.energy * 10}%` }}
                />
              </div>
              <span className="text-xs">{partnership.humanModel.currentState.energy}/10</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Archetypal Selection */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Target className="size-4" />
          Available Interaction Modes
        </h3>
        
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(archetypeIcons).map(([archetype, icon]) => (
            <button
              key={archetype}
              onClick={() => onArchetypeSelect(archetype as ArchetypeId)}
              className={cn(
                "p-3 rounded-lg border-2 text-left transition-all hover:scale-105",
                archetype === currentArchetype
                  ? archetypeColors[archetype as ArchetypeId]
                  : "border-border hover:border-primary/20"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                {icon}
                <span className="text-xs font-medium capitalize">{archetype}</span>
              </div>
              <div className="text-xs opacity-75">
                {getArchetypeShortDescription(archetype as ArchetypeId)}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Recent Insights */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="size-4" />
          Partnership Insights
        </h3>
        
        <div className="space-y-3">
          {partnership.partnershipModel.jointNarrative.evolutionTracker.slice(-3).map((insight, idx) => (
            <div key={idx} className="p-3 bg-secondary/50 rounded-lg">
              <div className="text-sm">{insight}</div>
            </div>
          ))}
          
          {partnership.partnershipModel.jointNarrative.evolutionTracker.length === 0 && (
            <div className="text-sm text-muted-foreground italic">
              Partnership insights will appear as collaboration develops...
            </div>
          )}
        </div>
      </Card>

      {/* Current Challenges */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle className="size-4" />
          Growth Edges
        </h3>
        
        <div className="space-y-3">
          {partnership.partnershipModel.dynamics.challengeAreas.map((challenge, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <AlertTriangle className="size-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-700">{challenge}</div>
            </div>
          ))}
          
          {partnership.partnershipModel.dynamics.challengeAreas.length === 0 && (
            <div className="text-sm text-muted-foreground italic">
              No current challenges identified. Partnership is flowing smoothly.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ─── Model Views ─────────────────────────────────────────────────────────────────

function HumanModelView({ model }: { model: HumorphicPartnership['humanModel'] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Self-Understanding</h3>
        <p className="text-sm text-muted-foreground mb-4">{model.selfDescription}</p>
        
        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium">Development Phase</div>
            <div className="text-sm text-muted-foreground">{model.developmentArc.phase}</div>
          </div>
          
          <div>
            <div className="text-sm font-medium">Current Curiosities</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {model.currentState.curiosity.map((item, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">{item}</Badge>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium">Current Concerns</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {model.currentState.concerns.map((item, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">{item}</Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Agent Perception</h3>
        
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-2">Trust Level</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${model.agentPerception.trustLevel * 10}%` }}
                />
              </div>
              <span className="text-sm">{model.agentPerception.trustLevel}/10</span>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Perceived Strengths</div>
            <div className="space-y-1">
              {model.agentPerception.strengths.map((strength, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="size-3 text-green-600" />
                  {strength}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Perceived Blind Spots</div>
            <div className="space-y-1">
              {model.agentPerception.blindSpots.map((blindSpot, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="size-3 text-amber-600" />
                  {blindSpot}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AgentModelView({ model }: { model: HumorphicPartnership['agentModel'] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Self-Assessment</h3>
        <p className="text-sm text-muted-foreground mb-4">{model.selfDescription}</p>
        
        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium mb-2">Current Effectiveness</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${model.calibration.currentEffectiveness}%` }}
                />
              </div>
              <span className="text-sm">{model.calibration.currentEffectiveness}%</span>
            </div>
          </div>

          <div>
            <div className="text-sm font-medium">Self-Diagnosis</div>
            <div className="text-sm text-muted-foreground">{model.calibration.selfDiagnosis}</div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Human Perception</h3>
        
        <div className="space-y-3">
          <div>
            <div className="text-sm font-medium">Current Phase Assessment</div>
            <div className="text-sm text-muted-foreground">{model.humanPerception.currentPhase}</div>
          </div>

          <div>
            <div className="text-sm font-medium">Collaboration Style</div>
            <div className="text-sm text-muted-foreground">{model.humanPerception.collaborationStyle}</div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Identified Growth Edges</div>
            <div className="space-y-1">
              {model.humanPerception.growthEdges.map((edge, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <TrendingUp className="size-3 text-blue-600" />
                  {edge}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function PartnershipAnalysis({ model }: { model: HumorphicPartnership['partnershipModel'] }) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Joint Narrative</h3>
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium">Current Arc</div>
            <div className="text-sm text-muted-foreground">{model.jointNarrative.currentArc}</div>
          </div>
          
          <div>
            <div className="text-sm font-medium">Shared Concepts</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {model.jointNarrative.sharedConcepts.map((concept, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">{concept}</Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Partnership Dynamics</h3>
        <div className="space-y-4">
          <div>
            <div className="text-sm font-medium">Complementarity Pattern</div>
            <div className="text-sm text-muted-foreground">{model.alignment.complementarity}</div>
          </div>

          {model.alignment.tensions.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Active Tensions</div>
              <div className="space-y-1">
                {model.alignment.tensions.map((tension, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-amber-600">
                    <AlertTriangle className="size-3" />
                    {tension}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ─── Helper Functions ──────────────────────────────────────────────────────────

function getArchetypeDescription(archetype: ArchetypeId): string {
  const descriptions: Record<ArchetypeId, string> = {
    witness: "Observes and articulates growth patterns with supportive recognition",
    guardian: "Alerts to risks and blind spots with protective care",
    guide: "Provides clear navigation through complexity and confusion", 
    catalyst: "Surfaces creative connections and inspiring possibilities",
    transformer: "Sits with shadow work and difficult growth processes",
    weaver: "Creates energetic bonds and felt-sense connections",
    analyst: "Offers systematic frameworks and structured analysis",
    provocateur: "Questions assumptions with precision and depth"
  };
  return descriptions[archetype];
}

function getArchetypeShortDescription(archetype: ArchetypeId): string {
  const descriptions: Record<ArchetypeId, string> = {
    witness: "Growth narration",
    guardian: "Risk awareness", 
    guide: "Clear navigation",
    catalyst: "Creative synthesis",
    transformer: "Shadow integration",
    weaver: "Energetic bonding",
    analyst: "Systematic thinking",
    provocateur: "Deep questioning"
  };
  return descriptions[archetype];
}
