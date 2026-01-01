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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

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
  
  // Export dialog states
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [exportType, setExportType] = useState<'excel' | 'pdf'>('excel')
  
  // Initialize with first day of current month and today
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const [exportStartDate, setExportStartDate] = useState(firstDayOfMonth.toISOString().split('T')[0])
  const [exportEndDate, setExportEndDate] = useState(today.toISOString().split('T')[0])

  // Role-based access control
  const userRole = session?.user?.role
  const isTreasurer = userRole === 'TREASURER'
  const isSuperAdmin = userRole === 'SUPER_ADMIN'
  
  // Date range restrictions for Treasurer (3 months max)
  const maxDateRangeMonths = isTreasurer ? 3 : null
  const treasurerMaxStartDate = isTreasurer 
    ? new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()).toISOString().split('T')[0]
    : null

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
    setExportType('pdf')
    setIsExportDialogOpen(true)
  }

  const handleExportExcel = () => {
    setExportType('excel')
    setIsExportDialogOpen(true)
  }
  
  const executeExport = async () => {
    try {
      // Validate date range - maximum 1 month
      const startDate = new Date(exportStartDate)
      const endDate = new Date(exportEndDate)
      
      // Calculate difference in days
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      // Check if more than 31 days (approximately 1 month)
      if (diffDays > 31) {
        toast.error('Rentang tanggal maksimal 1 bulan (31 hari)')
        return
      }
      
      // Check if start date is after end date
      if (startDate > endDate) {
        toast.error('Tanggal mulai tidak boleh lebih besar dari tanggal akhir')
        return
      }
      
      // Fetch data for the selected date range
      const response = await fetch(`/api/reports?startDate=${exportStartDate}&endDate=${exportEndDate}&_t=${Date.now()}`, {
        cache: 'no-store'
      })
      
      if (!response.ok) {
        toast.error('Gagal mengambil data untuk export')
        return
      }
      
      const data = await response.json()
      
      if (exportType === 'excel') {
        exportToExcel(data)
      } else {
        exportToPDF(data)
      }
      
      setIsExportDialogOpen(false)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Gagal melakukan export')
    }
  }
  
  const exportToExcel = (data: any) => {
    try {
      // Prepare summary data
      const summaryData = [
        ['LAPORAN KEUANGAN'],
        [`Periode: ${new Date(exportStartDate).toLocaleDateString('id-ID')} - ${new Date(exportEndDate).toLocaleDateString('id-ID')}`],
        [],
        ['RINGKASAN'],
        ['Total Pemasukan', formatCurrency(data.summary?.totalIncome || 0)],
        ['Total Pengeluaran', formatCurrency(data.summary?.totalExpense || 0)],
        ['Saldo (Surplus/Defisit)', formatCurrency(data.summary?.balance || 0)],
        [],
        ['DETAIL TRANSAKSI'],
        ['Tanggal', 'Tipe', 'Kategori', 'Akun COA', 'Deskripsi', 'Nominal', 'Metode Pembayaran', 'Status']
      ]
      
      // Add transaction details
      const transactionRows = (data.transactions || []).map((t: any) => [
        new Date(t.date).toLocaleDateString('id-ID'),
        t.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran',
        t.category?.name || 'N/A',
        t.coaAccount?.name || t.description || 'N/A',
        t.payerName || t.recipientName || 'N/A',
        Number(t.amount),
        t.paymentMethod === 'CASH' ? 'Tunai' : t.paymentMethod === 'BANK_TRANSFER' ? 'Transfer Bank' : t.paymentMethod === 'QRIS' ? 'QRIS' : 'N/A',
        t.status === 'PAID' ? 'Lunas' : t.status === 'PENDING' ? 'Menunggu' : 'Void'
      ])
      
      const allData = [...summaryData, ...transactionRows]
      
      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(allData)
      
      // Set column widths
      ws['!cols'] = [
        { wch: 15 }, // Tanggal
        { wch: 12 }, // Tipe
        { wch: 20 }, // Kategori
        { wch: 25 }, // Akun COA
        { wch: 30 }, // Deskripsi
        { wch: 18 }, // Nominal
        { wch: 18 }, // Metode
        { wch: 12 }  // Status
      ]
      
      // Create workbook
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Laporan Keuangan')
      
      // Generate filename
      const filename = `Laporan_Keuangan_${exportStartDate}_${exportEndDate}.xlsx`
      
      // Save file
      XLSX.writeFile(wb, filename)
      
      toast.success('Laporan Excel berhasil diunduh')
    } catch (error) {
      console.error('Excel export error:', error)
      toast.error('Gagal membuat file Excel')
    }
  }
  
  const exportToPDF = (data: any) => {
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.width
      const pageHeight = doc.internal.pageSize.height
      let yPos = 15
      
      // ========== HEADER SECTION ==========
      // School logo placeholder (you can add actual logo later)
      doc.setFillColor(37, 99, 235) // Blue color for logo placeholder
      doc.rect(14, yPos, 12, 12, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.text('$', 20, yPos + 8, { align: 'center' } as any)
      
      // School name and info (left side)
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('SEKOLAH MENENGAH ATAS NEGERI 1 (contoh)', 30, yPos + 3)
      
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text('Jl. Pendidikan No. 123, Kota Contoh, Indonesia', 30, yPos + 8)
      doc.text('Telp: (021) 12345678 | Email: info@sman1contoh.sch.id', 30, yPos + 12)
      
      // Document title (right side)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('LAPORAN KEUANGAN', pageWidth - 14, yPos + 3, { align: 'right' } as any)
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 80, 80)
      const periodText = `Periode: ${new Date(exportStartDate).toLocaleDateString('id-ID')} - ${new Date(exportEndDate).toLocaleDateString('id-ID')}`
      doc.text(periodText, pageWidth - 14, yPos + 9, { align: 'right' } as any)
      
      // Metadata row
      yPos += 17
      doc.setFontSize(7)
      doc.setTextColor(120, 120, 120)
      const now = new Date()
      const printDate = `Dicetak pada: ${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`
      const printBy = `Dicetak oleh: ${session?.user?.name || 'Bendahara'}`
      doc.text(printDate, pageWidth - 14, yPos, { align: 'right' } as any)
      doc.text(`| ${printBy}`, pageWidth - 14, yPos + 3, { align: 'right' } as any)
      
      // Divider line
      yPos += 5
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.5)
      doc.line(14, yPos, pageWidth - 14, yPos)
      
      yPos += 8
      
      // ========== SUMMARY CARDS ==========
      const cardWidth = (pageWidth - 28 - 9) / 4 // 4 cards with 3px spacing
      const cardHeight = 18
      const cardY = yPos
      
      // Card 1: Total Pemasukan
      doc.setFillColor(240, 249, 255)
      doc.roundedRect(14, cardY, cardWidth, cardHeight, 2, 2, 'F')
      doc.setDrawColor(191, 219, 254)
      doc.roundedRect(14, cardY, cardWidth, cardHeight, 2, 2, 'S')
      doc.setFontSize(7)
      doc.setTextColor(100, 100, 100)
      doc.text('Total Pemasukan:', 17, cardY + 5)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(37, 99, 235)
      doc.text(formatCurrency(data.summary?.totalIncome || 0).replace('Rp', 'Rp '), 17, cardY + 12)
      
      // Card 2: Total Pengeluaran
      const card2X = 14 + cardWidth + 3
      doc.setFillColor(254, 242, 242)
      doc.roundedRect(card2X, cardY, cardWidth, cardHeight, 2, 2, 'F')
      doc.setDrawColor(254, 202, 202)
      doc.roundedRect(card2X, cardY, cardWidth, cardHeight, 2, 2, 'S')
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text('Total Pengeluaran:', card2X + 3, cardY + 5)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(220, 38, 38)
      doc.text(formatCurrency(data.summary?.totalExpense || 0).replace('Rp', 'Rp '), card2X + 3, cardY + 12)
      
      // Card 3: Saldo
      const card3X = card2X + cardWidth + 3
      const balance = (data.summary?.totalIncome || 0) - (data.summary?.totalExpense || 0)
      const isPositive = balance >= 0
      
      // Set fill color based on balance
      if (isPositive) {
        doc.setFillColor(240, 253, 244)
      } else {
        doc.setFillColor(254, 242, 242)
      }
      doc.roundedRect(card3X, cardY, cardWidth, cardHeight, 2, 2, 'F')
      
      // Set draw color based on balance
      if (isPositive) {
        doc.setDrawColor(187, 247, 208)
      } else {
        doc.setDrawColor(254, 202, 202)
      }
      doc.roundedRect(card3X, cardY, cardWidth, cardHeight, 2, 2, 'S')
      
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text('Saldo (Surplus/Defisit):', card3X + 3, cardY + 5)
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      
      // Set text color based on balance
      if (isPositive) {
        doc.setTextColor(22, 163, 74)
      } else {
        doc.setTextColor(220, 38, 38)
      }
      doc.text(formatCurrency(balance).replace('Rp', 'Rp '), card3X + 3, cardY + 12)
      
      // Card 4: Jumlah Transaksi
      const card4X = card3X + cardWidth + 3
      doc.setFillColor(250, 245, 255)
      doc.roundedRect(card4X, cardY, cardWidth, cardHeight, 2, 2, 'F')
      doc.setDrawColor(233, 213, 255)
      doc.roundedRect(card4X, cardY, cardWidth, cardHeight, 2, 2, 'S')
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text('Jumlah Transaksi:', card4X + 3, cardY + 5)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(126, 34, 206)
      doc.text(String(data.transactions?.length || 0), card4X + 3, cardY + 13)
      
      yPos = cardY + cardHeight + 10
      
      // ========== RINGKASAN PER KATEGORI COA ==========
      if (data.incomeByCOA?.length > 0 || data.expenseByCOA?.length > 0) {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text('Ringkasan per Kategori COA', 14, yPos)
        yPos += 5
        
        // Prepare COA summary data
        const coaCategories: Record<string, { masuk: number, keluar: number }> = {}
        
        // Aggregate income
        data.incomeByCOA?.forEach((item: any) => {
          const categoryName = item.name.split(' - ')[0] // Get category part
          if (!coaCategories[categoryName]) {
            coaCategories[categoryName] = { masuk: 0, keluar: 0 }
          }
          coaCategories[categoryName].masuk += item.amount
        })
        
        // Aggregate expense
        data.expenseByCOA?.forEach((item: any) => {
          const categoryName = item.name.split(' - ')[0]
          if (!coaCategories[categoryName]) {
            coaCategories[categoryName] = { masuk: 0, keluar: 0 }
          }
          coaCategories[categoryName].keluar += item.amount
        })
        
        const coaSummaryData = Object.entries(coaCategories).map(([name, amounts]) => [
          name,
          formatCurrency(amounts.masuk),
          formatCurrency(amounts.keluar),
          formatCurrency(amounts.masuk - amounts.keluar)
        ])
        
        autoTable(doc, {
          startY: yPos,
          head: [['Kategori', 'Masuk', 'Keluar', 'Net']],
          body: coaSummaryData,
          theme: 'plain',
          headStyles: { 
            fillColor: [243, 244, 246],
            textColor: [75, 85, 99],
            fontSize: 8,
            fontStyle: 'bold',
            halign: 'left'
          },
          styles: { 
            fontSize: 8,
            cellPadding: 3,
            lineColor: [229, 231, 235],
            lineWidth: 0.1
          },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 40, halign: 'right' },
            2: { cellWidth: 40, halign: 'right' },
            3: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }
          },
          margin: { left: 14, right: 14 }
        })
        
        yPos = (doc as any).lastAutoTable.finalY + 8
      }
      
      // ========== DETAIL TRANSAKSI TABLE ==========
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('Detail Transaksi', 14, yPos)
      yPos += 5
      
      const transactionData = (data.transactions || []).map((t: any) => {
        const statusColor = t.status === 'PAID' ? '✓ Lunas' : t.status === 'PENDING' ? '◷ Menunggu' : '✗ Void'
        return [
          new Date(t.date).toLocaleDateString('id-ID'),
          t.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran',
          t.coaAccount?.code || 'N/A',
          t.coaAccount?.name || t.description || 'N/A',
          t.payerName || t.recipientName || '-',
          formatCurrency(Number(t.amount)),
          statusColor,
          t.createdBy?.name || session?.user?.name || 'Admin'
        ]
      })
      
      autoTable(doc, {
        startY: yPos,
        head: [['Tanggal', 'Tipe', 'Kode COA', 'Nama Akun', 'Nama/Vendor', 'Nominal', 'Status', 'Petugas']],
        body: transactionData,
        theme: 'striped',
        headStyles: { 
          fillColor: [30, 58, 138], // Navy blue
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold',
          halign: 'center'
        },
        styles: { 
          fontSize: 7,
          cellPadding: 2.5,
          lineColor: [229, 231, 235],
          lineWidth: 0.1
        },
        columnStyles: {
          0: { cellWidth: 22, halign: 'center' },
          1: { cellWidth: 22, halign: 'center' },
          2: { cellWidth: 18, halign: 'center' },
          3: { cellWidth: 35 },
          4: { cellWidth: 30 },
          5: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
          6: { cellWidth: 20, halign: 'center', fontSize: 7 },
          7: { cellWidth: 22, fontSize: 6, textColor: [100, 100, 100] }
        },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { left: 14, right: 14, bottom: 35 }
      })
      
      // ========== FOOTER ==========
      const footerY = pageHeight - 25
      
      // Footer line
      doc.setDrawColor(200, 200, 200)
      doc.setLineWidth(0.3)
      doc.line(14, footerY, pageWidth - 14, footerY)
      
      // Left: Auto-generated text
      doc.setFontSize(7)
      doc.setTextColor(120, 120, 120)
      doc.setFont('helvetica', 'normal')
      doc.text('Dokumen ini dihasilkan otomatis oleh sistem.', 14, footerY + 5)
      
      // Center: Page number
      const totalPages = (doc.internal as any).getNumberOfPages()
      doc.text(`Halaman 1 dari ${totalPages}`, pageWidth / 2, footerY + 5, { align: 'center' } as any)
      
      // Right: Signature placeholders
      const sig1X = pageWidth - 90
      const sig2X = pageWidth - 40
      const sigY = footerY + 3
      
      doc.setFontSize(8)
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
      doc.text('Bendahara', sig1X, sigY, { align: 'center' } as any)
      doc.text('Kepala Sekolah', sig2X, sigY, { align: 'center' } as any)
      
      // Signature lines
      doc.setDrawColor(180, 180, 180)
      doc.line(sig1X - 15, sigY + 10, sig1X + 15, sigY + 10)
      doc.line(sig2X - 18, sigY + 10, sig2X + 18, sigY + 10)
      
      doc.setFontSize(7)
      doc.setTextColor(100, 100, 100)
      doc.text('(Nama Bendahara)', sig1X, sigY + 14, { align: 'center' } as any)
      doc.text('(Nama Kepala Sekolah)', sig2X, sigY + 14, { align: 'center' } as any)
      
      // Generate filename
      const filename = `Laporan_Keuangan_${exportStartDate}_${exportEndDate}.pdf`
      
      // Save file
      doc.save(filename)
      
      toast.success('Laporan PDF berhasil diunduh')
    } catch (error) {
      console.error('PDF export error:', error)
      toast.error('Gagal membuat file PDF')
    }
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
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Laporan Keuangan</h1>
            {isTreasurer && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                📅 Akses 3 Bulan
              </Badge>
            )}
            {isSuperAdmin && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                👑 Akses Penuh
              </Badge>
            )}
          </div>
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

        {/* COA Breakdown Section */}
        {reportData && (reportData.incomeByCOA?.length > 0 || reportData.expenseByCOA?.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income by COA */}
            {reportData.incomeByCOA?.length > 0 && (
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader className="pb-4 bg-green-50 rounded-t-2xl">
                  <CardTitle className="text-base font-semibold text-green-800">
                    Breakdown Pemasukan per Akun COA
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {reportData.incomeByCOA.map((item: any, index: number) => {
                      const percentage = reportData.summary.totalIncome > 0 
                        ? ((item.amount / reportData.summary.totalIncome) * 100).toFixed(1)
                        : 0
                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-700 font-medium">
                              {item.code} - {item.name}
                            </span>
                            <span className="text-green-600 font-semibold">
                              Rp {item.amount.toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-500 transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-12 text-right">{percentage}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Expense by COA */}
            {reportData.expenseByCOA?.length > 0 && (
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader className="pb-4 bg-red-50 rounded-t-2xl">
                  <CardTitle className="text-base font-semibold text-red-800">
                    Breakdown Pengeluaran per Akun COA
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {reportData.expenseByCOA.map((item: any, index: number) => {
                      const percentage = reportData.summary.totalExpense > 0 
                        ? ((item.amount / reportData.summary.totalExpense) * 100).toFixed(1)
                        : 0
                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-700 font-medium">
                              {item.code} - {item.name}
                            </span>
                            <span className="text-red-600 font-semibold">
                              Rp {item.amount.toLocaleString('id-ID')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-red-500 transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-12 text-right">{percentage}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

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
                    <TableHead className="font-semibold text-xs text-gray-600">Akun COA</TableHead>
                    <TableHead className="font-semibold text-xs text-gray-600">Deskripsi/Nama</TableHead>
                    <TableHead className="font-semibold text-xs text-gray-600">Nominal</TableHead>
                    <TableHead className="font-semibold text-xs text-gray-600">Metode</TableHead>
                    <TableHead className="font-semibold text-xs text-gray-600">Status</TableHead>
                    <TableHead className="font-semibold text-xs text-gray-600 text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData?.transactions && reportData.transactions.length > 0 ? (
                    reportData.transactions
                      .slice((currentPage - 1) * 5, currentPage * 5)
                      .map((transaction: any) => (
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
                        <TableCell className="text-sm">
                          {transaction.coaAccount?.code ? `${transaction.coaAccount.code} - ${transaction.coaAccount.name}` : transaction.description || 'N/A'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {transaction.payerName || transaction.recipientName || transaction.description || 'N/A'}
                        </TableCell>
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
                      <TableCell colSpan={9} className="text-center py-8 text-gray-400">
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
                Menampilkan {((currentPage - 1) * 5) + 1}-{Math.min(currentPage * 5, reportData?.transactions?.length || 0)} dari {reportData?.transactions?.length || 0} transaksi
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  Previous
                </Button>
                {(() => {
                  const totalPages = Math.ceil((reportData?.transactions?.length || 0) / 5)
                  const pages = []
                  
                  // Show first 3 pages or current page vicinity
                  for (let i = 1; i <= Math.min(3, totalPages); i++) {
                    pages.push(i)
                  }
                  
                  // Show current page if beyond first 3
                  if (currentPage > 3 && currentPage < totalPages - 2) {
                    pages.push(currentPage)
                  }
                  
                  return pages.map((page) => (
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
                  ))
                })()}
                {Math.ceil((reportData?.transactions?.length || 0) / 5) > 3 && (
                  <>
                    <span className="px-2 text-gray-400">...</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 text-xs text-gray-600 hover:bg-gray-100"
                      onClick={() => setCurrentPage(Math.ceil((reportData?.transactions?.length || 0) / 5))}
                    >
                      {Math.ceil((reportData?.transactions?.length || 0) / 5)}
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={currentPage >= Math.ceil((reportData?.transactions?.length || 0) / 5)}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Export Laporan ke {exportType === 'excel' ? 'Excel' : 'PDF'}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 pt-2">
              Pilih rentang tanggal untuk laporan yang akan di-export (maksimal 1 bulan)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-xs text-amber-800">
                <strong>Catatan:</strong> Rentang tanggal maksimal 31 hari (1 bulan)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-sm font-medium">Tanggal Mulai</Label>
              <Input
                id="start-date"
                type="date"
                value={exportStartDate}
                onChange={(e) => {
                  const selectedDate = e.target.value
                  if (isTreasurer && treasurerMaxStartDate && selectedDate < treasurerMaxStartDate) {
                    toast.error(`Bendahara hanya dapat mengakses data maksimal 3 bulan terakhir`)
                    setExportStartDate(treasurerMaxStartDate)
                  } else {
                    setExportStartDate(selectedDate)
                  }
                }}
                min={treasurerMaxStartDate || undefined}
                className="w-full"
              />
              {isTreasurer && (
                <p className="text-xs text-amber-600">
                  ⚠️ Akses dibatasi maksimal 3 bulan terakhir
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-sm font-medium">Tanggal Akhir</Label>
              <Input
                id="end-date"
                type="date"
                value={exportEndDate}
                onChange={(e) => setExportEndDate(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">Rentang Tanggal Terpilih</p>
                  <p className="text-sm text-blue-700 mt-1">
                    {new Date(exportStartDate).toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })} 
                    {' - '}
                    {new Date(exportEndDate).toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {(() => {
                      const start = new Date(exportStartDate)
                      const end = new Date(exportEndDate)
                      const diffTime = Math.abs(end.getTime() - start.getTime())
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                      return `${diffDays} hari`
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsExportDialogOpen(false)}
            >
              Batal
            </Button>
            <Button 
              onClick={executeExport}
              className={exportType === 'excel' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {exportType === 'excel' ? (
                <>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export Excel
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export PDF
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
