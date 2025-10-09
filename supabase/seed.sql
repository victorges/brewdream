-- Seed data for local development
-- This file is automatically run when you start local Supabase with: supabase start
-- It creates a test user for easy local development testing without OTP

-- ==============================================================================
-- SECURITY NOTE:
-- This seed file ONLY runs on local Supabase instances.
-- Production Supabase never executes seed files, so test user won't exist there.
-- Even if someone bypasses frontend checks, they can't login as a non-existent user.
-- ==============================================================================

-- Create test user in users table
-- Using INSERT with ON CONFLICT to make this idempotent (safe to run multiple times)
INSERT INTO public.users (email)
VALUES ('test@brew.local')
ON CONFLICT (email) DO NOTHING;

-- Note about Supabase Auth:
-- The Supabase Auth user (auth.users table) is created separately when you first
-- login via the Login component. This seed file only creates the app-level user record.

-- Add helpful comment to users table
COMMENT ON TABLE public.users IS
  'App users table. In local dev, test@brew.local is auto-seeded for testing.';

