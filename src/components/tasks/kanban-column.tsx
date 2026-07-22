"use client";

import { useDroppable } from "@dnd-kit/core";
import { Task, TaskStatus, TASK_STATUS_LABELS } from "@/lib/types";
import { TaskCard } from "@/components/tasks/task-card";
import { cn } from "@/lib/utils";

export function KanbanColumn({
  status,
  tasks,
  onTaskClick,
}: {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex min-w-[260px] flex-1 flex-col rounded-lg bg-muted/30">
      <div className="flex items-center justify-between px-3 py-2">
        <p className="text-sm font-semibold">{TASK_STATUS_LABELS[status]}</p>
        <span className="text-xs text-muted-foreground">{tasks.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 space-y-2 rounded-md p-2 transition-colors",
          isOver && "bg-primary/5 ring-2 ring-primary/30"
        )}
      >
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
          />
        ))}
      </div>
    </div>
  );
}
