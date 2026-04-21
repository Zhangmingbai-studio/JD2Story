import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
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

    const { text } = await generateText({
      model,
      temperature: 0.2,
      system:
        "你是资深程序员面试辅导教练。你的任务是把一份 JD 拆成结构化信息，重点是挖出面试官会深挖的方向。所有字段用简体中文。只输出 JSON，不要输出其他内容。",
      prompt: buildPrompt({ jd, title, company, direction }),
    });

    const json = JSON.parse(text.replace(/^```json\s*/, "").replace(/```\s*$/, ""));
    const result = JDStructureSchema.safeParse(json);
    if (!result.success) {
      console.error("[parse-jd] schema validation failed:", result.error.issues);
      return NextResponse.json(
        { ok: false, error: "JD 解析结果格式异常，请重试" },
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

请严格按照以下 JSON 格式输出，字段名必须完全一致：
{
  "title": "岗位名称（如果用户填了以用户为准，否则从 JD 推断）",
  "experienceRequirement": "经验要求，例如 '3 年以上后端开发经验'",
  "coreSkills": ["核心技能1", "核心技能2"],
  "bonusSkills": ["加分项1", "加分项2"],
  "domainHints": ["业务或领域线索，例如 '金融风控'"],
  "implicitFocus": ["隐含关注点1", "隐含关注点2"],
  "likelyInterviewTopics": ["面试深挖话题1", "面试深挖话题2"]
}

提取要点：
- coreSkills / bonusSkills 必须是具体技术点或能力项，不要泛化成 "良好的沟通能力" 这种形容词。
- implicitFocus 要做推理：如果 JD 说 "熟悉分布式系统"，就展开到 "一致性模型、性能瓶颈排查、容量规划、故障处理" 等面试官大概率会追问的方向。
- likelyInterviewTopics 给出面试时大概率被深挖的话题，3–6 条足够。
`;
}
