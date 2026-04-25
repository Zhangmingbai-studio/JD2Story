import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  BattleCardExportButton,
  BattleCardViewer,
} from "@/components/BattleCardViewer";
import { HistorySidebar } from "@/components/HistorySidebar";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { InputPayload, ResultPayload } from "@/lib/storage";

type HistoryDetailPageProps = {
  params: {
    id: string;
  };
};

export default async function HistoryDetailPage({
  params,
}: HistoryDetailPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/");
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    redirect("/");
  }

  const card = await prisma.battleCard.findFirst({
    where: { id: params.id, userId },
    select: {
      title: true,
      input: true,
      result: true,
      createdAt: true,
    },
  });

  if (!card) {
    notFound();
  }

  const input =
    card.input && typeof card.input === "object" && !Array.isArray(card.input)
      ? (card.input as Partial<InputPayload>)
      : {};
  const result = card.result as unknown as ResultPayload;
  const createdAt = new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Shanghai",
  }).format(card.createdAt);
  const inputMeta = [input.company, input.title, input.direction]
    .filter(Boolean)
    .join(" / ");

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/history"
            className="text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            返回历史记录
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">{card.title}</h1>
          <p className="mt-1 text-sm text-slate-600">
            保存于 {createdAt}
            {inputMeta ? ` · ${inputMeta}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/input"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            新建作战卡
          </Link>
          <BattleCardExportButton
            result={result}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <HistorySidebar currentId={params.id} />
        <BattleCardViewer result={result} />
      </div>
    </main>
  );
}
