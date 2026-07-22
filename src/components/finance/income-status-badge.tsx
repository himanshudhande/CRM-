import { Badge } from "@/components/ui/badge";
import { IncomeStatus } from "@/lib/types";
import { isOverdue } from "@/lib/dates";
import { cn } from "@/lib/utils";

export function IncomeStatusBadge({
  status,
  expectedDate,
}: {
  status: IncomeStatus;
  expectedDate: string;
}) {
  if (status === "PAID") {
    return (
      <Badge
        variant="outline"
        className="border-transparent bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
      >
        Paid
      </Badge>
    );
  }

  const overdue = isOverdue(expectedDate, false);

  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent",
        overdue
          ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
          : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
      )}
    >
      {overdue ? "Overdue" : "Pending"}
    </Badge>
  );
}
