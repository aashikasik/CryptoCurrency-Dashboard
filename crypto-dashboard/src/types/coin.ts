export type Coin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
};

export type CoinDetail = Coin & {
  description: { en: string };
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  high_24h: number;
  low_24h: number;
};

export type MarketChart = {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
};
