"use client"

import Link from "next/link"
import Image from "next/image"
import { 
  GraduationCap, 
  FileText, 
  Upload, 
  FileSpreadsheet,
  Clock,
  Wallet,
  Tags,
  ImageIcon,
  BarChart3,
  Printer,
  Mail,
  MapPin,
  Quote
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-blue-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-12 h-12 rounded-xl shadow-lg group-hover:shadow-blue-200 group-hover:scale-105 transition-all duration-300 overflow-hidden">
              <Image
                src="/image/icon_tampilan-sekolah1.png"
                alt="SakuSekolah Icon"
                fill
                className="object-contain p-1"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              SakuSekolah
            </span>
          </div>
          <Button
            asChild
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl px-6 shadow-lg hover:shadow-blue-200 hover:scale-105 transition-all duration-300"
          >
            <Link href="/auth/signin">Masuk</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/30 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column */}
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full text-sm font-medium text-blue-700 mb-4">
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  Sistem Keuangan Sekolah Modern
                </div>
                <h1 className="text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent leading-tight">
                  Kelola Pemasukan, Pengeluaran, Laporan, dan Kwitansi Sekolah
                  dalam Satu Aplikasi.
                </h1>
                <p className="text-xl lg:text-2xl text-gray-600 font-light">
                  Ringkas, rapi, mudah diaudit.
                </p>
              </div>

              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl px-10 py-7 text-lg shadow-2xl shadow-blue-200 hover:shadow-blue-300 hover:scale-105 transition-all duration-300"
              >
                <Link href="/auth/signin" className="flex items-center gap-2">
                  Mulai Sekarang
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </Button>

              {/* Feature Badges */}
              <div className="flex flex-wrap gap-3 pt-4">
                <div className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full text-sm font-medium text-gray-700 border-2 border-blue-100 shadow-md hover:shadow-lg hover:border-blue-200 hover:scale-105 transition-all duration-300">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Kwitansi Otomatis
                </div>
                <div className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full text-sm font-medium text-gray-700 border-2 border-blue-100 shadow-md hover:shadow-lg hover:border-blue-200 hover:scale-105 transition-all duration-300">
                  <Upload className="h-4 w-4 text-blue-600" />
                  Upload Bukti
                </div>
                <div className="flex items-center gap-2 px-5 py-2.5 bg-white rounded-full text-sm font-medium text-gray-700 border-2 border-blue-100 shadow-md hover:shadow-lg hover:border-blue-200 hover:scale-105 transition-all duration-300">
                  <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                  Export PDF/Excel
                </div>
              </div>
            </div>

            {/* Right Column - School Image */}
            <div className="relative lg:block hidden">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20 animate-pulse" />
              <Card className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white relative hover:scale-[1.02] transition-transform duration-500">
                <div className="relative aspect-[4/3] bg-gradient-to-br from-blue-100 to-purple-50">
                  <Image
                    src="/Unismuh.jpg"
                    alt="Gedung Sekolah"
                    fill
                    className="object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-blue-500/10 to-transparent" />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section className="py-20 bg-gradient-to-b from-white via-gray-50 to-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-4">
              Fitur Utama
            </h2>
            <p className="text-gray-600 text-lg">
              Kelola keuangan sekolah dengan mudah dan cepat
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Input Pemasukan */}
            <Card className="group rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border-2 border-blue-100 hover:border-blue-300 hover:-translate-y-2 transition-all duration-300">
              <div className="bg-gradient-to-br from-blue-50 to-white p-8">
                <div className="bg-white rounded-2xl p-6 mb-6 aspect-video flex items-center justify-center shadow-md group-hover:shadow-xl transition-shadow">
                  <div className="w-full space-y-3">
                    <div className="text-xs font-bold text-blue-600 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      Input Pemasukan
                    </div>
                    <div className="h-3 bg-gradient-to-r from-blue-200 to-blue-100 rounded-full w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gradient-to-r from-blue-200 to-blue-100 rounded-full w-1/2"></div>
                    <div className="h-10 bg-gradient-to-r from-blue-100 to-blue-50 rounded-xl w-full mt-4 border-2 border-blue-200"></div>
                    <div className="h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl w-1/3 mt-2 shadow-lg"></div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center group-hover:text-blue-700 transition-colors">
                  Input Pemasukan
                </h3>
              </div>
            </Card>

            {/* Input Pengeluaran */}
            <Card className="group rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border-2 border-rose-100 hover:border-rose-300 hover:-translate-y-2 transition-all duration-300">
              <div className="bg-gradient-to-br from-rose-50 to-white p-8">
                <div className="bg-white rounded-2xl p-6 mb-6 aspect-video flex items-center justify-center shadow-md group-hover:shadow-xl transition-shadow">
                  <div className="w-full space-y-3">
                    <div className="text-xs font-bold text-rose-600 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-rose-600 rounded-full" />
                      Input Pengeluaran
                    </div>
                    <div className="h-3 bg-gradient-to-r from-rose-200 to-rose-100 rounded-full w-2/3 animate-pulse"></div>
                    <div className="h-3 bg-gradient-to-r from-rose-200 to-rose-100 rounded-full w-1/2"></div>
                    <div className="h-10 bg-gradient-to-r from-rose-100 to-rose-50 rounded-xl w-full mt-4 border-2 border-rose-200"></div>
                    <div className="h-10 bg-gradient-to-r from-rose-500 to-rose-600 rounded-xl w-1/3 mt-2 shadow-lg"></div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center group-hover:text-rose-700 transition-colors">
                  Input Pengeluaran
                </h3>
              </div>
            </Card>

            {/* Cetak Kwitansi */}
            <Card className="group rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border-2 border-emerald-100 hover:border-emerald-300 hover:-translate-y-2 transition-all duration-300">
              <div className="bg-gradient-to-br from-emerald-50 to-white p-8">
                <div className="bg-white rounded-2xl p-6 mb-6 aspect-video flex items-center justify-center shadow-md group-hover:shadow-xl transition-shadow">
                  <div className="w-full">
                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 shadow-md border-2 border-emerald-200">
                      <div className="text-center mb-3">
                        <div className="text-xs font-bold text-emerald-700">
                          SekolahKu
                        </div>
                        <div className="text-[10px] text-emerald-600 font-semibold">
                          KWITANSI
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-2 bg-gradient-to-r from-emerald-200 to-emerald-100 rounded-full w-full"></div>
                        <div className="h-2 bg-gradient-to-r from-emerald-200 to-emerald-100 rounded-full w-3/4"></div>
                        <div className="h-2 bg-gradient-to-r from-emerald-200 to-emerald-100 rounded-full w-1/2"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center group-hover:text-emerald-700 transition-colors">
                  Cetak Kwitansi
                </h3>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-blue-600 mb-2">
              FEATURES SECTION
            </p>
            <h2 className="text-3xl font-bold text-gray-900">
              Semua yang Anda Butuhkan
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="group p-8 rounded-2xl border-2 border-blue-100 bg-white hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-100 hover:-translate-y-2 transition-all duration-300">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl w-fit mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <Clock className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Pencatatan Cepat
              </h3>
              <p className="text-gray-600">
                Catat transaksi harian dalam hitungan detik.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="group p-8 rounded-2xl border-2 border-purple-100 bg-white hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-100 hover:-translate-y-2 transition-all duration-300">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl w-fit mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <Wallet className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Saldo Real-time
              </h3>
              <p className="text-gray-600">
                Pantau arus kas dan posisi keuangan sekolah kapan saja.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="group p-8 rounded-2xl border-2 border-indigo-100 bg-white hover:border-indigo-300 hover:shadow-2xl hover:shadow-indigo-100 hover:-translate-y-2 transition-all duration-300">
              <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl w-fit mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <Tags className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Kategori & Metode Pembayaran
              </h3>
              <p className="text-gray-600">
                Organisir pemasukan dan pengeluaran dengan mudah.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="group p-8 rounded-2xl border-2 border-cyan-100 bg-white hover:border-cyan-300 hover:shadow-2xl hover:shadow-cyan-100 hover:-translate-y-2 transition-all duration-300">
              <div className="p-4 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl w-fit mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <ImageIcon className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Upload Bukti
              </h3>
              <p className="text-gray-600">
                Lampirkan foto atau file bukti transaksi untuk audit.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="group p-8 rounded-2xl border-2 border-emerald-100 bg-white hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-100 hover:-translate-y-2 transition-all duration-300">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl w-fit mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <BarChart3 className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Laporan Otomatis
              </h3>
              <p className="text-gray-600">
                Hasilkan laporan keuangan lengkap dan unduh.
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className="group p-8 rounded-2xl border-2 border-rose-100 bg-white hover:border-rose-300 hover:shadow-2xl hover:shadow-rose-100 hover:-translate-y-2 transition-all duration-300">
              <div className="p-4 bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl w-fit mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <Printer className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Kwitansi Siap Cetak
              </h3>
              <p className="text-gray-600">
                Terbitkan dan cetak kwitansi profesional secara instan.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-b from-white via-blue-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-blue-600 mb-3 tracking-wider uppercase">
              HOW IT WORKS
            </p>
            <h2 className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent mb-4">
              Cara Kerja SakuSekolah
            </h2>
            <p className="text-gray-600 text-lg">
              Tiga langkah mudah untuk memulai
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-20 left-[16.66%] right-[16.66%] h-1 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200" />

            {/* Step 1 */}
            <div className="text-center relative">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-3xl font-bold mb-6 shadow-2xl shadow-blue-300 hover:scale-110 transition-transform duration-300 relative z-10">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Daftar & Atur Akun
              </h3>
              <p className="text-gray-600 text-lg">
                Buat akun sekolah dan sesuaikan kategori keuangan kode.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center relative">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-white text-3xl font-bold mb-6 shadow-2xl shadow-purple-300 hover:scale-110 transition-transform duration-300 relative z-10">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Input Transaksi
              </h3>
              <p className="text-gray-600 text-lg">
                Catat pemasukan dan pengeluaran secara berkala dan upload bukti.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center relative">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-3xl font-bold mb-6 shadow-2xl shadow-emerald-300 hover:scale-110 transition-transform duration-300 relative z-10">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Pantau & Lapor
              </h3>
              <p className="text-gray-600 text-lg">
                Lihat saldo real-time, hasilkan laporan, dan cetak kwitansi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-blue-600 mb-2">
              TESTIMONIALS
            </p>
            <h2 className="text-3xl font-bold text-gray-900">Testimonials</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Testimonial 1 */}
            <Card className="group p-10 rounded-3xl border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50/50 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-100 hover:-translate-y-2 transition-all duration-300">
              <Quote className="h-10 w-10 text-blue-300 mb-6 group-hover:scale-110 group-hover:text-blue-500 transition-all duration-300" />
              <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                "SakuSekolah sangat membantu kami dalam mengelola keuangan
                sekolah dengan lebih transparan dan rapi."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">SA</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">Spk. Ahmad</p>
                  <p className="text-sm text-blue-600 font-medium">
                    Kepala Sekolah
                  </p>
                </div>
              </div>
            </Card>

            {/* Testimonial 2 */}
            <Card className="group p-10 rounded-3xl border-2 border-purple-100 bg-gradient-to-br from-white to-purple-50/50 hover:border-purple-300 hover:shadow-2xl hover:shadow-purple-100 hover:-translate-y-2 transition-all duration-300">
              <Quote className="h-10 w-10 text-purple-300 mb-6 group-hover:scale-110 group-hover:text-purple-500 transition-all duration-300" />
              <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                "Fitur laporan otomatis dan cetak kwitansi sangat menghemat
                waktu staf administrasi kami. Sangat direkomendasikan."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">IS</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg">Ibu Siti</p>
                  <p className="text-sm text-purple-600 font-medium">
                    Bendahara
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 opacity-5" />
        <div className="max-w-5xl mx-auto px-6 relative">
          <Card className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-[2rem] p-16 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="relative">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4">
                Siap rapikan keuangan sekolah?
              </h2>
              <p className="text-blue-100 text-lg mb-8">
                Bergabung dengan sekolah-sekolah yang telah mempercayai kami
              </p>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="bg-white text-blue-700 hover:bg-blue-50 rounded-xl px-10 py-7 text-xl font-bold shadow-2xl hover:scale-110 transition-all duration-300"
              >
                <Link href="/auth/signin" className="flex items-center gap-2">
                  Masuk Sekarang
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-50 to-white border-t border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6 group cursor-pointer">
                <div className="relative w-12 h-12 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                  <Image
                    src="/image/icon_tampilan-sekolah1.png"
                    alt="SakuSekolah Icon"
                    fill
                    className="object-contain p-1"
                  />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                  SakuSekolah
                </span>
              </div>
              <div className="space-y-3 text-gray-600">
                <div className="flex items-center gap-3 hover:text-blue-600 transition-colors duration-300">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Mail className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium">kontak@sakusekolah.id</span>
                </div>
                <div className="flex items-center gap-3 hover:text-blue-600 transition-colors duration-300">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPin className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium">
                    Jl. Sultan Alauddin No.259, Gn. Sari, Kec. Rappocini, Kota
                    Makassar, Sulawesi Selatan
                  </span>
                </div>
              </div>
            </div>
            <div className="md:text-right">
              <h4 className="font-bold text-gray-900 mb-4 text-lg">
                Link Cepat
              </h4>
              <div className="space-y-3 text-gray-600 font-medium">
                <Link
                  href="#"
                  className="block hover:text-blue-600 hover:translate-x-2 md:hover:-translate-x-2 transition-all duration-300"
                >
                  Kebijakan Privasi
                </Link>
                <Link
                  href="#"
                  className="block hover:text-blue-600 hover:translate-x-2 md:hover:-translate-x-2 transition-all duration-300"
                >
                  Syarat & Ketentuan
                </Link>
                <Link
                  href="#"
                  className="block hover:text-blue-600 hover:translate-x-2 md:hover:-translate-x-2 transition-all duration-300"
                >
                  Hubungi Kami
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-12 pt-8 text-center">
            <p className="text-gray-500 font-medium">
              © 2024 SakuSekolah. Hak Cipta Dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
