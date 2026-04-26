import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { generateText, Output } from "ai";
import { z } from "zod";
import { model, assertLLMConfigured, LLMNotConfiguredError } from "@/lib/llm";
import {
  JDStructureSchema,
  ResumeStructureSchema,
  MatchAnalysisSchema,
  InterviewQuestionsSchema,
} from "@/lib/schemas";

export const runtime = "nodejs";
export const maxDuration = 90;

const BodySchema = z.object({
  jd: JDStructureSchema,
  resume: ResumeStructureSchema,
  match: MatchAnalysisSchema,
});

function getLoggableError(err: unknown) {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
      stack: err.stack?.split("\n").slice(0, 4).join("\n"),
    };
  }
  return { message: String(err) };
}

export async function POST(req: NextRequest) {
  const requestId = randomUUID();
  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "请求参数错误", requestId },
      { status: 400 },
    );
  }

  try {
    assertLLMConfigured();
    const { jd, resume, match } = parsed.data;

    const generation = await generateText({
      model,
      temperature: 0.35,
      maxOutputTokens: 4500,
      output: Output.object({
        schema: InterviewQuestionsSchema,
        name: "interview_questions",
        description: "10 道程序员面试高概率问题及回答骨架",
      }),
      system:
        "你是资深程序员面试辅导教练。你的任务是根据 JD、简历和匹配分析，生成 10 道高概率面试题及回答骨架。所有字段用简体中文。只输出合法 JSON，不要输出解释、Markdown 或其他内容。",
      prompt: `岗位 JD 结构化信息：
${JSON.stringify(jd, null, 2)}

候选人简历结构化信息：
${JSON.stringify(resume, null, 2)}

匹配分析：
${JSON.stringify(match, null, 2)}

请生成 10 道面试题：2 道开场题 + 5 道技术题 + 3 道行为题。

严格按照以下 JSON 格式输出，字段名必须完全一致：
{
  "questions": [
    {
      "category": "opener",
      "question": "面试问题",
      "intent": "面试官问这道题的意图",
      "answerSkeleton": {
        "coreConclusion": "回答的核心结论（一句话）",
        "structure": ["回答结构要点1", "要点2"],
        "dataToEmphasize": ["要强调的数据或成果"],
        "pitfalls": ["不要瞎吹的点"]
      },
      "followUps": ["可能的追问1", "追问2"]
    }
  ]
}

category 取值：opener（开场）、technical（技术）、behavioral（行为）。

生成要点：
- 问题必须针对这位候选人的具体简历和目标岗位，不要泛泛而谈。
- 技术题要围绕 JD 核心技能和候选人项目经历，深度要够。
- 行为题要结合候选人可能的真实场景。
- answerSkeleton 是帮候选人准备的回答框架，不是标准答案。
- pitfalls 要实事求是，指出候选人可能讲不清楚或容易翻车的点。
- followUps 是面试官听完回答后大概率会追问的方向。
`,
    });

    const result = InterviewQuestionsSchema.safeParse(generation.output);
    if (!result.success) {
      console.error(
        `[generate-questions:${requestId}] schema validation failed:`,
        result.error.issues,
      );
      return NextResponse.json(
        { ok: false, error: "问题生成结果格式异常，请重试", requestId },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, data: result.data, requestId });
  } catch (err) {
    if (err instanceof LLMNotConfiguredError) {
      return NextResponse.json(
        { ok: false, error: "后端未配置 LLM_API_KEY", requestId },
        { status: 503 },
      );
    }
    console.error(
      `[generate-questions:${requestId}] failed:`,
      getLoggableError(err),
    );
    return NextResponse.json(
      { ok: false, error: "问题生成失败，请稍后重试", requestId },
      { status: 500 },
    );
  }
}
