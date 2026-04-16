import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Star, MapPin, Check, ChevronLeft, CreditCard, Heart,
  User, Mail, Phone, Calendar, Loader2, PartyPopper,
  Sparkles, Search, ArrowRight, ChevronRight, Download, Map as MapIcon,
  Receipt, Building2, BedDouble, Info, QrCode, Fingerprint, ShieldCheck, RefreshCw
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Hotel, BookingStep, Curation } from '../types';
import { ALTERNATIVE_HOTELS, ITALY_HOTELS, PARIS_HOTELS } from '../mockData';
import BookingLayout from './booking/BookingLayout';
import BookingSection from './booking/BookingSection';
import SummaryCard from './booking/SummaryCard';
import PaymentGateway from './PaymentGateway';
import SafeImage from './SafeImage';

interface HotelBookingViewProps {
  curation: Curation;
  initialStep?: BookingStep;
  preSelectedHotel?: Hotel;
  onBookingComplete: (bookingDetails: any) => void;
  onHotelSwap: (newHotel: Hotel) => void;
  onBack: () => void;
}

interface RoomOption {
  id: string;
  name: string;
  priceMultiplier: number;
  description: string;
}

const ROOM_OPTIONS: RoomOption[] = [
  { id: 'deluxe', name: 'Executive Deluxe Suite', priceMultiplier: 1.0, description: 'Spacious 65sqm suite with skyline view and king bed.' },
  { id: 'premium', name: 'Premium Panoramic Room', priceMultiplier: 1.2, description: 'Corner room with floor-to-ceiling windows and premium lounge access.' },
  { id: 'presidential', name: 'Presidential Penthouse', priceMultiplier: 2.5, description: 'Two-bedroom penthouse with private terrace and butler service.' }
];

const HotelBookingView: React.FC<HotelBookingViewProps> = ({
  curation,
  initialStep = 'details',
  preSelectedHotel,
  onBookingComplete,
  onHotelSwap,
  onBack
}) => {
  const [step, setStep] = useState<BookingStep>(initialStep);
  const [selectedHotel, setSelectedHotel] = useState<Hotel>(preSelectedHotel || curation.destination.hotels[0]);
  const [selectedRoom, setSelectedRoom] = useState<RoomOption>(ROOM_OPTIONS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const [guestData, setGuestData] = useState({
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    phone: '+44 7700 900000'
  });

  const calculatedTotal = Math.round(selectedHotel.pricePerNight * 3 * (curation.hotelBooking?.roomType ? (ROOM_OPTIONS.find(r => r.name === curation.hotelBooking?.roomType)?.priceMultiplier || 1) : selectedRoom.priceMultiplier));

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
      onBookingComplete({
        hotelId: selectedHotel.id,
        hotelName: selectedHotel.name,
        imageUrl: selectedHotel.imageUrl,
        bookingRef: `TC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        totalPrice: calculatedTotal,
        roomType: selectedRoom.name
      });
    }, 2000);
  };

  const handleSwap = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    onHotelSwap(hotel);
    setStep('details');
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const input = document.getElementById('ai-hotel-voucher-pdf-template');
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
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Mastercard-Hotel-Voucher-AI.pdf`);
      }
    } catch (error) {
      console.error("Hotel Voucher Generation failed", error);
      alert("Failed to generate voucher.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Determine which hotels to show based on destination
  const displayHotels = curation.destination.name.toLowerCase().includes('italy')
    ? ITALY_HOTELS
    : curation.destination.name.toLowerCase().includes('paris')
      ? PARIS_HOTELS
      : ALTERNATIVE_HOTELS;

  const steps: { key: BookingStep; label: string }[] = [
    { key: 'details', label: 'Details' },
    { key: 'rooms', label: 'Rooms' },
    { key: 'guests', label: 'Guests' },
    { key: 'payment', label: 'Payment' },
    { key: 'success', label: 'Voucher' }
  ];

  const stepIndex = steps.findIndex(s => s.key === step) + 1;

  const navigationBack = () => {
    if (step === 'details') onBack();
    else if (step === 'search') setStep('details');
    else if (step === 'rooms') setStep('details');
    else if (step === 'guests') setStep('rooms');
    else if (step === 'payment') setStep('guests');
  };

  const renderFooter = () => {
    if (step === 'success') return null;

    return (
      <div className="flex items-center justify-between w-full">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Stay</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">AED {calculatedTotal.toLocaleString()}</p>
        </div>

        {step === 'details' && (
          <button
            onClick={() => setStep('rooms')}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-red-600/20 active:scale-95 flex items-center gap-3"
          >
            Select Rooms <ArrowRight size={16} />
          </button>
        )}

        {step === 'rooms' && (
          <button
            onClick={() => setStep('guests')}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-red-600/20 active:scale-95 flex items-center gap-3"
          >
            Continue <ArrowRight size={16} />
          </button>
        )}

        {step === 'guests' && (
          <button
            onClick={() => setStep('payment')}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-red-600/20 active:scale-95 flex items-center gap-3"
          >
            To Secure Payment <CreditCard size={16} />
          </button>
        )}
      </div>
    );
  };

  return (
    <BookingLayout
      title={step === 'search' ? 'Explore Properties' : step === 'success' ? 'Stay Confirmed' : selectedHotel.name}
      subtitle={step === 'success' ? 'Check-in Nov 24' : `${curation.destination.name} • ${selectedHotel.rating} Stars`}
      onBack={step === 'success' ? undefined : navigationBack}
      footer={renderFooter()}
      backgroundImage={step === 'details' ? selectedHotel.imageUrl : undefined}
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
                <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Luxury Stays</h3>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {curation.destination.name} • 3 nights experience
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                  {displayHotels.length} Properties
                </span>
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                   {['Lowest Price', 'Top Rated'].map((label, idx) => (
                     <button key={label} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${idx === 0 ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}>{label}</button>
                   ))}
                </div>
              </div>
            </div>

            {/* Hotel Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...displayHotels]
                .sort((a, b) => a.pricePerNight - b.pricePerNight)
                .map((hotel, idx) => {
                  const isSelected = selectedHotel.id === hotel.id;
                  const cheapest = idx === 0;

                  return (
                    <motion.div
                      key={hotel.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleSwap(hotel)}
                      className={`group relative bg-white dark:bg-slate-900 rounded-[32px] border-2 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col ${isSelected
                        ? 'border-red-600 ring-4 ring-red-600/10 shadow-2xl'
                        : 'border-slate-50 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-900/40 hover:shadow-xl'
                        }`}
                    >
                      {/* Image Section */}
                      <div className="relative h-56 overflow-hidden">
                        <SafeImage src={hotel.imageUrl} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" category="hotel" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                        
                        {cheapest && (
                          <div className="absolute top-4 left-4 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-xl shadow-lg">
                            Best Value stay
                          </div>
                        )}

                        <div className="absolute bottom-4 left-4 flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={10} className={`${i < Math.floor(hotel.rating) ? 'text-amber-400 fill-amber-400' : 'text-white/30'}`} />
                            ))}
                          </div>
                          <p className="text-white font-black text-xl tracking-tight">{hotel.name}</p>
                        </div>
                      </div>

                      {/* Info Section */}
                      <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                         <div className="space-y-4">
                           <div className="flex items-start gap-4 text-slate-500 dark:text-slate-400">
                             <MapPin size={16} className="shrink-0 mt-0.5" />
                             <p className="text-sm font-medium leading-relaxed">{hotel.address || 'Central District, Italy'}</p>
                           </div>

                           <div className="flex flex-wrap gap-2">
                             {hotel.amenities?.slice(0, 3).map(a => (
                               <span key={a} className="px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:border-red-100 transition-colors">
                                 {a}
                               </span>
                             ))}
                           </div>
                         </div>

                         <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-end justify-between">
                            <div>
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Nightly rate</span>
                               <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">AED {hotel.pricePerNight.toLocaleString()}</p>
                            </div>
                            <button className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSelected
                              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 group-hover:border-red-600/50'
                              }`}>
                              {isSelected ? 'Selected' : 'Choose stay'}
                            </button>
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
            className="space-y-12"
          >
            <div className="md:mt-[30vh]"> {/* Spacer for background image header */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <BookingSection title="The Experience">
                    <div className="space-y-6">
                      <p className="text-2xl font-black text-slate-900 dark:text-white leading-[1.2] tracking-tight">
                         "{selectedHotel.description || "Unparalleled luxury meets contemporary design in the Heart of the Eternal City."}"
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        {selectedHotel.amenities?.map(a => (
                          <span key={a} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 flex items-center gap-3 shadow-sm hover:border-red-600/30 transition-colors">
                            <Check size={14} className="text-red-600" /> {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </BookingSection>

                  <BookingSection title="Location Excellence">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 flex items-center gap-6">
                       <div className="w-16 h-16 rounded-[24px] bg-red-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-600/20">
                          <MapPin size={32} />
                       </div>
                       <div className="space-y-1">
                          <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Prime District Location</p>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed">{selectedHotel.address || 'Via Condotti 12, Rome, Italy'}</p>
                       </div>
                    </div>
                  </BookingSection>
                </div>

                <div className="space-y-8">
                   <div className="bg-slate-900 dark:bg-slate-800 p-8 rounded-[40px] text-white space-y-6 shadow-2xl relative overflow-hidden group">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                      <div className="flex items-center gap-3 relative z-10">
                        <Sparkles className="text-amber-400" size={24} />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Elite Benefit</h4>
                      </div>
                      <p className="text-lg font-black leading-snug relative z-10">Exclusive lounge access and personalized Anya assistant included.</p>
                      <div className="pt-4 relative z-10">
                         <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <ShieldCheck size={14} className="text-emerald-400" />
                            Secure Reservation
                         </div>
                      </div>
                   </div>

                   <BookingSection title="House Rules">
                      <div className="space-y-4">
                        {[
                          "Check-in from 15:00",
                          "Express checkout included",
                          "High-speed Fiber included"
                        ].map((rule, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                            <p className="text-sm text-slate-500 font-semibold">{rule}</p>
                          </div>
                        ))}
                      </div>
                   </BookingSection>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'rooms' && (
          <motion.div
            key="rooms"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2 mb-12">
               <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Select your Space</h3>
               <p className="text-slate-500 font-medium tracking-wide">Choose from our curated selection of luxury residence tiers.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {ROOM_OPTIONS.map((room) => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`group relative text-left p-8 rounded-[40px] border-2 transition-all flex flex-col gap-8 ${selectedRoom.id === room.id
                    ? 'bg-red-50 dark:bg-red-900/10 border-red-600 shadow-2xl scale-[1.02]'
                    : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800 hover:border-red-100 dark:hover:border-red-900/40 hover:shadow-xl'
                    }`}
                >
                  <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all shrink-0 ${selectedRoom.id === room.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
                    }`}>
                    <BedDouble size={32} />
                  </div>
                  
                  <div className="space-y-4 flex-1">
                    <div className="space-y-1">
                       <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{room.name}</h4>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">{room.description}</p>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                       <div className="flex items-center gap-2">
                          <Check size={14} className="text-emerald-500" />
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Breakfast included</span>
                       </div>
                       <div className="flex items-center gap-2">
                          <Check size={14} className="text-emerald-500" />
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">High-speed Fiber</span>
                       </div>
                    </div>
                  </div>

                  <div className="pt-6 flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">AED {Math.round(selectedHotel.pricePerNight * room.priceMultiplier).toLocaleString()}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">per luxury night</p>
                    </div>
                    {selectedRoom.id === room.id && (
                       <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg">
                          <Check size={20} strokeWidth={3} />
                       </div>
                    )}
                  </div>
                </button>
              ))}
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
            <div className="bg-slate-900 dark:bg-slate-800 p-8 rounded-[40px] flex items-start gap-6 border border-slate-800 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-full bg-red-600/10 skew-x-12 translate-x-16" />
               <div className="w-16 h-16 rounded-[24px] bg-red-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-600/20 relative z-10">
                  <Fingerprint size={32} />
               </div>
               <div className="space-y-1 relative z-10">
                  <h4 className="text-xl font-black text-white tracking-tight">Lead Guest Verification</h4>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-md">Please provide the details of the primary resident. This information will be used for check-in and digital key delivery.</p>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-8">
                  <BookingSection title="Resident Information">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Legal Name</label>
                        <div className="relative group/input">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-red-600 transition-colors" size={18} />
                          <input
                            type="text"
                            value={guestData.name}
                            onChange={e => setGuestData({ ...guestData, name: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 pl-12 pr-6 py-4 rounded-2xl border border-transparent focus:border-red-600/30 focus:bg-white dark:focus:bg-slate-800 outline-none font-bold text-slate-900 dark:text-white transition-all shadow-inner"
                            placeholder="John Doe"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Contact Phone</label>
                        <div className="relative group/input">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-red-600 transition-colors" size={18} />
                          <input
                            type="tel"
                            value={guestData.phone}
                            onChange={e => setGuestData({ ...guestData, phone: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 pl-12 pr-6 py-4 rounded-2xl border border-transparent focus:border-red-600/30 focus:bg-white dark:focus:bg-slate-800 outline-none font-bold text-slate-900 dark:text-white transition-all shadow-inner"
                            placeholder="+44 20 7123 4567"
                          />
                        </div>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Email for Digital Voucher</label>
                        <div className="relative group/input">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-red-600 transition-colors" size={18} />
                          <input
                            type="email"
                            value={guestData.email}
                            onChange={e => setGuestData({ ...guestData, email: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 pl-12 pr-6 py-4 rounded-2xl border border-transparent focus:border-red-600/30 focus:bg-white dark:focus:bg-slate-800 outline-none font-bold text-slate-900 dark:text-white transition-all shadow-inner"
                            placeholder="residence@luxury.com"
                          />
                        </div>
                      </div>
                    </div>
                  </BookingSection>
               </div>

               <div className="space-y-8">
                  <div className="p-8 bg-amber-50 dark:bg-amber-900/10 rounded-[40px] border border-amber-100 dark:border-amber-900/20 flex flex-col gap-6">
                    <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                      <Sparkles size={24} />
                    </div>
                    <div className="space-y-2">
                       <h4 className="font-black text-amber-900 dark:text-amber-200 uppercase tracking-tight">Elite Profile Sync</h4>
                       <p className="text-xs text-amber-800/70 dark:text-amber-400/70 font-medium leading-relaxed">Your preferences (High Floor, Extra Pillows) have been automatically synchronized with the property management system.</p>
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}

        {step === 'payment' && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <PaymentGateway
              total={calculatedTotal}
              currency="AED"
              onPay={handlePayment}
              onBack={() => setStep('guests')}
              isLoading={isProcessing}
              breakdown={[
                { label: `${selectedRoom.name} (3 Nights)`, value: calculatedTotal },
                { label: 'Elite Member Surcharge', value: 'Complimentary' },
                { label: 'City Taxes & Service', value: 'Included' }
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
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Stay Secured</h2>
              <p className="text-slate-500 font-medium">Your residence is confirmed. We look forward to welcoming you.</p>
            </div>

            {/* Premium Hotel Voucher */}
            <div id="ai-hotel-voucher-pdf-template" className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col relative group">
              {/* Hero Image Section */}
              <div className="relative h-64 overflow-hidden">
                <SafeImage src={selectedHotel.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="" category="hotel" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
                   <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
                      <p className="text-[9px] font-black text-white uppercase tracking-[0.3em]">Stay Voucher</p>
                   </div>
                   <Building2 className="text-white opacity-40" size={20} />
                </div>
                <div className="absolute bottom-6 left-8 right-8 text-white">
                  <h3 className="text-3xl font-black tracking-tighter">{selectedHotel.name}</h3>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mt-1">{curation.destination.name}</p>
                </div>
              </div>

              {/* Details Section */}
              <div className="p-8 space-y-8 relative">
                <div className="grid grid-cols-2 gap-y-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lead Guest</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{guestData.name}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Room Type</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{selectedRoom.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Check In</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">Nov 24, 2024</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nights</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">03 Luxury Nights</p>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex justify-between items-end">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Paid</p>
                      <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">AED {calculatedTotal.toLocaleString()}</p>
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl shadow-inner border border-slate-100 dark:border-slate-700">
                      <QrCode size={48} className="text-slate-900 dark:text-white" />
                   </div>
                </div>

                <div className="pt-4 flex justify-center">
                   <p className="font-mono text-[9px] font-bold text-slate-300 tracking-[0.4em]">RES-MC-2024-H732</p>
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
                Download Voucher
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </BookingLayout>
  );
};

export default HotelBookingView;