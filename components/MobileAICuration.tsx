import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plane, Hotel as HotelIcon, Star, CheckCircle2,
    ChevronLeft, Phone, MapPin, Sparkles, Clock,
    ArrowRight, Share2, Heart, Award, ArrowLeft,
    Building2, X, QrCode
} from 'lucide-react';
import { Curation, Activity, BookingStep, Hotel, Flight } from '../types';
import SafeImage from './SafeImage';

interface MobileAICurationProps {
    curation: Curation;
    onBack: () => void;
    onBookStay: (hotel: Hotel, step: BookingStep) => void;
    onBookFlight: (flight: Flight, step: BookingStep) => void;
    onBookExperience: (activity: Activity) => void;
    onBookExperiences: (activities: Activity[]) => void;
    confirmedBookings?: any[];
}

const PullToLoad: React.FC<{ onLoad: () => void; label: string }> = ({ onLoad, label }) => {
    const [isTriggered, setIsTriggered] = useState(false);

    return (
        <motion.div
            drag="x"
            dragConstraints={{ right: 0, left: -150 }}
            dragElastic={0.2}
            onDrag={(e, info) => {
                if (info.offset.x < -80 && !isTriggered) setIsTriggered(true);
                else if (info.offset.x >= -80 && isTriggered) setIsTriggered(false);
            }}
            onDragEnd={(e, info) => {
                if (info.offset.x < -100) {
                    onLoad();
                }
                setIsTriggered(false);
            }}
            className="min-w-[120px] self-stretch flex flex-col items-center justify-center gap-4 bg-slate-100/30 dark:bg-slate-800/20 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800 snap-center my-2"
        >
            <motion.div
                animate={{
                    x: isTriggered ? [-5, 5, -5] : 0,
                    scale: isTriggered ? 1.2 : 1
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isTriggered ? 'bg-red-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}
            >
                <ArrowLeft size={20} />
            </motion.div>
            <p className={`text-[10px] font-black uppercase tracking-widest text-center px-4 leading-tight transition-colors ${isTriggered ? 'text-red-600' : 'text-slate-400'}`}>
                {isTriggered ? 'Release' : `Slide for more ${label}`}
            </p>
        </motion.div>
    );
};

const MobileAICuration: React.FC<MobileAICurationProps> = ({
    curation,
    onBack,
    onBookStay,
    onBookFlight,
    onBookExperience,
    onBookExperiences,
    confirmedBookings = []
}) => {
    const [flightLimit, setFlightLimit] = React.useState(3);
    const [hotelLimit, setHotelLimit] = React.useState(3);
    const [selectedBooking, setSelectedBooking] = React.useState<any | null>(null);
    const [selectedActivitiesIds, setSelectedActivitiesIds] = React.useState<string[]>([]);
    const { destination, travelers, curationId } = curation;

    // Select top items from mock data within destination
    const selectedFlight = destination.flights[0];
    const activeHotel = destination.hotels[0];
    const selectedActivities = destination.activities.slice(0, 3);

    const totalCost = (selectedFlight.price * travelers) + (activeHotel.pricePerNight * 3) +
        selectedActivities.reduce((acc, a) => acc + a.price, 0);

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
                        <div className="p-0 text-left">
                            <div className="bg-[#9D1D27] p-8 pb-12 pt-12">
                                <div className="flex justify-between items-center mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center p-2 shadow-lg">
                                            <SafeImage src={booking.flight.airlineLogo} className="w-full h-full object-contain" alt="" category="flight" />
                                        </div>
                                        <div>
                                            <p className="text-white font-black text-xl leading-none">{booking.flight.airline}</p>
                                            <p className="text-red-100 text-xs font-bold uppercase tracking-widest mt-1">{booking.flight.flightNumber || 'FL-' + Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
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
                                        <p className="text-red-100 text-xs font-bold uppercase">Dubai</p>
                                    </div>
                                    <div className="flex-1 px-4 relative flex items-center justify-center">
                                        <div className="w-full border-t-2 border-dashed border-red-400 opacity-50" />
                                        <Plane size={24} className="text-white absolute rotate-90" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-white text-4xl font-black mb-1">{booking.flight.destinationIata}</p>
                                        <p className="text-red-100 text-xs font-bold uppercase">{destination.name}</p>
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
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <div>
                                            <p className="text-slate-900 dark:text-white font-bold text-sm">Confirmed</p>
                                            <p className="text-slate-400 text-[10px] font-bold">Booking id: {booking.flight.id}</p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600">
                                        <CheckCircle2 size={16} strokeWidth={3} />
                                    </div>
                                </div>

                                <div className="flex flex-col items-center">
                                    <div className="w-full h-24 bg-white dark:bg-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center border-2 border-slate-50 dark:border-slate-800 overflow-hidden">
                                        <img src="https://static.vecteezy.com/system/resources/previews/001/199/360/original/barcode-png.png" className="h-12 w-full object-contain mb-2 dark:invert" />
                                        <p className="font-mono text-[10px] tracking-widest text-slate-400 uppercase">MC-{booking.flight.id.substr(0, 8).toUpperCase()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Hotel Detail View */}
                    {booking.hotel && (
                        <div className="text-left">
                            <div className="relative h-64">
                                <SafeImage src={booking.hotel.imageUrl || booking.hotel.image} className="w-full h-full object-cover" alt="" category="hotel" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                                <div className="absolute bottom-6 left-8 right-8">
                                    <div className="flex items-center gap-2 mb-2">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill="#fbbf24" className="text-yellow-400" />)}
                                    </div>
                                    <h2 className="text-white text-3xl font-black mb-1">{booking.hotel.name}</h2>
                                    <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase">
                                        <MapPin size={12} />
                                        <span>{destination.name}</span>
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
                                        <p className="text-[#9D1D27] font-black text-lg">3</p>
                                    </div>
                                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                                    <div className="text-center flex-1">
                                        <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Check-out</p>
                                        <p className="text-slate-900 dark:text-white font-black text-lg">18 Oct</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                                            <Building2 size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-slate-900 dark:text-white font-bold">Standard Room</p>
                                            <p className="text-slate-400 text-xs font-bold">2 Adults • King Bed</p>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={onClose} className="w-full py-5 bg-[#9D1D27] text-white rounded-2xl font-black text-lg shadow-xl shadow-red-600/30 active:scale-95 transition-transform">
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                    {/* Experience Detail View */}
                    {booking.experience && (
                        <div className="text-left">
                            <div className="relative h-64">
                                <SafeImage src={booking.experience.imageUrl || booking.experience.image} className="w-full h-full object-cover" alt="" category="activity" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                                <div className="absolute bottom-6 left-8 right-8 text-white">
                                    <div className="flex items-center gap-2 mb-2 bg-amber-500 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-amber-500/20">
                                        <Sparkles size={10} /> Experience
                                    </div>
                                    <h2 className="text-3xl font-black mb-1">{booking.experience.activityName}</h2>
                                    <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase italic">
                                        <MapPin size={12} />
                                        <span>{destination.name}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8">
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] text-center">
                                        <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Date</p>
                                        <p className="text-slate-900 dark:text-white font-black text-lg">{booking.experience.date}</p>
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] text-center">
                                        <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Time</p>
                                        <p className="text-[#9D1D27] font-black text-lg">{booking.experience.time}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 shadow-sm">
                                            <QrCode size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-slate-900 dark:text-white font-bold text-sm">Booking Reference</p>
                                            <p className="text-slate-400 text-xs font-bold font-mono">{booking.experience.bookingRef}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                                        <div>
                                            <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Guests</p>
                                            <p className="text-slate-900 dark:text-white font-bold">{booking.experience.quantity || 1} Person{(booking.experience.quantity || 1) > 1 ? 's' : ''}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Total</p>
                                            <p className="text-slate-900 dark:text-white font-bold">INR {(booking.experience.price * (booking.experience.quantity || 1)).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center mb-8">
                                    <div className="w-full h-24 bg-white dark:bg-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center border-2 border-slate-50 dark:border-slate-800 overflow-hidden shadow-sm">
                                        <img src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${booking.experience.bookingRef}&scale=2&height=10&includetext`} className="h-12 w-full object-contain mb-2 dark:invert" />
                                        <p className="font-mono text-[10px] tracking-widest text-slate-400 uppercase">EXPERIENCE AUTHENTICATED</p>
                                    </div>
                                </div>

                                <button onClick={onClose} className="w-full py-5 bg-[#9D1D27] text-white rounded-2xl font-black text-lg shadow-xl shadow-red-600/30 active:scale-95 transition-transform">
                                    Done
                                </button>
                            </div>
                        </div >
                    )}
                </motion.div >
            </motion.div >
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pb-32">
            {/* Premium Sticky Header */}
            <div className="sticky top-0 z-50 bg-[#9D1D27] border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-lg">
                <button onClick={onBack} className="p-2 -ml-2 text-white">
                    <ArrowLeft size={24} strokeWidth={2.5} />
                </button>
                <div className="flex-1 px-4 text-center">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-200/80">Your Masterpiece</h2>
                    <p className="text-lg font-black text-white truncate italic">{destination.name} Escape</p>
                </div>
                <button className="p-2 -mr-2 text-white/80">
                    <Share2 size={24} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pt-6 px-6 space-y-10">
                {/* Hero Summary Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#9D1D27] rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-red-900/20"
                >
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-2">
                            <Sparkles size={20} className="text-red-300" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-100">AI Curation Complete</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-red-100/80 mb-1 leading-none uppercase tracking-widest">Estimated Budget</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black tabular-nums">INR {totalCost.toLocaleString()}</span>
                                <span className="text-lg font-bold opacity-60">total</span>
                            </div>
                        </div>
                        <div className="pt-4 flex items-center gap-4">
                            <div className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10">
                                {travelers} Travelers
                            </div>
                            <div className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10">
                                Premium Class
                            </div>
                        </div>
                    </div>
                    {/* Watermark Bull */}
                    <div className="absolute top-1/2 -right-12 -translate-y-1/2 w-48 h-48 opacity-[0.08] pointer-events-none">
                        <img src="/images/IDFC_First_Logo.png" className="w-full h-full object-contain brightness-0 invert" alt="" />
                    </div>
                </motion.div>

                {/* Section: Flights Carousel */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                                <Plane size={16} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">The Journey</h3>
                        </div>
                        {!curation.flightBooking && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse">
                                <ArrowRight size={12} className="text-slate-400" />
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Slide to swap</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x -mx-6 px-6">
                        {curation.flightBooking ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => {
                                    const booking = confirmedBookings.find(b => b.flight?.id === curation.flightBooking?.flightId);
                                    if (booking) setSelectedBooking(booking);
                                }}
                                className="w-full bg-white dark:bg-slate-900 rounded-[32px] p-6 border-2 border-green-500 shadow-xl space-y-6 relative overflow-hidden cursor-pointer"
                            >
                                <div className="absolute top-0 right-0 p-4">
                                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                        <CheckCircle2 size={12} /> Confirmed
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 p-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <SafeImage src={curation.flightBooking.airlineLogo} className="w-full h-full object-contain" alt="" category="flight" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic">{curation.flightBooking.airline}</p>
                                        <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">{curation.flightBooking.bookingRef}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/10 rounded-2xl p-4 border border-green-100 dark:border-green-900/20">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">{curation.flightBooking.originIata}</p>
                                        <p className="text-xl font-black text-slate-900 dark:text-white">{curation.flightBooking.departureTime}</p>
                                    </div>
                                    <div className="flex-1 flex flex-col items-center px-4">
                                        <Plane size={16} className="text-green-500" />
                                        <div className="w-full h-px border-t border-dashed border-green-300 dark:border-green-800 mt-1" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">{curation.flightBooking.destinationIata}</p>
                                        <p className="text-xl font-black text-slate-900 dark:text-white">{curation.flightBooking.arrivalTime}</p>
                                    </div>
                                </div>
                                <button
                                    className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const booking = confirmedBookings.find(b => b.flight?.id === curation.flightBooking?.flightId);
                                        if (booking) setSelectedBooking(booking);
                                    }}
                                >
                                    View Ticket Details
                                </button>
                            </motion.div>
                        ) : (
                            <>
                                {destination.flights.slice(0, flightLimit).map((flight, idx) => (
                                    <motion.div
                                        key={flight.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="min-w-[85vw] bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-xl space-y-8 snap-center"
                                    >
                                        {/* Header: Airline & Price */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 p-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
                                                    <SafeImage src={flight.airlineLogo} className="w-full h-full object-contain opacity-80" alt="" category="flight" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 dark:text-white italic leading-none">{flight.airline}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">Direct · {flight.duration || '2h 15m'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-1 justify-end">
                                                    <span className="text-xs font-bold text-slate-400">INR</span>
                                                    <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{flight.price.toLocaleString()}</p>
                                                </div>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Economy</p>
                                            </div>
                                        </div>

                                        {/* Minimal Route Visualization */}
                                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 px-6">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-none">{flight.originIata}</p>
                                                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{flight.departureTime}</p>
                                            </div>

                                            <div className="flex-1 flex flex-col items-center px-4">
                                                <div className="w-full h-[2px] bg-slate-200 dark:bg-slate-700 relative">
                                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 p-1 border border-slate-100 dark:border-slate-800 rounded-full">
                                                        <Plane size={14} className="text-slate-400 rotate-90" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right space-y-1">
                                                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-none">{flight.destinationIata}</p>
                                                <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{flight.arrivalTime}</p>
                                            </div>
                                        </div>

                                        {/* Minimalist CTA */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {idx === 0 && (
                                                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/5 rounded-full border border-red-600/10">
                                                        <Sparkles size={12} className="text-red-600" />
                                                        <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">Masterpiece Pick</span>
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => onBookFlight(flight, 'details')}
                                                className="px-6 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all"
                                            >
                                                Book
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                                {flightLimit < destination.flights.length && (
                                    <PullToLoad onLoad={() => setFlightLimit(prev => prev + 6)} label="Flights" />
                                )}
                            </>
                        )}
                    </div>
                </section>

                {/* Section: Hotels Carousel */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/20">
                                <HotelIcon size={16} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">The Residence</h3>
                        </div>
                        {!curation.hotelBooking && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/10 rounded-full animate-pulse">
                                <ArrowRight size={12} className="text-red-400" />
                                <span className="text-[8px] font-black text-red-400 uppercase tracking-widest">Compare stays</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x -mx-6 px-6">
                        {curation.hotelBooking ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => {
                                    const booking = confirmedBookings.find(b => b.hotel?.id === curation.hotelBooking?.hotelId);
                                    if (booking) setSelectedBooking(booking);
                                }}
                                className="w-full bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border-2 border-green-500 shadow-xl relative cursor-pointer"
                            >
                                <div className="absolute top-4 right-4 z-10">
                                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                                        <CheckCircle2 size={12} /> Stays Secured
                                    </div>
                                </div>
                                <div className="h-48 relative">
                                    <SafeImage src={curation.hotelBooking.imageUrl} className="w-full h-full object-cover" alt="" category="hotel" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-4 left-6">
                                        <h4 className="text-xl font-black text-white italic">{curation.hotelBooking.hotelName}</h4>
                                        <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest">{curation.hotelBooking.bookingRef}</p>
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 rounded-2xl p-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Room Type</p>
                                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase italic">{curation.hotelBooking.roomType}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase">Status</p>
                                            <p className="text-sm font-black text-green-600 uppercase italic">Confirmed</p>
                                        </div>
                                    </div>
                                    <button
                                        className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const booking = confirmedBookings.find(b => b.hotel?.id === curation.hotelBooking?.hotelId);
                                            if (booking) setSelectedBooking(booking);
                                        }}
                                    >
                                        View Residence Details
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <>
                                {destination.hotels.slice(0, hotelLimit).map((hotel, idx) => (
                                    <motion.div
                                        key={hotel.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="min-w-[85vw] bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xl group snap-center"
                                    >
                                        <div className="h-64 relative overflow-hidden">
                                            <SafeImage
                                                src={hotel.imageUrl}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                alt=""
                                                category="hotel"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                            <div className="absolute top-4 right-4 flex gap-2">
                                                <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-white flex items-center gap-1.5 border border-white/20">
                                                    <Star size={10} className="text-yellow-400 fill-yellow-400" /> {hotel.rating}
                                                </div>
                                            </div>

                                            <div className="absolute bottom-6 left-6">
                                                <h4 className="text-2xl font-black text-white italic leading-none">{hotel.name}</h4>
                                            </div>
                                        </div>

                                        <div className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Starts from</p>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-xs font-bold text-slate-400">INR</span>
                                                        <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{hotel.pricePerNight.toLocaleString()}</p>
                                                        <span className="text-[10px] text-slate-400 font-bold ml-1">/ night</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">total · 3 nights</p>
                                                </div>
                                                <button
                                                    onClick={() => onBookStay(hotel, 'details')}
                                                    className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-600/20 active:scale-95 transition-all"
                                                >
                                                    Secure Stay
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {hotelLimit < destination.hotels.length && (
                                    <PullToLoad onLoad={() => setHotelLimit(prev => prev + 6)} label="Hotels" />
                                )}
                            </>
                        )}
                    </div>
                </section>

                {/* Section: Experiences */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <Sparkles size={16} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">The Curations</h3>
                        </div>
                        {selectedActivitiesIds.length > 0 && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => {
                                    const selectedActivities = destination.activities.filter(a => selectedActivitiesIds.includes(a.id));
                                    onBookExperiences(selectedActivities);
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-600/20 active:scale-95 transition-all"
                            >
                                Checkout ({selectedActivitiesIds.length})
                            </motion.button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {selectedActivities.map((act, idx) => {
                            // Check if this activity is already booked in the curation
                            const booking = curation.activityBookings?.find(b => b.id === act.id);
                            // Also check global confirmed bookings as fallback
                            const confirmedBooking = booking || confirmedBookings.find(b => b.experience?.activityId === act.id);

                            return (
                                <motion.div
                                    key={act.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    onClick={() => {
                                        if (confirmedBooking) {
                                            setSelectedBooking({
                                                experience: {
                                                    ...confirmedBooking,
                                                    imageUrl: act.imageUrl,
                                                    activityName: confirmedBooking.name || act.name
                                                }
                                            });
                                        }
                                    }}
                                    className={`bg-white dark:bg-slate-900 p-4 rounded-3xl border shadow-lg flex items-center gap-4 group transition-all ${confirmedBooking ? 'border-green-500 cursor-pointer scale-[1.02]' : 'border-slate-100 dark:border-slate-800'
                                        }`}
                                >
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 shadow-md">
                                        <SafeImage src={act.imageUrl} alt={act.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" category={act.category?.toLowerCase() === 'dining' ? 'dining' : 'activity'} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h5 className="font-black text-slate-900 dark:text-white truncate">{act.name}</h5>
                                            {confirmedBooking && (
                                                <div className="bg-green-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                                    <CheckCircle2 size={8} /> Confirmed
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase mt-1">
                                            <span className="flex items-center gap-1"><Clock size={12} /> {act.duration}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                            <span className="text-red-600">{act.category}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="font-black text-slate-900 dark:text-white">INR {act.price}</p>
                                            {!confirmedBooking && (
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const isSelected = selectedActivitiesIds.includes(act.id);
                                                        if (isSelected) {
                                                            setSelectedActivitiesIds(prev => prev.filter(id => id !== act.id));
                                                        } else {
                                                            setSelectedActivitiesIds(prev => [...prev, act.id]);
                                                        }
                                                    }}
                                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${selectedActivitiesIds.includes(act.id)
                                                        ? 'bg-red-600 border-red-600 text-white'
                                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                                                        }`}
                                                >
                                                    {selectedActivitiesIds.includes(act.id) && (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                        >
                                                            <CheckCircle2 size={14} />
                                                        </motion.div>
                                                    )}
                                                </div>
                                            )}
                                            {confirmedBooking && (
                                                <button
                                                    className="text-[8px] font-black text-green-600 uppercase tracking-widest bg-green-50 dark:bg-green-900/10 px-2 py-1 rounded-md"
                                                >
                                                    View Ticket
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </section>
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

export default MobileAICuration;
