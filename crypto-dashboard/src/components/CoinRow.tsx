import React from 'react';
import { Coin } from '../types/coin';
import CoinIcon from './CoinIcon';
import StarButton from './StarButton';
import Link from 'next/link';

interface CoinRowProps {
  coin: Coin;
  starred: boolean;
  onStar: () => void;
}

export default function CoinRow({ coin, starred, onStar }: CoinRowProps) {
  return (
    <tr className="hover:bg-gray-50 transition">
      <td className="px-2 py-2">{coin.market_cap_rank}</td>
      <td className="px-2 py-2 flex items-center gap-2">
        <CoinIcon src={coin.image} alt={coin.name} />
        <Link href={`/coin/${coin.id}`} className="font-medium hover:underline">{coin.name}</Link>
        <span className="text-xs text-gray-400">{coin.symbol.toUpperCase()}</span>
      </td>
      <td className="px-2 py-2 text-right">${coin.current_price.toLocaleString()}</td>
      <td className={`px-2 py-2 text-right ${coin.price_change_percentage_24h > 0 ? 'text-green-500' : 'text-red-500'}`}>{coin.price_change_percentage_24h.toFixed(2)}%</td>
      <td className="px-2 py-2 text-right">${coin.market_cap.toLocaleString()}</td>
      <td className="px-2 py-2 text-right">${coin.total_volume.toLocaleString()}</td>
      <td className="px-2 py-2 text-center">
        <StarButton starred={starred} onClick={onStar} />
      </td>
    </tr>
  );
}
