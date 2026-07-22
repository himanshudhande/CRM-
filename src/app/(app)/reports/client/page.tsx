"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { format, startOfMonth, isWithinInterval, endOfDay } from "date-fns";
import { fetcher } from "@/lib/fetcher";
import { Client, ContentItem, CONTENT_PLATFORM_LABELS } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { PlatformBadge, TypeBadge } from "@/components/content/content-badges";
import { formatDate } from "@/lib/dates";
import { Printer, ExternalLink } from "lucide-react";

export default function ClientReportPage() {
  const { data: clients } = useSWR<Client[]>("/api/clients", fetcher);
  const { data: content } = useSWR<ContentItem[]>("/api/content", fetcher);

  const [clientId, setClientId] = useState<string>("");
  const [startDate, setStartDate] = useState(() =>
    startOfMonth(new Date()).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  const client = clients?.find((c) => c.id === clientId);

  const items = useMemo(() => {
    if (!content || !clientId) return [];
    const start = new Date(startDate);
    const end = endOfDay(new Date(endDate));
    return content
      .filter(
        (item) =>
          item.clientId === clientId &&
          item.stage === "PUBLISHED" &&
          item.scheduledDate &&
          isWithinInterval(new Date(item.scheduledDate), { start, end })
      )
      .sort(
        (a, b) =>
          new Date(a.scheduledDate!).getTime() -
          new Date(b.scheduledDate!).getTime()
      );
  }, [content, clientId, startDate, endDate]);

  const byPlatform = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      counts.set(item.platform, (counts.get(item.platform) ?? 0) + 1);
    }
    return Array.from(counts.entries());
  }, [items]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Client Report
          </h1>
          <p className="text-sm text-muted-foreground">
            Pick a client and date range, then download as PDF.
          </p>
        </div>
        <Button onClick={() => window.print()} disabled={!clientId}>
          <Printer className="size-4" />
          Download PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 print:hidden">
        <div className="space-y-2">
          <Label>Client</Label>
          <Select value={clientId} onValueChange={(v) => setClientId(v ?? "")}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {(v: string) =>
                  clients?.find((c) => c.id === v)?.businessName ??
                  "Select a client"
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {clients?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.businessName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="startDate">From</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">To</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {!clientId && (
        <p className="text-sm text-muted-foreground print:hidden">
          Select a client to generate a report.
        </p>
      )}

      {clientId && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">
              {client?.businessName}
            </h2>
            <p className="text-sm text-muted-foreground">
              {format(new Date(startDate), "MMM d, yyyy")} –{" "}
              {format(new Date(endDate), "MMM d, yyyy")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <CardContent>
                <p className="text-xs text-muted-foreground">Published</p>
                <p className="text-xl font-semibold">{items.length}</p>
              </CardContent>
            </Card>
            {byPlatform.map(([platform, count]) => (
              <Card key={platform}>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {CONTENT_PLATFORM_LABELS[
                      platform as keyof typeof CONTENT_PLATFORM_LABELS
                    ] ?? platform}
                  </p>
                  <p className="text-xl font-semibold">{count}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing published in this range.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.title}
                      </TableCell>
                      <TableCell>
                        <PlatformBadge platform={item.platform} />
                      </TableCell>
                      <TableCell>
                        <TypeBadge type={item.type} />
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(item.scheduledDate)}
                      </TableCell>
                      <TableCell>
                        {item.finalExportUrl ? (
                          <a
                            href={item.finalExportUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                          >
                            View <ExternalLink className="size-3.5" />
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            —
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
