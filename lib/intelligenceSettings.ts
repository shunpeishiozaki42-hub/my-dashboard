export type SourceSetting = {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  defaultCategory: string;
  isLinkOnly?: boolean; // RSS非対応のリンクカード型ソース
};

export type CategorySetting = {
  id: string;
  displayName: string;
  enabled: boolean;
};

export type IntelligenceSettings = {
  sources: SourceSetting[];
  categories: CategorySetting[];
  /** ユーザーが明示的に削除したデフォルトソースのID */
  deletedSourceIds: string[];
  /** ユーザーが明示的に削除したデフォルトカテゴリのID */
  deletedCategoryIds: string[];
};

export const DEFAULT_SETTINGS: IntelligenceSettings = {
  deletedSourceIds: [],
  deletedCategoryIds: [],
  sources: [
    { id: "techcrunch", name: "TechCrunch", url: "https://techcrunch.com/feed/", enabled: true, defaultCategory: "AI & Tech" },
    { id: "theverge", name: "The Verge", url: "https://www.theverge.com/rss/index.xml", enabled: true, defaultCategory: "AI & Tech" },
    { id: "nikkei", name: "Nikkei Asia", url: "https://asia.nikkei.com/rss/feed/nar", enabled: true, defaultCategory: "Policy" },
    { id: "prtimes", name: "PR Times", url: "https://prtimes.jp/rss20.xml", enabled: true, defaultCategory: "Marketing" },
    { id: "markezine", name: "MarkeZine", url: "https://markezine.jp/rss/new/20/index.xml", enabled: true, defaultCategory: "Marketing" },
    { id: "bbcsport", name: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/football/rss.xml", enabled: true, defaultCategory: "Soccer" },
    { id: "predge", name: "Predge", url: "https://predge.jp/feed/", enabled: true, defaultCategory: "Marketing" },
    { id: "theinterline", name: "The Interline", url: "https://www.theinterline.com/feed/", enabled: true, defaultCategory: "Fashion" },
    { id: "fashiontechnews", name: "fashion tech news", url: "https://fashiontechnews.zozo.com/en", enabled: true, defaultCategory: "Fashion", isLinkOnly: true },
  ],
  categories: [
    { id: "AI & Tech", displayName: "AI & Tech", enabled: true },
    { id: "Funding", displayName: "Funding", enabled: true },
    { id: "Competitors", displayName: "Competitors", enabled: true },
    { id: "Marketing", displayName: "Marketing", enabled: true },
    { id: "Policy", displayName: "Policy", enabled: true },
    { id: "Soccer", displayName: "Soccer", enabled: true },
    { id: "Fashion", displayName: "Fashion", enabled: true },
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
 * - deletedSourceIds / deletedCategoryIds に含まれるIDはデフォルトから復活させない
 * - デフォルトに新しく追加されたソース/カテゴリはデフォルト状態で追加
 * - ユーザーが手動追加したカスタム（id が "custom_" で始まる）は維持
 * - 既存のユーザー設定（オン/オフ、名前変更など）はそのまま保持
 */
function mergeWithDefaults(saved: IntelligenceSettings): IntelligenceSettings {
  const deletedSourceIds = new Set(saved.deletedSourceIds ?? []);
  const deletedCategoryIds = new Set(saved.deletedCategoryIds ?? []);
  const defaultSourceIds = new Set(DEFAULT_SETTINGS.sources.map((s) => s.id));
  const defaultCategoryIds = new Set(DEFAULT_SETTINGS.categories.map((c) => c.id));

  const savedSources = saved.sources ?? [];
  const savedCategories = saved.categories ?? [];

  // 削除済みIDをスキップしつつ、ユーザーの設定を優先して使用
  const mergedSources: SourceSetting[] = DEFAULT_SETTINGS.sources
    .filter((def) => !deletedSourceIds.has(def.id))
    .map((def) => savedSources.find((s) => s.id === def.id) ?? def);
  const customSources = savedSources.filter((s) => !defaultSourceIds.has(s.id));

  const mergedCategories: CategorySetting[] = DEFAULT_SETTINGS.categories
    .filter((def) => !deletedCategoryIds.has(def.id))
    .map((def) => savedCategories.find((c) => c.id === def.id) ?? def);
  const customCategories = savedCategories.filter((c) => !defaultCategoryIds.has(c.id));

  return {
    sources: [...mergedSources, ...customSources],
    categories: [...mergedCategories, ...customCategories],
    deletedSourceIds: [...deletedSourceIds],
    deletedCategoryIds: [...deletedCategoryIds],
  };
}

export function loadSettings(): IntelligenceSettings {
  if (typeof window === "undefined") {
    console.log("[loadSettings] skipped: window undefined (SSR)");
    return DEFAULT_SETTINGS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    console.log("[loadSettings] raw value:", raw ? raw.slice(0, 200) : "null (nothing saved)");
    if (!raw) return DEFAULT_SETTINGS;
    const stored: StoredData = JSON.parse(raw);
    if (!stored.settings) {
      console.log("[loadSettings] stored.settings missing, returning DEFAULT");
      return DEFAULT_SETTINGS;
    }
    const merged = mergeWithDefaults(stored.settings);
    console.log("[loadSettings] merged sources:", merged.sources.map((s) => `${s.name}=${s.enabled}`).join(", "));
    return merged;
  } catch (e) {
    console.error("[loadSettings] parse error:", e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: IntelligenceSettings): void {
  if (typeof window === "undefined") {
    console.log("[saveSettings] skipped: window undefined (SSR)");
    return;
  }
  const data: StoredData = { version: 0, settings };
  const json = JSON.stringify(data);
  localStorage.setItem(STORAGE_KEY, json);
  const verify = localStorage.getItem(STORAGE_KEY);
  if (verify === json) {
    console.log("[saveSettings] ✅ saved & verified. sources:", settings.sources.map((s) => `${s.name}=${s.enabled}`).join(", "));
  } else {
    console.error("[saveSettings] ❌ write verification FAILED.");
  }
}
