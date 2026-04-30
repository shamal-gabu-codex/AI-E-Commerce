"use client";

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
    <div className="modal fade show d-block" tabIndex={-1} role="dialog">
      <div className="modal-backdrop fade show" onClick={loading ? undefined : onCancel} />
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" disabled={loading} onClick={onCancel} aria-label="Close" />
          </div>
          <div className="modal-body">
            <p className="mb-0 text-secondary">{message}</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" disabled={loading} onClick={onCancel}>Cancel</button>
            <button type="button" className="btn btn-primary" disabled={loading} onClick={onConfirm}>
              {loading && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
