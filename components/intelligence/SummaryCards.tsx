import type { NewsItem } from "@/app/api/news/route";
import type { CategorySetting } from "@/lib/intelligenceSettings";
import { getCategoryColor } from "./categoryColors";

type Props = {
  items: NewsItem[];
  categorySettings: CategorySetting[];
};

export default function SummaryCards({ items, categorySettings }: Props) {
  const stats = [
    {
      label: "Total News",
      value: items.length,
      sub: `${new Set(items.map((i) => i.source)).size} ソース`,
      color: "#7C6FC4",
    },
    {
      label: "Priority News",
      value: items.filter((i) => i.isPriority).length,
      sub: "AI & EQ & Fashion Topics",
      color: "#7C6FC4",
    },
    ...categorySettings.map((cat) => ({
      label: cat.displayName,
      value: items.filter((i) => i.category === cat.id).length,
      sub: "",
      color: getCategoryColor(cat.id),
    })),
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="relative overflow-hidden border border-[#EEECF4] rounded-xl p-4 bg-white shadow-[0_1px_2px_rgba(28,22,54,0.04)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-8px_rgba(28,22,54,0.18)] transition-all duration-200"
        >
          {/* カテゴリ色のトップライン */}
          <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ backgroundColor: stat.color }} />
          <p className="text-xs text-gray-500 font-medium mb-1">{stat.label}</p>
          <p className="text-3xl font-bold text-gray-900 tabular-nums tracking-tight">{stat.value}</p>
          <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
}
