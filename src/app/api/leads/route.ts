import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/current-user";
import { leadInputSchema } from "@/lib/validation";

export async function GET() {
  try {
    const userId = await requireUserId();

    const leads = await prisma.lead.findMany({
      where: { ownerId: userId },
      orderBy: [{ followUpDate: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(leads);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await req.json();
    const parsed = leadInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { followUpDate, ...rest } = parsed.data;

    const lead = await prisma.lead.create({
      data: {
        ...rest,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        ownerId: userId,
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
