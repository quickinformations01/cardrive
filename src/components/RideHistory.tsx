import React from 'react';
import { TripRequest, UserRole } from '../types';
import { MapPin, Navigation, Calendar, Banknote, Star } from 'lucide-react';

interface RideHistoryProps {
  trips: TripRequest[];
  currentRole: UserRole;
  currentUserId: string;
}

export const RideHistory: React.FC<RideHistoryProps> = ({ trips, currentRole, currentUserId }) => {
  const userTrips = trips.filter(t => {
    if (currentRole === 'driver') return t.driverId === currentUserId;
    if (currentRole === 'rider') return t.riderId === currentUserId;
    return true; // Admin sees all
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-400" />
          Ride History Logs
        </h2>
        <span className="text-xs text-slate-400 font-medium">Total: {userTrips.length} Rides</span>
      </div>

      {userTrips.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-xs">
          No ride history found. Book a ride or start driver mode!
        </div>
      ) : (
        <div className="space-y-3">
          {userTrips.map((trip) => (
            <div key={trip.id} className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400">ID: {trip.id}</span>
                <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                  trip.status === 'completed' 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {trip.status}
                </span>
              </div>

              <div className="text-xs space-y-1">
                <p className="text-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {trip.pickupAddress}
                </p>
                <p className="text-slate-200 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-rose-400 shrink-0" /> {trip.destAddress}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Banknote className="w-4 h-4 text-emerald-400" /> PKR {trip.estimatedFarePKR} (Cash)
                </span>
                <span className="text-slate-400 font-mono">
                  {new Date(trip.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
