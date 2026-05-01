"use client";

import { Loader2, Upload } from "lucide-react";
import { useState } from "react";

export function UploadCsv({ onUpload }: { onUpload: (form: FormData) => Promise<unknown> }) {
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  return (
    <form
      className="flex flex-wrap items-center gap-3"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setUploading(true);
        setStatus("Uploading...");
        try {
          await onUpload(form);
          setStatus("CSV imported");
          event.currentTarget.reset();
        } catch {
          setStatus("Upload failed");
        } finally {
          setUploading(false);
        }
      }}
    >
      <input name="file" type="file" accept=".csv" className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" required disabled={uploading} />
      <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-60" disabled={uploading}>
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {uploading ? "Uploading..." : "Upload CSV"}
      </button>
      {status && <span className="text-sm text-slate-500">{status}</span>}
    </form>
  );
}
