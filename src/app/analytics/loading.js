export default function Loading() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <div
        className="h-12 w-12 animate-spin rounded-full border-4 border-black/10 border-t-[#fe2c55]"
        role="status"
        aria-label="Memuat"
      />
    </div>
  );
}
