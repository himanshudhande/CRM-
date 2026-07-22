"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { ContentItem } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { PlatformBadge, TypeBadge } from "@/components/content/content-badges";
import { formatDate } from "@/lib/dates";
import { ExternalLink } from "lucide-react";

export default function PublicPortfolioPage() {
  const { data: items, isLoading } = useSWR<ContentItem[]>(
    "/api/public/portfolio",
    fetcher
  );

  const groups = useMemo(() => {
    if (!items) return [];
    const map = new Map<string, ContentItem[]>();
    for (const item of items) {
      const key = item.client?.businessName ?? "My Own Channel";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries());
  }, [items]);

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Hexamad Digital
        </h1>
        <p className="mt-1 text-muted-foreground">Portfolio</p>
      </header>

      {isLoading && (
        <p className="text-center text-sm text-muted-foreground">
          Loading…
        </p>
      )}

      {items && items.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Nothing published to the portfolio yet.
        </p>
      )}

      <div className="space-y-10">
        {groups.map(([groupName, groupItems]) => (
          <section key={groupName}>
            <h2 className="mb-4 text-lg font-semibold">{groupName}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {groupItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="space-y-2">
                    <p className="font-medium">{item.title}</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <PlatformBadge platform={item.platform} />
                      <TypeBadge type={item.type} />
                    </div>
                    {item.scheduledDate && (
                      <p className="text-xs text-muted-foreground">
                        Published {formatDate(item.scheduledDate)}
                      </p>
                    )}
                    {item.finalExportUrl && (
                      <a
                        href={item.finalExportUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        View <ExternalLink className="size-3.5" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
