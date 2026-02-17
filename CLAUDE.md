# Cirque — Social Media Dashboard

## Project Location
**`C:\Users\kerrk\OneDrive\Documents\Claude Cirque`** — all files must be created/modified here.

## Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (Postgres + Auth + RLS)
- **AI**: Google Gemini 2.0 Flash
- **Charts**: Recharts
- **Icons**: lucide-react

## Project Structure
```
Claude Cirque/
├── src/
│   ├── app/
│   │   ├── (dashboard)/          # Auth-protected pages (uses layout with Sidebar)
│   │   │   ├── layout.tsx        # Dashboard shell — sidebar + main content
│   │   │   ├── dashboard/        # Overview & analytics
│   │   │   ├── insights/         # Social media metrics tracking
│   │   │   ├── generate/         # AI content generation
│   │   │   ├── drafts/           # Draft management (list + [id] editor)
│   │   │   ├── calendar/         # Content calendar
│   │   │   └── settings/         # Integrations & Make webhook config
│   │   ├── api/
│   │   │   ├── insights/         # GET/POST social metrics
│   │   │   ├── drafts/           # CRUD drafts
│   │   │   ├── calendar/         # CRUD calendar events
│   │   │   ├── generate/         # AI generation endpoint
│   │   │   ├── suggestions/      # AI-driven suggestions
│   │   │   ├── settings/make/    # API key management & sync logs
│   │   │   └── webhooks/make/    # Inbound webhook from Make (API key auth)
│   │   ├── login/                # Auth page (login/signup)
│   │   ├── layout.tsx            # Root layout (fonts, metadata)
│   │   ├── page.tsx              # Root redirect
│   │   └── globals.css
│   ├── components/
│   │   └── sidebar.tsx           # Navigation sidebar
│   ├── lib/
│   │   ├── types.ts              # TypeScript interfaces (Insight, Draft, SyncLog, etc.)
│   │   ├── constants.ts          # Platforms, metrics, prompt templates
│   │   ├── utils.ts              # cn() helper
│   │   ├── gemini.ts             # Gemini AI client
│   │   ├── supabase-browser.ts   # Client-side Supabase (anon key)
│   │   ├── supabase-server.ts    # Server-side Supabase (cookie auth)
│   │   └── supabase-admin.ts     # Service role Supabase (bypasses RLS)
│   └── middleware.ts             # Auth middleware (exempts /api/webhooks/)
├── supabase/
│   ├── schema.sql                # Main database schema
│   └── make-integration.sql      # Sync log table migration
├── public/
│   └── logo.png                  # Brand logo
├── .env.local                    # Environment variables (not committed)
└── package.json
```

## Key Conventions
- **Path alias**: `@/*` maps to `./src/*`
- **Database**: All tables use RLS. Webhook route uses service role client to bypass RLS.
- **Auth**: Supabase Auth with cookie-based sessions. Middleware enforces auth on all routes except `/login`, `/auth`, and `/api/webhooks/`.
- **Upserts**: Insights use `onConflict: "platform,date"` — one row per platform per day.
- **Brand settings**: Key-value pairs in `brand_settings` table, scoped per user with `UNIQUE(user_id, key)`.
- **Sidebar logo**: Uses `next/image` with `/logo.png`, not a lucide icon.

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=        # Supabase service role key (server-only, bypasses RLS)
GEMINI_API_KEY=                   # Google Gemini API key
```

## Commands
- `npm run dev` — Start dev server (Turbopack)
- `npm run build` — Production build
- `npm run lint` — ESLint
