# JD2Story MVP 分阶段计划

> 最后更新：2026-04-21

## 产品目标

**一句话**：用户粘贴 JD + 上传简历 → 生成一份程序员专属面试作战卡。

**输出物**：岗位拆解 / 简历与 JD 匹配分析 / 10 道高概率面试题 / 每题回答骨架 / 一页可导出作战卡。

## 核心功能清单（8 个）

| # | 功能 | 说明 |
|---|---|---|
| 1 | JD 输入 | 粘贴文本 + 可选岗位名/公司名（第一版不做 URL 抓取） |
| 2 | 简历输入 | PDF / DOCX 上传 + 粘贴文本 fallback（解析结果可手动修正） |
| 3 | 岗位拆解 | 结构化字段：经验要求 / 核心技能 / 加分项 / 隐含关注点 / 可能面试重点 |
| 4 | 简历经历抽取 | 基本信息 / 项目 / 技术栈 / 指标型成果 / 可讲故事素材 |
| 5 | 匹配分析 | 匹配亮点 / 主要短板 / 高风险表述 / 建议主打的 3 段经历 |
| 6 | 面试问题生成 | 2 开场 + 5 技术 + 3 行为 = 10 道题 |
| 7 | 回答骨架生成 | 核心结论 / 讲述结构 / 要强调的数据 / 不能瞎吹的点 / 可选追问 |
| 8 | 导出作战卡 | Web 展示 + 复制到剪贴板 + 导出 PDF |

## 页面结构（5 个）

| 页面 | 路径 | 职责 |
|---|---|---|
| Landing | `/` | 价值主张 / 3 卖点 / CTA / demo 截图 |
| Input | `/input` | 左 JD 栏 + 右简历栏 + 底部 CTA |
| Processing | `/processing` | 4 进度节点（解析 JD → 抽简历 → 匹配 → 生成问题） |
| Result | `/result` | 4 Tab：岗位理解 / 匹配分析 / 问题骨架 / 一页作战卡 |
| Export | 弹窗 | 复制 / PDF / Markdown（不单独一页） |

## 分阶段实施

每阶段跑通 → commit → review → 进下一阶段。每阶段尽量一个可 review 的 PR。

### P1 — 路由骨架 + Landing + Input 页 UI（今天做）

- 建 4 条路由：`/`、`/input`、`/processing`、`/result`（后两个先 placeholder）
- 共享 TopNav
- Landing：Hero + 3 卖点 + CTA + demo 截图占位
- Input：左 JD（标题/公司/正文/方向选择）+ 右简历（上传按钮 + 粘贴文本 + 预览）+ 底部「生成作战卡」按钮
- 纯前端，不连后端，按钮暂无逻辑

**验收**：页面能点、能填、UI 对得上预览图；`npm run build` 通过。

### P2 — 文件解析

- 依赖：`unpdf`（PDF）+ `mammoth`（DOCX）
- 服务端 API：`POST /api/parse-resume`（multipart → 纯文本）
- 前端 Input 页：上传后调用 API，把提取文本填进可编辑 textarea
- 错误处理：解析失败 → 提示用户直接粘贴

**验收**：上传 PDF/DOCX 能看到纯文本；用户可手动修正。

### P3 — LLM pipeline（JD 拆解 + 简历抽取）

- 选型在此前定好（Claude / OpenAI / 国产），装对应 SDK
- `.env` 加 `*_API_KEY`（同时更新 `.env.example`）
- 两个独立 API 路由：
  - `POST /api/parse-jd` → 结构化 JD
  - `POST /api/extract-resume` → 结构化简历
- Processing 页：4 进度节点骨架（用 SSE 或轮询实现状态推送）
- Result 页 Tab A（岗位理解）可看

**验收**：输入 JD + 简历 → Result 页看到结构化拆解结果。

### P4 — 匹配分析 + 问题生成

- 基于 P3 的两个结构化输出
- 新增 API：
  - `POST /api/match-analysis` → 匹配亮点 / 短板 / 风险 / 主打 3 段
  - `POST /api/generate-questions` → 10 道题 + 回答骨架
- Result 页 Tab B、Tab C 接入

**验收**：10 道题带骨架能看，匹配分析能看。

### P5 — 一页作战卡 + 导出

- Result 页 Tab D：把前面内容压成一页紧凑视图
- 导出弹窗：复制到剪贴板 + 浏览器 `window.print()` 导出 PDF（MVP 够用）

**验收**：全流程打通，能导出。

### P6（可选，未承诺）— 登录 + DB 持久化

- 加 NextAuth / Clerk 做登录
- Prisma 加模型：User / Session / BattleCard
- 补左侧 sidebar（历史记录）
- 这一阶段才动 Prisma，前面所有阶段都不需要数据库

## 技术选型待定项

| 项 | 候选 | 决策时点 |
|---|---|---|
| LLM 供应商 | Claude / OpenAI / DeepSeek / Moonshot | P3 开始前 |
| API Key | 用户提供 | P3 开始前 |
| PDF 解析 | `unpdf`（推荐，Edge 友好）/ `pdfjs-dist` | P2 开始前 |
| DOCX 解析 | `mammoth`（事实标准） | P2 开始前 |
| PDF 导出 | 浏览器 print（MVP）/ `@react-pdf/renderer`（未来） | P5 |

## 已确认的约束

- MVP 不做登录、不持久化到 DB（P6 再加）
- 不做 URL 抓取 JD（反爬 + 格式坑太多）
- 每阶段保证本地能跑（CLAUDE.md 约定）
- 小而可 review 的 commits
