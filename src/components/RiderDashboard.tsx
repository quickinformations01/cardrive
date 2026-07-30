import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Car, 
  Bike, 
  ShieldCheck, 
  Banknote, 
  Star, 
  Clock, 
  CheckCircle2, 
  PhoneCall, 
  X,
  Zap,
  ArrowRight
} from 'lucide-react';
import { VehicleType, TripRequest, Driver } from '../types';
import { calculateFare } from '../services/store';

interface RiderDashboardProps {
  pickup: { lat: number; lng: number; address: string };
  setPickup: (loc: { lat: number; lng: number; address: string }) => void;
  dropoff: { lat: number; lng: number; address: string } | null;
  setDropoff: (loc: { lat: number; lng: number; address: string } | null) => void;
  onRequestRide: (data: {
    vehicleType: VehicleType;
    pickupAddress: string;
    destAddress: string;
    distanceKm: number;
  }) => void;
  activeTrip: TripRequest | null;
  onCancelTrip?: () => void;
  onRateDriver?: (tripId: string, rating: number, comment: string) => void;
  onlineDriversCount: number;
}

const PRESET_LOCATIONS = [
  { name: 'Liberty Market, Gulberg, Lahore', lat: 31.5204, lng: 74.3587 },
  { name: 'DHA Phase 5, Lahore', lat: 31.4700, lng: 74.4000 },
  { name: 'Packages Mall, Walton Road, Lahore', lat: 31.4822, lng: 74.3642 },
  { name: 'Mall Road / Anarkali, Lahore', lat: 31.5600, lng: 74.3150 },
  { name: 'Clifton Block 4, Karachi', lat: 24.8138, lng: 67.0300 },
  { name: 'F-7 Markaz, Islamabad', lat: 33.7294, lng: 73.0931 }
];

const VEHICLE_OPTIONS: { type: VehicleType; label: string; desc: string; icon: string; time: string }[] = [
  { type: 'bike', label: 'Apni Bike', desc: 'Fast & low cost for single riders', icon: '🏍️', time: '2 mins away' },
  { type: 'rickshaw', label: 'Apni Auto', desc: 'Traditional Auto Rickshaw', icon: '🛺', time: '3 mins away' },
  { type: 'mini', label: 'Apni Mini', desc: 'Hatchback (Alto/Cultus/Vitz)', icon: '🚗', time: '4 mins away' },
  { type: 'sedan', label: 'Apni Comfort', desc: 'Premium Sedan (Corolla/Civic)', icon: '🚘', time: '5 mins away' }
];

export const RiderDashboard: React.FC<RiderDashboardProps> = ({
  pickup,
  setPickup,
  dropoff,
  setDropoff,
  onRequestRide,
  activeTrip,
  onCancelTrip,
  onRateDriver,
  onlineDriversCount
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('mini');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Calculate mock distance between pickup and dropoff
  const distanceKm = dropoff ? 5.8 : 0;
  const estimatedFare = dropoff ? calculateFare(selectedVehicle, distanceKm) : 0;

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dropoff) return;
    onRequestRide({
      vehicleType: selectedVehicle,
      pickupAddress: pickup.address,
      destAddress: dropoff.address,
      distanceKm
    });
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTrip && onRateDriver) {
      onRateDriver(activeTrip.id, userRating, reviewComment);
      setShowRatingModal(false);
      setReviewComment('');
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Search & Fare Estimation Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400" />
              Book Your Ride
            </h2>
            <p className="text-xs text-slate-400">Direct cash payment to driver • 0% Commission</p>
          </div>
          <span className="bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {onlineDriversCount} Drivers Active Nearby
          </span>
        </div>

        {/* Location Form */}
        <div className="space-y-3">
          {/* Pickup Address */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <MapPin className="w-4 h-4" /> Pickup Location
              </span>
              <span className="text-[10px] text-slate-500">Tap map or choose preset</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={pickup.address}
                onChange={(e) => setPickup({ ...pickup, address: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                placeholder="Enter pickup location"
              />
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            <span className="text-slate-500 shrink-0 font-medium">Quick Pick:</span>
            {PRESET_LOCATIONS.slice(0, 3).map((loc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setDropoff({ lat: loc.lat, lng: loc.lng, address: loc.name })}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700/60 whitespace-nowrap transition"
              >
                📍 {loc.name.split(',')[0]}
              </button>
            ))}
          </div>

          {/* Destination Address */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-rose-400">
                <Navigation className="w-4 h-4" /> Dropoff Destination
              </span>
            </label>
            <input
              type="text"
              value={dropoff?.address || ''}
              onChange={(e) => setDropoff({ lat: 31.4822, lng: 74.3642, address: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
              placeholder="Where are you going?"
            />
          </div>
        </div>

        {/* Vehicle Selection Grid */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">Select Vehicle Category</label>
          <div className="grid grid-cols-2 gap-2.5">
            {VEHICLE_OPTIONS.map((opt) => {
              const fareForOpt = dropoff ? calculateFare(opt.type, distanceKm) : null;
              return (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setSelectedVehicle(opt.type)}
                  className={`p-3 rounded-xl text-left border transition flex flex-col justify-between ${
                    selectedVehicle === opt.type
                      ? 'bg-emerald-950/60 border-emerald-500 shadow-lg shadow-emerald-950/30'
                      : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{opt.icon}</span>
                    <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {opt.time}
                    </span>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-xs font-bold text-white">{opt.label}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{opt.desc}</p>
                    {fareForOpt && (
                      <p className="text-sm font-black text-emerald-400 mt-1">
                        PKR {fareForOpt}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fare Summary & Booking Button */}
        {dropoff && (
          <div className="bg-slate-800/90 rounded-xl p-3.5 border border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Estimated Distance & Fare</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-emerald-400">PKR {estimatedFare}</span>
                <span className="text-xs text-slate-400">({distanceKm} km)</span>
              </div>
              <p className="text-[10px] text-emerald-300/80 mt-0.5 flex items-center gap-1">
                <Banknote className="w-3 h-3" /> Pay cash directly to driver on arrival
              </p>
            </div>
            <button
              onClick={handleBookSubmit}
              disabled={!!activeTrip && activeTrip.status !== 'completed'}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 font-black text-slate-950 shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition disabled:opacity-50"
            >
              <span>{activeTrip ? 'Trip in Progress' : 'Request Ride'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Active Trip Status Modal / Floating Drawer */}
      {activeTrip && (
        <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-2xl p-5 shadow-2xl relative overflow-hidden space-y-4 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="text-base font-bold text-white">
                {activeTrip.status === 'requested' && 'Searching for Nearby Drivers...'}
                {activeTrip.status === 'accepted' && 'Driver Confirmed & En Route'}
                {activeTrip.status === 'arrived' && 'Driver Has Arrived at Pickup!'}
                {activeTrip.status === 'in_progress' && 'Trip in Progress'}
                {activeTrip.status === 'completed' && 'Trip Completed!'}
              </h3>
            </div>
            {activeTrip.status === 'requested' && onCancelTrip && (
              <button 
                onClick={onCancelTrip}
                className="text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 font-semibold"
              >
                Cancel Request
              </button>
            )}
          </div>

          {/* Assigned Driver Card */}
          {activeTrip.driverName && (
            <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-700 overflow-hidden border border-emerald-500/50">
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
                    alt="Driver" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {activeTrip.driverName}
                    <span className="text-xs text-amber-400 font-semibold flex items-center">
                      <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" /> {activeTrip.driverRating || 4.9}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-300 font-mono">{activeTrip.driverVehicleReg}</p>
                  <p className="text-[10px] text-emerald-400 font-medium">0% Commission Apni Car Driver</p>
                </div>
              </div>

              <a 
                href={`tel:${activeTrip.driverMobile || '03000000000'}`}
                className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition flex items-center justify-center"
                title="Call Driver"
              >
                <PhoneCall className="w-5 h-5" />
              </a>
            </div>
          )}

          {/* Route Summary */}
          <div className="text-xs space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <p className="text-slate-300 flex items-center gap-2">
              <span className="text-emerald-400 font-bold">A:</span> {activeTrip.pickupAddress}
            </p>
            <p className="text-slate-300 flex items-center gap-2">
              <span className="text-rose-400 font-bold">B:</span> {activeTrip.destAddress}
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 font-bold">
              <span className="text-slate-400">Total Cash Fare:</span>
              <span className="text-base text-emerald-400">PKR {activeTrip.estimatedFarePKR}</span>
            </div>
          </div>

          {/* Complete Trip Action for Passenger */}
          {activeTrip.status === 'completed' && (
            <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-xl p-4 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-white">Ride Completed Successfully</h4>
                <p className="text-xs text-emerald-200/80">Please pay PKR {activeTrip.estimatedFarePKR} cash directly to the driver.</p>
              </div>
              <button
                onClick={() => setShowRatingModal(true)}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 font-black text-slate-950 text-xs uppercase tracking-wider transition"
              >
                Rate Your Driver ★★★★★
              </button>
            </div>
          )}
        </div>
      )}

      {/* Driver Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white text-center">Rate Your Driver</h3>
            <div className="flex justify-center gap-2 text-2xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setUserRating(star)}
                  className={`p-1 transition ${star <= userRating ? 'text-amber-400 scale-110' : 'text-slate-600'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Leave feedback for the driver..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Skip
              </button>
              <button
                onClick={handleRatingSubmit}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
