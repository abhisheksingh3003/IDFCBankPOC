import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane,
  Hotel as HotelIcon,
  Camera,
  Car,
  Wifi,
  Shield,
  Star,
  Clock,
  ChevronRight,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  Check,
  Trash2,
  Pencil,
  X,
  Coffee,
  User,
  Zap,
  Ticket as TicketIcon,
  Plus,
  FileText,
  Info,
  QrCode,
  Calendar,
  MapPin,
  RefreshCw,
  ChevronDown,
  LayoutGrid,
  TrendingUp,
  Award,
  ShieldCheck
} from 'lucide-react';
import { Destination, AIItinerary, Essential, Curation, Hotel, BookingStep, Activity, ExperienceBooking, Flight } from '../types';
import { ESSENTIALS, ESSENTIALS_CATALOG } from '../mockData';
import AIItineraryView from './AIItineraryView';
import FlightBookingView from './FlightBookingView';
import SafeImage from './SafeImage';

interface AIResultsDashboardProps {
  curation: Curation;
  onBookStay: (step: BookingStep) => void;
  onBookFlight: (step: BookingStep, alternatives?: Flight[]) => void;
  onBookExperience: (activity: Activity) => void;
  onFinalizeBundle: (essentials: Essential[], curationId?: string) => void;
  onHotelSwap: (hotel: Hotel) => void;
  onFlightSwap: (flight: Flight) => void;
}

const EssentialIconMap: Record<string, React.ElementType> = {
  Car: Car,
  Wifi: Wifi,
  Shield: Shield,
  Coffee: Coffee,
  User: User,
  Zap: Zap,
  Ticket: TicketIcon
};

const magicVariants = {
  hiddenTop: { opacity: 0, y: -60, filter: 'blur(20px)', scale: 0.95 },
  hiddenBottom: { opacity: 0, y: 60, filter: 'blur(20px)', scale: 0.95 },
  hiddenLeft: { opacity: 0, x: -80, filter: 'blur(20px)', scale: 0.95 },
  hiddenRight: { opacity: 0, x: 80, filter: 'blur(20px)', scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    filter: 'blur(0px)',
    scale: 1,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  }
};

const AIResultsDashboard: React.FC<AIResultsDashboardProps> = ({
  curation,
  onBookStay,
  onBookFlight,
  onBookExperience,
  onFinalizeBundle,
  onHotelSwap,
  onFlightSwap
}) => {
  const { destination, itinerary, travelers, status, curationId, hotelBooking, flightBooking, essentialsBooking, experienceBookings = [] } = curation;

  const [showMoreHotels, setShowMoreHotels] = useState(false);
  const [showMoreFlights, setShowMoreFlights] = useState(false);
  const [showMoreExperiences, setShowMoreExperiences] = useState(false);
  const [showMoreEssentials, setShowMoreEssentials] = useState(false);
  const [selectedHotelIndex, setSelectedHotelIndex] = useState(0);
  const [selectedFlightIndex, setSelectedFlightIndex] = useState(0);

  const activeHotel = destination.hotels[selectedHotelIndex] || destination.hotels[0];
  const selectedFlight = destination.flights[selectedFlightIndex] || destination.flights[0];

  const [localEssentials, setLocalEssentials] = useState<Essential[]>(essentialsBooking ? essentialsBooking.items : ESSENTIALS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showEssentialsVoucher, setShowEssentialsVoucher] = useState(false);
  const [selectedExpForVoucher, setSelectedExpForVoucher] = useState<ExperienceBooking | null>(null);
  const [showFlightTicket, setShowFlightTicket] = useState(false);
  const [localCuration, setLocalCuration] = useState<Curation>(curation);
  const [isConsensusSimulated, setIsConsensusSimulated] = useState(false);

  // Group Consensus Logic
  const handleSimulateConsensus = () => {
    const updatedItinerary = localCuration.itinerary.map(day => ({
      ...day,
      events: day.events.map(ev => ({
        ...ev,
        consensus: localCuration.familyMembers?.map(m => m.name) || ['Me']
      }))
    }));
    setLocalCuration({ ...localCuration, itinerary: updatedItinerary });
    setIsConsensusSimulated(true);
  };

  const divergentVibes = localCuration.familyMembers && localCuration.familyMembers.length > 1
    ? Array.from(new Set(localCuration.familyMembers.map(m => m.vibe)))
    : [];

  const mcLogoUrl = "/images/IDFC_First_Logo.png";

  const selectedActivities = destination.activities.slice(0, 4);
  const travelersCount = localCuration.familyMembers?.length || travelers;
  const totalCost = ((flightBooking?.price || selectedFlight.price) * travelersCount) + (hotelBooking?.totalPrice || activeHotel.pricePerNight * 3) + selectedActivities.reduce((acc, a) => acc + a.price, 0) + localEssentials.reduce((acc, e) => acc + e.price, 0);

  const handleDeleteEssential = (id: string) => {
    setLocalEssentials(prev => prev.filter(e => e.id !== id));
  };

  const handleUpdateVariant = (essentialId: string, variantId: string) => {
    const parentEssential = ESSENTIALS_CATALOG.find(e => e.id === essentialId);
    if (!parentEssential || !parentEssential.variants) return;
    const variant = parentEssential.variants.find(v => v.id === variantId);
    if (!variant) return;
    setLocalEssentials(prev => prev.map(e => e.id === essentialId ? { ...e, title: variant.title, price: variant.price, description: variant.description } : e));
    setEditingId(null);
  };

  const handleAddNewEssential = (newEssential: Essential) => {
    if (localEssentials.some(e => e.id === newEssential.id)) return;
    setLocalEssentials(prev => [...prev, newEssential]);
    setIsAdding(false);
  };

  const handleBookSelectedHotel = () => {
    if (hotelBooking) {
      onBookStay('success');
      return;
    }
    onHotelSwap(activeHotel);
    window.scrollTo(0, 0);
    onBookStay('details');
  };

  const handleBookSelectedFlight = (index: number) => {
    if (flightBooking) {
      onBookFlight('success');
      return;
    }
    const flight = destination.flights[index];
    onFlightSwap(flight);
    window.scrollTo(0, 0);
    onBookFlight('details', []);
  };

  return (
    <div className="w-full mx-auto max-w-[1600px] px-4 sm:px-8 py-4 sm:py-8 space-y-8 sm:space-y-12 pb-32">
      {/* Header Section */}
      <div className="relative">
        {/* IDFC First Bank LOGO WATERMARK */}
        <div className="absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] opacity-[0.035] dark:opacity-[0.02] pointer-events-none select-none z-0">
          <img src={mcLogoUrl} className="w-full h-full object-contain" alt="" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
          <motion.div initial="hiddenTop" animate="visible" variants={magicVariants}>
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <Sparkles size={20} />
              <span className="text-sm font-black uppercase tracking-[0.2em]">Curation Complete</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 dark:text-white">
              Your trip to <span className="text-red-600">{destination.name}</span>
            </h1>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status:</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${status === 'draft' ? 'text-slate-900 dark:text-white' : 'text-green-600'}`}>
                  {status === 'draft' ? 'Plan Drafted' : (status === 'fully_booked' ? 'Fully Secured' : 'Partially Booked')}
                </span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {curationId}</p>
            </div>
          </motion.div>

          <motion.div initial="hiddenRight" animate="visible" variants={magicVariants} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 text-left md:text-right min-w-full md:min-w-[240px]">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Estimated Cost</p>
            <p className="text-2xl sm:text-3xl font-black text-red-600">INR{totalCost.toLocaleString()}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-1">Includes flights, stays, and curated activities</p>
          </motion.div>
        </div>

        {/* FAMILY CONSENSUS BAR (Idea 5) */}
        {localCuration.familyMembers && localCuration.familyMembers.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 relative z-20 group"
          >
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden">
               {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl rounded-full" />
              
              <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex -space-x-3">
                    {localCuration.familyMembers.map((m, idx) => (
                      <div 
                        key={m.id} 
                        className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg shadow-lg relative"
                        title={`${m.name} (${m.vibe})`}
                      >
                        {m.vibe === 'Beach' ? '🏖️' : m.vibe === 'Mountains' ? '⛰️' : m.vibe === 'Culture' ? '🏛️' : m.vibe === 'Adventure' ? '🧗' : m.vibe === 'Relax' ? '🧘' : '🍜'}
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${isConsensusSimulated ? 'bg-green-500' : 'bg-slate-400'}`} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Family Consensus Engine</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                       {isConsensusSimulated 
                        ? <><CheckCircle2 size={12} className="text-green-500" /> All {localCuration.familyMembers.length} members agreed on the itinerary</>
                        : <><Clock size={12} /> {localCuration.familyMembers.length} profiles synthesized • Awaiting individual votes</>}
                    </p>
                  </div>
                </div>

                {divergentVibes.length > 1 && (
                  <div className="flex-1 max-w-md px-6 py-3 bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/30">
                    <div className="flex items-center gap-3 mb-1">
                      <Sparkles size={14} className="text-red-600" />
                      <span className="text-[10px] font-black text-red-600 uppercase tracking-widest italic">AI Mediation Active</span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                      "Synthesized {divergentVibes.join(' + ')} into a balanced route. Compromised Day 3 with a morning {divergentVibes[0]} and afternoon {divergentVibes[1]}."
                    </p>
                  </div>
                )}

                <button 
                  onClick={handleSimulateConsensus}
                  disabled={isConsensusSimulated}
                  className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${isConsensusSimulated 
                    ? 'bg-green-600 text-white cursor-default' 
                    : 'bg-red-600 text-white hover:bg-red-700 shadow-xl shadow-red-600/20'}`}
                >
                  {isConsensusSimulated ? 'Consensus Reached' : 'Simulate Group Approval'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* HOTELS SELECTION AREA */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20"><HotelIcon size={20} /></div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Premium Stays</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {hotelBooking ? 'Your luxury sanctuary is secured' : 'Select your preferred sanctuary'}
              </p>
            </div>
          </div>
          {!hotelBooking && (
            <button
              onClick={() => setShowMoreHotels(!showMoreHotels)}
              className="flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-red-600 transition-all border border-slate-100 dark:border-slate-700"
            >
              {showMoreHotels ? <><ChevronDown className="rotate-180" size={14} /> Show Less</> : <><LayoutGrid size={14} /> Load More Options</>}
            </button>
          )}
        </div>

        {hotelBooking ? (
          /* SECURED HOTEL VIEW */
          <motion.div initial="visible" variants={magicVariants} className="bg-white dark:bg-slate-900 rounded-3xl md:rounded-[40px] overflow-hidden shadow-2xl border-4 border-green-500/20 flex flex-col md:flex-row group relative">
            <div className="md:w-1/3 h-80 md:h-auto overflow-hidden relative">
              <SafeImage src={hotelBooking.imageUrl || activeHotel.imageUrl} className="w-full h-full object-cover" alt="Secured Hotel" category="hotel" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            </div>
            <div className="p-6 md:p-8 md:w-2/3 flex flex-col justify-between">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-green-600 mb-4">
                    <CheckCircle2 size={24} />
                    <span className="text-xs font-black uppercase tracking-widest">Stay Secured</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 leading-tight">{hotelBooking.hotelName || activeHotel.name}</h3>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-6">Room: {hotelBooking.roomType || 'Premium Deluxe'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Confirmation Ref</p>
                  <p className="text-2xl font-mono font-black text-red-600">{hotelBooking.bookingRef}</p>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">INR{hotelBooking.totalPrice}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">total 3 nights invested</p>
                </div>
                <button onClick={handleBookSelectedHotel} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95">View Voucher</button>
              </div>
            </div>
            <div className="absolute top-6 right-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <HotelIcon size={120} />
            </div>
          </motion.div>
        ) : (
          /* STANDARD HOTEL SELECTION GRID (3-Card Row) */
          <>
            <motion.div
              initial="visible"
              variants={magicVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {destination.hotels.slice(0, 3).map((h, idx) => (
                <motion.div
                  key={h.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`bg-white dark:bg-slate-900 rounded-3xl md:rounded-[40px] overflow-hidden border transition-all duration-300 group ${selectedHotelIndex === idx ? 'border-red-600 shadow-xl ring-2 ring-red-600/20' : 'border-slate-100 dark:border-slate-800 shadow-lg hover:shadow-2xl'}`}
                >
                  <div className="h-48 overflow-hidden relative">
                    <SafeImage src={h.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={h.name} category="hotel" />
                    <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 p-2 rounded-xl text-[10px] font-black flex items-center gap-1 shadow-sm">
                      <Star size={12} className="text-yellow-400" fill="currentColor" /> {h.rating}
                    </div>
                    {h.isVerified && (
                      <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-2 border border-white/20">
                        <ShieldCheck size={12} className="text-red-500" />
                        IDFC First Bank Verified
                      </div>
                    )}
                    {!h.isVerified && idx === 0 && (
                      <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-2">
                        <Award size={12} /> Top Pick
                      </div>
                    )}
                  </div>
                  <div className="p-6 sm:p-8 flex flex-col h-[calc(100%-12rem)] justify-between">
                    <div>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-tight line-clamp-2">{h.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 italic mb-4">"{h.description}"</p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {h.amenities?.slice(0, 2).map(a => (
                          <span key={a} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-500">{a}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50 dark:border-slate-800">
                      <div>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">INR{h.pricePerNight * 3}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">3 nights</p>
                      </div>
                      <button
                        onClick={() => { setSelectedHotelIndex(idx); handleBookSelectedHotel(); }}
                        className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:bg-red-600 hover:text-white shadow-lg active:scale-95"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}

        {/* Expanded Hotels Grid */}
        <AnimatePresence>
          {showMoreHotels && !hotelBooking && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-visible pt-8 pb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {destination.hotels.slice(3, 9).map((h, idx) => (
                  <motion.div key={h.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }} className="bg-white dark:bg-slate-900 rounded-[40px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xl group">
                    <div className="h-48 overflow-hidden relative"><SafeImage src={h.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" category="hotel" /><div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 p-2 rounded-xl text-[10px] font-black flex items-center gap-1"><Star size={12} className="text-yellow-400" fill="currentColor" /> {h.rating}</div></div>
                    <div className="p-8">
                      <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 leading-tight">{h.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic mb-6">"{h.description}"</p>
                      <div className="flex items-center justify-between"><p className="text-2xl font-black text-slate-900 dark:text-white">INR{h.pricePerNight * 3}</p><button onClick={() => { setSelectedHotelIndex(idx + 3); window.scrollTo(0, 0); }} className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:bg-red-600 hover:text-white transition-all"><RefreshCw size={18} /></button></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* FLIGHTS SELECTION AREA */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg"><Plane size={20} /></div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Travel Connections</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {flightBooking ? 'Your premium flight is secured' : 'Optimized for comfort and efficiency'}
              </p>
            </div>
          </div>
          {!flightBooking && (
            <button
              onClick={() => setShowMoreFlights(!showMoreFlights)}
              className="flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-red-600 transition-all border border-slate-100 dark:border-slate-700"
            >
              {showMoreFlights ? <><ChevronDown className="rotate-180" size={14} /> Show Less</> : <><LayoutGrid size={14} /> Load More Options</>}
            </button>
          )}
        </div>

        {flightBooking ? (
          /* SECURED FLIGHT VIEW */
          <motion.div initial="visible" variants={magicVariants} className="bg-white dark:bg-slate-900 rounded-3xl md:rounded-[40px] p-6 sm:p-10 shadow-2xl border-4 border-green-500/20 flex flex-col md:flex-row items-center gap-6 sm:gap-10 group relative">
            <div className="flex flex-col items-center md:items-start min-w-[160px] gap-2">
              <div className="w-16 h-16 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:scale-105 transition-transform">
                <SafeImage src={flightBooking.airlineLogo || selectedFlight.airlineLogo} className="w-full h-full object-contain" alt="Airline" category="flight" />
              </div>
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{flightBooking.airline || selectedFlight.airline}</p>
            </div>

            <div className="flex-1 flex flex-col md:flex-row items-center justify-between w-full md:w-auto px-0 md:px-8 border-y md:border-y-0 md:border-x border-slate-100 dark:border-slate-800 py-6 md:py-0 gap-8">
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <ShieldCheck size={18} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Connection Secured</span>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-2">
                  {flightBooking.departureTime || selectedFlight.departureTime} – {flightBooking.arrivalTime || selectedFlight.arrivalTime}
                </p>
                <p className="text-xs font-bold text-slate-400">
                  <span className="text-red-600 uppercase font-black">{flightBooking.originIata || selectedFlight.originIata}</span> — <span className="text-red-600 uppercase font-black">{flightBooking.destinationIata || selectedFlight.destinationIata}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Confirmation</p>
                <p className="text-2xl font-mono font-black text-slate-900 dark:text-white">{flightBooking.bookingRef}</p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 min-w-[160px]">
              <div className="text-right">
                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">INR{flightBooking.price}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{flightBooking.duration || selectedFlight.duration} • Direct</p>
              </div>
              <button
                onClick={() => handleBookSelectedFlight(0)}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 w-full py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg active:scale-95"
              >
                View Ticket
              </button>
            </div>
            <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <Plane size={140} />
            </div>
          </motion.div>
        ) : (
          /* STANDARD FLIGHT SELECTION LIST (3-Card Row) */
          <>
            <motion.div
              initial="visible"
              variants={magicVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {destination.flights.slice(0, 3).map((f, idx) => (
                <div key={f.id} className={`group bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl md:rounded-[36px] border transition-all flex flex-col justify-between gap-6 hover:shadow-2xl relative overflow-hidden ${selectedFlightIndex === idx ? 'border-red-600 shadow-xl ring-2 ring-red-600/20' : 'border-slate-100 dark:border-slate-800'}`}>
                  {f.isVerified && (
                    <div className="absolute top-0 right-8 bg-slate-900 text-white px-3 py-1 rounded-b-xl text-[8px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5 border-x border-b border-white/10">
                      <ShieldCheck size={10} className="text-red-500" />
                      IDFC First Bank Verified
                    </div>
                  )}
                  {idx === 0 && <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />}

                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-14 h-14 p-2 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
                        <SafeImage src={f.airlineLogo} className="w-full h-full object-contain" alt="" category="flight" />
                      </div>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full font-black uppercase tracking-widest">{f.duration}</span>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="text-center">
                          <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{f.departureTime}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{f.originIata || 'DXB'}</p>
                        </div>
                        <div className="flex-1 px-4 opacity-20"><div className="h-[1px] bg-slate-500 relative"><Plane size={14} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90" /></div></div>
                        <div className="text-center">
                          <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{f.arrivalTime}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{f.destinationIata || 'CDG'}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{f.airline}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-6">
                    <div>
                      <p className="text-xl font-black text-slate-900 dark:text-white">INR{f.price}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Direct</p>
                    </div>
                    <button
                      onClick={() => handleBookSelectedFlight(idx)}
                      className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all shadow-md active:scale-95"
                    >
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          </>
        )
        }

        {/* Expanded Flights Grid */}
        <AnimatePresence>
          {showMoreFlights && !flightBooking && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-visible pt-8 pb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {destination.flights.slice(3, 9).map((f, idx) => (
                  <motion.div key={f.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 group-hover:scale-105 transition-transform"><SafeImage src={f.airlineLogo} className="w-full h-full object-contain" alt="" category="flight" /></div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white text-sm">{f.departureTime} - {f.arrivalTime}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{f.airline}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="text-xl font-black text-slate-900 dark:text-white leading-none">INR{f.price}</p>
                      <button onClick={() => handleBookSelectedFlight(idx + 3)} className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline leading-none">Select Option</button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* REMAINDER OF THE DASHBOARD: Experiences & Essentials (Separated into full-width sections) */}
      <div className="space-y-16">
        {/* Experiences */}
        <motion.div initial="hiddenBottom" animate="visible" variants={magicVariants} transition={{ delay: 0.7 }} className="w-full">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Elite Experiences</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Hand-picked by IDFC First Bank Intelligence</p>
            </div>
            <button onClick={() => setShowMoreExperiences(!showMoreExperiences)} className="flex items-center gap-2 px-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-red-600 transition-all border border-slate-100 dark:border-slate-700">
              {showMoreExperiences ? <><ChevronDown className="rotate-180" size={14} /> Show Less</> : <><LayoutGrid size={14} /> See Full Portfolio</>}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(showMoreExperiences ? destination.activities : selectedActivities.slice(0, 3)).map((act) => {
              const booking = experienceBookings.find(b => b.activityId === act.id);
              return (
                <div key={act.id} className={`group flex flex-col rounded-3xl md:rounded-[32px] overflow-hidden transition-all border ${booking ? 'bg-green-50/70 dark:bg-green-900/10 border-green-600' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:shadow-xl'}`}>
                  <div className="h-48 overflow-hidden relative">
                    <SafeImage src={act.imageUrl} alt={act.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" category={act.category?.toLowerCase() === 'dining' ? 'dining' : 'activity'} />
                    {booking && <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-md">Secured</div>}
                    <div className="absolute bottom-4 left-4 flex gap-2">
                      <span className="bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1"><Clock size={10} /> {act.duration}</span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1 justify-between">
                    <div>
                      <h5 className={`font-black text-lg mb-2 leading-tight ${booking ? 'text-green-800 dark:text-green-400' : 'text-slate-900 dark:text-white group-hover:text-red-600 transition-colors'}`}>{act.name}</h5>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4 text-red-600">{act.category}</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                      <p className={`text-xl font-black ${booking ? 'text-green-700 dark:text-green-400' : 'text-slate-900 dark:text-white'}`}>INR{act.price}</p>
                      <button
                        onClick={() => booking ? setSelectedExpForVoucher(booking) : onBookExperience(act)}
                        className={`text-[10px] font-black uppercase px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap ${booking ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-red-600 hover:text-white'}`}
                      >
                        {booking ? 'E-Ticket' : 'Book Now'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Essentials */}
        <motion.div initial="hiddenBottom" animate="visible" variants={magicVariants} transition={{ delay: 0.8 }} className="w-full bg-slate-900 dark:bg-slate-800 rounded-[40px] p-10 shadow-2xl border border-slate-800 dark:border-slate-700 text-white">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter">Trip Essentials</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Travel Smart & Secure</p>
            </div>
            {essentialsBooking ? <div className="flex items-center gap-2 text-green-500"><CheckCircle2 size={18} /><span className="text-[10px] font-black uppercase tracking-widest">Bundle Secured</span></div> : <button onClick={() => setIsAdding(true)} className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition-all flex items-center gap-2 group/add"><Plus size={18} className="group-hover/add:rotate-90 transition-transform" /><span className="text-[10px] font-black uppercase tracking-widest pr-1">Add</span></button>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {localEssentials.slice(0, showMoreEssentials ? undefined : 3).map((ess) => {
                const IconComponent = EssentialIconMap[ess.icon] || Sparkles;
                return (
                  <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} key={ess.id} className="flex flex-col justify-between p-6 bg-white/5 hover:bg-white/10 rounded-[32px] border border-white/5 transition-colors group h-full">
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/20 group-hover:scale-110 transition-transform"><IconComponent size={24} /></div>
                      <div>
                        <p className="font-bold text-lg text-white mb-1">{ess.title}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black line-clamp-2">{ess.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                      <p className="font-black text-xl text-red-50">INR{ess.price}</p>
                      {!essentialsBooking && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditingId(ess.id)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"><Pencil size={16} /></button>
                          <button onClick={() => handleDeleteEssential(ess.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={16} /></button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="mt-8 flex justify-center">
            {localEssentials.length > 3 && (
              <button onClick={() => setShowMoreEssentials(!showMoreEssentials)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white flex items-center gap-2 transition-all">
                {showEssentialsVoucher ? null : (showMoreEssentials ? 'Show Less' : `Show ${localEssentials.length - 3} More`)}
              </button>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-white/10">
            {essentialsBooking ? <button onClick={() => setShowEssentialsVoucher(true)} className="w-full bg-white text-slate-900 hover:bg-red-600 hover:text-white py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3">View Master Bundle <FileText size={18} /></button> : <button onClick={() => onFinalizeBundle(localEssentials, curationId)} className="w-full max-w-sm mx-auto bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"><ShoppingBag size={16} />Finalize Bundle</button>}
          </div>

          <AnimatePresence>
            {editingId && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/98 backdrop-blur-md rounded-[40px] z-30 p-10 flex flex-col">
                <div className="flex items-center justify-between mb-8"><div><h4 className="text-xl font-black uppercase tracking-widest">Select Provider</h4><p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Options for {localEssentials.find(e => e.id === editingId)?.category}</p></div><button onClick={() => setEditingId(null)} className="p-2 text-slate-400 hover:text-white"><X size={28} /></button></div>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
                  {ESSENTIALS_CATALOG.find(e => e.id === editingId)?.variants?.map((v) => (
                    <button key={v.id} onClick={() => handleUpdateVariant(editingId, v.id)} className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-red-600 rounded-3xl transition-all group/opt border border-white/5"><div className="text-left"><p className="font-black text-white text-lg">{v.title}</p><p className="text-[10px] text-slate-500 group-hover/opt:text-red-100 uppercase font-bold tracking-widest">{v.description}</p></div><div className="text-right"><p className="font-black text-red-50 group-hover/opt:text-white">INR{v.price}</p></div></button>
                  ))}
                </div>
              </motion.div>
            )}
            {isAdding && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/98 backdrop-blur-md rounded-[40px] z-30 p-10 flex flex-col">
                <div className="flex items-center justify-between mb-8"><div><h4 className="text-xl font-black uppercase tracking-widest">Add Essential</h4><p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Expand your trip bundle</p></div><button onClick={() => setIsAdding(false)} className="p-2 text-slate-400 hover:text-white"><X size={28} /></button></div>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
                  {ESSENTIALS_CATALOG.filter(cat => !localEssentials.some(le => le.id === cat.id)).map((cat) => {
                    const CatIcon = EssentialIconMap[cat.icon] || Sparkles;
                    return (
                      <button key={cat.id} onClick={() => handleAddNewEssential(cat)} className="w-full flex items-center justify-between p-6 bg-white/5 hover:bg-red-600 rounded-3xl transition-all border border-white/5"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center"><CatIcon size={24} className="text-slate-400 group-hover:text-white" /></div><div className="text-left"><p className="font-black text-white text-lg">{cat.title}</p><p className="text-[10px] text-slate-500 group-hover:text-red-100 uppercase font-bold tracking-widest">{cat.description}</p></div></div><div className="text-right"><p className="font-black text-red-50 group-hover:text-white">INR{cat.price}</p></div></button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div >
      </div >

      {/* MAGIC AI ITINERARY VISUALIZATION */}
      <motion.div initial="hiddenBottom" animate="visible" variants={magicVariants} transition={{ delay: 0.9 }}>
        <AIItineraryView itinerary={localCuration.itinerary} />
      </motion.div>

      {/* MODALS & PORTALS */}
      <AnimatePresence>
        {
          showFlightTicket && flightBooking && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFlightTicket(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl border border-slate-100 dark:border-slate-800">
                <button onClick={() => setShowFlightTicket(false)} className="absolute top-8 right-8 z-[210] p-3 bg-white/10 hover:bg-red-600 rounded-full text-white transition-colors"><X size={24} /></button>
                <FlightBookingView curation={curation} initialStep="success" onBookingComplete={() => { }} onFlightSwap={() => { }} onBack={() => setShowFlightTicket(false)} />
              </motion.div>
            </div>
          )
        }

        {
          selectedExpForVoucher && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedExpForVoucher(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                <div className="h-48 relative">
                  <img src={destination.activities.find(a => a.id === selectedExpForVoucher.activityId)?.imageUrl} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center"><h3 className="text-4xl font-black text-white">{selectedExpForVoucher.activityName}</h3></div>
                  <button onClick={() => setSelectedExpForVoucher(null)} className="absolute top-6 right-6 p-2 bg-white/10 text-white hover:bg-red-600 rounded-full transition-colors"><X size={24} /></button>
                </div>
                <div className="p-10 space-y-10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Confirmation</p><p className="font-black text-slate-900 dark:text-white">{selectedExpForVoucher.bookingRef}</p></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p><p className="font-black text-slate-900 dark:text-white">{selectedExpForVoucher.date}</p></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Slot</p><p className="font-black text-slate-900 dark:text-white">{selectedExpForVoucher.time}</p></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Travellers</p><p className="font-black text-slate-900 dark:text-white">{travelers}</p></div>
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-8 bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-700"><div className="p-4 bg-white rounded-2xl shadow-xl"><QrCode size={100} className="text-slate-900" /></div><div className="flex-1 space-y-4"><h4 className="font-black text-slate-900 dark:text-white flex items-center gap-2"><MapPin size={18} className="text-red-600" /> Redemption Point</h4><p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">"Present this voucher at the main entrance 15 minutes prior to your selected slot."</p></div></div>
                  <button onClick={() => setSelectedExpForVoucher(null)} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-2xl font-black text-lg">Close Voucher</button>
                </div>
              </motion.div>
            </div>
          )
        }

        {
          showEssentialsVoucher && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEssentialsVoucher(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800">
                <div className="p-10 space-y-10">
                  <div className="flex justify-between items-start"><div className="space-y-2"><h3 className="text-3xl font-black text-slate-900 dark:text-white">Bundle Details</h3><p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Confirmation: {essentialsBooking?.bookingRef}</p></div><button onClick={() => setShowEssentialsVoucher(false)} className="p-2 text-slate-400 hover:text-red-600 transition-colors"><X size={32} /></button></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="space-y-6"><h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Included Services</h4><div className="space-y-3">{essentialsBooking?.items.map(item => (<div key={item.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700"><div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white"><Check size={20} /></div><div><p className="text-sm font-black text-slate-900 dark:text-white">{item.title}</p><p className="text-[10px] text-slate-500 font-bold uppercase">{item.description}</p></div></div>))}</div></div><div className="bg-slate-900 rounded-[32px] p-8 text-white flex flex-col items-center justify-center text-center space-y-6"><div className="p-4 bg-white rounded-3xl shadow-2xl"><QrCode size={120} className="text-slate-900" /></div><div><p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Master Activation Key</p><p className="text-2xl font-mono font-black text-red-500">{essentialsBooking?.bookingRef.slice(0, 8)}</p></div></div></div>
                  <button onClick={() => setShowEssentialsVoucher(false)} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-3xl font-black text-lg">Dismiss</button>
                </div>
              </motion.div>
            </div>
          )
        }
      </AnimatePresence>
    </div>
  );
};

export default AIResultsDashboard;