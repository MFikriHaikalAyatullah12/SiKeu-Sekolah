import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Decimal } from 'decimal.js'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check role permission
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'thisMonth'

    let startDate: Date
    let endDate: Date = new Date()

    switch (period) {
      case 'thisMonth':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
        break
      case 'lastMonth':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1)
        endDate = new Date(endDate.getFullYear(), endDate.getMonth(), 0)
        break
      case 'thisYear':
        startDate = new Date(endDate.getFullYear(), 0, 1)
        break
      case 'lastYear':
        startDate = new Date(endDate.getFullYear() - 1, 0, 1)
        endDate = new Date(endDate.getFullYear() - 1, 11, 31)
        break
      default:
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1)
    }

    const where: any = {
      schoolProfileId: session.user.schoolId,
      date: {
        gte: startDate,
        lte: endDate,
      }
    }

    // Get income and expense by category
    const incomeTransactions = await prisma.transaction.findMany({
      where: { ...where, type: 'INCOME' },
      include: { category: true },
      orderBy: { date: 'desc' }
    })

    const expenseTransactions = await prisma.transaction.findMany({
      where: { ...where, type: 'EXPENSE' },
      include: { category: true },
      orderBy: { date: 'desc' }
    })

    // Group by category
    const incomeByCategory = incomeTransactions.reduce((acc: any, transaction) => {
      const categoryName = transaction.category.name
      if (!acc[categoryName]) {
        acc[categoryName] = new Decimal(0)
      }
      acc[categoryName] = acc[categoryName].plus(transaction.amount)
      return acc
    }, {})

    const expenseByCategory = expenseTransactions.reduce((acc: any, transaction) => {
      const categoryName = transaction.category.name
      if (!acc[categoryName]) {
        acc[categoryName] = new Decimal(0)
      }
      acc[categoryName] = acc[categoryName].plus(transaction.amount)
      return acc
    }, {})

    // Calculate totals
    const totalIncome = incomeTransactions.reduce(
      (sum, t) => sum.plus(t.amount),
      new Decimal(0)
    )
    const totalExpense = expenseTransactions.reduce(
      (sum, t) => sum.plus(t.amount),
      new Decimal(0)
    )
    const balance = totalIncome.minus(totalExpense)

    // Get monthly trend (last 6 months)
    const monthlyTrend = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1)
      const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() - i + 1, 0)

      const [monthIncome, monthExpense] = await Promise.all([
        prisma.transaction.aggregate({
          where: {
            schoolProfileId: session.user.schoolId,
            type: 'INCOME',
            date: { gte: monthStart, lte: monthEnd }
          },
          _sum: { amount: true }
        }),
        prisma.transaction.aggregate({
          where: {
            schoolProfileId: session.user.schoolId,
            type: 'EXPENSE',
            date: { gte: monthStart, lte: monthEnd }
          },
          _sum: { amount: true }
        })
      ])

      monthlyTrend.push({
        month: monthStart.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
        income: monthIncome._sum.amount || new Decimal(0),
        expense: monthExpense._sum.amount || new Decimal(0)
      })
    }

    return NextResponse.json({
      summary: {
        totalIncome,
        totalExpense,
        balance,
        transactionCount: incomeTransactions.length + expenseTransactions.length
      },
      incomeByCategory,
      expenseByCategory,
      monthlyTrend,
      period: {
        start: startDate,
        end: endDate
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
