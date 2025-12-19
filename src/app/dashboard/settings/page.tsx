"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, User, Bell, Shield, Building2, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const { data: session, status } = useSession()
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

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchProfile()
  }, [session, status, router])

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

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pengaturan</h1>
          <p className="text-gray-500 mt-1">Kelola preferensi dan pengaturan akun Anda</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifikasi
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-2" />
              Keamanan
            </TabsTrigger>
            <TabsTrigger value="school">
              <Building2 className="h-4 w-4 mr-2" />
              Sekolah
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Profil</CardTitle>
                <CardDescription>
                  Update informasi profil pribadi Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Masukkan nama lengkap"
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
                  />
                </div>
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Ubah Password</CardTitle>
                <CardDescription>
                  Perbarui password akun Anda untuk keamanan
                </CardDescription>
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
                  />
                </div>
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Preferensi Notifikasi</CardTitle>
                <CardDescription>
                  Pilih jenis notifikasi yang ingin Anda terima
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifikasi</Label>
                    <p className="text-sm text-gray-500">
                      Terima notifikasi melalui email
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Transaksi Baru</Label>
                    <p className="text-sm text-gray-500">
                      Notifikasi saat ada transaksi baru
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Laporan Mingguan</Label>
                    <p className="text-sm text-gray-500">
                      Terima ringkasan laporan setiap minggu
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Reminder Pembayaran</Label>
                    <p className="text-sm text-gray-500">
                      Pengingat untuk pembayaran yang tertunda
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* School Tab */}
          <TabsContent value="school" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Sekolah</CardTitle>
                <CardDescription>
                  {session?.user?.role === "SUPER_ADMIN" 
                    ? "Informasi ini hanya bisa diubah melalui halaman Pengaturan Sekolah"
                    : "Informasi ini hanya bisa diubah oleh Super Admin"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="school-name">Nama Sekolah</Label>
                  <Input
                    id="school-name"
                    defaultValue="Sekolah Menengah Atas Negeri 1"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school-address">Alamat Sekolah</Label>
                  <Textarea
                    id="school-address"
                    defaultValue="Jl. Pendidikan No. 123, Jakarta"
                    disabled
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school-phone">Telepon Sekolah</Label>
                  <Input
                    id="school-phone"
                    defaultValue="(021) 12345678"
                    disabled
                  />
                </div>
                {session?.user?.role === "SUPER_ADMIN" && (
                  <div className="flex justify-end">
                    <Button 
                      variant="outline"
                      onClick={() => router.push("/dashboard/school-settings")}
                    >
                      <Building2 className="mr-2 h-4 w-4" />
                      Buka Pengaturan Sekolah
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
