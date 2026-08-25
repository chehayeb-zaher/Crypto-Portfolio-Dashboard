import type { CoinMarketData } from "@/types/coingecko";
import type { SortDirection, SortKey } from "@/components/CoinTable";
import type { Holding } from "@/lib/holdings";

function valueFor(
  coin: CoinMarketData,
  sortKey: SortKey,
  holdings: Record<string, Holding>
): number | string {
  switch (sortKey) {
    case "rank":
      return coin.market_cap_rank ?? Number.MAX_SAFE_INTEGER;
    case "name":
      return coin.name.toLowerCase();
    case "price":
      return coin.current_price;
    case "change24h":
      return coin.price_change_percentage_24h_in_currency ?? -Infinity;
    case "change7d":
      return coin.price_change_percentage_7d_in_currency ?? -Infinity;
    case "change30d":
      return coin.price_change_percentage_30d_in_currency ?? -Infinity;
    case "marketCap":
      return coin.market_cap;
    case "roi": {
      const entryPrice = holdings[coin.id]?.entryPrice;
      if (!entryPrice) return -Infinity;
      return ((coin.current_price - entryPrice) / entryPrice) * 100;
    }
  }
}

export function filterAndSortCoins(
  coins: CoinMarketData[],
  query: string,
  sortKey: SortKey,
  sortDirection: SortDirection,
  holdings: Record<string, Holding>
): CoinMarketData[] {
  const q = query.trim().toLowerCase();
  const filtered = q
    ? coins.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q)
      )
    : coins;

  return [...filtered].sort((a, b) => {
    const av = valueFor(a, sortKey, holdings);
    const bv = valueFor(b, sortKey, holdings);
    const cmp =
      typeof av === "string" && typeof bv === "string"
        ? av.localeCompare(bv)
        : (av as number) - (bv as number);
    return sortDirection === "asc" ? cmp : -cmp;
  });
}
