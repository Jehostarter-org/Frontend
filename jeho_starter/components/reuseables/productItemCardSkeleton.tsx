import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductItemCardSkeleton() {
  return (
    <Card className="overflow-hidden border-none bg-white rounded-lg shadow-md w-full">
      <div className="aspect-[3/4] relative bg-slate-100">
        <Skeleton className="h-full w-full rounded-none" />
        
        <div className="absolute top-1 right-1">
          <Skeleton className="h-4 w-12 bg-slate-200/50 rounded-sm" />
        </div>
      </div>

      <CardContent className="p-2 space-y-3">
        <div className="flex flex-col gap-2">
          <div className="space-y-1.5 min-h-[2rem]">
            <Skeleton className="h-4 w-[90%] bg-slate-100" />
            <Skeleton className="h-4 w-[60%] bg-slate-100" />
          </div>
          
          <Skeleton className="h-5 w-[40%] bg-teal-50" />
        </div>

        <div className="flex items-center gap-1.5 border-t border-gray-200 pt-2">
          <Skeleton className="h-3.5 w-3.5 rounded-full bg-slate-100 shrink-0" />
          <Skeleton className="h-3 w-[70%] bg-slate-100" />
        </div>
      </CardContent>
    </Card>
  );
}