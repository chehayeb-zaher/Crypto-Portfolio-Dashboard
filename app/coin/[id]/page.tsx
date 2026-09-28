import Image from "next/image";
import Link from "next/link";
import { getCoinDetail } from "@/lib/coingecko";
import { stripHtml } from "@/lib/utils";

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 6,
});

const compactUsdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function ChangeStat({
  label,
  value,
}: {
  label: string;
  value: number | null | undefined;
}) {
  const isUp = (value ?? 0) >= 0;
  return (
    <div className="border border-line bg-white px-5 py-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </div>
      <div
        className={`mt-1 font-display text-2xl ${
          value === null || value === undefined
            ? "text-muted"
            : isUp
            ? "text-up"
            : "text-down"
        }`}
      >
        {formatPercent(value)}
      </div>
    </div>
  );
}

export default async function CoinDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const coin = await getCoinDetail(params.id);
  const md = coin.market_data;
  const description = coin.description.en ? stripHtml(coin.description.en) : "";
  const truncatedDescription =
    description.length > 700 ? `${description.slice(0, 700)}…` : description;

  return (
    <main className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
      <Link
        href="/"
        className="text-sm font-semibold text-muted underline underline-offset-4 hover:text-ink"
      >
        ← Back to dashboard
      </Link>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Image
          src={coin.image.large}
          alt={coin.name}
          width={56}
          height={56}
          className="rounded-full"
        />
        <div>
          <span className="eyebrow inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Rank #{coin.market_cap_rank ?? "—"} · {coin.symbol}
          </span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {coin.name}
          </h1>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-baseline gap-4">
        <span className="text-4xl font-bold text-ink">
          {usdFormatter.format(md.current_price.usd)}
        </span>
        <span
          className={
            (md.price_change_percentage_24h ?? 0) >= 0
              ? "text-up font-semibold"
              : "text-down font-semibold"
          }
        >
          {formatPercent(md.price_change_percentage_24h)} today
        </span>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <ChangeStat label="24h change" value={md.price_change_percentage_24h} />
        <ChangeStat label="7d change" value={md.price_change_percentage_7d} />
        <ChangeStat label="30d change" value={md.price_change_percentage_30d} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Market Cap" value={compactUsdFormatter.format(md.market_cap.usd)} />
        <Stat label="24h Volume" value={compactUsdFormatter.format(md.total_volume.usd)} />
        <Stat label="24h High" value={usdFormatter.format(md.high_24h.usd)} />
        <Stat label="24h Low" value={usdFormatter.format(md.low_24h.usd)} />
        <Stat
          label="All-Time High"
          value={usdFormatter.format(md.ath.usd)}
          sub={formatPercent(md.ath_change_percentage.usd)}
        />
        <Stat
          label="All-Time Low"
          value={usdFormatter.format(md.atl.usd)}
          sub={formatPercent(md.atl_change_percentage.usd)}
        />
        <Stat
          label="Circulating Supply"
          value={
            md.circulating_supply !== null
              ? numberFormatter.format(md.circulating_supply)
              : "—"
          }
        />
        <Stat
          label="Max Supply"
          value={md.max_supply !== null ? numberFormatter.format(md.max_supply) : "—"}
        />
      </div>

      {truncatedDescription && (
        <div className="mt-12 max-w-3xl">
          <h2 className="text-lg font-bold text-ink">About {coin.name}</h2>
          <p className="mt-4 leading-relaxed text-muted">
            {truncatedDescription}
          </p>
        </div>
      )}

      {(coin.links.homepage[0] ||
        coin.links.subreddit_url ||
        coin.links.twitter_screen_name) && (
        <div className="mt-10 flex flex-wrap gap-3">
          {coin.links.homepage[0] && (
            <a
              href={coin.links.homepage[0]}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Website ↗
            </a>
          )}
          {coin.links.twitter_screen_name && (
            <a
              href={`https://twitter.com/${coin.links.twitter_screen_name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-line px-5 py-2 text-sm font-semibold text-ink hover:bg-surface"
            >
              Twitter / X ↗
            </a>
          )}
          {coin.links.subreddit_url && (
            <a
              href={coin.links.subreddit_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-line px-5 py-2 text-sm font-semibold text-ink hover:bg-surface"
            >
              Reddit ↗
            </a>
          )}
        </div>
      )}
    </main>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="border border-line bg-white px-5 py-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold tabular-nums text-ink">
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </div>
  );
}
