"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isWithinInterval } from "date-fns";
import { fetcher, apiRequest } from "@/lib/fetcher";
import { IncomeEntry, ExpenseEntry } from "@/lib/types";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDelete } from "@/components/confirm-delete";
import { FinanceSummaryCards } from "@/components/finance/finance-summary-cards";
import { IncomeExpenseChart } from "@/components/finance/income-expense-chart";
import { IncomeStatusBadge } from "@/components/finance/income-status-badge";
import { IncomeFormDialog } from "@/components/finance/income-form-dialog";
import { ExpenseFormDialog } from "@/components/finance/expense-form-dialog";
import { ChevronLeft, ChevronRight, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";

export default function FinancePage() {
  const { data: income, mutate: mutateIncome } = useSWR<IncomeEntry[]>(
    "/api/income",
    fetcher
  );
  const { data: expenses, mutate: mutateExpenses } = useSWR<ExpenseEntry[]>(
    "/api/expenses",
    fetcher
  );

  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [creatingIncome, setCreatingIncome] = useState(false);
  const [editingIncome, setEditingIncome] = useState<IncomeEntry | null>(null);
  const [creatingExpense, setCreatingExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseEntry | null>(
    null
  );
  const [generating, setGenerating] = useState(false);

  const monthInterval = useMemo(
    () => ({ start: startOfMonth(month), end: endOfMonth(month) }),
    [month]
  );

  const monthIncome = useMemo(
    () =>
      (income ?? []).filter((e) =>
        isWithinInterval(new Date(e.expectedDate), monthInterval)
      ),
    [income, monthInterval]
  );

  const monthExpenses = useMemo(
    () =>
      (expenses ?? []).filter((e) =>
        isWithinInterval(new Date(e.date), monthInterval)
      ),
    [expenses, monthInterval]
  );

  const totalExpected = monthIncome.reduce((sum, e) => sum + e.amount, 0);
  const totalReceived = (income ?? [])
    .filter(
      (e) =>
        e.status === "PAID" &&
        e.receivedDate &&
        isWithinInterval(new Date(e.receivedDate), monthInterval)
    )
    .reduce((sum, e) => sum + e.amount, 0);
  const totalExpensesSum = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const net = totalReceived - totalExpensesSum;

  async function handleGenerateRetainers() {
    setGenerating(true);
    try {
      const res = await apiRequest<{ created: number }>(
        "/api/income/generate-retainers",
        "POST"
      );
      toast.success(
        res.created > 0
          ? `Created ${res.created} retainer income ${res.created === 1 ? "entry" : "entries"}`
          : "All active retainers already have an entry this month"
      );
      mutateIncome();
    } catch {
      toast.error("Failed to generate retainer income");
    } finally {
      setGenerating(false);
    }
  }

  async function toggleIncomePaid(entry: IncomeEntry) {
    try {
      await apiRequest(`/api/income/${entry.id}`, "PATCH", {
        status: entry.status === "PAID" ? "PENDING" : "PAID",
        receivedDate:
          entry.status === "PAID" ? null : new Date().toISOString(),
      });
      mutateIncome();
    } catch {
      toast.error("Failed to update income entry");
    }
  }

  async function handleDeleteIncome(id: string) {
    try {
      await apiRequest(`/api/income/${id}`, "DELETE");
      toast.success("Income entry deleted");
      mutateIncome();
    } catch {
      toast.error("Failed to delete income entry");
    }
  }

  async function handleDeleteExpense(id: string) {
    try {
      await apiRequest(`/api/expenses/${id}`, "DELETE");
      toast.success("Expense deleted");
      mutateExpenses();
    } catch {
      toast.error("Failed to delete expense");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Finance</h1>
          <p className="text-sm text-muted-foreground">
            Income, expenses, and retainers at a glance.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleGenerateRetainers}
          disabled={generating}
        >
          <RefreshCw className="size-4" />
          {generating ? "Generating…" : "Generate retainer income"}
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMonth((m) => subMonths(m, 1))}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <p className="w-32 text-center text-sm font-medium">
          {format(month, "MMMM yyyy")}
        </p>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMonth((m) => addMonths(m, 1))}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <FinanceSummaryCards
        totalExpected={totalExpected}
        totalReceived={totalReceived}
        totalExpenses={totalExpensesSum}
        net={net}
      />

      <IncomeExpenseChart
        incomeEntries={income ?? []}
        expenseEntries={expenses ?? []}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Income</h2>
          <Button size="sm" onClick={() => setCreatingIncome(true)}>
            <Plus className="size-4" />
            New income
          </Button>
        </div>

        {monthIncome.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No income entries for this month.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Description</TableHead>
                  <TableHead>Client / Project</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Expected</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthIncome.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Checkbox
                        checked={entry.status === "PAID"}
                        onCheckedChange={() => toggleIncomePaid(entry)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {entry.description ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {entry.client?.businessName ?? entry.project?.name ?? "—"}
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
                          onClick={() => setEditingIncome(entry)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <ConfirmDelete
                          title="Delete income entry?"
                          description="This will permanently delete this income entry."
                          onConfirm={() => handleDeleteIncome(entry.id)}
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
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Expenses</h2>
          <Button size="sm" onClick={() => setCreatingExpense(true)}>
            <Plus className="size-4" />
            New expense
          </Button>
        </div>

        {monthExpenses.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No expenses for this month.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead className="w-20" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthExpenses.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {entry.category}
                    </TableCell>
                    <TableCell>{formatCurrency(entry.amount)}</TableCell>
                    <TableCell className="text-sm">
                      {formatDate(entry.date)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {entry.note ?? "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingExpense(entry)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <ConfirmDelete
                          title="Delete expense?"
                          description="This will permanently delete this expense entry."
                          onConfirm={() => handleDeleteExpense(entry.id)}
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
      </div>

      <IncomeFormDialog
        open={creatingIncome}
        onOpenChange={setCreatingIncome}
        onSaved={() => mutateIncome()}
      />
      <IncomeFormDialog
        open={!!editingIncome}
        onOpenChange={(open) => !open && setEditingIncome(null)}
        entry={editingIncome}
        onSaved={() => mutateIncome()}
      />
      <ExpenseFormDialog
        open={creatingExpense}
        onOpenChange={setCreatingExpense}
        onSaved={() => mutateExpenses()}
      />
      <ExpenseFormDialog
        open={!!editingExpense}
        onOpenChange={(open) => !open && setEditingExpense(null)}
        entry={editingExpense}
        onSaved={() => mutateExpenses()}
      />
    </div>
  );
}
