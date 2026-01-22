import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, Scale, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Format currency server-side
function formatCurrency(amount: number) {
  if (!amount || isNaN(amount)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('Rp\u00A0', 'Rp ');
}

interface Stats {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  surplusDeficit: number;
  incomeCount: number;
  expenseCount: number;
}

async function getStats(): Promise<Stats | null> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return null;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, schoolProfileId: true }
    });

    if (!user) return null;

    const schoolProfileId = user.role === 'SUPER_ADMIN' ? undefined : user.schoolProfileId || undefined;

    // Get current month boundaries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Single optimized query with aggregation
    const [income, expense] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          type: 'INCOME',
          date: { gte: startOfMonth, lte: endOfMonth },
          ...(schoolProfileId ? { schoolProfileId } : {})
        },
        _sum: { amount: true },
        _count: true
      }),
      prisma.transaction.aggregate({
        where: {
          type: 'EXPENSE',
          date: { gte: startOfMonth, lte: endOfMonth },
          ...(schoolProfileId ? { schoolProfileId } : {})
        },
        _sum: { amount: true },
        _count: true
      })
    ]);

    const totalIncome = Number(income._sum.amount) || 0;
    const totalExpense = Number(expense._sum.amount) || 0;
    const surplusDeficit = totalIncome - totalExpense;

    return {
      balance: surplusDeficit,
      totalIncome,
      totalExpense,
      surplusDeficit,
      incomeCount: income._count,
      expenseCount: expense._count
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return null;
  }
}

// Server-rendered stats cards for instant LCP
export async function StatsCardsServer() {
  const stats = await getStats();

  // Default stats if fetch fails
  const displayStats = stats || {
    balance: 0,
    totalIncome: 0,
    totalExpense: 0,
    surplusDeficit: 0,
    incomeCount: 0,
    expenseCount: 0
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {/* Saldo Saat Ini */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 md:p-2.5 bg-green-100 rounded-lg">
              <Wallet className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs md:text-sm text-gray-600 font-medium">Saldo Saat Ini</p>
            <div className="text-lg md:text-xl font-bold leading-tight text-gray-900">
              {formatCurrency(displayStats.balance)}
            </div>
            <p className={`text-[10px] md:text-xs leading-tight ${displayStats.surplusDeficit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {displayStats.surplusDeficit >= 0 
                ? `+${formatCurrency(displayStats.surplusDeficit)}` 
                : formatCurrency(displayStats.surplusDeficit)} (Bulan ini)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pemasukan Bulan Ini */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 md:p-2.5 bg-blue-100 rounded-lg">
              <ArrowUpIcon className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs md:text-sm text-gray-600 font-medium">Pemasukan Bulan Ini</p>
            <div className="text-lg md:text-xl font-bold leading-tight text-gray-900">
              {formatCurrency(displayStats.totalIncome)}
            </div>
            <p className="text-[10px] md:text-xs text-gray-500 leading-tight">
              Berdasarkan {displayStats.incomeCount} transaksi
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pengeluaran Bulan Ini */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 md:p-2.5 bg-red-100 rounded-lg">
              <ArrowDownIcon className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs md:text-sm text-gray-600 font-medium">Pengeluaran Bulan Ini</p>
            <div className="text-lg md:text-xl font-bold leading-tight text-gray-900">
              {formatCurrency(displayStats.totalExpense)}
            </div>
            <p className="text-[10px] md:text-xs text-gray-500 leading-tight">
              Berdasarkan {displayStats.expenseCount} transaksi
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Surplus/Defisit */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 md:p-2.5 bg-purple-100 rounded-lg">
              <Scale className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="text-xs md:text-sm text-gray-600 font-medium">Surplus/Defisit</p>
            <div className={`text-lg md:text-xl font-bold leading-tight ${displayStats.surplusDeficit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(displayStats.surplusDeficit >= 0 ? '+' : '') + formatCurrency(Math.abs(displayStats.surplusDeficit))}
            </div>
            <p className="text-[10px] md:text-xs text-gray-500 leading-tight">
              {displayStats.surplusDeficit >= 0 ? 'Surplus' : 'Defisit'} (Bulan ini)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Fallback skeleton for Suspense - with proper color classes
export function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {[
        { icon: Wallet, bgColor: 'bg-green-100', iconColor: 'text-green-600', title: 'Saldo Saat Ini' },
        { icon: ArrowUpIcon, bgColor: 'bg-blue-100', iconColor: 'text-blue-600', title: 'Pemasukan Bulan Ini' },
        { icon: ArrowDownIcon, bgColor: 'bg-red-100', iconColor: 'text-red-600', title: 'Pengeluaran Bulan Ini' },
        { icon: Scale, bgColor: 'bg-purple-100', iconColor: 'text-purple-600', title: 'Surplus/Defisit' },
      ].map((item, i) => (
        <Card key={i} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 md:p-2.5 ${item.bgColor} rounded-lg`}>
                <item.icon className={`h-5 w-5 md:h-6 md:w-6 ${item.iconColor}`} />
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs md:text-sm text-gray-600 font-medium">{item.title}</p>
              <div className="h-7 bg-gray-200 rounded w-28 animate-pulse" />
              <div className="h-4 bg-gray-100 rounded w-24 animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
