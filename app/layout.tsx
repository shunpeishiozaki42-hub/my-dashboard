import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Intelligence Lab · Personal Dashboard",
  description: "マーケティング関連情報を一元管理",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
