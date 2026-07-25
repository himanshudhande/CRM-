import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/current-user";

export async function POST() {
  try {
    const session = await requireSession();
    const userId = session.user.id;

    const open = await prisma.attendanceLog.findFirst({
      where: { userId, checkOutAt: null },
      orderBy: { checkInAt: "desc" },
    });
    if (!open) {
      return NextResponse.json(
        { error: "Not checked in" },
        { status: 400 }
      );
    }

    const log = await prisma.attendanceLog.update({
      where: { id: open.id },
      data: { checkOutAt: new Date() },
    });

    return NextResponse.json(log);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
