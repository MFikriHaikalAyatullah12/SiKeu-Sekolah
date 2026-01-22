import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Disable caching for this route - FORCE NO CACHE
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("🚀 Dashboard Stats API called:", {
      userId: session.user.id,
      userEmail: session.user.email,
      role: session.user.role,
      sessionSchoolId: session.user.schoolId
    })

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Default to current month if no date range is specified
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

    const where: any = {}
    
    // Get user's schoolId from session or database
    let userSchoolId: string | null = session.user.schoolId
    
    // If not in session, fetch from database
    if (!userSchoolId && session.user.role !== 'SUPER_ADMIN') {
      console.log("⚠️ SchoolId not in session, fetching from database...")
      const userWithSchool = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { 
          schoolProfileId: true,
          email: true,
          name: true,
          role: true
        }
      })
      userSchoolId = userWithSchool?.schoolProfileId || null
      console.log("📚 User data from DB:", {
        email: userWithSchool?.email,
        name: userWithSchool?.name,
        role: userWithSchool?.role,
        schoolProfileId: userSchoolId
      })
    } else {
      console.log("✅ SchoolId found in session:", userSchoolId)
    }
    
    // Only filter by school if user has a school assigned
    if (userSchoolId) {
      where.schoolProfileId = userSchoolId
      console.log("🏫 Filtering by school:", userSchoolId)
    } else if (session.user.role === 'TREASURER') {
      // If Bendahara doesn't have school, try to auto-assign to first available school
      console.log("⚠️ Bendahara doesn't have school assigned, attempting auto-assignment...")
      
      const firstSchool = await prisma.schoolProfile.findFirst({
        orderBy: { createdAt: 'asc' }
      })
      
      if (firstSchool) {
        // Auto-assign Bendahara to first school
        await prisma.user.update({
          where: { id: session.user.id },
          data: { schoolProfileId: firstSchool.id }
        })
        
        userSchoolId = firstSchool.id
        where.schoolProfileId = userSchoolId
        
        console.log("✅ Auto-assigned Bendahara to school:", firstSchool.name, firstSchool.id)
        console.log("🔄 Please refresh the page to see the data")
      } else {
        console.error("❌ ERROR: Bendahara tidak memiliki sekolah dan tidak ada sekolah yang tersedia!")
        return NextResponse.json({ 
          error: "Tidak ada sekolah yang tersedia. Silakan hubungi Super Admin untuk membuat sekolah terlebih dahulu.",
          stats: {
            totalIncome: 0,
            totalExpense: 0,
            balance: 0,
            incomeCount: 0,
            expenseCount: 0,
            monthlyData: [],
            categoryBreakdown: []
          }
        }, { status: 200 })
      }
    }

    // Filter berdasarkan date range
    // Untuk summary stats (total income/expense), SELALU filter per bulan ini
    // Untuk chart, ambil 3-6 bulan terakhir
    if (startDate && endDate) {
      // Custom date range from request
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
      console.log("📅 Custom date filter applied:", { from: startDate, to: endDate })
    } else {
      // Default: filter bulan ini untuk summary cards
      where.date = {
        gte: firstDayOfMonth,
        lte: lastDayOfMonth
      }
      console.log("📅 Current month filter applied:", {
        from: firstDayOfMonth.toISOString(),
        to: lastDayOfMonth.toISOString()
      })
    }

    console.log("📊 Dashboard stats query:", {
      userId: session.user.id,
      userEmail: session.user.email,
      schoolId: userSchoolId,
      role: session.user.role,
      where,
      whereKeys: Object.keys(where),
      dateRange: {
        start: where.date?.gte?.toISOString(),
        end: where.date?.lte?.toISOString()
      }
    })

    // Debug: Check total transactions in database
    const totalTransactionsInDb = await prisma.transaction.count()
    const totalTransactionsForSchool = userSchoolId 
      ? await prisma.transaction.count({ where: { schoolProfileId: userSchoolId } })
      : totalTransactionsInDb
      
    console.log("🔢 Transaction counts:", {
      totalInDb: totalTransactionsInDb,
      forThisSchool: totalTransactionsForSchool,
      withCurrentFilter: await prisma.transaction.count({ where })
    })

    // Build where clause for ALL TIME balance (tanpa filter tanggal)
    const whereAllTime: any = {}
    if (userSchoolId) {
      whereAllTime.schoolProfileId = userSchoolId
    }

    // Get transactions
    const [income, expense, incomeAllTime, expenseAllTime, transactions, monthlyStats, categoryStats] = await Promise.all([
      // Income bulan ini (untuk card "Pemasukan Bulan Ini")
      prisma.transaction.aggregate({
        where: { ...where, type: "INCOME", status: "PAID" },
        _sum: { amount: true },
        _count: true
      }),
      // Expense bulan ini (untuk card "Pengeluaran Bulan Ini")
      prisma.transaction.aggregate({
        where: { ...where, type: "EXPENSE", status: "PAID" },
        _sum: { amount: true },
        _count: true
      }),
      // Income ALL TIME (untuk "Saldo Saat Ini")
      prisma.transaction.aggregate({
        where: { ...whereAllTime, type: "INCOME", status: "PAID" },
        _sum: { amount: true },
        _count: true
      }),
      // Expense ALL TIME (untuk "Saldo Saat Ini")
      prisma.transaction.aggregate({
        where: { ...whereAllTime, type: "EXPENSE", status: "PAID" },
        _sum: { amount: true },
        _count: true
      }),
      prisma.transaction.findMany({
        where,
        include: {
          category: true
        },
        orderBy: { date: "desc" },
        take: 5
      }),
      // Get monthly data for the last 3-6 months based on role
      session.user.role === 'TREASURER'
        ? // For Treasurer: last 3 months (from first day of 3 months ago)
          userSchoolId
            ? prisma.$queryRaw`
              SELECT 
                EXTRACT(YEAR FROM date) as year,
                EXTRACT(MONTH FROM date) as month,
                SUM(CASE WHEN type = 'INCOME' AND status = 'PAID' THEN amount ELSE 0 END) as pemasukan,
                SUM(CASE WHEN type = 'EXPENSE' AND status = 'PAID' THEN amount ELSE 0 END) as pengeluaran
              FROM "transactions" 
              WHERE "schoolProfileId" = ${userSchoolId}
                AND date >= DATE_TRUNC('month', NOW() - INTERVAL '3 months')
                AND date <= NOW()
              GROUP BY EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date)
              ORDER BY year ASC, month ASC
            `
            : prisma.$queryRaw`
              SELECT 
                EXTRACT(YEAR FROM date) as year,
                EXTRACT(MONTH FROM date) as month,
                SUM(CASE WHEN type = 'INCOME' AND status = 'PAID' THEN amount ELSE 0 END) as pemasukan,
                SUM(CASE WHEN type = 'EXPENSE' AND status = 'PAID' THEN amount ELSE 0 END) as pengeluaran
              FROM "transactions" 
              WHERE date >= DATE_TRUNC('month', NOW() - INTERVAL '3 months')
                AND date <= NOW()
              GROUP BY EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date)
              ORDER BY year ASC, month ASC
            `
        : // For Super Admin and others: last 6 months  
          userSchoolId
            ? prisma.$queryRaw`
              SELECT 
                EXTRACT(YEAR FROM date) as year,
                EXTRACT(MONTH FROM date) as month,
                SUM(CASE WHEN type = 'INCOME' AND status = 'PAID' THEN amount ELSE 0 END) as pemasukan,
                SUM(CASE WHEN type = 'EXPENSE' AND status = 'PAID' THEN amount ELSE 0 END) as pengeluaran
              FROM "transactions" 
              WHERE "schoolProfileId" = ${userSchoolId}
                AND date >= DATE_TRUNC('month', NOW() - INTERVAL '6 months')
                AND date <= NOW()
              GROUP BY EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date)
              ORDER BY year ASC, month ASC
            `
            : prisma.$queryRaw`
              SELECT 
                EXTRACT(YEAR FROM date) as year,
                EXTRACT(MONTH FROM date) as month,
                SUM(CASE WHEN type = 'INCOME' AND status = 'PAID' THEN amount ELSE 0 END) as pemasukan,
                SUM(CASE WHEN type = 'EXPENSE' AND status = 'PAID' THEN amount ELSE 0 END) as pengeluaran
              FROM "transactions" 
              WHERE date >= DATE_TRUNC('month', NOW() - INTERVAL '6 months')
                AND date <= NOW()
              GROUP BY EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date)
              ORDER BY year ASC, month ASC
            `,
      // Get category breakdown for expenses
      prisma.transaction.groupBy({
        by: ['categoryId'],
        where: { ...where, type: 'EXPENSE', status: 'PAID' },
        _sum: { amount: true },
        orderBy: {
          _sum: {
            amount: 'desc'
          }
        },
        take: 5
      })
    ])

    console.log("📥 Raw query results:", {
      income: {
        sum: income._sum.amount,
        count: income._count
      },
      expense: {
        sum: expense._sum.amount,
        count: expense._count
      },
      incomeAllTime: {
        sum: incomeAllTime._sum.amount,
        count: incomeAllTime._count
      },
      expenseAllTime: {
        sum: expenseAllTime._sum.amount,
        count: expenseAllTime._count
      }
    })

    // Untuk "Pemasukan/Pengeluaran Bulan Ini" - pakai data bulan ini
    const totalIncome = Number(income._sum.amount || 0)
    const totalExpense = Number(expense._sum.amount || 0)
    
    // Untuk "Saldo Saat Ini" - pakai data ALL TIME
    const totalIncomeAllTime = Number(incomeAllTime._sum.amount || 0)
    const totalExpenseAllTime = Number(expenseAllTime._sum.amount || 0)
    const balance = totalIncomeAllTime - totalExpenseAllTime
    
    // Surplus/Defisit bulan ini
    const surplusDeficit = totalIncome - totalExpense

    console.log("💰 Dashboard stats calculated:", {
      totalIncome,
      totalExpense,
      totalIncomeAllTime,
      totalExpenseAllTime,
      balance,
      surplusDeficit,
      incomeCount: income._count,
      expenseCount: expense._count
    })

    // Process monthly data
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agust', 'Sep', 'Okt', 'Nov', 'Des'];
    
    console.log("📅 Raw monthly stats:", monthlyStats);
    
    let monthlyData = (monthlyStats as any[]).map((item: any) => ({
      month: `${monthNames[Number(item.month) - 1]} ${item.year}`,
      pemasukan: Math.round(Number(item.pemasukan) / 1000000), // Convert to millions
      pengeluaran: Math.round(Number(item.pengeluaran) / 1000000)
    })); // Already ordered ASC from query, no need to reverse

    console.log("📊 Monthly data processed:", monthlyData);

    // If no data exists, create empty months for the chart (no fake data)
    if (monthlyData.length === 0) {
      const currentDate = new Date();
      const emptyMonths = [];
      const monthsToShow = session.user.role === 'TREASURER' ? 3 : 6;
      
      for (let i = monthsToShow - 1; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthName = monthNames[date.getMonth()];
        const year = date.getFullYear();
        
        emptyMonths.push({
          month: `${monthName} ${year}`,
          pemasukan: 0,
          pengeluaran: 0
        });
      }
      
      monthlyData = emptyMonths;
    }

    // Process category breakdown
    const categoryBreakdown = await Promise.all(
      (categoryStats as any[]).map(async (item: any) => {
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId },
          select: { name: true }
        });
        return {
          name: category?.name || 'Lainnya',
          value: Math.round((Number(item._sum.amount || 0) / totalExpense) * 100),
          color: ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#6b7280'][categoryStats.indexOf(item) % 5]
        };
      })
    );

    const response = NextResponse.json({
      stats: {
        totalIncome,        // Pemasukan bulan ini
        totalExpense,       // Pengeluaran bulan ini
        balance,            // Saldo ALL TIME (akumulasi semua transaksi)
        surplusDeficit,     // Surplus/Defisit bulan ini
        incomeCount: income._count,
        expenseCount: expense._count,
        monthlyData: monthlyData, // Use processed monthly data
        categoryBreakdown: categoryBreakdown.filter(item => item.value > 0)
      },
      recentTransactions: transactions
    })
    
    // Add no-cache headers to force fresh data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}
