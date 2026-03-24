# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
```

No test runner or linter is configured.

## Environment Variables

Required in `.env.local`:
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

## Architecture

Next.js App Router app. Key directories:
- `app/` — pages and API routes
- `components/` — React client components
- `lib/` — shared utilities

### Auth

Google OAuth via next-auth. Access is restricted to a hardcoded allowlist in `lib/auth.ts`. Unauthenticated users are redirected to `/auth/signin`.

### Data Flow (Intelligence Hub)

The only live feature. Data flows:

1. `IntelligenceHub` (client) reads settings from `localStorage` via `lib/intelligenceSettings.ts`
2. Calls `GET /api/news?sources=<json>` with enabled sources
3. Server-side route (`app/api/news/route.ts`) fetches RSS feeds in parallel, classifies articles into categories using keyword regex, flags priority articles with `PRIORITY_KEYWORDS`, and fetches og:image for articles missing thumbnails
4. Results are rendered in `SummaryCards`, `PriorityNews`, `NewsByCategory`

### Settings Persistence

User settings (RSS sources + categories) are stored in `localStorage` under key `intelligence_settings`. `mergeWithDefaults()` in `lib/intelligenceSettings.ts` handles merging user overrides with defaults on load — custom sources use the `custom_` ID prefix.

### Tabs Structure

Dashboard has 3 tabs (`/dashboard?tab=<id>`):
- `intelligence` → `IntelligenceHub` (implemented)
- `pr` → `PRopsCenter` (stub)
- `brand` → `BrandGrowth` (stub)
