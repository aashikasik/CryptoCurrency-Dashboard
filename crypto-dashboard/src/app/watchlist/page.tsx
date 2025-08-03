"use client";
import { fetchMarkets } from '@/lib/coingecko';
import { Coin } from '@/types/coin';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';
import EmptyState from '@/components/EmptyState';
import CoinIcon from '@/components/CoinIcon';
import StarButton from '@/components/StarButton';
import TableHeader from '@/components/TableHeader';
import Pagination from '@/components/Pagination';
import { isWatched, toggleWatchlist } from '@/lib/watchlist';
import { useEffect, useState } from 'react';

export default function WatchlistPage() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const ids = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('crypto_watchlist') || '[]') : [];
    if (!ids.length) {
      setCoins([]);
      setTotalPages(1);
      return;
    }
    setLoading(true);
    setError('');
    fetchMarkets(page, 50, ids.join(','), {})
      .then((data) => {
        setCoins(data);
        setLoading(false);
        setTotalPages(Math.ceil(ids.length / 50));
      })
      .catch(() => {
        setError('Failed to fetch watchlist coins.');
        setLoading(false);
      });
  }, [page, refresh]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Watchlist</h1>
      {loading ? (
        <LoadingSkeleton rows={10} />
      ) : error ? (
        <ErrorState message={error} />
      ) : coins.length === 0 ? (
        <EmptyState message="Your watchlist is empty." />
      ) : (
        <div className="overflow-x-auto rounded shadow">
          <table className="min-w-full text-sm">
            <TableHeader />
            <tbody>
              {coins.map((coin) => (
                <tr key={coin.id} className="border-b hover:bg-gray-50">
                  <td className="px-2 py-2">{coin.market_cap_rank}</td>
                  <td className="px-2 py-2 flex items-center gap-2">
                    <CoinIcon src={coin.image} alt={coin.name} />
                    <span className="font-semibold">{coin.name}</span>
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
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
  }
