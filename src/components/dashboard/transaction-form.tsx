"use client"

import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, Upload, X } from "lucide-react"
import { Transaction, TransactionType, PaymentMethod, PaymentStatus } from "@/types/transaction"

const transactionSchema = z.object({
  date: z.string().min(1, "Tanggal harus diisi"),
  amount: z.number().min(1, "Nominal harus lebih dari 0"),
  category: z.string().min(1, "Kategori harus dipilih"),
  coaAccountId: z.string().optional(),
  fromTo: z.string().min(1, "Nama siswa/penerima harus diisi"),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "QRIS"]),
  status: z.enum(["PAID", "PENDING", "VOID"]),
  description: z.string().optional(),
  receiptFile: z.any().optional(),
})

type TransactionFormData = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  transaction?: Transaction | null
  type: TransactionType
  onSubmit: (data: TransactionFormData) => void
  onCancel: () => void
}

const incomeCategories = [
  "SPP Siswa",
  "Donasi",
  "Uang Pangkal",
  "Kegiatan Siswa",
  "Lainnya"
]

const expenseCategories = [
  "Operasional Harian",
  "Gaji Guru & Staf",
  "Fasilitas Sekolah",
  "Kegiatan Siswa",
  "Lainnya"
]

const paymentMethods = [
  { value: "CASH", label: "Tunai" },
  { value: "BANK_TRANSFER", label: "Transfer Bank" },
  { value: "QRIS", label: "QRIS" }
]

const statusOptions = [
  { value: "PAID", label: "Lunas" },
  { value: "PENDING", label: "Menunggu" },
  { value: "VOID", label: "Void" }
]

export function TransactionForm({ transaction, type, onSubmit, onCancel }: TransactionFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [coaAccounts, setCoaAccounts] = useState<any[]>([])
  const [loadingCOA, setLoadingCOA] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEditing = !!transaction

  const categories = type === "INCOME" ? incomeCategories : expenseCategories

  // Fetch COA Accounts
  useEffect(() => {
    const fetchCOAAccounts = async () => {
      try {
        // Add timestamp to prevent caching
        const response = await fetch(`/api/coa?_t=${Date.now()}`, {
          cache: 'no-store'
        })
        if (!response.ok) throw new Error("Failed to fetch COA")
        
        const data = await response.json()
        
        // Flatten COA structure to get all accounts
        const accounts: any[] = []
        data.forEach((category: any) => {
          category.subCategories?.forEach((subCat: any) => {
            subCat.accounts?.forEach((account: any) => {
              accounts.push({
                id: account.id,
                code: account.code,
                name: account.name,
                categoryName: category.name,
                isActive: account.isActive,
              })
            })
          })
        })
        
        // Filter based on transaction type and only show active accounts
        const filtered = accounts.filter(acc => {
          // Only show active accounts
          if (!acc.isActive) return false
          
          if (type === "INCOME") {
            return ["AKTIVA", "PENDAPATAN", "MODAL"].includes(acc.categoryName)
          } else {
            return ["AKTIVA", "KEWAJIBAN", "BEBAN"].includes(acc.categoryName)
          }
        })
        
        setCoaAccounts(filtered)
      } catch (error) {
        console.error("Error fetching COA:", error)
      } finally {
        setLoadingCOA(false)
      }
    }
    
    fetchCOAAccounts()
  }, [type])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction ? {
      date: transaction.date.split('T')[0],
      amount: transaction.amount,
      category: transaction.category,
      coaAccountId: (transaction as any).coaAccountId || "",
      fromTo: transaction.fromTo,
      paymentMethod: transaction.paymentMethod,
      status: transaction.status,
      description: transaction.description,
    } : {
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      category: "",
      coaAccountId: "",
      fromTo: "",
      paymentMethod: "CASH",
      status: "PAID",
      description: "",
    }
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
  }

  const validateAndSetFile = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      alert('Format file tidak didukung. Gunakan JPG, PNG, atau PDF.')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal 5MB.')
      return
    }

    setSelectedFile(file)
    setValue('receiptFile', file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setValue('receiptFile', null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onSubmitForm = (data: TransactionFormData) => {
    const formData = {
      ...data,
      receiptFile: selectedFile,
    }
    onSubmit(formData)
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit ${type === "INCOME" ? "Pemasukan" : "Pengeluaran"}` : `Input Transaksi Baru - ${type === "INCOME" ? "Pemasukan" : "Pengeluaran"}`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
                className="w-full"
              />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Nominal</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">Rp</span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  className="pl-8"
                  {...register("amount", { valueAsNumber: true })}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select onValueChange={(value) => setValue("category", value)} defaultValue={transaction?.category}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="coaAccountId">
                Akun COA {type === "INCOME" ? "(Pemasukan)" : "(Pengeluaran)"}
              </Label>
              <Select 
                onValueChange={(value) => setValue("coaAccountId", value)} 
                defaultValue={(transaction as any)?.coaAccountId || ""}
                disabled={loadingCOA}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingCOA ? "Memuat..." : "Pilih akun COA (opsional)"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tidak ada</SelectItem>
                  {coaAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.code} - {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {type === "INCOME" ? "Akun untuk mencatat pemasukan" : "Akun untuk mencatat pengeluaran"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromTo">
                {type === "INCOME" ? "Dari/Penerima" : "Kepada"}
              </Label>
              <Input
                id="fromTo"
                placeholder={type === "INCOME" ? "Nama Siswa atau Donatur" : "Nama Vendor atau Penerima"}
                {...register("fromTo")}
              />
              {errors.fromTo && (
                <p className="text-sm text-red-500">{errors.fromTo.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Metode Pembayaran</Label>
              <Select onValueChange={(value) => setValue("paymentMethod", value as PaymentMethod)} defaultValue={transaction?.paymentMethod || "CASH"}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih metode" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select onValueChange={(value) => setValue("status", value as PaymentStatus)} defaultValue={transaction?.status || "PAID"}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Catatan</Label>
            <Textarea
              id="description"
              placeholder="Catatan (optional)"
              rows={3}
              {...register("description")}
            />
          </div>

          <div className="space-y-2">
            <Label>Upload Bukti</Label>
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50' 
                  : selectedFile 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                    <div className="flex items-center">
                      {selectedFile.type === 'application/pdf' ? (
                        <svg className="w-10 h-10 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-10 h-10 text-blue-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      )}
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeFile}
                      className="hover:bg-red-100 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-white hover:bg-gray-50"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Ganti Bukti
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-4">
                    Tarik & lepas foto bukti atau klik untuk unggah
                  </p>
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Pilih File
                  </Button>
                  <p className="text-xs text-gray-500 mt-3">
                    File types: JPG/PNG/PDF. Max 5MB
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,application/pdf"
                onChange={handleFileSelect}
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? "Menyimpan..." : (isEditing ? "Simpan & Buat Kwitansi" : "Simpan & Buat Kwitansi")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (!isSubmitting) {
                    onSubmitForm({...watch(), receiptFile: selectedFile})
                  }
                }}
                disabled={isSubmitting}
              >
                Simpan
              </Button>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Batal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}