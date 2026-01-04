'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react'
import { toast } from 'sonner'

interface ImportResult {
  total: number
  success: number
  failed: number
  errors: string[]
  transactions: Array<{
    receiptNumber: string
    type: string
    date: string
    amount: number
    description: string
    fromTo: string
    category: string
    coaAccount?: string
  }>
}

export default function ImportExcel() {
  const [file, setFile] = useState<File | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [uploadedFileSize, setUploadedFileSize] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'text/csv' // .csv
      ]
      
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
        toast.error('Format file tidak valid. Gunakan file Excel (.xlsx, .xls) atau CSV')
        return
      }
      
      setFile(selectedFile)
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Pilih file terlebih dahulu')
      return
    }

    setLoading(true)
    
    try {
      // Save file info before upload
      setUploadedFileName(file.name)
      setUploadedFileSize(file.size)
      
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/transactions/import', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengimport file')
      }

      setResult(data.results)
      
      if (data.results.success > 0) {
        toast.success(data.message)
      } else {
        toast.error('Tidak ada transaksi yang berhasil diimport')
      }

      // Refresh the page after successful import
      if (data.results.success > 0) {
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      }

    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Gagal mengimport file')
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    // Download the template from public folder
    const link = document.createElement('a')
    link.href = '/template-import-transaksi.csv'
    link.download = 'template-import-transaksi.csv'
    link.click()
    
    toast.success('Template berhasil diunduh')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Transaksi dari Excel
          </CardTitle>
          <CardDescription>
            Upload file Excel (.xlsx, .xls, atau .csv) untuk mengimport transaksi secara massal.
            Sistem akan otomatis mengelompokkan ke pemasukan/pengeluaran dan membuat kwitansi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Download Section */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Format Excel yang Diperlukan
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                  File Excel harus memiliki kolom berikut (urutan tidak harus sama):
                </p>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4 list-disc mb-3">
                  <li><strong>Tanggal</strong> - Format: DD/MM/YYYY atau DD-MM-YYYY (wajib)</li>
                  <li><strong>Keterangan</strong> - Deskripsi transaksi (wajib)</li>
                  <li><strong>Nominal</strong> - Jumlah uang (wajib)</li>
                  <li><strong>Dari/Kepada</strong> - Nama pihak terkait (opsional)</li>
                  <li><strong>Akun COA</strong> - Nama atau kode akun COA (opsional)</li>
                  <li><strong>Kategori</strong> - Nama kategori (opsional)</li>
                  <li><strong>Metode Pembayaran</strong> - CASH, BANK_TRANSFER, atau QRIS (opsional)</li>
                </ul>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={downloadTemplate}
                  className="border-blue-300 dark:border-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
              <input
                type="file"
                id="excel-upload"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="excel-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-12 w-12 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">
                    Klik untuk memilih file atau drag & drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Excel (.xlsx, .xls) atau CSV (maks. 10MB)
                  </p>
                </div>
              </label>
            </div>

            {/* Show selected file info */}
            {file && (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-8 w-8 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-semibold text-green-900 dark:text-green-100">
                        File dipilih
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {file.name}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Ukuran: {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFile(null)
                      setResult(null)
                    }}
                    className="text-green-700 hover:text-green-900"
                  >
                    Ganti File
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Upload Button */}
          {file && !result && (
            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Memproses...
                  </>
                ) : (
                  'Upload dan Proses'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Hasil Import</CardTitle>
            <Button
              onClick={() => {
                setFile(null)
                setUploadedFileName(null)
                setUploadedFileSize(null)
                setResult(null)
              }}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Import File Baru
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Info */}
            {uploadedFileName && (
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span className="font-medium">File yang di-import:</span>
                  <span>{uploadedFileName}</span>
                  {uploadedFileSize && (
                    <span className="text-xs">({(uploadedFileSize / 1024).toFixed(2)} KB)</span>
                  )}
                </div>
              </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-1">
                  <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800 dark:text-blue-200">Total</span>
                </div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{result.total}</p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-800 dark:text-green-200">Berhasil</span>
                </div>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{result.success}</p>
              </div>
              
              <div className="bg-red-50 dark:bg-red-950 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-800 dark:text-red-200">Gagal</span>
                </div>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">{result.failed}</p>
              </div>
            </div>

            {/* Error Messages */}
            {result.errors.length > 0 && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Error ({result.errors.length})
                </h4>
                <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 max-h-48 overflow-y-auto">
                  {result.errors.map((error, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-600">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Success Transactions */}
            {result.transactions.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Transaksi Berhasil Diimport ({result.transactions.length})
                </h4>
                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left">No. Kwitansi</th>
                          <th className="px-4 py-2 text-left">Tanggal</th>
                          <th className="px-4 py-2 text-left">Keterangan</th>
                          <th className="px-4 py-2 text-right">Nominal</th>
                          <th className="px-4 py-2 text-center">Tipe</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {result.transactions.map((tx, index) => (
                          <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                            <td className="px-4 py-2 font-mono text-xs">{tx.receiptNumber}</td>
                            <td className="px-4 py-2">
                              {new Date(tx.date).toLocaleDateString('id-ID')}
                            </td>
                            <td className="px-4 py-2">
                              <div className="font-medium">{tx.description}</div>
                              <div className="text-xs text-gray-500">{tx.fromTo}</div>
                            </td>
                            <td className="px-4 py-2 text-right font-semibold">
                              Rp {tx.amount.toLocaleString('id-ID')}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                tx.type === 'INCOME' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {tx.type === 'INCOME' ? 'Pemasukan' : 'Pengeluaran'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Cara Kerja Sistem</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center font-semibold">
                1
              </span>
              <div>
                <strong>Sistem membaca file Excel</strong> dan mengekstrak data dari kolom yang tersedia
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center font-semibold">
                2
              </span>
              <div>
                <strong>Pengelompokan otomatis</strong> - Sistem menentukan apakah transaksi adalah pemasukan atau pengeluaran berdasarkan:
                <ul className="mt-1 ml-4 list-disc space-y-1 text-gray-600 dark:text-gray-400">
                  <li>Akun COA yang dipilih (jika ada)</li>
                  <li>Kata kunci dalam nama kategori atau keterangan</li>
                  <li>Keywords: "pendapatan", "pemasukan", "SPP" → Pemasukan</li>
                  <li>Keywords: "pengeluaran", "biaya", "beban" → Pengeluaran</li>
                </ul>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center font-semibold">
                3
              </span>
              <div>
                <strong>Kategori otomatis</strong> - Jika kategori tidak ada, sistem akan membuatnya secara otomatis
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center font-semibold">
                4
              </span>
              <div>
                <strong>Nomor kwitansi</strong> dibuat otomatis sesuai format sekolah (contoh: KW-202601-001)
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center font-semibold">
                5
              </span>
              <div>
                <strong>Kwitansi PDF</strong> dibuat secara otomatis untuk setiap transaksi yang berhasil
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full flex items-center justify-center font-semibold">
                6
              </span>
              <div>
                <strong>Data tersimpan</strong> ke database dan siap untuk dilaporkan
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
