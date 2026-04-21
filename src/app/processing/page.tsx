const steps = [
  "正在解析 JD",
  "正在提取简历经历",
  "正在匹配岗位与经历",
  "正在生成问题与回答骨架",
];

export default function ProcessingPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-xl items-center px-6 py-10">
      <div className="w-full">
        <h1 className="text-center text-xl font-semibold text-slate-900">
          正在生成你的作战卡
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          （P3 阶段接入后这里会有真实进度）
        </p>

        <ul className="mt-8 space-y-4">
          {steps.map((step, i) => (
            <li
              key={step}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-500">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
