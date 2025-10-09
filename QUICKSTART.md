# Brewdream - Quick Start (Hackathon Edition)

## Get Running in 2 Minutes ⚡

```bash
# 1. Clone the repo
git clone <REPO_URL>
cd clip-and-brew

# 2. Install dependencies
npm install

# 3. Get .env.local from your team
# (Contains Supabase credentials - ask in Slack/Discord)

# 4. Start developing!
npm run dev
# → Open http://localhost:8080
```

## What's Inside

**Anonymous Login:**
- Users can start creating clips without email
- Session persists in browser
- Optional: Add email later for coffee tickets

**Test Account:**
- Email: `test@brew.local`
- Works on localhost only (auto-login, no OTP)
- Perfect for quick testing

**Stack:**
- React + TypeScript + Vite
- Supabase (auth + database)
- Tailwind + shadcn/ui
- Daydream AI + Livepeer (video)

## Project Structure

```
src/
├── components/     # UI components
│   ├── Login.tsx      # Anonymous + email auth
│   ├── Landing.tsx    # Marketing page
│   └── Gallery.tsx    # Home/clips gallery
├── pages/          # Route pages
│   ├── Capture.tsx    # Camera + record
│   └── ClipView.tsx   # View clip + share
└── integrations/
    └── supabase/      # Database client

supabase/
├── migrations/     # Database schema
└── functions/      # Edge functions (API proxy)
```

## Routes

```
/              → Gallery (home page, all clips)
/start         → Landing page (marketing)
/login         → Login (anonymous or email)
/capture       → Camera + AI effects + record
/clip/:id      → View clip + share to X + coffee ticket
```

## Key Features

✅ **Anonymous auth** - Start without email
✅ **Email OTP** - Magic link authentication
✅ **WebRTC camera** - Front/back camera selector
✅ **AI effects** - Real-time Daydream processing
✅ **Clip recording** - 3-10 second clips
✅ **Social sharing** - Post to X (Twitter)
✅ **Coffee tickets** - QR codes for redemption

## Common Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run linter
```

## Troubleshooting

**"Can't connect to Supabase"**
- Check `.env.local` exists and has correct credentials
- Ask team for latest `.env.local` file

**"Test account not working"**
- Only works on `localhost` or `127.0.0.1`
- Production requires real email

**"Anonymous login fails"**
- Check Supabase anonymous auth is enabled in dashboard
- Auth → Providers → Enable "Anonymous sign-ins"

## Environment Variables

Create `.env.local` with:

```bash
# Supabase (required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# API Keys (optional)
VITE_DAYDREAM_API_KEY=dd_...
VITE_LIVEPEER_API_KEY=...
```

## Deployment

Lovable.dev auto-deploys from main branch.
Just push and it's live! 🚀

## Team Workflow

1. Get `.env.local` from team lead
2. Create feature branch: `git checkout -b feature/your-feature`
3. Make changes & test locally
4. Push to GitHub
5. Deploy via Lovable dashboard

## Need Help?

- Check `VIBEME.md` for architecture details
- Check `PRD.md` for product requirements
- Check `ANONYMOUS_AUTH.md` for auth flow details
- Ask in team chat!

---

**Ready to build?** Run `npm run dev` and open http://localhost:8080 🎉

