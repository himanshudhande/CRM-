import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Intentionally unauthenticated — this is the public portfolio gallery feed.
// Single-user app, so there's no owner scoping to worry about here.
export async function GET() {
  const items = await prisma.contentItem.findMany({
    where: { isPortfolio: true, portfolioVisibility: "PUBLIC" },
    include: { client: true },
    orderBy: [{ scheduledDate: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(items);
}
