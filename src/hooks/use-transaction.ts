import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Transaction, TransactionType, TransactionSummary } from '@/types/transaction'

export function useTransaction(
  type: TransactionType,
  searchQuery?: string,
  month?: string
) {
  const queryClient = useQueryClient()

  const {
    data: transactions = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['transactions', type, searchQuery, month],
    queryFn: async () => {
      const params = new URLSearchParams({
        type,
        ...(searchQuery && { search: searchQuery }),
        ...(month && { month })
      })
      
      const response = await fetch(`/api/transactions?${params}`)
      if (!response.ok) throw new Error('Failed to fetch transactions')
      return response.json()
    }
  })

  const {
    data: summary = { totalIncome: 0, totalExpense: 0, surplus: 0, transactionCount: 0 }
  } = useQuery({
    queryKey: ['transaction-summary', month],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...(month && { month })
      })
      
      const response = await fetch(`/api/transactions/summary?${params}`)
      if (!response.ok) throw new Error('Failed to fetch summary')
      return response.json()
    }
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) throw new Error('Failed to create transaction')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transaction-summary'] })
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) throw new Error('Failed to update transaction')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transaction-summary'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete transaction')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transaction-summary'] })
    }
  })

  const generateReceiptMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/transactions/${id}/receipt`, {
        method: 'POST'
      })
      
      if (!response.ok) throw new Error('Failed to generate receipt')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `kwitansi-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    }
  })

  return {
    transactions,
    isLoading,
    error,
    totalIncome: summary.totalIncome,
    totalExpense: summary.totalExpense,
    surplus: summary.surplus,
    transactionCount: summary.transactionCount,
    createTransaction: createMutation.mutateAsync,
    updateTransaction: (id: string, data: any) => updateMutation.mutateAsync({ id, data }),
    deleteTransaction: deleteMutation.mutateAsync,
    generateReceipt: generateReceiptMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}