"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { fetcher, apiRequest } from "@/lib/fetcher";
import {
  ContentItem,
  Client,
  ContentPlatform,
  ContentType,
  ContentStage,
  PortfolioVisibility,
  CONTENT_PLATFORMS,
  CONTENT_PLATFORM_LABELS,
  CONTENT_TYPES,
  CONTENT_TYPE_LABELS,
  CONTENT_STAGES,
  CONTENT_STAGE_LABELS,
  PORTFOLIO_VISIBILITIES,
  PORTFOLIO_VISIBILITY_LABELS,
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
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDelete } from "@/components/confirm-delete";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";

const NO_CLIENT = "__none__";

export function ContentFormDialog({
  open,
  onOpenChange,
  item,
  defaultStage,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: ContentItem | null;
  defaultStage?: ContentStage;
  onSaved: () => void;
}) {
  const { data: clients } = useSWR<Client[]>("/api/clients", fetcher);

  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState<ContentPlatform>("INSTAGRAM");
  const [type, setType] = useState<ContentType>("REEL");
  const [stage, setStage] = useState<ContentStage>("IDEA");
  const [clientId, setClientId] = useState<string>(NO_CLIENT);
  const [dueDate, setDueDate] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scriptUrl, setScriptUrl] = useState("");
  const [rawFootageUrl, setRawFootageUrl] = useState("");
  const [finalExportUrl, setFinalExportUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [isPortfolio, setIsPortfolio] = useState(false);
  const [portfolioVisibility, setPortfolioVisibility] =
    useState<PortfolioVisibility>("PRIVATE");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (item) {
      setTitle(item.title);
      setPlatform(item.platform);
      setType(item.type);
      setStage(item.stage);
      setClientId(item.clientId ?? NO_CLIENT);
      setDueDate(item.dueDate ? item.dueDate.slice(0, 10) : "");
      setScheduledDate(
        item.scheduledDate ? item.scheduledDate.slice(0, 10) : ""
      );
      setScriptUrl(item.scriptUrl ?? "");
      setRawFootageUrl(item.rawFootageUrl ?? "");
      setFinalExportUrl(item.finalExportUrl ?? "");
      setNotes(item.notes ?? "");
      setIsPortfolio(item.isPortfolio);
      setPortfolioVisibility(item.portfolioVisibility);
    } else {
      setTitle("");
      setPlatform("INSTAGRAM");
      setType("REEL");
      setStage(defaultStage ?? "IDEA");
      setClientId(NO_CLIENT);
      setDueDate("");
      setScheduledDate("");
      setScriptUrl("");
      setRawFootageUrl("");
      setFinalExportUrl("");
      setNotes("");
      setIsPortfolio(false);
      setPortfolioVisibility("PRIVATE");
    }
  }, [open, item, defaultStage]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        platform,
        type,
        stage,
        clientId: clientId === NO_CLIENT ? null : clientId,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        scheduledDate: scheduledDate
          ? new Date(scheduledDate).toISOString()
          : null,
        scriptUrl: scriptUrl.trim() || null,
        rawFootageUrl: rawFootageUrl.trim() || null,
        finalExportUrl: finalExportUrl.trim() || null,
        notes: notes.trim() || null,
        isPortfolio: stage === "PUBLISHED" ? isPortfolio : false,
        portfolioVisibility,
      };

      if (item) {
        await apiRequest(`/api/content/${item.id}`, "PATCH", payload);
        toast.success("Content item updated");
      } else {
        await apiRequest("/api/content", "POST", payload);
        toast.success("Content item created");
      }

      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!item) return;
    try {
      await apiRequest(`/api/content/${item.id}`, "DELETE");
      toast.success("Content item deleted");
      onSaved();
      onOpenChange(false);
    } catch {
      toast.error("Failed to delete content item");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {item ? "Edit content item" : "New content item"}
          </DialogTitle>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Platform</Label>
              <Select
                value={platform}
                onValueChange={(v) => setPlatform(v as ContentPlatform)}
              >
                <SelectTrigger>
                  <SelectValue>
                    {(v: ContentPlatform) => CONTENT_PLATFORM_LABELS[v]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {CONTENT_PLATFORM_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as ContentType)}
              >
                <SelectTrigger>
                  <SelectValue>
                    {(v: ContentType) => CONTENT_TYPE_LABELS[v]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {CONTENT_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stage</Label>
              <Select
                value={stage}
                onValueChange={(v) => setStage(v as ContentStage)}
              >
                <SelectTrigger>
                  <SelectValue>
                    {(v: ContentStage) => CONTENT_STAGE_LABELS[v]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_STAGES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {CONTENT_STAGE_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Client</Label>
              <Select
                value={clientId}
                onValueChange={(v) => setClientId(v ?? NO_CLIENT)}
              >
                <SelectTrigger>
                  <SelectValue>
                    {(v: string) =>
                      v === NO_CLIENT
                        ? "My own channel"
                        : (clients?.find((c) => c.id === v)?.businessName ??
                          v)
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CLIENT}>My own channel</SelectItem>
                  {clients?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.businessName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due date (this stage)</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled / publish date</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scriptUrl">Script doc link</Label>
            <Input
              id="scriptUrl"
              type="url"
              placeholder="https://docs.google.com/…"
              value={scriptUrl}
              onChange={(e) => setScriptUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rawFootageUrl">Raw footage folder link</Label>
            <Input
              id="rawFootageUrl"
              type="url"
              placeholder="https://drive.google.com/…"
              value={rawFootageUrl}
              onChange={(e) => setRawFootageUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="finalExportUrl">Final export link</Label>
            <Input
              id="finalExportUrl"
              type="url"
              placeholder="https://drive.google.com/…"
              value={finalExportUrl}
              onChange={(e) => setFinalExportUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {stage === "PUBLISHED" && (
            <div className="space-y-3 rounded-md border p-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isPortfolio"
                  checked={isPortfolio}
                  onCheckedChange={(checked) => setIsPortfolio(!!checked)}
                />
                <Label htmlFor="isPortfolio" className="font-normal">
                  Add to portfolio
                </Label>
              </div>
              {isPortfolio && (
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <Select
                    value={portfolioVisibility}
                    onValueChange={(v) =>
                      setPortfolioVisibility((v ?? "PRIVATE") as PortfolioVisibility)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(v: PortfolioVisibility) =>
                          PORTFOLIO_VISIBILITY_LABELS[v]
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {PORTFOLIO_VISIBILITIES.map((v) => (
                        <SelectItem key={v} value={v}>
                          {PORTFOLIO_VISIBILITY_LABELS[v]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            {item ? (
              <ConfirmDelete
                title="Delete content item?"
                description={`This will permanently delete "${item.title}".`}
                onConfirm={handleDelete}
              >
                <Button type="button" variant="ghost" size="icon">
                  <Trash2 className="size-4" />
                </Button>
              </ConfirmDelete>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : item ? "Save changes" : "Create"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
