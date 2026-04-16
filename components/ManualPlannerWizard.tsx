import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Navigation, Calendar, Users, TrendingUp, Search,
  ChevronRight, ArrowRight, Check, Briefcase, Building2,
  PlaneTakeoff, Car, PenTool, X, ShieldCheck, Heart
} from 'lucide-react';
import { ManualTripContextState, FamilyMember, FamilyVibe } from '../types';

interface ManualPlannerWizardProps {
  onStartBuilding: (initialData: ManualTripContextState) => void;
  onBack: () => void;
}

const AIRLINES = ['Emirates', 'Etihad Airways', 'Qatar Airways', 'flydubai', 'Lufthansa'];
const HOTEL_CHAINS = ['Jumeirah', 'Address Hotels', 'Marriott', 'Four Seasons', 'Rove'];

const CITIES = [
  { name: 'Abu Dhabi', country: 'UAE' },
  { name: 'Italy', country: 'IT' },
  { name: 'Paris', country: 'France' },
  { name: 'New York', country: 'USA' },
  { name: 'Abu Dhabi', country: 'UAE' },
  { name: 'Singapore', country: 'Singapore' },
  { name: 'Malaysia', country: 'Malaysia' }
];

const VIBES: { label: FamilyVibe; icon: string }[] = [
  { label: 'Beach', icon: '🏖️' },
  { label: 'Mountains', icon: '⛰️' },
  { label: 'Culture', icon: '🏛️' },
  { label: 'Adventure', icon: '🧗' },
  { label: 'Relax', icon: '🧘' },
  { label: 'Foodie', icon: '🍜' }
];

const ManualPlannerWizard: React.FC<ManualPlannerWizardProps> = ({ onStartBuilding, onBack }) => {
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

  // Autocomplete states
  const [showSourceSuggestions, setShowSourceSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const [filteredSourceCities, setFilteredSourceCities] = useState<{ name: string, country: string }[]>([]);
  const [filteredDestCities, setFilteredDestCities] = useState<{ name: string, country: string }[]>([]);

  const sourceRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

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
    { id: 'A', label: 'Trip Details', icon: MapPin },
    { id: 'B', label: 'Travelers', icon: Users },
    { id: 'C', label: 'Preferences', icon: TrendingUp },
    { id: 'D', label: 'Identification', icon: PenTool }
  ];

  const handleNext = () => {
    if (currentStep === 1) {
      // Initialize family members if needed
      const totalTravelers = tripState.travelers.adults + tripState.travelers.children;
      if (!tripState.familyMembers || tripState.familyMembers.length !== totalTravelers) {
        const newMembers: FamilyMember[] = [];
        for (let i = 0; i < tripState.travelers.adults; i++) {
          newMembers.push({ id: `a-${i}`, name: i === 0 ? 'Me' : `Adult ${i + 1}`, relation: i === 0 ? 'Self' : 'Adult', vibe: 'Relax' });
        }
        for (let i = 0; i < tripState.travelers.children; i++) {
          newMembers.push({ id: `c-${i}`, name: `Child ${i + 1}`, relation: 'Child', vibe: 'Adventure' });
        }
        setTripState({ ...tripState, familyMembers: newMembers });
      }
    }

    if (currentStep < 4) setCurrentStep(prev => prev + 1);
    else onStartBuilding(tripState);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
    else onBack();
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 flex flex-col min-h-[80vh]">
      {/* STEPPER BAR */}
      <div className="mb-16 relative">
        <div className="absolute top-6 left-6 right-6 h-[3px] bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0 rounded-full" />
        <div
          className="absolute top-6 left-6 h-[3px] bg-red-600 -translate-y-1/2 z-0 transition-all duration-700 ease-in-out rounded-full"
          style={{ width: `calc(((currentStep - 1) / (steps.length - 1)) * (100% - 48px))` }}
        />
        <div className="flex items-center justify-between relative z-10">
          {steps.map((step, idx) => (
            <div key={step.id} className="flex flex-col items-center gap-3">
              <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-black transition-all duration-500 ${currentStep >= idx + 1
                ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-600/40 scale-110'
                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400'
                }`}>
                {currentStep > idx + 1 ? <Check size={24} strokeWidth={3} /> : idx + 1}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest hidden md:block ${currentStep >= idx + 1 ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* FORM AREA */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[48px] shadow-2xl border border-slate-100 dark:border-slate-800 space-y-8"
          >
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">Trip Details</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Where, when, and with whom are you traveling?</p>
                </div>

                {/* Destination Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3 relative" ref={sourceRef}>
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Origin City</label>
                    <input
                      type="text"
                      value={tripState.source}
                      onChange={e => handleSourceChange(e.target.value)}
                      onFocus={() => handleSourceChange(tripState.source)}
                      placeholder="e.g. Abu Dhabi"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-600 rounded-2xl px-6 py-4 text-lg font-bold text-slate-900 dark:text-white outline-none transition-all shadow-sm"
                    />
                    {showSourceSuggestions && filteredSourceCities.length > 0 && (
                      <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                        {filteredSourceCities.map(city => (
                          <button
                            key={city.name}
                            onClick={() => {
                              setTripState({ ...tripState, source: city.name });
                              setShowSourceSuggestions(false);
                            }}
                            className="w-full px-6 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex flex-col"
                          >
                            <span className="font-bold text-slate-700 dark:text-slate-200">{city.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{city.country}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 relative" ref={destRef}>
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2">Target Destination</label>
                    <input
                      type="text"
                      value={tripState.destination}
                      onChange={e => handleDestChange(e.target.value)}
                      onFocus={() => handleDestChange(tripState.destination)}
                      placeholder="e.g. Dubai"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-600 rounded-2xl px-6 py-4 text-lg font-bold text-slate-900 dark:text-white outline-none transition-all shadow-sm"
                    />
                    {showDestSuggestions && filteredDestCities.length > 0 && (
                      <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                        {filteredDestCities.map(city => (
                          <button
                            key={city.name}
                            onClick={() => {
                              setTripState({ ...tripState, destination: city.name });
                              setShowDestSuggestions(false);
                            }}
                            className="w-full px-6 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex flex-col"
                          >
                            <span className="font-bold text-slate-700 dark:text-slate-200">{city.name}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{city.country}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Dates Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Departure Date</label>
                    <input
                      type="date"
                      value={tripState.fromDate}
                      onChange={e => setTripState({ ...tripState, fromDate: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-600 rounded-2xl px-6 py-4 text-base font-bold text-slate-900 dark:text-white outline-none transition-all shadow-sm [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Return Date</label>
                    <input
                      type="date"
                      value={tripState.toDate}
                      onChange={e => setTripState({ ...tripState, toDate: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-600 rounded-2xl px-6 py-4 text-base font-bold text-slate-900 dark:text-white outline-none transition-all shadow-sm [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* Travelers Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Adults (18+)</label>
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 py-3 border-2 border-transparent focus-within:border-red-600 transition-all">
                      <button onClick={() => setTripState({ ...tripState, travelers: { ...tripState.travelers, adults: Math.max(1, tripState.travelers.adults - 1) } })} className="text-xl font-bold text-slate-400 hover:text-red-600">−</button>
                      <span className="text-2xl font-black text-slate-900 dark:text-white">{tripState.travelers.adults}</span>
                      <button onClick={() => setTripState({ ...tripState, travelers: { ...tripState.travelers, adults: tripState.travelers.adults + 1 } })} className="text-xl font-bold text-slate-400 hover:text-red-600">+</button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Children (0-17)</label>
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-2xl px-6 py-3 border-2 border-transparent focus-within:border-red-600 transition-all">
                      <button onClick={() => setTripState({ ...tripState, travelers: { ...tripState.travelers, children: Math.max(0, tripState.travelers.children - 1) } })} className="text-xl font-bold text-slate-400 hover:text-red-600">−</button>
                      <span className="text-2xl font-black text-slate-900 dark:text-white">{tripState.travelers.children}</span>
                      <button onClick={() => setTripState({ ...tripState, travelers: { ...tripState.travelers, children: tripState.travelers.children + 1 } })} className="text-xl font-bold text-slate-400 hover:text-red-600">+</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && tripState.familyMembers && (
              <div className="space-y-10">
                <div className="text-center space-y-3">
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white">Meet the Travelers</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Define names and "vibes" for your family crew.</p>
                </div>
                <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
                  {tripState.familyMembers.map((member, idx) => (
                    <div key={member.id} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 space-y-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Name / Nickname</label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={e => {
                              const newMembers = [...tripState.familyMembers!];
                              newMembers[idx].name = e.target.value;
                              setTripState({ ...tripState, familyMembers: newMembers });
                            }}
                            className="w-full bg-white dark:bg-slate-900 border-2 border-transparent focus:border-red-600 rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white outline-none transition-all"
                          />
                        </div>
                        <div className="flex-1 space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Travel Vibe</label>
                          <div className="grid grid-cols-3 gap-2">
                            {VIBES.map(v => (
                              <button
                                key={v.label}
                                onClick={() => {
                                  const newMembers = [...tripState.familyMembers!];
                                  newMembers[idx].vibe = v.label;
                                  setTripState({ ...tripState, familyMembers: newMembers });
                                }}
                                className={`flex flex-col items-center py-2 rounded-xl border-2 transition-all ${member.vibe === v.label 
                                  ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20' 
                                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-red-600/30'}`}
                              >
                                <span className="text-xl mb-1">{v.icon}</span>
                                <span className="text-[8px] font-black uppercase tracking-tighter">{v.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-10">
                <div className="text-center space-y-3">
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white">Elite Preferences</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Filter the inventory based on your brand loyalty.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                        <PlaneTakeoff size={12} className="text-red-600" /> Preferred Airline
                      </label>
                      <select
                        value={tripState.preferences.airline}
                        onChange={e => setTripState({ ...tripState, preferences: { ...tripState.preferences, airline: e.target.value } })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-600 rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white outline-none transition-all"
                      >
                        <option value="">Select an Airline (Optional)</option>
                        {AIRLINES.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>

                    <AnimatePresence>
                      {tripState.preferences.airline && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3 overflow-hidden"
                        >
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                            <ShieldCheck size={12} className="text-red-600" /> Membership / Loyalty ID
                          </label>
                          <input
                            type="text"
                            value={tripState.preferences.airlineLoyaltyId || ''}
                            onChange={e => setTripState({ ...tripState, preferences: { ...tripState.preferences, airlineLoyaltyId: e.target.value } })}
                            placeholder={`Enter ${tripState.preferences.airline} Membership ID`}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-600 rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white outline-none transition-all"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                        <Building2 size={12} className="text-red-600" /> Hotel Chain
                      </label>
                      <select
                        value={tripState.preferences.hotelChain}
                        onChange={e => setTripState({ ...tripState, preferences: { ...tripState.preferences, hotelChain: e.target.value } })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-600 rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white outline-none transition-all"
                      >
                        <option value="">Select a Hotel Chain (Optional)</option>
                        {HOTEL_CHAINS.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                    </div>

                    <AnimatePresence>
                      {tripState.preferences.hotelChain && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3 overflow-hidden"
                        >
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                            <ShieldCheck size={12} className="text-red-600" /> Membership / Loyalty ID
                          </label>
                          <input
                            type="text"
                            value={tripState.preferences.hotelLoyaltyId || ''}
                            onChange={e => setTripState({ ...tripState, preferences: { ...tripState.preferences, hotelLoyaltyId: e.target.value } })}
                            placeholder={`Enter ${tripState.preferences.hotelChain} Membership ID`}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-600 rounded-2xl px-6 py-4 font-bold text-slate-900 dark:text-white outline-none transition-all"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-10">
                <div className="text-center space-y-3">
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white">Final Identification</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Name your journey and add optional notes.</p>
                </div>
                <div className="space-y-8">
                  <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Trip Name</label><input type="text" value={tripState.tripName} onChange={e => setTripState({ ...tripState, tripName: e.target.value })} placeholder="e.g. My Custom Italy Escape" className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-600 rounded-3xl px-8 py-5 text-xl font-bold text-slate-900 dark:text-white outline-none transition-all shadow-sm" /></div>
                  <div className="space-y-3"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Optional Notes</label><textarea value={tripState.notes} onChange={e => setTripState({ ...tripState, notes: e.target.value })} placeholder="Any special requirements?" className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-600 rounded-3xl px-8 py-5 font-bold text-slate-900 dark:text-white outline-none transition-all shadow-sm h-32" /></div>
                </div>
              </div>
            )}

            {/* Navigation Buttons Row */}
            <div className="flex gap-6 pt-4">
              <button
                onClick={handlePrev}
                className="flex-1 py-5 rounded-3xl font-black text-slate-400 dark:text-slate-500 border-2 border-slate-100 dark:border-slate-800 hover:text-red-600 hover:border-red-600 dark:hover:border-red-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase tracking-widest text-xs"
              >
                Go Back
              </button>

              <button
                onClick={handleNext}
                disabled={currentStep === 1 && (!tripState.source || !tripState.destination)}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-30 text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-red-600/30 flex items-center justify-center gap-4 transition-all"
              >
                {currentStep === 4 ? 'Start Building Itinerary' : 'Next'} <ArrowRight size={24} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ManualPlannerWizard;