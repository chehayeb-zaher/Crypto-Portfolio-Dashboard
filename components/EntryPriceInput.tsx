"use client";

import { useEffect, useState } from "react";

type Mode = "price" | "date";

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
});

const today = () => new Date().toISOString().slice(0, 10);

/** Only digits and at most one decimal point — matches what a price can look like while it's being typed. */
const PARTIAL_NUMBER = /^\d*\.?\d*$/;

export default function EntryPriceInput({
  coinId,
  entryPrice,
  entryDate,
  onChange,
}: {
  coinId: string;
  entryPrice: number | null;
  entryDate: string | null;
  onChange: (entryPrice: number | null, entryDate: string | null) => void;
}) {
  const [mode, setMode] = useState<Mode>(entryDate ? "date" : "price");
  const [dateInput, setDateInput] = useState(entryDate ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kept as its own text buffer (separate from the parsed `entryPrice` prop)
  // so typing leading zeros like "0.0000045" doesn't get wiped mid-keystroke —
  // `Number("0")` is falsy, so round-tripping through the numeric prop on
  // every keystroke would reset the field the instant the typed-so-far value
  // is exactly zero.
  const [priceText, setPriceText] = useState(entryPrice !== null ? String(entryPrice) : "");

  useEffect(() => {
    const parsedLocal = priceText === "" ? null : Number(priceText);
    if (parsedLocal !== entryPrice) {
      setPriceText(entryPrice !== null ? String(entryPrice) : "");
    }
    // Only resync when the external value changes; typing is handled locally.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryPrice]);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    if (next === "price") {
      onChange(entryPrice, null);
    } else {
      setDateInput("");
      onChange(null, null);
    }
  }

  function handlePriceTextChange(raw: string) {
    if (raw !== "" && !PARTIAL_NUMBER.test(raw)) return;
    setPriceText(raw);
    if (raw === "" || raw === ".") {
      onChange(null, null);
      return;
    }
    const parsed = Number(raw);
    onChange(Number.isNaN(parsed) ? null : parsed, null);
  }

  async function handleDateChange(value: string) {
    setDateInput(value);
    setError(null);

    if (!value) {
      onChange(null, null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/coin-price-on-date?id=${encodeURIComponent(coinId)}&date=${value}`
      );
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Could not fetch price for that date.");
        onChange(null, null);
      } else {
        onChange(body.price, value);
      }
    } catch {
      setError("Network error fetching that date's price.");
      onChange(null, null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-1 text-[10px] font-semibold uppercase tracking-wide">
        <button
          type="button"
          onClick={() => switchMode("price")}
          className={`rounded-full px-2 py-0.5 ${
            mode === "price" ? "bg-navy text-white" : "text-muted hover:text-ink"
          }`}
        >
          Price
        </button>
        <button
          type="button"
          onClick={() => switchMode("date")}
          className={`rounded-full px-2 py-0.5 ${
            mode === "date" ? "bg-navy text-white" : "text-muted hover:text-ink"
          }`}
        >
          Date
        </button>
      </div>

      {mode === "price" ? (
        <div className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-2 py-1.5">
          <span className="text-muted">$</span>
          <input
            type="text"
            inputMode="decimal"
            value={priceText}
            onChange={(e) => handlePriceTextChange(e.target.value)}
            placeholder="0.00"
            className="w-20 bg-transparent text-right text-xs tabular-nums text-ink focus:outline-none"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1">
          <input
            type="date"
            value={dateInput}
            max={today()}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full rounded-full border border-line bg-white px-2 py-1.5 text-xs text-ink focus:outline-none"
          />
          {loading && (
            <span className="text-[11px] text-muted">Fetching price…</span>
          )}
          {!loading && entryPrice !== null && (
            <span className="text-[11px] text-muted">
              ≈ {usdFormatter.format(entryPrice)}
            </span>
          )}
          {!loading && error && (
            <span className="max-w-[170px] text-center text-[11px] text-down">
              {error}{" "}
              <button
                type="button"
                onClick={() => switchMode("price")}
                className="underline"
              >
                Enter manually
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
