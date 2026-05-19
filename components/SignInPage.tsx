import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, Facebook, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { UserProfile } from '../types';
import { useGoogleLogin } from '@react-oauth/google';

const SignInPage: React.FC<{ onLogin: (user: UserProfile) => void }> = ({ onLogin }) => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate login
        setTimeout(() => {
            setIsLoading(false);

            // Check persistence
            const storageKey = `IDFC First Bank_onboarded_${formData.email}`;
            const alreadyOnboarded = localStorage.getItem(storageKey) === 'true';

            onLogin({
                id: '1',
                name: 'Alex Johnson',
                email: formData.email,
                avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
                mobilityNeeds: [],
                dietaryRestrictions: [],
                pacePreference: 'balanced',
                budgetStyle: 'standard',
                loyaltyPrograms: [],
                flexibleCancellation: true,
                isOnboarded: alreadyOnboarded
            });
            navigate('/');
        }, 1500);
    };

    const handleGoogleSuccess = async (tokenResponse: any) => {
        setIsLoading(true);
        try {
            // Fetch user info using the access token
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            });
            const profile = await res.json();
            
            const userData: UserProfile = {
                id: profile.sub || Math.random().toString(36).substr(2, 9),
                name: profile.name || 'Google User',
                email: profile.email || '',
                avatar: profile.picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
                mobilityNeeds: [],
                dietaryRestrictions: [],
                pacePreference: 'balanced',
                budgetStyle: 'standard',
                loyaltyPrograms: [],
                flexibleCancellation: true,
                isOnboarded: localStorage.getItem(`IDFC First Bank_onboarded_${profile.email}`) === 'true'
            };

            setTimeout(() => {
                onLogin(userData);
                setIsLoading(false);
                navigate('/');
            }, 1000);
        } catch (error) {
            console.error('Google Login Error:', error);
            setIsLoading(false);
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => {
            console.error('Login Failed');
            setIsLoading(false);
        },
    });

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Access your premium travel suite"
        >
            <form onSubmit={handleLogin} className="space-y-8 mt-4">
                <div className="space-y-8">
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

                    {/* Password Input */}
                    <div className="relative group">
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            id="password"
                            className="peer w-full py-2 bg-transparent border-b-2 border-slate-200 dark:border-slate-800 focus:border-brand-red outline-none text-slate-900 dark:text-white font-medium transition-all placeholder-transparent pr-10"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Password"
                        />
                        <label 
                            htmlFor="password"
                            className="absolute left-0 -top-3.5 text-slate-500 text-xs font-bold uppercase tracking-widest transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-focus:-top-3.5 peer-focus:text-xs peer-focus:font-bold peer-focus:uppercase peer-focus:text-brand-red pointer-events-none"
                        >
                            Password
                        </label>
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-0 bottom-2 text-slate-400 hover:text-brand-red transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-red transition-all duration-300 group-focus-within:w-full" />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative w-4 h-4">
                            <input type="checkbox" className="peer hidden" />
                            <div className="w-full h-full rounded border-2 border-slate-300 dark:border-slate-700 peer-checked:border-brand-red peer-checked:bg-brand-red transition-all" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 text-white">
                                <ShieldCheck size={10} strokeWidth={4} />
                            </div>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors">Keep me signed in</span>
                    </label>
                    <button type="button" className="text-[10px] font-black text-brand-red uppercase tracking-widest hover:opacity-70 transition-all">
                        Forgot password
                    </button>
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
                                    <LogIn size={20} />
                                </motion.div>
                            ) : (
                                <motion.div key="ready" className="flex items-center gap-3">
                                    <span>Sign In</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
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

                {/* Secure Divider */}
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Identity Systems</span>
                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                </div>

                {/* Premium Social Logins */}
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        type="button" 
                        onClick={() => googleLogin()}
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
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New to Smart Traveller?</span>
                    <Link to="/signup" className="ml-2 text-[10px] font-black text-brand-red uppercase tracking-widest hover:underline underline-offset-4">
                        Register
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
};

export default SignInPage;
