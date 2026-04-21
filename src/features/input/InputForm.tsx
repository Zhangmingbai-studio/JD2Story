"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ResumeForm } from "@/features/input/ResumeForm";
import { inputStore, resultStore } from "@/lib/storage";

const jobDirections = [
  "后端",
  "C++",
  "Java",
  "Go",
  "平台 / 基础设施",
  "SRE",
];

export function InputForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [direction, setDirection] = useState("");
  const [jd, setJD] = useState("");
  const [resume, setResume] = useState("");

  const canSubmit = jd.trim().length >= 10 && resume.trim().length >= 20;

  function handleSubmit() {
    inputStore.save({ jd, title, company, direction, resume });
    resultStore.clear();
    router.push("/processing");
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">岗位 JD</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="岗位名称（可选）">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例如：高级后端工程师"
                className={inputClass}
              />
            </Field>
            <Field label="公司名称（可选）">
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="例如：字节跳动"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="岗位方向" className="mt-4">
            <div className="flex flex-wrap gap-2">
              {jobDirections.map((dir) => {
                const checked = direction === dir;
                return (
                  <label
                    key={dir}
                    className={`cursor-pointer rounded-full border px-3 py-1 text-sm transition ${
                      checked
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="direction"
                      className="hidden"
                      checked={checked}
                      onChange={() => setDirection(dir)}
                    />
                    {dir}
                  </label>
                );
              })}
            </div>
          </Field>

          <Field label="JD 正文" className="mt-4">
            <textarea
              rows={14}
              value={jd}
              onChange={(e) => setJD(e.target.value)}
              placeholder="把完整的 JD 粘贴到这里……"
              className={`${inputClass} resize-y font-mono leading-relaxed`}
            />
          </Field>
        </section>

        <ResumeForm value={resume} onChange={setResume} />
      </div>

      <div className="mt-8 flex items-center justify-end gap-4">
        {!canSubmit && (
          <p className="text-xs text-slate-500">
            请填入 JD 正文和简历文本（长度过短）
          </p>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="inline-flex items-center rounded-lg bg-blue-600 px-8 py-3 text-base font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          生成作战卡
        </button>
      </div>
    </>
  );
}

const inputClass =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

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
