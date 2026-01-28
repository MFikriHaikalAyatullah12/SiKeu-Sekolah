const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const transactions = await prisma.transaction.findMany({
    include: { category: true, schoolProfile: true },
    orderBy: { date: 'desc' }
  });
  
  console.log('=== SEMUA TRANSAKSI ===');
  console.log('Total transaksi:', transactions.length);
  console.log('');
  
  let totalIncome = 0, totalExpense = 0;
  
  transactions.forEach((t, i) => {
    const amount = Number(t.amount);
    if (t.type === 'INCOME' && t.status === 'PAID') totalIncome += amount;
    if (t.type === 'EXPENSE' && t.status === 'PAID') totalExpense += amount;
    const dateStr = new Date(t.date).toLocaleDateString('id-ID');
    const school = t.schoolProfile ? t.schoolProfile.name.substring(0,20) : 'N/A';
    console.log((i+1) + '. [' + t.type + '] ' + (t.description || 'No desc').substring(0,35).padEnd(35) + ' Rp ' + String(amount.toLocaleString('id-ID')).padStart(15) + ' (' + t.status.padEnd(7) + ') ' + dateStr + ' - ' + school);
  });
  
  console.log('');
  console.log('=== RINGKASAN TOTAL (ALL TIME) ===');
  console.log('Total Pemasukan (PAID): Rp', totalIncome.toLocaleString('id-ID'));
  console.log('Total Pengeluaran (PAID): Rp', totalExpense.toLocaleString('id-ID'));
  console.log('SALDO (Total): Rp', (totalIncome - totalExpense).toLocaleString('id-ID'));
  
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  
  console.log('');
  console.log('Filter bulan ini:', firstDay.toLocaleDateString('id-ID'), '-', lastDay.toLocaleDateString('id-ID'));
  
  let incomeThisMonth = 0, expenseThisMonth = 0;
  const thisMonthTxs = transactions.filter(t => {
    const d = new Date(t.date);
    return d >= firstDay && d <= lastDay;
  });
  
  console.log('Transaksi bulan ini:', thisMonthTxs.length);
  thisMonthTxs.forEach(t => {
    const amount = Number(t.amount);
    if (t.type === 'INCOME' && t.status === 'PAID') incomeThisMonth += amount;
    if (t.type === 'EXPENSE' && t.status === 'PAID') expenseThisMonth += amount;
  });
  
  console.log('');
  console.log('=== BULAN INI (Jan 2026) ===');
  console.log('Pemasukan: Rp', incomeThisMonth.toLocaleString('id-ID'));
  console.log('Pengeluaran: Rp', expenseThisMonth.toLocaleString('id-ID'));
  console.log('SURPLUS: Rp', (incomeThisMonth - expenseThisMonth).toLocaleString('id-ID'));
  
  const schools = await prisma.schoolProfile.findMany();
  console.log('');
  console.log('=== SEKOLAH ===');
  schools.forEach(s => console.log('-', s.name));
}

main().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); });
