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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Search, 
  Calendar,
  Eye,
  Download,
  FileText,
  Printer,
  X,
} from "lucide-react"
import { toast } from "sonner"



export default function ReceiptsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [receipts, setReceipts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
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

    fetchReceipts()
  }, [session, status, router])

  const fetchReceipts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/transactions')
      if (!response.ok) throw new Error('Failed to fetch transactions')
      
      const data = await response.json()
      
      // Ensure data is array
      const transactions = Array.isArray(data) ? data : (data?.transactions || [])
      
      const formattedReceipts = transactions.map((transaction: any) => ({
        id: transaction.id,
        nomor: transaction.receiptNumber || `TR-${transaction.id.slice(-8)}`,
        namaPembayar: transaction.fromTo,
        tanggal: new Date(transaction.date).toISOString().split('T')[0],
        nominal: transaction.amount,
        status: transaction.status,
        petugas: transaction.createdBy?.name || 'System',
        kategori: transaction.category?.name || 'Tidak ada kategori',
        untukPembayaran: transaction.description,
        metodePembayaran: transaction.paymentMethod === 'CASH' ? 'Tunai' : 
                         transaction.paymentMethod === 'TRANSFER' ? 'Transfer' : 
                         transaction.paymentMethod || 'Tunai',
        terbilang: numberToWords(transaction.amount),
        createdBy: transaction.createdBy?.name || 'System',
        createdAt: transaction.createdAt,
        publishedBy: transaction.createdBy?.name || 'System',
        publishedAt: transaction.createdAt,
      }))
      
      setReceipts(formattedReceipts)
      if (formattedReceipts.length > 0 && !selectedReceipt) {
        setSelectedReceipt(formattedReceipts[0])
      }
    } catch (error) {
      console.error('Error fetching receipts:', error)
      toast.error('Gagal memuat data kwitansi')
    } finally {
      setLoading(false)
    }
  }

  const numberToWords = (amount: number): string => {
    // Simple implementation - you can enhance this
    if (amount >= 1000000) {
      const millions = Math.floor(amount / 1000000)
      const remainder = amount % 1000000
      if (remainder === 0) {
        return `${millions} Juta Rupiah`
      } else {
        const thousands = Math.floor(remainder / 1000)
        return `${millions} Juta ${thousands > 0 ? thousands + ' Ribu ' : ''}Rupiah`
      }
    } else if (amount >= 1000) {
      const thousands = Math.floor(amount / 1000)
      return `${thousands} Ribu Rupiah`
    }
    return `${amount} Rupiah`
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
    setIsPreviewOpen(true)
  }

  const handleDownloadPDF = async (transactionId?: string) => {
    try {
      const receiptId = transactionId || (selectedReceipt?.id);
      if (!receiptId) {
        toast.error('ID transaksi tidak ditemukan');
        return;
      }
      
      const response = await fetch(`/api/receipts/${receiptId}/pdf`);
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Kwitansi-${selectedReceipt?.nomor || receiptId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("PDF kwitansi berhasil diunduh!");
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error("Gagal mengunduh PDF kwitansi");
    }
  };

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

  // Filter receipts
  const filteredReceipts = receipts.filter((receipt) => {
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="ml-2">Memuat data...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredReceipts.length === 0 ? (
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
                              onClick={() => handleDownloadPDF(receipt.id)}
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

        {/* Preview Dialog */}
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Preview Kwitansi</span>
              </DialogTitle>
            </DialogHeader>
            
            {selectedReceipt && (
              <div className="space-y-6">
                {/* Receipt Preview */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 bg-white">
                  {/* Header */}
                  <div className="text-center border-b pb-4 mb-4">
                    <h2 className="text-xl font-bold text-gray-900">KWITANSI</h2>
                    <p className="text-sm text-gray-500">Bukti Pembayaran</p>
                  </div>
                  
                  {/* Receipt Number */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600">Nomor Kwitansi:</span>
                    <span className="font-mono font-bold text-blue-600">{selectedReceipt.nomor}</span>
                  </div>
                  
                  {/* Receipt Details */}
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-100">
                      <span className="text-gray-500">Tanggal</span>
                      <span className="col-span-2 font-medium">{formatDate(selectedReceipt.tanggal)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-100">
                      <span className="text-gray-500">Diterima dari</span>
                      <span className="col-span-2 font-medium">{selectedReceipt.namaPembayar}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-100">
                      <span className="text-gray-500">Untuk Pembayaran</span>
                      <span className="col-span-2 font-medium">{selectedReceipt.untukPembayaran}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-100">
                      <span className="text-gray-500">Kategori</span>
                      <span className="col-span-2 font-medium">{selectedReceipt.kategori}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-100">
                      <span className="text-gray-500">Metode Pembayaran</span>
                      <span className="col-span-2 font-medium">{selectedReceipt.metodePembayaran}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-100">
                      <span className="text-gray-500">Status</span>
                      <span className="col-span-2">{getStatusBadge(selectedReceipt.status)}</span>
                    </div>
                    
                    {/* Amount */}
                    <div className="bg-green-50 rounded-lg p-4 mt-4">
                      <div className="grid grid-cols-3 gap-2">
                        <span className="text-gray-600 font-medium">Jumlah</span>
                        <span className="col-span-2 text-2xl font-bold text-green-700">
                          {formatCurrency(selectedReceipt.nominal)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <span className="text-gray-500 text-xs">Terbilang</span>
                        <span className="col-span-2 text-sm italic text-gray-600">
                          {selectedReceipt.terbilang}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-xs text-gray-500">
                      <div>
                        <p>Dibuat oleh: {selectedReceipt.createdBy}</p>
                        <p>Tanggal: {formatDateTime(selectedReceipt.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p>Petugas: {selectedReceipt.petugas}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsPreviewOpen(false)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Tutup
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handlePrint}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Cetak
                  </Button>
                  <Button
                    onClick={() => handleDownloadPDF(selectedReceipt.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
