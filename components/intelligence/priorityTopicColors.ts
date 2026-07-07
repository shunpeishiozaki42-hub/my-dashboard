import type { PriorityTopic } from "@/app/api/news/route";

/** Priorityトピック別バッジの色（メインカラーの紫とは重ねない） */
export const TOPIC_COLORS: Record<PriorityTopic, string> = {
  // AI と EQ は「AI & EQ & Tech」のくくりなので同じ青で揃える
  AI: "#3D7DD8",
  EQ: "#3D7DD8",
  Fashion: "#E0709B",
};
