import React from 'react';

interface FiltersType {
  market_cap_rank?: string;
  price_change_percentage_24h?: string;
  volume?: string;
  [key: string]: string | undefined;
}

interface FilterProps {
  filters: FiltersType;
  setFilters: (filters: FiltersType) => void;
}

export default function Filters({ filters, setFilters }: FilterProps) {
  return (
    <div className="flex gap-4 py-2">
      <select
        value={filters.market_cap_rank || ''}
        onChange={e => setFilters({ ...filters, market_cap_rank: e.target.value })}
        className="px-2 py-1 border rounded"
      >
        <option value="">Rank</option>
        <option value="1-10">Top 10</option>
        <option value="11-50">11-50</option>
        <option value="51-100">51-100</option>
      </select>
      <select
        value={filters.price_change_percentage_24h || ''}
        onChange={e => setFilters({ ...filters, price_change_percentage_24h: e.target.value })}
        className="px-2 py-1 border rounded"
      >
        <option value="">24h %</option>
        <option value="gt0">Gainers</option>
        <option value="lt0">Losers</option>
      </select>
      <select
        value={filters.volume || ''}
        onChange={e => setFilters({ ...filters, volume: e.target.value })}
        className="px-2 py-1 border rounded"
      >
        <option value="">Volume</option>
        <option value="gt100M">{'>'} $100M</option>
        <option value="gt1B">{'>'} $1B</option>
      </select>
    </div>
  );
}
