"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { toast } from "sonner";
import { fetcher, apiRequest } from "@/lib/fetcher";
import { Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectFormDialog } from "@/components/projects/project-form-dialog";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function ProjectsPage() {
  const { data: projects, mutate, isLoading } = useSWR<Project[]>(
    "/api/projects",
    fetcher
  );
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  async function handleDelete(id: string) {
    try {
      await apiRequest(`/api/projects/${id}`, "DELETE");
      toast.success("Project deleted");
      mutate();
    } catch {
      toast.error("Failed to delete project");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Group tasks by client, channel, or shoot.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="size-4" />
          New project
        </Button>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading projects…</p>
      )}

      {projects && projects.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No projects yet. Create one to start grouping tasks.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects?.map((project) => (
          <Card key={project.id} className="relative overflow-hidden">
            <div
              className="absolute inset-x-0 top-0 h-1.5"
              style={{ backgroundColor: project.color ?? "#3b82f6" }}
            />
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">
                  <Link
                    href={`/projects/${project.id}`}
                    className="hover:underline"
                  >
                    {project.name}
                  </Link>
                </CardTitle>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditing(project)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <ConfirmDelete
                    title="Delete project?"
                    description={`This will delete "${project.name}". Tasks in this project will be unassigned, not deleted.`}
                    onConfirm={() => handleDelete(project.id)}
                  >
                    <Button variant="ghost" size="icon">
                      <Trash2 className="size-4" />
                    </Button>
                  </ConfirmDelete>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {project.client && (
                <Link href={`/clients/${project.client.id}`}>
                  <Badge variant="secondary" className="mb-2">
                    {project.client.businessName}
                  </Badge>
                </Link>
              )}
              {project.description && (
                <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                  {project.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {project._count?.tasks ?? 0} task
                {project._count?.tasks === 1 ? "" : "s"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <ProjectFormDialog
        open={creating}
        onOpenChange={setCreating}
        onSaved={() => mutate()}
      />
      <ProjectFormDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        project={editing}
        onSaved={() => mutate()}
      />
    </div>
  );
}
