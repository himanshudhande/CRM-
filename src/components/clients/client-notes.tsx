"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { fetcher, apiRequest } from "@/lib/fetcher";
import { ClientNote } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";

export function ClientNotes({ clientId }: { clientId: string }) {
  const { data: notes, mutate, isLoading } = useSWR<ClientNote[]>(
    `/api/clients/${clientId}/notes`,
    fetcher
  );
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSaving(true);
    try {
      await apiRequest(`/api/clients/${clientId}/notes`, "POST", {
        content: content.trim(),
      });
      setContent("");
      mutate();
    } catch {
      toast.error("Failed to add note");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiRequest(`/api/notes/${id}`, "DELETE");
      mutate();
    } catch {
      toast.error("Failed to delete note");
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="space-y-2">
        <Textarea
          placeholder="Log a call summary, meeting note, or update…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />
        <Button type="submit" size="sm" disabled={saving || !content.trim()}>
          {saving ? "Adding…" : "Add note"}
        </Button>
      </form>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}

      {notes && notes.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No communication logged yet.
        </p>
      )}

      <div className="space-y-3">
        {notes?.map((note) => (
          <div
            key={note.id}
            className="flex items-start justify-between gap-3 rounded-md border p-3"
          >
            <div>
              <p className="text-sm whitespace-pre-wrap">{note.content}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
            <ConfirmDelete
              title="Delete note?"
              description="This will permanently delete this log entry."
              onConfirm={() => handleDelete(note.id)}
            >
              <Button variant="ghost" size="icon" className="shrink-0">
                <Trash2 className="size-4" />
              </Button>
            </ConfirmDelete>
          </div>
        ))}
      </div>
    </div>
  );
}
