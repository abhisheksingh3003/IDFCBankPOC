import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';

interface BookingLayoutProps {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    onClose?: () => void;
    children: ReactNode;
    footer?: ReactNode;
    className?: string;
    headerAction?: ReactNode;
    backgroundImage?: string;
    currentStep?: number;
    totalSteps?: number;
}

const BookingLayout: React.FC<BookingLayoutProps> = ({
    title,
    subtitle,
    onBack,
    onClose,
    children,
    footer,
    className = '',
    headerAction,
    backgroundImage,
    currentStep,
    totalSteps
}) => {
    return (
        <div className={`flex flex-col h-full bg-transparent relative overflow-hidden ${className}`}>

            {/* Optional Background Image for immersive feel */}
            {backgroundImage && (
                <div className="absolute top-0 left-0 w-full h-[45vh] z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-slate-900/40 to-transparent z-10" />
                    <img src={backgroundImage} className="w-full h-full object-cover" alt="Background" />
                </div>
            )}

            {/* Sticky Header with Glassmorphism */}
            <header className={`sticky top-0 z-40 px-6 py-5 flex flex-col gap-4 transition-all ${backgroundImage ? 'bg-transparent text-white' : 'glass-nav'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className={`p-2.5 rounded-2xl transition-all active:scale-95 ${backgroundImage ? 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md' : 'glass-pill text-slate-600 hover:text-[#1a1a2e]'}`}
                            >
                                <ArrowLeft size={20} strokeWidth={2.5} />
                            </button>
                        )}
                        <div className={backgroundImage ? 'text-shadow-md' : ''}>
                            <h1 className={`text-xl font-black uppercase tracking-tight leading-none mb-1 ${backgroundImage ? 'text-white' : 'text-[#1a1a2e]'}`}>
                                {title}
                            </h1>
                            {subtitle && (
                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-70 ${backgroundImage ? 'text-slate-100' : 'text-slate-500'}`}>
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {headerAction}
                        {onClose && (
                            <button
                                onClick={onClose}
                                className={`p-2.5 rounded-2xl transition-all active:scale-95 ${backgroundImage ? 'bg-white/10 hover:bg-white/20 text-white backdrop-blur-md' : 'glass-pill text-slate-500 hover:text-[#1a1a2e]'}`}
                            >
                                <X size={20} strokeWidth={2.5} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Modern Stepper */}
                {currentStep !== undefined && totalSteps !== undefined && (
                    <div className="flex gap-1.5 w-full max-w-xs px-1">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i + 1 <= currentStep
                                    ? 'bg-red-650 shadow-[0_0_8px_rgba(220,38,38,0.5)]'
                                    : backgroundImage ? 'bg-white/20' : 'bg-slate-200'
                                    }`}
                            />
                        ))}
                    </div>
                )}
            </header>

            {/* Scrollable Content */}
            <main className={`flex-1 overflow-y-auto relative z-10 ${footer ? 'pb-32' : ''} custom-scrollbar`}>
                <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
                    {children}
                </div>
            </main>

            {/* Footer with improved branding and layout */}
            {footer && (
                <div className="absolute bottom-0 left-0 w-full z-50 glass-nav p-6 md:px-12 md:py-8">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        {footer}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingLayout;
