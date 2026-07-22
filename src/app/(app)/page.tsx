"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Task } from "@/lib/types";
import { isOverdue, isDueToday, isDueThisWeek } from "@/lib/dates";
import { TaskSummaryCard } from "@/components/dashboard/task-summary-card";

export default function DashboardPage() {
  const { data: tasks, isLoading } = useSWR<Task[]>("/api/tasks", fetcher);

  const incomplete = tasks?.filter((t) => t.status !== "DONE") ?? [];
  const overdue = incomplete.filter((t) =>
    isOverdue(t.dueDate, t.status === "DONE")
  );
  const today = incomplete.filter((t) => isDueToday(t.dueDate));
  const thisWeek = incomplete.filter(
    (t) => isDueThisWeek(t.dueDate) && !isDueToday(t.dueDate)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Where things stand right now.
        </p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

      {tasks && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <TaskSummaryCard
            title="Overdue"
            tasks={overdue}
            emptyLabel="Nothing overdue. Nice."
            tone="destructive"
          />
          <TaskSummaryCard
            title="Due today"
            tasks={today}
            emptyLabel="Nothing due today."
          />
          <TaskSummaryCard
            title="Due this week"
            tasks={thisWeek}
            emptyLabel="Nothing else due this week."
          />
        </div>
      )}
    </div>
  );
}
