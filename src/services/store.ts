import { 
  Driver, 
  Rider, 
  Subscription, 
  TripRequest, 
  Notification, 
  Review, 
  AdminStats, 
  SubscriptionPlan,
  VehicleType,
  FareRates
} from '../types';

export const DEFAULT_FARE_RATES: FareRates = {
  bike: { baseFare: 70, perKm: 18, perMin: 2 },
  rickshaw: { baseFare: 90, perKm: 22, perMin: 2.5 },
  mini: { baseFare: 120, perKm: 30, perMin: 3 },
  sedan: { baseFare: 250, perKm: 45, perMin: 5 },
  suv: { baseFare: 350, perKm: 60, perMin: 7 }
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    type: 'daily',
    name: 'Daily Pass',
    amountPKR: 30,
    durationDays: 1,
    description: 'Perfect for part-time drivers. Unlimited rides for 24 hours with 0% commission.'
  },
  {
    type: 'weekly',
    name: 'Weekly Saver',
    amountPKR: 200,
    durationDays: 7,
    description: 'Save 10% on daily rate. Unlimited rides for 7 days with zero commission.',
    popular: true
  },
  {
    type: 'monthly',
    name: 'Monthly Pro',
    amountPKR: 500,
    durationDays: 30,
    description: 'Best value! PKR 16/day. Unlimited bookings for 30 days & priority ride dispatch.'
  }
];

// Initial mock riders (Clean / Empty for live production usage)
export const INITIAL_RIDERS: Rider[] = [];

// Initial mock drivers (Clean / Empty for live production usage)
export const INITIAL_DRIVERS: Driver[] = [];

// Safe default fallback objects when no users exist yet
export const DEFAULT_GUEST_RIDER: Rider = {
  id: 'guest_rider',
  fullName: 'Guest Passenger',
  mobile: '03000000000',
  email: 'passenger@apnicar.pk',
  city: 'Lahore',
  isVerified: true,
  createdAt: new Date().toISOString()
};

export const DEFAULT_GUEST_DRIVER: Driver = {
  id: 'guest_driver',
  fullName: 'Apni Car Driver',
  mobile: '03000000000',
  email: 'driver@apnicar.pk',
  cnic: '35202-0000000-1',
  licenceNumber: 'LHR-2026-0000',
  vehicle: {
    id: 'v_guest',
    driverId: 'guest_driver',
    type: 'mini',
    brand: 'Suzuki',
    model: 'Alto VXR',
    color: 'White',
    regNumber: 'LEA-26-0000'
  },
  photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  status: 'approved',
  isOnline: true,
  lat: 31.5204,
  lng: 74.3587,
  city: 'Lahore',
  rating: 5.0,
  totalTrips: 0,
  totalEarnings: 0,
  createdAt: new Date().toISOString(),
  currentSubscription: {
    id: 'sub_guest',
    driverId: 'guest_driver',
    planType: 'daily',
    amountPKR: 30,
    purchaseDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 86400000).toISOString(),
    paymentStatus: 'paid',
    transactionId: 'TXN-ACTIVE',
    paymentGateway: 'JazzCash',
    status: 'active'
  }
};

// Initial mock subscriptions history
export const INITIAL_SUBSCRIPTIONS: Subscription[] = [];

export const INITIAL_TRIPS: TripRequest[] = [];

export const INITIAL_NOTIFICATIONS: Notification[] = [];

export interface FareBreakdown {
  distanceKm: number;
  distanceMiles: number;
  durationMin: number;
  baseFarePKR: number;
  distanceFarePKR: number;
  timeFarePKR: number;
  tollPKR: number;
  totalFarePKR: number;
}

// Calculate road distance between two points taking city road layout into account
export function calculateRoadDistanceAndDuration(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): { roadKm: number; roadMiles: number; durationMin: number } {
  // Haversine formula for straight line distance
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = R * c;

  // Road factor multiplier (~1.35x for city turns and roads)
  const roadKm = Math.max(1.2, parseFloat((straightKm * 1.35).toFixed(1)));
  const roadMiles = parseFloat((roadKm * 0.621371).toFixed(1));
  
  // Average city traffic speed ~25 km/h -> 2.4 min per KM
  const durationMin = Math.max(5, Math.ceil(roadKm * 2.4));

  return { roadKm, roadMiles, durationMin };
}

// Fare calculation based on dynamic rates: Base + (Dist * PerKM) + (Time * PerMin) + Tolls
export function calculateDetailedFare(
  vehicleType: VehicleType, 
  distanceKm: number, 
  durationMin: number,
  customRates?: FareRates
): FareBreakdown {
  const rates = customRates || DEFAULT_FARE_RATES;
  const config = rates[vehicleType] || rates.mini;

  const baseFarePKR = config.baseFare;
  const distanceFarePKR = Math.ceil(distanceKm * config.perKm);
  const timeFarePKR = Math.ceil(durationMin * config.perMin);
  const tollPKR = 0; // optional

  const totalFarePKR = Math.max(baseFarePKR + distanceFarePKR + timeFarePKR + tollPKR, baseFarePKR + 30);
  const distanceMiles = parseFloat((distanceKm * 0.621371).toFixed(1));

  return {
    distanceKm: parseFloat(distanceKm.toFixed(1)),
    distanceMiles,
    durationMin,
    baseFarePKR,
    distanceFarePKR,
    timeFarePKR,
    tollPKR,
    totalFarePKR
  };
}

export function calculateFare(vehicleType: VehicleType, distanceKm: number, fuelPricePKR: number = 350): number {
  const durationMin = Math.ceil(distanceKm * 2.4);
  return calculateDetailedFare(vehicleType, distanceKm, durationMin).totalFarePKR;
}

