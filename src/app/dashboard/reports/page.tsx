"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Calendar, TrendingUp, TrendingDown, Printer, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function ReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState("thisMonth")
  const [reportData, setReportData] = useState<any>(null)

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/auth/signin")
      return
    }

    // Check role permission
    if (session.user.role !== "SUPER_ADMIN" && session.user.role !== "ADMIN") {
      toast.error("Anda tidak memiliki akses ke halaman ini")
      router.push("/dashboard")
      return
    }

    fetchReportData()
  }, [session, status, router, selectedPeriod])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reports?period=${selectedPeriod}`)
      const data = await response.json()
      
      if (response.ok) {
        setReportData(data)
      } else {
        toast.error(data.error || "Gagal mengambil data laporan")
      }
    } catch (error) {
      toast.error("Gagal mengambil data laporan")
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReport = async (type: string) => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      toast.success(`Laporan ${type} berhasil diunduh`)
      setLoading(false)
    }, 1500)
  }

  const handlePrintReport = () => {
    window.print()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading || !reportData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    )
  }

  const summaryData = reportData.summary

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Laporan Keuangan</h1>
            <p className="text-gray-500 mt-1">Lihat dan unduh laporan keuangan sekolah</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrintReport}>
              <Printer className="mr-2 h-4 w-4" />
              Cetak
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleDownloadReport("lengkap")}>
              <Download className="mr-2 h-4 w-4" />
              Unduh Laporan
            </Button>
          </div>
        </div>

        {/* Period Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Periode Laporan</CardTitle>
            <CardDescription>Pilih periode untuk melihat laporan</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Pilih periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hari Ini</SelectItem>
                <SelectItem value="thisWeek">Minggu Ini</SelectItem>
                <SelectItem value="thisMonth">Bulan Ini</SelectItem>
                <SelectItem value="lastMonth">Bulan Lalu</SelectItem>
                <SelectItem value="thisYear">Tahun Ini</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Total Pemasukan</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(Number(summaryData.totalIncome))}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <TrendingUp className="h-7 w-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Total Pengeluaran</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(Number(summaryData.totalExpense))}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
                  <TrendingDown className="h-7 w-7 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Saldo</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(Number(summaryData.balance))}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <FileText className="h-7 w-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">Total Transaksi</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {summaryData.transactionCount}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                  <Calendar className="h-7 w-7 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Types */}
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Ringkasan</TabsTrigger>
            <TabsTrigger value="income">Pemasukan</TabsTrigger>
            <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Laporan Ringkasan</CardTitle>
                <CardDescription>
                  Ringkasan transaksi keuangan untuk periode yang dipilih
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-600">Total Pemasukan</span>
                    <span className="font-semibold text-green-600">{formatCurrency(summaryData.totalIncome)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-600">Total Pengeluaran</span>
                    <span className="font-semibold text-red-600">{formatCurrency(summaryData.totalExpense)}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-600 font-semibold">Surplus/Defisit</span>
                    <span className="font-bold text-blue-600">{formatCurrency(summaryData.balance)}</span>
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button onClick={() => handleDownloadReport("ringkasan")}>
                      <Download className="mr-2 h-4 w-4" />
                      Unduh Laporan Ringkasan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="income">
            <Card>
              <CardHeader>
                <CardTitle>Laporan Pemasukan</CardTitle>
                <CardDescription>
                  Detail transaksi pemasukan untuk periode yang dipilih
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Laporan detail pemasukan akan ditampilkan di sini
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => handleDownloadReport("pemasukan")}>
                    <Download className="mr-2 h-4 w-4" />
                    Unduh Laporan Pemasukan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expense">
            <Card>
              <CardHeader>
                <CardTitle>Laporan Pengeluaran</CardTitle>
                <CardDescription>
                  Detail transaksi pengeluaran untuk periode yang dipilih
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  Laporan detail pengeluaran akan ditampilkan di sini
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => handleDownloadReport("pengeluaran")}>
                    <Download className="mr-2 h-4 w-4" />
                    Unduh Laporan Pengeluaran
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
