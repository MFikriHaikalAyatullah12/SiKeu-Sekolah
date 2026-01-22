import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatsGridSkeleton, ChartCardSkeleton, PieChartCardSkeleton, QuickActionsSkeleton } from "@/components/dashboard/dashboard-skeleton";

// This loading.tsx provides instant loading UI while the page is being rendered
// It dramatically improves perceived performance and LCP
export default function DashboardLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-3 md:space-y-4 w-full overflow-x-hidden">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 md:gap-3">
          <div className="min-h-[44px]">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-100 rounded mt-1 animate-pulse" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <StatsGridSkeleton />

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <ChartCardSkeleton height={300} />
          </div>
          <PieChartCardSkeleton />
        </div>

        {/* Quick Actions Skeleton */}
        <QuickActionsSkeleton />
      </div>
    </DashboardLayout>
  );
}
