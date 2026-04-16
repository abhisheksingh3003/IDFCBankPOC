import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface BookingSectionProps {
    title?: string;
    description?: string;
    children: ReactNode;
    className?: string;
    rightElement?: ReactNode;
}

const BookingSection: React.FC<BookingSectionProps> = ({
    title,
    description,
    children,
    className = '',
    rightElement
}) => {
    return (
        <div className={`space-y-4 ${className}`}>
            {(title || description || rightElement) && (
                <div className="flex items-end justify-between px-2">
                    <div>
                        {title && (
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                {title}
                            </h3>
                        )}
                        {description && (
                            <p className="text-base font-bold text-slate-400 uppercase tracking-widest mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                    {rightElement}
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-6 md:p-8 transition-shadow hover:shadow-md">
                {children}
            </div>
        </div>
    );
};

export default BookingSection;
