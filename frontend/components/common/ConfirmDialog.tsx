"use client";

import { Loader2 } from "lucide-react";

type ConfirmModalProps = {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title = "Please confirm",
  message,
  confirmText = "Confirm",
  loading = false,
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  if (!open) return null;
  return (
    <div className="modal show d-block" tabIndex={-1} role="dialog">
      <div className="fixed inset-0 z-[1050] bg-slate-950/55" onClick={loading ? undefined : onCancel} />
      <div className="modal-dialog modal-dialog-centered relative z-[1060]" role="document">
        <div className="modal-content rounded-lg border border-line bg-white shadow-2xl">
          <div className="modal-header border-line px-4 py-3">
            <h5 className="modal-title text-base font-extrabold text-ink">{title}</h5>
            <button type="button" className="btn-close" disabled={loading} onClick={onCancel} aria-label="Close" />
          </div>
          <div className="modal-body">
            <p className="mb-0 text-secondary">{message}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="app-secondary border-0" disabled={loading} onClick={onCancel}>Cancel</button>
            <button type="button" className="app-action" disabled={loading} onClick={onConfirm}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {loading ? "Processing..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
