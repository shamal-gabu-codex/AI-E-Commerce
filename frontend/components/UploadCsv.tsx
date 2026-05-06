"use client";

import { CloudUpload, Loader2, Upload } from "lucide-react";
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
      <div className="theme-dropzone w-full sm:w-auto sm:min-w-[320px]">
        <CloudUpload className="mx-auto mb-2 h-6 w-6 text-primary" />
        <input name="file" type="file" accept=".csv" className="form-control max-w-full" required disabled={uploading} />
      </div>
      <button className="app-action" disabled={uploading}>
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {uploading ? "Uploading..." : "Upload CSV"}
      </button>
      {status && <span className="text-sm text-slate-500">{status}</span>}
    </form>
  );
}
