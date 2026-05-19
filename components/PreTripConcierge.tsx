import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  ShieldCheck,
  Wifi,
  Box,
  AlertCircle,
  Info,
  ArrowRight,
  Sparkles,
  Ticket,
  Briefcase,
  Smartphone,
  PlaneTakeoff,
  Stethoscope,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Curation, PreTripChecklistItem, Essential } from '../types';
import { ESSENTIALS_CATALOG } from '../mockData';

interface PreTripConciergeProps {
  curation: Curation;
  onBookEssentials?: (essentials: Essential[], curationId: string) => void;
}

const PreTripConcierge: React.FC<PreTripConciergeProps> = ({ curation, onBookEssentials }) => {
  const tripStartDate = curation.startDate ? new Date(curation.startDate) : new Date();
  const dateFormatted = tripStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const [items, setItems] = useState<PreTripChecklistItem[]>([
    { id: '1', task: 'Travel Insurance', description: 'Comprehensive medical and trip cancellation coverage.', isCompleted: curation.essentialsBooking?.items.some(i => i.category === 'Protection') || false, category: 'Services', recommendation: 'IDFC First Bank Platinum Shield' },
    { id: '2', task: 'Local eSIM Activation', description: 'Avoid roaming charges with a local 5G eSIM.', isCompleted: curation.essentialsBooking?.items.some(i => i.category === 'Connectivity') || false, category: 'Services', recommendation: 'Global Connect 20GB' },
    { id: '3', task: 'Print Entry Tickets', description: 'Some attractions in ' + curation.destination.name + ' require physical printouts.', isCompleted: false, category: 'Documents' },
    { id: '4', task: 'Check eVisa Requirements', description: 'Verify if your passport requires a visa for ' + curation.destination.country + '.', isCompleted: false, category: 'Documents' },
    { id: '5', task: 'Pack for ' + curation.destination.name, description: `Current forecast suggests mixed layers for ${tripStartDate.toLocaleDateString('en-US', { month: 'short' })} in ` + curation.destination.name + '.', isCompleted: false, category: 'Gear', recommendation: 'Light rain jacket & comfortable walking shoes' },
    { id: '6', task: 'Set Travel Notifications', description: 'Inform IDFC First Bank of your travel dates to ensure uninterrupted card usage.', isCompleted: true, category: 'Services' }
  ]);

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, isCompleted: !item.isCompleted } : item));
  };

  const categories = ['Documents', 'Gear', 'Services', 'Health'];
  const progress = Math.round((items.filter(i => i.isCompleted).length / items.length) * 100);

  // Calculate days until departure
  const today = new Date();
  const diffTime = tripStartDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const countdownText = diffDays > 0 ? `In ${diffDays} Days` : diffDays === 0 ? 'Today' : 'Completed';

  return (
    <div className="space-y-8 pb-20">
      {/* Header Summary */}
      <div className="bg-slate-900 dark:bg-slate-800 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Sparkles size={20} />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">Pre-Trip Concierge</h2>
            </div>
            <p className="text-slate-400 text-sm font-medium">Your personalized readiness dashboard for <span className="text-white font-bold">{curation.destination.name}</span></p>

            <div className="pt-4">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Readiness Progress</span>
                <span className="text-xl font-black text-red-500">{progress}%</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl text-center min-w-[120px]">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Departure</p>
              <p className="text-xl font-black text-white">{dateFormatted}</p>
              <p className="text-[8px] font-bold text-red-500 mt-1 uppercase tracking-tighter italic">{countdownText}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl text-center min-w-[120px]">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Weather</p>
              <p className="text-xl font-black text-white">18°C</p>
              <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Partly Cloudy</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checklist Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
              <Briefcase size={16} className="text-red-600" /> Smart Checklist
            </h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {items.filter(i => !i.isCompleted).length} tasks remaining
            </span>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${item.isCompleted
                    ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 opacity-60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm hover:border-red-600/50'}`}
                >
                  <div className={`mt-0.5 shrink-0 ${item.isCompleted ? 'text-green-500' : 'text-slate-300'}`}>
                    {item.isCompleted ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`font-black text-sm uppercase tracking-tight ${item.isCompleted ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>
                        {item.task}
                      </p>
                      <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-400 border border-slate-200 dark:border-slate-700">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      {item.description}
                    </p>
                    {item.recommendation && !item.isCompleted && (
                      <div className="mt-3 flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-950/20 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/30 w-fit">
                        <Sparkles size={10} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{item.recommendation}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-8">
          {/* Bundle & Save Banner */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-red-600 to-red-900 rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden group cursor-pointer"
            onClick={() => {
              if (onBookEssentials) {
                const bundle = ESSENTIALS_CATALOG.filter(e => ['e1', 'e2', 'e3'].includes(e.id));
                onBookEssentials(bundle, curation.curationId);
              }
            }}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">IDFC First Bank Elite Bundle</span>
              </div>
              <h4 className="text-2xl font-black mb-2 tracking-tighter">BUNDLE & SAVE 15%</h4>
              <p className="text-xs text-white/70 font-medium mb-6 max-w-[200px]">Get Insurance, eSIM, and Transfers in one tap.</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-1">Bundle Price</p>
                  <p className="text-2xl font-black">INR 765</p>
                </div>
                <div className="w-10 h-10 bg-white text-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:translate-x-1 transition-transform">
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
              <ShieldCheck size={16} className="text-red-600" /> Trip Essentials
            </h3>

            {/* Travel Insurance Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Stethoscope size={80} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-emerald-600/20">
                  <ShieldCheck size={24} />
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2 leading-tight">Travel Insurance</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">IDFC First Bank customers get 20% cashback on Global Travel Protection.</p>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                  <span className="text-xl font-black text-slate-900 dark:text-white">INR 300<span className="text-[10px] text-slate-400 font-bold ml-1">/ person</span></span>
                  <button 
                    onClick={() => onBookEssentials && onBookEssentials([ESSENTIALS_CATALOG.find(e => e.id === 'e3')!], curation.curationId)}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                  >
                    Protect
                  </button>
                </div>
              </div>
            </div>

            {/* Connectivity Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Smartphone size={80} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-600/20">
                  <Wifi size={24} />
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2 leading-tight">Travel eSIM</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">Unlimited 5G data across EU. Instant activation from IDFC First Bank app.</p>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                  <span className="text-xl font-black text-slate-900 dark:text-white">INR 150<span className="text-[10px] text-slate-400 font-bold ml-1">/ 5GB</span></span>
                  <button 
                    onClick={() => onBookEssentials && onBookEssentials([ESSENTIALS_CATALOG.find(e => e.id === 'e2')!], curation.curationId)}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                  >
                    Activate
                  </button>
                </div>
              </div>
            </div>

            {/* Airport Transfer */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <PlaneTakeoff size={80} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-amber-600/20">
                  <Box size={24} />
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2 leading-tight">Airport Transfer</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">VIP pickup in {curation.destination.name}. 15% discount for IDFC First Bank Holders.</p>
                <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                  <span className="text-xl font-black text-slate-900 dark:text-white">INR 450<span className="text-[10px] text-slate-400 font-bold ml-1">/ Sedan</span></span>
                  <button 
                    onClick={() => onBookEssentials && onBookEssentials([ESSENTIALS_CATALOG.find(e => e.id === 'e1')!], curation.curationId)}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                  >
                    Book
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreTripConcierge;
