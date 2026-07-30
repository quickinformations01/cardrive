import React, { useState } from 'react';
import { Car, UserCheck, ShieldCheck, Phone, ArrowRight, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onContinueAsPassenger: () => void;
  onBecomeDriver: () => void;
  onOpenWhatsAppAuth: (role: 'rider' | 'driver') => void;
  onAdminLogin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onContinueAsPassenger,
  onBecomeDriver,
  onOpenWhatsAppAuth,
  onAdminLogin
}) => {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-6 px-4">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
        
        {/* Brand Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-xl shadow-emerald-500/20 mb-1">
            <Car className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">
            APNI<span className="text-emerald-400">CAR</span>
          </h1>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/90">
            Pakistan's 0% Commission Ride Sharing
          </p>
          <p className="text-xs text-slate-400">
            Direct cash fares between passengers & verified drivers across Pakistan.
          </p>
        </div>

        {/* Primary Choice Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onContinueAsPassenger}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:brightness-110 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center justify-between transition active:scale-98 group"
          >
            <span className="flex items-center gap-2.5">
              <UserCheck className="w-5 h-5" />
              <span>Continue as Passenger</span>
            </span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onBecomeDriver}
            className="w-full py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white font-bold text-sm tracking-wide shadow-md flex items-center justify-between transition active:scale-98 group"
          >
            <span className="flex items-center gap-2.5">
              <span className="text-lg">🚖</span>
              <span>Become a Driver</span>
            </span>
            <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
              0% Fee
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-slate-900 px-3 text-slate-500 font-medium">Already have an account?</span>
          </div>
        </div>

        {/* Quick Login Options */}
        <div className="space-y-2.5">
          <button
            onClick={() => onOpenWhatsAppAuth('rider')}
            className="w-full py-3 px-4 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 transition"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>Continue with WhatsApp Verification</span>
          </button>

          <button
            onClick={() => onOpenWhatsAppAuth('rider')}
            className="w-full py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>

        {/* Footer info & Admin Login */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/80">
          <span className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Verified Drivers & Rides
          </span>
          {onAdminLogin && (
            <button
              onClick={onAdminLogin}
              className="text-slate-400 hover:text-white font-mono hover:underline"
            >
              Admin Portal
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
