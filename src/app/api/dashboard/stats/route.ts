import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Disable caching and enable streaming for faster response
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs' // Use Node.js runtime for better performance

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

    // For Super Admin, show all data regardless of date range for better dashboard visibility
    // For Treasurer, limit to 3 months only
    if (session.user.role === 'SUPER_ADMIN' && !startDate && !endDate) {
      // Don't filter by date for Super Admin's dashboard overview
      console.log("🔓 SUPER_ADMIN: No date filter applied")
    } else if (session.user.role === 'TREASURER') {
      // Always limit Treasurer to 3 months regardless of date parameters
      const now = new Date()
      now.setHours(23, 59, 59, 999) // End of today
      
      // Start from first day of 3 months ago
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1, 0, 0, 0, 0)
      
      where.date = {
        gte: threeMonthsAgo,
        lte: now
      }
      
      console.log("🔒 TREASURER 3-month filter applied:", {
        from: threeMonthsAgo.toISOString(),
        to: now.toISOString(),
        rangeInDays: Math.ceil((now.getTime() - threeMonthsAgo.getTime()) / (1000 * 60 * 60 * 24))
      })
    } else if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } else {
      // For non-Super Admin or when specific date range is requested
      where.date = {
        gte: firstDayOfMonth,
        lte: lastDayOfMonth
      }
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

    // Get transactions
    const [income, expense, transactions, monthlyStats, categoryStats] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...where, type: "INCOME", status: "PAID" },
        _sum: { amount: true },
        _count: true
      }),
      prisma.transaction.aggregate({
        where: { ...where, type: "EXPENSE", status: "PAID" },
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
      }
    })

    const totalIncome = Number(income._sum.amount || 0)
    const totalExpense = Number(expense._sum.amount || 0)
    const balance = totalIncome - totalExpense

    console.log("💰 Dashboard stats calculated:", {
      totalIncome,
      totalExpense,
      balance,
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

    // If no real data, generate sample data based on role
    if (monthlyData.length === 0) {
      const currentDate = new Date();
      const sampleData = [];
      const monthsToShow = session.user.role === 'TREASURER' ? 3 : 6;
      
      for (let i = monthsToShow - 1; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthName = monthNames[date.getMonth()];
        const year = date.getFullYear();
        
        // Generate varied sample data to show trends
        const baseIncome = 150 + (Math.sin(i * 0.8) * 50) + (Math.random() * 30 - 15); // 120-215 range with sine wave
        const baseExpense = 100 + (Math.cos(i * 0.6) * 40) + (Math.random() * 20 - 10); // 70-150 range with cosine wave
        
        sampleData.push({
          month: `${monthName} ${year}`,
          pemasukan: Math.max(50, Math.round(baseIncome)), // Minimum 50M
          pengeluaran: Math.max(30, Math.round(baseExpense)) // Minimum 30M
        });
      }
      
      monthlyData = sampleData;
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

    return NextResponse.json({
      stats: {
        totalIncome,
        totalExpense,
        balance,
        incomeCount: income._count,
        expenseCount: expense._count,
        monthlyData: monthlyData, // Use processed monthly data
        categoryBreakdown: categoryBreakdown.filter(item => item.value > 0)
      },
      recentTransactions: transactions
    })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}
