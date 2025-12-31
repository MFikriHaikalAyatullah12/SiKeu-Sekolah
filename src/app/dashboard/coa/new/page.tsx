"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ArrowLeft, Loader2 } from "lucide-react"

interface CoaCategory {
  id: string
  code: string
  name: string
  type: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE"
}

export default function NewCOAPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<CoaCategory[]>([])
  const [formData, setFormData] = useState({
    categoryId: "",
    subCategoryCode: "",
    subCategoryName: "",
    subCategoryDescription: "",
    accountCode: "",
    accountName: "",
    accountDescription: "",
    visibleToTreasurer: true
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
    
    if (session?.user?.role !== "SUPER_ADMIN") {
      router.push("/dashboard")
      toast.error("Hanya Super Admin yang dapat mengakses halaman ini")
    }

    fetchCategories()
  }, [session, status, router])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/coa")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.categoryId || !formData.accountName || !formData.accountCode) {
      toast.error("Mohon lengkapi field yang diperlukan")
      return
    }

    setLoading(true)
    try {
      // First create subcategory if provided
      let subCategoryId = null
      if (formData.subCategoryCode && formData.subCategoryName) {
        const subCategoryResponse = await fetch("/api/coa/subcategory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryId: formData.categoryId,
            code: formData.subCategoryCode,
            name: formData.subCategoryName,
            description: formData.subCategoryDescription
          })
        })

        if (subCategoryResponse.ok) {
          const subCategoryData = await subCategoryResponse.json()
          subCategoryId = subCategoryData.id
        } else {
          throw new Error("Gagal membuat sub kategori")
        }
      }

      // Then create account
      const accountResponse = await fetch("/api/coa/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subCategoryId: subCategoryId || formData.categoryId,
          code: formData.accountCode,
          name: formData.accountName,
          description: formData.accountDescription,
          visibleToTreasurer: formData.visibleToTreasurer
        })
      })

      if (!accountResponse.ok) {
        throw new Error("Gagal membuat akun")
      }

      toast.success("COA berhasil ditambahkan")
      router.push("/dashboard/coa")
    } catch (error: any) {
      toast.error(error.message || "Gagal menambahkan COA")
    } finally {
      setLoading(false)
    }
  }

  if (loading || session?.user?.role !== "SUPER_ADMIN") {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push("/dashboard/coa")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle>Tambah COA Baru</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Buat kategori akun baru untuk sistem keuangan
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Selection */}
              <div className="space-y-2">
                <Label htmlFor="categoryId">Kategori Utama *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori utama" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.code} - {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sub Category (Optional) */}
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium text-sm text-gray-700">Sub Kategori (Opsional)</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subCategoryCode">Kode Sub Kategori</Label>
                    <Input
                      id="subCategoryCode"
                      placeholder="contoh: 1110"
                      value={formData.subCategoryCode}
                      onChange={(e) => setFormData({ ...formData, subCategoryCode: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subCategoryName">Nama Sub Kategori</Label>
                    <Input
                      id="subCategoryName"
                      placeholder="contoh: Aktiva Lancar"
                      value={formData.subCategoryName}
                      onChange={(e) => setFormData({ ...formData, subCategoryName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subCategoryDescription">Deskripsi Sub Kategori</Label>
                  <Textarea
                    id="subCategoryDescription"
                    placeholder="Deskripsi sub kategori (opsional)"
                    value={formData.subCategoryDescription}
                    onChange={(e) => setFormData({ ...formData, subCategoryDescription: e.target.value })}
                  />
                </div>
              </div>

              {/* Account Details */}
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium text-sm text-gray-700">Detail Akun *</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="accountCode">Kode Akun *</Label>
                    <Input
                      id="accountCode"
                      placeholder="contoh: 1110.001"
                      value={formData.accountCode}
                      onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountName">Nama Akun *</Label>
                    <Input
                      id="accountName"
                      placeholder="contoh: Kas di Bendahara"
                      value={formData.accountName}
                      onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountDescription">Deskripsi Akun</Label>
                  <Textarea
                    id="accountDescription"
                    placeholder="Deskripsi detail akun"
                    value={formData.accountDescription}
                    onChange={(e) => setFormData({ ...formData, accountDescription: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="visibleToTreasurer"
                    checked={formData.visibleToTreasurer}
                    onChange={(e) => setFormData({ ...formData, visibleToTreasurer: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="visibleToTreasurer" className="text-sm">
                    Terlihat oleh Bendahara
                  </Label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/coa")}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Tambah COA"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}