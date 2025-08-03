import axios from 'axios';
import { NextResponse } from 'next/server';

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;
const BASE_URL = 'https://api.coingecko.com/api/v3';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
  }
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (key !== 'endpoint') params[key] = value;
  });
  try {
    const { data } = await axios.get(`${BASE_URL}/${endpoint}`, {
      params,
      headers: COINGECKO_API_KEY ? { 'x-cg-pro-api-key': COINGECKO_API_KEY } : {},
    });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('CoinGecko API error:', error?.response?.data || error.message);
    return NextResponse.json({ error: error?.response?.data || error.message }, { status: 500 });
  }
}
