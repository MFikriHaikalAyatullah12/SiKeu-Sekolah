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
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
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

        {/* Filter Bar */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
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

              {/* Date Range */}
              <Select value={filterDate} onValueChange={setFilterDate}>
                <SelectTrigger className="w-[140px] h-10 rounded-lg border-gray-200">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hari-ini">Hari ini</SelectItem>
                  <SelectItem value="minggu-ini">Minggu ini</SelectItem>
                  <SelectItem value="bulan-ini">Bulan ini</SelectItem>
                  <SelectItem value="bulan-lalu">Bulan lalu</SelectItem>
                  <SelectItem value="semua">Semua</SelectItem>
                </SelectContent>
              </Select>

              {/* Status */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px] h-10 rounded-lg border-gray-200">
                  <CheckCircle className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Lunas / Menunggu / Void</SelectItem>
                  <SelectItem value="lunas">Lunas</SelectItem>
                  <SelectItem value="menunggu">Menunggu</SelectItem>
                  <SelectItem value="void">Void</SelectItem>
                </SelectContent>
              </Select>

              {/* Kategori */}
              <Select value={filterKategori} onValueChange={setFilterKategori}>
                <SelectTrigger className="w-[200px] h-10 rounded-lg border-gray-200">
                  <Filter className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">SPP / Donasi / Iuran Kegiatan ...</SelectItem>
                  <SelectItem value="spp">SPP</SelectItem>
                  <SelectItem value="donasi">Donasi</SelectItem>
                  <SelectItem value="iuran-kegiatan">Iuran Kegiatan</SelectItem>
                  <SelectItem value="usaha-sekolah">Usaha Sekolah</SelectItem>
                </SelectContent>
              </Select>

              {/* Petugas */}
              <Select value={filterPetugas} onValueChange={setFilterPetugas}>
                <SelectTrigger className="w-[160px] h-10 rounded-lg border-gray-200">
                  <User className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Petugas</SelectItem>
                  <SelectItem value="bendahara">Bendahara</SelectItem>
                  <SelectItem value="admin-tu">Admin TU</SelectItem>
                  <SelectItem value="superuser">Superuser</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[130px] h-10 rounded-lg border-gray-200">
                  <ArrowUpDown className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="terbaru">Terbaru</SelectItem>
                  <SelectItem value="terlama">Terlama</SelectItem>
                  <SelectItem value="nominal-tinggi">Nominal ↓</SelectItem>
                  <SelectItem value="nominal-rendah">Nominal ↑</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Main Layout - Split View */}
        <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">
          MAIN LAYOUT (SPLIT VIEW)
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-6">
          {/* Left Column - Receipt List */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Daftar Kwitansi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="font-semibold text-xs text-gray-600 py-3">Nomor</TableHead>
                      <TableHead className="font-semibold text-xs text-gray-600">Nama Pembayar</TableHead>
                      <TableHead className="font-semibold text-xs text-gray-600">Tanggal</TableHead>
                      <TableHead className="font-semibold text-xs text-gray-600">Nominal</TableHead>
                      <TableHead className="font-semibold text-xs text-gray-600">Status</TableHead>
                      <TableHead className="font-semibold text-xs text-gray-600">Petugas</TableHead>
                      <TableHead className="font-semibold text-xs text-gray-600 text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReceipts.map((receipt) => (
                      <TableRow 
                        key={receipt.id} 
                        className={`hover:bg-gray-50/50 cursor-pointer ${selectedReceipt?.id === receipt.id ? 'bg-blue-50/50' : ''}`}
                        onClick={() => handlePreview(receipt)}
                      >
                        <TableCell className="text-sm py-3 font-mono text-blue-600">
                          {receipt.nomor}
                        </TableCell>
                        <TableCell className="text-sm">{receipt.namaPembayar}</TableCell>
                        <TableCell className="text-sm">{formatDate(receipt.tanggal)}</TableCell>
                        <TableCell className="text-sm font-medium">
                          {formatCurrency(receipt.nominal)}
                        </TableCell>
                        <TableCell>{getStatusBadge(receipt.status)}</TableCell>
                        <TableCell className="text-sm text-gray-600">{receipt.petugas}</TableCell>
                        <TableCell className="text-center">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePreview(receipt)
                            }}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium"
                          >
                            <Eye className="h-3 w-3" />
                            Preview
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-1 pt-4">
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

          {/* Right Column - Preview Panel */}
          <div className="space-y-4">
            <div className="text-xs text-gray-400 uppercase tracking-wide font-medium">
              PREVIEW PANEL
            </div>
            
            {selectedReceipt && (
              <>
                {/* A4 Receipt Preview */}
                <Card className="rounded-2xl border-0 shadow-sm">
                  <CardContent className="p-6">
                    {/* Receipt Preview - A4 Style */}
                    <div className="bg-white border rounded-xl p-6 shadow-sm">
                      {/* Header */}
                      <div className="flex items-start gap-4 pb-4 border-b">
                        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                          <FileText className="h-7 w-7 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">SMA Negeri Contoh</h3>
                          <p className="text-xs text-gray-500">Jl. Pendidikan No. 123, Kota Contoh</p>
                          <p className="text-xs text-gray-500">(021) 12345678 / info@smancontoh.sch.id</p>
                        </div>
                      </div>

                      {/* Title */}
                      <div className="text-center py-4">
                        <h2 className="text-xl font-bold text-gray-900 tracking-wide">KWITANSI</h2>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="text-gray-500">Nomor:</span>{" "}
                          <span className="font-mono font-medium">{selectedReceipt.nomor}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Tanggal: {formatDate(selectedReceipt.tanggal)}
                        </div>
                      </div>

                      {/* Details */}
                      <div className="space-y-3 py-4 border-t border-b">
                        <div className="flex">
                          <span className="w-36 text-sm text-gray-500">Telah diterima dari</span>
                          <span className="text-sm font-medium">: {selectedReceipt.namaPembayar}</span>
                        </div>
                        <div className="flex">
                          <span className="w-36 text-sm text-gray-500">Untuk pembayaran</span>
                          <span className="text-sm font-medium">: {selectedReceipt.untukPembayaran}</span>
                        </div>
                        <div className="flex">
                          <span className="w-36 text-sm text-gray-500">Nominal</span>
                          <span className="text-sm font-bold text-blue-600">: {formatCurrency(selectedReceipt.nominal)}</span>
                        </div>
                        <div className="flex">
                          <span className="w-36 text-sm text-gray-500">Terbilang</span>
                          <span className="text-sm italic">: {selectedReceipt.terbilang}</span>
                        </div>
                        <div className="flex">
                          <span className="w-36 text-sm text-gray-500">Metode pembayaran</span>
                          <span className="text-sm">: {selectedReceipt.metodePembayaran}</span>
                        </div>
                      </div>

                      {/* Footer with QR and Signature */}
                      <div className="flex justify-between items-end pt-4">
                        {/* QR Code */}
                        <div className="text-center">
                          <div className="w-20 h-20 bg-gray-100 border rounded-lg flex items-center justify-center mb-1">
                            <div className="grid grid-cols-4 gap-0.5">
                              {Array(16).fill(0).map((_, i) => (
                                <div 
                                  key={i} 
                                  className={`w-3 h-3 ${Math.random() > 0.5 ? 'bg-gray-800' : 'bg-white'}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-400">Verifikasi</p>
                        </div>

                        {/* Signature */}
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-10">Bendahara</p>
                          <div className="border-b border-gray-300 w-32 mb-1"></div>
                          <p className="text-xs text-gray-500">(Nama Bendahara)</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Info Sistem */}
                <Card className="rounded-2xl border-0 shadow-sm">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4" />
                      Info Sistem
                    </h4>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Dibuat oleh</span>
                        <span className="font-medium text-gray-700">{selectedReceipt.createdBy}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Dibuat pada</span>
                        <span className="text-gray-700">{formatDateTime(selectedReceipt.createdAt)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Diterbitkan oleh</span>
                        <span className="font-medium text-gray-700">{selectedReceipt.publishedBy || "-"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Diterbitkan pada</span>
                        <span className="text-gray-700">{formatDateTime(selectedReceipt.publishedAt)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleDownloadPDF}
                    className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 rounded-lg"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Unduh PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handlePrint}
                    className="h-10 rounded-lg border-gray-200"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Cetak
                  </Button>
                  <Button
                    onClick={handleSendWhatsApp}
                    className="h-10 bg-green-600 hover:bg-green-700 rounded-lg"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Kirim WhatsApp
                  </Button>
                </div>

                {/* Void Warning */}
                {selectedReceipt.status !== "VOID" && (
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-xs text-amber-700">
                      Void akan tercatat di Audit Log.
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVoid(selectedReceipt)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
                    >
                      <Ban className="h-3 w-3 mr-1" />
                      Void Kwitansi
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
