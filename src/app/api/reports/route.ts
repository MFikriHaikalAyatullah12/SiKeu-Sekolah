import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getDateRangeForRole } from '@/lib/permissions'

// Disable caching for this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log("📊 Reports API - Session user:", {
      id: session.user.id,
      role: session.user.role,
      schoolId: session.user.schoolId
    })

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'thisMonth'

    console.log("📅 Reports API - Period requested:", period)

    // Get schoolId from session or database
    let schoolId: string | null = session.user.schoolId || null
    
    if (!schoolId) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { schoolProfileId: true }
      })
      schoolId = user?.schoolProfileId || null
    }

    // For Super Admin without schoolId, show all data
    const schoolFilter = schoolId ? { schoolProfileId: schoolId } : {}
    
    console.log("🏫 Reports API - School filter:", schoolFilter)

    // Apply role-based date restrictions
    const roleBasedDateRange = getDateRangeForRole(session.user.role)
    
    let startDate: Date
    let endDate: Date = new Date()

    // Handle period selection
    if (roleBasedDateRange) {
      startDate = roleBasedDateRange.startDate
      endDate = roleBasedDateRange.endDate
    } else {
      switch (period) {
        case 'today':
          startDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
          endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999)
          break
        case 'thisWeek':
          const dayOfWeek = endDate.getDay()
          startDate = new Date(endDate)
          startDate.setDate(endDate.getDate() - dayOfWeek)
          startDate.setHours(0, 0, 0, 0)
          break
        case 'thisMonth':
          startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
          endDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0, 23, 59, 59, 999)
          break
        case 'lastMonth':
          startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1)
          endDate = new Date(endDate.getFullYear(), endDate.getMonth(), 0, 23, 59, 59, 999)
          break
        case 'thisYear':
          startDate = new Date(endDate.getFullYear(), 0, 1)
          endDate = new Date(endDate.getFullYear(), 11, 31, 23, 59, 59, 999)
          break
        case 'lastYear':
          startDate = new Date(endDate.getFullYear() - 1, 0, 1)
          endDate = new Date(endDate.getFullYear() - 1, 11, 31, 23, 59, 59, 999)
          break
        default:
          startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
          endDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0, 23, 59, 59, 999)
      }
    }

    console.log("📆 Reports API - Date range:", {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    })

    const where: any = {
      ...schoolFilter,
      date: {
        gte: startDate,
        lte: endDate,
      }
    }

    console.log("🔍 Reports API - Query where:", where)

    // Get aggregated income and expense
    const [incomeAgg, expenseAgg, transactions] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...where, type: 'INCOME' },
        _sum: { amount: true },
        _count: true
      }),
      prisma.transaction.aggregate({
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true },
        _count: true
      }),
      prisma.transaction.findMany({
        where,
        include: { 
          category: true,
          coaAccount: true 
        },
        orderBy: { date: 'desc' },
        take: 100 // Limit to recent 100 transactions
      })
    ])

    const totalIncome = Number(incomeAgg._sum.amount || 0)
    const totalExpense = Number(expenseAgg._sum.amount || 0)
    const balance = totalIncome - totalExpense

    console.log("💰 Reports API - Calculated totals:", {
      totalIncome,
      totalExpense,
      balance,
      incomeCount: incomeAgg._count,
      expenseCount: expenseAgg._count
    })

    // Group transactions by category
    const incomeByCategory: Record<string, number> = {}
    const expenseByCategory: Record<string, number> = {}

    transactions.forEach(transaction => {
      const categoryName = transaction.category?.name || 'Uncategorized'
      const amount = Number(transaction.amount)
      
      if (transaction.type === 'INCOME') {
        incomeByCategory[categoryName] = (incomeByCategory[categoryName] || 0) + amount
      } else {
        expenseByCategory[categoryName] = (expenseByCategory[categoryName] || 0) + amount
      }
    })

    // Get monthly trend (last 6 months)
    const monthlyTrend = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1)
      const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() - i + 1, 0, 23, 59, 59, 999)

      const monthWhere = {
        ...schoolFilter,
        date: { gte: monthStart, lte: monthEnd }
      }

      const [monthIncome, monthExpense] = await Promise.all([
        prisma.transaction.aggregate({
          where: { ...monthWhere, type: 'INCOME' },
          _sum: { amount: true }
        }),
        prisma.transaction.aggregate({
          where: { ...monthWhere, type: 'EXPENSE' },
          _sum: { amount: true }
        })
      ])

      monthlyTrend.push({
        month: monthStart.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
        income: Number(monthIncome._sum.amount || 0),
        expense: Number(monthExpense._sum.amount || 0)
      })
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalIncome,
        totalExpense,
        balance,
        transactionCount: incomeAgg._count + expenseAgg._count,
        incomeCount: incomeAgg._count,
        expenseCount: expenseAgg._count
      },
      incomeByCategory,
      expenseByCategory,
      monthlyTrend,
      transactions,
      period: {
        start: startDate,
        end: endDate
      },
      dateRestrictions: roleBasedDateRange ? {
        hasRestrictions: true,
        maxMonths: 3,
        role: session.user.role
      } : {
        hasRestrictions: false,
        role: session.user.role
      }
    })
  } catch (error) {
    console.error('Error fetching reports:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
