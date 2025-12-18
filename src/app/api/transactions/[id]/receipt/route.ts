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

export async function POST(request: NextRequest, { params }: RouteParams) {
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
      },
      include: {
        schoolProfile: true,
        category: true,
        createdBy: true,
      }
    })

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    if (!transaction?.schoolProfile) {
      return NextResponse.json(
        { error: 'Transaction or school profile not found' },
        { status: 404 }
      )
    }

    // Transform Prisma data to match expected types
    const transformedTransaction = {
      id: transaction.id,
      receiptNumber: transaction.receiptNumber,
      type: transaction.type,
      date: transaction.date.toISOString().split('T')[0],
      amount: Number(transaction.amount),
      category: transaction.category?.name || 'Unknown',
      description: transaction.description,
      fromTo: transaction.fromTo,
      paymentMethod: transaction.paymentMethod,
      status: transaction.status,
      receiptFileUrl: transaction.receiptFileUrl || undefined,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString(),
      createdBy: transaction.createdBy?.id || '',
      schoolProfileId: transaction.schoolProfileId
    }

    const pdfBlob = await generateReceiptPDF(transformedTransaction, {
      ...transaction.schoolProfile,
      logoUrl: transaction.schoolProfile.logoUrl || undefined,
      signatureUrl: transaction.schoolProfile.signatureUrl || undefined,
      stampUrl: transaction.schoolProfile.stampUrl || undefined,
      createdAt: transaction.schoolProfile.createdAt.toISOString(),
      updatedAt: transaction.schoolProfile.updatedAt.toISOString()
    })
    
    return new NextResponse(pdfBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="kwitansi-${transaction.receiptNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating receipt:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}