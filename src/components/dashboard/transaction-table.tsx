"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Eye, Edit, Trash2, Download, MoreHorizontal, FileText, Send } from "lucide-react"
import { Transaction, PaymentStatus } from "@/types/transaction"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface TransactionTableProps {
  transactions: Transaction[]
  isLoading: boolean
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
  onGenerateReceipt: (id: string) => void
  getStatusColor: (status: PaymentStatus) => string
  getStatusText: (status: PaymentStatus) => string
}

export function TransactionTable({
  transactions,
  isLoading,
  onEdit,
  onDelete,
  onGenerateReceipt,
  getStatusColor,
  getStatusText,
}: TransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedTransactions = transactions.slice(startIndex, endIndex)
  const totalPages = Math.ceil(transactions.length / itemsPerPage)

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "CASH":
        return "Tunai"
      case "BANK_TRANSFER":
        return "Transfer Bank"
      case "QRIS":
        return "QRIS"
      default:
        return method
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada transaksi</h3>
        <p className="text-gray-500">Tambah transaksi pertama untuk mulai mengelola keuangan.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Deskripsi/Nama</TableHead>
              <TableHead>Dari/Pen</TableHead>
              <TableHead>Nominal</TableHead>
              <TableHead>Metode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">
                  {format(new Date(transaction.date), "dd MMM yyyy", { locale: id })}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={transaction.type === "INCOME" ? "default" : "destructive"}
                    className={
                      transaction.type === "INCOME"
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }
                  >
                    {transaction.type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
                  </Badge>
                </TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {transaction.description}
                </TableCell>
                <TableCell>{transaction.fromTo}</TableCell>
                <TableCell className="font-medium">
                  Rp {transaction.amount.toLocaleString('id-ID')}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getPaymentMethodText(transaction.paymentMethod)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(transaction.status)}>
                    {getStatusText(transaction.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => window.open(`/receipts/${transaction.id}`, '_blank')}>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(transaction)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Lihat | Ubah
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onGenerateReceipt(transaction.id)}>
                        <Download className="w-4 h-4 mr-2" />
                        Unduh PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="w-4 h-4 mr-2" />
                        Cetak
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Send className="w-4 h-4 mr-2" />
                        Kirim WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => {
                          if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
                            onDelete(transaction.id)
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Menampilkan {startIndex + 1}-{Math.min(endIndex, transactions.length)} dari {transactions.length} transaksi
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            
            <div className="flex space-x-1">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8"
                    >
                      {page}
                    </Button>
                  )
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="px-2">...</span>
                }
                return null
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}