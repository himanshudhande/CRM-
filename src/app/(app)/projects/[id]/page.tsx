"use client";

import { use, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Task, Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskListView } from "@/components/tasks/task-list-view";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { ArrowLeft, Plus } from "lucide-react";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: projects } = useSWR<Project[]>("/api/projects", fetcher);
  const { data: tasks, mutate, isLoading } = useSWR<Task[]>(
    `/api/tasks?projectId=${id}`,
    fetcher
  );
  const [creating, setCreating] = useState(false);

  const project = projects?.find((p) => p.id === id);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/projects"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          All projects
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {project?.name ?? "Project"}
            </h1>
            {project?.client && (
              <Link href={`/clients/${project.client.id}`}>
                <Badge variant="secondary" className="mt-1">
                  {project.client.businessName}
                </Badge>
              </Link>
            )}
            {project?.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {project.description}
              </p>
            )}
          </div>
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            New task
          </Button>
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading tasks…</p>
      )}

      {tasks && <TaskListView tasks={tasks} onChanged={() => mutate()} />}

      <TaskFormDialog
        open={creating}
        onOpenChange={setCreating}
        defaultProjectId={id}
        onSaved={() => mutate()}
      />
    </div>
  );
}
