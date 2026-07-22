import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/current-user";
import { clientInputSchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const status = req.nextUrl.searchParams.get("status");

    const clients = await prisma.client.findMany({
      where: {
        ownerId: userId,
        ...(status ? { status: status as never } : {}),
      },
      include: { _count: { select: { projects: true } } },
      orderBy: { businessName: "asc" },
    });

    return NextResponse.json(clients);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await req.json();
    const parsed = clientInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { contractStartDate, renewalDate, email, ...rest } = parsed.data;

    const client = await prisma.client.create({
      data: {
        ...rest,
        email: email || null,
        contractStartDate: contractStartDate
          ? new Date(contractStartDate)
          : null,
        renewalDate: renewalDate ? new Date(renewalDate) : null,
        ownerId: userId,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
