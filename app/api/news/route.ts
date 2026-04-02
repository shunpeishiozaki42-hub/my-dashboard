import { NextResponse } from "next/server";
import Parser from "rss-parser";

/** 1ソースあたりの最大取得件数。ここを変えれば全ソースに反映される */
const ITEMS_PER_FEED = 50;

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
  | "Marketing"
  | "Soccer"
  | "Fashion";

export const ALL_CATEGORIES: Category[] = [
  "AI & Tech",
  "Marketing",
  "Soccer",
  "Fashion",
];


type RawItem = Parser.Item & {
  categories?: string[];
  mediaContent?: { $: { url: string; medium?: string } };
  mediaThumbnail?: { $: { url: string } };
};

function decodeHtmlEntities(url: string): string {
  return url.replace(/&#0*38;/g, "&").replace(/&amp;/g, "&");
}

function extractImageFromRss(item: RawItem, source: string): string | undefined {
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
  // content:encoded の <img> タグ（WordPress 系ソース向け）
  const encodedContent = (item as RawItem & { "content:encoded"?: string })["content:encoded"] ?? "";
  if (encodedContent) {
    const encodedMatch = encodedContent.match(/<img[^>]+src="([^"]+)"/);
    if (encodedMatch) return decodeHtmlEntities(encodedMatch[1]);
  }
  return undefined;
}

// og:image をページの先頭 12KB だけ読んで取得する
async function fetchOgImage(url: string): Promise<string | undefined> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36" },
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

// ─── Priority キーワード ───────────────────────────────────────────────────
const PRIORITY_KEYWORDS = [
  // AI Search Optimization
  "AEO","GEO","LLMO","AIO","GAIO","AISO","Conversational SEO","Chat Search Optimization",
  "AI SERP","Synthetic SERP","Zero-click optimization","Answer ranking",
  "AI citation optimization","Citation SEO","Knowledge SEO","Entity-first SEO",
  "Topic authority","Semantic authority","Contextual ranking","Passage ranking",
  "Retrieval optimization","Vector SEO","Embedding optimization","Knowledge injection",
  "AI visibility","AI discoverability","AI indexability","Prompt discovery optimization",
  "Query intent alignment","Context matching","Relevance scoring","Trust scoring",
  "Hallucination mitigation SEO",
  // AI Content & Creative
  "Generative AI marketing","AI content strategy","Content automation","Content scaling",
  "Content factory","AI editorial","Programmatic SEO","Content orchestration",
  "Content atomization","Content recomposition","Synthetic content","AI copywriting",
  "AI storytelling","Narrative engineering","Content personalization","Dynamic content",
  "Content enrichment","Content clustering","Topic modeling","Multimodal content",
  "AI video generation","AI image generation","AI voice generation","Synthetic media",
  // Prompt & Agent
  "Prompt marketing","Prompt engineering","Prompt optimization","Prompt chaining",
  "Prompt templating","Prompt library","PromptOps","Context engineering",
  "Instruction tuning","Agent orchestration","Autonomous agents","AI workflow automation",
  "Task decomposition","Tool-augmented generation","Function calling","Memory systems",
  "Context window optimization","Token optimization","Multi-agent systems",
  "Human-in-the-loop","AI copiloting","Agentic marketing",
  // AI Analytics & Data
  "AI analytics","Augmented analytics","Predictive analytics","Prescriptive analytics",
  "Behavioral modeling","Intent prediction","Customer 360","Data enrichment",
  "Identity resolution","Feature engineering","Segmentation AI","Micro-segmentation",
  "Real-time decisioning","Streaming analytics","AI attribution","Incrementality modeling",
  "MMM","Causal inference","Lift measurement","Propensity modeling",
  "Next best action","Next best offer",
  // AI Advertising & Growth
  "AI advertising","AI growth marketing","Growth loops","Funnel optimization",
  "Conversion rate optimization","AI landing page optimization","Creative intelligence",
  "Creative automation","Programmatic advertising","Real-time bidding","Budget optimization",
  "Performance prediction","Creative fatigue detection","AI experimentation",
  "Multi-armed bandit","Reinforcement learning marketing",
  // AI CRM & CX
  "AI CRM","AI CX","Hyper-personalization","Conversational marketing",
  "Customer journey orchestration","Lifecycle marketing","Retention marketing",
  "Churn prediction","Sentiment analysis","Emotion AI","Voice of customer",
  "AI support automation","Chat commerce","AI concierge","Adaptive UX",
  // AI Social & Community
  "AI social listening","Trend prediction","Viral prediction","Community AI",
  "AI moderation","Engagement optimization","UGC generation","Synthetic UGC",
  "Meme generation","Influencer matching","Virtual influencer","Brand voice cloning",
  // AI Models & Infrastructure
  "LLM","Foundation models","Multimodal AI","Diffusion models","Transformer",
  "Embeddings","Vector database","RAG","Knowledge graph","Fine-tuning","LoRA",
  "Prompt tuning","Model distillation","Edge AI","On-device AI","AI infrastructure",
  "LLM stack",
  // AI-First Strategy
  "AI-first marketing","AI-native brand","Autonomous marketing","Self-driving marketing",
  "Algorithmic marketing","Decision intelligence","AI transformation","Digital twin",
  "Simulation marketing","Competitive intelligence","Market sensing","AI GTM",
  "AI positioning","Category design","Agent economy","Prompt economy",
  "Synthetic audience","AI twin","Personal AI","AI brand agents","Autonomous commerce",
  "AI-native UX","Generative UI","Post-search marketing","Searchless discovery",
  "Ambient computing","Attention economy","Context economy","Intent economy",
  // AI Products
  "AI search","LLM marketing","AI overview","AI SEO",
  "Claude","ChatGPT","Gemini","Perplexity","Copilot","Grok","DeepSeek","Llama",
  // AI 単体（大文字小文字不問）
  "AI",
  // Japanese
  "AIマーケティング","生成AIマーケティング","AI検索最適化","AIコンテンツ戦略",
  "プロンプトマーケティング","プロンプトエンジニアリング","プロンプト最適化",
  "AI広告","AI分析","予測分析","感情分析","顧客体験AI","AIエージェント",
  "自律型エージェント","エージェント型マーケ","マルチエージェント","AIワークフロー",
  "生成AI活用","AI活用マーケティング","AIコピーライティング","AI動画生成","AI画像生成",
  "ベクトルデータベース","知識グラフ","ファインチューニング","大規模言語モデル",
  "基盤モデル","エッジAI","AIインフラ","AIファースト","AIネイティブ",
  "自律型マーケティング","デジタルツイン","競争分析AI","エージェント経済",
  "プロンプト経済","合成オーディエンス","ポスト検索マーケティング","注意経済","文脈経済",
];

// 英語キーワードは単語境界付き、日本語はそのまま部分一致でマッチ
const PRIORITY_REGEX = new RegExp(
  PRIORITY_KEYWORDS.map((kw) => {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // 日本語・全角文字を含む場合は境界なし
    return /[\u3000-\u9fff\uff00-\uffef\u30a0-\u30ff\u3040-\u309f]/.test(kw)
      ? escaped
      : `\\b${escaped}\\b`;
  }).join("|"),
  "i"
);

function isPriorityArticle(title: string, summary: string): boolean {
  return PRIORITY_REGEX.test(`${title} ${summary}`);
}
// ──────────────────────────────────────────────────────────────────────────

function detectCategory(item: RawItem, defaultCategory: Category): Category {
  const text = `${item.title ?? ""} ${item.contentSnippet ?? ""}`.toLowerCase();
  const cats = (item.categories ?? []).join(" ").toLowerCase();

  if (/\bsoccer\b|football match|soccer match|\bfifa\b|\buefa\b|world cup|j-?league|epl |premier league|champions league|bundesliga|serie a|la liga|\bgoalscorer\b|\bfootballer\b/i.test(text + cats)) return "Soccer";
  if (/marketing|brand|campaign|advertis|pr |public relations|seo|sns|influencer|content strategy|マーケ|施策|広告|デジタル|コンテンツ|ec |crm|sns運用|プロモーション|メディア|ブランド|顧客|集客|リード|コンバージョン|メールマガジン|ランディング/i.test(text + cats)) return "Marketing";
  if (/fashion|ファッション|apparel|アパレル|textile|テキスタイル|clothing|衣類|beauty|ビューティ|wearable|style|luxury|designer|runway|couture/i.test(text + cats)) return "Fashion";
  if (/ai|artificial intelligence|machine learning|llm|gpt|openai|chatgpt|gemini|claude|generative|deep learning|automation|robot/i.test(text + cats)) return "AI & Tech";
  if (/tech|software|hardware|startup|app|platform|cloud|api|saas|developer/i.test(text + cats)) return "AI & Tech";

  return defaultCategory as Category;
}

const parser = new Parser({
  customFields: {
    item: [
      ["category", "categories", { keepArray: true }],
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
      ["content:encoded", "contentEncoded"],
    ],
  },
  timeout: 10000,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sourcesParam = searchParams.get("sources");

  let feeds: { url: string; source: string; defaultCategory: Category }[] = [];
  if (sourcesParam) {
    try {
      const parsed = JSON.parse(sourcesParam) as { url: string; name: string; defaultCategory: string; isLinkOnly?: boolean }[];
      const rssSources = parsed.filter((s) => !s.isLinkOnly);
      feeds = rssSources.map(({ url, name, defaultCategory }) => ({
        url,
        source: name,
        defaultCategory: (defaultCategory as Category) ?? "AI & Tech",
      }));
    } catch {
      // invalid sources param — fetch nothing
    }
  }

  // Step 1: RSS フィードを並列取得
  const results = await Promise.allSettled(
    feeds.map(async ({ url, source, defaultCategory }) => {
      const feed = await parser.parseURL(url);
      return feed.items.slice(0, ITEMS_PER_FEED).map((item) => {
        // ソース固定分類（キーワード分類より優先）
        const cat =
          source === "BBC Sport" ? "Soccer" :
          source === "The Interline" ? "Fashion" :
          source === "TechCrunch" ? "AI & Tech" :
          source === "MarkeZine" || source === "Predge" ? "Marketing" :
          detectCategory(item as RawItem, defaultCategory);
        const imageUrl = extractImageFromRss(item as RawItem, source);
        return {
          title: item.title ?? "",
          link: item.link ?? "",
          pubDate: item.pubDate ?? item.isoDate ?? "",
          summary: item.contentSnippet?.slice(0, 180) ?? "",
          category: cat,
          source,
          isPriority: isPriorityArticle(item.title ?? "", item.contentSnippet ?? ""),
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
    .filter(({ item }) => (!item.imageUrl && !!item.link) ||
      (item.source === "The Interline" && !!item.link));

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
