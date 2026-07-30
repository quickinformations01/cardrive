import { 
  Driver, 
  Rider, 
  Subscription, 
  TripRequest, 
  Notification, 
  Review, 
  AdminStats, 
  SubscriptionPlan,
  VehicleType
} from '../types';

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

// Initial mock subscriptions history
export const INITIAL_SUBSCRIPTIONS: Subscription[] = [];

export const INITIAL_TRIPS: TripRequest[] = [];

export const INITIAL_NOTIFICATIONS: Notification[] = [];

export interface FareBreakdown {
  distanceKm: number;
  distanceMiles: number;
  fuelPricePKR: number;
  kmPerLiter: number;
  fuelLitersNeeded: number;
  fuelCostPKR: number;
  baseFeePKR: number;
  maintenanceFeePKR: number;
  totalFarePKR: number;
}

// Fuel-based calculation for fare estimation based on miles/km and current fuel price (e.g. PKR 350)
export function calculateFuelBasedFare(
  vehicleType: VehicleType, 
  distanceKm: number, 
  fuelPricePKR: number = 350
): FareBreakdown {
  let kmPerLiter = 16;
  let baseFee = 100;
  let maintenancePerKm = 15;

  switch (vehicleType) {
    case 'bike':
      kmPerLiter = 42;
      baseFee = 35;
      maintenancePerKm = 8;
      break;
    case 'rickshaw':
      kmPerLiter = 22;
      baseFee = 60;
      maintenancePerKm = 12;
      break;
    case 'mini':
      kmPerLiter = 16;
      baseFee = 100;
      maintenancePerKm = 18;
      break;
    case 'sedan':
      kmPerLiter = 12;
      baseFee = 150;
      maintenancePerKm = 25;
      break;
    case 'suv':
      kmPerLiter = 8;
      baseFee = 220;
      maintenancePerKm = 35;
      break;
  }

  const distanceMiles = parseFloat((distanceKm * 0.621371).toFixed(2));
  const fuelLitersNeeded = distanceKm / kmPerLiter;
  const fuelCostPKR = Math.ceil(fuelLitersNeeded * fuelPricePKR);
  const maintenanceFeePKR = Math.ceil(distanceKm * maintenancePerKm);
  const totalFarePKR = Math.max(Math.ceil(fuelCostPKR + baseFee + maintenanceFeePKR), baseFee + 30);

  return {
    distanceKm: parseFloat(distanceKm.toFixed(2)),
    distanceMiles,
    fuelPricePKR,
    kmPerLiter,
    fuelLitersNeeded: parseFloat(fuelLitersNeeded.toFixed(2)),
    fuelCostPKR,
    baseFeePKR: baseFee,
    maintenanceFeePKR,
    totalFarePKR
  };
}

export function calculateFare(vehicleType: VehicleType, distanceKm: number, fuelPricePKR: number = 350): number {
  return calculateFuelBasedFare(vehicleType, distanceKm, fuelPricePKR).totalFarePKR;
}
