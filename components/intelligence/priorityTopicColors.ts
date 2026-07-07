import type { PriorityTopic } from "@/app/api/news/route";

/** Priorityトピック別バッジの色（メインカラーの紫とは重ねない） */
export const TOPIC_COLORS: Record<PriorityTopic, string> = {
  AI: "#3D7DD8",
  EQ: "#3FA796",
  Fashion: "#E0709B",
};
