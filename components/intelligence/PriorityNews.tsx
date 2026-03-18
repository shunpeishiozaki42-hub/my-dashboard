import type { NewsItem } from "@/app/api/news/route";

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

type Props = { items: NewsItem[] };

export default function PriorityNews({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Priority News</h3>
        <span className="text-xs text-gray-400">{items.length} 件</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item) => (
          <a
            key={item.link}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group border border-gray-200 rounded-xl p-4 hover:border-gray-400 hover:shadow-sm transition-all bg-white"
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-sm text-white"
                style={{ backgroundColor: "#993C1D" }}
              >
                PRIORITY
              </span>
              <span className="text-xs text-gray-400">{formatDate(item.pubDate)}</span>
            </div>
            <h4 className="text-sm font-semibold text-gray-900 leading-snug group-hover:underline line-clamp-2 mb-2">
              {item.title}
            </h4>
            <p className="text-xs text-gray-400">{item.source}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
