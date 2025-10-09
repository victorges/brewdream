-- Seed data (currently empty - users created on-demand)

-- Anonymous users are created when they click "Continue without email"
-- Test user (test@brew.local) is created on first login in local development
-- Regular users are created when they sign up with email

COMMENT ON TABLE public.users IS
  'App users table. Supports both anonymous (email=NULL) and authenticated (email set) users.';

