import React from 'react';
import { Plane, Calendar, MapPin, Star } from 'lucide-react';
import SafeImage from '../SafeImage';

interface SummaryCardProps {
    imageUrl?: string;
    title: string;
    subtitle?: string;
    details: { label: string; value: string; icon?: React.ElementType }[];
    status?: 'confirmed' | 'pending' | 'draft';
    price?: number;
    currency?: string;
    className?: string;
    category?: 'flight' | 'hotel' | 'activity' | 'dining' | 'transfer';
}

const SummaryCard: React.FC<SummaryCardProps> = ({
    imageUrl,
    title,
    subtitle,
    details,
    status = 'draft',
    price,
    currency = 'AED',
    className = '',
    category = 'activity'
}) => {
    return (
        <div className={`group bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden border border-slate-100 dark:border-slate-800/50 shadow-[0_10px_30px_rgba(0,0,0,0.04)] dark:shadow-none flex flex-col md:flex-row transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] ${className}`}>

            {/* Image Section */}
            {imageUrl && (
                <div className="w-full md:w-[40%] h-56 md:h-auto relative overflow-hidden">
                    <SafeImage src={imageUrl} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" category={category} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent md:bg-gradient-to-r" />
                    
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <span className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg">
                            {category}
                        </span>
                    </div>

                    <div className="absolute bottom-4 left-4">
                        {status === 'confirmed' && (
                            <span className="bg-emerald-500/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                Confirmed
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Content Section */}
            <div className="p-8 md:p-10 flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-8">
                    <div className="space-y-1.5">
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                            {title}
                        </h3>
                        {subtitle && (
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {price && (
                        <div className="text-right shrink-0">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Est.</span>
                            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                {currency}{price.toLocaleString()}
                            </p>
                        </div>
                    )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    {details.map((detail, idx) => (
                        <div key={idx} className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                {detail.icon && <detail.icon size={12} className="text-red-500" />} {detail.label}
                            </span>
                            <span className="text-base font-bold text-slate-700 dark:text-slate-200">
                                {detail.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SummaryCard;
