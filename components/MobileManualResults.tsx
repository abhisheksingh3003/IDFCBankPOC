import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plane, Hotel as HotelIcon, Camera, ShoppingBag,
    ChevronLeft, ArrowRight, Check, MapPin,
    LayoutDashboard, User, Calendar, CreditCard,
    Ticket, PartyPopper, BedDouble, Building2,
    Download, Wifi, Car, Zap, Coffee, ShieldCheck,
    Clock, Star, ChevronRight, X, ChevronUp, ChevronDown, QrCode,
    Share2, Heart, Map, Utensils, Dumbbell, Waves, Briefcase
} from 'lucide-react';
import { ManualTripContextState, Flight, Hotel, Activity, Essential, ExperienceBooking, Curation } from '../types';
import { FLIGHTS_TO_ITALY, ITALY_HOTELS, ITALY_ACTIVITIES, PARIS_ACTIVITIES, ABU_DHABI_ACTIVITIES, TOKYO_ACTIVITIES, ESSENTIALS_CATALOG } from '../mockData';
import FlightBookingView from './FlightBookingView';
import HotelBookingView from './HotelBookingView';
import ExperienceBookingView from './ExperienceBookingView';
import BundleBookingView from './BundleBookingView';
import SafeImage from './SafeImage';

interface MobileManualResultsProps {
    tripData: ManualTripContextState;
    onBack: () => void;
    onUpdateCuration?: (updates: Partial<Curation>) => void; // Optional for now as mobile might not fully sync with global app state yet
    onBookingComplete?: (booking: any, navigate?: boolean) => void;
    isCurationBooking?: boolean;
}

type Stage = 'flights' | 'hotels' | 'experiences' | 'essentials' | 'summary';
type StageView = 'list' | 'details' | 'rooms' | 'review' | 'form' | 'guests' | 'payment' | 'success';



const MobileManualResults: React.FC<MobileManualResultsProps> = ({ tripData, onBack, onUpdateCuration, onBookingComplete, isCurationBooking }) => {
    const [activeStage, setActiveStage] = useState<Stage>('flights');
    const [view, setView] = useState<StageView>('list');
    const [localData, setLocalData] = useState<ManualTripContextState>(tripData);

    // Selections
    const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
    const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
    const [selectedActivities, setSelectedActivities] = useState<ExperienceBooking[]>([]);
    const [selectedEssentials, setSelectedEssentials] = useState<Essential[]>([]);

    // Temp selections (before confirming)
    const [tempFlight, setTempFlight] = useState<Flight | null>(null);
    const [tempHotel, setTempHotel] = useState<Hotel | null>(null);
    const [tempEssentials, setTempEssentials] = useState<Essential[]>([]);

    // Experience State
    const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
    const [selectedExperienceDate, setSelectedExperienceDate] = useState<string | null>(null);
    const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
    const [summaryOpen, setSummaryOpen] = useState<string | null>(null); // 'flight', 'hotel', 'experience', 'essential'

    // Hotel Details State
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [activeGuestIdx, setActiveGuestIdx] = useState<number | null>(0);
    const [activePassengerIdx, setActivePassengerIdx] = useState<number | null>(0);

    // Initial stage setup for curation booking
    useEffect(() => {
        if (isCurationBooking) {
            if (tripData.selectedFlight) {
                setActiveStage('flights');
                setView('details');
                setTempFlight(tripData.selectedFlight);
            } else if (tripData.selectedHotel) {
                setActiveStage('hotels');
                setView('details');
                setTempHotel(tripData.selectedHotel);
            } else if (tripData.selectedActivities.length > 0) {
                setActiveStage('experiences');
                // Don't auto-populate selectedActivities so user has to explicitly 'Book' each one
                // setSelectedActivities(tripData.selectedActivities); 
                setView('list');
            }
        }
    }, [isCurationBooking, tripData]);

    // Helper to get next stage
    const getNextStage = (current: Stage): Stage | null => {
        const order: Stage[] = ['flights', 'hotels', 'experiences', 'essentials', 'summary'];
        const idx = order.indexOf(current);
        return idx < order.length - 1 ? order[idx + 1] : null;
    };

    // Auto-scroll to active step
    useEffect(() => {
        const activeEl = document.getElementById(`step-${view}`);
        if (activeEl) {
            activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, [view, activeStage]);

    const handleFlightSelect = (flight: Flight) => {
        setTempFlight(flight);
        setView('details');
    };



    const handleHotelSelect = (hotel: Hotel) => {
        setTempHotel(hotel);
        setView('details');
    };







    const renderStageHeader = () => {
        const tabs = [
            { id: 'flights', label: 'Flights', icon: Plane },
            { id: 'hotels', label: 'Hotels', icon: Building2 }, // Or HotelIcon
            { id: 'experiences', label: 'Play', icon: Ticket },
            { id: 'essentials', label: 'Needs', icon: Briefcase },
            { id: 'summary', label: 'Trip', icon: LayoutDashboard },
        ] as const;

        return (
            <div className="bg-[#d91918] z-40 shadow-xl pb-2">
                {/* Top Nav */}
                <div className="px-4 py-3 flex items-center justify-between mb-2">
                    <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white backdrop-blur-sm active:scale-95 transition-all">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="text-center">
                        <h2 className="text-sm font-bold text-red-100 uppercase tracking-widest mb-0.5">
                            {isCurationBooking ? (activeStage === 'hotels' ? 'Hotels' : activeStage === 'experiences' ? 'Play' : 'Flights') : 'Planning Trip'}
                        </h2>
                        <div className="flex items-center justify-center gap-2 text-white font-black text-lg">
                            {isCurationBooking ? (
                                <span className="italic">Confirm your Journey</span>
                            ) : (
                                <>
                                    <span>{localData.source}</span>
                                    <ArrowRight size={16} className="text-red-200" />
                                    <span>{localData.destination}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="w-10" /> {/* Spacer */}
                </div>

                {/* Creative Tabs - Hidden in Curation Booking Mode */}
                {!isCurationBooking && (
                    <div className="px-4">
                        <div className="flex justify-between items-center bg-red-800/20 p-1 rounded-2xl relative">
                            {tabs.map((tab) => {
                                const isActive = activeStage === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => { setActiveStage(tab.id); setView('list'); }}
                                        className="relative flex-1 flex flex-col items-center justify-center py-3 gap-1 z-10"
                                    >
                                        {isActive && (
                                            <motion.div
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
                )}
            </div>
        );
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const renderFlights = () => {
        if (view === 'list') {
            return (
                <div className="p-4 space-y-5">
                    {FLIGHTS_TO_ITALY.map(flight => (
                        <div key={flight.id} onClick={() => handleFlightSelect(flight)} className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 active:scale-95 transition-transform overflow-hidden relative">
                            {/* Top Section */}
                            <div className="p-6 pb-5">
                                {/* Times Row */}
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xl font-black text-slate-900 dark:text-white">{flight.departureTime}</span>
                                    {/* Path Visual */}
                                    <div className="flex-1 px-6 flex items-center justify-center">
                                        <div className="w-full h-[1px] border-t-2 border-dashed border-slate-200 dark:border-slate-700 relative">
                                            <Plane size={14} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 text-slate-300 dark:text-slate-600 bg-white dark:bg-slate-900 px-1" />
                                        </div>
                                    </div>
                                    <span className="text-xl font-black text-slate-900 dark:text-white">{flight.arrivalTime}</span>
                                </div>
                                {/* Dates Row */}
                                <div className="flex justify-between items-start mb-6">
                                    <span className="text-[10px] text-slate-400 font-bold">{formatDate(localData.fromDate)}</span>
                                    <span className="text-[10px] text-slate-400 font-bold">{flight.duration}</span>
                                    <span className="text-[10px] text-slate-400 font-bold">{formatDate(localData.fromDate)}</span>
                                </div>

                                {/* Info Row */}
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-sm font-black text-slate-900 dark:text-white mb-0.5">Economy</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Class</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-slate-900 dark:text-white mb-0.5">{flight.id}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">Flight No</p>
                                    </div>
                                </div>
                            </div>

                            {/* Divider with Cutouts */}
                            <div className="relative flex items-center">
                                <div className="absolute left-0 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-50 dark:bg-black border border-slate-100 dark:border-slate-800 z-10" />
                                <div className="w-full border-t border-dashed border-slate-200 dark:border-slate-700" />
                                <div className="absolute right-0 translate-x-1/2 w-6 h-6 rounded-full bg-slate-50 dark:bg-black border border-slate-100 dark:border-slate-800 z-10" />
                            </div>

                            {/* Bottom Section */}
                            <div className="px-6 py-4 flex justify-between items-center bg-transparent">
                                <div className="flex items-center gap-3">
                                    <SafeImage src={flight.airlineLogo} alt={flight.airline} className="h-6 w-6 object-contain" category="flight" />
                                    <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{flight.airline}</span>
                                </div>
                                <span className="text-xl font-black text-slate-900 dark:text-white">AED {flight.price}</span>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
        if (tempFlight) {
            return (
                <div className="bg-slate-50 dark:bg-black min-h-screen">
                    <FlightBookingView
                        curation={{
                            curationId: 'manual-flow',
                            destination: {
                                id: 'dest-manual',
                                name: localData.destination || 'Italy',
                                country: '',
                                imageUrl: '',
                                description: '',
                                flights: [],
                                hotels: [],
                                activities: []
                            },
                            itinerary: [],
                            travelers: localData.travelers.adults + localData.travelers.children,
                            status: 'draft',
                            origin: localData.source || 'Dubai'
                        }}
                        preSelectedFlight={tempFlight}
                        onBack={() => setView('list')}
                        onBookingComplete={(booking) => {
                            setLocalData(prev => ({ ...prev, selectedFlight: tempFlight }));
                            if (onBookingComplete) {
                                onBookingComplete({
                                    flight: tempFlight,
                                    tripName: localData.destination,
                                    originName: localData.source,
                                    date: new Date().toISOString()
                                }, false);
                            }
                        }}
                        onFlightSwap={(flight) => setTempFlight(flight)}
                        initialStep="details"
                    />
                </div>
            );
        }






        return null;
    };

    const renderHotels = () => {
        if (view === 'list') {
            return (
                <div className="p-4 space-y-6">
                    {ITALY_HOTELS.map(hotel => (
                        <div key={hotel.id} onClick={() => handleHotelSelect(hotel)} className="relative h-[400px] rounded-[32px] overflow-hidden shadow-xl active:scale-95 transition-transform custom-tap-highlight group cursor-pointer">
                            {/* Full Height Image */}
                            <SafeImage src={hotel.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={hotel.name} category="hotel" />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                            {/* Top Badges */}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <div className="bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-xs font-black text-white flex items-center gap-1">
                                    <Star size={12} className="fill-white" /> {hotel.rating}
                                </div>
                            </div>

                            {/* Bottom Content */}
                            <div className="absolute bottom-0 left-0 w-full p-6">
                                <h3 className="text-3xl font-black text-white mb-2 leading-tight">{hotel.name}</h3>
                                <p className="text-white/80 font-medium text-sm mb-4 line-clamp-2">{hotel.description}</p>

                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1">Starting from</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-red-500">AED {hotel.pricePerNight}</span>
                                            <span className="text-xs font-bold text-white/60">/night</span>
                                        </div>
                                    </div>

                                    <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
                                        <ArrowRight size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
        if (tempHotel) {
            return (
                <div className="bg-slate-50 dark:bg-black min-h-screen">
                    <HotelBookingView
                        curation={{
                            curationId: 'manual',
                            itinerary: [],
                            travelers: localData.travelers.adults + localData.travelers.children,
                            status: 'draft',
                            destination: {
                                id: 'dest-manual-hotel',
                                name: localData.destination || 'Italy',
                                country: '',
                                imageUrl: '',
                                description: '',
                                flights: [],
                                hotels: [],
                                activities: []
                            }
                        }}
                        preSelectedHotel={tempHotel}
                        onBack={() => setView('list')}
                        onBookingComplete={(booking) => {
                            setLocalData(prev => ({ ...prev, selectedHotel: tempHotel }));
                            if (onBookingComplete) {
                                onBookingComplete({
                                    hotel: tempHotel,
                                    tripName: localData.destination,
                                    roomType: booking.roomType,
                                    price: booking.totalPrice,
                                    date: new Date().toISOString()
                                }, false);
                            }
                        }}
                        onHotelSwap={(hotel) => setTempHotel(hotel)}
                    />
                </div>
            );
        } return null;
    };



    const renderExperiences = () => {
        if (view === 'list') {
            return (
                <div className="flex flex-col h-full bg-slate-50 dark:bg-black relative">
                    <div className="flex-1 overflow-y-auto px-6 pt-6 pb-24 space-y-6">
                        {/* Header */}
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight mb-2">Curated<br />Experiences</h2>
                            <p className="text-slate-500 font-medium text-sm">Exclusive activities for your trip.</p>
                        </div>

                        {/* Activity List */}
                        {ITALY_ACTIVITIES.map(activity => (
                            <div
                                key={activity.id}
                                onClick={() => {
                                    setExpandedActivityId(activity.id);
                                    setView('details');
                                }}
                                className="group relative h-[280px] rounded-[32px] overflow-hidden shadow-xl active:scale-95 transition-transform custom-tap-highlight cursor-pointer"
                            >
                                <SafeImage src={activity.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={activity.name} category={activity.category?.toLowerCase() === 'dining' ? 'dining' : 'activity'} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white border border-white/20">
                                    {activity.category}
                                </div>

                                <div className="absolute bottom-0 left-0 w-full p-6">
                                    <h3 className="text-xl font-black text-white mb-1">{activity.name}</h3>
                                    <div className="flex items-center gap-2 text-white/80 text-xs font-bold mb-4">
                                        <Clock size={12} /> {activity.duration}
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-black text-white">AED {activity.price}</span>
                                        <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center">
                                            <ArrowRight size={18} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        const activeActivity = ITALY_ACTIVITIES.find(a => a.id === expandedActivityId);

        if (activeActivity) {
            return (
                <div className="bg-slate-50 dark:bg-black min-h-screen">
                    <ExperienceBookingView
                        curation={{
                            curationId: 'manual',
                            destination: {
                                id: 'dest-manual',
                                name: localData.destination || 'Italy',
                                country: '',
                                imageUrl: '',
                                description: '',
                                flights: [],
                                hotels: [],
                                activities: []
                            },
                            itinerary: [],
                            travelers: localData.travelers.adults + localData.travelers.children,
                            status: 'draft',
                            startDate: localData.fromDate,
                            endDate: localData.toDate
                        }}
                        activity={activeActivity}
                        onBack={() => {
                            setExpandedActivityId(null);
                            setView('list');
                        }}
                        onComplete={(details) => {
                            const newBooking: ExperienceBooking = {
                                activityId: details.activityId,
                                bookingRef: details.bookingRef,
                                date: details.date,
                                time: details.time,
                                price: details.price,
                                activityName: details.activityName,
                                quantity: localData.travelers.adults + localData.travelers.children,
                                imageUrl: details.imageUrl
                            };
                            setSelectedActivities(prev => [...prev, newBooking]);
                            // Stay in success view within ExperienceBookingView or auto-return?
                            // ExperienceBookingView handles success state internally.
                            // But its 'Return' button calls onBack.
                        }}
                    />
                </div>
            );
        }
        return null;
    };

    const renderEssentials = () => {
        if (view === 'list') {
            const totalSelected = selectedEssentials.reduce((acc, curr) => acc + curr.price, 0);

            return (
                <div className="flex flex-col h-full bg-slate-50 dark:bg-black relative">
                    <div className="flex-1 overflow-y-auto px-6 pt-6 pb-32 space-y-6">
                        {/* Header */}
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight mb-2">Trip<br />Essentials</h2>
                            <p className="text-slate-500 font-medium text-sm">Add-ons for a smooth journey.</p>
                        </div>

                        {/* Essentials Grid */}
                        <div className="grid grid-cols-1 gap-4">
                            {ESSENTIALS_CATALOG.map(item => {
                                const isSelected = selectedEssentials.some(e => e.id === item.id);
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => {
                                            if (isSelected) {
                                                setSelectedEssentials(prev => prev.filter(e => e.id !== item.id));
                                            } else {
                                                setSelectedEssentials(prev => [...prev, item]);
                                            }
                                        }}
                                        className={`p-4 rounded-[24px] border-2 transition-all cursor-pointer flex items-center gap-4 ${isSelected
                                            ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white'
                                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelected
                                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                                            : 'bg-slate-50 dark:bg-slate-800 text-slate-400'
                                            }`}>
                                            {item.category === 'Transport' ? <Car size={20} /> :
                                                item.category === 'Internet' ? <Wifi size={20} /> : <ShieldCheck size={20} />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`font-bold ${isSelected ? 'text-white dark:text-slate-900' : 'text-slate-900 dark:text-white'}`}>{item.title}</h4>
                                            <p className={`text-xs font-medium ${isSelected ? 'text-slate-400 dark:text-slate-500' : 'text-slate-500'}`}>{item.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-black ${isSelected ? 'text-white dark:text-slate-900' : 'text-slate-900 dark:text-white'}`}>AED {item.price}</p>
                                            {isSelected && <div className="mt-1 flex justify-end"><Check size={14} className="text-green-500" strokeWidth={4} /></div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent dark:from-black dark:via-black pt-20">
                        <div className="flex justify-between items-center mb-4 px-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected Total</span>
                            <span className="text-2xl font-black text-slate-900 dark:text-white">AED {totalSelected}</span>
                        </div>
                        <button
                            onClick={() => setView('payment')}
                            disabled={selectedEssentials.length === 0}
                            className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-red-600/30 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Checkout Bundle <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            );
        }

        if (true) {
            return (
                <div className="bg-slate-50 dark:bg-black min-h-screen">
                    <BundleBookingView
                        curation={{
                            curationId: 'manual',
                            destination: {
                                id: 'dest-manual',
                                name: localData.destination || 'Italy',
                                country: '',
                                imageUrl: '',
                                description: '',
                                flights: [],
                                hotels: [],
                                activities: []
                            },
                            itinerary: [],
                            travelers: localData.travelers.adults + localData.travelers.children,
                            status: 'draft'
                        }}
                        essentials={selectedEssentials}
                        onBack={() => setView('list')}
                        onComplete={(details) => {
                            // Assuming successful bundle purchase
                            setActiveStage('summary');
                        }}
                    />
                </div>
            );
        }
        return null;
    };

    const renderSummary = () => {
        try {
            // Safe calculations with fallbacks
            const safeFlightPrice = selectedFlight?.price ?? 0;
            const safeHotelPrice = (selectedHotel?.pricePerNight ?? 0) * 3;
            // Ensure arrays are arrays before reducing or accessing length
            const safeActivities = Array.isArray(selectedActivities) ? selectedActivities : [];
            const safeEssentials = Array.isArray(selectedEssentials) ? selectedEssentials : [];

            const safeActivitiesPrice = safeActivities.reduce((acc, curr) => acc + (curr?.price ?? 0), 0);
            const safeEssentialsPrice = safeEssentials.reduce((acc, curr) => acc + (curr?.price ?? 0), 0);

            const totalPrice = safeFlightPrice + safeHotelPrice + safeActivitiesPrice + safeEssentialsPrice;

            return (
                <div className="bg-slate-50 dark:bg-black min-h-screen">
                    {/* 1. Hero Summary Card */}
                    <div className="mx-4 mt-0 mb-8 p-6 bg-gradient-to-br from-black to-red-600 rounded-[32px] shadow-2xl shadow-red-900/40 text-white relative overflow-hidden">
                        {/* Background Deco */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full blur-3xl -ml-10 -mb-10" />

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <p className="text-red-100 font-bold text-xs uppercase tracking-widest mb-1">Total Trip Cost</p>
                                    <h2 className="text-4xl font-black">AED {totalPrice.toLocaleString()}</h2>
                                </div>
                                <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/20">
                                    <p className="text-[10px] font-bold uppercase tracking-wider">4 Items Selected</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1 bg-black/20 rounded-2xl p-3 backdrop-blur-sm">
                                    <p className="text-red-200 text-[10px] font-bold uppercase mb-1">Dates</p>
                                    <p className="font-bold text-sm">{localData?.fromDate ? formatDate(localData.fromDate) : 'TBD'} - {localData?.toDate ? formatDate(localData.toDate) : 'TBD'}</p>
                                </div>
                                <div className="flex-1 bg-black/20 rounded-2xl p-3 backdrop-blur-sm">
                                    <p className="text-red-200 text-[10px] font-bold uppercase mb-1">Travelers</p>
                                    <p className="font-bold text-sm">{localData?.travelers?.adults ?? 1} Adults, {localData?.travelers?.children ?? 0} Kids</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 space-y-8 pb-32">
                        {/* 2. Flight Section - Boarding Pass Style */}
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                                    <Plane size={16} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">Flight</h3>
                            </div>

                            {selectedFlight ? (
                                <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden relative">
                                    <div className="p-5">
                                        <div className="flex justify-between items-center mb-6">
                                            <div className="flex items-center gap-3">
                                                <SafeImage src={selectedFlight.airlineLogo} className="h-8 w-8 object-contain" alt="" category="flight" />
                                                <span className="font-bold text-slate-900 dark:text-white">{selectedFlight.airline}</span>
                                            </div>
                                            <span className="font-black text-slate-900 dark:text-white">AED {selectedFlight.price}</span>
                                        </div>

                                        <div className="flex justify-between items-center relative mb-4">
                                            <div className="text-center w-16">
                                                <p className="text-2xl font-black text-slate-900 dark:text-white mb-1">{selectedFlight.originIata}</p>
                                                <p className="text-[10px] font-bold text-slate-400">{selectedFlight.departureTime}</p>
                                            </div>

                                            <div className="flex-1 flex flex-col items-center px-4">
                                                <p className="text-[10px] font-bold text-slate-400 mb-1">{selectedFlight.duration}</p>
                                                <div className="w-full h-px bg-slate-200 dark:bg-slate-700 relative">
                                                    <Plane size={12} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 bg-white dark:bg-slate-900 text-slate-400" />
                                                </div>
                                            </div>

                                            <div className="text-center w-16">
                                                <p className="text-2xl font-black text-slate-900 dark:text-white mb-1">{selectedFlight.destinationIata}</p>
                                                <p className="text-[10px] font-bold text-slate-400">{selectedFlight.arrivalTime}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Tear-off Effect */}
                                    <div className="h-4 bg-slate-50 dark:bg-slate-950/50 border-t border-dashed border-slate-200 dark:border-slate-800 relative">
                                        <div className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-slate-50 dark:bg-slate-950" />
                                        <div className="absolute -right-2 -top-2 w-4 h-4 rounded-full bg-slate-50 dark:bg-slate-950" />
                                    </div>
                                    <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950/50 flex justify-between items-center">
                                        <div className="flex gap-4">
                                            <div>
                                                <p className="text-[9px] font-bold uppercase text-slate-400">Class</p>
                                                <p className="text-xs font-bold text-slate-900 dark:text-white">Business</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-bold uppercase text-slate-400">Flight No</p>
                                                <p className="text-xs font-bold text-slate-900 dark:text-white">{selectedFlight.flightNumber || 'TK-2024'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div onClick={() => setActiveStage('flights')} className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 gap-2 cursor-pointer active:scale-95 transition-transform">
                                    <Plane size={24} />
                                    <span className="font-bold text-sm">Select Flight</span>
                                </div>
                            )}
                        </div>

                        {/* 3. Hotel Section - Visual Card */}
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                    <Building2 size={16} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">Hotel</h3>
                            </div>

                            {selectedHotel ? (
                                <div className="relative h-48 rounded-[24px] overflow-hidden shadow-md group">
                                    <SafeImage src={selectedHotel.imageUrl} className="w-full h-full object-cover" alt="" category="hotel" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20 flex items-center gap-1">
                                        <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                        <span className="text-xs font-bold text-white">{selectedHotel.rating}</span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 w-full p-5">
                                        <h4 className="text-xl font-black text-white mb-1">{selectedHotel.name}</h4>
                                        <div className="flex justify-between items-end">
                                            <p className="text-white/80 text-xs font-medium line-clamp-1">{selectedHotel.address || 'Rome'}</p>
                                            <p className="font-black text-white text-lg">AED {safeHotelPrice}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div onClick={() => setActiveStage('hotels')} className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 gap-2 cursor-pointer active:scale-95 transition-transform">
                                    <Building2 size={24} />
                                    <span className="font-bold text-sm">Select Hotel</span>
                                </div>
                            )}
                        </div>

                        {/* 4. Experiences - List View */}
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                                    <Ticket size={16} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">Experiences</h3>
                            </div>

                            {safeActivities.length > 0 ? (
                                <div className="space-y-3">
                                    {safeActivities.map((activity, idx) => (
                                        <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/10 flex items-center justify-center text-orange-600 font-bold text-xs">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-0.5">{activity.activityName}</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{activity.time} • {activity.quantity} Ppl</p>
                                                </div>
                                            </div>
                                            <p className="font-black text-sm text-slate-900 dark:text-white">AED {activity.price * (activity.quantity || 1)}</p>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center px-2">
                                        <span className="text-xs font-bold text-slate-400">Total Play</span>
                                        <span className="font-black text-sm text-slate-900 dark:text-white">AED {safeActivitiesPrice}</span>
                                    </div>
                                </div>
                            ) : (
                                <div onClick={() => setActiveStage('experiences')} className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 gap-2 cursor-pointer active:scale-95 transition-transform">
                                    <Ticket size={24} />
                                    <span className="font-bold text-sm">Add Experiences</span>
                                </div>
                            )}
                        </div>

                        {/* 5. Essentials - Compact Grid */}
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                                    <Briefcase size={16} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">Essentials</h3>
                            </div>

                            {safeEssentials.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {safeEssentials.map((item, idx) => (
                                        <div key={idx} className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-24">
                                            <div className="flex justify-between items-start">
                                                <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                                    {item.category === 'Transport' ? <Car size={14} /> : item.category === 'Internet' ? <Wifi size={14} /> : <ShieldCheck size={14} />}
                                                </div>
                                                <span className="text-[10px] font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">Active</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{item.title}</p>
                                                <p className="text-[10px] font-bold text-slate-400">AED {item.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div onClick={() => setActiveStage('essentials')} className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 gap-2 cursor-pointer active:scale-95 transition-transform">
                                    <Briefcase size={24} />
                                    <span className="font-bold text-sm">Add Essentials</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Check Out Floating Action */}
                    <div className="fixed bottom-0 left-0 w-full p-4 bg-white/80 dark:bg-black/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-50">
                        <button
                            onClick={() => {
                                const bookingData = {
                                    flight: selectedFlight,
                                    hotel: selectedHotel,
                                    experiences: selectedActivities,
                                    essentials: selectedEssentials,
                                    tripName: localData.destination || 'My Italy Trip',
                                    originName: localData.source,
                                    date: new Date().toISOString()
                                };
                                if (onBookingComplete) {
                                    onBookingComplete(bookingData);
                                }
                            }}
                            className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-600/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
                        >
                            Confirm & Pay <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            );
        } catch (error) {
            console.error("Error rendering Trip Summary:", error);
            return (
                <div className="p-8 text-center text-red-500">
                    <p>Something went wrong loading your summary.</p>
                </div>
            )
        }
    };




    const renderSubSteps = () => {
        let steps;

        if (activeStage === 'flights') {
            steps = [
                { id: 'list', label: 'Flight List' },
                { id: 'details', label: 'Itinerary' },
                { id: 'form', label: 'Passengers' },
                { id: 'review', label: 'Review' },
                { id: 'payment', label: 'Payment' },
                { id: 'success', label: 'Status' }
            ];
        } else if (activeStage === 'hotels') {
            steps = [
                { id: 'list', label: 'Hotel List' },
                { id: 'details', label: 'Details' },
                { id: 'rooms', label: 'Rooms' },
                { id: 'guests', label: 'Guests' },
                { id: 'review', label: 'Review' },
                { id: 'payment', label: 'Payment' },
                { id: 'success', label: 'Status' }
            ];
        } else if (activeStage === 'experiences') {
            steps = [
                { id: 'list', label: 'Experiences' },
                { id: 'review', label: 'Review' },
                { id: 'payment', label: 'Payment' },
                { id: 'success', label: 'Status' }
            ];
        } else if (activeStage === 'essentials') {
            steps = [
                { id: 'list', label: 'Essentials' },
                { id: 'payment', label: 'Payment' },
                { id: 'success', label: 'Status' }
            ];
        } else {
            return null;
        }


        const currentIndex = steps.findIndex(s => s.id === view);


        return (
            <div className="w-full bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex overflow-x-auto no-scrollbar py-2 px-2 scroll-smooth">
                {steps.map((step, idx) => {
                    const isActive = idx === currentIndex;
                    const isCompleted = idx < currentIndex;

                    let bg = isCompleted ? 'bg-slate-100 dark:bg-slate-800' : isActive ? 'bg-slate-900 dark:bg-white' : 'bg-white dark:bg-slate-800';
                    let text = isCompleted ? 'text-slate-900 dark:text-white' : isActive ? 'text-white dark:text-slate-900' : 'text-slate-400';

                    // First item styling
                    if (idx === 0) {
                        return (
                            <div key={step.id}
                                id={`step-${step.id}`}
                                className={`flex-shrink-0 h-10 px-8 flex items-center justify-center font-bold text-xs uppercase tracking-wider ${bg} ${text} transition-colors relative`}
                                style={{
                                    clipPath: 'polygon(0% 0%, 92% 0%, 100% 50%, 92% 100%, 0% 100%)',
                                    zIndex: 10 - idx
                                }}
                            >
                                {step.label}
                            </div>
                        );
                    }

                    // Middle/Last items styling
                    return (
                        <div key={step.id}
                            id={`step-${step.id}`}
                            className={`flex-shrink-0 h-10 px-8 flex items-center justify-center font-bold text-xs uppercase tracking-wider ${bg} ${text} transition-colors -ml-4 relative`}
                            style={{
                                clipPath: 'polygon(8% 0%, 92% 0%, 100% 50%, 92% 100%, 8% 100%, 0% 50%)',
                                zIndex: 10 - idx
                            }}
                        >
                            {step.label}
                        </div>
                    );
                })}
            </div>
        );
    };

    // Scroll to top on navigation - with timeout to ensure layout is ready
    useEffect(() => {
        const handleScroll = () => {
            const mainContainer = document.querySelector('main');
            if (mainContainer) {
                mainContainer.scrollTo({ top: 0, behavior: 'instant' });
            }
            window.scrollTo({ top: 0, behavior: 'instant' });
        };

        handleScroll();
        // Fallback for slower renders/animations
        const timer = setTimeout(handleScroll, 10);
        return () => clearTimeout(timer);
    }, [activeStage, view]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col pt-[env(safe-area-inset-top)]">
            <div className="fixed top-0 left-0 z-50 w-full">
                {renderStageHeader()}
                {renderSubSteps()}
            </div>

            <div id="manual-results-content" className={`flex-1 pb-24 ${isCurationBooking ? 'pt-[160px]' : 'pt-[240px]'}`}>
                <AnimatePresence>
                    <motion.div
                        key={activeStage}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeStage === 'flights' && renderFlights()}
                        {activeStage === 'hotels' && renderHotels()}
                        {activeStage === 'experiences' && renderExperiences()}
                        {activeStage === 'essentials' && renderEssentials()}
                        {activeStage === 'summary' && renderSummary()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

// Export
export default MobileManualResults;
