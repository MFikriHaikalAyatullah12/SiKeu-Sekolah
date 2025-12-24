import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateReceiptPDF } from '@/lib/receipt-generator'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: id,

      },
      include: {
        category: {
          select: {
            name: true,
            type: true
          }
        },
        coaAccount: {
          select: {
            code: true,
            name: true
          }
        },
        createdBy: {
          select: { name: true, email: true }
        }
      }
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: id,
        schoolProfileId: session.user.schoolId,
      }
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // If coaAccountId is being updated, verify it
    if (body.coaAccountId) {
      const coaAccount = await prisma.coaAccount.findUnique({
        where: { id: body.coaAccountId }
      })

      if (!coaAccount || !coaAccount.isActive) {
        return NextResponse.json(
          { error: 'Invalid or inactive COA Account' },
          { status: 400 }
        )
      }
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: id },
      data: {
        ...body,
        updatedAt: new Date(),
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
        action: 'UPDATE',
        entityType: 'Transaction',
        entityId: updatedTransaction.id,
        details: `Updated transaction: ${updatedTransaction.receiptNumber}`,
        userId: session.user.id,
        schoolProfileId: session.user.schoolId,
      }
    })

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: id,
        schoolProfileId: session.user.schoolId,
      }
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    await prisma.transaction.delete({
      where: { id: id }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        entityType: 'Transaction',
        entityId: transaction.id,
        details: `Deleted transaction: ${transaction.receiptNumber}`,
        userId: session.user.id,
        schoolProfileId: session.user.schoolId,
      }
    })

    return NextResponse.json({ message: 'Transaction deleted successfully' })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}