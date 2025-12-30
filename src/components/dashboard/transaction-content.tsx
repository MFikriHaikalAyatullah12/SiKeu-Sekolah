"use client";

import { useState, useEffect } from "react";
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
import { Upload, Search, Eye } from "lucide-react";
import { toast } from "sonner";

type TransactionType = "INCOME" | "EXPENSE";

// COA Structure - Kategori untuk Pemasukan
const incomeCOA = [
  {
    code: "1100",
    name: "1100 - Aktiva Lancar",
    types: [
      { code: "1110", name: "1110 - Kas di Bendahara" },
      { code: "1120", name: "1120 - Bank (Bank Sekolah)" },
      { code: "1130", name: "1130 - Piutang SPP Siswa" },
    ],
  },
  {
    code: "1200",
    name: "1200 - Aktiva Tetap",
    types: [
      { code: "1210", name: "1210 - Tanah" },
      { code: "1220", name: "1220 - Bangunan" },
      { code: "1230", name: "1230 - Peralatan dan Mesin" },
    ],
  },
  {
    code: "2100",
    name: "2100 - Kewajiban Jangka Pendek",
    types: [
      { code: "2110", name: "2110 - Utang Gaji Guru" },
      { code: "2120", name: "2120 - Utang Pemasok" },
    ],
  },
  {
    code: "2200",
    name: "2200 - Kewajiban Jangka Panjang",
    types: [
      { code: "2210", name: "2210 - Utang Bank" },
    ],
  },
  {
    code: "3100",
    name: "3100 - Modal (Ekuitas)",
    types: [
      { code: "3100", name: "3100 - Modal Awal Sekolah" },
      { code: "3200", name: "3200 - Saldo Laba/Rugi" },
    ],
  },
  {
    code: "4100",
    name: "4100 - Pendapatan (Revenue)",
    types: [
      { code: "4100", name: "4100 - Pendapatan SPP Siswa" },
      { code: "4200", name: "4200 - Dana Bantuan Operasional Sekolah (BOS)" },
      { code: "4300", name: "4300 - Pendapatan Lain-lain (Donasi, Kegiatan Ekstrakurikuler)" },
    ],
  },
];

// COA for Pengeluaran
const expenseCOA = [
  {
    code: "5100",
    name: "5100 - Beban Operasional",
    types: [
      { code: "5100", name: "5100 - Beban Gaji Guru" },
      { code: "5200", name: "5200 - Beban Operasional Sekolah" },
      { code: "5300", name: "5300 - Beban Pemeliharaan" },
    ],
  },
];

// Akun Masuk Ke options (from Aktiva Lancar)
const accountDestinations = [
  { code: "1110", name: "1110 - Kas di Bendahara" },
  { code: "1120", name: "1120 - Bank (Bank Sekolah)" },
  { code: "1130", name: "1130 - Piutang SPP Siswa" },
];

export function TransactionContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TransactionType>("INCOME");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("bulan-ini");
  
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
                  >
                    <SelectTrigger className="h-10 rounded-lg border-gray-200">
                      <SelectValue placeholder="Pilih kategori" />
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
                    disabled={!formData.categoryCode}
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
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Tarik & lepas foto bukti atau klik untuk unggah
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      File types: JPG/PNG/PDF. Max 5MB
                    </p>
                  </div>
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
