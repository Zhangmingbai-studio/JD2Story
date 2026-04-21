const tabs = [
  "岗位理解",
  "匹配分析",
  "问题与回答骨架",
  "一页作战卡",
];

export default function ResultPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">你的面试作战卡</h1>
        <p className="mt-1 text-sm text-slate-600">
          （P3–P5 阶段会依次填充真实内容）
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex border-b border-slate-200">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              className={`border-b-2 px-5 py-3 text-sm font-medium transition ${
                i === 0
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex h-64 items-center justify-center text-sm text-slate-400">
          内容将在后续阶段接入
        </div>
      </div>
    </main>
  );
}
