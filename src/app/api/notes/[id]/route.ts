import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/current-user";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUserId();
    const { id } = await params;

    const note = await prisma.clientNote.findFirst({
      where: { id, client: { ownerId: userId } },
    });
    if (!note) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.clientNote.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
