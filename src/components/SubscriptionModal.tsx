import React, { useState } from 'react';
import { 
  X, 
  Check, 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  Smartphone, 
  Building2, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import { SubscriptionPlanType, SubscriptionPlan } from '../types';
import { SUBSCRIPTION_PLANS } from '../services/store';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPurchase: (planType: SubscriptionPlanType, gateway: 'JazzCash' | 'EasyPaisa' | 'Bank Transfer' | 'Card', transactionId: string) => void;
  currentPlanType?: SubscriptionPlanType;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onConfirmPurchase,
  currentPlanType
}) => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanType>('weekly');
  const [paymentGateway, setPaymentGateway] = useState<'JazzCash' | 'EasyPaisa' | 'Bank Transfer' | 'Card'>('JazzCash');
  const [accountNumber, setAccountNumber] = useState('03001234567');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const planDetails = SUBSCRIPTION_PLANS.find(p => p.type === selectedPlan)!;

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment gateway redirect & verification callback
    setTimeout(() => {
      const mockTxnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
      onConfirmPurchase(selectedPlan, paymentGateway, mockTxnId);
      setIsProcessing(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative space-y-6 animate-in fade-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20">
            <Zap className="w-3.5 h-3.5 fill-emerald-400" />
            0% Driver Commission Platform
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Driver Subscription Passes</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Pay a small flat fee, keep 100% of all passenger cash fares. No hidden charges.
          </p>
        </div>

        {/* Success Screen */}
        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-xl font-extrabold text-white">Payment Confirmed!</h3>
            <p className="text-sm text-emerald-200">
              Your {planDetails.name} is now ACTIVE. You can go online and start accepting rides immediately!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubscribeSubmit} className="space-y-6">
            {/* Step 1: Select Plan Cards */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Select Subscription Plan
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SUBSCRIPTION_PLANS.map((plan) => {
                  const isSelected = selectedPlan === plan.type;
                  return (
                    <div
                      key={plan.type}
                      onClick={() => setSelectedPlan(plan.type)}
                      className={`relative p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-emerald-950/70 border-emerald-500 ring-2 ring-emerald-500/40 shadow-xl' 
                          : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
                      }`}
                    >
                      {plan.popular && (
                        <span className="absolute -top-2.5 right-3 bg-emerald-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                          Popular
                        </span>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-slate-300">{plan.name}</h4>
                        <div className="mt-1 flex items-baseline gap-1">
                          <span className="text-xl font-black text-white">PKR {plan.amountPKR}</span>
                        </div>
                        <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                          Validity: {plan.durationDays} {plan.durationDays === 1 ? 'Day' : 'Days'}
                        </p>
                      </div>

                      <p className="text-[10px] text-slate-400 mt-2 line-clamp-2">{plan.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Payment Gateway Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                2. Choose Payment Method
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { id: 'JazzCash', name: 'JazzCash', color: 'from-rose-600 to-red-500' },
                  { id: 'EasyPaisa', name: 'EasyPaisa', color: 'from-emerald-600 to-green-500' },
                  { id: 'Bank Transfer', name: 'Bank Transfer', color: 'from-slate-700 to-slate-800' },
                  { id: 'Card', name: 'Debit/Credit', color: 'from-indigo-600 to-blue-500' }
                ].map((gw) => (
                  <button
                    key={gw.id}
                    type="button"
                    onClick={() => setPaymentGateway(gw.id as any)}
                    className={`p-3 rounded-xl border font-bold text-center transition ${
                      paymentGateway === gw.id
                        ? 'bg-slate-800 border-emerald-500 text-white shadow-md ring-1 ring-emerald-500'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {gw.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Account details */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                {paymentGateway === 'Card' ? 'Card / Account Details' : 'Mobile Account Number'}
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-emerald-500"
                placeholder="03001234567"
                required
              />
            </div>

            {/* Checkout CTA */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] text-slate-400">Total Payable Amount:</p>
                <p className="text-2xl font-black text-emerald-400">PKR {planDetails.amountPKR}</p>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition disabled:opacity-50"
              >
                {isProcessing ? 'Redirecting to Checkout...' : 'Pay & Activate Pass'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
