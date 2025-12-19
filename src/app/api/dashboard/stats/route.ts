import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {
      schoolProfileId: session.user.schoolId
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Get transactions
    const [income, expense, transactions] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...where, type: "INCOME" },
        _sum: { amount: true },
        _count: true
      }),
      prisma.transaction.aggregate({
        where: { ...where, type: "EXPENSE" },
        _sum: { amount: true },
        _count: true
      }),
      prisma.transaction.findMany({
        where,
        include: {
          category: true
        },
        orderBy: { date: "desc" },
        take: 5
      })
    ])

    const totalIncome = Number(income._sum.amount || 0)
    const totalExpense = Number(expense._sum.amount || 0)
    const balance = totalIncome - totalExpense

    return NextResponse.json({
      stats: {
        totalIncome,
        totalExpense,
        balance,
        incomeCount: income._count,
        expenseCount: expense._count
      },
      recentTransactions: transactions
    })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}
