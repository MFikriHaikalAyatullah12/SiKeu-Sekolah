export interface Transaction {
  id: string
  receiptNumber: string
  type: TransactionType
  date: string
  amount: number
  category: string
  description: string
  fromTo: string
  studentClass?: string
  paymentMethod: PaymentMethod
  status: PaymentStatus
  receiptFileUrl?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  schoolProfileId: string
}

export type TransactionType = "INCOME" | "EXPENSE"

export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "QRIS"

export type PaymentStatus = "PAID" | "PENDING" | "VOID"

export interface TransactionSummary {
  totalIncome: number
  totalExpense: number
  surplus: number
  transactionCount: number
}

export interface TransactionFilter {
  type?: TransactionType
  category?: string
  paymentMethod?: PaymentMethod
  status?: PaymentStatus
  dateFrom?: string
  dateTo?: string
  searchQuery?: string
}