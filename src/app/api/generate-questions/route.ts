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
export const maxDuration = 300;

const QuestionCategorySchema = z.enum(["opener", "technical", "behavioral"]);

const CATEGORY_META: Record<
  z.infer<typeof QuestionCategorySchema>,
  { label: string; guidance: string }
> = {
  opener: {
    label: "开场题",
    guidance: "围绕自我介绍、岗位动机、项目总览和候选人最适合先亮出来的经历。",
  },
  technical: {
    label: "技术题",
    guidance: "围绕 JD 核心技能、候选人项目细节、架构取舍、性能、稳定性和排障深挖。",
  },
  behavioral: {
    label: "行为题",
    guidance: "围绕跨团队协作、推动落地、冲突处理、复盘成长和不确定性下的判断。",
  },
};

const BodySchema = z.object({
  jd: JDStructureSchema,
  resume: ResumeStructureSchema,
  match: MatchAnalysisSchema,
  batch: z
    .object({
      category: QuestionCategorySchema,
      count: z.number().int().min(1).max(5),
    })
    .optional(),
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
    const { jd, resume, match, batch } = parsed.data;
    const category = batch?.category;
    const categoryMeta = category ? CATEGORY_META[category] : null;
    const questionCount = batch?.count ?? 10;
    const countInstruction = category
      ? `请只生成 ${questionCount} 道${categoryMeta?.label}，每道题的 category 必须是 "${category}"。`
      : "请生成 10 道面试题：2 道开场题 + 5 道技术题 + 3 道行为题。";
    const categoryGuidance = categoryMeta
      ? `本批次重点：${categoryMeta.guidance}`
      : "整体覆盖开场、技术和行为三个类别。";

    const generation = await generateText({
      model,
      temperature: 0.35,
      maxOutputTokens: Math.max(1400, questionCount * 650),
      timeout: 75_000,
      output: Output.object({
        schema: InterviewQuestionsSchema,
        name: "interview_questions",
        description: "程序员面试高概率问题及回答骨架",
      }),
      system:
        "你是资深程序员面试辅导教练。你的任务是根据 JD、简历和匹配分析，生成高概率面试题及回答骨架。所有字段用简体中文。只输出合法 JSON，不要输出解释、Markdown 或其他内容。",
      prompt: `岗位 JD 结构化信息：
${JSON.stringify(jd, null, 2)}

候选人简历结构化信息：
${JSON.stringify(resume, null, 2)}

匹配分析：
${JSON.stringify(match, null, 2)}

${countInstruction}
${categoryGuidance}

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
- 每题 structure 控制在 2-4 条，dataToEmphasize 控制在 1-3 条，pitfalls 控制在 1-2 条，followUps 控制在 1-2 条。
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

    const questions = category
      ? result.data.questions
          .slice(0, questionCount)
          .map((question) => ({ ...question, category }))
      : result.data.questions;

    if (questions.length < questionCount) {
      console.error(
        `[generate-questions:${requestId}] insufficient questions:`,
        { expected: questionCount, actual: questions.length, category },
      );
      return NextResponse.json(
        { ok: false, error: "问题生成数量不足，请重试", requestId },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      data: { questions },
      requestId,
    });
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
