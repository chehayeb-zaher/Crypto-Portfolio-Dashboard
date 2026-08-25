export interface Holding {
  amount: number;
  entryPrice: number | null;
  /** Set only when entryPrice was captured via the date lookup (YYYY-MM-DD). */
  entryDate: string | null;
}

export const EMPTY_HOLDING: Holding = {
  amount: 0,
  entryPrice: null,
  entryDate: null,
};

const STORAGE_KEY = "crypto-dashboard-holdings";

export function loadHoldings(): Record<string, Holding> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveHoldings(holdings: Record<string, Holding>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
}
