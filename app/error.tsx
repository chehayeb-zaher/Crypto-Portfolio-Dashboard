"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
      <span className="eyebrow inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        Something went wrong
      </span>
      <h1 className="font-display mt-3 text-3xl uppercase tracking-wide text-ink">
        Crypto Dashboard
      </h1>
      <p className="mt-4 text-sm text-down">
        Failed to load market data: {error.message}
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-full border border-navy px-5 py-2 text-sm font-semibold text-navy hover:opacity-70"
      >
        Retry
      </button>
    </main>
  );
}
