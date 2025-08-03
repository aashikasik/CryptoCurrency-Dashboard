import React from 'react';

export default function TableHeader() {
  return (
    <thead className="bg-gray-50">
      <tr>
        <th className="px-2 py-2 text-left">#</th>
        <th className="px-2 py-2 text-left">Coin</th>
        <th className="px-2 py-2 text-right">Price</th>
        <th className="px-2 py-2 text-right">24h %</th>
        <th className="px-2 py-2 text-right">Market Cap</th>
        <th className="px-2 py-2 text-right">24h Volume</th>
        <th className="px-2 py-2 text-center">Watch</th>
      </tr>
    </thead>
  );
}
