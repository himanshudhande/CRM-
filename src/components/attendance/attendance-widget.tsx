"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { format } from "date-fns";
import { fetcher, apiRequest } from "@/lib/fetcher";
import { AttendanceLog } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Clock, LogIn, LogOut } from "lucide-react";

export function AttendanceWidget() {
  const { data, mutate } = useSWR<{
    current: AttendanceLog | null;
    history: AttendanceLog[];
  }>("/api/attendance", fetcher);
  const [loading, setLoading] = useState(false);

  const isCheckedIn = !!data?.current;

  async function handleToggle() {
    setLoading(true);
    try {
      if (isCheckedIn) {
        await apiRequest("/api/attendance/check-out", "POST");
        toast.success("Checked out");
      } else {
        await apiRequest("/api/attendance/check-in", "POST");
        toast.success("Checked in");
      }
      mutate();
    } catch {
      toast.error("Attendance action failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Clock className="size-3.5" />
        {isCheckedIn && data?.current ? (
          <span>Checked in since {format(new Date(data.current.checkInAt), "h:mm a")}</span>
        ) : (
          <span>Not checked in</span>
        )}
      </div>
      <Button
        variant={isCheckedIn ? "outline" : "default"}
        size="sm"
        className="mt-2 w-full justify-center gap-2"
        onClick={handleToggle}
        disabled={loading}
      >
        {isCheckedIn ? (
          <>
            <LogOut className="size-3.5" />
            Check out
          </>
        ) : (
          <>
            <LogIn className="size-3.5" />
            Check in
          </>
        )}
      </Button>
    </div>
  );
}
