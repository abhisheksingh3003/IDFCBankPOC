import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plane, Hotel as HotelIcon, Camera, ShoppingBag,
  ChevronRight, ArrowRight, Check, Star, Clock,
  MapPin, ShieldCheck, Ticket, User, CreditCard,
  Loader2, Info, LayoutDashboard, Briefcase, X, Plus,
  Tag, Zap, ChevronDown, Search, Luggage, AlertCircle,
  Hash, Mail, Receipt, Sparkles, PartyPopper, Download,
  Map as MapIcon, Coffee, Waves, UserCheck, Phone,
  Lock, Calendar, Building2, BedDouble, ChevronLeft, QrCode,
  Box, Car, Wifi
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { View, Theme, Language, AIItinerary, Flight, Hotel, Activity, BookingStep, Destination, Essential, ManualTripContextState, ManualBuildingStage, ExperienceBooking, Curation } from '../types';
import { ITALY_HOTELS, ITALY_ACTIVITIES, FLIGHTS_TO_ITALY, ESSENTIALS_CATALOG } from '../mockData';
import FlightBookingView from './FlightBookingView';
import HotelBookingView from './HotelBookingView';
import ExperienceBookingView from './ExperienceBookingView';
import BundleBookingView from './BundleBookingView';

interface ManualBuildingDashboardProps {
  tripData: ManualTripContextState;
  onFinalize: (finalData: ManualTripContextState) => void;
  onUpdateCuration: (updates: Partial<Curation>) => void;
  onBackToWizard: () => void;
}

const EssentialIconMap: Record<string, React.ElementType> = {
  Car: Car,
  Wifi: Wifi,
  Shield: ShieldCheck,
  Coffee: Coffee,
  User: User,
  Zap: Zap,
  Ticket: Ticket
};

const ManualBuildingDashboard: React.FC<ManualBuildingDashboardProps> = ({ tripData, onFinalize, onUpdateCuration, onBackToWizard }) => {
  const [activeStage, setActiveStage] = useState<ManualBuildingStage>('flights');
  const [stageView, setStageView] = useState<'list' | 'details' | 'form' | 'guests' | 'payment' | 'review' | 'success'>('list');
  const [localData, setLocalData] = useState<ManualTripContextState>(tripData);
  const [filterTab, setFilterTab] = useState<'cheapest' | 'price_high' | 'fastest' | 'departure_early' | 'departure_late' | 'arrival_early'>('fastest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'itinerary' | 'fare'>('itinerary');

  // Inventory Selections
  const [tempFlight, setTempFlight] = useState<Flight | null>(null);
  const [tempHotel, setTempHotel] = useState<Hotel | null>(null);
  const [tempActivity, setTempActivity] = useState<Activity | null>(null);
  const [tempEssentials, setTempEssentials] = useState<Essential[]>([]);

  // Experience specific states
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<Record<string, { date: string, time: string }>>({});

  // Essential specific states
  const [viewingEssential, setViewingEssential] = useState<Essential | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Summary Accordion state
  const [expandedSummary, setExpandedSummary] = useState<string | null>('flight');

  // Local Guest state for the hotel flow
  const [guestInfo, setGuestInfo] = useState({
    name: 'Alex Johnson',
    email: 'alex.j@example.com',
    phone: '+44 7700 900000'
  });

  const [isDownloading, setIsDownloading] = useState(false);

  /* PDF Generation Logic */
  const handleDownloadPDF = async () => {
    console.log("Starting PDF generation...");
    setIsDownloading(true);
    try {
      const input = document.getElementById('manual-ticket-pdf-template');
      console.log("Target element found:", !!input);

      if (input) {
        console.log("Capturing canvas...");
        const canvas = await html2canvas(input, {
          scale: 2,
          useCORS: true,
          logging: true,
          backgroundColor: '#ffffff',
          allowTaint: true,
        });
        console.log("Canvas captured");

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
        pdf.save(`IDFC First Bank-Flight-Ticket.pdf`);
        console.log("PDF saved");
      } else {
        console.error("Template element not found!");
        alert("Error: Ticket template not found.");
      }
    } catch (error) {
      console.error("PDF Generation failed", error);
      alert(`Failed to generate ticket PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadHotelPDF = async () => {
    setIsDownloading(true);
    try {
      const input = document.getElementById('hotel-voucher-pdf-template');
      if (input) {
        const canvas = await html2canvas(input, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff', // Set background to white
          allowTaint: true,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4' // Use A4 for the voucher
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`IDFC First Bank-Hotel-Voucher.pdf`);
      }
    } catch (error) {
      console.error("Hotel Voucher Generation failed", error);
      alert("Failed to generate voucher.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Helper to parse duration string "5h 45m" -> minutes
  const parseDuration = (duration: string): number => {
    const parts = duration.match(/(\d+)h\s*(\d*)m?/);
    if (!parts) return 0;
    const hours = parseInt(parts[1]) || 0;
    const minutes = parseInt(parts[2]) || 0;
    return hours * 60 + minutes;
  };

  // Helper to parse time string "01:30 PM" -> minutes
  const parseTime = (timeStr: string): number => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  // Sort flights based on active filter
  const sortedFlights = [...FLIGHTS_TO_ITALY].sort((a, b) => {
    if (filterTab === 'cheapest') {
      return a.price - b.price;
    } else if (filterTab === 'price_high') {
      return b.price - a.price;
    } else if (filterTab === 'fastest') {
      return parseDuration(a.duration) - parseDuration(b.duration);
    } else if (filterTab === 'departure_early') {
      return parseTime(a.departureTime) - parseTime(b.departureTime);
    } else if (filterTab === 'departure_late') {
      return parseTime(b.departureTime) - parseTime(a.departureTime);
    } else if (filterTab === 'arrival_early') {
      return parseTime(a.arrivalTime) - parseTime(b.arrivalTime);
    }
    return 0;
  });

  // Scroll Reset Effect: Fixes the issue where next pages appear scrolled to bottom
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeStage, stageView]);

  const stages: { id: ManualBuildingStage; label: string; icon: any }[] = [
    { id: 'flights', label: '1. Flights', icon: Plane },
    { id: 'hotels', label: '2. Hotels', icon: HotelIcon },
    { id: 'experiences', label: '3. Experiences', icon: Camera },
    { id: 'essentials', label: '4. Essentials', icon: ShoppingBag },
    { id: 'summary', label: 'Summary', icon: LayoutDashboard }
  ];

  // Logic for Sub-Steps within each category
  const subSteps: Record<string, { key: string; label: string }[]> = {
    flights: [
      { key: 'list', label: 'Flight Selection' },
      { key: 'details', label: 'Itinerary' },
      { key: 'form', label: 'Passengers' },
      { key: 'review', label: 'Review' },
      { key: 'payment', label: 'Payment' },
      { key: 'success', label: 'Issued' }
    ],
    hotels: [
      { key: 'list', label: 'Hotel List' },
      { key: 'details', label: 'Info' },
      { key: 'form', label: 'Room Selection' },
      { key: 'guests', label: 'Guests' },
      { key: 'payment', label: 'Payment' },
      { key: 'success', label: 'Confirmed' }
    ],
    experiences: [
      { key: 'list', label: 'Inventory' },
      { key: 'review', label: 'Review Slots' },
      { key: 'payment', label: 'Payment' },
      { key: 'success', label: 'Secured' }
    ],
    essentials: [
      { key: 'list', label: 'Marketplace' },
      { key: 'payment', label: 'Checkout' },
      { key: 'success', label: 'Secured' }
    ],
    summary: [
      { key: 'list', label: 'Final Curation' }
    ]
  };

  const totalTravellers = localData.travelers.adults + localData.travelers.children;

  // --- STAGE 1: FLIGHTS LOGIC ---
  const handleBookFlight = () => {
    if (tempFlight) {
      const flightBooking = {
        flightId: tempFlight.id,
        bookingRef: `MFT-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        price: tempFlight.price,
        airline: tempFlight.airline,
        airlineLogo: tempFlight.airlineLogo,
        departureTime: tempFlight.departureTime,
        arrivalTime: tempFlight.arrivalTime,
        duration: tempFlight.duration,
        originIata: tempFlight.originIata || 'DXB',
        destinationIata: tempFlight.destinationIata || 'DXB'
      };
      // Update global curation state immediately
      onUpdateCuration({ flightBooking, status: 'partially_booked' });
      setLocalData({ ...localData, selectedFlight: tempFlight });
      setStageView('success');
    }
  };

  const proceedToHotels = () => {
    setActiveStage('hotels');
    setStageView('list');
  };

  // --- STAGE 2: HOTELS LOGIC ---
  const handleSelectRoom = (roomType: string) => {
    setLocalData({ ...localData, selectedHotel: tempHotel, selectedRoomType: roomType });
    setStageView('guests');
  };

  const handleGuestsConfirmed = () => {
    setStageView('payment');
  };

  const handleHotelPayment = () => {
    if (tempHotel) {
      const hotelBooking = {
        hotelId: tempHotel.id,
        bookingRef: `MTL-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        totalPrice: tempHotel.pricePerNight * 3,
        hotelName: tempHotel.name,
        imageUrl: tempHotel.imageUrl,
        roomType: localData.selectedRoomType || 'Premium Deluxe'
      };
      // Update global curation state immediately
      onUpdateCuration({ hotelBooking, status: 'partially_booked' });
      setStageView('success');
    }
  };

  // --- STAGE 3: EXPERIENCES LOGIC ---
  const handleSelectSlot = (activity: Activity, date: string, time: string) => {
    const updatedSlots = { ...selectedSlots, [activity.id]: { date, time } };
    setSelectedSlots(updatedSlots);

    const newBooking: ExperienceBooking = {
      activityId: activity.id,
      activityName: activity.name,
      bookingRef: `EXP-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      date,
      time,
      price: activity.price,
      quantity: 1,
      imageUrl: activity.imageUrl
    };

    const currentActivities = localData.selectedActivities.filter(a => a.activityId !== activity.id);
    const updatedActivities = [...currentActivities, newBooking];
    setLocalData({ ...localData, selectedActivities: updatedActivities });
    setExpandedActivityId(null);
  };

  const handleExperiencePayment = () => {
    // Update global curation state with secured experiences
    onUpdateCuration({ experienceBookings: localData.selectedActivities, status: 'partially_booked' });
    setStageView('success');
  };

  // --- STAGE 4: ESSENTIALS LOGIC ---
  const toggleEssential = (item: Essential) => {
    setTempEssentials(prev => prev.find(i => i.id === item.id) ? prev.filter(i => i.id !== item.id) : [...prev, item]);
  };

  const handleBookEssentials = () => {
    setStageView('payment');
  };

  const handleEssentialsPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const essentialsBooking = {
        items: tempEssentials,
        totalPrice: tempEssentials.reduce((s, i) => s + i.price, 0),
        bookingRef: `MEB-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
      };
      // Update global curation state immediately
      onUpdateCuration({ essentialsBooking, status: 'partially_booked' });
      setLocalData({ ...localData, selectedEssentials: tempEssentials });
      setIsProcessing(false);
      setStageView('success');
    }, 2000);
  };

  const proceedToSummary = () => {
    setActiveStage('summary');
    setStageView('list');
  };

  // Mock dates for experience picker
  const mockDates = [
    { day: 'MON', date: '28', full: 'Oct 28, 2024' },
    { day: 'TUES', date: '29', full: 'Oct 29, 2024' },
    { day: 'WED', date: '30', full: 'Oct 30, 2024' },
    { day: 'THU', date: '31', full: 'Oct 31, 2024' },
    { day: 'FRI', date: '1', full: 'Nov 1, 2024' },
    { day: 'SAT', date: '2', full: 'Nov 2, 2024' },
    { day: 'SUN', date: '3', full: 'Nov 3, 2024' },
  ];

  const mockTimes = ["09:00 AM", "11:00 AM", "01:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

  // Adapter for Standardized Views
  const getCurationAdapter = (): Curation => {
    return {
      curationId: 'manual-draft',
      origin: localData.source,
      destination: {
        id: 'dest',
        name: localData.destination,
        country: 'UAE',
        imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea90b7cadc9?auto=format&fit=crop&q=80&w=800', // Placeholder
        description: 'Manual Planner Destination',
        flights: FLIGHTS_TO_ITALY,
        hotels: ITALY_HOTELS,
        activities: ITALY_ACTIVITIES
      },
      itinerary: [],
      travelers: localData.travelers.adults + localData.travelers.children,
      status: 'draft',
      startDate: localData.fromDate,
      endDate: localData.toDate,
      isManual: true
    };
  };

  // Determine if we are in a standardized booking view (to hide headers/nav)
  const isStandardizedView = ((activeStage === 'flights' || activeStage === 'hotels' || activeStage === 'experiences' || activeStage === 'essentials') && stageView !== 'list') || (stageView === 'success' && activeStage !== 'flights');

  return (
    <div className="w-full max-w-7xl mx-auto py-4 sm:py-8 px-2 sm:px-4 flex flex-col gap-6 sm:gap-10 min-h-[90vh]">
      {/* HEADER & MAIN STAGE INDICATOR - Hidden in Standardized View */}
      {!isStandardizedView && (
        <div className="flex flex-col gap-8 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mb-2">{localData.destination || "Italy"}</h1>
              <p className="text-sm font-bold text-red-600 uppercase tracking-[0.3em] flex items-center gap-2">
                <MapPin size={16} /> {localData.source || "Warsaw"} → {localData.destination || "Italy"}
              </p>
            </div>

            <div className="flex items-center gap-1 bg-[#0F172A] p-1.5 rounded-[20px] shadow-2xl border border-white/5 overflow-x-auto no-scrollbar max-w-full">
              {stages.map((s, idx) => (
                <div key={s.id} className="flex items-center">
                  <button
                    onClick={() => {
                      setActiveStage(s.id);
                      setStageView('list');
                    }}
                    className={`flex items-center gap-3 px-6 py-3 rounded-[14px] font-black text-[10px] uppercase tracking-[0.15em] transition-all whitespace-nowrap ${activeStage === s.id
                      ? 'bg-red-600 text-white shadow-xl shadow-red-600/40 ring-1 ring-red-500/50'
                      : 'text-slate-500 hover:text-slate-300'
                      }`}
                  >
                    <s.icon size={14} className={activeStage === s.id ? 'animate-pulse' : ''} />
                    <span>{s.label}</span>
                  </button>
                  {idx < stages.length - 1 && <ChevronRight size={14} className="mx-1 text-slate-700" />}
                </div>
              ))}
            </div>
          </div>

          {/* SECONDARY NAVIGATION: Path within the Stage */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {subSteps[activeStage].map((step, idx) => {
              const currentIdx = subSteps[activeStage].findIndex(ss => ss.key === stageView);
              const isCompleted = idx < currentIdx;
              const isActive = idx === currentIdx;

              return (
                <div key={step.key} className="flex items-center gap-3 flex-shrink-0">
                  <button
                    disabled={idx > currentIdx}
                    onClick={() => setStageView(step.key as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-red-600 border border-red-600/20 shadow-sm'
                      : isCompleted
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${isActive ? 'bg-red-600 text-white' :
                      isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}>
                      {isCompleted ? <Check size={12} strokeWidth={4} /> : idx + 1}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                      {step.label}
                    </span>
                  </button>
                  {idx < subSteps[activeStage].length - 1 && (
                    <div className="w-4 h-[1px] bg-slate-200 dark:bg-slate-800" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STAGE CONTENT AREA */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {stageView === 'success' ? (
            activeStage === 'flights' ? (
              <motion.div
                key="success-flights"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center space-y-12"
              >
                <div className="relative">
                  <div className="w-24 h-24 bg-green-900/20 rounded-full flex items-center justify-center text-green-500 mx-auto">
                    <Check size={48} strokeWidth={4} />
                  </div>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} className="absolute -top-2 -right-2 w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <PartyPopper size={20} />
                  </motion.div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white">Ticket Issued.</h2>
                  <p className="text-base sm:text-lg text-slate-500 font-medium italic">Your First Class experience to {localData.destination} is confirmed.</p>
                </div>
                {/* Issued Ticket UI */}
                <div className="bg-[#0F172A] rounded-3xl sm:rounded-[48px] overflow-hidden shadow-2xl border border-slate-800 w-full max-w-3xl mx-auto flex flex-col md:flex-row text-white">
                  <div className="flex-1 p-6 sm:p-12 space-y-8 sm:space-y-12 text-left">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <img src={localData.selectedFlight?.airlineLogo} className="w-10 h-10 object-contain" alt="Airline" />
                        <h4 className="text-2xl font-black uppercase tracking-tight">{localData.selectedFlight?.airline}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</p>
                        <p className="font-black text-red-600">FIRST CLASS</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-10">
                      <div className="space-y-1 text-center">
                        <p className="text-3xl sm:text-5xl font-black leading-none">{localData.selectedFlight?.originIata || 'DXB'}</p>
                        <p className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest mt-2">{localData.selectedFlight?.departureTime}</p>
                      </div>
                      <div className="flex-1 h-[2px] bg-slate-800 relative">
                        <Plane size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 text-red-600" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="text-3xl sm:text-5xl font-black leading-none">{localData.selectedFlight?.destinationIata || 'DXB'}</p>
                        <p className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest mt-2">{localData.selectedFlight?.arrivalTime}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8 pt-10 border-t border-slate-800">
                      <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lead Passenger</p><p className="font-black text-lg">Alex Johnson</p><p className="text-xs text-slate-500 font-medium">+{totalTravellers - 1} Travelers</p></div>
                    </div>
                  </div>
                  <div className="bg-slate-900/50 p-6 sm:p-12 flex flex-col items-center justify-center text-center gap-8 md:w-72 border-t md:border-t-0 md:border-l border-slate-800">
                    <div className="p-5 bg-white rounded-3xl shadow-2xl"><Ticket className="w-16 h-16 text-slate-950" strokeWidth={2.5} /></div>
                    <div><p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Confirmation</p><p className="text-2xl font-mono font-black text-red-500">FL-6P40</p></div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-3xl mx-auto">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={isDownloading}
                    className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-4 py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
                  >
                    {isDownloading ? <Loader2 className="animate-spin" size={24} /> : <Download size={24} />}
                    {isDownloading ? "Generating..." : "Download Ticket"}
                  </button>

                  {/* Hidden PDF Template */}
                  <div
                    id="manual-ticket-pdf-template"
                    style={{
                      position: 'fixed',
                      left: '-9999px',
                      top: 0,
                      width: '800px',
                      padding: '40px',
                      background: 'white',
                      borderRadius: '20px',
                      fontFamily: 'sans-serif',
                      color: 'black'
                    }}
                  >
                    {/* Header with Logo */}
                    <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-200">
                      <img src="/images/IDFC_First_Logo.png" alt="IDFC First Bank" className="h-12 w-auto" />
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Booking Reference</p>
                        <p className="text-xl font-black text-red-600">FL-{Math.random().toString(36).substr(2, 4).toUpperCase()}</p>
                      </div>
                    </div>

                    {/* Ticket Body */}
                    <div className="bg-slate-900 p-8 rounded-[32px] text-white overflow-hidden relative">
                      <div className="flex justify-between items-start mb-12">
                        <div className="flex items-center gap-4">
                          {localData.selectedFlight?.airlineLogo && (
                            <img src={localData.selectedFlight.airlineLogo} className="w-12 h-12 object-contain bg-white rounded-xl p-1" />
                          )}
                          <h4 className="text-2xl font-black uppercase text-white">{localData.selectedFlight?.airline}</h4>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Class</p>
                          <p className="font-black text-red-500 text-lg">FIRST CLASS</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-8 mb-12">
                        <div className="text-center">
                          <p className="text-4xl font-black leading-none">{localData.selectedFlight?.originIata || 'DXB'}</p>
                          <p className="text-sm font-bold text-white/50 uppercase mt-2">{localData.selectedFlight?.departureTime}</p>
                        </div>
                        <div className="flex-1 h-[2px] bg-white/20 relative">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 text-white">✈</div>
                        </div>
                        <div className="text-center">
                          <p className="text-4xl font-black leading-none">{localData.selectedFlight?.destinationIata || 'DXB'}</p>
                          <p className="text-sm font-bold text-white/50 uppercase mt-2">{localData.selectedFlight?.arrivalTime}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
                        <div>
                          <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Passenger</p>
                          <p className="font-black text-white">{guestInfo.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Date</p>
                          <p className="font-black text-white">Sun, Jan 25</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 text-center">
                      <p className="text-slate-400 font-medium text-sm">Thank you for choosing IDFC First Bank.</p>
                    </div>
                  </div>
                  <button onClick={() => window.location.href = '/'} className="flex-1 border-2 border-slate-200 dark:border-slate-800 px-4 py-5 rounded-3xl font-black text-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all hover:scale-105 active:scale-95">Return Home</button>
                  <button onClick={proceedToHotels} className="flex-1 border-2 border-slate-200 dark:border-slate-800 px-4 py-5 rounded-3xl font-black text-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all hover:scale-105 active:scale-95">Continue</button>
                </div>
              </motion.div>
            ) : activeStage === 'hotels' ? (
              <motion.div
                key="success-hotels"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-12 px-4 max-w-5xl mx-auto space-y-16 flex flex-col items-center"
              >
                {/* Success Header */}
                <div className="text-center space-y-6">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 sm:w-24 h-24 bg-green-900/20 rounded-full flex items-center justify-center text-green-500 mx-auto">
                      <Check size={40} strokeWidth={4} />
                    </div>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: 'spring' }} className="absolute -top-1 -right-1 w-8 h-8 sm:w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                      <PartyPopper size={16} />
                    </motion.div>
                  </div>
                  <h3 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Booking Secured.</h3>
                  <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium italic opacity-80">
                    Everything is set for your luxury stay in {localData.destination}.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 w-full">
                  {/* Left Column: Voucher Body */}
                  <div className="lg:col-span-8 bg-[#0F172A] rounded-[48px] overflow-hidden shadow-2xl border border-white/5">
                    <div className="h-80 relative overflow-hidden">
                      <img src={localData.selectedHotel?.imageUrl} className="w-full h-full object-cover" alt="Hotel" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/20 to-transparent" />
                      <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-12">
                        <h4 className="text-2xl sm:text-4xl font-black text-white mb-2 leading-none">{localData.selectedHotel?.name}</h4>
                        <div className="flex items-center gap-2 text-slate-300 font-bold uppercase tracking-widest text-xs">
                          <MapPin size={14} className="text-red-600" /> {localData.destination}, UAE
                        </div>
                      </div>
                    </div>

                    <div className="p-6 sm:p-12 space-y-8 sm:space-y-12">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]"><User size={12} className="text-red-600" /> Guest Name</div>
                          <p className="font-black text-white text-2xl">{guestInfo.name}</p>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]"><Calendar size={12} className="text-red-600" /> Stay Dates</div>
                          <p className="font-black text-white text-2xl">Oct 24 - Oct 27, 2024</p>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]"><BedDouble size={12} className="text-red-600" /> Room Type</div>
                          <p className="font-black text-white text-lg sm:text-xl">{localData.selectedRoomType || 'Executive Suite'}</p>
                        </div>
                      </div>

                      <div className="pt-12 border-t border-white/10 space-y-8 text-white">
                        <h5 className="font-black text-slate-500 uppercase tracking-[0.3em] text-[10px] flex items-center gap-3"><Receipt size={16} className="text-red-600" /> Price Breakdown</h5>
                        <div className="space-y-6">
                          <div className="flex justify-between items-center"><span className="text-slate-400 font-bold">Accommodation (3 Nights x INR {localData.selectedHotel?.pricePerNight})</span><span className="text-white font-black text-xl">INR {(localData.selectedHotel?.pricePerNight || 0) * 3}</span></div>
                          <div className="flex justify-between items-center"><span className="text-slate-400 font-bold">Taxes & Resort Fees</span><span className="text-white font-black text-xl">INR 125</span></div>
                          <div className="flex justify-between items-center text-red-600 font-black"><span className="uppercase tracking-widest text-xs">Special Savings</span><span className="text-xl">-INR 125</span></div>
                          <div className="flex justify-between items-end pt-10 border-t-2 border-dashed border-white/10"><span className="text-2xl font-black text-white uppercase tracking-tighter">Aggregate Total</span><span className="text-6xl font-black text-red-600">INR {(localData.selectedHotel?.pricePerNight || 0) * 3}</span></div>
                        </div>
                      </div>

                      <div className="p-8 bg-slate-900/50 rounded-[32px] border border-white/5 flex items-center gap-6">
                        <div className="w-14 h-14 bg-[#0F172A] rounded-2xl flex items-center justify-center text-red-600 shadow-2xl border border-white/5"><Building2 size={28} /></div>
                        <div>
                          <p className="font-black text-white text-lg">Check-in Instructions</p>
                          <p className="text-sm text-slate-400 font-medium italic opacity-70 leading-relaxed">Present your curation code <span className="text-red-600 font-black uppercase">6P40</span> at the VIP Anya Desk for priority entry.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Sidebar */}
                  <div className="lg:col-span-4 flex flex-col gap-10">
                    <div className="bg-[#0F172A] p-10 rounded-[48px] shadow-2xl border border-white/5 space-y-8">
                      <div className="flex items-center justify-between"><h5 className="font-black text-slate-500 uppercase tracking-[0.2em] text-[10px] flex items-center gap-3"><MapIcon size={16} className="text-red-600" /> Location Map</h5></div>
                      <div className="aspect-square rounded-[36px] overflow-hidden bg-slate-900 relative border border-white/5">
                        <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover grayscale opacity-30" alt="Map" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl mb-4 ring-4 ring-red-600/20"><MapPin size={28} /></motion.div>
                          <p className="font-black text-white text-base mb-1">{localData.selectedHotel?.name}</p>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest underline underline-offset-4 cursor-pointer hover:text-red-500 transition-colors">Open in Google Maps</span>
                        </div>
                      </div>
                      <div className="p-5 bg-[#0F172A]/50 rounded-[28px] border border-white/5 flex items-start gap-4">
                        <Info size={18} className="text-red-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Hotel Address</p>
                          <p className="text-xs text-slate-200 font-bold leading-relaxed italic opacity-80">{localData.selectedHotel?.address || "Address sync in progress..."}</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium italic text-center leading-relaxed">Location data provided by IDFC First Bank.</p>
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={handleDownloadHotelPDF}
                        disabled={isDownloading}
                        className="w-full bg-white text-[#0F172A] py-7 rounded-[32px] font-black text-xl transition-all flex items-center justify-center gap-4 shadow-2xl hover:bg-red-600 hover:text-white group disabled:opacity-70 disabled:hover:bg-white disabled:hover:text-[#0F172A]"
                      >
                        {isDownloading ? <Loader2 className="animate-spin" size={24} /> : <Download size={24} className="group-hover:translate-y-1 transition-transform" />}
                        {isDownloading ? "Generating Voucher..." : "Download PDF Voucher"}
                      </button>

                      {/* Hidden Hotel Voucher Template */}
                      <div
                        id="hotel-voucher-pdf-template"
                        style={{
                          position: 'fixed',
                          left: '-9999px',
                          top: 0,
                          width: '800px',
                          padding: '40px',
                          background: '#ffffff', // White background
                          borderRadius: '0px',
                          fontFamily: 'sans-serif',
                          color: '#0F172A' // Dark text
                        }}
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-200">
                          <img src="/images/IDFC_First_Logo.png" alt="IDFC First Bank" className="h-10 w-auto" />
                          <div className="text-right">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Booking Confirmation</p>
                            <p className="text-xl font-black text-red-500">HTL-{Math.random().toString(36).substr(2, 4).toUpperCase()}</p>
                          </div>
                        </div>

                        {/* Main Image & Title */}
                        {localData.selectedHotel && (
                          <div className="mb-8">
                            <div className="h-64 rounded-2xl overflow-hidden mb-6 relative">
                              <img src={localData.selectedHotel.imageUrl} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] to-transparent"></div>
                              <div className="absolute bottom-4 left-6">
                                <h1 className="text-4xl font-black text-white">{localData.selectedHotel.name}</h1>
                                <p className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                  <MapPin size={14} className="text-red-600" /> {localData.destination}, UAE
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-8 mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                          <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Guest Name</p>
                            <p className="text-xl font-black">{guestInfo.name}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Room Type</p>
                            <p className="text-xl font-black">{localData.selectedRoomType || 'Premium Deluxe'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Check-in</p>
                            <p className="text-xl font-bold">Oct 24, 2024</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Check-out</p>
                            <p className="text-xl font-bold">Oct 27, 2024</p>
                          </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="mb-8 pt-8 border-t border-white/10">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-400 font-medium">Total Amount Paid</span>
                            <span className="text-3xl font-black text-red-500">INR {(localData.selectedHotel?.pricePerNight || 0) * 3}</span>
                          </div>
                          <p className="text-xs text-slate-500 italic">Taxes and resort fees included.</p>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center gap-4 mt-8 pt-8 border-t border-white/10">
                          <div className="p-3 bg-white rounded-xl">
                            <QrCode size={48} className="text-black" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">Present this voucher at check-in</p>
                            <p className="text-xs text-slate-500">IDFC First Bank Anya Service</p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => window.location.href = '/'}
                        className="w-full bg-transparent border-2 border-slate-200 dark:border-white/20 text-slate-900 dark:text-white py-6 rounded-[32px] font-black text-xl transition-all hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-[#0F172A] flex items-center justify-center gap-4"
                      >
                        Return Home
                      </button>
                      <button
                        onClick={() => { setActiveStage('experiences'); setStageView('list'); }}
                        className="w-full bg-[#0F172A] border-2 border-white/5 text-white py-6 rounded-[32px] font-black text-xl transition-all hover:bg-white hover:text-[#0F172A] flex items-center justify-center gap-4"
                      >
                        Continue <ArrowRight size={22} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : activeStage === 'experiences' ? (
              <motion.div
                key="success-exp"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-12 px-4 max-w-5xl mx-auto space-y-16"
              >
                <div className="text-center space-y-6">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-green-900/20 rounded-full flex items-center justify-center text-green-500 mx-auto">
                      <Check size={48} strokeWidth={4} />
                    </div>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }} className="absolute -top-1 -right-1 w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                      <PartyPopper size={20} />
                    </motion.div>
                  </div>
                  <div>
                    <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Experiences Secured.</h2>
                    <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-medium italic mt-2 opacity-80">
                      Your curated activity portfolio for {localData.destination} is confirmed.
                    </p>
                  </div>
                </div>

                {/* Grid of Experience Vouchers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                  {localData.selectedActivities.map((booking) => {
                    const activity = ITALY_ACTIVITIES.find(a => a.id === booking.activityId);
                    return (
                      <motion.div
                        key={booking.bookingRef}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#0F172A] rounded-[48px] overflow-hidden shadow-2xl border border-white/5 flex flex-col"
                      >
                        <div className="h-48 relative overflow-hidden">
                          <img src={activity?.imageUrl} alt={booking.activityName} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent" />
                          <div className="absolute bottom-6 left-8">
                            <h4 className="text-2xl font-black text-white mb-1 leading-none">{booking.activityName}</h4>
                            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest flex items-center gap-2">
                              <MapPin size={12} className="text-red-600" /> {localData.destination}, UAE
                            </p>
                          </div>
                        </div>
                        <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-8">
                          <div className="flex-1 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Confirmed Date</p>
                                <p className="font-black text-white text-base">{booking.date}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Selected Slot</p>
                                <p className="font-black text-white text-base">{booking.time}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Travellers</p>
                                <p className="font-black text-white text-base">{totalTravellers} Guests</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Booking Ref</p>
                                <p className="font-black text-red-500 text-base">{booking.bookingRef}</p>
                              </div>
                            </div>
                            <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5 flex items-start gap-3">
                              <Info size={16} className="text-red-600 mt-1 flex-shrink-0" />
                              <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed">
                                Priority skip-the-line access is included for this IDFC First Bank Anya reservation.
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-[32px] shadow-2xl h-fit">
                            <QrCode size={100} className="text-slate-900" />
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-3">Redeem on Arrival</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-3xl mx-auto pt-8">
                  <button
                    onClick={() => window.location.href = '/'}
                    className="flex-1 bg-transparent border-2 border-slate-200 dark:border-white/20 text-slate-900 dark:text-white px-8 py-6 rounded-3xl font-black text-xl transition-all hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-[#0F172A] flex items-center justify-center gap-4"
                  >
                    Return Home
                  </button>
                  <button
                    onClick={() => { setActiveStage('essentials'); setStageView('list'); }}
                    className="flex-1 bg-red-600 text-white px-8 py-6 rounded-3xl font-black text-xl shadow-2xl shadow-red-600/30 flex items-center justify-center gap-4 group transition-all hover:scale-105 active:scale-95"
                  >
                    Proceed to Essentials <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ) : activeStage === 'essentials' ? (
              <motion.div
                key="success-essentials"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center py-12 px-4 max-w-5xl mx-auto space-y-16"
              >
                <div className="text-center space-y-6">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 bg-green-900/20 rounded-full flex items-center justify-center text-green-500 mx-auto">
                      <Check size={48} strokeWidth={4} />
                    </div>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }} className="absolute -top-1 -right-1 w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                      <PartyPopper size={20} />
                    </motion.div>
                  </div>
                  <div>
                    <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Essentials Secured.</h2>
                    <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-medium italic mt-2 opacity-80">
                      Your ancillary service bundle for {localData.destination} is confirmed.
                    </p>
                  </div>
                </div>

                <div className="bg-[#0F172A] rounded-[48px] overflow-hidden shadow-2xl border border-white/5 w-full flex flex-col md:flex-row">
                  <div className="flex-1 p-6 sm:p-12 space-y-10">
                    <h3 className="text-2xl font-black text-white flex items-center gap-3">
                      <Box className="text-red-600" /> Active Bundle Items
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {localData.selectedEssentials.map(item => {
                        const Icon = EssentialIconMap[item.icon] || Box;
                        return (
                          <div key={item.id} className="flex items-center gap-4 p-5 bg-white/5 rounded-3xl border border-white/5">
                            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white">
                              <Icon size={24} />
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{item.title}</p>
                              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{item.category}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Paid</p>
                        <p className="text-5xl font-black text-red-600">INR {localData.selectedEssentials.reduce((s, i) => s + i.price, 0)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Master Ref</p>
                        <p className="text-xl font-mono font-black text-white">ESS-BNDL-6P40</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-900/50 p-6 sm:p-12 flex flex-col items-center justify-center text-center gap-8 md:w-80 border-t md:border-t-0 md:border-l border-white/5">
                    <div className="p-6 bg-white rounded-[40px] shadow-2xl">
                      <QrCode size={140} className="text-slate-950" />
                    </div>
                  </div>
                </div>

                <button
                  onClick={proceedToSummary}
                  className="bg-red-600 text-white px-16 py-6 rounded-[32px] font-black text-xl shadow-2xl shadow-red-600/30 flex items-center gap-4 group transition-all"
                >
                  Review Final Itinerary <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </motion.div>
            ) : (
              <motion.div key="success-generic" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-32 text-center space-y-6">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600"><Check size={48} strokeWidth={4} /></div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Booking Confirmed</h2>
                <p className="text-slate-500 font-medium italic">Advancing your custom itinerary...</p>
                <button onClick={proceedToSummary} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 mt-8">Next Step <ArrowRight size={16} /></button>
              </motion.div>
            )
          ) : activeStage === 'flights' ? (
            <motion.div key="flights" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className={`space-y-8 ${stageView !== 'list' ? 'h-full flex-1' : ''}`}>
              {stageView === 'list' && (
                <div className="space-y-6">
                  {/* Filter Bar */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
                    <div className="flex gap-4">
                      <button onClick={() => setFilterTab('fastest')} className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all ${filterTab === 'fastest' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xl scale-105' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500'}`}>
                        <div className={`p-1.5 rounded-lg ${filterTab === 'fastest' ? 'bg-white/20 dark:bg-slate-900/10' : 'bg-slate-100 dark:bg-slate-800'}`}><Zap size={16} /></div>
                        <div className="text-left"><p className="text-xs font-black uppercase tracking-widest leading-none mb-1">Fastest</p><p className="text-sm font-bold opacity-70">AED980 • 5h 45m</p></div>
                      </button>
                      <button onClick={() => setFilterTab('cheapest')} className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all ${filterTab === 'cheapest' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xl scale-105' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500'}`}>
                        <div className={`p-1.5 rounded-lg ${filterTab === 'cheapest' ? 'bg-white/20 dark:bg-slate-900/10' : 'bg-slate-100 dark:bg-slate-800'}`}><Tag size={16} /></div>
                        <div className="text-left"><p className="text-xs font-black uppercase tracking-widest leading-none mb-1">Cheapest</p><p className="text-sm font-bold opacity-70">AED460 • 5h 45m</p></div>
                      </button>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setShowSortMenu(!showSortMenu)}
                        className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-slate-600 dark:text-slate-300 shadow-sm hover:shadow-md transition-all"
                      >
                        <Search size={18} />
                        <span className="text-sm">Sort Options</span>
                        <ChevronDown size={18} className={`transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {showSortMenu && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 z-20 overflow-hidden"
                          >
                            <div className="p-2 space-y-1">
                              {[
                                { id: 'cheapest', label: 'Price: Lowest' },
                                { id: 'price_high', label: 'Price: Highest' },
                                { id: 'departure_early', label: 'Departure: Earliest' },
                                { id: 'departure_late', label: 'Departure: Latest' },
                                { id: 'arrival_early', label: 'Arrival: Earliest' }
                              ].map((option) => (
                                <button
                                  key={option.id}
                                  onClick={() => {
                                    setFilterTab(option.id as any);
                                    setShowSortMenu(false);
                                  }}
                                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between ${filterTab === option.id
                                    ? 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white'
                                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                  {option.label}
                                  {filterTab === option.id && <Check size={14} className="text-red-600" />}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => { setActiveStage('hotels'); setStageView('list'); }}
                      className="px-6 py-3 rounded-xl border-2 border-red-600 text-slate-400 hover:text-red-600 hover:bg-white dark:hover:bg-slate-800 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                    >
                      Skip to Hotels <ArrowRight size={14} />
                    </button>
                  </div>
                  {/* Flight List */}
                  <div className="space-y-4">
                    {sortedFlights.map(f => (
                      <div key={f.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                        <div className="p-8 flex flex-col md:flex-row items-center gap-10">
                          <div className="flex flex-col items-center md:items-start min-w-[160px] text-center md:text-left gap-2">
                            <div className="w-12 h-12 flex items-center justify-center p-2 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:scale-110 transition-transform"><img src={f.airlineLogo} alt={f.airline} className="w-full h-full object-contain" /></div>
                            <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-wider leading-tight">{f.airline}</p>
                          </div>
                          <div className="flex-1 flex items-center justify-between w-full md:w-auto px-4 md:px-12 border-x border-slate-50 dark:border-slate-800">
                            <div className="text-center md:text-left">
                              <p className="text-3xl font-black text-slate-900 dark:text-white leading-none mb-2">{f.departureTime} – {f.arrivalTime}</p>
                              <p className="text-xs font-bold text-slate-400"><span className="text-orange-500 uppercase">{f.originIata || 'DXB'}</span> — <span className="text-orange-500 uppercase">{f.destinationIata || 'DXB'}</span></p>
                            </div>
                            <div className="text-center md:text-right">
                              <p className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">{f.duration} (Direct)</p>
                              <p className="text-[10px] font-bold text-slate-400 flex items-center justify-center md:justify-end gap-1 uppercase tracking-widest"><Clock size={12} /> Flight Details</p>
                            </div>
                          </div>
                          <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-10 min-w-fit">
                            <div className="text-center md:text-right space-y-1"><p className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white leading-none">INR{f.price}</p><p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Get 2% Cashback</p></div>
                            <button onClick={() => { setTempFlight(f); setStageView('details'); }} className="w-full sm:w-auto px-12 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-600/30 active:scale-95 transition-all">Book</button>
                          </div>
                        </div>
                        <div className="px-8 py-4 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between border-t border-slate-50 dark:border-slate-800">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm"><ShieldCheck size={14} className="text-slate-400" /><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Partial Refundable</span></div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm"><Briefcase size={14} className="text-slate-400" /><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hand Baggage</span></div>
                          </div>
                          <button onClick={() => { setTempFlight(f); setStageView('details'); }} className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline flex items-center gap-1 group/details">Flight details <ChevronRight size={14} className="group-hover/details:translate-x-1 transition-transform" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {stageView !== 'list' && tempFlight && (
                <div className="w-full h-full min-h-[600px]">
                  <FlightBookingView
                    curation={getCurationAdapter()}
                    preSelectedFlight={tempFlight}
                    initialStep="details"
                    onBack={() => setStageView('list')}
                    onBookingComplete={(details) => {
                      onUpdateCuration({ flightBooking: details, status: 'partially_booked' });
                      setLocalData(prev => ({ ...prev, selectedFlight: tempFlight }));
                      // Note: FlightBookingView stays on its success screen. 
                      // User can close it to return to list, then proceed to hotels.
                    }}
                    onFlightSwap={(f) => setTempFlight(f)}
                  />
                </div>
              )}
            </motion.div>
          ) : activeStage === 'hotels' ? (
            <motion.div key="hotels" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className={`space-y-8 ${stageView !== 'list' ? 'h-full flex-1' : ''}`}>
              {stageView === 'list' && (
                <div className="space-y-8">
                  <div className="flex justify-end">
                    <button
                      onClick={() => { setActiveStage('experiences'); setStageView('list'); }}
                      className="px-6 py-3 rounded-xl border-2 border-red-600 text-slate-400 hover:text-red-600 hover:bg-white dark:hover:bg-slate-800 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                    >
                      Skip to Experiences <ArrowRight size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {ITALY_HOTELS.map(h => (
                      <div key={h.id} className="group bg-white dark:bg-slate-900 rounded-[40px] overflow-hidden shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col">
                        <div className="h-56 overflow-hidden relative"><img src={h.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000" alt="Hotel" /><div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/90 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 text-xs font-black shadow-lg"><Star size={14} className="text-yellow-500 fill-yellow-500" /> {h.rating}</div></div>
                        <div className="p-8 flex-1 flex flex-col"><h4 className="text-2xl font-black mb-2 leading-tight text-slate-900 dark:text-white">{h.name}</h4><p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 italic font-medium">"{h.description}"</p><div className="mt-auto flex items-end justify-between"><div><p className="text-3xl font-black text-red-600">INR{h.pricePerNight}</p><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">per night</p></div><button onClick={() => { setTempHotel(h); setStageView('details'); }} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-4 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><ChevronRight size={20} /></button></div></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {stageView !== 'list' && tempHotel && (
                <div className="w-full h-full min-h-[600px]">
                  <HotelBookingView
                    curation={getCurationAdapter()}
                    preSelectedHotel={tempHotel}
                    initialStep="details"
                    onBack={() => setStageView('list')}
                    onBookingComplete={(details) => {
                      onUpdateCuration({ hotelBooking: details, status: 'partially_booked' });
                      setLocalData(prev => ({ ...prev, selectedHotel: tempHotel }));
                    }}
                    onHotelSwap={(h) => setTempHotel(h)}
                  />
                </div>
              )}
            </motion.div>
          ) : activeStage === 'experiences' ? (
            <motion.div key="exp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className={`space-y-12 ${stageView !== 'list' ? 'h-full flex-1' : ''}`}>
              {stageView === 'list' && (
                <div className="space-y-10">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Secure Activities</h3>
                    <button
                      onClick={() => { setActiveStage('essentials'); setStageView('list'); }}
                      className="px-6 py-3 rounded-xl border-2 border-red-600 text-slate-400 hover:text-red-600 hover:bg-white dark:hover:bg-slate-800 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                    >
                      Skip to Essentials <ArrowRight size={14} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-6">
                    {ITALY_ACTIVITIES.map(a => {
                      const bookings = localData.selectedActivities.filter(b => b.activityId === a.id);
                      const hasBooking = bookings.length > 0;

                      return (
                        <div key={a.id} className={`bg-white dark:bg-slate-900 border transition-all duration-500 overflow-hidden ${hasBooking ? 'rounded-[48px] border-red-600 shadow-2xl' : 'rounded-[32px] border-slate-100 dark:border-slate-800 shadow-xl'}`}>
                          <div className="p-8 flex flex-col md:flex-row items-center gap-10">
                            <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-lg flex-shrink-0">
                              <img src={a.imageUrl} className="w-full h-full object-cover" alt={a.name} />
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-3">
                                <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{a.name}</h4>
                                {hasBooking && <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm"><Check size={12} strokeWidth={4} /> {bookings.length} Booked</span>}
                              </div>
                              <p className="text-xs font-black text-red-600 uppercase tracking-widest">{a.category} • {a.duration}</p>
                              {hasBooking && <p className="text-xs font-bold text-slate-500 dark:text-slate-400 italic">Scheduled for {bookings[0].date} at {bookings[0].time}</p>}
                            </div>
                            <div className="flex items-center gap-10">
                              <div className="text-right">
                                <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">INR{a.price}</p>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">per person</p>
                              </div>
                              <button
                                onClick={() => { setTempActivity(a); setStageView('details'); }}
                                className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md hover:bg-red-600 hover:text-white`}
                              >
                                {hasBooking ? 'Book Another' : 'Book Experience'}
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {stageView !== 'list' && tempActivity && (
                <div className="w-full h-full min-h-[600px]">
                  <ExperienceBookingView
                    curation={getCurationAdapter()}
                    activity={tempActivity}
                    onBack={() => setStageView('list')}
                    onComplete={(details) => {
                      const newBooking: ExperienceBooking = {
                        ...details,
                        quantity: 1,
                        imageUrl: tempActivity.imageUrl // Ensure imageUrl is passed
                      };
                      // Append to existing activities
                      const updatedActivities = [...localData.selectedActivities, newBooking];
                      onUpdateCuration({ experienceBookings: updatedActivities, status: 'partially_booked' });
                      setLocalData(prev => ({ ...prev, selectedActivities: updatedActivities }));
                      // Stay in success view or go back? ExperienceBookingView handles success state internally.
                      // But if ExperienceBookingView calls onComplete, it might expect parent to handle close/nav?
                      // Actually ExperienceBookingView has internal 'success' step.
                      // Reading ExperienceBookingView:
                      // It has internal state 'step'. onComplete is called after 'handlePay' (after delay).
                      // Then it shows 'success' step.
                      // It does NOT auto-navigate.
                      // Users click "Return to Dashboard" which calls onBack.
                      // Wait, onBack is passed as `onBack`.
                      // In ExperienceBookingView:
                      // <button onClick={onBack} ...>Return to Dashboard</button>
                      // So onComplete is just for data update.
                    }}
                  />
                </div>
              )}
            </motion.div>
          ) : activeStage === 'essentials' ? (
            <motion.div key="ess" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
              {stageView === 'list' && (
                <div className="space-y-10">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-slate-900 dark:text-white">The Marketplace</h3>
                      <p className="text-sm sm:text-base text-slate-500 font-medium italic">Cherry-pick elite ancillary services for your trip.</p>
                    </div>
                    <button
                      onClick={() => { setActiveStage('summary'); setStageView('list'); }}
                      className="px-6 py-3 rounded-xl border-2 border-red-600 text-slate-400 hover:text-red-600 hover:bg-white dark:hover:bg-slate-800 transition-all font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                    >
                      Skip to Summary <ArrowRight size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {ESSENTIALS_CATALOG.map(e => (
                      <div key={e.id} className={`p-8 rounded-[40px] border-4 transition-all space-y-6 relative overflow-hidden group ${tempEssentials.find(i => i.id === e.id) ? 'bg-red-50 dark:bg-red-900/10 border-red-600 shadow-2xl' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
                        <div className="flex justify-between items-center relative z-10">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tempEssentials.find(i => i.id === e.id) ? 'bg-red-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                            <LayoutDashboard size={24} />
                          </div>
                          <div className="flex items-center gap-2">
                            {tempEssentials.find(i => i.id === e.id) && (
                              <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg animate-bounce">
                                <Check size={16} strokeWidth={4} />
                              </div>
                            )}
                          </div>
                        </div>
                        <button onClick={() => toggleEssential(e)} className="w-full text-left outline-none group-active:scale-95 transition-transform">
                          <div className="relative z-10"><h4 className="text-xl font-black leading-tight mb-2 text-slate-900 dark:text-white group-hover:text-red-600">{e.title}</h4><p className="text-xs text-slate-500 font-medium leading-relaxed">{e.description}</p></div>
                          <div className="relative z-10 font-black text-red-600 text-2xl mt-4">INR{e.price}</div>
                        </button>
                        <div className="flex justify-end pt-2">
                          <button
                            onClick={() => setViewingEssential(e)}
                            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-10 flex justify-center">
                    <button
                      onClick={handleBookEssentials}
                      disabled={tempEssentials.length === 0}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-30 text-white px-16 py-6 rounded-[32px] font-black text-xl shadow-2xl shadow-red-600/30 flex items-center gap-4 group transition-all"
                    >
                      Checkout <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                  </div>
                </div>
              )}

              {stageView !== 'list' && (
                <div className="w-full h-full min-h-[600px]">
                  <BundleBookingView
                    curation={getCurationAdapter()}
                    essentials={tempEssentials}
                    onBack={() => setStageView('list')}
                    onComplete={(details) => {
                      const essentialsBooking = {
                        ...details,
                        bookingRef: details.bookingRef || `MEB-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
                      };
                      onUpdateCuration({ essentialsBooking, status: 'partially_booked' });
                      setLocalData(prev => ({ ...prev, selectedEssentials: tempEssentials }));
                      setStageView('success');
                      // Wait, BundleBookingView has internal success step.
                      // If we setStageView('success') here, ManualBuildingDashboard will show IT'S success view?
                      // Line  386: isStandardizedView includes (stageView === 'success' && activeStage !== 'flights').
                      // If activeStage IS 'essentials', and stageView is 'success', isStandardizedView is TRUE.
                      // So headers are hidden.
                      // But what renders?
                      // Lines 1353+ (in previous view) handle 'summary' stage.
                      // Where is 'success' view rendered in ManualBuildingDashboard?
                      // It seems ManualBuildingDashboard does NOT have a global 'success' view for essentials?
                      // The old code (lines 1334-1340) setStageView('success') inside setTimeOut.
                      // Then what?
                      // I don't see `stageView === 'success'` block in `activeStage === 'essentials'`.
                      // It might fall through or show nothing?
                      // Ah, `isStandardizedView` logic implies we want to show the Component.
                      // If `BundleBookingView` handles success, we should keep `stageView` as something that renders `BundleBookingView`.
                      // If I set `stageView('success')`, does `stageView !== 'list'` match? Yes.
                      // So `BundleBookingView` stays mounted.
                      // `BundleBookingView` handles its own success state.
                      // So actually I should NOT setStageView('success') if I want BundleBookingView to show its success.
                      // But wait, `onComplete` in `BundleBookingView` is called *after* success animation?
                      // Lines 40-44 in BundleBookingView: setStep('success'); onComplete(...).
                      // So `BundleBookingView` is showing success.
                      // If I setStageView('success') in parent, `BundleBookingView` re-renders (props change?).
                      // If I don't change stageView, it stays 'payment' (or whatever it was).
                      // The replacement block uses `stageView !== 'list'`.
                      // So if stageView is 'payment', it renders BundleBookingView.
                      // If I set it to 'success', it still renders BundleBookingView.
                      // So it doesn't matter much, but 'success' is semantically correct for the dashboard state.
                    }}
                  />
                </div>
              )}

            </motion.div>
          ) : (
            <motion.div key="summary" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12 pb-24">
              <div className="text-center space-y-4">
                <h2 className="text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Itinerary Aggregate</h2>
                <p className="text-lg text-slate-500 font-medium italic">High-fidelity curation summary for {localData.tripName}</p>
              </div>

              <div className="w-full space-y-6 px-4">
                {/* FLIGHT ACCORDION */}
                {localData.selectedFlight && (
                  <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedSummary(expandedSummary === 'flight' ? null : 'flight')}
                      className="w-full flex items-center gap-6 p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Plane size={24} /></div>
                      <div className="flex-1 text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Booked Flight</p>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white leading-none">
                          {localData.selectedFlight?.airline} <span className="text-slate-400 font-bold ml-2">• First Class</span>
                        </h4>
                      </div>
                      <div className="text-right flex items-center gap-6">
                        <p className="text-xl font-black text-slate-900 dark:text-white">INR{localData.selectedFlight?.price ? localData.selectedFlight.price * totalTravellers : 0}</p>
                        <ChevronDown className={`text-slate-400 transition-transform duration-500 ${expandedSummary === 'flight' ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    <AnimatePresence>
                      {expandedSummary === 'flight' && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-[#0F172A]">
                          <div className="p-8">
                            <div className="bg-[#0F172A] rounded-[48px] overflow-hidden shadow-2xl border border-slate-800 w-full flex flex-col md:flex-row text-white">
                              <div className="flex-1 p-12 space-y-12 text-left">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-4">
                                    <img src={localData.selectedFlight?.airlineLogo} className="w-10 h-10 object-contain" alt="Airline" />
                                    <h4 className="text-2xl font-black uppercase tracking-tight">{localData.selectedFlight?.airline}</h4>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</p>
                                    <p className="font-black text-red-600">FIRST CLASS</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between gap-10">
                                  <div className="space-y-1 text-center">
                                    <p className="text-5xl font-black leading-none">{localData.selectedFlight?.originIata || 'DXB'}</p>
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest mt-2">{localData.selectedFlight?.departureTime}</p>
                                  </div>
                                  <div className="flex-1 h-[2px] bg-slate-800 relative">
                                    <Plane size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90 text-red-600" />
                                  </div>
                                  <div className="space-y-1 text-center">
                                    <p className="text-5xl font-black leading-none">{localData.selectedFlight?.destinationIata || 'DXB'}</p>
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest mt-2">{localData.selectedFlight?.arrivalTime}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-8 pt-10 border-t border-slate-800">
                                  <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lead Passenger</p><p className="font-black text-lg">Alex Johnson</p><p className="text-xs text-slate-500 font-medium">+{totalTravellers - 1} Travelers</p></div>
                                </div>
                              </div>
                              <div className="bg-slate-900/50 p-12 flex flex-col items-center justify-center text-center gap-8 md:w-72 border-l border-slate-800">
                                <div className="p-5 bg-white rounded-3xl shadow-2xl"><Ticket className="w-16 h-16 text-slate-950" strokeWidth={2.5} /></div>
                                <div><p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Confirmation</p><p className="text-2xl font-mono font-black text-red-500">FL-6P40</p></div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* HOTEL ACCORDION */}
                {localData.selectedHotel && (
                  <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedSummary(expandedSummary === 'hotel' ? null : 'hotel')}
                      className="w-full flex items-center gap-6 p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Building2 size={24} /></div>
                      <div className="flex-1 text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sanctuary Selection</p>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white leading-none">
                          {localData.selectedHotel?.name} <span className="text-slate-400 font-bold ml-2">• {localData.selectedRoomType}</span>
                        </h4>
                      </div>
                      <div className="text-right flex items-center gap-6">
                        <p className="text-xl font-black text-slate-900 dark:text-white">INR{localData.selectedHotel?.pricePerNight ? localData.selectedHotel.pricePerNight * 3 : 0}</p>
                        <ChevronDown className={`text-slate-400 transition-transform duration-500 ${expandedSummary === 'hotel' ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    <AnimatePresence>
                      {expandedSummary === 'hotel' && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-[#0F172A]">
                          <div className="p-8">
                            <div className="bg-[#0F172A] rounded-[48px] overflow-hidden shadow-2xl border border-white/5">
                              <div className="h-80 relative overflow-hidden">
                                <img src={localData.selectedHotel?.imageUrl} className="w-full h-full object-cover" alt="Hotel" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/20 to-transparent" />
                                <div className="absolute bottom-10 left-12">
                                  <h4 className="text-4xl font-black text-white mb-2 leading-none">{localData.selectedHotel?.name}</h4>
                                  <div className="flex items-center gap-2 text-slate-300 font-bold uppercase tracking-widest text-xs">
                                    <MapPin size={14} className="text-red-600" /> {localData.destination}, UAE
                                  </div>
                                </div>
                              </div>

                              <div className="p-12 space-y-12">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]"><User size={12} className="text-red-600" /> Guest Name</div>
                                    <p className="font-black text-white text-2xl">{guestInfo.name}</p>
                                  </div>
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]"><Calendar size={12} className="text-red-600" /> Stay Dates</div>
                                    <p className="font-black text-white text-2xl">Oct 24 - Oct 27, 2024</p>
                                  </div>
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px]"><BedDouble size={12} className="text-red-600" /> Room Type</div>
                                    <p className="font-black text-white text-xl">{localData.selectedRoomType || 'Executive Suite'}</p>
                                  </div>
                                </div>

                                <div className="pt-12 border-t border-white/10 space-y-8 text-white">
                                  <h5 className="font-black text-slate-500 uppercase tracking-[0.3em] text-[10px] flex items-center gap-3"><Receipt size={16} className="text-red-600" /> Price Breakdown</h5>
                                  <div className="space-y-6">
                                    <div className="flex justify-between items-center"><span className="text-slate-400 font-bold">Accommodation (3 Nights x INR{localData.selectedHotel?.pricePerNight})</span><span className="text-white font-black text-xl">INR{(localData.selectedHotel?.pricePerNight || 0) * 3}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-slate-400 font-bold">Taxes & Resort Fees</span><span className="text-white font-black text-xl">AED125</span></div>
                                    <div className="flex justify-between items-center text-red-600 font-black"><span className="uppercase tracking-widest text-xs">Special Savings</span><span className="text-xl">-AED125</span></div>
                                    <div className="flex justify-between items-end pt-10 border-t-2 border-dashed border-white/10"><span className="text-2xl font-black text-white uppercase tracking-tighter">Aggregate Total</span><span className="text-6xl font-black text-red-600">INR{(localData.selectedHotel?.pricePerNight || 0) * 3}</span></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* EXPERIENCES ACCORDION */}
                {localData.selectedActivities.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedSummary(expandedSummary === 'exp' ? null : 'exp')}
                      className="w-full flex items-center gap-6 p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Camera size={24} /></div>
                      <div className="flex-1 text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Curated Events</p>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white leading-none">
                          {localData.selectedActivities.length} Premium Activities <span className="text-slate-400 font-bold ml-2">• Fully Scheduled</span>
                        </h4>
                      </div>
                      <div className="text-right flex items-center gap-6">
                        <p className="text-xl font-black text-slate-900 dark:text-white">INR{localData.selectedActivities.reduce((s, a) => s + (a.price * totalTravellers), 0)}</p>
                        <ChevronDown className={`text-slate-400 transition-transform duration-500 ${expandedSummary === 'exp' ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    <AnimatePresence>
                      {expandedSummary === 'exp' && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-[#0F172A]">
                          <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                              {localData.selectedActivities.map((booking) => {
                                const activity = ITALY_ACTIVITIES.find(a => a.id === booking.activityId);
                                return (
                                  <div key={booking.bookingRef} className="bg-[#0F172A] rounded-[48px] overflow-hidden shadow-2xl border border-white/5 flex flex-col">
                                    <div className="h-48 relative overflow-hidden">
                                      <img src={activity?.imageUrl} alt={booking.activityName} className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent" />
                                      <div className="absolute bottom-6 left-8">
                                        <h4 className="text-2xl font-black text-white mb-1 leading-none">{booking.activityName}</h4>
                                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest flex items-center gap-2">
                                          <MapPin size={12} className="text-red-600" /> {localData.destination}, UAE
                                        </p>
                                      </div>
                                    </div>
                                    <div className="p-8 flex flex-col lg:flex-row gap-8">
                                      <div className="flex-1 space-y-6">
                                        <div className="grid grid-cols-2 gap-4 text-white">
                                          <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Date</p><p className="font-black text-xs">{booking.date}</p></div>
                                          <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Slot</p><p className="font-black text-xs">{booking.time}</p></div>
                                          <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Guests</p><p className="font-black text-xs">{totalTravellers}</p></div>
                                          <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Ref</p><p className="font-black text-red-500 text-xs">{booking.bookingRef}</p></div>
                                        </div>
                                      </div>
                                      <div className="flex flex-col items-center justify-center p-4 bg-white rounded-3xl shadow-xl h-fit">
                                        <QrCode size={60} className="text-slate-900" />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* ESSENTIALS ACCORDION */}
                {localData.selectedEssentials.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedSummary(expandedSummary === 'ess' ? null : 'ess')}
                      className="w-full flex items-center gap-6 p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><ShoppingBag size={24} /></div>
                      <div className="flex-1 text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ancillary Bundle</p>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white leading-none">
                          {localData.selectedEssentials.length} Marketplace Services <span className="text-slate-400 font-bold ml-2">• Fully Secured</span>
                        </h4>
                      </div>
                      <div className="text-right flex items-center gap-6">
                        <p className="text-xl font-black text-slate-900 dark:text-white">INR{localData.selectedEssentials.reduce((s, i) => s + i.price, 0)}</p>
                        <ChevronDown className={`text-slate-400 transition-transform duration-500 ${expandedSummary === 'ess' ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    <AnimatePresence>
                      {expandedSummary === 'ess' && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-[#0F172A]">
                          <div className="p-8">
                            <div className="bg-[#0F172A] rounded-[48px] overflow-hidden shadow-2xl border border-white/5 w-full flex flex-col md:flex-row">
                              <div className="flex-1 p-12 space-y-10">
                                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                  <Box className="text-red-600" /> Active Bundle Items
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {localData.selectedEssentials.map(item => {
                                    const Icon = EssentialIconMap[item.icon] || Box;
                                    return (
                                      <div key={item.id} className="flex items-center gap-4 p-5 bg-white/5 rounded-3xl border border-white/5">
                                        <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white">
                                          <Icon size={24} />
                                        </div>
                                        <div>
                                          <p className="font-bold text-white text-sm">{item.title}</p>
                                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{item.category}</p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                                <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                                  <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Paid</p>
                                    <p className="text-5xl font-black text-red-600">INR{localData.selectedEssentials.reduce((s, i) => s + i.price, 0)}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Master Ref</p>
                                    <p className="text-xl font-mono font-black text-white">ESS-BNDL-6P40</p>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-slate-900/50 p-12 flex flex-col items-center justify-center text-center gap-8 md:w-80 border-l border-white/5">
                                <div className="p-6 bg-white rounded-[40px] shadow-2xl">
                                  <QrCode size={140} className="text-slate-950" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* FINAL ACTION BUTTON */}
                <div className="pt-10 flex flex-col items-center gap-6">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Aggregate Curation Total</p>
                    <p className="text-6xl font-black text-red-600">
                      INR{((localData.selectedFlight?.price || 0) * totalTravellers) +
                        ((localData.selectedHotel?.pricePerNight || 0) * 3) +
                        localData.selectedActivities.reduce((s, a) => s + (a.price * totalTravellers), 0) +
                        localData.selectedEssentials.reduce((s, i) => s + i.price, 0)}
                    </p>
                  </div>
                  <button
                    onClick={() => onFinalize(localData)}
                    className="bg-red-600 text-white px-24 py-7 rounded-[32px] font-black text-2xl shadow-red-600/30 flex items-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-2xl"
                  >
                    Return Home
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Details Modal (Marketplace) */}
      <AnimatePresence>
        {viewingEssential && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingEssential(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl p-12 border border-slate-100 dark:border-slate-800 text-center">
              <button onClick={() => setViewingEssential(null)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-red-600 transition-colors">
                <X size={32} />
              </button>
              <div className="space-y-8">
                <div className="w-24 h-24 bg-red-600 rounded-[32px] flex items-center justify-center text-white mx-auto shadow-xl shadow-red-600/30">
                  {React.createElement(EssentialIconMap[viewingEssential.icon] || Box, { size: 48 })}
                </div>
                <div>
                  <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-3 inline-block">
                    Premium {viewingEssential.category}
                  </span>
                  <h3 className="text-4xl font-black text-slate-900 dark:text-white leading-tight">{viewingEssential.title}</h3>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium italic leading-relaxed text-lg">
                  "{viewingEssential.description || "Tailored ancillary service ensuring seamless integration with your elite travel itinerary."}"
                </p>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Curation Price</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white">INR{viewingEssential.price}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                      <Check size={14} /> Elite Protected
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!tempEssentials.find(i => i.id === viewingEssential.id)) toggleEssential(viewingEssential);
                    setViewingEssential(null);
                  }}
                  className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-6 rounded-3xl font-black text-xl transition-all shadow-xl hover:bg-red-600 hover:text-white"
                >
                  {tempEssentials.find(i => i.id === viewingEssential.id) ? 'Selected' : 'Select Service'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManualBuildingDashboard;