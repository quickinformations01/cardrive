export type UserRole = 'rider' | 'driver' | 'admin';

export type VehicleType = 'bike' | 'rickshaw' | 'mini' | 'sedan' | 'suv';

export type DriverStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type SubscriptionPlanType = 'daily' | 'weekly' | 'monthly';

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending';

export type TripStatus = 
  | 'requested' 
  | 'accepted' 
  | 'arrived' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

export interface Vehicle {
  id: string;
  driverId: string;
  type: VehicleType;
  brand: string;
  model: string;
  color: string;
  regNumber: string;
  images?: string[];
}

export interface Driver {
  id: string;
  fullName: string;
  mobile: string;
  email?: string;
  cnic: string;
  licenceNumber: string;
  vehicle: Vehicle;
  photoUrl?: string;
  cnicImage?: string;
  licenceImage?: string;
  vehicleImage?: string;
  status: DriverStatus;
  isOnline: boolean;
  lat: number;
  lng: number;
  city: string;
  rating: number;
  totalTrips: number;
  totalEarnings: number;
  createdAt: string;
  currentSubscription?: Subscription;
}

export interface Rider {
  id: string;
  fullName: string;
  mobile: string;
  email?: string;
  city: string;
  createdAt: string;
}

export interface SubscriptionPlan {
  type: SubscriptionPlanType;
  name: string;
  amountPKR: number;
  durationDays: number;
  description: string;
  popular?: boolean;
}

export interface Subscription {
  id: string;
  driverId: string;
  driverName?: string;
  planType: SubscriptionPlanType;
  amountPKR: number;
  purchaseDate: string;
  expiryDate: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  transactionId: string;
  paymentGateway: 'JazzCash' | 'EasyPaisa' | 'Bank Transfer' | 'Card';
  status: SubscriptionStatus;
}

export interface TripRequest {
  id: string;
  riderId: string;
  riderName: string;
  riderMobile: string;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  destAddress: string;
  destLat: number;
  destLng: number;
  distanceKm: number;
  estimatedFarePKR: number;
  vehicleType: VehicleType;
  status: TripStatus;
  driverId?: string;
  driverName?: string;
  driverMobile?: string;
  driverVehicleReg?: string;
  driverRating?: number;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  paymentMethod: 'cash' | 'direct_transfer';
}

export interface Review {
  id: string;
  tripId: string;
  riderId: string;
  riderName: string;
  driverId: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  role: UserRole;
  title: string;
  message: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'alert';
  createdAt: string;
}

export interface AdminStats {
  totalDrivers: number;
  activeOnlineDrivers: number;
  totalRiders: number;
  totalTrips: number;
  totalSubscriptionRevenuePKR: number;
  pendingApprovals: number;
  expiredSubscriptions: number;
}

export interface CityFare {
  id: string;
  cityName: string;
  baseFareBike: number;
  perKmBike: number;
  baseFareAuto: number;
  perKmAuto: number;
  baseFareMini: number;
  perKmMini: number;
  baseFareSedan: number;
  perKmSedan: number;
}
