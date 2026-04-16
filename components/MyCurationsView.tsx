import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, ChevronRight, Sparkles, Clock, Compass, ShieldCheck } from 'lucide-react';
import { Curation } from '../types';

interface MyCurationsViewProps {
  curations: Curation[];
  onView: (id: string) => void;
}

const MyCurationsView: React.FC<MyCurationsViewProps> = ({ curations, onView }) => {
  // Logic: Hide bookings flagged as manual to keep this view strictly for AI itineraries
  const filteredCurations = curations.filter(c => !c.isManual);

  if (filteredCurations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center text-red-600 mb-6 shadow-inner relative">
          <Sparkles size={28} className="animate-pulse" />
          <div className="absolute inset-0 border-2 border-red-600/20 rounded-full animate-ping" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">No Masterpieces Yet</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm italic leading-relaxed">
          "The canvas is blank. Ignite the Mastercard Intelligence engine to forge your first elite travel experience."
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full max-w-[1400px] mx-auto">
      {/* Precision Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/20">
              <Sparkles size={16} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">AI Masterpieces</h1>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Curated travel intelligence logic tailored to your exact parameters.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button className="px-5 py-1.5 text-xs font-black uppercase tracking-widest bg-white dark:bg-slate-700 text-red-600 rounded-md shadow-sm transition-all">All Curations</button>
            <button className="px-5 py-1.5 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Drafts</button>
          </div>
          <button className="h-8 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest rounded-lg hover:bg-red-600 dark:hover:bg-red-600 hover:text-white transition-all">
            New Request
          </button>
        </div>
      </div>

      {/* High-Density Row Grid */}
      <div className="space-y-4">
        {filteredCurations.map((curation, idx) => (
          <motion.div
            key={curation.curationId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group grid grid-cols-[auto_1fr_auto] items-stretch gap-6 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-800/60 hover:border-red-500/30 transition-all duration-300"
          >
            {/* Minimal Image Thumbnail */}
            <div className="w-48 relative overflow-hidden">
              <img
                src={curation.destination.imageUrl}
                alt={curation.destination.name}
                className="w-full h-full object-cover group-hover:scale-105 group-hover:-rotate-1 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white dark:to-slate-900" />
            </div>

            {/* Dense Data Section */}
            <div className="py-5 pr-8 flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-black text-slate-900 dark:text-white truncate">
                  {curation.destination.name}
                </h3>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${curation.status === 'draft'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                    : 'bg-green-50 dark:bg-green-900/20 text-green-600 border-green-200 dark:border-green-800'
                  }`}>
                  {curation.status === 'draft' ? 'Draft' : 'Secured'}
                </span>
                {idx === 0 && (
                  <span className="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-900/40 rounded text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                    <Sparkles size={8} /> 98% Match
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 truncate italic max-w-2xl">
                An exclusive curation heavily weighted towards {curation.destination.activities[0]?.category || 'Luxury'} experiences and central accommodations.
              </p>

              {/* Meta Stats Row */}
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Calendar size={14} className="text-slate-400" />
                  <span className="text-xs font-bold font-mono">3 Days • Oct '24</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Users size={14} className="text-slate-400" />
                  <span className="text-xs font-bold font-mono">{curation.travelers} Guests</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Compass size={14} className="text-slate-400" />
                  <span className="text-xs font-bold font-mono">Luxury Tier</span>
                </div>
              </div>
            </div>

            {/* Action Area */}
            <div className="flex items-center pr-6 bg-slate-50/50 dark:bg-slate-900/50 pl-6 border-l border-slate-100 dark:border-slate-800/50">
              <div className="flex flex-col items-end gap-3 w-32">
                <p className="text-[9px] font-black shrink-0 text-slate-400 uppercase tracking-widest mb-1 text-right">
                  Ref: <span className="font-mono text-slate-500">{curation.curationId}</span>
                </p>
                <button
                  onClick={() => onView(curation.curationId)}
                  className="w-full py-2.5 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-[0.2em] rounded border border-transparent hover:bg-red-600 dark:hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
                >
                  Access
                  <ChevronRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MyCurationsView;
