"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  BattleCardExportButton,
  BattleCardViewer,
} from "@/components/BattleCardViewer";
import { HistorySidebar } from "@/components/HistorySidebar";
import { inputStore, resultStore, type ResultPayload } from "@/lib/storage";

export function ResultPageClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const [result, setResult] = useState<ResultPayload | null | "loading">("loading");
  const [saved, setSaved] = useState(false);
  const [savedCardId, setSavedCardId] = useState<string>();
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  useEffect(() => {
    const r = resultStore.load();
    if (!r || !r.jd) {
      router.replace("/input");
      return;
    }
    setResult(r);
  }, [router]);

  if (result === "loading" || result === null) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10 text-sm text-slate-500">
        加载中……
      </main>
    );
  }

  async function handleSave() {
    const input = inputStore.load();
    if (!input || !result || typeof result === "string") return;

    const title = result.jd?.title ?? "未命名作战卡";
    const res = await fetch("/api/battle-cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, input, result }),
    });
    const data = await res.json();
    if (data.ok) {
      setSaved(true);
      if (typeof data.data?.id === "string") {
        setSavedCardId(data.data.id);
      }
      setHistoryRefreshKey((current) => current + 1);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">你的面试作战卡</h1>
          <p className="mt-1 text-sm text-slate-600">
            基于你提供的 JD 和简历生成。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {session && !saved && (
            <button
              type="button"
              onClick={handleSave}
              className="rounded-md border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              保存
            </button>
          )}
          {saved && (
            <span className="flex items-center rounded-md border border-green-300 bg-green-50 px-4 py-2 text-sm text-green-700">
              已保存
            </span>
          )}
          <BattleCardExportButton
            result={result}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          />
          <button
            type="button"
            onClick={() => {
              resultStore.clear();
              router.push("/input");
            }}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            重新生成
          </button>
        </div>
      </div>

      {session ? (
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <HistorySidebar
            currentId={savedCardId}
            refreshKey={historyRefreshKey}
          />
          <BattleCardViewer result={result} />
        </div>
      ) : (
        <BattleCardViewer result={result} />
      )}
    </main>
  );
}
