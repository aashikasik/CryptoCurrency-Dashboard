export const fetchMarkets = async (page = 1, perPage = 50, search = '', filters = {}) => {
  const params: any = {
    endpoint: 'coins/markets',
    vs_currency: 'usd',
    order: 'market_cap_desc',
    per_page: perPage,
    page,
    sparkline: false,
    price_change_percentage: '24h',
  };
  if (search) params.ids = search;
  Object.assign(params, filters);
  const url = `/api/coingecko?${new URLSearchParams(params).toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch markets');
  return await res.json();
};

export const fetchCoinDetail = async (id: string) => {
  const params: any = {
    endpoint: `coins/${id}`,
    localization: 'false',
    tickers: 'false',
    market_data: 'true',
    community_data: 'false',
    developer_data: 'false',
    sparkline: 'false',
  };
  const url = `/api/coingecko?${new URLSearchParams(params).toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch coin detail');
  return await res.json();
};

export const fetchMarketChart = async (id: string, days: number) => {
  const params: any = {
    endpoint: `coins/${id}/market_chart`,
    vs_currency: 'usd',
    days,
  };
  const url = `/api/coingecko?${new URLSearchParams(params).toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch market chart');
  return await res.json();
};
