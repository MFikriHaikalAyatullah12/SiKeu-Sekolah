"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useSchool } from "@/contexts/school-context"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, User, Bell, Shield, Building2, Save, Loader2, Upload, X, Camera } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const { school, isLoading: schoolLoading, updateSchool, refetch } = useSchool()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "",
    email: ""
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [schoolData, setSchoolData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    logoUrl: ""
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>("")

  // Role-based access control
  const userRole = session?.user?.role
  const isTreasurer = userRole === 'TREASURER'
  const isSuperAdmin = userRole === 'SUPER_ADMIN'
  const canEdit = isSuperAdmin

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchProfile()
  }, [session, status, router])

  // Load school data when available
  useEffect(() => {
    if (school) {
      setSchoolData({
        name: school.name || "",
        address: school.address || "",
        phone: school.phone || "",
        email: school.email || "",
        logoUrl: school.logoUrl || ""
      })
      setLogoPreview(school.logoUrl || "")
    }
  }, [school])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile")
      const data = await response.json()
      
      if (response.ok) {
        setProfileData({
          name: data.user.name,
          email: data.user.email
        })
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    }
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(profileData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Profil berhasil diperbarui")
      } else {
        toast.error(data.error || "Gagal memperbarui profil")
      }
    } catch (error) {
      toast.error("Gagal memperbarui profil")
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Password baru tidak cocok")
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password minimal 6 karakter")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Password berhasil diubah")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })
      } else {
        toast.error(data.error || "Gagal mengubah password")
      }
    } catch (error) {
      toast.error("Gagal mengubah password")
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validasi file
      if (!file.type.startsWith('image/')) {
        toast.error("File harus berupa gambar")
        return
      }
      
      if (file.size > 2 * 1024 * 1024) { // 2MB
        toast.error("Ukuran file maksimal 2MB")
        return
      }

      setLogoFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview("")
    setSchoolData({ ...schoolData, logoUrl: "" })
  }

  const handleSaveSchool = async () => {
    if (!schoolData.name || !schoolData.address || !schoolData.phone || !schoolData.email) {
      toast.error("Semua field sekolah harus diisi")
      return
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(schoolData.email)) {
      toast.error("Format email sekolah tidak valid")
      return
    }

    setLoading(true)
    try {
      let finalLogoUrl = schoolData.logoUrl

      // Upload logo if there's a new file (placeholder for now)
      if (logoFile) {
        // For now, we'll just use the preview URL
        // In production, implement proper file upload
        finalLogoUrl = logoPreview
      }

      const success = await updateSchool({
        ...schoolData,
        logoUrl: finalLogoUrl
      })

      if (success) {
        toast.success("Data sekolah berhasil diperbarui")
        setLogoFile(null)
        await refetch()
      }
    } catch (error) {
      console.error("Update school error:", error)
      toast.error("Terjadi kesalahan saat menyimpan data sekolah")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-4 sm:space-y-6 max-w-4xl">
        <div className="px-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Pengaturan</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Kelola preferensi dan pengaturan akun Anda</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
            <TabsTrigger value="profile" className="text-xs sm:text-sm py-2 sm:py-3 px-2">
              <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Profil</span>
              <span className="sm:hidden">👤</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm py-2 sm:py-3 px-2">
              <Bell className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Notifikasi</span>
              <span className="sm:hidden">🔔</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs sm:text-sm py-2 sm:py-3 px-2">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Keamanan</span>
              <span className="sm:hidden">🔒</span>
            </TabsTrigger>
            <TabsTrigger value="school" className="text-xs sm:text-sm py-2 sm:py-3 px-2">
              <Building2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Sekolah</span>
              <span className="sm:hidden">🏫</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg sm:text-xl">Informasi Profil</CardTitle>
                    <CardDescription className="text-sm">
                      {canEdit ? "Update informasi profil pribadi Anda" : "Lihat informasi profil pribadi Anda"}
                    </CardDescription>
                  </div>
                  {isTreasurer && (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm">
                      👁️ Hanya Baca
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4 px-4 sm:px-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm sm:text-base">Nama Lengkap</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Masukkan nama lengkap"
                    disabled={!canEdit}
                    className={`text-sm sm:text-base ${!canEdit ? "bg-gray-50 cursor-not-allowed" : ""}`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="email@example.com"
                    disabled={!canEdit}
                    className={!canEdit ? "bg-gray-50 cursor-not-allowed" : ""}
                  />
                </div>
                {canEdit && (
                  <Button onClick={handleSaveProfile} disabled={loading}>
                    {loading ? (
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
                )}
                {!canEdit && (
                  <div className="text-sm text-gray-500 italic">
                    ℹ️ Hanya Super Admin yang dapat mengubah informasi profil
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Ubah Password</CardTitle>
                    <CardDescription>
                      {canEdit ? "Perbarui password akun Anda untuk keamanan" : "Lihat pengaturan keamanan akun Anda"}
                    </CardDescription>
                  </div>
                  {isTreasurer && (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-lg text-sm">
                      👁️ Hanya Baca
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Password Saat Ini</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Masukkan password saat ini"
                    disabled={!canEdit}
                    className={!canEdit ? "bg-gray-50 cursor-not-allowed" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Password Baru</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Masukkan password baru"
                    disabled={!canEdit}
                    className={!canEdit ? "bg-gray-50 cursor-not-allowed" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Konfirmasi password baru"
                    disabled={!canEdit}
                    className={!canEdit ? "bg-gray-50 cursor-not-allowed" : ""}
                  />
                </div>
                {canEdit && (
                  <Button onClick={handleChangePassword} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mengubah...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-4 w-4" />
                        Ubah Password
                      </>
                    )}
                  </Button>
                )}
                {!canEdit && (
                  <div className="text-sm text-gray-500 italic">
                    ℹ️ Hanya Super Admin yang dapat mengubah password
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Preferensi Notifikasi</CardTitle>
                    <CardDescription>
                      {canEdit ? "Pilih jenis notifikasi yang ingin Anda terima" : "Lihat pengaturan notifikasi Anda"}
                    </CardDescription>
                  </div>
                  {isTreasurer && (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-lg text-sm">
                      👁️ Hanya Baca
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifikasi</Label>
                    <p className="text-sm text-gray-500">
                      Terima notifikasi melalui email
                    </p>
                  </div>
                  <Switch defaultChecked disabled={!canEdit} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Transaksi Baru</Label>
                    <p className="text-sm text-gray-500">
                      Notifikasi saat ada transaksi baru
                    </p>
                  </div>
                  <Switch defaultChecked disabled={!canEdit} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Laporan Mingguan</Label>
                    <p className="text-sm text-gray-500">
                      Terima ringkasan laporan setiap minggu
                    </p>
                  </div>
                  <Switch disabled={!canEdit} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Reminder Pembayaran</Label>
                    <p className="text-sm text-gray-500">
                      Pengingat untuk pembayaran yang tertunda
                    </p>
                  </div>
                  <Switch defaultChecked disabled={!canEdit} />
                </div>
                {!canEdit && (
                  <div className="text-sm text-gray-500 italic mt-4 p-3 bg-gray-50 rounded-lg">
                    ℹ️ Hanya Super Admin yang dapat mengubah pengaturan notifikasi
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* School Tab */}
          <TabsContent value="school" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Informasi Sekolah</CardTitle>
                    <CardDescription>
                      {["ADMIN", "SUPER_ADMIN"].includes(session?.user?.role || "") 
                        ? "Kelola identitas dan informasi sekolah Anda"
                        : "Informasi sekolah - hanya dapat diubah oleh Admin"}
                    </CardDescription>
                  </div>
                  {isTreasurer && (
                    <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-lg text-sm">
                      👁️ Hanya Baca
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Logo Upload */}
                {["ADMIN", "SUPER_ADMIN"].includes(session?.user?.role || "") && (
                  <div className="space-y-3">
                    <Label>Logo Sekolah</Label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {logoPreview ? (
                          <div className="relative w-16 h-16 rounded-lg border-2 border-gray-200 overflow-hidden">
                            <img 
                              src={logoPreview} 
                              alt="Logo Preview" 
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={removeLogo}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                            <Camera className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          id="school-logo-upload"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById('school-logo-upload')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {logoPreview ? "Ganti" : "Upload"}
                        </Button>
                        <p className="text-xs text-gray-500 mt-1">
                          JPG, PNG. Max 2MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="school-name">Nama Sekolah</Label>
                  <Input
                    id="school-name"
                    value={schoolData.name}
                    onChange={(e) => setSchoolData({ ...schoolData, name: e.target.value })}
                    placeholder={schoolLoading ? "Memuat..." : "Nama sekolah"}
                    disabled={!["ADMIN", "SUPER_ADMIN"].includes(session?.user?.role || "") || schoolLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school-address">Alamat Sekolah</Label>
                  <Textarea
                    id="school-address"
                    value={schoolData.address}
                    onChange={(e) => setSchoolData({ ...schoolData, address: e.target.value })}
                    placeholder={schoolLoading ? "Memuat..." : "Alamat lengkap sekolah"}
                    disabled={!["ADMIN", "SUPER_ADMIN"].includes(session?.user?.role || "") || schoolLoading}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="school-phone">Telepon Sekolah</Label>
                    <Input
                      id="school-phone"
                      value={schoolData.phone}
                      onChange={(e) => setSchoolData({ ...schoolData, phone: e.target.value })}
                      placeholder={schoolLoading ? "Memuat..." : "(021) 12345678"}
                      disabled={!["ADMIN", "SUPER_ADMIN"].includes(session?.user?.role || "") || schoolLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="school-email">Email Sekolah</Label>
                    <Input
                      id="school-email"
                      type="email"
                      value={schoolData.email}
                      onChange={(e) => setSchoolData({ ...schoolData, email: e.target.value })}
                      placeholder={schoolLoading ? "Memuat..." : "email@sekolah.sch.id"}
                      disabled={!["ADMIN", "SUPER_ADMIN"].includes(session?.user?.role || "") || schoolLoading}
                    />
                  </div>
                </div>
                
                {["ADMIN", "SUPER_ADMIN"].includes(session?.user?.role || "") && (
                  <div className="flex justify-end pt-4 border-t">
                    <Button 
                      onClick={handleSaveSchool} 
                      disabled={loading || schoolLoading}
                    >
                      {loading ? (
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
                  </div>
                )}

                {isTreasurer && (
                  <div className="text-sm text-gray-500 italic pt-4 border-t p-3 bg-gray-50 rounded-lg">
                    ℹ️ Hanya Super Admin dan Admin yang dapat mengubah informasi sekolah
                  </div>
                )}

                {session?.user?.role === "SUPER_ADMIN" && (
                  <div className="flex justify-center pt-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/dashboard/school-settings")}
                    >
                      <Building2 className="mr-2 h-4 w-4" />
                      Buka Pengaturan Lanjutan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
