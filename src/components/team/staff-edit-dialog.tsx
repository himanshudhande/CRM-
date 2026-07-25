"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/fetcher";
import { TeamMember } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABELS } from "@/lib/permissions";
import {
  STAFF_ROLES,
  STAFF_ROLE_DESCRIPTIONS,
  type StaffRole,
} from "@/lib/staff-roles";

export function StaffEditDialog({
  member,
  onOpenChange,
  onSaved,
}: {
  member: TeamMember | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole>("SOCIAL_MEDIA_MANAGER");
  const [saving, setSaving] = useState(false);

  const isOwnerTarget = member?.role === "OWNER";

  useEffect(() => {
    if (!member) return;
    setName(member.name ?? "");
    setEmail(member.email);
    setPassword("");
    if (member.role !== "OWNER") setRole(member.role as StaffRole);
  }, [member]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!member || !name.trim() || !email.trim()) return;
    if (password && password.length < 8) return;

    setSaving(true);
    try {
      await apiRequest(`/api/team/${member.id}`, "PATCH", {
        name: name.trim(),
        email: email.trim(),
        ...(password ? { password } : {}),
        ...(isOwnerTarget ? {} : { role }),
      });
      toast.success("Account updated");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={!!member} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-password">New password</Label>
            <Input
              id="edit-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              placeholder="Leave blank to keep current password"
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to keep the existing password.
            </p>
          </div>

          {!isOwnerTarget && (
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={role}
                onValueChange={(v) =>
                  setRole((v ?? "SOCIAL_MEDIA_MANAGER") as StaffRole)
                }
              >
                <SelectTrigger>
                  <SelectValue>{(v: StaffRole) => ROLE_LABELS[v]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {STAFF_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {STAFF_ROLE_DESCRIPTIONS[role]}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
