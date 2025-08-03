import React from 'react';

export default function SearchInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Search by name or symbol..."
      className="w-full max-w-xs px-3 py-2 border rounded focus:outline-none focus:ring"
    />
  );
}
