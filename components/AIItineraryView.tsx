
import React from 'react';
import { AIItinerary } from '../types';
import { Sparkles, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIItineraryViewProps {
  itinerary: AIItinerary[];
}

const AIItineraryView: React.FC<AIItineraryViewProps> = ({ itinerary }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-red-600">
        <Sparkles size={24} />
        <h3 className="text-2xl font-bold">Magic AI Itinerary</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {itinerary.map((day, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl dark:shadow-white/5 border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-50 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold">
                {day.day}
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white">{day.title}</h4>
            </div>
            
            <div className="space-y-6">
              {day.events.map((event, eIdx) => (
                <div key={eIdx} className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-2 before:h-2 before:bg-red-600 before:rounded-full after:content-[''] after:absolute after:left-[3px] after:top-4 after:w-[1px] after:h-[calc(100%+1.5rem)] after:bg-slate-100 dark:after:bg-slate-800 last:after:hidden">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wide mb-1">
                    {event.time}
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {event.description}
                  </p>
                  {event.consensus && event.consensus.length > 0 && (
                    <div className="flex -space-x-1 mt-2.5">
                      {event.consensus.map((id) => (
                        <div key={id} className="w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 bg-red-600 flex items-center justify-center text-[7px] font-black text-white shadow-sm ring-1 ring-slate-100 dark:ring-slate-800" title={`Agreed by ${id}`}>
                          {id.charAt(0).toUpperCase()}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AIItineraryView;
