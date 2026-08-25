# Crypto Dashboard

Next.js (App Router) + TypeScript dashboard showing the top 20 coins by
market cap, fetched server-side from CoinGecko's public API.

## Setup

Requires [Node.js](https://nodejs.org) (LTS) installed.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Structure

- `types/coingecko.ts` — TypeScript types for the CoinGecko `/coins/markets` response
- `lib/coingecko.ts` — server-side fetch of the top 20 coins
- `components/CoinTable.tsx` — table rendering price, 24h/7d/30d % change (green/red), and market cap
- `app/page.tsx` — server component that calls the fetch and renders the table

Data is revalidated every 60 seconds (see `next: { revalidate: 60 }` in
`lib/coingecko.ts`). CoinGecko's public API is rate-limited; if you see
429 errors, wait a bit or add an API key.
