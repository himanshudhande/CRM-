"use client";

import { useDroppable } from "@dnd-kit/core";
import { ContentItem, ContentStage, CONTENT_STAGE_LABELS } from "@/lib/types";
import { ContentCard } from "@/components/content/content-card";
import { cn } from "@/lib/utils";

export function ContentKanbanColumn({
  stage,
  items,
  onItemClick,
}: {
  stage: ContentStage;
  items: ContentItem[];
  onItemClick: (item: ContentItem) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div className="flex min-w-[240px] flex-1 flex-col rounded-lg bg-muted/30">
      <div className="flex items-center justify-between px-3 py-2">
        <p className="text-sm font-semibold">{CONTENT_STAGE_LABELS[stage]}</p>
        <span className="text-xs text-muted-foreground">{items.length}</span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 space-y-2 rounded-md p-2 transition-colors",
          isOver && "bg-primary/5 ring-2 ring-primary/30"
        )}
      >
        {items.map((item) => (
          <ContentCard
            key={item.id}
            item={item}
            onClick={() => onItemClick(item)}
          />
        ))}
      </div>
    </div>
  );
}
