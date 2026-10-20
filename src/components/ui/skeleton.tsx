import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-charcoal-800/80 border border-charcoal-700/50 ${className}`}
      aria-hidden="true"
    />
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-12 bg-charcoal-850/60 border border-charcoal-800 animate-pulse flex items-center px-4 gap-4"
        >
          <div className="h-4 w-20 bg-charcoal-750" />
          <div className="h-4 w-48 bg-charcoal-750" />
          <div className="h-4 w-24 bg-charcoal-750" />
          <div className="h-4 w-32 bg-charcoal-750" />
        </div>
      ))}
    </div>
  );
}
