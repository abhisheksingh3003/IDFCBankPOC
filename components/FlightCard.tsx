
import React from 'react';
import { Plane, Clock } from 'lucide-react';
import SafeImage from './SafeImage';

interface FlightCardProps {
  flight: Flight;
}

const FlightCard: React.FC<FlightCardProps> = ({ flight }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg dark:shadow-white/5 border border-slate-100 dark:border-slate-800"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <SafeImage src={flight.airlineLogo} alt={flight.airline} className="w-10 h-10 rounded-md object-contain" category="flight" />
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white">{flight.airline}</h4>
            <p className="text-sm text-slate-500">{flight.id}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-red-600">AED {flight.price}</p>
          <p className="text-xs text-slate-400">One way</p>
        </div>
      </div>

      <div className="flex items-center justify-between py-4 border-t border-b border-slate-50 dark:border-slate-800">
        <div className="text-center">
          <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{flight.departureTime}</p>
          <p className="text-xs text-slate-500">Departure</p>
        </div>
        <div className="flex flex-col items-center flex-1 px-4">
          <div className="w-full flex items-center gap-2 mb-1">
            <div className="h-[1px] bg-slate-200 dark:bg-slate-700 flex-1"></div>
            <Plane size={14} className="text-slate-400 rotate-90" />
            <div className="h-[1px] bg-slate-200 dark:bg-slate-700 flex-1"></div>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock size={12} />
            <span>{flight.duration}</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{flight.arrivalTime}</p>
          <p className="text-xs text-slate-500">Arrival</p>
        </div>
      </div>

      <button className="w-full mt-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2 rounded-lg font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">
        Select Flight
      </button>
    </motion.div>
  );
};

export default FlightCard;
