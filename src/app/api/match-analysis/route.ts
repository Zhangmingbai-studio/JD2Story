import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { z } from "zod";
import { model, assertLLMConfigured, LLMNotConfiguredError } from "@/lib/llm";
import {
  JDStructureSchema,
  ResumeStructureSchema,
  MatchAnalysisSchema,
} from "@/lib/schemas";

export const runtime = "nodejs";
export const maxDuration = 60;

const BodySchema = z.object({
  jd: JDStructureSchema,
  resume: ResumeStructureSchema,
});

export async function POST(req: NextRequest) {
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "请求参数错误" },
      { status: 400 },
    );
  }

  try {
    assertLLMConfigured();
    const { jd, resume } = parsed.data;

    const { text } = await generateText({
      model,
      temperature: 0.3,
      system:
        "你是资深程序员面试辅导教练。你的任务是对比 JD 需求与候选人简历，找出匹配亮点、短板、风险，并推荐最适合面试讲的经历。所有字段用简体中文。只输出 JSON，不要输出其他内容。",
      prompt: `岗位 JD 结构化信息：
${JSON.stringify(jd, null, 2)}

候选人简历结构化信息：
${JSON.stringify(resume, null, 2)}

请严格按照以下 JSON 格式输出，字段名必须完全一致：
{
  "matchHighlights": ["匹配亮点1", "匹配亮点2"],
  "gaps": ["短板1", "短板2"],
  "risks": ["高风险表述1"],
  "topStories": [
    {
      "title": "经历标题",
      "why": "为什么适合讲",
      "talkingPoints": ["要点1", "要点2"]
    }
  ]
}

分析要点：
- matchHighlights：简历中与 JD 核心技能或加分项直接匹配的能力或经历，要具体到技术点。
- gaps：JD 要求但简历中明显缺失或薄弱的领域。诚实但不要过度悲观。
- risks：简历中可能被面试官追问后暴露弱点的描述（如夸大、模糊、无数据支撑的成果）。
- topStories：从简历中挑出最能打的 3 段经历，按推荐优先级排序。每段要说清楚为什么适合讲、讲的时候强调什么。
`,
    });

    const json = JSON.parse(text.replace(/^```json\s*/, "").replace(/```\s*$/, ""));
    const result = MatchAnalysisSchema.safeParse(json);
    if (!result.success) {
      console.error("[match-analysis] schema validation failed:", result.error.issues);
      return NextResponse.json(
        { ok: false, error: "匹配分析结果格式异常，请重试" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, data: result.data });
  } catch (err) {
    if (err instanceof LLMNotConfiguredError) {
      return NextResponse.json(
        { ok: false, error: "后端未配置 LLM_API_KEY" },
        { status: 503 },
      );
    }
    console.error("[match-analysis] failed:", err);
    return NextResponse.json(
      { ok: false, error: "匹配分析失败，请稍后重试" },
      { status: 500 },
    );
  }
}
