"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { fetcher, apiRequest } from "@/lib/fetcher";
import {
  IncomeEntry,
  Client,
  Project,
  IncomeStatus,
  INCOME_STATUSES,
  INCOME_STATUS_LABELS,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NO_CLIENT = "__none__";
const NO_PROJECT = "__none__";

export function IncomeFormDialog({
  open,
  onOpenChange,
  entry,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: IncomeEntry | null;
  onSaved: () => void;
}) {
  const { data: clients } = useSWR<Client[]>("/api/clients", fetcher);
  const { data: projects } = useSWR<Project[]>("/api/projects", fetcher);

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [receivedDate, setReceivedDate] = useState("");
  const [status, setStatus] = useState<IncomeStatus>("PENDING");
  const [clientId, setClientId] = useState<string>(NO_CLIENT);
  const [projectId, setProjectId] = useState<string>(NO_PROJECT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (entry) {
      setDescription(entry.description ?? "");
      setAmount(String(entry.amount));
      setExpectedDate(entry.expectedDate.slice(0, 10));
      setReceivedDate(entry.receivedDate ? entry.receivedDate.slice(0, 10) : "");
      setStatus(entry.status);
      setClientId(entry.clientId ?? NO_CLIENT);
      setProjectId(entry.projectId ?? NO_PROJECT);
    } else {
      setDescription("");
      setAmount("");
      setExpectedDate(new Date().toISOString().slice(0, 10));
      setReceivedDate("");
      setStatus("PENDING");
      setClientId(NO_CLIENT);
      setProjectId(NO_PROJECT);
    }
  }, [open, entry]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !expectedDate) return;

    setSaving(true);
    try {
      const payload = {
        description: description.trim() || null,
        amount: Number(amount),
        expectedDate: new Date(expectedDate).toISOString(),
        receivedDate: receivedDate
          ? new Date(receivedDate).toISOString()
          : null,
        status,
        clientId: clientId === NO_CLIENT ? null : clientId,
        projectId: projectId === NO_PROJECT ? null : projectId,
      };

      if (entry) {
        await apiRequest(`/api/income/${entry.id}`, "PATCH", payload);
        toast.success("Income entry updated");
      } else {
        await apiRequest("/api/income", "POST", payload);
        toast.success("Income entry created");
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{entry ? "Edit income" : "New income"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g. August retainer, wedding shoot balance"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus((v ?? "PENDING") as IncomeStatus)}
              >
                <SelectTrigger>
                  <SelectValue>
                    {(v: IncomeStatus) => INCOME_STATUS_LABELS[v]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {INCOME_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {INCOME_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expectedDate">Expected date</Label>
              <Input
                id="expectedDate"
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receivedDate">Received date</Label>
              <Input
                id="receivedDate"
                type="date"
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                        ? "No client"
                        : (clients?.find((c) => c.id === v)?.businessName ??
                          v)
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
              <Label>Project</Label>
              <Select
                value={projectId}
                onValueChange={(v) => setProjectId(v ?? NO_PROJECT)}
              >
                <SelectTrigger>
                  <SelectValue>
                    {(v: string) =>
                      v === NO_PROJECT
                        ? "No project"
                        : (projects?.find((p) => p.id === v)?.name ?? v)
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PROJECT}>No project</SelectItem>
                  {projects?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              {saving ? "Saving…" : entry ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
