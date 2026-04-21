"use client";

import { useState } from "react";

type UploadState =
  | { status: "idle" }
  | { status: "uploading"; fileName: string }
  | { status: "success"; fileName: string }
  | { status: "error"; message: string };

type Props = {
  value: string;
  onChange: (next: string) => void;
};

export function ResumeForm({ value, onChange }: Props) {
  const [upload, setUpload] = useState<UploadState>({ status: "idle" });

  async function handleFile(file: File) {
    setUpload({ status: "uploading", fileName: file.name });

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setUpload({
          status: "error",
          message: data.error ?? `上传失败（HTTP ${res.status}）`,
        });
        return;
      }
      onChange(data.text ?? "");
      setUpload({ status: "success", fileName: file.name });
    } catch {
      setUpload({ status: "error", message: "网络错误，请重试" });
    }
  }

  const isUploading = upload.status === "uploading";

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">我的简历</h2>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          上传文件
        </span>
        <div
          className={`relative flex items-center justify-center rounded-md border-2 border-dashed px-6 py-8 text-center transition ${
            isUploading
              ? "border-blue-300 bg-blue-50"
              : "border-slate-300 bg-slate-50 hover:border-slate-400"
          }`}
        >
          <input
            type="file"
            accept=".pdf,.docx"
            className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
              e.target.value = "";
            }}
            disabled={isUploading}
          />
          <div>
            <p className="text-sm text-slate-600">
              点击选择 <span className="font-medium">PDF / DOCX</span> 文件
            </p>
            <p className="mt-1 text-xs text-slate-400">最大 10 MB</p>
          </div>
        </div>
      </label>

      <StatusRow state={upload} />

      <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        或者直接粘贴文本
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          简历文本
        </span>
        <textarea
          rows={16}
          placeholder="把简历内容粘贴到这里，或在上方上传后自动填充……"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full resize-y rounded-md border border-slate-300 px-3 py-2 font-mono text-sm leading-relaxed outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </label>
    </section>
  );
}

function StatusRow({ state }: { state: UploadState }) {
  if (state.status === "idle") return null;
  if (state.status === "uploading") {
    return (
      <p className="mt-2 text-sm text-blue-600">正在解析 {state.fileName} …</p>
    );
  }
  if (state.status === "success") {
    return (
      <p className="mt-2 text-sm text-green-600">
        ✓ 已解析 {state.fileName}，可在下方编辑
      </p>
    );
  }
  return <p className="mt-2 text-sm text-red-600">⚠ {state.message}</p>;
}
