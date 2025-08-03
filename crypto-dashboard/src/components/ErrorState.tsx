import React from 'react';

export default function ErrorState({ message }: { message?: string }) {
  return (
    <div className="text-center py-8 text-red-500">
      <p>{message || 'Something went wrong. Please try again.'}</p>
    </div>
  );
}
