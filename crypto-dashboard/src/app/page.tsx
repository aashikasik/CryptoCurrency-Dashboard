"use client";
import { useEffect, useState } from 'react';
import { fetchMarkets } from '@/lib/coingecko';
function TrendingBanner({ coins }: { coins: Coin[] }) {
  if (!coins.length) return null;
  const gainers = [...coins].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 5);
  const losers = [...coins].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 5);
  return (
    <div className="mb-4">
      <div className="font-semibold mb-1">Trending</div>
      <div className="flex gap-4 overflow-x-auto">
        <div>
          <div className="text-green-600 font-bold text-xs mb-1">Top Gainers</div>
          <div className="flex gap-2">
            {gainers.map((coin) => (
              <div key={coin.id} className="flex items-center gap-1 px-2 py-1 bg-green-50 rounded text-xs">
                <CoinIcon src={coin.image} alt={coin.name} />
                <Link href={`/coin/${coin.id}`} className="font-semibold hover:underline">{coin.symbol.toUpperCase()}</Link>
                <span>{coin.price_change_percentage_24h?.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-red-500 font-bold text-xs mb-1">Top Losers</div>
          <div className="flex gap-2">
            {losers.map((coin) => (
              <div key={coin.id} className="flex items-center gap-1 px-2 py-1 bg-red-50 rounded text-xs">
                <CoinIcon src={coin.image} alt={coin.name} />
                <Link href={`/coin/${coin.id}`} className="font-semibold hover:underline">{coin.symbol.toUpperCase()}</Link>
                <span>{coin.price_change_percentage_24h?.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
import { Coin } from '@/types/coin';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { useRef } from 'react';
import Link from 'next/link';
import { useDebounce } from '@/hooks/useDebounce';
import { isWatched, toggleWatchlist } from '@/lib/watchlist';

function GlobalSearchBar({ onSearch }: { onSearch: (v: string) => void }) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        ref.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md">
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={e => { setValue(e.target.value); onSearch(e.target.value); }}
        placeholder="Global Search (Ctrl+K)"
        className="w-full px-4 py-2 rounded shadow border bg-white dark:bg-gray-900 dark:text-white"
      />
    </div>
  );
}
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import CoinIcon from '@/components/CoinIcon';
import StarButton from '@/components/StarButton';
import TableHeader from '@/components/TableHeader';
import Pagination from '@/components/Pagination';
import SearchInput from '@/components/SearchInput';
import Filters from '@/components/Filters';

interface FiltersType {
  market_cap_rank?: string;
  price_change_percentage_24h?: string;
  volume?: string;
  [key: string]: string | undefined;
}

export default function Home() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [globalSearch, setGlobalSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FiltersType>({});
  const [totalPages, setTotalPages] = useState(20); // CoinGecko max 1000 coins

  const debouncedSearch = useDebounce(search, 400);

  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    setLoading(true);
    setError('');
    fetchMarkets(page, 50, globalSearch || debouncedSearch, filters)
      .then((data) => {
        setCoins(data);
        setLoading(false);
        setTotalPages(20); // You can calculate based on total coins if needed
      })
      .catch(() => {
        setError('Failed to fetch coins.');
        setLoading(false);
      });
  }, [page, debouncedSearch, filters, refresh, globalSearch]);

  return (
    <div className="max-w-6xl mx-auto p-4 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-bold">Crypto Markets</h1>
      </div>
      <GlobalSearchBar onSearch={setGlobalSearch} />
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <SearchInput value={search} onChange={setSearch} />
        <Filters filters={filters} setFilters={setFilters} />
      </div>
      {loading ? (
        <div className="space-y-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-6 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" style={{animationDuration:'1.2s'}} />
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} />
      ) : coins.length === 0 ? (
        <EmptyState message="No coins found." />
      ) : (
        <>
          <TrendingBanner coins={coins} />
          <div className="overflow-x-auto rounded shadow">
            <table className="min-w-full text-sm">
              <TableHeader />
              <tbody>
                {coins.map((coin) => (
                  <tr key={coin.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-2 py-2">{coin.market_cap_rank}</td>
                    <td className="px-2 py-2 flex items-center gap-2">
                      <CoinIcon src={coin.image} alt={coin.name} />
                      <Link href={`/coin/${coin.id}`} className="font-semibold hover:underline">
                        {coin.name}
                      </Link>
                      <span className="uppercase text-xs text-gray-400">{coin.symbol}</span>
                    </td>
                    <td className="px-2 py-2 text-right">${coin.current_price.toLocaleString()}</td>
                    <td className={`px-2 py-2 text-right ${coin.price_change_percentage_24h > 0 ? 'text-green-600' : 'text-red-500'}`}>{coin.price_change_percentage_24h?.toFixed(2)}%</td>
                    <td className="px-2 py-2 text-right">${coin.market_cap.toLocaleString()}</td>
                    <td className="px-2 py-2 text-right">${coin.total_volume.toLocaleString()}</td>
                    <td className="px-2 py-2 text-center">
                      <StarButton starred={isWatched(coin.id)} onClick={() => { toggleWatchlist(coin.id); setRefresh(r => r + 1); }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
