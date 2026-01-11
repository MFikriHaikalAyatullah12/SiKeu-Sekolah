import { Metadata } from 'next'
import ImportExcel from '@/components/dashboard/import-excel'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export const metadata: Metadata = {
  title: 'Import Excel - SiKeu Sekolah',
  description: 'Import transaksi dari file Excel secara massal',
}

export default function ImportPage() {
  return (
    <DashboardLayout>
      <div className="w-full overflow-x-hidden">
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Import Transaksi</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm md:text-base">
            Import data transaksi dari file Excel untuk memproses banyak transaksi sekaligus
          </p>
        </div>
        
        <ImportExcel />
      </div>
    </DashboardLayout>
  )
}
