"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Dashboard Stats Card Skeleton - match exact height of real cards
export function StatsCardSkeleton() {
  return (
    <Card className="overflow-hidden min-h-[140px] hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-11 w-11 rounded-lg" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-40 min-h-[32px]" />
          <Skeleton className="h-4 w-32 min-h-[16px]" />
        </div>
      </CardContent>
    </Card>
  );
}

// Dashboard Stats Grid Skeleton
export function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Chart Card Skeleton
export function ChartCardSkeleton({ height = 300 }: { height?: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-48" />
      </CardHeader>
      <CardContent>
        <div className="w-full" style={{ height }}>
          <div className="flex flex-col h-full justify-end gap-2">
            <div className="flex items-end gap-2 h-full">
              {[40, 60, 45, 80, 55, 70].map((h, i) => (
                <Skeleton 
                  key={i} 
                  className="flex-1 rounded-t-md" 
                  style={{ height: `${h}%` }} 
                />
              ))}
            </div>
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Pie Chart Card Skeleton
export function PieChartCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="flex items-center justify-center" style={{ height: 300 }}>
        <Skeleton className="w-44 h-44 rounded-full" />
      </CardContent>
    </Card>
  );
}

// Transaction Table Skeleton
export function TransactionTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-9 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Table Header */}
          <div className="flex gap-4 pb-2 border-b">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32 flex-1" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          {/* Table Rows */}
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-4 py-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32 flex-1" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Actions Skeleton
export function QuickActionsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-4">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-4">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

// Full Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header - match exact height min-h-[52px] */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-h-[52px]">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48 mt-1" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>

      {/* Stats Cards */}
      <StatsGridSkeleton />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChartCardSkeleton height={300} />
        </div>
        <PieChartCardSkeleton />
      </div>

      {/* Quick Actions */}
      <QuickActionsSkeleton />

      {/* Recent Transactions */}
      <TransactionTableSkeleton rows={5} />
    </div>
  );
}
