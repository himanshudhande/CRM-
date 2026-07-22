"use client";

import { use, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Client, Project } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { formatDate } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ClientStatusBadge } from "@/components/clients/client-status-badge";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { ClientNotes } from "@/components/clients/client-notes";
import { ClientDocuments } from "@/components/clients/client-documents";
import { ArrowLeft, Pencil } from "lucide-react";

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: client, mutate, isLoading } = useSWR<Client>(
    `/api/clients/${id}`,
    fetcher
  );
  const { data: projects } = useSWR<Project[]>("/api/projects", fetcher);
  const [editing, setEditing] = useState(false);

  const clientProjects = projects?.filter((p) => p.clientId === id) ?? [];

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!client) {
    return (
      <p className="text-sm text-muted-foreground">Client not found.</p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/clients"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          All clients
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {client.businessName}
              </h1>
              <ClientStatusBadge status={client.status} />
            </div>
            {client.industry && (
              <p className="text-sm text-muted-foreground">
                {client.industry}
              </p>
            )}
          </div>
          <Button variant="outline" onClick={() => setEditing(true)}>
            <Pencil className="size-4" />
            Edit
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Contact person" value={client.contactPerson} />
          <Field label="Phone" value={client.phone} />
          <Field label="Email" value={client.email} />
          <Field label="Services" value={client.servicesPurchased} />
          <Field
            label="Monthly retainer"
            value={
              client.monthlyRetainer !== null
                ? `${formatCurrency(client.monthlyRetainer)}/mo`
                : null
            }
          />
          <Field
            label="Contract start"
            value={formatDate(client.contractStartDate) || null}
          />
          <Field
            label="Renewal date"
            value={formatDate(client.renewalDate) || null}
          />
        </CardContent>
        {client.notes && (
          <CardContent className="border-t pt-4">
            <p className="mb-1 text-xs font-medium text-muted-foreground">
              Notes
            </p>
            <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue="log">
        <TabsList>
          <TabsTrigger value="log">Communication log</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="projects">
            Projects ({clientProjects.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="pt-4">
          <ClientNotes clientId={id} />
        </TabsContent>

        <TabsContent value="documents" className="pt-4">
          <ClientDocuments clientId={id} />
        </TabsContent>

        <TabsContent value="projects" className="pt-4">
          {clientProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No projects linked to this client yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {clientProjects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card className="relative overflow-hidden transition-colors hover:bg-muted/50">
                    <div
                      className="absolute inset-x-0 top-0 h-1.5"
                      style={{ backgroundColor: project.color ?? "#3b82f6" }}
                    />
                    <CardContent>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {project._count?.tasks ?? 0} task
                        {project._count?.tasks === 1 ? "" : "s"}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ClientFormDialog
        open={editing}
        onOpenChange={setEditing}
        client={client}
        onSaved={() => mutate()}
      />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm">{value || "—"}</p>
    </div>
  );
}
