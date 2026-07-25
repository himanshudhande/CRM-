import type { UserRole } from "@/lib/types";

export const MODULES = [
  "dashboard",
  "tasks",
  "projects",
  "clients",
  "content",
  "finance",
  "reports",
  "portfolio",
  "team",
] as const;

export type Module = (typeof MODULES)[number];

const PRODUCTION_ROLES: UserRole[] = ["EDITOR", "GRAPHIC_DESIGNER", "CAMERAMAN"];

const MODULE_ACCESS: Record<Module, UserRole[]> = {
  dashboard: ["OWNER", "SOCIAL_MEDIA_MANAGER", "OPS_MANAGER", "TASK_STAFF", ...PRODUCTION_ROLES],
  tasks: ["OWNER", "SOCIAL_MEDIA_MANAGER", "OPS_MANAGER", "TASK_STAFF", ...PRODUCTION_ROLES],
  projects: ["OWNER", "SOCIAL_MEDIA_MANAGER", "OPS_MANAGER"],
  clients: ["OWNER", "SOCIAL_MEDIA_MANAGER", "OPS_MANAGER"],
  content: ["OWNER", "SOCIAL_MEDIA_MANAGER", "OPS_MANAGER", ...PRODUCTION_ROLES],
  finance: ["OWNER"],
  reports: ["OWNER", "SOCIAL_MEDIA_MANAGER", "OPS_MANAGER"],
  portfolio: ["OWNER", "SOCIAL_MEDIA_MANAGER", "OPS_MANAGER"],
  team: ["OWNER"],
};

const MODULE_PATHS: Record<Module, string> = {
  dashboard: "/",
  tasks: "/tasks",
  projects: "/projects",
  clients: "/clients",
  content: "/content",
  finance: "/finance",
  reports: "/reports",
  portfolio: "/portfolio",
  team: "/team",
};

export function canAccessModule(role: UserRole, mod: Module): boolean {
  return MODULE_ACCESS[mod].includes(role);
}

export function moduleForPath(pathname: string): Module | null {
  if (pathname === "/") return "dashboard";
  const match = (Object.entries(MODULE_PATHS) as [Module, string][]).find(
    ([, path]) => path !== "/" && pathname.startsWith(path)
  );
  return match ? match[0] : null;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  OWNER: "Owner",
  STAFF: "Staff",
  SOCIAL_MEDIA_MANAGER: "Social Media Manager",
  TASK_STAFF: "Task Staff",
  OPS_MANAGER: "Ops Manager",
  EDITOR: "Editor",
  GRAPHIC_DESIGNER: "Graphic Designer",
  CAMERAMAN: "Cameraman",
};
