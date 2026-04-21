import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { model, assertLLMConfigured, LLMNotConfiguredError } from "@/lib/llm";
import { ResumeStructureSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const maxDuration = 60;

const BodySchema = z.object({
  resume: z.string().min(20, "简历文本过短"),
});

export async function POST(req: NextRequest) {
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "请求参数错误" },
      { status: 400 },
    );
  }

  try {
    assertLLMConfigured();
    const { resume } = parsed.data;

    const { object } = await generateObject({
      model,
      schema: ResumeStructureSchema,
      temperature: 0.2,
      system:
        "你是资深程序员面试辅导教练。你的任务是从一份简历中抽取结构化信息，重点是挑出适合拿去面试讲的亮点。输出必须严格符合给定 schema，所有字段用简体中文。",
      prompt: `简历文本（可能含 PDF/DOCX 解析后的噪音，请自行清理）：
"""
${resume}
"""

抽取要点：
- quantifiedResults 要找含具体数字的成果（如 "QPS 从 5k 提升到 20k"、"首屏加载从 3.2s 降到 1.1s"），没有数字的不要硬塞。
- storyableHighlights 是简历里最能打的亮点，每条能支撑候选人展开讲 3–5 分钟。挑 3–6 条最精华的就够。
- techStack 要去重，并合并同类（如 "React.js" 和 "React" 算一条）。
- 如果某些字段简历里真的没写，workExperiences / projectExperiences 可以为空数组，不要编造。
`,
    });

    return NextResponse.json({ ok: true, data: object });
  } catch (err) {
    if (err instanceof LLMNotConfiguredError) {
      return NextResponse.json(
        { ok: false, error: "后端未配置 LLM_API_KEY，请联系管理员或在 .env 中补齐后重启" },
        { status: 503 },
      );
    }
    console.error("[extract-resume] failed:", err);
    return NextResponse.json(
      { ok: false, error: "简历抽取失败，请稍后重试" },
      { status: 500 },
    );
  }
}
