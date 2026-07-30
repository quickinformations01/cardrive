import React from 'react';
import { 
  Car, 
  ShieldCheck, 
  UserCheck, 
  Bell, 
  Moon, 
  Sun, 
  CreditCard, 
  PlusCircle, 
  LogOut,
  MapPin,
  RefreshCw,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { UserRole, Driver, Rider } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentDriver: Driver | null;
  currentRider: Rider | null;
  activeTab: 'map' | 'history' | 'subscription' | 'admin' | 'register-driver';
  setActiveTab: (tab: 'map' | 'history' | 'subscription' | 'admin' | 'register-driver') => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenSubscriptionModal: () => void;
  onOpenRegisterDriverModal: () => void;
  onOpenAuthModal: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onQuickRoleSwitch: (role: UserRole, driverIndex?: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  currentDriver,
  currentRider,
  activeTab,
  setActiveTab,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenSubscriptionModal,
  onOpenRegisterDriverModal,
  onOpenAuthModal,
  darkMode,
  setDarkMode,
  onQuickRoleSwitch
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 transition-colors">
      {/* Top Quick Simulator / Persona Switcher Bar */}
      <div className="bg-emerald-950/70 border-b border-emerald-800/40 px-3 py-1.5 text-xs text-emerald-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-emerald-300 font-bold tracking-wide uppercase text-[10px]">Apni Car Platform Demo</span>
          <span className="hidden sm:inline text-slate-400">| Switch Persona:</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button 
            onClick={() => onQuickRoleSwitch('rider')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
              currentRole === 'rider' 
                ? 'bg-emerald-500 text-slate-950 shadow-sm' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            👤 Passenger Mode
          </button>
          <button 
            onClick={() => onQuickRoleSwitch('driver', 0)}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
              currentRole === 'driver' && currentDriver?.status === 'approved'
                ? 'bg-emerald-500 text-slate-950 shadow-sm' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            🚖 Driver (Approved & Subscribed)
          </button>
          <button 
            onClick={() => onQuickRoleSwitch('driver', 3)}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
              currentRole === 'driver' && currentDriver?.status === 'pending'
                ? 'bg-amber-500 text-slate-950 shadow-sm' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            ⏳ Pending Driver
          </button>
          <button 
            onClick={() => onQuickRoleSwitch('admin')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
              currentRole === 'admin' 
                ? 'bg-indigo-500 text-white shadow-sm' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            🛡️ Admin Panel
          </button>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('map')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-900/30 group-hover:scale-105 transition-transform">
            <Car className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                APNI<span className="text-emerald-400">CAR</span>
              </span>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase">
                0% Comm
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wide font-medium">Smart Ride-Hailing Platform</p>
          </div>
        </div>

        {/* Center Tab Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'map' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <MapPin className="w-4 h-4" />
            {currentRole === 'driver' ? 'Driver Radar & Ride' : 'Book Ride'}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'history' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Ride History
          </button>

          {currentRole === 'driver' && (
            <button
              onClick={onOpenSubscriptionModal}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'subscription' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Subscription Plans
            </button>
          )}

          {currentRole === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'admin' ? 'bg-indigo-600 text-white shadow-sm' : 'text-indigo-400 hover:bg-indigo-500/10'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Portal
            </button>
          )}
        </nav>

        {/* Right Action Icons & User Info */}
        <div className="flex items-center gap-2">
          {/* Free Verification / Google Sign-In Button */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 transition shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">WhatsApp / Google</span> Signup
          </button>

          {/* Register as Driver Button */}
          <button
            onClick={onOpenRegisterDriverModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-950/50 hover:brightness-110 transition active:scale-95 shrink-0"
            title="Register as Driver"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Driver</span>
          </button>

          {/* Subscription Badge for Drivers */}
          {currentRole === 'driver' && currentDriver && (
            <button
              onClick={onOpenSubscriptionModal}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                currentDriver.currentSubscription?.status === 'active'
                  ? 'bg-emerald-950/80 border-emerald-600/50 text-emerald-300'
                  : 'bg-rose-950/80 border-rose-600/50 text-rose-300 animate-pulse'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              {currentDriver.currentSubscription?.status === 'active' 
                ? `Active (${currentDriver.currentSubscription.planType.toUpperCase()})` 
                : 'Subscription Expired - Renew'}
            </button>
          )}

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center animate-bounce">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Light/Dark Mode toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Toggle Dark/Light Mode"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
