import { CardGridSkeleton, GridSkeleton, PanelSkeleton } from "@/components/common/Loader";

export default function Loading() {
  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 h-7 w-44 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-72 animate-pulse rounded bg-slate-200" />
      </div>
      <CardGridSkeleton />
      <div className="rounded-lg border border-line bg-white p-5 shadow-card">
        <PanelSkeleton lines={3} />
      </div>
      <div className="rounded-lg border border-line bg-white p-5 shadow-card">
        <GridSkeleton />
      </div>
    </div>
  );
}
