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

  // Pass user info to client for immediate display
  // Stats are fetched client-side with optimistic UI for faster LCP
  return (
    <DashboardLayout>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent 
          userName={session.user?.name || 'User'} 
        />
      </Suspense>
    </DashboardLayout>
  )
}