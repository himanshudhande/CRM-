"use client";

import { useRef, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { fetcher } from "@/lib/fetcher";
import { ClientDocument } from "@/lib/types";
import { formatFileSize } from "@/lib/format";
import { formatDate } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { ConfirmDelete } from "@/components/confirm-delete";
import { FileText, Download, Trash2, Upload } from "lucide-react";

export function ClientDocuments({ clientId }: { clientId: string }) {
  const { data: documents, mutate, isLoading } = useSWR<ClientDocument[]>(
    `/api/clients/${clientId}/documents`,
    fetcher
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/clients/${clientId}/documents`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      toast.success("Document uploaded");
      mutate();
    } catch {
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      mutate();
    } catch {
      toast.error("Failed to delete document");
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="size-4" />
          {uploading ? "Uploading…" : "Upload document"}
        </Button>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}

      {documents && documents.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No documents uploaded yet.
        </p>
      )}

      <div className="space-y-2">
        {documents?.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between gap-3 rounded-md border p-3"
          >
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {doc.originalName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(doc.sizeBytes)} · {formatDate(doc.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                render={
                  <a href={`/api/documents/${doc.id}`}>
                    <Download className="size-4" />
                  </a>
                }
              />
              <ConfirmDelete
                title="Delete document?"
                description={`This will permanently delete "${doc.originalName}".`}
                onConfirm={() => handleDelete(doc.id)}
              >
                <Button variant="ghost" size="icon">
                  <Trash2 className="size-4" />
                </Button>
              </ConfirmDelete>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
