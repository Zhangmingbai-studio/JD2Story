"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { resultStore, type ResultPayload } from "@/lib/storage";
import type { JDStructure, MatchAnalysis, InterviewQuestion } from "@/lib/schemas";

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
            基于你提供的 JD 和简历生成。
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
          {active === "jd" && result.jd && <JDView jd={result.jd} />}
          {active === "match" && result.match && <MatchView match={result.match} />}
          {active === "questions" && result.questions && (
            <QuestionsView questions={result.questions.questions} />
          )}
          {active === "onepager" && <Placeholder tab={active} />}
          {active === "jd" && !result.jd && <Placeholder tab={active} />}
          {active === "match" && !result.match && <Placeholder tab={active} />}
          {active === "questions" && !result.questions && <Placeholder tab={active} />}
        </div>
      </div>
    </main>
  );
}

/* ─── Tab A: JD View ─── */

function JDView({ jd }: { jd: JDStructure }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <InfoRow label="岗位名称" value={jd.title} />
        <InfoRow label="经验要求" value={jd.experienceRequirement} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ListCard title="核心技能" accent="text-blue-700" items={jd.coreSkills} />
        <ListCard title="加分项" accent="text-emerald-700" items={jd.bonusSkills} />
        <ListCard title="隐含关注点" accent="text-amber-700" items={jd.implicitFocus} />
        <ListCard title="可能面试重点" accent="text-violet-700" items={jd.likelyInterviewTopics} />
      </div>

      {jd.domainHints.length > 0 && (
        <ListCard title="业务 / 领域线索" accent="text-slate-700" items={jd.domainHints} />
      )}
    </div>
  );
}

/* ─── Tab B: Match Analysis ─── */

function MatchView({ match }: { match: MatchAnalysis }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <ListCard title="匹配亮点" accent="text-green-700" items={match.matchHighlights} />
        <ListCard title="主要短板" accent="text-red-700" items={match.gaps} />
      </div>

      {match.risks.length > 0 && (
        <ListCard title="高风险表述" accent="text-amber-700" items={match.risks} />
      )}

      <section>
        <h3 className="text-sm font-semibold text-blue-700">建议主打的经历</h3>
        <div className="mt-3 space-y-4">
          {match.topStories.map((story, i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                  {i + 1}
                </span>
                <h4 className="text-sm font-semibold text-slate-900">{story.title}</h4>
              </div>
              <p className="mt-2 text-sm text-slate-600">{story.why}</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {story.talkingPoints.map((tp, j) => (
                  <li key={j} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-blue-400" />
                    <span>{tp}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ─── Tab C: Questions ─── */

const categoryLabel: Record<string, { label: string; color: string }> = {
  opener: { label: "开场", color: "bg-sky-100 text-sky-800" },
  technical: { label: "技术", color: "bg-violet-100 text-violet-800" },
  behavioral: { label: "行为", color: "bg-amber-100 text-amber-800" },
};

function QuestionsView({ questions }: { questions: InterviewQuestion[] }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {questions.map((q, i) => {
        const cat = categoryLabel[q.category] ?? { label: q.category, color: "bg-slate-100 text-slate-700" };
        const isOpen = expanded === i;

        return (
          <div key={i} className="rounded-lg border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : i)}
              className="flex w-full items-start gap-3 px-4 py-3 text-left"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                {i + 1}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cat.color}`}>
                    {cat.label}
                  </span>
                  <span className="text-sm font-medium text-slate-900">{q.question}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{q.intent}</p>
              </div>
              <span className="mt-1 text-xs text-slate-400">{isOpen ? "收起" : "展开"}</span>
            </button>

            {isOpen && (
              <div className="border-t border-slate-100 px-4 py-4 text-sm">
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="font-medium text-blue-900">
                    核心结论：{q.answerSkeleton.coreConclusion}
                  </p>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <MiniList title="回答结构" items={q.answerSkeleton.structure} />
                  <MiniList title="要强调的数据" items={q.answerSkeleton.dataToEmphasize} />
                  <MiniList title="容易翻车的点" items={q.answerSkeleton.pitfalls} accent="text-red-700" />
                  <MiniList title="可能追问" items={q.followUps} accent="text-amber-700" />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MiniList({
  title,
  items,
  accent = "text-slate-700",
}: {
  title: string;
  items: string[];
  accent?: string;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h5 className={`text-xs font-semibold ${accent}`}>{title}</h5>
      <ul className="mt-1 space-y-1 text-xs text-slate-600">
        {items.map((item, i) => (
          <li key={i} className="flex gap-1.5">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Shared components ─── */

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
    match: "缺失匹配分析数据",
    questions: "缺失问题数据",
    onepager: "一页作战卡将在 P5 阶段接入",
  };
  return (
    <div className="flex h-48 items-center justify-center text-sm text-slate-400">
      {messages[tab]}
    </div>
  );
}
