import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

function readPositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return parsed;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "未登录" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "用户信息异常" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const page = readPositiveInt(searchParams.get("page"), 1);
  const requestedPageSize = readPositiveInt(
    searchParams.get("pageSize"),
    DEFAULT_PAGE_SIZE,
  );
  const pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE);

  const [cards, total] = await prisma.$transaction([
    prisma.battleCard.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        createdAt: true,
      },
    }),
    prisma.battleCard.count({ where: { userId } }),
  ]);

  return NextResponse.json({
    ok: true,
    data: {
      items: cards,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "未登录" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "用户信息异常" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title || !body?.input || !body?.result) {
    return NextResponse.json({ ok: false, error: "参数缺失" }, { status: 400 });
  }

  const card = await prisma.battleCard.create({
    data: {
      userId,
      title,
      input: body.input,
      result: body.result,
    },
  });

  return NextResponse.json({ ok: true, data: { id: card.id } });
}
