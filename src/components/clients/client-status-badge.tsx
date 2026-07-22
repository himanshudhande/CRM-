import { Badge } from "@/components/ui/badge";
import { ClientStatus, CLIENT_STATUS_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<ClientStatus, string> = {
  ONBOARDING: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  ACTIVE:
    "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  PAUSED:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  CHURNED: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", statusStyles[status])}
    >
      {CLIENT_STATUS_LABELS[status]}
    </Badge>
  );
}
