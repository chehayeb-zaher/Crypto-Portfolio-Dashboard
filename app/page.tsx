import { getTopCoins } from "@/lib/coingecko";
import CoinDashboard from "@/components/CoinDashboard";

export default async function Home() {
  const initialData = await getTopCoins();

  return (
    <main className="mx-auto max-w-[1800px] px-6 py-16 sm:px-10">
      <div className="mb-10">
        <div className="max-w-xs overflow-hidden sm:max-w-sm">
          <div className="flex w-max animate-marquee gap-10 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            <span>Live Market Data</span>
            <span>Live Market Data</span>
          </div>
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Crypto Dashboard
        </h1>
      </div>

      <CoinDashboard initialData={initialData} />
    </main>
  );
}
