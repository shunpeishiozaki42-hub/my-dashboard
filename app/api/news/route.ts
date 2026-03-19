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
  { url: "https://www.goal.com/feeds/en/news", source: "Goal.com", defaultCategory: "Soccer" },
];

type RawItem = Parser.Item & { categories?: string[] };

function detectCategory(item: RawItem, defaultCategory: Category): Category {
  const text = `${item.title ?? ""} ${item.contentSnippet ?? ""}`.toLowerCase();
  const cats = (item.categories ?? []).join(" ").toLowerCase();

  if (/soccer|football|goal|match|league|fifa|uefa|world cup|j-?league/i.test(text + cats)) return "Soccer";
  if (/regulat|policy|law|gdpr|compliance|government|ministry|legislation/i.test(text + cats)) return "Policy";
  if (/funding|raise|series [a-e]|venture|investment|vc |seed round|valuation|ipo|acquisition/i.test(text + cats)) return "Funding";
  if (/marketing|brand|campaign|advertis|pr |public relations|seo|sns|influencer|content strategy|マーケ|施策|広告|デジタル|コンテンツ|ec |crm|sns運用|プロモーション|メディア|ブランド|顧客|集客|リード|コンバージョン|メールマガジン|ランディング/i.test(text + cats)) return "Marketing";
  if (/competitor|rival|versus|market share|industry/i.test(text + cats)) return "Competitors";
  if (/ai|artificial intelligence|machine learning|llm|gpt|openai|chatgpt|gemini|claude|generative|deep learning|automation|robot/i.test(text + cats)) return "AI & Tech";
  if (/tech|software|hardware|startup|app|platform|cloud|api|saas|developer/i.test(text + cats)) return "AI & Tech";

  return defaultCategory;
}

const parser = new Parser({
  customFields: { item: [["category", "categories", { keepArray: true }]] },
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

  const results = await Promise.allSettled(
    feeds.map(async ({ url, source, defaultCategory }) => {
      const feed = await parser.parseURL(url);
      return feed.items.slice(0, 20).map((item) => {
        const cat = detectCategory(item as RawItem, defaultCategory);
        return {
          title: item.title ?? "",
          link: item.link ?? "",
          pubDate: item.pubDate ?? item.isoDate ?? "",
          summary: item.contentSnippet?.slice(0, 180) ?? "",
          category: cat,
          source,
          isPriority: cat === "AI & Tech" || cat === "Funding",
        } satisfies NewsItem;
      });
    })
  );

  const allItems: NewsItem[] = [];
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

  return NextResponse.json({ items: allItems, fetchedAt: new Date().toISOString() });
}
