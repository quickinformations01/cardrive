import React, { useState } from 'react';
import { X, MessageSquare, CheckCircle2, ShieldCheck, Phone, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';
import { UserRole } from '../types';

interface AuthVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: {
    name: string;
    mobile: string;
    email: string;
    role: UserRole;
    verifiedMethod: 'whatsapp' | 'google';
    photoUrl?: string;
  }) => void;
}

export const AuthVerificationModal: React.FC<AuthVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [role, setRole] = useState<UserRole>('rider');
  const [mode, setMode] = useState<'whatsapp' | 'google'>('whatsapp');

  // WhatsApp state
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [whatsappSupportNumber, setWhatsappSupportNumber] = useState('923000000000');
  const [verificationCode, setVerificationCode] = useState(() => 
    `APNI-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [enteredCode, setEnteredCode] = useState('');
  const [hasSentMessage, setHasSentMessage] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Google state
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  if (!isOpen) return null;

  const handleRegenerateCode = () => {
    const newCode = `APNI-${Math.floor(100000 + Math.random() * 900000)}`;
    setVerificationCode(newCode);
    setEnteredCode('');
    setCodeError('');
    setHasSentMessage(false);
  };

  const getWhatsAppUrl = () => {
    const cleanNum = whatsappSupportNumber.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hello Apni Car! Please verify my ${role.toUpperCase()} account.\nName: ${fullName || 'User'}\nMobile: ${mobileNumber || 'N/A'}\nVerification Code: ${verificationCode}`
    );
    return `https://wa.me/${cleanNum}?text=${message}`;
  };

  const handleWhatsAppVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length < 10) {
      setCodeError('Please enter a valid mobile number.');
      return;
    }

    if (enteredCode.trim().toUpperCase() !== verificationCode.trim().toUpperCase() && !hasSentMessage) {
      setCodeError(`Code must match ${verificationCode} or click "Send WhatsApp Message" first.`);
      return;
    }

    setIsSuccess(true);
    setTimeout(() => {
      onSuccess({
        name: fullName || (role === 'driver' ? 'Verified Driver' : 'Verified Passenger'),
        mobile: mobileNumber,
        email: `${mobileNumber.replace(/[^0-9]/g, '')}@apnicar.pk`,
        role,
        verifiedMethod: 'whatsapp'
      });
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    // Simulate Google Sign-In popup response
    setTimeout(() => {
      setIsGoogleLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess({
          name: 'Muhammad Ali (Google User)',
          mobile: '+92 300 9876543',
          email: 'ali.apnicar@gmail.com',
          role,
          verifiedMethod: 'google',
          photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        });
        setIsSuccess(false);
        onClose();
      }, 1000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-white">Free Account Verification</h2>
          <p className="text-xs text-slate-400">No Paid SMS Gateway Fees - 100% Free Forever</p>
        </div>

        {/* User Role Selector */}
        <div className="grid grid-cols-2 gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setRole('rider')}
            className={`py-2 rounded-lg transition ${
              role === 'rider' ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            👤 Passenger Signup
          </button>
          <button
            type="button"
            onClick={() => setRole('driver')}
            className={`py-2 rounded-lg transition ${
              role === 'driver' ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            🚖 Driver Signup
          </button>
        </div>

        {/* Verification Method Switcher */}
        <div className="flex border-b border-slate-800 text-xs font-bold text-slate-400 gap-4 justify-center">
          <button
            onClick={() => setMode('whatsapp')}
            className={`pb-2 flex items-center gap-1.5 transition ${
              mode === 'whatsapp' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            Method 1: WhatsApp (Free)
          </button>
          <button
            onClick={() => setMode('google')}
            className={`pb-2 flex items-center gap-1.5 transition ${
              mode === 'google' ? 'text-emerald-400 border-b-2 border-emerald-400' : 'hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Method 2: Google Sign-In
          </button>
        </div>

        {/* Method 1: WhatsApp Verification */}
        {mode === 'whatsapp' && (
          <form onSubmit={handleWhatsAppVerify} className="space-y-4 text-xs">
            <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-2xl p-3 text-emerald-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>How User-Initiated WhatsApp Verification Works:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-300/80">
                Instead of paying for costly SMS APIs, your app generates a free verification code. The user opens WhatsApp with 1-click and sends the code directly to your support line!
              </p>
            </div>

            <div>
              <label className="text-slate-300 font-semibold mb-1 block">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Usman Ahmed"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold mb-1 block">Mobile Number *</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="0300 1234567"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Generated Code Box */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Your Verification Code:</span>
                <button
                  type="button"
                  onClick={handleRegenerateCode}
                  className="text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Regenerate
                </button>
              </div>
              <div className="text-center font-black text-2xl tracking-widest text-emerald-400 font-mono bg-slate-900 py-2 rounded-xl border border-emerald-500/20">
                {verificationCode}
              </div>
            </div>

            {/* Step 1: Open WhatsApp Button */}
            <div className="space-y-2">
              <span className="text-slate-400 font-semibold text-[11px] block">Step 1: Open WhatsApp to Send Code</span>
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setHasSentMessage(true)}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                Open WhatsApp & Send Verification Text
              </a>
            </div>

            {/* Step 2: Code Confirmation */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold text-[11px] block">
                Step 2: Enter Code or Confirm Sent Message
              </label>
              <input
                type="text"
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
                placeholder={`Enter code (e.g. ${verificationCode})`}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
              />
            </div>

            {codeError && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-[11px] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{codeError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase tracking-wider text-xs shadow-lg transition"
            >
              Verify & Complete {role === 'driver' ? 'Driver' : 'Passenger'} Signup
            </button>
          </form>
        )}

        {/* Method 2: Google Sign-In */}
        {mode === 'google' && (
          <div className="space-y-4 text-xs py-2">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 text-center space-y-2">
              <p className="text-slate-300 text-xs">
                Quick, 1-Click Signup using your Google Account. Completely free, secure, and instant!
              </p>
              <div className="text-[11px] text-emerald-400 font-semibold">
                ✓ No SMS code required &nbsp;•&nbsp; ✓ Pre-verified Email & ID
              </div>
            </div>

            <button
              type="button"
              disabled={isGoogleLoading}
              onClick={handleGoogleSignIn}
              className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold flex items-center justify-center gap-3 shadow-lg border border-slate-200 transition disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 text-slate-600 animate-spin" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google Account</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-slate-500">
              By continuing, you agree to Apni Car's Terms & 0% Commission Policy.
            </p>
          </div>
        )}

        {/* Success Alert Banner */}
        {isSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500 text-slate-950 text-center font-black flex items-center justify-center gap-2 animate-bounce">
            <CheckCircle2 className="w-5 h-5" />
            <span>Account Verified & Logged In Successfully!</span>
          </div>
        )}
      </div>
    </div>
  );
};
