/** カテゴリ別のアクセントカラー（設定パネルのトグル・チップなどで使用） */
export const CATEGORY_COLORS: Record<string, string> = {
  "AI & EQ & Tech": "#3D7DD8",
  "Marketing": "#E8913A",
  "Fashion": "#E0709B",
  "Product": "#43A377",
};

/** 未定義カテゴリ（カスタム追加など）はメインカラーにフォールバック */
export function getCategoryColor(categoryId: string): string {
  return CATEGORY_COLORS[categoryId] ?? "#7C6FC4";
}
