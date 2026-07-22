"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  Building2,
  Clapperboard,
  Wallet,
  Images,
  FileText,
  LogOut,
  Menu,
} from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/clients", label: "Clients", icon: Building2 },
  { href: "/content", label: "Content", icon: Clapperboard },
  { href: "/finance", label: "Finance", icon: Wallet },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/portfolio", label: "Portfolio", icon: Images },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center justify-between border-b px-4 py-3 md:hidden">
      <p className="text-sm font-semibold">Hexamad Digital</p>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon">
              <Menu className="size-5" />
            </Button>
          }
        />
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="px-4 py-5">
            <SheetTitle className="text-left">Hexamad Digital</SheetTitle>
          </SheetHeader>
          <nav className="flex-1 space-y-1 px-2">
            {links.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
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
          <div className="p-2">
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
        </SheetContent>
      </Sheet>
    </div>
  );
}
