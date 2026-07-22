import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/current-user";
import { incomeEntryUpdateSchema } from "@/lib/validation";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const body = await req.json();
    const parsed = incomeEntryUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.incomeEntry.findFirst({
      where: { id, ownerId: userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { expectedDate, receivedDate, ...rest } = parsed.data;

    const entry = await prisma.incomeEntry.update({
      where: { id },
      data: {
        ...rest,
        ...(expectedDate !== undefined
          ? { expectedDate: new Date(expectedDate) }
          : {}),
        ...(receivedDate !== undefined
          ? { receivedDate: receivedDate ? new Date(receivedDate) : null }
          : {}),
      },
      include: { client: true, project: true },
    });

    return NextResponse.json(entry);
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

    const existing = await prisma.incomeEntry.findFirst({
      where: { id, ownerId: userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.incomeEntry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
