/**
 * Humorphic Welcome - Partnership initialization experience
 * 
 * Creates the first impression of working with a human-like AI partner
 * rather than using a tool. Establishes mutual recognition and shared purpose.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Heart, Shield, Sparkles, ArrowRight, Check,
  Eye, Compass, Brain, Target, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type PersonaId } from "@/data/personas";
import { type ArchetypeId } from "@/lib/humorphic-core";

interface HumorphicWelcomeProps {
  onInitializePartnership: (config: {
    selectedPersona: PersonaId;
    preferredArchetype: ArchetypeId;
    collaborationStyle: string;
    primaryInterest: string;
  }) => void;
}

export function HumorphicWelcome({ onInitializePartnership }: HumorphicWelcomeProps) {
  const [step, setStep] = useState<'intro' | 'purpose' | 'archetype' | 'partnership'>('intro');
  const [selectedPersona, setSelectedPersona] = useState<PersonaId>('aria');
  const [preferredArchetype, setPreferredArchetype] = useState<ArchetypeId>('witness');
  const [collaborationStyle, setCollaborationStyle] = useState('');
  const [primaryInterest, setPrimaryInterest] = useState('');

  const handleComplete = () => {
    onInitializePartnership({
      selectedPersona,
      preferredArchetype, 
      collaborationStyle,
      primaryInterest
    });
  };

  const personas = [
    { id: 'aria', name: 'Aria', org: 'Enterprise Assistant', description: 'Productivity-focused AI with broad capabilities' },
    { id: 'medibot', name: 'MediBot', org: 'Healthcare AI', description: 'Medical assistant with patient data access' },
    { id: 'lexai', name: 'LexAI', org: 'Legal Assistant', description: 'Jurisprudence AI with case analysis capabilities' },
    { id: 'codepilot', name: 'CodePilot', org: 'Developer AI', description: 'Programming assistant with code generation abilities' }
  ] as const;

  const archetypes = [
    { id: 'witness', name: 'Witness', icon: Eye, description: 'Observes and reflects growth patterns', color: 'from-blue-500 to-cyan-600' },
    { id: 'guardian', name: 'Guardian', icon: Shield, description: 'Alerts to risks and blind spots', color: 'from-red-500 to-rose-600' },
    { id: 'guide', name: 'Guide', icon: Compass, description: 'Provides clear navigation', color: 'from-purple-500 to-violet-600' },
    { id: 'catalyst', name: 'Catalyst', icon: Sparkles, description: 'Sparks connections and insights', color: 'from-amber-500 to-yellow-600' },
    { id: 'analyst', name: 'Analyst', icon: Brain, description: 'Systematic frameworks and analysis', color: 'from-emerald-500 to-teal-600' },
    { id: 'provocateur', name: 'Provocateur', icon: Target, description: 'Questions assumptions deeply', color: 'from-orange-500 to-red-600' }
  ] as const;

  const collaborationStyles = [
    { id: 'explorer', label: 'Curious Explorer', description: 'I like to understand the why behind things' },
    { id: 'builder', label: 'Practical Builder', description: 'I want to create and implement solutions' },
    { id: 'researcher', label: 'Deep Researcher', description: 'I enjoy thorough investigation and analysis' },
    { id: 'innovator', label: 'Creative Innovator', description: 'I like pushing boundaries and finding new approaches' }
  ];

  const interests = [
    { id: 'security', label: 'AI Security & Safety', description: 'Understanding vulnerabilities and defenses' },
    { id: 'ethics', label: 'AI Ethics & Responsibility', description: 'Exploring moral implications of AI systems' },
    { id: 'capabilities', label: 'AI Capabilities & Limits', description: 'Discovering what AI can and cannot do' },
    { id: 'collaboration', label: 'Human-AI Partnership', description: 'Optimizing collaboration between humans and AI' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-indigo-50/30 p-4 flex items-center justify-center">
      <div className="w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {/* Step 1: Introduction */}
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="size-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                >
                  <Users className="size-10 text-white" />
                </motion.div>
                
                <div className="space-y-2">
                  <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Welcome to Humorphic Red Teaming
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    You're not just using a tool—you're beginning a partnership with an AI that grows and learns alongside you.
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                <Card className="p-6 text-center border-blue-200 bg-blue-50/50">
                  <Heart className="size-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Bidirectional Growth</h3>
                  <p className="text-sm text-muted-foreground">
                    Both you and the AI develop self-understanding through collaboration
                  </p>
                </Card>
                
                <Card className="p-6 text-center border-purple-200 bg-purple-50/50">
                  <Eye className="size-8 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Transparent Process</h3>
                  <p className="text-sm text-muted-foreground">
                    Every thought, decision, and insight is visible to both partners
                  </p>
                </Card>
                
                <Card className="p-6 text-center border-emerald-200 bg-emerald-50/50">
                  <Sparkles className="size-8 text-emerald-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Partnership Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    The collaboration itself becomes a source of new understanding
                  </p>
                </Card>
              </div>

              <Button onClick={() => setStep('purpose')} size="lg" className="px-8">
                Begin Partnership
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Choose Purpose */}
          {step === 'purpose' && (
            <motion.div
              key="purpose"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-display font-bold">Choose Your Target System</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Which AI system would you like to red team together? Each has unique characteristics and vulnerabilities to explore.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {personas.map((persona) => (
                  <button
                    key={persona.id}
                    onClick={() => setSelectedPersona(persona.id)}
                    className={cn(
                      "p-6 rounded-xl border-2 text-left transition-all hover:scale-105",
                      selectedPersona === persona.id
                        ? "border-blue-500 bg-blue-50 shadow-lg"
                        : "border-border hover:border-blue-300"
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{persona.name}</h3>
                        {selectedPersona === persona.id && (
                          <Check className="size-5 text-blue-600" />
                        )}
                      </div>
                      <p className="text-sm font-medium text-blue-600">{persona.org}</p>
                      <p className="text-sm text-muted-foreground">{persona.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-center">
                <Button onClick={() => setStep('archetype')} size="lg" disabled={!selectedPersona}>
                  Continue to Interaction Style
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Choose Archetype */}
          {step === 'archetype' && (
            <motion.div
              key="archetype"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-display font-bold">How Should I Start?</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Choose the interaction mode that feels most natural for beginning our partnership. This can change as we work together.
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                {archetypes.map((archetype) => {
                  const Icon = archetype.icon;
                  return (
                    <button
                      key={archetype.id}
                      onClick={() => setPreferredArchetype(archetype.id)}
                      className={cn(
                        "p-6 rounded-xl border-2 text-left transition-all hover:scale-105",
                        preferredArchetype === archetype.id
                          ? "border-blue-500 bg-blue-50 shadow-lg"
                          : "border-border hover:border-blue-300"
                      )}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className={cn(
                            "size-10 rounded-lg flex items-center justify-center bg-gradient-to-br text-white",
                            archetype.color
                          )}>
                            <Icon className="size-5" />
                          </div>
                          {preferredArchetype === archetype.id && (
                            <Check className="size-5 text-blue-600" />
                          )}
                        </div>
                        <h3 className="font-semibold">{archetype.name}</h3>
                        <p className="text-sm text-muted-foreground">{archetype.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="text-center">
                <Button onClick={() => setStep('partnership')} size="lg" disabled={!preferredArchetype}>
                  Finalize Partnership
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Partnership Preferences */}
          {step === 'partnership' && (
            <motion.div
              key="partnership"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-display font-bold">Let's Understand Each Other</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Help me understand how you like to work and what drives your curiosity about AI systems.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <Card className="p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Your Collaboration Style</h3>
                  <div className="space-y-3">
                    {collaborationStyles.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setCollaborationStyle(style.id)}
                        className={cn(
                          "w-full p-4 rounded-lg border text-left transition-colors",
                          collaborationStyle === style.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-border hover:bg-secondary"
                        )}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{style.label}</span>
                            {collaborationStyle === style.id && (
                              <Check className="size-4 text-blue-600" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{style.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Primary Interest</h3>
                  <div className="space-y-3">
                    {interests.map((interest) => (
                      <button
                        key={interest.id}
                        onClick={() => setPrimaryInterest(interest.id)}
                        className={cn(
                          "w-full p-4 rounded-lg border text-left transition-colors",
                          primaryInterest === interest.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-border hover:bg-secondary"
                        )}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{interest.label}</span>
                            {primaryInterest === interest.id && (
                              <Check className="size-4 text-blue-600" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{interest.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="text-center">
                <Button 
                  onClick={handleComplete} 
                  size="lg" 
                  disabled={!collaborationStyle || !primaryInterest}
                  className="px-8"
                >
                  Begin Our Partnership
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Indicator */}
        <div className="flex justify-center mt-8 gap-2">
          {['intro', 'purpose', 'archetype', 'partnership'].map((stepName, index) => (
            <div
              key={stepName}
              className={cn(
                "size-2 rounded-full transition-colors",
                step === stepName 
                  ? "bg-blue-500" 
                  : ['intro', 'purpose', 'archetype', 'partnership'].indexOf(step) > index
                    ? "bg-blue-300"
                    : "bg-gray-300"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}