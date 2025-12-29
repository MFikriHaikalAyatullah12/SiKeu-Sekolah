"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Search, 
  Calendar,
  Eye,
  Download,
  Send,
  Ban,
  Plus,
  FileText,
  Printer,
  User,
  Clock,
  CheckCircle,
  Filter,
  ArrowUpDown,
} from "lucide-react"
import { toast } from "sonner"

// Sample receipts data
const sampleReceipts = [
  {
    id: "1",
    nomor: "KW-202512-0008",
    namaPembayar: "Budi Santoso",
    tanggal: "2025-12-23",
    nominal: 1500000,
    status: "LUNAS",
    petugas: "Bendahara",
    kategori: "SPP",
    untukPembayaran: "SPP Bulan Desember 2025",
    metodePembayaran: "Tunai",
    terbilang: "Satu Juta Lima Ratus Ribu Rupiah",
    createdBy: "Admin TU",
    createdAt: "2025-12-23T14:10:00",
    publishedBy: "Bendahara",
    publishedAt: "2025-12-23T14:12:00",
  },
  {
    id: "2",
    nomor: "KW-202512-0007",
    namaPembayar: "Alumni 2010",
    tanggal: "2025-12-22",
    nominal: 5000000,
    status: "LUNAS",
    petugas: "Admin TU",
    kategori: "Donasi",
    untukPembayaran: "Donasi Alumni",
    metodePembayaran: "Transfer Bank",
    terbilang: "Lima Juta Rupiah",
    createdBy: "Admin TU",
    createdAt: "2025-12-22T10:30:00",
    publishedBy: "Bendahara",
    publishedAt: "2025-12-22T11:00:00",
  },
  {
    id: "3",
    nomor: "KW-202512-0006",
    namaPembayar: "Panitia Try Out",
    tanggal: "2025-12-21",
    nominal: 750000,
    status: "MENUNGGU",
    petugas: "Admin TU",
    kategori: "Iuran Kegiatan",
    untukPembayaran: "Try Out",
    metodePembayaran: "Tunai",
    terbilang: "Tujuh Ratus Lima Puluh Ribu Rupiah",
    createdBy: "Admin TU",
    createdAt: "2025-12-21T09:00:00",
    publishedBy: null,
    publishedAt: null,
  },
  {
    id: "4",
    nomor: "KW-202512-0005",
    namaPembayar: "Siti Aminah",
    tanggal: "2025-12-20",
    nominal: 1500000,
    status: "VOID",
    petugas: "Superuser",
    kategori: "SPP",
    untukPembayaran: "SPP Bulan November 2025",
    metodePembayaran: "Tunai",
    terbilang: "Satu Juta Lima Ratus Ribu Rupiah",
    createdBy: "Superuser",
    createdAt: "2025-12-20T08:45:00",
    publishedBy: "Superuser",
    publishedAt: "2025-12-20T08:50:00",
  },
  {
    id: "5",
    nomor: "KW-202512-0004",
    namaPembayar: "Kantin Sekolah",
    tanggal: "2025-12-19",
    nominal: 300000,
    status: "LUNAS",
    petugas: "Bendahara",
    kategori: "Usaha Sekolah",
    untukPembayaran: "Setoran Kantin",
    metodePembayaran: "Tunai",
    terbilang: "Tiga Ratus Ribu Rupiah",
    createdBy: "Bendahara",
    createdAt: "2025-12-19T16:00:00",
    publishedBy: "Bendahara",
    publishedAt: "2025-12-19T16:05:00",
  },
]

export default function ReceiptsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedReceipt, setSelectedReceipt] = useState<any>(sampleReceipts[0])
  const [currentPage, setCurrentPage] = useState(1)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [filterDate, setFilterDate] = useState("bulan-ini")
  const [filterStatus, setFilterStatus] = useState("semua")
  const [filterKategori, setFilterKategori] = useState("semua")
  const [filterPetugas, setFilterPetugas] = useState("semua")
  const [sortBy, setSortBy] = useState("terbaru")

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/auth/signin")
      return
    }
  }, [session, status, router])

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

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "LUNAS":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">Lunas</Badge>
      case "MENUNGGU":
        return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-0">Menunggu</Badge>
      case "VOID":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0">Void</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-0">{status}</Badge>
    }
  }

  const handlePreview = (receipt: any) => {
    setSelectedReceipt(receipt)
  }

  const handleDownloadPDF = () => {
    toast.success("Mengunduh PDF kwitansi...")
  }

  const handlePrint = () => {
    toast.success("Membuka dialog cetak...")
    window.print()
  }

  const handleSendWhatsApp = () => {
    toast.success("Mengirim kwitansi via WhatsApp...")
  }

  const handleVoid = (receipt: any) => {
    toast.warning("Void akan tercatat di Audit Log", {
      description: `Kwitansi ${receipt.nomor} akan dibatalkan`,
    })
  }

  const handleCreateReceipt = () => {
    toast.success("Membuka form buat kwitansi baru...")
  }

  const handleExportPDF = () => {
    toast.success("Mengekspor semua kwitansi ke PDF...")
  }

  // Filter receipts
  const filteredReceipts = sampleReceipts.filter((receipt) => {
    const matchesSearch = 
      receipt.nomor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      receipt.namaPembayar.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = filterStatus === "semua" || receipt.status === filterStatus.toUpperCase()
    const matchesPetugas = filterPetugas === "semua" || 
      receipt.petugas.toLowerCase().replace(/\s+/g, '-') === filterPetugas
    
    return matchesSearch && matchesStatus && matchesPetugas
  })

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6 bg-gray-50/80 min-h-screen -m-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kwitansi</h1>
            <p className="text-gray-500 mt-1">Kelola bukti pembayaran & kirim kwitansi</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={handleExportPDF}
              className="h-10 rounded-lg border-gray-200"
            >
              <FileText className="mr-2 h-4 w-4" />
              Export PDF (Kwitansi)
            </Button>
            <Button 
              onClick={handleCreateReceipt}
              className="h-10 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Buat Kwitansi
            </Button>
          </div>
        </div>

        {/* Filter Bar - Simplified */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari nomor kwitansi / nama pembayar ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 rounded-lg border-gray-200"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex gap-3">
                <Select value={filterDate} onValueChange={setFilterDate}>
                  <SelectTrigger className="w-[140px] h-10 rounded-lg border-gray-200">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bulan-ini">Bulan ini</SelectItem>
                    <SelectItem value="minggu-ini">Minggu ini</SelectItem>
                    <SelectItem value="hari-ini">Hari ini</SelectItem>
                    <SelectItem value="semua">Semua</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[120px] h-10 rounded-lg border-gray-200">
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
            </div>
          </CardContent>
        </Card>

        {/* Main Content - Single View Table */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-4 px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Daftar Kwitansi</CardTitle>
              <Badge variant="outline" className="px-3 py-1 text-xs">
                {filteredReceipts.length} Data
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-6">
            <div className="border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-sm text-gray-700 py-4">Nomor</TableHead>
                    <TableHead className="font-semibold text-sm text-gray-700">Nama Pembayar</TableHead>
                    <TableHead className="font-semibold text-sm text-gray-700">Tanggal</TableHead>
                    <TableHead className="font-semibold text-sm text-gray-700">Nominal</TableHead>
                    <TableHead className="font-semibold text-sm text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-sm text-gray-700">Petugas</TableHead>
                    <TableHead className="font-semibold text-sm text-gray-700 text-center">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceipts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm">Tidak ada kwitansi ditemukan</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReceipts.map((receipt) => (
                      <TableRow 
                        key={receipt.id} 
                        className="hover:bg-gray-50/50"
                      >
                        <TableCell className="text-sm py-4 font-mono text-blue-600 font-medium">
                          {receipt.nomor}
                        </TableCell>
                        <TableCell className="text-sm font-medium">{receipt.namaPembayar}</TableCell>
                        <TableCell className="text-sm">{formatDate(receipt.tanggal)}</TableCell>
                        <TableCell className="text-sm font-medium text-green-700">
                          {formatCurrency(receipt.nominal)}
                        </TableCell>
                        <TableCell>{getStatusBadge(receipt.status)}</TableCell>
                        <TableCell className="text-sm text-gray-600">{receipt.petugas}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePreview(receipt)}
                              className="h-8 px-3 text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Preview
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDownloadPDF()}
                              className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-center gap-1 pt-6">
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
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
