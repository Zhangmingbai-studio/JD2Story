import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { model, assertLLMConfigured, LLMNotConfiguredError } from "@/lib/llm";
import { JDStructureSchema } from "@/lib/schemas";

export const runtime = "nodejs";
export const maxDuration = 60;

const BodySchema = z.object({
  jd: z.string().min(10, "JD 文本过短"),
  title: z.string().optional(),
  company: z.string().optional(),
  direction: z.string().optional(),
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
    const { jd, title, company, direction } = parsed.data;

    const { object } = await generateObject({
      model,
      schema: JDStructureSchema,
      temperature: 0.2,
      system:
        "你是资深程序员面试辅导教练。你的任务是把一份 JD 拆成结构化信息，重点是挖出面试官会深挖的方向。输出必须严格符合给定 schema，所有字段用简体中文。",
      prompt: buildPrompt({ jd, title, company, direction }),
    });

    return NextResponse.json({ ok: true, data: object });
  } catch (err) {
    if (err instanceof LLMNotConfiguredError) {
      return NextResponse.json(
        { ok: false, error: "后端未配置 LLM_API_KEY，请联系管理员或在 .env 中补齐后重启" },
        { status: 503 },
      );
    }
    console.error("[parse-jd] failed:", err);
    return NextResponse.json(
      { ok: false, error: "JD 解析失败，请稍后重试" },
      { status: 500 },
    );
  }
}

function buildPrompt(input: {
  jd: string;
  title?: string;
  company?: string;
  direction?: string;
}): string {
  const { jd, title, company, direction } = input;
  const hints = [
    title ? `用户填写的岗位名称：${title}` : null,
    company ? `目标公司：${company}` : null,
    direction ? `岗位方向：${direction}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `${hints ? `${hints}\n\n` : ""}JD 正文：
"""
${jd}
"""

提取要点：
- coreSkills / bonusSkills 必须是具体技术点或能力项，不要泛化成 "良好的沟通能力" 这种形容词。
- implicitFocus 要做推理：如果 JD 说 "熟悉分布式系统"，就展开到 "一致性模型、性能瓶颈排查、容量规划、故障处理" 等面试官大概率会追问的方向。
- likelyInterviewTopics 给出面试时大概率被深挖的话题，3–6 条足够。
`;
}
