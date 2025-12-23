"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Calendar,
  Upload,
  Search,
  ChevronDown,
  Loader2,
  FileText,
  Receipt as ReceiptIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type TransactionType = "INCOME" | "EXPENSE";
type PaymentMethod = "CASH" | "BANK_TRANSFER" | "QRIS";
type PaymentStatus = "PAID" | "PENDING";

export function TransactionContent() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<TransactionType>("INCOME");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [schools, setSchools] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "",
    categoryId: "",
    fromTo: "",
    paymentMethod: "CASH" as PaymentMethod,
    status: "PAID" as PaymentStatus,
    proof: null as File | null,
    notes: "",
    schoolId: "",
  });

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
    fetchSchools();
  }, [activeTab]);

  const fetchSchools = async () => {
    try {
      const response = await fetch("/api/schools");
      if (response.ok) {
        const data = await response.json();
        setSchools(data.schools || []);
      }
    } catch (error) {
      console.error("Failed to fetch schools:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/transactions?type=${activeTab}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("Ukuran file maksimal 5MB");
        return;
      }
      setFormData({ ...formData, proof: file });
      toast.success("File berhasil dipilih");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("Ukuran file maksimal 5MB");
        return;
      }
      setFormData({ ...formData, proof: file });
      toast.success("File berhasil dipilih");
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      amount: "",
      categoryId: "",
      fromTo: "",
      paymentMethod: "CASH",
      status: "PAID",
      proof: null,
      notes: "",
      schoolId: "",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (createReceipt: boolean = false) => {
    // Validation
    if (schools.length > 0 && !formData.schoolId) {
      toast.error("Pilih sekolah terlebih dahulu");
      return;
    }

    if (!formData.categoryId || !formData.amount || !formData.fromTo) {
      toast.error("Mohon lengkapi semua field yang diperlukan");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          type: activeTab,
          amount: parseFloat(formData.amount),
          description: formData.fromTo,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`${activeTab === "INCOME" ? "Pemasukan" : "Pengeluaran"} berhasil ditambahkan`);
        
        // If create receipt button clicked and transaction is INCOME
        if (createReceipt && activeTab === "INCOME" && data.transaction?.id) {
          // Generate receipt
          try {
            const receiptResponse = await fetch(`/api/transactions/${data.transaction.id}/receipt`, {
              method: "GET",
            });
            if (receiptResponse.ok) {
              const blob = await receiptResponse.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `kwitansi-${data.transaction.id}.pdf`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
              toast.success("Kwitansi berhasil dibuat dan diunduh");
            }
          } catch (error) {
            console.error("Failed to generate receipt:", error);
            toast.error("Gagal membuat kwitansi");
          }
        }

        resetForm();
        fetchTransactions();
      } else {
        toast.error(data.error || "Gagal menambahkan transaksi");
      }
    } catch (error) {
      toast.error("Gagal menambahkan transaksi");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((cat) => cat.type === activeTab);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    switch (sortBy) {
      case "date-desc":
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case "date-asc":
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case "amount-desc":
        return parseFloat(b.amount) - parseFloat(a.amount);
      case "amount-asc":
        return parseFloat(a.amount) - parseFloat(b.amount);
      default:
        return 0;
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50/50">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transaksi</h1>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TransactionType)}>
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 bg-white border shadow-sm">
          <TabsTrigger
            value="INCOME"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Pemasukan
          </TabsTrigger>
          <TabsTrigger
            value="EXPENSE"
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Pengeluaran
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side - Form */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Input Transaksi Baru - {activeTab === "INCOME" ? "Pemasukan" : "Pengeluaran"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date and Amount Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-medium">
                      Tanggal
                    </Label>
                    <div className="relative">
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="pl-3"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm font-medium">
                      Nominal
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-sm text-gray-500">Rp</span>
                      <Input
                        id="amount"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* School Selection (if super admin) */}
                {schools.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="school" className="text-sm font-medium">
                      Sekolah
                    </Label>
                    <Select
                      value={formData.schoolId}
                      onValueChange={async (value) => {
                        setFormData({ ...formData, schoolId: value, categoryId: "" });
                        try {
                          const response = await fetch(`/api/categories?schoolId=${value}`);
                          if (response.ok) {
                            const data = await response.json();
                            setCategories(data.categories || []);
                          }
                        } catch (error) {
                          console.error("Failed to fetch categories:", error);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih sekolah" />
                      </SelectTrigger>
                      <SelectContent>
                        {schools.map((school) => (
                          <SelectItem key={school.id} value={school.id}>
                            {school.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">
                    Kategori
                  </Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredCategories.length === 0 ? (
                        <div className="p-2 text-sm text-gray-500 text-center">
                          Tidak ada kategori tersedia
                        </div>
                      ) : (
                        filteredCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* From/To */}
                <div className="space-y-2">
                  <Label htmlFor="fromTo" className="text-sm font-medium">
                    {activeTab === "INCOME" ? "Dari/Penerima" : "Dari/Penerima"}
                  </Label>
                  <Input
                    id="fromTo"
                    value={formData.fromTo}
                    onChange={(e) => setFormData({ ...formData, fromTo: e.target.value })}
                    placeholder="Nama Siswa atau Donatur"
                  />
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Metode Pembayaran</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.paymentMethod === "CASH" ? "default" : "outline"}
                      className={
                        formData.paymentMethod === "CASH"
                          ? "flex-1 bg-blue-600 hover:bg-blue-700"
                          : "flex-1"
                      }
                      onClick={() => setFormData({ ...formData, paymentMethod: "CASH" })}
                    >
                      Tunai
                    </Button>
                    <Button
                      type="button"
                      variant={formData.paymentMethod === "BANK_TRANSFER" ? "default" : "outline"}
                      className={
                        formData.paymentMethod === "BANK_TRANSFER"
                          ? "flex-1 bg-blue-600 hover:bg-blue-700"
                          : "flex-1"
                      }
                      onClick={() => setFormData({ ...formData, paymentMethod: "BANK_TRANSFER" })}
                    >
                      Transfer Bank
                    </Button>
                    <Button
                      type="button"
                      variant={formData.paymentMethod === "QRIS" ? "default" : "outline"}
                      className={
                        formData.paymentMethod === "QRIS"
                          ? "flex-1 bg-blue-600 hover:bg-blue-700"
                          : "flex-1"
                      }
                      onClick={() => setFormData({ ...formData, paymentMethod: "QRIS" })}
                    >
                      QRIS
                    </Button>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.status === "PAID" ? "default" : "outline"}
                      className={
                        formData.status === "PAID"
                          ? "flex-1 bg-green-600 hover:bg-green-700"
                          : "flex-1"
                      }
                      onClick={() => setFormData({ ...formData, status: "PAID" })}
                    >
                      Lunas
                    </Button>
                    <Button
                      type="button"
                      variant={formData.status === "PENDING" ? "default" : "outline"}
                      className={
                        formData.status === "PENDING"
                          ? "flex-1 bg-yellow-600 hover:bg-yellow-700"
                          : "flex-1"
                      }
                      onClick={() => setFormData({ ...formData, status: "PENDING" })}
                    >
                      Menunggu
                    </Button>
                  </div>
                </div>

                {/* Upload Proof */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Upload Bukti</Label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Seret & Lepas file di sini</p>
                    <Button type="button" variant="outline" size="sm" className="mt-2">
                      Pilih File
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">Format: JPG, PNG, PDF. Max 5MB.</p>
                    {formData.proof && (
                      <p className="text-xs text-green-600 mt-2 font-medium">
                        ✓ {formData.proof.name}
                      </p>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Catatan
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Catatan (optional)"
                    rows={3}
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-2">
                  {activeTab === "INCOME" && (
                    <Button
                      onClick={() => handleSubmit(true)}
                      disabled={loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <ReceiptIcon className="mr-2 h-4 w-4" />
                          Simpan & Buat Kwitansi
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    onClick={() => handleSubmit(false)}
                    disabled={loading}
                    variant={activeTab === "INCOME" ? "outline" : "default"}
                    className={activeTab === "EXPENSE" ? "flex-1 bg-blue-600 hover:bg-blue-700" : "flex-1"}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Right Side - Transaction History */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Riwayat {activeTab === "INCOME" ? "Pemasukan" : "Pengeluaran"} Terbaru
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Sort */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Cari transaksi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">Tanggal (Terbaru)</SelectItem>
                      <SelectItem value="date-asc">Tanggal (Terlama)</SelectItem>
                      <SelectItem value="amount-desc">Nominal (Tertinggi)</SelectItem>
                      <SelectItem value="amount-asc">Nominal (Terendah)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-xs">Tanggal</TableHead>
                        <TableHead className="font-semibold text-xs">Nominal</TableHead>
                        <TableHead className="font-semibold text-xs">Kategori</TableHead>
                        <TableHead className="font-semibold text-xs">
                          {activeTab === "INCOME" ? "Dari/Pen" : "Dari/Pen"}
                        </TableHead>
                        <TableHead className="font-semibold text-xs">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm">Belum ada transaksi</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        sortedTransactions.slice(0, 10).map((transaction) => (
                          <TableRow key={transaction.id} className="hover:bg-gray-50">
                            <TableCell className="text-sm">
                              {formatDate(transaction.date)}
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                              {formatCurrency(parseFloat(transaction.amount))}
                            </TableCell>
                            <TableCell className="text-sm">
                              {transaction.category?.name || "-"}
                            </TableCell>
                            <TableCell className="text-sm max-w-[120px] truncate">
                              {transaction.description}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  transaction.status === "PAID"
                                    ? "bg-green-50 text-green-700 border-green-200 text-xs"
                                    : "bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                                }
                              >
                                {transaction.status === "PAID" ? "Lunas" : "Menunggu"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {sortedTransactions.length > 10 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <Button variant="outline" size="sm" disabled={currentPage === 1}>
                      Previous
                    </Button>
                    <div className="flex gap-1">
                      {[1, 2, 3].map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                      <span className="flex items-center px-2">...</span>
                      <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                        30
                      </Button>
                    </div>
                    <Button variant="outline" size="sm">
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
