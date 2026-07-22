import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/current-user";
import { contentItemInputSchema } from "@/lib/validation";

export async function GET() {
  try {
    const userId = await requireUserId();

    const items = await prisma.contentItem.findMany({
      where: { ownerId: userId },
      include: { client: true },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await req.json();
    const parsed = contentItemInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { dueDate, scheduledDate, ...rest } = parsed.data;

    const item = await prisma.contentItem.create({
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        ownerId: userId,
      },
      include: { client: true },
    });

    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
