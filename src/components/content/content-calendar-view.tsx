"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
} from "date-fns";
import { ContentItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ContentFormDialog } from "@/components/content/content-form-dialog";
import { PlatformBadge } from "@/components/content/content-badges";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ContentCalendarView({
  items,
  onChanged,
}: {
  items: ContentItem[];
  onChanged: () => void;
}) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  const scheduledItems = useMemo(
    () => items.filter((i) => i.scheduledDate),
    [items]
  );

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{format(month, "MMMM yyyy")}</p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMonth((m) => subMonths(m, 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMonth(startOfMonth(new Date()))}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMonth((m) => addMonths(m, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[700px] grid-cols-7 gap-px rounded-md border bg-border">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="bg-muted/50 px-2 py-1.5 text-center text-xs font-medium text-muted-foreground"
            >
              {label}
            </div>
          ))}
          {days.map((day) => {
            const dayItems = scheduledItems.filter((i) =>
              isSameDay(new Date(i.scheduledDate!), day)
            );
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-24 bg-background p-1.5",
                  !isSameMonth(day, month) && "bg-muted/20"
                )}
              >
                <p
                  className={cn(
                    "mb-1 text-xs",
                    !isSameMonth(day, month) && "text-muted-foreground",
                    isToday(day) &&
                      "flex size-5 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground"
                  )}
                >
                  {format(day, "d")}
                </p>
                <div className="space-y-1">
                  {dayItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setEditingItem(item)}
                      className="block w-full truncate rounded px-1 py-0.5 text-left text-xs hover:bg-muted"
                    >
                      <span className="mr-1">
                        <PlatformBadge platform={item.platform} />
                      </span>
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ContentFormDialog
        open={!!editingItem}
        onOpenChange={(open) => !open && setEditingItem(null)}
        item={editingItem}
        onSaved={onChanged}
      />
    </div>
  );
}
