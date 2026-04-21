import Link from "next/link";

const jobDirections = [
  "后端",
  "C++",
  "Java",
  "Go",
  "平台 / 基础设施",
  "SRE",
];

export default function InputPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">新建面试作战卡</h1>
        <p className="mt-1 text-sm text-slate-600">
          左边粘 JD，右边放简历。字段越完整，生成的作战卡越准。
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <JDSection />
        <ResumeSection />
      </div>

      <div className="mt-8 flex justify-end">
        <Link
          href="/processing"
          className="inline-flex items-center rounded-lg bg-blue-600 px-8 py-3 text-base font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          生成作战卡
        </Link>
      </div>
    </main>
  );
}

function JDSection() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">岗位 JD</h2>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="岗位名称（可选）">
          <input
            type="text"
            placeholder="例如：高级后端工程师"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </Field>
        <Field label="公司名称（可选）">
          <input
            type="text"
            placeholder="例如：字节跳动"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </Field>
      </div>

      <Field label="岗位方向" className="mt-4">
        <div className="flex flex-wrap gap-2">
          {jobDirections.map((dir) => (
            <label
              key={dir}
              className="cursor-pointer rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-sm text-slate-700 hover:border-slate-400 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 has-[:checked]:text-blue-700"
            >
              <input type="radio" name="direction" className="hidden" />
              {dir}
            </label>
          ))}
        </div>
      </Field>

      <Field label="JD 正文" className="mt-4">
        <textarea
          rows={14}
          placeholder="把完整的 JD 粘贴到这里……"
          className="w-full resize-y rounded-md border border-slate-300 px-3 py-2 font-mono text-sm leading-relaxed outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </Field>
    </section>
  );
}

function ResumeSection() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">我的简历</h2>

      <Field label="上传文件" className="mt-4">
        <div className="flex items-center justify-center rounded-md border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center">
          <div>
            <p className="text-sm text-slate-600">
              拖拽 PDF / DOCX 文件到这里，或
              <span className="ml-1 font-medium text-blue-600">点击选择</span>
            </p>
            <p className="mt-1 text-xs text-slate-400">
              上传功能将在 P2 阶段接入
            </p>
          </div>
        </div>
      </Field>

      <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        或者直接粘贴文本
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <Field label="简历文本">
        <textarea
          rows={16}
          placeholder="把简历内容粘贴到这里，或在上方上传后自动填充……"
          className="w-full resize-y rounded-md border border-slate-300 px-3 py-2 font-mono text-sm leading-relaxed outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </Field>
    </section>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}
