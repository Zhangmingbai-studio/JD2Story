"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { resultStore, type ResultPayload } from "@/lib/storage";
import type { JDStructure } from "@/lib/schemas";

type TabId = "jd" | "match" | "questions" | "onepager";

const TABS: { id: TabId; label: string }[] = [
  { id: "jd", label: "岗位理解" },
  { id: "match", label: "匹配分析" },
  { id: "questions", label: "问题与回答骨架" },
  { id: "onepager", label: "一页作战卡" },
];

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<ResultPayload | null | "loading">(
    "loading",
  );
  const [active, setActive] = useState<TabId>("jd");

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

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">你的面试作战卡</h1>
          <p className="mt-1 text-sm text-slate-600">
            基于你提供的 JD 和简历生成。匹配分析 / 问题骨架将在 P4 阶段接入。
          </p>
        </div>
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

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex border-b border-slate-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`border-b-2 px-5 py-3 text-sm font-medium transition ${
                active === tab.id
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {active === "jd" && result.jd ? (
            <JDView jd={result.jd} />
          ) : (
            <Placeholder tab={active} />
          )}
        </div>
      </div>
    </main>
  );
}

function JDView({ jd }: { jd: JDStructure }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoRow label="岗位名称" value={jd.title} />
        <InfoRow label="经验要求" value={jd.experienceRequirement} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ListCard
          title="核心技能"
          accent="text-blue-700"
          items={jd.coreSkills}
        />
        <ListCard
          title="加分项"
          accent="text-emerald-700"
          items={jd.bonusSkills}
        />
        <ListCard
          title="隐含关注点"
          accent="text-amber-700"
          items={jd.implicitFocus}
        />
        <ListCard
          title="可能面试重点"
          accent="text-violet-700"
          items={jd.likelyInterviewTopics}
        />
      </div>

      {jd.domainHints.length > 0 && (
        <ListCard
          title="业务 / 领域线索"
          accent="text-slate-700"
          items={jd.domainHints}
        />
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm text-slate-900">{value || "—"}</div>
    </div>
  );
}

function ListCard({
  title,
  accent,
  items,
}: {
  title: string;
  accent: string;
  items: string[];
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className={`text-sm font-semibold ${accent}`}>{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-xs text-slate-400">暂无</p>
      ) : (
        <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Placeholder({ tab }: { tab: TabId }) {
  const messages: Record<TabId, string> = {
    jd: "缺失 JD 数据",
    match: "匹配分析将在 P4 阶段接入",
    questions: "10 道题 + 回答骨架将在 P4 阶段接入",
    onepager: "一页作战卡将在 P5 阶段接入",
  };
  return (
    <div className="flex h-48 items-center justify-center text-sm text-slate-400">
      {messages[tab]}
    </div>
  );
}
