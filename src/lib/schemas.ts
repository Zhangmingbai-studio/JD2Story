import { z } from "zod";

// Structured JD — what we expect the LLM to extract from a raw JD.
export const JDStructureSchema = z.object({
  title: z
    .string()
    .describe("岗位名称。如果用户填了，以用户填的为准；否则从 JD 正文推断。"),
  experienceRequirement: z
    .string()
    .describe("经验要求，例如 '3 年以上后端开发经验'。"),
  coreSkills: z
    .array(z.string())
    .describe("核心技能。具体的技术点或能力项，不要泛泛的形容词。"),
  bonusSkills: z
    .array(z.string())
    .describe("加分项。JD 中标注为 '加分' / '优先' 的能力。"),
  domainHints: z
    .array(z.string())
    .describe("业务或领域线索，例如 '金融风控' / '短视频推荐' / '高并发交易'。"),
  implicitFocus: z
    .array(z.string())
    .describe(
      "隐含关注点。基于 JD 文字做推理，例如 '熟悉分布式系统' 推出 '一致性 / 性能瓶颈 / 故障排查 / 容量规划' 等可能被追问的方向。",
    ),
  likelyInterviewTopics: z
    .array(z.string())
    .describe("面试官大概率会深挖的方向或话题。"),
});

export type JDStructure = z.infer<typeof JDStructureSchema>;

// Structured Resume — what we expect the LLM to extract from a raw resume.
export const ResumeStructureSchema = z.object({
  basicInfo: z.object({
    name: z.string().optional().describe("姓名"),
    yearsOfExperience: z
      .number()
      .optional()
      .describe("总工作年限（数字）"),
    currentRole: z.string().optional().describe("当前职位或最近职位"),
  }),
  workExperiences: z
    .array(
      z.object({
        company: z.string().describe("公司名称"),
        title: z.string().describe("职位"),
        duration: z.string().describe("在职时长，例如 '2022.03 - 至今'"),
        highlights: z
          .array(z.string())
          .describe("这段经历的关键贡献与技术点，每条一句话。"),
      }),
    )
    .describe("工作经历，按时间倒序。"),
  projectExperiences: z
    .array(
      z.object({
        name: z.string().describe("项目名称"),
        role: z.string().optional().describe("在项目中的角色"),
        stack: z.array(z.string()).describe("项目涉及的技术栈"),
        description: z.string().describe("项目简介，一到两句话。"),
        quantifiedResults: z
          .array(z.string())
          .describe("含具体数字的成果，例如 'QPS 提升 40%' / '服务可用性 99.99%'。"),
      }),
    )
    .describe("项目经历。"),
  techStack: z
    .array(z.string())
    .describe("整体掌握的技术栈，去重后的扁平列表。"),
  storyableHighlights: z
    .array(z.string())
    .describe(
      "最适合拿去面试讲的亮点：能展开讲 3–5 分钟的经历（技术攻坚 / 业务突破 / 团队协作等）。",
    ),
});

export type ResumeStructure = z.infer<typeof ResumeStructureSchema>;
