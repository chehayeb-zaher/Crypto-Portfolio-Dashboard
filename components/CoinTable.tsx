import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { CoinMarketData } from "@/types/coingecko";
import type { Holding } from "@/lib/holdings";
import EntryPriceInput from "@/components/EntryPriceInput";

/** Only digits and at most one decimal point — matches what an amount can look like while it's being typed. */
const PARTIAL_NUMBER = /^\d*\.?\d*$/;

/**
 * Kept as its own text buffer (separate from the parsed `value` prop) so
 * typing decimals like "0.5" doesn't get wiped mid-keystroke — `Number("0")`
 * is falsy, so round-tripping through a numeric prop on every keystroke
 * resets the field the instant the typed-so-far value is exactly zero.
 */
function AmountInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const [text, setText] = useState(value ? String(value) : "");

  useEffect(() => {
    const parsedLocal = text === "" ? 0 : Number(text);
    if (parsedLocal !== value) {
      setText(value ? String(value) : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handleChange(raw: string) {
    if (raw !== "" && !PARTIAL_NUMBER.test(raw)) return;
    setText(raw);
    const parsed = raw === "" || raw === "." ? 0 : Number(raw);
    onChange(Number.isNaN(parsed) ? 0 : parsed);
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      value={text}
      onChange={(e) => handleChange(e.target.value)}
      placeholder="0"
      className="w-full min-w-0 bg-transparent text-right tabular-nums text-ink focus:outline-none"
    />
  );
}

export type SortKey =
  | "rank"
  | "name"
  | "price"
  | "change24h"
  | "change7d"
  | "change30d"
  | "marketCap"
  | "roi";
export type SortDirection = "asc" | "desc";

export type ChangeColumnKey = "change24h" | "change7d" | "change30d";

export interface ColumnVisibility {
  change24h: boolean;
  change7d: boolean;
  change30d: boolean;
}

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
});

const usdFormatter2dp = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compactUsdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function PercentCell({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined) {
    return <td className="px-2 py-4 text-right text-muted">—</td>;
  }
  const isUp = value >= 0;
  return (
    <td
      className={`px-2 py-4 text-right font-semibold tabular-nums ${
        isUp ? "text-up" : "text-down"
      }`}
    >
      {formatPercent(value)}
    </td>
  );
}

function RoiCell({
  amount,
  entryPrice,
  currentPrice,
}: {
  amount: number;
  entryPrice: number | null;
  currentPrice: number;
}) {
  if (!entryPrice || !amount) {
    return <td className="px-2 py-4 text-right text-muted">—</td>;
  }
  const units = amount / entryPrice;
  const currentValue = units * currentPrice;
  const pct = ((currentPrice - entryPrice) / entryPrice) * 100;
  const isUp = pct >= 0;
  return (
    <td
      className={`px-2 py-4 text-right font-semibold tabular-nums ${
        isUp ? "text-up" : "text-down"
      }`}
    >
      {usdFormatter2dp.format(currentValue)}
      <span className="mt-0.5 block font-normal text-muted">
        {formatPercent(pct)}
      </span>
    </td>
  );
}

type Column =
  | { key: SortKey; label: string; align: "left" | "right"; sortable?: true }
  | { key: "investment" | "entry"; label: string; align: "left" | "right"; sortable: false };

const ALL_COLUMNS: Column[] = [
  { key: "rank", label: "#", align: "left" },
  { key: "name", label: "Coin", align: "left" },
  { key: "price", label: "Price", align: "right" },
  { key: "change24h", label: "24h", align: "right" },
  { key: "change7d", label: "7d", align: "right" },
  { key: "change30d", label: "30d", align: "right" },
  { key: "marketCap", label: "Mkt Cap", align: "right" },
  { key: "investment", label: "Investment", align: "right", sortable: false },
  { key: "entry", label: "Entry Price", align: "right", sortable: false },
  { key: "roi", label: "ROI", align: "right" },
];

const CHANGE_COLUMN_KEYS: ChangeColumnKey[] = ["change24h", "change7d", "change30d"];

const COLUMN_WEIGHT: Record<string, number> = {
  rank: 4,
  name: 15,
  price: 10,
  change24h: 8,
  change7d: 8,
  change30d: 8,
  marketCap: 9,
  investment: 13,
  entry: 15,
  roi: 15,
};

function SortArrow({ direction }: { direction: SortDirection }) {
  return (
    <span className="inline-block text-[10px]">
      {direction === "asc" ? "▲" : "▼"}
    </span>
  );
}

export default function CoinTable({
  coins,
  sortKey,
  sortDirection,
  onSort,
  holdings,
  onAmountChange,
  onEntryChange,
  columnVisibility,
}: {
  coins: CoinMarketData[];
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
  holdings: Record<string, Holding>;
  onAmountChange: (coinId: string, amount: number) => void;
  onEntryChange: (
    coinId: string,
    entryPrice: number | null,
    entryDate: string | null
  ) => void;
  columnVisibility: ColumnVisibility;
}) {
  const columns = ALL_COLUMNS.filter(
    (col) =>
      !CHANGE_COLUMN_KEYS.includes(col.key as ChangeColumnKey) ||
      columnVisibility[col.key as ChangeColumnKey]
  );
  const totalWeight = columns.reduce((sum, col) => sum + COLUMN_WEIGHT[col.key], 0);

  return (
    <div className="overflow-x-auto border border-line bg-white">
      <table className="w-full table-fixed border-collapse text-sm">
        <colgroup>
          {columns.map((col, i) => (
            <col
              key={i}
              style={{ width: `${((COLUMN_WEIGHT[col.key] / totalWeight) * 100).toFixed(2)}%` }}
            />
          ))}
        </colgroup>
        <thead>
          <tr className="border-b border-line bg-surface">
            {columns.map((col, i) =>
              col.sortable === false ? (
                <th
                  key={i}
                  className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted"
                >
                  {col.label}
                </th>
              ) : (
                <th key={i} className="px-2 py-3 text-center font-semibold">
                  <button
                    onClick={() => onSort(col.key as SortKey)}
                    className="inline-flex w-full items-center justify-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted transition-colors hover:text-ink"
                  >
                    {col.label}
                    {sortKey === col.key && (
                      <SortArrow direction={sortDirection} />
                    )}
                  </button>
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {coins.map((coin) => {
            const holding = holdings[coin.id];
            const amount = holding?.amount ?? 0;
            const entryPrice = holding?.entryPrice ?? null;
            const entryDate = holding?.entryDate ?? null;
            return (
              <tr
                key={coin.id}
                className="border-b border-line last:border-0 hover:bg-surface"
              >
                <td className="px-2 py-4 text-muted">{coin.market_cap_rank}</td>
                <td className="px-2 py-4">
                  <Link
                    href={`/coin/${coin.id}`}
                    className="flex items-center gap-2 group w-fit"
                  >
                    <Image
                      src={coin.image}
                      alt={coin.name}
                      width={24}
                      height={24}
                      className="rounded-full shrink-0"
                    />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-semibold text-ink group-hover:underline">
                        {coin.name}
                      </span>
                      <span className="text-xs uppercase text-muted">
                        {coin.symbol}
                      </span>
                    </div>
                  </Link>
                </td>
                <td className="px-2 py-4 text-right tabular-nums">
                  {usdFormatter.format(coin.current_price)}
                </td>
                {columnVisibility.change24h && (
                  <PercentCell value={coin.price_change_percentage_24h_in_currency} />
                )}
                {columnVisibility.change7d && (
                  <PercentCell value={coin.price_change_percentage_7d_in_currency} />
                )}
                {columnVisibility.change30d && (
                  <PercentCell value={coin.price_change_percentage_30d_in_currency} />
                )}
                <td className="px-2 py-4 text-right tabular-nums text-ink">
                  {compactUsdFormatter.format(coin.market_cap)}
                </td>
                <td className="px-2 py-4">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      aria-hidden
                      className="invisible flex gap-1 text-[10px] font-semibold uppercase tracking-wide"
                    >
                      <span className="rounded-full px-2 py-0.5">Price</span>
                      <span className="rounded-full px-2 py-0.5">Date</span>
                    </div>
                    <div className="inline-flex w-full max-w-[84px] items-center gap-1 rounded-lg border border-line bg-white px-2 py-1.5">
                      <span className="text-muted">$</span>
                      <AmountInput
                        value={amount}
                        onChange={(value) => onAmountChange(coin.id, value)}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-2 py-4">
                  <EntryPriceInput
                    coinId={coin.id}
                    entryPrice={entryPrice}
                    entryDate={entryDate}
                    onChange={(price, date) => onEntryChange(coin.id, price, date)}
                  />
                </td>
                <RoiCell
                  amount={amount}
                  entryPrice={entryPrice}
                  currentPrice={coin.current_price}
                />
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
