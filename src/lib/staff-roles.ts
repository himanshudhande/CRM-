export type StaffRole =
  | "SOCIAL_MEDIA_MANAGER"
  | "TASK_STAFF"
  | "OPS_MANAGER"
  | "EDITOR"
  | "GRAPHIC_DESIGNER"
  | "CAMERAMAN";

export const STAFF_ROLES: StaffRole[] = [
  "OPS_MANAGER",
  "SOCIAL_MEDIA_MANAGER",
  "EDITOR",
  "GRAPHIC_DESIGNER",
  "CAMERAMAN",
  "TASK_STAFF",
];

export const STAFF_ROLE_DESCRIPTIONS: Record<StaffRole, string> = {
  OPS_MANAGER:
    "Sees tasks, projects, clients, content, reports, and portfolio. No access to finance.",
  SOCIAL_MEDIA_MANAGER:
    "Sees tasks, projects, clients, content, reports, and portfolio. No access to finance.",
  EDITOR: "Sees only the dashboard, tasks, and content pipeline.",
  GRAPHIC_DESIGNER: "Sees only the dashboard, tasks, and content pipeline.",
  CAMERAMAN: "Sees only the dashboard, tasks, and content pipeline.",
  TASK_STAFF: "Sees only the dashboard and tasks assigned to them.",
};
