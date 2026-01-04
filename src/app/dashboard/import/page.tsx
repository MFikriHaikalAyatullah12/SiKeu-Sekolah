import { Metadata } from 'next'
import ImportExcel from '@/components/dashboard/import-excel'

export const metadata: Metadata = {
  title: 'Import Excel - SiKeu Sekolah',
  description: 'Import transaksi dari file Excel secara massal',
}

export default function ImportPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Import Transaksi</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Import data transaksi dari file Excel untuk memproses banyak transaksi sekaligus
        </p>
      </div>
      
      <ImportExcel />
    </div>
  )
}
