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
