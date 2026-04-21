import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
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

    const { text } = await generateText({
      model,
      temperature: 0.2,
      system:
        "你是资深程序员面试辅导教练。你的任务是从一份简历中抽取结构化信息，重点是挑出适合拿去面试讲的亮点。所有字段用简体中文。只输出 JSON，不要输出其他内容。",
      prompt: `简历文本（可能含 PDF/DOCX 解析后的噪音，请自行清理）：
"""
${resume}
"""

请严格按照以下 JSON 格式输出，字段名必须完全一致：
{
  "basicInfo": {
    "name": "姓名（可选）",
    "yearsOfExperience": 3,
    "currentRole": "当前或最近职位（可选）"
  },
  "workExperiences": [
    {
      "company": "公司名称",
      "title": "职位",
      "duration": "在职时长，例如 '2022.03 - 至今'",
      "highlights": ["关键贡献1", "关键贡献2"]
    }
  ],
  "projectExperiences": [
    {
      "name": "项目名称",
      "role": "角色（可选）",
      "stack": ["技术栈1", "技术栈2"],
      "description": "项目简介，一到两句话",
      "quantifiedResults": ["含具体数字的成果"]
    }
  ],
  "techStack": ["技术1", "技术2"],
  "storyableHighlights": ["最适合面试讲的亮点1", "亮点2"]
}

抽取要点：
- quantifiedResults 要找含具体数字的成果（如 "QPS 从 5k 提升到 20k"），没有数字的不要硬塞。
- storyableHighlights 是简历里最能打的亮点，每条能支撑候选人展开讲 3–5 分钟。挑 3–6 条最精华的就够。
- techStack 要去重，并合并同类（如 "React.js" 和 "React" 算一条）。
- projectExperiences 中的 stack 字段是该项目涉及的技术栈数组。
- 如果某些字段简历里真的没写，workExperiences / projectExperiences 可以为空数组，不要编造。
`,
    });

    const json = JSON.parse(text.replace(/^```json\s*/, "").replace(/```\s*$/, ""));
    const result = ResumeStructureSchema.safeParse(json);
    if (!result.success) {
      console.error("[extract-resume] schema validation failed:", result.error.issues);
      return NextResponse.json(
        { ok: false, error: "简历抽取结果格式异常，请重试" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, data: result.data });
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
