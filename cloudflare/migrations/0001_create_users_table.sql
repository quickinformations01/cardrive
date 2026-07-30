-- Cloudflare D1 Migration Script: 0001_create_users_table.sql
-- Execute using wrangler d1 execute DB --file=./migrations/0001_create_users_table.sql

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('driver', 'passenger', 'admin')) NOT NULL DEFAULT 'passenger',
  full_name TEXT NOT NULL,
  email TEXT,
  city TEXT DEFAULT 'Lahore',
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS drivers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cnic TEXT NOT NULL,
  licence_number TEXT,
  vehicle_type TEXT DEFAULT 'mini',
  vehicle_brand TEXT,
  vehicle_model TEXT,
  vehicle_color TEXT,
  vehicle_reg_number TEXT NOT NULL,
  cnic_front_url TEXT,
  licence_image_url TEXT,
  vehicle_image_url TEXT,
  is_approved BOOLEAN DEFAULT 0,
  is_online BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);
