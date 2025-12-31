"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ArrowLeft, Loader2 } from "lucide-react"

interface CoaAccount {
  id: string
  code: string
  name: string
  description: string | null
  visibleToTreasurer: boolean
  subCategory: {
    id: string
    name: string
    category: {
      id: string
      name: string
    }
  }
}

export default function EditCOAPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
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

    if (params.id) {
      fetchCOAAccount()
    }
  }, [session, status, router, params.id])

  const fetchCOAAccount = async () => {
    try {
      const response = await fetch(`/api/coa/account/${params.id}`)
      if (response.ok) {
        const data: CoaAccount = await response.json()
        setFormData({
          code: data.code,
          name: data.name,
          description: data.description || "",
          visibleToTreasurer: data.visibleToTreasurer
        })
      } else {
        toast.error("COA tidak ditemukan")
        router.push("/dashboard/coa")
      }
    } catch (error) {
      console.error("Failed to fetch COA account:", error)
      toast.error("Gagal memuat data COA")
      router.push("/dashboard/coa")
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.code) {
      toast.error("Mohon lengkapi field yang diperlukan")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/coa/account/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formData.code,
          name: formData.name,
          description: formData.description,
          visibleToTreasurer: formData.visibleToTreasurer
        })
      })

      if (!response.ok) {
        throw new Error("Gagal mengupdate COA")
      }

      toast.success("COA berhasil diupdate")
      router.push("/dashboard/coa")
    } catch (error: any) {
      toast.error(error.message || "Gagal mengupdate COA")
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading || session?.user?.role !== "SUPER_ADMIN") {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
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
                <CardTitle>Edit COA</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Edit informasi Chart of Account
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Kode Akun *</Label>
                    <Input
                      id="code"
                      placeholder="contoh: 1110.001"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Akun *</Label>
                    <Input
                      id="name"
                      placeholder="contoh: Kas di Bendahara"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi Akun</Label>
                  <Textarea
                    id="description"
                    placeholder="Deskripsi detail akun"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    "Update COA"
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