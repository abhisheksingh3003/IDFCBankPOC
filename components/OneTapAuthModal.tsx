import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, CheckCircle2, ShieldCheck, Lock, Smartphone } from 'lucide-react';

interface OneTapAuthModalProps {
    amount: number;
    onSuccess: () => void;
    onCancel: () => void;
}

const OneTapAuthModal: React.FC<OneTapAuthModalProps> = ({ amount, onSuccess, onCancel }) => {
    const [step, setStep] = useState<'scan' | 'processing' | 'success'>('scan');

    useEffect(() => {
        if (step === 'processing') {
            const timer = setTimeout(() => setStep('success'), 1500);
            return () => clearTimeout(timer);
        }
        if (step === 'success') {
            const timer = setTimeout(onSuccess, 1000);
            return () => clearTimeout(timer);
        }
    }, [step, onSuccess]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onCancel}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
            >
                <div className="p-8 flex flex-col items-center text-center">
                    <div className="mb-6 relative">
                        <div className="w-24 h-24 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center relative z-10">
                            <AnimatePresence mode="wait">
                                {step === 'scan' && (
                                    <motion.div
                                        key="fingerprint"
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        onClick={() => setStep('processing')}
                                        className="cursor-pointer"
                                    >
                                        <Fingerprint size={48} className="text-red-600 animate-pulse" />
                                    </motion.div>
                                )}
                                {step === 'processing' && (
                                    <motion.div
                                        key="processing"
                                        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
                                    >
                                        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                                    </motion.div>
                                )}
                                {step === 'success' && (
                                    <motion.div
                                        key="success"
                                        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                    >
                                        <CheckCircle2 size={48} className="text-green-500" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        {step === 'scan' && (
                            <div className="absolute inset-0 rounded-full border-2 border-red-600/30 animate-ping" />
                        )}
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                        IDFC First Bank Secure Pay
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-6">
                        {step === 'scan' ? 'Touch to authorize payment' : step === 'processing' ? 'Verifying biometrics...' : 'Payment Authorized'}
                    </p>

                    <div className="w-full bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</span>
                            <span className="text-lg font-black text-slate-900 dark:text-white">INR {amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                                <ShieldCheck size={10} className="text-green-500" /> Platinum ...4829
                            </span>
                        </div>
                    </div>

                    {step === 'scan' && (
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                            <Lock size={12} />
                            <span>Secured by IDFC First Bank Identity™</span>
                        </div>
                    )}
                </div>

                {/* Mobile Notification Simulation */}
                <AnimatePresence>
                    {step === 'processing' && (
                        <motion.div
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="absolute top-0 left-0 w-full bg-slate-800 text-white p-3 flex items-center gap-3 shadow-lg"
                        >
                            <Smartphone size={16} />
                            <span className="text-xs font-bold">Mobile App: Verifying Identity...</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default OneTapAuthModal;
