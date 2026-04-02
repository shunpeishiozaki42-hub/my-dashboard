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

## Source Management

Sources are managed exclusively in `lib/intelligenceSettings.ts` (`DEFAULT_SETTINGS.sources`). Do not add sources anywhere else.

### Adding a new source

1. **RSS confirmation**: Verify the site has an RSS feed before adding.
2. **Category**: If the user does not specify a category, ask before proceeding.
   - Existing category → add to that category
   - New category → add to both `sources[].defaultCategory` and `categories[]` in `DEFAULT_SETTINGS`
3. **Fixed classification**: If keyword-based detection would misclassify the source, add it to the source-fixed classification block in `app/api/news/route.ts` (around line 270).
4. **Thumbnail**: Check how the RSS feed provides images and ensure thumbnails are retrieved correctly.
   - If RSS contains images (enclosure / media:content / media:thumbnail / `<img>` in content:encoded) → `extractImageFromRss` handles it automatically
   - If RSS has no images → add the source to the og:image fetch condition in `route.ts` (same pattern as The Interline)
5. **Priority News**: No extra work needed. `isPriorityArticle()` applies to all sources automatically — AI-related articles will appear in Priority News regardless of source.

### Workflow

```
User: "Add [site]"
  → Confirm RSS URL
  → Confirm category (ask if not specified)
  → Edit lib/intelligenceSettings.ts
  → Edit app/api/news/route.ts if needed (fixed category / og:image)
  → git commit & push → Vercel auto-deploy
```
