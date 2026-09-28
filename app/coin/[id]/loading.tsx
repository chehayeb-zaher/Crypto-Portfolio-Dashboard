export default function LoadingCoinDetail() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16 sm:px-10">
      <div className="h-4 w-32 animate-pulse bg-surface" />
      <div className="mt-8 h-12 w-64 animate-pulse bg-surface" />
      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse border border-line bg-surface" />
        ))}
      </div>
    </main>
  );
}
