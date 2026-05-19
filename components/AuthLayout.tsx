import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Theme } from '../types';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        }
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') root.classList.add('dark');
        else root.classList.remove('dark');
    }, [theme]);

    const mcLogoUrl = "/images/IDFC_First_Logo.png";

    return (
        <div className="min-h-screen w-full bg-transparent flex flex-col md:flex-row transition-colors duration-500 overflow-hidden">
            {/* Left Side: Immersive Hero Section (60% width on Desktop) */}
            <div className="hidden md:flex md:w-[60%] relative overflow-hidden group">
                <motion.div
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-0"
                >
                    <img
                        src="/auth-hero.png"
                        alt="Premium Travel"
                        className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[3000ms]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/65 via-slate-950/20 to-[#f8f7f4]" />
                </motion.div>

                {/* Subtle Brand Overlay Content */}
                <div className="absolute inset-0 flex flex-col justify-between p-12 z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <img src={mcLogoUrl} alt="IDFC First Bank" className="h-12 w-auto" />
                    </motion.div>

                    <div className="max-w-xl">
                        <motion.h2
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="text-5xl font-black text-white leading-tight tracking-tight mb-6 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                        >
                            Experience the World, <br />
                            <span className="bg-gradient-to-r from-[#FF5252] via-[#F57C00] to-[#FBC02D] bg-clip-text text-transparent filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">Always You First.</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                            className="text-xl text-white/80 font-medium"
                        >
                            Log in to access your curated travel sanctuary and elite global perks.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="flex gap-8 text-white/60 text-sm font-bold tracking-widest uppercase"
                    >
                        <span>24/7 Concierge</span>
                        <span>Global Access</span>
                        <span>Elite Perks</span>
                    </motion.div>
                </div>

                {/* Glassy overlay on the right edge to blend into form side */}
                <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#f8f7f4] to-transparent z-20" />
            </div>

            {/* Right Side: Authentication Form (40% width on Desktop) */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 min-h-screen">
                {/* Dynamic Background Blobs */}
                <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{
                            x: [0, 40, 0],
                            y: [0, -60, 0],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-24 -right-24 w-96 h-96 bg-red-600/15 rounded-full blur-[100px]"
                    />
                    <motion.div
                        animate={{
                            x: [0, -50, 0],
                            y: [0, 70, 0],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px]"
                    />
                    <motion.div
                        animate={{
                            x: [0, 30, 0],
                            y: [0, 30, 0],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 5 }}
                        className="absolute top-1/2 left-1/4 w-64 h-64 bg-amber-500/8 rounded-full blur-[80px]"
                    />
                </div>

                {/* Noise Texture Overlay */}
                <div className="absolute inset-0 -z-5 opacity-[0.04] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

                <div className="w-full max-w-[420px] mb-8 mt-12 md:mt-0">
                    <div className="md:hidden flex justify-center mb-12">
                        <img src={mcLogoUrl} alt="Logo" className="h-10 w-auto" />
                    </div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black text-[#1a1a2e] mb-2 leading-none tracking-tighter text-center md:text-left"
                    >
                        {title}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-500 font-medium text-center md:text-left"
                    >
                        {subtitle}
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, type: "spring", damping: 25 }}
                    className="w-full max-w-[420px]"
                >
                    <div className="glass-card rounded-[2rem] p-8 shadow-[0_12px_48px_rgba(0,0,0,0.06)] relative overflow-hidden group">
                        {/* Elegant brand accent */}
                        {/* <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-red via-brand-orange to-brand-yellow opacity-80" /> */}

                        {children}
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default AuthLayout;
