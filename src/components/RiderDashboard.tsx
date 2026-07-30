import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Car, 
  Banknote, 
  Star, 
  CheckCircle2, 
  PhoneCall, 
  Zap,
  ArrowRight,
  Crosshair,
  UserPlus,
  Clock,
  Wallet,
  User,
  History,
  ShieldCheck
} from 'lucide-react';
import { VehicleType, TripRequest, Rider, PassengerTab, FareRates } from '../types';
import { calculateRoadDistanceAndDuration, calculateDetailedFare, DEFAULT_FARE_RATES } from '../services/store';

interface RiderDashboardProps {
  pickup: { lat: number; lng: number; address: string };
  setPickup: (loc: { lat: number; lng: number; address: string }) => void;
  dropoff: { lat: number; lng: number; address: string } | null;
  setDropoff: (loc: { lat: number; lng: number; address: string }) => void;
  onRequestRide: (data: {
    vehicleType: VehicleType;
    pickupAddress: string;
    destAddress: string;
    distanceKm: number;
    estimatedDurationMin: number;
    estimatedFarePKR: number;
  }) => void;
  activeTrip: TripRequest | null;
  onCancelTrip?: () => void;
  onRateDriver?: (tripId: string, rating: number, comment: string) => void;
  onlineDriversCount: number;
  onOpenRegisterDriverModal?: () => void;
  currentRider: Rider;
  passengerTab?: PassengerTab;
  fareRates?: FareRates;
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
  { type: 'bike', label: 'Apni Bike', desc: 'Base Rs. 70 + Rs. 18/km', icon: '🏍️', time: '2 mins away' },
  { type: 'rickshaw', label: 'Apni Auto', desc: 'Base Rs. 90 + Rs. 22/km', icon: '🛺', time: '3 mins away' },
  { type: 'mini', label: 'Apni Mini', desc: 'Base Rs. 120 + Rs. 30/km', icon: '🚗', time: '4 mins away' },
  { type: 'sedan', label: 'Apni Comfort', desc: 'Base Rs. 250 + Rs. 45/km', icon: '🚘', time: '5 mins away' }
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
  onlineDriversCount,
  onOpenRegisterDriverModal,
  currentRider,
  passengerTab = 'home',
  fareRates
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('mini');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  
  // GPS Location states
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Calculate Road Route Distance & Duration
  const { roadKm, durationMin } = dropoff 
    ? calculateRoadDistanceAndDuration(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng)
    : { roadKm: 6.5, durationMin: 15 };

  // Calculate Fare using formula: Base + (Dist * PerKM) + (Time * PerMin)
  const fareBreakdown = dropoff 
    ? calculateDetailedFare(selectedVehicle, roadKm, durationMin, fareRates)
    : null;

  const estimatedFare = fareBreakdown ? fareBreakdown.totalFarePKR : 0;

  // Browser GPS Location fetch
  const handleGetGPSLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setPickup({
          lat: latitude,
          lng: longitude,
          address: `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
        });
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        setPickup({
          lat: 31.5204,
          lng: 74.3587,
          address: 'Gulberg III, Lahore (GPS Fallback)'
        });
        setGpsError('GPS permission denied. Using estimated city position.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dropoff) return;
    onRequestRide({
      vehicleType: selectedVehicle,
      pickupAddress: pickup.address,
      destAddress: dropoff.address,
      distanceKm: roadKm,
      estimatedDurationMin: durationMin,
      estimatedFarePKR: estimatedFare
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

  // Render Sub-Views based on Passenger Bottom Tab
  if (passengerTab === 'history') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-400" />
          Ride History
        </h3>
        {activeTrip ? (
          <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-400 uppercase">{activeTrip.vehicleType}</span>
              <span className="text-xs text-slate-400">{new Date(activeTrip.createdAt).toLocaleTimeString()}</span>
            </div>
            <p className="text-xs text-white">Pickup: {activeTrip.pickupAddress}</p>
            <p className="text-xs text-white">Dropoff: {activeTrip.destAddress}</p>
            <div className="flex justify-between items-center pt-2 border-t border-slate-700 font-bold text-xs">
              <span className="text-slate-300">Fare:</span>
              <span className="text-emerald-400">PKR {activeTrip.estimatedFarePKR}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-6 text-center">No past rides recorded yet.</p>
        )}
      </div>
    );
  }

  if (passengerTab === 'wallet') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Wallet className="w-5 h-5 text-emerald-400" />
          Passenger Wallet
        </h3>
        <div className="p-5 bg-gradient-to-r from-emerald-900/60 to-teal-900/60 rounded-2xl border border-emerald-500/30 text-center space-y-2">
          <p className="text-xs text-emerald-300 uppercase tracking-wider font-semibold">Payment Method</p>
          <h4 className="text-2xl font-black text-white">Direct Cash Payment</h4>
          <p className="text-xs text-slate-300">100% of the fare is paid in cash directly to your driver on ride completion.</p>
        </div>
      </div>
    );
  }

  if (passengerTab === 'profile') {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-emerald-400" />
          Passenger Profile
        </h3>
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 space-y-3">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Name</span>
            <p className="text-sm font-bold text-white">{currentRider.fullName}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Mobile Number</span>
            <p className="text-sm font-mono text-emerald-400 font-bold">{currentRider.mobile}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">City</span>
            <p className="text-sm font-bold text-slate-200">{currentRider.city || 'Lahore'}</p>
          </div>
          <div className="pt-2 border-t border-slate-700 flex items-center gap-2 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4" /> Verified Passenger Account
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Driver Registration Callout Banner */}
      {onOpenRegisterDriverModal && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/40 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
              🚖
            </div>
            <div>
              <h3 className="text-xs font-black text-white">Own a Car, Bike, or Rickshaw?</h3>
              <p className="text-[11px] text-emerald-300/90">Earn 100% of your ride fares with 0% Commission!</p>
            </div>
          </div>
          <button
            onClick={onOpenRegisterDriverModal}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shrink-0 transition flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Become Driver</span>
          </button>
        </div>
      )}

      {/* Booking & Fare Estimation Form */}
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
            {onlineDriversCount} Active Drivers
          </span>
        </div>

        {/* Location Inputs */}
        <div className="space-y-3">
          {/* Pickup Address with GPS locate button */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> Pickup Location
              </label>
              <button
                type="button"
                onClick={handleGetGPSLocation}
                disabled={isLocating}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded-lg border border-emerald-500/30 transition disabled:opacity-50"
              >
                <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Locating...' : 'Get GPS Location'}</span>
              </button>
            </div>
            <input
              type="text"
              value={pickup.address}
              onChange={(e) => setPickup({ ...pickup, address: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              placeholder="Enter pickup address or tap GPS button above"
            />
            {gpsError && <p className="text-[10px] text-amber-400 mt-1">{gpsError}</p>}
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
            <span className="text-slate-500 shrink-0 font-medium">Quick Pick:</span>
            {PRESET_LOCATIONS.slice(0, 4).map((loc, i) => (
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
            <label className="text-xs font-semibold text-rose-400 mb-1 flex items-center gap-1.5">
              <Navigation className="w-4 h-4" /> Dropoff Destination
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
              const breakdown = dropoff ? calculateDetailedFare(opt.type, roadKm, durationMin, fareRates) : null;
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
                    {breakdown && (
                      <div className="mt-1">
                        <p className="text-sm font-black text-emerald-400">
                          PKR {breakdown.totalFarePKR}
                        </p>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fare Summary & Formula */}
        {dropoff && fareBreakdown && (
          <div className="space-y-3 bg-slate-800/90 rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Estimated Road Fare</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-400">PKR {estimatedFare}</span>
                  <span className="text-xs text-slate-300 font-mono">({roadKm} KM • ~{durationMin} mins)</span>
                </div>
              </div>
              <button
                onClick={handleBookSubmit}
                disabled={!!activeTrip && activeTrip.status !== 'completed'}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 font-black text-slate-950 shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition disabled:opacity-50"
              >
                <span>{activeTrip ? 'Trip in Progress' : 'Book Ride'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Formula Detail */}
            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-center">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-700">
                <span className="text-slate-400 block">Base Fare</span>
                <span className="text-emerald-400 font-bold">PKR {fareBreakdown.baseFarePKR}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-700">
                <span className="text-slate-400 block">Distance ({roadKm}km)</span>
                <span className="text-amber-400 font-bold">PKR {fareBreakdown.distanceFarePKR}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-700">
                <span className="text-slate-400 block">Time ({durationMin}m)</span>
                <span className="text-teal-400 font-bold">PKR {fareBreakdown.timeFarePKR}</span>
              </div>
            </div>

            <p className="text-[10px] text-emerald-300/90 flex items-center gap-1 justify-center pt-1">
              <Banknote className="w-3.5 h-3.5 text-emerald-400" />
              100% Cash Payment directly to Driver on arrival (0% App Commission)
            </p>
          </div>
        )}
      </div>

      {/* Active Trip Status Modal / Floating Drawer */}
      {activeTrip && (
        <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-2xl p-5 shadow-2xl relative overflow-hidden space-y-4">
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
