import React from 'react';
import { 
  Car, 
  Bell, 
  PlusCircle, 
  LogOut,
  MessageSquare
} from 'lucide-react';
import { UserRole, Driver, Rider } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentDriver: Driver | null;
  currentRider: Rider | null;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenSubscriptionModal: () => void;
  onOpenRegisterDriverModal: () => void;
  onOpenAuthModal: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onQuickRoleSwitch: (role: UserRole, driverIndex?: number) => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenRegisterDriverModal,
  onOpenAuthModal,
  onQuickRoleSwitch,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 transition-colors">
      {/* Top Quick Role Switcher Bar */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-3 py-1.5 text-xs text-slate-300 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-black tracking-tight text-xs">APNI<span className="text-emerald-400">CAR</span></span>
          <span className="hidden sm:inline text-slate-400">| Role:</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => onQuickRoleSwitch('rider')}
            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition ${
              currentRole === 'rider' 
                ? 'bg-emerald-500 text-slate-950 shadow-sm' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Passenger
          </button>
          <button 
            onClick={() => onQuickRoleSwitch('driver')}
            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition ${
              currentRole === 'driver'
                ? 'bg-emerald-500 text-slate-950 shadow-sm' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Driver
          </button>
          <button 
            onClick={() => onQuickRoleSwitch('admin')}
            className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition ${
              currentRole === 'admin' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            Admin
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => onQuickRoleSwitch('rider')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md">
            <Car className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight text-white leading-none">
              APNI<span className="text-emerald-400">CAR</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">0% Commission Rides</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {currentRole === 'rider' && (
            <button
              onClick={onOpenRegisterDriverModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Become Driver</span>
            </button>
          )}

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* WhatsApp / Sign in button */}
          <button
            onClick={onOpenAuthModal}
            className="p-2 rounded-xl bg-slate-800 text-emerald-400 hover:bg-slate-700 transition"
            title="WhatsApp Verification"
          >
            <MessageSquare className="w-4 h-4" />
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
