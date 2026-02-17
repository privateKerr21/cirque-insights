# Cirque — Content Planning Dashboard

## Project Location
**`C:\Users\kerrk\OneDrive\Documents\Claude Cirque`** — all files must be created/modified here.

## Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (Postgres + Auth + RLS)
- **AI**: Google Gemini 2.0 Flash
- **Icons**: lucide-react

## Project Structure
```
Claude Cirque/
├── src/
│   ├── app/
│   │   ├── (dashboard)/          # Auth-protected pages (uses layout with Sidebar)
│   │   │   ├── layout.tsx        # Dashboard shell — sidebar + main content
│   │   │   ├── generate/         # AI content generation
│   │   │   ├── drafts/           # Draft management (list + [id] editor)
│   │   │   └── calendar/         # Content calendar (landing page)
│   │   ├── api/
│   │   │   ├── drafts/           # CRUD drafts
│   │   │   ├── calendar/         # CRUD calendar events
│   │   │   ├── generate/         # AI generation endpoint
│   │   │   └── suggestions/      # AI-driven content suggestions
│   │   ├── login/                # Auth page (login/signup)
│   │   ├── layout.tsx            # Root layout (fonts, metadata)
│   │   ├── page.tsx              # Root redirect → /calendar
│   │   └── globals.css
│   ├── components/
│   │   └── sidebar.tsx           # Navigation sidebar (Calendar, Generate, Drafts)
│   ├── lib/
│   │   ├── types.ts              # TypeScript interfaces (Draft, CalendarEvent, etc.)
│   │   ├── constants.ts          # Platforms, prompt templates
│   │   ├── utils.ts              # cn() helper
│   │   ├── gemini.ts             # Gemini AI client
│   │   ├── supabase-browser.ts   # Client-side Supabase (anon key)
│   │   └── supabase-server.ts    # Server-side Supabase (cookie auth)
│   └── middleware.ts             # Auth middleware
├── supabase/
│   └── schema.sql                # Main database schema
├── public/
│   └── logo.png                  # Brand logo
├── .env.local                    # Environment variables (not committed)
└── package.json
```

## Key Conventions
- **Path alias**: `@/*` maps to `./src/*`
- **Database**: All tables use RLS.
- **Auth**: Supabase Auth with cookie-based sessions. Middleware enforces auth on all routes except `/login` and `/auth`.
- **Brand settings**: Key-value pairs in `brand_settings` table, scoped per user with `UNIQUE(user_id, key)`.
- **Sidebar logo**: Uses `next/image` with `/logo.png`, not a lucide icon.
- **Landing page**: `/calendar` is the default authenticated landing page.

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=         # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Supabase anon/public key
GEMINI_API_KEY=                   # Google Gemini API key
```

## Commands
- `npm run dev` — Start dev server (Turbopack)
- `npm run build` — Production build
- `npm run lint` — ESLint
