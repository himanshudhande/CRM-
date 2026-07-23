import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHENTICATED");
  }
  return session;
}

// All business data (tasks, clients, content, finance) is scoped to the single
// workspace owner, regardless of whether the logged-in user is the owner or a
// staff member — everyone on the team shares the same data.
export async function requireWorkspaceOwnerId() {
  await requireSession();

  const owner = await prisma.user.findFirst({
    where: { role: "OWNER" },
    orderBy: { createdAt: "asc" },
  });
  if (!owner) {
    throw new Error("NO_OWNER");
  }
  return owner.id;
}

// Legacy name kept so existing API routes don't all need renaming.
export const requireUserId = requireWorkspaceOwnerId;

export async function requireOwner() {
  const session = await requireSession();
  if (session.user.role !== "OWNER") {
    throw new Error("FORBIDDEN");
  }
  return session.user;
}
