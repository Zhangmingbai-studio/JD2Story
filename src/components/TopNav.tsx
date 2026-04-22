"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export function TopNav() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-lg font-bold tracking-tight text-slate-900">
            JD2Story
          </span>
          <span className="hidden text-xs text-slate-500 sm:inline">
            程序员面试作战卡
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/input"
            className="font-medium text-slate-700 hover:text-slate-900"
          >
            新建作战卡
          </Link>
          {session && (
            <Link
              href="/history"
              className="font-medium text-slate-700 hover:text-slate-900"
            >
              历史记录
            </Link>
          )}
          {status === "loading" ? (
            <span className="text-xs text-slate-400">...</span>
          ) : session ? (
            <div className="flex items-center gap-3">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt=""
                  className="h-7 w-7 rounded-full"
                />
              )}
              <span className="hidden text-xs text-slate-600 sm:inline">
                {session.user?.name}
              </span>
              <button
                onClick={() => signOut()}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
              >
                退出
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
            >
              GitHub 登录
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
