import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/current-user";
import { taskUpdateSchema } from "@/lib/validation";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const body = await req.json();
    const parsed = taskUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.task.findFirst({
      where: { id, ownerId: userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { tagIds, dueDate, recurrenceEndDate, status, ...rest } =
      parsed.data;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...rest,
        ...(status !== undefined
          ? {
              status,
              completedAt:
                status === "DONE"
                  ? (existing.completedAt ?? new Date())
                  : null,
            }
          : {}),
        ...(dueDate !== undefined
          ? { dueDate: dueDate ? new Date(dueDate) : null }
          : {}),
        ...(recurrenceEndDate !== undefined
          ? {
              recurrenceEndDate: recurrenceEndDate
                ? new Date(recurrenceEndDate)
                : null,
            }
          : {}),
        ...(tagIds !== undefined
          ? {
              tags: {
                deleteMany: {},
                create: tagIds.map((tagId) => ({ tagId })),
              },
            }
          : {}),
      },
      include: { project: true, tags: { include: { tag: true } } },
    });

    return NextResponse.json(task);
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

    const existing = await prisma.task.findFirst({
      where: { id, ownerId: userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.task.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
