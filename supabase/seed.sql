-- Seed data for local development
-- This file is automatically run when you start local Supabase with: supabase start

-- ==============================================================================
-- ANONYMOUS AUTH SUPPORT:
-- Users can now login anonymously (no email) or with email OTP.
-- The users table supports both: email=NULL for anonymous, email set for authenticated.
-- ==============================================================================

-- Test user for local development (optional - created on first login via Login component)
-- The test@brew.local user is created when you first login in local development
-- Anonymous users are created on-the-fly when they click "Continue without email"

-- Add helpful comment to users table
COMMENT ON TABLE public.users IS
  'App users table. Supports both anonymous (email=NULL) and authenticated (email set) users.';

