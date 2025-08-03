import React from 'react';

export default function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-6 bg-gray-200 rounded w-full" />
      ))}
    </div>
  );
}
