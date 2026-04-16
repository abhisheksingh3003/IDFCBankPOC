
import React from 'react';
import { Clock } from 'lucide-react';
import { Activity } from '../types';
import { motion } from 'framer-motion';

import SafeImage from './SafeImage';

interface ActivityCardProps {
  activity: Activity;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-md dark:shadow-white/5 border border-slate-100 dark:border-slate-800 flex gap-4"
    >
      <SafeImage src={activity.imageUrl} alt={activity.name} className="w-24 h-24 rounded-lg object-cover" category={activity.category?.toLowerCase() === 'dining' ? 'dining' : 'activity'} />
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">
              {activity.category}
            </span>
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white leading-snug">{activity.name}</h4>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Clock size={12} />
              <span>{activity.duration}</span>
            </div>
          </div>
          <p className="font-bold text-slate-800 dark:text-slate-200">AED {activity.price}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ActivityCard;
