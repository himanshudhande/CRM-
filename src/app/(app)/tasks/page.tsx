"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskListView } from "@/components/tasks/task-list-view";
import { TaskKanbanView } from "@/components/tasks/task-kanban-view";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { Plus } from "lucide-react";

export default function TasksPage() {
  const { data: tasks, mutate, isLoading } = useSWR<Task[]>(
    "/api/tasks",
    fetcher
  );
  const [view, setView] = useState<"list" | "kanban">("kanban");
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            Everything on your plate, in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
            <TabsList>
              <TabsTrigger value="kanban">Board</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            New task
          </Button>
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading tasks…</p>
      )}

      {tasks &&
        (view === "kanban" ? (
          <TaskKanbanView tasks={tasks} onChanged={() => mutate()} />
        ) : (
          <TaskListView tasks={tasks} onChanged={() => mutate()} />
        ))}

      <TaskFormDialog
        open={creating}
        onOpenChange={setCreating}
        onSaved={() => mutate()}
      />
    </div>
  );
}
