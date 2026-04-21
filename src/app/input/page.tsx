import { InputForm } from "@/features/input/InputForm";

export default function InputPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">新建面试作战卡</h1>
        <p className="mt-1 text-sm text-slate-600">
          左边粘 JD，右边放简历。字段越完整，生成的作战卡越准。
        </p>
      </div>
      <InputForm />
    </main>
  );
}
