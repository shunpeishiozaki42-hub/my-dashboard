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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((item) => (
          <a
            key={item.link}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group border border-gray-200 rounded-xl overflow-hidden hover:border-gray-400 hover:shadow-sm transition-all bg-white flex flex-col"
          >
            {/* 画像エリア（16:9） */}
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement;
                    el.style.display = "none";
                    const placeholder = el.nextElementSibling as HTMLElement | null;
                    if (placeholder) placeholder.style.display = "flex";
                  }}
                />
              ) : null}
              {/* プレースホルダー（画像なし or 読み込み失敗時） */}
              <div
                className="absolute inset-0 bg-gray-100 flex items-center justify-center"
                style={{ display: item.imageUrl ? "none" : "flex" }}
              >
                <span className="text-gray-300 text-3xl">📰</span>
              </div>
            </div>

            {/* テキストエリア */}
            <div className="p-4 flex flex-col flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-sm text-white flex-shrink-0"
                  style={{ backgroundColor: "#993C1D" }}
                >
                  PRIORITY
                </span>
                <span className="text-xs text-gray-400">{formatDate(item.pubDate)}</span>
              </div>
              <h4 className="text-sm font-semibold text-gray-900 leading-snug group-hover:underline line-clamp-3 mb-2 flex-1">
                {item.title}
              </h4>
              <p className="text-xs text-gray-400">{item.source}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
