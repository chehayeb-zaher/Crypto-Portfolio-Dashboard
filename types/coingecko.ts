/**
 * Shape of a single entry returned by CoinGecko's
 * GET /coins/markets endpoint.
 *
 * Reference: https://docs.coingecko.com/reference/coins-markets
 */
export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number | null;
  low_24h: number | null;
  price_change_24h: number | null;
  price_change_percentage_24h: number | null;
  market_cap_change_24h: number | null;
  market_cap_change_percentage_24h: number | null;
  circulating_supply: number | null;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: {
    times: number;
    currency: string;
    percentage: number;
  } | null;
  last_updated: string;
  // Present because the request asks for price_change_percentage=24h,7d,30d
  price_change_percentage_24h_in_currency?: number | null;
  price_change_percentage_7d_in_currency?: number | null;
  price_change_percentage_30d_in_currency?: number | null;
}

export type CoinMarketsResponse = CoinMarketData[];

/** The dashboard's two independently-sortable coin groups. */
export interface DashboardCoins {
  top: CoinMarketData[];
  meme: CoinMarketData[];
}

/**
 * Subset of CoinGecko's GET /coins/{id} response — only the fields
 * this app's detail page uses (the full payload is much larger).
 *
 * Reference: https://docs.coingecko.com/reference/coins-id
 */
export interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  categories: string[];
  description: { en: string };
  links: {
    homepage: string[];
    subreddit_url: string | null;
    twitter_screen_name: string | null;
  };
  image: { thumb: string; small: string; large: string };
  market_cap_rank: number | null;
  market_data: {
    current_price: { usd: number };
    market_cap: { usd: number };
    total_volume: { usd: number };
    high_24h: { usd: number };
    low_24h: { usd: number };
    circulating_supply: number | null;
    total_supply: number | null;
    max_supply: number | null;
    ath: { usd: number };
    ath_change_percentage: { usd: number };
    ath_date: { usd: string };
    atl: { usd: number };
    atl_change_percentage: { usd: number };
    price_change_percentage_24h: number | null;
    price_change_percentage_7d: number | null;
    price_change_percentage_30d: number | null;
  };
}
