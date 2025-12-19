"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Users, TrendingUp, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface School {
  id: string
  name: string
  address: string
  phone: string
  email: string
  _count?: {
    users: number
    transactions: number
  }
}

export default function SchoolSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [editingSchool, setEditingSchool] = useState<School | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: ""
  })
  const [isSaving, setIsSaving] = useState(false)

  // Check if user is Super Admin
  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/auth/signin")
      return
    }

    if (session.user.role !== "SUPER_ADMIN") {
      toast.error("Anda tidak memiliki akses ke halaman ini")
      router.push("/dashboard")
      return
    }

    fetchSchools()
  }, [session, status, router])

  const fetchSchools = async () => {
    try {
      const response = await fetch("/api/schools")
      const data = await response.json()
      
      if (response.ok) {
        setSchools(data.schools)
      } else {
        toast.error(data.error || "Gagal mengambil data sekolah")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat mengambil data")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (school: School) => {
    setEditingSchool(school)
    setFormData({
      name: school.name,
      address: school.address,
      phone: school.phone,
      email: school.email
    })
  }

  const handleSave = async () => {
    if (!editingSchool) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/schools/${editingSchool.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Data sekolah berhasil diupdate")
        setEditingSchool(null)
        fetchSchools()
      } else {
        toast.error(data.error || "Gagal mengupdate data")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menyimpan")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditingSchool(null)
    setFormData({
      name: "",
      address: "",
      phone: "",
      email: ""
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Pengaturan Sekolah
        </h1>
        <p className="text-gray-600">
          Kelola data sekolah yang terdaftar di sistem (Hanya Super Admin)
        </p>
      </div>

      <div className="grid gap-6">
        {schools.map((school) => (
          <Card key={school.id} className="border-2">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{school.name}</CardTitle>
                    <CardDescription>{school.email}</CardDescription>
                  </div>
                </div>
                <Button
                  onClick={() => handleEdit(school)}
                  variant="outline"
                  disabled={editingSchool?.id === school.id}
                >
                  {editingSchool?.id === school.id ? "Sedang Edit" : "Edit"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {editingSchool?.id === school.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Sekolah</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nama sekolah"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Sekolah</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@sekolah.sch.id"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Alamat</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Alamat lengkap sekolah"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(021) 12345678"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Simpan Perubahan
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      disabled={isSaving}
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Alamat</p>
                      <p className="font-medium">{school.address}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Telepon</p>
                      <p className="font-medium">{school.phone}</p>
                    </div>
                  </div>

                  {school._count && (
                    <div className="flex gap-6 pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {school._count.users} Users
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {school._count.transactions} Transaksi
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {schools.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Belum ada sekolah terdaftar</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
