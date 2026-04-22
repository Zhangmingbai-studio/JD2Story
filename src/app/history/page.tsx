"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { resultStore } from "@/lib/storage";

type CardSummary = {
  id: string;
  title: string;
  createdAt: string;
};

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cards, setCards] = useState<CardSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.replace("/");
      return;
    }

    fetch("/api/battle-cards")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setCards(data.data);
      })
      .finally(() => setLoading(false));
  }, [session, status, router]);

  async function handleLoad(id: string) {
    const res = await fetch(`/api/battle-cards/${id}`);
    const data = await res.json();
    if (data.ok) {
      resultStore.save(data.data.result);
      router.push("/result");
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/battle-cards/${id}`, { method: "DELETE" });
    setCards((prev) => prev.filter((c) => c.id !== id));
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
      <p className="mt-1 text-sm text-slate-600">你之前生成的作战卡</p>

      {cards.length === 0 ? (
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
                <button
                  onClick={() => handleLoad(card.id)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
                >
                  查看
                </button>
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
    </main>
  );
}
