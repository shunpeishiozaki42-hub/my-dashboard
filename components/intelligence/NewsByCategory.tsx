"use client";

import { useState } from "react";
import type { NewsItem, Category } from "@/app/api/news/route";
import { ALL_CATEGORIES } from "@/app/api/news/route";

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

type Props = { items: NewsItem[] };

export default function NewsByCategory({ items }: Props) {
  const [selected, setSelected] = useState<"All" | Category>("All");

  const filtered = selected === "All" ? items : items.filter((i) => i.category === selected);

  const count = (cat: "All" | Category) =>
    cat === "All" ? items.length : items.filter((i) => i.category === cat).length;

  const tabs: ("All" | Category)[] = ["All", ...ALL_CATEGORIES];

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">News by Category</h3>
        <span className="text-xs text-gray-400">{filtered.length} 件</span>
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelected(tab)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              selected === tab
                ? "text-white border-transparent"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
            style={selected === tab ? { backgroundColor: "#993C1D", borderColor: "#993C1D" } : {}}
          >
            {tab}
            <span className="ml-1 opacity-60">({count(tab)})</span>
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
              className="flex items-start justify-between gap-4 px-4 py-3 hover:bg-gray-50 transition-colors group bg-white"
            >
              <div className="flex items-start gap-3 min-w-0">
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
