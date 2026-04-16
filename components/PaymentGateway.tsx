import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Zap, QrCode, ChevronRight, Check, ArrowRight } from 'lucide-react';

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
    currency = 'AED',
    onPay,
    onBack,
    breakdown,
    isLoading = false
}) => {
    const [slideCompleted, setSlideCompleted] = useState(false);
    const [isInternalProcessing, setIsInternalProcessing] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('card');
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
        <div className="flex flex-col min-h-[600px] bg-white dark:bg-black rounded-[32px] overflow-hidden">
            <div className="flex-1 lg:grid lg:grid-cols-2 lg:gap-0">

                {/* 1. Left Column: Order Summary (Desktop Only side-by-side) */}
                <div className="bg-slate-50 dark:bg-slate-900/50 p-8 lg:p-12 border-r border-slate-100 dark:border-slate-800">
                    <div className="max-w-md mx-auto h-full flex flex-col">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Review your order</h2>
                            <p className="text-sm text-slate-500 font-medium">Verify your booking details before proceeding to secure payment.</p>
                        </div>

                        <div className="flex-1 space-y-6">
                            <div className="space-y-4">
                                {breakdown.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center group">
                                        <span className="text-slate-500 font-bold group-hover:text-slate-700 transition-colors">{item.label}</span>
                                        <span className="font-black text-slate-900 dark:text-white">{currency} {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</span>
                                        <p className="text-4xl font-black text-slate-900 dark:text-white">{currency} {total.toLocaleString()}</p>
                                    </div>
                                    <div className="pb-1">
                                        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-[10px] font-black uppercase tracking-wider">
                                            <Check size={12} strokeWidth={3} />
                                            Best Price
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 space-y-4 hidden lg:block">
                            <div className="flex items-center gap-3 text-slate-400">
                                <Zap size={16} className="text-red-500" />
                                <span className="text-xs font-bold">Secure SSL encrypted payment</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                                <QrCode size={16} className="text-red-500" />
                                <span className="text-xs font-bold">Authorized by Mastercard SA</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Right Column: Payment Details */}
                <div className="p-8 lg:p-12 bg-white dark:bg-black">
                    <div className="max-w-md mx-auto space-y-8">

                        {/* Visual Card */}
                        <div className="relative w-full aspect-[1.586] rounded-[24px] shadow-2xl overflow-hidden group perspective-1000">
                            <motion.div
                                initial={{ rotateY: 10, rotateX: 5 }}
                                animate={{ rotateY: 0, rotateX: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="w-full h-full relative preserve-3d"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black z-0"></div>
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-overlay"></div>
                                <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[80%] bg-red-600/40 rounded-full blur-[60px] z-0"></div>
                                <div className="relative z-10 w-full h-full p-6 flex flex-col justify-between text-white border border-white/10 rounded-[24px]">
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-8 rounded bg-gradient-to-r from-yellow-400 to-yellow-200 opacity-80 shadow-sm" />
                                        <div className="flex items-center gap-1 scale-125 origin-right">
                                            <div className="w-6 h-6 rounded-full bg-[#EB001B] mix-blend-screen" />
                                            <div className="w-6 h-6 rounded-full bg-[#F79E1B] -ml-3 mix-blend-screen" />
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="flex gap-4">
                                            <span className="font-mono text-lg tracking-widest">4242</span>
                                            <span className="font-mono text-lg tracking-widest group-hover:hidden">••••</span>
                                            <span className="font-mono text-lg tracking-widest hidden group-hover:block">1234</span>
                                            <span className="font-mono text-lg tracking-widest">••••</span>
                                            <span className="font-mono text-lg tracking-widest">8829</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-1">Card Holder</p>
                                                <p className="font-bold tracking-wide text-xl uppercase">Mastercard Holder</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-white/50 mb-1">Expires</p>
                                                <p className="font-bold tracking-wide">09/28</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Payment Method Selector */}
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'card', name: 'Card', icon: CreditCard },
                                { id: 'apple', name: 'Apple', icon: Zap },
                                { id: 'google', name: 'Google', icon: QrCode },
                            ].map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => setSelectedMethod(method.id)}
                                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all active:scale-95 ${selectedMethod === method.id
                                            ? 'border-red-600 bg-red-50 dark:bg-red-900/20 text-red-600'
                                            : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400'
                                        }`}
                                >
                                    <method.icon size={20} />
                                    <span className="font-black text-[10px] uppercase tracking-wider">{method.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Form Simulation (Desktop Only / Web Context) */}
                        <div className="hidden lg:block space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
                                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white">
                                    john.doe@example.com
                                </div>
                            </div>
                        </div>

                        {/* Payment Action */}
                        <div className="pt-4">
                            {/* Mobile Slider */}
                            <div className="lg:hidden block">
                                <div
                                    className="relative w-full h-16 bg-red-600 rounded-full overflow-hidden shadow-xl shadow-red-600/30 flex items-center justify-center cursor-pointer select-none"
                                    ref={slideConstraintsRef}
                                >
                                    <span className={`font-black text-white text-lg tracking-wide transition-opacity pointer-events-none ${slideCompleted ? 'opacity-0' : 'opacity-100'}`}>
                                        Slide to Pay {currency}{total.toLocaleString()}
                                    </span>
                                    <motion.div
                                        drag="x"
                                        dragConstraints={slideConstraintsRef}
                                        dragElastic={0}
                                        dragMomentum={false}
                                        onDragEnd={handleSlideDragEnd}
                                        className="absolute left-1 top-1 bottom-1 w-14 bg-white rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-lg z-10"
                                    >
                                        <ChevronRight size={24} className="text-red-600" strokeWidth={3} />
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: slideCompleted ? 1 : 0 }}
                                        className="absolute inset-0 bg-green-500 flex items-center justify-center z-20"
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
                                    className="w-full h-16 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xl shadow-xl shadow-red-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Processing...</span>
                                        </div>
                                    ) : (
                                        <>
                                            Pay {currency}{total.toLocaleString()}
                                            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </div>

                            <button
                                onClick={onBack}
                                disabled={isProcessing}
                                className="w-full mt-4 py-2 text-slate-400 font-bold text-sm hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
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
