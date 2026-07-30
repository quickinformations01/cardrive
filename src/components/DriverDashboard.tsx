import React from 'react';
import { 
  Power, 
  CreditCard, 
  Wallet, 
  Car, 
  Star, 
  MapPin, 
  Navigation, 
  PhoneCall, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp,
  User,
  ListOrdered
} from 'lucide-react';
import { Driver, TripRequest, DriverTab } from '../types';

interface DriverDashboardProps {
  driver: Driver;
  onToggleOnline: (isOnline: boolean) => void;
  onOpenSubscriptionModal: () => void;
  activeTripRequest: TripRequest | null;
  onAcceptTrip: (tripId: string) => void;
  onUpdateTripStatus: (tripId: string, status: 'arrived' | 'in_progress' | 'completed') => void;
  pendingTripsCount: number;
  driverTab?: DriverTab;
}

export const DriverDashboard: React.FC<DriverDashboardProps> = ({
  driver,
  onToggleOnline,
  onOpenSubscriptionModal,
  activeTripRequest,
  onAcceptTrip,
  onUpdateTripStatus,
  driverTab = 'home'
}) => {
  const isSubscribed = driver.currentSubscription?.status === 'active';
  const isApproved = driver.status === 'approved';

  // Calculate days remaining on subscription
  let daysLeft = 0;
  if (driver.currentSubscription?.expiryDate) {
    const diff = new Date(driver.currentSubscription.expiryDate).getTime() - Date.now();
    daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // Render Sub-Views based on Driver Bottom Tab
  if (driverTab === 'trips') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ListOrdered className="w-5 h-5 text-emerald-400" />
          Completed Trips
        </h3>
        {activeTripRequest ? (
          <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-400 uppercase">{activeTripRequest.status}</span>
              <span className="text-xs text-slate-400">{new Date(activeTripRequest.createdAt).toLocaleTimeString()}</span>
            </div>
            <p className="text-xs text-white">Pickup: {activeTripRequest.pickupAddress}</p>
            <p className="text-xs text-white">Dropoff: {activeTripRequest.destAddress}</p>
            <div className="flex justify-between items-center pt-2 border-t border-slate-700 font-bold text-xs">
              <span className="text-slate-300">Cash Fare:</span>
              <span className="text-emerald-400">PKR {activeTripRequest.estimatedFarePKR}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-6 text-center">No completed trips yet today.</p>
        )}
      </div>
    );
  }

  if (driverTab === 'wallet') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-400" />
          Driver Wallet & Subscription
        </h3>

        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 font-semibold">Total Earnings</span>
            <span className="text-xl font-black text-emerald-400">PKR {driver.totalEarnings}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-slate-700">
            <span className="text-xs text-slate-400 font-semibold">Commission Deducted</span>
            <span className="text-xs font-bold text-emerald-400">0% (Keep 100%)</span>
          </div>
        </div>

        <div className="p-4 bg-emerald-950/60 border border-emerald-500/30 rounded-2xl space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-white">Subscription Status</h4>
            <span className="text-xs font-bold text-emerald-400">{isSubscribed ? 'Active Pass' : 'Expired'}</span>
          </div>
          <p className="text-xs text-slate-300">Days Remaining: {daysLeft} Days</p>
          <button
            onClick={onOpenSubscriptionModal}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 font-black text-slate-950 text-xs uppercase"
          >
            Renew Subscription Pass
          </button>
        </div>
      </div>
    );
  }

  if (driverTab === 'profile') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-400" />
          Driver Profile & Vehicle
        </h3>
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 space-y-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Name</span>
            <p className="text-sm font-bold text-white">{driver.fullName}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Father Name</span>
            <p className="text-sm font-bold text-slate-200">{driver.fatherName}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">CNIC</span>
            <p className="text-sm font-mono text-slate-200">{driver.cnic}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Vehicle</span>
            <p className="text-sm font-bold text-emerald-400">{driver.vehicle.brand} {driver.vehicle.model} ({driver.vehicle.regNumber})</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Payout Method</span>
            <p className="text-sm font-bold text-teal-400">{driver.payoutMethod || 'JazzCash'} ({driver.payoutAccountNumber})</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Driver Status & Online Toggle Banner */}
      <div className={`rounded-2xl p-5 border shadow-2xl transition ${
        driver.isOnline 
          ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border-emerald-500/60' 
          : 'bg-slate-900 border-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 overflow-hidden border-2 border-emerald-500/50 shrink-0">
              <img 
                src={driver.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                alt={driver.fullName}
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">{driver.fullName}</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                  isApproved 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}>
                  {driver.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {driver.vehicle.brand} {driver.vehicle.model} ({driver.vehicle.type.toUpperCase()}) • <span className="font-mono text-emerald-400">{driver.vehicle.regNumber}</span>
              </p>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-300">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" /> {driver.rating}
                </span>
                <span>•</span>
                <span>{driver.totalTrips} Trips Done</span>
              </div>
            </div>
          </div>

          {/* Online / Offline Power Button */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => onToggleOnline(!driver.isOnline)}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl transition ${
                driver.isOnline 
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950/50' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <Power className={`w-4 h-4 ${driver.isOnline ? 'text-slate-950' : 'text-slate-400'}`} />
              <span>{driver.isOnline ? 'YOU ARE ONLINE' : 'GO ONLINE'}</span>
            </button>
          </div>
        </div>

        {/* Subscription Status Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-medium">Subscription Status:</span>
            {isSubscribed ? (
              <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Active ({daysLeft} Days Remaining)
              </span>
            ) : (
              <span className="font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Expired or Inactive
              </span>
            )}
          </div>

          <button
            onClick={onOpenSubscriptionModal}
            className="text-emerald-400 hover:text-emerald-300 font-bold underline flex items-center gap-1 text-xs"
          >
            {isSubscribed ? 'Renew / Upgrade Plan' : 'Buy Subscription Pass (from PKR 30/day)'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Driver Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Car className="w-4 h-4 text-emerald-400" /> Total Trips
          </p>
          <p className="text-2xl font-black text-white mt-1">{driver.totalTrips}</p>
          <span className="text-[10px] text-emerald-400 font-semibold">100% Direct Driver</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-teal-400" /> Lifetime Earnings
          </p>
          <p className="text-2xl font-black text-emerald-400 mt-1">PKR {driver.totalEarnings}</p>
          <span className="text-[10px] text-slate-400 font-medium">0% Commission Deducted</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl col-span-2 sm:col-span-1">
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-amber-400" /> Rating & Reviews
          </p>
          <p className="text-2xl font-black text-amber-400 mt-1 flex items-center gap-1">
            {driver.rating} <span className="text-sm">★</span>
          </p>
          <span className="text-[10px] text-slate-400 font-medium">Top Rated Driver</span>
        </div>
      </div>

      {/* Live Ride Request Radar Alert Modal / Active Dispatch Card */}
      {activeTripRequest && activeTripRequest.status === 'requested' && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-400 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="text-base font-extrabold text-white">NEW RIDE REQUEST NEARBY!</h3>
            </div>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
              0% Commission
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
              <p className="text-slate-400 font-medium">Pickup Location:</p>
              <p className="text-slate-100 font-bold flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" /> {activeTripRequest.pickupAddress}
              </p>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
              <p className="text-slate-400 font-medium">Destination:</p>
              <p className="text-slate-100 font-bold flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-rose-400 shrink-0" /> {activeTripRequest.destAddress}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-emerald-900/40 p-3 rounded-xl border border-emerald-600/30">
            <div>
              <p className="text-[11px] text-emerald-200">Total Cash Fare You Collect:</p>
              <p className="text-2xl font-black text-emerald-400">PKR {activeTripRequest.estimatedFarePKR}</p>
            </div>
            <div className="text-right text-xs text-slate-300">
              <p>Rider: <span className="font-bold text-white">{activeTripRequest.riderName}</span></p>
              <p className="text-[11px] text-slate-400">Distance: {activeTripRequest.distanceKm} km</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => onAcceptTrip(activeTripRequest.id)}
              className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-950/50 transition flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" /> ACCEPT RIDE NOW
            </button>
          </div>
        </div>
      )}

      {/* Active Ride Navigation Workflow */}
      {activeTripRequest && activeTripRequest.driverId === driver.id && activeTripRequest.status !== 'completed' && (
        <div className="bg-slate-900 border-2 border-emerald-500 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-400" />
              Active Ride Navigation
            </h3>
            <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full uppercase border border-emerald-500/20">
              {activeTripRequest.status}
            </span>
          </div>

          {/* Passenger Info Card */}
          <div className="bg-slate-800 p-3.5 rounded-xl border border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Passenger Name:</p>
              <p className="text-sm font-bold text-white">{activeTripRequest.riderName}</p>
              <p className="text-xs text-slate-300 font-mono">{activeTripRequest.riderMobile}</p>
            </div>
            <a
              href={`tel:${activeTripRequest.riderMobile}`}
              className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition"
              title="Call Passenger"
            >
              <PhoneCall className="w-5 h-5" />
            </a>
          </div>

          {/* Route Info */}
          <div className="text-xs space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <p className="text-slate-300">
              <strong className="text-emerald-400">Pickup:</strong> {activeTripRequest.pickupAddress}
            </p>
            <p className="text-slate-300">
              <strong className="text-rose-400">Dropoff:</strong> {activeTripRequest.destAddress}
            </p>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold">
              <span>Cash Fare to Collect:</span>
              <span className="text-emerald-400 font-black">PKR {activeTripRequest.estimatedFarePKR}</span>
            </div>
          </div>

          {/* Progress Step Action Buttons */}
          <div className="pt-2">
            {activeTripRequest.status === 'accepted' && (
              <button
                onClick={() => onUpdateTripStatus(activeTripRequest.id, 'arrived')}
                className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-400 font-black text-slate-950 text-xs uppercase tracking-wider shadow-lg transition"
              >
                1. I HAVE ARRIVED AT PICKUP
              </button>
            )}

            {activeTripRequest.status === 'arrived' && (
              <button
                onClick={() => onUpdateTripStatus(activeTripRequest.id, 'in_progress')}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 font-black text-slate-950 text-xs uppercase tracking-wider shadow-lg transition"
              >
                2. PASSENGER BOARDED - START TRIP
              </button>
            )}

            {activeTripRequest.status === 'in_progress' && (
              <button
                onClick={() => onUpdateTripStatus(activeTripRequest.id, 'completed')}
                className="w-full py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 font-black text-slate-950 text-sm uppercase tracking-wider shadow-xl transition flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                3. COMPLETE TRIP & COLLECT PKR {activeTripRequest.estimatedFarePKR} CASH
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
