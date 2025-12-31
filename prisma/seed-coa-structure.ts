import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding COA Structure...')

  // 1. AKTIVA (Asset)
  const aktiva = await prisma.coaCategory.upsert({
    where: { code: '1000' },
    update: {},
    create: {
      code: '1000',
      name: 'AKTIVA',
      type: 'ASSET',
      description: 'Harta atau kekayaan yang dimiliki sekolah',
    },
  })
  console.log('✅ Created category: AKTIVA')

  // 1.1 Aktiva Lancar
  const aktivaLancar = await prisma.coaSubCategory.upsert({
    where: { code: '1100' },
    update: {},
    create: {
      code: '1100',
      name: 'Aktiva Lancar',
      categoryId: aktiva.id,
      description: 'Harta yang dapat dicairkan dalam waktu singkat',
    },
  })

  await prisma.coaAccount.createMany({
    data: [
      { code: '1110', name: 'Kas di Bendahara', subCategoryId: aktivaLancar.id },
      { code: '1120', name: 'Bank (Bank Sekolah)', subCategoryId: aktivaLancar.id },
      { code: '1130', name: 'Piutang SPP Siswa', subCategoryId: aktivaLancar.id },
    ],
    skipDuplicates: true,
  })
  console.log('✅ Created subcategory: Aktiva Lancar + accounts')

  // 1.2 Aktiva Tetap
  const aktivaTetap = await prisma.coaSubCategory.upsert({
    where: { code: '1200' },
    update: {},
    create: {
      code: '1200',
      name: 'Aktiva Tetap',
      categoryId: aktiva.id,
      description: 'Harta jangka panjang yang digunakan untuk operasional',
    },
  })

  await prisma.coaAccount.createMany({
    data: [
      { code: '1210', name: 'Tanah', subCategoryId: aktivaTetap.id },
      { code: '1220', name: 'Bangunan', subCategoryId: aktivaTetap.id },
      { code: '1230', name: 'Peralatan dan Mesin', subCategoryId: aktivaTetap.id },
    ],
    skipDuplicates: true,
  })
  console.log('✅ Created subcategory: Aktiva Tetap + accounts')

  // 2. KEWAJIBAN (Liability)
  const kewajiban = await prisma.coaCategory.upsert({
    where: { code: '2000' },
    update: {},
    create: {
      code: '2000',
      name: 'KEWAJIBAN',
      type: 'LIABILITY',
      description: 'Utang atau kewajiban yang harus dibayar sekolah',
    },
  })
  console.log('✅ Created category: KEWAJIBAN')

  // 2.1 Kewajiban Jangka Pendek
  const kewajibanPendek = await prisma.coaSubCategory.upsert({
    where: { code: '2100' },
    update: {},
    create: {
      code: '2100',
      name: 'Kewajiban Jangka Pendek',
      categoryId: kewajiban.id,
      description: 'Utang yang harus dibayar dalam waktu singkat',
    },
  })

  await prisma.coaAccount.createMany({
    data: [
      { code: '2110', name: 'Utang Gaji Guru', subCategoryId: kewajibanPendek.id },
      { code: '2120', name: 'Utang Pemasok (ATK, dll.)', subCategoryId: kewajibanPendek.id },
    ],
    skipDuplicates: true,
  })
  console.log('✅ Created subcategory: Kewajiban Jangka Pendek + accounts')

  // 2.2 Kewajiban Jangka Panjang
  const kewajibanPanjang = await prisma.coaSubCategory.upsert({
    where: { code: '2200' },
    update: {},
    create: {
      code: '2200',
      name: 'Kewajiban Jangka Panjang',
      categoryId: kewajiban.id,
      description: 'Utang jangka panjang',
    },
  })

  await prisma.coaAccount.createMany({
    data: [
      { code: '2210', name: 'Utang Bank (Jika ada)', subCategoryId: kewajibanPanjang.id },
    ],
    skipDuplicates: true,
  })
  console.log('✅ Created subcategory: Kewajiban Jangka Panjang + accounts')

  // 3. MODAL (Equity)
  const modal = await prisma.coaCategory.upsert({
    where: { code: '3000' },
    update: {},
    create: {
      code: '3000',
      name: 'MODAL',
      type: 'EQUITY',
      description: 'Modal atau ekuitas sekolah',
    },
  })
  console.log('✅ Created category: MODAL')

  // Modal accounts (no subcategory needed)
  const modalGeneral = await prisma.coaSubCategory.upsert({
    where: { code: '3000' },
    update: {},
    create: {
      code: '3000',
      name: 'Modal',
      categoryId: modal.id,
    },
  })

  await prisma.coaAccount.createMany({
    data: [
      { code: '3100', name: 'Modal Awal Sekolah', subCategoryId: modalGeneral.id },
      { code: '3200', name: 'Saldo Laba/Rugi (dari pendapatan-beban)', subCategoryId: modalGeneral.id },
    ],
    skipDuplicates: true,
  })
  console.log('✅ Created modal accounts')

  // 4. PENDAPATAN (Revenue)
  const pendapatan = await prisma.coaCategory.upsert({
    where: { code: '4000' },
    update: {},
    create: {
      code: '4000',
      name: 'PENDAPATAN',
      type: 'REVENUE',
      description: 'Pemasukan atau pendapatan sekolah',
    },
  })
  console.log('✅ Created category: PENDAPATAN')

  // Pendapatan accounts
  const pendapatanGeneral = await prisma.coaSubCategory.upsert({
    where: { code: '4000' },
    update: {},
    create: {
      code: '4000',
      name: 'Pendapatan',
      categoryId: pendapatan.id,
    },
  })

  await prisma.coaAccount.createMany({
    data: [
      { code: '4100', name: 'Pendapatan SPP Siswa', subCategoryId: pendapatanGeneral.id },
      { code: '4200', name: 'Dana Bantuan Operasional Sekolah (BOS)', subCategoryId: pendapatanGeneral.id },
      { code: '4300', name: 'Pendapatan Lain-lain (Donasi, Kegiatan Ekstrakurikuler)', subCategoryId: pendapatanGeneral.id },
    ],
    skipDuplicates: true,
  })
  console.log('✅ Created pendapatan accounts')

  // 5. BEBAN (Expense)
  const beban = await prisma.coaCategory.upsert({
    where: { code: '5000' },
    update: {},
    create: {
      code: '5000',
      name: 'BEBAN',
      type: 'EXPENSE',
      description: 'Biaya atau pengeluaran operasional sekolah',
    },
  })
  console.log('✅ Created category: BEBAN')

  // Beban accounts
  const bebanGeneral = await prisma.coaSubCategory.upsert({
    where: { code: '5000' },
    update: {},
    create: {
      code: '5000',
      name: 'Beban',
      categoryId: beban.id,
    },
  })

  await prisma.coaAccount.createMany({
    data: [
      { code: '5100', name: 'Beban Gaji dan Kesejahteraan Guru/Karyawan', subCategoryId: bebanGeneral.id },
      { code: '5200', name: 'Beban Operasional (Listrik, Air, Telepon)', subCategoryId: bebanGeneral.id },
      { code: '5300', name: 'Beban Perlengkapan (ATK, Kebersihan)', subCategoryId: bebanGeneral.id },
      { code: '5400', name: 'Beban Pemeliharaan (Gedung, Peralatan)', subCategoryId: bebanGeneral.id },
      { code: '5500', name: 'Beban Penyusutan Aktiva Tetap', subCategoryId: bebanGeneral.id },
    ],
    skipDuplicates: true,
  })
  console.log('✅ Created beban accounts')

  console.log('✅ COA Structure seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding COA:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
