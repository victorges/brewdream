# Security Notes

## Test Account Protection

### The Problem
The codebase includes a test account (`test@brew.local`) with hardcoded credentials for local development. Since the code is open source, anyone can see these credentials and could potentially:
1. Visit the production website
2. Open browser DevTools console
3. Call `supabase.auth.signInWithPassword()` directly with the test credentials
4. Login as the test user (if it exists)

**Frontend checks alone are NOT sufficient** - they can be bypassed via DevTools.

### The Solution (Seed-Based Approach)

Instead of trying to block the test account, we **only create it where it's needed**: local development.

#### How It Works

**Local Supabase (`supabase/seed.sql`):**
```sql
-- Auto-seeded when you run: supabase start
INSERT INTO public.users (email)
VALUES ('test@brew.local')
ON CONFLICT (email) DO NOTHING;
```

**Production Supabase:**
- No seed file runs in production
- Test user is never created
- Database simply won't have this user

**Frontend (`Login.tsx`):**
```typescript
const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const canUseTestAccount = isLocalDev;
```

This is for **UX only**:
- Pre-fills email field when running on localhost
- Shows helpful "dev mode" messaging
- Can be bypassed via DevTools (doesn't matter - see below)

#### Why This Is Secure

**Attack Scenario: Someone bypasses frontend on production**
1. Visit production website (e.g., brewdream.app)
2. Open DevTools console
3. Run: `supabase.auth.signInWithPassword({ email: 'test@brew.local', password: 'test123456' })`
4. **Result:** Login fails - user doesn't exist in production database

**Key Principle:** You can't login as a user that doesn't exist, even with correct credentials.

**Production database** → Never seeded → Test user doesn't exist → Login impossible

**Local database** → Auto-seeded → Test user exists → Login works (intended behavior)

### Attack Scenarios Analysis

#### Scenario 1: Bypass Frontend via DevTools on Production
**Attack:**
1. Visit production website (brewdream.app)
2. Open browser console
3. Run: `supabase.auth.signInWithPassword({ email: 'test@brew.local', password: 'test123456' })`

**Result:** ❌ **FAILS** - User doesn't exist in production database
- Production database was never seeded with test user
- Login attempt returns "Invalid login credentials" error
- No security breach

#### Scenario 2: Someone Seeds Test User in Production
**Attack:** Bad actor with database access manually creates test user in production

**Result:** ⚠️ **POSSIBLE** - If someone has database access, they can do anything
- But this requires compromised Supabase credentials
- If credentials are compromised, test user is the least of your worries
- Real security is protecting the Supabase service role key

**Mitigation:**
- Keep Supabase credentials secure (never commit to git)
- Use environment variables for keys
- Rotate keys if compromised
- Monitor database for unexpected changes

#### Scenario 3: Developer Tests Locally with Production Supabase
**Attack:** Developer sets `.env.local` to point to production Supabase URL

**Result:** ⚠️ **TEST USER CREATED IN PRODUCTION** on first login
- This is developer error, not a security breach
- Developer has production credentials (authorized access)
- Test user has no special privileges (same as any user)

**Mitigation:**
- Use local Supabase for development (recommended)
- Use separate staging/dev Supabase instance
- Document the setup process clearly (see README)

#### Scenario 4: Accidental Deployment with Test User
**Attack:** Test user exists in production, someone discovers the credentials from source code

**Result:** ⚠️ **LIMITED IMPACT**
- Test user has same permissions as any regular user
- Can create clips, but can't access other users' data (RLS policies)
- Can't modify system settings or access admin functions
- Mainly an inconvenience (test clips in gallery)

**Mitigation:**
- Simply delete the test user from production: `DELETE FROM users WHERE email = 'test@brew.local'`
- Enforce local-only development workflow

### Best Practices

1. **Use local Supabase for development**: `supabase start`
   - Test user is auto-seeded
   - Isolated from production
   - No risk of polluting production database

2. **Keep credentials secure**:
   - Never commit `.env` or `.env.local` to git
   - Use environment variables for all secrets
   - Rotate Supabase keys if compromised

3. **Use separate instances**:
   - Local Supabase for development
   - Staging Supabase for pre-production testing (optional)
   - Production Supabase for live app

4. **Monitor for test user in production**:
   - If test user appears in production, delete it: `DELETE FROM users WHERE email = 'test@brew.local'`
   - Check who created it and how

### For Developers

**Recommended setup:**
```bash
# 1. Start local Supabase (auto-seeds test user)
supabase start

# 2. Copy env config for local Supabase
cp .env.local.example .env.local
# (Contains http://localhost:54321)

# 3. Start dev server
npm run dev

# 4. Navigate to /login and use test@brew.local
```

### Alternative Approaches Considered

1. **Database CHECK constraint** ❌
   - Would block test email in production
   - But requires manual removal in local dev
   - More setup friction

2. **Auth Hooks** ❌
   - Requires Supabase dashboard configuration
   - More complex to maintain
   - Not portable across projects

3. **Environment variables check** ❌
   - Could be spoofed or misconfigured
   - Doesn't actually prevent the attack
   - False sense of security

4. **Seed-based approach (current)** ✅
   - Simple: test user only created where needed
   - Secure: production never gets seeded
   - No additional code or constraints needed
   - Best developer experience

### Key Security Principles

1. **Absence is the best defense**:
   - Don't try to block the test user in production
   - Just never create it there in the first place
   - Seed files only run in local Supabase

2. **Frontend checks are NOT security**:
   - The localhost check is purely for UX
   - Can be bypassed via DevTools (doesn't matter)
   - Real security is test user not existing in production database

3. **Credentials are the real security boundary**:
   - Supabase URL and keys in `.env.local` (gitignored)
   - Without credentials, can't access database
   - With compromised credentials, test user is least of your worries

4. **Test account has no special privileges**:
   - It's just a regular user account
   - Same RLS policies as any other user
   - Can't access other users' data or admin functions
   - Limited impact even if it exists in production

5. **Defense through simplicity**:
   - Fewer moving parts = fewer failure modes
   - Seed file approach is obvious and auditable
   - Easy to verify production database doesn't have test user

### Monitoring

Consider adding logging/monitoring for:
- Auth attempts with `test@brew.local` email
- Failed auth attempts from non-localhost origins
- Unusual patterns in user creation

---

Last updated: 2025-10-09

