"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PRODUCT_CATEGORIES } from "./product-category";
import { Suspense, useMemo, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CategoryCard } from "@/components/reuseables/categoryCard";
import { ProductList } from "@/components/add-product/product-list";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { CurrencyProvider } from "@/components/contexts/currencyContext";
import { ProductInsights } from "@/components/add-product/product-insights";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

 
const TABS_CONFIG = [
  { value: "list", label: "Item List", component: <ProductList /> },
  { value: "insights", label: "Insights", component: <ProductInsights /> },
  { value: "manage", label: "Manage Products", renderCategories: true },
] as const;

type TabValue = (typeof TABS_CONFIG)[number]["value"];

function AddProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const currentTab = useMemo(() => { const tab = searchParams.get("tab") as TabValue; return TABS_CONFIG.some(t => t.value === tab) ? tab : "list"; }, [searchParams]);
  const handleTabChange = (value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.set("tab", value);
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className={cn( "flex min-h-screen bg-gray-50/50 transition-opacity duration-200", isPending ? "opacity-70" : "opacity-100" )}>
      <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Add a Product
          </h2>
        </header>

        <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full space-y-8" >
          <div className="flex items-center justify-between  ">
            <TabsList className="bg-transparent p-0 h-auto gap-2 md:gap-6">
              {TABS_CONFIG.map((tab) => (
                <TabItem key={tab.value} value={tab.value} label={tab.label} />
              ))}
            </TabsList>

            <div className="pb-2 hidden sm:block">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Sort By ↓
              </Button>
            </div>
          </div>

          {TABS_CONFIG.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-0 focus-visible:outline-none animate-in fade-in-50 slide-in-from-bottom-2 duration-300" >
              {"renderCategories" in tab ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {PRODUCT_CATEGORIES.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                  ))}
                </div>
              ) : (
                tab.component
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

export default function AddProductPage() {
  return (
    <DashboardShell>
      <CurrencyProvider>
        <Suspense fallback={<TabSkeleton />}>
          <AddProductContent />
        </Suspense>
      </CurrencyProvider>
    </DashboardShell>
  );
}

function TabItem({ value, label }: { value: string; label: string }) {
  return (
    <TabsTrigger value={value} className={cn( "relative rounded-xl border-b-4 border-transparent px-2 md:px-4 py-3 font-medium text-lg transition-all",
      "data-[state=active]:border-teal-600 data-[state=active]:text-teal-700 data-[state=active]:bg-transparent", "hover:text-foreground focus-visible:ring-0" )}
    >
      {label}
    </TabsTrigger>
  );
}

function TabSkeleton() {
  return (
    <div className="p-8 space-y-4">
      <div className="h-8 w-48 bg-gray-200 animate-pulse rounded" />
      <div className="h-10 w-full bg-gray-100 animate-pulse rounded" />
    </div>
  );
}