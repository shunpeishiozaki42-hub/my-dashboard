"use client";

import { useState } from "react";
import type { NewsItem } from "@/app/api/news/route";
import type { CategorySetting } from "@/lib/intelligenceSettings";

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

type Props = {
  items: NewsItem[];
  categorySettings: CategorySetting[];
};

export default function NewsByCategory({ items, categorySettings }: Props) {
  const [selectedId, setSelectedId] = useState<"All" | string>("All");

  const filtered =
    selectedId === "All" ? items : items.filter((i) => i.category === selectedId);

  const countById = (id: "All" | string) =>
    id === "All" ? items.length : items.filter((i) => i.category === id).length;

  const getDisplayName = (id: string) =>
    categorySettings.find((c) => c.id === id)?.displayName ?? id;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-3 items-center">
          {/* 縦線 */}
          <div className="w-[3px] h-5 rounded-full flex-shrink-0" style={{ backgroundColor: "#993C1D" }} />
          <h3 className="text-base font-semibold text-gray-900">News by Category</h3>
        </div>
        <span className="text-xs text-gray-400">{filtered.length} 件</span>
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(["All", ...categorySettings.map((c) => c.id)] as ("All" | string)[]).map((id) => (
          <button
            key={id}
            onClick={() => setSelectedId(id)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              selectedId === id
                ? "text-white border-transparent"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
            style={selectedId === id ? { backgroundColor: "#993C1D", borderColor: "#993C1D" } : {}}
          >
            {id === "All" ? "All" : getDisplayName(id)}
            <span className="ml-1 opacity-60">({countById(id)})</span>
          </button>
        ))}
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-10">記事が見つかりませんでした。</p>
        ) : (
          filtered.map((item) => (
            <a
              key={item.link}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group bg-white"
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
                {item.isPriority && (
                  <span
                    className="mt-0.5 flex-shrink-0 text-xs font-bold px-1.5 py-0.5 rounded-sm text-white"
                    style={{ backgroundColor: "#993C1D" }}
                  >
                    P
                  </span>
                )}
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
    </section>
  );
}
