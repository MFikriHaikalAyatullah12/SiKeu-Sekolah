const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/sikeu_sekolah"
    }
  }
});

async function fixBendahara() {
  try {
    console.log('🔧 Fixing Bendahara assignment...\n');

    // Find Bendahara user
    const bendahara = await prisma.user.findFirst({
      where: { role: 'TREASURER' }
    });

    if (!bendahara) {
      console.log('❌ No Bendahara user found!');
      return;
    }

    console.log('✅ Found Bendahara:', bendahara.email);

    // Find UMM school
    const school = await prisma.schoolProfile.findFirst({
      where: { 
        OR: [
          { name: { contains: 'Muhammadiyah', mode: 'insensitive' } },
          { name: { contains: 'UMM', mode: 'insensitive' } }
        ]
      }
    });

    if (!school) {
      console.log('❌ School not found!');
      return;
    }

    console.log('✅ Found School:', school.name);

    // Update Bendahara with school
    if (bendahara.schoolProfileId !== school.id) {
      await prisma.user.update({
        where: { id: bendahara.id },
        data: { schoolProfileId: school.id }
      });
      console.log('✅ Bendahara assigned to school!');
    } else {
      console.log('✅ Bendahara already assigned to school!');
    }

    // Check transactions
    const total = await prisma.transaction.count({
      where: { schoolProfileId: school.id }
    });

    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    
    const last3Months = await prisma.transaction.count({
      where: {
        schoolProfileId: school.id,
        date: { gte: threeMonthsAgo, lte: now }
      }
    });

    console.log(`\n�� Transactions for ${school.name}:`);
    console.log(`   Total: ${total}`);
    console.log(`   Last 3 months: ${last3Months}`);
    console.log(`   Date range: ${threeMonthsAgo.toLocaleDateString('id-ID')} - ${now.toLocaleDateString('id-ID')}`);

    if (last3Months === 0) {
      console.log('\n⚠️  No transactions in last 3 months!');
      console.log('   Bendahara will see empty dashboard.');
      console.log('   Solution: Add transactions with dates in the last 3 months.');
    } else {
      console.log('\n✅ Data ready! Bendahara should see the dashboard data now.');
      console.log('   Please refresh the dashboard page.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixBendahara();
