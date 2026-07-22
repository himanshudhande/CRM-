"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { toast } from "sonner";
import { fetcher, apiRequest } from "@/lib/fetcher";
import { Client, CLIENT_STATUSES, CLIENT_STATUS_LABELS } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { formatDate } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClientStatusBadge } from "@/components/clients/client-status-badge";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Plus, Pencil, Trash2, ArrowUpDown } from "lucide-react";

const ALL_STATUSES = "__all__";

export default function ClientsPage() {
  const { data: clients, mutate, isLoading } = useSWR<Client[]>(
    "/api/clients",
    fetcher
  );
  const [statusFilter, setStatusFilter] = useState<string>(ALL_STATUSES);
  const [sortByRenewal, setSortByRenewal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);

  const filtered = useMemo(() => {
    if (!clients) return [];
    const list =
      statusFilter === ALL_STATUSES
        ? clients
        : clients.filter((c) => c.status === statusFilter);

    if (!sortByRenewal) return list;

    return [...list].sort((a, b) => {
      if (!a.renewalDate) return 1;
      if (!b.renewalDate) return -1;
      return (
        new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime()
      );
    });
  }, [clients, statusFilter, sortByRenewal]);

  async function handleDelete(id: string) {
    try {
      await apiRequest(`/api/clients/${id}`, "DELETE");
      toast.success("Client deleted");
      mutate();
    } catch {
      toast.error("Failed to delete client");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground">
            Agency and ZPrime client profiles in one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? ALL_STATUSES)}>
            <SelectTrigger className="w-40">
              <SelectValue>
                {(v: string) =>
                  v === ALL_STATUSES
                    ? "All statuses"
                    : CLIENT_STATUS_LABELS[v as keyof typeof CLIENT_STATUS_LABELS]
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
              {CLIENT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {CLIENT_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant={sortByRenewal ? "secondary" : "outline"}
            size="sm"
            onClick={() => setSortByRenewal((v) => !v)}
          >
            <ArrowUpDown className="size-4" />
            Renewal date
          </Button>
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            New client
          </Button>
        </div>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading clients…</p>
      )}

      {filtered.length === 0 && !isLoading && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          No clients match this filter.
        </p>
      )}

      {filtered.length > 0 && (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Retainer</TableHead>
                <TableHead>Renewal</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/clients/${client.id}`}
                      className="hover:underline"
                    >
                      {client.businessName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {client.contactPerson ?? "—"}
                  </TableCell>
                  <TableCell>
                    <ClientStatusBadge status={client.status} />
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatCurrency(client.monthlyRetainer) || "—"}
                    {client.monthlyRetainer !== null && "/mo"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(client.renewalDate) || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditing(client)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <ConfirmDelete
                        title="Delete client?"
                        description={`This will delete "${client.businessName}" and its notes/documents. Linked projects will be unassigned, not deleted.`}
                        onConfirm={() => handleDelete(client.id)}
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

      <ClientFormDialog
        open={creating}
        onOpenChange={setCreating}
        onSaved={() => mutate()}
      />
      <ClientFormDialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
        client={editing}
        onSaved={() => mutate()}
      />
    </div>
  );
}
