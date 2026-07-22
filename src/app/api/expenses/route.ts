import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/current-user";
import { expenseEntryInputSchema } from "@/lib/validation";

export async function GET() {
  try {
    const userId = await requireUserId();

    const entries = await prisma.expenseEntry.findMany({
      where: { ownerId: userId },
      orderBy: [{ date: "desc" }],
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
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
