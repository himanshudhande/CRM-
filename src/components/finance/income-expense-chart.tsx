"use client";

import { useMemo } from "react";
import { format, startOfMonth, subMonths, isSameMonth } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { IncomeEntry, ExpenseEntry } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function IncomeExpenseChart({
  incomeEntries,
  expenseEntries,
}: {
  incomeEntries: IncomeEntry[];
  expenseEntries: ExpenseEntry[];
}) {
  const data = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) =>
      startOfMonth(subMonths(new Date(), 5 - i))
    );

    return months.map((month) => {
      const income = incomeEntries
        .filter(
          (e) =>
            e.status === "PAID" &&
            e.receivedDate &&
            isSameMonth(new Date(e.receivedDate), month)
        )
        .reduce((sum, e) => sum + e.amount, 0);

      const expenses = expenseEntries
        .filter((e) => isSameMonth(new Date(e.date), month))
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        month: format(month, "MMM"),
        Income: income,
        Expenses: expenses,
      };
    });
  }, [incomeEntries, expenseEntries]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          Income vs expenses — last 6 months
        </CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              className="text-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="currentColor"
              className="text-muted-foreground"
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value) =>
                `₹${Number(Array.isArray(value) ? value[0] : value).toLocaleString("en-IN")}`
              }
              contentStyle={{
                backgroundColor: "var(--popover)",
                borderColor: "var(--border)",
                borderRadius: "var(--radius-md)",
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
