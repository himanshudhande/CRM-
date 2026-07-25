"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { fetcher, apiRequest } from "@/lib/fetcher";
import { TaskComment } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

export function TaskComments({ taskId }: { taskId: string }) {
  const { data: comments, mutate, isLoading } = useSWR<TaskComment[]>(
    `/api/tasks/${taskId}/comments`,
    fetcher
  );
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  async function handlePost() {
    if (!body.trim()) return;
    setPosting(true);
    try {
      await apiRequest(`/api/tasks/${taskId}/comments`, "POST", {
        body: body.trim(),
      });
      setBody("");
      mutate();
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="space-y-3">
      {isLoading && (
        <p className="text-xs text-muted-foreground">Loading comments…</p>
      )}

      {comments && comments.length > 0 && (
        <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-2">
          {comments.map((c) => (
            <div key={c.id} className="text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {c.author.name ?? c.author.email}
                </span>
                <span className="text-xs text-muted-foreground">
                  {ROLE_LABELS[c.author.role]}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(c.createdAt), "MMM d, h:mm a")}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-muted-foreground">
                {c.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {comments && comments.length === 0 && (
        <p className="text-xs text-muted-foreground">No comments yet.</p>
      )}

      <div className="flex gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder='e.g. "Changes needed" or "Approved"'
          rows={2}
          className="flex-1"
        />
        <Button
          type="button"
          size="sm"
          disabled={posting || !body.trim()}
          onClick={handlePost}
        >
          {posting ? "Posting…" : "Post"}
        </Button>
      </div>
    </div>
  );
}
