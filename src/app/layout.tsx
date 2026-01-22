import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap", // Improve font loading performance
  preload: true,
  adjustFontFallback: true, // Better font matching to reduce CLS
});

export const metadata: Metadata = {
  title: "SiKeu Sekolah - Sistem Keuangan Sekolah",
  description: "Aplikasi manajemen keuangan sekolah yang komprehensif dengan fitur transaksi, kwitansi, dan laporan otomatis.",
  keywords: "sistem keuangan sekolah, manajemen keuangan, kwitansi digital, laporan keuangan",
  authors: [{ name: "SiKeu Sekolah Team" }],
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
  },
  openGraph: {
    title: "SiKeu Sekolah - Sistem Keuangan Sekolah",
    description: "Kelola keuangan sekolah dengan mudah dan akurat",
    type: "website",
  },
};

// Separate viewport export for Next.js 14+
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster richColors position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
