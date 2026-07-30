import React from 'react';
import { Home, History, Wallet, User, Compass, Car, ListOrdered } from 'lucide-react';
import { PassengerTab, DriverTab, UserRole } from '../types';

interface BottomNavProps {
  role: UserRole;
  passengerTab: PassengerTab;
  driverTab: DriverTab;
  onSelectPassengerTab: (tab: PassengerTab) => void;
  onSelectDriverTab: (tab: DriverTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  role,
  passengerTab,
  driverTab,
  onSelectPassengerTab,
  onSelectDriverTab
}) => {
  if (role === 'admin') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-800 backdrop-blur-xl px-4 py-2.5 shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {role === 'rider' ? (
          <>
            <button
              onClick={() => onSelectPassengerTab('home')}
              className={`flex flex-col items-center gap-1 transition ${
                passengerTab === 'home' ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px]">Home</span>
            </button>

            <button
              onClick={() => onSelectPassengerTab('history')}
              className={`flex flex-col items-center gap-1 transition ${
                passengerTab === 'history' ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-5 h-5" />
              <span className="text-[10px]">History</span>
            </button>

            <button
              onClick={() => onSelectPassengerTab('wallet')}
              className={`flex flex-col items-center gap-1 transition ${
                passengerTab === 'wallet' ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wallet className="w-5 h-5" />
              <span className="text-[10px]">Wallet</span>
            </button>

            <button
              onClick={() => onSelectPassengerTab('profile')}
              className={`flex flex-col items-center gap-1 transition ${
                passengerTab === 'profile' ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px]">Profile</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onSelectDriverTab('home')}
              className={`flex flex-col items-center gap-1 transition ${
                driverTab === 'home' ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px]">Home</span>
            </button>

            <button
              onClick={() => onSelectDriverTab('trips')}
              className={`flex flex-col items-center gap-1 transition ${
                driverTab === 'trips' ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListOrdered className="w-5 h-5" />
              <span className="text-[10px]">Trips</span>
            </button>

            <button
              onClick={() => onSelectDriverTab('wallet')}
              className={`flex flex-col items-center gap-1 transition ${
                driverTab === 'wallet' ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wallet className="w-5 h-5" />
              <span className="text-[10px]">Wallet</span>
            </button>

            <button
              onClick={() => onSelectDriverTab('profile')}
              className={`flex flex-col items-center gap-1 transition ${
                driverTab === 'profile' ? 'text-emerald-400 font-bold scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px]">Profile</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
