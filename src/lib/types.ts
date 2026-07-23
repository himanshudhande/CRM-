export type UserRole = "OWNER" | "STAFF";

export interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  createdAt: string;
}

export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type RecurrenceRule = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";
export type ClientStatus = "ONBOARDING" | "ACTIVE" | "PAUSED" | "CHURNED";
export type ContentPlatform =
  | "INSTAGRAM"
  | "YOUTUBE"
  | "FACEBOOK"
  | "LINKEDIN"
  | "TWITTER"
  | "TIKTOK"
  | "OTHER";
export type ContentType =
  | "REEL"
  | "POST"
  | "CAROUSEL"
  | "STORY"
  | "LONG_FORM"
  | "SHORT"
  | "OTHER";
export type ContentStage =
  | "IDEA"
  | "SCRIPT"
  | "SHOOT_PLANNED"
  | "SHOOTING"
  | "EDITING"
  | "CLIENT_REVIEW"
  | "APPROVED"
  | "SCHEDULED"
  | "PUBLISHED";
export type IncomeStatus = "PENDING" | "PAID";
export type PortfolioVisibility = "PRIVATE" | "PUBLIC";

export interface Tag {
  id: string;
  name: string;
  color: string | null;
}

export interface Client {
  id: string;
  businessName: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  industry: string | null;
  servicesPurchased: string | null;
  monthlyRetainer: number | null;
  contractStartDate: string | null;
  renewalDate: string | null;
  status: ClientStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { projects: number };
}

export interface ClientNote {
  id: string;
  content: string;
  createdAt: string;
  clientId: string;
}

export interface ClientDocument {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  clientId: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  clientId: string | null;
  client?: Client | null;
  _count?: { tasks: number };
}

export interface ContentItem {
  id: string;
  title: string;
  platform: ContentPlatform;
  type: ContentType;
  stage: ContentStage;
  stageUpdatedAt: string;
  dueDate: string | null;
  scheduledDate: string | null;
  scriptUrl: string | null;
  rawFootageUrl: string | null;
  finalExportUrl: string | null;
  notes: string | null;
  isPortfolio: boolean;
  portfolioVisibility: PortfolioVisibility;
  createdAt: string;
  updatedAt: string;
  clientId: string | null;
  client: Client | null;
}

export interface IncomeEntry {
  id: string;
  description: string | null;
  amount: number;
  expectedDate: string;
  receivedDate: string | null;
  status: IncomeStatus;
  isRetainer: boolean;
  createdAt: string;
  updatedAt: string;
  clientId: string | null;
  client: Client | null;
  projectId: string | null;
  project: Project | null;
}

export interface ExpenseEntry {
  id: string;
  category: string;
  amount: number;
  date: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  completedAt: string | null;
  recurrenceRule: RecurrenceRule;
  recurrenceEndDate: string | null;
  createdAt: string;
  updatedAt: string;
  projectId: string | null;
  project: Project | null;
  tags: { tag: Tag }[];
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  REVIEW: "Review",
  DONE: "Done",
};

export const TASK_STATUSES: TaskStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "REVIEW",
  "DONE",
];

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const TASK_PRIORITIES: TaskPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "URGENT",
];

export const RECURRENCE_LABELS: Record<RecurrenceRule, string> = {
  NONE: "Does not repeat",
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
};

export const RECURRENCE_RULES: RecurrenceRule[] = [
  "NONE",
  "DAILY",
  "WEEKLY",
  "MONTHLY",
];

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  ONBOARDING: "Onboarding",
  ACTIVE: "Active",
  PAUSED: "Paused",
  CHURNED: "Churned",
};

export const CLIENT_STATUSES: ClientStatus[] = [
  "ONBOARDING",
  "ACTIVE",
  "PAUSED",
  "CHURNED",
];

export const CONTENT_PLATFORM_LABELS: Record<ContentPlatform, string> = {
  INSTAGRAM: "Instagram",
  YOUTUBE: "YouTube",
  FACEBOOK: "Facebook",
  LINKEDIN: "LinkedIn",
  TWITTER: "X / Twitter",
  TIKTOK: "TikTok",
  OTHER: "Other",
};

export const CONTENT_PLATFORMS: ContentPlatform[] = [
  "INSTAGRAM",
  "YOUTUBE",
  "FACEBOOK",
  "LINKEDIN",
  "TWITTER",
  "TIKTOK",
  "OTHER",
];

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  REEL: "Reel",
  POST: "Post",
  CAROUSEL: "Carousel",
  STORY: "Story",
  LONG_FORM: "Long-form",
  SHORT: "Short",
  OTHER: "Other",
};

export const CONTENT_TYPES: ContentType[] = [
  "REEL",
  "POST",
  "CAROUSEL",
  "STORY",
  "LONG_FORM",
  "SHORT",
  "OTHER",
];

export const CONTENT_STAGE_LABELS: Record<ContentStage, string> = {
  IDEA: "Idea",
  SCRIPT: "Script",
  SHOOT_PLANNED: "Shoot Planned",
  SHOOTING: "Shooting",
  EDITING: "Editing",
  CLIENT_REVIEW: "Client Review",
  APPROVED: "Approved",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
};

export const CONTENT_STAGES: ContentStage[] = [
  "IDEA",
  "SCRIPT",
  "SHOOT_PLANNED",
  "SHOOTING",
  "EDITING",
  "CLIENT_REVIEW",
  "APPROVED",
  "SCHEDULED",
  "PUBLISHED",
];

export const INCOME_STATUS_LABELS: Record<IncomeStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
};

export const INCOME_STATUSES: IncomeStatus[] = ["PENDING", "PAID"];

export const EXPENSE_CATEGORIES = [
  "Software & subscriptions",
  "Equipment",
  "Travel",
  "Marketing",
  "Contractor / freelancer",
  "Office & utilities",
  "Taxes",
  "Other",
];

export const PORTFOLIO_VISIBILITY_LABELS: Record<PortfolioVisibility, string> = {
  PRIVATE: "Private (not shown on public gallery)",
  PUBLIC: "Public (shown on public gallery)",
};

export const PORTFOLIO_VISIBILITIES: PortfolioVisibility[] = [
  "PRIVATE",
  "PUBLIC",
];
