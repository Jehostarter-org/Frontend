'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardShell from '@/components/dashboard/dashboard-layout';
import ProductDetailView from '@/components/reuseables/product-detail-view';
import { useGetSingleProductQuery } from '@/lib/api/productsApiSlice';

export default function MarketplaceProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: product, isLoading, isError } = useGetSingleProductQuery(id);

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading product…</p>
        </div>
      </DashboardShell>
    );
  }

  if (isError || !product) {
    return (
      <DashboardShell>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
          <p className="text-sm font-bold text-gray-500">Product not found.</p>
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/product/marketplace')}
            className="text-teal-600 hover:text-teal-800 font-black uppercase tracking-widest text-xs"
          >
            <ArrowLeft size={16} className="mr-2" /> Back to Marketplace
          </Button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-between p-6 border-b bg-white top-0 z-10">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/product/marketplace')}
            className="text-teal-600 hover:text-teal-800 font-black uppercase tracking-widest text-xs flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back to Marketplace
          </Button>
          <h2 className="hidden md:block text-sm font-black uppercase tracking-tighter text-gray-400">
            Viewing: <span className="text-slate-900 px-2">{product.title}</span>
          </h2>
        </div>
        <ProductDetailView product={product} />
      </div>
    </DashboardShell>
  );
}
