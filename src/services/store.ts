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

// Initial mock riders
export const INITIAL_RIDERS: Rider[] = [
  {
    id: 'r_1',
    fullName: 'Hamza Khan',
    mobile: '03001234567',
    email: 'hamza@example.com',
    city: 'Lahore',
    createdAt: '2026-07-01T10:00:00Z'
  },
  {
    id: 'r_2',
    fullName: 'Ayesha Malik',
    mobile: '03219876543',
    email: 'ayesha@example.com',
    city: 'Karachi',
    createdAt: '2026-07-05T12:30:00Z'
  }
];

// Initial mock drivers in Lahore / Karachi / Islamabad
export const INITIAL_DRIVERS: Driver[] = [
  {
    id: 'd_1',
    fullName: 'Muhammad Ali',
    mobile: '03004567890',
    email: 'm.ali@example.com',
    cnic: '35202-1234567-1',
    licenceNumber: 'LHR-2023-8891',
    vehicle: {
      id: 'v_1',
      driverId: 'd_1',
      type: 'mini',
      brand: 'Suzuki',
      model: 'Alto VXR',
      color: 'White',
      regNumber: 'LEA-24-9102'
    },
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    cnicImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
    licenceImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=80',
    vehicleImage: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&auto=format&fit=crop&q=80',
    status: 'approved',
    isOnline: true,
    lat: 31.5204, // Lahore near Gulberg
    lng: 74.3587,
    city: 'Lahore',
    rating: 4.9,
    totalTrips: 184,
    totalEarnings: 42500,
    createdAt: '2026-06-10T08:00:00Z',
    currentSubscription: {
      id: 'sub_1',
      driverId: 'd_1',
      planType: 'monthly',
      amountPKR: 500,
      purchaseDate: new Date(Date.now() - 5 * 86400000).toISOString(),
      expiryDate: new Date(Date.now() + 25 * 86400000).toISOString(),
      paymentStatus: 'paid',
      transactionId: 'TXN-998124',
      paymentGateway: 'JazzCash',
      status: 'active'
    }
  },
  {
    id: 'd_2',
    fullName: 'Usman Chaudhry',
    mobile: '03125556677',
    cnic: '35201-9876543-3',
    licenceNumber: 'LHR-2022-4412',
    vehicle: {
      id: 'v_2',
      driverId: 'd_2',
      type: 'bike',
      brand: 'Honda',
      model: 'CG 125',
      color: 'Red',
      regNumber: 'LEM-22-108'
    },
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'approved',
    isOnline: true,
    lat: 31.5310, // Lahore Liberty Market
    lng: 74.3470,
    city: 'Lahore',
    rating: 4.8,
    totalTrips: 310,
    totalEarnings: 68000,
    createdAt: '2026-05-15T08:00:00Z',
    currentSubscription: {
      id: 'sub_2',
      driverId: 'd_2',
      planType: 'weekly',
      amountPKR: 200,
      purchaseDate: new Date(Date.now() - 2 * 86400000).toISOString(),
      expiryDate: new Date(Date.now() + 5 * 86400000).toISOString(),
      paymentStatus: 'paid',
      transactionId: 'TXN-771239',
      paymentGateway: 'EasyPaisa',
      status: 'active'
    }
  },
  {
    id: 'd_3',
    fullName: 'Tariq Mehmood',
    mobile: '03334445566',
    cnic: '35202-3334445-5',
    licenceNumber: 'LHR-2024-1100',
    vehicle: {
      id: 'v_3',
      driverId: 'd_3',
      type: 'rickshaw',
      brand: 'Sazgar',
      model: 'Auto 4-Stroke',
      color: 'Green/Yellow',
      regNumber: 'RIC-23-441'
    },
    status: 'approved',
    isOnline: true,
    lat: 31.5120, // DHA Phase 5 Lahore
    lng: 74.3750,
    city: 'Lahore',
    rating: 4.7,
    totalTrips: 92,
    totalEarnings: 28400,
    createdAt: '2026-06-20T08:00:00Z',
    currentSubscription: {
      id: 'sub_3',
      driverId: 'd_3',
      planType: 'daily',
      amountPKR: 30,
      purchaseDate: new Date(Date.now() - 12 * 3600000).toISOString(),
      expiryDate: new Date(Date.now() + 12 * 3600000).toISOString(),
      paymentStatus: 'paid',
      transactionId: 'TXN-112233',
      paymentGateway: 'JazzCash',
      status: 'active'
    }
  },
  {
    id: 'd_4',
    fullName: 'Bilal Ahmed (Pending Driver)',
    mobile: '03456789012',
    cnic: '35202-8877665-9',
    licenceNumber: 'ISL-2025-0092',
    vehicle: {
      id: 'v_4',
      driverId: 'd_4',
      type: 'sedan',
      brand: 'Toyota',
      model: 'Corolla GLi',
      color: 'Silver',
      regNumber: 'ICT-25-7788'
    },
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    cnicImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
    licenceImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=80',
    vehicleImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&auto=format&fit=crop&q=80',
    status: 'pending',
    isOnline: false,
    lat: 33.7294, // Islamabad F-7
    lng: 73.0931,
    city: 'Islamabad',
    rating: 5.0,
    totalTrips: 0,
    totalEarnings: 0,
    createdAt: new Date().toISOString()
  }
];

// Initial mock subscriptions history
export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub_1',
    driverId: 'd_1',
    driverName: 'Muhammad Ali',
    planType: 'monthly',
    amountPKR: 500,
    purchaseDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    expiryDate: new Date(Date.now() + 25 * 86400000).toISOString(),
    paymentStatus: 'paid',
    transactionId: 'TXN-998124',
    paymentGateway: 'JazzCash',
    status: 'active'
  },
  {
    id: 'sub_2',
    driverId: 'd_2',
    driverName: 'Usman Chaudhry',
    planType: 'weekly',
    amountPKR: 200,
    purchaseDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    expiryDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    paymentStatus: 'paid',
    transactionId: 'TXN-771239',
    paymentGateway: 'EasyPaisa',
    status: 'active'
  },
  {
    id: 'sub_3',
    driverId: 'd_3',
    driverName: 'Tariq Mehmood',
    planType: 'daily',
    amountPKR: 30,
    purchaseDate: new Date(Date.now() - 12 * 3600000).toISOString(),
    expiryDate: new Date(Date.now() + 12 * 3600000).toISOString(),
    paymentStatus: 'paid',
    transactionId: 'TXN-112233',
    paymentGateway: 'JazzCash',
    status: 'active'
  }
];

export const INITIAL_TRIPS: TripRequest[] = [
  {
    id: 'trip_101',
    riderId: 'r_1',
    riderName: 'Hamza Khan',
    riderMobile: '03001234567',
    pickupAddress: 'Main Boulevard, Gulberg III, Lahore',
    pickupLat: 31.5204,
    pickupLng: 74.3587,
    destAddress: 'Packages Mall, Walton Road, Lahore',
    destLat: 31.4822,
    destLng: 74.3642,
    distanceKm: 5.2,
    estimatedFarePKR: 380,
    vehicleType: 'mini',
    status: 'completed',
    driverId: 'd_1',
    driverName: 'Muhammad Ali',
    driverMobile: '03004567890',
    driverVehicleReg: 'LEA-24-9102',
    driverRating: 4.9,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    acceptedAt: new Date(Date.now() - 3400000).toISOString(),
    completedAt: new Date(Date.now() - 1800000).toISOString(),
    paymentMethod: 'cash'
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n_1',
    userId: 'd_1',
    role: 'driver',
    title: 'Subscription Active',
    message: 'Your Monthly Pro subscription is active. Enjoy 0% commission on all rides!',
    isRead: false,
    type: 'success',
    createdAt: new Date().toISOString()
  },
  {
    id: 'n_2',
    userId: 'admin',
    role: 'admin',
    title: 'New Driver Registration',
    message: 'Bilal Ahmed submitted documents for verification.',
    isRead: false,
    type: 'info',
    createdAt: new Date().toISOString()
  }
];

// Helper calculation for fare estimation based on city and vehicle
export function calculateFare(vehicleType: VehicleType, distanceKm: number): number {
  let base = 50;
  let perKm = 40;

  switch (vehicleType) {
    case 'bike':
      base = 35;
      perKm = 25;
      break;
    case 'rickshaw':
      base = 60;
      perKm = 38;
      break;
    case 'mini':
      base = 100;
      perKm = 55;
      break;
    case 'sedan':
      base = 150;
      perKm = 75;
      break;
    case 'suv':
      base = 250;
      perKm = 110;
      break;
  }

  const fare = base + Math.ceil(distanceKm * perKm);
  return Math.max(fare, base + 20);
}
