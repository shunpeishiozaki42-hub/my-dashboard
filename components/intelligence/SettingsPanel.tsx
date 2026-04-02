"use client";

import { useState } from "react";
import type { IntelligenceSettings, SourceSetting, CategorySetting } from "@/lib/intelligenceSettings";
import { DEFAULT_SETTINGS } from "@/lib/intelligenceSettings";

type Props = {
  settings: IntelligenceSettings;
  onSave: (settings: IntelligenceSettings) => void;
  onClose: () => void;
};

export default function SettingsPanel({ settings, onSave, onClose }: Props) {
  const [sources, setSources] = useState<SourceSetting[]>(settings.sources);
  const [categories, setCategories] = useState<CategorySetting[]>(settings.categories);
  const [deletedSourceIds, setDeletedSourceIds] = useState<string[]>(settings.deletedSourceIds ?? []);
  const [deletedCategoryIds, setDeletedCategoryIds] = useState<string[]>(settings.deletedCategoryIds ?? []);


  function handleSave() {
    onSave({ sources, categories, deletedSourceIds, deletedCategoryIds });
    onClose();
  }

  function handleReset() {
    setSources(DEFAULT_SETTINGS.sources);
    setCategories(DEFAULT_SETTINGS.categories);
    setDeletedSourceIds([]);
    setDeletedCategoryIds([]);
  }

  // --- Sources ---
  function toggleSource(id: string) {
    setSources((prev) => prev.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s));
  }

  function deleteSource(id: string) {
    setSources((prev) => prev.filter((s) => s.id !== id));
    // カスタムソース（custom_で始まる）以外は削除済みとして追跡
    if (!id.startsWith("custom_")) {
      setDeletedSourceIds((prev) => [...prev, id]);
    }
  }

  // --- Categories ---
  function toggleCategory(id: string) {
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, enabled: !c.enabled } : c));
  }

  function renameCategory(id: string, displayName: string) {
    setCategories((prev) => prev.map((c) => c.id === id ? { ...c, displayName } : c));
  }

  function deleteCategory(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (!id.startsWith("custom_")) {
      setDeletedCategoryIds((prev) => [...prev, id]);
    }
  }


  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900">⚙ 設定</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-8">

          {/* ① 情報ソース */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">① 情報ソース</h3>
            <div className="space-y-2">
              {sources.map((src) => (
                <div key={src.id} className="flex items-center gap-3 py-2 border-b border-gray-100">
                  {/* Toggle */}
                  <button
                    onClick={() => toggleSource(src.id)}
                    className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
                      src.enabled ? "bg-[#7C6FC4]" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        src.enabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${src.enabled ? "text-gray-900" : "text-gray-400"}`}>
                      {src.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{src.url}</p>
                  </div>
                  {/* Delete */}
                  <button
                    onClick={() => deleteSource(src.id)}
                    className="text-gray-300 hover:text-red-400 text-sm flex-shrink-0"
                    title="削除"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>

          </section>

          {/* ② カテゴリ */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">② カテゴリ</h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center gap-3 py-2 border-b border-gray-100">
                  {/* Toggle */}
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
                      cat.enabled ? "bg-[#7C6FC4]" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        cat.enabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                  {/* Editable name */}
                  <input
                    type="text"
                    value={cat.displayName}
                    onChange={(e) => renameCategory(cat.id, e.target.value)}
                    className={`flex-1 text-sm border border-transparent rounded px-1 py-0.5 focus:outline-none focus:border-gray-300 bg-transparent ${
                      cat.enabled ? "text-gray-900" : "text-gray-400"
                    }`}
                  />
                  {/* Delete */}
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="text-gray-300 hover:text-red-400 text-sm flex-shrink-0"
                    title="削除"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>

          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleReset}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            デフォルトに戻す
          </button>
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="text-sm px-4 py-2 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            className="text-sm px-4 py-2 rounded-lg text-white font-medium transition-colors"
            style={{ backgroundColor: "#7C6FC4" }}
          >
            保存して更新
          </button>
        </div>
      </div>
    </>
  );
}
