import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getDateRangeForRole } from '@/lib/permissions'
import { z } from 'zod'

const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  date: z.string(),
  amount: z.number().positive(),
  categoryId: z.string(), // Category ID (required)
  coaAccountId: z.string().optional(), // COA Account ID (optional for now)
  description: z.string(),
  fromTo: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'QRIS']).optional(),
  status: z.enum(['PAID', 'PENDING', 'VOID']).optional(),
  receiptFileUrl: z.string().optional(),
  schoolId: z.string().optional(), // For Super Admin
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

    // Apply date range restrictions based on role
    const dateRange = getDateRangeForRole(session.user.role)
    if (dateRange) {
      where.date = {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      }
    }

    if (type) {
      where.type = type
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { fromTo: { contains: search, mode: 'insensitive' } },
        { 
          chartOfAccount: { 
            name: { contains: search, mode: 'insensitive' } 
          } 
        },
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
        coaAccount: {
          select: { 
            code: true,
            name: true
          }
        },
        category: {
          select: {
            name: true,
            type: true
          }
        },
        createdBy: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json({ transactions })
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
    console.log("Transaction POST body:", body)
    
    const validatedData = transactionSchema.parse(body)

    // Determine schoolId - use provided schoolId (for Super Admin) or user's schoolId
    const schoolId = validatedData.schoolId || session.user.schoolId
    
    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      )
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      )
    }

    // Generate receipt number
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    
    // Get the last receipt number for this month
    const lastTransaction = await prisma.transaction.findFirst({
      where: {
        schoolProfileId: schoolId,
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

    const { categoryId, coaAccountId, schoolId: _, date, ...transactionData } = validatedData
    
    // Verify COA account if provided
    if (coaAccountId) {
      const coaAccount = await prisma.coaAccount.findUnique({
        where: { id: coaAccountId }
      })

      if (!coaAccount || !coaAccount.isActive) {
        return NextResponse.json(
          { error: 'Invalid or inactive COA Account' },
          { status: 400 }
        )
      }
    }
    
    console.log("Creating transaction with:", {
      schoolId,
      userId: user.id,
      categoryId,
      coaAccountId,
      receiptNumber
    })

    const transaction = await prisma.transaction.create({
      data: {
        ...transactionData,
        date: new Date(date),
        receiptNumber,
        schoolProfileId: schoolId,
        createdById: user.id,
        categoryId: categoryId,
        coaAccountId: coaAccountId || null,
        fromTo: transactionData.fromTo || 'N/A',
        paymentMethod: transactionData.paymentMethod || 'CASH',
        status: transactionData.status || 'PAID',
      },
      include: {
        category: true,
        coaAccount: true,
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
        userId: user.id,
        schoolProfileId: schoolId,
      }
    })

    return NextResponse.json({ transaction }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.issues)
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Error creating transaction:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}