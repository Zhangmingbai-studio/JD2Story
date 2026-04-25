"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type CardSummary = {
  id: string;
  title: string;
  createdAt: string;
};

type CardsPage = {
  items: CardSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const PAGE_SIZE = 10;

export function HistoryPageClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cards, setCards] = useState<CardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<CardsPage>({
    items: [],
    page: 1,
    pageSize: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/");
      return;
    }

    setLoading(true);
    setError("");

    fetch(`/api/battle-cards?page=${page}&pageSize=${PAGE_SIZE}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok || !data.ok) {
          throw new Error(data.error ?? "加载失败");
        }
        return data.data as CardsPage;
      })
      .then((data) => {
        setCards(data.items);
        setPagination(data);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "加载失败");
      })
      .finally(() => setLoading(false));
  }, [session, status, router, page]);

  async function handleDelete(id: string) {
    const res = await fetch(`/api/battle-cards/${id}`, { method: "DELETE" });
    if (!res.ok) return;

    setCards((prev) => prev.filter((c) => c.id !== id));
    setPagination((prev) => {
      const total = Math.max(0, prev.total - 1);
      return {
        ...prev,
        total,
        totalPages: Math.max(1, Math.ceil(total / prev.pageSize)),
      };
    });

    if (cards.length === 1 && page > 1) {
      setPage((current) => current - 1);
    }
  }

  if (status === "loading" || loading) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10 text-sm text-slate-500">
        加载中……
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold text-slate-900">历史记录</h1>
      <p className="mt-1 text-sm text-slate-600">
        你之前保存的作战卡，共 {pagination.total} 张
      </p>

      {error ? (
        <div className="mt-10 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : cards.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 text-sm text-slate-400">
          <p>还没有保存过作战卡</p>
          <Link
            href="/input"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            生成第一张
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {cards.map((card) => (
            <li
              key={card.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
            >
              <div>
                <h3 className="text-sm font-medium text-slate-900">{card.title}</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  {new Date(card.createdAt).toLocaleString("zh-CN")}
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/history/${card.id}`}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                >
                  查看
                </Link>
                <button
                  onClick={() => handleDelete(card.id)}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                >
                  删除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
          <span>
            第 {pagination.page} / {pagination.totalPages} 页
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              上一页
            </button>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() =>
                setPage((current) => Math.min(pagination.totalPages, current + 1))
              }
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
