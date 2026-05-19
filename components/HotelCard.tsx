
import React from 'react';
import { Star, MapPin } from 'lucide-react';
import { Hotel } from '../types';
import { motion } from 'framer-motion';

import SafeImage from './SafeImage';

interface HotelCardProps {
  hotel: Hotel;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl overflow-hidden shadow-lg border border-slate-200/60 flex flex-col"
    >
      <div className="h-48 overflow-hidden relative">
        <SafeImage src={hotel.imageUrl} alt={hotel.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" category="hotel" />
        <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-md flex items-center gap-1 text-sm font-bold text-slate-800">
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
          {hotel.rating}
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-lg font-bold text-[#1a1a2e] leading-tight">{hotel.name}</h4>
        </div>
        <div className="flex items-center gap-1 text-slate-500 text-sm mb-3">
          <MapPin size={14} />
          <span>Prime Location</span>
        </div>
        <p className="text-sm text-slate-600 line-clamp-2 mb-4">
          {hotel.description}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-red-650">INR {hotel.pricePerNight}</span>
            <span className="text-sm text-slate-500"> / night</span>
          </div>
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Book
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default HotelCard;
