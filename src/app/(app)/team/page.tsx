"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { toast } from "sonner";
import { fetcher, apiRequest } from "@/lib/fetcher";
import { TeamMember } from "@/lib/types";
import { formatDate } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StaffFormDialog } from "@/components/team/staff-form-dialog";
import { ConfirmDelete } from "@/components/confirm-delete";
import { Plus, Trash2 } from "lucide-react";

export default function TeamPage() {
  const { data: session } = useSession();
  const { data: team, mutate, isLoading } = useSWR<TeamMember[]>(
    "/api/team",
    fetcher
  );
  const [creating, setCreating] = useState(false);

  const isOwner = session?.user?.role === "OWNER";

  async function handleDelete(id: string) {
    try {
      await apiRequest(`/api/team/${id}`, "DELETE");
      toast.success("Staff account removed");
      mutate();
    } catch {
      toast.error("Failed to remove staff account");
    }
  }

  if (session && !isOwner) {
    return (
      <p className="text-sm text-muted-foreground">
        Only the account owner can manage team members.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
          <p className="text-sm text-muted-foreground">
            Staff accounts share the same tasks, clients, content, and
            finance data as you.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="size-4" />
          Add staff
        </Button>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}

      {team && (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">
                    {member.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {member.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        member.role === "OWNER" ? "default" : "secondary"
                      }
                    >
                      {member.role === "OWNER" ? "Owner" : "Staff"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(member.createdAt)}
                  </TableCell>
                  <TableCell>
                    {member.role !== "OWNER" && (
                      <ConfirmDelete
                        title="Remove staff account?"
                        description={`${member.name ?? member.email} will no longer be able to log in.`}
                        onConfirm={() => handleDelete(member.id)}
                      >
                        <Button variant="ghost" size="icon">
                          <Trash2 className="size-4" />
                        </Button>
                      </ConfirmDelete>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <StaffFormDialog
        open={creating}
        onOpenChange={setCreating}
        onSaved={() => mutate()}
      />
    </div>
  );
}
