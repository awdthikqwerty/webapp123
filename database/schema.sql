-- Postgres schema for Mines app
-- Enables pgcrypto for gen_random_uuid() if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  telegram_id TEXT UNIQUE NOT NULL,
  balance NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id TEXT NOT NULL,
  profit NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes to speed up stat queries
CREATE INDEX IF NOT EXISTS idx_games_created_at ON games (created_at);
CREATE INDEX IF NOT EXISTS idx_games_telegram_id ON games (telegram_id);
