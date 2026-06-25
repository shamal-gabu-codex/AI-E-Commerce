import { X } from "lucide-react";
import type { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
  onClose: () => void;
};

export function Modal({ open, title, children, footer, loading = false, onClose }: ModalProps) {
  if (!open) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} role="dialog" aria-modal="true">
      <div className="fixed inset-0 z-[1050] bg-slate-950/55" onClick={loading ? undefined : onClose} />
      <div className="modal-dialog modal-dialog-centered modal-lg relative z-[1060]" role="document">
        <div className="modal-content max-h-[90vh] overflow-hidden rounded-lg border border-line bg-white shadow-2xl">
          <div className="modal-header flex items-center justify-between border-line px-4 py-3">
            <h5 className="modal-title text-base font-extrabold text-ink">{title}</h5>
            <button
              type="button"
              className="theme-icon-btn ml-auto"
              disabled={loading}
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="modal-body overflow-y-auto p-4">{children}</div>
          {footer ? <div className="modal-footer border-line px-4 py-3">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
