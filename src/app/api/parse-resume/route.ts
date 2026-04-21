import { NextRequest, NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";
import mammoth from "mammoth";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "请求格式错误，需要 multipart/form-data" },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "缺少 file 字段" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "文件超过 10 MB，请压缩或直接粘贴文本" },
      { status: 413 },
    );
  }

  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    if (name.endsWith(".pdf")) {
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { text } = await extractText(pdf, { mergePages: true });
      return NextResponse.json({
        text: Array.isArray(text) ? text.join("\n") : text,
      });
    }
    if (name.endsWith(".docx")) {
      const result = await mammoth.extractRawText({ buffer });
      return NextResponse.json({ text: result.value });
    }
    return NextResponse.json(
      { error: "仅支持 .pdf 和 .docx 格式" },
      { status: 415 },
    );
  } catch (err) {
    console.error("[parse-resume] failed:", err);
    return NextResponse.json(
      { error: "解析失败，请尝试直接粘贴文本" },
      { status: 500 },
    );
  }
}
