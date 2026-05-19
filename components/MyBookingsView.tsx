import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ticket, Hotel as HotelIcon, Plane, Sparkles, CheckCircle2, Calendar, MapPin, Hash, ArrowRight, ShieldCheck, Box, X, Info, FileText, Camera, QrCode, Clock, Map, Briefcase, User, ChevronRight } from 'lucide-react';
import { Curation, BookingCategory, ExperienceBooking, Essential } from '../types';
import PreTripConcierge from './PreTripConcierge';
import BundleBookingView from './BundleBookingView';
import FlightBookingView from './FlightBookingView';
import HotelBookingView from './HotelBookingView';
import SafeImage from './SafeImage';

interface MyBookingsViewProps {
  curations: Curation[];
  initialCategory?: BookingCategory;
  onBookEssentials?: (essentials: Essential[], curationId: string) => void;
  onBundleComplete?: (details: any, curationId: string) => void;
}

// Helper to generate itinerary directly from booked assets instead of random templates
const generateItineraryFromBookings = (c: Curation) => {
  const schedule = [];

  // Calculate total days from dates if available, otherwise fallback to experiences or default 3
  let totalDays = 3;
  if (c.startDate && c.endDate) {
    const start = new Date(c.startDate);
    const end = new Date(c.endDate);
    totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  } else if (c.experienceBookings && c.experienceBookings.length > 0) {
    const dates = new Set(c.experienceBookings.map(e => e.date).filter(Boolean));
    totalDays = Math.max(3, dates.size + 2); // Arrival + Experiences + Departure
  }

  // Day 1: Arrival & Check-in
  const day1Events = [];
  if (c.flightBooking) {
    day1Events.push({ time: c.flightBooking.departureTime || "08:00 AM", activity: `Flight Departure: ${c.flightBooking.airline}` });
    day1Events.push({ time: c.flightBooking.arrivalTime || "12:00 PM", activity: `Arrival at ${c.destination.name}` });
  }
  if (c.hotelBooking) {
    day1Events.push({ time: "03:00 PM", activity: `Check-in at ${c.hotelBooking.hotelName}` });
  } else {
    day1Events.push({ time: "03:00 PM", activity: `Arrival & Settling in ${c.destination.name}` });
  }

  schedule.push({
    day: 1,
    title: "Arrival & Welcome",
    schedule: day1Events.length > 0 ? day1Events : [{ time: "12:00 PM", activity: "Arrival" }]
  });

  // Middle Days: Experiences
  const expByDayOffset: Record<number, ExperienceBooking[]> = {};
  if (c.experienceBookings && c.experienceBookings.length > 0) {
    const start = c.startDate ? new Date(c.startDate) : null;

    c.experienceBookings.forEach(exp => {
      let dayIdx = 2; // Default to Day 2 if we can't calculate
      if (start && exp.date) {
        const expDate = new Date(exp.date);
        dayIdx = Math.round((expDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }
      if (!expByDayOffset[dayIdx]) expByDayOffset[dayIdx] = [];
      expByDayOffset[dayIdx].push(exp);
    });
  }

  // Fill all days from 2 to totalDays - 1
  for (let d = 2; d < totalDays; d++) {
    const dayExps = expByDayOffset[d];
    if (dayExps && dayExps.length > 0) {
      schedule.push({
        day: d,
        title: "City Experiences",
        schedule: dayExps.map(exp => ({
          time: exp.time || "10:00 AM",
          activity: exp.activityName
        }))
      });
    } else {
      schedule.push({
        day: d,
        title: "Free Exploration",
        schedule: [
          { time: "10:00 AM", activity: `Explore ${c.destination.name} at your own pace` },
          { time: "02:00 PM", activity: "Lunch at a local recommended spot" },
          { time: "07:00 PM", activity: "Dinner and Evening Leisure" }
        ]
      });
    }
  }

  // Final Day: Departure (if totalDays > 1)
  if (totalDays > 1 || schedule.length === 1) {
    schedule.push({
      day: totalDays,
      title: "Departure",
      schedule: [
        { time: "11:00 AM", activity: "Hotel Checkout" },
        { time: "02:00 PM", activity: "Airport Transfer & Departure" }
      ]
    });
  }

  return schedule;
};

const EssentialIconMap: Record<string, React.ElementType> = {
  Car: Box,
  Wifi: Box,
  Shield: Box,
  Coffee: Box,
  User: Box,
  Zap: Box,
  Ticket: Box
};

const MyBookingsView: React.FC<MyBookingsViewProps> = ({ curations, initialCategory, onBookEssentials, onBundleComplete }) => {
  const [activeCategory, setActiveCategory] = useState<BookingCategory>(initialCategory || 'itinerary');

  React.useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
  }, [initialCategory]);
  const [selectedItem, setSelectedItem] = useState<Essential | null>(null);
  const [selectedCurationForHotelVoucher, setSelectedCurationForHotelVoucher] = useState<Curation | null>(null);
  const [selectedCurationForFlightVoucher, setSelectedCurationForFlightVoucher] = useState<Curation | null>(null);
  const [selectedExpForVoucher, setSelectedExpForVoucher] = useState<{ booking: ExperienceBooking, curation: Curation } | null>(null);
  const [selectedItinerary, setSelectedItinerary] = useState<{ curation: Curation, schedule: any[] } | null>(null);
  const [itineraryDetailMode, setItineraryDetailMode] = useState<'itinerary' | 'flight' | 'hotel' | 'experiences'>('itinerary');
  const [selectedEssentialsForBooking, setSelectedEssentialsForBooking] = useState<{ essentials: Essential[], curation: Curation } | null>(null);

  // Derive bookings from curations
  const hotelBookings = curations.filter(c => c.hotelBooking).map(c => ({
    id: c.hotelBooking!.bookingRef,
    title: c.hotelBooking!.hotelName || 'Premium Hotel',
    location: c.destination.name,
    date: 'Oct 24 - 27, 2024',
    ref: c.hotelBooking!.bookingRef,
    price: c.hotelBooking!.totalPrice,
    imageUrl: c.hotelBooking!.imageUrl || c.destination.hotels[0].imageUrl,
    curationId: c.curationId,
    originalCuration: c
  }));

  const flightBookings = curations.filter(c => c.flightBooking).map(c => ({
    id: c.flightBooking!.bookingRef,
    airline: c.flightBooking!.airline || c.destination.flights[0].airline,
    location: `To ${c.destination.name}`,
    date: 'Oct 24, 2024',
    ref: c.flightBooking!.bookingRef,
    price: c.flightBooking!.price,
    curationId: c.curationId,
    airlineLogo: c.flightBooking!.airlineLogo || c.destination.flights[0].airlineLogo,
    originalCuration: c
  }));

  const experienceBookingsDerive = curations.flatMap(c =>
    (c.experienceBookings || []).map(b => ({
      ...b,
      location: c.destination.name,
      imageUrl: c.destination.activities.find(a => a.id === b.activityId)?.imageUrl || c.destination.imageUrl,
      curationId: c.curationId,
      originalCuration: c
    }))
  );

  // Dynamic derivation of essential bundles
  const otherBookings = curations.filter(c => c.essentialsBooking).map(c => ({
    id: c.essentialsBooking!.bookingRef,
    title: 'Trip Essentials Bundle',
    location: c.destination.name,
    date: 'Oct 2024',
    ref: c.essentialsBooking!.bookingRef,
    price: c.essentialsBooking!.totalPrice,
    curationId: c.curationId,
    items: c.essentialsBooking!.items
  }));

  const itineraryBookings = curations
    .filter(c => c.flightBooking && c.hotelBooking)
    .map(c => {
      const schedule = c.itinerary && c.itinerary.length > 0
        ? c.itinerary.map(day => ({
          day: day.day,
          title: day.title,
          schedule: day.events.map(e => ({ time: e.time, activity: e.description }))
        }))
        : generateItineraryFromBookings(c);

      const startDate = c.startDate ? new Date(c.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Oct 24';
      const endDate = c.endDate ? new Date(c.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Oct 27, 2024';

      return {
        id: c.curationId,
        title: c.tripName || `Trip to ${c.destination.name}`,
        destination: c.destination.name,
        date: `${startDate} - ${endDate}`,
        price: (c.flightBooking?.price || 0) + (c.hotelBooking?.totalPrice || 0) + (c.experienceBookings?.reduce((s, a) => s + a.price, 0) || 0) + (c.essentialsBooking?.totalPrice || 0),
        imageUrl: c.destination.imageUrl,
        curation: c,
        schedule
      };
    });

  const categories: { id: BookingCategory, label: string, icon: any }[] = [
    { id: 'itinerary', label: 'Itinerary', icon: Map },
    { id: 'hotels', label: 'Stays', icon: HotelIcon },
    { id: 'flights', label: 'Travel', icon: Plane },
    { id: 'experiences', label: 'Experiences', icon: Camera },
    { id: 'others', label: 'Others', icon: Sparkles },
    { id: 'concierge', label: 'Anya', icon: Sparkles }
  ];

  const isEmpty =
    (activeCategory === 'hotels' && hotelBookings.length === 0) ||
    (activeCategory === 'flights' && flightBookings.length === 0) ||
    (activeCategory === 'experiences' && experienceBookingsDerive.length === 0) ||
    (activeCategory === 'others' && otherBookings.length === 0) ||
    (activeCategory === 'itinerary' && itineraryBookings.length === 0) ||
    (activeCategory === 'concierge' && curations.length === 0);

  return (
    <div className="flex w-full gap-8 max-w-[1600px] mx-auto min-h-[600px]">
      {/* Left Sidebar Navigation */}
      <div className="w-64 shrink-0 flex flex-col gap-8 border-r border-slate-200 dark:border-slate-800 pr-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-slate-900 shadow-xl">
              <ShieldCheck size={20} />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">My Trips</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Command Center for confirmed itineraries</p>
        </div>

        <nav className="flex flex-col gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 w-full text-left ${activeCategory === cat.id
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <cat.icon size={16} />
              <span>{cat.label}</span>
              {activeCategory === cat.id && (
                <ChevronRight size={14} className="ml-auto opacity-70" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {isEmpty ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50"
            >
              <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center text-red-600 mb-6">
                {activeCategory === 'hotels' ? <HotelIcon size={28} /> : activeCategory === 'flights' ? <Plane size={28} /> : activeCategory === 'experiences' ? <Camera size={28} /> : activeCategory === 'itinerary' ? <Map size={28} /> : <Sparkles size={28} />}
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">No {activeCategory} Found</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-xs italic leading-relaxed">
                Your confirmed assets for {activeCategory} will appear here, safely encrypted and ready for execution.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {activeCategory === 'concierge' && curations[0] && (
                <PreTripConcierge 
                  curation={curations[0]} 
                  onBookEssentials={(essentials, curationId) => {
                    const curation = curations.find(c => c.curationId === curationId);
                    if (curation) {
                      setSelectedEssentialsForBooking({ essentials, curation });
                    }
                  }} 
                />
              )}

              {activeCategory === 'itinerary' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {itineraryBookings.map((trip) => (
                    <div key={trip.id} onClick={() => { setSelectedItinerary({ curation: trip.curation, schedule: trip.schedule }); setItineraryDetailMode('itinerary'); }} className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-800 cursor-pointer transition-all h-full">
                      <div className="h-40 relative shrink-0">
                        <SafeImage src={trip.imageUrl} alt={trip.destination} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" category="activity" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent flex flex-col justify-end p-5">
                          <h4 className="text-lg font-black text-white leading-tight truncate">{trip.title}</h4>
                          <p className="text-[10px] font-black text-red-400 flex items-center gap-1.5 uppercase tracking-widest"><MapPin size={10} /> {trip.destination}</p>
                        </div>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-center mb-6">
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
                            <Calendar size={10} /> {trip.schedule.length} Days
                          </span>
                          <p className="text-lg font-black text-slate-900 dark:text-white">INR {trip.price.toLocaleString()}</p>
                        </div>
                        <button className="w-full py-3 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-all">
                          Full Itinerary <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Data Grid for Hotels */}
              {activeCategory === 'hotels' && (
                <div className="w-full border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <th className="p-4 w-16">Status</th>
                        <th className="p-4">Property</th>
                        <th className="p-4">Dates</th>
                        <th className="p-4">Ref</th>
                        <th className="p-4 text-right">Value</th>
                        <th className="p-4 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {hotelBookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                          <td className="p-4 align-middle">
                            <CheckCircle2 size={16} className="text-green-500" />
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-4">
                              <SafeImage src={booking.imageUrl} className="w-12 h-12 rounded-lg object-cover shadow-sm bg-slate-100 dark:bg-slate-800" alt="" category="hotel" />
                              <div>
                                <p className="text-sm font-black text-slate-900 dark:text-white">{booking.title}</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1 mt-0.5"><MapPin size={10} className="text-red-500" /> {booking.location}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 align-middle text-xs font-bold text-slate-600 dark:text-slate-300 font-mono">{booking.date}</td>
                          <td className="p-4 align-middle text-[10px] font-bold text-slate-500 font-mono">{booking.ref}</td>
                          <td className="p-4 align-middle text-right text-sm font-black text-slate-900 dark:text-white">INR {booking.price.toLocaleString()}</td>
                          <td className="p-4 align-middle text-right">
                            <button
                              onClick={() => setSelectedCurationForHotelVoucher(booking.originalCuration)}
                              className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black uppercase tracking-widest rounded transition-all hover:bg-red-600 dark:hover:bg-red-600 hover:text-white"
                            >
                              Voucher
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Data Grid for Flights */}
              {activeCategory === 'flights' && (
                <div className="w-full border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <th className="p-4 w-16">Status</th>
                        <th className="p-4">Carrier</th>
                        <th className="p-4">Route</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Ref</th>
                        <th className="p-4 text-right">Value</th>
                        <th className="p-4 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {flightBookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="p-4 align-middle"><CheckCircle2 size={16} className="text-green-500" /></td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 bg-white rounded-md p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <SafeImage src={booking.airlineLogo} className="w-full h-full object-contain" alt="" category="flight" />
                              </div>
                              <span className="font-black text-slate-900 dark:text-white">{booking.airline}</span>
                            </div>
                          </td>
                          <td className="p-4 align-middle font-bold text-slate-600 dark:text-slate-300">{booking.location}</td>
                          <td className="p-4 align-middle text-xs font-bold text-slate-600 dark:text-slate-300 font-mono">{booking.date}</td>
                          <td className="p-4 align-middle text-[10px] text-slate-500 font-bold font-mono">{booking.ref}</td>
                          <td className="p-4 align-middle text-right font-black text-slate-900 dark:text-white">INR {booking.price.toLocaleString()}</td>
                          <td className="p-4 align-middle text-right">
                            <button
                              onClick={() => setSelectedCurationForFlightVoucher(booking.originalCuration)}
                              className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black uppercase tracking-widest rounded transition-all hover:bg-red-600 dark:hover:bg-red-600 hover:text-white"
                            >
                              Ticket
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Data Grid for Experiences */}
              {activeCategory === 'experiences' && (
                <div className="w-full border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <th className="p-4 w-16">Status</th>
                        <th className="p-4">Experience</th>
                        <th className="p-4">When</th>
                        <th className="p-4">Ref</th>
                        <th className="p-4 text-right">Value</th>
                        <th className="p-4 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {experienceBookingsDerive.map((booking) => (
                        <tr key={booking.bookingRef} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                          <td className="p-4 align-middle"><CheckCircle2 size={16} className="text-green-500" /></td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-4">
                              <SafeImage src={booking.imageUrl} className="w-12 h-12 rounded-lg object-cover shadow-sm bg-slate-100 dark:bg-slate-800" alt="" category="hotel" />
                              <div>
                                <p className="text-sm font-black text-slate-900 dark:text-white max-w-[200px] truncate">{booking.activityName}</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1 mt-0.5"><MapPin size={10} className="text-red-500" /> {booking.location}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 align-middle text-xs font-bold text-slate-600 dark:text-slate-300 font-mono">{booking.date} at {booking.time}</td>
                          <td className="p-4 align-middle text-[10px] text-slate-500 font-bold font-mono">{booking.bookingRef}</td>
                          <td className="p-4 align-middle text-right font-black text-slate-900 dark:text-white">INR {booking.price.toLocaleString()}</td>
                          <td className="p-4 align-middle text-right">
                            <button
                              onClick={() => setSelectedExpForVoucher({ booking, curation: booking.originalCuration })}
                              className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black uppercase tracking-widest rounded transition-all hover:bg-red-600 dark:hover:bg-red-600 hover:text-white"
                            >
                              Pass
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Data Grid for Others (Essentials) */}
              {activeCategory === 'others' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {otherBookings.map((booking) => (
                    <div key={booking.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-600/20">
                              <Box size={20} />
                            </div>
                            <div>
                              <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">Trip Essentials</h4>
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ref: {booking.ref}</span>
                            </div>
                          </div>
                          <span className="bg-green-50 dark:bg-green-900/20 text-green-600 border border-green-200 dark:border-green-900/30 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                            <CheckCircle2 size={10} /> Active
                          </span>
                        </div>
                        <div className="mb-6 space-y-2">
                          {booking.items.map((item: Essential) => (
                            <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.title}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-slate-900 dark:text-white">INR {item.price}</span>
                                <button
                                  onClick={() => setSelectedItem(item)}
                                  className="text-slate-400 hover:text-red-600 transition-colors"
                                >
                                  <Info size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Total Value</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">INR {booking.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Essentials Booking Sliding Panel */}
      <AnimatePresence>
        {selectedEssentialsForBooking && (
          <div className="fixed inset-0 z-[200] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setSelectedEssentialsForBooking(null)} 
              className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-3xl h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col z-10 overflow-hidden"
            >
              <BundleBookingView 
                curation={selectedEssentialsForBooking.curation}
                essentials={selectedEssentialsForBooking.essentials}
                onComplete={(details) => {
                  if (onBundleComplete) {
                    onBundleComplete(details, selectedEssentialsForBooking.curation.curationId);
                  }
                  // Keep it open for success state, or close it?
                  // BundleBookingView handles success state internally.
                }}
                onBack={() => setSelectedEssentialsForBooking(null)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Itinerary Detail Modal (Slide-in) */}
      <AnimatePresence>
        {selectedItinerary && (
          <div className="fixed inset-0 z-[200] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItinerary(null)} className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col pt-safe pb-safe z-10"
            >
              <div className="absolute top-4 left-4 z-[210]">
                <button onClick={() => setSelectedItinerary(null)} className="p-2 bg-slate-900/20 backdrop-blur-md hover:bg-slate-900/40 rounded-full text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto w-full">
                <div className="h-48 relative shrink-0">
                  <SafeImage src={selectedItinerary.curation.destination.imageUrl} className="w-full h-full object-cover" alt="" category="activity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 w-full p-6 flex items-end justify-between">
                    <div>
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest mb-2 inline-block">Official Itinerary</span>
                        <h2 className="text-2xl font-black text-white mb-1">{selectedItinerary.curation.tripName || `Trip to ${selectedItinerary.curation.destination.name}`}</h2>
                        <p className="text-xs text-slate-300 font-medium italic flex items-center gap-1.5">
                          <Calendar size={12} /> {selectedItinerary.curation.startDate ? new Date(selectedItinerary.curation.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : 'October 24'} - {selectedItinerary.curation.endDate ? new Date(selectedItinerary.curation.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '27, 2024'}
                        </p>
                      </motion.div>
                    </div>
                    <div className="text-right hidden md:block">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Value</p>
                      <p className="text-xl font-black text-white">INR {((selectedItinerary.curation.flightBooking?.price || 0) + (selectedItinerary.curation.hotelBooking?.totalPrice || 0) + (selectedItinerary.curation.experienceBookings?.reduce((s, a) => s + a.price, 0) || 0) + (selectedItinerary.curation.essentialsBooking?.totalPrice || 0)).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-8">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 justify-center md:grid-cols-3 gap-4">
                    {selectedItinerary.curation.flightBooking && (
                      <div
                        onClick={() => setItineraryDetailMode('flight')}
                        className={`p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border transition-colors cursor-pointer ${itineraryDetailMode === 'flight' ? 'border-red-600 ring-2 ring-red-600/10' : 'border-slate-100 dark:border-slate-800 hover:border-red-600/50'}`}
                      >
                        <div className="flex items-center gap-2 mb-3 text-slate-400 font-black uppercase tracking-widest text-[9px]"><Plane size={12} className="text-red-500" /> Flight</div>
                        <div className="flex items-center gap-3">
                          <SafeImage src={selectedItinerary.curation.flightBooking.airlineLogo} className="w-8 h-8 object-contain" alt="" category="flight" />
                          <div>
                            <p className="font-black text-sm text-slate-900 dark:text-white leading-tight">{selectedItinerary.curation.flightBooking.airline}</p>
                            <p className="text-[10px] text-slate-500 font-bold">{selectedItinerary.curation.flightBooking.originIata} - {selectedItinerary.curation.flightBooking.destinationIata}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedItinerary.curation.hotelBooking && (
                      <div
                        onClick={() => setItineraryDetailMode('hotel')}
                        className={`p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border transition-colors cursor-pointer ${itineraryDetailMode === 'hotel' ? 'border-red-600 ring-2 ring-red-600/10' : 'border-slate-100 dark:border-slate-800 hover:border-red-600/50'}`}
                      >
                        <div className="flex items-center gap-2 mb-2 text-slate-400 font-black uppercase tracking-widest text-[9px]"><HotelIcon size={12} className="text-red-500" /> Stay</div>
                        <p className="font-black text-sm text-slate-900 dark:text-white leading-tight mb-0.5 truncate">{selectedItinerary.curation.hotelBooking.hotelName}</p>
                        <p className="text-[10px] text-slate-500 font-bold truncate">{selectedItinerary.curation.hotelBooking.roomType}</p>
                      </div>
                    )}
                    <div
                      onClick={() => setItineraryDetailMode('experiences')}
                      className={`p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border transition-colors cursor-pointer ${itineraryDetailMode === 'experiences' ? 'border-red-600 ring-2 ring-red-600/10' : 'border-slate-100 dark:border-slate-800 hover:border-red-600/50'}`}
                    >
                      <div className="flex items-center gap-2 mb-2 text-slate-400 font-black uppercase tracking-widest text-[9px]"><Sparkles size={12} className="text-red-500" /> Activities</div>
                      <p className="font-black text-sm text-slate-900 dark:text-white leading-tight mb-0.5">{selectedItinerary.curation.experienceBookings?.length || 0} Experiences</p>
                      <p className="text-[10px] text-slate-500 font-bold">Planned in destination</p>
                    </div>
                  </div>

                  {/* Timeline or Contextual Booking Detail */}
                  <div className="relative">
                    <AnimatePresence mode="wait">
                      {itineraryDetailMode === 'itinerary' && (
                        <motion.div
                          key="itinerary-log"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                        >
                          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 border-b border-slate-100 dark:border-slate-800 pb-2">Schedule Log</h3>
                          <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200 dark:before:bg-slate-800">
                            {selectedItinerary.schedule.map((day, idx) => (
                              <div key={idx} className="relative pl-12">
                                <div className="absolute left-0 top-0 w-7 h-7 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-full flex items-center justify-center text-xs font-black ring-4 ring-white dark:ring-slate-900 z-10">
                                  {day.day}
                                </div>
                                <div className="space-y-4">
                                  <h4 className="text-sm font-black text-slate-900 dark:text-white pt-1">{day.title}</h4>
                                  <div className="grid grid-cols-1 gap-3">
                                    {day.schedule.map((slot: any, sIdx: number) => (
                                      <div key={sIdx} className="flex gap-4 items-center group bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                                        <span className="w-16 font-mono font-bold text-slate-400 text-[10px] text-right shrink-0">{slot.time}</span>
                                        <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700" />
                                        <p className="font-bold text-xs text-slate-900 dark:text-white flex-1">{slot.activity}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {itineraryDetailMode === 'flight' && selectedItinerary.curation.flightBooking && (
                        <motion.div
                          key="flight-detail"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-8"
                        >
                          <div className="flex items-center justify-between border-b dark:border-slate-800 pb-4">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Flight Details</h3>
                            <button onClick={() => setItineraryDetailMode('itinerary')} className="text-[10px] font-black uppercase text-red-600 hover:underline">Back to Itinerary</button>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/30 p-8 rounded-3xl space-y-8">
                            <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-white rounded-2xl p-2 shadow-sm flex items-center justify-center border border-slate-100 dark:border-slate-700">
                                <SafeImage src={selectedItinerary.curation.flightBooking.airlineLogo} className="w-full h-full object-contain" alt="" category="flight" />
                              </div>
                              <div>
                                <h4 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{selectedItinerary.curation.flightBooking.airline}</h4>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedItinerary.curation.flightBooking.departureTime} – {selectedItinerary.curation.flightBooking.arrivalTime}</p>
                              </div>
                            </div>
                            <div className="flex justify-between items-center py-6 border-y border-slate-200 dark:border-slate-700">
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Route</p>
                                <p className="text-lg font-black text-slate-900 dark:text-white">{selectedItinerary.curation.flightBooking.originIata} → {selectedItinerary.curation.flightBooking.destinationIata}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Duration</p>
                                <p className="text-lg font-black text-slate-900 dark:text-white">{selectedItinerary.curation.flightBooking.duration || 'Direct'}</p>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Confirmation</p>
                                <p className="text-2xl font-mono font-black text-slate-900 dark:text-white">{selectedItinerary.curation.flightBooking.bookingRef}</p>
                              </div>
                              <button onClick={() => setSelectedCurationForFlightVoucher(selectedItinerary.curation)} className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-red-600/20 active:scale-95 transition-all">View Digital Ticket</button>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {itineraryDetailMode === 'hotel' && selectedItinerary.curation.hotelBooking && (
                        <motion.div
                          key="hotel-detail"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-8"
                        >
                          <div className="flex items-center justify-between border-b dark:border-slate-800 pb-4">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Stay Details</h3>
                            <button onClick={() => setItineraryDetailMode('itinerary')} className="text-[10px] font-black uppercase text-red-600 hover:underline">Back to Itinerary</button>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/30 rounded-3xl overflow-hidden">
                            <div className="h-48 overflow-hidden relative">
                              <SafeImage src={selectedItinerary.curation.hotelBooking.imageUrl || selectedItinerary.curation.destination.imageUrl} className="w-full h-full object-cover" alt="" category="hotel" />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                            </div>
                            <div className="p-8 space-y-8">
                              <div>
                                <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-2 leading-tight">{selectedItinerary.curation.hotelBooking.hotelName}</h4>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><MapPin size={12} className="text-red-500" /> {selectedItinerary.curation.destination.name}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-8 py-6 border-y border-slate-200 dark:border-slate-700">
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Room Type</p>
                                  <p className="font-bold text-slate-900 dark:text-white">{selectedItinerary.curation.hotelBooking.roomType || 'Executive Suite'}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Value</p>
                                  <p className="font-bold text-slate-900 dark:text-white">INR {selectedItinerary.curation.hotelBooking.totalPrice.toLocaleString()}</p>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Confirmation</p>
                                  <p className="text-2xl font-mono font-black text-slate-900 dark:text-white">{selectedItinerary.curation.hotelBooking.bookingRef}</p>
                                </div>
                                <button onClick={() => setSelectedCurationForHotelVoucher(selectedItinerary.curation)} className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-red-600/20 active:scale-95 transition-all">View Hotel Voucher</button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {itineraryDetailMode === 'experiences' && (
                        <motion.div
                          key="experiences-detail"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-8"
                        >
                          <div className="flex items-center justify-between border-b dark:border-slate-800 pb-4">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Booked Activities</h3>
                            <button onClick={() => setItineraryDetailMode('itinerary')} className="text-[10px] font-black uppercase text-red-600 hover:underline">Back to Itinerary</button>
                          </div>
                          <div className="space-y-4">
                            {(selectedItinerary.curation.experienceBookings || []).map((booking) => (
                              <div key={booking.bookingRef} className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl flex items-center justify-between border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-white rounded-xl overflow-hidden border dark:border-slate-700">
                                    <SafeImage src={selectedItinerary.curation.destination.activities.find(a => a.id === booking.activityId)?.imageUrl || selectedItinerary.curation.destination.imageUrl} className="w-full h-full object-cover" alt="" category="activity" />
                                  </div>
                                  <div>
                                    <p className="font-black text-slate-900 dark:text-white">{booking.activityName}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{booking.date} at {booking.time}</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setSelectedExpForVoucher({ booking, curation: selectedItinerary.curation })}
                                  className="p-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl shadow-sm border border-slate-100 dark:border-slate-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all active:scale-95"
                                >
                                  <FileText size={18} />
                                </button>
                              </div>
                            ))}
                            {(selectedItinerary.curation.experienceBookings || []).length === 0 && (
                              <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                                <p className="text-slate-400 font-bold italic">No experiences booked for this trip yet.</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hotel Voucher Modal (Slide-in UAE Style) */}
      <AnimatePresence>
        {selectedCurationForHotelVoucher && (
          <div className="fixed inset-0 z-[200] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCurationForHotelVoucher(null)} className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col pt-safe pb-safe z-10"
            >
              <div className="absolute top-4 left-4 z-[210]">
                <button onClick={() => setSelectedCurationForHotelVoucher(null)} className="p-2 bg-slate-900/20 backdrop-blur-md hover:bg-slate-900/40 rounded-full text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto w-full">
                <div className="h-48 relative shrink-0">
                  <SafeImage src={selectedCurationForHotelVoucher.hotelBooking?.imageUrl || "keyword:luxury-hotel"} className="w-full h-full object-cover" alt="Hotel" category="hotel" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 w-full p-6">
                    <span className="bg-emerald-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest mb-2 inline-block">Confirmed Booking</span>
                    <h2 className="text-2xl font-black text-white">{selectedCurationForHotelVoucher.hotelBooking?.hotelName || "Luxury Stay"}</h2>
                    <p className="text-xs text-slate-300 font-medium flex items-center gap-1.5 mt-1"><MapPin size={12} /> {selectedCurationForHotelVoucher.destination.name}</p>
                  </div>
                </div>

                <div className="p-6 space-y-8">
                  {/* Booking Metadata */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Confirmation Number</p>
                      <p className="font-black text-slate-900 dark:text-white">{selectedCurationForHotelVoucher.hotelBooking?.bookingRef || "PK-9928172"}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Room Category</p>
                      <p className="font-black text-slate-900 dark:text-white">{selectedCurationForHotelVoucher.hotelBooking?.roomType || "Deluxe Suite"}</p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-4 bg-slate-900 dark:bg-slate-800 p-5 rounded-2xl text-white">
                    <div className="flex-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Check In</p>
                      <p className="text-lg font-black leading-tight">Oct 24, 2024</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">15:00 onwards</p>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="flex-1 text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Check Out</p>
                      <p className="text-lg font-black leading-tight">Oct 30, 2024</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">By 12:00 PM</p>
                    </div>
                  </div>

                  {/* Guest Info */}
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Guest Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2 text-sm">
                        <span className="text-slate-500 font-medium">Primary Guest</span>
                        <span className="font-black text-slate-900 dark:text-white">Alex Johnson</span>
                      </div>
                      <div className="flex items-center justify-between py-2 text-sm">
                        <span className="text-slate-500 font-medium">Total Travelers</span>
                        <span className="font-black text-slate-900 dark:text-white">{selectedCurationForHotelVoucher.travelers} Guests</span>
                      </div>
                    </div>
                  </div>

                  {/* Redemption instructions */}
                  <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 flex gap-4">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <h4 className="font-black text-emerald-900 dark:text-emerald-400 text-sm">Smart Pass Active</h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-500/80 font-medium mt-1 leading-relaxed">Present your IDFC First Bank ID at the reception for expedited VIP check-in and complimentary breakfast throughout your stay.</p>
                    </div>
                  </div>

                  <button onClick={() => setSelectedCurationForHotelVoucher(null)} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-black text-sm transition-transform active:scale-95 shadow-xl">Close Voucher</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Flight Voucher Modal (Slide-in UAE Style) */}
      <AnimatePresence>
        {selectedCurationForFlightVoucher && (
          <div className="fixed inset-0 z-[200] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCurationForFlightVoucher(null)} className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col pt-safe pb-safe z-10"
            >
              <div className="absolute top-4 left-4 z-[210]">
                <button onClick={() => setSelectedCurationForFlightVoucher(null)} className="p-2 bg-slate-900/20 backdrop-blur-md hover:bg-slate-900/40 rounded-full text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto w-full">
                {/* Visual Flight Path Header */}
                <div className="h-64 bg-slate-900 dark:bg-slate-950 p-8 flex flex-col justify-between overflow-hidden relative">
                  {/* Background Glow */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-red-600/10 blur-[100px] pointer-events-none" />

                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <span className="bg-red-600 text-white px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-[0.2em] mb-3 inline-block">Business Class</span>
                      <h2 className="text-white font-black text-lg flex items-center gap-3">
                        <SafeImage src={selectedCurationForFlightVoucher.flightBooking?.airlineLogo} className="h-6 object-contain brightness-0 invert" alt="Airline" category="flight" />
                        {selectedCurationForFlightVoucher.flightBooking?.airline}
                      </h2>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">Flight Ref</p>
                      <p className="text-white font-black text-sm">{selectedCurationForFlightVoucher.flightBooking?.bookingRef || "MC-AI772"}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between relative z-10 py-6">
                    <div className="text-left">
                      <p className="text-4xl font-black text-white">{selectedCurationForFlightVoucher.flightBooking?.originIata}</p>
                      <p className="text-xs text-slate-400 font-bold mt-1">DUBAI DXB</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center px-8">
                      <div className="w-full flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                        <div className="flex-1 border-t-2 border-dashed border-slate-700 relative">
                          <Plane size={18} className="absolute -top-[10px] left-1/2 -translate-x-1/2 text-red-600 rotate-45" />
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedCurationForFlightVoucher.flightBooking?.duration} • Direct</p>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-black text-white">{selectedCurationForFlightVoucher.flightBooking?.destinationIata}</p>
                      <p className="text-xs text-slate-400 font-bold mt-1">{selectedCurationForFlightVoucher.destination.name.toUpperCase()}</p>
                    </div>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  {/* Boarding Info Table */}
                  <div className="grid grid-cols-4 gap-6">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Boarding</p>
                      <p className="font-black text-slate-900 dark:text-white">08:45 AM</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gate</p>
                      <p className="font-black text-slate-900 dark:text-white">C-12</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Seat</p>
                      <p className="font-black text-slate-900 dark:text-white">04-A</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Group</p>
                      <p className="font-black text-slate-900 dark:text-white">A1</p>
                    </div>
                  </div>

                  {/* Passenger Manifest */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Passenger Manifest</h3>
                    <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-700 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-xs text-slate-600 dark:text-slate-400">AJ</div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">Alex Johnson</span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded uppercase tracking-wider">Checked In</span>
                    </div>
                  </div>

                  {/* E-Ticket Barcode Section */}
                  <div className="flex flex-col items-center py-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                    <div className="bg-white p-4 rounded-xl shadow-inner mb-4">
                      <QrCode size={120} className="text-slate-900" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1">Digital Boarding Pass</p>
                    <p className="text-[11px] text-slate-500 font-medium">Scan this code at the Kiosk or Gate</p>
                  </div>

                  <button onClick={() => setSelectedCurationForFlightVoucher(null)} className="w-full bg-red-600 text-white py-4 rounded-xl font-black text-sm transition-transform active:scale-95 shadow-xl shadow-red-500/20">Close Ticket</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Experience Voucher Modal (Slide-in) */}
      <AnimatePresence>
        {selectedExpForVoucher && (
          <div className="fixed inset-0 z-[200] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedExpForVoucher(null)} className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col pt-safe pb-safe z-10"
            >
              <div className="absolute top-4 left-4 z-[210]">
                <button onClick={() => setSelectedExpForVoucher(null)} className="p-2 bg-slate-900/20 backdrop-blur-md hover:bg-slate-900/40 rounded-full text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto w-full">
                <div className="h-40 relative shrink-0 border-b border-slate-200 dark:border-slate-800">
                  <SafeImage src={selectedExpForVoucher.booking.imageUrl} className="w-full h-full object-cover" alt="Exp" category="activity" />
                  <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                    <h3 className="text-3xl font-black text-white">{selectedExpForVoucher.booking.activityName}</h3>
                  </div>
                </div>
                <div className="p-8 space-y-8 text-slate-900 dark:text-white">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Confirmation</p><p className="font-black">{selectedExpForVoucher.booking.bookingRef}</p></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p><p className="font-black">{selectedExpForVoucher.booking.date}</p></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Slot</p><p className="font-black">{selectedExpForVoucher.booking.time}</p></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Travellers</p><p className="font-black">{selectedExpForVoucher.curation.travelers}</p></div>
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-6 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="p-3 bg-white rounded-xl shadow-lg"><QrCode size={80} className="text-slate-900" /></div>
                    <div className="flex-1 space-y-3">
                      <h4 className="font-black flex items-center gap-2"><MapPin size={16} className="text-red-600" /> Redemption Point</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">"Present this voucher at the main entrance 15 minutes prior to your selected slot. Priority entry is included for IDFC First Bank guests."</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedExpForVoucher(null)} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-black text-sm">Close Voucher</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Item Detail Modal (Essentials - Slide In) */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[150] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItem(null)} className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm" />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-sm h-full bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col pt-safe pb-safe z-10 p-8"
            >
              <button onClick={() => setSelectedItem(null)} className="absolute top-4 left-4 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <X size={20} />
              </button>

              <div className="flex-1 overflow-y-auto w-full pt-12 flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-600/30"><Box size={24} /></div>
                <div><span className="text-[10px] font-black text-red-600 uppercase tracking-[0.3em] mb-1.5 inline-block">{selectedItem.category}</span><h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{selectedItem.title}</h3></div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium italic leading-relaxed">{selectedItem.description}</p>
                <div className="w-full grid grid-cols-2 gap-4 py-5 border-y border-slate-100 dark:border-slate-800">
                  <div className="text-left"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p><p className="font-black text-green-600 flex items-center gap-1.5"><CheckCircle2 size={14} /> Active</p></div>
                  <div className="text-right"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Paid Amount</p><p className="font-black text-slate-900 dark:text-white text-lg">INR {selectedItem.price}</p></div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 mt-auto">
                <button onClick={() => setSelectedItem(null)} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-black text-sm shadow-md">Dismiss</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyBookingsView;
