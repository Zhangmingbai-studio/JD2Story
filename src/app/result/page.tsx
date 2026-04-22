"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { resultStore, inputStore, type ResultPayload } from "@/lib/storage";
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
  const { data: session } = useSession();
  const [result, setResult] = useState<ResultPayload | null | "loading">("loading");
  const [active, setActive] = useState<TabId>("jd");
  const [showExport, setShowExport] = useState(false);
  const [saved, setSaved] = useState(false);

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
        <div className="flex gap-2">
          {session && !saved && (
            <button
              type="button"
              onClick={async () => {
                const input = inputStore.load();
                if (!input || !result || typeof result === "string") return;
                const title = result.jd?.title ?? "未命名作战卡";
                const res = await fetch("/api/battle-cards", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ title, input, result }),
                });
                const data = await res.json();
                if (data.ok) setSaved(true);
              }}
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
          <button
            type="button"
            onClick={() => setShowExport(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            导出
          </button>
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
          {active === "onepager" && <OnePagerView result={result} />}
          {active === "jd" && !result.jd && <Placeholder tab={active} />}
          {active === "match" && !result.match && <Placeholder tab={active} />}
          {active === "questions" && !result.questions && <Placeholder tab={active} />}
        </div>
      </div>

      {showExport && (
        <ExportModal result={result} onClose={() => setShowExport(false)} />
      )}
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
            <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
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

/* ─── Tab D: One-Pager ─── */

function OnePagerView({ result }: { result: ResultPayload }) {
  const { jd, match, questions, resume } = result;
  const printRef = useRef<HTMLDivElement>(null);

  if (!jd) {
    return <Placeholder tab="onepager" />;
  }

  return (
    <div>
      <div ref={printRef} className="onepager-print space-y-4 text-xs leading-relaxed text-slate-800">
        {/* Header */}
        <div className="border-b border-slate-300 pb-2">
          <h2 className="text-lg font-bold text-slate-900">
            {jd.title}
          </h2>
          <p className="text-slate-500">{jd.experienceRequirement}</p>
        </div>

        {/* Two-column: skills + match */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <SectionTitle>核心技能要求</SectionTitle>
            <BulletList items={jd.coreSkills} />
            {jd.bonusSkills.length > 0 && (
              <>
                <SectionTitle className="mt-2">加分项</SectionTitle>
                <BulletList items={jd.bonusSkills} />
              </>
            )}
          </div>
          <div>
            {match && (
              <>
                <SectionTitle color="text-green-700">我的匹配亮点</SectionTitle>
                <BulletList items={match.matchHighlights} />
                {match.gaps.length > 0 && (
                  <>
                    <SectionTitle className="mt-2" color="text-red-700">需要补的短板</SectionTitle>
                    <BulletList items={match.gaps} />
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Top stories */}
        {match && match.topStories.length > 0 && (
          <div>
            <SectionTitle color="text-blue-700">主打经历</SectionTitle>
            <div className="mt-1 space-y-2">
              {match.topStories.map((story, i) => (
                <div key={i} className="rounded border border-slate-200 bg-slate-50 p-2">
                  <span className="font-semibold">{i + 1}. {story.title}</span>
                  <span className="ml-2 text-slate-500">{story.why}</span>
                  <div className="mt-1 flex flex-wrap gap-x-3 text-slate-600">
                    {story.talkingPoints.map((tp, j) => (
                      <span key={j}>- {tp}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risks */}
        {match && match.risks.length > 0 && (
          <div>
            <SectionTitle color="text-amber-700">避坑提醒</SectionTitle>
            <BulletList items={match.risks} />
          </div>
        )}

        {/* Questions summary */}
        {questions && questions.questions.length > 0 && (
          <div>
            <SectionTitle>高概率问题速览</SectionTitle>
            <div className="mt-1 space-y-1">
              {questions.questions.map((q, i) => {
                const cat = categoryLabel[q.category] ?? { label: q.category, color: "" };
                return (
                  <div key={i} className="flex gap-2">
                    <span className="shrink-0 font-mono text-slate-400">{String(i + 1).padStart(2, "0")}.</span>
                    <span className="shrink-0 text-slate-500">[{cat.label}]</span>
                    <span className="font-medium">{q.question}</span>
                    <span className="ml-auto shrink-0 text-slate-400 hidden sm:inline">
                      {q.answerSkeleton.coreConclusion.slice(0, 30)}
                      {q.answerSkeleton.coreConclusion.length > 30 ? "…" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tech stack */}
        {resume && resume.techStack.length > 0 && (
          <div>
            <SectionTitle>我的技术栈</SectionTitle>
            <p className="mt-1 text-slate-600">{resume.techStack.join(" / ")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionTitle({
  children,
  className = "",
  color = "text-slate-900",
}: {
  children: React.ReactNode;
  className?: string;
  color?: string;
}) {
  return (
    <h4 className={`text-xs font-bold uppercase tracking-wide ${color} ${className}`}>
      {children}
    </h4>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-1 space-y-0.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-1.5">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/* ─── Export Modal ─── */

function ExportModal({
  result,
  onClose,
}: {
  result: ResultPayload;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function buildMarkdown(): string {
    const { jd, match, questions, resume } = result;
    const lines: string[] = [];

    if (jd) {
      lines.push(`# ${jd.title}`, "");
      lines.push(`**经验要求**：${jd.experienceRequirement}`, "");
      lines.push("## 核心技能", ...jd.coreSkills.map((s) => `- ${s}`), "");
      if (jd.bonusSkills.length > 0) {
        lines.push("## 加分项", ...jd.bonusSkills.map((s) => `- ${s}`), "");
      }
      lines.push("## 隐含关注点", ...jd.implicitFocus.map((s) => `- ${s}`), "");
      lines.push("## 可能面试重点", ...jd.likelyInterviewTopics.map((s) => `- ${s}`), "");
      if (jd.domainHints.length > 0) {
        lines.push("## 业务/领域线索", ...jd.domainHints.map((s) => `- ${s}`), "");
      }
    }

    if (match) {
      lines.push("---", "## 匹配分析", "");
      lines.push("### 匹配亮点", ...match.matchHighlights.map((s) => `- ${s}`), "");
      lines.push("### 主要短板", ...match.gaps.map((s) => `- ${s}`), "");
      if (match.risks.length > 0) {
        lines.push("### 高风险表述", ...match.risks.map((s) => `- ${s}`), "");
      }
      lines.push("### 建议主打的经历");
      match.topStories.forEach((s, i) => {
        lines.push(`${i + 1}. **${s.title}** — ${s.why}`);
        s.talkingPoints.forEach((tp) => lines.push(`   - ${tp}`));
      });
      lines.push("");
    }

    if (questions && questions.questions.length > 0) {
      lines.push("---", "## 高概率面试题", "");
      questions.questions.forEach((q, i) => {
        const cat = categoryLabel[q.category]?.label ?? q.category;
        lines.push(`### ${i + 1}. [${cat}] ${q.question}`);
        lines.push(`> 意图：${q.intent}`, "");
        lines.push(`**核心结论**：${q.answerSkeleton.coreConclusion}`, "");
        lines.push("**回答结构**：", ...q.answerSkeleton.structure.map((s) => `- ${s}`), "");
        if (q.answerSkeleton.dataToEmphasize.length > 0) {
          lines.push("**要强调的数据**：", ...q.answerSkeleton.dataToEmphasize.map((s) => `- ${s}`), "");
        }
        if (q.answerSkeleton.pitfalls.length > 0) {
          lines.push("**容易翻车的点**：", ...q.answerSkeleton.pitfalls.map((s) => `- ${s}`), "");
        }
        if (q.followUps.length > 0) {
          lines.push("**可能追问**：", ...q.followUps.map((s) => `- ${s}`), "");
        }
      });
    }

    if (resume && resume.techStack.length > 0) {
      lines.push("---", `**技术栈**：${resume.techStack.join(" / ")}`, "");
    }

    return lines.join("\n");
  }

  async function handleCopy() {
    const md = buildMarkdown();
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">导出作战卡</h2>
        <p className="mt-1 text-sm text-slate-500">选择导出方式</p>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <span>复制为 Markdown</span>
            <span className="text-xs text-slate-400">
              {copied ? "已复制!" : "粘贴到笔记 / 文档"}
            </span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <span>导出 PDF</span>
            <span className="text-xs text-slate-400">通过浏览器打印</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-lg border border-slate-300 bg-white py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          关闭
        </button>
      </div>
    </div>
  );
}

/* ─── Shared components ─── */

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
    onepager: "缺失数据，请重新生成",
  };
  return (
    <div className="flex h-48 items-center justify-center text-sm text-slate-400">
      {messages[tab]}
    </div>
  );
}
