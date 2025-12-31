"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Search, Eye, X } from "lucide-react";
import { toast } from "sonner";

type TransactionType = "INCOME" | "EXPENSE";

interface COACategory {
  code: string;
  name: string;
  types: { code: string; name: string }[];
}

export function TransactionContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TransactionType>("INCOME");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("bulan-ini");
  const [incomeCOA, setIncomeCOA] = useState<COACategory[]>([]);
  const [expenseCOA, setExpenseCOA] = useState<COACategory[]>([]);
  const [loadingCOA, setLoadingCOA] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "",
    categoryCode: "",
    typeCode: "",
    payerName: "",
    accountDestination: "",
    paymentMethod: "CASH",
    status: "PAID",
    notes: "",
    proof: null as File | null,
  });
  
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const currentCOA = activeTab === "INCOME" ? incomeCOA : expenseCOA;
  const selectedCategory = currentCOA.find(cat => cat.code === formData.categoryCode);
  const availableTypes = selectedCategory?.types || [];
  
  // Get account destinations from Aktiva Lancar for INCOME
  const accountDestinations = incomeCOA
    .filter(cat => cat.code.startsWith("11")) // Aktiva Lancar categories
    .flatMap(cat => cat.types);

  // Fetch COA data from database
  useEffect(() => {
    const fetchCOAData = async () => {
      try {
        const response = await fetch("/api/coa");
        if (!response.ok) throw new Error("Failed to fetch COA");
        
        const data = await response.json();
        
        // Transform data to match component structure
        const incomeCategories: COACategory[] = [];
        const expenseCategories: COACategory[] = [];
        
        data.forEach((category: any) => {
          category.subCategories?.forEach((subCat: any) => {
            const categoryData = {
              code: subCat.code,
              name: `${subCat.code} - ${subCat.name}`,
              types: subCat.accounts?.map((acc: any) => ({
                code: acc.code,
                name: `${acc.code} - ${acc.name}`,
              })) || [],
            };
            
            // Filter by category type for INCOME/EXPENSE
            if (["AKTIVA", "PENDAPATAN", "MODAL"].includes(category.name)) {
              incomeCategories.push(categoryData);
            }
            if (["AKTIVA", "KEWAJIBAN", "BEBAN"].includes(category.name)) {
              expenseCategories.push(categoryData);
            }
          });
        });
        
        setIncomeCOA(incomeCategories);
        setExpenseCOA(expenseCategories);
        setLoadingCOA(false);
      } catch (error) {
        console.error("Failed to fetch COA:", error);
        toast.error("Gagal memuat data COA");
        setLoadingCOA(false);
      }
    };
    
    fetchCOAData();
  }, []);

  // Set mounted to true after component mounts (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Baca query parameter tab dari URL saat component mount
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'INCOME' || tab === 'EXPENSE') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchTransactions();
    
    // Auto-refresh setiap 5 detik untuk sinkronisasi dengan database
    const interval = setInterval(() => {
      fetchTransactions();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchTransactions = async () => {
    try {
      const type = activeTab;
      const response = await fetch(`/api/transactions?type=${type}&_t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };

  const handleSubmit = async (printReceipt: boolean = false) => {
    if (!formData.categoryCode || !formData.typeCode || !formData.amount || !formData.payerName) {
      toast.error("Mohon lengkapi semua field yang diperlukan");
      return;
    }

    const schoolId = session?.user?.schoolId;
    if (!schoolId) {
      toast.error("School ID tidak ditemukan");
      return;
    }

    setLoading(true);
    try {
      const selectedCat = currentCOA.find(c => c.code === formData.categoryCode);
      const selectedType = selectedCat?.types.find(t => t.code === formData.typeCode);
      
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeTab,
          date: formData.date,
          amount: parseFloat(formData.amount),
          categoryId: formData.categoryCode,
          description: `${selectedType?.name} - ${formData.payerName}${formData.notes ? ` - ${formData.notes}` : ''}`,
          fromTo: formData.payerName,
          paymentMethod: formData.paymentMethod,
          status: formData.status,
          schoolId: schoolId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`${activeTab === "INCOME" ? "Pemasukan" : "Pengeluaran"} berhasil ditambahkan`);
        
        // Reset form
        setFormData({
          date: new Date().toISOString().split("T")[0],
          amount: "",
          categoryCode: "",
          typeCode: "",
          payerName: "",
          accountDestination: "",
          paymentMethod: "CASH",
          status: "PAID",
          notes: "",
          proof: null,
        });
        
        fetchTransactions();

        if (printReceipt && data.transaction?.id) {
          // Handle receipt printing
          toast.info("Fitur cetak kwitansi akan segera tersedia");
        }
      } else {
        toast.error(data.error || "Gagal menambahkan transaksi");
      }
    } catch (error) {
      toast.error("Gagal menambahkan transaksi");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Format file tidak didukung. Gunakan JPG, PNG, atau PDF.');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file terlalu besar. Maksimal 5MB.');
        return;
      }

      setFormData({ ...formData, proof: file });
      toast.success(`File "${file.name}" berhasil dipilih`);
    }
  };

  const removeFile = () => {
    setFormData({ ...formData, proof: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStatusChange = async (transactionId: string, newStatus: string) => {
    setUpdatingStatus(transactionId);
    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Status transaksi berhasil diubah ke ${newStatus === 'PAID' ? 'Lunas' : 'Menunggu'}`);
        fetchTransactions();
      } else {
        const data = await response.json();
        toast.error(data.error || "Gagal mengubah status");
      }
    } catch (error) {
      toast.error("Gagal mengubah status transaksi");
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Prevent hydration mismatch by waiting for client-side mount
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Transaksi</h1>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TransactionType)}>
        <TabsList className="bg-white border border-gray-200 p-1">
          <TabsTrigger 
            value="INCOME" 
            className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Pemasukan
          </TabsTrigger>
          <TabsTrigger 
            value="EXPENSE"
            className="rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Pengeluaran
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Two Column Layout */}
          <div className="grid grid-cols-[56%_44%] gap-6">
            {/* Left Column - Form Card */}
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">
                  Input {activeTab === "INCOME" ? "Pemasukan" : "Pengeluaran"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tanggal */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                    Tanggal
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="h-10 rounded-lg border-gray-200"
                  />
                </div>

                {/* Nominal */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                    Nominal
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                    <Input
                      id="amount"
                      type="text"
                      placeholder="1.500.000"
                      value={formData.amount}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setFormData({ ...formData, amount: value });
                      }}
                      className="h-10 rounded-lg border-gray-200 pl-10"
                    />
                  </div>
                </div>

                {/* Nama Pembayar */}
                <div className="space-y-2">
                  <Label htmlFor="payerName" className="text-sm font-medium text-gray-700">
                    Nama Pembayar
                  </Label>
                  <Input
                    id="payerName"
                    type="text"
                    placeholder="Budi Santoso"
                    value={formData.payerName}
                    onChange={(e) => setFormData({ ...formData, payerName: e.target.value })}
                    className="h-10 rounded-lg border-gray-200"
                  />
                </div>

                {/* Kategori Akun (COA) */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                    Kategori Akun (COA)
                  </Label>
                  <Select
                    value={formData.categoryCode}
                    onValueChange={(value) => setFormData({ ...formData, categoryCode: value, typeCode: "" })}
                    disabled={loadingCOA}
                  >
                    <SelectTrigger className="h-10 rounded-lg border-gray-200">
                      <SelectValue placeholder={loadingCOA ? "Memuat..." : "Pilih kategori"} />
                    </SelectTrigger>
                    <SelectContent>
                      {currentCOA.map((category) => (
                        <SelectItem key={category.code} value={category.code}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Jenis Akun (COA) - Dependent */}
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                    Jenis Akun (COA)
                  </Label>
                  <Select
                    value={formData.typeCode}
                    onValueChange={(value) => setFormData({ ...formData, typeCode: value })}
                    disabled={!formData.categoryCode || loadingCOA}
                  >
                    <SelectTrigger className="h-10 rounded-lg border-gray-200">
                      <SelectValue placeholder="Pilih jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTypes.map((type) => (
                        <SelectItem key={type.code} value={type.code}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Akun Masuk Ke - Only for Income */}
                {activeTab === "INCOME" && (
                  <div className="space-y-2">
                    <Label htmlFor="accountDestination" className="text-sm font-medium text-gray-700">
                      Akun Masuk Ke
                    </Label>
                    <Select
                      value={formData.accountDestination}
                      onValueChange={(value) => setFormData({ ...formData, accountDestination: value })}
                    >
                      <SelectTrigger className="h-10 rounded-lg border-gray-200">
                        <SelectValue placeholder="Pilih akun tujuan" />
                      </SelectTrigger>
                      <SelectContent>
                        {accountDestinations.map((dest) => (
                          <SelectItem key={dest.code} value={dest.code}>
                            {dest.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Metode Pembayaran */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Metode Pembayaran
                  </Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                  >
                    <SelectTrigger className="h-10 rounded-lg border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Tunai</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Transfer</SelectItem>
                      <SelectItem value="QRIS">E-Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Status
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.status === "PAID" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData({ ...formData, status: "PAID" })}
                      className="rounded-lg"
                    >
                      Lunas
                    </Button>
                    <Button
                      type="button"
                      variant={formData.status === "PENDING" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData({ ...formData, status: "PENDING" })}
                      className="rounded-lg"
                    >
                      Menunggu
                    </Button>
                    <Button
                      type="button"
                      variant={formData.status === "VOID" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData({ ...formData, status: "VOID" })}
                      className="rounded-lg"
                    >
                      Void
                    </Button>
                  </div>
                </div>

                {/* Upload Bukti */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Upload Bukti
                  </Label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-gray-300 transition-colors">
                    {formData.proof ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between bg-white p-3 rounded-lg border">
                          <div className="flex items-center">
                            {formData.proof.type === 'application/pdf' ? (
                              <svg className="w-10 h-10 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-10 h-10 text-blue-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                            )}
                            <div className="text-left">
                              <p className="text-sm font-medium text-gray-900">{formData.proof.name}</p>
                              <p className="text-xs text-gray-500">{(formData.proof.size / 1024 / 1024).toFixed(2)} MB</p>
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
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Ganti File
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 mb-3">
                          Tarik & lepas foto bukti atau klik untuk unggah
                        </p>
                        <Button
                          type="button"
                          variant="default"
                          size="default"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Pilih File
                        </Button>
                        <p className="text-xs text-gray-400 mt-3">
                          File types: JPG/PNG/PDF. Max 5MB
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={handleFileSelect}
                  />
                </div>

                {/* Catatan */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                    Catatan
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Contoh: pembayaran SPP bulan Desember"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="rounded-lg border-gray-200 resize-none"
                    rows={3}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => handleSubmit(false)}
                    disabled={loading}
                    className="flex-1 h-11 rounded-lg bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? "Menyimpan..." : "Simpan"}
                  </Button>
                  <Button
                    onClick={() => handleSubmit(true)}
                    disabled={loading}
                    variant="outline"
                    className="flex-1 h-11 rounded-lg border-gray-300"
                  >
                    Simpan & Buat Kwitansi
                  </Button>
                </div>

                {/* Footer */}
                <p className="text-xs text-gray-500 text-center pt-2">
                  Tercatat oleh: {session?.user?.name || "Bendahara"}
                </p>
              </CardContent>
            </Card>

            {/* Right Column - History Table Card */}
            <Card className="rounded-2xl border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    Riwayat {activeTab === "INCOME" ? "Pemasukan" : "Pengeluaran"}
                  </CardTitle>
                  <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                    <SelectTrigger className="w-32 h-9 rounded-lg border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bulan-ini">Bulan ini</SelectItem>
                      <SelectItem value="bulan-lalu">Bulan lalu</SelectItem>
                      <SelectItem value="tahun-ini">Tahun ini</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Search */}
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari nama/nomor…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 rounded-lg border-gray-200"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="text-xs font-semibold text-gray-600 py-3">Tanggal</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600">Kategori Akun</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600">Nama</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600">Nominal</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600">Akun Masuk</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600">Status</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600">Petugas</TableHead>
                        <TableHead className="text-xs font-semibold text-gray-600 text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.length > 0 ? (
                        transactions.slice(0, 4).map((transaction) => (
                          <TableRow key={transaction.id} className="hover:bg-gray-50/50">
                            <TableCell className="text-sm py-3">
                              {formatDate(transaction.date)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {transaction.category?.name || 'N/A'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {transaction.fromTo || transaction.description?.split(' - ')[0] || 'N/A'}
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                              {formatCurrency(Number(transaction.amount))}
                            </TableCell>
                            <TableCell className="text-sm">
                              {transaction.coaAccount?.name || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={transaction.status}
                                onValueChange={(value) => handleStatusChange(transaction.id, value)}
                                disabled={updatingStatus === transaction.id}
                              >
                                <SelectTrigger className={`w-[110px] h-7 text-xs border-0 ${
                                  transaction.status === 'PAID' 
                                    ? 'bg-green-100 text-green-700' 
                                    : transaction.status === 'PENDING'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  <SelectValue>
                                    {transaction.status === 'PAID' ? 'Lunas' : 
                                     transaction.status === 'PENDING' ? 'Menunggu' : 'Void'}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PENDING" className="text-xs">
                                    Menunggu
                                  </SelectItem>
                                  <SelectItem value="PAID" className="text-xs">
                                    Lunas
                                  </SelectItem>
                                  <SelectItem value="VOID" className="text-xs">
                                    Void
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-sm">
                              {transaction.createdBy?.name || 'Admin TU'}
                            </TableCell>
                            <TableCell className="text-center">
                              <button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium">
                                <Eye className="h-3 w-3" />
                                Lihat
                              </button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-gray-400">
                            Belum ada transaksi
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
