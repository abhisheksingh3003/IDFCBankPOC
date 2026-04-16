import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Ticket,
    Check,
    Plane,
    MapPin,
    Calendar,
    Clock,
    ShieldCheck,
    ChevronUp,
    Wifi,
    Car,
    Building2,
    Briefcase,
    ChevronLeft,
    X,
    QrCode,
    Camera,
    Utensils,
    Star,
    MonitorPlay,
    Info,
    ChevronRight,
    Download
} from 'lucide-react';

interface MobileBookingsProps {
    confirmedBookings: any[];
    onBack?: () => void;
}

const MobileBookings: React.FC<MobileBookingsProps> = ({ confirmedBookings, onBack }) => {
    const [bookingTab, setBookingTab] = useState<'flight' | 'hotel' | 'experiences' | 'others'>('flight');
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

    // Filter active bookings
    const activeBookings = confirmedBookings.filter(booking => {
        if (bookingTab === 'flight') return !!booking.flight;
        if (bookingTab === 'hotel') return !!booking.hotel;
        if (bookingTab === 'experiences') return booking.experiences && booking.experiences.length > 0;
        if (bookingTab === 'others') return booking.essentials && booking.essentials.length > 0;
        return false;
    });

    // Auto-select tab if bookings exist but current tab is empty
    useEffect(() => {
        if (confirmedBookings.length > 0) {
            const currentHasItems = confirmedBookings.some(b => {
                if (bookingTab === 'flight') return !!b.flight;
                if (bookingTab === 'hotel') return !!b.hotel;
                if (bookingTab === 'experiences') return b.experiences?.length > 0;
                if (bookingTab === 'others') return b.essentials?.length > 0;
                return false;
            });

            if (!currentHasItems) {
                if (confirmedBookings.some(b => b.flight)) setBookingTab('flight');
                else if (confirmedBookings.some(b => b.hotel)) setBookingTab('hotel');
                else if (confirmedBookings.some(b => b.experiences?.length > 0)) setBookingTab('experiences');
                else if (confirmedBookings.some(b => b.essentials?.length > 0)) setBookingTab('others');
            }
        }
    }, [confirmedBookings, bookingTab]);

    const tabs = [
        { id: 'flight', label: 'Flights', icon: Plane },
        { id: 'hotel', label: 'Hotels', icon: Building2 },
        { id: 'experiences', label: 'Play', icon: Ticket },
        { id: 'others', label: 'Needs', icon: Briefcase },
    ] as const;

    const TicketModal = ({ booking, onClose }: { booking: any, onClose: () => void }) => {
        if (!booking) return null;

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden relative shadow-2xl"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="absolute top-6 right-6 z-10">
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 active:scale-90 transition-transform">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Flight Detail View */}
                    {booking.flight && (
                        <div className="p-0">
                            <div className="bg-[#d91918] p-8 pb-12 pt-12">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center p-2 shadow-lg">
                                            <img src={booking.flight.airlineLogo} className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <p className="text-white font-black text-xl">{booking.flight.airline}</p>
                                            <p className="text-red-100 text-xs font-bold uppercase tracking-widest">{booking.flight.flightNumber || booking.flight.id}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-red-200 text-[10px] font-black uppercase tracking-tighter">Terminal</p>
                                        <p className="text-white font-black text-2xl">A3</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mb-8">
                                    <div className="text-center">
                                        <p className="text-white text-4xl font-black mb-1">{booking.flight.originIata}</p>
                                        <p className="text-red-100 text-xs font-bold">{booking.originName || 'Warsaw'}</p>
                                    </div>
                                    <div className="flex-1 px-4 relative flex items-center justify-center">
                                        <div className="w-full border-t-2 border-dashed border-red-400 opacity-50" />
                                        <Plane size={24} className="text-white absolute rotate-90" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white text-4xl font-black mb-1">{booking.flight.destinationIata}</p>
                                        <p className="text-red-100 text-xs font-bold">{booking.tripName || 'Italy'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 pb-12 -mt-6 bg-white dark:bg-slate-900 rounded-t-[3rem] relative z-10">
                                <div className="grid grid-cols-3 gap-8 mb-10">
                                    <div>
                                        <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Boarding</p>
                                        <p className="text-slate-900 dark:text-white font-black">{booking.flight.departureTime}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Gate</p>
                                        <p className="text-slate-900 dark:text-white font-black">24A</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Seat</p>
                                        <p className="text-slate-900 dark:text-white font-black">12B (Eco)</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 mb-10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-red-600">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div>
                                            <p className="text-slate-900 dark:text-white font-bold text-sm">Priority Boarding</p>
                                            <p className="text-slate-400 text-[10px] font-bold">Included in booking</p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                                        <Check size={16} strokeWidth={3} />
                                    </div>
                                </div>

                                <div className="flex flex-col items-center">
                                    <div className="w-full h-24 bg-white dark:bg-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center border-2 border-slate-50 dark:border-slate-800">
                                        <img src="https://static.vecteezy.com/system/resources/previews/001/199/360/original/barcode-png.png" className="h-12 w-full object-contain mb-2 dark:invert" />
                                        <p className="font-mono text-[10px] tracking-widest text-slate-400">MC-249012480124</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Hotel Detail View */}
                    {booking.hotel && (
                        <div>
                            <div className="relative h-64">
                                <img src={booking.hotel.imageUrl || booking.hotel.image} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                                <div className="absolute bottom-6 left-8 right-8">
                                    <div className="flex items-center gap-2 mb-2">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill="#fbbf24" className="text-yellow-400" />)}
                                    </div>
                                    <h2 className="text-white text-3xl font-black mb-1">{booking.hotel.name}</h2>
                                    <div className="flex items-center gap-2 text-white/80 text-xs font-bold">
                                        <MapPin size={12} />
                                        <span>Rome, Italy</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="flex justify-between items-center mb-8 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem]">
                                    <div className="text-center flex-1">
                                        <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Check-in</p>
                                        <p className="text-slate-900 dark:text-white font-black text-lg">15 Oct</p>
                                    </div>
                                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                                    <div className="text-center flex-1">
                                        <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Nights</p>
                                        <p className="text-[#d91918] font-black text-lg">3</p>
                                    </div>
                                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                                    <div className="text-center flex-1">
                                        <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Check-out</p>
                                        <p className="text-slate-900 dark:text-white font-black text-lg">18 Oct</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                                            <Building2 size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-slate-900 dark:text-white font-bold">Deluxe Ocean Suite</p>
                                            <p className="text-slate-400 text-xs font-bold">2 Adults • King Bed</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                                            <QrCode size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-slate-900 dark:text-white font-bold">CONFIRMATION_ID</p>
                                            <p className="text-slate-400 text-xs font-bold font-mono uppercase">#MC-882931-ITALY</p>
                                        </div>
                                    </div>
                                </div>

                                <button onClick={onClose} className="w-full py-5 bg-[#d91918] text-white rounded-2xl font-black text-lg shadow-xl shadow-red-600/30 active:scale-95 transition-transform">
                                    Back to Bookings
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Experiences Detail View */}
                    {booking.experiences && (
                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-[2rem] bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 shadow-inner">
                                    <Ticket size={32} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 inline-block">Activity Pass</span>
                                    <h2 className="text-slate-900 dark:text-white text-2xl font-black leading-tight">Your Play Experience</h2>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8 h-[300px] overflow-y-auto no-scrollbar pt-2 pr-1">
                                {booking.experiences.map((exp: any, i: number) => (
                                    <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 transition-all active:scale-[0.98]">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="font-black text-slate-900 dark:text-white text-lg pr-8">{exp.activityName}</h4>
                                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white scale-75">
                                                <Check size={16} strokeWidth={4} />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                                <Calendar size={12} className="text-amber-500" />
                                                <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">{exp.date}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                                <Clock size={12} className="text-amber-500" />
                                                <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">{exp.time}</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
                                            <p className="text-xs font-mono text-slate-400">{exp.bookingRef}</p>
                                            <QrCode size={24} className="text-slate-900 dark:text-white opacity-40" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button onClick={onClose} className="w-full py-5 bg-amber-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-amber-500/30 active:scale-95 transition-transform flex items-center justify-center gap-2">
                                <Download size={20} strokeWidth={3} /> Download Wallet Passes
                            </button>
                        </div>
                    )}

                    {/* Needs (Essentials) Detail View */}
                    {booking.essentials && (
                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-[2rem] bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 shadow-inner">
                                    <Briefcase size={32} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 inline-block">Service Voucher</span>
                                    <h2 className="text-slate-900 dark:text-white text-2xl font-black leading-tight">Travel Essentials</h2>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8 h-[350px] overflow-y-auto no-scrollbar pt-2 pr-1">
                                {booking.essentials.map((ess: any, i: number) => (
                                    <div key={i} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 transition-all hover:border-indigo-200 dark:hover:border-indigo-800">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="font-black text-slate-900 dark:text-white text-lg">{ess.title}</h4>
                                            <div className="px-3 py-1 bg-green-500 text-white rounded-lg text-[10px] font-black uppercase">Active</div>
                                        </div>

                                        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mb-4">
                                            <p className="text-slate-400 text-[10px] font-black uppercase mb-2 flex items-center gap-1.5"><Info size={12} /> How to use</p>
                                            <p className="text-slate-600 dark:text-slate-300 text-xs font-medium leading-relaxed">
                                                {ess.category === 'Protection' ? 'Your insurance policy is active. In case of emergency, call the 24/7 hotline provided in your confirmation email with your reference ID.' :
                                                    ess.category === 'Connectivity' ? 'Scan the QR code received via email to activate your eSIM. Recommended to do this before departure.' :
                                                        ess.category === 'Lounge' ? 'Present this voucher or your boarding pass at the lounge entrance. Valid for single entry on departure date.' :
                                                            ess.category === 'Transport' ? 'Your driver will meet you at the arrivals hall with a sign. Please show your ID and booking reference.' :
                                                                'Present this digital voucher at the service point to claim your benefit. Keep your reference ID handy for verification.'}
                                            </p>
                                        </div>

                                        <div className="flex justify-between items-center text-xs font-bold">
                                            <span className="text-slate-400 font-mono uppercase">REF: #MC-{Math.random().toString(36).substr(2, 8).toUpperCase()}</span>
                                            <span className="text-slate-900 dark:text-white font-black text-lg">AED {ess.price}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button onClick={onClose} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/30 active:scale-95 transition-transform">
                                Done
                            </button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32">
            <div className="bg-[#d91918] z-40 shadow-xl pb-4 sticky top-0">
                <div className="px-6 pt-6 pb-4">
                    <div className="relative flex items-center justify-center mb-6">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="absolute left-0 w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center active:scale-95 transition-transform"
                            >
                                <ChevronLeft size={24} className="text-white" strokeWidth={2.5} />
                            </button>
                        )}
                        <h1 className="text-2xl font-black text-white">My Bookings</h1>
                    </div>
                    <div className="flex justify-between items-center bg-red-800/20 p-1 rounded-2xl relative">
                        {tabs.map((tab) => {
                            const isActive = bookingTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setBookingTab(tab.id)}
                                    className="relative flex-1 flex flex-col items-center justify-center py-3 gap-1 z-10"
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-white rounded-xl shadow-lg"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className={`relative z-20 transition-colors duration-200 ${isActive ? 'text-[#d91918]' : 'text-red-100'}`}>
                                        <tab.icon size={20} strokeWidth={isActive ? 3 : 2} />
                                    </span>
                                    <span className={`relative z-20 text-[8px] font-bold uppercase tracking-wider transition-colors duration-200 ${isActive ? 'text-[#d91918]' : 'text-red-200/60'}`}>
                                        {tab.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="px-6 pt-8 space-y-6">
                {activeBookings.length > 0 ? (
                    activeBookings.map((booking, idx) => {
                        if (bookingTab === 'flight' && booking.flight) {
                            return (
                                <motion.div
                                    key={`flight-${idx}`}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => setSelectedBooking(booking)}
                                    className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col cursor-pointer group"
                                >
                                    <div className="p-6 relative">
                                        <div className="flex justify-between items-center mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 p-1 flex items-center justify-center">
                                                    <img src={booking.flight.airlineLogo} className="w-full h-full object-contain" />
                                                </div>
                                                <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">{booking.flight.airline}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full">
                                                <Check size={12} strokeWidth={3} />
                                                <span className="text-[10px] font-black uppercase">Active</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center mb-4">
                                            <div className="text-center">
                                                <p className="text-3xl font-black text-slate-900 dark:text-white">{booking.flight.originIata}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">{booking.originName || 'Warsaw'}</p>
                                            </div>
                                            <div className="flex-1 px-8 relative flex items-center justify-center">
                                                <div className="w-full h-px border-t-2 border-dashed border-slate-100 dark:border-slate-800" />
                                                <Plane size={18} className="text-[#d91918] absolute rotate-90" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-3xl font-black text-slate-900 dark:text-white">{booking.flight.destinationIata}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">{booking.tripName || 'Italy'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 flex justify-between items-center border-t-2 border-dashed border-slate-100 dark:border-slate-800">
                                        <div className="flex gap-4">
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Date</p>
                                                <p className="text-[11px] font-black text-slate-700 dark:text-slate-300">15 Oct</p>
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Gate</p>
                                                <p className="text-[11px] font-black text-slate-700 dark:text-slate-300">24A</p>
                                            </div>
                                        </div>
                                        <p className="text-lg font-black text-[#d91918]">AED {booking.flight.price}</p>
                                    </div>
                                </motion.div>
                            );
                        }

                        if (bookingTab === 'hotel' && booking.hotel) {
                            return (
                                <motion.div
                                    key={`hotel-${idx}`}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => setSelectedBooking(booking)}
                                    className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.05)] overflow-hidden flex cursor-pointer"
                                >
                                    <div className="w-1/3 h-40">
                                        <img src={booking.hotel.imageUrl || booking.hotel.image} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 p-5 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[9px] font-black text-[#d91918] uppercase tracking-widest px-2 py-0.5 bg-red-50 dark:bg-red-900/20 rounded-md">Premier Stay</span>
                                                <Check size={14} className="text-green-500" strokeWidth={3} />
                                            </div>
                                            <h4 className="font-black text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-[#d91918] transition-colors">{booking.hotel.name}</h4>
                                            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold">
                                                <MapPin size={10} />
                                                <span className="line-clamp-1">Rome</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <p className="text-[10px] font-black text-slate-500">3 Nights • 2 Guests</p>
                                            <ChevronRight size={18} className="text-slate-300" />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        }

                        if (bookingTab === 'experiences' && booking.experiences?.length > 0) {
                            return (
                                <motion.div
                                    key={`exp-${idx}`}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => setSelectedBooking(booking)}
                                    className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-6 cursor-pointer relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500 opacity-[0.03] rounded-full -mr-16 -mt-16 group-hover:opacity-[0.08] transition-opacity" />
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 shadow-inner group-hover:scale-110 transition-transform">
                                            <Ticket size={28} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-slate-900 dark:text-white text-lg leading-tight">{booking.experiences.length} Experiences</h4>
                                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Play Pass Bundle</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {booking.experiences.slice(0, 2).map((exp: any, i: number) => (
                                            <div key={i} className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
                                                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {exp.activityName}</span>
                                                <span className="text-slate-400 font-mono text-[10px]">{exp.time}</span>
                                            </div>
                                        ))}
                                        {booking.experiences.length > 2 && (
                                            <p className="text-amber-600 text-[10px] font-black uppercase pt-2">+{booking.experiences.length - 2} More Activities</p>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        }

                        if (bookingTab === 'others' && booking.essentials?.length > 0) {
                            return (
                                <motion.div
                                    key={`ess-${idx}`}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => setSelectedBooking(booking)}
                                    className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-[0_10px_30px_rgba(0,0,0,0.05)] p-6 cursor-pointer"
                                >
                                    <div className="space-y-4">
                                        {booking.essentials.map((ess: any, i: number) => (
                                            <div key={i} className="flex items-center gap-4 group">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 subgroup-hover:scale-110 transition-transform">
                                                    {ess.category === 'Protection' ? <ShieldCheck size={20} /> :
                                                        ess.category === 'Dining' ? <Utensils size={20} /> :
                                                            ess.category === 'Lounge' ? <MonitorPlay size={20} /> :
                                                                <Briefcase size={20} />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-black text-slate-900 dark:text-white text-sm">{ess.title}</h4>
                                                        <span className="font-black text-slate-900 dark:text-white">AED {ess.price}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{ess.category}</p>
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                            <span className="text-[10px] font-black text-green-600 uppercase">Active</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        }

                        return null;
                    })
                ) : (
                    <div className="py-20 text-center">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
                            <Ticket size={48} />
                        </div>
                        <h3 className="font-black text-xl text-slate-900 dark:text-white mb-2">No {bookingTab} bookings</h3>
                        <p className="text-sm font-medium text-slate-500 max-w-[200px] mx-auto">Your travel adventures matching this category will appear here.</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedBooking && (
                    <TicketModal
                        booking={selectedBooking}
                        onClose={() => setSelectedBooking(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default MobileBookings;
