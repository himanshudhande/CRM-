"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { apiRequest, fetcher } from "@/lib/fetcher";
import { Client, Project } from "@/lib/types";
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

const NO_CLIENT = "__none__";

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onSaved: () => void;
}) {
  const { data: clients } = useSWR<Client[]>("/api/clients", fetcher);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [clientId, setClientId] = useState<string>(NO_CLIENT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (project) {
      setName(project.name);
      setDescription(project.description ?? "");
      setColor(project.color ?? COLORS[0]);
      setClientId(project.clientId ?? NO_CLIENT);
    } else {
      setName("");
      setDescription("");
      setColor(COLORS[0]);
      setClientId(NO_CLIENT);
    }
  }, [open, project]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        color,
        clientId: clientId === NO_CLIENT ? null : clientId,
      };

      if (project) {
        await apiRequest(`/api/projects/${project.id}`, "PATCH", payload);
        toast.success("Project updated");
      } else {
        await apiRequest("/api/projects", "POST", payload);
        toast.success("Project created");
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{project ? "Edit project" : "New project"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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

          <div className="space-y-2">
            <Label>Client</Label>
            <Select
              value={clientId}
              onValueChange={(v) => setClientId(v ?? NO_CLIENT)}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(v: string) =>
                    v === NO_CLIENT
                      ? "No client"
                      : (clients?.find((c) => c.id === v)?.businessName ?? v)
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CLIENT}>No client</SelectItem>
                {clients?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.businessName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className="size-7 rounded-full ring-offset-2 transition-shadow"
                  style={{
                    backgroundColor: c,
                    boxShadow: color === c ? `0 0 0 2px ${c}` : "none",
                  }}
                  aria-label={c}
                />
              ))}
            </div>
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
              {saving ? "Saving…" : project ? "Save changes" : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
