import Link from "next/link";

const sellingPoints = [
  {
    title: "看懂岗位真正要什么",
    desc: "把 JD 拆成核心技能、加分项、隐含关注点，告诉你面试官真正在意的是什么。",
  },
  {
    title: "知道你该主打哪几段经历",
    desc: "从简历里挑出最能打的 3 段经历，针对 JD 反向匹配，告诉你应该怎么讲。",
  },
  {
    title: "生成高概率问题与回答骨架",
    desc: "10 道覆盖开场 / 技术 / 行为的问题，每题给出回答结构、要强调的数据、可能追问。",
  },
];

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      <section className="text-center">
        <h1 className="text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          程序员面试作战卡
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-slate-600">
          上传简历 + 粘贴 JD，一键生成你专属的面试作战卡。
        </p>
        <div className="mt-8">
          <Link
            href="/input"
            className="inline-flex items-center rounded-lg bg-blue-600 px-8 py-3 text-base font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            立即生成作战卡
          </Link>
        </div>
      </section>

      <section className="mt-20 grid gap-6 sm:grid-cols-3">
        {sellingPoints.map((point) => (
          <div
            key={point.title}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-base font-semibold text-slate-900">
              {point.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {point.desc}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-20">
        <h2 className="text-center text-xl font-semibold text-slate-900">
          看看生成的作战卡长什么样
        </h2>
        <div className="mt-6 flex h-72 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-sm text-slate-400">
          Demo 截图占位（将在 P5 交付）
        </div>
      </section>
    </main>
  );
}
