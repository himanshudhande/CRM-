"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { ContentItem } from "@/lib/types";
import { formatDate } from "@/lib/dates";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PlatformBadge,
  TypeBadge,
  StageBadge,
} from "@/components/content/content-badges";
import { ExternalLink } from "lucide-react";

export function ClientContentTab({ clientId }: { clientId: string }) {
  const { data: allContent, isLoading } = useSWR<ContentItem[]>(
    "/api/content",
    fetcher
  );

  const items = (allContent ?? []).filter((c) => c.clientId === clientId);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const published = items.filter((c) => c.stage === "PUBLISHED").length;
  const pending = items.length - published;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard label="Total content" value={items.length} />
        <SummaryCard label="Published" value={published} />
        <SummaryCard label="Pending" value={pending} />
        <SummaryCard
          label="Approved / ready"
          value={items.filter((c) => c.stage === "APPROVED").length}
        />
      </div>

      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No content items for this client yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-sm">
                    {formatDate(item.scheduledDate) ||
                      formatDate(item.dueDate) ||
                      "—"}
                  </TableCell>
                  <TableCell className="max-w-xs truncate font-medium">
                    {item.title}
                  </TableCell>
                  <TableCell>
                    <PlatformBadge platform={item.platform} />
                  </TableCell>
                  <TableCell>
                    <TypeBadge type={item.type} />
                  </TableCell>
                  <TableCell>
                    <StageBadge stage={item.stage} />
                  </TableCell>
                  <TableCell>
                    {item.finalExportUrl && (
                      <a
                        href={item.finalExportUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
