import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/current-user";
import { contentItemUpdateSchema } from "@/lib/validation";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const body = await req.json();
    const parsed = contentItemUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.contentItem.findFirst({
      where: { id, ownerId: userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { dueDate, scheduledDate, stage, ...rest } = parsed.data;

    const item = await prisma.contentItem.update({
      where: { id },
      data: {
        ...rest,
        ...(stage !== undefined
          ? {
              stage,
              stageUpdatedAt:
                stage !== existing.stage ? new Date() : undefined,
            }
          : {}),
        ...(dueDate !== undefined
          ? { dueDate: dueDate ? new Date(dueDate) : null }
          : {}),
        ...(scheduledDate !== undefined
          ? { scheduledDate: scheduledDate ? new Date(scheduledDate) : null }
          : {}),
      },
      include: { client: true },
    });

    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUserId();
    const { id } = await params;

    const existing = await prisma.contentItem.findFirst({
      where: { id, ownerId: userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.contentItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
