export type SourceSetting = {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  defaultCategory: string;
};

export type CategorySetting = {
  id: string;
  displayName: string;
  enabled: boolean;
};

export type IntelligenceSettings = {
  sources: SourceSetting[];
  categories: CategorySetting[];
};

export const DEFAULT_SETTINGS: IntelligenceSettings = {
  sources: [
    { id: "techcrunch", name: "TechCrunch", url: "https://techcrunch.com/feed/", enabled: true, defaultCategory: "AI & Tech" },
    { id: "theverge", name: "The Verge", url: "https://www.theverge.com/rss/index.xml", enabled: true, defaultCategory: "AI & Tech" },
    { id: "nikkei", name: "Nikkei Asia", url: "https://asia.nikkei.com/rss/feed/nar", enabled: true, defaultCategory: "Policy" },
    { id: "prtimes", name: "PR Times", url: "https://prtimes.jp/rss20.xml", enabled: true, defaultCategory: "Marketing" },
    { id: "markezine", name: "MarkeZine", url: "https://markezine.jp/rss/new/20/index.xml", enabled: true, defaultCategory: "Marketing" },
    { id: "goalcom", name: "Goal.com", url: "https://www.goal.com/feeds/en/news", enabled: true, defaultCategory: "Soccer" },
    { id: "predge", name: "Predge", url: "https://predge.jp/feed/", enabled: true, defaultCategory: "Marketing" },
  ],
  categories: [
    { id: "AI & Tech", displayName: "AI & Tech", enabled: true },
    { id: "Funding", displayName: "Funding", enabled: true },
    { id: "Competitors", displayName: "Competitors", enabled: true },
    { id: "Marketing", displayName: "Marketing", enabled: true },
    { id: "Policy", displayName: "Policy", enabled: true },
    { id: "Soccer", displayName: "Soccer", enabled: true },
    { id: "Other", displayName: "Other", enabled: true },
  ],
};

const STORAGE_KEY = "intelligence_settings";

type StoredData = {
  version: number;
  settings: IntelligenceSettings;
};

/**
 * ユーザー設定とデフォルト設定をマージする。
 * - デフォルトに新しく追加されたソース/カテゴリはデフォルト状態で追加
 * - デフォルトから削除されたソース/カテゴリはユーザー設定からも除去
 * - ユーザーが手動で追加したカスタムソース/カテゴリ（id が "custom_" で始まる）は維持
 * - 既存のユーザー設定（オン/オフ、名前変更など）はそのまま保持
 */
function mergeWithDefaults(saved: IntelligenceSettings): IntelligenceSettings {
  const defaultSourceIds = new Set(DEFAULT_SETTINGS.sources.map((s) => s.id));
  const defaultCategoryIds = new Set(DEFAULT_SETTINGS.categories.map((c) => c.id));

  const savedSources = saved.sources ?? [];
  const savedCategories = saved.categories ?? [];

  // デフォルトソースを順番通りに並べ、ユーザーの設定があれば上書き
  const mergedSources: SourceSetting[] = DEFAULT_SETTINGS.sources.map(
    (def) => savedSources.find((s) => s.id === def.id) ?? def
  );
  // ユーザーが手動追加したカスタムソースを末尾に保持
  const customSources = savedSources.filter((s) => !defaultSourceIds.has(s.id));

  // 同様にカテゴリもマージ
  const mergedCategories: CategorySetting[] = DEFAULT_SETTINGS.categories.map(
    (def) => savedCategories.find((c) => c.id === def.id) ?? def
  );
  const customCategories = savedCategories.filter((c) => !defaultCategoryIds.has(c.id));

  return {
    sources: [...mergedSources, ...customSources],
    categories: [...mergedCategories, ...customCategories],
  };
}

export function loadSettings(): IntelligenceSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const stored: StoredData = JSON.parse(raw);
    if (!stored.settings) return DEFAULT_SETTINGS;
    const merged = mergeWithDefaults(stored.settings);
    // マージ後の設定を保存（次回以降の差分検出のため）
    saveSettings(merged);
    return merged;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: IntelligenceSettings): void {
  if (typeof window === "undefined") return;
  const data: StoredData = { version: 0, settings };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
