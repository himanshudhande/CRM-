import { Badge } from "@/components/ui/badge";
import { LeadStatus, LEAD_STATUS_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<LeadStatus, string> = {
  NEW: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  CONTACTED: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  FOLLOW_UP:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  MEETING_SCHEDULED:
    "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  WON: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  LOST: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", statusStyles[status])}
    >
      {LEAD_STATUS_LABELS[status]}
    </Badge>
  );
}
