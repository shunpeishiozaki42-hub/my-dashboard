import type { NewsItem } from "@/app/api/news/route";

type Props = { items: NewsItem[] };

export default function SummaryCards({ items }: Props) {
  const stats = [
    {
      label: "Total News",
      value: items.length,
      sub: `${new Set(items.map((i) => i.source)).size} ソース`,
    },
    {
      label: "Priority Items",
      value: items.filter((i) => i.isPriority).length,
      sub: "AI & Tech / Funding",
    },
    {
      label: "Marketing",
      value: items.filter((i) => i.category === "Marketing").length,
      sub: "MarkeZine · PR Times",
    },
    {
      label: "Funding",
      value: items.filter((i) => i.category === "Funding").length,
      sub: "資金調達・M&A",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
