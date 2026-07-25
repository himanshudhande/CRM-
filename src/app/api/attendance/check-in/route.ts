import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/current-user";

export async function POST() {
  try {
    const session = await requireSession();
    const userId = session.user.id;

    const open = await prisma.attendanceLog.findFirst({
      where: { userId, checkOutAt: null },
    });
    if (open) {
      return NextResponse.json(
        { error: "Already checked in" },
        { status: 400 }
      );
    }

    const log = await prisma.attendanceLog.create({
      data: { userId, checkInAt: new Date() },
    });

    return NextResponse.json(log, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
