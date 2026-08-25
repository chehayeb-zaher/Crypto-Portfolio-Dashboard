"use client";

import { useMemo, useState } from "react";
import type { CoinMarketData } from "@/types/coingecko";
import type { Holding } from "@/lib/holdings";
import CoinTable, { type SortDirection, type SortKey } from "@/components/CoinTable";
import { filterAndSortCoins } from "@/lib/coinSort";

export default function CoinSection({
  title,
  coins,
  query,
  holdings,
  onAmountChange,
  onEntryChange,
}: {
  title: string;
  coins: CoinMarketData[];
  query: string;
  holdings: Record<string, Holding>;
  onAmountChange: (coinId: string, amount: number) => void;
  onEntryChange: (
    coinId: string,
    entryPrice: number | null,
    entryDate: string | null
  ) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }

  const visibleCoins = useMemo(
    () => filterAndSortCoins(coins, query, sortKey, sortDirection, holdings),
    [coins, query, sortKey, sortDirection, holdings]
  );

  return (
    <section className="mb-14">
      <h2 className="font-display mb-5 text-2xl uppercase tracking-wide text-ink">
        {title}
      </h2>

      <CoinTable
        coins={visibleCoins}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
        holdings={holdings}
        onAmountChange={onAmountChange}
        onEntryChange={onEntryChange}
      />

      {visibleCoins.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted">
          No coins match “{query}”.
        </p>
      )}
    </section>
  );
}
