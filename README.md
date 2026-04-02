# Personal Dashboard

マーケティング関連情報を一元管理するパーソナルダッシュボード。

## 機能

- **Intelligence Hub** — 複数RSSソースから記事を自動収集し、カテゴリ別に整理
- **X Trend** — Coming soon
- **PR Center** — Coming soon

## 開発

```bash
npm run dev    # 開発サーバー起動（localhost:3000）
npm run build  # ビルド
```

## 環境変数

`.env.local` に以下を設定：

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```
