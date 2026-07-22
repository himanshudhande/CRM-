import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CalendarDays } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Generate a report to share with a client, or review your own month.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link href="/reports/client">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <FileText className="size-5 text-muted-foreground" />
              <CardTitle className="text-base">Client Report</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Pick a client and date range to see what was published, by
                platform, with links.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/reports/monthly">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <CalendarDays className="size-5 text-muted-foreground" />
              <CardTitle className="text-base">Monthly Report</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                A one-pager: tasks completed, content published, and income
                received for the month.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
