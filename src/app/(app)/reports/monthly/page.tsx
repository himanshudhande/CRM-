"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  format,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  addMonths,
  subMonths,
} from "date-fns";
import { fetcher } from "@/lib/fetcher";
import { Task, ContentItem, IncomeEntry } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { formatDate } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlatformBadge } from "@/components/content/content-badges";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Printer } from "lucide-react";

export default function MonthlyReportPage() {
  const { data: tasks } = useSWR<Task[]>("/api/tasks", fetcher);
  const { data: content } = useSWR<ContentItem[]>("/api/content", fetcher);
  const { data: income } = useSWR<IncomeEntry[]>("/api/income", fetcher);

  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const interval = useMemo(
    () => ({ start: startOfMonth(month), end: endOfMonth(month) }),
    [month]
  );

  const tasksCompleted = useMemo(
    () =>
      (tasks ?? []).filter(
        (t) =>
          t.status === "DONE" &&
          t.completedAt &&
          isWithinInterval(new Date(t.completedAt), interval)
      ),
    [tasks, interval]
  );

  const contentPublished = useMemo(
    () =>
      (content ?? []).filter(
        (c) =>
          c.stage === "PUBLISHED" &&
          c.scheduledDate &&
          isWithinInterval(new Date(c.scheduledDate), interval)
      ),
    [content, interval]
  );

  const incomeReceived = useMemo(
    () =>
      (income ?? []).filter(
        (e) =>
          e.status === "PAID" &&
          e.receivedDate &&
          isWithinInterval(new Date(e.receivedDate), interval)
      ),
    [income, interval]
  );

  const totalReceived = incomeReceived.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Monthly Report
          </h1>
          <p className="text-sm text-muted-foreground">
            A one-pager of what got done and what came in.
          </p>
        </div>
        <Button onClick={() => window.print()}>
          <Printer className="size-4" />
          Download PDF
        </Button>
      </div>

      <div className="flex items-center justify-center gap-2 print:hidden">
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

      <div className="text-center">
        <h2 className="text-xl font-semibold">{format(month, "MMMM yyyy")}</h2>
        <p className="text-sm text-muted-foreground">Hexamad Digital</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground">Tasks completed</p>
            <p className="text-2xl font-semibold">{tasksCompleted.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Content published
            </p>
            <p className="text-2xl font-semibold">
              {contentPublished.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-muted-foreground">Income received</p>
            <p className="text-2xl font-semibold">
              {formatCurrency(totalReceived)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Content published this month
        </h3>
        {contentPublished.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing published.</p>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contentPublished.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.title}
                    </TableCell>
                    <TableCell>
                      <PlatformBadge platform={item.platform} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.client?.businessName ?? "Own channel"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(item.scheduledDate)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Tasks completed this month
        </h3>
        {tasksCompleted.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tasks completed.
          </p>
        ) : (
          <ul className="list-inside list-disc space-y-1 text-sm">
            {tasksCompleted.map((task) => (
              <li key={task.id}>{task.title}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
