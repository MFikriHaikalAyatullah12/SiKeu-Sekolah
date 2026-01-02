"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { RoleBadge } from "@/components/ui/role-badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, UserPlus, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  schoolProfile?: {
    name: string
  }
}

interface School {
  id: string
  name: string
}

export default function UsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "TREASURER",  // Default to Bendahara
    schoolId: ""
  })

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

    fetchUsers()
    if (session?.user.role === "SUPER_ADMIN") {
      fetchSchools()
    }
  }, [session, status, router])

  const fetchSchools = async () => {
    try {
      const response = await fetch("/api/schools")
      const data = await response.json()
      if (response.ok) {
        setSchools(data.schools)
      }
    } catch (error) {
      console.error("Failed to fetch schools:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      const data = await response.json()
      
      if (response.ok) {
        setUsers(data.users)
      } else {
        toast.error(data.error || "Gagal mengambil data pengguna")
      }
    } catch (error) {
      toast.error("Gagal mengambil data pengguna")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
        schoolId: ""
      })
    } else {
      setEditingUser(null)
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "USER",
        schoolId: ""
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingUser(null)
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "USER",
      schoolId: ""
    })
  }

  const handleSaveUser = async () => {
    if (!formData.name || !formData.email || (!editingUser && !formData.password)) {
      toast.error("Mohon lengkapi semua field yang diperlukan")
      return
    }

    setIsSaving(true)
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users"
      const method = editingUser ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(editingUser ? "Pengguna berhasil diperbarui" : "Pengguna berhasil ditambahkan")
        handleCloseDialog()
        fetchUsers()
      } else {
        toast.error(data.error || "Gagal menyimpan pengguna")
      }
    } catch (error) {
      toast.error("Gagal menyimpan pengguna")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pengguna "${userName}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE"
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Pengguna berhasil dihapus")
        fetchUsers()
      } else {
        toast.error(data.error || "Gagal menghapus pengguna")
      }
    } catch (error) {
      toast.error("Gagal menghapus pengguna")
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Pengguna</h1>
            <p className="text-gray-500 mt-1">Kelola akun pengguna sistem</p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 shadow-md"
            onClick={() => handleOpenDialog()}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Tambah Pengguna
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Daftar Pengguna</CardTitle>
                <CardDescription>Total {users.length} pengguna terdaftar</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari pengguna..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Tanggal Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Tidak ada pengguna ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <RoleBadge role={user.role} size="sm" />
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenDialog(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {user.role !== "SUPER_ADMIN" && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteUser(user.id, user.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Dialog for Add/Edit User */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingUser 
                ? "Perbarui informasi pengguna" 
                : "Isi form di bawah untuk menambahkan pengguna baru"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama lengkap"
                disabled={editingUser?.role === "SUPER_ADMIN"}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="nama@example.com"
                disabled={editingUser?.role === "SUPER_ADMIN"}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">
                Password {editingUser && "(Kosongkan jika tidak ingin mengubah)"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Masukkan password"
              />
            </div>
            {editingUser?.role !== "SUPER_ADMIN" && (
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {session?.user.role === "SUPER_ADMIN" && (
                      <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    )}
                    <SelectItem value="TREASURER">Bendahara</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {session?.user.role === "SUPER_ADMIN" && formData.role !== "SUPER_ADMIN" && (
              <div className="grid gap-2">
                <Label htmlFor="schoolId">Sekolah</Label>
                <Select
                  value={formData.schoolId}
                  onValueChange={(value) => setFormData({ ...formData, schoolId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih sekolah" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={isSaving}>
              Batal
            </Button>
            <Button onClick={handleSaveUser} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                editingUser ? "Perbarui" : "Tambah"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
