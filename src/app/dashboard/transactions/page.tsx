import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { TransactionContent } from "@/components/dashboard/transaction-content"

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <DashboardLayout>
      <TransactionContent />
    </DashboardLayout>
  )
}