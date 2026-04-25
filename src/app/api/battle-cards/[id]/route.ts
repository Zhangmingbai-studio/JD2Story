import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "未登录" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "用户信息异常" }, { status: 401 });
  }

  const card = await prisma.battleCard.findFirst({
    where: { id: params.id, userId },
  });

  if (!card) {
    return NextResponse.json({ ok: false, error: "未找到" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, data: card });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "未登录" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "用户信息异常" }, { status: 401 });
  }

  await prisma.battleCard.deleteMany({
    where: { id: params.id, userId },
  });

  return NextResponse.json({ ok: true });
}
