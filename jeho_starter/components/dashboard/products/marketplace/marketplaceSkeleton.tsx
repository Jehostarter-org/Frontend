export function MarketplaceSkeletonCard() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="aspect-[4/5] bg-gray-100 rounded-2xl" />
      <div className="h-4 bg-gray-100 rounded w-3/4" />
      <div className="h-6 bg-gray-100 rounded w-1/2" />
    </div>
  );
}