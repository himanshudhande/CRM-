import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/current-user";

export async function GET() {
  try {
    const session = await requireSession();
    const userId = session.user.id;

    const [current, history] = await Promise.all([
      prisma.attendanceLog.findFirst({
        where: { userId, checkOutAt: null },
        orderBy: { checkInAt: "desc" },
      }),
      prisma.attendanceLog.findMany({
        where: { userId },
        orderBy: { checkInAt: "desc" },
        take: 20,
      }),
    ]);

    return NextResponse.json({ current, history });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
