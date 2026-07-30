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
  ArrowRight,
  Crosshair,
  Fuel,
  Calculator,
  UserPlus,
  Compass
} from 'lucide-react';
import { VehicleType, TripRequest, Driver } from '../types';
import { calculateFuelBasedFare, FareBreakdown } from '../services/store';

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
    estimatedFarePKR: number;
  }) => void;
  activeTrip: TripRequest | null;
  onCancelTrip?: () => void;
  onRateDriver?: (tripId: string, rating: number, comment: string) => void;
  onlineDriversCount: number;
  onOpenRegisterDriverModal?: () => void;
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
  { type: 'bike', label: 'Apni Bike', desc: 'Fast & low cost for single riders (~42 km/L)', icon: '🏍️', time: '2 mins away' },
  { type: 'rickshaw', label: 'Apni Auto', desc: 'Traditional Auto Rickshaw (~22 km/L)', icon: '🛺', time: '3 mins away' },
  { type: 'mini', label: 'Apni Mini', desc: 'Hatchback Alto/Cultus/Vitz (~16 km/L)', icon: '🚗', time: '4 mins away' },
  { type: 'sedan', label: 'Apni Comfort', desc: 'Premium Sedan Corolla/Civic (~12 km/L)', icon: '🚘', time: '5 mins away' }
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
  onOpenRegisterDriverModal
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('mini');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  
  // GPS Location states
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Fuel Price configuration (Default PKR 350 / Liter as requested)
  const [fuelPricePKR, setFuelPricePKR] = useState<number>(350);
  const [manualDistanceKm, setManualDistanceKm] = useState<number>(6.5);

  // Calculated distance in KM and Miles
  const distanceKm = dropoff ? manualDistanceKm : 0;
  const distanceMiles = parseFloat((distanceKm * 0.621371).toFixed(2));

  // Fuel-based Fare Breakdown
  const fareBreakdown: FareBreakdown | null = dropoff 
    ? calculateFuelBasedFare(selectedVehicle, distanceKm, fuelPricePKR) 
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
          address: `Current GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`
        });
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        // Fallback to Lahore default
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
      distanceKm,
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
            <span>Register as Driver</span>
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
                <MapPin className="w-4 h-4" /> Passenger Pickup Location
              </label>
              <button
                type="button"
                onClick={handleGetGPSLocation}
                disabled={isLocating}
                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded-lg border border-emerald-500/30 transition disabled:opacity-50"
              >
                <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Locating...' : 'Get Current GPS Location'}</span>
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

        {/* Fuel Price & Distance Calculator Configurator */}
        {dropoff && (
          <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Fuel className="w-4 h-4" />
                <span>Fuel Price Fare Calculator</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">1 Mile = 1.61 KM</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 text-[11px] font-semibold block mb-1">
                  Petrol Price (PKR/Liter)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 font-bold">Rs.</span>
                  <input
                    type="number"
                    value={fuelPricePKR}
                    onChange={(e) => setFuelPricePKR(Math.max(100, Number(e.target.value)))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-3 py-1.5 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-[11px] font-semibold block mb-1">
                  Trip Distance (KM / Miles)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={manualDistanceKm}
                  onChange={(e) => setManualDistanceKm(Math.max(0.5, Number(e.target.value)))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-300 bg-slate-900 p-2 rounded-lg font-mono">
              <span>Distance: <strong>{distanceKm} KM</strong> (~<strong>{distanceMiles} Miles</strong>)</span>
              <span>Fuel Price: <strong>PKR {fuelPricePKR}/L</strong></span>
            </div>
          </div>
        )}

        {/* Vehicle Selection Grid */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">Select Vehicle Category</label>
          <div className="grid grid-cols-2 gap-2.5">
            {VEHICLE_OPTIONS.map((opt) => {
              const breakdown = dropoff ? calculateFuelBasedFare(opt.type, distanceKm, fuelPricePKR) : null;
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
                        <p className="text-[9px] text-slate-400 font-mono">
                          Fuel: PKR {breakdown.fuelCostPKR} ({breakdown.fuelLitersNeeded}L)
                        </p>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fare Summary & Detailed Transparent Formula */}
        {dropoff && fareBreakdown && (
          <div className="space-y-3 bg-slate-800/90 rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Transparent Fare Breakdown</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-400">PKR {estimatedFare}</span>
                  <span className="text-xs text-slate-300 font-mono">({distanceMiles} Miles / {distanceKm} KM)</span>
                </div>
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

            {/* Formula Detail Badges */}
            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-center">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-700">
                <span className="text-slate-400 block">Fuel Cost</span>
                <span className="text-emerald-400 font-bold">PKR {fareBreakdown.fuelCostPKR}</span>
                <span className="text-slate-500 text-[9px] block">({fareBreakdown.fuelLitersNeeded}L @ 350)</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-700">
                <span className="text-slate-400 block">Driver Base</span>
                <span className="text-amber-400 font-bold">PKR {fareBreakdown.baseFeePKR}</span>
                <span className="text-slate-500 text-[9px] block">Fixed Fee</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-700">
                <span className="text-slate-400 block">Maintenance</span>
                <span className="text-teal-400 font-bold">PKR {fareBreakdown.maintenanceFeePKR}</span>
                <span className="text-slate-500 text-[9px] block">Wear & Tear</span>
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
