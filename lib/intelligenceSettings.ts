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

const STORAGE_KEY = "intelligence_settings_v2";

export function loadSettings(): IntelligenceSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      sources: parsed.sources ?? DEFAULT_SETTINGS.sources,
      categories: parsed.categories ?? DEFAULT_SETTINGS.categories,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: IntelligenceSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
