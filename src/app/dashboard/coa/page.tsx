"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

interface CoaCategory {
  id: string
  code: string
  name: string
  type: "REVENUE" | "EXPENSE"
  description: string | null
  isActive: boolean
  subCategories: CoaSubCategory[]
}

interface CoaSubCategory {
  id: string
  code: string
  name: string
  description: string | null
  isActive: boolean
  accounts: CoaAccount[]
}

interface CoaAccount {
  id: string
  code: string
  name: string
  description: string | null
  isActive: boolean
  visibleToTreasurer: boolean
}

export default function COAManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [coaCategories, setCoaCategories] = useState<CoaCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<"ALL" | "REVENUE" | "EXPENSE">("ALL")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
    
    if (status === "authenticated" && session?.user?.role !== "SUPER_ADMIN") {
      router.push("/dashboard")
      toast.error("Hanya Super Admin yang dapat mengakses halaman ini")
    }
  }, [session, status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetchCOA()
    }
  }, [filterType, status])

  const fetchCOA = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const url = filterType === "ALL" 
        ? "/api/coa?format=hierarchy" 
        : `/api/coa?format=hierarchy&type=${filterType}`
      
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch COA`)
      
      const data: CoaCategory[] = await response.json()
      setCoaCategories(data)
    } catch (error: any) {
      console.error("Error fetching COA:", error)
      setError(error.message || "Gagal memuat Chart of Accounts")
      toast.error("Gagal memuat Chart of Accounts")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async (accountId: string, accountName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus akun "${accountName}"?`)) return

    try {
      const response = await fetch(`/api/coa/categories/subcategories/accounts/${accountId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete account")
      }

      toast.success("Akun berhasil dihapus")
      fetchCOA()
    } catch (error: any) {
      console.error("Error deleting account:", error)
      toast.error(error.message || "Gagal menghapus akun")
    }
  }

  const toggleAccountActive = async (accountId: string, currentStatus: boolean, accountName: string) => {
    try {
      const response = await fetch(`/api/coa/categories/subcategories/accounts/${accountId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update account status")
      }

      toast.success(`Akun "${accountName}" ${!currentStatus ? "diaktifkan" : "dinonaktifkan"}`)
      fetchCOA()
    } catch (error: any) {
      console.error("Error updating account status:", error)
      toast.error(error.message || "Gagal mengubah status akun")
    }
  }

  const getCategoryDisplayName = (code: string, name: string): string => {
    switch (code) {
      case "1": return "AKTIVA"
      case "2": return "KEWAJIBAN"
      case "3": return "EKUITAS"
      case "4": return "PENDAPATAN"
      case "5": return "BEBAN"
      default: return `${code} - ${name}`
    }
  }

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Memuat...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (status === "unauthenticated" || session?.user?.role !== "SUPER_ADMIN") {
    return null // Redirect akan ditangani oleh useEffect
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="text-red-500 text-lg font-medium mb-4">
                  Terjadi kesalahan: {error}
                </div>
                <Button onClick={fetchCOA}>
                  Coba Lagi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
            <div>
              <CardTitle>Chart of Accounts (COA) Management</CardTitle>
              <CardDescription>
                Kelola kategori dan kode akun untuk transaksi keuangan
              </CardDescription>
            </div>
            <Button onClick={() => router.push("/dashboard/coa/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah COA Baru
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex gap-2">
            <Button
              variant={filterType === "ALL" ? "default" : "outline"}
              onClick={() => setFilterType("ALL")}
            >
              Semua
            </Button>
            <Button
              variant={filterType === "REVENUE" ? "default" : "outline"}
              onClick={() => setFilterType("REVENUE")}
            >
              Pemasukan
            </Button>
            <Button
              variant={filterType === "EXPENSE" ? "default" : "outline"}
              onClick={() => setFilterType("EXPENSE")}
            >
              Pengeluaran
            </Button>
          </div>

          {coaCategories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="mb-4">
                <Plus className="mx-auto h-12 w-12 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium mb-2">Belum ada Chart of Accounts</h3>
              <p className="text-sm">Tambahkan kategori COA pertama Anda untuk mulai mengelola struktur akuntansi.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {coaCategories
                .sort((a, b) => a.code.localeCompare(b.code))
                .map((category) => (
                <div key={category.id} className="border rounded-lg overflow-hidden">
                  {/* Category Header */}
                  <div className="bg-blue-50 p-4 border-b-2 border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-blue-800">
                          {getCategoryDisplayName(category.code, category.name)}
                        </h2>
                        <p className="text-sm text-blue-600">
                          Kategori {category.type === "REVENUE" ? "Pemasukan" : "Pengeluaran"}
                        </p>
                      </div>
                      <Badge variant={category.type === "REVENUE" ? "default" : "destructive"}>
                        {category.type === "REVENUE" ? "PEMASUKAN" : "PENGELUARAN"}
                      </Badge>
                    </div>
                  </div>

                  {/* Subcategories */}
                  {category.subCategories.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 bg-gray-50">
                      Belum ada sub kategori dalam kategori ini
                    </div>
                  ) : (
                    category.subCategories
                      .sort((a, b) => a.code.localeCompare(b.code))
                      .map((subCategory, subIndex) => (
                      <div key={subCategory.id} className={`border-l-4 border-blue-200 ${subIndex === category.subCategories.length - 1 ? '' : 'border-b'}`}>
                        {/* Subcategory Header */}
                        <div className="bg-gray-50 p-3 pl-8 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-700">
                                {subCategory.code} - {subCategory.name}
                              </h3>
                              <p className="text-sm text-gray-500">Sub Kategori</p>
                            </div>
                            <Badge variant="outline">
                              {subCategory.accounts.length} Akun
                            </Badge>
                          </div>
                        </div>

                        {/* Accounts Table */}
                        {subCategory.accounts.length === 0 ? (
                          <div className="p-4 pl-8 text-center text-gray-500 text-sm bg-white">
                            Belum ada akun dalam sub kategori ini
                          </div>
                        ) : (
                          <div className="pl-4 bg-white">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-gray-100">
                                  <TableHead className="pl-8 font-semibold">Kode</TableHead>
                                  <TableHead className="font-semibold">Nama Akun</TableHead>
                                  <TableHead className="font-semibold">Deskripsi</TableHead>
                                  <TableHead className="font-semibold">Visible to Treasurer</TableHead>
                                  <TableHead className="font-semibold">Status</TableHead>
                                  <TableHead className="font-semibold">Aksi</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {subCategory.accounts
                                  .sort((a, b) => a.code.localeCompare(b.code))
                                  .map((account) => (
                                  <TableRow key={account.id} className="hover:bg-gray-50">
                                    <TableCell className="font-mono font-semibold pl-8">
                                      {account.code}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                      {account.name}
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-600 max-w-xs">
                                      <div className="truncate" title={account.description || ""}>
                                        {account.description || "-"}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant={account.visibleToTreasurer ? "default" : "secondary"}>
                                        {account.visibleToTreasurer ? "Ya" : "Tidak"}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleAccountActive(account.id, account.isActive, account.name)}
                                        className="hover:bg-transparent"
                                      >
                                        <Badge variant={account.isActive ? "default" : "secondary"}>
                                          {account.isActive ? "Aktif" : "Nonaktif"}
                                        </Badge>
                                      </Button>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => router.push(`/dashboard/coa/edit/${account.id}`)}
                                          title="Edit akun"
                                        >
                                          <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleDeleteAccount(account.id, account.name)}
                                          title="Hapus akun"
                                        >
                                          <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </DashboardLayout>
  )
}
