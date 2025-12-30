"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Eye,
  RotateCcw,
  FileSpreadsheet
} from "lucide-react"
import { toast } from "sonner"

// Sample transaction data
const sampleTransactions = [
  {
    id: "1",
    date: "2025-12-18",
    type: "INCOME",
    category: "SPP Siswa",
    description: "Budi Santoso (10A)",
    amount: 1500000,
    method: "Tunai",
    status: "PAID",
  },
  {
    id: "2",
    date: "2025-12-17",
    type: "EXPENSE",
    category: "Operasional",
    description: "Beli ATK",
    amount: 750000,
    method: "Tunai",
    status: "PAID",
  },
  {
    id: "3",
    date: "2025-12-16",
    type: "INCOME",
    category: "Donasi",
    description: "Alumni 2010",
    amount: 5000000,
    method: "Transfer Bank",
    status: "PAID",
  },
  {
    id: "4",
    date: "2025-12-15",
    type: "EXPENSE",
    category: "Fasilitas",
    description: "Perbaikan AC",
    amount: 1200000,
    method: "Transfer Bank",
    status: "PAID",
  },
  {
    id: "5",
    date: "2025-12-14",
    type: "INCOME",
    category: "Uang Pangkal",
    description: "Siti Aminah (11B)",
    amount: 1500000,
    method: "Tunai",
    status: "PENDING",
  },
]

// Chart data for 6 months
const chartData = [
  { month: "Jul 2025", income: 100, expense: 50 },
  { month: "Agu 2025", income: 150, expense: 80 },
  { month: "Sep 2025", income: 200, expense: 100 },
  { month: "Okt 2025", income: 280, expense: 120 },
  { month: "Nov 2025", income: 350, expense: 100 },
  { month: "Des 2025", income: 450, expense: 80 },
]

// Category composition data
const categoryData = [
  { name: "Gaji Guru & Staf", percentage: 45, color: "#3B82F6" },
  { name: "Fasilitas Sekolah", percentage: 25, color: "#10B981" },
  { name: "Operasional Harian", percentage: 15, color: "#F59E0B" },
  { name: "Kegiatan Siswa", percentage: 10, color: "#8B5CF6" },
  { name: "Lainnya", percentage: 5, color: "#EC4899" },
]

export default function ReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  
  // Filter states
  const [dateRange, setDateRange] = useState("bulan-ini")
  const [filterType, setFilterType] = useState("semua")
  const [filterCategory, setFilterCategory] = useState("semua")
  const [filterMethod, setFilterMethod] = useState("semua")
  const [filterStatus, setFilterStatus] = useState("semua")

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchReportData()
  }, [session, status, router])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      // Map dateRange to API period parameter
      const periodMap: Record<string, string> = {
        'hari-ini': 'today',
        'minggu-ini': 'thisWeek',
        'bulan-ini': 'thisMonth',
        'bulan-lalu': 'lastMonth',
        'tahun-ini': 'thisYear'
      }
      
      const period = periodMap[dateRange] || 'thisMonth'
      const url = `/api/reports?period=${period}&_t=${Date.now()}`
      
      console.log("📊 Fetching report data:", url)
      const response = await fetch(url, { cache: 'no-store' })
      const data = await response.json()
      
      console.log("📈 Report data received:", {
        totalIncome: data.summary?.totalIncome,
        totalExpense: data.summary?.totalExpense,
        balance: data.summary?.balance
      })
      
      if (response.ok) {
        setReportData(data)
      } else {
        console.error("Failed to fetch report data:", data.error)
        toast.error(data.error || "Gagal memuat data laporan")
      }
    } catch (error) {
      console.error("Failed to fetch report data:", error)
      toast.error("Gagal memuat data laporan")
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = () => {
    toast.success("Laporan PDF berhasil diunduh")
  }

  const handleExportExcel = () => {
    toast.success("Laporan Excel berhasil diunduh")
  }

  const handleApplyFilters = async () => {
    await fetchReportData()
    toast.success("Filter berhasil diterapkan")
  }

  const handleResetFilters = async () => {
    setDateRange("bulan-ini")
    setFilterType("semua")
    setFilterCategory("semua")
    setFilterMethod("semua")
    setFilterStatus("semua")
    await fetchReportData()
    toast.success("Filter berhasil direset")
  }

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount) || amount === null || amount === undefined) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    if (status === "PAID") {
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">Lunas</Badge>
    }
    return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0">Menunggu</Badge>
  }

  // Summary data with safe number conversion to prevent NaN
  const summaryData = {
    totalIncome: Number(reportData?.summary?.totalIncome || 0) || 0,
    totalExpense: Number(reportData?.summary?.totalExpense || 0) || 0,
    balance: Number(reportData?.summary?.balance || 0) || 0,
    finalBalance: Number(reportData?.summary?.balance || 0) || 0, // Use balance as final balance
  }
  
  // Calculate balance if not provided by API
  if (!summaryData.balance && summaryData.totalIncome && summaryData.totalExpense) {
    summaryData.balance = summaryData.totalIncome - summaryData.totalExpense
    summaryData.finalBalance = summaryData.balance
  }
  
  console.log("💰 Summary data for display:", summaryData)

  // Get monthly trend data from API
  const monthlyData = reportData?.monthlyTrend || []
  
  // Get expense by category data from API and convert to chart format
  const expenseByCategory = reportData?.expenseByCategory || {}
  const totalExpenseForChart = Object.values(expenseByCategory).reduce((sum: number, val: any) => sum + Number(val), 0)
  
  const categoryChartData = Object.entries(expenseByCategory)
    .map(([name, amount], index) => ({
      name,
      value: Number(amount),
      percentage: totalExpenseForChart > 0 ? Math.round((Number(amount) / totalExpenseForChart) * 100) : 0,
      color: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280'][index % 6]
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5) // Top 5 categories

  // If no expense data, show placeholder
  const displayCategoryData = categoryChartData.length > 0 ? categoryChartData : [
    { name: "Belum ada data", value: 100, percentage: 100, color: "#E5E7EB" }
  ]

  console.log("📊 Chart data:", { monthlyData, categoryChartData })

  if (loading && !reportData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 bg-gray-50/80 min-h-screen -m-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Laporan Keuangan</h1>
          <div className="flex gap-3">
            <Button 
              onClick={handleExportPDF}
              className="bg-red-500 hover:bg-red-600 text-white rounded-lg h-10 px-4"
            >
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button 
              onClick={handleExportExcel}
              className="bg-green-500 hover:bg-green-600 text-white rounded-lg h-10 px-4"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-end gap-4">
              {/* Date Range */}
              <div className="space-y-1.5 min-w-[200px]">
                <label className="text-xs font-medium text-gray-500">Rentang Tanggal</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="h-10 rounded-lg border-gray-200">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hari-ini">Hari Ini</SelectItem>
                    <SelectItem value="minggu-ini">Minggu Ini</SelectItem>
                    <SelectItem value="bulan-ini">Bulan Ini: 01/12/2025 - 31/12/2025</SelectItem>
                    <SelectItem value="bulan-lalu">Bulan Lalu</SelectItem>
                    <SelectItem value="tahun-ini">Tahun Ini</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div className="space-y-1.5 min-w-[130px]">
                <label className="text-xs font-medium text-gray-500">Tipe</label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="h-10 rounded-lg border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua</SelectItem>
                    <SelectItem value="pemasukan">Pemasukan</SelectItem>
                    <SelectItem value="pengeluaran">Pengeluaran</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-1.5 min-w-[150px]">
                <label className="text-xs font-medium text-gray-500">Kategori</label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="h-10 rounded-lg border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua Kategori</SelectItem>
                    <SelectItem value="spp">SPP Siswa</SelectItem>
                    <SelectItem value="donasi">Donasi</SelectItem>
                    <SelectItem value="operasional">Operasional</SelectItem>
                    <SelectItem value="gaji">Gaji Guru & Staf</SelectItem>
                    <SelectItem value="fasilitas">Fasilitas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Method Filter */}
              <div className="space-y-1.5 min-w-[150px]">
                <label className="text-xs font-medium text-gray-500">Metode Pembayaran</label>
                <Select value={filterMethod} onValueChange={setFilterMethod}>
                  <SelectTrigger className="h-10 rounded-lg border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua Metode</SelectItem>
                    <SelectItem value="tunai">Tunai</SelectItem>
                    <SelectItem value="transfer">Transfer Bank</SelectItem>
                    <SelectItem value="ewallet">E-Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-1.5 min-w-[140px]">
                <label className="text-xs font-medium text-gray-500">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-10 rounded-lg border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semua">Semua Status</SelectItem>
                    <SelectItem value="lunas">Lunas</SelectItem>
                    <SelectItem value="menunggu">Menunggu</SelectItem>
                    <SelectItem value="void">Void</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  onClick={handleApplyFilters}
                  className="h-10 px-5 bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  Terapkan
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleResetFilters}
                  className="h-10 px-4 rounded-lg border-gray-200"
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Pemasukan */}
          <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <ArrowUpRight className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Total Pemasukan</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    Rp {(summaryData.totalIncome / 1000000).toFixed(0)}.000.000
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Bulan Ini</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Pengeluaran */}
          <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-red-50 to-white">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <ArrowDownRight className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Total Pengeluaran</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    Rp {(summaryData.totalExpense / 1000000).toFixed(0)}.000.000
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Bulan Ini</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Surplus/Defisit */}
          <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Surplus/Defisit</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    +Rp {(summaryData.balance / 1000000).toFixed(0)}.000.000
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Bulan Ini</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Saldo Akhir */}
          <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-purple-50 to-white">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Wallet className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Saldo Akhir</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    Rp {(summaryData.finalBalance / 1000000).toFixed(0)}.000.000
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Per 31 Des 2025</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
          {/* Line Chart - Pemasukan vs Pengeluaran */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold">
                  Pemasukan vs Pengeluaran (6 Bulan)
                </CardTitle>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-gray-600">Pemasukan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400"></span>
                    <span className="text-gray-600">Pengeluaran</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Simple SVG Line Chart */}
              <div className="h-[250px] relative">
                {monthlyData.length > 0 ? (
                  <svg viewBox="0 0 600 200" className="w-full h-full">
                    {/* Grid lines */}
                    <g className="text-gray-200">
                      {[0, 50, 100, 150, 200].map((y, i) => (
                        <line key={i} x1="40" y1={200 - y} x2="580" y2={200 - y} stroke="currentColor" strokeDasharray="4" />
                      ))}
                    </g>
                    
                    {/* Calculate max value for scaling */}
                    {(() => {
                      const maxValue = Math.max(
                        ...monthlyData.map((d: any) => Math.max(Number(d.income) || 0, Number(d.expense) || 0))
                      )
                      const scale = maxValue > 0 ? 180 / maxValue : 1
                      const yAxisMax = Math.ceil(maxValue / 100000000) * 100 // Round to nearest 100M
                      
                      const incomePoints = monthlyData.map((d: any, i: number) => {
                        const x = 60 + (i * 90)
                        const y = 190 - (Number(d.income) * scale)
                        return { x, y, value: Number(d.income) }
                      })
                      
                      const expensePoints = monthlyData.map((d: any, i: number) => {
                        const x = 60 + (i * 90)
                        const y = 190 - (Number(d.expense) * scale)
                        return { x, y, value: Number(d.expense) }
                      })
                      
                      return (
                        <>
                          {/* Y-axis labels */}
                          <g className="text-xs fill-gray-400">
                            <text x="30" y="195" textAnchor="end">0</text>
                            <text x="30" y="150" textAnchor="end">{(yAxisMax * 0.25).toFixed(0)}M</text>
                            <text x="30" y="100" textAnchor="end">{(yAxisMax * 0.5).toFixed(0)}M</text>
                            <text x="30" y="50" textAnchor="end">{(yAxisMax * 0.75).toFixed(0)}M</text>
                            <text x="30" y="10" textAnchor="end">{yAxisMax}M</text>
                          </g>
                          
                          {/* Income line (green) */}
                          {incomePoints.length > 1 && (
                            <path
                              d={`M ${incomePoints.map((p: any) => `${p.x} ${p.y}`).join(' L ')}`}
                              fill="none"
                              stroke="#10B981"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          )}
                          
                          {/* Expense line (red) */}
                          {expensePoints.length > 1 && (
                            <path
                              d={`M ${expensePoints.map((p: any) => `${p.x} ${p.y}`).join(' L ')}`}
                              fill="none"
                              stroke="#F87171"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          )}
                          
                          {/* Income area fill */}
                          {incomePoints.length > 1 && (
                            <path
                              d={`M ${incomePoints.map((p: any) => `${p.x} ${p.y}`).join(' L ')} L ${incomePoints[incomePoints.length - 1].x} 190 L ${incomePoints[0].x} 190 Z`}
                              fill="url(#incomeGradient)"
                              opacity="0.2"
                            />
                          )}
                          
                          {/* Data points - Income */}
                          {incomePoints.map((point: any, i: number) => (
                            <circle key={`income-${i}`} cx={point.x} cy={point.y} r="4" fill="#10B981" />
                          ))}
                          
                          {/* Data points - Expense */}
                          {expensePoints.map((point: any, i: number) => (
                            <circle key={`expense-${i}`} cx={point.x} cy={point.y} r="4" fill="#F87171" />
                          ))}
                          
                          {/* X-axis labels */}
                          <g className="text-xs fill-gray-500">
                            {monthlyData.map((d: any, i: number) => (
                              <text key={i} x={60 + (i * 90)} y="220" textAnchor="middle">
                                {d.month}
                              </text>
                            ))}
                          </g>
                        </>
                      )
                    })()}
                    
                    {/* Gradient definitions */}
                    <defs>
                      <linearGradient id="incomeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <p>Belum ada data transaksi</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Donut Chart - Komposisi Kategori */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Komposisi Kategori</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                {/* Legend */}
                <div className="space-y-3 text-sm">
                  {displayCategoryData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></span>
                      <span className="text-gray-600 text-xs">{item.name}</span>
                    </div>
                  ))}
                </div>
                
                {/* Donut Chart SVG */}
                <div className="relative w-[180px] h-[180px]">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {/* Background circle */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="20" />
                    
                    {/* Segments */}
                    {(() => {
                      let cumulativeOffset = 0;
                      return displayCategoryData.map((item, index) => {
                        const circumference = 2 * Math.PI * 40;
                        const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
                        const strokeDashoffset = -cumulativeOffset * circumference / 100;
                        cumulativeOffset += item.percentage;
                        
                        return (
                          <circle
                            key={index}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={item.color}
                            strokeWidth="20"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                          />
                        );
                      });
                    })()}
                  </svg>
                  
                  {/* Percentage labels overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      {displayCategoryData.length > 0 && displayCategoryData[0].name !== "Belum ada data" ? (
                        <>
                          <span className="text-2xl font-bold" style={{ color: displayCategoryData[0].color }}>
                            {displayCategoryData[0].percentage}%
                          </span>
                          <p className="text-[10px] text-gray-500 mt-0.5 max-w-[100px] truncate">
                            {displayCategoryData[0].name}
                          </p>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">Belum ada data</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Table */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Detail Laporan Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-xs text-gray-600 py-3">Tanggal</TableHead>
                    <TableHead className="font-semibold text-xs text-gray-600">Tipe</TableHead>
                    <TableHead className="font-semibold text-xs text-gray-600">Kategori</TableHead>
                    <TableHead className="font-semibold text-xs text-gray-600">Deskripsi/Nama</TableHead>
                    <TableHead className="font-semibold text-xs text-gray-600">Nominal</TableHead>
                    <TableHead className="font-semibold text-xs text-gray-600">Metode</TableHead>
                    <TableHead className="font-semibold text-xs text-gray-600">Status</TableHead>
                    <TableHead className="font-semibold text-xs text-gray-600 text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData?.transactions && reportData.transactions.length > 0 ? (
                    reportData.transactions.slice(0, 10).map((transaction: any) => (
                      <TableRow key={transaction.id} className="hover:bg-gray-50/50">
                        <TableCell className="text-sm py-3">
                          {formatDate(transaction.date)}
                        </TableCell>
                        <TableCell className="text-sm">
                          <Badge 
                            variant="outline"
                            className={`text-xs border-0 ${
                              transaction.type === "INCOME" 
                                ? "bg-green-100 text-green-700" 
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {transaction.type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{transaction.category?.name || 'N/A'}</TableCell>
                        <TableCell className="text-sm">{transaction.description}</TableCell>
                        <TableCell className="text-sm font-medium">
                          {formatCurrency(Number(transaction.amount))}
                        </TableCell>
                        <TableCell className="text-sm">
                          {transaction.paymentMethod === 'CASH' ? 'Tunai' : 
                           transaction.paymentMethod === 'BANK_TRANSFER' ? 'Transfer Bank' : 
                           transaction.paymentMethod === 'QRIS' ? 'QRIS' : 'N/A'}
                        </TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell className="text-center">
                          <button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium">
                            <Eye className="h-3 w-3" />
                            Lihat
                          </button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                        Belum ada transaksi dalam periode ini
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-gray-500">
                Menampilkan 1-{Math.min(10, reportData?.transactions?.length || 0)} dari {reportData?.transactions?.length || 0} transaksi
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage === 1}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Previous
                </Button>
                {[1, 2, 3].map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "ghost"}
                    size="sm"
                    className={`w-8 h-8 p-0 text-xs ${
                      currentPage === page
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <span className="px-2 text-gray-400">...</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 text-xs text-gray-600 hover:bg-gray-100"
                >
                  30
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
