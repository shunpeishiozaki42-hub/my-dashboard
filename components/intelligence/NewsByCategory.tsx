"use client";

import { useEffect, useState } from "react";
import type { NewsItem, PriorityTopic } from "@/app/api/news/route";
import type { CategorySetting, SourceSetting } from "@/lib/intelligenceSettings";
import { TOPIC_COLORS } from "./priorityTopicColors";
import { getCategoryColor } from "./categoryColors";

/** 一度に表示する記事数。「さらに表示」でこの件数ずつ増える */
const PAGE_SIZE = 20;

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

type Props = {
  items: NewsItem[];
  categorySettings: CategorySetting[];
  sources?: SourceSetting[];
  selectedId: string;
  onSelectId: (id: string) => void;
};

export default function NewsByCategory({ items, categorySettings, sources = [], selectedId, onSelectId }: Props) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // タブが切り替わったら表示件数をリセット
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedId]);

  const linkOnlySources = sources.filter((s) => s.isLinkOnly && s.enabled);
  const visibleLinkOnlySources = linkOnlySources.filter(
    (s) => selectedId === "All" || s.defaultCategory === selectedId
  );

  const filtered =
    selectedId === "All" ? items : items.filter((i) => i.category === selectedId);
  const visibleList = filtered.slice(0, visibleCount);
  const remaining = filtered.length - visibleList.length;

  const countById = (id: "All" | string) =>
    id === "All" ? items.length : items.filter((i) => i.category === id).length;

  const getDisplayName = (id: string) =>
    categorySettings.find((c) => c.id === id)?.displayName ?? id;

  return (
    <section id="news-by-category" className="scroll-mt-20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-3 items-center">
          {/* 縦線 */}
          <div className="w-[3px] h-5 rounded-full flex-shrink-0" style={{ background: "linear-gradient(#8F82D8, #6D5FBF)" }} />
          <h3 className="text-base font-semibold text-gray-900">News by Category</h3>
        </div>
        <span className="text-xs text-gray-400">{filtered.length} 件</span>
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(["All", ...categorySettings.map((c) => c.id)] as ("All" | string)[]).map((id) => (
          <button
            key={id}
            onClick={() => onSelectId(id)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
              selectedId === id
                ? "text-white border-transparent"
                : "bg-white text-gray-600 border-[#E5E2EF] hover:border-gray-400"
            }`}
            style={
              selectedId === id
                ? {
                    backgroundColor: id === "All" ? "#7C6FC4" : getCategoryColor(id),
                    borderColor: id === "All" ? "#7C6FC4" : getCategoryColor(id),
                    boxShadow: `0 3px 10px -2px ${id === "All" ? "#7C6FC4" : getCategoryColor(id)}80`,
                  }
                : {}
            }
          >
            {/* 非選択タブにカテゴリ色のドット */}
            {selectedId !== id && (
              <span
                className="w-[7px] h-[7px] rounded-full flex-shrink-0"
                style={{ backgroundColor: id === "All" ? "#7C6FC4" : getCategoryColor(id) }}
              />
            )}
            {id === "All" ? "All" : getDisplayName(id)}
            <span className="opacity-60">({countById(id)})</span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="divide-y divide-[#F2F0F7] border border-[#EEECF4] rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(28,22,54,0.04)]">
        {filtered.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-10">記事が見つかりませんでした。</p>
        ) : (
          visibleList.map((item) => (
            <a
              key={item.link}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#F8F7FC] transition-colors group bg-white"
            >
              {/* サムネイル */}
              {item.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              )}
              <div className="flex items-start gap-2 min-w-0 flex-1">
                {item.isPriority &&
                  (item.priorityTopics?.length ? item.priorityTopics : ["AI" as PriorityTopic]).map((topic) => (
                    <span
                      key={topic}
                      className="mt-0.5 flex-shrink-0 text-xs font-bold px-1.5 py-0.5 rounded-sm text-white"
                      style={{ backgroundColor: TOPIC_COLORS[topic] }}
                    >
                      {topic}
                    </span>
                  ))}
                <span className="text-sm text-gray-800 group-hover:underline leading-snug line-clamp-2">
                  {item.title}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 text-right">
                <span className="text-xs text-gray-400 hidden sm:block">{item.source}</span>
                <span className="text-xs text-gray-400 w-14">{formatDate(item.pubDate)}</span>
              </div>
            </a>
          ))
        )}
      </div>

      {/* さらに表示 */}
      {remaining > 0 && (
        <div className="mt-3 text-center">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="text-sm font-medium text-gray-600 bg-white border border-[#E5E2EF] hover:border-gray-400 px-5 py-2 rounded-full shadow-[0_1px_2px_rgba(28,22,54,0.04)] transition-colors"
          >
            さらに{Math.min(PAGE_SIZE, remaining)}件表示（残り {remaining}件）
          </button>
        </div>
      )}

      {/* 📌 関連メディア（isLinkOnly ソース） */}
      {visibleLinkOnlySources.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold text-gray-400 mb-3">📌 関連メディア</p>
          <div className="flex flex-col gap-2">
            {visibleLinkOnlySources.map((src) => (
              <a
                key={src.id}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 border border-[#EEECF4] rounded-xl bg-white shadow-[0_1px_2px_rgba(28,22,54,0.04)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_-8px_rgba(28,22,54,0.18)] transition-all duration-200 group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 group-hover:underline">
                    {src.id === "fashiontechnews" ? "fashion tech news (by ZOZO NEXT)" : src.name}
                  </p>
                  {src.id === "fashiontechnews" && (
                    <p className="text-xs text-gray-400 mt-0.5">ファッション×テクノロジーのトレンドを発信するZOZO NEXTのメディア</p>
                  )}
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{src.defaultCategory}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
