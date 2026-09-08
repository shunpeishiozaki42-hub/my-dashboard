"use client";

import { useEffect, useState } from "react";
import type { NewsItem, PriorityTopic } from "@/app/api/news/route";
import type { CategorySetting, SourceSetting } from "@/lib/intelligenceSettings";
import { TOPIC_COLORS } from "./priorityTopicColors";
import { getCategoryColor } from "./categoryColors";

/** タブID。"priority" と "All" は固定、それ以外はカテゴリID */
export type NewsTabId = "priority" | "All" | string;

/** 一度に表示する記事数（4列×5行）。「さらに表示」でこの件数ずつ増える */
const PAGE_SIZE = 20;

const MAIN_COLOR = "#7C6FC4";

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

/** タブごとのアクセントカラー */
function getTabColor(id: NewsTabId): string {
  if (id === "priority" || id === "All") return MAIN_COLOR;
  return getCategoryColor(id);
}

type Props = {
  items: NewsItem[];
  categorySettings: CategorySetting[];
  sources?: SourceSetting[];
  selectedId: NewsTabId;
  onSelectId: (id: NewsTabId) => void;
};

export default function NewsTabs({ items, categorySettings, sources = [], selectedId, onSelectId }: Props) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // タブが切り替わったら表示件数をリセット
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedId]);

  const filterByTab = (id: NewsTabId) => {
    if (id === "priority") return items.filter((i) => i.isPriority);
    if (id === "All") return items;
    return items.filter((i) => i.category === id);
  };

  const filtered = filterByTab(selectedId);
  const visibleList = filtered.slice(0, visibleCount);
  const remaining = filtered.length - visibleList.length;

  const linkOnlySources = sources.filter((s) => s.isLinkOnly && s.enabled);
  const visibleLinkOnlySources = linkOnlySources.filter(
    (s) => selectedId === "All" || s.defaultCategory === selectedId
  );

  const getDisplayName = (id: string) =>
    categorySettings.find((c) => c.id === id)?.displayName ?? id;

  const tabs: { id: NewsTabId; label: string; sub?: string }[] = [
    { id: "priority", label: "Priority", sub: "AI & EQ & Fashion Topics" },
    { id: "All", label: "All" },
    ...categorySettings.map((c) => ({ id: c.id, label: c.displayName })),
  ];
  const currentTab = tabs.find((t) => t.id === selectedId) ?? tabs[0];

  return (
    <section id="news-tabs" className="scroll-mt-20">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-3">
          {/* 縦線 */}
          <div
            className="w-[3px] rounded-full self-stretch flex-shrink-0"
            style={{ background: "linear-gradient(#8F82D8, #6D5FBF)" }}
          />
          <div className="flex items-baseline gap-2">
            <h3 className="text-base font-semibold text-gray-900">
              {currentTab.id === "priority" ? "Priority News" : `${currentTab.label} News`}
            </h3>
            {currentTab.sub && <span className="text-xs text-gray-400">{currentTab.sub}</span>}
          </div>
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">{filtered.length} 件</span>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {tabs.map((tab) => {
          const color = getTabColor(tab.id);
          const active = selectedId === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectId(tab.id)}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                active
                  ? "text-white border-transparent"
                  : "bg-white text-gray-600 border-[#E5E2EF] hover:border-gray-400"
              }`}
              style={
                active
                  ? {
                      backgroundColor: color,
                      borderColor: color,
                      boxShadow: `0 3px 10px -2px ${color}80`,
                    }
                  : {}
              }
            >
              {/* 非選択タブに色のドット */}
              {!active && (
                <span
                  className="w-[7px] h-[7px] rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
              )}
              {tab.label}
              <span className="opacity-60">({filterByTab(tab.id).length})</span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="border border-[#EEECF4] rounded-xl bg-white shadow-[0_1px_2px_rgba(28,22,54,0.04)]">
          <p className="text-gray-400 text-sm text-center py-10">記事が見つかりませんでした。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleList.map((item) => (
            <NewsCard key={item.link} item={item} categoryLabel={getDisplayName(item.category)} />
          ))}
        </div>
      )}

      {/* さらに表示 */}
      {remaining > 0 && (
        <div className="mt-5 text-center">
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
        <div className="mt-6">
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

/** Priority News と同じ体裁のカード（サムネイル16:9 + バッジ + タイトル + ソース） */
function NewsCard({ item, categoryLabel }: { item: NewsItem; categoryLabel: string }) {
  const categoryColor = getCategoryColor(item.category);
  const topics: PriorityTopic[] = item.isPriority
    ? item.priorityTopics?.length
      ? item.priorityTopics
      : ["AI"]
    : [];

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group border border-[#EEECF4] rounded-xl overflow-hidden bg-white flex flex-col shadow-[0_1px_2px_rgba(28,22,54,0.04)] hover:-translate-y-[3px] hover:shadow-[0_14px_28px_-10px_rgba(28,22,54,0.22)] transition-all duration-200"
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
        <div className="flex items-center gap-2 mb-2 min-w-0">
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Priority トピックバッジ（塗り） */}
            {topics.map((topic) => (
              <span
                key={topic}
                className="text-xs font-bold px-2 py-0.5 rounded-sm text-white"
                style={{ backgroundColor: TOPIC_COLORS[topic] }}
              >
                {topic}
              </span>
            ))}
            {/* カテゴリチップ（淡色） */}
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-sm truncate max-w-[9rem]"
              style={{ backgroundColor: `${categoryColor}1A`, color: categoryColor }}
            >
              {categoryLabel}
            </span>
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(item.pubDate)}</span>
        </div>
        <h4 className="text-sm font-semibold text-gray-900 leading-snug group-hover:text-[#6D5FBF] transition-colors line-clamp-3 mb-2 flex-1">
          {item.title}
        </h4>
        <p className="text-xs text-gray-400">{item.source}</p>
      </div>
    </a>
  );
}
