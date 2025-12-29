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
    const [income, expense, transactions, monthlyStats, categoryStats] = await Promise.all([
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
      }),
      // Get monthly data for the last 6 months
      prisma.$queryRaw`
        SELECT 
          EXTRACT(YEAR FROM date) as year,
          EXTRACT(MONTH FROM date) as month,
          SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as pemasukan,
          SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as pengeluaran
        FROM "Transaction" 
        WHERE "schoolProfileId" = ${session.user.schoolId}
          AND date >= NOW() - INTERVAL '6 months'
        GROUP BY EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date)
        ORDER BY year DESC, month DESC
        LIMIT 6
      `,
      // Get category breakdown for expenses
      prisma.transaction.groupBy({
        by: ['categoryId'],
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true },
        include: {
          category: {
            select: { name: true }
          }
        },
        orderBy: {
          _sum: {
            amount: 'desc'
          }
        },
        take: 5
      })
    ])

    const totalIncome = Number(income._sum.amount || 0)
    const totalExpense = Number(expense._sum.amount || 0)
    const balance = totalIncome - totalExpense

    // Process monthly data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agust', 'Sep', 'Okt', 'Nov', 'Des'];
    const monthlyData = (monthlyStats as any[]).map((item: any) => ({
      month: `${monthNames[Number(item.month) - 1]} ${item.year}`,
      pemasukan: Math.round(Number(item.pemasukan) / 1000000), // Convert to millions
      pengeluaran: Math.round(Number(item.pengeluaran) / 1000000)
    })).reverse();

    // Process category breakdown
    const categoryBreakdown = await Promise.all(
      (categoryStats as any[]).map(async (item: any) => {
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId },
          select: { name: true }
        });
        return {
          name: category?.name || 'Lainnya',
          value: Math.round((Number(item._sum.amount || 0) / totalExpense) * 100),
          color: ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#6b7280'][categoryStats.indexOf(item) % 5]
        };
      })
    );

    return NextResponse.json({
      stats: {
        totalIncome,
        totalExpense,
        balance,
        incomeCount: income._count,
        expenseCount: expense._count,
        monthlyData: monthlyData.length > 0 ? monthlyData : [
          { 
            month: new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }), 
            pemasukan: Math.round(totalIncome / 1000000), 
            pengeluaran: Math.round(totalExpense / 1000000) 
          }
        ],
        categoryBreakdown: categoryBreakdown.filter(item => item.value > 0)
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
