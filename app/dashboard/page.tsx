"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import IntelligenceHub from "@/components/intelligence/IntelligenceHub";
import PRopsCenter from "@/components/PRopsCenter";
import BrandGrowth from "@/components/BrandGrowth";

const TABS = [
  { id: "intelligence", label: "📚 Intelligence Hub" },
  { id: "pr", label: "🕊️ X Trend" },
  { id: "brand", label: "📢 PR Center" },
];

function DashboardContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "intelligence";
  const { data: session } = useSession();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: "#F6F4FB",
        // 紫・青・ピンクの光が溶け合うメッシュグラデーション（柄なし）
        backgroundImage: [
          "radial-gradient(900px circle at 80% -10%, rgba(140,125,220,0.30), transparent 70%)",
          "radial-gradient(700px circle at -10% 10%, rgba(80,130,220,0.18), transparent 70%)",
          "radial-gradient(900px circle at 105% 55%, rgba(160,120,210,0.14), transparent 70%)",
          "radial-gradient(1000px circle at -5% 105%, rgba(225,120,165,0.16), transparent 70%)",
        ].join(", "),
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Top Bar（すりガラス・スクロール追従） */}
      <header className="sticky top-0 z-30 border-b border-[#ECEAF3] px-6 py-3 flex items-center justify-between bg-white/85 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-base leading-none">📡</span>
          <span className="text-sm font-semibold" style={{ color: "#7C6FC4" }}>
            Intelligence Lab
          </span>
        </Link>

        {/* User info & sign out */}
        {session?.user && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 hidden sm:block">{session.user.email}</span>
            {session.user.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt={session.user.name ?? ""}
                className="w-7 h-7 rounded-full border border-gray-200"
              />
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 hover:border-gray-400 px-2.5 py-1 rounded-lg transition-colors"
            >
              ログアウト
            </button>
          </div>
        )}
      </header>

      {/* Tab Navigation */}
      <nav className="border-b border-[#ECEAF3] px-6 bg-white/85 backdrop-blur-md">
        <div className="flex gap-1 overflow-x-auto py-2">
          {TABS.map((tab) => (
            <Link
              key={tab.id}
              href={`/dashboard?tab=${tab.id}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              }`}
              style={activeTab === tab.id ? { backgroundColor: "#7C6FC4" } : {}}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        {activeTab === "intelligence" && <IntelligenceHub />}
        {activeTab === "pr" && <PRopsCenter />}
        {activeTab === "brand" && <BrandGrowth />}
      </main>

      <footer className="text-center text-gray-400 text-xs py-4 border-t border-[#ECEAF3]">
        Personal Dashboard · Operated by Shunpei Shiozaki with Claude
      </footer>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
