import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwner, requireUserId } from "@/lib/current-user";
import { expenseEntryInputSchema } from "@/lib/validation";

export async function GET() {
  try {
    await requireOwner();
    const userId = await requireUserId();

    const entries = await prisma.expenseEntry.findMany({
      where: { ownerId: userId },
      orderBy: [{ date: "desc" }],
    });

    return NextResponse.json(entries);
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireOwner();
    const userId = await requireUserId();
    const body = await req.json();
    const parsed = expenseEntryInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { date, ...rest } = parsed.data;

    const entry = await prisma.expenseEntry.create({
      data: { ...rest, date: new Date(date), ownerId: userId },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
