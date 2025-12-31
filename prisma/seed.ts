import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Upsert Super Admin User (Global - tanpa schoolProfileId)
  const superAdminPassword = await bcrypt.hash('superadmin123', 12)
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'superadmin@sikeu.com' },
    update: {},
    create: {
      email: 'superadmin@sikeu.com',
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
      receiptNumber: 'KW-202512-001',
      type: 'INCOME',
      date: new Date('2025-12-18'),
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
      receiptNumber: 'KW-202512-002',
      type: 'INCOME',
      date: new Date('2025-12-17'),
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
      receiptNumber: 'KW-202512-003',
      type: 'INCOME',
      date: new Date('2025-12-16'),
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
      receiptNumber: 'KW-202512-004',
      type: 'INCOME',
      date: new Date('2025-12-15'),
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
      receiptNumber: 'KW-202512-005',
      type: 'INCOME',
      date: new Date('2025-12-14'),
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
      receiptNumber: 'KW-202512-006',
      type: 'EXPENSE',
      date: new Date('2025-12-17'),
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
      receiptNumber: 'KW-202512-007',
      type: 'EXPENSE',
      date: new Date('2025-12-15'),
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
      receiptNumber: 'KW-202512-008',
      type: 'EXPENSE',
      date: new Date('2025-12-14'),
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
      receiptNumber: 'KW-202512-009',
      type: 'EXPENSE',
      date: new Date('2025-12-13'),
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
      receiptNumber: 'KW-202512-010',
      type: 'EXPENSE',
      date: new Date('2025-12-12'),
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
  console.log('� Super Admin: superadmin@sikeu.com / superadmin123 (Akses ke semua sekolah)')
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
