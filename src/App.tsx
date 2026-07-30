import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { InteractiveMap } from './components/InteractiveMap';
import { RiderDashboard } from './components/RiderDashboard';
import { DriverDashboard } from './components/DriverDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { SubscriptionModal } from './components/SubscriptionModal';
import { DriverRegistrationModal } from './components/DriverRegistrationModal';
import { AuthVerificationModal } from './components/AuthVerificationModal';
import { RideHistory } from './components/RideHistory';
import { NotificationDrawer } from './components/NotificationDrawer';
import { 
  UserRole, 
  Driver, 
  Rider, 
  Subscription, 
  TripRequest, 
  Notification, 
  AdminStats, 
  VehicleType, 
  SubscriptionPlanType,
  DriverStatus
} from './types';
import { 
  INITIAL_DRIVERS, 
  INITIAL_RIDERS, 
  INITIAL_SUBSCRIPTIONS, 
  INITIAL_TRIPS, 
  INITIAL_NOTIFICATIONS,
  DEFAULT_GUEST_RIDER,
  DEFAULT_GUEST_DRIVER,
  calculateFare
} from './services/store';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [currentRole, setCurrentRole] = useState<UserRole>('rider');
  const [activeTab, setActiveTab] = useState<'map' | 'history' | 'subscription' | 'admin' | 'register-driver'>('map');

  // Application Data States
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [riders, setRiders] = useState<Rider[]>(INITIAL_RIDERS);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(INITIAL_SUBSCRIPTIONS);
  const [trips, setTrips] = useState<TripRequest[]>(INITIAL_TRIPS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  // Selected Active Users
  const [currentRiderIndex, setCurrentRiderIndex] = useState(0);
  const [currentDriverIndex, setCurrentDriverIndex] = useState(0);

  const currentRider = riders[currentRiderIndex] || riders[0] || DEFAULT_GUEST_RIDER;
  const currentDriver = drivers[currentDriverIndex] || drivers[0] || DEFAULT_GUEST_DRIVER;

  // Map Locations
  const [pickupLocation, setPickupLocation] = useState({
    lat: 31.5204,
    lng: 74.3587,
    address: 'Main Boulevard, Gulberg III, Lahore'
  });

  const [dropoffLocation, setDropoffLocation] = useState<{ lat: number; lng: number; address: string } | null>({
    lat: 31.4822,
    lng: 74.3642,
    address: 'Packages Mall, Walton Road, Lahore'
  });

  // Modals & Drawers
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isRegisterDriverModalOpen, setIsRegisterDriverModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  const handleAuthSuccess = (userData: {
    name: string;
    mobile: string;
    email: string;
    role: UserRole;
    verifiedMethod: 'whatsapp' | 'google';
    photoUrl?: string;
  }) => {
    setCurrentRole(userData.role);
    
    if (userData.role === 'rider') {
      const newRider: Rider = {
        id: `r_${Date.now()}`,
        fullName: userData.name,
        mobile: userData.mobile,
        email: userData.email,
        city: 'Lahore',
        createdAt: new Date().toISOString()
      };
      setRiders([newRider, ...riders]);
      setCurrentRiderIndex(0);
    } else {
      const newDriver: Driver = {
        id: `d_${Date.now()}`,
        fullName: userData.name,
        mobile: userData.mobile,
        email: userData.email,
        cnic: '35202-0000000-1',
        licenceNumber: 'LHR-2026-1001',
        vehicle: {
          id: `v_${Date.now()}`,
          driverId: `d_${Date.now()}`,
          type: 'mini',
          brand: 'Suzuki',
          model: 'Alto VXR',
          color: 'White',
          regNumber: 'LEA-26-1010'
        },
        photoUrl: userData.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
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
          id: `sub_${Date.now()}`,
          driverId: `d_${Date.now()}`,
          planType: 'daily',
          amountPKR: 30,
          purchaseDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 86400000).toISOString(),
          paymentStatus: 'paid',
          transactionId: 'TXN-FREE-VERIFIED',
          paymentGateway: 'JazzCash',
          status: 'active'
        }
      };
      setDrivers([newDriver, ...drivers]);
      setCurrentDriverIndex(0);
    }

    // Add welcome notification
    const note: Notification = {
      id: `n_${Date.now()}`,
      userId: `u_${Date.now()}`,
      role: userData.role,
      title: '🎉 Welcome to Apni Car!',
      message: `Account verified via ${userData.verifiedMethod.toUpperCase()} (${userData.mobile || userData.email}). Enjoy 0% commission rides!`,
      isRead: false,
      type: 'success',
      createdAt: new Date().toISOString()
    };
    setNotifications([note, ...notifications]);
  };

  // Active Ride Request currently being tracked
  const activeTrip = trips.length > 0 ? trips[0] : null;

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle Quick Role / Persona Switch
  const handleQuickRoleSwitch = (role: UserRole, driverIdx?: number) => {
    setCurrentRole(role);
    if (role === 'driver') {
      if (driverIdx !== undefined && driverIdx < drivers.length) {
        setCurrentDriverIndex(driverIdx);
      } else {
        setCurrentDriverIndex(0);
      }
    }
    if (role === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('map');
    }
  };

  // Rider Requests Ride
  const handleRequestRide = (data: {
    vehicleType: VehicleType;
    pickupAddress: string;
    destAddress: string;
    distanceKm: number;
    estimatedFarePKR?: number;
  }) => {
    const calculatedFare = data.estimatedFarePKR || calculateFare(data.vehicleType, data.distanceKm, 350);
    const newTrip: TripRequest = {
      id: `trip_${Date.now()}`,
      riderId: currentRider.id,
      riderName: currentRider.fullName,
      riderMobile: currentRider.mobile,
      pickupAddress: data.pickupAddress,
      pickupLat: pickupLocation.lat,
      pickupLng: pickupLocation.lng,
      destAddress: data.destAddress,
      destLat: dropoffLocation?.lat || 31.4822,
      destLng: dropoffLocation?.lng || 74.3642,
      distanceKm: data.distanceKm,
      estimatedFarePKR: calculatedFare,
      vehicleType: data.vehicleType,
      status: 'requested',
      paymentMethod: 'cash',
      createdAt: new Date().toISOString()
    };

    setTrips([newTrip, ...trips]);

    // Dispatch notification to online drivers
    const newNote: Notification = {
      id: `n_${Date.now()}`,
      userId: currentDriver.id,
      role: 'driver',
      title: '🚖 New Ride Request!',
      message: `${newTrip.pickupAddress.slice(0, 30)} → PKR ${newTrip.estimatedFarePKR} (${newTrip.vehicleType.toUpperCase()})`,
      isRead: false,
      type: 'info',
      createdAt: new Date().toISOString()
    };
    setNotifications([newNote, ...notifications]);
  };

  // Driver Online Toggle
  const handleToggleOnline = (isOnline: boolean) => {
    if (isOnline) {
      if (currentDriver.status !== 'approved') {
        alert('Your driver registration is pending admin approval. You will receive a notification once approved!');
        return;
      }
      if (currentDriver.currentSubscription?.status !== 'active') {
        setIsSubscriptionModalOpen(true);
        return;
      }
    }

    const updated = drivers.map((d, i) => i === currentDriverIndex ? { ...d, isOnline } : d);
    setDrivers(updated);
  };

  // Driver Accepts Ride
  const handleAcceptTrip = (tripId: string) => {
    const updatedTrips = trips.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          status: 'accepted' as const,
          driverId: currentDriver.id,
          driverName: currentDriver.fullName,
          driverMobile: currentDriver.mobile,
          driverVehicleReg: currentDriver.vehicle.regNumber,
          driverRating: currentDriver.rating,
          acceptedAt: new Date().toISOString()
        };
      }
      return t;
    });
    setTrips(updatedTrips);

    // Notify Rider
    const newNote: Notification = {
      id: `n_${Date.now()}`,
      userId: currentRider.id,
      role: 'rider',
      title: 'Driver Confirmed 🚗',
      message: `${currentDriver.fullName} (${currentDriver.vehicle.regNumber}) is on the way to pick you up!`,
      isRead: false,
      type: 'success',
      createdAt: new Date().toISOString()
    };
    setNotifications([newNote, ...notifications]);
  };

  // Driver Updates Trip Status
  const handleUpdateTripStatus = (tripId: string, status: 'arrived' | 'in_progress' | 'completed') => {
    const updatedTrips = trips.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          status: status as any,
          completedAt: status === 'completed' ? new Date().toISOString() : t.completedAt
        };
      }
      return t;
    });
    setTrips(updatedTrips);

    if (status === 'completed') {
      // Add 100% earnings to driver
      const currentTripObj = trips.find(t => t.id === tripId);
      if (currentTripObj) {
        setDrivers(drivers.map((d, i) => i === currentDriverIndex ? {
          ...d,
          totalTrips: d.totalTrips + 1,
          totalEarnings: d.totalEarnings + currentTripObj.estimatedFarePKR
        } : d));
      }
    }
  };

  // Confirm Subscription Purchase
  const handleConfirmSubscriptionPurchase = (
    planType: SubscriptionPlanType, 
    gateway: 'JazzCash' | 'EasyPaisa' | 'Bank Transfer' | 'Card', 
    transactionId: string
  ) => {
    let amount = 30;
    let days = 1;
    if (planType === 'weekly') { amount = 200; days = 7; }
    if (planType === 'monthly') { amount = 500; days = 30; }

    const now = new Date();
    const expiryDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

    const newSub: Subscription = {
      id: `sub_${Date.now()}`,
      driverId: currentDriver.id,
      driverName: currentDriver.fullName,
      planType,
      amountPKR: amount,
      purchaseDate: now.toISOString(),
      expiryDate,
      paymentStatus: 'paid',
      transactionId,
      paymentGateway: gateway,
      status: 'active'
    };

    setSubscriptions([newSub, ...subscriptions]);

    // Update driver subscription
    const updated = drivers.map((d, i) => i === currentDriverIndex ? {
      ...d,
      isOnline: true,
      currentSubscription: newSub
    } : d);
    setDrivers(updated);
  };

  // Admin Approve / Reject Driver
  const handleAdminUpdateDriverStatus = (driverId: string, status: DriverStatus, note?: string) => {
    const updated = drivers.map(d => d.id === driverId ? { ...d, status, isOnline: status === 'approved' ? d.isOnline : false } : d);
    setDrivers(updated);

    const newNote: Notification = {
      id: `n_${Date.now()}`,
      userId: driverId,
      role: 'driver',
      title: `Account Status: ${status.toUpperCase()}`,
      message: note || `Your driver application status has been updated to ${status}.`,
      isRead: false,
      type: status === 'approved' ? 'success' : 'alert',
      createdAt: new Date().toISOString()
    };
    setNotifications([newNote, ...notifications]);
  };

  // Submit new driver registration
  const handleSubmitNewDriver = (data: any) => {
    const newDriverObj: Driver = {
      id: `d_${Date.now()}`,
      fullName: data.fullName,
      mobile: data.mobile,
      email: data.email,
      cnic: data.cnic,
      licenceNumber: data.licenceNumber,
      vehicle: {
        id: `v_${Date.now()}`,
        driverId: `d_${Date.now()}`,
        type: data.vehicleType,
        brand: data.vehicleBrand,
        model: data.vehicleModel,
        color: data.vehicleColor,
        regNumber: data.regNumber
      },
      photoUrl: data.photoUrl,
      cnicImage: data.cnicImage,
      licenceImage: data.licenceImage,
      vehicleImage: data.vehicleImage,
      status: 'pending',
      isOnline: false,
      lat: 31.5204,
      lng: 74.3587,
      city: data.city,
      rating: 5.0,
      totalTrips: 0,
      totalEarnings: 0,
      createdAt: new Date().toISOString()
    };

    setDrivers([newDriverObj, ...drivers]);
    setCurrentRole('driver');
    setCurrentDriverIndex(drivers.length); // Select new driver
    alert('Driver application submitted! Admin will verify your documents shortly.');
  };

  // Compute Admin Stats
  const adminStats: AdminStats = {
    totalDrivers: drivers.length,
    activeOnlineDrivers: drivers.filter(d => d.isOnline).length,
    totalRiders: riders.length,
    totalTrips: trips.length,
    totalSubscriptionRevenuePKR: subscriptions.reduce((sum, s) => sum + s.amountPKR, 0),
    pendingApprovals: drivers.filter(d => d.status === 'pending').length,
    expiredSubscriptions: drivers.filter(d => d.currentSubscription?.status === 'expired').length
  };

  const onlineDriversCount = drivers.filter(d => d.isOnline && d.status === 'approved').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header Bar */}
      <Navbar
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        currentDriver={currentDriver}
        currentRider={currentRider}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadNotificationsCount={notifications.filter(n => !n.isRead).length}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
        onOpenRegisterDriverModal={() => setIsRegisterDriverModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onQuickRoleSwitch={handleQuickRoleSwitch}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {activeTab === 'admin' ? (
          <AdminDashboard
            stats={adminStats}
            drivers={drivers}
            subscriptions={subscriptions}
            onUpdateDriverStatus={handleAdminUpdateDriverStatus}
          />
        ) : activeTab === 'history' ? (
          <RideHistory
            trips={trips}
            currentRole={currentRole}
            currentUserId={currentRole === 'driver' ? currentDriver.id : currentRider.id}
          />
        ) : (
          /* Main Interactive Map & Role Panel Split Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Booking / Role-Based Control Panel (5 Cols - Order 1 on mobile) */}
            <div className="lg:col-span-5 order-1 lg:order-1 space-y-6">
              {currentRole === 'rider' ? (
                <RiderDashboard
                  pickup={pickupLocation}
                  setPickup={setPickupLocation}
                  dropoff={dropoffLocation}
                  setDropoff={setDropoffLocation}
                  onRequestRide={handleRequestRide}
                  activeTrip={activeTrip}
                  onCancelTrip={() => setTrips(trips.filter(t => t.id !== activeTrip?.id))}
                  onRateDriver={(tripId, rating, comment) => {
                    alert(`Thank you for rating ${rating} stars! Review saved.`);
                  }}
                  onlineDriversCount={onlineDriversCount}
                  onOpenRegisterDriverModal={() => setIsRegisterDriverModalOpen(true)}
                />
              ) : (
                <DriverDashboard
                  driver={currentDriver}
                  onToggleOnline={handleToggleOnline}
                  onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
                  activeTripRequest={activeTrip}
                  onAcceptTrip={handleAcceptTrip}
                  onUpdateTripStatus={handleUpdateTripStatus}
                  pendingTripsCount={trips.filter(t => t.status === 'requested').length}
                />
              )}
            </div>

            {/* Interactive Map (7 Cols - Order 2 on mobile) */}
            <div className="lg:col-span-7 order-2 lg:order-2 h-[380px] sm:h-[500px] lg:h-[680px] lg:sticky lg:top-20 z-0">
              <InteractiveMap
                pickupLocation={pickupLocation}
                dropoffLocation={dropoffLocation}
                drivers={drivers}
                onMapClick={(lat, lng) => {
                  setDropoffLocation({ lat, lng, address: `Custom Pin (${lat.toFixed(3)}, ${lng.toFixed(3)})` });
                }}
                activeTripDriverLocation={activeTrip && activeTrip.status !== 'completed' ? { lat: currentDriver.lat, lng: currentDriver.lng } : null}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Apni Car – Professional 0% Commission Ride-Hailing Platform in Pakistan.</p>
        <p className="text-[10px] text-slate-600 mt-1">Built for high scale, fast performance, and fair driver earnings.</p>
      </footer>

      {/* Global Modals */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        onConfirmPurchase={handleConfirmSubscriptionPurchase}
        currentPlanType={currentDriver.currentSubscription?.planType}
      />

      <DriverRegistrationModal
        isOpen={isRegisterDriverModalOpen}
        onClose={() => setIsRegisterDriverModalOpen(false)}
        onSubmitDriver={handleSubmitNewDriver}
      />

      <AuthVerificationModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => setNotifications(notifications.map(n => ({ ...n, isRead: true })))}
      />
    </div>
  );
}
