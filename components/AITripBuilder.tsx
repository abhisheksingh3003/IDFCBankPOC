import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  Sparkles,
  Plus,
  Minus,
  Loader2,
  Check,
  Search,
  Navigation,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DESTINATIONS } from '../mockData';

interface AITripBuilderProps {
  onGenerate: (data: any) => void;
  isLoading: boolean;
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

const STEPS = [
  { id: 1, label: 'Pathfinding', icon: MapPin },
  { id: 2, label: 'Dates', icon: Calendar },
  { id: 3, label: 'Squad', icon: Users },
  { id: 4, label: 'Style', icon: TrendingUp },
  { id: 5, label: 'Your Preference', icon: Sparkles }
];

const AITripBuilder: React.FC<AITripBuilderProps> = ({ onGenerate, isLoading }) => {
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="w-full max-w-4xl mx-auto py-4 flex flex-col gap-10">
      {/* Stepper UI */}
      <div className="relative px-4">
        <div className="absolute top-6 left-10 right-10 h-[2px] bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />
        <div
          className="absolute top-6 left-10 h-[2px] bg-red-600 -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"
          style={{ width: `calc(((currentStep - 1) / (STEPS.length - 1)) * (100% - 80px))` }}
        />
        <div className="flex items-center justify-between relative z-10">
          {STEPS.map((step) => (
            <div key={step.id} className="flex flex-col items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl border-4 flex items-center justify-center font-black transition-all duration-500 ${currentStep >= step.id
                  ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-600/40 scale-110'
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400'
                  }`}
              >
                {currentStep > step.id ? <Check size={24} strokeWidth={3} /> : step.id}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest hidden md:block ${currentStep >= step.id ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl md:rounded-[48px] shadow-2xl p-6 sm:p-10 md:p-14 border border-slate-100 dark:border-slate-800 relative overflow-hidden group"
      >
        {/* Dynamic Step Icon Decorator */}
        <div className="absolute -bottom-10 -right-10 text-slate-100 dark:text-slate-800/20 pointer-events-none group-hover:text-red-500/5 transition-colors z-0">
          {React.createElement(STEPS[currentStep - 1].icon, { size: 240 })}
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="text-center space-y-3">
                  <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">Pathfinding</h2>
                  <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">Where is your adventure starting and ending?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3 relative" ref={sourceRef}>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Origin City</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. Warsaw, London..."
                        value={source}
                        onChange={(e) => {
                          setSource(e.target.value);
                          setShowSourceSuggestions(true);
                        }}
                        onFocus={() => setShowSourceSuggestions(true)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-600 rounded-2xl sm:rounded-3xl px-6 sm:px-8 py-4 sm:py-5 text-lg sm:text-xl font-bold text-slate-900 dark:text-white outline-none transition-all shadow-sm pl-14 sm:pl-16"
                      />
                      <Navigation className="absolute left-6 top-1/2 -translate-y-1/2 text-red-600" size={24} />
                    </div>

                    <AnimatePresence>
                      {showSourceSuggestions && filteredSource.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
                        >
                          {filteredSource.map((dest) => (
                            <button
                              key={dest.id}
                              type="button"
                              onClick={() => {
                                setSource(dest.name);
                                setShowSourceSuggestions(false);
                              }}
                              className="w-full px-8 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                              <p className="font-bold text-slate-900 dark:text-white">{dest.name}</p>
                              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{dest.country}</p>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-3 relative" ref={destRef}>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Target Destination</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. Paris, Tokyo..."
                        value={destination}
                        onChange={(e) => {
                          setDestination(e.target.value);
                          setShowDestSuggestions(true);
                        }}
                        onFocus={() => setShowDestSuggestions(true)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-600 rounded-2xl sm:rounded-3xl px-6 sm:px-8 py-4 sm:py-5 text-lg sm:text-xl font-bold text-slate-900 dark:text-white outline-none transition-all shadow-sm pl-14 sm:pl-16"
                      />
                      <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-red-600" size={24} />
                    </div>

                    <AnimatePresence>
                      {showDestSuggestions && filteredDest.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
                        >
                          {filteredDest.map((dest) => (
                            <button
                              key={dest.id}
                              type="button"
                              onClick={() => {
                                setDestination(dest.name);
                                setShowDestSuggestions(false);
                              }}
                              className="w-full px-8 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                              <p className="font-bold text-slate-900 dark:text-white">{dest.name}</p>
                              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{dest.country}</p>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="text-center space-y-3">
                  <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">When is your escape?</h2>
                  <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">When should this journey take place?</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Departure Date</label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-600 rounded-3xl px-8 py-5 text-lg font-bold text-slate-900 dark:text-white outline-none transition-all shadow-sm [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Return Date</label>
                    <input
                      type="date"
                      value={toDate}
                      min={fromDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-600 rounded-3xl px-8 py-5 text-lg font-bold text-slate-900 dark:text-white outline-none transition-all shadow-sm [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="text-center space-y-3">
                  <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">Your Squad</h2>
                  <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">Define the number of explorers.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 block text-center">Adults (18+)</label>
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-3xl px-8 py-4 border-2 border-transparent hover:border-red-600/30 transition-all shadow-inner">
                      <button
                        type="button"
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all shadow-md"
                      >
                        <Minus size={20} />
                      </button>
                      <span className="font-black text-4xl text-slate-900 dark:text-white min-w-[2ch] text-center">{adults}</span>
                      <button
                        type="button"
                        onClick={() => setAdults(adults + 1)}
                        className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all shadow-md"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 block text-center">Children (0-17)</label>
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-3xl px-8 py-4 border-2 border-transparent hover:border-red-600/30 transition-all shadow-inner">
                      <button
                        type="button"
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all shadow-md"
                      >
                        <Minus size={20} />
                      </button>
                      <span className="font-black text-4xl text-slate-900 dark:text-white min-w-[2ch] text-center">{children}</span>
                      <button
                        type="button"
                        onClick={() => setChildren(children + 1)}
                        className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all shadow-md"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div className="text-center space-y-3">
                  <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">Travel Style</h2>
                  <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">Define your travel DNA.</p>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Experience Tier</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {TRAVEL_STYLES.map(style => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setTravelStyle(style.id)}
                        className={`flex flex-col p-6 rounded-3xl border-4 transition-all text-left ${travelStyle === style.id
                          ? 'bg-red-50 dark:bg-red-900/10 border-red-600 shadow-xl scale-105'
                          : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-500 hover:border-slate-200 dark:hover:border-slate-700'
                          }`}
                      >
                        <span className={`font-black text-xl mb-1 ${travelStyle === style.id ? 'text-red-600' : 'text-slate-700 dark:text-slate-300'}`}>
                          {style.label}
                        </span>
                        <span className={`text-[10px] uppercase font-bold tracking-widest transition-colors ${travelStyle === style.id
                          ? 'text-red-600/70 dark:text-red-400/70'
                          : 'text-slate-500 dark:text-slate-400'
                          }`}>
                          {style.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-12"
              >
                <div className="text-center space-y-3">
                  <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">Your Preference</h2>
                  <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">Which experiences define your perfect escape?</p>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                  {INTEREST_OPTIONS.map(interest => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-8 py-4 rounded-2xl text-sm font-black transition-all flex items-center gap-3 border-4 ${selectedInterests.includes(interest)
                        ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-600/30 scale-110'
                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-red-600/30'
                        }`}
                    >
                      {selectedInterests.includes(interest) ? <Check size={18} strokeWidth={4} /> : <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full" />}
                      {interest}
                    </button>
                  ))}
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-70 text-white font-black py-7 rounded-[32px] shadow-2xl shadow-red-600/40 transition-all flex items-center justify-center gap-4 text-2xl group"
                  >
                    {isLoading ? (
                      <div className="w-10 h-10 flex items-center justify-center">
                        <img src="/images/mclogo-for-footer.svg" className="w-full h-full object-contain" alt="Loading" />
                      </div>
                    ) : (
                      <Sparkles size={32} className="group-hover:rotate-12 transition-transform" />
                    )}
                    {isLoading ? 'Designing Your Journey...' : 'Generate Dream Trip'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {currentStep < 5 && (
            <div className="flex gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handlePrev}
                className="flex-1 py-5 rounded-3xl font-black text-slate-400 dark:text-slate-500 border-2 border-slate-100 dark:border-slate-800 hover:text-red-600 hover:border-red-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3"
              >
                <ChevronLeft size={18} /> Previous
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={isNextDisabled()}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-30 text-white py-5 rounded-3xl font-black text-xl shadow-xl shadow-red-600/30 flex items-center justify-center gap-4 transition-all"
              >
                Continue <ArrowRight size={24} />
              </button>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default AITripBuilder;