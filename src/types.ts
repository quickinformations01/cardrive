export type UserRole = 'rider' | 'driver' | 'admin';

export type VehicleType = 'bike' | 'rickshaw' | 'mini' | 'sedan' | 'suv';

export type DriverStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type SubscriptionPlanType = 'daily' | 'weekly' | 'monthly';

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending';

export type PassengerTab = 'home' | 'history' | 'wallet' | 'profile';
export type DriverTab = 'home' | 'trips' | 'wallet' | 'profile';

export type TripStatus = 
  | 'requested' 
  | 'accepted' 
  | 'arrived' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

export interface VehicleRateConfig {
  baseFare: number;
  perKm: number;
  perMin: number;
}

export interface FareRates {
  bike: VehicleRateConfig;
  rickshaw: VehicleRateConfig;
  mini: VehicleRateConfig;
  sedan: VehicleRateConfig;
  suv: VehicleRateConfig;
}

export interface DriverRegistrationData {
  // Step 1: Personal Info
  fullName: string;
  fatherName: string;
  cnic: string;
  dob: string;
  gender: string;
  // Step 2: Mobile & WhatsApp OTP
  mobile: string;
  whatsappCode: string;
  isWhatsappVerified: boolean;
  // Step 3 & 4: Vehicle Details
  vehicleType: VehicleType;
  company: string;
  model: string;
  year: string;
  color: string;
  regNumber: string;
  city: string;
  // Step 5: Documents (Base64 / Mock URLs)
  cnicFrontUrl?: string;
  cnicBackUrl?: string;
  drivingLicenseUrl?: string;
  registrationBookUrl?: string;
  insuranceUrl?: string;
  driverPhotoUrl?: string;
  vehicleFrontUrl?: string;
  vehicleBackUrl?: string;
  vehicleLeftUrl?: string;
  vehicleRightUrl?: string;
  vehicleInteriorUrl?: string;
  // Step 6: Bank Account / Mobile Wallet
  payoutMethod: 'JazzCash' | 'EasyPaisa' | 'Bank Account';
  payoutAccountName: string;
  payoutAccountNumber: string;
  // Step 7: Terms
  acceptedTerms: boolean;
}

export interface Vehicle {
  id: string;
  driverId: string;
  type: VehicleType;
  brand: string;
  model: string;
  color: string;
  regNumber: string;
  year?: string;
  images?: string[];
}

export interface Driver {
  id: string;
  fullName: string;
  fatherName?: string;
  mobile: string;
  email?: string;
  cnic: string;
  dob?: string;
  gender?: string;
  licenceNumber: string;
  vehicle: Vehicle;
  photoUrl?: string;
  cnicFrontUrl?: string;
  cnicBackUrl?: string;
  licenceImage?: string;
  registrationBookUrl?: string;
  insuranceUrl?: string;
  vehicleFrontUrl?: string;
  vehicleBackUrl?: string;
  vehicleLeftUrl?: string;
  vehicleRightUrl?: string;
  vehicleInteriorUrl?: string;
  payoutMethod?: 'JazzCash' | 'EasyPaisa' | 'Bank Account';
  payoutAccountName?: string;
  payoutAccountNumber?: string;
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
  isVerified?: boolean;
  savedPlaces?: { id: string; title: string; address: string; lat: number; lng: number }[];
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
  estimatedDurationMin: number;
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

