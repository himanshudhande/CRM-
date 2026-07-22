"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { ContentItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentKanbanView } from "@/components/content/content-kanban-view";
import { ContentCalendarView } from "@/components/content/content-calendar-view";
import { ContentFormDialog } from "@/components/content/content-form-dialog";
import { Plus } from "lucide-react";

export default function ContentPage() {
  const { data: items, mutate, isLoading } = useSWR<ContentItem[]>(
    "/api/content",
    fetcher
  );
  const [view, setView] = useState<"board" | "calendar">("board");
  const [creating, setCreating] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Content Pipeline
          </h1>
          <p className="text-sm text-muted-foreground">
            From idea to published, for your channels and client work.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
            <TabsList>
              <TabsTrigger value="board">Board</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            New content
          </Button>
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading content…</p>
      )}

      {items &&
        (view === "board" ? (
          <ContentKanbanView items={items} onChanged={() => mutate()} />
        ) : (
          <ContentCalendarView items={items} onChanged={() => mutate()} />
        ))}

      <ContentFormDialog
        open={creating}
        onOpenChange={setCreating}
        onSaved={() => mutate()}
      />
    </div>
  );
}
