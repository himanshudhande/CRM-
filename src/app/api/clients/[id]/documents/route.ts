import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/current-user";
import { saveClientDocument } from "@/lib/storage";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUserId();
    const { id } = await params;

    const client = await prisma.client.findFirst({
      where: { id, ownerId: userId },
    });
    if (!client) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const documents = await prisma.clientDocument.findMany({
      where: { clientId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUserId();
    const { id } = await params;

    const client = await prisma.client.findFirst({
      where: { id, ownerId: userId },
    });
    if (!client) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds the 25MB limit" },
        { status: 400 }
      );
    }

    const saved = await saveClientDocument(id, file);

    const document = await prisma.clientDocument.create({
      data: { ...saved, clientId: id },
    });

    return NextResponse.json(document, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
