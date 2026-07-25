"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { toast } from "sonner";
import { fetcher, apiRequest } from "@/lib/fetcher";
import { TeamMember, AttendanceLog } from "@/lib/types";
import { ROLE_LABELS } from "@/lib/permissions";
import { formatDate } from "@/lib/dates";
import { format } from "date-fns";
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
  const { data: attendance } = useSWR<AttendanceLog[]>(
    "/api/attendance/team",
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
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
            <p className="text-sm text-muted-foreground">
              Staff accounts share the same business data as you, scoped to
              their role.
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
                        {ROLE_LABELS[member.role]}
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
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Attendance</h2>
          <p className="text-sm text-muted-foreground">
            Recent check-in / check-out activity across the team.
          </p>
        </div>

        {attendance && attendance.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No attendance records yet.
          </p>
        )}

        {attendance && attendance.length > 0 && (
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Checked in</TableHead>
                  <TableHead>Checked out</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      {log.user?.name ?? log.user?.email ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(log.checkInAt), "MMM d, h:mm a")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.checkOutAt
                        ? format(new Date(log.checkOutAt), "MMM d, h:mm a")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {log.checkOutAt ? (
                        <Badge variant="secondary">Checked out</Badge>
                      ) : (
                        <Badge>Active</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <StaffFormDialog
        open={creating}
        onOpenChange={setCreating}
        onSaved={() => mutate()}
      />
    </div>
  );
}
