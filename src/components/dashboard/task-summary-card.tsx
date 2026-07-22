"use client";

import Link from "next/link";
import { Task } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { formatDate } from "@/lib/dates";
import { cn } from "@/lib/utils";

export function TaskSummaryCard({
  title,
  tasks,
  emptyLabel,
  tone,
}: {
  title: string;
  tasks: Task[];
  emptyLabel: string;
  tone?: "default" | "destructive";
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Badge
          variant={tone === "destructive" ? "destructive" : "secondary"}
        >
          {tasks.length}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.length === 0 && (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        )}
        {tasks.slice(0, 6).map((task) => (
          <Link
            key={task.id}
            href="/tasks"
            className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 -mx-2 text-sm hover:bg-muted"
          >
            <span
              className={cn(
                "truncate",
                tone === "destructive" && "font-medium text-destructive"
              )}
            >
              {task.title}
            </span>
            <span className="flex shrink-0 items-center gap-2">
              {task.dueDate && (
                <span className="text-xs text-muted-foreground">
                  {formatDate(task.dueDate)}
                </span>
              )}
              <PriorityBadge priority={task.priority} />
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
