"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Task, TaskStatus, TASK_STATUSES } from "@/lib/types";
import { apiRequest } from "@/lib/fetcher";
import { KanbanColumn } from "@/components/tasks/kanban-column";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";

export function TaskKanbanView({
  tasks,
  onChanged,
}: {
  tasks: Task[];
  onChanged: () => void;
}) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    try {
      await apiRequest(`/api/tasks/${taskId}`, "PATCH", {
        status: newStatus,
      });
      onChanged();
    } catch {
      toast.error("Failed to move task");
    }
  }

  return (
    <>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {TASK_STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasks.filter((t) => t.status === status)}
              onTaskClick={setEditingTask}
            />
          ))}
        </div>
      </DndContext>

      <TaskFormDialog
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        task={editingTask}
        onSaved={onChanged}
      />
    </>
  );
}
