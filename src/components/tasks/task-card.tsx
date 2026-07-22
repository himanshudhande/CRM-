"use client";

import { useDraggable } from "@dnd-kit/core";
import { Task } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { formatDate, isOverdue } from "@/lib/dates";
import { cn } from "@/lib/utils";

export function TaskCard({
  task,
  onClick,
}: {
  task: Task;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: task.id });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={cn(
        "cursor-grab touch-none py-3 active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
    >
      <CardContent className="space-y-2 px-3">
        <p className="text-sm font-medium leading-snug">{task.title}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={task.priority} />
          {task.dueDate && (
            <span
              className={cn(
                "text-xs text-muted-foreground",
                isOverdue(task.dueDate, task.status === "DONE") &&
                  "font-medium text-destructive"
              )}
            >
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
        {task.project && (
          <p className="truncate text-xs text-muted-foreground">
            {task.project.name}
          </p>
        )}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.map(({ tag }) => (
              <Badge key={tag.id} variant="outline" className="text-[10px]">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
