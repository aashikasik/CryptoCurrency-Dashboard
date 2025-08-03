import React from 'react';

export default function EmptyState({ message }: { message?: string }) {
  return (
    <div className="text-center py-8 text-gray-400">
      <p>{message || 'No data found.'}</p>
    </div>
  );
}
