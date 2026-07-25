"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { fetcher, apiRequest } from "@/lib/fetcher";
import { Lead } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { formatDate, isOverdue } from "@/lib/dates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeadStatusBadge } from "@/components/leads/lead-status-badge";
import { LeadFormDialog } from "@/components/leads/lead-form-dialog";
import { ConfirmDelete } from "@/components/confirm-delete";
import { cn } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function LeadsPage() {
  const { data: leads, mutate, isLoading } = useSWR<Lead[]>(
    "/api/leads",
    fetcher
  );
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);

  const openLeads = (leads ?? []).filter(
    (l) => l.status !== "WON" && l.status !== "LOST"
  );
  const weightedPipeline = openLeads.reduce(
    (sum, l) => sum + ((l.value ?? 0) * (l.probability ?? 0)) / 100,
    0
  );
  const wonValue = (leads ?? [])
    .filter((l) => l.status === "WON")
    .reduce((sum, l) => sum + (l.value ?? 0), 0);

  async function handleDelete(id: string) {
    try {
      await apiRequest(`/api/leads/${id}`, "DELETE");
      toast.success("Lead deleted");
      mutate();
    } catch {
      toast.error("Failed to delete lead");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground">
            Prospects and follow-ups, separate from active clients.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="size-4" />
          New lead
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="py-4">
            <p className="text-xs font-medium text-muted-foreground">
              Open leads
            </p>
            <p className="text-2xl font-semibold">{openLeads.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs font-medium text-muted-foreground">
              Weighted pipeline
            </p>
            <p className="text-2xl font-semibold">
              {formatCurrency(weightedPipeline)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs font-medium text-muted-foreground">Won</p>
            <p className="text-2xl font-semibold">
              {formatCurrency(wonValue)}
            </p>
          </CardContent>
        </Card>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}

      {leads && leads.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No leads yet.
        </p>
      )}

      {leads && leads.length > 0 && (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Probability</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Follow-up</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell className="text-sm">
                    {lead.value !== null ? formatCurrency(lead.value) : "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {lead.probability !== null ? `${lead.probability}%` : "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {lead.phone ?? "—"}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-sm",
                      lead.followUpDate &&
                        isOverdue(lead.followUpDate, false) &&
                        "font-medium text-destructive"
                    )}
                  >
                    {formatDate(lead.followUpDate) || "—"}
                  </TableCell>
                  <TableCell>
                    <LeadStatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                    {lead.notes ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditing(lead)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <ConfirmDelete
                        title="Delete lead?"
                        description={`This will permanently delete "${lead.name}".`}
                        onConfirm={() => handleDelete(lead.id)}
                      >
                        <Button variant="ghost" size="icon">
                          <Trash2 className="size-4" />
                        </Button>
                      </ConfirmDelete>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <LeadFormDialog
        open={creating}
        onOpenChange={setCreating}
        onSaved={() => mutate()}
      />
      <LeadFormDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        lead={editing}
        onSaved={() => mutate()}
      />
    </div>
  );
}
