"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Task, TASK_STATUS_LABELS } from "@/lib/types";
import { apiRequest } from "@/lib/fetcher";
import { formatDate, isOverdue } from "@/lib/dates";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function TaskListView({
  tasks,
  onChanged,
}: {
  tasks: Task[];
  onChanged: () => void;
}) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  async function toggleDone(task: Task) {
    try {
      await apiRequest(`/api/tasks/${task.id}`, "PATCH", {
        status: task.status === "DONE" ? "TODO" : "DONE",
      });
      onChanged();
    } catch {
      toast.error("Failed to update task");
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiRequest(`/api/tasks/${id}`, "DELETE");
      toast.success("Task deleted");
      onChanged();
    } catch {
      toast.error("Failed to delete task");
    }
  }

  if (tasks.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No tasks yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" />
            <TableHead>Title</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due date</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell>
                <Checkbox
                  checked={task.status === "DONE"}
                  onCheckedChange={() => toggleDone(task)}
                />
              </TableCell>
              <TableCell
                className={cn(
                  "font-medium",
                  task.status === "DONE" &&
                    "text-muted-foreground line-through"
                )}
              >
                {task.title}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {task.project?.name ?? "—"}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {TASK_STATUS_LABELS[task.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <PriorityBadge priority={task.priority} />
              </TableCell>
              <TableCell
                className={cn(
                  "text-sm",
                  isOverdue(task.dueDate, task.status === "DONE") &&
                    "font-medium text-destructive"
                )}
              >
                {formatDate(task.dueDate) || "—"}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {task.tags.map(({ tag }) => (
                    <Badge key={tag.id} variant="outline">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingTask(task)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <ConfirmDelete
                    title="Delete task?"
                    description={`This will permanently delete "${task.title}".`}
                    onConfirm={() => handleDelete(task.id)}
                  >
                    <Button variant="ghost" size="icon">
                      <Trash2 className="size-4" />
                    </Button>
                  </ConfirmDelete>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TaskFormDialog
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        task={editingTask}
        onSaved={onChanged}
      />
    </div>
  );
}
