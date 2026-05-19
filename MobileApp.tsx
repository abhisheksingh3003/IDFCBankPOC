import React, { useState, useEffect, useRef } from 'react';
import {
    Home,
    Briefcase,
    Ticket,
    User,
    Search,
    Bell,
    Menu,
    ChevronLeft,
    Map as MapIcon,
    Sparkles,
    Power,
    Phone,
    ScanLine,
    ArrowRightLeft,
    LayoutGrid,
    History,
    Wallet,
    Plane,
    Check,
    MapPin,
    Calendar,
    Clock,
    ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Theme, ManualTripContextState } from './types';


// --- Types ---
type AppState = 'loader' | 'login' | 'bank-home' | 'travel';

// --- Components ---

const BankLoader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 3000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center">
            <img
                src="/images/IDFC_First_Logo.png"
                alt="IDFC First Bank"
                className="w-48 h-auto object-contain animate-pulse"
            />
        </div>
    );
};

const BankLogin: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
    return (
        <div className="min-h-screen bg-slate-50 relative flex flex-col">
            {/* Image Grid Background */}
            <div className="absolute top-0 left-0 w-full h-[65%] z-0 overflow-hidden">
                <img
                    src="/login-bg-grid.png"
                    className="w-full h-full object-cover object-top"
                    alt="Background"
                />
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-end px-6 pb-4 items-center text-center">
                <div className="w-20 h-20 mb-6 mt-0">
                    <img src="/images/IDFC_First_Logo.png" alt="IDFC First Bank" className="w-full h-full object-contain" />
                </div>

                <h1 className="text-3xl font-bold text-slate-900 mb-6">Welcome to IDFC First Bank Pay</h1>

                <button
                    onClick={onLogin}
                    className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-red-600/30 active:scale-95 transition-transform mb-3"
                >
                    Log in
                </button>

                <button className="w-full py-4 bg-white text-slate-900 border border-red-100 rounded-2xl font-bold text-lg shadow-sm active:scale-95 transition-transform">
                    Become an IDFC First Bank customer
                </button>
            </div>


        </div>
    );
};

const BankDashboard: React.FC<{ onTravelClick: () => void; onLogout: () => void }> = ({ onTravelClick, onLogout }) => {
    return (
        <div className="min-h-screen bg-slate-100 pb-20">
            {/* Header */}
            <div className="mc-gradient text-white px-6 pt-4 pb-32 shadow-lg relative z-0">
                <div className="flex justify-between items-center mb-0">
                    <button
                        onClick={onLogout}
                        className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center"
                    >
                        <Power size={20} className="text-white" strokeWidth={2.5} />
                    </button>
                    <div className="flex items-center gap-3">
                        <img src="/images/IDFC_First_Logo.png" alt="IDFC First Bank" className="h-8 brightness-0 invert" />
                        <span className="font-bold text-xl tracking-wide">IDFC First Bank</span>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#9D1D27]">
                        <Phone size={20} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            {/* Cards - Overlapping Header */}
            <div className="flex gap-4 overflow-x-auto pb-8 -mt-24 px-6 scrollbar-hide snap-x relative z-10">
                {/* Account Card */}
                <div className="bg-white text-slate-900 p-6 rounded-[32px] min-w-[85%] shadow-xl snap-center relative overflow-hidden h-48 flex flex-col justify-between">
                    <div className="relative z-10">
                        <h3 className="font-bold text-[#1a1a1a] mb-8 text-lg">Elite Checking Account</h3>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Available funds</p>
                            <div className="text-3xl font-black text-[#1a1a1a] tracking-tight">7,122.70 <span className="text-xl font-bold text-slate-500">INR</span></div>
                        </div>
                    </div>
                    {/* Watermark */}
                    <div className="absolute top-1/2 -right-8 w-48 h-48 opacity-[0.03] pointer-events-none -translate-y-1/2">
                        <img src="/images/IDFC_First_Logo.png" className="w-full h-full object-contain" />
                    </div>
                </div>
                {/* Second Card Preview */}
                <div className="bg-white text-slate-900 p-6 rounded-[32px] min-w-[85%] shadow-xl snap-center relative overflow-hidden h-48 flex flex-col justify-between">
                    <div className="relative z-10">
                        <h3 className="font-bold text-[#1a1a1a] mb-8 text-lg">Account ...</h3>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Availability...</p>
                            <div className="text-3xl font-black text-[#1a1a1a] tracking-tight">1 87...</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shortcuts Grid */}
            <div className="px-6 mt-2 relative z-10 grid grid-cols-4 gap-4 mb-8">
                <Shortcut
                    icon={<div className="w-8 h-8 rounded-full bg-[#9D1D27] flex items-center justify-center text-white italic font-serif font-black text-xl pb-1 pr-0.5">b</div>}
                    label="BLIK"
                    bg="bg-brand-red"
                />
                <Shortcut
                    icon={<ArrowRightLeft size={24} className="text-white" />}
                    label="Transfer"
                    bg="bg-brand-red"
                />
                <Shortcut
                    icon={<ScanLine size={24} className="text-white" />}
                    label="Scan and pay"
                    bg="bg-brand-red"
                />
                <Shortcut
                    icon={<MapIcon size={28} className="text-[#9D1D27]" strokeWidth={2} />}
                    label="IDFC First Bank Travel"
                    bg="bg-white"
                    isWhite
                    onClick={onTravelClick}
                    isNew
                />
            </div>

            {/* Recent Transactions */}
            <div className="px-6 space-y-4">
                <button className="w-full py-4 bg-white border border-amber-400 text-slate-900 rounded-2xl font-bold flex items-center justify-between px-4 shadow-sm">
                    <span className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-white shadow-sm">
                            <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                            </div>
                        </div>
                        <span className="text-slate-700 font-bold">Express loan</span>
                    </span>
                    <ChevronLeft className="rotate-180 text-slate-400" size={24} />
                </button>

                <div className="bg-[#f3f4f600] rounded-3xl p-2 mb-6">
                    <div className="flex justify-between items-center mb-2 px-2">
                        <h3 className="text-slate-500 font-medium">Recent transactions</h3>
                        <button className="text-[#9D1D27] text-sm font-bold">More</button>
                    </div>
                    <div className="bg-white rounded-3xl p-4 shadow-sm space-y-6">
                        <Transaction name="Grocery" type="Card payment" amount="- 120.90 INR" />
                        <Transaction name="Internet shop" type="BLIK" amount="- 43.79 INR" />
                    </div>
                </div>
            </div>

            {/* Bottom Nav */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 flex justify-between px-6 py-3 z-50">
                <NavItem icon={<Home size={24} />} label="Home" active />
                <NavItem icon={<ArrowRightLeft size={24} />} label="Payments" />
                <NavItem icon={<History size={24} />} label="History" />
                <NavItem icon={<Wallet size={24} />} label="Products" />
                <NavItem icon={<Menu size={24} />} label="More" />
            </div>
        </div>
    );
};

// Helpers for BankDashboard
// Helpers for BankDashboard
const Shortcut = ({ icon, label, onClick, isNew, bg = "bg-white", isWhite }: { icon: React.ReactNode, label: string, onClick?: () => void, isNew?: boolean, bg?: string, isWhite?: boolean }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group">
        <div className={`w-[72px] h-[72px] ${bg} rounded-full flex items-center justify-center ${isWhite ? 'text-red-600 shadow-lg' : 'text-white'} group-active:scale-95 transition-transform relative border-4 border-slate-100`}>
            {icon}
            {isNew && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">NEW</span>}
        </div>
        <span className="text-[11px] font-bold text-slate-800 tracking-wide">{label}</span>
    </button>
);

const Transaction = ({ name, type, amount, color = "text-slate-900" }: { name: string, type: string, amount: string, color?: string }) => (
    <div className="flex justify-between items-center last:border-0">
        <div className="text-left">
            <p className="font-bold text-[#1a1a1a] text-lg mb-0.5">{name}</p>
            <p className="text-xs text-slate-400 font-medium">{type}</p>
        </div>
        <span className={`font-bold ${color} text-lg`}>{amount}</span>
    </div>
);

const NavItem = ({ icon, label, active }: { icon: React.ReactNode, label: string, active?: boolean }) => (
    <button className={`flex flex-col items-center gap-1 ${active ? 'text-red-600' : 'text-slate-400'}`}>
        {icon}
        <span className="text-[10px] font-bold">{label}</span>
    </button>
);


// --- Refactored Travel App Module ---
import MobileManualPlanner from './components/MobileManualPlanner';
import MobileAITripBuilder from './components/MobileAITripBuilder';
import MobileManualResults from './components/MobileManualResults';
import MobileBookings from './components/MobileBookings';
import MobileAILoader from './components/MobileAILoader';
import MobileAICuration from './components/MobileAICuration';
import MyCurationsView from './components/MyCurationsView';
import { speakText } from './services/speechService';
import { DESTINATIONS } from './mockData';


const TravelModule: React.FC<{ onBack: () => void; onShowAssistant: () => void }> = ({ onBack, onShowAssistant }) => {
    const [view, setView] = useState<'home' | 'manual-planner' | 'manual-results' | 'ai-builder' | 'ai-loading' | 'ai-curation'>('home');
    const [activeTab, setActiveTab] = useState('home');
    const [manualTripData, setManualTripData] = useState<ManualTripContextState | null>(null);
    const [aiCurationData, setAICurationData] = useState<any | null>(null);
    const [aiCurations, setAICurations] = useState<any[]>([]);
    const [isLoadingManual, setIsLoadingManual] = useState(false);
    const [confirmedBookings, setConfirmedBookings] = useState<any[]>([]);

    const handleBookingComplete = (newBooking: any, navigate: boolean = true) => {
        setConfirmedBookings(prev => {
            const updated = [newBooking, ...prev];
            return updated;
        });

        // If it's a curation booking, update the curation state
        if (aiCurationData) {
            setAICurations(prev => prev.map(c => {
                if (c.curationId === aiCurationData.curationId) {
                    const updatedCuration = { ...c };
                    if (newBooking.flight) {
                        updatedCuration.flightBooking = {
                            flightId: newBooking.flight.id,
                            bookingRef: `FL-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                            price: newBooking.flight.price,
                            airline: newBooking.flight.airline,
                            airlineLogo: newBooking.flight.airlineLogo,
                            departureTime: newBooking.flight.departureTime,
                            arrivalTime: newBooking.flight.arrivalTime,
                            duration: newBooking.flight.duration,
                            originIata: newBooking.flight.originIata,
                            destinationIata: newBooking.flight.destinationIata
                        };
                    }
                    if (newBooking.hotel) {
                        updatedCuration.hotelBooking = {
                            hotelId: newBooking.hotel.id,
                            bookingRef: `HTL-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                            totalPrice: newBooking.hotel.pricePerNight * 3, // Assuming 3 nights for now
                            hotelName: newBooking.hotel.name,
                            imageUrl: newBooking.hotel.imageUrl,
                            roomType: 'Standard'
                        };
                    }
                    if (newBooking.experiences && Array.isArray(newBooking.experiences)) {
                        // Update activities
                        const newActivities = newBooking.experiences.map((exp: any) => ({
                            id: exp.activityId,
                            bookingRef: exp.bookingRef,
                            date: exp.date,
                            time: exp.time,
                            price: exp.price,
                            name: exp.activityName,
                            quantity: exp.quantity
                        }));
                        updatedCuration.activityBookings = [
                            ...(updatedCuration.activityBookings || []),
                            ...newActivities
                        ];
                    }
                    return updatedCuration;
                }
                return c;
            }));

            // Also update the active curation data
            setAICurationData(prev => {
                const updatedCuration = { ...prev };
                if (newBooking.flight) {
                    updatedCuration.flightBooking = {
                        flightId: newBooking.flight.id,
                        bookingRef: `FL-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                        price: newBooking.flight.price,
                        airline: newBooking.flight.airline,
                        airlineLogo: newBooking.flight.airlineLogo,
                        departureTime: newBooking.flight.departureTime,
                        arrivalTime: newBooking.flight.arrivalTime,
                        duration: newBooking.flight.duration,
                        originIata: newBooking.flight.originIata,
                        destinationIata: newBooking.flight.destinationIata
                    };
                }
                if (newBooking.hotel) {
                    updatedCuration.hotelBooking = {
                        hotelId: newBooking.hotel.id,
                        bookingRef: `HTL-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                        totalPrice: newBooking.hotel.pricePerNight * 3,
                        hotelName: newBooking.hotel.name,
                        imageUrl: newBooking.hotel.imageUrl,
                        roomType: 'Standard'
                    };
                }
                if (newBooking.experiences && Array.isArray(newBooking.experiences)) {
                    // Update activities
                    const newActivities = newBooking.experiences.map((exp: any) => ({
                        id: exp.activityId,
                        bookingRef: exp.bookingRef,
                        date: exp.date,
                        time: exp.time,
                        price: exp.price,
                        name: exp.activityName
                    }));
                    updatedCuration.activityBookings = [
                        ...(updatedCuration.activityBookings || []),
                        ...newActivities
                    ];
                }
                return updatedCuration;
            });
        }

        if (navigate) {
            setView('home');
            setActiveTab('bookings');
        }
    };

    // Reuse existing MobileHome content but ensure it fits
    const MobileHome = () => (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header - Kept EXACTLY as is */}
            <motion.div layoutId="travel-header-background" className="mc-gradient text-white px-6 pt-4 pb-4 shadow-lg relative z-20 mb-6">
                <div className="flex justify-between items-center mb-0">
                    <button
                        onClick={onBack}
                        className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <ChevronLeft size={24} className="text-white" strokeWidth={2.5} />
                    </button>
                    <div className="flex items-center gap-3">
                        <img src="/images/IDFC_First_Logo.png" alt="IDFC First Bank" className="h-8 brightness-0 invert" />
                        <span className="font-bold text-xl tracking-wide">IDFC First Bank</span>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#9D1D27]">
                        <Phone size={20} strokeWidth={2.5} />
                    </button>
                </div>
            </motion.div>

            <div className="space-y-8 pb-32 -mt-4 relative z-10">



                {/* 2. Hero Cards - The Core Planners */}
                <div className="px-6 space-y-5">
                    <div className="flex justify-between items-end px-1">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-none">Start<br /><span className="text-red-600">Planning</span></h1>
                    </div>

                    {/* Manual Planner - Premium Gradient (Red to Black) */}
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setView('manual-planner')}
                        className="w-full relative h-48 rounded-[32px] overflow-hidden shadow-xl shadow-red-900/20 group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-black via-red-900 to-red-600"></div>
                        {/* Abstract Shapes */}
                        <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-black/40 rounded-full blur-2xl"></div>

                        <div className="absolute inset-0 p-6 flex flex-col justify-between z-10 text-left">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white">
                                    <MapIcon size={24} strokeWidth={2.5} />
                                </div>
                                <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">Custom</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">Manual Planner</h2>
                                <p className="text-red-100/80 text-sm font-medium">For the control enthusiast.</p>
                            </div>
                        </div>
                        <div className="absolute right-0 bottom-0 w-32 h-32 opacity-20">
                            <Plane size={120} className="text-white translate-x-4 translate-y-4 -rotate-45" />
                        </div>
                    </motion.button>

                    {/* AI Builder - Premium Gradient */}
                    {/* AI Builder - Premium Gradient */}
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setView('ai-builder')}
                        className="w-full relative h-48 rounded-[32px] overflow-hidden shadow-xl shadow-red-500/20 group"
                    >
                        <div className="absolute inset-0 mc-gradient"></div>
                        {/* Abstract Shapes */}
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
                        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-red-800/20 rounded-full blur-2xl"></div>

                        <div className="absolute inset-0 p-6 flex flex-col justify-between z-10 text-left">
                            <div className="flex justify-between items-start">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white">
                                    <Sparkles size={24} fill="currentColor" className="text-white" />
                                </div>
                                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">Most Popular</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">AI Trip Generatør</h2>
                                <p className="text-red-50 text-sm font-medium">Create a full itinerary in seconds.</p>
                            </div>
                        </div>
                        <div className="absolute right-0 bottom-0 w-32 h-32 opacity-20">
                            <Sparkles size={120} className="text-red-600 translate-x-10 translate-y-10" />
                        </div>
                    </motion.button>
                </div>

                {/* 3. Horizontal Curated/Trending */}
                <div className="pl-6">
                    <div className="flex justify-between items-center pr-6 mb-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Curated for You</h3>
                        <button className="text-red-600 text-xs font-bold">See All</button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-8 pr-6 scrollbar-hide snap-x">
                        {[
                            { title: 'Weekend in Alps', price: 'INR 1,200', img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=400' },
                            { title: 'Kyoto zen', price: 'INR 3,450', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=400' },
                            { title: 'Safari Kenya', price: 'INR 5,100', img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=400' },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                className="min-w-[220px] h-[280px] rounded-3xl overflow-hidden relative snap-center shadow-md bg-slate-200"
                            >
                                <img src={item.img} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                <div className="absolute bottom-4 left-4 text-white">
                                    <p className="font-bold text-lg leading-tight mb-1">{item.title}</p>
                                    <p className="text-xs font-medium opacity-80">Starting from <span className="text-amber-400 font-bold">{item.price}</span></p>
                                </div>
                                <button className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                                    <div className="translate-y-[1px]">♡</div>
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );

    const MobileCurations = () => (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-32">
            <div className="bg-[#9D1D27] z-40 shadow-xl pb-4 sticky top-0">
                <div className="px-6 pt-6 pb-4">
                    <div className="relative flex items-center justify-center">
                        <button
                            onClick={() => setActiveTab('home')}
                            className="absolute left-0 w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center active:scale-95 transition-transform"
                        >
                            <ChevronLeft size={24} className="text-white" strokeWidth={2.5} />
                        </button>
                        <h1 className="text-2xl font-black text-white">My Curations</h1>
                    </div>
                </div>
            </div>

            <div className="px-6 py-6 overflow-y-auto">
                <MyCurationsView
                    curations={aiCurations}
                    onView={(id) => {
                        const curation = aiCurations.find(c => c.curationId === id);
                        if (curation) {
                            setAICurationData(curation);
                            setView('ai-curation');
                        }
                    }}
                />
            </div>
        </div>
    );

    const renderContent = () => {
        if (view === 'manual-planner') {
            return (
                <MobileManualPlanner
                    onStartBuilding={(data) => {
                        console.log('Start Building Manual:', data);
                        setManualTripData(data);
                        setIsLoadingManual(true);
                        // Simulate loading
                        setTimeout(() => {
                            setIsLoadingManual(false);
                            setView('manual-results');
                        }, 3000);
                    }}
                    onBack={() => setView('home')}
                />
            );
        }

        if (view === 'manual-results' && manualTripData) {
            return (
                <MobileManualResults
                    tripData={manualTripData}
                    onBack={() => {
                        if (aiCurationData) {
                            setView('ai-curation');
                        } else {
                            setView('home');
                        }
                    }}
                    onBookingComplete={handleBookingComplete}
                    isCurationBooking={!!aiCurationData && view === 'manual-results' && (manualTripData.selectedFlight !== null || manualTripData.selectedHotel !== null || manualTripData.selectedActivities.length > 0)}
                />
            );
        }

        if (view === 'ai-builder') {
            return (
                <MobileAITripBuilder
                    onGenerate={(data) => {
                        console.log('Generate AI Trip:', data);
                        // Find matching destination or default to Paris
                        const dest = DESTINATIONS.find(d =>
                            d.name.toLowerCase().includes(data.destination.toLowerCase())
                        ) || DESTINATIONS[1];

                        const newCuration = {
                            curationId: 'AI-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                            destination: dest,
                            travelers: data.travelers,
                            status: 'draft',
                            itinerary: [], // Mock or generate if needed
                        };
                        setAICurationData(newCuration);
                        setAICurations(prev => [newCuration, ...prev]);
                        setView('ai-loading');
                    }}
                    isLoading={false}
                    onBack={() => setView('home')}
                />
            );
        }

        if (view === 'ai-loading') {
            return (
                <MobileAILoader
                    onComplete={() => setView('ai-curation')}
                />
            );
        }

        if (view === 'ai-curation' && aiCurationData) {
            return (
                <MobileAICuration
                    curation={aiCurationData}
                    onBack={() => setView('home')}
                    confirmedBookings={confirmedBookings}
                    onBookStay={(hotel, step) => {
                        const tripData: ManualTripContextState = {
                            tripName: aiCurationData.destination.name,
                            source: 'Current Location',
                            destination: aiCurationData.destination.name,
                            fromDate: aiCurationData.startDate || new Date().toISOString().split('T')[0],
                            toDate: aiCurationData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            travelers: { adults: aiCurationData.travelers, children: 0 },
                            preferences: { airline: 'Any', hotelChain: 'Any', carRental: 'Any' },
                            notes: '',
                            selectedFlight: null,
                            selectedHotel: hotel,
                            selectedRoomType: null,
                            selectedActivities: [],
                            selectedEssentials: []
                        };
                        setManualTripData(tripData);
                        setView('manual-results');
                        // We'll pass a flag to MobileManualResults to show it's a curation booking
                    }}
                    onBookFlight={(flight, step) => {
                        const tripData: ManualTripContextState = {
                            tripName: aiCurationData.destination.name,
                            source: 'Current Location',
                            destination: aiCurationData.destination.name,
                            fromDate: aiCurationData.startDate || new Date().toISOString().split('T')[0],
                            toDate: aiCurationData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            travelers: { adults: aiCurationData.travelers, children: 0 },
                            preferences: { airline: 'Any', hotelChain: 'Any', carRental: 'Any' },
                            notes: '',
                            selectedFlight: flight,
                            selectedHotel: null,
                            selectedRoomType: null,
                            selectedActivities: [],
                            selectedEssentials: []
                        };
                        setManualTripData(tripData);
                        setView('manual-results');
                    }}
                    onBookExperience={(act) => {
                        const tripData: ManualTripContextState = {
                            tripName: aiCurationData.destination.name,
                            source: 'Current Location',
                            destination: aiCurationData.destination.name,
                            fromDate: aiCurationData.startDate || new Date().toISOString().split('T')[0],
                            toDate: aiCurationData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            travelers: { adults: aiCurationData.travelers, children: 0 },
                            preferences: { airline: 'Any', hotelChain: 'Any', carRental: 'Any' },
                            notes: '',
                            selectedFlight: null,
                            selectedHotel: null,
                            selectedRoomType: null,
                            selectedActivities: [{
                                activityId: act.id,
                                bookingRef: 'REF-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
                                date: aiCurationData.startDate || new Date().toISOString().split('T')[0],
                                time: '10:00 AM',
                                price: act.price,
                                activityName: act.name,
                                quantity: 1,
                                imageUrl: act.imageUrl
                            }],
                            selectedEssentials: []
                        };
                        setManualTripData(tripData);
                        setView('manual-results');
                    }}
                    onBookExperiences={(acts) => {
                        const tripData: ManualTripContextState = {
                            tripName: aiCurationData.destination.name,
                            source: 'Current Location',
                            destination: aiCurationData.destination.name,
                            fromDate: aiCurationData.startDate || new Date().toISOString().split('T')[0],
                            toDate: aiCurationData.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                            travelers: { adults: aiCurationData.travelers, children: 0 },
                            preferences: { airline: 'Any', hotelChain: 'Any', carRental: 'Any' },
                            notes: '',
                            selectedFlight: null,
                            selectedHotel: null,
                            selectedRoomType: null,
                            selectedActivities: acts.map(act => ({
                                activityId: act.id,
                                bookingRef: 'REF-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
                                date: aiCurationData.startDate || new Date().toISOString().split('T')[0],
                                time: '10:00 AM',
                                price: act.price,
                                activityName: act.name,
                                quantity: 1,
                                imageUrl: act.imageUrl
                            })),
                            selectedEssentials: []
                        };
                        setManualTripData(tripData);
                        setView('manual-results');
                    }}
                />
            );
        }

        switch (activeTab) {
            case 'home': return <MobileHome />;
            case 'curations': return <MobileCurations />;
            case 'bookings': return <MobileBookings confirmedBookings={confirmedBookings} onBack={() => { setActiveTab('home'); setView('home'); }} />;
            default: return <MobileHome />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pb-[env(safe-area-inset-bottom)]">

            <main className="flex-1 overflow-y-auto relative">
                <AnimatePresence>
                    {isLoadingManual && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center"
                        >
                            <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 border-4 border-slate-200 dark:border-slate-800 border-t-red-600 rounded-full"
                                />
                                <Plane size={32} className="text-red-600" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Sourcing Inventory</h2>
                            <p className="text-slate-500 font-medium">Finding the best flights and hotels for your trip...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
                {renderContent()}
            </main>

            {/* Bottom Nav - Always Visible */}
            <div className="fixed bottom-0 left-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-end z-50 transition-all">
                <button onClick={() => { setActiveTab('home'); setView('home'); }} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-red-600' : 'text-slate-400'}`}>
                    <Home size={28} strokeWidth={2} />
                    <span className="text-[11px] font-bold">Home</span>
                </button>
                <div className="flex flex-col items-center gap-1">
                    <button onClick={onShowAssistant} className="w-14 h-14 rounded-full shadow-[0_0_30px_rgba(255,95,0,0.6)] flex items-center justify-center transform hover:scale-105 transition-transform bg-transparent">
                        <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-brand-orange/40 shadow-[0_0_20px_rgba(255,95,0,0.3)]">
                            <img src="/red-orb.png" alt="Search" className="w-full h-full object-cover scale-110" />

                            {/* Particle Overlay */}
                            <div className="absolute inset-0 pointer-events-none">
                                {[...Array(15)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute w-1 h-1 bg-white rounded-full opacity-80"
                                        initial={{
                                            x: Math.random() * 20,
                                            y: Math.random() * 20,
                                            scale: Math.random()
                                        }}
                                        animate={{
                                            y: [null, Math.random() * -10, Math.random() * 10],
                                            opacity: [0.8, 0.2, 0.8],
                                            scale: [0.5, 1.0, 0.5]
                                        }}
                                        transition={{
                                            duration: 1.5 + Math.random() * 1.5,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        style={{
                                            left: `${Math.random() * 100}%`,
                                            top: `${Math.random() * 100}%`,
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Glow Overlay */}
                            <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(255,100,100,0.6)] mix-blend-overlay"></div>
                        </div>
                    </button>
                    <span className="text-[11px] font-bold italic text-slate-500">Ask Anya</span>
                </div>
                <button onClick={() => { setActiveTab('bookings'); setView('home'); }} className={`flex flex-col items-center gap-1 ${activeTab === 'bookings' ? 'text-red-600' : 'text-slate-400'}`}>
                    <Ticket size={28} strokeWidth={2} />
                    <span className="text-[11px] font-bold">Bookings</span>
                </button>
                <button onClick={() => window.open('https://wa.me/+919028604659?text=Good%20morning%2C%20I%20need%20support%20regarding%20IDFC First Bank%20services.%20Please%20help', '_blank')} className={`flex flex-col items-center gap-1 text-slate-400`}>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span className="text-[11px] font-bold">Support</span>
                </button>
            </div>
        </div>
    );
};


// --- AI Assistant Overlay ---
const AIAssistantOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [text, setText] = useState('');
    const fullText = "Hi, I am Anya, your IDFC First Bank Travel assistant. How may I help you today?";
    const hasSpoken = useRef(false);

    useEffect(() => {
        // Typewriter effect
        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setText(fullText.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, 50);

        // TTS
        if (!hasSpoken.current) {
            speakText(fullText);
            hasSpoken.current = true;
        }

        return () => {
            clearInterval(interval);
            window.speechSynthesis.cancel();
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-xl flex flex-col items-center justify-center p-6"
            onClick={onClose}
        >
            <div className="relative flex flex-col items-center" onClick={e => e.stopPropagation()}>
                {/* Speaking Waves */}
                <div className="absolute inset-0 flex items-center justify-center -z-10">
                    {[1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full border border-red-500/30"
                            initial={{ width: 100, height: 100, opacity: 0.8 }}
                            animate={{
                                width: [100, 300],
                                height: [100, 300],
                                opacity: [0.5, 0],
                                borderWidth: ["2px", "0px"]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.6,
                                ease: "easeOut"
                            }}
                        />
                    ))}
                </div>

                {/* Big Orb */}
                <motion.div
                    layoutId="orb-expand"
                    className="w-48 h-48 rounded-full shadow-[0_0_80px_rgba(255,20,20,0.8)] relative mb-12 overflow-hidden"
                >
                    <img src="/red-orb.png" className="w-full h-full object-cover scale-110" />
                    <div className="absolute inset-0 rounded-full shadow-[inset_0_0_40px_rgba(255,255,255,0.2)] mix-blend-overlay"></div>

                    {/* Internal Particles */}
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-white rounded-full opacity-60"
                            animate={{
                                y: [0, -40, 0],
                                x: [0, Math.random() * 20 - 10, 0],
                                scale: [0.8, 1.2, 0.8],
                                opacity: [0.4, 0.8, 0.4]
                            }}
                            transition={{
                                duration: 2 + Math.random(),
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            style={{
                                left: `${20 + Math.random() * 60}%`,
                                top: `${20 + Math.random() * 60}%`,
                            }}
                        />
                    ))}
                </motion.div>

                {/* Typewriter Text */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-sm text-center border border-white/10 shadow-xl"
                >
                    <p className="text-2xl font-bold text-white leading-relaxed font-mono">
                        {text}
                        <span className="animate-pulse">|</span>
                    </p>
                </motion.div>

                <p className="mt-8 text-white/50 text-sm font-medium">Tap anywhere to close</p>
            </div>
        </motion.div>
    );
};


// --- Main App Component ---

const MobileApp: React.FC = () => {
    const [theme, setTheme] = useState<Theme>('light');
    const [appState, setAppState] = useState<AppState>('loader');
    const [showAssistant, setShowAssistant] = useState(false);

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') root.classList.add('dark');
        else root.classList.remove('dark');
    }, [theme]);

    return (
        <div className="font-sans text-slate-900">
            <AnimatePresence mode="wait">
                {appState === 'loader' && (
                    <motion.div key="loader" exit={{ opacity: 0 }} className="absolute inset-0 z-[100]">
                        <BankLoader onComplete={() => setAppState('login')} />
                    </motion.div>
                )}
                {appState === 'login' && (
                    <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[90]">
                        <BankLogin onLogin={() => setAppState('bank-home')} />
                    </motion.div>
                )}
                {appState === 'bank-home' && (
                    <motion.div key="bank-home" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute inset-0 z-[80]">
                        <BankDashboard
                            onTravelClick={() => setAppState('travel')}
                            onLogout={() => setAppState('login')}
                        />
                    </motion.div>
                )}
                {appState === 'travel' && (
                    <motion.div key="travel" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute inset-0 z-[100]">
                        <TravelModule onBack={() => setAppState('bank-home')} onShowAssistant={() => setShowAssistant(true)} />
                    </motion.div>
                )}
                {showAssistant && (
                    <AIAssistantOverlay onClose={() => setShowAssistant(false)} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default MobileApp;
