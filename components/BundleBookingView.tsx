import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, CreditCard, User, Mail, Phone, Loader2, Check, PartyPopper,
  Sparkles, ArrowRight, ShoppingBag, ShieldCheck, Car, Wifi, Coffee, Zap, Ticket as TicketIcon
} from 'lucide-react';
import { Essential, Curation } from '../types';
import BookingLayout from './booking/BookingLayout';
import BookingSection from './booking/BookingSection';
import SummaryCard from './booking/SummaryCard';
import PaymentGateway from './PaymentGateway';

interface BundleBookingViewProps {
  curation: Curation;
  essentials: Essential[];
  onComplete: (details: any) => void;
  onBack: () => void;
}

const EssentialIconMap: Record<string, React.ElementType> = {
  Car: Car,
  Wifi: Wifi,
  Shield: ShieldCheck,
  Coffee: Coffee,
  User: User,
  Zap: Zap,
  Ticket: TicketIcon
};

const BundleBookingView: React.FC<BundleBookingViewProps> = ({ curation, essentials, onComplete, onBack }) => {
  const [step, setStep] = useState<'checkout' | 'payment' | 'success'>('checkout');
  const [isProcessing, setIsProcessing] = useState(false);

  const totalPrice = essentials.reduce((acc, e) => acc + e.price, 0);

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
      onComplete({
        items: essentials,
        totalPrice,
        bookingRef: `EB-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      });
    }, 2000);
  };

  const renderFooter = () => {
    if (step === 'success') return null;
    return (
      <div className="flex items-center justify-between w-full">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bundle Total</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">INR {totalPrice.toLocaleString()}</p>
        </div>
        {step === 'checkout' && (
          <button
            onClick={() => setStep('payment')}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
          >
            Review & Pay <ArrowRight size={18} />
          </button>
        )}
      </div>
    );
  };

  return (
    <BookingLayout
      title={step === 'success' ? 'Bundle Secured' : 'Essentials Checkout'}
      subtitle={step === 'success' ? 'All items confirmed' : `${essentials.length} Items • ${curation.curationId}`}
      onBack={step === 'success' ? undefined : onBack}
      footer={renderFooter()}
    >
      <AnimatePresence mode="wait">
        {step === 'checkout' && (
          <motion.div
            key="checkout"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {essentials.map(e => {
                const Icon = EssentialIconMap[e.icon] || Sparkles;
                return (
                  <BookingSection key={e.id} className="h-full">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-red-600">
                        <Icon size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-slate-900 dark:text-white text-lg">{e.title}</p>
                        <p className="text-xs text-slate-500 font-medium">{e.description}</p>
                      </div>
                      <p className="font-black text-slate-900 dark:text-white">INR {e.price}</p>
                    </div>
                  </BookingSection>
                );
              })}
            </div>

          </motion.div>
        )}

        {step === 'payment' && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <PaymentGateway
              total={totalPrice}
              currency="INR"
              onPay={handlePay}
              onBack={() => setStep('checkout')}
              isLoading={isProcessing}
              breakdown={essentials.map(e => ({ label: e.title, value: e.price }))}
            />
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 pt-8"
          >
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 mx-auto">
              <Check size={48} strokeWidth={3} />
            </div>

            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Bundle Secured</h2>
              <p className="text-slate-500 font-medium">Your trip is fully equipped.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 max-w-sm mx-auto">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Master Bundle Voucher</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-mono mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">EB-{curation.curationId.slice(0, 4)}-ELITE</p>
              <div className="flex flex-wrap justify-center gap-2">
                {essentials.map(e => (
                  <span key={e.id} className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-300">
                    {e.title}
                  </span>
                ))}
              </div>
            </div>

            <button onClick={onBack} className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-8 py-3 rounded-xl font-bold transition-all">
              Return to Dashboard
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </BookingLayout>
  );
};

export default BundleBookingView;
