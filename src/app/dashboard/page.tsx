import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { DashboardContent } from "@/components/dashboard/dashboard-content"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/auth/signin")
  }

  // Tampilkan dashboard dengan grafik dan statistik
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  )
}