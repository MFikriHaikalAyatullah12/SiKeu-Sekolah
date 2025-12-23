import { getServerSession } from "next-auth"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"
import Image from "next/image"
import HeroImage from "@/image/Unismuh.jpg"
import AppIcon from "@/image/icon_tampilan-sekolah1.png"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (session) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold">Anda sudah masuk</h1>
          <p className="text-muted-foreground">Lanjutkan ke dashboard untuk mengelola keuangan.</p>
          <Button asChild size="lg">
            <Link href="/dashboard">Buka Dashboard</Link>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-dvh relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/40 flex flex-col">
      {/* Decorative blobs */}
      <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 size-[420px] rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -right-24 size-[520px] rounded-full bg-secondary/40 blur-3xl" />
      {/* Header */}
      <header className="container mx-auto px-4 flex items-center justify-between py-6 relative">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-md border bg-background overflow-hidden shadow-xs">
            <Image
              src={AppIcon}
              alt="Ikon SakuSekolah"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
          </span>
          <span className="text-lg font-bold">SakuSekolah</span>
        </Link>

        <div className="flex items-center gap-3 rounded-full border bg-background/60 p-1 backdrop-blur supports-[backdrop-filter]:bg-background/100">
          <Button
            asChild
            variant="outline"
            className="rounded-full border-0 px-5 py-2 shadow-xs transition-all duration-200 ease-out hover:bg-primary hover:text-primary-foreground hover:shadow-sm motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 active:shadow-xs"
          >
            <Link href="/auth/signin">Masuk</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 relative flex-1">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-10 md:py-16">
          <div className="space-y-7 max-w-2xl">
            <Badge variant="secondary" className="px-4 py-1.5 text-sm shadow-xs">
              Ringkas • Rapi • Mudah Diaudit
            </Badge>

            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.08]">
              Kelola Pemasukan, Pengeluaran, Laporan, dan{" "}
              <span className="text-primary">Kwitansi Sekolah</span> dalam Satu Aplikasi.
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Catat transaksi harian, simpan bukti, dan unduh kwitansi dalam format yang rapi.
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/auth/signin">Masuk Sekarang</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <FeatureChip label="Kwitansi Otomatis" />
              <FeatureChip label="Upload Bukti" />
              <FeatureChip label="Export PDF/Excel" />
            </div>
          </div>

          {/* Visual hero image */}
          <div className="rounded-3xl border bg-card shadow-sm overflow-hidden ring-1 ring-border/50">
            <div className="relative aspect-[16/10] w-full">
              <Image
                src={HeroImage}
                alt="Gedung kampus/sekolah sebagai ilustrasi aplikasi keuangan sekolah"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              {/* Light gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/35 via-background/10 to-transparent" />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground mt-auto">
        © {new Date().getFullYear()} SakuSekolah • Semua hak cipta.
      </footer>
    </div>
  )
}

function FeatureChip({ label }: { label: string }) {
  return (
    <Badge
      variant="outline"
      className="gap-2 px-4 py-2 text-sm bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <CheckCircle2 className="size-4 text-primary" />
      {label}
    </Badge>
  )
}
