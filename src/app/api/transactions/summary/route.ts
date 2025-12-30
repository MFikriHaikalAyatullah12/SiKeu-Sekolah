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

    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month')

    const where: any = {
      schoolProfileId: session.user.schoolId,
    }

    if (month) {
      const startDate = new Date(`${month}-01`)
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
      where.date = {
        gte: startDate,
        lte: endDate,
      }
    }

    const [incomeSum, expenseSum, transactionCount] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...where, type: 'INCOME', status: 'PAID' },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { ...where, type: 'EXPENSE', status: 'PAID' },
        _sum: { amount: true }
      }),
      prisma.transaction.count({ where })
    ])

    const totalIncome = incomeSum._sum.amount || new Decimal(0)
    const totalExpense = expenseSum._sum.amount || new Decimal(0)
    const surplus = totalIncome.minus(totalExpense)

    return NextResponse.json({
      totalIncome,
      totalExpense,
      surplus,
      transactionCount,
    })
  } catch (error) {
    console.error('Error fetching transaction summary:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}