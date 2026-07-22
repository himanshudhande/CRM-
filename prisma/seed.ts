import bcrypt from "bcryptjs";
import { PrismaClient, Prisma } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function findOrCreateClient(
  ownerId: string,
  businessName: string,
  data: Omit<
    Prisma.ClientUncheckedCreateInput,
    "ownerId" | "businessName"
  >
) {
  const existing = await prisma.client.findFirst({
    where: { ownerId, businessName },
  });
  if (existing) {
    return prisma.client.update({ where: { id: existing.id }, data });
  }

  return prisma.client.create({
    data: { ...data, ownerId, businessName },
  });
}

async function findOrCreateNote(clientId: string, content: string) {
  const existing = await prisma.clientNote.findFirst({
    where: { clientId, content },
  });
  if (existing) return existing;

  return prisma.clientNote.create({ data: { clientId, content } });
}

async function findOrCreateProject(
  ownerId: string,
  name: string,
  data: Omit<Prisma.ProjectUncheckedCreateInput, "ownerId" | "name">
) {
  const existing = await prisma.project.findFirst({
    where: { ownerId, name },
  });
  if (existing) {
    return prisma.project.update({ where: { id: existing.id }, data });
  }

  return prisma.project.create({ data: { ...data, ownerId, name } });
}

async function findOrCreateTask(
  ownerId: string,
  title: string,
  data: Omit<Prisma.TaskUncheckedCreateInput, "ownerId" | "title">
) {
  const existing = await prisma.task.findFirst({ where: { ownerId, title } });
  if (existing) {
    return prisma.task.update({ where: { id: existing.id }, data });
  }

  return prisma.task.create({ data: { ...data, ownerId, title } });
}

async function findOrCreateContentItem(
  ownerId: string,
  title: string,
  data: Omit<Prisma.ContentItemUncheckedCreateInput, "ownerId" | "title">
) {
  const existing = await prisma.contentItem.findFirst({
    where: { ownerId, title },
  });
  if (existing) {
    return prisma.contentItem.update({ where: { id: existing.id }, data });
  }

  return prisma.contentItem.create({ data: { ...data, ownerId, title } });
}

async function findOrCreateIncomeEntry(
  ownerId: string,
  description: string,
  data: Omit<
    Prisma.IncomeEntryUncheckedCreateInput,
    "ownerId" | "description"
  >
) {
  const existing = await prisma.incomeEntry.findFirst({
    where: { ownerId, description },
  });
  if (existing) {
    return prisma.incomeEntry.update({ where: { id: existing.id }, data });
  }

  return prisma.incomeEntry.create({ data: { ...data, ownerId, description } });
}

async function findOrCreateExpenseEntry(
  ownerId: string,
  category: string,
  date: Date,
  data: Omit<
    Prisma.ExpenseEntryUncheckedCreateInput,
    "ownerId" | "category" | "date"
  >
) {
  const existing = await prisma.expenseEntry.findFirst({
    where: { ownerId, category, date },
  });
  if (existing) {
    return prisma.expenseEntry.update({ where: { id: existing.id }, data });
  }

  return prisma.expenseEntry.create({
    data: { ...data, ownerId, category, date },
  });
}

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env before seeding."
    );
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      name: "Admin",
    },
  });

  const [urgentTag, clientTag, editTag] = await Promise.all([
    prisma.tag.upsert({
      where: { name: "urgent" },
      update: {},
      create: { name: "urgent", color: "#ef4444" },
    }),
    prisma.tag.upsert({
      where: { name: "client" },
      update: {},
      create: { name: "client", color: "#3b82f6" },
    }),
    prisma.tag.upsert({
      where: { name: "edit" },
      update: {},
      create: { name: "edit", color: "#8b5cf6" },
    }),
  ]);

  const today = new Date();
  const daysFromNow = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };

  const nelconClient = await findOrCreateClient(user.id, "Nelcon", {
    contactPerson: "Priya Nair",
    phone: "+91 98765 43210",
    email: "priya@nelcon.example",
    industry: "Real estate",
    servicesPurchased: "Social media management, monthly content",
    monthlyRetainer: 15000,
    contractStartDate: daysFromNow(-90),
    renewalDate: daysFromNow(30),
    status: "ACTIVE",
    notes: "Prefers reels over static posts. Monthly retainer, invoiced on the 1st.",
  });

  const deshmukhClient = await findOrCreateClient(user.id, "Deshmukh Family", {
    contactPerson: "Rohan Deshmukh",
    phone: "+91 90000 11122",
    email: "rohan.deshmukh@example.com",
    industry: "Personal — wedding",
    servicesPurchased: "Wedding photography + videography",
    contractStartDate: daysFromNow(-20),
    status: "ONBOARDING",
  });

  await findOrCreateNote(
    nelconClient.id,
    "Kickoff call — confirmed August content batch, 5 reels + 3 carousels. Client wants more BTS content this cycle."
  );
  await findOrCreateNote(
    deshmukhClient.id,
    "Wedding shoot completed. Client requested a rush delivery of the highlight reel ahead of their engagement party."
  );

  const nelcon = await findOrCreateProject(user.id, "Nelcon — August content", {
    description: "Monthly social media content batch for Nelcon.",
    color: "#3b82f6",
    clientId: nelconClient.id,
  });

  const zprimeWedding = await findOrCreateProject(
    user.id,
    "ZPrime — wedding edit",
    {
      description: "Photo + video edit for the Deshmukh wedding shoot.",
      color: "#ec4899",
      clientId: deshmukhClient.id,
    }
  );

  const draftTask = await findOrCreateTask(
    user.id,
    "Draft caption set for Nelcon reels",
    {
      description: "5 reels, 3 carousel posts.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: daysFromNow(-1),
      projectId: nelcon.id,
    }
  );

  await findOrCreateTask(
    user.id,
    "Send Nelcon content calendar for approval",
    {
      status: "REVIEW",
      priority: "URGENT",
      dueDate: today,
      projectId: nelcon.id,
    }
  );

  const gradeTask = await findOrCreateTask(
    user.id,
    "Color grade wedding highlight reel",
    {
      status: "TODO",
      priority: "HIGH",
      dueDate: daysFromNow(2),
      projectId: zprimeWedding.id,
    }
  );

  await findOrCreateTask(user.id, "Cull and select RAW photos", {
    status: "DONE",
    priority: "MEDIUM",
    dueDate: daysFromNow(-3),
    completedAt: daysFromNow(-2),
    projectId: zprimeWedding.id,
  });

  await findOrCreateTask(user.id, "Pay quarterly software subscriptions", {
    status: "TODO",
    priority: "LOW",
    dueDate: daysFromNow(5),
    recurrenceRule: "MONTHLY",
  });

  const inquiryTask = await findOrCreateTask(
    user.id,
    "Reply to new client inquiry",
    {
      status: "TODO",
      priority: "MEDIUM",
      dueDate: today,
    }
  );

  await prisma.taskTag.upsert({
    where: { taskId_tagId: { taskId: draftTask.id, tagId: clientTag.id } },
    update: {},
    create: { taskId: draftTask.id, tagId: clientTag.id },
  });
  await prisma.taskTag.upsert({
    where: { taskId_tagId: { taskId: draftTask.id, tagId: editTag.id } },
    update: {},
    create: { taskId: draftTask.id, tagId: editTag.id },
  });
  await prisma.taskTag.upsert({
    where: { taskId_tagId: { taskId: gradeTask.id, tagId: editTag.id } },
    update: {},
    create: { taskId: gradeTask.id, tagId: editTag.id },
  });
  await prisma.taskTag.upsert({
    where: { taskId_tagId: { taskId: inquiryTask.id, tagId: urgentTag.id } },
    update: {},
    create: { taskId: inquiryTask.id, tagId: urgentTag.id },
  });

  await findOrCreateContentItem(user.id, "August reel — office tour", {
    platform: "INSTAGRAM",
    type: "REEL",
    stage: "EDITING",
    clientId: nelconClient.id,
    dueDate: daysFromNow(-2),
    scriptUrl: "https://docs.google.com/document/d/example-office-tour",
  });

  await findOrCreateContentItem(user.id, "Carousel — client testimonial", {
    platform: "INSTAGRAM",
    type: "CAROUSEL",
    stage: "CLIENT_REVIEW",
    clientId: nelconClient.id,
    dueDate: daysFromNow(1),
  });

  await findOrCreateContentItem(user.id, "Wedding highlight reel", {
    platform: "INSTAGRAM",
    type: "REEL",
    stage: "APPROVED",
    clientId: deshmukhClient.id,
    scheduledDate: daysFromNow(3),
    rawFootageUrl: "https://drive.google.com/drive/folders/example-wedding",
  });

  await findOrCreateContentItem(user.id, "Behind the scenes — gear setup", {
    platform: "YOUTUBE",
    type: "SHORT",
    stage: "IDEA",
    notes: "Own channel — ZPrime BTS series idea.",
  });

  await findOrCreateContentItem(user.id, "Monthly recap — August wins", {
    platform: "INSTAGRAM",
    type: "POST",
    stage: "SCHEDULED",
    scheduledDate: daysFromNow(6),
  });

  await findOrCreateContentItem(user.id, "Client onboarding explainer", {
    platform: "LINKEDIN",
    type: "POST",
    stage: "PUBLISHED",
    scheduledDate: daysFromNow(-10),
    finalExportUrl: "https://drive.google.com/file/d/example-explainer",
    isPortfolio: true,
    portfolioVisibility: "PUBLIC",
  });

  await findOrCreateContentItem(user.id, "Nelcon — Diwali reel", {
    platform: "INSTAGRAM",
    type: "REEL",
    stage: "PUBLISHED",
    clientId: nelconClient.id,
    scheduledDate: daysFromNow(-4),
    finalExportUrl: "https://drive.google.com/file/d/example-diwali-reel",
    isPortfolio: true,
    portfolioVisibility: "PUBLIC",
  });

  await findOrCreateContentItem(user.id, "Deshmukh — private teaser cut", {
    platform: "INSTAGRAM",
    type: "REEL",
    stage: "PUBLISHED",
    clientId: deshmukhClient.id,
    scheduledDate: daysFromNow(-6),
    isPortfolio: true,
    portfolioVisibility: "PRIVATE",
  });

  const monthsAgo = (n: number) => {
    const d = new Date(today);
    d.setMonth(d.getMonth() - n);
    return d;
  };

  await findOrCreateIncomeEntry(user.id, "Nelcon — August retainer", {
    amount: 15000,
    expectedDate: today,
    receivedDate: daysFromNow(-3),
    status: "PAID",
    isRetainer: true,
    clientId: nelconClient.id,
  });

  await findOrCreateIncomeEntry(user.id, "Nelcon — July retainer", {
    amount: 15000,
    expectedDate: monthsAgo(1),
    receivedDate: monthsAgo(1),
    status: "PAID",
    isRetainer: true,
    clientId: nelconClient.id,
  });

  await findOrCreateIncomeEntry(user.id, "Deshmukh wedding — final balance", {
    amount: 25000,
    expectedDate: daysFromNow(5),
    status: "PENDING",
    clientId: deshmukhClient.id,
  });

  await findOrCreateIncomeEntry(user.id, "Deshmukh wedding — advance", {
    amount: 10000,
    expectedDate: daysFromNow(-15),
    receivedDate: daysFromNow(-15),
    status: "PAID",
    clientId: deshmukhClient.id,
  });

  await findOrCreateIncomeEntry(user.id, "Old invoice — overdue", {
    amount: 5000,
    expectedDate: daysFromNow(-8),
    status: "PENDING",
  });

  await findOrCreateExpenseEntry(
    user.id,
    "Software & subscriptions",
    daysFromNow(-4),
    { amount: 2499, note: "Adobe Creative Cloud" }
  );
  await findOrCreateExpenseEntry(user.id, "Equipment", daysFromNow(-12), {
    amount: 8500,
    note: "Replacement SD cards + batteries",
  });
  await findOrCreateExpenseEntry(user.id, "Travel", monthsAgo(1), {
    amount: 3200,
    note: "Fuel for wedding shoot",
  });
  await findOrCreateExpenseEntry(
    user.id,
    "Software & subscriptions",
    monthsAgo(1),
    { amount: 2499, note: "Adobe Creative Cloud" }
  );
  await findOrCreateExpenseEntry(user.id, "Marketing", monthsAgo(2), {
    amount: 1500,
    note: "Boosted Instagram post",
  });

  console.log(`Seeded admin user: ${user.email}`);
  console.log(
    "Seeded clients, projects, tags, demo tasks, content items, and finance entries."
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
