import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SiKeu Sekolah - Sistem Keuangan Sekolah",
  description: "Aplikasi manajemen keuangan sekolah yang komprehensif dengan fitur transaksi, kwitansi, dan laporan otomatis.",
  keywords: "sistem keuangan sekolah, manajemen keuangan, kwitansi digital, laporan keuangan",
  authors: [{ name: "SiKeu Sekolah Team" }],
  openGraph: {
    title: "SiKeu Sekolah - Sistem Keuangan Sekolah",
    description: "Kelola keuangan sekolah dengan mudah dan akurat",
    type: "website",
  },
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
