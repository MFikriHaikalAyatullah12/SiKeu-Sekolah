import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 1. Find Bendahara user
    const bendahara = await prisma.user.findFirst({
      where: { role: 'TREASURER' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        schoolProfileId: true
      }
    })

    if (!bendahara) {
      return NextResponse.json({ error: "No Bendahara user found" })
    }

    let result: any = {
      bendahara: {
        id: bendahara.id,
        email: bendahara.email,
        name: bendahara.name,
        schoolProfileId: bendahara.schoolProfileId
      }
    }

    if (!bendahara.schoolProfileId) {
      const schools = await prisma.schoolProfile.findMany({
        select: { id: true, name: true }
      })
      return NextResponse.json({
        ...result,
        error: "Bendahara not assigned to any school",
        availableSchools: schools
      })
    }

    // 2. Get school info
    const school = await prisma.schoolProfile.findUnique({
      where: { id: bendahara.schoolProfileId },
      select: { id: true, name: true, address: true }
    })

    result.school = school

    // 3. Count all transactions for this school
    const totalTransactions = await prisma.transaction.count({
      where: { schoolProfileId: bendahara.schoolProfileId }
    })

    result.totalTransactions = totalTransactions

    // 4. Get date range for last 3 months
    const now = new Date()
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1, 0, 0, 0, 0)
    
    result.dateRange = {
      from: threeMonthsAgo.toISOString(),
      to: now.toISOString()
    }

    // 5. Count transactions in last 3 months
    const transactionsLast3Months = await prisma.transaction.count({
      where: {
        schoolProfileId: bendahara.schoolProfileId,
        date: {
          gte: threeMonthsAgo,
          lte: now
        }
      }
    })

    result.transactionsLast3Months = transactionsLast3Months

    // 6. Get summary
    const summary = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        schoolProfileId: bendahara.schoolProfileId,
        date: {
          gte: threeMonthsAgo,
          lte: now
        },
        status: 'PAID'
      },
      _sum: { amount: true },
      _count: true
    })

    result.summary = summary.map(s => ({
      type: s.type,
      total: Number(s._sum.amount || 0),
      count: s._count
    }))

    // 7. Get sample transactions
    const sampleTransactions = await prisma.transaction.findMany({
      where: {
        schoolProfileId: bendahara.schoolProfileId,
        date: {
          gte: threeMonthsAgo,
          lte: now
        }
      },
      select: {
        id: true,
        date: true,
        type: true,
        amount: true,
        description: true,
        status: true
      },
      orderBy: { date: 'desc' },
      take: 5
    })

    result.sampleTransactions = sampleTransactions

    return NextResponse.json(result)

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
