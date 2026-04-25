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

const demoSkills = ["Go", "微服务", "PostgreSQL", "Redis", "可观测性"];

const demoStories = [
  "支付链路降级改造，可用性从 99.91% 提升到 99.97%",
  "订单查询接口缓存治理，P95 从 680ms 降到 210ms",
  "推进告警分级和 Runbook，故障定位时间缩短 40%",
];

const demoQuestions = [
  "你怎么判断一个系统瓶颈在数据库还是服务层？",
  "讲一次线上故障，你具体做了哪些取舍？",
  "如果让你重构支付回调链路，会先看哪些指标？",
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
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-4 py-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            </div>
            <div className="hidden rounded-md bg-white px-3 py-1 text-xs text-slate-400 sm:block">
              jd2story.app/result
            </div>
            <span className="text-xs font-medium text-slate-500">Demo</span>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="border-b border-slate-200 p-6 lg:border-b-0 lg:border-r">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  岗位理解
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  匹配 82%
                </span>
              </div>
              <h3 className="mt-4 text-xl font-bold text-slate-900">
                高级后端工程师 · 支付基础设施
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                JD 重点不是简单 CRUD，而是稳定性、链路治理、数据库性能和跨团队推动能力。
              </p>

              <div className="mt-5">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  核心技能
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {demoSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h4 className="text-sm font-semibold text-amber-900">
                  面试官可能深挖
                </h4>
                <p className="mt-1 text-sm leading-6 text-amber-800">
                  高并发写入、幂等设计、故障恢复、慢查询治理，以及你是否真的主导过线上稳定性改进。
                </p>
              </div>
            </div>

            <div className="p-6">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  建议主打的 3 段经历
                </h4>
                <div className="mt-3 space-y-2">
                  {demoStories.map((story, index) => (
                    <div
                      key={story}
                      className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        {index + 1}
                      </span>
                      <p className="text-sm leading-5 text-slate-700">{story}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-xs font-semibold uppercase tracking-wide text-violet-700">
                  高概率问题
                </h4>
                <div className="mt-3 space-y-2">
                  {demoQuestions.map((question, index) => (
                    <div
                      key={question}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2.5"
                    >
                      <div className="flex gap-2">
                        <span className="font-mono text-xs text-slate-400">
                          {String(index + 1).padStart(2, "0")}.
                        </span>
                        <p className="text-sm font-medium leading-5 text-slate-800">
                          {question}
                        </p>
                      </div>
                      <p className="mt-1 pl-7 text-xs leading-5 text-slate-500">
                        回答骨架：结论先行，再讲背景、动作、指标和复盘。
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
