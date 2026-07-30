import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { 
  INITIAL_DRIVERS, 
  INITIAL_RIDERS, 
  INITIAL_SUBSCRIPTIONS, 
  INITIAL_TRIPS, 
  INITIAL_NOTIFICATIONS,
  SUBSCRIPTION_PLANS,
  calculateFare 
} from "./src/services/store.js";
import { 
  Driver, 
  Rider, 
  Subscription, 
  TripRequest, 
  Notification, 
  Review, 
  AdminStats, 
  VehicleType 
} from "./src/types.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-Memory Database instances
  let drivers: Driver[] = [...INITIAL_DRIVERS];
  let riders: Rider[] = [...INITIAL_RIDERS];
  let subscriptions: Subscription[] = [...INITIAL_SUBSCRIPTIONS];
  let trips: TripRequest[] = [...INITIAL_TRIPS];
  let notifications: Notification[] = [...INITIAL_NOTIFICATIONS];
  let reviews: Review[] = [];

  // Helper: Auto-check expired subscriptions and turn offline
  function checkSubscriptionValidity(driver: Driver): { isValid: boolean; expiryDate?: string } {
    if (!driver.currentSubscription) return { isValid: false };
    const now = new Date();
    const expiry = new Date(driver.currentSubscription.expiryDate);
    if (now > expiry) {
      driver.currentSubscription.status = 'expired';
      driver.isOnline = false; // Forced offline
      return { isValid: false, expiryDate: driver.currentSubscription.expiryDate };
    }
    return { isValid: true, expiryDate: driver.currentSubscription.expiryDate };
  }

  // API ROUTES

  // 1. Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "Apni Car API", timestamp: new Date() });
  });

  // 2. Auth Endpoints
  app.post("/api/auth/login", (req, res) => {
    const { mobile, password, role } = req.body;

    if (role === 'admin') {
      if (mobile === 'admin' || mobile === '03000000000') {
        return res.json({
          token: 'jwt-admin-token-12345',
          role: 'admin',
          user: { id: 'admin_1', name: 'System Administrator', mobile: '03000000000' }
        });
      }
      return res.status(401).json({ message: 'Invalid Admin Credentials' });
    }

    if (role === 'driver') {
      const driver = drivers.find(d => d.mobile === mobile);
      if (driver) {
        checkSubscriptionValidity(driver);
        return res.json({
          token: `jwt-driver-${driver.id}`,
          role: 'driver',
          user: driver
        });
      }
      return res.status(404).json({ message: 'Driver mobile number not registered.' });
    }

    // Default Rider login or auto register
    let rider = riders.find(r => r.mobile === mobile);
    if (!rider) {
      rider = {
        id: `r_${Date.now()}`,
        fullName: req.body.fullName || 'Valued Passenger',
        mobile: mobile,
        city: 'Lahore',
        createdAt: new Date().toISOString()
      };
      riders.push(rider);
    }

    res.json({
      token: `jwt-rider-${rider.id}`,
      role: 'rider',
      user: rider
    });
  });

  // Register Driver
  app.post("/api/auth/register-driver", (req, res) => {
    const { 
      fullName, mobile, email, cnic, licenceNumber, 
      vehicleType, vehicleBrand, vehicleModel, vehicleColor, regNumber,
      photoUrl, cnicImage, licenceImage, vehicleImage, city
    } = req.body;

    if (!fullName || !mobile || !cnic || !regNumber) {
      return res.status(400).json({ message: 'Please fill all required registration fields.' });
    }

    const newDriver: Driver = {
      id: `d_${Date.now()}`,
      fullName,
      mobile,
      email,
      cnic,
      licenceNumber,
      vehicle: {
        id: `v_${Date.now()}`,
        driverId: `d_${Date.now()}`,
        type: vehicleType || 'mini',
        brand: vehicleBrand || 'Suzuki',
        model: vehicleModel || 'Alto',
        color: vehicleColor || 'White',
        regNumber
      },
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      cnicFrontUrl: cnicImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
      licenceImage: licenceImage || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=80',
      vehicleFrontUrl: vehicleImage || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&auto=format&fit=crop&q=80',
      status: 'pending', // Requires admin approval!
      isOnline: false,
      lat: 31.5204,
      lng: 74.3587,
      city: city || 'Lahore',
      rating: 5.0,
      totalTrips: 0,
      totalEarnings: 0,
      createdAt: new Date().toISOString()
    };

    drivers.push(newDriver);

    // Notify Admin
    notifications.unshift({
      id: `n_${Date.now()}`,
      userId: 'admin',
      role: 'admin',
      title: 'New Driver Registration',
      message: `${fullName} (${vehicleType}) registered and awaits document verification.`,
      isRead: false,
      type: 'info',
      createdAt: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Driver registration submitted successfully! Awaiting admin verification.',
      driver: newDriver
    });
  });

  // 3. Driver Actions & Online Guard
  app.get("/api/drivers", (_req, res) => {
    // Update expired statuses
    drivers.forEach(d => checkSubscriptionValidity(d));
    res.json(drivers);
  });

  app.post("/api/drivers/:id/toggle-online", (req, res) => {
    const { id } = req.params;
    const { isOnline } = req.body;
    const driver = drivers.find(d => d.id === id);

    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }

    if (driver.status !== 'approved') {
      return res.status(403).json({ 
        message: 'Your account is pending admin approval. You will receive a notification once verified.' 
      });
    }

    if (isOnline) {
      const subCheck = checkSubscriptionValidity(driver);
      if (!subCheck.isValid) {
        return res.status(402).json({
          message: 'Subscription Expired or Inactive! Please renew your Daily, Weekly, or Monthly pass to go online.',
          requireSubscription: true
        });
      }
    }

    driver.isOnline = Boolean(isOnline);
    res.json({ message: `Driver is now ${driver.isOnline ? 'ONLINE' : 'OFFLINE'}`, driver });
  });

  // Admin Verification of Driver
  app.post("/api/drivers/:id/status", (req, res) => {
    const { id } = req.params;
    const { status, note } = req.body; // 'approved' | 'rejected' | 'suspended'
    const driver = drivers.find(d => d.id === id);

    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    driver.status = status;
    if (status !== 'approved') {
      driver.isOnline = false;
    }

    // Add Driver Notification
    notifications.unshift({
      id: `n_${Date.now()}`,
      userId: driver.id,
      role: 'driver',
      title: `Account Status: ${status.toUpperCase()}`,
      message: note || `Your driver registration status has been updated to ${status}.`,
      isRead: false,
      type: status === 'approved' ? 'success' : 'alert',
      createdAt: new Date().toISOString()
    });

    res.json({ message: `Driver status updated to ${status}`, driver });
  });

  // 4. Subscription Purchase & Gateway Simulation
  app.get("/api/subscriptions/plans", (_req, res) => {
    res.json(SUBSCRIPTION_PLANS);
  });

  app.post("/api/subscriptions/purchase", (req, res) => {
    const { driverId, planType, gateway, transactionId } = req.body;
    const driver = drivers.find(d => d.id === driverId);

    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    const plan = SUBSCRIPTION_PLANS.find(p => p.type === planType);
    if (!plan) return res.status(400).json({ message: 'Invalid subscription plan selected' });

    const now = new Date();
    const expiryDate = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000).toISOString();

    const newSub: Subscription = {
      id: `sub_${Date.now()}`,
      driverId: driver.id,
      driverName: driver.fullName,
      planType: plan.type,
      amountPKR: plan.amountPKR,
      purchaseDate: now.toISOString(),
      expiryDate,
      paymentStatus: 'paid',
      transactionId: transactionId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      paymentGateway: gateway || 'JazzCash',
      status: 'active'
    };

    subscriptions.unshift(newSub);
    driver.currentSubscription = newSub;

    // Notify Driver
    notifications.unshift({
      id: `n_${Date.now()}`,
      userId: driver.id,
      role: 'driver',
      title: 'Subscription Activated 🎉',
      message: `${plan.name} (PKR ${plan.amountPKR}) activated! Valid until ${new Date(expiryDate).toLocaleDateString()}. Enjoy 0% commission rides!`,
      isRead: false,
      type: 'success',
      createdAt: new Date().toISOString()
    });

    res.json({
      message: 'Payment confirmed & Subscription activated!',
      subscription: newSub,
      driver
    });
  });

  // 5. Ride Requests & Fare Estimation
  app.post("/api/trips/estimate", (req, res) => {
    const { vehicleType, distanceKm } = req.body;
    const fare = calculateFare(vehicleType as VehicleType, Number(distanceKm) || 5);
    res.json({ estimatedFarePKR: fare, distanceKm: distanceKm || 5 });
  });

  app.post("/api/trips/request", (req, res) => {
    const { 
      riderId, riderName, riderMobile, 
      pickupAddress, pickupLat, pickupLng, 
      destAddress, destLat, destLng, 
      distanceKm, vehicleType, paymentMethod 
    } = req.body;

    const estimatedFarePKR = calculateFare(vehicleType as VehicleType, distanceKm || 5);

    const newTrip: TripRequest = {
      id: `trip_${Date.now()}`,
      riderId: riderId || 'r_1',
      riderName: riderName || 'Hamza Khan',
      riderMobile: riderMobile || '03001234567',
      pickupAddress,
      pickupLat: Number(pickupLat),
      pickupLng: Number(pickupLng),
      destAddress,
      destLat: Number(destLat),
      destLng: Number(destLng),
      distanceKm: Number(distanceKm) || 5,
      estimatedDurationMin: Math.round((Number(distanceKm) || 5) * 2.4),
      estimatedFarePKR,
      vehicleType: vehicleType || 'mini',
      status: 'requested',
      paymentMethod: paymentMethod || 'cash',
      createdAt: new Date().toISOString()
    };

    trips.unshift(newTrip);

    // Notify online drivers matching vehicle type or general
    const nearbyOnlineDrivers = drivers.filter(d => 
      d.status === 'approved' && 
      d.isOnline && 
      d.currentSubscription?.status === 'active'
    );

    nearbyOnlineDrivers.forEach(d => {
      notifications.unshift({
        id: `n_${Date.now()}_${d.id}`,
        userId: d.id,
        role: 'driver',
        title: '🚖 New Ride Request Nearby!',
        message: `${newTrip.pickupAddress.slice(0, 30)} → PKR ${estimatedFarePKR} (${newTrip.vehicleType.toUpperCase()})`,
        isRead: false,
        type: 'info',
        createdAt: new Date().toISOString()
      });
    });

    res.status(201).json({ message: 'Ride request dispatched!', trip: newTrip });
  });

  app.get("/api/trips", (_req, res) => {
    res.json(trips);
  });

  app.post("/api/trips/:id/accept", (req, res) => {
    const { id } = req.params;
    const { driverId } = req.body;

    const trip = trips.find(t => t.id === id);
    if (!trip) return res.status(404).json({ message: 'Trip request not found' });

    const driver = drivers.find(d => d.id === driverId);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });

    if (trip.status !== 'requested') {
      return res.status(400).json({ message: 'Trip has already been accepted or cancelled.' });
    }

    trip.status = 'accepted';
    trip.driverId = driver.id;
    trip.driverName = driver.fullName;
    trip.driverMobile = driver.mobile;
    trip.driverVehicleReg = driver.vehicle.regNumber;
    trip.driverRating = driver.rating;
    trip.acceptedAt = new Date().toISOString();

    // Notify Rider
    notifications.unshift({
      id: `n_${Date.now()}`,
      userId: trip.riderId,
      role: 'rider',
      title: 'Driver Accepted Your Ride! 🚗',
      message: `${driver.fullName} (${driver.vehicle.brand} ${driver.vehicle.model} - ${driver.vehicle.regNumber}) is on the way!`,
      isRead: false,
      type: 'success',
      createdAt: new Date().toISOString()
    });

    res.json({ message: 'Ride accepted successfully', trip });
  });

  app.post("/api/trips/:id/update-status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'arrived' | 'in_progress' | 'completed' | 'cancelled'

    const trip = trips.find(t => t.id === id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    trip.status = status;

    if (status === 'completed') {
      trip.completedAt = new Date().toISOString();

      if (trip.driverId) {
        const driver = drivers.find(d => d.id === trip.driverId);
        if (driver) {
          driver.totalTrips += 1;
          driver.totalEarnings += trip.estimatedFarePKR; // 100% earnings to driver! 0% commission!
        }
      }

      // Notify Rider
      notifications.unshift({
        id: `n_${Date.now()}`,
        userId: trip.riderId,
        role: 'rider',
        title: 'Trip Completed 🎉',
        message: `Total fare PKR ${trip.estimatedFarePKR} paid directly to driver. Thank you for riding with Apni Car!`,
        isRead: false,
        type: 'success',
        createdAt: new Date().toISOString()
      });
    }

    res.json({ message: `Trip status updated to ${status}`, trip });
  });

  // 6. Admin Analytics
  app.get("/api/admin/stats", (_req, res) => {
    // calculate stats
    const totalDrivers = drivers.length;
    const activeOnlineDrivers = drivers.filter(d => d.isOnline).length;
    const totalRiders = riders.length;
    const totalTrips = trips.length;
    const totalSubscriptionRevenuePKR = subscriptions
      .filter(s => s.paymentStatus === 'paid')
      .reduce((sum, s) => sum + s.amountPKR, 0);
    const pendingApprovals = drivers.filter(d => d.status === 'pending').length;
    const expiredSubscriptions = drivers.filter(d => d.currentSubscription?.status === 'expired').length;

    const stats: AdminStats = {
      totalDrivers,
      activeOnlineDrivers,
      totalRiders,
      totalTrips,
      totalSubscriptionRevenuePKR,
      pendingApprovals,
      expiredSubscriptions
    };

    res.json(stats);
  });

  app.get("/api/notifications", (req, res) => {
    const { userId } = req.query;
    if (userId) {
      const userNotes = notifications.filter(n => n.userId === userId || n.userId === 'admin');
      return res.json(userNotes);
    }
    res.json(notifications);
  });

  // Vite Middleware for Development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Apni Car Server running on http://localhost:${PORT}`);
  });
}

startServer();
