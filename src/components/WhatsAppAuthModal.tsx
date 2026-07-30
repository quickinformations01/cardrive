import React, { useState } from 'react';
import { X, CheckCircle2, Phone, MessageSquare, ArrowRight, ExternalLink, Copy, Check } from 'lucide-react';

interface WhatsAppAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'rider' | 'driver';
  onVerified: (name: string, mobile: string) => void;
}

export const WhatsAppAuthModal: React.FC<WhatsAppAuthModalProps> = ({
  isOpen,
  onClose,
  role,
  onVerified
}) => {
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    const cleanNum = mobile.trim().replace(/\s+/g, '');
    if (cleanNum.length < 10) {
      setError('Please enter a valid mobile number (e.g., 03001234567 or +923001234567).');
      return;
    }
    setError('');

    // Generate random 6-digit WhatsApp OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    setOtpCode(''); // Let user enter or paste code
  };

  const handleOpenWhatsApp = () => {
    let cleanNum = mobile.replace(/[^0-9]/g, '');
    if (cleanNum.startsWith('03')) {
      cleanNum = '92' + cleanNum.substring(1);
    }
    const text = encodeURIComponent(`ApniCar Verification Code for ${fullName}: ${generatedOtp}. Enter this code in ApniCar app.`);
    window.open(`https://api.whatsapp.com/send?phone=${cleanNum}&text=${text}`, '_blank');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedOtp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim() !== generatedOtp && otpCode.trim() !== '123456') {
      setError(`Invalid OTP Code. Please enter ${generatedOtp} (or 123456).`);
      return;
    }

    setIsVerifying(true);
    setError('');

    // Register user to Cloudflare D1 Worker API asynchronously
    try {
      await fetch('https://apnicar-backend.quickinformations01.workers.dev/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: mobile.trim(),
          password: 'UserSecretPassword123',
          role: role === 'driver' ? 'driver' : 'passenger',
          city: 'Lahore'
        })
      });
    } catch (err) {
      console.warn('Cloudflare D1 backend sync info:', err);
    }

    setTimeout(() => {
      setIsVerifying(false);
      onVerified(fullName.trim(), mobile.trim());
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-2">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-white">WhatsApp Verification</h3>
          <p className="text-xs text-slate-400">
            {role === 'rider' ? 'Sign in as Passenger' : 'Sign in as Driver'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 text-center font-medium">
            {error}
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., Ali Ahmed"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">WhatsApp Mobile Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="03001234567"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition"
            >
              <span>Generate WhatsApp Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Mobile:</span>
                <span className="text-white font-mono font-bold">{mobile}</span>
              </div>

              <div className="p-3 bg-emerald-950/50 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Your Verification Code</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono tracking-widest">{generatedOtp}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold flex items-center gap-1 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {/* Action: Open WhatsApp App */}
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full py-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Open WhatsApp to Send Code</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </button>

              <button
                type="button"
                onClick={() => setOtpCode(generatedOtp)}
                className="w-full text-center text-[11px] text-emerald-400 underline hover:text-emerald-300 font-medium"
              >
                Auto-fill Code ({generatedOtp})
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Enter 6-Digit Verification Code</label>
              <input
                type="text"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-3 text-center text-xl font-bold tracking-widest text-emerald-400 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isVerifying ? 'Verifying & Saving...' : 'Verify & Complete'}</span>
            </button>

            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="w-full text-center text-xs text-slate-400 hover:text-white"
            >
              Change Mobile Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

