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

## ソース管理

ソースは `lib/intelligenceSettings.ts` の `DEFAULT_SETTINGS.sources` のみで管理する。他のファイルには追加しない。

### 新しいソースを追加する手順

1. **RSS確認**: 追加前にそのサイトのRSSフィードURLを確認する。
2. **カテゴリ**: ユーザーがカテゴリを指定していない場合は必ず確認してから進める。
   - 既存カテゴリ → そのカテゴリに追加
   - 新規カテゴリ → `DEFAULT_SETTINGS` の `sources[].defaultCategory` と `categories[]` の両方に追加
3. **カテゴリ固定**: キーワード判定で誤分類されそうなソースは `app/api/news/route.ts` のソース固定分類ブロック（270行目付近）に追加する。
4. **サムネイル**: RSSの画像提供方式を確認し、正しく取得できるようにする。
   - RSS内に画像あり（enclosure / media:content / media:thumbnail / content:encoded の `<img>`）→ `extractImageFromRss` が自動対応
   - RSS内に画像なし → `route.ts` の og:image フェッチ条件にそのソースを追加（The Interline と同じ処理）
5. **Priority News**: 追加対応不要。`isPriorityArticle()` は全ソースに自動適用されるため、AI関連記事はソース問わずPriority表示される。

### 作業フロー

```
ユーザー：「〇〇を追加したい」
  → RSSのURLを確認
  → カテゴリを確認（未指定なら聞く）
  → lib/intelligenceSettings.ts を編集
  → 必要に応じて app/api/news/route.ts を編集（カテゴリ固定 / og:image）
  → git commit & push → Vercel 自動デプロイ
```
