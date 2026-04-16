import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPin, Calendar, Users, TrendingUp, ChevronLeft, ArrowRight, Check,
    PlaneTakeoff, Building2, PenTool, ShieldCheck, X, Phone
} from 'lucide-react';
import { ManualTripContextState } from '../types';

interface MobileManualPlannerProps {
    onStartBuilding: (initialData: ManualTripContextState) => void;
    onBack: () => void;
}

const AIRLINES = ['Emirates', 'Etihad Airways', 'Qatar Airways', 'flydubai', 'Lufthansa'];
const HOTEL_CHAINS = ['Jumeirah', 'Address Hotels', 'Marriott', 'Four Seasons', 'Rove'];

const CITIES = [
    { name: 'Abu Dhabi', country: 'UAE' },
    { name: 'Italy', country: 'IT' },
    { name: 'New York', country: 'USA' },
    { name: 'Singapore', country: 'Singapore' },
    { name: 'Malaysia', country: 'Malaysia' }
];

const MobileManualPlanner: React.FC<MobileManualPlannerProps> = ({ onStartBuilding, onBack }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [tripState, setTripState] = useState<ManualTripContextState>({
        tripName: '',
        source: '',
        destination: '',
        fromDate: '',
        toDate: '',
        travelers: { adults: 2, children: 0 },
        preferences: { airline: '', airlineLoyaltyId: '', hotelChain: '', hotelLoyaltyId: '', carRental: '' },
        notes: '',
        selectedFlight: null,
        selectedHotel: null,
        selectedRoomType: null,
        selectedActivities: [],
        selectedEssentials: []
    });

    // Get tomorrow's date for min attribute
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Autocomplete states
    const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
    const [showDestSuggestions, setShowDestSuggestions] = useState(false);
    const [filteredSourceCities, setFilteredSourceCities] = useState<{ name: string, country: string }[]>([]);
    const [filteredDestCities, setFilteredDestCities] = useState<{ name: string, country: string }[]>([]);

    const sourceRef = useRef<HTMLDivElement>(null);
    const destRef = useRef<HTMLDivElement>(null);

    // Click outside listener for suggestions
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

    const handleSourceChange = (val: string) => {
        setTripState({ ...tripState, source: val });
        if (val.trim()) {
            const filtered = CITIES.filter(c => c.name.toLowerCase().includes(val.toLowerCase()));
            setFilteredSourceCities(filtered);
            setShowSourceSuggestions(true);
        } else {
            setFilteredSourceCities([]);
            setShowSourceSuggestions(false);
        }
    };

    const handleDestChange = (val: string) => {
        setTripState({ ...tripState, destination: val });
        if (val.trim()) {
            const filtered = CITIES.filter(c => c.name.toLowerCase().includes(val.toLowerCase()));
            setFilteredDestCities(filtered);
            setShowDestSuggestions(true);
        } else {
            setFilteredDestCities([]);
            setShowDestSuggestions(false);
        }
    };

    const steps = [
        { id: 1, label: 'Destination', icon: MapPin },
        { id: 2, label: 'Dates', icon: Calendar },
        { id: 3, label: 'Travelers', icon: Users },
        { id: 4, label: 'Preferences', icon: TrendingUp },
        { id: 5, label: 'Finish', icon: PenTool }
    ];

    const handleNext = () => {
        if (currentStep < 5) setCurrentStep(prev => prev + 1);
        else onStartBuilding(tripState);
    };

    const handlePrev = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
        else onBack();
    };

    const totalSteps = 5;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pt-safe-top pb-safe-bottom">
            {/* Red Gentle Curve Header */}
            <motion.div layoutId="travel-header-background" className="sticky top-0 z-50 bg-[#d91918] text-white pt-4 pb-20 rounded-b-[50%_40px] mb-12 shadow-lg">
                <div className="px-6 flex justify-between items-center mb-0 relative z-10">
                    <button
                        onClick={handlePrev}
                        className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <ChevronLeft size={24} className="text-white" strokeWidth={2.5} />
                    </button>
                    <div className="flex items-center gap-3">
                        <img src="/images/mclogo-for-footer.svg" alt="Mastercard" className="h-8 brightness-0 invert" />
                        <span className="font-bold text-xl tracking-wide">Manual Planner</span>
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
            <div className="flex-1 overflow-y-auto px-6 pb-32">
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
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Where are you going?</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Choose your origin and destination.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2 relative" ref={sourceRef}>
                                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Origin</label>
                                        <input
                                            type="text"
                                            value={tripState.source}
                                            onChange={e => handleSourceChange(e.target.value)}
                                            onFocus={() => handleSourceChange(tripState.source)}
                                            placeholder="e.g. Dubai"
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-red-600 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 dark:text-white outline-none transition-all shadow-sm"
                                        />
                                        {showSourceSuggestions && filteredSourceCities.length > 0 && (
                                            <div className="absolute z-30 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                                                {filteredSourceCities.map(city => (
                                                    <button
                                                        key={city.name}
                                                        onClick={() => {
                                                            setTripState({ ...tripState, source: city.name });
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
                                        <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Destination</label>
                                        <input
                                            type="text"
                                            value={tripState.destination}
                                            onChange={e => handleDestChange(e.target.value)}
                                            onFocus={() => handleDestChange(tripState.destination)}
                                            placeholder="e.g. Italy"
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-red-600 rounded-2xl px-5 py-4 text-base font-bold text-slate-900 dark:text-white outline-none transition-all shadow-sm"
                                        />
                                        {showDestSuggestions && filteredDestCities.length > 0 && (
                                            <div className="absolute z-30 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                                                {filteredDestCities.map(city => (
                                                    <button
                                                        key={city.name}
                                                        onClick={() => {
                                                            setTripState({ ...tripState, destination: city.name });
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
                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={handleNext}
                                            disabled={!tripState.source || !tripState.destination}
                                            className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full font-bold text-base shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
                                        >
                                            Continue <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">When are you going?</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Select your dates.</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Depart</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                min={tomorrowStr}
                                                value={tripState.fromDate}
                                                onChange={e => setTripState({ ...tripState, fromDate: e.target.value })}
                                                className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none focus:border-red-600 transition-all shadow-sm ${tripState.fromDate ? 'text-slate-900 dark:text-white' : 'text-transparent'}`}
                                            />
                                            {!tripState.fromDate && (
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
                                                min={tripState.fromDate || tomorrowStr}
                                                value={tripState.toDate}
                                                onChange={e => setTripState({ ...tripState, toDate: e.target.value })}
                                                className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 font-bold outline-none focus:border-red-600 transition-all shadow-sm ${tripState.toDate ? 'text-slate-900 dark:text-white' : 'text-transparent'}`}
                                            />
                                            {!tripState.toDate && (
                                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold pointer-events-none">
                                                    Select return date
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handleNext}
                                        disabled={!tripState.fromDate || !tripState.toDate}
                                        className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full font-bold text-base shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
                                    >
                                        Continue <ArrowRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Who is coming?</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Add travelers to your group.</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Adults (18+)</span>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => setTripState({ ...tripState, travelers: { ...tripState.travelers, adults: Math.max(1, tripState.travelers.adults - 1) } })} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold flex items-center justify-center active:scale-95 transition-all">-</button>
                                            <span className="text-xl font-black w-6 text-center">{tripState.travelers.adults}</span>
                                            <button onClick={() => setTripState({ ...tripState, travelers: { ...tripState.travelers, adults: tripState.travelers.adults + 1 } })} className="w-10 h-10 rounded-full bg-red-600 text-white font-bold flex items-center justify-center active:scale-95 transition-all shadow-lg shadow-red-600/30">+</button>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Children (0-17)</span>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => setTripState({ ...tripState, travelers: { ...tripState.travelers, children: Math.max(0, tripState.travelers.children - 1) } })} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold flex items-center justify-center active:scale-95 transition-all">-</button>
                                            <span className="text-xl font-black w-6 text-center">{tripState.travelers.children}</span>
                                            <button onClick={() => setTripState({ ...tripState, travelers: { ...tripState.travelers, children: tripState.travelers.children + 1 } })} className="w-10 h-10 rounded-full bg-red-600 text-white font-bold flex items-center justify-center active:scale-95 transition-all shadow-lg shadow-red-600/30">+</button>
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={handleNext}
                                            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-base shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
                                        >
                                            Continue <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Preferences</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Optional loyalty programs.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><PlaneTakeoff size={14} className="text-red-600" /> Airline Preference</label>
                                        <select
                                            value={tripState.preferences.airline}
                                            onChange={e => setTripState({ ...tripState, preferences: { ...tripState.preferences, airline: e.target.value } })}
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 font-bold text-slate-900 dark:text-white outline-none focus:border-red-600 transition-all shadow-sm"
                                        >
                                            <option value="">Any Airline</option>
                                            {AIRLINES.map(a => <option key={a} value={a}>{a}</option>)}
                                        </select>
                                        {tripState.preferences.airline && (
                                            <input
                                                type="text"
                                                value={tripState.preferences.airlineLoyaltyId || ''}
                                                onChange={e => setTripState({ ...tripState, preferences: { ...tripState.preferences, airlineLoyaltyId: e.target.value } })}
                                                placeholder="Membership ID"
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-red-600 rounded-xl px-5 py-3 font-medium text-sm text-slate-900 dark:text-white outline-none transition-all"
                                            />
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><Building2 size={14} className="text-red-600" /> Hotel Chain</label>
                                        <select
                                            value={tripState.preferences.hotelChain}
                                            onChange={e => setTripState({ ...tripState, preferences: { ...tripState.preferences, hotelChain: e.target.value } })}
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 font-bold text-slate-900 dark:text-white outline-none focus:border-red-600 transition-all shadow-sm"
                                        >
                                            <option value="">Any Hotel Chain</option>
                                            {HOTEL_CHAINS.map(h => <option key={h} value={h}>{h}</option>)}
                                        </select>
                                        {tripState.preferences.hotelChain && (
                                            <input
                                                type="text"
                                                value={tripState.preferences.hotelLoyaltyId || ''}
                                                onChange={e => setTripState({ ...tripState, preferences: { ...tripState.preferences, hotelLoyaltyId: e.target.value } })}
                                                placeholder="Membership ID"
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-red-600 rounded-xl px-5 py-3 font-medium text-sm text-slate-900 dark:text-white outline-none transition-all"
                                            />
                                        )}
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={handleNext}
                                            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-base shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
                                        >
                                            Continue <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 5 && (
                            <div className="space-y-6">
                                <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Almost Done!</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Name your trip.</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Trip Name</label>
                                        <input type="text" value={tripState.tripName} onChange={e => setTripState({ ...tripState, tripName: e.target.value })} placeholder="e.g. Italy 2024" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-lg font-bold text-slate-900 dark:text-white outline-none focus:border-red-600 transition-all shadow-sm" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-400 uppercase">Notes (Optional)</label>
                                        <textarea value={tripState.notes} onChange={e => setTripState({ ...tripState, notes: e.target.value })} placeholder="Special requests..." className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 font-bold text-slate-900 dark:text-white outline-none focus:border-red-600 transition-all shadow-sm h-32 resize-none" />
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={handleNext}
                                            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-base shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
                                        >
                                            Create Trip <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MobileManualPlanner;
