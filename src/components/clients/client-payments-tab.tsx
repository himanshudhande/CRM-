"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { format } from "date-fns";
import { fetcher, apiRequest } from "@/lib/fetcher";
import { IncomeEntry } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { formatDate } from "@/lib/dates";
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
import { IncomeStatusBadge } from "@/components/finance/income-status-badge";
import { IncomeFormDialog } from "@/components/finance/income-form-dialog";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Plus, Pencil, Trash2 } from "lucide-react";

export function ClientPaymentsTab({ clientId }: { clientId: string }) {
  const { data: allIncome, mutate, isLoading } = useSWR<IncomeEntry[]>(
    "/api/income",
    fetcher
  );
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<IncomeEntry | null>(null);

  const entries = (allIncome ?? [])
    .filter((e) => e.clientId === clientId)
    .sort(
      (a, b) =>
        new Date(b.expectedDate).getTime() - new Date(a.expectedDate).getTime()
    );

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const totalExpected = entries.reduce((sum, e) => sum + e.amount, 0);
  const totalReceived = entries
    .filter((e) => e.status === "PAID")
    .reduce((sum, e) => sum + e.amount, 0);
  const totalPending = totalExpected - totalReceived;

  async function handleDelete(id: string) {
    try {
      await apiRequest(`/api/income/${id}`, "DELETE");
      toast.success("Payment entry deleted");
      mutate();
    } catch {
      toast.error("Failed to delete payment entry");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid grid-cols-3 gap-3">
          <SummaryCard label="Total billed" value={totalExpected} />
          <SummaryCard label="Received" value={totalReceived} />
          <SummaryCard label="Pending" value={totalPending} />
        </div>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="size-4" />
          New payment
        </Button>
      </div>

      {entries.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No payment entries for this client yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-sm font-medium">
                    {format(new Date(entry.expectedDate), "MMM yyyy")}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {entry.description ?? "—"}
                  </TableCell>
                  <TableCell>{formatCurrency(entry.amount)}</TableCell>
                  <TableCell className="text-sm">
                    {formatDate(entry.expectedDate)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(entry.receivedDate) || "—"}
                  </TableCell>
                  <TableCell>
                    <IncomeStatusBadge
                      status={entry.status}
                      expectedDate={entry.expectedDate}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditing(entry)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <ConfirmDelete
                        title="Delete payment entry?"
                        description="This will permanently delete this payment entry."
                        onConfirm={() => handleDelete(entry.id)}
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

      <IncomeFormDialog
        open={creating}
        onOpenChange={setCreating}
        defaultClientId={clientId}
        onSaved={() => mutate()}
      />
      <IncomeFormDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        entry={editing}
        defaultClientId={clientId}
        onSaved={() => mutate()}
      />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold">{formatCurrency(value)}</p>
      </CardContent>
    </Card>
  );
}
