"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Building2, Users, TrendingUp, Save, Loader2, Trash2, AlertTriangle, Plus } from "lucide-react"
import { toast } from "sonner"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmSchoolName, setConfirmSchoolName] = useState("")
  
  // State untuk dialog tambah sekolah
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newSchoolData, setNewSchoolData] = useState({
    name: "",
    address: "",
    phone: "",
    email: ""
  })
  const [isAdding, setIsAdding] = useState(false)

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

    // Validasi
    if (!formData.name || !formData.address || !formData.phone || !formData.email) {
      toast.error("Semua field harus diisi")
      return
    }

    setIsSaving(true)
    try {
      console.log("Saving school:", editingSchool.id, formData)
      
      const response = await fetch(`/api/schools/${editingSchool.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      console.log("Save response:", response.status, data)

      if (response.ok) {
        toast.success("Data sekolah berhasil diupdate")
        setEditingSchool(null)
        fetchSchools()
      } else {
        toast.error(data.error || "Gagal mengupdate data")
      }
    } catch (error) {
      console.error("Save error:", error)
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

  const handleAddSchool = async () => {
    // Validasi
    if (!newSchoolData.name || !newSchoolData.address || !newSchoolData.phone || !newSchoolData.email) {
      toast.error("Semua field harus diisi")
      return
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newSchoolData.email)) {
      toast.error("Format email tidak valid")
      return
    }

    setIsAdding(true)
    try {
      const response = await fetch("/api/schools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSchoolData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Sekolah berhasil ditambahkan")
        setAddDialogOpen(false)
        setNewSchoolData({
          name: "",
          address: "",
          phone: "",
          email: ""
        })
        fetchSchools()
      } else {
        toast.error(data.error || "Gagal menambahkan sekolah")
      }
    } catch (error) {
      console.error("Add school error:", error)
      toast.error("Terjadi kesalahan saat menambahkan sekolah")
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteClick = (school: School) => {
    setSchoolToDelete(school)
    setConfirmSchoolName("")
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!schoolToDelete) return
    
    // Validasi konfirmasi nama sekolah
    if (confirmSchoolName !== schoolToDelete.name) {
      toast.error("Nama sekolah tidak sesuai. Ketik nama sekolah dengan benar untuk konfirmasi.")
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/schools/${schoolToDelete.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message || "Sekolah berhasil dihapus")
        setDeleteDialogOpen(false)
        setSchoolToDelete(null)
        setConfirmSchoolName("")
        fetchSchools()
      } else {
        toast.error(data.error || "Gagal menghapus sekolah")
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Terjadi kesalahan saat menghapus sekolah")
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pengaturan Sekolah
          </h1>
          <p className="text-gray-600">
            Kelola data sekolah yang terdaftar di sistem (Hanya Super Admin)
          </p>
        </div>
        <Button 
          onClick={() => setAddDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tambah Sekolah
        </Button>
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
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(school)}
                    variant="outline"
                    disabled={editingSchool?.id === school.id}
                  >
                    {editingSchool?.id === school.id ? "Sedang Edit" : "Edit"}
                  </Button>
                  <Button
                    onClick={() => handleDeleteClick(school)}
                    variant="destructive"
                    disabled={editingSchool?.id === school.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Hapus Sekolah
            </DialogTitle>
            <DialogDescription>
              Anda akan menghapus sekolah beserta semua data terkait.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-semibold text-red-800 mb-2">
                ⚠️ Peringatan: Tindakan ini tidak dapat dibatalkan!
              </p>
              <p className="text-sm text-red-700">
                Menghapus sekolah akan menghapus semua data terkait:
              </p>
              <ul className="text-sm text-red-700 list-disc list-inside mt-2 space-y-1">
                <li><strong>{schoolToDelete?._count?.transactions || 0} transaksi</strong> akan dihapus permanen</li>
                <li>Semua kategori dan Chart of Accounts akan dihapus</li>
                <li>Semua audit log akan dihapus</li>
                <li>User yang terhubung akan dilepas dari sekolah ini</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Untuk mengkonfirmasi, ketik nama sekolah: <strong className="text-gray-900">{schoolToDelete?.name}</strong>
              </p>
              <Input
                value={confirmSchoolName}
                onChange={(e) => setConfirmSchoolName(e.target.value)}
                placeholder="Ketik nama sekolah untuk konfirmasi"
                className="border-red-300 focus:border-red-500"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setSchoolToDelete(null)
                setConfirmSchoolName("")
              }}
              disabled={isDeleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting || confirmSchoolName !== schoolToDelete?.name}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus Sekolah
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add School Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Tambah Sekolah Baru
            </DialogTitle>
            <DialogDescription>
              Isi data sekolah yang akan didaftarkan ke sistem.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Nama Sekolah <span className="text-red-500">*</span></Label>
              <Input
                id="new-name"
                value={newSchoolData.name}
                onChange={(e) => setNewSchoolData({ ...newSchoolData, name: e.target.value })}
                placeholder="Contoh: SMA Negeri 1 Jakarta"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-email">Email Sekolah <span className="text-red-500">*</span></Label>
              <Input
                id="new-email"
                type="email"
                value={newSchoolData.email}
                onChange={(e) => setNewSchoolData({ ...newSchoolData, email: e.target.value })}
                placeholder="Contoh: info@sman1jakarta.sch.id"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-address">Alamat <span className="text-red-500">*</span></Label>
              <Input
                id="new-address"
                value={newSchoolData.address}
                onChange={(e) => setNewSchoolData({ ...newSchoolData, address: e.target.value })}
                placeholder="Contoh: Jl. Pendidikan No. 123, Jakarta"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-phone">Nomor Telepon <span className="text-red-500">*</span></Label>
              <Input
                id="new-phone"
                value={newSchoolData.phone}
                onChange={(e) => setNewSchoolData({ ...newSchoolData, phone: e.target.value })}
                placeholder="Contoh: (021) 12345678"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setAddDialogOpen(false)
                setNewSchoolData({
                  name: "",
                  address: "",
                  phone: "",
                  email: ""
                })
              }}
              disabled={isAdding}
            >
              Batal
            </Button>
            <Button
              onClick={handleAddSchool}
              disabled={isAdding || !newSchoolData.name || !newSchoolData.email || !newSchoolData.address || !newSchoolData.phone}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Sekolah
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </DashboardLayout>
  )
}
