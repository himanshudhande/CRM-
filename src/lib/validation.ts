import { z } from "zod";

export const taskStatusValues = [
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
] as const;
export const taskPriorityValues = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export const recurrenceRuleValues = [
  "NONE",
  "DAILY",
  "WEEKLY",
  "MONTHLY",
] as const;

export const taskInputSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(5000).optional().nullable(),
  status: z.enum(taskStatusValues).default("TODO"),
  priority: z.enum(taskPriorityValues).default("MEDIUM"),
  dueDate: z.string().datetime().optional().nullable(),
  recurrenceRule: z.enum(recurrenceRuleValues).default("NONE"),
  recurrenceEndDate: z.string().datetime().optional().nullable(),
  projectId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).optional().default([]),
});

export const taskUpdateSchema = taskInputSchema.partial();

export const projectInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(5000).optional().nullable(),
  color: z.string().max(20).optional().nullable(),
  archived: z.boolean().optional(),
  clientId: z.string().optional().nullable(),
});

export const projectUpdateSchema = projectInputSchema.partial();

export const tagInputSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().max(20).optional().nullable(),
});

export const clientStatusValues = [
  "ONBOARDING",
  "ACTIVE",
  "PAUSED",
  "CHURNED",
] as const;

export const clientInputSchema = z.object({
  businessName: z.string().min(1, "Business name is required").max(200),
  contactPerson: z.string().max(200).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().max(200).optional().nullable().or(z.literal("")),
  industry: z.string().max(100).optional().nullable(),
  servicesPurchased: z.string().max(500).optional().nullable(),
  monthlyRetainer: z.number().int().nonnegative().optional().nullable(),
  contractStartDate: z.string().datetime().optional().nullable(),
  renewalDate: z.string().datetime().optional().nullable(),
  status: z.enum(clientStatusValues).default("ONBOARDING"),
  notes: z.string().max(5000).optional().nullable(),
});

export const clientUpdateSchema = clientInputSchema.partial();

export const clientNoteInputSchema = z.object({
  content: z.string().min(1, "Note can't be empty").max(5000),
});

export const contentPlatformValues = [
  "INSTAGRAM",
  "YOUTUBE",
  "FACEBOOK",
  "LINKEDIN",
  "TWITTER",
  "TIKTOK",
  "OTHER",
] as const;

export const contentTypeValues = [
  "REEL",
  "POST",
  "CAROUSEL",
  "STORY",
  "LONG_FORM",
  "SHORT",
  "OTHER",
] as const;

export const contentStageValues = [
  "IDEA",
  "SCRIPT",
  "SHOOT_PLANNED",
  "SHOOTING",
  "EDITING",
  "CLIENT_REVIEW",
  "APPROVED",
  "SCHEDULED",
  "PUBLISHED",
] as const;

const urlOrEmpty = z
  .string()
  .max(2000)
  .optional()
  .nullable()
  .refine((v) => !v || /^https?:\/\//i.test(v), {
    message: "Must be a valid URL starting with http:// or https://",
  });

export const portfolioVisibilityValues = ["PRIVATE", "PUBLIC"] as const;

export const contentItemInputSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  platform: z.enum(contentPlatformValues),
  type: z.enum(contentTypeValues),
  stage: z.enum(contentStageValues).default("IDEA"),
  dueDate: z.string().datetime().optional().nullable(),
  scheduledDate: z.string().datetime().optional().nullable(),
  scriptUrl: urlOrEmpty,
  rawFootageUrl: urlOrEmpty,
  finalExportUrl: urlOrEmpty,
  notes: z.string().max(5000).optional().nullable(),
  clientId: z.string().optional().nullable(),
  isPortfolio: z.boolean().optional(),
  portfolioVisibility: z.enum(portfolioVisibilityValues).optional(),
});

export const contentItemUpdateSchema = contentItemInputSchema.partial();

export const incomeStatusValues = ["PENDING", "PAID"] as const;

export const incomeEntryInputSchema = z.object({
  description: z.string().max(200).optional().nullable(),
  amount: z.number().int().positive(),
  expectedDate: z.string().datetime(),
  receivedDate: z.string().datetime().optional().nullable(),
  status: z.enum(incomeStatusValues).default("PENDING"),
  clientId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
});

export const incomeEntryUpdateSchema = incomeEntryInputSchema.partial();

export const expenseEntryInputSchema = z.object({
  category: z.string().min(1, "Category is required").max(100),
  amount: z.number().int().positive(),
  date: z.string().datetime(),
  note: z.string().max(1000).optional().nullable(),
});

export const expenseEntryUpdateSchema = expenseEntryInputSchema.partial();
