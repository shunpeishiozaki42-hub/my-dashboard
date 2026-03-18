"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import IntelligenceHub from "@/components/intelligence/IntelligenceHub";
import PRopsCenter from "@/components/PRopsCenter";
import BrandGrowth from "@/components/BrandGrowth";
import DashboardOverview from "@/components/DashboardOverview";

const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "intelligence", label: "📚 Intelligence Hub" },
  { id: "pr", label: "PR Ops Center" },
  { id: "brand", label: "Brand Growth" },
];

function DashboardContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "dashboard";
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Bar */}
      <header className="border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-sm font-semibold" style={{ color: "#993C1D" }}>
            Intelligence Lab
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500 text-sm">Personal Dashboard</span>
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
      <nav className="border-b border-gray-200 px-6">
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
              style={activeTab === tab.id ? { backgroundColor: "#993C1D" } : {}}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        {activeTab === "dashboard" && <DashboardOverview />}
        {activeTab === "intelligence" && <IntelligenceHub />}
        {activeTab === "pr" && <PRopsCenter />}
        {activeTab === "brand" && <BrandGrowth />}
      </main>

      <footer className="text-center text-gray-400 text-xs py-4 border-t border-gray-100">
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
