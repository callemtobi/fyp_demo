// Reusable skeleton loader component
export function SkeletonPulse() {
  return <div className="animate-pulse bg-neutral-200 rounded-lg"></div>;
}

// Generic skeleton block
export function SkeletonBlock({ width = "w-full", height = "h-4" }) {
  return (
    <div
      className={`${width} ${height} bg-neutral-200 rounded animate-pulse`}
    ></div>
  );
}

// Skeleton for stat cards
export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6 animate-pulse">
      <div className="flex items-center justify-center mb-4">
        <div className="w-10 h-10 bg-neutral-200 rounded-lg"></div>
      </div>
      <div className="h-8 bg-neutral-200 rounded mb-4 w-12 mx-auto"></div>
      <div className="h-3 bg-neutral-200 rounded w-20 mx-auto"></div>
    </div>
  );
}

// Skeleton for chart
export function SkeletonChart({ height = "h-80" }) {
  return (
    <div
      className={`bg-white rounded-xl border border-neutral-200 p-6 ${height} animate-pulse`}
    >
      <div className="h-4 bg-neutral-200 rounded w-32 mb-6"></div>
      <div className="flex items-end justify-between h-64 gap-2">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-neutral-200 rounded-t"
            style={{ height: `${Math.random() * 100 + 20}%` }}
          ></div>
        ))}
      </div>
    </div>
  );
}

// Skeleton for content card
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6 animate-pulse">
      <div className="h-4 bg-neutral-200 rounded w-3/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-3 bg-neutral-200 rounded"></div>
        <div className="h-3 bg-neutral-200 rounded w-5/6"></div>
        <div className="h-3 bg-neutral-200 rounded w-4/6"></div>
      </div>
    </div>
  );
}

// Skeleton for table rows
export function SkeletonTableRow() {
  return (
    <div className="bg-white border-b border-neutral-200 p-4 animate-pulse flex gap-4">
      <div className="flex-1 h-4 bg-neutral-200 rounded"></div>
      <div className="flex-1 h-4 bg-neutral-200 rounded"></div>
      <div className="flex-1 h-4 bg-neutral-200 rounded"></div>
      <div className="w-24 h-4 bg-neutral-200 rounded"></div>
    </div>
  );
}

// Skeleton for list item
export function SkeletonListItem() {
  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-3 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-neutral-200 rounded-lg flex-shrink-0"></div>
        <div className="flex-1">
          <div className="h-4 bg-neutral-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-neutral-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
}
