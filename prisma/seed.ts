import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Helper function to get dynamic date for current month
function getCurrentMonthDate(dayOffset: number = 0): Date {
  const now = new Date()
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOffset)
  return date
}

// Generate receipt number with current year and month
function generateReceiptNumber(index: number): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `KW-${year}${month}-${String(index).padStart(3, '0')}`
}

async function main() {
  console.log('🌱 Starting database seeding...')

  // Upsert Super Admin User (Global - tanpa schoolProfileId)
  const superAdminPassword = await bcrypt.hash('superadmin123', 12)
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'sikeusekolah@gmail.com' },
    update: {},
    create: {
      email: 'sikeusekolah@gmail.com',
      password: superAdminPassword,
      name: 'Super Administrator',
      role: 'SUPER_ADMIN',
      schoolProfileId: null, // Super admin tidak terikat ke sekolah tertentu
    }
  })

  console.log('✅ Super Admin user ready:', superAdminUser.email)

  // Upsert School Profile
  const schoolProfile = await prisma.schoolProfile.upsert({
    where: { email: 'info@smanjakarta.sch.id' },
    update: {},
    create: {
      name: 'Sekolah Menengah Atas Negeri 1',
      address: 'Jl. Pendidikan No. 123, Jakarta',
      phone: '(021) 12345678',
      email: 'info@smanjakarta.sch.id',
    },
  })

  console.log('✅ School profile created:', schoolProfile.name)

  // Upsert Admin User
  const adminPassword = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@smanjakarta.sch.id' },
    update: {},
    create: {
      email: 'admin@smanjakarta.sch.id',
      password: adminPassword,
      name: 'Administrator',
      role: 'ADMIN',
      schoolProfileId: schoolProfile.id,
    }
  })

  console.log('✅ Admin user created:', adminUser.email)

  // Upsert Treasurer User
  const treasurerPassword = await bcrypt.hash('treasurer123', 12)
  const treasurerUser = await prisma.user.upsert({
    where: { email: 'treasurer@smanjakarta.sch.id' },
    update: {},
    create: {
      email: 'treasurer@smanjakarta.sch.id',
      password: treasurerPassword,
      name: 'Treasurer Sekolah',
      role: 'TREASURER',
      schoolProfileId: schoolProfile.id,
    },
  })

  console.log('✅ Treasurer user created:', treasurerUser.email)

  // Upsert income categories - Chart of Accounts
  const aktivaLancarCategory = await prisma.category.upsert({
    where: {
      name_type_schoolProfileId: {
        name: 'Aktiva Lancar',
        type: 'INCOME',
        schoolProfileId: schoolProfile.id,
      }
    },
    update: {},
    create: {
      name: 'Aktiva Lancar',
      type: 'INCOME',
      description: '1100 - Aktiva Lancar (Kas, Bank, Piutang)',
      schoolProfileId: schoolProfile.id,
    }
  })

  const aktivaTetapCategory = await prisma.category.upsert({
    where: {
      name_type_schoolProfileId: {
        name: 'Aktiva Tetap',
        type: 'INCOME',
        schoolProfileId: schoolProfile.id,
      }
    },
    update: {},
    create: {
      name: 'Aktiva Tetap',
      type: 'INCOME',
      description: '1200 - Aktiva Tetap (Tanah, Bangunan, Peralatan)',
      schoolProfileId: schoolProfile.id,
    }
  })

  const modalCategory = await prisma.category.upsert({
    where: {
      name_type_schoolProfileId: {
        name: 'Modal',
        type: 'INCOME',
        schoolProfileId: schoolProfile.id,
      }
    },
    update: {},
    create: {
      name: 'Modal',
      type: 'INCOME',
      description: '3100 - Modal (Ekuitas)',
      schoolProfileId: schoolProfile.id,
    }
  })

  const pendapatanCategory = await prisma.category.upsert({
    where: {
      name_type_schoolProfileId: {
        name: 'Pendapatan',
        type: 'INCOME',
        schoolProfileId: schoolProfile.id,
      }
    },
    update: {},
    create: {
      name: 'Pendapatan',
      type: 'INCOME',
      description: '4100 - Pendapatan (Revenue)',
      schoolProfileId: schoolProfile.id,
    }
  })

  // Upsert expense categories - Chart of Accounts
  const kewajibanCategory = await prisma.category.upsert({
    where: {
      name_type_schoolProfileId: {
        name: 'Kewajiban',
        type: 'EXPENSE',
        schoolProfileId: schoolProfile.id,
      }
    },
    update: {},
    create: {
      name: 'Kewajiban',
      type: 'EXPENSE',
      description: '2100 - Kewajiban (Utang)',
      schoolProfileId: schoolProfile.id,
    }
  })

  const bebanCategory = await prisma.category.upsert({
    where: {
      name_type_schoolProfileId: {
        name: 'Beban',
        type: 'EXPENSE',
        schoolProfileId: schoolProfile.id,
      }
    },
    update: {},
    create: {
      name: 'Beban',
      type: 'EXPENSE',
      description: '5100 - Beban (Expenses)',
      schoolProfileId: schoolProfile.id,
    }
  })

  console.log('✅ Categories created')

  // Create sample income transactions
  const incomeTransactions = [
    {
      receiptNumber: generateReceiptNumber(1),
      type: 'INCOME',
      date: getCurrentMonthDate(0), // Today
      amount: 1500000,
      categoryId: pendapatanCategory.id,
      description: '4100 - Pendapatan SPP Siswa',
      fromTo: 'Budi Santoso (Kls 10A)',
      paymentMethod: 'CASH',
      status: 'PAID',
      createdById: treasurerUser.id,
      schoolProfileId: schoolProfile.id,
    },
    {
      receiptNumber: generateReceiptNumber(2),
      type: 'INCOME',
      date: getCurrentMonthDate(1), // Yesterday
      amount: 10000000,
      categoryId: modalCategory.id,
      description: '3100 - Modal Awal Sekolah',
      fromTo: 'Yayasan Pendidikan',
      paymentMethod: 'BANK_TRANSFER',
      status: 'PAID',
      createdById: treasurerUser.id,
      schoolProfileId: schoolProfile.id,
    },
    {
      receiptNumber: generateReceiptNumber(3),
      type: 'INCOME',
      date: getCurrentMonthDate(2), // 2 days ago
      amount: 5000000,
      categoryId: pendapatanCategory.id,
      description: '4200 - Dana BOS',
      fromTo: 'Pemerintah',
      paymentMethod: 'BANK_TRANSFER',
      status: 'PAID',
      createdById: adminUser.id,
      schoolProfileId: schoolProfile.id,
    },
    {
      receiptNumber: generateReceiptNumber(4),
      type: 'INCOME',
      date: getCurrentMonthDate(3), // 3 days ago
      amount: 1200000,
      categoryId: aktivaLancarCategory.id,
      description: '1110 - Kas di Bendahara',
      fromTo: 'Transfer Kas',
      paymentMethod: 'CASH',
      status: 'PENDING',
      createdById: treasurerUser.id,
      schoolProfileId: schoolProfile.id,
    },
    {
      receiptNumber: generateReceiptNumber(5),
      type: 'INCOME',
      date: getCurrentMonthDate(4), // 4 days ago
      amount: 2500000,
      categoryId: pendapatanCategory.id,
      description: '4300 - Pendapatan Lain-lain (Donasi)',
      fromTo: 'Alumni Sekolah',
      paymentMethod: 'BANK_TRANSFER',
      status: 'PAID',
      createdById: treasurerUser.id,
      schoolProfileId: schoolProfile.id,
    },
  ]

  for (const transaction of incomeTransactions) {
    await prisma.transaction.create({
      data: transaction as any,
    })
  }

  console.log('✅ Sample income transactions created')

  // Create sample expense transactions
  const expenseTransactions = [
    {
      receiptNumber: generateReceiptNumber(6),
      type: 'EXPENSE',
      date: getCurrentMonthDate(1), // Yesterday
      amount: 750000,
      categoryId: bebanCategory.id,
      description: '5300 - Beban Perlengkapan (ATK)',
      fromTo: 'Toko Sinar Jaya',
      paymentMethod: 'CASH',
      status: 'PAID',
      createdById: treasurerUser.id,
      schoolProfileId: schoolProfile.id,
    },
    {
      receiptNumber: generateReceiptNumber(7),
      type: 'EXPENSE',
      date: getCurrentMonthDate(3), // 3 days ago
      amount: 2200000,
      categoryId: bebanCategory.id,
      description: '5400 - Beban Pemeliharaan (Perbaikan AC)',
      fromTo: 'CV Teknik AC',
      paymentMethod: 'BANK_TRANSFER',
      status: 'PAID',
      createdById: adminUser.id,
      schoolProfileId: schoolProfile.id,
    },
    {
      receiptNumber: generateReceiptNumber(8),
      type: 'EXPENSE',
      date: getCurrentMonthDate(4), // 4 days ago
      amount: 15000000,
      categoryId: bebanCategory.id,
      description: '5100 - Beban Gaji Guru',
      fromTo: 'Transfer Gaji',
      paymentMethod: 'BANK_TRANSFER',
      status: 'PAID',
      createdById: adminUser.id,
      schoolProfileId: schoolProfile.id,
    },
    {
      receiptNumber: generateReceiptNumber(9),
      type: 'EXPENSE',
      date: getCurrentMonthDate(5), // 5 days ago
      amount: 3500000,
      categoryId: bebanCategory.id,
      description: '5200 - Beban Operasional (Listrik, Air)',
      fromTo: 'PLN & PDAM',
      paymentMethod: 'BANK_TRANSFER',
      status: 'PAID',
      createdById: treasurerUser.id,
      schoolProfileId: schoolProfile.id,
    },
    {
      receiptNumber: generateReceiptNumber(10),
      type: 'EXPENSE',
      date: getCurrentMonthDate(6), // 6 days ago
      amount: 1500000,
      categoryId: kewajibanCategory.id,
      description: '2110 - Utang Gaji Guru (Cicilan)',
      fromTo: 'Pembayaran Utang',
      paymentMethod: 'BANK_TRANSFER',
      status: 'PAID',
      createdById: adminUser.id,
      schoolProfileId: schoolProfile.id,
    },
  ]

  for (const transaction of expenseTransactions) {
    await prisma.transaction.create({
      data: transaction as any,
    })
  }

  console.log('✅ Sample expense transactions created')

  // Create sample audit logs
  await prisma.auditLog.create({
    data: {
      action: 'LOGIN',
      entityType: 'User',
      entityId: adminUser.id,
      details: 'Admin logged in',
      userId: adminUser.id,
      schoolProfileId: schoolProfile.id,
    },
  })

  console.log('✅ Sample audit logs created')
  console.log('')
  console.log('🎉 Database seeding completed successfully!')
  console.log('')
  console.log('Test accounts:')
  console.log('� Super Admin: sikeusekolah@gmail.com / superadmin123 (Akses ke semua sekolah)')
  console.log('�📧 Admin: admin@smanjakarta.sch.id / admin123')
  console.log('📧 Bendahara: bendahara@smanjakarta.sch.id / bendahara123')
  console.log('')
  console.log('🌐 App URL: http://localhost:3000')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
