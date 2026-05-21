
import React from 'react';
import { AIItinerary } from '../types';
import { Sparkles, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const DAY_COLORS = [
  { accent: '#B91C1C', bg: 'bg-red-600',   ring: 'ring-red-200 dark:ring-red-900' },
  { accent: '#9333EA', bg: 'bg-purple-600', ring: 'ring-purple-200 dark:ring-purple-900' },
  { accent: '#0284C7', bg: 'bg-sky-600',    ring: 'ring-sky-200 dark:ring-sky-900' },
  { accent: '#059669', bg: 'bg-emerald-600',ring: 'ring-emerald-200 dark:ring-emerald-900' },
  { accent: '#D97706', bg: 'bg-amber-600',  ring: 'ring-amber-200 dark:ring-amber-900' },
  { accent: '#DB2777', bg: 'bg-pink-600',   ring: 'ring-pink-200 dark:ring-pink-900' },
  { accent: '#0891B2', bg: 'bg-cyan-600',   ring: 'ring-cyan-200 dark:ring-cyan-900' },
];

interface AIItineraryViewProps {
  itinerary: AIItinerary[];
  activeDay?: number;
  onDayChange?: (day: number) => void;
}

const AIItineraryView: React.FC<AIItineraryViewProps> = ({ itinerary, activeDay, onDayChange }) => {
  const hasActiveDayFilter = typeof activeDay === 'number';
  const displayDays = hasActiveDayFilter
    ? itinerary.filter(d => d.day === activeDay)
    : itinerary;

  if (itinerary.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Sparkles size={36} className="text-red-600 mb-3 opacity-50" />
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
          Generate an AI itinerary to see your day-by-day plan here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2 text-red-600">
        <Sparkles size={20} />
        <h3 className="text-xl font-black uppercase tracking-tighter">
          {hasActiveDayFilter ? `Day ${activeDay} Plan` : 'Magic AI Itinerary'}
        </h3>
      </div>

      {/* Day cards */}
      {displayDays.map((day) => {
        const col = DAY_COLORS[(day.day - 1) % DAY_COLORS.length];
        const isActive = activeDay === day.day;

        return (
          <motion.div
            key={day.day}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            onClick={() => onDayChange?.(day.day)}
            className={`bg-white dark:bg-slate-900 rounded-2xl shadow-lg border transition-all duration-200 overflow-hidden cursor-pointer
              ${isActive
                ? `border-2 ring-2 ${col.ring} shadow-xl`
                : 'border-slate-100 dark:border-slate-800 hover:shadow-xl hover:border-slate-200 dark:hover:border-slate-700'
              }`}
            style={{ borderColor: isActive ? col.accent : undefined }}
          >
            {/* Day Header */}
            <div
              className="flex items-center gap-3 px-5 py-3"
              style={{ background: `${col.accent}15` }}
            >
              <div
                className={`w-8 h-8 rounded-full ${col.bg} text-white flex items-center justify-center font-black text-sm shadow-md`}
              >
                {day.day}
              </div>
              <div>
                <h4 className="font-black text-slate-900 dark:text-white text-sm leading-tight">
                  {day.title}
                </h4>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: col.accent }}>
                  Day {day.day} · {day.events.length} stops
                </p>
              </div>
            </div>

            {/* Events timeline */}
            <div className="px-5 py-4 space-y-4">
              {day.events.map((event, eIdx) => (
                <div
                  key={eIdx}
                  className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-2 before:h-2 before:rounded-full before:ring-2 before:ring-offset-2 dark:before:ring-offset-slate-900
                             after:content-[''] after:absolute after:left-[3px] after:top-4 after:w-[1.5px] after:h-[calc(100%+1rem)] after:bg-slate-100 dark:after:bg-slate-800 last:after:hidden"
                  style={{
                    ['--tw-ring-color' as any]: col.accent,
                  }}
                >
                  <div
                    className="absolute left-0 top-1.5 w-2 h-2 rounded-full"
                    style={{ background: col.accent, boxShadow: `0 0 6px ${col.accent}80` }}
                  />

                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock size={9} className="text-slate-400" />
                    <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: col.accent }}>
                      {event.time}
                    </p>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {event.description}
                  </p>
                  {(event as any).locationName && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <MapPin size={9} className="text-slate-400 flex-shrink-0" />
                      <p className="text-[10px] text-slate-400 font-medium italic truncate">
                        {(event as any).locationName}
                      </p>
                    </div>
                  )}

                  {/* Consensus avatars */}
                  {event.consensus && event.consensus.length > 0 && (
                    <div className="flex -space-x-1 mt-2">
                      {event.consensus.map((id) => (
                        <div
                          key={id}
                          className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-[7px] font-black text-white shadow-sm"
                          style={{ background: col.accent }}
                          title={`Agreed by ${id}`}
                        >
                          {id.charAt(0).toUpperCase()}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AIItineraryView;
