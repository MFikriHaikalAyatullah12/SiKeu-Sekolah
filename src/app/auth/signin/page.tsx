"use client"

import { useEffect, useState } from "react"
import { signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, BarChart3, Eye, EyeOff, Receipt, ShieldCheck } from "lucide-react"

import schoolBuildingImage from "@/image/Unismuh.jpg"
import appLogoImage from "@/image/icon_tampilan-sekolah1.png"

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    // SECURITY: Hapus session lama untuk memaksa login ulang
    signOut({ redirect: false })
    
    // Hapus semua data session dari storage
    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch (error) {
      console.log("Unable to clear storage:", error)
    }

    // Load remember me data
    try {
      const savedRemember = window.localStorage.getItem("sikeu.rememberMe")
      const savedIdentifier = window.localStorage.getItem("sikeu.identifier")

      if (savedRemember === "true") {
        setRememberMe(true)
        if (savedIdentifier) {
          setFormData((prev) => ({ ...prev, email: savedIdentifier }))
        }
      }
    } catch {
      // ignore (private mode / disabled storage)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Email atau password salah")
      } else {
        try {
          if (rememberMe) {
            window.localStorage.setItem("sikeu.rememberMe", "true")
            window.localStorage.setItem("sikeu.identifier", formData.email)
          } else {
            window.localStorage.removeItem("sikeu.rememberMe")
            window.localStorage.removeItem("sikeu.identifier")
          }
        } catch {
          // ignore (private mode / disabled storage)
        }

        router.push("/dashboard")
      }
    } catch {
      setError("Terjadi kesalahan saat masuk")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-8">
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="hidden lg:flex overflow-hidden rounded-3xl p-0 shadow-lg min-h-[640px]">
            <div className="relative h-full w-full">
              <Image
                src={schoolBuildingImage}
                alt="Tampilan sekolah"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/80" />
              <div className="relative flex h-full flex-col p-10 text-white">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm">
                    <Image
                      src={appLogoImage}
                      alt="Icon SiKeu Sekolah"
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <div className="text-lg font-semibold">SiKeu Sekolah</div>
                </div>

                <div className="mt-10">
                  <h1 className="text-4xl font-semibold leading-tight tracking-tight">
                    Masuk untuk mengelola keuangan sekolah
                  </h1>

                  <div className="mt-8 space-y-4 text-white/90">
                    <div className="flex items-center gap-4">
                      <div className="grid size-10 place-items-center rounded-xl bg-white/10">
                        <BarChart3 className="size-5" />
                      </div>
                      <span className="text-base">Laporan otomatis</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="grid size-10 place-items-center rounded-xl bg-white/10">
                        <Receipt className="size-5" />
                      </div>
                      <span className="text-base">Kwitansi siap cetak</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="grid size-10 place-items-center rounded-xl bg-white/10">
                        <ShieldCheck className="size-5" />
                      </div>
                      <span className="text-base">Mudah diaudit</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl shadow-lg relative">
            {/* Tombol kembali ke landing page */}
            <Link 
              href="/" 
              className="absolute left-4 top-4 flex items-center gap-1 px-2 py-1 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Kembali ke halaman utama"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Kembali</span>
            </Link>

            <CardHeader className="pb-2 pt-10 text-center">
              <CardTitle className="text-3xl font-semibold tracking-tight">Masuk</CardTitle>
            </CardHeader>

            <CardContent className="pb-10">
              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email atau Username</Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="Masukkan email atau username"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    required
                    className="h-12"
                    suppressHydrationWarning={true}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Kata sandi</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan kata sandi"
                      value={formData.password}
                      onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                      required
                      className="h-12 pr-10"
                      suppressHydrationWarning={true}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                      suppressHydrationWarning={true}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      suppressHydrationWarning={true}
                    />
                    <Label htmlFor="remember" className="text-sm text-muted-foreground">
                      Ingat saya
                    </Label>
                  </div>
                  <Link href="#" className="text-sm text-primary hover:text-primary/90">
                    Lupa kata sandi?
                  </Link>
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>
                )}

                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl"
                  disabled={isLoading}
                  suppressHydrationWarning={true}
                >
                  {isLoading ? "Memproses..." : "Masuk"}
                </Button>

                <div className="pt-2 text-center text-sm text-muted-foreground">
                  Butuh bantuan? Hubungi Admin
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}