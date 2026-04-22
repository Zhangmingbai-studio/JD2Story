"use client";

import Link from "next/link";

export function TopNav() {
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
          <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs text-slate-500">
            登录（待接入）
          </span>
        </nav>
      </div>
    </header>
  );
}
