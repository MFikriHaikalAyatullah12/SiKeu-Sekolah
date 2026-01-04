require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBendaharaData() {
  try {
    console.log('🔍 Checking Bendahara data...\n');

    // 1. Find Bendahara user
    const bendahara = await prisma.user.findFirst({
      where: { role: 'TREASURER' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        schoolProfileId: true
      }
    });

    console.log('👤 Bendahara User:');
    console.log(bendahara);
    console.log('');

    if (!bendahara) {
      console.log('❌ No Bendahara user found!');
      return;
    }

    if (!bendahara.schoolProfileId) {
      console.log('❌ Bendahara not assigned to any school!');
      console.log('   Please assign schoolProfileId to this user.\n');
      
      // Show available schools
      const schools = await prisma.schoolProfile.findMany({
        select: { id: true, name: true }
      });
      console.log('📚 Available schools:');
      schools.forEach(s => console.log(`   - ${s.name} (${s.id})`));
      return;
    }

    console.log('✅ Bendahara assigned to school:', bendahara.schoolProfileId);
    console.log('');

    // 2. Get school info
    const school = await prisma.schoolProfile.findUnique({
      where: { id: bendahara.schoolProfileId },
      select: { id: true, name: true, address: true }
    });

    console.log('🏫 School Info:');
    console.log(school);
    console.log('');

    // 3. Count transactions for this school
    const totalTransactions = await prisma.transaction.count({
      where: { schoolProfileId: bendahara.schoolProfileId }
    });

    console.log(`📊 Total transactions for this school: ${totalTransactions}`);
    console.log('');

    if (totalTransactions === 0) {
      console.log('❌ No transactions found for this school!');
      return;
    }

    // 4. Get date range for last 3 months
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1, 0, 0, 0, 0);
    
    console.log('📅 Date Range (3 months):');
    console.log(`   From: ${threeMonthsAgo.toISOString()}`);
    console.log(`   To:   ${now.toISOString()}`);
    console.log('');

    // 5. Count transactions in last 3 months
    const transactionsLast3Months = await prisma.transaction.count({
      where: {
        schoolProfileId: bendahara.schoolProfileId,
        date: {
          gte: threeMonthsAgo,
          lte: now
        }
      }
    });

    console.log(`📈 Transactions in last 3 months: ${transactionsLast3Months}`);
    console.log('');

    // 6. Get summary
    const summary = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        schoolProfileId: bendahara.schoolProfileId,
        date: {
          gte: threeMonthsAgo,
          lte: now
        },
        status: 'PAID'
      },
      _sum: { amount: true },
      _count: true
    });

    console.log('💰 Summary (PAID only):');
    summary.forEach(s => {
      console.log(`   ${s.type}: Rp ${Number(s._sum.amount || 0).toLocaleString('id-ID')} (${s._count} transaksi)`);
    });
    console.log('');

    // 7. Get sample transactions
    const sampleTransactions = await prisma.transaction.findMany({
      where: {
        schoolProfileId: bendahara.schoolProfileId,
        date: {
          gte: threeMonthsAgo,
          lte: now
        }
      },
      select: {
        id: true,
        date: true,
        type: true,
        amount: true,
        description: true,
        status: true
      },
      orderBy: { date: 'desc' },
      take: 5
    });

    console.log('📋 Sample Transactions (Last 5):');
    sampleTransactions.forEach(t => {
      console.log(`   - ${t.date.toLocaleDateString('id-ID')}: ${t.type} Rp ${Number(t.amount).toLocaleString('id-ID')} - ${t.description} (${t.status})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBendaharaData();
