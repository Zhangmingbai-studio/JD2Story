"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { inputStore, resultStore } from "@/lib/storage";
import type { JDStructure, ResumeStructure, MatchAnalysis, InterviewQuestions } from "@/lib/schemas";

type NodeStatus = "pending" | "running" | "done" | "error";

type Node = {
  id: string;
  label: string;
  status: NodeStatus;
  detail?: string;
};

const INITIAL_NODES: Node[] = [
  { id: "jd", label: "正在解析 JD", status: "pending" },
  { id: "resume", label: "正在提取简历经历", status: "pending" },
  { id: "match", label: "正在匹配岗位与经历", status: "pending" },
  { id: "questions", label: "正在生成问题与回答骨架", status: "pending" },
];

export default function ProcessingPage() {
  const router = useRouter();
  const [nodes, setNodes] = useState<Node[]>(INITIAL_NODES);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const input = inputStore.load();
    if (!input) {
      router.replace("/input");
      return;
    }

    const setNode = (id: string, patch: Partial<Node>) => {
      setNodes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...patch } : n)),
      );
    };

    (async () => {
      try {
        // Step 1: Parse JD and extract resume in parallel
        setNode("jd", { status: "running" });
        setNode("resume", { status: "running" });

        const [jdRes, resumeRes] = await Promise.all([
          fetch("/api/parse-jd", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jd: input.jd,
              title: input.title || undefined,
              company: input.company || undefined,
              direction: input.direction || undefined,
            }),
          }),
          fetch("/api/extract-resume", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ resume: input.resume }),
          }),
        ]);

        const jdData = await jdRes.json();
        const resumeData = await resumeRes.json();

        if (!jdRes.ok || !jdData.ok) {
          setNode("jd", { status: "error", detail: jdData?.error ?? `HTTP ${jdRes.status}` });
          throw new Error(jdData?.error ?? "JD 解析失败");
        }
        setNode("jd", { status: "done" });
        const jd = jdData.data as JDStructure;

        if (!resumeRes.ok || !resumeData.ok) {
          setNode("resume", { status: "error", detail: resumeData?.error ?? `HTTP ${resumeRes.status}` });
          throw new Error(resumeData?.error ?? "简历抽取失败");
        }
        setNode("resume", { status: "done" });
        const resume = resumeData.data as ResumeStructure;

        // Step 2: Match analysis
        setNode("match", { status: "running" });
        const matchRes = await fetch("/api/match-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jd, resume }),
        });
        const matchData = await matchRes.json();
        if (!matchRes.ok || !matchData.ok) {
          setNode("match", { status: "error", detail: matchData?.error ?? `HTTP ${matchRes.status}` });
          throw new Error(matchData?.error ?? "匹配分析失败");
        }
        setNode("match", { status: "done" });
        const match = matchData.data as MatchAnalysis;

        // Step 3: Generate questions
        setNode("questions", { status: "running" });
        const qRes = await fetch("/api/generate-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jd, resume, match }),
        });
        const qData = await qRes.json();
        if (!qRes.ok || !qData.ok) {
          setNode("questions", { status: "error", detail: qData?.error ?? `HTTP ${qRes.status}` });
          throw new Error(qData?.error ?? "问题生成失败");
        }
        setNode("questions", { status: "done" });
        const questions = qData.data as InterviewQuestions;

        // All done — save and navigate
        resultStore.save({ jd, resume, match, questions });
        router.replace("/result");
      } catch (err: unknown) {
        setFatalError(err instanceof Error ? err.message : "生成失败");
      }
    })();
  }, [router]);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-xl items-center px-6 py-10">
      <div className="w-full">
        <h1 className="text-center text-xl font-semibold text-slate-900">
          {fatalError ? "生成中断" : "正在生成你的作战卡"}
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          {fatalError
            ? "下方是失败的步骤，解决后可返回重试。"
            : "请稍等，LLM 正在分析 JD 和简历……"}
        </p>

        <ul className="mt-8 space-y-3">
          {nodes.map((node) => (
            <NodeRow key={node.id} node={node} />
          ))}
        </ul>

        {fatalError && (
          <div className="mt-8 flex justify-center">
            <Link
              href="/input"
              className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              返回修改输入
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

function NodeRow({ node }: { node: Node }) {
  const theme: Record<NodeStatus, { bg: string; text: string; iconBg: string; iconText: string; icon: string }> = {
    pending: {
      bg: "bg-white",
      text: "text-slate-500",
      iconBg: "bg-slate-100",
      iconText: "text-slate-400",
      icon: "·",
    },
    running: {
      bg: "bg-blue-50",
      text: "text-blue-900",
      iconBg: "bg-blue-500",
      iconText: "text-white",
      icon: "…",
    },
    done: {
      bg: "bg-green-50",
      text: "text-green-900",
      iconBg: "bg-green-500",
      iconText: "text-white",
      icon: "✓",
    },
    error: {
      bg: "bg-red-50",
      text: "text-red-900",
      iconBg: "bg-red-500",
      iconText: "text-white",
      icon: "!",
    },
  };
  const t = theme[node.status];

  return (
    <li
      className={`flex items-start gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm ${t.bg}`}
    >
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${t.iconBg} ${t.iconText}`}
      >
        {t.icon}
      </span>
      <div className={`flex-1 ${t.text}`}>
        <div className="font-medium">{node.label}</div>
        {node.detail && (
          <div className="mt-0.5 text-xs opacity-80">{node.detail}</div>
        )}
      </div>
    </li>
  );
}
