"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, ChevronRight, ChevronDown, Search, Pencil, Trash2, MoreVertical, School, Bell, User as UserIcon } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

interface COAAccount {
  id: string
  code: string
  name: string
  description?: string
  isActive: boolean
  subCategoryId?: string
  createdAt?: string
  updatedAt?: string
}

interface COASubCategory {
  id: string
  code: string
  name: string
  description?: string
  isActive: boolean
  categoryId: string
  accounts: COAAccount[]
  createdAt?: string
  updatedAt?: string
}

interface COACategory {
  id: string
  code: string
  name: string
  type: string
  description?: string
  isActive: boolean
  subCategories: COASubCategory[]
  createdAt?: string
  updatedAt?: string
}

interface FlatAccount {
  id: string
  code: string
  name: string
  type: string
  parentCode?: string
  parentId?: string
  parentType?: "category" | "subcategory"
  isActive: boolean
  description?: string
  children?: FlatAccount[]
  level: number
  createdAt?: string
  updatedAt?: string
}

export default function COAManagementPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [coaCategories, setCoaCategories] = useState<COACategory[]>([])
  const [flatAccounts, setFlatAccounts] = useState<FlatAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [selectedAccount, setSelectedAccount] = useState<FlatAccount | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<FlatAccount | null>(null)
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "maincategory" as "maincategory" | "subcategory" | "account",
    parentId: "",
    categoryType: "ASSET",
    isActive: true,
    description: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  useEffect(() => {
    fetchCOAData()
  }, [])

  const fetchCOAData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/coa")
      if (!response.ok) throw new Error("Failed to fetch COA")
      
      const data: COACategory[] = await response.json()
      setCoaCategories(data)
      
      // Convert to flat structure for tree view
      const flat = convertToFlatStructure(data)
      setFlatAccounts(flat)
      
      // Auto-expand first level
      const firstLevelCodes = data.map(cat => cat.code)
      setExpandedNodes(new Set(firstLevelCodes))
    } catch (error) {
      console.error("Error fetching COA:", error)
      toast.error("Gagal memuat Chart of Accounts")
    } finally {
      setLoading(false)
    }
  }

  const convertToFlatStructure = (categories: COACategory[]): FlatAccount[] => {
    const result: FlatAccount[] = []
    
    categories.forEach(category => {
      // Add category as parent
      const categoryNode: FlatAccount = {
        id: category.id,
        code: category.code,
        name: category.name,
        type: category.name,
        isActive: category.isActive,
        description: category.description,
        level: 0,
        parentType: "category",
        children: [],
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      }
      
      // Add subcategories as children
      category.subCategories.forEach(subCat => {
        const subCatNode: FlatAccount = {
          id: subCat.id,
          code: subCat.code,
          name: subCat.name,
          type: category.name,
          parentCode: category.code,
          parentId: category.id,
          isActive: subCat.isActive,
          description: subCat.description,
          level: 1,
          parentType: "subcategory",
          children: [],
          createdAt: subCat.createdAt,
          updatedAt: subCat.updatedAt,
        }
        
        // Add accounts as grandchildren
        subCat.accounts.forEach(account => {
          const accountNode: FlatAccount = {
            id: account.id,
            code: account.code,
            name: account.name,
            type: category.name,
            parentCode: subCat.code,
            parentId: subCat.id,
            isActive: account.isActive,
            description: account.description,
            level: 2,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
          }
          subCatNode.children!.push(accountNode)
        })
        
        categoryNode.children!.push(subCatNode)
      })
      
      result.push(categoryNode)
    })
    
    return result
  }

  const toggleNode = (code: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(code)) {
      newExpanded.delete(code)
    } else {
      newExpanded.add(code)
    }
    setExpandedNodes(newExpanded)
  }

  const handleAccountClick = (account: FlatAccount) => {
    setSelectedAccount(account)
  }

  const handleAddAccount = () => {
    setFormData({
      code: "",
      name: "",
      type: "account",
      parentId: "",
      categoryType: "ASSET",
      isActive: true,
      description: "",
    })
    setIsAddModalOpen(true)
  }

  const handleSaveAccount = async () => {
    try {
      // Validate form
      if (!formData.code || !formData.name) {
        toast.error("Kode dan nama harus diisi")
        return
      }

      if (formData.type !== "maincategory" && !formData.parentId) {
        toast.error(`Pilih ${formData.type === "subcategory" ? "kategori utama" : "kategori induk"}`)
        return
      }

      let endpoint = "/api/coa/categories"
      let body: any = {
        code: formData.code,
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive,
      }

      if (formData.type === "maincategory") {
        // Menambah Kategori Utama (AKTIVA, KEWAJIBAN, dll)
        body.type = formData.categoryType
      } else if (formData.type === "subcategory") {
        // Menambah Kategori (yang di database adalah subcategory)
        endpoint = "/api/coa/categories/subcategories"
        body.categoryId = formData.parentId
      } else {
        // Menambah Sub-Kategori (yang di database adalah account)
        endpoint = "/api/coa/categories/subcategories/accounts"
        body.subCategoryId = formData.parentId
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Gagal menyimpan")
      }

      const successMsg = formData.type === "maincategory" ? "Kategori utama" : formData.type === "subcategory" ? "Kategori" : "Sub-kategori"
      toast.success(`${successMsg} berhasil ditambahkan`)
      setIsAddModalOpen(false)
      fetchCOAData()
      
      // Reset form
      setFormData({
        code: "",
        name: "",
        type: "maincategory",
        parentId: "",
        categoryType: "ASSET",
        isActive: true,
        description: "",
      })
    } catch (error: any) {
      toast.error(error.message || "Gagal menambahkan")
    }
  }

  const handleDeleteClick = (account: FlatAccount) => {
    setAccountToDelete(account)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!accountToDelete) return

    try {
      // Check if has children
      if (accountToDelete.children && accountToDelete.children.length > 0) {
        const itemType = accountToDelete.level === 0 ? "Kategori utama" : accountToDelete.level === 1 ? "Kategori" : "Sub-kategori"
        const childType = accountToDelete.level === 0 ? "kategori" : accountToDelete.level === 1 ? "sub-kategori" : "item"
        toast.error(`${itemType} yang memiliki ${childType} tidak dapat dihapus`)
        return
      }

      const endpoint = accountToDelete.level === 0
        ? `/api/coa/categories/${accountToDelete.id}`
        : accountToDelete.level === 1
        ? `/api/coa/categories/subcategories/${accountToDelete.id}`
        : `/api/coa/categories/subcategories/accounts/${accountToDelete.id}`

      const response = await fetch(endpoint, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Gagal menghapus")
      }

      const itemType = accountToDelete.level === 0 ? "Kategori utama" : accountToDelete.level === 1 ? "Kategori" : "Sub-kategori"
      toast.success(`${itemType} ${accountToDelete.code} - ${accountToDelete.name} berhasil dihapus`)
      
      // Clear selected account if it was the deleted one
      if (selectedAccount?.id === accountToDelete.id) {
        setSelectedAccount(null)
      }
      
      setIsDeleteDialogOpen(false)
      setAccountToDelete(null)
      
      // Refresh COA data
      await fetchCOAData()
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus")
    }
  }

  const handleSaveChanges = async () => {
    if (!selectedAccount) return

    try {
      const endpoint = selectedAccount.level === 0
        ? `/api/coa/categories/${selectedAccount.id}`
        : selectedAccount.level === 1
        ? `/api/coa/categories/subcategories/${selectedAccount.id}`
        : `/api/coa/categories/subcategories/accounts/${selectedAccount.id}`

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: selectedAccount.name,
          description: selectedAccount.description,
          isActive: selectedAccount.isActive,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Gagal menyimpan perubahan")
      }

      toast.success("Perubahan berhasil disimpan")
      fetchCOAData()
    } catch (error: any) {
      toast.error(error.message || "Gagal menyimpan perubahan")
    }
  }

  const renderAccountRow = (account: FlatAccount, level: number = 0) => {
    const isExpanded = expandedNodes.has(account.code)
    const hasChildren = account.children && account.children.length > 0
    const isSelected = selectedAccount?.id === account.id

    return (
      <div key={account.id}>
        <div
          className={`flex items-center py-2.5 px-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
            isSelected ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
          }`}
          onClick={() => handleAccountClick(account)}
          style={{ paddingLeft: `${level * 24 + 12}px` }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleNode(account.code)
                }}
                className="p-0.5 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                )}
              </button>
            ) : (
              <div className="w-5" />
            )}
            <span className="font-mono text-sm font-semibold text-gray-700 w-16">{account.code}</span>
            <span className="text-sm text-gray-900 flex-1 truncate">{account.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600 w-20">{account.type}</span>
            <Badge variant={account.isActive ? "default" : "secondary"} className="text-xs">
              {account.isActive ? "Aktif" : "Nonaktif"}
            </Badge>
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleAccountClick(account)
                }}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <Pencil className="h-3.5 w-3.5 text-gray-600" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteClick(account)
                }}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
              </button>
              <button className="p-1 hover:bg-gray-200 rounded">
                <MoreVertical className="h-3.5 w-3.5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {account.children?.map((child) => renderAccountRow(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">Loading...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Chart of Accounts (COA)</h1>
              <p className="text-sm text-gray-600 mt-1">Kelola daftar akun untuk pemasukan & pengeluaran</p>
            </div>
          </div>
          
          {/* Action Bar */}
          <div className="mt-4 flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  setFormData({ 
                    ...formData, 
                    type: "subcategory",
                    parentId: "",
                    code: "",
                    name: "",
                    description: "",
                    categoryType: "ASSET"
                  })
                  setIsAddModalOpen(true)
                }}
                variant="outline" 
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Kategori
              </Button>
              <Button 
                onClick={() => {
                  setFormData({ 
                    ...formData, 
                    type: "account",
                    parentId: "",
                    code: "",
                    name: "",
                    description: "",
                    categoryType: "ASSET"
                  })
                  setIsAddModalOpen(true)
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Sub-Kategori
              </Button>
            </div>
          </div>
        </div>

        {/* Full Width - Detail Panel */}
        <div className="grid grid-cols-1">
          <div>
            <Card className="rounded-2xl shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Detail Akun</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedAccount ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="kode-akun" className="text-sm font-medium">Kode Akun</Label>
                      <Input
                        id="kode-akun"
                        value={selectedAccount.code}
                        readOnly
                        className="bg-gray-50 font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nama-akun" className="text-sm font-medium">Nama Akun</Label>
                      <Input
                        id="nama-akun"
                        value={selectedAccount.name}
                        onChange={(e) => setSelectedAccount({ ...selectedAccount, name: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tipe-akun" className="text-sm font-medium">Tipe Akun</Label>
                      <Input
                        id="tipe-akun"
                        value={selectedAccount.type}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="parent-akun" className="text-sm font-medium">Parent Akun</Label>
                      <Input
                        id="parent-akun"
                        value={selectedAccount.parentCode || "Tidak ada parent"}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>

                    <div className="flex items-center justify-between py-2">
                      <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="status"
                          checked={selectedAccount.isActive}
                          onCheckedChange={(checked) => setSelectedAccount({ ...selectedAccount, isActive: checked })}
                        />
                        <span className="text-sm font-medium">{selectedAccount.isActive ? "Aktif" : "Nonaktif"}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deskripsi" className="text-sm font-medium">Deskripsi</Label>
                      <Textarea
                        id="deskripsi"
                        placeholder="Notaran (optional)"
                        value={selectedAccount.description || ""}
                        onChange={(e) => setSelectedAccount({ ...selectedAccount, description: e.target.value })}
                        className="min-h-[80px]"
                      />
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-semibold mb-2">Info Sistem</h4>
                      <div className="space-y-1 text-xs text-gray-600">
                        <p>Dibuat pada: <span className="font-medium text-gray-900">{selectedAccount.createdAt ? new Date(selectedAccount.createdAt).toLocaleDateString("id-ID") : "-"}</span></p>
                        <p>Diubah pada: <span className="font-medium text-gray-900">{selectedAccount.updatedAt ? new Date(selectedAccount.updatedAt).toLocaleDateString("id-ID") : "-"}</span></p>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleSaveChanges} className="flex-1 bg-blue-600 hover:bg-blue-700">
                        Simpan Perubahan
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Batal
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    Pilih akun untuk melihat detail
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Original Tree View - Hidden by default, can be toggled */}
        <details className="mt-6">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 bg-gray-100 p-3 rounded-lg hover:bg-gray-200">
            Tampilkan Tree View Lengkap (Semua Kategori)
          </summary>
          <Card className="rounded-2xl shadow-sm border-gray-200 mt-3">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Daftar COA Lengkap</CardTitle>
              <div className="space-y-3 mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari kode/nama akun..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48 bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Semua Tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Tipe</SelectItem>
                      <SelectItem value="AKTIVA">Aktiva</SelectItem>
                      <SelectItem value="KEWAJIBAN">Kewajiban</SelectItem>
                      <SelectItem value="MODAL">Modal</SelectItem>
                      <SelectItem value="PENDAPATAN">Pendapatan</SelectItem>
                      <SelectItem value="BEBAN">Beban</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={showActiveOnly}
                      onCheckedChange={setShowActiveOnly}
                      id="active-only"
                    />
                    <Label htmlFor="active-only" className="text-sm text-gray-700 cursor-pointer">
                      Tampilkan hanya akun aktif
                    </Label>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border-t border-gray-200">
                {/* Table Header */}
                <div className="flex items-center py-2 px-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-600">
                  <div className="flex-1 pl-7">
                    <span>Kode | Nama Akun</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-20">Tipe</span>
                    <span className="w-16">Status</span>
                    <span className="w-24">Aksi</span>
                  </div>
                </div>
                {/* Tree View */}
                <div className="max-h-[600px] overflow-y-auto">
                  {flatAccounts.map((account) => renderAccountRow(account))}
                </div>
              </div>
            </CardContent>
          </Card>
        </details>
      </div>

      {/* Add Account Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {formData.type === "maincategory" ? "Tambah Kategori Utama Baru" :
               formData.type === "subcategory" ? "Tambah Kategori Baru" : "Tambah Sub-Kategori Baru"}
            </DialogTitle>
            <p className="text-sm text-gray-500 mt-1">
              {formData.type === "maincategory"
                ? "Kategori utama seperti AKTIVA, KEWAJIBAN, MODAL, PENDAPATAN, BEBAN"
                : formData.type === "subcategory" 
                ? "Kategori seperti Aktiva Lancar, Aktiva Tetap, Modal, Kewajiban Jangka Pendek, dll" 
                : "Sub-kategori seperti Kas di Bendahara, Kas di Bank, dll"}
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-kode" className="text-sm font-medium">
                Kode {formData.type === "maincategory" ? "Kategori Utama" : formData.type === "subcategory" ? "Kategori" : "Sub-Kategori"}
              </Label>
              <Input
                id="new-kode"
                placeholder={formData.type === "maincategory" ? "contoh: 6000" : formData.type === "subcategory" ? "contoh: 1100" : "contoh: 1110"}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="font-mono"
              />
              <p className="text-xs text-gray-500">
                {formData.type === "maincategory" 
                  ? "Kode 4 digit untuk kategori utama (1000-9000)" 
                  : formData.type === "subcategory" 
                  ? "Kode 4 digit untuk kategori (contoh: 1100, 1200, 2100)" 
                  : "Kode 4 digit untuk sub-kategori (contoh: 1110, 1120)"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-nama" className="text-sm font-medium">
                Nama {formData.type === "maincategory" ? "Kategori Utama" : formData.type === "subcategory" ? "Kategori" : "Sub-Kategori"}
              </Label>
              <Input
                id="new-nama"
                placeholder={formData.type === "maincategory" ? "contoh: ASET LAINNYA" : formData.type === "subcategory" ? "contoh: Aktiva Lancar" : "contoh: Kas di Bendahara"}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {formData.type === "maincategory" && (
              <div className="space-y-2">
                <Label htmlFor="main-category-type" className="text-sm font-medium">Tipe Kategori Utama</Label>
                <Select value={formData.categoryType || "ASSET"} onValueChange={(value) => setFormData({ ...formData, categoryType: value })}>
                  <SelectTrigger id="main-category-type">
                    <SelectValue placeholder="Pilih tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ASSET">ASSET (Aktiva)</SelectItem>
                    <SelectItem value="LIABILITY">LIABILITY (Kewajiban)</SelectItem>
                    <SelectItem value="EQUITY">EQUITY (Modal)</SelectItem>
                    <SelectItem value="REVENUE">REVENUE (Pendapatan)</SelectItem>
                    <SelectItem value="EXPENSE">EXPENSE (Beban)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Pilih jenis kategori utama untuk pengelompokan akun</p>
              </div>
            )}

            {formData.type === "subcategory" && (
              <div className="space-y-2">
                <Label htmlFor="parent-category" className="text-sm font-medium">Kategori Utama</Label>
                <Select value={formData.parentId} onValueChange={(value) => setFormData({ ...formData, parentId: value })}>
                  <SelectTrigger id="parent-category">
                    <SelectValue placeholder="Pilih kategori utama" />
                  </SelectTrigger>
                  <SelectContent>
                    {coaCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.code} - {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Pilih kategori utama (AKTIVA, KEWAJIBAN, MODAL, PENDAPATAN, atau BEBAN)</p>
              </div>
            )}

            {formData.type === "account" && (
              <div className="space-y-2">
                <Label htmlFor="parent-subcategory" className="text-sm font-medium">Kategori Induk</Label>
                <Select value={formData.parentId} onValueChange={(value) => setFormData({ ...formData, parentId: value })}>
                  <SelectTrigger id="parent-subcategory">
                    <SelectValue placeholder="Pilih kategori induk" />
                  </SelectTrigger>
                  <SelectContent>
                    {coaCategories.flatMap(cat => 
                      cat.subCategories.map(sub => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.code} - {sub.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="new-desc" className="text-sm font-medium">Deskripsi (Opsional)</Label>
              <Textarea
                id="new-desc"
                placeholder="Tambahkan deskripsi atau catatan"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[80px]"
              />
            </div>

            <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
              <Label htmlFor="new-status" className="text-sm font-medium">Status Aktif</Label>
              <div className="flex items-center gap-2">
                <Switch
                  id="new-status"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <span className="text-sm font-medium">{formData.isActive ? "Aktif" : "Nonaktif"}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveAccount} className="bg-blue-600 hover:bg-blue-700">
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Hapus {accountToDelete?.level === 0 ? "Kategori Utama" : accountToDelete?.level === 1 ? "Kategori" : "Sub-Kategori"}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 pt-2">
              Apakah Anda yakin ingin menghapus {accountToDelete?.level === 0 ? "kategori utama" : accountToDelete?.level === 1 ? "kategori" : "sub-kategori"} <strong>{accountToDelete?.code} - {accountToDelete?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">
              {accountToDelete?.level === 0 
                ? "Kategori utama yang memiliki kategori tidak dapat dihapus. Hapus semua kategori di dalamnya terlebih dahulu."
                : accountToDelete?.level === 1
                ? "Kategori yang memiliki sub-kategori tidak dapat dihapus. Hapus semua sub-kategori di dalamnya terlebih dahulu."
                : "Sub-kategori yang sedang digunakan dalam transaksi tidak dapat dihapus."}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}