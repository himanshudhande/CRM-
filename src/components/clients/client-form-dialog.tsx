"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/fetcher";
import {
  Client,
  ClientStatus,
  CLIENT_STATUSES,
  CLIENT_STATUS_LABELS,
} from "@/lib/types";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ClientFormDialog({
  open,
  onOpenChange,
  client,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
  onSaved: () => void;
}) {
  const [businessName, setBusinessName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [industry, setIndustry] = useState("");
  const [servicesPurchased, setServicesPurchased] = useState("");
  const [monthlyRetainer, setMonthlyRetainer] = useState("");
  const [contractStartDate, setContractStartDate] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [status, setStatus] = useState<ClientStatus>("ONBOARDING");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (client) {
      setBusinessName(client.businessName);
      setContactPerson(client.contactPerson ?? "");
      setPhone(client.phone ?? "");
      setEmail(client.email ?? "");
      setIndustry(client.industry ?? "");
      setServicesPurchased(client.servicesPurchased ?? "");
      setMonthlyRetainer(
        client.monthlyRetainer !== null ? String(client.monthlyRetainer) : ""
      );
      setContractStartDate(
        client.contractStartDate ? client.contractStartDate.slice(0, 10) : ""
      );
      setRenewalDate(client.renewalDate ? client.renewalDate.slice(0, 10) : "");
      setStatus(client.status);
      setNotes(client.notes ?? "");
    } else {
      setBusinessName("");
      setContactPerson("");
      setPhone("");
      setEmail("");
      setIndustry("");
      setServicesPurchased("");
      setMonthlyRetainer("");
      setContractStartDate("");
      setRenewalDate("");
      setStatus("ONBOARDING");
      setNotes("");
    }
  }, [open, client]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName.trim()) return;

    setSaving(true);
    try {
      const payload = {
        businessName: businessName.trim(),
        contactPerson: contactPerson.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        industry: industry.trim() || null,
        servicesPurchased: servicesPurchased.trim() || null,
        monthlyRetainer: monthlyRetainer ? Number(monthlyRetainer) : null,
        contractStartDate: contractStartDate
          ? new Date(contractStartDate).toISOString()
          : null,
        renewalDate: renewalDate ? new Date(renewalDate).toISOString() : null,
        status,
        notes: notes.trim() || null,
      };

      if (client) {
        await apiRequest(`/api/clients/${client.id}`, "PATCH", payload);
        toast.success("Client updated");
      } else {
        await apiRequest("/api/clients", "POST", payload);
        toast.success("Client created");
      }

      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{client ? "Edit client" : "New client"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business name</Label>
            <Input
              id="businessName"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact person</Label>
              <Input
                id="contactPerson"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="servicesPurchased">Services purchased</Label>
            <Input
              id="servicesPurchased"
              placeholder="e.g. Social media management, monthly reels"
              value={servicesPurchased}
              onChange={(e) => setServicesPurchased(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyRetainer">Monthly retainer (₹)</Label>
              <Input
                id="monthlyRetainer"
                type="number"
                min={0}
                value={monthlyRetainer}
                onChange={(e) => setMonthlyRetainer(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus((v ?? "ONBOARDING") as ClientStatus)}
              >
                <SelectTrigger>
                  <SelectValue>
                    {(v: ClientStatus) => CLIENT_STATUS_LABELS[v]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CLIENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {CLIENT_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contractStartDate">Contract start</Label>
              <Input
                id="contractStartDate"
                type="date"
                value={contractStartDate}
                onChange={(e) => setContractStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="renewalDate">Renewal date</Label>
              <Input
                id="renewalDate"
                type="date"
                value={renewalDate}
                onChange={(e) => setRenewalDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : client ? "Save changes" : "Create client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
