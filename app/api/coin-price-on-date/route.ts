import { NextResponse } from "next/server";

const FALLBACK_ERROR =
  "Price unavailable for that date. CoinGecko's free API only covers the last 365 days — enter the price manually for older dates.";

/** Converts a YYYY-MM-DD date (from an <input type="date">) to CoinGecko's DD-MM-YYYY format. */
function toCoinGeckoDate(isoDate: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return null;
  const [, year, month, day] = match;
  return `${day}-${month}-${year}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const date = searchParams.get("date");

  if (!id || !date) {
    return NextResponse.json({ error: "Missing id or date." }, { status: 400 });
  }

  const coinGeckoDate = toCoinGeckoDate(date);
  if (!coinGeckoDate) {
    return NextResponse.json({ error: "Invalid date format." }, { status: 400 });
  }

  const url =
    `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/history` +
    `?date=${coinGeckoDate}&localization=false`;

  const res = await fetch(url);

  if (res.status === 429) {
    return NextResponse.json(
      { error: "CoinGecko is rate-limiting requests right now. Wait a moment and try again." },
      { status: 502 }
    );
  }

  const body = await res.json().catch(() => null);
  const price = body?.market_data?.current_price?.usd;

  if (!res.ok || typeof price !== "number") {
    const message = body?.error?.status?.error_message ?? FALLBACK_ERROR;
    return NextResponse.json({ error: message }, { status: 502 });
  }

  return NextResponse.json({ price });
}
