"use client";

import { Upload } from "lucide-react";
import { useState } from "react";

export function UploadCsv({ onUpload }: { onUpload: (form: FormData) => Promise<unknown> }) {
  const [status, setStatus] = useState("");
  return (
    <form
      className="flex flex-wrap items-center gap-3"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setStatus("Uploading...");
        await onUpload(form);
        setStatus("CSV imported");
        event.currentTarget.reset();
      }}
    >
      <input name="file" type="file" accept=".csv" className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" required />
      <button className="inline-flex items-center gap-2 rounded-md bg-teal px-4 py-2 text-sm font-semibold text-white">
        <Upload className="h-4 w-4" />
        Upload CSV
      </button>
      {status && <span className="text-sm text-slate-500">{status}</span>}
    </form>
  );
}
