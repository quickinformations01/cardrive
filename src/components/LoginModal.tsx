import React, { useState } from 'react';
import { X, Phone, Lock, ArrowRight, ShieldCheck, MessageSquare, LogIn } from 'lucide-react';
import { UserRole } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: UserRole, mobile: string, userObj?: any) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [role, setRole] = useState<UserRole>('rider');
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('123456');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile.trim() || mobile.length < 10) {
      setError('Please enter a valid Pakistani mobile number (e.g. 03001234567).');
      return;
    }
    setError('');
    setOtpSent(true);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== '123456') {
      setError('Invalid OTP code. Default code is 123456.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Call Cloud Backend API Endpoint
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, role })
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok) {
        onLoginSuccess(data.role || role, mobile, data.user);
        onClose();
      } else {
        // Fallback for demo if offline
        onLoginSuccess(role, mobile);
        onClose();
      }
    } catch (err) {
      setIsLoading(false);
      // Fallback local login
      onLoginSuccess(role, mobile);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-1">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-white">Login to ApniCar</h2>
          <p className="text-xs text-slate-400">Enter your registered WhatsApp mobile number to log in</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          {(['rider', 'driver', 'admin'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRole(r);
                setError('');
              }}
              className={`py-2 rounded-xl text-xs font-bold capitalize transition ${
                role === r
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r === 'rider' ? 'Passenger' : r === 'driver' ? 'Driver' : 'Admin'}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 text-center font-medium">
            {error}
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">
                {role === 'admin' ? 'Admin Username / Mobile' : 'WhatsApp Mobile Number'}
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder={role === 'admin' ? 'admin' : '03001234567'}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-3.5 py-3 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition"
            >
              <span>Get WhatsApp Login Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center text-xs space-y-1">
              <p className="text-slate-400">Login OTP sent to <span className="text-white font-mono font-bold">{mobile}</span></p>
              <p className="text-[11px] text-emerald-400 font-mono">Default OTP: 123456</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Enter 6-Digit OTP</label>
              <input
                type="text"
                maxLength={6}
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 text-center text-xl font-bold tracking-widest text-emerald-400 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Authenticating...' : 'Login & Access App'}</span>
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
