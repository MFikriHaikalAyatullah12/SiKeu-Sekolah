import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Suspense } from "react"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"

// Force dynamic rendering for always fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/auth/signin")
  }

  // Streaming UI for faster initial render
  return (
    <DashboardLayout>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </DashboardLayout>
  )
}