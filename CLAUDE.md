# Personal Dashboard — Claude 作業ガイド

## このプロジェクトについて

Shunpei のパーソナルダッシュボード。マーケティング関連情報を一元管理する目的で構築。
Next.js 16 (App Router) + NextAuth (Google OAuth) + Vercel デプロイ。

**実装済み機能**
- Intelligence Hub — RSSソースから記事を自動収集し、カテゴリ別に表示

**未実装（stub）**
- X Trend、PR Center

---

## ディレクトリ構成

```
app/
  page.tsx                  # トップページ（/）
  dashboard/page.tsx        # ダッシュボード（/dashboard）
  auth/signin/              # サインイン画面
  api/auth/[...nextauth]/   # 認証API
  api/news/route.ts         # RSSフェッチ・記事分類API
components/
  intelligence/             # Intelligence Hub の各UIコンポーネント
  PRopsCenter.tsx           # X Trend（stub）
  BrandGrowth.tsx           # PR Center（stub）
  Providers.tsx             # NextAuth SessionProvider
lib/
  auth.ts                   # NextAuth 設定・許可メールアドレス
  intelligenceSettings.ts   # ソース・カテゴリのデフォルト設定と保存ロジック
proxy.ts                    # 認証ミドルウェア（Next.js 16）
```

---

## 開発コマンド

```bash
npm run dev      # 開発サーバー起動（localhost:3000）
npm run build    # ビルド確認
```

`.env.local` に以下が必要：
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

---

## 重要ルール

- **`proxy.ts` は絶対にリネームしない** — Next.js 16 の規約。`middleware.ts` に変えるとビルドが壊れる
- **ソースの追加・削除は `lib/intelligenceSettings.ts` のみ** — 他のファイルに書かない
- **デプロイは git push で自動** — Vercel が GitHub を検知して自動ビルド・デプロイ

---

## Intelligence Hub の仕組み

1. ブラウザが `lib/intelligenceSettings.ts` の設定を localStorage から読み込む
2. `GET /api/news?sources=[...]` を呼び出す
3. `app/api/news/route.ts` が RSS を並列取得し、キーワードでカテゴリ分類・Priority判定・サムネイル取得
4. `SummaryCards` / `PriorityNews` / `NewsByCategory` に表示

**カテゴリ一覧（id）：** `AI & Tech` / `Marketing` / `Soccer` / `Fashion` / `Other`

**Priority News：** `PRIORITY_KEYWORDS`（route.ts）にマッチした記事は全ソース共通で自動表示。追加対応不要。

---

## 基本設定値

変更したい場合はファイルと値を参照すること。

| 設定 | 値 | ファイル |
|------|-----|---------|
| メインカラー | `#7C6FC4` | 各コンポーネント（全体で統一） |
| Priority News 表示上限 | 15件 | `components/intelligence/IntelligenceHub.tsx` |
| 1ソースあたりの記事取得数 | 50件 | `app/api/news/route.ts`（`ITEMS_PER_FEED`） |

---

## ソース追加・削除の手順

### 追加

1. **RSS確認** — 対象サイトのRSSフィードURLを確認する
2. **カテゴリ確認** — ユーザーが指定していない場合は必ず聞く
   - 既存カテゴリ → そのまま使用
   - 新規カテゴリ → `intelligenceSettings.ts` の `categories[]` にも追加し、`route.ts` の `Category` 型・`ALL_CATEGORIES`・`detectCategory()` にも追加
3. **`lib/intelligenceSettings.ts`** の `DEFAULT_SETTINGS.sources` に追記
4. **カテゴリ固定が必要な場合** — キーワード判定で誤分類されるソースは `route.ts` のソース固定分類ブロックに追加
5. **サムネイル確認**
   - RSS内に画像あり（enclosure / media:content / media:thumbnail / content:encoded の `<img>`）→ 自動対応済み
   - RSS内に画像なし → `route.ts` の og:image フェッチ条件に追加（The Interline と同じ処理）
6. **git commit & push** → Vercel 自動デプロイ

### 削除

`lib/intelligenceSettings.ts` の `DEFAULT_SETTINGS.sources` から該当行を削除して push。
