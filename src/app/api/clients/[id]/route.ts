import { NextRequest, NextResponse } from "next/server";
import { rm } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/current-user";
import { clientUpdateSchema } from "@/lib/validation";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUserId();
    const { id } = await params;

    const client = await prisma.client.findFirst({
      where: { id, ownerId: userId },
      include: { _count: { select: { projects: true } } },
    });

    if (!client) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const body = await req.json();
    const parsed = clientUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await prisma.client.findFirst({
      where: { id, ownerId: userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { contractStartDate, renewalDate, email, ...rest } = parsed.data;

    const client = await prisma.client.update({
      where: { id },
      data: {
        ...rest,
        ...(email !== undefined ? { email: email || null } : {}),
        ...(contractStartDate !== undefined
          ? {
              contractStartDate: contractStartDate
                ? new Date(contractStartDate)
                : null,
            }
          : {}),
        ...(renewalDate !== undefined
          ? { renewalDate: renewalDate ? new Date(renewalDate) : null }
          : {}),
      },
    });

    return NextResponse.json(client);
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

    const existing = await prisma.client.findFirst({
      where: { id, ownerId: userId },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.client.delete({ where: { id } });
    await rm(join(process.cwd(), "uploads", id), {
      recursive: true,
      force: true,
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
