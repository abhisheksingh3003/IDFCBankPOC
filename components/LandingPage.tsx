import React from 'react';
import {
  Compass,
  Sparkles,
  Map as MapIcon,
  UserCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Theme, Language, PlannerMode } from '../types';


interface LandingPageProps {
  theme: Theme;
  toggleTheme: () => void;
  onSelectMode: (mode: PlannerMode) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({
  theme,
  toggleTheme,
  onSelectMode
}) => {
  const t = {
    heroTitle: "Your Next Adventure, Perfectly Crafted.",
    heroSubtitle: "The world's most sophisticated trip planner. Powered by AI, refined by you.",
    aiCardTitle: "AI Trip Builder",
    aiCardBadge: "Instant Itineraries",
    aiCardDesc: "Let AI craft your perfect trip in seconds. Tell us your interests and get a personalized day-by-day plan.",
    manualCardTitle: "Manual Planner",
    manualCardBadge: "Custom Planner",
    manualCardDesc: "Build your trip step-by-step, exactly how you want it. Complete control over every hotel, flight, and activity.",
    footer: "Powered by: Pointlabs"
  };
  const mcLogoUrl = "/images/mclogo-for-footer.svg";


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col transition-colors duration-300">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center max-w-2xl mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-6xl font-black mb-6 leading-tight"
          >
            {t.heroTitle.split(',')[0]}, <br />
            <span className="mc-gradient-text">{t.heroTitle.split(',')[1]}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600 dark:text-slate-400"
          >
            {t.heroSubtitle}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          {/* Manual Planner Card */}
          <motion.button
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => onSelectMode('manual')}
            className="group relative bg-white dark:bg-slate-900 p-6 sm:p-8 md:p-12 rounded-3xl shadow-xl hover:shadow-2xl hover:ring-2 hover:ring-red-500 transition-all duration-300 text-left overflow-hidden border border-slate-100 dark:border-slate-800"
          >
            <div className="relative z-10">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-red-600 mb-8 group-hover:scale-110 transition-transform duration-300">
                <MapIcon size={32} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">{t.manualCardTitle}</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-2 font-medium">{t.manualCardBadge}</p>
              <p className="text-slate-500 dark:text-slate-500 text-sm leading-relaxed">
                {t.manualCardDesc}
              </p>
            </div>

            {/* SPLIT WATERMARK: LEFT HALF (Front of Bull) */}
            <div className="absolute -bottom-16 -right-32 w-96 h-96 opacity-[0.04] group-hover:opacity-[0.09] transition-opacity pointer-events-none select-none duration-500">
              <img
                src={mcLogoUrl}
                alt=""
                className="w-full h-full object-contain"
              />
            </div>
          </motion.button>

          {/* AI Trip Builder Card - Updated to Mastercard Red */}
          <motion.button
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => onSelectMode('ai')}
            className="group relative mc-gradient p-6 sm:p-8 md:p-12 rounded-3xl shadow-xl hover:shadow-2xl hover:ring-2 hover:ring-white transition-all duration-300 text-left overflow-hidden border border-white/20"
          >
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform duration-300">
                <Sparkles size={32} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">{t.aiCardTitle}</h2>
              <p className="text-red-100 mb-2 font-medium">{t.aiCardBadge}</p>
              <p className="text-red-50 text-sm leading-relaxed opacity-90">
                {t.aiCardDesc}
              </p>
            </div>

            {/* SPLIT WATERMARK: RIGHT HALF (Tail of Bull) */}
            <div className="absolute -bottom-16 -left-32 w-96 h-96 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none select-none duration-500 invert brightness-0">
              <img
                src={mcLogoUrl}
                alt=""
                className="w-full h-full object-contain"
              />
            </div>
          </motion.button>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="p-8 pb-12 text-center">
        <div className="flex items-center justify-center gap-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Powered By</span>
          <div className="bg-slate-900 px-3 py-1.5 rounded-xl flex items-center justify-center shadow-lg border border-slate-800 transition-transform hover:scale-105">
            <img src="/images/pointlabs.png" className="h-4 w-auto object-contain" alt="Pointlabs" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;