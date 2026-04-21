import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

// Single source of truth for LLM provider config.
// Switch providers here, not at call sites.

const apiKey = process.env.LLM_API_KEY ?? "";
const baseURL =
  process.env.LLM_BASE_URL ??
  "https://dashscope.aliyuncs.com/compatible-mode/v1";
const modelName = process.env.LLM_MODEL ?? "qwen-plus";

const provider = createOpenAICompatible({
  name: "jd2story-llm",
  apiKey,
  baseURL,
});

export const model = provider(modelName);

export function assertLLMConfigured(): void {
  if (!apiKey) {
    throw new LLMNotConfiguredError();
  }
}

export class LLMNotConfiguredError extends Error {
  constructor() {
    super("LLM_API_KEY is not set. Add it to .env and restart the server.");
    this.name = "LLMNotConfiguredError";
  }
}
