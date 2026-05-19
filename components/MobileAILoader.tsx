import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plane, ShieldCheck, Map } from 'lucide-react';

interface MobileAILoaderProps {
    onComplete: () => void;
}

const STATUS_MESSAGES = [
    { text: "Analyzing your preferences...", icon: Sparkles },
    { text: "Sourcing premium stays...", icon: ShieldCheck },
    { text: "Optimizing travel routes...", icon: Plane },
    { text: "Finalizing your masterpiece...", icon: Sparkles }
];

const MobileAILoader: React.FC<MobileAILoaderProps> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [statusIndex, setStatusIndex] = useState(0);

    useEffect(() => {
        const duration = 4000; // 4 seconds
        const interval = 40; // update every 40ms for 100 steps
        const step = 100 / (duration / interval);

        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(timer);
                    setTimeout(onComplete, 500); // Small buffer before completion
                    return 100;
                }
                const next = prev + step;

                // Update status message based on progress
                const newIndex = Math.min(
                    Math.floor((next / 100) * STATUS_MESSAGES.length),
                    STATUS_MESSAGES.length - 1
                );
                if (newIndex !== statusIndex) {
                    setStatusIndex(newIndex);
                }

                return next;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [onComplete, statusIndex]);

    const CurrentIcon = STATUS_MESSAGES[statusIndex].icon;

    return (
        <div className="fixed inset-0 z-[200] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-8 text-center overflow-hidden">
            {/* Background Magic/Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-transparent to-red-600/5 rounded-full blur-[100px]"
                />
            </div>

            <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
                {/* Visual Orb/Asset */}
                <div className="relative w-32 h-32 mb-12 flex items-center justify-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-t-4 border-l-4 border-red-600 rounded-full opacity-60"
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-2 border-b-4 border-r-4 border-slate-900 dark:border-white rounded-full opacity-20"
                    />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={statusIndex}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.5, opacity: 0 }}
                            className="bg-red-600 p-6 rounded-3xl shadow-2xl shadow-red-600/30 text-white"
                        >
                            <CurrentIcon size={40} />
                        </motion.div>
                    </AnimatePresence>

                    {/* Flying Particles */}
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-red-400 rounded-full"
                            animate={{
                                x: [0, (i % 2 === 0 ? 1 : -1) * (60 + Math.random() * 40)],
                                y: [0, (i < 3 ? 1 : -1) * (60 + Math.random() * 40)],
                                opacity: [0, 1, 0],
                                scale: [0, 1, 0]
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeOut"
                            }}
                        />
                    ))}
                </div>

                {/* Progress Bar Container */}
                <div className="w-full space-y-6">
                    <div className="space-y-3">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">
                            Anya <span className="text-red-600">is Crafting</span>
                        </h2>
                        <div className="h-6 flex items-center justify-center overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={statusIndex}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    className="text-slate-500 dark:text-slate-400 font-bold tracking-wide"
                                >
                                    {STATUS_MESSAGES[statusIndex].text}
                                </motion.p>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* The Bar */}
                    <div className="relative h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-100 dark:border-slate-800">
                        <motion.div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full shadow-lg"
                            style={{ width: `${progress}%` }}
                        />
                        {/* Shimmer Effect */}
                        <motion.div
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                        />
                    </div>

                    <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Quantum Engine</span>
                        <span className="text-sm font-black text-red-600 tabular-nums">{Math.round(progress)}%</span>
                    </div>
                </div>
            </div>

            {/* Bottom Tagline */}
            <div className="absolute bottom-12 left-0 w-full px-8">
                <div className="flex items-center justify-center gap-3 opacity-30 grayscale contrast-125">
                    <img src="/images/IDFC_First_Logo.png" alt="IDFC First Bank" className="h-6 brightness-0 dark:invert" />
                    <div className="w-px h-6 bg-slate-400" />
                    <span className="font-bold text-sm tracking-widest uppercase">Premium Travel</span>
                </div>
            </div>
        </div>
    );
};

export default MobileAILoader;
