import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "未登录" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "用户信息异常" }, { status: 401 });
  }

  const cards = await prisma.battleCard.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ ok: true, data: cards });
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
  if (!body?.title || !body?.input || !body?.result) {
    return NextResponse.json({ ok: false, error: "参数缺失" }, { status: 400 });
  }

  const card = await prisma.battleCard.create({
    data: {
      userId,
      title: body.title,
      input: body.input,
      result: body.result,
    },
  });

  return NextResponse.json({ ok: true, data: { id: card.id } });
}
