import InteractiveGrid from "@/components/InteractiveGrid";

export default function Loading() {
  return (
    <div className="relative grid min-h-dvh place-items-center px-6">
      <InteractiveGrid />
      <div className="relative z-10 w-full max-w-md">
        <p className="text-sm font-medium text-black/45">Menganalisis</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-black">
          Memuat…
        </h1>
        {/* Skeleton bar */}
        <div className="mt-6 h-1.5 w-full animate-pulse rounded-full bg-black/[0.06]" />
        {/* Skeleton steps */}
        <ul className="mt-8 flex flex-col gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="h-6 w-6 animate-pulse rounded-full bg-black/[0.06]" />
              <span className="h-4 w-48 animate-pulse rounded bg-black/[0.05]" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
