import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/current-user";
import { incomeEntryInputSchema } from "@/lib/validation";

export async function GET() {
  try {
    const userId = await requireUserId();

    const entries = await prisma.incomeEntry.findMany({
      where: { ownerId: userId },
      include: { client: true, project: true },
      orderBy: [{ expectedDate: "desc" }],
    });

    return NextResponse.json(entries);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await req.json();
    const parsed = incomeEntryInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { expectedDate, receivedDate, ...rest } = parsed.data;

    const entry = await prisma.incomeEntry.create({
      data: {
        ...rest,
        expectedDate: new Date(expectedDate),
        receivedDate: receivedDate ? new Date(receivedDate) : null,
        ownerId: userId,
      },
      include: { client: true, project: true },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
