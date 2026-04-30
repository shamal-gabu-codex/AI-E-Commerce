export function GridSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="table-responsive">
      <table className="table align-middle">
        <thead>
          <tr>{Array.from({ length: columns }).map((_, i) => <th key={i}><span className="placeholder col-8" /></th>)}</tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, row) => (
            <tr key={row}>
              {Array.from({ length: columns }).map((__, col) => (
                <td key={col}><span className="placeholder-glow d-block"><span className="placeholder col-10" /></span></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LoadingButton({
  loading,
  children,
  className = "btn btn-primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button {...props} className={className} disabled={loading || props.disabled}>
      {loading && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
      {children}
    </button>
  );
}
import type { ButtonHTMLAttributes } from "react";
