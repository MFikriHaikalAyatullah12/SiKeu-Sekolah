import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'
import { generateReceiptPDF } from '@/lib/receipt-generator'
import { Decimal } from 'decimal.js'

// Helper function untuk menentukan tipe transaksi berdasarkan nama akun COA
function determineTransactionType(accountName: string, coaAccount: any): 'INCOME' | 'EXPENSE' {
  const accountNameLower = accountName.toLowerCase()
  const coaType = coaAccount?.subCategory?.category?.type
  
  // Jika COA account ditemukan, gunakan tipe dari COA
  if (coaType) {
    // REVENUE = Pemasukan, EXPENSE = Pengeluaran
    if (coaType === 'REVENUE') return 'INCOME'
    if (coaType === 'EXPENSE') return 'EXPENSE'
  }
  
  // Fallback ke keyword matching jika COA tidak ditemukan atau tidak jelas
  const incomeKeywords = ['pendapatan', 'pemasukan', 'penerimaan', 'income', 'revenue', 'spp', 'uang sekolah', 'donasi', 'bantuan']
  const expenseKeywords = ['pengeluaran', 'biaya', 'belanja', 'expense', 'beban', 'operasional', 'gaji', 'honor']
  
  const hasIncomeKeyword = incomeKeywords.some(keyword => accountNameLower.includes(keyword))
  const hasExpenseKeyword = expenseKeywords.some(keyword => accountNameLower.includes(keyword))
  
  if (hasIncomeKeyword) return 'INCOME'
  if (hasExpenseKeyword) return 'EXPENSE'
  
  // Default ke EXPENSE jika tidak bisa ditentukan
  return 'EXPENSE'
}

// Helper function untuk mencari atau membuat kategori
async function findOrCreateCategory(
  name: string,
  type: 'INCOME' | 'EXPENSE',
  schoolId: string
) {
  // Coba cari kategori yang sudah ada
  let category = await prisma.category.findFirst({
    where: {
      name: { equals: name, mode: 'insensitive' },
      type: type === 'INCOME' ? 'INCOME' : 'EXPENSE',
      schoolProfileId: schoolId
    }
  })
  
  // Jika tidak ada, buat kategori baru
  if (!category) {
    category = await prisma.category.create({
      data: {
        name,
        type: type === 'INCOME' ? 'INCOME' : 'EXPENSE',
        description: `Dibuat otomatis dari import Excel`,
        schoolProfileId: schoolId
      }
    })
  }
  
  return category
}

// Helper function untuk mencari akun COA berdasarkan nama atau kode
async function findCoaAccount(searchTerm: string) {
  if (!searchTerm) return null
  
  const coaAccount = await prisma.coaAccount.findFirst({
    where: {
      OR: [
        { code: { equals: searchTerm.trim(), mode: 'insensitive' } },
        { name: { contains: searchTerm.trim(), mode: 'insensitive' } }
      ],
      isActive: true
    },
    include: {
      subCategory: {
        include: {
          category: true
        }
      }
    }
  })
  
  return coaAccount
}

// Helper function untuk generate receipt number
async function generateReceiptNumber(schoolProfile: any, date: Date): Promise<string> {
  const format = schoolProfile.receiptFormat || 'KW-{YYYY}{MM}-{000}'
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  
  let receiptNumber = format
    .replace('{YYYY}', String(year))
    .replace('{MM}', month)
  
  // Get counter based on reset type
  let counter = schoolProfile.receiptCounter || 1
  
  if (schoolProfile.receiptResetType === 'MONTHLY') {
    // Check if we need to reset counter for new month
    const lastTransaction = await prisma.transaction.findFirst({
      where: { schoolProfileId: schoolProfile.id },
      orderBy: { createdAt: 'desc' }
    })
    
    if (lastTransaction) {
      const lastDate = new Date(lastTransaction.date)
      if (lastDate.getMonth() !== date.getMonth() || lastDate.getFullYear() !== year) {
        counter = 1
      }
    }
  }
  
  // Replace counter placeholder
  const counterStr = String(counter).padStart(3, '0')
  receiptNumber = receiptNumber.replace('{000}', counterStr)
  
  // Update counter
  await prisma.schoolProfile.update({
    where: { id: schoolProfile.id },
    data: { receiptCounter: counter + 1 }
  })
  
  return receiptNumber
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get school ID
    let schoolId: string | null = session.user.schoolId || null
    if (!schoolId) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { schoolProfileId: true }
      })
      schoolId = user?.schoolProfileId || null
    }

    if (!schoolId) {
      return NextResponse.json({ error: 'School ID not found' }, { status: 400 })
    }

    // Get school profile
    const schoolProfile = await prisma.schoolProfile.findUnique({
      where: { id: schoolId }
    })

    if (!schoolProfile) {
      return NextResponse.json({ error: 'School profile not found' }, { status: 404 })
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Read Excel file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    
    // Get first worksheet
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: false })

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Excel file is empty' }, { status: 400 })
    }

    const results = {
      total: data.length,
      success: 0,
      failed: 0,
      errors: [] as string[],
      transactions: [] as any[]
    }

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row: any = data[i]
      
      try {
        // Expected columns (flexible naming):
        // - Tanggal / Date / tanggal
        // - Keterangan / Description / keterangan / Deskripsi
        // - Nominal / Amount / Jumlah / nominal
        // - Dari/Kepada / From/To / dari_kepada
        // - Akun COA / COA / Account / akun (optional)
        // - Kategori / Category / kategori (optional)
        // - Metode Pembayaran / Payment Method / payment_method (optional)
        
        // Find column values (case insensitive)
        const dateValue = row['Tanggal'] || row['Date'] || row['tanggal'] || row['date']
        const description = row['Keterangan'] || row['Description'] || row['keterangan'] || row['description'] || row['Deskripsi']
        const amountStr = row['Nominal'] || row['Amount'] || row['Jumlah'] || row['nominal'] || row['amount']
        const fromTo = row['Dari/Kepada'] || row['From/To'] || row['dari_kepada'] || row['fromTo'] || row['Nama'] || row['Name'] || description
        const coaName = row['Akun COA'] || row['COA'] || row['Account'] || row['akun'] || row['account']
        const categoryName = row['Kategori'] || row['Category'] || row['kategori'] || row['category']
        const paymentMethodStr = row['Metode Pembayaran'] || row['Payment Method'] || row['payment_method'] || row['Metode']

        // Validate required fields
        if (!dateValue || !description || !amountStr) {
          results.errors.push(`Baris ${i + 2}: Data tidak lengkap (perlu: Tanggal, Keterangan, Nominal)`)
          results.failed++
          continue
        }

        // Parse date
        let transactionDate: Date
        try {
          // Try various date formats
          if (typeof dateValue === 'string') {
            // Handle DD/MM/YYYY or DD-MM-YYYY
            const parts = dateValue.split(/[/-]/)
            if (parts.length === 3) {
              const day = parseInt(parts[0])
              const month = parseInt(parts[1]) - 1
              const year = parseInt(parts[2])
              transactionDate = new Date(year, month, day)
            } else {
              transactionDate = new Date(dateValue)
            }
          } else {
            transactionDate = new Date(dateValue)
          }
          
          if (isNaN(transactionDate.getTime())) {
            throw new Error('Invalid date')
          }
        } catch (error) {
          results.errors.push(`Baris ${i + 2}: Format tanggal tidak valid (${dateValue})`)
          results.failed++
          continue
        }

        // Parse amount
        const amount = new Decimal(String(amountStr).replace(/[^\d.-]/g, ''))
        if (amount.lte(0)) {
          results.errors.push(`Baris ${i + 2}: Nominal harus lebih dari 0`)
          results.failed++
          continue
        }

        // Find COA account if specified
        let coaAccount = null
        if (coaName) {
          coaAccount = await findCoaAccount(coaName)
        }

        // Determine transaction type
        const type = determineTransactionType(
          coaName || categoryName || description,
          coaAccount
        )

        // Find or create category
        const finalCategoryName = categoryName || coaAccount?.name || 'Import Excel'
        const category = await findOrCreateCategory(finalCategoryName, type, schoolId)

        // Parse payment method
        let paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'QRIS' = 'CASH'
        if (paymentMethodStr) {
          const methodLower = String(paymentMethodStr).toLowerCase()
          if (methodLower.includes('transfer') || methodLower.includes('bank')) {
            paymentMethod = 'BANK_TRANSFER'
          } else if (methodLower.includes('qris') || methodLower.includes('qr')) {
            paymentMethod = 'QRIS'
          }
        }

        // Generate receipt number
        const receiptNumber = await generateReceiptNumber(schoolProfile, transactionDate)

        // Create transaction
        const transaction = await prisma.transaction.create({
          data: {
            receiptNumber,
            type,
            date: transactionDate,
            amount,
            description: String(description),
            fromTo: String(fromTo),
            categoryId: category.id,
            coaAccountId: coaAccount?.id,
            paymentMethod,
            status: 'PAID',
            schoolProfileId: schoolId,
            createdById: session.user.id
          },
          include: {
            category: true,
            coaAccount: {
              include: {
                subCategory: {
                  include: {
                    category: true
                  }
                }
              }
            },
            schoolProfile: true,
            createdBy: {
              select: { name: true, email: true }
            }
          }
        })

        // Generate receipt PDF
        try {
          const receiptBlob = await generateReceiptPDF(
            {
              ...transaction,
              amount: Number(transaction.amount),
              categoryName: transaction.category?.name || 'N/A'
            } as any,
            schoolProfile as any
          )
          
          // In production, you would upload this to storage (S3, etc.)
          // For now, we'll just log that it was generated
          console.log(`✅ Kwitansi ${receiptNumber} berhasil dibuat`)
        } catch (pdfError) {
          console.error(`⚠️  Error generating PDF for ${receiptNumber}:`, pdfError)
          // Continue even if PDF generation fails
        }

        results.success++
        results.transactions.push({
          receiptNumber,
          type,
          date: transactionDate,
          amount: Number(amount),
          description,
          fromTo,
          category: category.name,
          coaAccount: coaAccount?.name
        })

      } catch (error: any) {
        console.error(`Error processing row ${i + 2}:`, error)
        results.errors.push(`Baris ${i + 2}: ${error.message}`)
        results.failed++
      }
    }

    return NextResponse.json({
      message: `Import selesai: ${results.success} berhasil, ${results.failed} gagal`,
      results
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error importing Excel:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to import Excel file' },
      { status: 500 }
    )
  }
}
