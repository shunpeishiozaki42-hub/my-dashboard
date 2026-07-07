"use client";

import { useEffect, useState, useCallback } from "react";
import type { NewsItem } from "@/app/api/news/route";
import type { IntelligenceSettings } from "@/lib/intelligenceSettings";
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "@/lib/intelligenceSettings";
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
  // News by Category の選択タブ（サマリーカードからも操作するため親で管理）
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("All");
  // SSR対応: useState initializer は SSR で window がないため localStorage を読めない。
  // DEFAULT_SETTINGS で初期化し、useEffect でクライアントマウント後に読み込む。
  const [settings, setSettings] = useState<IntelligenceSettings>(DEFAULT_SETTINGS);

  // settings は常に引数で明示的に渡す（stale closure 対策）
  const fetchNews = useCallback(async (s: IntelligenceSettings) => {
    setLoading(true);
    setError(null);
    try {
      const enabledSources = s.sources.filter((src) => src.enabled && !src.isLinkOnly);
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
  }, []);

  // クライアントマウント後に localStorage から設定を読み込み、ニュースをフェッチ
  useEffect(() => {
    const saved = loadSettings();
    setSettings(saved);
    fetchNews(saved);
  }, [fetchNews]);

  // サマリーカードのクリックで該当セクションへ遷移
  function handleNavigate(target: "priority" | string) {
    if (target === "priority") {
      document.getElementById("priority-news")?.scrollIntoView({ behavior: "smooth" });
    } else {
      setSelectedCategoryId(target);
      document.getElementById("news-by-category")?.scrollIntoView({ behavior: "smooth" });
    }
  }

  function handleSaveSettings(newSettings: IntelligenceSettings) {
    setSettings(newSettings);
    saveSettings(newSettings);
    fetchNews(newSettings);
  }

  const enabledCategories = settings.categories.filter((c) => c.enabled);
  const enabledCategoryIds = new Set(enabledCategories.map((c) => c.id));
  const visibleItems = items.filter((item) => enabledCategoryIds.has(item.category));

  // 今日（ローカル日付）公開の記事
  const now = new Date();
  const todayItems = visibleItems.filter((item) => {
    const d = new Date(item.pubDate);
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📚 Intelligence Hub</h2>
          <p className="text-gray-500 text-sm mt-1">
            {loading && items.length === 0 ? (
              "最新情報を取得中…"
            ) : (
              <>
                今日の新着{" "}
                <span className="font-semibold" style={{ color: "#7C6FC4" }}>
                  {todayItems.length}件
                </span>{" "}
                — うちPriority{" "}
                <span className="font-semibold" style={{ color: "#7C6FC4" }}>
                  {todayItems.filter((i) => i.isPriority).length}件
                </span>
              </>
            )}
          </p>
          {fetchedAt && (
            <p className="text-gray-400 text-xs mt-1">
              Last updated: {new Date(fetchedAt).toLocaleString("ja-JP")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => fetchNews(settings)}
            disabled={loading}
            className="flex items-center gap-1.5 border border-[#E5E2EF] hover:border-gray-400 bg-white text-gray-700 text-sm px-3 py-1.5 rounded-lg shadow-[0_1px_2px_rgba(28,22,54,0.04)] transition-colors disabled:opacity-40"
          >
            <span className={loading ? "animate-spin inline-block" : ""}>↻</span>
            更新
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-1.5 border border-[#E5E2EF] hover:border-gray-400 bg-white text-gray-700 text-sm px-3 py-1.5 rounded-lg shadow-[0_1px_2px_rgba(28,22,54,0.04)] transition-colors"
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
          <SummaryCards
            items={visibleItems}
            categorySettings={enabledCategories}
            sources={settings.sources}
            onNavigate={handleNavigate}
          />
          <PriorityNews
            items={visibleItems.filter((i) => i.isPriority).slice(0, 20)}
            sources={settings.sources.filter((s) => s.enabled).map((s) => s.name)}
          />
          <NewsByCategory
            items={visibleItems}
            categorySettings={enabledCategories}
            sources={settings.sources}
            selectedId={selectedCategoryId}
            onSelectId={setSelectedCategoryId}
          />
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
          <div key={i} className="h-20 bg-[#ECEAF3] rounded-xl" />
        ))}
      </div>
      <div className="h-56 bg-[#ECEAF3] rounded-xl" />
      <div className="h-80 bg-[#ECEAF3] rounded-xl" />
    </div>
  );
}
