"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  Scale,
  Wallet,
  Plus,
  TrendingUp,
  Loader2,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DashboardSkeleton, StatsGridSkeleton } from "./dashboard-skeleton";
import { AreaChartComponent, PieChartComponent, ChartSkeleton, PieChartSkeleton } from "./lazy-charts";

// Chart of Accounts - Kategori Pemasukan
const incomeCategories = [
  {
    id: "1100",
    name: "1100 - Aktiva Lancar",
    types: [
      { id: "1110", name: "1110 - Kas di Bendahara" },
      { id: "1120", name: "1120 - Bank (Rekening Sekolah)" },
      { id: "1130", name: "1130 - Piutang SPP" },
    ],
  },
  {
    id: "1200",
    name: "1200 - Aktiva Tetap",
    types: [
      { id: "1210", name: "1210 - Tanah" },
      { id: "1220", name: "1220 - Bangunan Gedung Sekolah" },
      { id: "1230", name: "1230 - Peralatan Sekolah" },
    ],
  },
  {
    id: "3100",
    name: "3100 - Modal",
    types: [
      { id: "3100", name: "3100 - Modal Awal" },
      { id: "3200", name: "3200 - Laba Ditahan" },
    ],
  },
  {
    id: "4100",
    name: "4100 - Pendapatan",
    types: [
      { id: "4100", name: "4100 - Pendapatan SPP Siswa" },
      { id: "4200", name: "4200 - Dana BOS" },
      { id: "4300", name: "4300 - Pendapatan Lain-lain" },
    ],
  },
];

// Chart of Accounts - Kategori Pengeluaran
const expenseCategories = [
  {
    id: "2100",
    name: "2100 - Kewajiban",
    types: [
      { id: "2110", name: "2110 - Utang Gaji Guru" },
      { id: "2120", name: "2120 - Utang Pemasok" },
      { id: "2210", name: "2210 - Utang Bank" },
    ],
  },
  {
    id: "5100",
    name: "5100 - Beban",
    types: [
      { id: "5100", name: "5100 - Beban Gaji Guru" },
      { id: "5200", name: "5200 - Beban Operasional" },
      { id: "5300", name: "5300 - Beban Perlengkapan" },
      { id: "5400", name: "5400 - Beban Pemeliharaan" },
      { id: "5500", name: "5500 - Beban Penyusutan" },
    ],
  },
];

export function DashboardContent() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState("Bulan Ini");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true); // Show skeleton initially
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  
  const [formData, setFormData] = useState({
    categoryId: "",
    typeId: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    status: "PAID",
    schoolId: ""
  });

  // Get current COA categories based on transaction type
  const coaCategories = useMemo(() => 
    transactionType === "INCOME" ? incomeCategories : expenseCategories,
    [transactionType]
  );
  const selectedCategory = useMemo(() => 
    coaCategories.find(cat => cat.id === formData.categoryId),
    [coaCategories, formData.categoryId]
  );
  const availableTypes = selectedCategory?.types || [];

  // Role-based chart title - memoized
  const chartTitle = useMemo(() => {
    return userRole === "TREASURER" 
      ? "Pemasukan vs Pengeluaran (3 Bulan)" 
      : "Pemasukan vs Pengeluaran (6 Bulan)";
  }, [userRole]);

  // Memoized fetch functions
  const fetchSchools = useCallback(async () => {
    try {
      const response = await fetch("/api/schools");
      if (response.ok) {
        const data = await response.json();
        setSchools(data.schools || []);
      }
    } catch (error) {
      console.error("Failed to fetch schools:", error);
    }
  }, []);

  const fetchDashboardData = useCallback(async (showToast = false, isInitial = false) => {
    try {
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      
      // Fetch stats first (most important for UI)
      const statsRes = await fetch(`/api/dashboard/stats?_t=${timestamp}`, { 
        cache: 'no-store',
        next: { revalidate: 0 }
      });

      // Process stats immediately
      if (statsRes.ok) {
        const data = await statsRes.json();
        
        // Check if there's an error message (e.g., no school assigned)
        if (data.error) {
          toast.error(data.error, {
            description: "Silakan hubungi Super Admin untuk mengassign sekolah ke akun Anda."
          });
          setStats({
            totalIncome: 0,
            totalExpense: 0,
            balance: 0,
            incomeCount: 0,
            expenseCount: 0
          });
          setChartData([]);
          setPieData([]);
          if (isInitial) setDashboardLoading(false);
          return;
        }
        
        setStats(data.stats);
        
        // Set chart data based on real stats
        if (data.stats?.monthlyData) {
          setChartData(data.stats.monthlyData);
        } else {
          const currentMonth = new Date().toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
          setChartData([
            { 
              month: currentMonth, 
              pemasukan: Math.round((data.stats?.totalIncome || 0) / 1000000), 
              pengeluaran: Math.round((data.stats?.totalExpense || 0) / 1000000) 
            }
          ]);
        }

        // Set pie data based on category breakdown
        if (data.stats?.categoryBreakdown) {
          setPieData(data.stats.categoryBreakdown);
        }
      }
      
      // Mark loading complete after stats (most important data)
      if (isInitial) setDashboardLoading(false);

      // Fetch secondary data in background (non-blocking)
      Promise.all([
        fetch(`/api/categories?_t=${timestamp}`, { cache: 'no-store' }),
        fetch(`/api/transactions?limit=5&_t=${timestamp}`, { cache: 'no-store' }),
      ]).then(async ([categoriesRes, transactionsRes]) => {
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.categories || []);
        }
        if (transactionsRes.ok) {
          const data = await transactionsRes.json();
          setTransactions(data.transactions || []);
        }
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      if (showToast) toast.error("Gagal memuat data dashboard");
      if (isInitial) setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    // Immediate fetch for faster initial load (no timeout delay)
    fetchDashboardData(true, true);
    fetchSchools();
    
    // Get user role from session (cached by NextAuth)
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(session => {
        if (session?.user?.role) {
          setUserRole(session.user.role);
        }
      })
      .catch(err => console.error('Failed to get session:', err));
    
    // Auto refresh data every 60 seconds (reduced from 30s)
    const interval = setInterval(() => {
      fetchDashboardData(false, false);
    }, 60000);
    
    return () => {
      clearInterval(interval);
    };
  }, [fetchDashboardData, fetchSchools]);

  const handleOpenDialog = (type: "INCOME" | "EXPENSE") => {
    setTransactionType(type);
    setFormData({
      categoryId: "",
      typeId: "",
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      status: "PAID",
      schoolId: selectedSchoolId || ""
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({
      categoryId: "",
      typeId: "",
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      status: "PAID",
      schoolId: ""
    });
  };

  const handleSubmit = async () => {
    if (schools.length > 0 && !formData.schoolId) {
      toast.error("Pilih sekolah terlebih dahulu");
      return;
    }

    if (!formData.categoryId || !formData.typeId || !formData.amount || !formData.description) {
      toast.error("Mohon lengkapi semua field");
      return;
    }

    setLoading(true);
    try {
      // Get category and type names for database
      const selectedCat = coaCategories.find(c => c.id === formData.categoryId);
      const selectedType = selectedCat?.types.find(t => t.id === formData.typeId);
      
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: transactionType,
          amount: parseFloat(formData.amount),
          description: `${selectedType?.name || formData.categoryId} - ${formData.description}`,
          date: formData.date,
          status: formData.status,
          schoolId: formData.schoolId || undefined,
          categoryId: formData.categoryId,
          categoryName: selectedCat?.name,
          typeId: formData.typeId,
          typeName: selectedType?.name
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`${transactionType === "INCOME" ? "Pemasukan" : "Pengeluaran"} berhasil ditambahkan`);
        handleCloseDialog();
        await fetchDashboardData(false, false);
      } else {
        toast.error(data.error || "Gagal menambahkan transaksi");
      }
    } catch (error) {
      toast.error("Gagal menambahkan transaksi");
    } finally {
      setLoading(false);
    }
  };

  const handleViewTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsViewDialogOpen(true);
  };

  const handleEditTransaction = (transaction: any) => {
    router.push(`/dashboard/transactions?edit=${transaction.id}`);
  };

  const handleDeleteTransaction = async (id: string, description: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus transaksi "${description}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        toast.success("Transaksi berhasil dihapus");
        fetchDashboardData(false, false);
      } else {
        const data = await response.json();
        toast.error(data.error || "Gagal menghapus transaksi");
      }
    } catch (error) {
      toast.error("Gagal menghapus transaksi");
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (!numAmount || isNaN(numAmount)) return "Rp 0";
    
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  // Default stats untuk optimistic UI - render segera tanpa menunggu API
  const displayStats = stats || {
    balance: 0,
    totalIncome: 0,
    totalExpense: 0,
    incomeCount: 0,
    expenseCount: 0
  };

  return (
    <div className="space-y-4">
      {/* Header dengan indikator refresh - fixed height */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-h-[52px]">
        <div className="min-h-[44px]">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1 min-h-[20px]">
            {lastUpdated ? `Terakhir diperbarui: ${lastUpdated.toLocaleString('id-ID')}` : 'Memuat data...'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {dashboardLoading && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Memuat...</span>
            </div>
          )}
          <Button 
            onClick={() => fetchDashboardData(false, false)} 
            variant="outline" 
            size="sm"
            disabled={dashboardLoading}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards - Render immediately with displayStats for fast LCP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saldo Saat Ini */}
        <Card className="hover:shadow-lg transition-shadow min-h-[140px]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 bg-green-100 rounded-lg">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Saldo Saat Ini</p>
              <div className={`text-2xl font-bold min-h-[32px] ${dashboardLoading && !stats ? 'text-gray-300' : 'text-gray-900'}`}>
                {formatNumber(displayStats.balance)}
              </div>
              <p className={`text-xs min-h-[16px] ${displayStats.totalIncome - displayStats.totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {displayStats.totalIncome - displayStats.totalExpense >= 0 
                  ? `+${formatCurrency(displayStats.totalIncome - displayStats.totalExpense)}` 
                  : formatCurrency(displayStats.totalIncome - displayStats.totalExpense)} (Bulan ini)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pemasukan Bulan Ini */}
        <Card className="hover:shadow-lg transition-shadow min-h-[140px]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 bg-blue-100 rounded-lg">
                <ArrowUpIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Pemasukan Bulan Ini</p>
              <div className={`text-2xl font-bold min-h-[32px] ${dashboardLoading && !stats ? 'text-gray-300' : 'text-gray-900'}`}>
                {formatNumber(displayStats.totalIncome)}
              </div>
              <p className="text-xs text-gray-500 min-h-[16px]">
                Berdasarkan {displayStats.incomeCount} transaksi
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pengeluaran Bulan Ini */}
        <Card className="hover:shadow-lg transition-shadow min-h-[140px]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 bg-red-100 rounded-lg">
                <ArrowDownIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Pengeluaran Bulan Ini</p>
              <div className={`text-2xl font-bold min-h-[32px] ${dashboardLoading && !stats ? 'text-gray-300' : 'text-gray-900'}`}>
                {formatNumber(displayStats.totalExpense)}
              </div>
              <p className="text-xs text-gray-500 min-h-[16px]">
                Berdasarkan {displayStats.expenseCount} transaksi
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Surplus/Defisit */}
        <Card className="hover:shadow-lg transition-shadow min-h-[140px]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 bg-purple-100 rounded-lg">
                <Scale className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Surplus/Defisit</p>
              <div className={`text-2xl font-bold min-h-[32px] ${dashboardLoading && !stats ? 'text-gray-300' : 'text-gray-900'}`}>
                {(displayStats.balance >= 0 ? '+' : '') + formatNumber(Math.abs(displayStats.balance))}
              </div>
              <p className="text-xs text-gray-500 min-h-[16px]">
                {displayStats.balance >= 0 ? 'Surplus' : 'Defisit'} (Bulan ini)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section - Fixed min-height to prevent CLS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart - 2 columns */}
        <Card className="lg:col-span-2 min-h-[380px]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 min-h-[48px]">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              {chartTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6 min-h-[300px]">
            <AreaChartComponent data={chartData} />
          </CardContent>
        </Card>

        {/* Pie Chart - 1 column */}
        <Card className="min-h-[380px]">
          <CardHeader className="pb-2 min-h-[48px]">
            <CardTitle className="text-base font-semibold">Kategori Terbesar</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[300px]">
            <PieChartComponent data={pieData} />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center">
              <Plus className="h-5 w-5 mr-2 text-green-600" />
              Tambah Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => router.push('/dashboard/transactions?tab=INCOME')}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              <ArrowUpIcon className="h-4 w-4 mr-2" />
              Tambah Pemasukan
            </Button>
            <Button
              onClick={() => router.push('/dashboard/transactions?tab=EXPENSE')}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
              disabled={loading}
            >
              <ArrowDownIcon className="h-4 w-4 mr-2" />
              Tambah Pengeluaran
            </Button>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              Transaksi Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">Belum ada transaksi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.slice(0, 3).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-1.5 rounded-full ${
                        transaction.type === 'INCOME' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {transaction.type === 'INCOME' ? (
                          <ArrowUpIcon className="h-3 w-3 text-green-600" />
                        ) : (
                          <ArrowDownIcon className="h-3 w-3 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.date).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${
                        transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-blue-600 hover:text-blue-700"
                  onClick={() => router.push('/dashboard/transactions')}
                >
                  Lihat Semua Transaksi
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog for Add Transaction */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Tambah {transactionType === "INCOME" ? "Pemasukan" : "Pengeluaran"}
            </DialogTitle>
            <DialogDescription>
              Isi form di bawah untuk menambahkan transaksi baru
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {schools.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="school">Sekolah</Label>
                <Select
                  value={formData.schoolId}
                  onValueChange={async (value) => {
                    setFormData({ ...formData, schoolId: value, categoryId: "" });
                    setSelectedSchoolId(value);
                    try {
                      const response = await fetch(`/api/categories?schoolId=${value}`);
                      if (response.ok) {
                        const data = await response.json();
                        setCategories(data.categories || []);
                      }
                    } catch (error) {
                      console.error("Failed to fetch categories:", error);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih sekolah" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school: any) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="category">Kategori</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value, typeId: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {coaCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Sub Kategori (Jenis)</Label>
              <Select
                value={formData.typeId}
                onValueChange={(value) => setFormData({ ...formData, typeId: value })}
                disabled={!formData.categoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.categoryId ? "Pilih sub kategori" : "Pilih kategori dulu"} />
                </SelectTrigger>
                <SelectContent>
                  {availableTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Nominal (Rp)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Masukkan nominal"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Masukkan deskripsi transaksi"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAID">Lunas</SelectItem>
                  <SelectItem value="PENDING">Tertunda</SelectItem>
                  <SelectItem value="VOID">Void</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={loading}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for View Transaction */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="font-semibold">Tanggal:</Label>
                <div className="col-span-2">
                  {(() => {
                    if (!selectedTransaction.date) return "-";
                    try {
                      const date = new Date(selectedTransaction.date);
                      if (isNaN(date.getTime())) return selectedTransaction.date;
                      return date.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      });
                    } catch (e) {
                      return selectedTransaction.date;
                    }
                  })()}
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="font-semibold">Tipe:</Label>
                <div className="col-span-2">
                  <Badge 
                    variant="outline"
                    className={
                      (selectedTransaction.type === "INCOME" || selectedTransaction.type === "PEMASUKAN")
                        ? "bg-green-50 text-green-700 border-green-200" 
                        : "bg-red-50 text-red-700 border-red-200"
                    }
                  >
                    {(selectedTransaction.type === "INCOME" || selectedTransaction.type === "PEMASUKAN") ? "Pemasukan" : "Pengeluaran"}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="font-semibold">Kategori:</Label>
                <div className="col-span-2">{selectedTransaction.category?.name || selectedTransaction.category}</div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="font-semibold">Nominal:</Label>
                <div className="col-span-2 text-lg font-bold">
                  {formatCurrency(Number(selectedTransaction.amount))}
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="font-semibold">Status:</Label>
                <div className="col-span-2">
                  <Badge 
                    variant="outline"
                    className={
                      (selectedTransaction.status === "PAID" || selectedTransaction.status === "LUNAS")
                        ? "bg-blue-50 text-blue-700 border-blue-200" 
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }
                  >
                    {(selectedTransaction.status === "PAID" || selectedTransaction.status === "LUNAS") ? "Lunas" : "Tertunda"}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 items-start gap-4">
                <Label className="font-semibold">Deskripsi:</Label>
                <div className="col-span-2">{selectedTransaction.description}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
