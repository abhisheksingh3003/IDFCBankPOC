import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Calendar, Clock, CreditCard, Loader2, Check, PartyPopper,
  Sparkles, ArrowRight, User, Info, MapPin, QrCode, Star, Plane
} from 'lucide-react';
import { Activity, Curation } from '../types';
import BookingLayout from './booking/BookingLayout';
import BookingSection from './booking/BookingSection';
import SummaryCard from './booking/SummaryCard';
import PaymentGateway from './PaymentGateway';
import SafeImage from './SafeImage';

interface ExperienceBookingViewProps {
  curation: Curation;
  activity: Activity;
  activityAlternatives?: Activity[];
  initialStep?: 'search' | 'details' | 'payment' | 'success';
  onComplete: (details: any) => void;
  onActivitySwap: (newActivity: Activity) => void;
  onBack: () => void;
}

const TIME_SLOTS = ["09:00 AM", "11:30 AM", "02:00 PM", "04:30 PM", "07:00 PM"];

const ExperienceBookingView: React.FC<ExperienceBookingViewProps> = ({ curation, activity, activityAlternatives = [], initialStep = 'details', onComplete, onActivitySwap, onBack }) => {
  const [step, setStep] = useState<'search' | 'details' | 'payment' | 'success'>(initialStep);
  const activityPool = activityAlternatives.length > 0 ? activityAlternatives : [activity];
  const [selectedActivity, setSelectedActivity] = useState<Activity>(activity);
  const [selectedDate, setSelectedDate] = useState(curation.startDate || '');
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[2]);
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterTab, setFilterTab] = useState<'All' | 'Paid' | 'Free'>('All');
  const [bookingRef] = useState(`EXP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`);

  const isAirportTransfer = activity.name === 'Airport Transfer';

  const addMinutesToTime = (timeStr: string, minsToAdd: number) => {
    if (!timeStr) return timeStr;
    const parts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!parts) return timeStr;

    let hours = parseInt(parts[1]);
    let minutes = parseInt(parts[2]);
    const modifier = parts[3].toUpperCase();

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    let totalMins = hours * 60 + minutes + minsToAdd;
    let newHours = Math.floor(totalMins / 60) % 24;
    let newMins = totalMins % 60;

    const newModifier = newHours >= 12 ? 'PM' : 'AM';
    newHours = newHours % 12;
    if (newHours === 0) newHours = 12;

    return `${newHours}:${newMins.toString().padStart(2, '0')} ${newModifier}`;
  };

  React.useEffect(() => {
    if (isAirportTransfer) {
      if (curation.flightBooking) {
        setPickupLocation(curation.flightBooking.destinationIata || 'LHR Terminal 5');
        const arrivalTime = curation.flightBooking.arrivalTime || '08:30 AM';
        setSelectedTime(addMinutesToTime(arrivalTime, 15));
      }
      if (curation.hotelBooking) {
        setDropoffLocation(curation.hotelBooking.hotelName || 'The Shard Shangri-La');
      }
    }
  }, [isAirportTransfer, curation]);

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
      onComplete({
        activityId: selectedActivity.id,
        activityName: selectedActivity.name,
        bookingRef: bookingRef,
        date: selectedDate,
        time: selectedTime,
        pickup: pickupLocation,
        dropoff: dropoffLocation,
        price: selectedActivity.price * curation.travelers,
        imageUrl: selectedActivity.imageUrl
      });
    }, 2000);
  };

  const filteredPool = activityPool.filter(act => {
    if (filterTab === 'Paid') return act.price > 0;
    if (filterTab === 'Free') return act.price === 0;
    return true;
  });

  const steps: { key: string; label: string }[] = [
    { key: 'search', label: 'Explore' },
    { key: 'details', label: 'Experience' },
    { key: 'payment', label: 'Payment' },
    { key: 'success', label: 'Ticket' }
  ];

  const stepIndex = steps.findIndex(s => s.key === step) + 1;

  const renderFooter = () => {
    if (step === 'success') return null;
    return (
      <div className="flex items-center justify-between w-full">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Experience</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">INR {(selectedActivity.price * curation.travelers).toLocaleString()}</p>
        </div>
        {step === 'details' && (
          <button
            onClick={() => selectedActivity.price === 0 ? handlePay() : setStep('payment')}
            disabled={!selectedDate || (isAirportTransfer && (!pickupLocation || !dropoffLocation))}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {selectedActivity.price === 0 ? 'Confirm Selection' : 'Continue to Book'} <ArrowRight size={18} />
          </button>
        )}
      </div>
    );
  };

  return (
    <BookingLayout
      title={step === 'search' ? 'Explore Experiences' : step === 'success' ? 'Experience Secured' : (isAirportTransfer ? 'Transfer Service' : 'Activity Experience')}
      subtitle={step === 'success' ? 'Nov 24, 2024' : `${selectedActivity.name} • ${selectedActivity.duration}`}
      onBack={step === 'success' ? undefined : (step === 'search' ? onBack : (step === 'details' ? (activityAlternatives.length > 0 ? () => setStep('search') : onBack) : () => setStep('details')))}
      footer={renderFooter()}
      backgroundImage={step === 'details' ? selectedActivity.imageUrl : undefined}
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
            {/* Header */}
            <div className="flex items-end justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
              <div className="space-y-1">
                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Top Recommendations</h3>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {curation.destination.name} • Curated for your Travel DNA
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                  {filteredPool.length} Experiences Found
                </span>
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                  {(['All', 'Paid', 'Free'] as const).map(tab => (
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

            {/* Activity Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPool.slice(0, 12).map((act, idx) => {
                const isSelected = selectedActivity.id === act.id;
                return (
                  <motion.div
                    key={act.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => {
                      setSelectedActivity(act);
                      onActivitySwap(act);
                      setStep('details');
                    }}
                    className={`group relative bg-white dark:bg-slate-900 rounded-[32px] border-2 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col ${isSelected
                      ? 'border-red-600 ring-4 ring-red-600/10 shadow-2xl'
                      : 'border-slate-50 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-900/40 hover:shadow-xl'
                      }`}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <SafeImage src={act.imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" category="activity" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <p className="text-white font-black text-lg tracking-tight">{act.name}</p>
                        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">{act.duration}</p>
                      </div>
                    </div>
                    <div className="p-5 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Experience Price</span>
                        <p className="text-lg font-black text-slate-900 dark:text-white">INR {act.price.toLocaleString()}</p>
                      </div>
                      <button className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${isSelected
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                        }`}>
                        {isSelected ? 'Selected' : 'Choose'}
                      </button>
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
            className="space-y-12"
          >
            <div className="md:mt-[30vh]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <BookingSection title="The Experience">
                    <div className="space-y-6">
                      <p className="text-2xl font-black text-slate-900 dark:text-white leading-[1.2] tracking-tight">
                         "{isAirportTransfer 
                           ? `Luxury chauffeur service from ${pickupLocation || 'Arrivals'} to your destination. Inclusive of wait time and luggage assistance.` 
                           : `A curated ${activity.name} in ${curation.destination.name}. This high-end activity includes professional guiding and exclusive access.`}"
                      </p>
                      
                      {isAirportTransfer && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm">
                           <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                                <Plane size={14} className="text-red-600" /> Pickup Hub
                              </label>
                              <div className="relative group/input">
                                <input
                                  type="text"
                                  value={pickupLocation}
                                  onChange={(e) => setPickupLocation(e.target.value)}
                                  className="w-full bg-slate-50 dark:bg-slate-800/50 px-6 py-4 rounded-2xl border border-transparent focus:border-red-600/30 focus:bg-white dark:focus:bg-slate-800 outline-none font-bold text-slate-900 dark:text-white transition-all shadow-inner"
                                  placeholder="Terminal / Gate"
                                />
                              </div>
                           </div>
                           <div className="space-y-3">
                              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                                <MapPin size={14} className="text-red-600" /> Destination
                              </label>
                              <div className="relative group/input">
                                <input
                                  type="text"
                                  value={dropoffLocation}
                                  onChange={(e) => setDropoffLocation(e.target.value)}
                                  className="w-full bg-slate-50 dark:bg-slate-800/50 px-6 py-4 rounded-2xl border border-transparent focus:border-red-600/30 focus:bg-white dark:focus:bg-slate-800 outline-none font-bold text-slate-900 dark:text-white transition-all shadow-inner"
                                  placeholder="Hotel / Residence"
                                />
                              </div>
                           </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2.5">
                         {['Skip-the-line', 'Expert Guide', 'All Equipment', 'Secure Payment'].map(a => (
                           <span key={a} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 flex items-center gap-3 shadow-sm hover:border-red-600/30 transition-colors">
                             <Check size={14} className="text-red-600" /> {a}
                           </span>
                         ))}
                      </div>
                    </div>
                  </BookingSection>

                  <BookingSection title="Scheduling">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Preferred Date</label>
                        <div className="relative">
                          <Calendar size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="date"
                            min={curation.startDate}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 pl-14 pr-6 py-4 rounded-2xl border border-transparent focus:border-red-600/30 focus:bg-white dark:focus:bg-slate-800 outline-none font-bold text-slate-900 dark:text-white transition-all shadow-inner"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                          {isAirportTransfer ? "Arrival/Pickup Time" : "Experience Session"}
                        </label>
                        {isAirportTransfer ? (
                           <div className="relative">
                              <Clock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="text"
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800/50 pl-14 pr-6 py-4 rounded-2xl border border-transparent focus:border-red-600/30 focus:bg-white dark:focus:bg-slate-800 outline-none font-bold text-slate-900 dark:text-white transition-all shadow-inner"
                                placeholder="00:00 AM"
                              />
                           </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {TIME_SLOTS.map(t => (
                              <button
                                key={t}
                                onClick={() => setSelectedTime(t)}
                                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedTime === t
                                  ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20'
                                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-red-600/30'
                                  }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </BookingSection>
                </div>

                <div className="space-y-8">
                   <div className="p-8 bg-slate-900 dark:bg-slate-800 rounded-[40px] text-white space-y-8 shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-full bg-red-600/10 skew-x-12 translate-x-16" />
                      
                      <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-3">
                          <Sparkles className="text-amber-400" size={24} />
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">AI Advantage</h4>
                        </div>
                        <p className="text-xl font-black leading-tight tracking-tight">Best experience matched for {curation.travelers} Guests.</p>
                      </div>

                      <div className="space-y-3 relative z-10">
                         <div className="flex justify-between items-center py-3 border-b border-white/10 group/row">
                            <span className="text-xs font-bold text-slate-400 group-hover/row:text-white">Admission</span>
                            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Included</span>
                         </div>
                         <div className="flex justify-between items-center py-3 border-b border-white/10 group/row">
                            <span className="text-xs font-bold text-slate-400 group-hover/row:text-white">Flexible Policy</span>
                            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Free</span>
                         </div>
                      </div>

                      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between relative z-10">
                         <div className="space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase">Rate Lock</p>
                            <p className="text-lg font-black tracking-tighter text-white">INR {selectedActivity.price.toLocaleString()}/guest</p>
                         </div>
                         <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Check size={18} strokeWidth={3} />
                         </div>
                      </div>
                   </div>

                   <div className="p-8 bg-amber-50 dark:bg-amber-900/10 rounded-[40px] border border-amber-100 dark:border-amber-900/20 flex gap-4">
                      <Info size={24} className="text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-tight">Ticket Policy</p>
                        <p className="text-xs text-amber-800/70 dark:text-amber-400/70 font-medium leading-relaxed">Present your digital QR code upon arrival. No physical ticket required.</p>
                      </div>
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
              total={activity.price * curation.travelers}
              currency="INR"
              onPay={handlePay}
              onBack={() => setStep('details')}
              isLoading={isProcessing}
              breakdown={[
                { label: `${activity.name} (${curation.travelers}x)`, value: activity.price * curation.travelers },
                { label: 'Booking Fee', value: 'Included' }
              ]}
            />
          </motion.div>
        )}


        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
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
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                 {isAirportTransfer ? 'Transfer Secured' : 'Ticket Issued'}
              </h2>
              <p className="text-slate-500 font-medium">Your digital entry credential has been verified and issued.</p>
            </div>

            {/* Premium Experience Ticket */}
            <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col relative group">
              {/* Ticket Brand Header */}
              <div className="bg-slate-900 p-8 flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-full bg-red-600/20 skew-x-12 translate-x-16" />
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Experience Pass</p>
                  <p className="text-white font-black tracking-widest text-lg font-mono">{bookingRef}</p>
                </div>
                <Sparkles className="text-red-600 relative z-10" size={24} />
              </div>

              {/* Main Ticket Body */}
              <div className="p-8 space-y-8 relative">
                {/* Visual Separator */}
                <div className="absolute top-0 left-0 right-0 flex justify-between px-8 -translate-y-1/2">
                   {Array.from({length: 12}).map((_, i) => (
                     <div key={i} className="w-2 h-1 bg-slate-100 dark:bg-slate-800 rounded-full" />
                   ))}
                </div>

                <div className="space-y-6">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Experience</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{selectedActivity.name}</p>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{selectedDate}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Time</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{selectedTime}</p>
                      </div>
                   </div>

                   {isAirportTransfer && (
                     <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="flex items-center gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                           <p className="text-[10px] font-black text-slate-400 truncate tracking-tight">{pickupLocation}</p>
                        </div>
                        <div className="h-4 border-l border-dashed border-slate-300 dark:border-slate-600 ml-[3px]" />
                        <div className="flex items-center gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                           <p className="text-[10px] font-black text-slate-400 truncate tracking-tight">{dropoffLocation}</p>
                        </div>
                     </div>
                   )}
                </div>

                {/* QR Section */}
                <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex flex-col items-center gap-6">
                   <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-inner">
                      <QrCode size={120} className="text-slate-900 dark:text-white" />
                   </div>
                   <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">Non-Transferable Pass</p>
                </div>
              </div>
            </div>

            <button 
              onClick={onBack} 
              className="w-full max-w-sm px-8 py-5 rounded-[24px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all active:scale-95"
            >
              Return to Anya
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </BookingLayout >
  );
};

export default ExperienceBookingView;
