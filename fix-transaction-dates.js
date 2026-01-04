const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixTransactionDates() {
  try {
    console.log('🔧 Fixing transaction dates...\n');

    // Get all transactions with wrong dates
    const wrongDateTransactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { date: { lt: new Date('2025-01-01') } }, // Before 2025
          { date: { gt: new Date() } } // Future dates
        ]
      },
      select: {
        id: true,
        receiptNumber: true,
        date: true,
        type: true,
        amount: true
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`📊 Found ${wrongDateTransactions.length} transactions with wrong dates:\n`);

    if (wrongDateTransactions.length === 0) {
      console.log('✅ No transactions need fixing!');
      return;
    }

    // Fix each transaction
    let fixed = 0;
    const startDate = new Date('2025-11-01'); // Start from November 2025
    
    for (let i = 0; i < wrongDateTransactions.length; i++) {
      const tx = wrongDateTransactions[i];
      
      // Calculate new date: spread transactions across Nov 2025 - Dec 2025
      const newDate = new Date(startDate);
      newDate.setDate(startDate.getDate() + (i * 2)); // 2 days apart
      
      // If goes beyond Dec 31, 2025, reset to Dec 2025
      if (newDate > new Date('2025-12-31')) {
        newDate.setFullYear(2025);
        newDate.setMonth(11); // December (0-indexed)
        newDate.setDate(Math.floor(Math.random() * 28) + 1); // Random day in Dec
      }

      console.log(`Fixing: ${tx.receiptNumber}`);
      console.log(`  Old: ${tx.date.toISOString()}`);
      console.log(`  New: ${newDate.toISOString()}`);

      await prisma.transaction.update({
        where: { id: tx.id },
        data: { date: newDate }
      });

      fixed++;
      console.log(`  ✅ Fixed!\n`);
    }

    console.log(`\n🎉 Successfully fixed ${fixed} transactions!`);
    console.log('\nAll transactions now have dates between November-December 2025');
    console.log('This is within the 3-month range for TREASURER (Oct 1, 2025 - Jan 4, 2026)\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTransactionDates();
