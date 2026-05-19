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
  const mcLogoUrl = "/images/IDFC_First_Logo.png";


  return (
    <div className="min-h-screen bg-transparent text-[#1a1a2e] flex flex-col transition-colors duration-300">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center max-w-2xl mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-6xl font-black mb-6 leading-tight text-[#1a1a2e]"
          >
            {t.heroTitle.split(',')[0]}, <br />
            <span className="mc-gradient-text">{t.heroTitle.split(',')[1]}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-600"
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
            className="group relative glass-card p-6 sm:p-8 md:p-12 rounded-3xl shadow-xl hover:shadow-2xl hover:glow-border-brand transition-all duration-300 text-left overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-16 h-16 glass-pill rounded-2xl flex items-center justify-center text-amber-500 mb-8 group-hover:scale-110 transition-transform duration-300">
                <MapIcon size={32} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-[#1a1a2e]">{t.manualCardTitle}</h2>
              <p className="text-slate-500 mb-2 font-medium uppercase tracking-wider text-xs">{t.manualCardBadge}</p>
              <p className="text-slate-600 text-sm leading-relaxed">
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

          {/* AI Trip Builder Card */}
          <motion.button
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => onSelectMode('ai')}
            className="group relative mc-gradient-glow p-6 sm:p-8 md:p-12 rounded-3xl transition-all duration-300 text-left overflow-hidden"
          >
            <div className="relative z-10">
              <div className="w-16 h-16 bg-[#f8f7f4]/20 rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform duration-300">
                <Sparkles size={32} />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-4">AI Concierge</h3>
              <p className="text-red-100 mb-2 font-medium">Describe your dream trip. Our AI crafts the perfect itinerary.</p>
            </div>

            {/* SPLIT WATERMARK: RIGHT HALF (Tail of Bull) */}
            <div className="absolute -bottom-16 -left-32 w-96 h-96 opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none select-none duration-500 invert brightness-0">
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
          <div className="glass-pill px-3 py-1.5 rounded-xl flex items-center justify-center">
            <img src="/images/pointlabs.png" className="h-4 w-auto object-contain" alt="Pointlabs" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;