import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/current-user";
import { readClientDocument, deleteClientDocument } from "@/lib/storage";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUserId();
    const { id } = await params;

    const document = await prisma.clientDocument.findFirst({
      where: { id, client: { ownerId: userId } },
    });
    if (!document) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const buffer = await readClientDocument(
      document.clientId,
      document.fileName
    );

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": document.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(document.originalName)}"`,
        "Content-Length": String(document.sizeBytes),
      },
    });
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

    const document = await prisma.clientDocument.findFirst({
      where: { id, client: { ownerId: userId } },
    });
    if (!document) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.clientDocument.delete({ where: { id } });
    await deleteClientDocument(document.clientId, document.fileName);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
