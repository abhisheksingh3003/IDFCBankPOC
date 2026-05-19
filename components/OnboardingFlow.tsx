import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle2, 
    ArrowRight, 
    Volume2, 
    VolumeX, 
    ShieldCheck, 
    Heart, 
    Clock, 
    Wallet, 
    Award,
    Activity,
    Users
} from 'lucide-react';
import AIVoiceOrb from './AIVoiceOrb';
import { UserProfile } from '../types';
import { speakText } from '../services/speechService';

interface OnboardingFlowProps {
    onComplete: (data: Partial<UserProfile>) => void;
    userName: string;
}

const ONBOARDING_STEPS = [
    {
        id: 'intro',
        question: "Hi {name}, I'm your AI travel companion. I'd love to learn about you so I can plan every detail perfectly. Ready to start?",
        voiceText: "Hi {name}, I'm your AI travel companion. I'd love to learn about you so I can plan every detail perfectly. Ready to start?",
        field: null,
        options: ["Let's do it!", "I'm ready"]
    },
    {
        id: 'mobility',
        icon: Activity,
        label: "Mobility & Access",
        question: "Will you need any special accessibility accommodations, like wheelchair access or elevator-first routing?",
        voiceText: "First, let's talk about mobility. Do you have any specific accessibility needs I should keep in mind for flights and hotels?",
        field: 'mobilityNeeds',
        multi: true,
        options: ["None", "Wheelchair Access", "Limited Walking", "Elevator Only", "Braille Support"]
    },
    {
        id: 'diet',
        icon: Heart,
        label: "Dietary Identity",
        question: "Any dietary restrictions or preferences? I'll apply these to your flight meals and restaurant suggestions.",
        voiceText: "Excellent. Now, regarding dining—any dietary restrictions or preferences? I'll use these for flight meals and local spots.",
        field: 'dietaryRestrictions',
        multi: true,
        options: ["No Restrictions", "Vegan", "Vegetarian", "Gluten-Free", "Halal", "Kosher", "Nut-Free"]
    },
    {
        id: 'pace',
        icon: Clock,
        label: "Travel Rhythm",
        question: "What's your preferred travel pace? Explorer-style (active) or Relaxed (slow-paced)?",
        voiceText: "Got it. How do you like to rhythm your days? Are you an explorer who hits every landmark, or do you prefer a more relaxed, slow-paced approach?",
        field: 'pacePreference',
        options: ["Relaxed", "Balanced", "Explorer"]
    },
    {
        id: 'budget',
        icon: Wallet,
        label: "Budget Style",
        question: "How do you usually like to travel? Standard luxury or ultra-exclusive?",
        voiceText: "Perfectly balanced. Lastly, what's your typical budget style? Standard, premium, or full luxury?",
        field: 'budgetStyle',
        options: ["Budget", "Standard", "Luxury"]
    },
    {
        id: 'loyalty',
        icon: Award,
        label: "Loyalty Programs",
        question: "Should I prioritize specific loyalty programs? (e.g. Star Alliance, Marriott Bonvoy)",
        voiceText: "Finally, do you have any loyalty programs you'd like me to prioritize for your bookings?",
        field: 'loyaltyPrograms',
        multi: true,
        options: ["None", "Star Alliance", "OneWorld", "Marriott Bonvoy", "Hilton Honors"]
    },
    {
        id: 'final',
        icon: ShieldCheck,
        label: "Ready to Explore",
        question: "Excellent! Your profile is complete. Welcome to IDFC First Bank Travel—The only travel planner built to know you, not just your destination.",
        voiceText: "Excellent! Your profile is complete and securely stored. Welcome to the future of travel—IDFC First Bank is the only travel planner built to know you, not just your destination. Let's start exploring.",
        field: null,
        options: ["Start Exploring"]
    }
];

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, userName }) => {
    const [currentStepIdx, setCurrentStepIdx] = useState(0);
    const [isThinking, setIsThinking] = useState(false);
    const [answers, setAnswers] = useState<any>({});
    const [isMuted, setIsMuted] = useState(false);
    const [showContent, setShowContent] = useState(false);

    const currentStep = ONBOARDING_STEPS[currentStepIdx];
    const progress = ((currentStepIdx + 1) / ONBOARDING_STEPS.length) * 100;

    useEffect(() => {
        // Initial entry delay for immersion
        const timer = setTimeout(() => {
            setShowContent(true);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // Speech Synthesis Logic
    useEffect(() => {
        if (showContent && !isThinking && !isMuted) {
            speak(currentStep.voiceText.replace('{name}', userName));
        } else {
            window.speechSynthesis.cancel();
        }
    }, [currentStepIdx, isThinking, isMuted, showContent]);

    const speak = (text: string) => {
        speakText(text, { isMuted });
    };

    const handleNext = (val: any) => {
        const field = currentStep.field;
        const newAnswers = { ...answers };
        
        if (field) {
            if (currentStep.multi) {
                const prev = newAnswers[field] || [];
                if (prev.includes(val)) {
                    newAnswers[field] = prev.filter((v: string) => v !== val);
                } else {
                    newAnswers[field] = [...prev, val];
                }
            } else {
                newAnswers[field] = val.toLowerCase();
            }
        }
        
        setAnswers(newAnswers);

        // Auto-advance if not multi-select OR if they clicked "None"
        if (!currentStep.multi || val === "None" || val === "No Restrictions") {
            goToNextStep();
        }
    };

    const goToNextStep = () => {
        if (currentStepIdx < ONBOARDING_STEPS.length - 1) {
            setIsThinking(true);
            setTimeout(() => {
                setCurrentStepIdx(prev => prev + 1);
                setIsThinking(false);
            }, 1200);
        } else {
            finalizeOnboarding();
        }
    };

    const finalizeOnboarding = () => {
        setIsThinking(true);
        setTimeout(() => {
            onComplete({
                ...answers,
                isOnboarded: true
            });
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden">
            {/* Background Grain & Atmosphere */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            
            {/* Header / Nav */}
            <div className="relative z-10 w-full px-8 py-6 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-lg">
                        <img src="/images/IDFC_First_Logo.png" className="w-5 h-5 invert brightness-0" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-800 dark:text-white">AI Companion Onboarding</span>
                </div>
                
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{Math.round(progress)}%</span>
                    </div>
                    <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
                    >
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                </div>
            </div>

            {/* Immersive Voice Scene */}
            <div className="flex-1 flex flex-col lg:flex-row items-center justify-center p-6 lg:p-12 relative overflow-hidden">
                
                {/* AI Companion Orb Section */}
                <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                    <div className="relative w-40 h-40 lg:w-60 lg:h-60">
                        <AIVoiceOrb isActive={!isThinking} />
                        
                        {/* Audio Waveform Simulation */}
                        {!isThinking && (
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1">
                                {[1,2,3,4,5,6,7,8].map(i => (
                                    <motion.div
                                        key={i}
                                        animate={{ height: [8, 16, 8, 24, 8] }}
                                        transition={{ 
                                            repeat: Infinity, 
                                            duration: 0.8 / (i % 3 + 1), 
                                            ease: "easeInOut",
                                            delay: i * 0.1
                                        }}
                                        className="w-1 bg-red-600/40 rounded-full"
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="max-w-xl text-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep.id + (isThinking ? '-thinking' : '')}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-4"
                            >
                                {isThinking ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="flex gap-1.5">
                                            {[1,2,3].map(i => (
                                                <motion.div 
                                                    key={i}
                                                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                                                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                                    className="w-2 h-2 rounded-full bg-red-600"
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Processing Your Profile...</span>
                                    </div>
                                ) : (
                                    <>
                                        {currentStep.icon && (
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <currentStep.icon size={16} className="text-red-600" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">{currentStep.label}</span>
                                            </div>
                                        )}
                                        <p className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                                            {currentStep.question.replace('{name}', userName)}
                                        </p>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 italic">
                                             "Listening for your preference..."
                                        </p>
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Vertical Divider for Desktop */}
                <div className="hidden lg:block w-px h-64 bg-slate-200 dark:bg-slate-800 mx-12" />

                {/* Interactive Response Section */}
                <div className="flex-1 w-full max-w-md">
                    <AnimatePresence mode="wait">
                        {!isThinking && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-4"
                            >
                                <div className="space-y-3">
                                    {currentStep.options.map((opt) => {
                                        const isSelected = currentStep.field && (
                                            currentStep.multi 
                                            ? (answers[currentStep.field] || []).includes(opt)
                                            : answers[currentStep.field] === opt.toLowerCase()
                                        );

                                        return (
                                            <button
                                                key={opt}
                                                onClick={() => handleNext(opt)}
                                                className={`w-full p-4 rounded-2xl flex items-center justify-between group transition-all duration-300 ${
                                                    isSelected 
                                                    ? 'bg-red-600 border-red-500 shadow-xl shadow-red-600/20 text-white' 
                                                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-red-600 dark:hover:border-red-600 text-slate-700 dark:text-slate-300'
                                                }`}
                                            >
                                                <div className="flex flex-col items-start">
                                                    <span className="font-black text-base uppercase tracking-tight">{opt}</span>
                                                    {!currentStep.multi && <span className="text-[9px] uppercase tracking-widest opacity-60">Tap to select</span>}
                                                </div>
                                                {isSelected ? (
                                                    <CheckCircle2 size={24} className="text-white" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ArrowRight size={20} className="text-red-600" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {currentStep.multi && (
                                    <button
                                        onClick={goToNextStep}
                                        className="w-full mt-4 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                                    >
                                        <span>Confirm Selections</span>
                                        <CheckCircle2 size={16} />
                                    </button>
                                )}

                                <div className="pt-8 flex items-center gap-3 justify-center text-slate-400">
                                    <ShieldCheck size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Permanent Profile Data Protection</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Footer Info removed per user request */}
        </div>
    );
};

export default OnboardingFlow;
