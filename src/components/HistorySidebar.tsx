"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type CardSummary = {
  id: string;
  title: string;
  createdAt: string;
};

type CardsPage = {
  items: CardSummary[];
};

export function HistorySidebar({
  currentId,
  refreshKey = 0,
}: {
  currentId?: string;
  refreshKey?: number;
}) {
  const { data: session, status } = useSession();
  const [cards, setCards] = useState<CardSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      setCards([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    fetch("/api/battle-cards?page=1&pageSize=6")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error ?? "加载失败");
        }
        return data.data as CardsPage;
      })
      .then((data) => {
        if (!cancelled) setCards(data.items);
      })
      .catch(() => {
        if (!cancelled) setError("历史记录加载失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session, status, refreshKey]);

  if (!session && status !== "loading") return null;

  return (
    <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-20 lg:self-start">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">历史记录</h2>
        <Link href="/history" className="text-xs font-medium text-blue-600 hover:text-blue-700">
          全部
        </Link>
      </div>

      {status === "loading" || loading ? (
        <p className="mt-4 text-xs text-slate-400">加载中...</p>
      ) : error ? (
        <p className="mt-4 text-xs text-red-600">{error}</p>
      ) : cards.length === 0 ? (
        <p className="mt-4 text-xs leading-5 text-slate-400">
          保存作战卡后，这里会显示最近记录。
        </p>
      ) : (
        <nav className="mt-4 space-y-2">
          {cards.map((card) => {
            const active = currentId === card.id;
            return (
              <Link
                key={card.id}
                href={`/history/${card.id}`}
                className={`block rounded-lg border px-3 py-2 transition ${
                  active
                    ? "border-blue-200 bg-blue-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="block truncate text-xs font-medium text-slate-800">
                  {card.title}
                </span>
                <span className="mt-1 block text-xs text-slate-400">
                  {new Date(card.createdAt).toLocaleDateString("zh-CN")}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </aside>
  );
}
