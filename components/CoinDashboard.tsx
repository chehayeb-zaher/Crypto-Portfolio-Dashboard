"use client";

import { useEffect, useState } from "react";
import type { DashboardCoins } from "@/types/coingecko";
import { EMPTY_HOLDING, loadHoldings, saveHoldings, type Holding } from "@/lib/holdings";
import CoinSection from "@/components/CoinSection";
import PortfolioModal from "@/components/PortfolioModal";
import type { ChangeColumnKey, ColumnVisibility } from "@/components/CoinTable";

const REFRESH_INTERVAL_MS = 30_000;

const CHANGE_COLUMNS: { key: ChangeColumnKey; label: string }[] = [
  { key: "change24h", label: "24H" },
  { key: "change7d", label: "7D" },
  { key: "change30d", label: "30D" },
];

export default function CoinDashboard({
  initialData,
}: {
  initialData: DashboardCoins;
}) {
  const [data, setData] = useState(initialData);
  const [query, setQuery] = useState("");
  // null = not yet loaded from localStorage; distinguishes "no holdings saved"
  // from "haven't checked yet", so the save effect can't run before the load
  // effect has actually populated real data (a load/save race otherwise
  // wipes out saved holdings on every reload, especially under Strict Mode's
  // double-invoked effects in development).
  const [holdings, setHoldings] = useState<Record<string, Holding> | null>(null);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    change24h: true,
    change7d: true,
    change30d: true,
  });

  function toggleColumn(key: ChangeColumnKey) {
    setColumnVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  useEffect(() => {
    setHoldings(loadHoldings());
  }, []);

  useEffect(() => {
    if (holdings === null) return;
    saveHoldings(holdings);
  }, [holdings]);

  function handleAmountChange(coinId: string, amount: number) {
    setHoldings((prev) => ({
      ...prev,
      [coinId]: { ...(prev?.[coinId] ?? EMPTY_HOLDING), amount },
    }));
  }

  function handleEntryChange(
    coinId: string,
    entryPrice: number | null,
    entryDate: string | null
  ) {
    setHoldings((prev) => ({
      ...prev,
      [coinId]: { ...(prev?.[coinId] ?? EMPTY_HOLDING), entryPrice, entryDate },
    }));
  }

  async function refresh() {
    try {
      const res = await fetch("/api/coins", { cache: "no-store" });
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      // Keep showing the last good data if a refresh fails.
    }
  }

  useEffect(() => {
    const id = setInterval(refresh, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <div className="mb-10 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-xs">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search coins..."
            className="w-full rounded-lg border border-line bg-white py-2.5 pl-10 pr-4 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Show:
            </span>
            {CHANGE_COLUMNS.map((col) => (
              <button
                key={col.key}
                onClick={() => toggleColumn(col.key)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  columnVisibility[col.key]
                    ? "border-primary bg-primary text-white"
                    : "border-line bg-white text-muted hover:text-ink"
                }`}
              >
                {col.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsPortfolioOpen(true)}
            className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-opacity hover:opacity-90"
          >
            Portfolio
          </button>
        </div>
      </div>

      <CoinSection
        title="Top 10 Coins"
        coins={data.top}
        query={query}
        holdings={holdings ?? {}}
        onAmountChange={handleAmountChange}
        onEntryChange={handleEntryChange}
        columnVisibility={columnVisibility}
      />

      <CoinSection
        title="Top 10 Meme Coins"
        coins={data.meme}
        query={query}
        holdings={holdings ?? {}}
        onAmountChange={handleAmountChange}
        onEntryChange={handleEntryChange}
        columnVisibility={columnVisibility}
      />

      {isPortfolioOpen && (
        <PortfolioModal
          coins={[...data.top, ...data.meme]}
          holdings={holdings ?? {}}
          onClose={() => setIsPortfolioOpen(false)}
        />
      )}
    </div>
  );
}
