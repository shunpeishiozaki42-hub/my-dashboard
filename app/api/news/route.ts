import { NextResponse } from "next/server";
import Parser from "rss-parser";

export type NewsItem = {
  title: string;
  link: string;
  pubDate: string;
  summary: string;
  category: Category;
  source: string;
  isPriority: boolean;
  imageUrl?: string;
};

export type Category =
  | "AI & Tech"
  | "Funding"
  | "Competitors"
  | "Marketing"
  | "Policy"
  | "Soccer"
  | "Other";

export const ALL_CATEGORIES: Category[] = [
  "AI & Tech",
  "Funding",
  "Competitors",
  "Marketing",
  "Policy",
  "Soccer",
  "Other",
];

const FEEDS: { url: string; source: string; defaultCategory: Category }[] = [
  { url: "https://techcrunch.com/feed/", source: "TechCrunch", defaultCategory: "AI & Tech" },
  { url: "https://www.theverge.com/rss/index.xml", source: "The Verge", defaultCategory: "AI & Tech" },
  { url: "https://asia.nikkei.com/rss/feed/nar", source: "Nikkei Asia", defaultCategory: "Policy" },
  { url: "https://prtimes.jp/rss20.xml", source: "PR Times", defaultCategory: "Marketing" },
  { url: "https://markezine.jp/rss/new/20/index.xml", source: "MarkeZine", defaultCategory: "Marketing" },
  { url: "https://feeds.bbci.co.uk/sport/football/rss.xml", source: "BBC Sport", defaultCategory: "Soccer" },
  { url: "https://predge.jp/feed/", source: "Predge", defaultCategory: "Marketing" },
];

type RawItem = Parser.Item & {
  categories?: string[];
  mediaContent?: { $: { url: string; medium?: string } };
  mediaThumbnail?: { $: { url: string } };
};

function decodeHtmlEntities(url: string): string {
  return url.replace(/&#0*38;/g, "&").replace(/&amp;/g, "&");
}

function extractImageFromRss(item: RawItem): string | undefined {
  // enclosure（標準RSS）
  if (item.enclosure?.url && item.enclosure.type?.startsWith("image/")) {
    return item.enclosure.url;
  }
  // media:content
  if (item.mediaContent?.$?.url) {
    return item.mediaContent.$.url;
  }
  // media:thumbnail
  if (item.mediaThumbnail?.$?.url) {
    return item.mediaThumbnail.$.url;
  }
  // content HTML の <img> タグ（The Verge など content:encoded を持つソース）
  const html = item.content ?? "";
  const match = html.match(/<img[^>]+src="([^"]+)"/);
  if (match) return decodeHtmlEntities(match[1]);
  return undefined;
}

// og:image をページの先頭 12KB だけ読んで取得する
async function fetchOgImage(url: string): Promise<string | undefined> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DashboardBot/1.0)" },
    });
    if (!res.ok || !res.body) return undefined;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let text = "";
    let bytesRead = 0;
    while (bytesRead < 12000) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
      bytesRead += value.length;
      if (text.includes("</head>")) break;
    }
    reader.cancel();

    const match =
      text.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i) ??
      text.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i) ??
      text.match(/<meta[^>]+name="twitter:image"[^>]+content="([^"]+)"/i) ??
      text.match(/<meta[^>]+content="([^"]+)"[^>]+name="twitter:image"/i);

    return match ? decodeHtmlEntities(match[1]) : undefined;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}

function detectCategory(item: RawItem, defaultCategory: Category): Category {
  const text = `${item.title ?? ""} ${item.contentSnippet ?? ""}`.toLowerCase();
  const cats = (item.categories ?? []).join(" ").toLowerCase();

  if (/\bsoccer\b|football match|soccer match|\bfifa\b|\buefa\b|world cup|j-?league|epl |premier league|champions league|bundesliga|serie a|la liga|\bgoalscorer\b|\bfootballer\b/i.test(text + cats)) return "Soccer";
  if (/regulat|policy|law|gdpr|compliance|government|ministry|legislation/i.test(text + cats)) return "Policy";
  if (/funding|raise|series [a-e]|venture|investment|vc |seed round|valuation|ipo|acquisition/i.test(text + cats)) return "Funding";
  if (/marketing|brand|campaign|advertis|pr |public relations|seo|sns|influencer|content strategy|マーケ|施策|広告|デジタル|コンテンツ|ec |crm|sns運用|プロモーション|メディア|ブランド|顧客|集客|リード|コンバージョン|メールマガジン|ランディング/i.test(text + cats)) return "Marketing";
  if (/competitor|rival|versus|market share|industry/i.test(text + cats)) return "Competitors";
  if (/ai|artificial intelligence|machine learning|llm|gpt|openai|chatgpt|gemini|claude|generative|deep learning|automation|robot/i.test(text + cats)) return "AI & Tech";
  if (/tech|software|hardware|startup|app|platform|cloud|api|saas|developer/i.test(text + cats)) return "AI & Tech";

  return defaultCategory;
}

const parser = new Parser({
  customFields: {
    item: [
      ["category", "categories", { keepArray: true }],
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
    ],
  },
  timeout: 10000,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sourcesParam = searchParams.get("sources");

  let feeds: { url: string; source: string; defaultCategory: Category }[] = FEEDS;
  if (sourcesParam) {
    try {
      const parsed = JSON.parse(sourcesParam) as { url: string; name: string; defaultCategory: string }[];
      feeds = parsed.map(({ url, name, defaultCategory }) => ({
        url,
        source: name,
        defaultCategory: (defaultCategory as Category) ?? "Other",
      }));
    } catch {
      // fall back to default FEEDS
    }
  }

  // Step 1: RSS フィードを並列取得
  const results = await Promise.allSettled(
    feeds.map(async ({ url, source, defaultCategory }) => {
      const feed = await parser.parseURL(url);
      return feed.items.slice(0, 20).map((item) => {
        const cat = detectCategory(item as RawItem, defaultCategory);
        const imageUrl = extractImageFromRss(item as RawItem);
        return {
          title: item.title ?? "",
          link: item.link ?? "",
          pubDate: item.pubDate ?? item.isoDate ?? "",
          summary: item.contentSnippet?.slice(0, 180) ?? "",
          category: cat,
          source,
          isPriority: cat === "AI & Tech" || cat === "Funding",
          imageUrl,
        };
      });
    })
  );

  // Step 2: 重複排除
  const allItems: (Omit<NewsItem, "imageUrl"> & { imageUrl?: string })[] = [];
  const seen = new Set<string>();

  for (const result of results) {
    if (result.status === "fulfilled") {
      for (const item of result.value) {
        if (item.link && !seen.has(item.link)) {
          seen.add(item.link);
          allItems.push(item);
        }
      }
    }
  }

  allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  // Step 3: RSS から画像を取得できなかった記事に og:image をフェッチ
  const needsOgImage = allItems
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !item.imageUrl && !!item.link);

  const ogResults = await Promise.allSettled(
    needsOgImage.map(({ item }) => fetchOgImage(item.link))
  );

  for (let i = 0; i < needsOgImage.length; i++) {
    const result = ogResults[i];
    if (result.status === "fulfilled" && result.value) {
      allItems[needsOgImage[i].index].imageUrl = result.value;
    }
  }

  return NextResponse.json({ items: allItems as NewsItem[], fetchedAt: new Date().toISOString() });
}
