export default function SkeletonCard() {
  return (
    <div className="rounded-3xl bg-white/5 border border-white/10 p-5 animate-pulse">

      <div className="h-52 rounded-2xl bg-white/10" />

      <div className="mt-5 space-y-4">

        <div className="h-5 rounded bg-white/10 w-3/4" />

        <div className="h-5 rounded bg-white/10 w-1/2" />

        <div className="h-12 rounded-2xl bg-white/10" />

      </div>

    </div>
  );
}
