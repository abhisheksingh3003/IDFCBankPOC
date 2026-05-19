import React, { useState, useEffect } from 'react';
import {
  Compass,
  Map as MapIcon,
  Plane,
  Hotel as HotelIcon,
  Camera,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  Loader2,
  ArrowLeft,
  Briefcase,
  Ticket,
  Home,
  ShoppingBag,
  CheckCircle2,
  Mic,
  MicOff,
  Volume2,
  ShieldCheck,
  UserCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Theme, Language, Destination, AIItinerary, View, PlannerMode, Curation, Hotel, BookingStep, Essential, Activity, Flight, ManualTripContextState, UserProfile, BookingCategory } from './types';
import { DESTINATIONS, FLIGHTS_TO_PARIS, PARIS_HOTELS, PARIS_ACTIVITIES, FLIGHTS_TO_ITALY, ITALY_HOTELS, ITALY_ACTIVITIES, FLIGHTS_TO_ABU_DHABI, ABU_DHABI_ACTIVITIES, ALTERNATIVE_HOTELS, MOCK_BOOKED_CURATION } from './mockData';
import ThemeToggle from './components/ThemeToggle';

import FlightCard from './components/FlightCard';
import HotelCard from './components/HotelCard';
import ActivityCard from './components/ActivityCard';
import LandingPage from './components/LandingPage';
import AITripBuilder from './components/AITripBuilder';
import AIResultsDashboard from './components/AIResultsDashboard';
import MyCurationsView from './components/MyCurationsView';
import HotelBookingView from './components/HotelBookingView';
import FlightBookingView from './components/FlightBookingView';
import MyBookingsView from './components/MyBookingsView';
import BundleBookingView from './components/BundleBookingView';
import ExperienceBookingView from './components/ExperienceBookingView';
import ManualPlannerWizard from './components/ManualPlannerWizard';
import ManualBuildingDashboard from './components/ManualBuildingDashboard';
import AIVoiceOrb from './components/AIVoiceOrb';
import ConversationalPlanner from './components/ConversationalPlanner';
import OneTapAuthModal from './components/OneTapAuthModal';
import OnboardingFlow from './components/OnboardingFlow';
import { generateAIItinerary } from './services/gemini';

// Dynamic Loading Phases for high-fidelity UX
const LOADING_PHASES = [
  {
    id: 'flights',
    title: 'Flight Discovery',
    subtitle: 'Scanning global flight inventories...',
    log: 'GET /v1/flights?class=first&direct=true',
    icon: Plane
  },
  {
    id: 'hotels',
    title: 'Hotel Scouting',
    subtitle: 'Indexing luxury stays & palace hotels...',
    log: 'POST /v3/accommodations/luxury-cluster',
    icon: HotelIcon
  },
  {
    id: 'activities',
    title: 'Experiential Curation',
    subtitle: 'Mapping elite activities & hidden gems...',
    log: 'SYNC /local-experiences/curated-dna',
    icon: Camera
  },
  {
    id: 'essentials',
    title: 'Essentials Synthesis',
    subtitle: 'Bundling premium trip protection & tech...',
    log: 'AGGREGATE /essentials/elite-bundle',
    icon: ShoppingBag
  }
];

const DesktopApp: React.FC<{ user: UserProfile | null; setUser: (u: UserProfile | null) => void }> = ({ user, setUser }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [view, setView] = useState<View>('landing');
  const [selectedDestId, setSelectedDestId] = useState<string>(DESTINATIONS[1].id);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isLoadingManual, setIsLoadingManual] = useState(false);
  const [loadingPhaseIdx, setLoadingPhaseIdx] = useState(0);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [showAccountPanel, setShowAccountPanel] = useState(false);

  // High-level state
  const [curations, setCurations] = useState<Curation[]>([]);
  const [activeCurationId, setActiveCurationId] = useState<string | null>(null);
  const [bookingsCategory, setBookingsCategory] = useState<BookingCategory>('itinerary');
  const [initialBookingStep, setInitialBookingStep] = useState<BookingStep>('details');
  const [activeFlightAlternatives, setActiveFlightAlternatives] = useState<Flight[]>([]);
  const [selectedEssentials, setSelectedEssentials] = useState<Essential[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  const [manualTripState, setManualTripState] = useState<ManualTripContextState | null>(null);
  const [manualResultsCuration, setManualResultsCuration] = useState<Curation | null>(null);

  // User & Auth State
  // user and setUser are now props

  // Auto-Onboarding Trigger
  useEffect(() => {
    if (user && !user.isOnboarded) {
      setView('onboarding');
    }
  }, [user]);

  const handleOnboardingComplete = (data: Partial<UserProfile>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data, isOnboarded: true };
    
    // Persist onboarding status
    const storageKey = `IDFC First Bank_onboarded_${user.email}`;
    localStorage.setItem(storageKey, 'true');
    
    setUser(updatedUser);
    setView('landing');
  };

  const handleResetPreference = () => {
    if (!user) return;
    const storageKey = `IDFC First Bank_onboarded_${user.email}`;
    localStorage.removeItem(storageKey);
    const updatedUser = { ...user, isOnboarded: false };
    setUser(updatedUser);
    setView('onboarding');
    setShowAccountPanel(false);
  };

  const handleLogout = () => {
    setUser(null);
    setShowAccountPanel(false);
  };

  const selectedDestination = DESTINATIONS.find(d => d.id === selectedDestId) || DESTINATIONS[0];

  const activeCuration = curations.find(c => c.curationId === activeCurationId);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
  }, [theme]);

  // Loading phase cycler
  useEffect(() => {
    let interval: any;
    if (isLoadingAi || isLoadingManual) {
      interval = setInterval(() => {
        setLoadingPhaseIdx(prev => (prev + 1) % LOADING_PHASES.length);
      }, 1200); // Slightly faster cycling for better visual feedback
    } else {
      setLoadingPhaseIdx(0);
    }
    return () => clearInterval(interval);
  }, [isLoadingAi, isLoadingManual]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleSelectMode = (mode: PlannerMode) => {
    if (mode === 'ai') setView('builder');
    else setView('manual-planner');
  };


  const handleStartManualBuilding = async (initialData: ManualTripContextState) => {
    const targetName = initialData.destination;
    const mockDestTemplate = DESTINATIONS.find(d => d.name.toLowerCase().includes(targetName.toLowerCase())) || selectedDestination;
    const newCurationId = Math.random().toString(36).substr(2, 9).toUpperCase();

    // Initialize the manual curation skeleton immediately so partial bookings can be persisted to My Bookings
    const skeletonCuration: Curation = {
      curationId: newCurationId,
      tripName: initialData.tripName || `Trip to ${targetName}`,
      origin: initialData.source,
      destination: mockDestTemplate,
      itinerary: [],
      travelers: initialData.travelers.adults + initialData.travelers.children,
      status: 'draft',
      startDate: initialData.fromDate,
      endDate: initialData.toDate,
      isManual: true,
      familyMembers: initialData.familyMembers,
      experienceBookings: []
    };

    setCurations(prev => [skeletonCuration, ...prev]);
    setActiveCurationId(newCurationId);
    setManualTripState(initialData);
    setIsLoadingManual(true);

    try {
      const result = await generateAIItinerary(targetName);

      // Settle stay duration from dates
      let nights = 3;
      if (initialData.fromDate && initialData.toDate) {
        const start = new Date(initialData.fromDate);
        const end = new Date(initialData.toDate);
        nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      }

      // Auto-populate default flight and hotel for manual results
      let defaultFlight = null;
      let defaultHotel = null;

      if (targetName.toLowerCase().includes('italy')) {
        defaultFlight = FLIGHTS_TO_ITALY[1]; // LOT
        defaultHotel = ITALY_HOTELS[2]; // Hotel de Russie
      } else if (targetName.toLowerCase().includes('paris')) {
        defaultFlight = FLIGHTS_TO_PARIS[1]; // LOT
        defaultHotel = PARIS_HOTELS[0]; // Ritz
      } else {
        defaultFlight = FLIGHTS_TO_ITALY[0];
        defaultHotel = ALTERNATIVE_HOTELS[0];
      }

      const resultCuration: Curation = {
        ...skeletonCuration,
        itinerary: result,
        flightBooking: defaultFlight ? {
          flightId: defaultFlight.id,
          bookingRef: 'MNL-FLT-' + Math.floor(1000 + Math.random() * 9000),
          price: defaultFlight.price,
          airline: defaultFlight.airline,
          airlineLogo: defaultFlight.airlineLogo,
          departureTime: defaultFlight.departureTime,
          arrivalTime: defaultFlight.arrivalTime,
          duration: defaultFlight.duration,
          originIata: defaultFlight.originIata,
          destinationIata: defaultFlight.destinationIata
        } : undefined,
        hotelBooking: defaultHotel ? {
          hotelId: defaultHotel.id,
          bookingRef: 'MNL-HTL-' + Math.floor(1000 + Math.random() * 9000),
          totalPrice: defaultHotel.pricePerNight * nights,
          hotelName: defaultHotel.name,
          imageUrl: defaultHotel.imageUrl
        } : undefined,
        familyMembers: skeletonCuration.familyMembers
      };

      setTimeout(() => {
        setIsLoadingManual(false);
        setManualResultsCuration(resultCuration);
        setView('landing');
      }, 3000);
    } catch (err) {
      console.error(err);
      setIsLoadingManual(false);
    }
  };

  const handleUpdateManualCuration = (updates: Partial<Curation>) => {
    if (!activeCurationId) return;
    setCurations(prev => prev.map(c => c.curationId === activeCurationId ? { ...c, ...updates } : c));
  };

  const handleManualFinalize = (finalData: ManualTripContextState) => {
    // Final check to ensure status is set to fully booked if they reached the end
    handleUpdateManualCuration({ status: 'fully_booked' });
    setManualTripState(null);
    setActiveCurationId(null);
    setView('landing');
  };

  const handleGenerateAI = async (formData: any) => {
    setIsLoadingAi(true);

    // If formData is from ConversationalPlanner, it's a full Curation object
    if (formData && formData.curationId) {
      const curation = { ...formData };
      curation.curationId = Math.random().toString(36).substr(2, 9).toUpperCase(); // Force new ID
      curation.status = 'partially_booked'; // Assuming some items are booked

      // Reconstruct My Trips booking arrays from the conversational booked items
      const bookedFlights = curation.itinerary?.filter((item: any) => item.type === 'flight' && item.booked) || [];
      if (bookedFlights.length > 0) {
        const originIata = bookedFlights[0].subtitle.split(' • ')[0]?.split(' → ')[0]?.trim() || 'DXB';
        const destinationIata = bookedFlights[0].subtitle.split(' • ')[0]?.split(' → ')[1]?.trim() || 'FCO';
        const depTime = bookedFlights[0].subtitle.split(' • ')[2]?.split(' → ')[0]?.trim() || '10:00 AM';
        const duration = bookedFlights[0].subtitle.split(' • ')[3]?.trim() || '2h 15m';

        curation.flightBooking = {
          bookingRef: 'MC-' + Math.floor(1000 + Math.random() * 9000),
          airline: bookedFlights[0].title.split(' ')[0],
          airlineLogo: bookedFlights[0].image,
          price: bookedFlights.reduce((acc: number, f: any) => acc + f.price, 0),
          originIata,
          destinationIata,
          departureTime: depTime,
          duration,
        };
      }

      const bookedHotels = curation.itinerary?.filter((item: any) => item.type === 'hotel' && item.booked) || [];
      if (bookedHotels.length > 0) {
        curation.hotelBooking = {
          bookingRef: 'HT-' + Math.floor(1000 + Math.random() * 9000),
          hotelName: bookedHotels[0].title,
          roomType: bookedHotels[0].subtitle,
          checkIn: curation.startDate || '2026-10-24',
          checkOut: curation.endDate || '2026-10-27',
          totalPrice: bookedHotels.reduce((acc: number, f: any) => acc + f.price, 0),
          imageUrl: bookedHotels[0].image
        };
      }

      const bookedExps = curation.itinerary?.filter((item: any) => item.type === 'activity' && item.booked) || [];
      if (bookedExps.length > 0) {
        curation.experienceBookings = bookedExps.map((exp: any) => ({
          bookingRef: 'EXP-' + Math.floor(1000 + Math.random() * 9000),
          activityId: exp.id,
          activityName: exp.title,
          date: curation.startDate || '2024-10-24',
          time: exp.subtitle.split(' • ')[0] || '10:00 AM',
          price: exp.price
        }));
      }

      setCurations(prev => [curation, ...prev]);
      setActiveCurationId(curation.curationId);
      setIsLoadingAi(false);
      setView('results');
      return;
    }

    const targetName = 'Paris';
    const originName = formData?.source || 'Dubai';
    const travelersCount = formData?.travelers || 2;

    const mockDestTemplate = DESTINATIONS.find(d => d.name === 'Paris') || DESTINATIONS[1];

    try {
      const result = await generateAIItinerary(targetName);
      const newCuration: Curation = {
        curationId: Math.random().toString(36).substr(2, 9).toUpperCase(),
        origin: originName,
        destination: mockDestTemplate,
        itinerary: result,
        travelers: travelersCount,
        status: 'draft',
        startDate: formData?.fromDate || '2026-10-24',
        endDate: formData?.toDate || '2026-10-27',
        experienceBookings: []
      };
      setCurations(prev => [newCuration, ...prev]);
      setActiveCurationId(newCuration.curationId);
      setView('results');
    } catch (err) {
      console.error(err);
      // Stay on builder view so user can retry, state is preserved now
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSyncCuration = (updatedCuration: Curation) => {
    setCurations(prev => {
      const existingIdx = prev.findIndex(c => c.curationId === updatedCuration.curationId);
      if (existingIdx >= 0) {
        const newArr = [...prev];
        newArr[existingIdx] = updatedCuration;
        return newArr;
      } else {
        return [updatedCuration, ...prev];
      }
    });
  };

  const handleOpenBooking = (curationId: string, step: BookingStep = 'details') => {
    setActiveCurationId(curationId);
    setInitialBookingStep(step);
    setView('booking');
  };

  const handleOpenFlightBooking = (curationId: string, step: BookingStep = 'details', alternatives: Flight[] = []) => {
    setActiveCurationId(curationId);
    setInitialBookingStep(step);
    setActiveFlightAlternatives(alternatives);
    setView('flight-booking');
  };

  const handleOpenExperienceBooking = (activity: Activity) => {
    setSelectedActivity(activity);
    setView('experience-booking');
  };

  const handleFinalizeBundle = (essentials: Essential[], curationId?: string) => {
    if (curationId) setActiveCurationId(curationId);
    setSelectedEssentials(essentials);
    setView('bundle-booking');
  };

  const handleBookingComplete = (curationId: string, details: any) => {
    setCurations(prev => prev.map(c => c.curationId === curationId ? { ...c, status: 'partially_booked', hotelBooking: details } : c));
  };

  const handleFlightBookingComplete = (curationId: string, details: any) => {
    setCurations(prev => prev.map(c => c.curationId === curationId ? { ...c, status: 'partially_booked', flightBooking: details } : c));
  };

  const handleExperienceBookingComplete = (details: any) => {
    if (!activeCurationId) return;
    setCurations(prev => prev.map(c => c.curationId === activeCurationId ? { ...c, status: 'partially_booked', experienceBookings: [...(c.experienceBookings || []), details] } : c));
  };

  const handleBundleComplete = (details: any, curationId?: string) => {
    const targetId = curationId || activeCurationId;
    if (!targetId) return;
    setCurations(prev => prev.map(c => c.curationId === targetId ? { ...c, status: 'fully_booked', essentialsBooking: details } : c));
  };

  const handleHotelSwap = (curationId: string, newHotel: Hotel) => {
    setCurations(prev => prev.map(c => c.curationId === curationId ? { ...c, destination: { ...c.destination, hotels: [newHotel, ...c.destination.hotels.filter(h => h.id !== newHotel.id)] } } : c));
  };

  const handleFlightSwap = (curationId: string, newFlight: Flight) => {
    setCurations(prev => prev.map(c => c.curationId === curationId ? { ...c, destination: { ...c.destination, flights: [newFlight, ...c.destination.flights.filter(f => f.id !== newFlight.id)] } } : c));
  };

  const handleBack = () => {
    const contextViews = ['experience-booking', 'booking', 'bundle-booking', 'flight-booking'];
    if (contextViews.includes(view)) setView('results');
    else setView('landing');
  };

  const handleGoHome = () => {
    setManualResultsCuration(null);
    setManualTripState(null);
    setActiveCurationId(null);
    setView('landing');
  };

  const currentPhase = LOADING_PHASES[loadingPhaseIdx];

  return (
    <div className="h-screen flex flex-col transition-colors duration-300 bg-transparent relative">
      <header className="fixed top-0 left-0 right-0 z-[110] glass-nav h-14 flex items-center">
        <div className="max-w-[1400px] mx-auto w-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {view !== 'landing' && view !== 'builder' && view !== 'manual-planner' && view !== 'manual-dashboard' && (
              <button onClick={handleBack} className="p-1.5 glass-pill text-slate-700 hover:text-red-650 dark:text-slate-200 rounded-lg transition-all">
                <ArrowLeft size={16} />
              </button>
            )}
            <button onClick={handleGoHome} className="flex items-center group h-8">
              <img
                src="/images/IDFC_First_Logo.png"
                alt="Logo"
                className="h-full w-auto object-contain transition-transform group-hover:scale-105"
              />
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-6 text-sm font-bold uppercase tracking-[0.1em]">
            <button onClick={handleGoHome} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${view === 'landing' && !manualResultsCuration ? 'text-red-500 glass-pill-active' : 'hover:text-red-500 glass-pill'}`}>
              <Home size={16} /> <span>Home</span>
            </button>
            <button onClick={() => { setView('my-bookings'); setBookingsCategory('itinerary'); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${view === 'my-bookings' && bookingsCategory !== 'concierge' ? 'text-red-500 glass-pill-active' : 'hover:text-red-500 glass-pill'}`}>
              <ShieldCheck size={16} /> <span>My Trips</span>
            </button>
            <button onClick={() => { setView('my-bookings'); setBookingsCategory('concierge'); }} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${view === 'my-bookings' && bookingsCategory === 'concierge' ? 'text-red-500 glass-pill-active' : 'hover:text-red-500 glass-pill'}`}>
              <Sparkles size={16} /> <span>Pre-Trip Concierge</span>
            </button>
          </div>



            {user ? (
              <div 
                className="relative flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500"
                onMouseEnter={() => setShowAccountPanel(true)}
                onMouseLeave={() => setShowAccountPanel(false)}
              >
                <div className="hidden sm:flex flex-col items-end leading-none">
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-0.5">Welcome back,</span>
                  <span className="text-xs font-black uppercase tracking-widest text-[#1a1a2e]">{user.name}</span>
                </div>
                <button className="relative group">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-200 shadow-md group-hover:scale-105 transition-transform">
                    <img src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-[#f8f7f4] rounded-full shadow-sm" />
                </button>

                {/* Account Hover Panel */}
                <AnimatePresence>
                  {showAccountPanel && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-2 w-64 glass-dropdown rounded-2xl p-4 z-[150] overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-[#9D1D27]" />
                      
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200">
                             <img src={user.avatar} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-[#1a1a2e] uppercase tracking-tight">{user.name}</span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase truncate max-w-[140px]">{user.email}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-red-500 transition-all text-xs font-bold uppercase tracking-widest">
                            <UserCircle size={16} />
                            <span>My Account</span>
                          </button>
                          
                          <div className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-all text-xs font-bold uppercase tracking-widest">
                            <div className="flex items-center gap-3">
                              <Sparkles size={16} />
                              <span>Dark Mode</span>
                            </div>
                            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                          </div>

                          <button 
                            onClick={handleResetPreference}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-red-500 transition-all text-xs font-bold uppercase tracking-widest"
                          >
                            <Briefcase size={16} />
                            <span>Reset Preference</span>
                          </button>
                        </div>

                        <div className="pt-2 border-t border-slate-200">
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-all text-xs font-black uppercase tracking-widest"
                          >
                            <X size={16} />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link 
                to="/signin"
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full glass-pill group transition-all hover:ring-2 hover:ring-red-600/30"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-slate-200 flex items-center justify-center bg-slate-100">
                  <UserCircle size={16} className="text-slate-500 group-hover:text-red-500 transition-colors" />
                </div>
                <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-slate-700">Sign In</span>
              </Link>
            )}
          </div>
      </header>

      <div className={`flex-1 flex flex-col overflow-hidden min-h-0 relative ${view === 'landing' ? 'h-full bg-transparent' : 'w-full px-4 sm:px-8 xl:px-12 py-4 sm:py-8 bg-transparent'}`}>
        <main className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden relative pt-14 ${['builder', 'manual-planner', 'manual-dashboard'].includes(view) || isLoadingAi || isLoadingManual ? 'flex items-center justify-center' : view === 'landing' ? 'h-full bg-transparent' : 'space-y-8 h-full max-w-[1920px] mx-auto w-full'}`}>
          <AnimatePresence>
            {(isLoadingAi || isLoadingManual) && (
              <motion.div
                key="ai-loading-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[120] bg-[#f8f7f4]/95 backdrop-blur-xl flex flex-col items-center justify-center py-24 gap-12 w-full text-center"
              >
                <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
                  <img
                    src="/images/IDFC_First_Logo.png"
                    alt="Loading"
                    className="w-full h-full object-contain"
                  />

                  <div className="absolute -top-4 -right-4 z-10 w-20 h-20 sm:w-24 sm:h-24 glass-card rounded-2xl sm:rounded-3xl flex items-center justify-center text-red-500 animate-pulse-glow">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentPhase.id}
                        initial={{ scale: 0, opacity: 0, rotate: -20 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0.5, opacity: 0, rotate: 20 }}
                        transition={{ type: "spring", damping: 12 }}
                      >
                        {React.createElement(currentPhase.icon, { className: "w-10 h-10 sm:w-12 sm:h-12", strokeWidth: 1.5 })}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <motion.h2
                      key={currentPhase.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[#1a1a2e] font-black text-2xl sm:text-4xl uppercase tracking-tighter"
                    >
                      {isLoadingManual ? 'Inventory Sourcing' : currentPhase.title}
                    </motion.h2>
                    <p className="text-slate-500 font-medium text-base sm:text-lg min-h-[1.75rem]">
                      {isLoadingManual ? 'Retrieving premium allocations...' : currentPhase.subtitle}
                    </p>
                  </div>

                  <div className="glass-card rounded-2xl px-6 py-3 font-mono text-[10px] text-slate-400 inline-flex items-center gap-3">
                    <motion.div
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="w-1.5 h-3 bg-red-600"
                    />
                    <span className="uppercase tracking-widest">{currentPhase.log}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-6 py-3 glass-pill-active rounded-full">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <img src="/images/IDFC_First_Logo.png" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-red-500">IDFC First Bank Travel Intelligence</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {view === 'landing' ? (
              <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                <ConversationalPlanner
                  user={user}
                  onGenerateTrip={handleGenerateAI}
                  onSyncCuration={handleSyncCuration}

                  initialCuration={manualResultsCuration}
                  viewMode={manualResultsCuration ? 'results-only' : 'conversational'}
                  onOpenManual={() => {
                    setManualResultsCuration(null); // Reset results when opening manual again
                    setManualTripState({
                      tripName: '',
                      source: 'Dubai',
                      destination: 'Italy',
                      fromDate: '',
                      toDate: '',
                      travelers: { adults: 1, children: 0 },
                      preferences: { airline: 'Any', hotelChain: 'Any', carRental: 'Any' },
                      notes: '',
                      selectedFlight: null,
                      selectedHotel: null,
                      selectedRoomType: null,
                      selectedActivities: [],
                      selectedEssentials: []
                    });
                    setView('manual-planner');
                  }}
                />
              </motion.div>
            ) : view === 'builder' ? (
              <motion.div key="builder" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full"><AITripBuilder onGenerate={handleGenerateAI} isLoading={isLoadingAi} /></motion.div>
            ) : view === 'manual-planner' ? (
              <motion.div key="manual-wizard" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full"><ManualPlannerWizard onStartBuilding={handleStartManualBuilding} onBack={() => setView('landing')} /></motion.div>
            ) : view === 'manual-dashboard' && manualTripState ? (
              <motion.div key="manual-dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full"><ManualBuildingDashboard tripData={manualTripState} onFinalize={handleManualFinalize} onUpdateCuration={handleUpdateManualCuration} onBackToWizard={() => setView('manual-planner')} /></motion.div>
            ) : view === 'my-curations' ? (
              <motion.div key="my-curations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full"><MyCurationsView curations={curations} onView={(id) => { setActiveCurationId(id); setView('results'); }} /></motion.div>
            ) : view === 'my-bookings' ? (
              <motion.div key="my-bookings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full"><MyBookingsView curations={curations} initialCategory={bookingsCategory} onBookEssentials={handleFinalizeBundle} onBundleComplete={handleBundleComplete} /></motion.div>
            ) : view === 'booking' && activeCuration ? (
              <motion.div key="booking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full"><HotelBookingView curation={activeCuration} initialStep={initialBookingStep} onBookingComplete={(details) => handleBookingComplete(activeCuration.curationId, details)} onHotelSwap={(hotel) => handleHotelSwap(activeCuration.curationId, hotel)} onBack={() => setView('results')} /></motion.div>
            ) : view === 'flight-booking' && activeCuration ? (
              <motion.div key="flight-booking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full"><FlightBookingView curation={activeCuration} flightAlternatives={activeFlightAlternatives} initialStep={initialBookingStep} onBookingComplete={(details) => handleFlightBookingComplete(activeCuration.curationId, details)} onFlightSwap={(flight) => handleFlightSwap(activeCuration.curationId, flight)} onBack={() => setView('results')} /></motion.div>
            ) : view === 'experience-booking' && activeCuration && selectedActivity ? (
              <motion.div key="exp-booking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full"><ExperienceBookingView curation={activeCuration} activity={selectedActivity} onComplete={handleExperienceBookingComplete} onBack={() => setView('results')} /></motion.div>
            ) : view === 'bundle-booking' && activeCuration ? (
              <motion.div key="bundle-booking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full"><BundleBookingView curation={activeCuration} essentials={selectedEssentials} onComplete={handleBundleComplete} onBack={() => setView('results')} /></motion.div>
            ) : view === 'results' && activeCuration ? (
              <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full"><AIResultsDashboard curation={activeCuration} onBookStay={(step) => handleOpenBooking(activeCuration.curationId, step)} onBookFlight={(step) => handleOpenFlightBooking(activeCuration.curationId, step)} onBookExperience={handleOpenExperienceBooking} onFinalizeBundle={handleFinalizeBundle} onHotelSwap={(hotel) => handleHotelSwap(activeCuration.curationId, hotel)} onFlightSwap={(flight) => handleFlightSwap(activeCuration.curationId, flight)} /></motion.div>
            ) : view === 'onboarding' && user ? (
              <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full">
                <OnboardingFlow userName={user.name} onComplete={handleOnboardingComplete} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DesktopApp;
