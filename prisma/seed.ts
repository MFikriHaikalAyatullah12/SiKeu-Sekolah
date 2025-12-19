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

  // Create School Profile
  const schoolProfile = await prisma.schoolProfile.create({
    data: {
      name: 'Sekolah Menengah Atas Negeri 1',
      address: 'Jl. Pendidikan No. 123, Jakarta',
      phone: '(021) 12345678',
      email: 'info@smanjakarta.sch.id',
    },
  })

  console.log('✅ School profile created:', schoolProfile.name)

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@smanjakarta.sch.id',
      password: adminPassword,
      name: 'Administrator',
      role: 'ADMIN',
      schoolProfileId: schoolProfile.id,
    }
  })

  console.log('✅ Admin user created:', adminUser.email)

  // Create Bendahara User
  const bendaharaPassword = await bcrypt.hash('bendahara123', 12)
  const bendaharaUser = await prisma.user.create({
    data: {
      email: 'bendahara@smanjakarta.sch.id',
      password: bendaharaPassword,
      name: 'Bendahara Sekolah',
      role: 'TREASURER',
      schoolProfileId: schoolProfile.id
    }
  })

  console.log('✅ Bendahara user created:', bendaharaUser.email)

  // Create categories first
  const sppCategory = await prisma.category.create({
    data: {
      name: 'SPP Siswa',
      type: 'INCOME',
      description: 'Sumbangan Penyelenggaraan Pendidikan',
      schoolProfileId: schoolProfile.id,
    }
  })

  const donationCategory = await prisma.category.create({
    data: {
      name: 'Donasi',
      type: 'INCOME',
      description: 'Donasi dari alumni dan masyarakat',
      schoolProfileId: schoolProfile.id,
    }
  })

  const operationalCategory = await prisma.category.create({
    data: {
      name: 'Operasional Harian',
      type: 'EXPENSE',
      description: 'Pengeluaran operasional harian sekolah',
      schoolProfileId: schoolProfile.id,
    }
  })

  const facilityCategory = await prisma.category.create({
    data: {
      name: 'Fasilitas Sekolah',
      type: 'EXPENSE',
      description: 'Perbaikan dan pemeliharaan fasilitas',
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
      categoryId: sppCategory.id,
      description: 'SPP Bulan Desember 2025',
      fromTo: 'Budi Santoso (Kls 10A)',
      paymentMethod: 'CASH',
      status: 'PAID',
      createdById: bendaharaUser.id,
      schoolProfileId: schoolProfile.id,
    },
    {
      receiptNumber: 'KW-202512-002',
      type: 'INCOME',
      date: new Date('2025-12-17'),
      amount: 750000,
      categoryId: sppCategory.id,
      description: 'Uang Pangkal Siswa Baru',
      fromTo: 'Siti Aminah (Kls 11B)',
      paymentMethod: 'BANK_TRANSFER',
      status: 'PAID',
      createdById: bendaharaUser.id,
      schoolProfileId: schoolProfile.id,
    },
    {
      receiptNumber: 'KW-202512-003',
      type: 'INCOME',
      date: new Date('2025-12-16'),
      amount: 5000000,
      categoryId: donationCategory.id,
      description: 'Donasi Alumni Angkatan 2010',
      fromTo: 'Alumni 2010',
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
      categoryId: sppCategory.id,
      description: 'Uang Pangkal',
      fromTo: 'Siti Aminah (11B)',
      paymentMethod: 'QRIS',
      status: 'PENDING',
      createdById: bendaharaUser.id,
      schoolProfileId: schoolProfile.id,
    },
    {
      receiptNumber: 'KW-202512-005',
      type: 'INCOME',
      date: new Date('2025-12-14'),
      amount: 1500000,
      categoryId: sppCategory.id,
      description: 'SPP Bulan Desember 2025',
      fromTo: 'Siti Aminah (Kls 11B)',
      paymentMethod: 'CASH',
      status: 'PAID',
      createdById: bendaharaUser.id,
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
      categoryId: operationalCategory.id,
      description: 'Pembelian ATK',
      fromTo: 'Beli ATK',
      paymentMethod: 'CASH',
      status: 'PAID',
      createdById: bendaharaUser.id,
      schoolProfileId: schoolProfile.id,
    },
    {
      receiptNumber: 'KW-202512-007',
      type: 'EXPENSE',
      date: new Date('2025-12-15'),
      amount: 2200000,
      categoryId: facilityCategory.id,
      description: 'Perbaikan AC Ruang Guru',
      fromTo: 'Perbaikan AC',
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