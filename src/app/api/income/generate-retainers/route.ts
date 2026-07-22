import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/current-user";

export async function POST() {
  try {
    const userId = await requireUserId();

    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    const clients = await prisma.client.findMany({
      where: {
        ownerId: userId,
        status: "ACTIVE",
        monthlyRetainer: { not: null },
      },
    });

    let created = 0;

    for (const client of clients) {
      const existing = await prisma.incomeEntry.findFirst({
        where: {
          clientId: client.id,
          isRetainer: true,
          expectedDate: { gte: monthStart, lte: monthEnd },
        },
      });
      if (existing) continue;

      await prisma.incomeEntry.create({
        data: {
          description: `${client.businessName} — monthly retainer`,
          amount: client.monthlyRetainer!,
          expectedDate: monthStart,
          status: "PENDING",
          isRetainer: true,
          ownerId: userId,
          clientId: client.id,
        },
      });
      created += 1;
    }

    return NextResponse.json({ created });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
