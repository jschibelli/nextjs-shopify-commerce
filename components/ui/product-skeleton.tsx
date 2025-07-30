import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductSkeletonProps {
  variant?: "default" | "compact" | "featured";
}

export function ProductSkeleton({ variant = "default" }: ProductSkeletonProps) {
  if (variant === "compact") {
    return (
      <Card className="group hover:shadow-lg transition-all duration-200">
        <CardHeader className="p-4 pb-2">
          <Skeleton className="aspect-square w-full rounded-lg" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-6 w-1/2" />
        </CardContent>
        <div className="p-4 pt-0">
          <Skeleton className="h-9 w-full" />
        </div>
      </Card>
    );
  }

  if (variant === "featured") {
    return (
      <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
        <CardHeader className="p-0">
          <Skeleton className="aspect-[4/3] w-full" />
        </CardHeader>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-4" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <CardHeader className="p-4 pb-2">
        <Skeleton className="aspect-square w-full rounded-lg" />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <div className="flex gap-1 mb-3">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-px w-full my-3" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </CardContent>
    </Card>
  );
} 