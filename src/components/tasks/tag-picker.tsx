"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher, apiRequest } from "@/lib/fetcher";
import { Tag } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function TagPicker({
  selectedIds,
  onChange,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const { data: tags, mutate } = useSWR<Tag[]>("/api/tags", fetcher);
  const [newTagName, setNewTagName] = useState("");

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((t) => t !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  }

  async function handleCreateTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" || !newTagName.trim()) return;
    e.preventDefault();
    const tag = await apiRequest<Tag>("/api/tags", "POST", {
      name: newTagName.trim(),
    });
    setNewTagName("");
    await mutate();
    onChange([...selectedIds, tag.id]);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {tags?.map((tag) => (
          <Badge
            key={tag.id}
            variant={selectedIds.includes(tag.id) ? "default" : "outline"}
            className={cn("cursor-pointer select-none")}
            onClick={() => toggle(tag.id)}
          >
            {tag.name}
          </Badge>
        ))}
      </div>
      <Input
        placeholder="Type a tag name and press Enter to add"
        value={newTagName}
        onChange={(e) => setNewTagName(e.target.value)}
        onKeyDown={handleCreateTag}
      />
    </div>
  );
}
