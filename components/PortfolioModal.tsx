"use client";

import { useMemo } from "react";
import Image from "next/image";
import type { CoinMarketData } from "@/types/coingecko";
import type { Holding } from "@/lib/holdings";

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

const PALETTE = [
  "#3861FB",
  "#6E56CF",
  "#0EA5E9",
  "#F5A524",
  "#EF6461",
  "#2A9D8F",
  "#8D5B4C",
  "#7C90A0",
];
const OTHERS_COLOR = "#C9C6D9";
const MAX_SLICES = 8;

interface PortfolioRow {
  coin: CoinMarketData;
  invested: number;
  entryPrice: number;
  units: number;
  value: number;
  roiPct: number;
}

export default function PortfolioModal({
  coins,
  holdings,
  onClose,
}: {
  coins: CoinMarketData[];
  holdings: Record<string, Holding>;
  onClose: () => void;
}) {
  const rows: PortfolioRow[] = useMemo(() => {
    return coins
      .map((coin) => {
        const h = holdings[coin.id];
        if (!h || !h.amount || !h.entryPrice) return null;
        const units = h.amount / h.entryPrice;
        const value = units * coin.current_price;
        const roiPct = ((coin.current_price - h.entryPrice) / h.entryPrice) * 100;
        const row: PortfolioRow = {
          coin,
          invested: h.amount,
          entryPrice: h.entryPrice,
          units,
          value,
          roiPct,
        };
        return row;
      })
      .filter((r): r is PortfolioRow => r !== null)
      .sort((a, b) => b.value - a.value);
  }, [coins, holdings]);

  const totalValue = rows.reduce((sum, r) => sum + r.value, 0);
  const totalInvested = rows.reduce((sum, r) => sum + r.invested, 0);
  const totalChangeDollar = rows.reduce(
    (sum, r) =>
      sum +
      r.value * ((r.coin.price_change_percentage_24h_in_currency ?? 0) / 100),
    0
  );
  const totalChangePct =
    totalValue > 0 ? (totalChangeDollar / totalValue) * 100 : 0;

  const slices = rows.slice(0, MAX_SLICES);
  const othersValue = rows.slice(MAX_SLICES).reduce((sum, r) => sum + r.value, 0);

  let cumulative = 0;
  const gradientStops = slices
    .map((r, i) => {
      const pct = totalValue > 0 ? (r.value / totalValue) * 100 : 0;
      const start = cumulative;
      cumulative += pct;
      return `${PALETTE[i % PALETTE.length]} ${start}% ${cumulative}%`;
    })
    .concat(
      othersValue > 0
        ? [`${OTHERS_COLOR} ${cumulative}% ${cumulative + (othersValue / totalValue) * 100}%`]
        : []
    );

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center bg-ink/50 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[86vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-8 shadow-xl sm:p-12"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-8 flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Overview
            </span>
            <h2 className="mt-1 text-3xl font-semibold tabular-nums text-ink">
              {usdFormatter.format(totalValue)}
            </h2>
            {rows.length > 0 && (
              <p
                className={`mt-1 text-sm font-semibold ${
                  totalChangeDollar >= 0 ? "text-up" : "text-down"
                }`}
              >
                {totalChangeDollar >= 0 ? "+" : ""}
                {usdFormatter.format(totalChangeDollar)} ({formatPercent(totalChangePct)}) 24h
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-ink hover:bg-surface"
          >
            Close
          </button>
        </div>

        {rows.length === 0 ? (
          <p className="text-sm text-muted">
            You haven&apos;t entered any holdings yet. Add an investment amount
            and an entry price (or date) in the tables below for any of the 20
            dashboard coins, and they&apos;ll show up here.
          </p>
        ) : (
          <>
            <div className="mb-10 flex flex-col items-center gap-8 sm:flex-row sm:items-center">
              <div
                className="relative h-44 w-44 shrink-0 rounded-full"
                style={{ background: `conic-gradient(${gradientStops.join(", ")})` }}
              >
                <div className="absolute inset-[22%] rounded-full bg-white" />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                {slices.map((r, i) => (
                  <div key={r.coin.id} className="flex items-center gap-2 text-sm">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: PALETTE[i % PALETTE.length] }}
                    />
                    <span className="font-semibold text-ink">{r.coin.symbol.toUpperCase()}</span>
                    <span className="ml-auto text-muted tabular-nums">
                      {totalValue > 0 ? ((r.value / totalValue) * 100).toFixed(2) : "0.00"}%
                    </span>
                  </div>
                ))}
                {othersValue > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: OTHERS_COLOR }}
                    />
                    <span className="font-semibold text-ink">Others</span>
                    <span className="ml-auto text-muted tabular-nums">
                      {totalValue > 0 ? ((othersValue / totalValue) * 100).toFixed(2) : "0.00"}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto border border-line">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                      Asset
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                      Price
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                      24h
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                      Allocation
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                      Invested
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                      Value
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted">
                      ROI
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const pct24h = r.coin.price_change_percentage_24h_in_currency;
                    return (
                      <tr key={r.coin.id} className="border-b border-line last:border-0">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Image
                              src={r.coin.image}
                              alt={r.coin.name}
                              width={22}
                              height={22}
                              className="rounded-full"
                            />
                            <div className="flex flex-col">
                              <span className="font-semibold text-ink">{r.coin.name}</span>
                              <span className="text-xs uppercase text-muted">{r.coin.symbol}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {usdFormatter.format(r.coin.current_price)}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-semibold tabular-nums ${
                            (pct24h ?? 0) >= 0 ? "text-up" : "text-down"
                          }`}
                        >
                          {pct24h !== null && pct24h !== undefined ? formatPercent(pct24h) : "—"}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-ink">
                          {totalValue > 0 ? ((r.value / totalValue) * 100).toFixed(2) : "0.00"}%
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-ink">
                          {usdFormatter.format(r.invested)}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-ink">
                          {usdFormatter.format(r.value)}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-semibold tabular-nums ${
                            r.roiPct >= 0 ? "text-up" : "text-down"
                          }`}
                        >
                          {formatPercent(r.roiPct)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-line bg-surface font-semibold">
                    <td className="px-4 py-3 text-ink" colSpan={4}>
                      Total
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink">
                      {usdFormatter.format(totalInvested)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink">
                      {usdFormatter.format(totalValue)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right tabular-nums ${
                        totalValue >= totalInvested ? "text-up" : "text-down"
                      }`}
                    >
                      {totalInvested > 0
                        ? formatPercent(((totalValue - totalInvested) / totalInvested) * 100)
                        : "—"}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
