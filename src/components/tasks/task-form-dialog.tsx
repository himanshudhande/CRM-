"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { fetcher, apiRequest } from "@/lib/fetcher";
import {
  Task,
  Project,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  RECURRENCE_RULES,
  RECURRENCE_LABELS,
  TaskStatus,
  TaskPriority,
  RecurrenceRule,
} from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagPicker } from "@/components/tasks/tag-picker";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  defaultProjectId?: string | null;
  defaultStatus?: TaskStatus;
  onSaved: () => void;
}

const NO_PROJECT = "__none__";

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  defaultProjectId,
  defaultStatus,
  onSaved,
}: TaskFormDialogProps) {
  const { data: projects } = useSWR<Project[]>("/api/projects", fetcher);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule>("NONE");
  const [projectId, setProjectId] = useState<string>(NO_PROJECT);
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
      setRecurrenceRule(task.recurrenceRule);
      setProjectId(task.projectId ?? NO_PROJECT);
      setTagIds(task.tags.map((t) => t.tag.id));
    } else {
      setTitle("");
      setDescription("");
      setStatus(defaultStatus ?? "TODO");
      setPriority("MEDIUM");
      setDueDate("");
      setRecurrenceRule("NONE");
      setProjectId(defaultProjectId ?? NO_PROJECT);
      setTagIds([]);
    }
  }, [open, task, defaultProjectId, defaultStatus]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        recurrenceRule,
        projectId: projectId === NO_PROJECT ? null : projectId,
        tagIds,
      };

      if (task) {
        await apiRequest(`/api/tasks/${task.id}`, "PATCH", payload);
        toast.success("Task updated");
      } else {
        await apiRequest("/api/tasks", "POST", payload);
        toast.success("Task created");
      }

      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as TaskStatus)}
              >
                <SelectTrigger>
                  <SelectValue>
                    {(v: TaskStatus) => TASK_STATUS_LABELS[v]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {TASK_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as TaskPriority)}
              >
                <SelectTrigger>
                  <SelectValue>
                    {(v: TaskPriority) => TASK_PRIORITY_LABELS[v]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TASK_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {TASK_PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Repeats</Label>
              <Select
                value={recurrenceRule}
                onValueChange={(v) => setRecurrenceRule(v as RecurrenceRule)}
              >
                <SelectTrigger>
                  <SelectValue>
                    {(v: RecurrenceRule) => RECURRENCE_LABELS[v]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {RECURRENCE_RULES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {RECURRENCE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Project</Label>
            <Select
              value={projectId}
              onValueChange={(v) => setProjectId(v ?? NO_PROJECT)}
            >
              <SelectTrigger>
                <SelectValue>
                  {(v: string) =>
                    v === NO_PROJECT
                      ? "No project"
                      : (projects?.find((p) => p.id === v)?.name ?? v)
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_PROJECT}>No project</SelectItem>
                {projects?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <TagPicker selectedIds={tagIds} onChange={setTagIds} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : task ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
