"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, Filter, Eye, Edit, Trash2, Download } from "lucide-react"
import { TransactionForm } from "./transaction-form"
import { TransactionTable } from "./transaction-table"
import { useTransaction } from "@/hooks/use-transaction"
import { Transaction, TransactionType, PaymentStatus } from "@/types/transaction"

export function TransactionContent() {
  const [activeTab, setActiveTab] = useState<TransactionType>("INCOME")
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))

  const {
    transactions,
    isLoading,
    totalIncome,
    totalExpense,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    generateReceipt
  } = useTransaction(activeTab, searchQuery, selectedMonth)

  const handleCreateTransaction = async (data: any) => {
    await createTransaction({ ...data, type: activeTab })
    setShowForm(false)
  }

  const handleUpdateTransaction = async (data: any) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, data)
      setEditingTransaction(null)
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id)
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  const handleGenerateReceipt = async (id: string) => {
    await generateReceipt(id)
  }

  const filteredTransactions = transactions.filter((transaction: any) => {
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.fromTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "VOID":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: PaymentStatus) => {
    switch (status) {
      case "PAID":
        return "Lunas"
      case "PENDING":
        return "Menunggu"
      case "VOID":
        return "Void"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Transaksi</h1>
          <p className="text-gray-600">Kelola pemasukan dan pengeluaran sekolah</p>
        </div>
        <Button 
          onClick={() => {
            setEditingTransaction(null)
            setShowForm(true)
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Transaksi
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Pemasukan</p>
                <p className="text-2xl font-bold text-blue-800">
                  Rp {totalIncome.toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-blue-600">Bulan ini</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Total Pengeluaran</p>
                <p className="text-2xl font-bold text-red-800">
                  Rp {totalExpense.toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-red-600">Bulan ini</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M17 3a1 1 0 01-1 1H4a1 1 0 110-2h12a1 1 0 011 1zm-7.707 3.293a1 1 0 10-1.414 1.414L9 8.414V16a1 1 0 102 0V8.414l1.121 1.121a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Surplus/Defisit</p>
                <p className={`text-2xl font-bold ${
                  (totalIncome - totalExpense) >= 0 ? 'text-green-800' : 'text-red-800'
                }`}>
                  {(totalIncome - totalExpense) >= 0 ? '+' : ''}Rp {(totalIncome - totalExpense).toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-purple-600">Bulan ini</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Cari transaksi atau siswa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-40"
              />
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Tabs */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TransactionType)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="INCOME">Pemasukan</TabsTrigger>
              <TabsTrigger value="EXPENSE">Pengeluaran</TabsTrigger>
            </TabsList>
            
            <TabsContent value="INCOME" className="mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Riwayat Pemasukan Terbaru</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Urutkan</span>
                  <select className="text-sm border rounded px-2 py-1">
                    <option>Tanggal (Terbaru)</option>
                    <option>Nominal (Tertinggi)</option>
                    <option>Nominal (Terendah)</option>
                  </select>
                </div>
              </div>
              <TransactionTable
                transactions={filteredTransactions}
                isLoading={isLoading}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
                onGenerateReceipt={handleGenerateReceipt}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
              />
            </TabsContent>

            <TabsContent value="EXPENSE" className="mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Riwayat Pengeluaran Terbaru</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Urutkan</span>
                  <select className="text-sm border rounded px-2 py-1">
                    <option>Tanggal (Terbaru)</option>
                    <option>Nominal (Tertinggi)</option>
                    <option>Nominal (Terendah)</option>
                  </select>
                </div>
              </div>
              <TransactionTable
                transactions={filteredTransactions}
                isLoading={isLoading}
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
                onGenerateReceipt={handleGenerateReceipt}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
              />
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>

      {/* Transaction Form Modal */}
      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          type={activeTab}
          onSubmit={editingTransaction ? handleUpdateTransaction : handleCreateTransaction}
          onCancel={() => {
            setShowForm(false)
            setEditingTransaction(null)
          }}
        />
      )}
    </div>
  )
}