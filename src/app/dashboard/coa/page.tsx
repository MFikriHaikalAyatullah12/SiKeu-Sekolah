"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { Plus, Pencil, Trash2 } from "lucide-react"

interface ChartOfAccount {
  id: string
  code: string
  name: string
  category: string
  type: "INCOME" | "EXPENSE"
  accountType: string
  description: string | null
  isActive: boolean
}

export default function COAManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [coaList, setCoaList] = useState<ChartOfAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
    
    if (session?.user?.role !== "SUPER_ADMIN") {
      router.push("/dashboard")
      toast.error("Hanya Super Admin yang dapat mengakses halaman ini")
    }
  }, [session, status, router])

  useEffect(() => {
    fetchCOA()
  }, [filterType])

  const fetchCOA = async () => {
    try {
      const url = filterType === "ALL" 
        ? "/api/coa" 
        : `/api/coa?type=${filterType}`
      
      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch COA")
      
      const data = await response.json()
      setCoaList(data)
    } catch (error) {
      toast.error("Gagal memuat Chart of Accounts")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus COA ini?")) return

    try {
      const response = await fetch(`/api/coa/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      toast.success("COA berhasil dihapus")
      fetchCOA()
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus COA")
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/coa/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (!response.ok) throw new Error("Failed to update COA status")

      toast.success(`COA ${!currentStatus ? "diaktifkan" : "dinonaktifkan"}`)
      fetchCOA()
    } catch (error) {
      toast.error("Gagal mengubah status COA")
    }
  }

  if (loading || session?.user?.role !== "SUPER_ADMIN") {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  const groupedByCategory = coaList.reduce((acc, coa) => {
    if (!acc[coa.category]) {
      acc[coa.category] = []
    }
    acc[coa.category].push(coa)
    return acc
  }, {} as Record<string, ChartOfAccount[]>)

  return (
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
          <div className="mb-4 flex gap-2">
            <Button
              variant={filterType === "ALL" ? "default" : "outline"}
              onClick={() => setFilterType("ALL")}
            >
              Semua
            </Button>
            <Button
              variant={filterType === "INCOME" ? "default" : "outline"}
              onClick={() => setFilterType("INCOME")}
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

          {Object.entries(groupedByCategory).map(([category, items]) => (
            <div key={category} className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-600">{category}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Akun</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Jenis Akun</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((coa) => (
                    <TableRow key={coa.id}>
                      <TableCell className="font-mono font-semibold">{coa.code}</TableCell>
                      <TableCell>{coa.name}</TableCell>
                      <TableCell>
                        <Badge variant={coa.type === "INCOME" ? "default" : "destructive"}>
                          {coa.type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{coa.accountType}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(coa.id, coa.isActive)}
                        >
                          <Badge variant={coa.isActive ? "default" : "secondary"}>
                            {coa.isActive ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/coa/edit/${coa.id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(coa.id)}
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
          ))}

          {coaList.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Belum ada Chart of Accounts. Tambahkan COA pertama Anda.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
