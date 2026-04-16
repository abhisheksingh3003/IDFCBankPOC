import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Calendar, Users, TrendingUp, Sparkles, Plus, Minus,
    Check, ArrowRight, ChevronLeft, Navigation, Phone
} from 'lucide-react';
import { DESTINATIONS } from '../mockData';

interface MobileAITripBuilderProps {
    onGenerate: (data: any) => void;
    isLoading: boolean;
    onBack: () => void;
}

const INTEREST_OPTIONS = [
    'Museums', 'Nightlife', 'Hiking', 'Gourmet Food',
    'Shopping', 'Architecture', 'Wellness', 'History'
];

const TRAVEL_STYLES = [
    { id: 'budget', label: 'Budget', description: 'Smart & Savvy' },
    { id: 'balanced', label: 'Balanced', description: 'Comfort & Value' },
    { id: 'luxury', label: 'Luxury', description: 'Premier & Elite' }
];

const MobileAITripBuilder: React.FC<MobileAITripBuilderProps> = ({ onGenerate, isLoading, onBack }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(0);
    const [budget, setBudget] = useState(3000);
    const [travelStyle, setTravelStyle] = useState('balanced');
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

    // Get tomorrow's date for min attribute
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
    const [showDestSuggestions, setShowDestSuggestions] = useState(false);

    const sourceRef = useRef<HTMLDivElement>(null);
    const destRef = useRef<HTMLDivElement>(null);

    const getFiltered = (query: string) => DESTINATIONS.filter(d =>
        d.name.toLowerCase().includes(query.toLowerCase()) &&
        query.length > 0 &&
        d.name.toLowerCase() !== query.toLowerCase()
    );

    const filteredSource = getFiltered(source);
    const filteredDest = getFiltered(destination);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sourceRef.current && !sourceRef.current.contains(event.target as Node)) {
                setShowSourceSuggestions(false);
            }
            if (destRef.current && !destRef.current.contains(event.target as Node)) {
                setShowDestSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleInterest = (interest: string) => {
        setSelectedInterests(prev =>
            prev.includes(interest)
                ? prev.filter(i => i !== interest)
                : [...prev, interest]
        );
    };

    const handleNext = () => {
        if (currentStep < 5) setCurrentStep(prev => prev + 1);
    };

    const handlePrev = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
        else onBack();
    };

    const handleSubmit = () => {
        onGenerate({
            source,
            destination,
            fromDate,
            toDate,
            travelers: adults + children,
            adults,
            children,
            budget,
            travelStyle,
            interests: selectedInterests
        });
    };

    const isNextDisabled = () => {
        if (currentStep === 1) return !source || !destination;
        if (currentStep === 2) return !fromDate || !toDate;
        return false;
    };

    const steps = [
        { id: 1, label: 'Route', icon: MapPin },
        { id: 2, label: 'Dates', icon: Calendar },
        { id: 3, label: 'Group', icon: Users },
        { id: 4, label: 'Style', icon: TrendingUp },
        { id: 5, label: 'Interests', icon: Sparkles }
    ];

    const totalSteps = 5;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pt-safe-top pb-safe-bottom">
            {/* Red Gentle Curve Header */}
            <motion.div layoutId="travel-header-background" className="bg-[#d91918] text-white pt-4 pb-20 rounded-b-[50%_40px] relative z-50 mb-12 shadow-lg">
                <div className="px-6 flex justify-between items-center mb-0 relative z-10">
                    <button
                        onClick={handlePrev}
                        className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <ChevronLeft size={24} className="text-white" strokeWidth={2.5} />
                    </button>
                    <div className="flex items-center gap-3">
                        <img src="/images/mclogo-for-footer.svg" alt="Mastercard" className="h-8 brightness-0 invert" />
                        <span className="font-bold text-xl tracking-wide">AI Trip Builder</span>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#d91918]">
                        <Phone size={20} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Steps on Curve Edge */}
                <div className="absolute bottom-0 left-0 w-full h-0 z-20 pointer-events-none">
                    {[
                        { id: 1, left: '15%', bottom: '-22px' },
                        { id: 2, left: '32%', bottom: '-31px' },
                        { id: 3, left: '50%', bottom: '-36px' },
                        { id: 4, left: '68%', bottom: '-31px' },
                        { id: 5, left: '85%', bottom: '-22px' }
                    ].map((pos, index) => {
                        const step = steps[index];
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;

                        return (
                            <div
                                key={step.id}
                                className="absolute flex flex-col items-center"
                                style={{
                                    left: pos.left,
                                    bottom: pos.bottom,
                                    transform: 'translateX(-50%)'
                                }}
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-md transition-all border-2 border-slate-50 relative z-30
                                    ${isActive
                                            ? 'bg-[#d91918] text-white scale-110'
                                            : isCompleted
                                                ? 'bg-red-400 text-white'
                                                : 'bg-gray-200 text-slate-500'
                                        }`}
                                >
                                    {isCompleted ? <Check size={16} strokeWidth={3} /> : step.id}
                                </div>
                                <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider transition-all ${isActive ? 'text-slate-900 dark:text-white opacity-100' : 'text-slate-400 opacity-0'}`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </motion.div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 pb-32">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Pathfinding</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Where is your adventure starting?</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2 relative" ref={sourceRef}>
                                        <label className="text-xs font-bold text-slate-400 uppercase">Origin</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={source}
                                                onChange={e => { setSource(e.target.value); setShowSourceSuggestions(true); }}
                                                onFocus={() => setShowSourceSuggestions(true)}
                                                placeholder="e.g. Warsaw"
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-red-600 rounded-2xl pl-12 pr-5 py-4 text-base font-bold text-slate-900 dark:text-white outline-none transition-all shadow-sm"
                                            />
                                            <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        </div>
                                        {showSourceSuggestions && filteredSource.length > 0 && (
                                            <div className="absolute z-30 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                                                {filteredSource.map(city => (
                                                    <button
                                                        key={city.id}
                                                        onClick={() => {
                                                            setSource(city.name);
                                                            setShowSourceSuggestions(false);
                                                        }}
                                                        className="w-full px-6 py-4 text-left border-b border-slate-50 dark:border-slate-800 last:border-0 active:bg-red-50 dark:active:bg-red-900/10 flex flex-col"
                                                    >
                                                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{city.name}</span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase">{city.country}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2 relative" ref={destRef}>
                                        <label className="text-xs font-bold text-slate-400 uppercase">Destination</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={destination}
                                                onChange={e => { setDestination(e.target.value); setShowDestSuggestions(true); }}
                                                onFocus={() => setShowDestSuggestions(true)}
                                                placeholder="e.g. Paris"
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-red-600 rounded-2xl pl-12 pr-5 py-4 text-base font-bold text-slate-900 dark:text-white outline-none transition-all shadow-sm"
                                            />
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        </div>
                                        {showDestSuggestions && filteredDest.length > 0 && (
                                            <div className="absolute z-30 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                                                {filteredDest.map(city => (
                                                    <button
                                                        key={city.id}
                                                        onClick={() => {
                                                            setDestination(city.name);
                                                            setShowDestSuggestions(false);
                                                        }}
                                                        className="w-full px-6 py-4 text-left border-b border-slate-50 dark:border-slate-800 last:border-0 active:bg-red-50 dark:active:bg-red-900/10 flex flex-col"
                                                    >
                                                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{city.name}</span>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase">{city.country}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Dates</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">When should this journey happen?</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Depart</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={fromDate}
                                                min={tomorrowStr}
                                                onChange={e => setFromDate(e.target.value)}
                                                className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none focus:border-red-600 transition-all shadow-sm ${fromDate ? 'text-slate-900 dark:text-white' : 'text-transparent'}`}
                                            />
                                            {!fromDate && (
                                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold pointer-events-none">
                                                    Select departure date
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Return</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                value={toDate}
                                                min={fromDate || tomorrowStr}
                                                onChange={e => setToDate(e.target.value)}
                                                className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none focus:border-red-600 transition-all shadow-sm ${toDate ? 'text-slate-900 dark:text-white' : 'text-transparent'}`}
                                            />
                                            {!toDate && (
                                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold pointer-events-none">
                                                    Select return date
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Travelers</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Who is in your squad?</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Adults (18+)</span>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => setAdults(Math.max(1, adults - 1))} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold flex items-center justify-center active:scale-95 transition-all">-</button>
                                            <span className="text-xl font-black w-6 text-center">{adults}</span>
                                            <button onClick={() => setAdults(adults + 1)} className="w-10 h-10 rounded-full bg-red-600 text-white font-bold flex items-center justify-center active:scale-95 transition-all shadow-lg shadow-red-600/30">+</button>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Children (0-17)</span>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => setChildren(Math.max(0, children - 1))} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold flex items-center justify-center active:scale-95 transition-all">-</button>
                                            <span className="text-xl font-black w-6 text-center">{children}</span>
                                            <button onClick={() => setChildren(children + 1)} className="w-10 h-10 rounded-full bg-red-600 text-white font-bold flex items-center justify-center active:scale-95 transition-all shadow-lg shadow-red-600/30">+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Travel Style</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Define your travel DNA.</p>
                                </div>

                                <div className="grid gap-4">
                                    {TRAVEL_STYLES.map(style => (
                                        <button
                                            key={style.id}
                                            onClick={() => setTravelStyle(style.id)}
                                            className={`p-5 rounded-2xl border-2 text-left transition-all ${travelStyle === style.id
                                                ? 'bg-red-50 dark:bg-red-900/10 border-red-600 shadow-sm'
                                                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={`font-black text-lg ${travelStyle === style.id ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>{style.label}</span>
                                                {travelStyle === style.id && <Check size={20} className="text-red-600" strokeWidth={3} />}
                                            </div>
                                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{style.description}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {currentStep === 5 && (
                            <div className="space-y-6">
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Interests</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">What do you love?</p>
                                </div>

                                <div className="flex flex-wrap gap-3 justify-center">
                                    {INTEREST_OPTIONS.map(interest => (
                                        <button
                                            key={interest}
                                            onClick={() => toggleInterest(interest)}
                                            className={`px-5 py-3 rounded-full text-sm font-bold border-2 transition-all ${selectedInterests.includes(interest)
                                                ? 'bg-red-600 border-red-600 text-white shadow-md shadow-red-600/20'
                                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                                                }`}
                                        >
                                            {interest}
                                        </button>
                                    ))}
                                </div>

                                <div className="pt-4">
                                    {isLoading ? (
                                        <div className="flex flex-col items-center justify-center p-8 space-y-4">
                                            <img src="/images/mclogo-for-footer.svg" className="w-16 h-16 animate-pulse" />
                                            <p className="text-sm font-bold text-slate-500 animate-pulse">Generating your itinerary...</p>
                                        </div>
                                    ) : (
                                        <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-6 text-center border border-red-100 dark:border-red-900/20">
                                            <Sparkles className="text-red-600 w-8 h-8 mx-auto mb-3" />
                                            <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                                                Ready to build a completely custom itinerary for <b>{destination}</b> based on your preferences?
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Floating Bottom Action Bar */}
            <div className="fixed bottom-28 left-0 w-full px-6 z-50 pointer-events-none">
                <button
                    onClick={currentStep === 5 ? handleSubmit : handleNext}
                    disabled={isNextDisabled() || isLoading}
                    className="w-full pointer-events-auto bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-red-600/30 flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                    {currentStep === 5 ? 'Generate Trip' : 'Continue'}
                    {currentStep !== 5 && <ArrowRight size={20} />}
                    {currentStep === 5 && <Sparkles size={20} />}
                </button>
            </div>
        </div>
    );
};

export default MobileAITripBuilder;
