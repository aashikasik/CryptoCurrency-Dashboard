"use client";
import { fetchCoinDetail, fetchMarketChart } from '@/lib/coingecko';
import { CoinDetail, MarketChart } from '@/types/coin';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';
import CoinIcon from '@/components/CoinIcon';
import StarButton from '@/components/StarButton';
import { isWatched, toggleWatchlist } from '@/lib/watchlist';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);


function PriceChart({ chart }: { chart: MarketChart }) {
  if (!chart?.prices) return null;
  const data = {
    labels: chart.prices.map(([ts]) => new Date(ts).toLocaleDateString()),
    datasets: [
      {
        label: 'Price (USD)',
        data: chart.prices.map(([, price]) => price),
        borderColor: 'rgb(34,197,94)',
        backgroundColor: 'rgba(34,197,94,0.1)',
        fill: true,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: { display: false },
      y: { display: true },
    },
  };
  return <Line data={data} options={options} height={250} />;
}

export default function CoinDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [coin, setCoin] = useState<CoinDetail | null>(null);
  const [chart, setChart] = useState<MarketChart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState(7);

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      fetchCoinDetail(id),
      fetchMarketChart(id, range),
    ])
      .then(([coinData, chartData]) => {
        setCoin(coinData);
        setChart(chartData);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch coin details.');
        setLoading(false);
      });
  }, [id, range]);

  if (loading) return <LoadingSkeleton rows={8} />;
  if (error) return <ErrorState message={error} />;
  if (!coin) return <ErrorState message="Coin not found." />;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex items-center gap-4 mb-4">
        <CoinIcon src={coin.image} alt={coin.name} />
        <h1 className="text-2xl font-bold">{coin.name} <span className="uppercase text-gray-400">{coin.symbol}</span></h1>
        <StarButton starred={isWatched(coin.id)} onClick={() => toggleWatchlist(coin.id)} />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-lg font-semibold">${coin.current_price !== undefined ? coin.current_price.toLocaleString() : '-'}</div>
          <div className="text-sm text-gray-500">Rank: {coin.market_cap_rank ?? '-'}</div>
          <div className="text-sm text-gray-500">Market Cap: ${coin.market_cap !== undefined ? coin.market_cap.toLocaleString() : '-'}</div>
          <div className="text-sm text-gray-500">Volume: ${coin.total_volume !== undefined ? coin.total_volume.toLocaleString() : '-'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Supply: {coin.circulating_supply !== undefined ? coin.circulating_supply.toLocaleString() : '-'} / {coin.total_supply !== undefined ? coin.total_supply.toLocaleString() : 'N/A'} / {coin.max_supply !== undefined ? coin.max_supply.toLocaleString() : 'N/A'}</div>
          <div className="text-sm text-gray-500">24h High: ${coin.high_24h !== undefined ? coin.high_24h.toLocaleString() : '-'}</div>
          <div className="text-sm text-gray-500">24h Low: ${coin.low_24h !== undefined ? coin.low_24h.toLocaleString() : '-'}</div>
        </div>
      </div>
      <div className="mb-4">
        <label className="font-semibold mr-2">Chart Range:</label>
        <select value={range} onChange={e => setRange(Number(e.target.value))} className="px-2 py-1 border rounded">
          <option value={1}>24h</option>
          <option value={7}>7d</option>
          <option value={30}>30d</option>
          <option value={90}>90d</option>
        </select>
      </div>
      {chart ? <PriceChart chart={chart} /> : <LoadingSkeleton rows={4} />}
      <div className="mt-6 text-gray-700 text-sm" dangerouslySetInnerHTML={{ __html: coin.description?.en || '' }} />
    </div>
  );
}
