import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Plane, Check, ChevronLeft, CreditCard,
  User, Mail, Phone, Calendar, Loader2, PartyPopper,
  Sparkles, Search, ArrowRight, Download, Info,
  Receipt, Hash, Clock, MapPin, Ticket, ChevronRight,
  ChevronDown, Zap, Tag, ShieldCheck, Briefcase, Fingerprint,
  AlertCircle, Luggage, ShoppingBag, Star, RefreshCw
} from 'lucide-react';
import { Flight, BookingStep, Curation } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import BookingLayout from './booking/BookingLayout';
import BookingSection from './booking/BookingSection';
import SummaryCard from './booking/SummaryCard';
import PaymentGateway from './PaymentGateway';
import SafeImage from './SafeImage';

interface FlightBookingViewProps {
  curation: Curation;
  initialStep?: BookingStep;
  flightAlternatives?: Flight[];
  preSelectedFlight?: Flight;
  onBookingComplete: (bookingDetails: any) => void;
  onFlightSwap: (newFlight: Flight) => void;
  onBack: () => void;
}

const FlightBookingView: React.FC<FlightBookingViewProps> = ({
  curation,
  initialStep = 'details',
  flightAlternatives = [],
  preSelectedFlight,
  onBookingComplete,
  onFlightSwap,
  onBack
}) => {
  const [step, setStep] = useState<BookingStep>(initialStep);
  const flightPool = flightAlternatives.length > 0 ? flightAlternatives : curation.destination.flights;
  const [selectedFlight, setSelectedFlight] = useState<Flight>(preSelectedFlight || flightPool[0]);
  const [activeDetailTab, setActiveDetailTab] = useState<'itinerary' | 'fare'>('itinerary');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [filterTab, setFilterTab] = useState<'cheapest' | 'fastest'>('cheapest');

  const [passengers, setPassengers] = useState(
    Array.from({ length: curation.travelers }, (_, i) => ({
      id: i,
      name: i === 0 ? 'Alex Johnson' : '',
      email: i === 0 ? 'alex.j@example.com' : '',
      passport: i === 0 ? `P${Math.floor(10000000 + Math.random() * 90000000)}` : ''
    }))
  );

  const steps: { key: BookingStep; label: string }[] = [
    { key: 'details', label: 'Details' },
    { key: 'guests', label: 'Passengers' },
    { key: 'review', label: 'Review' },
    { key: 'payment', label: 'Payment' },
    { key: 'success', label: 'Ticket' }
  ];

  const calculatedTotal = selectedFlight ? selectedFlight.price * curation.travelers : 0;
  const originCity = curation.origin || 'Dubai';
  const destCity = curation.destination.name;
  const originIata = selectedFlight?.originIata || 'DXB';
  const destIata = selectedFlight?.destinationIata || 'DXB';

  if (!selectedFlight) return <div className="p-8 text-center text-white">No flight selected.</div>;

  const handlePassengerChange = (index: number, field: string, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
      onBookingComplete({
        flightId: selectedFlight.id,
        bookingRef: `FL-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        price: calculatedTotal,
        airline: selectedFlight.airline,
        airlineLogo: selectedFlight.airlineLogo,
        departureTime: selectedFlight.departureTime,
        arrivalTime: selectedFlight.arrivalTime,
        duration: selectedFlight.duration,
        travelClass: 'First Class',
        originIata,
        destinationIata: destIata
      });
    }, 2000);
  };

  const handleSwap = (flight: Flight) => {
    setSelectedFlight(flight);
    onFlightSwap(flight);
    setStep('details');
  };

  /* PDF Generation */
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const input = document.getElementById('ticket-pdf-template');
      if (input) {
        const canvas = await html2canvas(input, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true,
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a5'
        });
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Mastercard-Flight-Ticket-${curation.curationId}.pdf`);
      }
    } catch (error) {
      console.error("PDF Generation failed", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const navigationBack = () => {
    if (step === 'details') onBack();
    else if (step === 'search') setStep('details');
    else if (step === 'guests') setStep('details');
    else if (step === 'review') setStep('guests');
    else if (step === 'payment') setStep('review');
  };

  // Helper for footer content based on step
  const renderFooter = () => {
    if (step === 'success') return null;

    return (
      <div className="flex items-center justify-between w-full">
        <div>
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Total Due</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">AED {calculatedTotal.toLocaleString()}</p>
        </div>

        {step === 'details' && (
          <button
            onClick={() => setStep('guests')}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            Continue <ArrowRight size={18} />
          </button>
        )}

        {step === 'guests' && (
          <button
            onClick={() => setStep('review')}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            Review <ArrowRight size={18} />
          </button>
        )}

        {step === 'review' && (
          <button
            onClick={() => setStep('payment')}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            Go to Pay <CreditCard size={18} />
          </button>
        )}

        {step === 'payment' && (
          // PaymentGateway handles its own actions
          null
        )}
      </div>
    );
  };

  const stepIndex = steps.findIndex(s => s.key === step) + 1;

  return (
    <BookingLayout
      title={step === 'search' ? 'Available Flights' : step === 'success' ? 'Flight Confirmed' : `Booking: ${originIata} to ${destIata}`}
      subtitle={step === 'success' ? 'Your ticket is ready' : `${curation.travelers} Traveler(s) • Business Class`}
      onBack={step === 'success' ? undefined : navigationBack}
      footer={renderFooter()}
      currentStep={stepIndex}
      totalSteps={steps.length}
    >
      <AnimatePresence mode="wait">
        {step === 'search' && (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Header Content */}
            <div className="flex items-end justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
              <div className="space-y-1">
                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Available Flights</h3>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {originIata} <ArrowRight size={10} className="inline-block mx-1 mb-0.5" /> {destIata} • {curation.travelers} traveler{curation.travelers > 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                  {flightPool.length} Options
                </span>
                {/* Sort Tabs - Modern Pill Style */}
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                  {(['cheapest', 'fastest'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setFilterTab(tab)}
                      className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${filterTab === tab
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Flight Cards - Elevated Style */}
            <div className="space-y-4">
              {[...flightPool]
                .sort((a, b) => filterTab === 'cheapest' ? a.price - b.price : parseFloat(a.duration) - parseFloat(b.duration))
                .map((flight, idx) => {
                  const isSelected = selectedFlight.id === flight.id;
                  const durationHours = parseFloat(flight.duration);
                  const isDirect = durationHours <= 3;
                  const cheapest = idx === 0 && filterTab === 'cheapest';

                  return (
                    <motion.div
                      key={flight.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleSwap(flight)}
                      className={`group relative bg-white dark:bg-slate-900 rounded-[28px] p-1 border-2 transition-all duration-300 cursor-pointer overflow-hidden ${isSelected
                        ? 'border-red-600 ring-4 ring-red-600/10 shadow-xl'
                        : 'border-slate-50 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-900/40 hover:shadow-lg'
                        }`}
                    >
                      <div className="flex items-stretch gap-0">
                        {/* Main Info */}
                        <div className="flex-1 p-6 flex items-center justify-between">
                          {/* Airline */}
                          <div className="flex flex-col gap-3 w-32">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white p-2.5 shadow-inner">
                              <SafeImage src={flight.airlineLogo} alt="" className="w-full h-full object-contain" category="flight" />
                            </div>
                            <div>
                              <p className="text-base font-black text-slate-900 dark:text-white leading-tight">{flight.airline}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{flight.id}</p>
                            </div>
                          </div>

                          {/* Connection Visualization */}
                          <div className="flex-1 flex items-center justify-center gap-6 px-4">
                            <div className="text-right">
                              <p className="text-2xl font-black text-slate-900 dark:text-white">{flight.departureTime.split(' ')[0]}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{originIata}</p>
                            </div>

                            <div className="flex-1 max-w-[140px] flex flex-col items-center gap-2">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{flight.duration}</span>
                              <div className="relative w-full h-px bg-slate-100 dark:bg-slate-800">
                                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                                <Plane size={14} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500/30 rotate-90" />
                                {isSelected && <motion.div layoutId="flight-line" className="absolute inset-0 bg-red-600" />}
                              </div>
                              <span className={`text-[10px] font-black uppercase tracking-widest ${isDirect ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {isDirect ? 'Non-stop' : '1 Stop via CDG'}
                              </span>
                            </div>

                            <div className="text-left">
                              <p className="text-2xl font-black text-slate-900 dark:text-white">{flight.arrivalTime.split(' ')[0]}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{destIata}</p>
                            </div>
                          </div>
                        </div>

                        {/* Price Sidebar */}
                        <div className={`w-40 flex flex-col justify-center items-center p-6 border-l transition-colors ${isSelected ? 'border-red-100 bg-red-50 dark:bg-red-900/10' : 'border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 group-hover:bg-red-50/30 dark:group-hover:bg-red-900/5'}`}>
                          <div className="text-center mb-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Per Adult</span>
                            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">AED {flight.price.toLocaleString()}</p>
                          </div>
                          <button className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSelected
                            ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:border-red-600/50'
                            }`}>
                            {isSelected ? 'Selected' : 'Select'}
                          </button>
                        </div>
                      </div>

                      {/* Top Badges */}
                      {cheapest && (
                        <div className="absolute top-0 right-40 translate-x-1/2 -translate-y-full group-hover:translate-y-0 transition-transform bg-emerald-500 text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-b-xl shadow-lg">
                          Best Value
                        </div>
                      )}
                      
                      {/* Bottom Info Bar */}
                      <div className="flex items-center gap-6 px-6 py-3 bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-50 dark:border-slate-800/50">
                        <div className="flex items-center gap-1.5">
                          <Zap size={12} className="text-amber-500" />
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Extra Legroom</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check size={12} className="text-emerald-500" />
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Free Cancellation</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Tag size={12} className="text-red-500" />
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Verified Fare</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          </motion.div>
        )}

        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <SummaryCard
              imageUrl="keyword:modern-airplane-cabin-luxury"
              title={`${originCity} to ${destCity}`}
              subtitle={`${selectedFlight.airline} • Premium Fleet`}
              category="flight"
              price={selectedFlight.price}
              details={[
                { label: 'Outbound', value: selectedFlight.departureTime, icon: Clock },
                { label: 'Total Time', value: selectedFlight.duration, icon: Clock },
                { label: 'Equipment', value: 'Airbus A350-1000', icon: Plane },
                { label: 'Service', value: 'Business Class', icon: Star }
              ]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <BookingSection title="Flight Itinerary">
                  <div className="relative pl-8 pr-4 py-4 space-y-12">
                    {/* Visual Line - Gradient */}
                    <div className="absolute left-[39px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-red-600 via-slate-200 to-slate-900" />

                    {/* Origin */}
                    <div className="flex gap-8 relative group">
                      <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-950 border-4 border-red-600 z-10 mt-1 shadow-[0_0_15px_rgba(220,38,38,0.2)] transition-transform group-hover:scale-110" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{selectedFlight.departureTime}</p>
                          <span className="text-[10px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">T3 • GATE 12</span>
                        </div>
                        <p className="text-xs font-black text-red-600 uppercase tracking-[0.2em] mb-2">{originCity} ({originIata})</p>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">Dubai International Airport</p>
                      </div>
                    </div>

                    {/* Middle Info / Transit */}
                    <div className="flex gap-8 relative group py-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center z-10 mt-1 border-2 border-white dark:border-slate-950 transition-transform group-hover:rotate-12">
                        <Plane size={12} className="text-slate-400" />
                      </div>
                      <div className="flex-1 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 p-4 rounded-2xl flex items-center justify-between group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                        <div className="flex items-center gap-4">
                          <SafeImage src={selectedFlight.airlineLogo} className="w-8 h-8 object-contain bg-white p-1 rounded-lg" alt="" category="flight" />
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedFlight.airline}</p>
                            <p className="text-[10px] font-bold text-slate-400 tracking-wide">{selectedFlight.duration} • Flight LO-102</p>
                          </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/50 dark:bg-slate-900/50 rounded-xl">
                          <Zap size={10} className="text-amber-500" />
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">In-flight Wi-Fi</span>
                        </div>
                      </div>
                    </div>

                    {/* Arrival */}
                    <div className="flex gap-8 relative group">
                      <div className="w-6 h-6 rounded-full bg-slate-900 dark:bg-white border-4 border-slate-900 dark:border-white z-10 mt-1 shadow-lg transition-transform group-hover:scale-110" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{selectedFlight.arrivalTime}</p>
                          <span className="text-[10px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">MAIN TERM.</span>
                        </div>
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-2">{destCity} ({destIata})</p>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">International Airport</p>
                      </div>
                    </div>
                  </div>
                </BookingSection>
              </div>

              <div className="space-y-6">
                <BookingSection title="Fare Features">
                  <div className="space-y-5 py-2">
                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white shadow-sm">
                        <Luggage size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Baggage</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">2x 32kg Check-in</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white shadow-sm">
                        <RefreshCw size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Flexible</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Free changes allowed</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white shadow-sm">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protected</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Full refund if cancelled</p>
                      </div>
                    </div>
                  </div>
                </BookingSection>

                <div className="bg-red-600 p-6 rounded-[28px] text-white space-y-4 shadow-xl shadow-red-600/20 relative overflow-hidden group">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                  <div className="flex items-center gap-3">
                    <Sparkles className="text-white/80" size={20} />
                    <h4 className="text-xs font-black uppercase tracking-widest">Premium Service</h4>
                  </div>
                  <p className="text-sm font-medium leading-relaxed opacity-90">Enjoy lounge access and priority boarding included with your Business Class ticket.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'guests' && (
          <motion.div
            key="guests"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Elegant Info Box */}
            <div className="bg-slate-900 dark:bg-slate-800 p-6 rounded-[28px] flex items-start gap-4 border border-slate-800 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-full bg-red-600/10 skew-x-12 translate-x-16" />
              <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-600/20">
                <ShieldCheck size={24} />
              </div>
              <div className="space-y-1 relative z-10">
                <p className="text-lg font-black text-white tracking-tight">Travel Documents Required</p>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">Please ensure passenger names match their government-issued ID exactly to avoid boarding issues.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {passengers.map((passenger, idx) => (
                <div key={idx} className="group bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-8 space-y-8 transition-all hover:shadow-2xl hover:border-red-100 dark:hover:border-red-900/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 group-hover:text-red-600 transition-colors">
                        <User size={24} />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Traveler {idx + 1}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{idx === 0 ? 'Primary Passenger' : 'Additional Guest'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Legal Full Name</label>
                      <div className="relative group/input">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-red-600 transition-colors">
                          <Fingerprint size={18} />
                        </div>
                        <input
                          type="text"
                          value={passenger.name}
                          onChange={(e) => handlePassengerChange(idx, 'name', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 pl-12 pr-6 py-4 rounded-2xl border border-transparent focus:border-red-600/30 focus:bg-white dark:focus:bg-slate-800 outline-none font-bold text-slate-900 dark:text-white transition-all shadow-inner"
                          placeholder="As shown on Passport"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Contact Email</label>
                      <div className="relative group/input">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-red-600 transition-colors">
                          <Mail size={18} />
                        </div>
                        <input
                          type="email"
                          value={passenger.email}
                          onChange={(e) => handlePassengerChange(idx, 'email', e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 pl-12 pr-6 py-4 rounded-2xl border border-transparent focus:border-red-600/30 focus:bg-white dark:focus:bg-slate-800 outline-none font-bold text-slate-900 dark:text-white transition-all shadow-inner"
                          placeholder="For e-ticket delivery"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Optional Preferences - Quick Select */}
                  <div className="pt-4 flex gap-2">
                    <button className="flex-1 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors border border-transparent hover:border-red-100">
                      Meal Pref.
                    </button>
                    <button className="flex-1 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors border border-transparent hover:border-red-100">
                      Seat Pref.
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                <BookingSection title="Route Summary">
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[28px] border border-slate-100 dark:border-slate-800 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-red-600 shadow-sm">
                          <Plane size={20} />
                        </div>
                        <div>
                          <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{originIata} to {destIata}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedFlight.airline} • Business</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Nov 24, 2024</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedFlight.duration}</p>
                      </div>
                    </div>
                  </div>
                </BookingSection>

                <BookingSection title="Passenger Access">
                  <div className="space-y-4">
                    {passengers.map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[24px] hover:shadow-lg transition-all hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <User size={18} />
                          </div>
                          <div>
                            <p className="text-base font-black text-slate-900 dark:text-white tracking-tight">{p.name || `Guest ${idx + 1}`}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adult • {p.email || 'No email provided'}</p>
                          </div>
                        </div>
                        <Check size={16} className="text-emerald-500" />
                      </div>
                    ))}
                  </div>
                </BookingSection>
              </div>

              <div className="space-y-8">
                <BookingSection title="Price Breakdown">
                  <div className="p-8 bg-slate-900 dark:bg-slate-800 rounded-[32px] text-white space-y-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 rounded-full blur-3xl" />
                    
                    <div className="space-y-4 relative z-10">
                      <div className="flex justify-between items-center group">
                        <span className="text-slate-400 text-sm font-bold group-hover:text-white transition-colors">Base Fare ({curation.travelers}x)</span>
                        <span className="font-black text-lg tracking-tight">AED {calculatedTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center group">
                        <span className="text-slate-400 text-sm font-bold group-hover:text-white transition-colors">Surcharges & Taxes</span>
                        <span className="font-black text-emerald-400 text-sm uppercase tracking-widest">Included</span>
                      </div>
                      <div className="flex justify-between items-center group">
                        <span className="text-slate-400 text-sm font-bold group-hover:text-white transition-colors">Premium Insurance</span>
                        <span className="font-black text-emerald-400 text-sm uppercase tracking-widest">Complimentary</span>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-white/10 flex justify-between items-end relative z-10">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Final Total</p>
                        <p className="text-5xl font-black tracking-tighter text-white">AED {calculatedTotal.toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                          <ShieldCheck size={12} strokeWidth={3} />
                          Secure
                        </div>
                      </div>
                    </div>
                  </div>
                </BookingSection>

                <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-[28px] border border-amber-100 dark:border-amber-900/20 flex gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-500/20">
                    <Info size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-amber-900 dark:text-amber-200 uppercase tracking-tight">Next Step: Secure Payment</p>
                    <p className="text-xs text-amber-700/70 dark:text-amber-400/70 font-medium leading-relaxed">You will be redirected to our encrypted gateway to complete the transaction.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'payment' && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <PaymentGateway
              total={calculatedTotal}
              currency="AED"
              onPay={handlePayment}
              onBack={() => setStep('review')}
              isLoading={isProcessing}
              breakdown={[
                { label: `Base Fare (${curation.travelers}x)`, value: calculatedTotal },
                { label: 'Taxes & Fees', value: 'Included' }
              ]}
            />
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center space-y-12 py-12"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse" />
              <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white relative z-10 shadow-2xl shadow-emerald-500/50">
                <Check size={48} strokeWidth={3} />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Booking Confirmed</h2>
              <p className="text-slate-500 font-medium">Your e-ticket has been secured and sent to your email.</p>
            </div>

            {/* Premium Boarding Pass */}
            <div id="ticket-pdf-template" className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col relative group">
              {/* Top Section - Brand */}
              <div className="bg-slate-900 p-8 flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-full bg-red-600/20 skew-x-12 translate-x-16" />
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Mastercard Travel</p>
                  <p className="text-white font-black tracking-widest text-lg">BOARDING PASS</p>
                </div>
                <Plane className="text-red-600 relative z-10" size={28} />
              </div>

              {/* Main Ticket Body */}
              <div className="p-8 space-y-10 relative">
                {/* Dotted Cut Line */}
                <div className="absolute top-0 left-0 right-0 flex justify-between px-8 -translate-y-1/2">
                   {Array.from({length: 12}).map((_, i) => (
                     <div key={i} className="w-2 h-1 bg-slate-100 dark:bg-slate-800 rounded-full" />
                   ))}
                </div>

                {/* Passenger & Flight Info */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Passenger</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{passengers[0].name || 'Guest'}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Flight No.</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{selectedFlight.id}</p>
                  </div>
                </div>

                {/* Route Visualization */}
                <div className="flex justify-between items-center px-6 py-8 bg-slate-50 dark:bg-slate-800/50 rounded-3xl relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-transparent to-slate-900/5" />
                   <div className="text-center relative z-10">
                     <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{originIata}</p>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{selectedFlight.departureTime.split(' ')[0]}</p>
                   </div>
                   <div className="flex-1 flex flex-col items-center gap-2 px-4 relative z-10">
                      <Plane size={16} className="text-red-600/40 rotate-90" />
                      <div className="w-full h-px border-t border-dashed border-slate-300 dark:border-slate-600" />
                   </div>
                   <div className="text-center relative z-10">
                     <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{destIata}</p>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{selectedFlight.arrivalTime.split(' ')[0]}</p>
                   </div>
                </div>

                {/* Grid Details */}
                <div className="grid grid-cols-2 gap-y-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                    <p className="text-base font-black text-slate-900 dark:text-white">Nov 24</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gate</p>
                    <p className="text-base font-black text-slate-900 dark:text-white">12A</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Seat</p>
                    <p className="text-base font-black text-slate-900 dark:text-white">04K</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Class</p>
                    <p className="text-base font-black text-red-600">Business</p>
                  </div>
                </div>

                {/* Barcode Section */}
                <div className="pt-4 flex flex-col items-center gap-3">
                   <div className="w-full h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center p-4">
                      <div className="flex gap-1 h-full w-full">
                         {Array.from({length: 40}).map((_, i) => (
                           <div key={i} className={`h-full rounded-full bg-slate-900 dark:bg-slate-200 ${Math.random() > 0.5 ? 'w-0.5' : 'w-1'} ${Math.random() > 0.8 ? 'opacity-20' : ''}`} />
                         ))}
                      </div>
                   </div>
                   <p className="font-mono text-[9px] font-bold text-slate-400 tracking-[0.5em] uppercase">MC-FL-2024-0X92</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 w-full max-w-sm">
              <button 
                onClick={onBack} 
                className="flex-1 px-8 py-5 rounded-[24px] bg-slate-100 dark:bg-slate-800 font-black text-xs uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
              >
                Close
              </button>
              <button 
                onClick={handleDownloadPDF} 
                disabled={isDownloading} 
                className="flex-1 px-8 py-5 rounded-[24px] bg-red-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-600/30 hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {isDownloading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                Download Ticket
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </BookingLayout>
  );
};

export default FlightBookingView;