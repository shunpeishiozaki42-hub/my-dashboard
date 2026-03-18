import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignInButton from "./SignInButton";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="text-center mb-10">
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-2"
            style={{ color: "#993C1D" }}
          >
            Personal Dashboard
          </p>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Intelligence Lab</h1>
          <p className="text-gray-500 text-sm mt-2">マーケティング関連情報を一元管理</p>
        </div>

        {/* Card */}
        <div className="border border-gray-200 rounded-2xl p-8">
          <h2 className="text-base font-semibold text-gray-900 mb-1">ログイン</h2>
          <p className="text-sm text-gray-500 mb-6">
            Googleアカウントで認証してください。
          </p>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error === "AccessDenied"
                ? "このアカウントはアクセスが許可されていません。"
                : "ログインに失敗しました。もう一度お試しください。"}
            </div>
          )}

          <SignInButton />
        </div>
      </div>

      <footer className="mt-10 text-xs text-gray-400">
        Personal Dashboard · Operated by Shunpei Shiozaki with Claude
      </footer>
    </div>
  );
}
