import Link from "next/link";

const cards = [
  {
    num: "01",
    icon: "📚",
    title: "Intelligence Hub",
    description: "複数RSSソースから最新情報を自動収集し、カテゴリ別に整理します。",
    href: "/dashboard?tab=intelligence",
    badge: "毎時自動更新",
    badgeStyle: "bg-green-100 text-green-700 border border-green-200",
  },
  {
    num: "02",
    icon: "🕊️",
    title: "X Trend",
    description: "Xのトレンドやキーワード等、世の中の今を収集・モニタリング。",
    href: "/dashboard?tab=pr",
    badge: "Coming soon",
    badgeStyle: "bg-gray-100 text-gray-500 border border-gray-200",
  },
  {
    num: "03",
    icon: "📢",
    title: "PR Center",
    description: "自社のPR情報・エンゲージメントをトラッキング。",
    href: "/dashboard?tab=brand",
    badge: "Coming soon",
    badgeStyle: "bg-gray-100 text-gray-500 border border-gray-200",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        {/* Label */}
        <p
          className="text-xs font-semibold tracking-widest uppercase mb-4"
          style={{ color: "#993C1D" }}
        >
          Personal Dashboard
        </p>

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
          Intelligence Lab
        </h1>

        {/* Subtext */}
        <p className="text-gray-500 text-lg mb-14">マーケティング関連情報を一元管理</p>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-3xl">
          {cards.map((card) => (
            <Link
              key={card.num}
              href={card.href}
              className="group border border-gray-200 rounded-2xl p-6 hover:border-gray-400 hover:shadow-sm transition-all bg-white"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs font-mono text-gray-400">{card.num}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${card.badgeStyle}`}>
                  {card.badge}
                </span>
              </div>
              <div className="text-3xl mb-3">{card.icon}</div>
              <h2
                className="text-base font-semibold mb-2 transition-colors"
                style={{ color: "#111" }}
              >
                {card.title}
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">{card.description}</p>
            </Link>
          ))}
        </div>
      </main>

      <footer className="text-center text-gray-400 text-xs py-6 border-t border-gray-100">
        Personal Dashboard · Operated by Shunpei Shiozaki with Claude
      </footer>
    </div>
  );
}
