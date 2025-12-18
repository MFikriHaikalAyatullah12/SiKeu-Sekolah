import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  date: z.string(),
  amount: z.number().positive(),
  category: z.string(),
  description: z.string(),
  fromTo: z.string(),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'QRIS']),
  status: z.enum(['PAID', 'PENDING', 'VOID']),
  receiptFileUrl: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const month = searchParams.get('month')

    const where: any = {
      schoolProfileId: session.user.schoolId,
    }

    if (type) {
      where.type = type
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { fromTo: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (month) {
      const startDate = new Date(`${month}-01`)
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)
      where.date = {
        gte: startDate,
        lte: endDate,
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        createdBy: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = transactionSchema.parse(body)

    // Generate receipt number
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    
    // Get the last receipt number for this month
    const lastTransaction = await prisma.transaction.findFirst({
      where: {
        schoolProfileId: session.user.schoolId,
        receiptNumber: {
          startsWith: `KW-${year}${month}`
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    let counter = 1
    if (lastTransaction) {
      const lastNumber = parseInt(lastTransaction.receiptNumber.split('-')[2])
      counter = lastNumber + 1
    }

    const receiptNumber = `KW-${year}${month}-${String(counter).padStart(3, '0')}`

    const { category, ...transactionData } = validatedData
    
    const transaction = await prisma.transaction.create({
      data: {
        ...transactionData,
        receiptNumber,
        schoolProfileId: session.user.schoolId,
        createdById: session.user.id,
        categoryId: category,
      },
      include: {
        createdBy: {
          select: { name: true, email: true }
        }
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'Transaction',
        entityId: transaction.id,
        details: `Created transaction: ${transaction.receiptNumber}`,
        userId: session.user.id,
        schoolProfileId: session.user.schoolId,
      }
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}