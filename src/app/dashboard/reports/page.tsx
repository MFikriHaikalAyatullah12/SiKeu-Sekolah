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
      const response = await fetch(`/api/reports?period=thisMonth`)
      const data = await response.json()
      
      if (response.ok) {
        setReportData(data)
      }
    } catch (error) {
      console.error("Failed to fetch report data:", error)
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

  const handleApplyFilters = () => {
    toast.success("Filter berhasil diterapkan")
    fetchReportData()
  }

  const handleResetFilters = () => {
    setDateRange("bulan-ini")
    setFilterType("semua")
    setFilterCategory("semua")
    setFilterMethod("semua")
    setFilterStatus("semua")
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
    finalBalance: Number(reportData?.summary?.finalBalance || 0) || 0,
  }
  
  // Calculate balance in case not provided by API
  if (summaryData.totalIncome && summaryData.totalExpense) {
    summaryData.balance = summaryData.totalIncome - summaryData.totalExpense;
  }

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
                <svg viewBox="0 0 600 200" className="w-full h-full">
                  {/* Grid lines */}
                  <g className="text-gray-200">
                    {[0, 50, 100, 150, 200].map((y, i) => (
                      <line key={i} x1="40" y1={200 - y} x2="580" y2={200 - y} stroke="currentColor" strokeDasharray="4" />
                    ))}
                  </g>
                  
                  {/* Y-axis labels */}
                  <g className="text-xs fill-gray-400">
                    <text x="30" y="200" textAnchor="end">0</text>
                    <text x="30" y="150" textAnchor="end">150</text>
                    <text x="30" y="100" textAnchor="end">300</text>
                    <text x="30" y="50" textAnchor="end">450</text>
                    <text x="30" y="10" textAnchor="end">500</text>
                  </g>
                  
                  {/* Income line (green) */}
                  <path
                    d="M 60 160 L 150 140 L 240 120 L 330 90 L 420 60 L 510 20"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Expense line (red) */}
                  <path
                    d="M 60 180 L 150 170 L 240 160 L 330 155 L 420 160 L 510 170"
                    fill="none"
                    stroke="#F87171"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Income area fill */}
                  <path
                    d="M 60 160 L 150 140 L 240 120 L 330 90 L 420 60 L 510 20 L 510 200 L 60 200 Z"
                    fill="url(#incomeGradient)"
                    opacity="0.2"
                  />
                  
                  {/* Data points - Income */}
                  {[
                    { x: 60, y: 160 },
                    { x: 150, y: 140 },
                    { x: 240, y: 120 },
                    { x: 330, y: 90 },
                    { x: 420, y: 60 },
                    { x: 510, y: 20 },
                  ].map((point, i) => (
                    <circle key={`income-${i}`} cx={point.x} cy={point.y} r="5" fill="#10B981" />
                  ))}
                  
                  {/* Data points - Expense */}
                  {[
                    { x: 60, y: 180 },
                    { x: 150, y: 170 },
                    { x: 240, y: 160 },
                    { x: 330, y: 155 },
                    { x: 420, y: 160 },
                    { x: 510, y: 170 },
                  ].map((point, i) => (
                    <circle key={`expense-${i}`} cx={point.x} cy={point.y} r="5" fill="#F87171" />
                  ))}
                  
                  {/* X-axis labels */}
                  <g className="text-xs fill-gray-500">
                    <text x="60" y="220" textAnchor="middle">Jul 2025</text>
                    <text x="150" y="220" textAnchor="middle">Agu 2025</text>
                    <text x="240" y="220" textAnchor="middle">Sep 2025</text>
                    <text x="330" y="220" textAnchor="middle">Okt 2025</text>
                    <text x="420" y="220" textAnchor="middle">Nov 2025</text>
                    <text x="510" y="220" textAnchor="middle">Des 2025</text>
                  </g>
                  
                  {/* Gradient definitions */}
                  <defs>
                    <linearGradient id="incomeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
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
                  {categoryData.map((item, index) => (
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
                      return categoryData.map((item, index) => {
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
                      <span className="text-2xl font-bold text-blue-600">45%</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">Gaji Guru & Staf</p>
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
                  {sampleTransactions.map((transaction) => (
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
                      <TableCell className="text-sm">{transaction.category}</TableCell>
                      <TableCell className="text-sm">{transaction.description}</TableCell>
                      <TableCell className="text-sm font-medium">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-sm">{transaction.method}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell className="text-center">
                        <button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium">
                          <Eye className="h-3 w-3" />
                          Lihat
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-gray-500">
                Menampilkan 1-5 dari 150 transaksi
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
