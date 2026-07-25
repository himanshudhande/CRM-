"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { canAccessModule, type Module } from "@/lib/permissions";
import { AttendanceWidget } from "@/components/attendance/attendance-widget";
import {
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  Building2,
  Target,
  Clapperboard,
  Wallet,
  Images,
  FileText,
  Users,
  LogOut,
} from "lucide-react";

const links: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  module: Module;
}[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
  { href: "/tasks", label: "Tasks", icon: ListTodo, module: "tasks" },
  { href: "/projects", label: "Projects", icon: FolderKanban, module: "projects" },
  { href: "/clients", label: "Clients", icon: Building2, module: "clients" },
  { href: "/leads", label: "Leads", icon: Target, module: "leads" },
  { href: "/content", label: "Content", icon: Clapperboard, module: "content" },
  { href: "/finance", label: "Finance", icon: Wallet, module: "finance" },
  { href: "/reports", label: "Reports", icon: FileText, module: "reports" },
  { href: "/portfolio", label: "Portfolio", icon: Images, module: "portfolio" },
  { href: "/team", label: "Team", icon: Users, module: "team" },
];

export function NavSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const visibleLinks = role
    ? links.filter((link) => canAccessModule(role, link.module))
    : [];

  return (
    <div className="flex h-full w-56 flex-col border-r bg-muted/20">
      <div className="px-4 py-5">
        <p className="text-sm font-semibold tracking-tight">
          Hexamad Digital
        </p>
        <p className="text-xs text-muted-foreground">Ops Portal</p>
      </div>
      <nav className="flex-1 space-y-1 px-2">
        {visibleLinks.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-2 border-t p-2">
        <AttendanceWidget />
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="size-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
