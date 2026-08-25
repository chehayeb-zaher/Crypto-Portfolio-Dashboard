import type { CoinDetail, CoinMarketsResponse, DashboardCoins } from "@/types/coingecko";

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";

async function fetchMarkets(
  extraParams: string,
  perPage: number
): Promise<CoinMarketsResponse> {
  const url =
    `${COINGECKO_BASE}/coins/markets` +
    "?vs_currency=usd" +
    "&order=market_cap_desc" +
    `&per_page=${perPage}` +
    "&page=1" +
    "&sparkline=false" +
    "&price_change_percentage=24h,7d,30d" +
    extraParams;

  const res = await fetch(url, { next: { revalidate: 30 } });

  if (!res.ok) {
    throw new Error(
      `CoinGecko request failed: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<CoinMarketsResponse>;
}

/**
 * Server-side fetch of the dashboard's two coin groups: the top 10 coins
 * by overall market cap, and the top 10 meme coins by market cap.
 * Runs on the server, so the CoinGecko requests never touch the client.
 */
export async function getTopCoins(): Promise<DashboardCoins> {
  const [top, memeCoins] = await Promise.all([
    fetchMarkets("", 10),
    // Fetch a few extra meme coins in case any also land in the top 10
    // overall (e.g. Dogecoin), so we still end up with 10 unique ones.
    fetchMarkets("&category=meme-token", 15),
  ]);

  const topIds = new Set(top.map((c) => c.id));
  const meme = memeCoins.filter((c) => !topIds.has(c.id)).slice(0, 10);

  return { top, meme };
}

/**
 * Server-side fetch of full detail for a single coin, by CoinGecko id
 * (e.g. "bitcoin").
 */
export async function getCoinDetail(id: string): Promise<CoinDetail> {
  const url =
    `${COINGECKO_BASE}/coins/${encodeURIComponent(id)}` +
    "?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false";

  const res = await fetch(url, { next: { revalidate: 60 } });

  if (!res.ok) {
    throw new Error(
      `CoinGecko request failed: ${res.status} ${res.statusText}`
    );
  }

  return res.json() as Promise<CoinDetail>;
}
