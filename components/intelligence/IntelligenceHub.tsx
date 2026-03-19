"use client";

import { useEffect, useState, useCallback } from "react";
import type { NewsItem } from "@/app/api/news/route";
import type { IntelligenceSettings } from "@/lib/intelligenceSettings";
import { loadSettings, saveSettings } from "@/lib/intelligenceSettings";
import SummaryCards from "./SummaryCards";
import PriorityNews from "./PriorityNews";
import NewsByCategory from "./NewsByCategory";
import SettingsPanel from "./SettingsPanel";

export default function IntelligenceHub() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<IntelligenceSettings>(() => loadSettings());

  const fetchNews = useCallback(async (currentSettings?: IntelligenceSettings) => {
    setLoading(true);
    setError(null);
    try {
      const s = currentSettings ?? settings;
      const enabledSources = s.sources.filter((src) => src.enabled);
      const sourcesParam = encodeURIComponent(
        JSON.stringify(enabledSources.map(({ url, name, defaultCategory }) => ({ url, name, defaultCategory })))
      );
      const res = await fetch(`/api/news?sources=${sourcesParam}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setItems(data.items ?? []);
      setFetchedAt(data.fetchedAt ?? "");
    } catch {
      setError("ニュースの取得に失敗しました。ネットワーク状況を確認してください。");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  function handleSaveSettings(newSettings: IntelligenceSettings) {
    setSettings(newSettings);
    saveSettings(newSettings);
    fetchNews(newSettings);
  }

  const enabledCategories = settings.categories.filter((c) => c.enabled);
  const enabledCategoryIds = new Set(enabledCategories.map((c) => c.id));
  const visibleItems = items.filter((item) => enabledCategoryIds.has(item.category));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📚 Intelligence Hub</h2>
          <p className="text-gray-500 text-sm mt-1">
            複数RSSソースから最新情報を自動収集・カテゴリ分類
          </p>
          {fetchedAt && (
            <p className="text-gray-400 text-xs mt-1">
              Last updated: {new Date(fetchedAt).toLocaleString("ja-JP")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => fetchNews()}
            disabled={loading}
            className="flex items-center gap-1.5 border border-gray-200 hover:border-gray-400 bg-white text-gray-700 text-sm px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
          >
            <span className={loading ? "animate-spin inline-block" : ""}>↻</span>
            更新
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-1.5 border border-gray-200 hover:border-gray-400 bg-white text-gray-700 text-sm px-3 py-1.5 rounded-lg transition-colors"
          >
            ⚙ 設定
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loading && items.length === 0 ? (
        <LoadingSkeleton />
      ) : (
        <>
          <SummaryCards items={visibleItems} />
          <PriorityNews items={visibleItems.filter((i) => i.isPriority).slice(0, 6)} />
          <NewsByCategory items={visibleItems} categorySettings={enabledCategories} />
        </>
      )}

      {settingsOpen && (
        <SettingsPanel
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl" />
        ))}
      </div>
      <div className="h-56 bg-gray-100 rounded-xl" />
      <div className="h-80 bg-gray-100 rounded-xl" />
    </div>
  );
}
