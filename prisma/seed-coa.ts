import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedCOA() {
  console.log('🌱 Seeding Chart of Accounts...')

  // 1. AKTIVA (ASSET)
  const assetCategory = await prisma.coaCategory.upsert({
    where: { code: '1' },
    update: {},
    create: {
      code: '1',
      name: 'Aktiva (Aset)',
      description: 'Semua aset/kekayaan sekolah',
      type: 'ASSET',
      isActive: true,
    },
  })

  // 1.1 Aktiva Lancar
  const currentAsset = await prisma.coaSubCategory.upsert({
    where: { code: '11' },
    update: {},
    create: {
      categoryId: assetCategory.id,
      code: '11',
      name: 'Aktiva Lancar',
      description: 'Aset yang dapat dikonversi menjadi kas dalam waktu dekat',
      isActive: true,
    },
  })

  await prisma.coaAccount.createMany({
    data: [
      {
        subCategoryId: currentAsset.id,
        code: '1110',
        name: 'Kas di Bendahara',
        description: 'Kas/uang tunai yang disimpan bendahara',
        isActive: true,
        visibleToTreasurer: true,
      },
      {
        subCategoryId: currentAsset.id,
        code: '1120',
        name: 'Rekening Bank Sekolah',
        description: 'Rekening bank atas nama sekolah',
        isActive: true,
        visibleToTreasurer: true,
      },
      {
        subCategoryId: currentAsset.id,
        code: '1130',
        name: 'Piutang SPP Siswa',
        description: 'Tagihan SPP yang belum dibayar siswa',
        isActive: true,
        visibleToTreasurer: true,
      },
    ],
    skipDuplicates: true,
  })

  // 1.2 Aktiva Tetap
  const fixedAsset = await prisma.coaSubCategory.upsert({
    where: { code: '12' },
    update: {},
    create: {
      categoryId: assetCategory.id,
      code: '12',
      name: 'Aktiva Tetap',
      description: 'Aset jangka panjang untuk operasional',
      isActive: true,
    },
  })

  await prisma.coaAccount.createMany({
    data: [
      {
        subCategoryId: fixedAsset.id,
        code: '1210',
        name: 'Tanah',
        description: 'Tanah milik sekolah',
        isActive: true,
        visibleToTreasurer: false,
      },
      {
        subCategoryId: fixedAsset.id,
        code: '1220',
        name: 'Bangunan',
        description: 'Bangunan gedung sekolah',
        isActive: true,
        visibleToTreasurer: false,
      },
      {
        subCategoryId: fixedAsset.id,
        code: '1230',
        name: 'Peralatan dan Mesin',
        description: 'Peralatan dan mesin sekolah',
        isActive: true,
        visibleToTreasurer: false,
      },
    ],
    skipDuplicates: true,
  })

  // 2. KEWAJIBAN (LIABILITY)
  const liabilityCategory = await prisma.coaCategory.upsert({
    where: { code: '2' },
    update: {},
    create: {
      code: '2',
      name: 'Kewajiban (Utang)',
      description: 'Kewajiban/utang sekolah',
      type: 'LIABILITY',
      isActive: true,
    },
  })

  // 2.1 Kewajiban Jangka Pendek
  const currentLiability = await prisma.coaSubCategory.upsert({
    where: { code: '21' },
    update: {},
    create: {
      categoryId: liabilityCategory.id,
      code: '21',
      name: 'Kewajiban Jangka Pendek',
      description: 'Utang jangka pendek (< 1 tahun)',
      isActive: true,
    },
  })

  await prisma.coaAccount.createMany({
    data: [
      {
        subCategoryId: currentLiability.id,
        code: '2110',
        name: 'Utang Gaji Guru',
        description: 'Gaji guru yang belum dibayar',
        isActive: true,
        visibleToTreasurer: true,
      },
      {
        subCategoryId: currentLiability.id,
        code: '2120',
        name: 'Utang Pemasok',
        description: 'Utang kepada pemasok/vendor',
        isActive: true,
        visibleToTreasurer: true,
      },
    ],
    skipDuplicates: true,
  })

  // 2.2 Kewajiban Jangka Panjang
  const longTermLiability = await prisma.coaSubCategory.upsert({
    where: { code: '22' },
    update: {},
    create: {
      categoryId: liabilityCategory.id,
      code: '22',
      name: 'Kewajiban Jangka Panjang',
      description: 'Utang jangka panjang (> 1 tahun)',
      isActive: true,
    },
  })

  await prisma.coaAccount.createMany({
    data: [
      {
        subCategoryId: longTermLiability.id,
        code: '2210',
        name: 'Utang Bank',
        description: 'Pinjaman/kredit bank',
        isActive: true,
        visibleToTreasurer: false,
      },
    ],
    skipDuplicates: true,
  })

  // 3. MODAL (EQUITY)
  const equityCategory = await prisma.coaCategory.upsert({
    where: { code: '3' },
    update: {},
    create: {
      code: '3',
      name: 'Modal (Ekuitas)',
      description: 'Modal dan laba ditahan',
      type: 'EQUITY',
      isActive: true,
    },
  })

  const equity = await prisma.coaSubCategory.upsert({
    where: { code: '31' },
    update: {},
    create: {
      categoryId: equityCategory.id,
      code: '31',
      name: 'Modal',
      description: 'Modal sekolah',
      isActive: true,
    },
  })

  await prisma.coaAccount.createMany({
    data: [
      {
        subCategoryId: equity.id,
        code: '3100',
        name: 'Modal Awal Sekolah',
        description: 'Modal awal pendirian sekolah',
        isActive: true,
        visibleToTreasurer: false,
      },
      {
        subCategoryId: equity.id,
        code: '3200',
        name: 'Saldo Laba atau Rugi',
        description: 'Akumulasi laba/rugi',
        isActive: true,
        visibleToTreasurer: false,
      },
    ],
    skipDuplicates: true,
  })

  // 4. PENDAPATAN (REVENUE)
  const revenueCategory = await prisma.coaCategory.upsert({
    where: { code: '4' },
    update: {},
    create: {
      code: '4',
      name: 'Pendapatan',
      description: 'Semua sumber pendapatan sekolah',
      type: 'REVENUE',
      isActive: true,
    },
  })

  const revenue = await prisma.coaSubCategory.upsert({
    where: { code: '41' },
    update: {},
    create: {
      categoryId: revenueCategory.id,
      code: '41',
      name: 'Pendapatan Operasional',
      description: 'Pendapatan dari kegiatan operasional',
      isActive: true,
    },
  })

  await prisma.coaAccount.createMany({
    data: [
      {
        subCategoryId: revenue.id,
        code: '4100',
        name: 'Pendapatan SPP Siswa',
        description: 'Penerimaan SPP dari siswa',
        isActive: true,
        visibleToTreasurer: true,
      },
      {
        subCategoryId: revenue.id,
        code: '4200',
        name: 'Dana Bantuan Operasional Sekolah (BOS)',
        description: 'Dana BOS dari pemerintah',
        isActive: true,
        visibleToTreasurer: true,
      },
      {
        subCategoryId: revenue.id,
        code: '4300',
        name: 'Pendapatan Lain-lain',
        description: 'Pendapatan selain SPP dan BOS',
        isActive: true,
        visibleToTreasurer: true,
      },
    ],
    skipDuplicates: true,
  })

  // 5. BEBAN (EXPENSE)
  const expenseCategory = await prisma.coaCategory.upsert({
    where: { code: '5' },
    update: {},
    create: {
      code: '5',
      name: 'Beban',
      description: 'Semua pengeluaran sekolah',
      type: 'EXPENSE',
      isActive: true,
    },
  })

  const expense = await prisma.coaSubCategory.upsert({
    where: { code: '51' },
    update: {},
    create: {
      categoryId: expenseCategory.id,
      code: '51',
      name: 'Beban Operasional',
      description: 'Beban untuk operasional sekolah',
      isActive: true,
    },
  })

  await prisma.coaAccount.createMany({
    data: [
      {
        subCategoryId: expense.id,
        code: '5100',
        name: 'Beban Gaji dan Kesejahteraan',
        description: 'Gaji guru, staff, dan tunjangan',
        isActive: true,
        visibleToTreasurer: true,
      },
      {
        subCategoryId: expense.id,
        code: '5200',
        name: 'Beban Operasional',
        description: 'Beban operasional harian',
        isActive: true,
        visibleToTreasurer: true,
      },
      {
        subCategoryId: expense.id,
        code: '5300',
        name: 'Beban Perlengkapan',
        description: 'Pembelian perlengkapan sekolah',
        isActive: true,
        visibleToTreasurer: true,
      },
      {
        subCategoryId: expense.id,
        code: '5400',
        name: 'Beban Pemeliharaan',
        description: 'Pemeliharaan gedung dan aset',
        isActive: true,
        visibleToTreasurer: true,
      },
      {
        subCategoryId: expense.id,
        code: '5500',
        name: 'Beban Penyusutan',
        description: 'Penyusutan aset tetap',
        isActive: true,
        visibleToTreasurer: false,
      },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Chart of Accounts seeded successfully!')
}

async function main() {
  try {
    await seedCOA()
  } catch (error) {
    console.error('❌ Error seeding COA:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
