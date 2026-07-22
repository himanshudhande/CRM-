import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/current-user";
import { taskInputSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const projectId = req.nextUrl.searchParams.get("projectId");

    const tasks = await prisma.task.findMany({
      where: {
        ownerId: userId,
        ...(projectId ? { projectId } : {}),
      },
      include: {
        project: true,
        tags: { include: { tag: true } },
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(tasks);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await req.json();
    const parsed = taskInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { tagIds, dueDate, recurrenceEndDate, ...rest } = parsed.data;

    const task = await prisma.task.create({
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : null,
        recurrenceEndDate: recurrenceEndDate
          ? new Date(recurrenceEndDate)
          : null,
        ownerId: userId,
        tags: {
          create: tagIds.map((tagId) => ({ tagId })),
        },
      },
      include: { project: true, tags: { include: { tag: true } } },
    });

    return NextResponse.json(task, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
