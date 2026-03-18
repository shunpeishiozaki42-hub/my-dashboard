import Link from "next/link";

const modules = [
  {
    num: "01",
    icon: "📚",
    title: "Intelligence Hub",
    description: "TechCrunch・The Verge・日経・PR Times・MarkeZineなど複数ソースからRSSを自動収集。カテゴリ別に整理します。",
    href: "/dashboard?tab=intelligence",
    badge: "毎時自動更新",
    badgeStyle: "bg-green-100 text-green-700 border border-green-200",
  },
  {
    num: "02",
    icon: "📡",
    title: "PR Ops Center",
    description: "プレスリリース管理・メディアリスト・広報アクション管理。",
    href: "/dashboard?tab=pr",
    badge: "Coming soon",
    badgeStyle: "bg-gray-100 text-gray-500 border border-gray-200",
  },
  {
    num: "03",
    icon: "📈",
    title: "Brand Growth",
    description: "ブランドメンション・SNSエンゲージメント・成長指標トラッキング。",
    href: "/dashboard?tab=brand",
    badge: "Coming soon",
    badgeStyle: "bg-gray-100 text-gray-500 border border-gray-200",
  },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">モジュール一覧</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {modules.map((mod) => (
          <Link
            key={mod.num}
            href={mod.href}
            className="group border border-gray-200 rounded-2xl p-6 hover:border-gray-400 hover:shadow-sm transition-all bg-white"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-xs font-mono text-gray-400">{mod.num}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${mod.badgeStyle}`}>
                {mod.badge}
              </span>
            </div>
            <div className="text-3xl mb-3">{mod.icon}</div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">{mod.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{mod.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
