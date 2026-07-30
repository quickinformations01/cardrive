import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { InteractiveMap } from './components/InteractiveMap';
import { RiderDashboard } from './components/RiderDashboard';
import { DriverDashboard } from './components/DriverDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { SubscriptionModal } from './components/SubscriptionModal';
import { DriverRegistrationModal } from './components/DriverRegistrationModal';
import { WhatsAppAuthModal } from './components/WhatsAppAuthModal';
import { LoginModal } from './components/LoginModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { LandingPage } from './components/LandingPage';
import { BottomNav } from './components/BottomNav';
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
  DriverStatus,
  PassengerTab,
  DriverTab,
  FareRates
} from './types';
import { 
  INITIAL_DRIVERS, 
  INITIAL_RIDERS, 
  INITIAL_SUBSCRIPTIONS, 
  INITIAL_TRIPS, 
  INITIAL_NOTIFICATIONS,
  DEFAULT_GUEST_RIDER,
  DEFAULT_GUEST_DRIVER,
  DEFAULT_FARE_RATES
} from './services/store';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  
  // Landing Page & Role State
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [currentRole, setCurrentRole] = useState<UserRole>('rider');
  const [passengerTab, setPassengerTab] = useState<PassengerTab>('home');
  const [driverTab, setDriverTab] = useState<DriverTab>('home');

  // Application Data States
  const [drivers, setDrivers] = useState<Driver[]>(INITIAL_DRIVERS);
  const [riders, setRiders] = useState<Rider[]>(INITIAL_RIDERS);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(INITIAL_SUBSCRIPTIONS);
  const [trips, setTrips] = useState<TripRequest[]>(INITIAL_TRIPS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [fareRates, setFareRates] = useState<FareRates>(DEFAULT_FARE_RATES);

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
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);

  // Fetch initial drivers and riders from cloud backend if available
  useEffect(() => {
    fetch('/api/drivers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDrivers(data);
        }
      })
      .catch(() => {});
  }, []);

  // WhatsApp OTP Verification Handler
  const handleWhatsAppVerified = (fullName: string, mobile: string) => {
    setShowLandingPage(false);
    
    if (currentRole === 'rider') {
      const newRider: Rider = {
        id: `r_${Date.now()}`,
        fullName: fullName || 'Valued Passenger',
        mobile,
        email: `${fullName.toLowerCase().replace(/\s+/g, '') || 'rider'}@apnicar.pk`,
        city: 'Lahore',
        createdAt: new Date().toISOString()
      };
      setRiders([newRider, ...riders]);
      setCurrentRiderIndex(0);

      // Register Rider to backend & Cloudflare D1
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, fullName, role: 'rider' })
      }).catch(() => {});

      fetch('https://apnicar-backend.quickinformations01.workers.dev/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName || 'Valued Passenger',
          phone: mobile,
          password: 'RiderPassword123',
          role: 'passenger',
          city: 'Lahore'
        })
      }).catch(err => console.warn('Cloudflare Worker sync note:', err));
    } else {
      setIsRegisterDriverModalOpen(true);
    }

    // Welcome Notification
    const note: Notification = {
      id: `n_${Date.now()}`,
      userId: `u_${Date.now()}`,
      role: currentRole,
      title: '🎉 Welcome to ApniCar!',
      message: `WhatsApp number ${mobile} verified successfully. Enjoy 0% commission rides!`,
      isRead: false,
      type: 'success',
      createdAt: new Date().toISOString()
    };
    setNotifications([note, ...notifications]);
  };

  // Login Success Handler for existing accounts
  const handleLoginSuccess = (role: UserRole, mobile: string, userObj?: any) => {
    setShowLandingPage(false);
    setCurrentRole(role);

    if (role === 'driver') {
      const idx = drivers.findIndex(d => d.mobile === mobile);
      if (idx >= 0) {
        setCurrentDriverIndex(idx);
      } else if (userObj) {
        setDrivers(prev => [userObj, ...prev]);
        setCurrentDriverIndex(0);
      }
    } else if (role === 'rider') {
      const idx = riders.findIndex(r => r.mobile === mobile);
      if (idx >= 0) {
        setCurrentRiderIndex(idx);
      } else if (userObj) {
        setRiders(prev => [userObj, ...prev]);
        setCurrentRiderIndex(0);
      }
    }

    const note: Notification = {
      id: `n_${Date.now()}`,
      userId: `u_${Date.now()}`,
      role,
      title: '🔐 Logged In Successfully',
      message: `Welcome back to ApniCar! You are logged in as ${role.toUpperCase()}.`,
      isRead: false,
      type: 'success',
      createdAt: new Date().toISOString()
    };
    setNotifications([note, ...notifications]);
  };

  // Active Ride Request
  const activeTrip = trips.length > 0 ? trips[0] : null;

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle Quick Role Switch from Top Bar
  const handleQuickRoleSwitch = (role: UserRole) => {
    setShowLandingPage(false);
    setCurrentRole(role);
  };

  // Rider Requests Ride
  const handleRequestRide = (data: {
    vehicleType: VehicleType;
    pickupAddress: string;
    destAddress: string;
    distanceKm: number;
    estimatedDurationMin: number;
    estimatedFarePKR: number;
  }) => {
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
      estimatedDurationMin: data.estimatedDurationMin || 15,
      estimatedFarePKR: data.estimatedFarePKR,
      vehicleType: data.vehicleType,
      status: 'requested',
      paymentMethod: 'cash',
      createdAt: new Date().toISOString()
    };

    setTrips([newTrip, ...trips]);

    // Dispatch notification to drivers
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
        alert('Your driver registration is pending admin approval. Admin will verify your documents shortly!');
        return;
      }
      if (currentDriver.currentSubscription?.status !== 'active') {
        setIsSubscriptionModalOpen(true);
        return;
      }
    }

    const updated = drivers.map((d, i) => i === currentDriverIndex ? { ...d, isOnline } : d);
    setDrivers(updated);

    // Call Cloud Backend toggle online
    fetch(`/api/drivers/${currentDriver.id}/toggle-online`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOnline })
    }).catch(() => {});
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

    const updated = drivers.map((d, i) => i === currentDriverIndex ? {
      ...d,
      isOnline: true,
      currentSubscription: newSub
    } : d);
    setDrivers(updated);

    fetch('/api/subscriptions/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        driverId: currentDriver.id,
        planType,
        gateway,
        transactionId
      })
    }).catch(() => {});
  };

  // Admin Approve / Reject Driver
  const handleAdminUpdateDriverStatus = (driverId: string, status: DriverStatus, note?: string) => {
    const updated = drivers.map(d => d.id === driverId ? { ...d, status, isOnline: status === 'approved' ? d.isOnline : false } : d);
    setDrivers(updated);

    fetch(`/api/drivers/${driverId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, note })
    }).catch(() => {});

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

  // Submit new driver registration & persist to cloud backend
  const handleSubmitNewDriver = async (newDriver: Driver) => {
    setDrivers([newDriver, ...drivers]);
    setShowLandingPage(false);
    setCurrentRole('driver');
    setCurrentDriverIndex(0);

    try {
      await fetch('/api/auth/register-driver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newDriver.fullName,
          mobile: newDriver.mobile,
          email: newDriver.email,
          cnic: newDriver.cnic,
          licenceNumber: newDriver.licenceNumber,
          vehicleType: newDriver.vehicle.type,
          vehicleBrand: newDriver.vehicle.brand,
          vehicleModel: newDriver.vehicle.model,
          vehicleColor: newDriver.vehicle.color,
          regNumber: newDriver.vehicle.regNumber,
          photoUrl: newDriver.photoUrl,
          cnicImage: newDriver.cnicFrontUrl,
          licenceImage: newDriver.licenceImage,
          vehicleImage: newDriver.vehicleFrontUrl,
          city: newDriver.city
        })
      });

      // Also sync to Cloudflare Worker D1 database API
      await fetch('https://apnicar-backend.quickinformations01.workers.dev/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newDriver.fullName,
          phone: newDriver.mobile,
          password: newDriver.cnic || 'DriverPassword123',
          role: 'driver',
          email: newDriver.email,
          city: newDriver.city,
          cnic: newDriver.cnic,
          vehicleType: newDriver.vehicle.type,
          regNumber: newDriver.vehicle.regNumber
        })
      });
    } catch (e) {
      console.error("Cloud registration error:", e);
    }
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16">
      {/* Landing Page */}
      {showLandingPage ? (
        <LandingPage
          onContinueAsPassenger={() => {
            setCurrentRole('rider');
            setIsWhatsAppModalOpen(true);
          }}
          onBecomeDriver={() => {
            setCurrentRole('driver');
            setIsRegisterDriverModalOpen(true);
          }}
          onOpenWhatsAppAuth={(role) => {
            setCurrentRole(role);
            setIsWhatsAppModalOpen(true);
          }}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onAdminLogin={() => {
            setCurrentRole('admin');
            setShowLandingPage(false);
          }}
        />
      ) : (
        <>
          {/* Main Top Header Bar */}
          <Navbar
            currentRole={currentRole}
            setCurrentRole={setCurrentRole}
            currentDriver={currentDriver}
            currentRider={currentRider}
            activeTab="map"
            setActiveTab={() => {}}
            unreadNotificationsCount={notifications.filter(n => !n.isRead).length}
            onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
            onOpenSubscriptionModal={() => setIsSubscriptionModalOpen(true)}
            onOpenRegisterDriverModal={() => setIsRegisterDriverModalOpen(true)}
            onOpenAuthModal={() => setIsWhatsAppModalOpen(true)}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onQuickRoleSwitch={handleQuickRoleSwitch}
            onLogout={() => setShowLandingPage(true)}
          />

          {/* Main Content Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            {currentRole === 'admin' ? (
              <AdminDashboard
                stats={adminStats}
                drivers={drivers}
                subscriptions={subscriptions}
                onUpdateDriverStatus={handleAdminUpdateDriverStatus}
              />
            ) : (
              /* Split Grid: Interactive Map + Role Dashboard */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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
                      onRateDriver={() => alert('Thank you for rating your driver!')}
                      onlineDriversCount={onlineDriversCount}
                      onOpenRegisterDriverModal={() => setIsRegisterDriverModalOpen(true)}
                      currentRider={currentRider}
                      passengerTab={passengerTab}
                      fareRates={fareRates}
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
                      driverTab={driverTab}
                    />
                  )}
                </div>

                {/* Map View */}
                <div className="lg:col-span-7 order-2 lg:order-2 h-[380px] sm:h-[480px] lg:h-[650px] lg:sticky lg:top-20 z-0">
                  <InteractiveMap
                    pickupLocation={pickupLocation}
                    dropoffLocation={dropoffLocation}
                    drivers={drivers}
                    onMapClick={(lat, lng) => {
                      setDropoffLocation({ lat, lng, address: `Destination (${lat.toFixed(3)}, ${lng.toFixed(3)})` });
                    }}
                    activeTripDriverLocation={activeTrip && activeTrip.status !== 'completed' ? { lat: currentDriver.lat, lng: currentDriver.lng } : null}
                  />
                </div>
              </div>
            )}
          </main>

          {/* Bottom App Navigation for Mobile */}
          <BottomNav
            role={currentRole}
            passengerTab={passengerTab}
            driverTab={driverTab}
            onSelectPassengerTab={setPassengerTab}
            onSelectDriverTab={setDriverTab}
          />
        </>
      )}

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

      <WhatsAppAuthModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        role={currentRole === 'driver' ? 'driver' : 'rider'}
        onVerified={handleWhatsAppVerified}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
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
