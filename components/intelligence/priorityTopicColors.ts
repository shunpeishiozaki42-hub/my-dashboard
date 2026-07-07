import type { PriorityTopic } from "@/app/api/news/route";
import { CATEGORY_COLORS } from "./categoryColors";

/** Priorityトピック別バッジの色。カテゴリ色と食い違わないよう categoryColors.ts から参照する */
export const TOPIC_COLORS: Record<PriorityTopic, string> = {
  // AI と EQ は「AI & EQ & Tech」のくくりなので同じ青で揃える
  AI: CATEGORY_COLORS["AI & EQ & Tech"],
  EQ: CATEGORY_COLORS["AI & EQ & Tech"],
  Fashion: CATEGORY_COLORS["Fashion"],
};
