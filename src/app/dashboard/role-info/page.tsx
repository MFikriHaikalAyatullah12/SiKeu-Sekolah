"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RoleBadge, getRoleDescription } from "@/components/ui/role-badge"
import { Shield, Check, X } from "lucide-react"

const rolePermissions = {
  SUPER_ADMIN: [
    { feature: "Mengelola semua sekolah", allowed: true },
    { feature: "Mengubah nama dan data sekolah", allowed: true },
    { feature: "Mengelola transaksi", allowed: true },
    { feature: "Melihat laporan", allowed: true },
    { feature: "Mengelola pengguna", allowed: true },
    { feature: "Akses pengaturan global", allowed: true },
  ],
  ADMIN: [
    { feature: "Mengelola semua sekolah", allowed: false },
    { feature: "Mengubah nama dan data sekolah", allowed: false },
    { feature: "Mengelola transaksi", allowed: true },
    { feature: "Melihat laporan", allowed: true },
    { feature: "Mengelola pengguna", allowed: true },
    { feature: "Akses pengaturan sekolah", allowed: true },
  ],
  TREASURER: [
    { feature: "Mengelola semua sekolah", allowed: false },
    { feature: "Mengubah nama dan data sekolah", allowed: false },
    { feature: "Mengelola transaksi", allowed: true },
    { feature: "Melihat laporan", allowed: false },
    { feature: "Mengelola pengguna", allowed: false },
    { feature: "Cetak kwitansi", allowed: true },
  ],
  USER: [
    { feature: "Mengelola semua sekolah", allowed: false },
    { feature: "Mengubah nama dan data sekolah", allowed: false },
    { feature: "Mengelola transaksi", allowed: false },
    { feature: "Melihat laporan", allowed: false },
    { feature: "Mengelola pengguna", allowed: false },
    { feature: "Melihat dashboard", allowed: true },
  ],
}

export default function RoleInfoPage() {
  const { data: session } = useSession()
  const router = useRouter()

  if (!session?.user) {
    router.push("/auth/signin")
    return null
  }

  const userRole = session.user.role as keyof typeof rolePermissions
  const permissions = rolePermissions[userRole] || []

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Informasi Role & Permission
        </h1>
        <p className="text-gray-600">
          Lihat wewenang dan akses yang Anda miliki dalam sistem
        </p>
      </div>

      <div className="space-y-6">
        {/* Current User Role */}
        <Card className="border-2 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-blue-600" />
              Role Anda Saat Ini
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <RoleBadge role={userRole} size="lg" />
              <div>
                <p className="text-sm text-gray-600">
                  {getRoleDescription(userRole)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Wewenang & Akses</CardTitle>
            <CardDescription>
              Daftar fitur yang dapat Anda akses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {permissions.map((permission, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50"
                >
                  {permission.allowed ? (
                    <div className="p-2 bg-green-100 rounded-full">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                  ) : (
                    <div className="p-2 bg-red-100 rounded-full">
                      <X className="h-4 w-4 text-red-600" />
                    </div>
                  )}
                  <span
                    className={
                      permission.allowed
                        ? "text-gray-900 font-medium"
                        : "text-gray-500"
                    }
                  >
                    {permission.feature}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* All Roles Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Perbandingan Semua Role</CardTitle>
            <CardDescription>
              Memahami perbedaan wewenang antar role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(rolePermissions).map(([role, perms]) => (
                <div key={role} className="border-b pb-4 last:border-b-0">
                  <div className="mb-3">
                    <RoleBadge role={role} size="md" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {perms.map((perm, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm"
                      >
                        {perm.allowed ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <X className="h-3 w-3 text-red-600" />
                        )}
                        <span className={perm.allowed ? "text-gray-700" : "text-gray-400"}>
                          {perm.feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        {userRole !== "SUPER_ADMIN" && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6">
              <p className="text-sm text-yellow-800">
                <strong>Butuh akses lebih?</strong> Hubungi administrator
                sekolah Anda atau Super Admin untuk upgrade role.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
