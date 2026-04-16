import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Facebook, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const SignUpPage: React.FC<{ onRegister: (user: UserProfile) => void }> = ({ onRegister }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate registration
        setTimeout(() => {
            setIsLoading(false);
            onRegister({
                id: Math.random().toString(36).substr(2, 9),
                name: formData.name,
                email: formData.email,
                avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
                mobilityNeeds: [],
                dietaryRestrictions: [],
                pacePreference: 'balanced',
                budgetStyle: 'standard',
                loyaltyPrograms: [],
                flexibleCancellation: true,
                isOnboarded: false // Trigger onboarding for first time
            });
            navigate('/');
        }, 1500);
    };

    return (
        <AuthLayout
            title="Create Account"
            subtitle="Join the curated travel suite"
        >
            <form onSubmit={handleRegister} className="space-y-8 mt-4">
                <div className="space-y-6">
                    {/* Name Input */}
                    <div className="relative group">
                        <input
                            type="text"
                            required
                            id="name"
                            className="peer w-full py-2 bg-transparent border-b-2 border-slate-200 dark:border-slate-800 focus:border-brand-red outline-none text-slate-900 dark:text-white font-medium transition-all placeholder-transparent"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Full Name"
                        />
                        <label
                            htmlFor="name"
                            className="absolute left-0 -top-3.5 text-slate-500 text-xs font-bold uppercase tracking-widest transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-focus:-top-3.5 peer-focus:text-xs peer-focus:font-bold peer-focus:uppercase peer-focus:text-brand-red pointer-events-none"
                        >
                            Full Name
                        </label>
                        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-red transition-all duration-300 group-focus-within:w-full" />
                    </div>

                    {/* Email Input */}
                    <div className="relative group">
                        <input
                            type="email"
                            required
                            id="email"
                            className="peer w-full py-2 bg-transparent border-b-2 border-slate-200 dark:border-slate-800 focus:border-brand-red outline-none text-slate-900 dark:text-white font-medium transition-all placeholder-transparent"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="Email Address"
                        />
                        <label
                            htmlFor="email"
                            className="absolute left-0 -top-3.5 text-slate-500 text-xs font-bold uppercase tracking-widest transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-focus:-top-3.5 peer-focus:text-xs peer-focus:font-bold peer-focus:uppercase peer-focus:text-brand-red pointer-events-none"
                        >
                            Email Address
                        </label>
                        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-red transition-all duration-300 group-focus-within:w-full" />
                    </div>

                    {/* Password Inputs Grid */}
                    <div className="grid grid-cols-2 gap-8">
                        <div className="relative group">
                            <input
                                type="password"
                                required
                                id="password"
                                className="peer w-full py-2 bg-transparent border-b-2 border-slate-200 dark:border-slate-800 focus:border-brand-red outline-none text-slate-900 dark:text-white font-medium transition-all placeholder-transparent"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Create Password"
                            />
                            <label
                                htmlFor="password"
                                className="absolute left-0 -top-3.5 text-slate-500 text-[10px] font-bold uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:text-brand-red pointer-events-none"
                            >
                                Password
                            </label>
                            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-red transition-all duration-300 group-focus-within:w-full" />
                        </div>
                        <div className="relative group">
                            <input
                                type="password"
                                required
                                id="confirmPassword"
                                className="peer w-full py-2 bg-transparent border-b-2 border-slate-200 dark:border-slate-800 focus:border-brand-red outline-none text-slate-900 dark:text-white font-medium transition-all placeholder-transparent"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                placeholder="Confirm Password"
                            />
                            <label
                                htmlFor="confirmPassword"
                                className="absolute left-0 -top-3.5 text-slate-500 text-[10px] font-bold uppercase tracking-widest transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:top-2 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-focus:-top-3.5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:text-brand-red pointer-events-none"
                            >
                                Confirm
                            </label>
                            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-red transition-all duration-300 group-focus-within:w-full" />
                        </div>
                    </div>
                </div>

                <div className="px-1">
                    <label className="flex items-start gap-4 cursor-pointer group">
                        <div className="relative w-4 h-4 flex-shrink-0 mt-1">
                            <input type="checkbox" required className="peer hidden" />
                            <div className="w-full h-full rounded border-2 border-slate-300 dark:border-slate-700 peer-checked:border-brand-red peer-checked:bg-brand-red transition-all" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 text-white">
                                <ShieldCheck size={10} strokeWidth={4} />
                            </div>
                        </div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                            Acknowledge <button type="button" className="text-brand-red hover:underline">Membership Terms</button> & <button type="button" className="text-brand-red hover:underline">Privacy Charter</button>
                        </span>
                    </label>
                </div>

                <motion.button
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                    type="submit"
                    className="w-full relative py-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl font-black text-sm uppercase tracking-[0.2em] overflow-hidden group shadow-2xl transition-all"
                >
                    <div className="relative z-10 flex items-center justify-center gap-3">
                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <motion.div
                                    key="loading"
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                >
                                    <ArrowRight size={20} />
                                </motion.div>
                            ) : (
                                <motion.div key="ready" className="flex items-center gap-3">
                                    <CheckCircle2 size={18} />
                                    <span>Sign Up</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    {/* Hover Liquid Effect */}
                    <motion.div
                        initial={{ y: "100%" }}
                        whileHover={{ y: "0%" }}
                        className="absolute inset-0 bg-brand-red z-0 transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]"
                    />
                </motion.button>

                {/* Identity Systems Divider */}
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Identity Systems</span>
                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                </div>

                {/* Premium Social Logins */}
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        type="button" 
                        className="py-4 flex items-center justify-center gap-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-brand-red transition-all group"
                    >
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="h-4 w-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Google</span>
                    </button>
                    <button type="button" className="py-4 flex items-center justify-center gap-3 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-[#1877F2] transition-all group">
                        <Facebook size={16} className="text-slate-400 group-hover:text-[#1877F2] transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Facebook</span>
                    </button>
                </div>



                <p className="mt-8 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Already a Member?</span>
                    <Link to="/signin" className="ml-2 text-[10px] font-black text-brand-red uppercase tracking-widest hover:underline underline-offset-4">
                        Sign In Securely
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default SignUpPage;
