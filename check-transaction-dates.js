const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTransactionDates() {
  try {
    console.log('🔍 Checking transaction dates for TREASURER...\n');

    // Get current date info
    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 3, 1, 0, 0, 0, 0);
    
    console.log('📅 Current Date:', now.toISOString());
    console.log('📅 TREASURER Filter Range:');
    console.log('   From:', startDate.toISOString());
    console.log('   To:  ', endDate.toISOString());
    console.log('');

    // Find Bendahara's school
    const bendahara = await prisma.user.findFirst({
      where: { role: 'TREASURER' },
      select: { schoolProfileId: true }
    });

    if (!bendahara?.schoolProfileId) {
      console.log('❌ Bendahara not found or not assigned to school');
      return;
    }

    console.log('🏫 School ID:', bendahara.schoolProfileId);
    console.log('');

    // Get all transactions for this school
    const allTransactions = await prisma.transaction.findMany({
      where: { schoolProfileId: bendahara.schoolProfileId },
      select: {
        id: true,
        receiptNumber: true,
        date: true,
        type: true,
        amount: true,
        createdAt: true
      },
      orderBy: { date: 'desc' }
    });

    console.log(`📊 Total Transactions in DB: ${allTransactions.length}`);
    console.log('');

    // Show all transactions with dates
    console.log('📋 All Transactions:');
    allTransactions.forEach((tx, index) => {
      const isInRange = tx.date >= startDate && tx.date <= endDate;
      const marker = isInRange ? '✅' : '❌';
      console.log(`${marker} ${index + 1}. ${tx.receiptNumber} | Date: ${tx.date.toISOString()} | ${tx.type} | Rp ${tx.amount.toLocaleString()}`);
    });
    console.log('');

    // Count transactions in range
    const inRangeTransactions = allTransactions.filter(tx => 
      tx.date >= startDate && tx.date <= endDate
    );

    console.log(`✅ Transactions in TREASURER range (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}): ${inRangeTransactions.length}`);
    console.log(`❌ Transactions outside range: ${allTransactions.length - inRangeTransactions.length}`);

    if (inRangeTransactions.length === 0) {
      console.log('');
      console.log('⚠️  NO TRANSACTIONS IN RANGE!');
      console.log('   The oldest transaction should have date >= ' + startDate.toISOString());
      console.log('');
      if (allTransactions.length > 0) {
        const oldestDate = allTransactions[allTransactions.length - 1].date;
        console.log('   Oldest transaction date:', oldestDate.toISOString());
        console.log('   Days difference:', Math.floor((startDate - oldestDate) / (1000 * 60 * 60 * 24)));
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTransactionDates();
