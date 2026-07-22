"use client";

import { useDraggable } from "@dnd-kit/core";
import { ContentItem } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { PlatformBadge, TypeBadge } from "@/components/content/content-badges";
import { formatDate, isOverdue } from "@/lib/dates";
import { cn } from "@/lib/utils";

export function ContentCard({
  item,
  onClick,
}: {
  item: ContentItem;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: item.id });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={cn(
        "cursor-grab touch-none py-3 active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
    >
      <CardContent className="space-y-2 px-3">
        <p className="text-sm font-medium leading-snug">{item.title}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          <PlatformBadge platform={item.platform} />
          <TypeBadge type={item.type} />
        </div>
        {item.dueDate && (
          <p
            className={cn(
              "text-xs text-muted-foreground",
              isOverdue(item.dueDate, item.stage === "PUBLISHED") &&
                "font-medium text-destructive"
            )}
          >
            Due {formatDate(item.dueDate)}
          </p>
        )}
        {item.client && (
          <p className="truncate text-xs text-muted-foreground">
            {item.client.businessName}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
