import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Utensils, Plane, Globe, Sparkles, ArrowRight, Receipt, Ticket, MapPin, Star, Mic, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

const ComingSoon: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-brand-orange/30">
      {/* Dynamic Multi-layered Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-slate-950">
        {/* Base Layer: Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.9)_100%)] z-[5]"></div>

        {/* Patterns Layer */}
        <div className="absolute inset-0 z-[4] opacity-[0.15]">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]"></div>
          
          {/* Topographic-style Lines (Decorative) */}
          <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
            <filter id="blurLines">
              <feGaussianBlur stdDeviation="2" />
            </filter>
            <motion.path
              animate={{ 
                d: [
                  "M-100,200 Q200,100 500,400 T1200,200",
                  "M-100,250 Q250,150 550,450 T1200,250"
                ]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              stroke="white" strokeWidth="0.5" fill="none" filter="url(#blurLines)"
            />
            <motion.path
              animate={{ 
                d: [
                  "M-100,500 Q300,400 600,700 T1200,500",
                  "M-100,550 Q350,450 650,750 T1200,550"
                ]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              stroke="white" strokeWidth="0.5" fill="none" filter="url(#blurLines)"
            />
          </svg>
        </div>

        {/* Deep Glows */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            opacity: [0.03, 0.07, 0.03]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 -left-1/4 w-[1200px] h-[1200px] bg-brand-red rounded-full blur-[160px] z-[1]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            opacity: [0.03, 0.06, 0.03]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-1/4 -right-1/4 w-[1200px] h-[1200px] bg-brand-orange rounded-full blur-[160px] z-[1]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.4, 1],
            y: [0, 100, 0],
            opacity: [0.02, 0.05, 0.02]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand-yellow rounded-full blur-[200px] z-[1]" 
        />
        
        {/* Bokeh Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              scale: Math.random() * 0.5 + 0.5,
              opacity: 0
            }}
            animate={{ 
              y: [null, (Math.random() - 0.5) * 200 + "px"],
              x: [null, (Math.random() - 0.5) * 200 + "px"],
              opacity: [0, 0.15, 0]
            }}
            transition={{ 
              duration: 10 + Math.random() * 10, 
              repeat: Infinity, 
              ease: "easeInOut",
              delay: Math.random() * 5
            }}
            className={`absolute w-32 h-32 rounded-full blur-3xl z-[2] ${
              i % 3 === 0 ? 'bg-brand-red' : i % 3 === 1 ? 'bg-brand-orange' : 'bg-brand-yellow'
            }`}
          />
        ))}

        {/* Animated Grid / Noise Layer */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.25] brightness-125 contrast-150 mix-blend-overlay z-[6]"></div>
        
        {/* Mesh Gradient Polish */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50 z-[3]"></div>
      </div>

      {/* Main Content */}
      <div className="z-10 flex flex-col items-center text-center px-6 max-w-3xl">
        {/* Hero Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <div className="relative inline-block">
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                y: [0, -8, 0]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="bg-gradient-to-br from-brand-red via-brand-orange to-brand-yellow p-6 rounded-[2rem] shadow-[0_15px_40px_rgba(235,0,27,0.25)] relative group"
            >
              <ChefHat size={60} className="text-white drop-shadow-2xl" strokeWidth={1.5} />
            </motion.div>
            
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute -top-2 -right-2 bg-slate-900 border-2 border-brand-yellow p-2 rounded-xl shadow-xl"
            >
              <Sparkles size={18} className="text-brand-yellow" />
            </motion.div>
          </div>
        </motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-[0.95]"
        >
          <span className="text-white">Something </span>
          <span className="mc-gradient-text italic">delicious</span>
          <br />
          <span className="text-white">is cooking.</span>
        </motion.h1>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-slate-400 text-lg md:text-xl max-w-xl mb-10 font-medium leading-relaxed"
        >
          We're mixing world-class itineraries with AI-powered inspiration. 
          The ultimate travel concierge is currently in the oven.
        </motion.p>

        {/* Feature Teasers / Ingredients */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12 w-full max-w-2xl"
        >
          {[
            { icon: Mic, label: "Neural Voice AI", color: "text-brand-red" },
            { icon: Compass, label: "Itinerary Forge", color: "text-brand-orange" },
            { icon: Ticket, label: "Elite Booking", color: "text-brand-yellow" },
            { icon: Sparkles, label: "Prime Concierge", color: "text-white" }
          ].map((item, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-col items-center gap-2 group hover:bg-white/10 transition-all">
              <item.icon className={`${item.color} group-hover:scale-110 transition-transform`} size={24} strokeWidth={1.5} />
              <span className="text-slate-300 text-[9px] font-black uppercase tracking-widest text-center">{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Action Area */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="w-full max-w-lg"
        >
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="relative flex-1">
              <input 
                type="email" 
                placeholder="Secure your invite..."
                className="w-full bg-slate-900/50 backdrop-blur-xl border-2 border-slate-800 text-white px-6 py-4 rounded-[1.5rem] focus:outline-none focus:border-brand-orange/50 transition-all font-medium text-base placeholder:text-slate-600"
              />
            </div>
            <button className="mc-gradient text-white font-black px-8 py-4 rounded-[1.5rem] shadow-[0_10px_20px_rgba(235,0,27,0.2)] hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap flex items-center justify-center gap-2 text-base uppercase tracking-wider group">
              Join Waitlist
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>


      {/* Floating Travel Elements */}
      <motion.div
        animate={{ 
          x: [0, 30, 0],
          y: [0, -40, 0],
          rotate: [15, 25, 15],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 right-[5%] pointer-events-none opacity-20 hidden lg:block"
      >
        <Ticket size={160} className="text-brand-orange -rotate-12" strokeWidth={1} />
      </motion.div>

      <motion.div
        animate={{ 
          x: [0, -30, 0],
          y: [0, 50, 0],
          rotate: [-15, -5, -15],
          scale: [1, 0.9, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 left-[5%] pointer-events-none opacity-20 hidden lg:block"
      >
        <MapPin size={140} className="text-brand-red" strokeWidth={1} />
      </motion.div>

      <motion.div
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 360],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ 
          y: { duration: 10, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 60, repeat: Infinity, ease: "linear" }
        }}
        className="absolute -top-20 -right-20 pointer-events-none"
      >
        <Globe size={400} className="text-white/5" strokeWidth={0.5} />
      </motion.div>

      {/* Footer Branding */}
      <div className="absolute bottom-10 left-0 w-full flex justify-center opacity-80 z-20 pointer-events-none">
        <img src="/images/pointlabs.png" className="h-6 object-contain brightness-110 contrast-125" alt="PointLabs" />
      </div>
    </div>
  );
};

export default ComingSoon;

