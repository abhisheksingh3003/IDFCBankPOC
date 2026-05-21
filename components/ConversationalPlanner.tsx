import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Users, Sparkles, ArrowRight, Plane, Mic, MicOff, Paperclip, Plus,
    Globe, Shield, ShieldCheck, Fingerprint, CreditCard, Lock, Unlock,
    CheckCircle2, Star, ArrowLeft, Briefcase, Heart, Receipt, Check, Zap, Tag,
    ChevronLeft, ChevronRight, Coffee, MapPin, Hotel as HotelIcon, Camera, X, Car, RefreshCw,
    Calendar, Download, Info, Utensils, Lightbulb, ListChecks, Ticket, Volume2, VolumeX
} from 'lucide-react';
import jsPDF from 'jspdf';
import { Curation, Flight, Hotel, Activity, Essential, BookingStep, UserProfile } from '../types';
import {
    DESTINATIONS, ITALY_HOTELS, ITALY_ACTIVITIES, FLIGHTS_TO_ITALY,
    FLIGHTS_TO_PARIS, PARIS_HOTELS, PARIS_ACTIVITIES,
    FLIGHTS_TO_ABU_DHABI, ABU_DHABI_ACTIVITIES, ALTERNATIVE_HOTELS, ESSENTIALS_CATALOG
} from '../mockData';
import FlightBookingView from './FlightBookingView';
import HotelBookingView from './HotelBookingView';
import ExperienceBookingView from './ExperienceBookingView';
import BundleBookingView from './BundleBookingView';
import { generateAIItinerary } from '../services/gemini';
import { speakText } from '../services/speechService';
import SafeImage from './SafeImage';
import ItineraryMapComponent from './ItineraryMap';
import { geocodeLandmark } from '../utils/geocoder';

const parseItineraryDaysFromDayDescriptions = (dayDescs: any[]): import('../types').AIItinerary[] => {
    if (!dayDescs || !Array.isArray(dayDescs)) return [];
    return dayDescs.map(d => {
        const dayMatch = d.dayGroup?.match(/\d+/);
        const dayNumber = dayMatch ? parseInt(dayMatch[0], 10) : 1;
        return {
            day: dayNumber,
            title: d.theme || `Day ${dayNumber}`,
            events: (d.mapEvents || []).map((e: any) => {
                const geo = geocodeLandmark(e.locationName);
                return {
                    time: e.time || '09:00 AM',
                    description: e.description || '',
                    locationName: e.locationName || 'Location',
                    lat: geo ? geo.lat : (typeof e.lat === 'number' ? e.lat : undefined),
                    lng: geo ? geo.lng : (typeof e.lng === 'number' ? e.lng : undefined)
                };
            })
        };
    });
};

// ─── Types ───────────────────────────────────────────────────────────
interface ConversationalPlannerProps {
    onGenerateTrip: (itinerary: any[]) => void;
    onOpenManual: () => void;
    onSyncCuration: (curation: Curation) => void;
    initialCuration?: Curation | null;
    viewMode?: 'conversational' | 'results-only';
    user: UserProfile | null;
}

type ScenarioId = 'executive' | 'family' | 'bleisure' | 'paris' | 'ai_custom' | null;
type Phase = 'landing' | 'chat';
type BookingTarget = { type: 'flight' | 'hotel' | 'activity' | 'essentials'; itemId: string; virtualItem?: ItineraryItem } | null;

interface BillItem { name: string; amount: number }
interface BillSection { items: BillItem[]; total: number }
interface BillData { corporate: BillSection; personal: BillSection }

interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    content?: string;
    quickReplies?: { label: string; value: string }[];
    label?: string;
    value?: string;
    showCalendar?: boolean;
    showAgeInput?: boolean;
    showPassengerStepper?: boolean;
    billData?: BillData;
    showRegenerate?: boolean;
    isResponded?: boolean;
}

// ─── UTILITIES ──────────────────────────────────────────────────────────

interface ItineraryItem {
    id: string;
    type: 'flight' | 'hotel' | 'activity' | 'transfer' | 'insurance' | 'essentials';
    title: string;
    subtitle: string;
    price: number;
    image?: string;
    badge?: string;
    verified?: boolean;
    billingType?: 'business' | 'personal';
    booked?: boolean;
    flightRef?: Flight;
    hotelRef?: Hotel;
    activityRef?: Activity;
    flightAlternatives?: Flight[];
    hotelAlternatives?: Hotel[];
    activityAlternatives?: Activity[];
    essentialsRef?: Essential[];
    dayGroup?: string;
}

interface DiningTip {
    name: string;
    description: string;
    type: string;
    priceRange: string;
    imageKeyword: string;
}

interface DayDescription {
    dayGroup: string;
    theme: string;
    description: string;
    inclusions: string[];
    whyThisWorks: string;
    diningTips: DiningTip[];
    mapEvents?: {
        time: string;
        description: string;
        locationName: string;
        lat: number;
        lng: number;
    }[];
}

interface TripMeta {
    tripSummary: string;
    advanceBookItems: { item: string; detail: string }[];
}

// --- Rich Itinerary Components --------------------------------------
const DayContextCard = ({ description }: { description: DayDescription }) => {
    return (
        <div className="mb-6 space-y-4">
            {/* Header Theme */}
            <div className="flex items-start gap-4">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800">
                    <Sparkles className="w-5 h-5 text-red-600" />
                </div>
                <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                        {description.theme}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 italic font-medium">
                        "{description.description}"
                    </p>
                </div>
            </div>

            {/* Inclusions & Explanation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Inclusions */}
                <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/50 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-2 mb-3">
                        <ListChecks className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Daily Inclusions</span>
                    </div>
                    <ul className="space-y-2">
                        {description.inclusions.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Why This Works (Expert Insight) */}
                <div className="bg-orange-50/50 dark:bg-brand-orange/10 rounded-2xl p-4 border border-brand-orange/20 dark:border-brand-orange/30 shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="w-4 h-4 text-brand-orange" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-450">Expert Insight</span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-relaxed">
                        {description.whyThisWorks}
                    </p>
                </div>
            </div>

            {/* Dining Section */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                    <Utensils className="w-4 h-4 text-red-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Suggested Dining</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {description.diningTips.map((tip, idx) => (
                        <div key={idx} className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
                            {/* Card Image with Price Overlay */}
                            <div className="h-28 w-full relative overflow-hidden">
                                <SafeImage
                                    src={tip.imageKeyword}
                                    alt={tip.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    category="dining"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />

                                {/* Price Overlay */}
                                <div className="absolute top-2 right-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2 py-1 rounded-lg border border-white/20 shadow-lg flex items-center gap-0.5">
                                    <span className={`text-[10px] font-black ${tip.priceRange.length >= 1 ? 'text-emerald-600' : 'text-slate-300'}`}>$</span>
                                    <span className={`text-[10px] font-black ${tip.priceRange.length >= 2 ? 'text-emerald-600' : 'text-slate-300'}`}>$</span>
                                    <span className={`text-[10px] font-black ${tip.priceRange.length >= 3 ? 'text-emerald-600' : 'text-slate-300'}`}>$</span>
                                </div>

                                <div className="absolute bottom-2 left-3">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/90 bg-brand-orange px-1.5 py-0.5 rounded-md shadow-sm">
                                        {tip.type}
                                    </span>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-3 flex-1 flex flex-col">
                                <h5 className="text-[13px] font-black text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-red-600 transition-colors">
                                    {tip.name}
                                </h5>
                                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                                    {tip.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const AdvanceBookingAdvisor = ({ items }: { items: { item: string; detail: string }[] }) => {
    if (items.length === 0) return null;
    return (
        <div className="mt-8 mb-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-900/30">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20">
                    <Ticket className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-100 uppercase tracking-tight">Booking Advisor</h4>
                    <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest">Recommended Advance Actions</p>
                </div>
            </div>
            <div className="space-y-3">
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white/60 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50">
                        <span className="text-xs font-black text-emerald-900 dark:text-emerald-100">{item.item}</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-800/40 px-2 py-1 rounded-lg">
                            {item.detail}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const TripSummaryHeader = ({ summary, destination }: { summary: string; destination: string }) => {
    if (!summary) return null;
    return (
        <div className="mb-8 p-6 bg-slate-900 dark:bg-white rounded-3xl shadow-xl shadow-slate-200 dark:shadow-none relative overflow-hidden group">
            {/* Decorative background element */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-4 bg-red-600 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Trip Vision - {destination}</span>
                </div>
                <p className="text-sm font-bold text-white dark:text-slate-900 leading-relaxed">
                    {summary}
                </p>
            </div>
        </div>
    );
};

// --- Scenario Detection ----------------------------------------------
const detectScenario = (text: string): ScenarioId => {
    const lower = text.toLowerCase();
    if (lower.includes('paris')) return 'paris';
    if (lower.includes('board meeting') || lower.includes('book my usuals') || lower.includes('london')) return 'executive';
    if (lower.includes('family') || lower.includes('kids') || lower.includes('safe') || lower.includes('italy')) return 'family';
    if (lower.includes('conference') || lower.includes('extend') || lower.includes('weekend') || lower.includes('frankfurt')) return 'bleisure';
    return 'executive';
};

// ─── Quick Action Prompts ────────────────────────────────────────────
const QUICK_PROMPTS = {
    en: [
        { icon: MapPin, label: 'Paris Getaway', text: 'Plan a trip to Paris' },
        { icon: Briefcase, label: 'Executive Trip', text: 'Anya, I have a board meeting in London next Monday. Book my usuals.' },
        { icon: Heart, label: 'Family Holiday', text: 'Plan a safe family trip to Italy for 2 adults and 2 kids with vetted hotels near medical facilities.' },
        { icon: Globe, label: 'Bleisure Trip', text: 'I have a conference in Frankfurt next Mon-Wed.' },
    ],
    pl: [
        { icon: MapPin, label: 'Wycieczka do Paryża', text: 'Zaplanuj wycieczkę do Paryża' },
        { icon: Briefcase, label: 'Business Trip', text: 'Anya, I have a board meeting in London next Monday. Book my usuals.' },
        { icon: Heart, label: 'Family Holiday', text: 'Plan a safe family trip to Dubai for 2 adults and 2 kids with vetted hotels near medical facilities.' },
        { icon: Globe, label: 'Podróż Bleisure', text: 'Mam konferencję we Frankfurcie od poniedziałku do środy.' },
    ],
};

// ─── Translations ────────────────────────────────────────────────────
const LANDING_TRANSLATIONS = {
    en: {
        heroTitle1: 'Your next journey,',
        heroTitle2: 'reimagined.',
        heroSubtitle: 'Describe your dream escape, and our Anya will craft a bespoke itinerary in seconds.',
        placeholder: "Try: 'Anya, I have a board meeting in London next Monday. Book my usuals.'",
        startPlanning: 'Start Planning',
        stepByStep: 'Step-by-Step Planner',
    },
    pl: {
        heroTitle1: 'Twoja następna podróż,',
        heroTitle2: 'na nowo.',
        heroSubtitle: 'Opisz swoją wymarzoną ucieczkę, a nasza Anya stworzy spersonalizowany plan w kilka sekund.',
        placeholder: "Try: 'Anya, I have a board meeting in London next Monday. Book my usuals.'",
        startPlanning: 'Zaplanuj Podróż',
        stepByStep: 'Planer Krok po Kroku',
    },
};

// ─── Scenario Mock Data ──────────────────────────────────────────────
const LONDON_FLIGHTS: Flight[] = [
    { id: 'EK-281', airline: 'Emirates', airlineLogo: 'https://pics.avs.io/200/200/EK.png', departureTime: '06:15 AM', arrivalTime: '08:30 AM', price: 1200, duration: '2h 15m', originIata: 'DXB', destinationIata: 'LHR', isVerified: true },
    { id: 'BA-857', airline: 'British Airways', airlineLogo: 'https://pics.avs.io/200/200/BA.png', departureTime: '10:45 AM', arrivalTime: '01:00 PM', price: 980, duration: '2h 15m', originIata: 'DXB', destinationIata: 'LHR', isVerified: true },
    { id: 'EY-1346', airline: 'Etihad Airways', airlineLogo: 'https://pics.avs.io/200/200/EY.png', departureTime: '07:30 AM', arrivalTime: '11:50 AM', price: 850, duration: '4h 20m', originIata: 'DXB', destinationIata: 'LHR', isVerified: true },
    { id: 'EK-8412', airline: 'Emirates', airlineLogo: 'https://pics.avs.io/200/200/EK.png', departureTime: '05:50 AM', arrivalTime: '07:55 AM', price: 420, duration: '2h 05m', originIata: 'DXB', destinationIata: 'STN', isVerified: false },
    { id: 'FZ-1601', airline: 'flydubai', airlineLogo: 'https://pics.avs.io/200/200/FZ.png', departureTime: '02:30 PM', arrivalTime: '04:40 PM', price: 380, duration: '2h 10m', originIata: 'DXB', destinationIata: 'LTN', isVerified: false },
    { id: 'KL-1362', airline: 'KLM Royal Dutch', airlineLogo: 'https://pics.avs.io/200/200/KL.png', departureTime: '09:10 AM', arrivalTime: '01:35 PM', price: 920, duration: '4h 25m', originIata: 'DXB', destinationIata: 'LHR', isVerified: true },
    { id: 'AF-1845', airline: 'Air France', airlineLogo: 'https://pics.avs.io/200/200/AF.png', departureTime: '11:20 AM', arrivalTime: '03:55 PM', price: 890, duration: '4h 35m', originIata: 'DXB', destinationIata: 'LHR', isVerified: true },
    { id: 'EY-1411', airline: 'Etihad Airways', airlineLogo: 'https://pics.avs.io/200/200/EY.png', departureTime: '08:00 AM', arrivalTime: '12:30 PM', price: 1050, duration: '4h 30m', originIata: 'DXB', destinationIata: 'LHR', isVerified: true },
    { id: 'EK-283', airline: 'Emirates', airlineLogo: 'https://pics.avs.io/200/200/EK.png', departureTime: '04:45 PM', arrivalTime: '07:00 PM', price: 1850, duration: '2h 15m', originIata: 'DXB', destinationIata: 'LHR', isVerified: true },
];
const LONDON_HOTELS: Hotel[] = [
    { id: 'h-lon-1', name: 'The Shard Shangri-La', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800', pricePerNight: 890, description: 'Iconic views from floors 34-52 of The Shard.', amenities: ['Club Lounge', 'Spa', 'City View', 'Pool'], address: '31 St Thomas St, London SE1 9QU', isVerified: true },
    { id: 'h-lon-2', name: 'The Savoy', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800', pricePerNight: 780, description: 'A legendary hotel on the Strand.', amenities: ['Pool', 'Bar', 'Spa'], address: 'Strand, London WC2R 0EZ', isVerified: true },
];
const LONDON_ACTIVITIES: Activity[] = [
    { id: 'a-lon-1', name: 'Executive Dinner at TING', duration: '2 hours', price: 185, category: 'Dining', imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=400' },
    { id: 'a-lon-2', name: 'Airport Transfer', duration: '45 min', price: 95, category: 'Transport', imageUrl: 'https://images.unsplash.com/photo-1615764812975-751f90d0b867?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { id: 'a-lon-3', name: 'West End Show – Hamilton', duration: '3 hours', price: 120, category: 'Entertainment', imageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&q=80&w=400', isPopular: true, isMostVisited: true },
    { id: 'a-lon-4', name: 'London Eye VIP Experience', duration: '1.5 hours', price: 65, category: 'Sightseeing', imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=400', isPopular: true },
    { id: 'a-lon-5', name: 'Camden Market Food Tour', duration: '3 hours', price: 55, category: 'Food & Culture', imageUrl: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=400' },
    { id: 'a-lon-6', name: 'British Museum VIP Tour', duration: '2.5 hours', price: 80, category: 'Culture', imageUrl: 'https://media.tacdn.com/media/attractions-splice-spp-674x446/0b/91/74/59.jpg' },
    { id: 'a-lon-7', name: 'Thames River Dinner Cruise', duration: '3 hours', price: 150, category: 'Dining', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWaNOuiQCPG98A7TAzz3XH_8ofSg5XoIutMQ&s' },
    { id: 'a-lon-8', name: 'Borough Market Tasting', duration: '2 hours', price: 45, category: 'Food & Culture', imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=400' },
];
// Alternative options for itinerary exploration
const LONDON_ALT_FLIGHTS: Flight[] = [
    { id: 'BA-857', airline: 'British Airways', airlineLogo: 'https://pics.avs.io/200/200/BA.png', departureTime: '10:45 AM', arrivalTime: '01:00 PM', price: 980, duration: '2h 15m', originIata: 'DXB', destinationIata: 'LHR', isVerified: true },
    { id: 'EY-920', airline: 'Etihad Airways (via AUH)', airlineLogo: 'https://pics.avs.io/200/200/EY.png', departureTime: '08:00 AM', arrivalTime: '12:20 PM', price: 750, duration: '4h 20m', originIata: 'DXB', destinationIata: 'LHR', isVerified: true },
    { id: 'EK-285', airline: 'Emirates', airlineLogo: 'https://pics.avs.io/200/200/EK.png', departureTime: '02:30 PM', arrivalTime: '04:45 PM', price: 1100, duration: '2h 15m', originIata: 'DXB', destinationIata: 'LHR', isVerified: true },
    { id: 'KL-1364', airline: 'KLM Royal Dutch', airlineLogo: 'https://pics.avs.io/200/200/KL.png', departureTime: '06:00 AM', arrivalTime: '10:30 AM', price: 820, duration: '4h 30m', originIata: 'DXB', destinationIata: 'LHR', isVerified: true },
    { id: 'AF-1847', airline: 'Air France', airlineLogo: 'https://pics.avs.io/200/200/AF.png', departureTime: '12:15 PM', arrivalTime: '04:50 PM', price: 890, duration: '4h 35m', originIata: 'DXB', destinationIata: 'LHR', isVerified: true },
    { id: 'LH-951', airline: 'Lufthansa', airlineLogo: 'https://pics.avs.io/200/200/LH.png', departureTime: '09:00 AM', arrivalTime: '11:15 AM', price: 920, duration: '2h 15m', originIata: 'DXB', destinationIata: 'LHR', isVerified: true },
];
const LONDON_ALT_HOTELS: Hotel[] = [
    { id: 'h-lon-2', name: 'The Savoy', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800', pricePerNight: 780, description: 'A legendary hotel on the Strand.', amenities: ['Pool', 'Bar', 'Spa'], address: 'Strand, London WC2R 0EZ', isVerified: true },
    { id: 'h-lon-3', name: 'The Ned', rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80&w=800', pricePerNight: 650, description: 'Members club and hotel in the City.', amenities: ['Rooftop Pool', 'Spa', 'Gym'], address: '27 Poultry, London EC2R 8AJ', isVerified: true },
    { id: 'h-lon-4', name: 'Rosewood London', rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800', pricePerNight: 720, description: 'Stunning courtyard hotel in Holborn.', amenities: ['Spa', 'Courtyard', 'Gym'], address: '252 High Holborn, London WC1V 7EN', isVerified: true },
    { id: 'h-lon-5', name: 'Corinthia London', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=800', pricePerNight: 850, description: 'Grand Victorian hotel near Whitehall.', amenities: ['ESPA Life Spa', 'Pool', 'Garden Lounge'], address: 'Whitehall Pl, London SW1A 2BD', isVerified: true },
    { id: 'h-lon-6', name: 'Claridge\'s', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800', pricePerNight: 950, description: 'Mayfair icon of Art Deco elegance.', amenities: ['Butler Service', 'Fumoir Bar', 'Spa'], address: 'Brook St, London W1K 4HR', isVerified: true },
    { id: 'h-lon-7', name: 'The Connaught', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800', pricePerNight: 1050, description: 'Classic Mayfair retreat.', amenities: ['Michelin Dining', 'Aman Spa'], address: 'Carlos Pl, London W1K 2AL', isVerified: true },
];

const LONDON_ALT_ACTIVITIES: Activity[] = [
    { id: 'a-lon-alt-1', name: 'Helicopter Tour over London', duration: '30 min', price: 450, category: 'Adventure', imageUrl: 'https://images.unsplash.com/photo-1559067096-49ebca3406aa?auto=format&fit=crop&q=80&w=400' },
    { id: 'a-lon-alt-2', name: 'Private Yacht Thames Cruise', duration: '2 hours', price: 850, category: 'Leisure', imageUrl: 'https://images.unsplash.com/photo-1567896836021-73b369e09296?auto=format&fit=crop&q=80&w=400' },
    { id: 'a-lon-alt-3', name: 'Shard Dinner with Anya', duration: '3 hours', price: 320, category: 'Dining', imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=400' },
    { id: 'a-lon-alt-4', name: 'Personal Stylist at Harrods', duration: '4 hours', price: 1200, category: 'Leisure', imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=400' },
    { id: 'a-lon-alt-5', name: 'V&A Museum Private Access', duration: '2 hours', price: 250, category: 'Culture', imageUrl: 'https://media.tacdn.com/media/attractions-splice-spp-674x446/0b/91/74/59.jpg' },
    { id: 'a-lon-alt-6', name: 'Afternoon Tea at Ritz', duration: '2 hours', price: 180, category: 'Dining', imageUrl: 'https://images.unsplash.com/photo-1561053740-39441df250a2?auto=format&fit=crop&q=80&w=400' },
];
const FRANKFURT_FLIGHTS: Flight[] = [
    { id: 'EY-1352', airline: 'Etihad Airways', airlineLogo: 'https://pics.avs.io/200/200/EY.png', departureTime: '07:00 AM', arrivalTime: '09:15 AM', price: 890, duration: '2h 15m', originIata: 'DXB', destinationIata: 'FRA', isVerified: true },
    { id: 'EK-397', airline: 'Emirates', airlineLogo: 'https://pics.avs.io/200/200/EK.png', departureTime: '12:30 PM', arrivalTime: '02:40 PM', price: 650, duration: '2h 10m', originIata: 'DXB', destinationIata: 'FRA', isVerified: true },
];
const FRANKFURT_HOTELS: Hotel[] = [
    { id: 'h-fra-1', name: 'Grandhotel Hessischer Hof', rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80&w=800', pricePerNight: 280, description: 'Classic elegance near Conference Center.', amenities: ['Business Center', 'WiFi', 'Restaurant'], address: 'Friedrich-Ebert-Anlage 40, Frankfurt', isVerified: true },
    { id: 'h-fra-2', name: 'Villa Kennedy, Rocco Forte', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800', pricePerNight: 320, description: 'Boutique luxury with spa and gardens.', amenities: ['Spa', 'Garden Pool', 'Fine Dining'], address: 'Kennedyallee 70, Frankfurt', isVerified: true },
];
const FRANKFURT_ACTIVITIES: Activity[] = [
    { id: 'a-fra-1', name: 'Rhine Valley Wine Tour', duration: 'Full day', price: 180, category: 'Culture', imageUrl: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&q=80&w=400' },
    { id: 'a-fra-2', name: 'Städel Museum VIP', duration: '3 hours', price: 45, category: 'Culture', imageUrl: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&q=80&w=400' },
    { id: 'a-fra-3', name: 'Classic Dinner at Main Tower', duration: '3 hours', price: 120, category: 'Dining', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400' },
];

const FRANKFURT_ALT_ACTIVITIES: Activity[] = [
    { id: 'a-fra-alt-1', name: 'Baden-Baden Luxury Spa Day', duration: '8 hours', price: 650, category: 'Wellness', imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=400' },
    { id: 'a-fra-alt-2', name: 'Castle Tour by Private Car', duration: '6 hours', price: 450, category: 'History', imageUrl: 'https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?auto=format&fit=crop&q=80&w=400' },
    { id: 'a-fra-alt-3', name: 'Gourmet Skyline Dinner', duration: '3 hours', price: 280, category: 'Dining', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400' },
    { id: 'a-fra-alt-4', name: 'Luxury Shopping Experience', duration: '4 hours', price: 300, category: 'Leisure', imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=400' },
    { id: 'a-fra-alt-5', name: 'Private Gallery Access', duration: '2 hours', price: 150, category: 'Culture', imageUrl: 'https://images.unsplash.com/photo-1518998053502-bd2722f3?auto=format&fit=crop&q=80&w=400' },
    { id: 'a-fra-alt-6', name: 'Rhine River Private Yacht', duration: '3 hours', price: 950, category: 'Leisure', imageUrl: 'https://images.unsplash.com/photo-1567896836021-73b369e09296?auto=format&fit=crop&q=80&w=400' },
];

const FRANKFURT_RETURN_FLIGHTS: Flight[] = [
    { id: 'EY-1353', airline: 'Etihad Airways', airlineLogo: 'https://pics.avs.io/200/200/EY.png', departureTime: '06:15 PM', arrivalTime: '08:30 PM', price: 720, duration: '2h 15m', originIata: 'FRA', destinationIata: 'DXB', isVerified: true },
];

const FRANKFURT_ALT_FLIGHTS: Flight[] = [
    { id: 'LH-1100', airline: 'Lufthansa', airlineLogo: 'https://pics.avs.io/200/200/LH.png', departureTime: '08:30 AM', arrivalTime: '10:45 AM', price: 850, duration: '2h 15m', originIata: 'DXB', destinationIata: 'FRA', isVerified: true },
    { id: 'EK-399', airline: 'Emirates', airlineLogo: 'https://pics.avs.io/200/200/EK.png', departureTime: '03:45 PM', arrivalTime: '05:55 PM', price: 720, duration: '2h 10m', originIata: 'DXB', destinationIata: 'FRA', isVerified: true },
    { id: 'EY-1354', airline: 'Etihad Airways', airlineLogo: 'https://pics.avs.io/200/200/EY.png', departureTime: '11:00 AM', arrivalTime: '01:15 PM', price: 780, duration: '2h 15m', originIata: 'DXB', destinationIata: 'FRA', isVerified: true },
    { id: 'KL-1762', airline: 'KLM Royal Dutch', airlineLogo: 'https://pics.avs.io/200/200/KL.png', departureTime: '07:15 AM', arrivalTime: '11:40 AM', price: 650, duration: '4h 25m', originIata: 'DXB', destinationIata: 'FRA', isVerified: true },
    { id: 'AF-1445', airline: 'Air France', airlineLogo: 'https://pics.avs.io/200/200/AF.png', departureTime: '10:20 AM', arrivalTime: '02:55 PM', price: 690, duration: '4h 35m', originIata: 'DXB', destinationIata: 'FRA', isVerified: true },
    { id: 'QR-067', airline: 'Qatar Airways', airlineLogo: 'https://pics.avs.io/200/200/QR.png', departureTime: '05:00 AM', arrivalTime: '09:30 AM', price: 740, duration: '4h 30m', originIata: 'DXB', destinationIata: 'FRA', isVerified: true },
];

// Build a Curation object for scenario
const buildCuration = (scenario: ScenarioId): Curation => {
    const base: Curation = {
        curationId: `MC-${Date.now()}`,
        destination: {
            id: 'dest-1', name: 'London', country: 'United Kingdom',
            imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=1000',
            description: 'London city', flights: LONDON_FLIGHTS, hotels: LONDON_HOTELS, activities: LONDON_ACTIVITIES,
        },
        itinerary: [], travelers: 1, status: 'draft', startDate: '2026-06-01', endDate: '2026-06-03', tripName: 'London Business Trip',
    };
    if (scenario === 'family') {
        base.destination = {
            id: 'dest-2', name: 'Italy', country: 'IT',
            imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=1000',
            description: 'Italy family trip', flights: FLIGHTS_TO_ITALY, hotels: ITALY_HOTELS, activities: ITALY_ACTIVITIES,
        };
        base.travelers = 4; base.tripName = 'Italy Family Holiday'; base.startDate = ''; base.endDate = '';
    } else if (scenario === 'bleisure') {
        base.destination = {
            id: 'dest-3', name: 'Frankfurt', country: 'Germany',
            imageUrl: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&q=80&w=1000',
            description: 'Frankfurt bleisure', flights: FRANKFURT_FLIGHTS, hotels: FRANKFURT_HOTELS, activities: FRANKFURT_ACTIVITIES,
        };
        base.tripName = 'Frankfurt Bleisure'; base.startDate = '2026-06-08'; base.endDate = '2026-06-14';
    } else if (scenario === 'paris') {
        base.destination = {
            id: 'paris-01', name: 'Paris', country: 'France',
            imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000',
            description: 'The City of Light', flights: FLIGHTS_TO_PARIS, hotels: PARIS_HOTELS, activities: PARIS_ACTIVITIES,
        };
        base.tripName = 'Paris Getaway'; base.startDate = ''; base.endDate = '';
    }
    return base;
};

// ─── Conversation Scripts ────────────────────────────────────────────
interface ScenarioStep {
    aiMessage: ChatMessage;
    itineraryUpdate?: ItineraryItem[];
    autoAdvance?: boolean;
    delay?: number;
    /** Map from user reply value to branch name. Used with buildBranchedScript. */
    branchOn?: Record<string, string>;
}

const buildScript = (scenario: ScenarioId, user: UserProfile | null, branch?: string, tripDays: number = 7): ScenarioStep[] => {
    if (scenario === 'executive') {
        // Common opening steps
        const opening: ScenarioStep[] = [
            { aiMessage: { id: 'e1', sender: 'ai', content: "Welcome back, Alex! I see your board meeting in London. Syncing your **Travel DNA** now." }, delay: 1500, autoAdvance: true },
            { aiMessage: { id: 'e2', sender: 'ai', content: "Found your pattern:\n✈️ **LOT Business**\n🏨 **The Shard Shangri-La**\n\nIs this a Mon–Wed trip or the full week?", quickReplies: [{ label: '📅 Mon–Wed', value: 'short' }, { label: '📅 Full week', value: 'full' }] }, delay: 2000, autoAdvance: false, branchOn: { 'short': 'short', 'full': 'full' } },
        ];

        // ── Mon-Wed (short) branch ──
        const shortBranch: ScenarioStep[] = [
            { aiMessage: { id: 'es1', sender: 'ai', content: "Mon–Wed confirmed. I'll book your **Club Room** at The Shard and a private transfer.\n\nAdd a working dinner at a Michelin-star restaurant?", quickReplies: [{ label: '🍽️ Yes', value: 'dinner' }, { label: '⏭️ Skip', value: 'skip_dinner' }] }, delay: 1500, autoAdvance: false },
            { aiMessage: { id: 'es2', sender: 'ai', content: "Assembling your business itinerary..." }, delay: 1500, autoAdvance: true },
            {
                aiMessage: { id: 'es3', sender: 'ai', content: "Your **London Business Trip** is ready! Pre-vetted via IDFC First Bank Merchant Network.\n\n➡️ **Review and book on the right.**" },
                itineraryUpdate: [
                    { id: 'ef1', type: 'flight', title: 'Emirates EK-281 Business', subtitle: 'DXB → LHR • Mon, Mar 2 • 06:15 → 08:30 • 2h 15m', price: 1200, badge: 'Preferred', verified: true, image: 'https://pics.avs.io/200/200/EK.png', flightRef: LONDON_FLIGHTS[0] },
                    { id: 'eh1', type: 'hotel', title: 'The Shard Shangri-La', subtitle: 'Check-in Mon, Mar 2 • Check-out Wed, Mar 4 • 2 nights • Club Room', price: 1780, badge: 'Your Usual', verified: true, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=300', hotelRef: LONDON_HOTELS[0] },
                    { id: 'ea1', type: 'activity', title: 'Airport Transfer', subtitle: 'Mon, Mar 2 • Arrival Transfer • Executive sedan', price: 95, image: 'https://images.unsplash.com/photo-1615764812975-751f90d0b867?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', activityRef: LONDON_ACTIVITIES[1] },
                    { id: 'ee1', type: 'essentials', title: 'Business Essentials Bundle', subtitle: 'Fast Track + Lounge + eSIM • 3 items included', price: 95, badge: 'Recommended', essentialsRef: ESSENTIALS_CATALOG.slice(0, 3) },
                ]
            },
            { aiMessage: { id: 'es4', sender: 'ai', content: "Everything's set! You can book each item individually through IDFC First Bank's secure payment.\n\n💡 **Tip**: Your corporate card ending in ••4492 is pre-selected for business expenses." }, autoAdvance: true, delay: 3000 },
        ];

        // ── Full Week branch ──
        const fullBranch: ScenarioStep[] = [
            { aiMessage: { id: 'ef1b', sender: 'ai', content: "Full week it is! Board meeting Mon-Wed, then London leisure.\n\nWhat's the vibe for the weekend?", quickReplies: [{ label: '🎭 Shows', value: 'shows' }, { label: '🏛️ Culture', value: 'culture' }, { label: '🍷 Dining', value: 'dining' }] }, delay: 1500, autoAdvance: false },
            { aiMessage: { id: 'ef2b', sender: 'ai', content: "Excellent. Building your business + leisure itinerary now..." }, delay: 2000, autoAdvance: true },
            {
                aiMessage: { id: 'ef3b', sender: 'ai', content: "Your **London Full Week** is ready! ✨ Business essentials mixed with curated leisure.\n\n➡️ **Review and book on the right.**" },
                itineraryUpdate: [
                    { id: 'ef1', type: 'flight', title: 'Emirates EK-281 Business', subtitle: 'DXB → LHR • Mon, Jun 1 • 06:15 → 08:30 • 2h 15m', price: 1200, badge: 'Preferred', verified: true, image: 'https://pics.avs.io/200/200/EK.png', flightRef: LONDON_FLIGHTS[0] },
                    { id: 'eh1', type: 'hotel', title: 'The Shard Shangri-La', subtitle: 'Check-in Mon, Jun 1 • Check-out Sun, Jun 7 • 6 nights • Club Room', price: 5340, badge: 'Your Usual', verified: true, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=300', hotelRef: LONDON_HOTELS[0] },
                    { id: 'ea1', type: 'activity', title: 'Airport Transfer', subtitle: 'Mon, Jun 1 • Arrival Transfer • Executive sedan', price: 95, image: 'https://images.unsplash.com/photo-1615764812975-751f90d0b867?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', activityRef: LONDON_ACTIVITIES[1] },
                    { id: 'ea3', type: 'activity', title: 'West End Show – Hamilton', subtitle: 'Fri, Jun 5 • 7:30 PM • Premium stalls • 3 hrs', price: 120, badge: 'Weekend', image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&q=80&w=300', activityRef: LONDON_ACTIVITIES[2] },
                    { id: 'ea6', type: 'activity', title: 'British Museum VIP Tour', subtitle: 'Fri, Jun 5 • 11:00 AM • Private Guide • 2.5 hrs', price: 80, badge: 'Weekend', image: 'https://media.tacdn.com/media/attractions-splice-spp-674x446/0b/91/74/59.jpg', activityRef: LONDON_ACTIVITIES[5] },
                    { id: 'ea4', type: 'activity', title: 'London Eye VIP Experience', subtitle: 'Sat, Jun 6 • 10:00 AM • Skip the line • Champagne', price: 65, badge: 'Weekend', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=300', activityRef: LONDON_ACTIVITIES[3] },
                    { id: 'ea7', type: 'activity', title: 'Thames River Dinner Cruise', subtitle: 'Sat, Jun 6 • 8:00 PM • Jazz & Dining • 3 hrs', price: 150, badge: 'Weekend', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWaNOuiQCPG98A7TAzz3XH_8ofSg5XoIutMQ&s', activityRef: LONDON_ACTIVITIES[6] },
                    { id: 'ea5', type: 'activity', title: 'Camden Market Food Tour', subtitle: 'Sun, Jun 7 • 1:00 PM • Guided tour • 3 hrs', price: 55, badge: 'Weekend', image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?auto=format&fit=crop&q=80&w=300', activityRef: LONDON_ACTIVITIES[4] },
                    { id: 'ea8', type: 'activity', title: 'Borough Market Tasting', subtitle: 'Sun, Jun 7 • 10:00 AM • Market stalls • 2 hrs', price: 45, badge: 'Weekend', image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=300', activityRef: LONDON_ACTIVITIES[7] },
                    { id: 'ee1', type: 'essentials', title: 'Business Essentials Bundle', subtitle: 'Fast Track + Lounge + eSIM • 3 items included', price: 95, badge: 'Recommended', essentialsRef: ESSENTIALS_CATALOG.slice(0, 3) },
                ]
            },
            { aiMessage: { id: 'ef4b', sender: 'ai', content: "Everything's set! Mon–Wed is business-ready, and I've lined up a brilliant weekend.\n\n💡 **Tip**: Your corporate card covers Mon–Wed expenses. Weekend items can use your personal card." }, autoAdvance: true, delay: 3000 },
        ];

        // Return the right branch
        if (branch === 'short') return [...opening, ...shortBranch];
        if (branch === 'full') return [...opening, ...fullBranch];
        // Default: return opening only (before branch is decided)
        return opening;
    }

    if (scenario === 'family') {
        const opening: ScenarioStep[] = [
            {
                aiMessage: {
                    id: 'f1',
                    sender: 'ai',
                    content: `Italy family trip! 🍕 Safety is my priority. What are the ages of your ${childCount || 2} kids?`,
                    showAgeInput: true,
                },
                delay: 1500,
                autoAdvance: false,
            },
            {
                aiMessage: {
                    id: 'f2',
                    sender: 'ai',
                    content: "Perfect! And when are you planning to travel, and for how long? I'll make sure to find the best seasonal activities for the kids.\n\nSelect your travel dates below:",
                    showCalendar: true,
                },
                delay: 1500,
                autoAdvance: false,
            },
            {
                aiMessage: {
                    id: 'f3',
                    sender: 'ai',
                    content: "Got it. Italy has so many different faces! What's the main 'vibe' you're looking for with the family?",
                    quickReplies: [
                        { label: '🎢 Adventure & Fun', value: 'adventure' },
                        { label: '🏖️ Relaxation & Beach', value: 'relaxation' },
                        { label: '🏛️ Culture & Education', value: 'culture' }
                    ]
                },
                delay: 1500,
                autoAdvance: false,
                branchOn: { 'adventure': 'family_adventure', 'relaxation': 'family_relaxation', 'culture': 'family_culture' }
            },
            {
                aiMessage: {
                    id: 'f4',
                    sender: 'ai',
                    content: "Excellent choice! For a family trip, do you prefer a **resort-style** hotel (everything on-site) or a **city hotel** close to the main attractions?\n\n💡 I'll prioritize properties near **vetted medical facilities** for your peace of mind.",
                    quickReplies: [
                        { label: '🏝️ Resort style', value: 'resort' },
                        { label: '🌆 City hotel', value: 'city' }
                    ]
                },
                delay: 1500,
                autoAdvance: false
            },
            {
                aiMessage: {
                    id: 'f5',
                    sender: 'ai',
                    content: "Checking **IDFC First Bank Identity** family properties with safety certifications and proximity to top-tier clinics...\n\n🔍 Scanning 52 properties in Italy..."
                },
                delay: 2500,
                autoAdvance: true
            },
        ];

        const adventureBranch: ScenarioStep[] = [
            {
                aiMessage: {
                    id: 'f6_adv',
                    sender: 'ai',
                    content: "Here's your action-packed family itinerary! 🎢\n\nI've selected **Rome Cavalieri** — it's an adventure hub with its own massive private park. Plus, there's a medical center just 1.5km away.\n\nI've also added a **Gladiator School** and **Pompeii Day Trip** for the kids!",
                    quickReplies: [{ label: '👍 Looks amazing!', value: 'confirm' }, { label: '🏨 Show more hotels', value: 'more' }],
                    showCalendar: false
                },
                itineraryUpdate: [
                    { id: 'ff1', type: 'flight', title: 'Dubai to Rome (FCO)', subtitle: 'Dubai → Rome • Day 1 • 07:45 AM → 10:00 AM • 2h 15m', price: 320, image: 'https://pics.avs.io/200/200/EK.png', flightRef: FLIGHTS_TO_ITALY[1], dayGroup: 'Day 1' },
                    { id: 'fh1', type: 'hotel', title: 'Rome Cavalieri', subtitle: `Day 1 - Day ${tripDays} • Medical facility: 1.5km`, price: 5950, image: ITALY_HOTELS[0].imageUrl, hotelRef: ITALY_HOTELS[0], verified: true, dayGroup: 'Day 1' },
                    { id: 'fa8', type: 'activity', title: 'Gladiator School for Kids', subtitle: `Day ${Math.max(2, tripDays - 3)} • Interactive History`, price: 120, image: ITALY_ACTIVITIES[1].imageUrl, activityRef: ITALY_ACTIVITIES[1], dayGroup: `Day ${Math.max(2, tripDays - 3)}` },
                    { id: 'fa4_adv', type: 'activity', title: 'Pompeii Day Trip from Rome', subtitle: `Day ${Math.max(3, tripDays - 2)} • Excursion • History`, price: 150, image: ITALY_ACTIVITIES[6].imageUrl, activityRef: ITALY_ACTIVITIES[6], dayGroup: `Day ${Math.max(3, tripDays - 2)}` },
                    { id: 'ff1_ret', type: 'flight', title: 'Rome (FCO) to Dubai', subtitle: `Rome → Dubai • Day ${tripDays} • 11:40 AM → 01:55 PM • 2h 15m`, price: 340, image: 'https://pics.avs.io/200/200/EK.png', flightRef: FLIGHTS_TO_ABU_DHABI[1], dayGroup: `Day ${tripDays}` },
                ]
            }
        ];

        const relaxationBranch: ScenarioStep[] = [
            {
                aiMessage: {
                    id: 'f6_rel',
                    sender: 'ai',
                    content: "Here's your relaxed family trip! 🏖️\n\nI've selected **Hotel Hassler Roma** — offering panoramic views at the top of the Spanish Steps. Ospedale Fatebenefratelli is just 2km away.\n\nI've included a **Pizza Making Masterclass** and a leisurely **Twilight Cycling Tour**.",
                    quickReplies: [{ label: '👍 Perfect for us!', value: 'confirm' }, { label: '🏨 Show more hotels', value: 'more' }],
                    showCalendar: false
                },
                itineraryUpdate: [
                    { id: 'ff1', type: 'flight', title: 'Warsaw to Rome (FCO)', subtitle: 'Warsaw → Rome • Day 1 • 07:45 AM → 10:00 AM • 2h 15m', price: 320, image: 'https://pics.avs.io/200/200/LO.png', flightRef: FLIGHTS_TO_ITALY[1], dayGroup: 'Day 1' },
                    { id: 'fh7', type: 'hotel', title: 'Hotel Hassler Roma', subtitle: `Day 1 - Day ${tripDays} • Medical facility: 2km`, price: 8400, image: ITALY_HOTELS[1].imageUrl, hotelRef: ITALY_HOTELS[1], verified: true, dayGroup: 'Day 1' },
                    { id: 'fa6', type: 'activity', title: 'Pizza Making Masterclass', subtitle: `Day ${Math.max(2, tripDays - 3)} • Dining • Family Fun`, price: 75, image: ITALY_ACTIVITIES[3].imageUrl, activityRef: ITALY_ACTIVITIES[3], dayGroup: `Day ${Math.max(2, tripDays - 3)}` },
                    { id: 'fa4', type: 'activity', title: 'Rome Twilight Cycling Tour', subtitle: `Day ${Math.max(3, tripDays - 2)} • Evening cycling • Leisure`, price: 60, image: ITALY_ACTIVITIES[7].imageUrl, activityRef: ITALY_ACTIVITIES[7], dayGroup: `Day ${Math.max(3, tripDays - 2)}` },
                    { id: 'ff1_ret', type: 'flight', title: 'Rome (FCO) to Dubai', subtitle: `Rome → Dubai • Day ${tripDays} • 11:40 AM → 01:55 PM • 2h 15m`, price: 340, image: 'https://pics.avs.io/200/200/EK.png', flightRef: FLIGHTS_TO_ABU_DHABI[1], dayGroup: `Day ${tripDays}` },
                ]
            }
        ];

        const cultureBranch: ScenarioStep[] = [
            {
                aiMessage: {
                    id: 'f6_cul',
                    sender: 'ai',
                    content: "Here's your culturally rich family trip! 🏛️\n\nI recommend **The St. Regis Rome** for its historic grandeur and central location. Policlinico Umberto I is just 1km away.\n\nI've included the **Vatican Museums** and a **Colosseum Tour**.",
                    quickReplies: [{ label: '👍 Looks very educational!', value: 'confirm' }, { label: '🏨 Show more hotels', value: 'more' }],
                    showCalendar: false
                },
                itineraryUpdate: [
                    { id: 'ff1', type: 'flight', title: 'Warsaw to Rome (FCO)', subtitle: 'Warsaw → Rome • Day 1 • 07:45 AM → 10:00 AM • 2h 15m', price: 320, image: 'https://pics.avs.io/200/200/LO.png', flightRef: FLIGHTS_TO_ITALY[1], dayGroup: 'Day 1' },
                    { id: 'fh3', type: 'hotel', title: 'The St. Regis Rome', subtitle: `Day 1 - Day ${tripDays} • Medical facility: 1km`, price: 5600, image: ITALY_HOTELS[3].imageUrl, hotelRef: ITALY_HOTELS[3], verified: true, dayGroup: 'Day 1' },
                    { id: 'fa3', type: 'activity', title: 'Vatican Museums & Sistine Chapel', subtitle: `Day ${Math.max(2, tripDays - 3)} • Culture • Guided Tour`, price: 85, image: ITALY_ACTIVITIES[2].imageUrl, activityRef: ITALY_ACTIVITIES[2], dayGroup: `Day ${Math.max(2, tripDays - 3)}` },
                    { id: 'fa7', type: 'activity', title: 'Colosseum & Roman Forum Tour', subtitle: `Day ${Math.max(3, tripDays - 2)} • Explore Ancient Rome`, price: 65, image: ITALY_ACTIVITIES[0].imageUrl, activityRef: ITALY_ACTIVITIES[0], dayGroup: `Day ${Math.max(3, tripDays - 2)}` },
                    { id: 'ff1_ret', type: 'flight', title: 'Rome (FCO) to Dubai', subtitle: `Rome → Dubai • Day ${tripDays} • 11:40 AM → 01:55 PM • 2h 15m`, price: 340, image: 'https://pics.avs.io/200/200/EK.png', flightRef: FLIGHTS_TO_ABU_DHABI[1], dayGroup: `Day ${tripDays}` },
                ]
            }
        ];

        if (branch === 'family_adventure') return [...opening, ...adventureBranch];
        if (branch === 'family_relaxation') return [...opening, ...relaxationBranch];
        if (branch === 'family_culture') return [...opening, ...cultureBranch];
        return opening;
    }

    // bleisure
    if (scenario === 'bleisure') {
        const opening: ScenarioStep[] = [
            {
                aiMessage: {
                    id: 'b1',
                    sender: 'ai',
                    content: "Frankfurt conference Mon-Wed — interesting! 💼\n\nWould you like me to plan a leisure extension until the weekend?",
                    quickReplies: [
                        { label: '🎉 Yes, extend my trip!', value: 'extend' },
                        { label: '📋 Just the conference', value: 'biz_only' }
                    ]
                },
                delay: 2000,
                autoAdvance: false,
                branchOn: { 'extend': 'extend_initial', 'biz_only': 'biz_only' }
            },
            {
                aiMessage: {
                    id: 'b1_alone',
                    sender: 'ai',
                    content: "Stay extended. 🏨 Traveling alone?",
                    quickReplies: [
                        { label: '👤 Yes', value: 'extend_alone' },
                        { label: '👥 No, with others', value: 'extend_group' }
                    ]
                },
                delay: 1500,
                autoAdvance: false,
                branchOn: { 'extend_alone': 'extend_alone', 'extend_group': 'extend_group' }
            },
        ];

        const extendBranch: ScenarioStep[] = [
            { aiMessage: { id: 'b2', sender: 'ai', content: "Great choice! I'll split the billing automatically:\n\n🔵 **Business (Mon–Wed)**: Conference hotel + flights → Corporate card\n🟢 **Personal (Thu–Sun)**: Boutique hotel + leisure → Personal card\n\nWhat interests you for the weekend?", quickReplies: [{ label: '🍷 Wine & Culture', value: 'wine' }, { label: '🏞️ Nature', value: 'nature' }, { label: '🎭 City Life', value: 'city' }] }, delay: 1500, autoAdvance: false },
            { aiMessage: { id: 'b2b', sender: 'ai', content: "Wine & culture — excellent taste! 🍷\n\nLet me find the best options. I'll make sure the business hotel is near the conference center and the weekend hotel is in the old town..." }, delay: 2500, autoAdvance: true },
            {
                aiMessage: { id: 'b3', sender: 'ai', content: "Here's your split itinerary! Items are color-coded:\n\n• 🔵 **Blue border** = Corporate billing\n• 🟢 **Green border** = Personal billing\n\n➡️ **Click any item on the right to book it.** The billing will be split automatically!", quickReplies: [{ label: '📊 View cost split', value: 'confirm' }, { label: '✏️ Adjust billing', value: 'adjust' }] },
                itineraryUpdate: [
                    { id: 'bf1', type: 'flight', title: 'Etihad Airways EY-1352 Business', subtitle: 'DXB → FRA • Mon, Mar 9 • 07:00 AM → 09:15 AM • 2h 15m', price: 890, badge: '🔵 Corporate', verified: true, billingType: 'business', image: 'https://pics.avs.io/200/200/EY.png', flightRef: FRANKFURT_FLIGHTS[0] },
                    { id: 'bh1', type: 'hotel', title: 'Grandhotel Hessischer Hof', subtitle: 'Mon-Wed • 2 nights • Business Room', price: 560, badge: '🔵 Corporate', verified: true, billingType: 'business', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80&w=300', hotelRef: FRANKFURT_HOTELS[0] },
                    { id: 'bc2', type: 'activity', title: 'Conference Day 2', subtitle: 'Tue, Mar 10 • All Day Pass', price: 0, badge: '🔵 Corporate', billingType: 'business', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=300' },
                    { id: 'bc3', type: 'activity', title: 'Conference Day 3', subtitle: 'Wed, Mar 11 • Closing Session', price: 0, badge: '🔵 Corporate', billingType: 'business', image: 'https://images.unsplash.com/photo-1505373633819-0d139463234d?auto=format&fit=crop&q=80&w=300' },
                    { id: 'bh2', type: 'hotel', title: 'Villa Kennedy, Rocco Forte', subtitle: 'Thu-Sun • 3 nights • Garden Suite', price: 960, badge: '🟢 Personal', verified: true, billingType: 'personal', image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=300', hotelRef: FRANKFURT_HOTELS[1] },
                    { id: 'ba1', type: 'activity', title: 'Rhine Valley Wine Tour', subtitle: 'Full day • Private guide', price: 180, billingType: 'personal', image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&q=80&w=300', activityRef: FRANKFURT_ACTIVITIES[0] },
                    { id: 'ba2', type: 'activity', title: 'Städel Museum VIP', subtitle: '3 hours • Skip-the-line', price: 45, billingType: 'personal', image: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&q=80&w=300', activityRef: FRANKFURT_ACTIVITIES[1] },
                    { id: 'ba3', type: 'activity', title: 'Classic Dinner at Main Tower', subtitle: 'Sat, Mar 14 • 8:00 PM • View of City', price: 120, billingType: 'personal', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=300', activityRef: FRANKFURT_ACTIVITIES[2] },
                    { id: 'bf2', type: 'flight', title: 'Emirates EK-1353 Premium', subtitle: 'FRA → DXB • Sun, Mar 15 • 06:15 PM → 08:30 PM • 2h 15m', price: 720, badge: '🟢 Personal', billingType: 'personal', image: 'https://pics.avs.io/200/200/EK.png', flightRef: FRANKFURT_RETURN_FLIGHTS[0] },
                    { id: 'be1', type: 'essentials', title: 'Business Essentials', subtitle: 'Fast Track + Lounge + eSIM', price: 95, badge: '🔵 Corporate', billingType: 'business', essentialsRef: ESSENTIALS_CATALOG.slice(0, 3) },
                ]
            },
            { aiMessage: { id: 'b4', sender: 'ai', content: "Your **Bleisure itinerary** is ready! 🎉\n\n📊 **Billing Split:**\n• 🔵 Corporate: ~INR 1,545\n• 🟢 Personal: ~INR 1,185\n\nClick items to book them. Each booking will auto-assign to the correct card.", quickReplies: [{ label: '✨ All set!', value: 'done' }, { label: '🍽️ Add dining', value: 'dining' }] } },
        ];

        const bizOnlyBranch: ScenarioStep[] = [
            { aiMessage: { id: 'bz1', sender: 'ai', content: "Understood, keeping it strictly to the conference! I'll focus on getting you the best business travel setup for Mon–Wed." }, delay: 1500, autoAdvance: true },
            {
                aiMessage: { id: 'bz2', sender: 'ai', content: "Here's your business-only itinerary for Frankfurt. Everything is pre-vetted for business travel excellence.\n\n➡️ **Click any item on the right to book it.**" },
                itineraryUpdate: [
                    { id: 'bf1', type: 'flight', title: 'Etihad Airways EY-1352 Business', subtitle: 'DXB → FRA • Mon, Mar 9 • 07:00 AM → 09:15 AM • 2h 15m', price: 890, badge: '🔵 Corporate', verified: true, billingType: 'business', image: 'https://pics.avs.io/200/200/EY.png', flightRef: FRANKFURT_FLIGHTS[0] },
                    { id: 'bh1', type: 'hotel', title: 'Grandhotel Hessischer Hof', subtitle: 'Check-in Mon, Mar 9 • Check-out Wed, Mar 11 • 2 nights • Business Room', price: 560, badge: '🔵 Corporate', verified: true, billingType: 'business', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&q=80&w=300', hotelRef: FRANKFURT_HOTELS[0] },
                    { id: 'be1', type: 'essentials', title: 'Business Essentials', subtitle: 'Fast Track + Lounge + eSIM', price: 95, badge: '🔵 Corporate', billingType: 'business', essentialsRef: ESSENTIALS_CATALOG.slice(0, 3) },
                ]
            },
            { aiMessage: { id: 'bz3', sender: 'ai', content: "Everything's set! Your corporate card is pre-selected for these business expenses.\n\n💡 **Tip**: Don't forget to check your email for the conference registration confirmation." }, autoAdvance: true, delay: 3000 },
        ];

        if (branch === 'extend_initial' || branch === 'extend_alone' || branch === 'extend_group') return [...opening, ...extendBranch];
        if (branch === 'extend') return [...opening, ...extendBranch];
        if (branch === 'biz_only') return [...opening, ...bizOnlyBranch];
        return opening;
    }

    if (scenario === 'paris') {
        // FILTER REDUNDANT STEPS FOR PARIS SCENARIO
        let filteredSteps = [...opening];

        if (user) {
            // Skip vibe/pace question if user has preference
            if (user.pacePreference) {
                filteredSteps = filteredSteps.filter(s => s.aiMessage.id !== 'p4');
            }
            // Skip budget question if user has budget style
            if (user.budgetStyle) {
                filteredSteps = filteredSteps.filter(s => s.aiMessage.id !== 'p5');
            }
        }

        return filteredSteps;
    }
    return [];
};


// ─── Main Component ──────────────────────────────────────────────────
const ConversationalPlanner: React.FC<ConversationalPlannerProps> = ({
    onGenerateTrip,
    onOpenManual,
    language = 'en',
    onSyncCuration,
    initialCuration = null,
    viewMode = 'conversational',
    user
}) => {
    const [phase, setPhase] = useState<Phase>(viewMode === 'results-only' ? 'chat' : 'landing');
    const [input, setInput] = useState('');
    const [chatInput, setChatInput] = useState('');
    const [scenario, setScenario] = useState<ScenarioId>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [stepIndex, setStepIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [script, setScript] = useState<ScenarioStep[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [waitingForUser, setWaitingForUser] = useState(false);
    const [isLiveMode, setIsLiveMode] = useState(false);
    const recognitionRef = useRef<any>(null);

    const getSuggestions = (scen: ScenarioId, idx: number): string[] => {
        if (scen === 'paris') {
            if (idx === 0) return ['Eiffel Tower', 'Louvre Museum', 'Montmartre'];
            if (idx === 1) return ['Luxury 5-star', 'Boutique Hotel', 'Cozy Apartment'];
            return ['Show local dining gems', 'Add a museum tour', 'Book airport transfer'];
        }
        if (scen === 'ai_custom') {
            return ['Show local dining gems', 'Add a 5-star hotel', 'Book airport transfer', 'Show family-friendly spots'];
        }
        return ['Tell me more', 'Sounds good!', 'What else?'];
    };



    const startListening = (autoSubmit = false) => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("Speech recognition not supported");
            return;
        }

        // Cancel any existing speech synthesis when user starts talking
        window.speechSynthesis.cancel();

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = language === 'pl' ? 'pl-PL' : 'en-US';
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => {
            setIsListening(false);
            recognitionRef.current = null;
        };
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setChatInput(transcript);

            // Auto-submit in Live Mode
            if (isLiveMode || autoSubmit) {
                setTimeout(() => {
                    handleUserReply(transcript);
                    setChatInput('');
                }, 500);
            }
        };
        recognition.onerror = () => {
            setIsListening(false);
            recognitionRef.current = null;
        };

        recognition.start();
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
        setIsLiveMode(false);
    };


    const [itinerary, setItinerary] = useState<ItineraryItem[]>(() => {
        if (viewMode === 'results-only' && initialCuration) {
            const items: ItineraryItem[] = [];

            // Add Flight if present
            if (initialCuration.flightBooking) {
                items.push({
                    id: `manual-flight-${initialCuration.flightBooking.flightId}`,
                    type: 'flight',
                    title: initialCuration.flightBooking.airline || 'Flight to ' + initialCuration.destination.name,
                    subtitle: `${initialCuration.flightBooking.originIata || 'DXB'} → ${initialCuration.flightBooking.destinationIata || 'Destination'} • ${initialCuration.flightBooking.departureTime || 'TBD'} → ${initialCuration.flightBooking.arrivalTime || 'TBD'} • ${initialCuration.flightBooking.duration || ''}`,
                    price: initialCuration.flightBooking.price,
                    image: initialCuration.flightBooking.airlineLogo || 'https://pics.avs.io/200/200/LO.png',
                    flightRef: {
                        id: initialCuration.flightBooking.flightId,
                        airline: initialCuration.flightBooking.airline || '',
                        airlineLogo: initialCuration.flightBooking.airlineLogo || '',
                        departureTime: initialCuration.flightBooking.departureTime || '',
                        arrivalTime: initialCuration.flightBooking.arrivalTime || '',
                        price: initialCuration.flightBooking.price,
                        duration: initialCuration.flightBooking.duration || '',
                        originIata: initialCuration.flightBooking.originIata,
                        destinationIata: initialCuration.flightBooking.destinationIata
                    },
                    dayGroup: 'Day 1'
                });
            }

            // Add Hotel if present
            if (initialCuration.hotelBooking) {
                items.push({
                    id: `manual-hotel-${initialCuration.hotelBooking.hotelId}`,
                    type: 'hotel',
                    title: initialCuration.hotelBooking.hotelName || 'Selected Hotel',
                    subtitle: `Check-in ${initialCuration.startDate} • Check-out ${initialCuration.endDate}`,
                    price: initialCuration.hotelBooking.totalPrice,
                    image: initialCuration.hotelBooking.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
                    hotelRef: {
                        id: initialCuration.hotelBooking.hotelId,
                        name: initialCuration.hotelBooking.hotelName || '',
                        rating: 5,
                        imageUrl: initialCuration.hotelBooking.imageUrl || '',
                        pricePerNight: initialCuration.hotelBooking.totalPrice / 3, // Approximation
                        description: 'Your selected elite accommodation.'
                    },
                    dayGroup: 'Day 1'
                });
            }

            // Add AI Itinerary events as activities
            if (initialCuration.itinerary) {
                const aiItems = initialCuration.itinerary.flatMap((day, dIdx) =>
                    day.events.map((event, eIdx) => {
                        const basePrice = 45 + Math.floor(Math.random() * 80);
                        return {
                            id: `manual-act-${dIdx}-${eIdx}`,
                            type: 'activity' as const,
                            title: event.description,
                            subtitle: event.time,
                            price: basePrice,
                            dayGroup: `Day ${day.day}`,
                            image: initialCuration.destination.imageUrl, // Use destination image
                            activityRef: {
                                id: `act-manual-${dIdx}-${eIdx}`,
                                name: event.description,
                                duration: '2 hours',
                                price: basePrice,
                                category: 'Curation',
                                imageUrl: initialCuration.destination.imageUrl
                            }
                        };
                    })
                );
                items.push(...aiItems);
            }

            return items;
        }
        return [];
    });
    const [bookingTarget, setBookingTarget] = useState<BookingTarget>(null);
    const [activeFlightAlternatives, setActiveFlightAlternatives] = useState<Flight[]>([]);
    const [activeHotelAlternatives, setActiveHotelAlternatives] = useState<Hotel[]>([]);
    const [activeActivityAlternatives, setActiveActivityAlternatives] = useState<Activity[]>([]);
    const [curation, setCuration] = useState<Curation | null>(initialCuration);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [userBranch, setUserBranch] = useState<string | undefined>(undefined);
    const [showMap, setShowMap] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [initialBookingStep, setInitialBookingStep] = useState<BookingStep>('details');
    const [experienceActiveFilter, setExperienceActiveFilter] = useState<'All' | 'Popular' | 'Adventure' | 'Culture' | 'Leisure'>('All');
    const [activeTab, setActiveTab] = useState<'Itinerary' | 'Essentials' | 'Map'>('Itinerary');
    const [itineraryDays, setItineraryDays] = useState<import('../types').AIItinerary[]>(initialCuration?.itinerary || []);
    const [essentialsCart, setEssentialsCart] = useState<Essential[]>([]);
    const [calendarMonth, setCalendarMonth] = useState(new Date()); // Initialize to current month
    const [calendarFromDate, setCalendarFromDate] = useState<Date | null>(null);
    const [calendarToDate, setCalendarToDate] = useState<Date | null>(null);
    const [kidAges, setKidAges] = useState<string[]>([]);
    const [adultCount, setAdultCount] = useState(2);
    const [childCount, setChildCount] = useState(0);

    // Sync kidAges array length with childCount
    useEffect(() => {
        setKidAges(prev => {
            if (prev.length === childCount) return prev;
            if (prev.length < childCount) {
                return [...prev, ...Array(childCount - prev.length).fill('')];
            }
            return prev.slice(0, childCount);
        });
    }, [childCount]);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileView, setMobileView] = useState<'chat' | 'itinerary'>('chat');
    const [isGenerating, setIsGenerating] = useState(false);
    const [dayDescriptions, setDayDescriptions] = useState<DayDescription[]>([]);
    const [tripMeta, setTripMeta] = useState<TripMeta>({ tripSummary: '', advanceBookItems: [] });
    const [thinkingMessage, setThinkingMessage] = useState('Anya is thinking...');
    const [isFinalGeneration, setIsFinalGeneration] = useState(false);

    const GENERIC_THINKING_MESSAGES = [
        'Anya is thinking...',
        'Processing...',
        'Considering your request...',
        'Anya is analyzing...'
    ];

    const DETAILED_THINKING_MESSAGES = [
        'Searching for best flights...',
        'Checking hotel availability...',
        'Curating local experiences...',
        'Vetting premium merchants...',
        'Analyzing travel preferences...',
        'Optimizing your itinerary...',
        'Syncing with Travel DNA...'
    ];


    useEffect(() => {
        if (!isGenerating && !isTyping) return;

        const messages = isFinalGeneration ? DETAILED_THINKING_MESSAGES : GENERIC_THINKING_MESSAGES;

        let i = 0;
        setThinkingMessage(messages[0]);
        const interval = setInterval(() => {
            i = (i + 1) % messages.length;
            setThinkingMessage(messages[i]);
        }, 3000);

        return () => clearInterval(interval);
    }, [isGenerating, isTyping, isFinalGeneration]);


    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const hasItinerary = itinerary.length > 0;

    useEffect(() => {
        if (hasItinerary && isMobile) {
            setMobileView('itinerary');
        }
    }, [hasItinerary, isMobile]);

    const toggleCartItem = (item: Essential) => {
        setEssentialsCart(prev =>
            prev.find(i => i.id === item.id)
                ? prev.filter(i => i.id !== item.id)
                : [...prev, item]
        );
    };

    const handleCheckoutEssentials = () => {
        if (essentialsCart.length === 0) return;

        // Create a temporary booking target for the whole cart
        const cartId = `cart-${Date.now()}`;
        const totalCartPrice = essentialsCart.reduce((s, i) => s + i.price, 0);

        // We create a virtual itinerary item for the drawer to reference
        const virtualBookingItem: ItineraryItem = {
            id: cartId,
            type: 'essentials',
            title: 'Essentials Bundle',
            subtitle: `${essentialsCart.length} items checked out`,
            price: totalCartPrice,
            essentialsRef: essentialsCart
        };

        setBookingTarget({ type: 'essentials', itemId: cartId, virtualItem: virtualBookingItem });
        setDrawerOpen(true);
    };

    const getDayGroup = (item: ItineraryItem) => {
        if (item.type === 'essentials') return 'Trip Essentials';
        if (item.dayGroup) return item.dayGroup;
        switch (item.id) {
            case 'ef1': return 'Day 1';
            case 'eh1': return 'Day 1';
            case 'ea1': return 'Day 1';
            case 'ee1': return 'Trip Essentials';
            case 'ea3': return 'Day 5';
            case 'ea6': return 'Day 5';
            case 'ea4': return 'Day 6';
            case 'ea7': return 'Day 6';
            case 'ea5': return 'Day 7';
            case 'ea8': return 'Day 7';
            // Family scenario IDs
            case 'ff1': return 'Day 1';
            case 'fh1': return 'Day 1';
            case 'fh3': return 'Day 1';
            case 'fh7': return 'Day 1';
            case 'fa1': return 'Day 4';
            case 'fa2': return 'Day 3';
            case 'fa3': return 'Day 2';
            case 'fa4': return 'Day 3';
            case 'fa5': return 'Day 2';
            case 'fa6': return 'Day 2';
            case 'fa7': return 'Day 3';
            case 'fa8': return 'Day 4';
            case 'fe1': return 'Trip Essentials';
            // Bleisure scenario IDs
            case 'bf1': return 'Day 1';
            case 'bh1': return 'Day 1';
            case 'bc2': return 'Day 2';
            case 'bc3': return 'Day 3';
            case 'bh2': return 'Day 4';
            case 'ba1': return 'Day 4';
            case 'ba2': return 'Day 5';
            case 'ba3': return 'Day 6';
            case 'bf2': return 'Day 7';
            case 'be1': return 'Trip Essentials';
            default: return 'Day 5';
        }
    };

    const groupedItinerary = itinerary.reduce((acc, item) => {
        const day = getDayGroup(item);
        if (!acc[day]) acc[day] = [];
        acc[day].push(item);
        return acc;
    }, {} as Record<string, ItineraryItem[]>);

    const maxDay = Math.max(
        ...Object.keys(groupedItinerary)
            .filter(g => g.startsWith('Day '))
            .map(g => parseInt(g.replace('Day ', '')) || 0),
        (calendarFromDate && calendarToDate)
            ? Math.round((calendarToDate.getTime() - calendarFromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
            : 0
    );

    const sortedGroups = Array.from({ length: maxDay }, (_, i) => `Day ${i + 1}`);

    sortedGroups.forEach(day => {
        if (!groupedItinerary[day]) groupedItinerary[day] = [];
    });

    const formatDayWithDate = (dayLabel: string) => {
        if (!curation?.startDate || curation.startDate === '') return dayLabel;
        const dayNumMatch = dayLabel.match(/Day (\d+)/);
        if (!dayNumMatch) return dayLabel;

        const dayIdx = parseInt(dayNumMatch[1]) - 1;
        const parts = curation.startDate.split('-');
        const start = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const current = new Date(start);
        current.setDate(start.getDate() + dayIdx);

        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return `${dayLabel} (${current.toLocaleDateString('en-US', options)})`;
    };

    const scrollChat = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => { scrollChat(); }, [messages]);

    const checkIfFinalTurn = (msgs: ChatMessage[], currentReply: string) => {
        // If we already have items, it's a refinement/detailed turn
        if (itinerary.length > 0) return true;

        // If the current input looks like a full request
        if (currentReply.length > 100 && (currentReply.toLowerCase().includes('to') || currentReply.toLowerCase().includes('visit'))) return true;

        // Check if previous AI message was one of the last questions
        if (msgs.length === 0) return false;
        const lastAI = [...msgs].reverse().find(m => m.sender === 'ai');
        if (!lastAI) return false;

        const content = lastAI.content.toLowerCase();
        return content.includes('all set') ||
            content.includes('ready to build') ||
            content.includes('generating your') ||
            content.includes('hotel style') ||
            content.includes('preferences') ||
            content.includes('thank you for the details');
    };

    // ─── Conversation Engine ─────────────────────────────────────────
    useEffect(() => {
        if (!scenario || scenario === 'ai_custom' || phase !== 'chat' || waitingForUser) {
            return;
        }

        const diffDays = (calendarFromDate && calendarToDate)
            ? Math.round((calendarToDate.getTime() - calendarFromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
            : 7;

        const builtScript = buildScript(scenario, user, userBranch, diffDays);
        setScript(builtScript);

        if (stepIndex >= builtScript.length) return;

        const step = builtScript[stepIndex];
        setSuggestions(getSuggestions(scenario, stepIndex));

        setIsTyping(true);
        const delay = step.delay || 1500;
        const t = setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, step.aiMessage]);
            if (step.itineraryUpdate) setItinerary(prev => [...prev, ...step.itineraryUpdate!]);
            if (step.autoAdvance) { setStepIndex(prev => prev + 1); } else { setWaitingForUser(true); }
        }, delay);
        return () => clearTimeout(t);
    }, [stepIndex, scenario, phase, waitingForUser, userBranch]);

    const handleUserReply = async (reply: string, _replyValue?: string) => {
        // Prevent sending while AI is already generating
        if (isGenerating) return;

        const newUserMsg: ChatMessage = { id: `u-${Date.now()}`, sender: 'user', content: reply };

        setMessages(prev => {
            const updated = prev.map((m, idx) => {
                if (idx === prev.length - 1) return { ...m, isResponded: true };
                return m;
            });
            return [...updated, newUserMsg];
        });

        setWaitingForUser(false);
        setIsFinalGeneration(checkIfFinalTurn(messages, reply));
        setIsGenerating(true);
        setSuggestions([]);

        try {
            // CRITICAL: Always pass the human-readable `reply` to the AI.
            // The old replyValue tokens ('calendar_dates', 'ages_submitted', etc.)
            // contained no useful data and caused the model to lose track of phases.
            const historyForAI = [...messages, newUserMsg];
            const result = await generateAIItinerary(reply, historyForAI, user);


            const aiMessage: ChatMessage = {
                id: `ai-${Date.now()}`,
                sender: 'ai',
                content: result.aiMessage,
                value: JSON.stringify(result),
                quickReplies: result.quickReplies,
                showCalendar: result.showCalendar,
                showAgeInput: result.showAgeInput,
                showPassengerStepper: result.showPassengerStepper
            };

            setMessages(prev => [...prev, aiMessage]);

            if (result.itineraryItems) {
                const newItems: ItineraryItem[] = result.itineraryItems.map((item: any) => ({
                    ...item,
                    id: item.id || `ai-item-${Math.random().toString(36).substr(2, 9)}`
                }));
                // Strategy: Append new items but avoid duplicates if Gemini is just refining
                setItinerary(newItems);
            }

            if (result.quickReplies) {
                setSuggestions(result.quickReplies.map((q: any) => q.label));
            } else {
                setSuggestions([]);
            }

            const parsedItinerary = parseItineraryDaysFromDayDescriptions(result.dayDescriptions || []);

            if (result.dayDescriptions) {
                setDayDescriptions(result.dayDescriptions);
            }
            setItineraryDays(parsedItinerary);

            if (result.tripSummary || result.advanceBookItems) {
                setTripMeta({
                    tripSummary: result.tripSummary || '',
                    advanceBookItems: result.advanceBookItems || []
                });
            }

            if (result.destinationName && curation) {
                const updatedCuration: Curation = {
                    ...curation,
                    itinerary: parsedItinerary,
                    destination: {
                        ...curation.destination,
                        name: result.destinationName,
                        flights: curation.destination.flights || [],
                        hotels: curation.destination.hotels || [],
                        activities: curation.destination.activities || []
                    },
                    origin: result.origin || curation.origin,
                    travelers: result.travelers || curation.travelers,
                    tripName: result.tripName || curation.tripName,
                    startDate: result.startDate || curation.startDate,
                    endDate: result.endDate || curation.endDate
                };

                // Sync traveler breakdown to state if provided
                if (result.travelerBreakdown) {
                    if (result.travelerBreakdown.adults !== undefined) setAdultCount(result.travelerBreakdown.adults);
                    if (result.travelerBreakdown.children !== undefined) setChildCount(result.travelerBreakdown.children);
                } else if (result.travelers) {
                    // Fallback: assume all are adults if no breakdown
                    setAdultCount(result.travelers);
                    setChildCount(0);
                }

                // Populate destination collections from itinerary items
                if (result.itineraryItems) {
                    result.itineraryItems.forEach((item: any) => {
                        if (item.type === 'flight' && !updatedCuration.destination.flights.find(f => f.id === item.id)) {
                            const parts = (item.subtitle || '').split(' • ');
                            const routeMatch = (parts[0] || '').match(/([A-Z]{3})\s*[→\-]+\s*([A-Z]{3})/);
                            const originIata = routeMatch?.[1] || 'DXB';
                            const destIata = routeMatch?.[2] || result.destinationName?.slice(0, 3).toUpperCase() || 'DXB';
                            updatedCuration.destination.flights.push({
                                id: item.id,
                                airline: item.title,
                                airlineLogo: item.image || `https://pics.avs.io/200/200/${item.title?.slice(0, 2).toUpperCase() || originIata.slice(0, 2)}.png`,
                                departureTime: '10:30 AM',
                                arrivalTime: '06:45 PM',
                                price: item.price,
                                duration: parts[3] || '8h 15m',
                                originIata,
                                destinationIata: destIata,
                                isVerified: true
                            });
                        } else if (item.type === 'hotel' && !updatedCuration.destination.hotels.find(h => h.id === item.id)) {
                            updatedCuration.destination.hotels.push({
                                id: item.id,
                                name: item.title,
                                rating: 5,
                                imageUrl: item.image || '',
                                pricePerNight: Math.round(item.price / 3),
                                description: item.subtitle,
                                amenities: ['Premium Suite', 'WiFi', 'Pool'],
                                isVerified: true
                            });
                        } else if (item.type === 'activity' && !updatedCuration.destination.activities.find(a => a.id === item.id)) {
                            updatedCuration.destination.activities.push({
                                id: item.id,
                                name: item.title,
                                duration: item.subtitle || '2 hours',
                                price: item.price,
                                category: 'Experience',
                                imageUrl: item.image || ''
                            });
                        }
                    });
                }
                setCuration(updatedCuration);
            }

        } catch (error: any) {
            console.error("Chat turn error:", error);
            const isQuota = error.message === "QUOTA_EXCEEDED";
            const isModelNotFound = error.message === "MODEL_NOT_FOUND";
            const isParseError = error.message === "FAILED_TO_PARSE_AI_RESPONSE";

            setMessages(prev => [...prev, {
                id: `ai-err-${Date.now()}`,
                sender: 'ai',
                content: isQuota
                    ? "I'm sorry, my daily travel planning quota has been reached. 🛑 Please try again in a few hours or check back tomorrow."
                    : (isModelNotFound
                        ? "I'm sorry, the selected AI model is currently unavailable. 🛫 I'm looking for an alternative..."
                        : (isParseError
                            ? "I'm sorry, I had trouble processing the itinerary details. 🧩 Please try sending your last message again."
                            : "I'm sorry, I encountered an error while planning your trip. Please try again."))
            }]);
        } finally {
            setIsGenerating(false);
            setWaitingForUser(true);
        }
    };

    // ─── Voice Synthesis Logic ──────────────────────────────────────────
    const speak = (text: string, onEnd?: () => void) => {
        speakText(text, { isMuted, onEnd, lang: language === 'pl' ? 'pl-PL' : 'en-US' });
    };

    // Auto-speak new AI messages
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.sender === 'ai' && lastMessage.content) {
            // Clean markdown bold for better TTS
            const cleanText = lastMessage.content.replace(/\*\*/g, '');

            speak(cleanText, () => {
                // If in Live Mode, restart mic after Anya finishes talking
                if (isLiveMode) {
                    setTimeout(() => startListening(true), 500);
                }
            });
        }
    }, [messages, isMuted, isLiveMode]);

    const handleStart = async () => {
        if (!input.trim()) return;
        setPhase('chat');
        setMessages([{ id: 'user-0', sender: 'user', content: input }]);
        const isFinal = input.length > 100 || (input.toLowerCase().includes('to') && input.toLowerCase().includes('for'));
        setIsFinalGeneration(isFinal);
        setIsGenerating(true);
        setItinerary([]);
        setScenario('ai_custom');

        try {
            const result = await generateAIItinerary(input, [], user);


            const aiMessage: ChatMessage = {
                id: `ai-start-${Date.now()}`,
                sender: 'ai',
                content: result.aiMessage,
                value: JSON.stringify(result),
                quickReplies: result.quickReplies,
                showCalendar: result.showCalendar,
                showAgeInput: result.showAgeInput,
                showPassengerStepper: result.showPassengerStepper
            };

            setMessages(prev => [...prev, aiMessage]);

            if (result.itineraryItems) {
                setItinerary(result.itineraryItems);
            }

            const parsedItinerary = parseItineraryDaysFromDayDescriptions(result.dayDescriptions || []);

            if (result.dayDescriptions) {
                setDayDescriptions(result.dayDescriptions);
            }
            setItineraryDays(parsedItinerary);

            if (result.tripSummary || result.advanceBookItems) {
                setTripMeta({
                    tripSummary: result.tripSummary || '',
                    advanceBookItems: result.advanceBookItems || []
                });
            }

            // Build initial curation
            const newCuration: Curation = {
                curationId: `AI-${Date.now()}`,
                destination: {
                    id: 'dest-ai',
                    name: result.destinationName || 'Destination',
                    country: '',
                    imageUrl: result.itineraryItems?.[0]?.image || '',
                    description: '',
                    flights: [],
                    hotels: [],
                    activities: []
                },
                itinerary: parsedItinerary,
                travelers: result.travelers || 1,
                status: 'draft',
                tripName: result.tripName || 'New Trip',
                startDate: result.startDate || '',
                endDate: result.endDate || '',
                origin: result.origin || ''
            };

            // Sync traveler breakdown for start phase
            if (result.travelerBreakdown) {
                if (result.travelerBreakdown.adults !== undefined) setAdultCount(result.travelerBreakdown.adults);
                if (result.travelerBreakdown.children !== undefined) setChildCount(result.travelerBreakdown.children);
            } else if (result.travelers) {
                setAdultCount(result.travelers);
                setChildCount(0);
            }

            // Populate destination collections
            if (result.itineraryItems) {
                result.itineraryItems.forEach((item: any) => {
                    if (item.type === 'flight') {
                        const parts = (item.subtitle || '').split(' • ');
                        const routeMatch = (parts[0] || '').match(/([A-Z]{3})\s*[→\-]+\s*([A-Z]{3})/);
                        const originIata = routeMatch?.[1] || 'DXB';
                        const destIata = routeMatch?.[2] || result.destinationName?.slice(0, 3).toUpperCase() || 'DXB';
                        const flightObj: Flight = {
                            id: item.id,
                            airline: item.title,
                            airlineLogo: item.image || `https://pics.avs.io/200/200/${item.title?.slice(0, 2).toUpperCase() || originIata.slice(0, 2)}.png`,
                            departureTime: '10:30 AM',
                            arrivalTime: '06:45 PM',
                            price: item.price,
                            duration: parts[3] || '8h 15m',
                            originIata,
                            destinationIata: destIata,
                            isVerified: true
                        };
                        newCuration.destination.flights.push(flightObj);
                        item.flightRef = item.flightRef || flightObj;
                        (item as any).flightAlternatives = item.flightAlternatives || [];
                    } else if (item.type === 'hotel') {
                        newCuration.destination.hotels.push({
                            id: item.id,
                            name: item.title,
                            rating: 5,
                            imageUrl: item.image || '',
                            pricePerNight: Math.round(item.price / 3),
                            description: item.subtitle,
                            amenities: ['Premium Suite', 'WiFi', 'Pool'],
                            isVerified: true
                        });
                        (item as any).hotelAlternatives = item.hotelAlternatives || [];
                    } else if (item.type === 'activity') {
                        newCuration.destination.activities.push({
                            id: item.id,
                            name: item.title,
                            duration: item.subtitle || '2 hours',
                            price: item.price,
                            category: 'Experience',
                            imageUrl: item.image || ''
                        });
                        (item as any).activityAlternatives = item.activityAlternatives || [];
                    }
                });
            }
            setCuration(newCuration);

            if (result.quickReplies) {
                setSuggestions(result.quickReplies.map((q: any) => q.label));
            } else {
                setSuggestions([]);
            }

        } catch (error: any) {
            console.error("Initial planning error:", error);
            const isQuota = error.message === "QUOTA_EXCEEDED";
            const isModelNotFound = error.message === "MODEL_NOT_FOUND";
            const isBlocked = error.message === "BLOCKED_BY_SAFETY";
            const isParseError = error.message === "FAILED_TO_PARSE_AI_RESPONSE";

            setMessages(prev => [...prev, {
                id: `ai-err-start-${Date.now()}`,
                sender: 'ai',
                content: isQuota
                    ? "I'm sorry, I couldn't start the planning process because my API quota has been exceeded. 🛑 Please check your billing details or try again later."
                    : (isModelNotFound
                        ? "I'm sorry, I couldn't find the requested AI model. 🛑 I've updated the settings to use a supported version. Please try again."
                        : (isBlocked
                            ? "I'm sorry, I couldn't generate that specific itinerary due to content safety filters. 🛡️ Could you try rephrasing your request or choosing a different destination?"
                            : (isParseError
                                ? "I'm sorry, I encountered a technical issue while creating your itinerary. 🔌 Please try again in a moment."
                                : "I'm sorry, I encountered an error while planning your trip. Please try again.")))
            }]);
        } finally {
            setIsGenerating(false);
            setWaitingForUser(true);
        }

        setBookingTarget(null);
        setDrawerOpen(false);
        setSelectedGroup('Day 1');
    };





    const handleBack = () => {
        setPhase('landing'); setScenario(null); setMessages([]); setStepIndex(0);
        setItinerary([]); setInput(''); setCuration(null); setBookingTarget(null); setDrawerOpen(false);
        setUserBranch(undefined); setSelectedGroup('Day 1');
        setCalendarFromDate(null); setCalendarToDate(null); setCalendarMonth(new Date());
    };

    const handleBookItem = (item: ItineraryItem, initialStep: BookingStep = 'details', alts: any[] = [], isVirtual: boolean = false) => {
        setBookingTarget({ 
            type: item.type === 'transfer' || item.type === 'insurance' ? 'essentials' : item.type, 
            itemId: item.id,
            virtualItem: isVirtual ? item : undefined
        });
        setInitialBookingStep(initialStep);
        if (item.type === 'flight') {
            setActiveFlightAlternatives(alts as Flight[]);
        } else if (item.type === 'hotel') {
            setActiveHotelAlternatives(alts as Hotel[]);
        } else if (item.type === 'activity') {
            setActiveActivityAlternatives(alts as Activity[]);
        }
        setDrawerOpen(true);
    };

    const handleBookingComplete = (details: any) => {
        let confirmedItemTitle = 'Booking';

        if (bookingTarget?.virtualItem) {
            confirmedItemTitle = bookingTarget.virtualItem.title;
            // Add or update virtual item in itinerary
            setItinerary(prev => {
                const exists = prev.find(it => it.id === bookingTarget.itemId);
                const finalItem: ItineraryItem = {
                    ...(exists || bookingTarget.virtualItem!),
                    title: details.activityName || (exists?.title || bookingTarget.virtualItem!.title),
                    price: details.price || (exists?.price || bookingTarget.virtualItem!.price),
                    image: details.imageUrl || (exists?.image || bookingTarget.virtualItem!.image),
                    booked: true
                };

                if (exists) {
                    return prev.map(it => it.id === bookingTarget.itemId ? finalItem : it);
                }
                return [...prev, finalItem];
            });
            if (bookingTarget.type === 'essentials') {
                setEssentialsCart([]); // Clear cart after booking
                setActiveTab('Itinerary'); // Switch back to itinerary
            }
            setCuration(prev => {
                if (!prev) return prev;
                const newCuration = { ...prev, essentialsBooking: details };
                if (onSyncCuration) onSyncCuration(newCuration);
                return newCuration;
            });
        } else {
            const bookedItem = itinerary.find(it => it.id === bookingTarget?.itemId);
            if (bookedItem) {
                confirmedItemTitle = bookedItem.title;
            }
            setItinerary(prev => prev.map(it => it.id === bookingTarget?.itemId ? { ...it, booked: true } : it));

            // Persist booking details into curation state
            setCuration(prev => {
                if (!prev) return prev;
                const newCuration = { ...prev };
                if (bookingTarget?.type === 'flight') newCuration.flightBooking = details;
                else if (bookingTarget?.type === 'hotel') newCuration.hotelBooking = details;
                else if (bookingTarget?.type === 'activity') {
                    newCuration.experienceBookings = [...(newCuration.experienceBookings || []), details];
                }
                else if (bookingTarget?.type === 'essentials') newCuration.essentialsBooking = details;

                // Sync new curation state up to App
                if (onSyncCuration) onSyncCuration(newCuration);

                return newCuration;
            });
        }
        setBookingTarget(null);
        setDrawerOpen(false);
        setMessages(prev => [...prev, { id: `ai-booked-${Date.now()}`, sender: 'ai', content: `✅ **${confirmedItemTitle}** confirmed! I've updated your itinerary.` }]);
    };

    const handleBookingBack = () => {
        setBookingTarget(null);
        setDrawerOpen(false);
    };

    // ── Split Bill Card (inline in chat) ──────────────────────────────
    const SplitBillCard: React.FC<{ data: BillData }> = ({ data }) => {
        const generatePDF = (type: 'corporate' | 'personal') => {
            const section = type === 'corporate' ? data.corporate : data.personal;
            const label = type === 'corporate' ? 'Corporate' : 'Personal';
            const color = type === 'corporate' ? [37, 99, 235] : [22, 163, 74]; // blue / green
            const doc = new jsPDF({ unit: 'mm', format: 'a4' });

            // Header bar
            doc.setFillColor(color[0], color[1], color[2]);
            doc.rect(0, 0, 210, 38, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            doc.text(`${label} Invoice`, 20, 22);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`IDFC First Bank • Frankfurt Bleisure Trip`, 20, 30);
            doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 150, 30);

            // Invoice details
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(9);
            const refNum = `INV-${type === 'corporate' ? 'CORP' : 'PERS'}-${Date.now().toString(36).toUpperCase()}`;
            doc.text(`Invoice #: ${refNum}`, 20, 48);
            doc.text(`Billing: ${label} Account`, 20, 54);
            doc.text(`Traveler: Alex Sterling`, 120, 48);
            doc.text(`Trip: Frankfurt Bleisure (Mar 9-15, 2026)`, 120, 54);

            // Table header
            let y = 68;
            doc.setFillColor(245, 245, 245);
            doc.rect(20, y - 5, 170, 8, 'F');
            doc.setTextColor(60, 60, 60);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('Item', 24, y);
            doc.text('Amount (INR)', 155, y);
            y += 10;

            // Line items
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(80, 80, 80);
            section.items.forEach((item) => {
                doc.text(item.name, 24, y);
                doc.text(`${item.amount.toLocaleString()} INR`, 155, y);
                doc.setDrawColor(230, 230, 230);
                doc.line(20, y + 3, 190, y + 3);
                y += 9;
            });

            // Total
            y += 4;
            doc.setFillColor(color[0], color[1], color[2]);
            doc.rect(120, y - 5, 70, 10, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(`Total: ${section.total.toLocaleString()} INR`, 126, y + 1);

            // Footer
            doc.setTextColor(180, 180, 180);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text('Generated by IDFC First Bank Travel Anya — IDFC First Bank.com', 20, 280);

            doc.save(`IDFC First Bank_${label}_Invoice.pdf`);
        };

        const renderSection = (type: 'corporate' | 'personal') => {
            const section = type === 'corporate' ? data.corporate : data.personal;
            const label = type === 'corporate' ? 'Corporate' : 'Personal';
            const icon = type === 'corporate' ? '🔵' : '🟢';
            const borderColor = type === 'corporate' ? 'border-blue-400' : 'border-emerald-400';
            const bgGradient = type === 'corporate'
                ? 'from-blue-50 to-white'
                : 'from-emerald-50 to-white';
            const badgeColor = type === 'corporate'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-emerald-100 text-emerald-700';
            const btnColor = type === 'corporate'
                ? 'bg-blue-600 hover:bg-blue-500'
                : 'bg-emerald-600 hover:bg-emerald-500';
            const totalBg = type === 'corporate' ? 'bg-blue-600' : 'bg-emerald-600';

            return (
                <div className={`rounded-xl border-2 ${borderColor} overflow-hidden bg-gradient-to-b ${bgGradient} shadow-md flex-1 min-w-[200px]`}>
                    {/* Card Header */}
                    <div className={`px-3 py-2.5 flex items-center justify-between border-b ${type === 'corporate' ? 'border-blue-100' : 'border-emerald-100'}`}>
                        <div className="flex items-center gap-2">
                            <span className="text-base">{icon}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${badgeColor} px-2 py-0.5 rounded-full`}>{label}</span>
                        </div>
                        <Receipt size={14} className={type === 'corporate' ? 'text-blue-400' : 'text-emerald-400'} />
                    </div>
                    {/* Items */}
                    <div className="px-3 py-2 space-y-1.5">
                        {section.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-[11px]">
                                <span className="text-slate-600 truncate mr-2">{item.name}</span>
                                <span className="font-semibold text-slate-800 whitespace-nowrap">{item.amount.toLocaleString()} INR</span>
                            </div>
                        ))}
                    </div>
                    {/* Total */}
                    <div className={`mx-3 mb-2 rounded-lg ${totalBg} px-3 py-2 flex justify-between items-center`}>
                        <span className="text-[10px] text-white/80 font-bold uppercase">Total</span>
                        <span className="text-sm text-white font-black">{section.total.toLocaleString()} INR</span>
                    </div>
                    {/* Download */}
                    <button
                        onClick={() => generatePDF(type)}
                        className={`w-full ${btnColor} text-white text-[11px] font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-md active:scale-95`}
                    >
                        <Download size={12} /> Download PDF
                    </button>
                </div>
            );
        };

        return (
            <div className="flex gap-3 mt-2 w-full">
                {renderSection('corporate')}
                {renderSection('personal')}
            </div>
        );
    };

    const totalCost = itinerary.reduce((s, i) => s + i.price, 0);
    const bookedCount = itinerary.filter(i => i.booked).length;
    const bookingItem = (() => {
        if (!bookingTarget) return null;
        const item = (bookingTarget.virtualItem || itinerary.find(it => it.id === bookingTarget.itemId)) as ItineraryItem | undefined;
        if (!item) return null;

        // Ensure referential objects exist for AI-generated items
        if (scenario === 'ai_custom' || !item.flightRef && !item.hotelRef && !item.activityRef) {
            if (item.type === 'flight' && !item.flightRef) {
                const parts = (item.subtitle || '').split(' • ');
                const routePart = parts[0] || '';
                const timesPart = parts[2] || '';

                // Parse "DXB → LHR" or similar
                const routeMatch = routePart.match(/([A-Z]{3})\s*[→\-]+\s*([A-Z]{3})/);
                const originIata = routeMatch?.[1] || 'DXB';
                const destIata = routeMatch?.[2] || curation?.destination?.name?.slice(0, 3).toUpperCase() || 'DXB';

                // Parse "10:30 → 18:45" or similar
                const timeMatch = timesPart.match(/(\d{1,2}:\d{2})\s*[→\-]+\s*(\d{1,2}:\d{2})/);
                const depTime = timeMatch?.[1] ? `${timeMatch[1]} AM` : '10:30 AM';
                const arrTime = timeMatch?.[2] ? `${timeMatch[2]} PM` : '06:45 PM';

                item.flightRef = {
                    id: item.id,
                    airline: item.title,
                    airlineLogo: item.image || `https://pics.avs.io/200/200/${item.title?.slice(0, 2).toUpperCase() || originIata.slice(0, 2)}.png`,
                    departureTime: depTime,
                    arrivalTime: arrTime,
                    price: item.price,
                    duration: parts[3] || '8h 15m',
                    originIata,
                    destinationIata: destIata,
                    isVerified: true
                };
            } else if (item.type === 'hotel' && !item.hotelRef) {
                item.hotelRef = {
                    id: item.id,
                    name: item.title,
                    rating: 5,
                    imageUrl: item.image || '',
                    pricePerNight: Math.round(item.price / 3),
                    description: item.subtitle,
                    amenities: ['Premium Suite', 'Infinity Pool', 'Spa Access', 'Anya AI'],
                    isVerified: true
                };
            } else if (item.type === 'activity' && !item.activityRef) {
                item.activityRef = {
                    id: item.id,
                    name: item.title,
                    duration: item.subtitle.split(' • ')[0] || 'Flexible',
                    price: item.price,
                    category: 'Experience',
                    imageUrl: item.image || ''
                };
            } else if ((item.type === 'transfer' || item.type === 'insurance') && !item.essentialsRef) {
                const catalogItem = ESSENTIALS_CATALOG.find(e =>
                    e.title.toLowerCase().includes(item.title.toLowerCase()) ||
                    e.category.toLowerCase() === item.type.toLowerCase()
                );
                item.essentialsRef = [{
                    id: item.id,
                    category: catalogItem?.category || (item.type === 'transfer' ? 'Transport' : 'Protection'),
                    title: item.title,
                    price: item.price,
                    icon: catalogItem?.icon || (item.type === 'transfer' ? 'Car' : 'Shield'),
                    description: item.subtitle,
                    variants: catalogItem?.variants || []
                }];
            }
        }
        return item;
    })();

    const scenarioLabel = (curation?.tripName && curation.tripName !== 'New Trip')
        ? curation.tripName
        : (scenario ? (scenario === 'executive' ? 'London Business Trip' : scenario === 'family' ? 'Italy Family Holiday' : 'Frankfurt Bleisure') : (initialCuration?.tripName || 'Your Itinerary'));
    const isExtended = scenario === 'bleisure' && (userBranch?.startsWith('extend') || userBranch === 'extend');
    const hasFamilyDates = scenario === 'family' && curation?.startDate && curation?.endDate && curation.startDate !== '' && curation.endDate !== '';
    const parseLocalDate = (dateStr: string) => {
        const [y, m, d] = dateStr.split('-').map(Number);
        return new Date(y, m - 1, d);
    };
    const formatCurationDates = () => {
        if (scenario === 'family') {
            if (!hasFamilyDates) return 'Select dates';
            const s = parseLocalDate(curation!.startDate);
            const e = parseLocalDate(curation!.endDate);
            const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
            return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', opts)}, ${s.getFullYear()}`;
        }

        const sDate = curation?.startDate || initialCuration?.startDate;
        const eDate = curation?.endDate || initialCuration?.endDate;
        if (sDate && eDate && sDate !== '' && eDate !== '') {
            try {
                const s = parseLocalDate(sDate);
                const e = parseLocalDate(eDate);
                const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
                return `${s.toLocaleDateString('en-US', opts)} – ${e.toLocaleDateString('en-US', opts)}, ${s.getFullYear()}`;
            } catch (err) {
                return `${sDate} – ${eDate}`;
            }
        }

        if (scenario === 'executive') return userBranch === 'full' ? 'Mar 2 – 8, 2026' : 'Mar 2 – 4, 2026';
        if (scenario === 'bleisure') return isExtended ? 'Mar 9 – 15, 2026' : 'Mar 9 – 11, 2026';
        return '';
    };
    const scenarioDates = formatCurationDates();
    const scenarioDurationCount = () => {
        const sDate = curation?.startDate || initialCuration?.startDate;
        const eDate = curation?.endDate || initialCuration?.endDate;
        if (sDate && eDate && sDate !== '' && eDate !== '') {
            try {
                const s = parseLocalDate(sDate);
                const e = parseLocalDate(eDate);
                const diff = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                return `${diff} days`;
            } catch (err) {
                return '—';
            }
        }
        return '—';
    };
    const scenarioTravelers = (curation?.travelers || initialCuration?.travelers)
        ? (scenario === 'paris'
            ? `${adultCount} adult${adultCount > 1 ? 's' : ''}${childCount > 0 ? `, ${childCount} child${childCount > 1 ? 'ren' : ''}` : ''}`
            : (curation?.travelers ? `${curation.travelers} traveler${curation.travelers > 1 ? 's' : ''}` : (scenario === 'executive' ? '1 traveler' : scenario === 'family' ? '2 adults, 2 children' : (initialCuration ? `${initialCuration.travelers} traveler(s)` : '? traveler')))
        ) : (scenario === 'ai_custom' ? '' : '');

    const scenarioRoute = useMemo(() => (curation?.origin && curation?.destination?.name && curation.destination.name !== 'Destination' && curation.destination.name !== 'TBD' && curation.origin !== '')
        ? `${curation.origin} → ${curation.destination.name}`
        : (scenario ? (
            scenario === 'paris'
                ? (curation?.origin ? `${curation.origin} → Paris` : 'Paris')
                : (scenario === 'executive' ? 'Dubai → London' : scenario === 'family' ? 'Dubai → Italy' : (scenario === 'ai_custom' ? (curation?.origin ? `${curation.origin} → ${curation?.destination?.name || ''}` : (curation?.destination?.name === 'TBD' ? '' : (curation?.destination?.name === 'Destination' ? '' : curation?.destination?.name || ''))) : ''))
        ) : (initialCuration ? `${initialCuration.origin || 'Dubai'} → ${initialCuration.destination.name}` : '')), [curation, scenario, initialCuration]);

    // Moved these hooks here to avoid violation of "Rules of Hooks" due to late definition after an early return
    const destName = useMemo(() => (curation?.destination?.name && curation.destination.name !== 'Destination' && curation.destination.name !== 'TBD')
        ? curation.destination.name
        : (scenario === 'executive' ? 'London' : scenario === 'family' ? 'Italy' : scenario === 'paris' ? 'Paris' : ''), [curation, scenario]);

    const montageAttractions = useMemo(() => {
        const getAttractionsForMontage = () => {
            if (scenario === 'executive') return [...LONDON_ACTIVITIES, ...LONDON_HOTELS.map(h => ({ id: h.id, name: h.name, category: 'Accommodation', imageUrl: h.imageUrl }))];
            if (scenario === 'family') return [...ITALY_ACTIVITIES, ...ITALY_HOTELS.map(h => ({ id: h.id, name: h.name, category: 'Accommodation', imageUrl: h.imageUrl }))];
            if (scenario === 'paris') return [...PARIS_ACTIVITIES, ...PARIS_HOTELS.map(h => ({ id: h.id, name: h.name, category: 'Accommodation', imageUrl: h.imageUrl }))];

            // Dynamic search for any destination in ai_custom
            const currentDest = destName || curation?.destination?.name;
            if (currentDest && currentDest !== 'Destination' && currentDest !== 'TBD' && currentDest !== '') {
                const sanitized = currentDest.toLowerCase().replace(/[^a-zA-Z0-9]/g, ',');
                return [
                    { id: 'dyn-1', name: `Top Attractions in ${currentDest}`, category: 'Culture', imageUrl: `https://loremflickr.com/800/600/${sanitized},landmark` },
                    { id: 'dyn-2', name: 'Luxury Stay Curated', category: 'Accommodation', imageUrl: `https://loremflickr.com/800/600/${sanitized},hotel` },
                    { id: 'dyn-3', name: 'Elite Dining Experience', category: 'Dining', imageUrl: `https://loremflickr.com/800/600/${sanitized},restaurant` },
                    { id: 'dyn-4', name: 'Local Hidden Gems', category: 'Exploration', imageUrl: `https://loremflickr.com/800/600/${sanitized},nature` },
                    { id: 'dyn-5', name: 'Premium Transport', category: 'Transit', imageUrl: `https://loremflickr.com/800/600/luxury,car` },
                    { id: 'dyn-6', name: 'Bespoke Culture Tour', category: 'Culture', imageUrl: `https://loremflickr.com/800/600/${sanitized},city` },
                    { id: 'dyn-7', name: 'Signature Experiences', category: 'Lifestyle', imageUrl: `https://loremflickr.com/800/600/${sanitized},lifestyle` },
                ];
            }

            // Default high-end travel montage (No Frankfurt)
            return [
                { id: 'def-1', name: 'Global Destinations', category: 'Travel', imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?auto=format&fit=crop&q=80&w=800' },
                { id: 'def-2', name: 'Elite Accommodations', category: 'Stay', imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800' },
                { id: 'def-3', name: 'Private Jet Journey', category: 'Aviation', imageUrl: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&q=80&w=800' },
                { id: 'def-4', name: 'Gourmet Gastronomy', category: 'Dining', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800' },
                { id: 'def-5', name: 'Serene Escapes', category: 'Nature', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800' },
                { id: 'def-6', name: 'Urban Exploration', category: 'Bespoke', imageUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=800' },
            ];
        };

        let rawAttractions = getAttractionsForMontage();
        while (rawAttractions.length < 7) {
            rawAttractions = [...rawAttractions, ...rawAttractions];
        }
        return rawAttractions.slice(0, 7);
    }, [scenario, destName, curation]);

    const montageLayouts = useMemo(() => [
        { row: '1 / 3', col: '1 / 3', fromX: -120, fromY: -80, delay: 0.2, rotate: -2 },
        { row: '1 / 2', col: '3 / 4', fromX: 100, fromY: -60, delay: 0.7, rotate: 2 },
        { row: '2 / 3', col: '3 / 4', fromX: 120, fromY: 40, delay: 1.2, rotate: -1 },
        { row: '3 / 4', col: '1 / 2', fromX: -100, fromY: 80, delay: 1.7, rotate: 3 },
        { row: '3 / 4', col: '2 / 4', fromX: 80, fromY: 100, delay: 2.2, rotate: -2 },
        { row: '4 / 5', col: '1 / 3', fromX: -80, fromY: 120, delay: 2.7, rotate: 1 },
        { row: '4 / 5', col: '3 / 4', fromX: 100, fromY: 80, delay: 3.2, rotate: -3 },
    ], []);

    const FloatingCard = ({ attraction, layout }: { attraction: any, layout: any }) => (
        <motion.div
            initial={{ opacity: 0, x: layout.fromX, y: layout.fromY, rotate: layout.rotate }}
            animate={{
                opacity: 0.25,
                x: 0,
                y: 0,
                rotate: layout.rotate,
                transition: { duration: 2, delay: layout.delay, ease: "easeOut" }
            }}
            whileHover={{
                opacity: 0.6,
                scale: 1.05,
                rotate: 0,
                zIndex: 50,
                transition: { duration: 0.4 }
            }}
            className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 group cursor-pointer"
            style={{
                gridRow: layout.row,
                gridColumn: layout.col
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 z-10" />
            <SafeImage
                src={attraction.imageUrl}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                alt={attraction.name}
                category="activity"
            />
            <div className="absolute bottom-4 left-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-[10px] font-black text-brand-orange uppercase tracking-widest mb-1">{attraction.category}</p>
                <h5 className="text-sm font-bold text-white leading-tight">{attraction.name}</h5>
            </div>
        </motion.div>
    );


    // ─── LANDING PAGE ──────────────────────────────────────────────────
    if (phase === 'landing') {
        return (
            <div className="w-full h-full flex flex-col overflow-hidden bg-transparent relative">
                {/* Immersive Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{
                            scale: [1, 1.05, 1]
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0"
                    >
                        <img src="/new_auth_hero.png" className="w-full h-full object-cover" alt="" />
                    </motion.div>
                </div>

                <div className="relative z-30 flex-1 flex flex-col items-center px-6 overflow-y-auto scrollbar-hide pt-4 pb-12 lg:pt-6 lg:pb-24">
                    <div className="w-full max-w-4xl flex flex-col items-center">
                        {/* Hero Section */}
                        <motion.div
                            initial={{ y: 40, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="text-center mb-6 px-6 md:px-12 py-4 rounded-[40px] select-none relative"
                        >
                            <h1 
                                className="relative text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[1.05] mb-6 z-10"
                                style={{ textShadow: '0 4px 16px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.9)' }}
                            >
                                {LANDING_TRANSLATIONS[language].heroTitle1}<br />
                                <span className="inline-block relative">
                                    {LANDING_TRANSLATIONS[language].heroTitle2}
                                </span>
                            </h1>
                            <p 
                                className="relative text-lg md:text-2xl text-slate-100 font-medium max-w-2xl mx-auto leading-relaxed z-10"
                                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}
                            >
                                {LANDING_TRANSLATIONS[language].heroSubtitle}
                            </p>
                        </motion.div>

                        {/* Premium AI Input Area */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                            className="w-full max-w-3xl group"
                        >
                            <div className="relative rounded-[32px] overflow-hidden p-[2px] shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
                                {/* Spinning Red Rectangle Background */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[200%] bg-red-600/50 animate-[spin_3s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                <div className="relative bg-slate-950/80 backdrop-blur-3xl rounded-[30px] p-4 flex flex-col transition-all duration-500 z-10">
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleStart(); } }}
                                        placeholder={LANDING_TRANSLATIONS[language].placeholder}
                                        className="w-full h-24 md:h-32 p-4 text-lg md:text-xl text-white placeholder:text-slate-400/60 bg-transparent outline-none resize-none font-medium selection:bg-brand-red/40 scrollbar-hide leading-relaxed"
                                    />
                                    <div className="flex justify-between items-center px-2 pb-1">
                                        <div className="flex gap-1">
                                            <button className="p-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all active:scale-95 group/btn relative">
                                                <Paperclip size={20} className="relative z-10" />
                                                <div className="absolute inset-0 bg-white/5 rounded-2xl scale-0 group-hover/btn:scale-100 transition-transform duration-300"></div>
                                            </button>
                                            <button className="p-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-2xl transition-all active:scale-95 group/btn relative">
                                                <Mic size={20} className="relative z-10" />
                                                <div className="absolute inset-0 bg-white/5 rounded-2xl scale-0 group-hover/btn:scale-100 transition-transform duration-300"></div>
                                            </button>
                                        </div>
                                        <button
                                            onClick={handleStart}
                                            className="relative overflow-hidden bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-orange-500 text-white px-6 py-2.5 rounded-full flex items-center gap-2 transition-all duration-500 hover:scale-[1.04] active:scale-95 shadow-[0_0_20px_rgba(157,29,39,0.5)] hover:shadow-[0_0_40px_rgba(157,29,39,0.8)] border border-red-500/50 group/start"
                                        >
                                            <div className="absolute inset-0 shimmer-effect opacity-50"></div>
                                            <Sparkles size={18} className="text-[#ffccd0] group-hover/start:animate-pulse relative z-10" />
                                            <span className="text-sm font-black tracking-widest uppercase relative z-10">{LANDING_TRANSLATIONS[language].startPlanning}</span>
                                            <ArrowRight size={18} className="transform group-hover/start:translate-x-2 transition-transform duration-300 relative z-10" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Refined Quick Action Prompts */}
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.8, duration: 0.8 }}
                                className="flex flex-wrap justify-center gap-3 mt-12 relative z-20"
                            >
                                {QUICK_PROMPTS[language].map((qp, i) => (
                                    <motion.button
                                        key={i}
                                        whileHover={{ y: -4, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setInput(qp.text)}
                                        className="relative overflow-hidden bg-slate-900/50 hover:bg-slate-900/80 backdrop-blur-xl text-slate-100 hover:text-white px-6 py-3.5 rounded-2xl text-[12px] font-bold uppercase tracking-widest flex items-center gap-3 transition-all border border-white/10 hover:border-brand-orange/50 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(196,149,58,0.2)] group/prompt"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-brand-orange/0 via-brand-orange/10 to-brand-orange/0 translate-x-[-100%] group-hover/prompt:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                                        <div className="p-1.5 bg-white/10 rounded-lg group-hover/prompt:bg-brand-orange/20 transition-colors">
                                            <qp.icon size={16} className="text-brand-orange group-hover/prompt:text-brand-yellow transition-colors" />
                                        </div>
                                        {qp.label}
                                    </motion.button>
                                ))}
                                <motion.button
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onOpenManual}
                                    className="relative overflow-hidden bg-gradient-to-r from-brand-orange/10 to-brand-yellow/10 hover:from-brand-orange/20 hover:to-brand-yellow/20 backdrop-blur-xl text-white hover:text-white px-6 py-3.5 rounded-2xl text-[12px] font-bold uppercase tracking-widest flex items-center gap-3 transition-all border border-brand-orange/30 hover:border-brand-yellow/50 shadow-[0_8px_30px_rgba(196,149,58,0.15)] group/prompt"
                                >
                                    <div className="p-1.5 bg-brand-orange/20 rounded-lg group-hover/prompt:bg-brand-yellow/30 transition-colors">
                                        <Plus size={16} className="text-brand-yellow group-hover/prompt:text-amber-200 transition-colors" />
                                    </div>
                                    {LANDING_TRANSLATIONS[language].stepByStep}
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Highly Polished Footer Branding */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2, duration: 1 }}
                        className="mt-auto pt-12 pb-4 flex flex-col items-center gap-6 w-full"
                    >
                        <div className="flex items-center gap-6 w-full justify-center opacity-30">
                            <div className="flex-1 max-w-[120px] h-[1px] bg-gradient-to-r from-transparent via-slate-500 to-slate-800" />
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-brand-red" />
                                <div className="w-2 h-2 rounded-full bg-brand-orange" />
                                <div className="w-2 h-2 rounded-full bg-brand-yellow" />
                            </div>
                            <div className="flex-1 max-w-[120px] h-[1px] bg-gradient-to-l from-transparent via-slate-500 to-slate-800" />
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="flex flex-col items-center md:items-start">
                                <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.4em] mb-2" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>Powered By</span>
                                <div className="bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800 transition-all hover:bg-slate-900 flex items-center gap-2 shadow-md">
                                    <img src="/images/pointlabs.png" className="h-4 w-auto object-contain brightness-125 contrast-125" alt="Pointlabs" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // ─── CHAT VIEW ───────────────────────────────────────────────────
    return (
        <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden bg-transparent relative">
            {isMobile && hasItinerary && (
                <div className="flex shrink-0 glass-nav p-1">
                    <button
                        onClick={() => setMobileView('chat')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all ${mobileView === 'chat' ? 'text-red-500 border-b-2 border-red-500' : 'text-slate-500'}`}
                    >
                        Chat
                    </button>
                    <button
                        onClick={() => setMobileView('itinerary')}
                        className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-all ${mobileView === 'itinerary' ? 'text-red-500 border-b-2 border-red-500' : 'text-slate-500'}`}
                    >
                        Itinerary
                    </button>
                </div>
            )}

            {/* ─── CHAT PANEL ─── */}
            <motion.div
                initial={false}
                animate={{
                    width: isMobile ? (mobileView === 'chat' ? '100%' : '0%') : (viewMode === 'results-only' ? 0 : (hasItinerary ? '40%' : '630px')),
                    opacity: viewMode === 'results-only' || (isMobile && mobileView !== 'chat') ? 0 : 1,
                    pointerEvents: viewMode === 'results-only' || (isMobile && mobileView !== 'chat') ? 'none' : 'auto'
                }}
                transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                className={`h-full flex flex-col border-r border-white/5 glass-sidebar shrink-0 relative overflow-hidden ${isMobile && mobileView !== 'chat' ? 'hidden' : 'flex'}`}
            >
                {/* Header */}
                <div className="h-14 border-b border-slate-200 flex items-center px-4 gap-3 shrink-0 glass-nav">
                    <button onClick={handleBack} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-800"><ArrowLeft size={16} /></button>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-orange-500 text-white flex items-center justify-center font-bold text-xs">A</div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[#1a1a2e] font-bold text-sm truncate">Anya AI</p>
                        <p className="text-[10px] text-slate-500">Travel assistant</p>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online" />
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <div className="px-4 py-4 space-y-4">
                        {messages.map((msg) => (
                            <motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className="max-w-[90%]">
                                    {msg.sender === 'ai' && (
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-red-600 to-orange-500 text-white flex items-center justify-center text-[8px] font-bold">A</div>
                                            <span className="text-xs text-slate-400 font-medium">Anya</span>
                                        </div>
                                    )}
                                    {msg.content && (
                                        <div className={`p-3.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${msg.sender === 'user'
                                            ? 'bg-red-600 text-white rounded-tr-sm'
                                            : 'glass-card text-slate-850 rounded-tl-sm'
                                            }`}>
                                            {msg.content.split(/(\*\*.*?\*\*)/).map((part, i) =>
                                                part.startsWith('**') && part.endsWith('**')
                                                    ? <strong key={i} className={`font-bold ${msg.sender === 'user' ? 'text-white' : 'text-[#1a1a2e]'}`}>{part.slice(2, -2)}</strong>
                                                    : <span key={i}>{part}</span>
                                            )}
                                        </div>
                                    )}
                                    {msg.billData && <SplitBillCard data={msg.billData} />}

                                    {/* Inline Tools (GenUI) */}
                                    {msg.sender === 'ai' && !msg.isResponded && waitingForUser && (
                                        <div className="mt-3 space-y-3">
                                            {/* Quick Replies */}
                                            {msg.quickReplies && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2">
                                                    {msg.quickReplies.map((qr, i) => (
                                                        <button key={i} onClick={() => handleUserReply(qr.label, qr.value)}
                                                            className="glass-pill hover:bg-red-600 text-slate-700 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all hover:shadow-md hover:glow-brand">
                                                            {qr.label}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}

                                            {/* Inline Calendar Picker */}
                                            {msg.showCalendar && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-[320px]">
                                                    <div className="glass-card rounded-2xl overflow-hidden">
                                                        {/* Calendar Header */}
                                                        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-red-600 to-orange-500">
                                                            <button onClick={() => setCalendarMonth(prev => { const d = new Date(prev); d.setMonth(d.getMonth() - 1); return d; })} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"><ChevronLeft size={16} /></button>
                                                            <span className="text-white font-bold text-sm">{calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                                                            <button onClick={() => setCalendarMonth(prev => { const d = new Date(prev); d.setMonth(d.getMonth() + 1); return d; })} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"><ChevronRight size={16} /></button>
                                                        </div>
                                                        {/* Day Labels */}
                                                        <div className="grid grid-cols-7 gap-0 px-2 pt-2">
                                                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                                                <div key={d} className="text-center text-[10px] text-slate-400 font-bold py-1">{d}</div>
                                                            ))}
                                                        </div>
                                                        {/* Calendar Grid */}
                                                        <div className="grid grid-cols-7 gap-0 px-2 pb-2">
                                                            {(() => {
                                                                const year = calendarMonth.getFullYear();
                                                                const month = calendarMonth.getMonth();
                                                                const firstDay = new Date(year, month, 1).getDay();
                                                                const daysInMonth = new Date(year, month + 1, 0).getDate();
                                                                const today = new Date();
                                                                today.setHours(0, 0, 0, 0);
                                                                const cells: React.ReactNode[] = [];
                                                                for (let i = 0; i < firstDay; i++) cells.push(<div key={`empty-${i}`} />);
                                                                for (let day = 1; day <= daysInMonth; day++) {
                                                                    const thisDate = new Date(year, month, day);
                                                                    const isPast = thisDate < today;
                                                                    const isFrom = calendarFromDate && thisDate.getTime() === calendarFromDate.getTime();
                                                                    const isTo = calendarToDate && thisDate.getTime() === calendarToDate.getTime();
                                                                    const isInRange = calendarFromDate && calendarToDate && thisDate > calendarFromDate && thisDate < calendarToDate;
                                                                    cells.push(
                                                                        <button
                                                                            key={day}
                                                                            disabled={isPast}
                                                                            onClick={() => {
                                                                                if (!calendarFromDate || (calendarFromDate && calendarToDate)) {
                                                                                    setCalendarFromDate(thisDate);
                                                                                    setCalendarToDate(null);
                                                                                } else if (thisDate > calendarFromDate) {
                                                                                    setCalendarToDate(thisDate);
                                                                                } else {
                                                                                    setCalendarFromDate(thisDate);
                                                                                    setCalendarToDate(null);
                                                                                }
                                                                            }}
                                                                            className={`w-full aspect-square flex items-center justify-center text-[11px] font-medium rounded-lg transition-all ${isPast ? 'text-slate-400 cursor-not-allowed' :
                                                                                isFrom ? 'bg-red-600 text-white font-bold shadow-md glow-brand' :
                                                                                    isTo ? 'bg-red-600 text-white font-bold shadow-md glow-brand' :
                                                                                        isInRange ? 'bg-red-50 text-red-600' :
                                                                                            'text-slate-700 hover:bg-slate-100 hover:text-red-600 cursor-pointer'
                                                                                }`}
                                                                        >
                                                                            {day}
                                                                        </button>
                                                                    );
                                                                }
                                                                return cells;
                                                            })()}
                                                        </div>
                                                        {/* Selected Range Display */}
                                                        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] text-slate-400 font-bold uppercase">From</span>
                                                                <span className="text-[11px] font-bold text-slate-700">{calendarFromDate ? calendarFromDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span>
                                                            </div>
                                                            <ArrowRight size={12} className="text-slate-300" />
                                                            <div className="flex flex-col">
                                                                <span className="text-[9px] text-slate-400 font-bold uppercase">To</span>
                                                                <span className="text-[11px] font-bold text-slate-700">{calendarToDate ? calendarToDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span>
                                                            </div>
                                                            {calendarFromDate && calendarToDate && (
                                                                <div className="flex flex-col items-end">
                                                                    <span className="text-[9px] text-slate-400 font-bold uppercase">Duration</span>
                                                                    <span className="text-[11px] font-bold text-red-600">{Math.round((calendarToDate.getTime() - calendarFromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} days</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/* Confirm Button */}
                                                        {calendarFromDate && calendarToDate && (
                                                            <div className="px-4 pb-3">
                                                                <button
                                                                    onClick={() => {
                                                                        const pad = (n: number) => n.toString().padStart(2, '0');
                                                                        const fromStr = `${calendarFromDate.getFullYear()}-${pad(calendarFromDate.getMonth() + 1)}-${pad(calendarFromDate.getDate())}`;
                                                                        const toStr = `${calendarToDate.getFullYear()}-${pad(calendarToDate.getMonth() + 1)}-${pad(calendarToDate.getDate())}`;
                                                                        const diffDays = Math.round((calendarToDate.getTime() - calendarFromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                                                                        setCuration(prev => prev ? { ...prev, startDate: fromStr, endDate: toStr } : prev);
                                                                        const fromLabel = calendarFromDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                                                        const toLabel = calendarToDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                                                        handleUserReply(`📅 ${fromLabel} → ${toLabel} (${diffDays} days)`, 'calendar_dates');
                                                                    }}
                                                                    className="w-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
                                                                >
                                                                    <Calendar size={14} />
                                                                    Confirm Dates
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Age Input for Kids */}
                                            {msg.showAgeInput && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-[320px]">
                                                    <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-5">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <Users size={18} className="text-red-500" />
                                                            <h4 className="text-sm font-bold text-slate-900">Enter kids' ages</h4>
                                                        </div>
                                                        <div className="flex gap-4 mb-4">
                                                            {kidAges.map((age, i) => (
                                                                <div key={i} className="flex-1">
                                                                    <label className="text-[10px] text-slate-400 font-bold uppercase mb-1.5 block">Kid {i + 1}</label>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        max="17"
                                                                        placeholder="Age"
                                                                        value={age}
                                                                        onChange={(e) => {
                                                                            const newAges = [...kidAges];
                                                                            newAges[i] = e.target.value;
                                                                            setKidAges(newAges);
                                                                        }}
                                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-red-500 outline-none"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                if (kidAges.every(a => a !== '')) {
                                                                    const agesLabel = kidAges.length === 1 ? `Age: ${kidAges[0]}` : `Ages: ${kidAges.join(', ')}`;
                                                                    handleUserReply(`${kidAges.length === 1 ? 'Child' : 'Kids'} ${agesLabel}`, 'ages_submitted');
                                                                    setKidAges(new Array(childCount).fill(''));
                                                                }
                                                            }}
                                                            disabled={kidAges.some(a => a === '')}
                                                            className="w-full bg-red-600 hover:bg-red-500 disabled:bg-slate-200 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md"
                                                        >
                                                            Confirm Ages
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Passenger Stepper */}
                                            {msg.showPassengerStepper && (
                                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-[320px]">
                                                    <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-5 space-y-4">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Users size={18} className="text-red-600" />
                                                            <h4 className="text-sm font-bold text-slate-900">Travelers</h4>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <p className="text-xs font-bold text-slate-800">Adults</p>
                                                                    <p className="text-[10px] text-slate-400">Ages 18+</p>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <button
                                                                        onClick={() => setAdultCount(prev => Math.max(1, prev - 1))}
                                                                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-red-600 hover:text-red-600 transition-colors"
                                                                    >
                                                                        −
                                                                    </button>
                                                                    <span className="text-sm font-black text-slate-900 min-w-[12px] text-center">{adultCount}</span>
                                                                    <button
                                                                        onClick={() => setAdultCount(prev => prev + 1)}
                                                                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-red-600 hover:text-red-600 transition-colors"
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <p className="text-xs font-bold text-slate-800">Children</p>
                                                                    <p className="text-[10px] text-slate-400">Ages 0-17</p>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <button
                                                                        onClick={() => setChildCount(prev => Math.max(0, prev - 1))}
                                                                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-red-600 hover:text-red-600 transition-colors"
                                                                    >
                                                                        −
                                                                    </button>
                                                                    <span className="text-sm font-black text-slate-900 min-w-[12px] text-center">{childCount}</span>
                                                                    <button
                                                                        onClick={() => setChildCount(prev => prev + 1)}
                                                                        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-red-600 hover:text-red-600 transition-colors"
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() => {
                                                                const total = adultCount + childCount;
                                                                const label = `${adultCount} Adult${adultCount > 1 ? 's' : ''}${childCount > 0 ? `, ${childCount} Child${childCount > 1 ? 'ren' : ''}` : ''}`;
                                                                handleUserReply(label, total.toString());
                                                            }}
                                                            className="w-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md"
                                                        >
                                                            Confirm Travelers
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {/* Typing Indicator */}
                        {(isTyping || isGenerating) && (
                            <div className="flex items-center gap-2 pl-7 mb-4">
                                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-3">
                                    <div className="flex gap-1.5">
                                        <motion.div animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        <motion.div animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        <motion.div animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-500 tracking-tight">{thinkingMessage}</span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                </div>

                {/* Input */}
                <div className="border-t border-slate-200 px-4 pt-3 pb-2 glass-nav shrink-0 relative">
                    {/* Smart Suggestion Chips */}
                    <AnimatePresence>
                        {(() => {
                            const lastMessage = messages[messages.length - 1];
                            const hasQuickReplies = lastMessage?.sender === 'ai' && !lastMessage?.isResponded && !!lastMessage?.quickReplies;

                            return suggestions.length > 0 && waitingForUser && !isGenerating && !hasQuickReplies && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    className="absolute bottom-full left-0 right-0 px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide bg-gradient-to-t from-[#f8f7f4] via-[#f8f7f4]/80 to-transparent pointer-events-auto"
                                >
                                    {suggestions.map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                handleUserReply(suggestion);
                                                setSuggestions([]);
                                            }}
                                            className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full glass-pill text-slate-700 hover:text-red-650 hover:glow-border-brand text-[11px] font-bold shadow-sm transition-all whitespace-nowrap active:scale-95"
                                        >
                                            <Sparkles size={12} className="text-amber-500" />
                                            {suggestion}
                                        </button>
                                    ))}
                                </motion.div>
                            );
                        })()}
                    </AnimatePresence>

                    <div className="flex items-center gap-2">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className={`p-2 rounded-xl border transition-all ${isMuted
                                    ? 'glass-pill text-slate-500'
                                    : 'bg-red-900/30 text-red-400 border-red-800/40'
                                    }`}
                                title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
                            >
                                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                            </button>
                        </div>
                        <div className="flex-1 flex items-center gap-2 glass-input rounded-xl px-3 py-2.5">
                            <input
                                className="flex-1 bg-transparent border-none outline-none text-sm text-[#1a1a2e] placeholder:text-slate-400 disabled:opacity-50"
                                placeholder={isGenerating ? "Anya is thinking..." : (isListening ? "Listening..." : (waitingForUser ? "Pick a reply or type..." : "Watching Anya..."))}
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && chatInput.trim() && !isGenerating) { handleUserReply(chatInput.trim()); setChatInput(''); } }}
                                disabled={isGenerating}
                            />
                            <button
                                onClick={() => {
                                    if (isLiveMode) {
                                        stopListening();
                                    } else {
                                        setIsLiveMode(true);
                                        startListening(true);
                                    }
                                }}
                                className={`p-1.5 rounded-xl transition-all ${isLiveMode ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}
                                title={isLiveMode ? "Disable Hands-free Mode" : "Enable Gemini-style Hands-free Mode"}
                            >
                                <Mic size={18} className={isLiveMode ? 'animate-pulse' : ''} />
                            </button>
                        </div>
                        <button
                            onClick={() => { if (chatInput.trim() && !isGenerating) { handleUserReply(chatInput.trim()); setChatInput(''); } }}
                            className={`p-2.5 rounded-xl text-white transition-colors ${isGenerating || (!chatInput.trim() && !isListening) ? 'bg-slate-300 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500 glow-brand'}`}
                            disabled={isGenerating || (!chatInput.trim() && !isListening)}
                        >
                            <Send size={14} />
                        </button>
                    </div>

                    {/* Gemini Live Visual Orb Indicator */}
                    <AnimatePresence>
                        {isLiveMode && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                                className="absolute -top-16 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none"
                            >
                                <div className="relative">
                                    {/* Multiple layers of pulsing gradients for a premium "Orb" feel */}
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute inset-0 bg-red-400 rounded-full blur-2xl"
                                    />
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                                        className="absolute inset-0 bg-amber-400 rounded-full blur-xl"
                                    />
                                    <div className="relative w-12 h-12 bg-gradient-to-tr from-red-600 to-amber-500 rounded-full shadow-2xl flex items-center justify-center border-2 border-white/20">
                                        <div className="flex gap-1 items-end h-4">
                                            {[0, 1, 2, 3].map(i => (
                                                <motion.div
                                                    key={i}
                                                    animate={{ height: isListening ? [4, 16, 4] : 4 }}
                                                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                                    className="w-1 bg-white rounded-full self-center"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-red-600 bg-white shadow-sm px-3 py-1 rounded-full border border-red-100">Hands-free Live Session</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {/* Powered By Pointlabs */}
                    <div className="flex items-center justify-center gap-1.5 mt-3 transition-opacity">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Powered By</span>
                        <div className="bg-slate-900/90 px-1.5 py-1 rounded-md flex items-center justify-center">
                            <img src="/images/pointlabs.png" className="h-3 w-auto object-contain" alt="Pointlabs" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ─── RIGHT PANEL: Destination Context (Phase 1) OR Itinerary (Phase 2) ─── */}
            <div className={`relative overflow-hidden h-full ${viewMode === 'results-only' ? 'w-full flex items-center justify-center p-4 lg:p-8 bg-transparent' : 'flex-1'} ${isMobile && mobileView !== 'itinerary' ? 'hidden' : 'block'}`}>
                <div className={`${viewMode === 'results-only' ? 'w-full max-w-4xl h-full rounded-2xl lg:rounded-[40px] shadow-2xl glass-card overflow-hidden relative' : 'w-full h-full relative'}`}>
                    {/* Phase 1: Destination Context Card */}
                    <AnimatePresence>
                        {!hasItinerary && (
                            <motion.div
                                key="phase1-context"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-0 bg-transparent flex flex-col"
                            >
                                {/* Top bar: Destination info + progress */}
                                <div className="shrink-0 px-8 pt-6 pb-4 z-10">
                                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                                        <p className="text-slate-500 dark:text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Destination</p>
                                        <h2 className="text-4xl font-black text-[#1a1a2e] dark:text-white">{destName}</h2>
                                        <p className="text-slate-600 dark:text-white/50 text-sm mt-1">{scenarioRoute} • {scenarioDates}</p>
                                    </motion.div>

                                    {/* Anya progress bar */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="mt-4 bg-slate-100/80 dark:bg-white/8 backdrop-blur-xl rounded-xl p-3 border border-slate-200 dark:border-white/10 flex items-center gap-3"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-red-50 dark:bg-red-600/30 flex items-center justify-center shrink-0">
                                            <Sparkles size={16} className="text-red-500 dark:text-red-400 animate-pulse" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[#1a1a2e] dark:text-white font-bold text-xs">{thinkingMessage.replace('Concierge', 'Anya')}</p>
                                            <p className="text-slate-550 dark:text-white/40 text-[10px]">Answer a few questions to personalize your itinerary</p>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }} className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }} className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        </div>
                                    </motion.div>

                                    {/* Trip quick stats */}
                                    <div className="flex gap-3 mt-3">
                                        {[
                                            { label: 'Travelers', value: scenarioTravelers },
                                            { label: 'Duration', value: scenarioDurationCount() },
                                            { label: 'Type', value: scenario === 'executive' ? 'Business' : scenario === 'family' ? 'Family' : scenario === 'bleisure' ? 'Bleisure' : 'Manual' },
                                        ].map((stat, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.7 + i * 0.1 }}
                                                className="bg-slate-100/60 dark:bg-white/6 rounded-lg px-3 py-2 border border-slate-200 dark:border-white/8"
                                            >
                                                <p className="text-slate-500 dark:text-white/30 text-[8px] font-bold uppercase tracking-widest">{stat.label}</p>
                                                <p className="text-[#1a1a2e] dark:text-white text-[11px] font-bold mt-0.5">{stat.value}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Animated Attractions Montage */}
                                <div className="flex-1 relative px-6 pb-6 overflow-hidden">
                                    <div className="w-full h-full" style={{ display: 'grid', gridTemplateRows: 'repeat(4, 1fr)', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', perspective: '1000px' }}>
                                        {montageAttractions.map((attraction, i) => {
                                            const tile = montageLayouts[i];
                                            return (
                                                <motion.div
                                                    key={`montage-${i}`}
                                                    initial={{
                                                        opacity: 0,
                                                        x: tile.fromX,
                                                        y: tile.fromY,
                                                        rotate: tile.rotate,
                                                        scale: 2.5,
                                                        z: 600,
                                                        rotateX: 45,
                                                        rotateY: -45
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        x: 0,
                                                        y: 0,
                                                        rotate: 0,
                                                        scale: 1,
                                                        z: 0,
                                                        rotateX: 0,
                                                        rotateY: 0
                                                    }}
                                                    transition={{
                                                        delay: tile.delay,
                                                        type: 'spring', damping: 20, stiffness: 80,
                                                    }}
                                                    style={{ gridRow: tile.row, gridColumn: tile.col }}
                                                    className="relative rounded-2xl overflow-hidden bg-slate-900 shadow-2xl border border-white/10 group flex flex-col justify-end"
                                                >
                                                    <div className="absolute inset-0 z-0">
                                                        <motion.img
                                                            src={attraction.imageUrl}
                                                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                                                            alt={attraction.name}
                                                            animate={{ scale: [1, 1.05, 1] }}
                                                            transition={{ duration: 10 + i * 2, repeat: Infinity, ease: 'linear' }}
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
                                                    </div>

                                                    <div className="relative z-10 p-3 md:p-4 w-full">
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: tile.delay + 0.4 }}
                                                        >
                                                            <div className="flex items-center gap-2 mb-1.5">
                                                                <span className="bg-red-500/20 text-red-300 text-[9px] font-bold uppercase px-2 py-0.5 rounded backdrop-blur-md border border-red-500/30">
                                                                    {attraction.category}
                                                                </span>
                                                                <motion.span
                                                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                                    className="text-white/60 text-[9px] flex items-center gap-1 font-medium"
                                                                >
                                                                    <RefreshCw size={10} className="animate-spin" /> Analyzing
                                                                </motion.span>
                                                            </div>
                                                            <h3 className="text-white font-bold text-xs md:text-sm leading-tight drop-shadow-md">{attraction.name}</h3>
                                                        </motion.div>
                                                    </div>

                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/50 via-transparent to-transparent z-10" />
                                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-slate-950/30 via-transparent to-transparent z-10" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Phase 2: Itinerary Panel */}
                    <AnimatePresence>
                        {hasItinerary && (
                            <motion.div
                                key="itinerary-panel"
                                initial={viewMode === 'results-only' ? { opacity: 0, scale: 0.95 } : { x: isMobile ? 0 : 300, opacity: 0 }}
                                animate={viewMode === 'results-only' ? { opacity: 1, scale: 1 } : { x: 0, opacity: 1 }}
                                exit={viewMode === 'results-only' ? { opacity: 0, scale: 0.95 } : { x: 300, opacity: 0 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="absolute inset-0 flex flex-col glass-sidebar overflow-hidden"
                            >
                                {/* Itinerary Header */}
                                <div className={`shrink-0 glass-nav border-b border-white/10 ${isMobile ? 'p-3 px-4' : 'p-4 px-6'}`}>
                                    {/* Title & Price Row */}
                                    <div className="flex items-center justify-between gap-3 mb-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            {viewMode === 'results-only' && (
                                                <button
                                                    onClick={() => onOpenManual()}
                                                    className="p-1 -ml-1 text-slate-400 hover:text-red-500 transition-colors"
                                                >
                                                    <ChevronLeft size={isMobile ? 18 : 20} />
                                                </button>
                                            )}
                                            <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-black text-[#1a1a2e] dark:text-white uppercase tracking-tight truncate`}>
                                                {viewMode === 'results-only' ? (initialCuration?.tripName || 'Your Itinerary') : scenarioLabel}
                                            </h2>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {viewMode === 'results-only' && isMobile && (
                                                <button
                                                    onClick={() => window.location.reload()}
                                                    className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                                >
                                                    <X size={18} />
                                                </button>
                                            )}
                                            {!isMobile && bookedCount > 0 && (
                                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-900/20 px-2.5 py-1 rounded-full border border-emerald-800">
                                                    {bookedCount}/{itinerary.length} booked
                                                </span>
                                            )}
                                            <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-black text-[#1a1a2e] dark:text-white`}>
                                                <span className="text-[10px] text-slate-500 font-bold mr-1">INR</span>
                                                {totalCost.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Meta Info Row: Compact on Mobile */}
                                    <div className={`flex items-center gap-2 ${isMobile ? 'overflow-x-auto scrollbar-hide mb-3' : 'mt-2 text-sm text-slate-600 font-medium'}`}>
                                        {[
                                            { icon: MapPin, text: scenarioRoute },
                                            { icon: Calendar, text: scenarioDates },
                                            { icon: Users, text: scenarioTravelers }
                                        ].map((item, i) => (
                                            <div key={i} className={`flex items-center gap-1.5 whitespace-nowrap ${isMobile ? 'glass-pill py-1 px-2.5 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-300' : 'text-slate-650 dark:text-slate-400'}`}>
                                                <item.icon size={isMobile ? 12 : 14} className={isMobile ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'} />
                                                {item.text}
                                                {!isMobile && i < 2 && <span className="ml-1 text-slate-400 dark:text-slate-600">•</span>}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Tabs Row */}
                                    <div className={`flex items-center justify-between ${isMobile ? 'gap-2' : 'mt-4 pt-4 border-t border-white/10'}`}>
                                        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1 flex-1">
                                            {(['Itinerary', 'Map', 'Essentials'] as const).map(tab => (
                                                <button
                                                    key={tab}
                                                    onClick={() => setActiveTab(tab)}
                                                    className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${activeTab === tab
                                                        ? 'glass-pill-active text-red-700 dark:text-white shadow-md font-black'
                                                        : 'glass-pill text-slate-600 dark:text-slate-400 hover:text-[#1a1a2e] dark:hover:text-white'
                                                        }`}
                                                >
                                                    {tab === 'Map' ? '🗺 Map' : tab}
                                                </button>
                                            ))}
                                        </div>
                                        {isMobile && bookedCount > 0 && (
                                            <span className="text-[9px] font-black text-emerald-400 glass-pill px-2 py-1 rounded-lg uppercase tracking-wider">
                                                {bookedCount}/{itinerary.length} Booked
                                            </span>
                                        )}
                                        {viewMode === 'results-only' && !isMobile && (
                                            <button
                                                onClick={() => window.location.reload()}
                                                className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                            >
                                                <X size={20} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Sub-tabs for Itinerary */}
                                    <AnimatePresence>
                                        {activeTab === 'Itinerary' && sortedGroups.length > 0 && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 mt-2 border-t border-white/5">
                                                    {sortedGroups.map(group => (
                                                        <button
                                                            key={group}
                                                            onClick={() => setSelectedGroup(group)}
                                                            className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${(!selectedGroup ? group === sortedGroups[0] : selectedGroup === group)
                                                                ? 'glass-pill-active text-red-700 dark:text-red-400'
                                                                : 'glass-pill text-slate-600 dark:text-slate-400 hover:text-[#1a1a2e] dark:hover:text-white'
                                                                }`}
                                                        >
                                                            {formatDayWithDate(group)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Itinerary Items */}
                                <div className="flex-1 overflow-y-auto p-[0.6rem] px-6 scrollbar-hide bg-transparent">
                                    {activeTab === 'Map' ? (
                                        /* ── Real Mapbox interactive map ── */
                                        <div className="w-full" style={{ height: '520px' }}>
                                            <ItineraryMapComponent
                                                itinerary={itineraryDays}
                                                destinationName={destName}
                                            />
                                        </div>
                                    ) : showMap ? (
                                        <div className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden relative shadow-inner border border-slate-200 bg-slate-100 mb-8">
                                            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1600" className="w-full h-full object-cover grayscale opacity-80" alt="Map View" />

                                            <div className="absolute top-1/3 left-1/3 bg-red-600 text-white p-2.5 rounded-full shadow-xl shadow-red-500/30 transform hover:scale-110 transition-transform cursor-pointer group">
                                                <HotelIcon size={16} />
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-10">Accommodation</div>
                                            </div>
                                            <div className="absolute top-1/2 left-1/2 bg-red-600 text-white p-2.5 rounded-full shadow-xl shadow-red-500/30 transform hover:scale-110 transition-transform cursor-pointer group">
                                                <Camera size={16} />
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-10">Experiences</div>
                                            </div>
                                            <div className="absolute top-1/4 right-1/3 bg-blue-600 text-white p-2.5 rounded-full shadow-xl shadow-blue-500/30 transform hover:scale-110 transition-transform cursor-pointer group">
                                                <Plane size={16} />
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-10">Airport</div>
                                            </div>

                                            <div className="absolute bottom-6 left-6 right-6 glass-card rounded-2xl p-4 shadow-xl flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-[#1a1a2e] dark:text-white">Interactive Map</p>
                                                    <p className="text-xs text-slate-500">{itinerary.length} items spread across {destName}</p>
                                                </div>
                                                <button onClick={() => setShowMap(false)} className="glass-button text-white px-4 py-2 rounded-xl text-xs font-bold transition active:scale-95">View List</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {activeTab === 'Itinerary' && (
                                                <>
                                                    {/* Trip-wide Summary */}
                                                    <TripSummaryHeader summary={tripMeta.tripSummary} destination={destName} />

                                                    <AnimatePresence mode="wait">
                                                        {sortedGroups.filter(g => g === (selectedGroup || sortedGroups[0])).map((dayLabel, groupIdx) => {
                                                            const dayDesc = dayDescriptions.find(d => d.dayGroup === dayLabel);

                                                            return (
                                                                <motion.div key={dayLabel} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="mb-6">
                                                                    <h3 className="text-sm font-black text-[#1a1a2e] dark:text-white flex items-center gap-2 mb-4">
                                                                        {dayLabel === 'Trip Overview' ? <Briefcase size={16} className="text-slate-400" /> : <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                                                                        {formatDayWithDate(dayLabel)}
                                                                        {dayDesc && <span className="text-slate-500 font-medium ml-1">• {dayDesc.theme}</span>}
                                                                    </h3>

                                                                    {/* Rich Day Description Card */}
                                                                    {dayDesc && <DayContextCard description={dayDesc} />}

                                                                    <div className="space-y-4">
                                                                        {groupedItinerary[dayLabel].length === 0 ? (
                                                                            <div className="text-center py-6 glass-card rounded-2xl border border-dashed border-white/20">
                                                                                <p className="text-slate-500 text-sm font-medium">No plans yet for this day.</p>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        const activityAlts = scenario === 'executive' ? LONDON_ALT_ACTIVITIES : (scenario === 'family' ? ITALY_ACTIVITIES : (scenario === 'bleisure' ? FRANKFURT_ALT_ACTIVITIES : (scenario === 'paris' ? PARIS_ACTIVITIES : (curation?.destination?.activities || []))));
                                                                                        const virtualItem: ItineraryItem = {
                                                                                            id: `virtual-${Date.now()}`,
                                                                                            type: 'activity',
                                                                                            title: 'New Experience',
                                                                                            subtitle: `Suggested for ${dayLabel}`,
                                                                                            price: 0,
                                                                                            dayGroup: dayLabel,
                                                                                            activityRef: activityAlts[0]
                                                                                        };
                                                                                        setBookingTarget({ type: 'activity', itemId: virtualItem.id, virtualItem });
                                                                                        setActiveActivityAlternatives(activityAlts);
                                                                                        setInitialBookingStep('search');
                                                                                        setDrawerOpen(true);
                                                                                    }}
                                                                                    className="mt-3 glass-pill-active text-red-400 px-4 py-2 rounded-xl text-xs font-bold hover:text-white transition"
                                                                                >
                                                                                    + Add Experience
                                                                                </button>
                                                                            </div>
                                                                        ) : groupedItinerary[dayLabel].map((item, idx) => {
                                                                            // Build alternatives for this item
                                                                            const isReturn = item.id.includes('ret') || item.id === 'bf2';
                                                                            const alts = item.type === 'flight'
                                                                                ? (item.flightAlternatives?.length ? item.flightAlternatives : (scenario === 'executive' ? LONDON_ALT_FLIGHTS : (scenario === 'family' ? (isReturn ? FLIGHTS_TO_ABU_DHABI : FLIGHTS_TO_ITALY) : (scenario === 'bleisure' ? (isReturn ? FRANKFURT_RETURN_FLIGHTS : FRANKFURT_ALT_FLIGHTS) : (scenario === 'paris' ? FLIGHTS_TO_PARIS : (curation?.destination?.flights || []))))))
                                                                                : item.type === 'hotel'
                                                                                    ? (item.hotelAlternatives?.length ? item.hotelAlternatives : (scenario === 'executive' ? LONDON_ALT_HOTELS : (scenario === 'family' ? ITALY_HOTELS : (scenario === 'bleisure' ? FRANKFURT_HOTELS : (scenario === 'paris' ? PARIS_HOTELS : (curation?.destination?.hotels || []))))))
                                                                                    : item.type === 'activity'
                                                                                        ? (item.activityAlternatives?.length ? item.activityAlternatives : (scenario === 'executive' ? LONDON_ALT_ACTIVITIES : (scenario === 'family' ? ITALY_ACTIVITIES : (scenario === 'bleisure' ? FRANKFURT_ALT_ACTIVITIES : (scenario === 'paris' ? PARIS_ACTIVITIES : (curation?.destination?.activities || []))))))
                                                                                        : [];
                                                                            const hasAlts = alts.length > 0 && !item.booked;


                                                                            // Parse subtitle parts
                                                                            const subtitleParts = item.subtitle.split(' • ');

                                                                            // ── Category-specific card content ──
                                                                            const renderCardContent = () => {
                                                                                // ─── FLIGHT CARD (horizontal booking-site style) ───
                                                                                if (item.type === 'flight') {
                                                                                    const flight = item.flightRef;
                                                                                    
                                                                                    // 1. DATA MAPPING (Prioritize structured flightRef like in Explore Alternatives)
                                                                                    // Extract times
                                                                                    let depTime = flight?.departureTime || '';
                                                                                    let arrTime = flight?.arrivalTime || '';
                                                                                    
                                                                                    // Extract route
                                                                                    let origin = flight?.originIata || '';
                                                                                    let dest = flight?.destinationIata || '';
                                                                                    
                                                                                    // Duration & Stops
                                                                                    let duration = flight?.duration || '';
                                                                                    
                                                                                    // FALLBACK: Parsing logic for cases where flightRef is missing or incomplete
                                                                                    let displayOrigin = origin;
                                                                                    let displayDest = dest;
                                                                                    let displayDepTime = depTime;
                                                                                    let displayArrTime = arrTime;
                                                                                    let displayDuration = duration;
                                                                                    let displayDate = '';
                                                                                    let foundTimes: string[] = [];

                                                                                    subtitleParts.forEach(part => {
                                                                                        const p = part.trim();
                                                                                        // Route parsing: Handle "→", "->", and " TO "
                                                                                        if (p.includes('→') || p.includes('->') || p.toUpperCase().includes(' TO ')) {
                                                                                            const pts = p.split(/[→\->]|\sTO\s/i).map(s => s.trim());
                                                                                            if (!displayOrigin) displayOrigin = pts[0];
                                                                                            if (!displayDest) displayDest = pts[1];
                                                                                        } 
                                                                                        // Time parsing
                                                                                        else if (p.includes(':')) {
                                                                                            const matches = p.match(/\d{1,2}:\d{2}(?:\s?[AP]M)?/gi);
                                                                                            if (matches) foundTimes.push(...matches);
                                                                                        } 
                                                                                        // Duration parsing
                                                                                        else if (/\d+\s*[hm]/i.test(p)) {
                                                                                            if (!displayDuration) displayDuration = p;
                                                                                        }
                                                                                        // Date parsing: e.g. "Mon, Mar 2"
                                                                                        else if (p.includes(',') && !p.includes(':')) {
                                                                                            if (!displayDate) displayDate = p;
                                                                                        }
                                                                                    });

                                                                                    // Assign found times correctly
                                                                                    if (foundTimes.length >= 2) {
                                                                                        if (!displayDepTime) displayDepTime = foundTimes[0];
                                                                                        if (!displayArrTime) displayArrTime = foundTimes[1];
                                                                                    } else if (foundTimes.length === 1) {
                                                                                        if (!displayDepTime) displayDepTime = foundTimes[0];
                                                                                        else if (!displayArrTime) displayArrTime = foundTimes[0];
                                                                                    }

                                                                                    // Airline Name Logic: Prioritize structured airline, then try to find it in subtitle
                                                                                    let airlineName = flight?.airline || '';
                                                                                    if (!airlineName) {
                                                                                        // If title is a route, try to find airline in subtitle
                                                                                        const isTitleRoute = item.title.includes('→') || item.title.includes('->') || item.title.toUpperCase().includes(' TO ');
                                                                                        if (isTitleRoute) {
                                                                                            const potentialAirline = subtitleParts.find(p => 
                                                                                                !p.includes(':') && 
                                                                                                !/\d+\s*[hm]/i.test(p) && 
                                                                                                !p.includes('→') && 
                                                                                                !p.includes('->') && 
                                                                                                !p.toUpperCase().includes(' TO ')
                                                                                            );
                                                                                            airlineName = potentialAirline || 'Airline';
                                                                                        } else {
                                                                                            airlineName = item.title;
                                                                                        }
                                                                                    }
                                                                                    const airlineLogo = flight?.airlineLogo || item.image || '';

                                                                                    const isDirect = displayDuration.toLowerCase().includes('direct') || displayDuration.toLowerCase().includes('non-stop') || (parseFloat(displayDuration) > 0 && parseFloat(displayDuration) < 5);
                                                                                    
                                                                                    // Final Cleanup for display
                                                                                    const finalDepTime = displayDepTime.split(' ')[0] || '—';
                                                                                    const finalArrTime = displayArrTime.split(' ')[0] || '—';
                                                                                    
                                                                                    // Extract IATA codes from strings like "Dubai (DXB)" or just "DXB"
                                                                                    const extractIata = (str: string) => {
                                                                                        const match = str.match(/\(([A-Z]{3})\)/);
                                                                                        if (match) return match[1];
                                                                                        if (str.length === 3 && /^[A-Z]{3}$/.test(str)) return str;
                                                                                        // Try to extract first 3 letters if it looks like a city name but no code found
                                                                                        return str.slice(0, 3).toUpperCase();
                                                                                    };

                                                                                    const finalOrigin = extractIata(displayOrigin) || '—';
                                                                                    const finalDest = extractIata(displayDest) || '—';
                                                                                    
                                                                                    const originName = displayOrigin.split('(')[0].trim() || finalOrigin;
                                                                                    const destName = displayDest.split('(')[0].trim() || finalDest;

                                                                                    return (
                                                                                        <div className="bg-white dark:bg-slate-900 rounded-[28px] border-2 border-slate-50 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all">
                                                                                            <div className="flex items-stretch gap-0">
                                                                                                {/* Main Info */}
                                                                                                <div className="flex-1 p-6 flex items-center justify-between">
                                                                                                    {/* Airline */}
                                                                                                    <div className="flex flex-col gap-3 w-32">
                                                                                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white p-2.5 shadow-inner">
                                                                                                            <SafeImage src={airlineLogo} alt={airlineName} className="w-full h-full object-contain" category="flight" />
                                                                                                        </div>
                                                                                                        <div>
                                                                                                            <p className="text-base font-black text-slate-900 dark:text-white leading-tight">{airlineName}</p>
                                                                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{flight?.id || 'FLIGHT'}</p>
                                                                                                        </div>
                                                                                                    </div>

                                                                                                    {/* Connection Visualization */}
                                                                                                    <div className="flex-1 flex items-center justify-center gap-6 px-4">
                                                                                                        <div className="text-right">
                                                                                                            <p className="text-2xl font-black text-slate-900 dark:text-white">{finalDepTime}</p>
                                                                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{finalOrigin}</p>
                                                                                                        </div>

                                                                                                        <div className="flex-1 max-w-[140px] flex flex-col items-center gap-2">
                                                                                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{displayDuration || '—'}</span>
                                                                                                            <div className="relative w-full h-px bg-slate-100 dark:bg-slate-800">
                                                                                                                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                                                                                                                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                                                                                                                <Plane size={14} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500/30 rotate-90" />
                                                                                                            </div>
                                                                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${isDirect ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                                                                                {isDirect ? 'Non-stop' : '1 Stop'}
                                                                                                            </span>
                                                                                                        </div>

                                                                                                        <div className="text-left">
                                                                                                            <p className="text-2xl font-black text-slate-900 dark:text-white">{finalArrTime}</p>
                                                                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{finalDest}</p>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* Price Sidebar */}
                                                                                                <div className={`w-40 flex flex-col justify-center items-center p-6 border-l border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20`}>
                                                                                                    <div className="text-center mb-2">
                                                                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Per Adult</span>
                                                                                                        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">INR {item.price.toLocaleString()}</p>
                                                                                                    </div>
                                                                                                    <div className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${item.booked ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                                                                        {item.booked ? 'Confirmed' : 'Available'}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>

                                                                                            {/* Bottom Info Bar */}
                                                                                            <div className="flex items-center gap-6 px-6 py-3 bg-slate-50/30 dark:bg-slate-800/20 border-t border-slate-50 dark:border-slate-800/50">
                                                                                                <div className="flex items-center gap-1.5">
                                                                                                    <Zap size={11} className="text-amber-500" />
                                                                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Extra Legroom</span>
                                                                                                </div>
                                                                                                <div className="flex items-center gap-1.5">
                                                                                                    <Check size={11} className="text-emerald-500" />
                                                                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Free Cancellation</span>
                                                                                                </div>
                                                                                                <div className="flex items-center gap-1.5">
                                                                                                    <Tag size={11} className="text-red-500" />
                                                                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Verified Fare</span>
                                                                                                </div>
                                                                                                {item.billingType === 'business' && (
                                                                                                    <div className="ml-auto">
                                                                                                        <span className="text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider bg-blue-100 text-blue-700">
                                                                                                            Business
                                                                                                        </span>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                }

                                                                                // ─── HOTEL CARD (booking-site style) ───
                                                                                if (item.type === 'hotel') {
                                                                                    return (
                                                                                        <div className="space-y-3">
                                                                                            <div className="flex items-center justify-between">
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <HotelIcon size={12} className="text-slate-500 dark:text-slate-400" />
                                                                                                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Hotel</span>
                                                                                                </div>
                                                                                                {renderBadge()}
                                                                                            </div>
                                                                                            <div className="flex gap-4">
                                                                                                <div className="relative w-28 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                                                                                                    <SafeImage src={item.image} category="hotel" alt="" className="w-full h-full object-cover" />
                                                                                                    <button className="absolute top-1.5 left-1.5 w-5 h-5 bg-white/80 backdrop-blur rounded flex items-center justify-center text-slate-500 hover:text-slate-700 transition">
                                                                                                        <MapPin size={11} />
                                                                                                    </button>
                                                                                                </div>
                                                                                                <div className="flex-1 min-w-0 flex flex-col justify-between">
                                                                                                    <div>
                                                                                                        <div className="flex items-start justify-between gap-2">
                                                                                                            <h4 className="text-base font-bold text-slate-900 leading-tight line-clamp-1">{item.title}</h4>
                                                                                                        </div>
                                                                                                        <div className="flex items-center gap-1.5 mt-1">
                                                                                                            <MapPin size={11} className="text-slate-400" />
                                                                                                            <span className="text-xs text-slate-500 font-medium truncate">{item.subtitle.split(' • ')[1] || 'Exquisite Property'}</span>
                                                                                                        </div>
                                                                                                        <div className="flex items-center gap-0.5 mt-1.5">
                                                                                                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={11} className="text-amber-400 fill-amber-400" />)}
                                                                                                            <span className="text-[10px] text-slate-500 font-bold ml-1.5 uppercase tracking-wide">Premium Stay</span>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                    <div className="flex items-end justify-between mt-1">
                                                                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Selected Property</p>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                }

                                                                                // ─── ACTIVITY / TRANSFER CARD ───
                                                                                if (item.type === 'activity' || item.type === 'transfer') {
                                                                                    return (
                                                                                        <div className="space-y-3">
                                                                                            <div className="flex items-center justify-between">
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <Camera size={12} className="text-slate-500 dark:text-slate-400" />
                                                                                                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{item.type === 'activity' ? 'Experience' : 'Transfer'}</span>
                                                                                                </div>
                                                                                                {renderBadge()}
                                                                                            </div>
                                                                                            <div className="flex gap-4">
                                                                                                <div className="w-28 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                                                                                                    <SafeImage src={item.image} category="activity" alt="" className="w-full h-full object-cover" />
                                                                                                </div>
                                                                                                <div className="flex-1 min-w-0">
                                                                                                    <div className="flex items-start justify-between gap-2">
                                                                                                        <h4 className="text-base font-bold text-slate-900 leading-tight">{item.title}</h4>
                                                                                                    </div>
                                                                                                    <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed line-clamp-2">{item.subtitle}</p>
                                                                                                    <div className="flex items-center gap-1.5 mt-2">
                                                                                                        <MapPin size={10} className="text-slate-400" />
                                                                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Prime Location</span>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                }

                                                                                // ─── ESSENTIALS CARD ───
                                                                                return (
                                                                                    <div className="space-y-3">
                                                                                        <div className="flex items-center justify-between">
                                                                                            <div className="flex items-center gap-2">
                                                                                                <Shield size={12} className="text-slate-400" />
                                                                                                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Essentials</span>
                                                                                            </div>
                                                                                            {renderBadge()}
                                                                                        </div>
                                                                                        <div className="flex gap-4">
                                                                                            <div className="w-28 h-24 rounded-xl bg-red-50 flex items-center justify-center shrink-0 border border-red-100 shadow-sm">
                                                                                                <Shield size={24} className="text-red-500" />
                                                                                            </div>
                                                                                            <div className="flex-1 min-w-0 py-0.5">
                                                                                                <h4 className="text-base font-bold text-slate-900 leading-tight">{item.title}</h4>
                                                                                                <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">{item.subtitle}</p>
                                                                                                <div className="flex items-center gap-1.5 mt-2.5">
                                                                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mandatory</span>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            };

                                                                            // Badge renderer
                                                                            const renderBadge = () => {
                                                                                if (item.booked) {
                                                                                    return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-600 shrink-0"><CheckCircle2 size={14} /> Booked</span>;
                                                                                }
                                                                                if (item.badge) {
                                                                                    return (
                                                                                        <span className={`px-3 py-1 rounded-full text-sm font-bold shrink-0
                                                        ${item.verified ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                                                                                                item.badge === 'Weekend' ? 'bg-purple-50 text-purple-600 border border-purple-200' :
                                                                                                    item.billingType === 'business' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                                                                                                        item.billingType === 'personal' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                                                                                                            'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                                                                                            {item.badge}
                                                                                        </span>
                                                                                    );
                                                                                }
                                                                                return null;
                                                                            };

                                                                            return (
                                                                                <motion.div
                                                                                    key={item.id}
                                                                                    initial={{ opacity: 0, y: 20 }}
                                                                                    animate={{ opacity: 1, y: 0 }}
                                                                                    transition={{ delay: idx * 0.08 }}
                                                                                    className="space-y-0"
                                                                                >
                                                                                    {/* Main card */}
                                                                                    {item.id.startsWith('bc') ? (
                                                                                        <div className="py-2 px-1">
                                                                                            <p className="text-sm font-medium text-slate-600 italic flex items-center gap-2">
                                                                                                <Briefcase size={14} className="text-slate-400" />
                                                                                                {item.title} — {item.subtitle.split(' • ')[1] || 'All Day'}
                                                                                            </p>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div
                                                                                            onClick={() => !item.booked && item.price > 0 && handleBookItem(item, 'details', alts)}
                                                                                            className={`rounded-2xl border transition-all group overflow-hidden shadow-md
                                                                                        ${item.booked ? 'bg-emerald-50/50 border-emerald-200 cursor-default shadow-sm' : (item.price === 0 ? 'bg-slate-50 border-slate-100 cursor-default' : 'bg-white border-slate-200 hover:border-red-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer')}
                                                                                        ${item.billingType === 'business' ? 'border-l-4 border-l-blue-500' : item.billingType === 'personal' ? 'border-l-4 border-l-emerald-500' : ''}`}
                                                                                        >
                                                                                            <div className="p-5">
                                                                                                {renderCardContent()}
                                                                                            </div>

                                                                                            {/* Footer: Price (for non-flight/hotel) + Actions */}
                                                                                            {(item.price > 0 || item.type === 'activity') && (
                                                                                                <div className={`flex items-center justify-between px-5 py-3 border-t ${item.booked ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-100 bg-slate-50/50'}`}>
                                                                                                    <div className="flex items-center gap-3 w-1/2">
                                                                                                        {item.type !== 'hotel' && item.type !== 'flight' && item.price > 0 && (
                                                                                                            <p className="text-base font-bold text-slate-900 shrink-0">INR {item.price.toLocaleString()}</p>
                                                                                                        )}
                                                                                                        {item.type === 'hotel' && (
                                                                                                            <p className="text-base font-bold text-slate-900 shrink-0">INR {item.price.toLocaleString()} <span className="text-xs text-slate-400 font-medium">total incl. taxes</span></p>
                                                                                                        )}
                                                                                                        {(item.type === 'activity' || item.type === 'essentials') && (
                                                                                                            <button
                                                                                                                onClick={(e) => {
                                                                                                                    e.stopPropagation();
                                                                                                                    setItinerary(prev => prev.filter(it => it.id !== item.id));
                                                                                                                }}
                                                                                                                className="text-[11px] text-slate-400 hover:text-red-600 font-bold underline transition-colors"
                                                                                                            >
                                                                                                                Remove
                                                                                                            </button>
                                                                                                        )}
                                                                                                    </div>
                                                                                                    <div className="flex items-center justify-end gap-2 w-1/2">
                                                                                                        {hasAlts && item.price > 0 && (
                                                                                                            <button
                                                                                                                onClick={(e) => { e.stopPropagation(); handleBookItem(item, 'search', alts); }}
                                                                                                                className="text-xs text-red-600 font-black flex items-center gap-1.5 transition-all px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 shadow-sm hover:shadow active:scale-95 group"
                                                                                                            >
                                                                                                                <RefreshCw size={12} className="group-hover:rotate-180 transition-transform duration-500" /> Explore alternatives
                                                                                                            </button>
                                                                                                        )}
                                                                                                        {!item.booked && item.price > 0 && (
                                                                                                            <button
                                                                                                                onClick={(e) => { e.stopPropagation(); handleBookItem(item, 'details', alts); }}
                                                                                                                className="text-xs text-white font-bold flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                                                                                                            >
                                                                                                                {item.type === 'flight' ? 'Book Flight' : item.type === 'hotel' ? 'Book Hotel' : 'Book now'} <ArrowRight size={13} />
                                                                                                            </button>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    )}

                                                                                    {/* Existing itinerary items closing logic */}
                                                                                </motion.div>
                                                                            );
                                                                        })}
                                                                    </div>

                                                                    {dayLabel !== 'Trip Essentials' && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                const activityAlts = scenario === 'executive' ? LONDON_ALT_ACTIVITIES : (scenario === 'family' ? ITALY_ACTIVITIES : (scenario === 'bleisure' ? FRANKFURT_ALT_ACTIVITIES : (scenario === 'paris' ? PARIS_ACTIVITIES : (curation?.destination?.activities || []))));
                                                                                const virtualItem: ItineraryItem = {
                                                                                    id: `virtual-${Date.now()}`,
                                                                                    type: 'activity',
                                                                                    title: 'New Experience',
                                                                                    subtitle: `Suggested for ${dayLabel}`,
                                                                                    price: 0,
                                                                                    dayGroup: dayLabel,
                                                                                    activityRef: activityAlts[0]
                                                                                };
                                                                                setBookingTarget({ type: 'activity', itemId: virtualItem.id, virtualItem });
                                                                                setActiveActivityAlternatives(activityAlts);
                                                                                setInitialBookingStep('search');
                                                                                setDrawerOpen(true);
                                                                            }}
                                                                            className="w-full mt-3 py-3 rounded-xl border-2 border-dashed border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-300 hover:bg-red-50 flex items-center justify-center gap-2 font-bold transition-all hover:shadow-md"
                                                                        >
                                                                            <Plus size={16} /> Add Experience
                                                                        </button>
                                                                    )}

                                                                </motion.div>
                                                            );
                                                        })}
                                                    </AnimatePresence>

                                                    {/* Advance Booking Advisor */}
                                                    <AdvanceBookingAdvisor items={tripMeta.advanceBookItems} />
                                                </>
                                            )}

                                            {activeTab === 'Essentials' && (
                                                <div className="space-y-4 pb-24"> {/* Extra padding for sticky footer */}
                                                    {itinerary.filter(it => it.type === 'essentials' && it.booked).length > 0 && (
                                                        <div className="mb-8">
                                                            <div className="flex items-center justify-between mb-4">
                                                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                                    <ShieldCheck size={16} className="text-emerald-500" /> Booked Services
                                                                </h3>
                                                            </div>
                                                            <div className="space-y-4">
                                                                {itinerary.filter(it => it.type === 'essentials' && it.booked).map(item => (
                                                                    <div key={item.id} className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-5 flex items-center justify-between">
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="w-14 h-14 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                                                                <ShieldCheck size={24} />
                                                                            </div>
                                                                            <div>
                                                                                <div className="flex items-center gap-2">
                                                                                    <h4 className="font-bold text-slate-900 text-lg">{item.title}</h4>
                                                                                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-600"><CheckCircle2 size={10} /> BOOKED</span>
                                                                                </div>
                                                                                <p className="text-sm text-slate-500 font-medium">{item.subtitle}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <p className="text-xl font-black text-slate-900">INR {item.price.toLocaleString()}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="mt-8 pt-4 border-t border-slate-100" />
                                                        </div>
                                                    )}

                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Available Services</h3>
                                                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                                            {ESSENTIALS_CATALOG.length} OPTIONS
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-4">
                                                        {ESSENTIALS_CATALOG.map((essential) => {
                                                            const inCart = essentialsCart.some(i => i.id === essential.id);
                                                            return (
                                                                <div key={essential.id}
                                                                    className={`bg-white rounded-2xl p-5 border transition-all flex items-center justify-between cursor-pointer group shadow-md hover:shadow-xl hover:-translate-y-0.5 ${inCart ? 'border-red-500 bg-red-50/10 shadow-red-500/10' : 'border-slate-100 hover:border-red-200'}`}
                                                                    onClick={() => toggleCartItem(essential)}
                                                                >
                                                                    <div className="flex items-center gap-4">
                                                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${inCart ? 'bg-red-600 text-white' : 'bg-slate-50 text-slate-500 group-hover:bg-red-50 group-hover:text-red-600'}`}>
                                                                            <Shield size={24} />
                                                                        </div>
                                                                        <div>
                                                                            <div className="flex items-center gap-2">
                                                                                <h4 className="font-bold text-slate-900 text-lg">{essential.title}</h4>
                                                                                {inCart && <CheckCircle2 size={16} className="text-red-600 animate-in zoom-in" />}
                                                                            </div>
                                                                            <p className="text-sm text-slate-500 font-medium">{essential.description}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right shrink-0">
                                                                        <p className="text-xl font-black text-slate-900">INR {essential.price}</p>
                                                                        <button className={`mt-2 text-xs font-bold px-4 py-1.5 rounded-lg transition-all ${inCart ? 'bg-slate-900 text-white' : 'text-red-600 border border-red-100 hover:bg-red-600 hover:text-white'}`}>
                                                                            {inCart ? 'Remove' : 'Add'}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Sticky Cart Summary Bar */}
                                                    <AnimatePresence>
                                                        {essentialsCart.length > 0 && (
                                                            <motion.div
                                                                initial={{ y: 50, opacity: 0, x: '-50%' }}
                                                                animate={{ y: 0, opacity: 1, x: '-50%' }}
                                                                exit={{ y: 50, opacity: 0, x: '-50%' }}
                                                                className="absolute bottom-8 left-1/2 w-[90%] max-w-md bg-slate-900 text-white rounded-[24px] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-50 flex items-center justify-between border border-slate-800"
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className="bg-red-600 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black">
                                                                        {essentialsCart.length}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Essentials Cart</p>
                                                                        <p className="text-xl font-black">INR {essentialsCart.reduce((s, i) => s + i.price, 0).toLocaleString()}</p>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleCheckoutEssentials();
                                                                    }}
                                                                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
                                                                >
                                                                    Checkout <ArrowRight size={18} />
                                                                </button>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ─── BOOKING DRAWER (slides in from right) ─── */}
            <AnimatePresence>
                {
                    drawerOpen && bookingTarget && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={handleBookingBack}
                                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                            />

                            {/* Drawer */}
                            <motion.div
                                initial={isMobile ? { y: '100%' } : { x: '100%' }}
                                animate={isMobile ? { y: 0 } : { x: 0 }}
                                exit={isMobile ? { y: '100%' } : { x: '100%' }}
                                transition={{ type: 'spring', damping: 30, stiffness: 250 }}
                                className={isMobile
                                    ? "fixed bottom-0 left-0 right-0 max-h-[92vh] w-full bg-white rounded-t-[32px] shadow-2xl z-50 flex flex-col overflow-hidden"
                                    : "fixed top-0 right-0 h-full w-[80%] max-w-4xl bg-white shadow-2xl z-50 flex flex-col"
                                }
                            >
                                {isMobile && (
                                    <div className="w-full flex justify-center pt-3 pb-1 shrink-0">
                                        <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                                    </div>
                                )}
                                {curation ? (
                                    <>
                                        {/* Drawer Header */}
                                        <div className="h-14 border-b border-slate-200 flex items-center px-5 gap-3 shrink-0 bg-white">
                                    <button onClick={handleBookingBack} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-700">
                                        <X size={18} />
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-slate-900 font-bold text-sm truncate">
                                            {bookingItem?.title || 'Book Item'}
                                        </p>
                                        <p className="text-[10px] text-slate-400">Secure checkout via IDFC First Bank</p>
                                    </div>
                                    <ShieldCheck size={16} className="text-emerald-500" />
                                </div>

                                {/* Drawer Content — zoomed down to match compact UI on desktop, natural on mobile */}
                                <div className="flex-1 overflow-y-auto" style={{ zoom: isMobile ? 1 : 0.72 }}>
                                    {bookingTarget.type === 'flight' && (bookingItem?.flightRef || bookingItem?.type === 'flight') && (() => {
                                        if (!bookingItem?.flightRef) return <div className="p-8 text-center text-slate-400">Initializing Flight Details...</div>;
                                        const flightCuration = { ...curation!, flightBooking: undefined };
                                        flightCuration.flightBooking = { flightId: bookingItem.flightRef!.id, bookingRef: '', price: bookingItem.flightRef!.price };
                                        return (
                                            <FlightBookingView
                                                curation={flightCuration}
                                                flightAlternatives={activeFlightAlternatives}
                                                initialStep={initialBookingStep}
                                                onBookingComplete={handleBookingComplete}
                                                onFlightSwap={(flight) => {
                                                    setItinerary(prev => prev.map(it => {
                                                        if (it.id === bookingTarget.itemId) {
                                                            return {
                                                                ...it,
                                                                title: `${flight.airline} Flight`,
                                                                subtitle: `${flight.originIata} → ${flight.destinationIata} • ${flight.departureTime}`,
                                                                price: flight.price,
                                                                image: flight.airlineLogo,
                                                                flightRef: flight
                                                            };
                                                        }
                                                        return it;
                                                    }));
                                                }}
                                                onBack={handleBookingBack}
                                            />
                                        );
                                    })()}
                                    {bookingTarget.type === 'hotel' && (bookingItem?.hotelRef || bookingItem?.type === 'hotel') && (() => {
                                        if (!bookingItem?.hotelRef) return <div className="p-8 text-center text-slate-400">Initializing Hotel Details...</div>;
                                        const hotelCuration = { ...curation!, hotelBooking: undefined };
                                        hotelCuration.hotelBooking = { hotelId: bookingItem.hotelRef!.id, bookingRef: '', totalPrice: bookingItem.hotelRef!.pricePerNight * 3 };
                                        return (
                                            <HotelBookingView
                                                curation={hotelCuration}
                                                hotelAlternatives={activeHotelAlternatives}
                                                initialStep={initialBookingStep}
                                                onBookingComplete={handleBookingComplete}
                                                onHotelSwap={(hotel) => {
                                                    setItinerary(prev => prev.map(it => {
                                                        if (it.id === bookingTarget.itemId) {
                                                            return {
                                                                ...it,
                                                                title: hotel.name,
                                                                subtitle: hotel.description,
                                                                price: hotel.pricePerNight * 3,
                                                                image: hotel.imageUrl,
                                                                hotelRef: hotel
                                                            };
                                                        }
                                                        return it;
                                                    }));
                                                }}
                                                onBack={handleBookingBack}
                                            />
                                        );
                                    })()}
                                    {bookingTarget.type === 'activity' && (bookingItem?.activityRef || bookingItem?.type === 'activity') && (
                                        bookingItem?.activityRef ? (
                                            <ExperienceBookingView
                                                curation={curation!}
                                                activity={bookingItem.activityRef}
                                                activityAlternatives={activeActivityAlternatives}
                                                initialStep={initialBookingStep}
                                                onComplete={handleBookingComplete}
                                                onActivitySwap={(activity) => {
                                                    setItinerary(prev => {
                                                        const exists = prev.find(it => it.id === bookingTarget.itemId);
                                                        if (!exists && bookingTarget.virtualItem) {
                                                            return [...prev, {
                                                                ...bookingTarget.virtualItem,
                                                                title: activity.name,
                                                                subtitle: activity.duration,
                                                                price: activity.price,
                                                                image: activity.imageUrl,
                                                                activityRef: activity
                                                            }];
                                                        }
                                                        return prev.map(it => {
                                                            if (it.id === bookingTarget.itemId) {
                                                                return {
                                                                    ...it,
                                                                    title: activity.name,
                                                                    subtitle: activity.duration,
                                                                    price: activity.price,
                                                                    image: activity.imageUrl,
                                                                    activityRef: activity
                                                                };
                                                            }
                                                            return it;
                                                        });
                                                    });
                                                }}
                                                onBack={handleBookingBack}
                                            />
                                        ) : (
                                            <div className="p-8 text-center text-slate-400">Initializing Experience...</div>
                                        )
                                    )}
                                    {bookingTarget.type === 'essentials' && bookingItem?.essentialsRef && (
                                        <BundleBookingView
                                            curation={curation}
                                            essentials={bookingItem.essentialsRef}
                                            onComplete={handleBookingComplete}
                                            onBack={handleBookingBack}
                                        />
                                    )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white">
                                        <RefreshCw size={48} className="text-red-600 animate-spin mb-4" />
                                        <p className="text-slate-900 font-black text-lg">Initializing Anya...</p>
                                        <p className="text-slate-500 font-medium text-sm">Securing your bespoke curation</p>
                                    </div>
                                )}
                                </motion.div>
                            </>
                        )
                }
            </AnimatePresence >

        </div>
    );
};

export default ConversationalPlanner;
