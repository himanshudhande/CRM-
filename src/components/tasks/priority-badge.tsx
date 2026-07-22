import { Badge } from "@/components/ui/badge";
import { TaskPriority, TASK_PRIORITY_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

const priorityStyles: Record<TaskPriority, string> = {
  LOW: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  MEDIUM: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  HIGH: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  URGENT: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", priorityStyles[priority])}
    >
      {TASK_PRIORITY_LABELS[priority]}
    </Badge>
  );
}
