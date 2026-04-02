import type { NewsItem } from "@/app/api/news/route";
import type { CategorySetting } from "@/lib/intelligenceSettings";

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
    },
    {
      label: "Priority News",
      value: items.filter((i) => i.isPriority).length,
      sub: "AI Topics",
    },
    ...categorySettings.map((cat) => ({
      label: cat.displayName,
      value: items.filter((i) => i.category === cat.id).length,
      sub: "",
    })),
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="border border-gray-200 rounded-xl p-4 bg-white">
          <p className="text-xs text-gray-500 font-medium mb-1">{stat.label}</p>
          <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
}
