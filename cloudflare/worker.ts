export interface Env {
  DB: D1Database;
}

// Helper: Hash password using Web Crypto API (SHA-256)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'ApniCarSalt2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Standard CORS Headers for Web & Mobile Clients
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle OPTIONS Preflight CORS Request
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // POST /api/register
      if (url.pathname === '/api/register' && request.method === 'POST') {
        let body: any;
        try {
          body = await request.json();
        } catch {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Invalid JSON request body.',
            }),
            { status: 400, headers: corsHeaders }
          );
        }

        const { fullName, phone, password, role, email, city, cnic, vehicleType, regNumber } = body;

        // 1. Validate Input
        if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Full name is required.',
            }),
            { status: 400, headers: corsHeaders }
          );
        }

        if (!phone || typeof phone !== 'string' || !phone.trim()) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Phone number is required.',
            }),
            { status: 400, headers: corsHeaders }
          );
        }

        if (!password || typeof password !== 'string' || password.length < 6) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Password must be at least 6 characters long.',
            }),
            { status: 400, headers: corsHeaders }
          );
        }

        // Validate Role: driver, passenger, admin
        const validRoles = ['driver', 'passenger', 'admin'];
        const normalizedRole = (role && typeof role === 'string') ? role.toLowerCase().trim() : 'passenger';

        if (!validRoles.includes(normalizedRole)) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Invalid role. Must be one of: driver, passenger, admin.',
            }),
            { status: 400, headers: corsHeaders }
          );
        }

        // 2. Normalize Phone Number
        const normalizedPhone = phone.trim().replace(/[\s\-\(\)]/g, '');

        // 3. Check for Duplicate Phone Number using Prepared Statements
        const existingUser = await env.DB.prepare(
          'SELECT id FROM users WHERE phone = ?'
        )
          .bind(normalizedPhone)
          .first();

        if (existingUser) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Phone number already registered. Please login instead.',
            }),
            { status: 409, headers: corsHeaders }
          );
        }

        // 4. Hash Password using Web Crypto API
        const passwordHash = await hashPassword(password);
        const userId = `usr_${crypto.randomUUID()}`;
        const cleanName = fullName.trim();
        const cleanEmail = email ? String(email).trim() : null;
        const cleanCity = city ? String(city).trim() : 'Lahore';

        // 5. Insert User into Cloudflare D1
        await env.DB.prepare(
          `INSERT INTO users (id, phone, password_hash, role, full_name, email, city)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            userId,
            normalizedPhone,
            passwordHash,
            normalizedRole,
            cleanName,
            cleanEmail,
            cleanCity
          )
          .run();

        // 6. If role is driver, also insert into drivers table
        if (normalizedRole === 'driver') {
          const driverId = `drv_${crypto.randomUUID()}`;
          const cleanCnic = cnic ? String(cnic).trim() : 'PENDING';
          const cleanVehicleType = vehicleType ? String(vehicleType).trim() : 'mini';
          const cleanRegNum = regNumber ? String(regNumber).trim() : 'PENDING';

          await env.DB.prepare(
            `INSERT INTO drivers (id, user_id, cnic, vehicle_type, vehicle_reg_number)
             VALUES (?, ?, ?, ?, ?)`
          )
            .bind(
              driverId,
              userId,
              cleanCnic,
              cleanVehicleType,
              cleanRegNum
            )
            .run();
        }

        // 7. Return JSON Response (HTTP 201 Created)
        return new Response(
          JSON.stringify({
            success: true,
            message: 'User registered successfully.',
            user: {
              id: userId,
              fullName: cleanName,
              phone: normalizedPhone,
              role: normalizedRole,
              city: cleanCity,
              createdAt: new Date().toISOString(),
            },
          }),
          { status: 201, headers: corsHeaders }
        );
      }

      // Default Response for Unhandled Routes
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Endpoint not found.',
        }),
        { status: 404, headers: corsHeaders }
      );
    } catch (error: any) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error?.message || 'Internal Server Error',
        }),
        { status: 500, headers: corsHeaders }
      );
    }
  },
};
