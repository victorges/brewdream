# Brewdream - Realtime AI Video Summit

> **🤖 For AI Agents**:
> - Read [`PRD.md`](./PRD.md) first to understand **what to build** (product vision, requirements, acceptance criteria)
> - Then read [`VIBEME.md`](./VIBEME.md) to understand **how it's built** (current implementation, architecture patterns, coding conventions)
> - These documents are tightly integrated - PRD is the source of truth for features, VIBEME is the source of truth for code patterns

## Project info

**Project**: Brewdream - Mobile-first microsite for Livepeer × Daydream Summit (Open Source AI Week)

**What it does**: Attendees scan QR, create AI-stylized video clips (3-10s), share on X, get coffee tickets

**URL**: https://lovable.dev/projects/c0dae90c-30a9-4f3c-904d-7418f6e67422

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c0dae90c-30a9-4f3c-904d-7418f6e67422) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Create .env.local and fill in any missing secrets (API keys, etc)
cp .env.local.example .env.local
# Edit .env.local to add any API keys you need for testing
code .env.local || vim .env.local

# Step 5: Start local Supabase (Docker required)
npm run supabase:start
# This will start PostgreSQL, Auth, Storage, etc. locally
# The seed.sql file will automatically create the test user

# Alternative: Use hosted Supabase instead
# Create a project at supabase.com and update .env.local with your URL and key

# Step 6: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Prerequisites:**
- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Docker Desktop - [install from docker.com](https://www.docker.com/products/docker-desktop) (required for local Supabase)

## Local Development Testing

When running with local Supabase, a test account is automatically seeded for easy testing:

### Quick Start

1. Make sure local Supabase is running: `supabase start`
2. Start dev server: `npm run dev`
3. Navigate to `/login` - email will be pre-filled with `test@brew.local`
4. Click "Login (Dev Mode)" - you'll be auto-logged in without OTP
5. Test the full flow: camera → record → clip → share

### How It Works

**Local Supabase:**
- Test user `test@brew.local` is auto-seeded via `supabase/seed.sql`
- Runs automatically when you `supabase start`
- No manual setup needed!

**Hosted/Production Supabase:**
- Test user doesn't exist by default
- Will be created on first login attempt (if you're running on localhost)
- Or just use real email OTP for testing

### Security Model

This approach is secure because:
- ✅ **Production website** (not on localhost) = test account features disabled in UI
- ✅ **Local Supabase** = test account auto-seeded for convenience
- ✅ **Production Supabase** = test account won't exist (never seeded there)
- ✅ Even if someone bypasses frontend, test user simply won't exist in production database

**Key insight:** Test user is only seeded in local Supabase. Production database won't have it unless someone with database access creates it manually (which would require compromised credentials anyway).

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c0dae90c-30a9-4f3c-904d-7418f6e67422) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
