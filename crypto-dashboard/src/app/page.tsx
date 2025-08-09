"use client";
import { useEffect, useState } from 'react';
import { fetchMarkets } from '@/lib/coingecko';
import { Line } from 'react-chartjs-2';
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale } from 'chart.js';
Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale);
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
// ...existing code...
import Link from 'next/link';
import { useDebounce } from '@/hooks/useDebounce';
import { isWatched, toggleWatchlist } from '@/lib/watchlist';

// ...GlobalSearchBar component removed...
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FiltersType>({});
  const [totalPages, setTotalPages] = useState(20); // CoinGecko max 1000 coins

  const debouncedSearch = useDebounce(search, 400);

  const [refresh, setRefresh] = useState(0);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareCoins, setCompareCoins] = useState<Coin[]>([]);
  const [compareSearch, setCompareSearch] = useState('');
  const [compareSearchResults, setCompareSearchResults] = useState<Coin[]>([]);
  const [compareStats, setCompareStats] = useState<string[]>(['current_price', 'price_change_percentage_24h', 'market_cap', 'total_volume']);
  const [compareSummary, setCompareSummary] = useState('');
  const [compareCharts, setCompareCharts] = useState<Record<string, number[]>>({});
  // Fetch sparkline chart data for compared coins
  useEffect(() => {
    async function fetchCharts() {
      const charts: Record<string, number[]> = {};
      for (const coin of compareCoins) {
        try {
          const chart = await fetch(`/api/coingecko?endpoint=coins/${coin.id}/market_chart&vs_currency=usd&days=7`).then(r => r.json());
          charts[coin.id] = chart.prices.map((p: [number, number]) => p[1]);
        } catch {
          charts[coin.id] = [];
        }
      }
      setCompareCharts(charts);
    }
    if (compareCoins.length > 0) fetchCharts();
  }, [compareCoins]);
  // Generate summary sentence
  useEffect(() => {
    if (compareCoins.length < 2) {
      setCompareSummary('');
      return;
    }
    let summary = '';
    const bestMarketCap = compareCoins.reduce((a, b) => a.market_cap > b.market_cap ? a : b);
    const best24h = compareCoins.reduce((a, b) => a.price_change_percentage_24h > b.price_change_percentage_24h ? a : b);
    summary += `${bestMarketCap.name} has the highest market cap. `;
    summary += `${best24h.name} has the best 24h performance.`;
    setCompareSummary(summary);
  }, [compareCoins]);

  useEffect(() => {
    if (compareIds.length === 0) {
      setCompareCoins([]);
      return;
    }
    fetchMarkets(1, compareIds.length, compareIds.join(','), {})
      .then(setCompareCoins)
      .catch(() => setCompareCoins([]));
  }, [compareIds]);

  useEffect(() => {
    if (!compareSearch.trim()) {
      setCompareSearchResults([]);
      return;
    }
    fetchMarkets(1, 5, compareSearch, {})
      .then(setCompareSearchResults)
      .catch(() => setCompareSearchResults([]));
  }, [compareSearch]);
  useEffect(() => {
    setLoading(true);
    setError('');
    fetchMarkets(page, 50, debouncedSearch, filters)
      .then((data) => {
        setCoins(data);
        setLoading(false);
        setTotalPages(20); // You can calculate based on total coins if needed
      })
      .catch(() => {
        setError('Failed to fetch coins.');
        setLoading(false);
      });
  }, [page, debouncedSearch, filters, refresh]);

  return (
    <div className="max-w-6xl mx-auto p-4 dark:bg-gray-900 min-h-screen transition-colors relative">
      <div className="flex items-center mb-4">
        <h1 className="text-2xl font-bold">Crypto Market Lists</h1>
      </div>
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
                    <td className="px-2 py-2 text-center flex gap-2 justify-center">
                      <StarButton starred={isWatched(coin.id)} onClick={() => { toggleWatchlist(coin.id); setRefresh(r => r + 1); }} />
                      <button
                        className={`px-2 py-1 rounded text-xs border ${compareIds.includes(coin.id) ? 'bg-blue-200 border-blue-400' : 'bg-gray-100 border-gray-300'}`}
                        onClick={() => {
                          setCompareIds(ids => ids.includes(coin.id) ? ids.filter(id => id !== coin.id) : [...ids, coin.id]);
                        }}
                      >
                        {compareIds.includes(coin.id) ? '✓ Compare' : 'Compare'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Coin Comparison Section - Card Based, Mobile Friendly, Advanced Features */}
      <div className="mt-10">
        <div className="bg-white dark:bg-gray-900 rounded shadow p-4">
          <h2 className="text-lg font-bold mb-4">Compare Coins</h2>
          <div className="mb-4 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={compareSearch}
              onChange={e => setCompareSearch(e.target.value)}
              placeholder="Search coins to compare..."
              className="px-4 py-2 rounded border bg-white dark:bg-gray-900 dark:text-white text-sm w-full sm:w-64"
            />
            {compareSearch && compareSearchResults.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded shadow p-2 flex flex-col gap-1 max-h-40 overflow-y-auto">
                {compareSearchResults.map(coin => (
                  <button
                    key={coin.id}
                    className={`flex items-center gap-2 px-2 py-1 rounded text-left w-full ${compareIds.includes(coin.id) ? 'bg-blue-200 dark:bg-blue-900' : ''}`}
                    onClick={() => {
                      setCompareIds(ids => ids.includes(coin.id) ? ids : [...ids, coin.id]);
                      setCompareSearch('');
                    }}
                  >
                    <CoinIcon src={coin.image} alt={coin.name} />
                    <span className="font-semibold text-xs sm:text-sm">{coin.name}</span>
                    <span className="uppercase text-xs text-gray-400">{coin.symbol}</span>
                    <span className="text-xs text-gray-600 dark:text-gray-300">${coin.current_price.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Customizable stats */}
          <div className="mb-4 flex flex-wrap gap-2">
            {['current_price', 'price_change_percentage_24h', 'market_cap', 'total_volume'].map(stat => (
              <button
                key={stat}
                className={`px-2 py-1 rounded border text-xs ${compareStats.includes(stat) ? 'bg-blue-200 border-blue-400' : 'bg-gray-100 border-gray-300'}`}
                onClick={() => setCompareStats(stats => stats.includes(stat) ? stats.filter(s => s !== stat) : [...stats, stat])}
              >
                {stat === 'current_price' ? 'Price' : stat === 'price_change_percentage_24h' ? '24h %' : stat === 'market_cap' ? 'Market Cap' : 'Volume'}
              </button>
            ))}
            <button className="px-2 py-1 rounded border text-xs bg-red-100 border-red-400" onClick={() => setCompareIds([])}>Reset</button>
          </div>
          {/* Comparison summary */}
          {compareSummary && (
            <div className="mb-4 text-sm font-semibold text-blue-700 dark:text-blue-300">{compareSummary}</div>
          )}
          {/* Export/Share button */}
          {compareIds.length > 1 && (
            <button
              className="mb-4 px-4 py-2 rounded bg-green-500 text-white text-xs font-bold"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href + '#compare=' + compareIds.join(','));
                alert('Comparison link copied!');
              }}
            >Share Comparison</button>
          )}
          {/* Coin cards with advanced features */}
          {compareIds.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {compareCoins.map(coin => {
                // Highlight best/worst
                const best = {
                  price: Math.max(...compareCoins.map(c => c.current_price)),
                  change: Math.max(...compareCoins.map(c => c.price_change_percentage_24h)),
                  cap: Math.max(...compareCoins.map(c => c.market_cap)),
                  vol: Math.max(...compareCoins.map(c => c.total_volume)),
                };
                const worst = {
                  price: Math.min(...compareCoins.map(c => c.current_price)),
                  change: Math.min(...compareCoins.map(c => c.price_change_percentage_24h)),
                  cap: Math.min(...compareCoins.map(c => c.market_cap)),
                  vol: Math.min(...compareCoins.map(c => c.total_volume)),
                };
                return (
                  <div key={coin.id} className="min-w-[220px] max-w-xs bg-gray-50 dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col items-center relative">
                    <button
                      className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-red-200 dark:bg-red-900"
                      onClick={() => setCompareIds(ids => ids.filter(id => id !== coin.id))}
                    >Remove</button>
                    <CoinIcon src={coin.image} alt={coin.name} />
                    <Link href={`/coin/${coin.id}`} className="font-bold text-base mt-2 mb-1 hover:underline text-center">{coin.name}</Link>
                    <span className="uppercase text-xs text-gray-400 mb-2">{coin.symbol}</span>
                    {/* Sparkline chart */}
                    {compareCharts[coin.id] && compareCharts[coin.id].length > 0 && (
                      <div className="w-full h-16 mb-2">
                        <Line
                          data={{
                            labels: compareCharts[coin.id].map((_, i) => i),
                            datasets: [{
                              data: compareCharts[coin.id],
                              borderColor: '#3b82f6',
                              backgroundColor: 'rgba(59,130,246,0.1)',
                              pointRadius: 0,
                              fill: true,
                              tension: 0.3,
                            }],
                          }}
                          options={{
                            responsive: true,
                            plugins: { legend: { display: false } },
                            scales: { x: { display: false }, y: { display: false } },
                          }}
                        />
                      </div>
                    )}
                    <div className="w-full flex flex-col gap-1 text-sm">
                      {compareStats.includes('current_price') && (
                        <div className="flex justify-between">
                          <span>Price:</span>
                          <span className={coin.current_price === best.price ? 'text-green-600 font-bold' : coin.current_price === worst.price ? 'text-red-500 font-bold' : ''}>
                            ${coin.current_price.toLocaleString()}
                            {compareCoins.length > 1 && (
                              <span className="ml-1 text-xs text-gray-500">{coin.current_price === best.price ? 'Best' : coin.current_price === worst.price ? 'Worst' : ''}</span>
                            )}
                          </span>
                        </div>
                      )}
                      {compareStats.includes('price_change_percentage_24h') && (
                        <div className="flex justify-between">
                          <span>24h %:</span>
                          <span className={coin.price_change_percentage_24h === best.change ? 'text-green-600 font-bold' : coin.price_change_percentage_24h === worst.change ? 'text-red-500 font-bold' : ''}>
                            {coin.price_change_percentage_24h?.toFixed(2)}%
                            {compareCoins.length > 1 && (
                              <span className="ml-1 text-xs text-gray-500">{coin.price_change_percentage_24h === best.change ? 'Best' : coin.price_change_percentage_24h === worst.change ? 'Worst' : ''}</span>
                            )}
                          </span>
                        </div>
                      )}
                      {compareStats.includes('market_cap') && (
                        <div className="flex justify-between">
                          <span>Market Cap:</span>
                          <span className={coin.market_cap === best.cap ? 'text-green-600 font-bold' : coin.market_cap === worst.cap ? 'text-red-500 font-bold' : ''}>
                            ${coin.market_cap.toLocaleString()}
                            {compareCoins.length > 1 && (
                              <span className="ml-1 text-xs text-gray-500">{coin.market_cap === best.cap ? 'Best' : coin.market_cap === worst.cap ? 'Worst' : ''}</span>
                            )}
                          </span>
                        </div>
                      )}
                      {compareStats.includes('total_volume') && (
                        <div className="flex justify-between">
                          <span>Volume:</span>
                          <span className={coin.total_volume === best.vol ? 'text-green-600 font-bold' : coin.total_volume === worst.vol ? 'text-red-500 font-bold' : ''}>
                            ${coin.total_volume.toLocaleString()}
                            {compareCoins.length > 1 && (
                              <span className="ml-1 text-xs text-gray-500">{coin.total_volume === best.vol ? 'Best' : coin.total_volume === worst.vol ? 'Worst' : ''}</span>
                            )}
                          </span>
                        </div>
                      )}
                      {/* Stat difference */}
                      {compareCoins.length > 1 && (
                        <div className="mt-2 text-xs text-gray-500">
                          {compareStats.map(stat => {
                            const statValueRaw = coin[stat as keyof Coin];
                            const statValue = typeof statValueRaw === 'number' ? statValueRaw : Number(statValueRaw);
                            const others = compareCoins
                              .filter(c => c.id !== coin.id)
                              .map(c => c[stat as keyof Coin])
                              .map(v => typeof v === 'number' ? v : Number(v))
                              .filter(v => !isNaN(v));
                            if (typeof statValue === 'number' && others.length > 0) {
                              const avg = others.reduce((a, b) => a + b, 0) / others.length;
                              const diff = statValue - avg;
                              return (
                                <div key={stat}>{stat === 'current_price' ? 'Price' : stat === 'price_change_percentage_24h' ? '24h %' : stat === 'market_cap' ? 'Market Cap' : 'Volume'} diff: {diff > 0 ? '+' : ''}{diff.toFixed(2)} vs avg</div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
