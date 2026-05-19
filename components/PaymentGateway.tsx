import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Zap, QrCode, ChevronRight, Check, ArrowRight, Calendar } from 'lucide-react';

interface PaymentGatewayProps {
    total: number;
    currency?: string;
    onPay: () => void;
    onBack: () => void;
    breakdown: { label: string; value: string | number }[];
    isLoading?: boolean;
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({
    total,
    currency = 'INR',
    onPay,
    onBack,
    breakdown,
    isLoading = false
}) => {
    const [slideCompleted, setSlideCompleted] = useState(false);
    const [isInternalProcessing, setIsInternalProcessing] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('card');
    const [selectedTenure, setSelectedTenure] = useState(6);
    const slideConstraintsRef = useRef(null);

    const handleSlideDragEnd = (event: any, info: any) => {
        if (info.offset.x > 150 && !slideCompleted && !isLoading && !isInternalProcessing) {
            setSlideCompleted(true);
            setIsInternalProcessing(true);
            setTimeout(() => {
                onPay();
            }, 500);
        }
    };

    const isProcessing = isLoading || isInternalProcessing;

    return (
        <div className="flex flex-col min-h-[600px] glass-card rounded-[32px] overflow-hidden">
            <div className="flex-1 lg:grid lg:grid-cols-2 lg:gap-0">

                {/* 1. Left Column: Order Summary (Desktop Only side-by-side) */}
                <div className="glass-sidebar p-8 lg:p-12 border-r border-slate-200">
                    <div className="max-w-md mx-auto h-full flex flex-col">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-[#1a1a2e] mb-2">Review your order</h2>
                            <p className="text-sm text-slate-500 font-medium">Verify your booking details before proceeding to secure payment.</p>
                        </div>

                        <div className="flex-1 space-y-6">
                            <div className="space-y-4">
                                {breakdown.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center group">
                                        <span className="text-slate-600 font-bold group-hover:text-slate-800 transition-colors">{item.label}</span>
                                        <span className="font-black text-[#1a1a2e]">{currency} {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-slate-200">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</span>
                                        <p className="text-4xl font-black text-[#1a1a2e]">{currency} {total.toLocaleString()}</p>
                                    </div>
                                    <div className="pb-1">
                                        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 border border-green-200 rounded-full text-[10px] font-black uppercase tracking-wider">
                                            <Check size={12} strokeWidth={3} />
                                            Best Price
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 space-y-4 hidden lg:block">
                            <div className="flex items-center gap-3 text-slate-600">
                                <Zap size={16} className="text-red-500" />
                                <span className="text-xs font-bold">Secure SSL encrypted payment</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                                <QrCode size={16} className="text-red-500" />
                                <span className="text-xs font-bold">Authorized by IDFC First Bank</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Right Column: Payment Details */}
                <div className="p-8 lg:p-12 bg-transparent">
                    <div className="max-w-md mx-auto space-y-8">

                        {/* Payment Method Selector */}
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { id: 'card', name: 'Card', icon: CreditCard },
                                { id: 'emi', name: 'Easy EMI', icon: Calendar },
                                { id: 'apple', name: 'Apple', icon: Zap },
                                { id: 'google', name: 'Google', icon: QrCode },
                            ].map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => setSelectedMethod(method.id)}
                                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all active:scale-95 ${selectedMethod === method.id
                                            ? 'border-[#9D1D27] glass-pill-active text-[#9D1D27] glow-brand'
                                            : 'glass-pill text-slate-500 hover:border-red-200'
                                        }`}
                                >
                                    <method.icon size={20} />
                                    <span className="font-black text-[10px] uppercase tracking-wider">{method.name}</span>
                                </button>
                            ))}
                        </div>

                        {selectedMethod === 'emi' ? (
                            /* EMI Plan Selector */
                            <div className="space-y-4 bg-slate-50/50 dark:bg-slate-800/10 p-5 rounded-3xl border border-slate-100 dark:border-slate-800/80 animate-fadeIn">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#9D1D27] mb-1">Select EMI Tenure (IDFC First Bank)</p>
                                <div className="space-y-3">
                                    {[
                                        { months: 6, label: '6 Months', rate: 'No Cost EMI', rateDetail: '0% Interest • 0% Processing Fees', interest: 0 },
                                        { months: 9, label: '9 Months', rate: 'No Cost EMI', rateDetail: '0% Interest • 0% Processing Fees', interest: 0 },
                                        { months: 12, label: '12 Months', rate: 'Premium EMI', rateDetail: '14% p.a. IDFC First Special Rate', interest: 14 }
                                    ].map((plan) => {
                                        const interestFactor = plan.interest > 0 ? (1 + (plan.interest / 100) * (plan.months / 12)) : 1;
                                        const totalPayable = total * interestFactor;
                                        const monthlyInstallment = Math.round(totalPayable / plan.months);
                                        const isSelected = selectedTenure === plan.months;

                                        return (
                                            <div
                                                key={plan.months}
                                                onClick={() => setSelectedTenure(plan.months)}
                                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center active:scale-[0.99] ${
                                                    isSelected
                                                        ? 'border-[#9D1D27] bg-[#9D1D27]/5 text-[#9D1D27] dark:text-[#c53a45] ring-1 ring-[#9D1D27]/20'
                                                        : 'border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900/30 text-slate-600 hover:border-[#9D1D27]/30'
                                                }`}
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-black text-sm text-slate-800 dark:text-white">{plan.label}</p>
                                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                                            plan.interest === 0
                                                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                        }`}>
                                                            {plan.rate}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{plan.rateDetail}</p>
                                                </div>
                                                <div className="text-right space-y-0.5">
                                                    <p className="font-black text-[#9D1D27] dark:text-[#c53a45] text-base">INR {monthlyInstallment.toLocaleString()} / mo</p>
                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                                        Total: INR {Math.round(totalPayable).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            /* Visual Card */
                            <div className="relative w-full aspect-[1.586] rounded-[24px] shadow-2xl overflow-hidden group perspective-1000">
                                <motion.div
                                    initial={{ rotateY: 10, rotateX: 5 }}
                                    animate={{ rotateY: 0, rotateX: 0 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="w-full h-full relative preserve-3d"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#5C1117] via-[#9D1D27] to-[#250508] z-0"></div>
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-15 z-0 mix-blend-overlay"></div>
                                    <div className="absolute bottom-[-30%] right-[-20%] w-[70%] h-[70%] bg-[#C4953A]/20 rounded-full blur-[50px] z-0"></div>
                                    <div className="absolute top-[-40%] left-[-10%] w-[60%] h-[60%] bg-[#9D1D27]/30 rounded-full blur-[40px] z-0"></div>
                                    <div className="absolute -inset-y-20 left-1/3 w-[15%] bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-12 group-hover:left-2/3 transition-all duration-[2000ms] ease-out pointer-events-none" />
                                    
                                    <div className="relative z-10 w-full h-full p-6 flex flex-col justify-between text-white border border-white/10 rounded-[24px]">
                                        <div className="flex justify-between items-center">
                                            {/* Realistic Golden Microchip */}
                                            <div className="w-12 h-9 rounded-lg bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 p-[1px] shadow-lg">
                                                <div className="w-full h-full rounded-[6px] bg-gradient-to-r from-amber-100 to-amber-300 opacity-95 relative overflow-hidden">
                                                    <div className="absolute inset-x-0 top-1/2 h-[1px] bg-amber-700/30" />
                                                    <div className="absolute inset-y-0 left-1/2 w-[1px] bg-amber-700/30" />
                                                    <div className="absolute inset-y-0 left-1/4 w-[1px] bg-amber-700/30" />
                                                    <div className="absolute inset-y-0 right-1/4 w-[1px] bg-amber-700/30" />
                                                    <div className="absolute top-1/4 bottom-1/4 left-1/4 right-1/4 border border-amber-700/20 rounded" />
                                                </div>
                                            </div>
                                            {/* IDFC First Bank Logo Container */}
                                            <div className="bg-white/95 px-3 py-1.5 rounded-lg shadow-sm border border-white/10 flex items-center justify-center">
                                                <img src="/images/IDFC_First_Logo.png" alt="IDFC First Bank" className="h-5 w-auto object-contain" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <div className="flex gap-4">
                                                    <span className="font-mono text-lg md:text-xl tracking-widest text-slate-100">4242</span>
                                                    <span className="font-mono text-lg md:text-xl tracking-widest text-slate-300 group-hover:hidden">••••</span>
                                                    <span className="font-mono text-lg md:text-xl tracking-widest text-slate-200 hidden group-hover:block">1234</span>
                                                    <span className="font-mono text-lg md:text-xl tracking-widest text-slate-300">••••</span>
                                                    <span className="font-mono text-lg md:text-xl tracking-widest text-slate-100">8829</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-end border-t border-white/5 pt-3">
                                                <div>
                                                    <p className="text-[8px] font-bold uppercase tracking-widest text-white/40 mb-0.5">Card Holder</p>
                                                    <p className="font-bold tracking-wide text-sm uppercase text-slate-100">Rahul</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[8px] font-bold uppercase tracking-widest text-white/40 mb-0.5">Expires</p>
                                                    <p className="font-bold tracking-wide text-sm text-slate-100">09/28</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {/* Form Simulation (Desktop Only / Web Context) */}
                        <div className="hidden lg:block space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                                <div className="px-4 py-3 glass-input rounded-xl font-bold text-[#1a1a2e] dark:text-white">
                                    rahul@example.com
                                </div>
                            </div>
                        </div>

                        {/* Payment Action */}
                        <div className="pt-4">
                            {/* Mobile Slider */}
                            <div className="lg:hidden block">
                                <div
                                    className="relative w-full h-16 bg-[#9D1D27] rounded-full overflow-hidden shadow-xl shadow-[#9D1D27]/30 flex items-center justify-center cursor-pointer select-none"
                                    ref={slideConstraintsRef}
                                >
                                    <span className={`font-black text-white text-lg tracking-wide transition-opacity pointer-events-none ${slideCompleted ? 'opacity-0' : 'opacity-100'}`}>
                                        {selectedMethod === 'emi' ? `Slide for ${selectedTenure}-Mo EMI` : `Slide to Pay ${currency}${total.toLocaleString()}`}
                                    </span>
                                    <motion.div
                                        drag="x"
                                        dragConstraints={slideConstraintsRef}
                                        dragElastic={0}
                                        dragMomentum={false}
                                        onDragEnd={handleSlideDragEnd}
                                        className="absolute left-1 top-1 bottom-1 w-14 bg-white rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg z-10"
                                    >
                                        <ChevronRight size={24} className="text-[#9D1D27]" strokeWidth={3} />
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: slideCompleted ? 1 : 0 }}
                                        className="absolute inset-0 bg-[#9D1D27] flex items-center justify-center z-20"
                                    >
                                        {isProcessing ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                                <span className="text-white font-bold text-sm">Processing...</span>
                                            </div>
                                        ) : (
                                            <Check size={32} className="text-white" strokeWidth={4} />
                                        )}
                                    </motion.div>
                                </div>
                            </div>

                            {/* Desktop Button */}
                            <div className="hidden lg:block">
                                <button
                                    onClick={() => { if (!isProcessing) { setIsInternalProcessing(true); onPay(); } }}
                                    disabled={isProcessing}
                                    className="w-full h-16 bg-[#9D1D27] hover:bg-[#851820] text-white rounded-2xl font-black text-xl shadow-xl shadow-[#9D1D27]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Processing...</span>
                                        </div>
                                    ) : (
                                        <>
                                            {selectedMethod === 'emi' ? `Pay with ${selectedTenure}-Month EMI` : `Pay ${currency}${total.toLocaleString()}`}
                                            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>

                            <button
                                onClick={onBack}
                                disabled={isProcessing}
                                className="w-full mt-4 py-2 text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors"
                            >
                                Cancel and return
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentGateway;
