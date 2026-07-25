import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, requireUserId } from "@/lib/current-user";
import { isManagementRole } from "@/lib/permissions";
import { taskInputSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession();
    const userId = await requireUserId();
    const projectId = req.nextUrl.searchParams.get("projectId");
    const isManagement = isManagementRole(session.user.role);

    const tasks = await prisma.task.findMany({
      where: {
        ownerId: userId,
        ...(projectId ? { projectId } : {}),
        ...(isManagement ? {} : { assigneeId: session.user.id }),
      },
      include: {
        project: true,
        assignee: { select: { id: true, name: true, email: true, role: true } },
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
    const session = await requireSession();
    const userId = await requireUserId();
    const isManagement = isManagementRole(session.user.role);
    const body = await req.json();
    const parsed = taskInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { tagIds, dueDate, recurrenceEndDate, assigneeId, ...rest } =
      parsed.data;

    const task = await prisma.task.create({
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : null,
        recurrenceEndDate: recurrenceEndDate
          ? new Date(recurrenceEndDate)
          : null,
        assigneeId: isManagement ? (assigneeId ?? null) : session.user.id,
        ownerId: userId,
        tags: {
          create: tagIds.map((tagId) => ({ tagId })),
        },
      },
      include: {
        project: true,
        assignee: { select: { id: true, name: true, email: true, role: true } },
        tags: { include: { tag: true } },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
