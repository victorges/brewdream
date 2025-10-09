# Local Development Setup

Quick guide to get up and running with local Supabase and test account.

## Quick Start (5 minutes)

```bash
# 1. Clone and install
git clone <YOUR_GIT_URL>
cd clip-and-brew
npm install

# 2. Create .env.local and fill in any missing secrets
cp .env.local.example .env.local
# Edit .env.local if you need to add API keys for testing
code .env.local || vim .env.local

# 3. Start Supabase (first time takes ~2 min to download images)
npm run supabase:start
# ✅ Test user auto-seeded via seed.sql

# 4. Start dev server
npm run dev

# 5. Open http://localhost:8080/login
# ✅ Email pre-filled: test@brew.local
# ✅ Click "Login (Dev Mode)" - no OTP needed!
```

## Prerequisites

Before starting, install:

1. **Node.js & npm** - [nvm installation guide](https://github.com/nvm-sh/nvm#installing-and-updating)
   ```bash
   nvm install node
   ```

2. **Docker Desktop** - [download from docker.com](https://www.docker.com/products/docker-desktop)
   - Required for local Supabase
   - Start Docker Desktop before running `npm run supabase:start`

Note: Supabase CLI is already included as a dev dependency, no need to install globally!

## What Gets Auto-Configured

When you run `supabase start`:

✅ **PostgreSQL database** on port 54322
✅ **Supabase Studio** at http://localhost:54323
✅ **API Gateway** at http://localhost:54321
✅ **Auth service** with test user pre-seeded
✅ **Storage service** for file uploads
✅ **Edge Functions runtime**

The `supabase/seed.sql` file automatically creates:
- Test user: `test@brew.local` in the `users` table

## Verifying Setup

### Check Supabase is Running
```bash
npm run supabase:status
```

Expected output:
```
API URL: http://localhost:54321
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
...
```

### Check Test User Exists
1. Open Supabase Studio: http://localhost:54323
2. Navigate to: Table Editor → users table
3. Should see row with email = `test@brew.local`

### Test Login Flow
1. Open app: http://localhost:8080/login
2. Email should be pre-filled with `test@brew.local`
3. See message: "🧪 Dev mode: Auto-login enabled (no OTP needed)"
4. Click "Login (Dev Mode)" button
5. Should redirect to `/capture` immediately (no OTP)

## Alternative: Hosted Supabase

If you prefer using hosted Supabase instead of local:

1. Create project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings → API
3. Update `.env.local`:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
   ```
4. Test user will be created on first login (not auto-seeded)

## Troubleshooting

### Docker not running
```
Error: Cannot connect to Docker daemon
```
**Fix:** Start Docker Desktop and wait for it to fully load

### Port already in use
```
Error: Port 54321 already allocated
```
**Fix:** Stop conflicting service or change ports in `supabase/config.toml`

### Seed file not running
```
Test user doesn't exist in database
```
**Fix:** Reset local Supabase to re-run seed file:
```bash
npm run supabase:reset
```

### Test login not working
**Check:**
1. Is app running on localhost? (not 127.0.0.1 or other)
2. Is Supabase running? (`npm run supabase:status`)
3. Does test user exist in database? (check Studio)
4. Check browser console for errors

## Daily Workflow

```bash
# Start of day
npm run supabase:start  # If not already running
npm run dev

# Work on features...

# End of day
# Supabase keeps running (or stop with: npm run supabase:stop)
```

## Useful Commands

```bash
# Check Supabase status
npm run supabase:status

# Reset database (re-runs migrations + seed)
npm run supabase:reset

# Generate TypeScript types from DB schema
npm run supabase:types

# Stop Supabase
npm run supabase:stop

# View Supabase logs
npx supabase logs

# Apply new migrations
npx supabase db push
```

## Security Notes

- ✅ `.env.local` is gitignored (never commit secrets)
- ✅ Test user only exists in local Supabase (never in production)
- ✅ Production uses real email OTP (no test account)
- ✅ Local Supabase is isolated (can't affect production)

For detailed security analysis, see [SECURITY.md](./SECURITY.md)

## Next Steps

Once you're up and running:
1. Read [VIBEME.md](./VIBEME.md) for project architecture
2. Read [PRD.md](./PRD.md) for product requirements
3. Check [README.md](./README.md) for deployment info

Happy coding! 🚀

