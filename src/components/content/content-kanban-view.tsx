"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { ContentItem, ContentStage, CONTENT_STAGES } from "@/lib/types";
import { apiRequest } from "@/lib/fetcher";
import { ContentKanbanColumn } from "@/components/content/content-kanban-column";
import { ContentFormDialog } from "@/components/content/content-form-dialog";

export function ContentKanbanView({
  items,
  onChanged,
}: {
  items: ContentItem[];
  onChanged: () => void;
}) {
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const itemId = active.id as string;
    const newStage = over.id as ContentStage;
    const item = items.find((i) => i.id === itemId);
    if (!item || item.stage === newStage) return;

    try {
      await apiRequest(`/api/content/${itemId}`, "PATCH", {
        stage: newStage,
      });
      onChanged();
    } catch {
      toast.error("Failed to move content item");
    }
  }

  return (
    <>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {CONTENT_STAGES.map((stage) => (
            <ContentKanbanColumn
              key={stage}
              stage={stage}
              items={items.filter((i) => i.stage === stage)}
              onItemClick={setEditingItem}
            />
          ))}
        </div>
      </DndContext>

      <ContentFormDialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        item={editingItem}
        onSaved={onChanged}
      />
    </>
  );
}
