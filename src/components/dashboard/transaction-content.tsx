"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Printer,
  Filter,
  Eye,
  X,
  User,
  Clock,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type TransactionType = "INCOME" | "EXPENSE";
type PaymentMethod = "CASH" | "BANK_TRANSFER" | "E_WALLET";
type PaymentStatus = "PAID" | "PENDING" | "VOID";

// Kategori Pemasukan dengan Jenis terkait
const incomeCategories = [
  {
    id: "spp",
    name: "SPP / Iuran Bulanan",
    types: [
      { id: "spp-bulan-berjalan", name: "SPP Bulan Berjalan" },
      { id: "tunggakan-spp", name: "Tunggakan SPP" },
      { id: "denda-keterlambatan", name: "Denda Keterlambatan" },
      { id: "spp-kegiatan-khusus", name: "SPP Kegiatan (khusus)" },
    ],
  },
  {
    id: "iuran-kegiatan",
    name: "Iuran Kegiatan / Event",
    types: [
      { id: "try-out", name: "Try Out" },
      { id: "study-tour", name: "Study Tour" },
      { id: "pramuka", name: "Pramuka" },
      { id: "ekskul", name: "Ekstrakurikuler" },
      { id: "lainnya", name: "Lainnya" },
    ],
  },
  {
    id: "uang-pangkal",
    name: "Uang Pangkal / Pendaftaran",
    types: [
      { id: "pendaftaran-baru", name: "Pendaftaran Siswa Baru" },
      { id: "daftar-ulang", name: "Daftar Ulang" },
      { id: "uang-pangkal", name: "Uang Pangkal" },
    ],
  },
  {
    id: "donasi",
    name: "Donasi / Sumbangan",
    types: [
      { id: "donasi-alumni", name: "Donasi Alumni" },
      { id: "donasi-wali", name: "Donasi Wali Murid" },
      { id: "donasi-umum", name: "Donasi Umum" },
      { id: "infaq", name: "Infaq / Sedekah" },
    ],
  },
  {
    id: "bantuan",
    name: "Bantuan / Dana Pemerintah",
    types: [
      { id: "bos", name: "Dana BOS" },
      { id: "bop", name: "Dana BOP" },
      { id: "hibah", name: "Hibah Pemerintah" },
      { id: "csr", name: "CSR Perusahaan" },
    ],
  },
  {
    id: "usaha-sekolah",
    name: "Usaha Sekolah",
    types: [
      { id: "kantin", name: "Kantin" },
      { id: "koperasi", name: "Koperasi" },
      { id: "fotokopi", name: "Fotokopi" },
      { id: "sewa-gedung", name: "Sewa Gedung" },
    ],
  },
  {
    id: "lain-lain",
    name: "Lain-lain",
    types: [
      { id: "bunga-bank", name: "Bunga Bank" },
      { id: "penjualan-aset", name: "Penjualan Aset" },
      { id: "lainnya", name: "Lainnya" },
    ],
  },
];

// Kategori Pengeluaran dengan Jenis terkait
const expenseCategories = [
  {
    id: "operasional",
    name: "Operasional Harian",
    types: [
      { id: "listrik", name: "Listrik" },
      { id: "air", name: "Air" },
      { id: "internet", name: "Internet" },
      { id: "atk", name: "ATK" },
      { id: "kebersihan", name: "Kebersihan" },
    ],
  },
  {
    id: "gaji",
    name: "Gaji Guru & Staf",
    types: [
      { id: "gaji-guru", name: "Gaji Guru" },
      { id: "gaji-staf", name: "Gaji Staf" },
      { id: "honor", name: "Honor" },
      { id: "tunjangan", name: "Tunjangan" },
    ],
  },
  {
    id: "fasilitas",
    name: "Fasilitas Sekolah",
    types: [
      { id: "perbaikan", name: "Perbaikan" },
      { id: "pembelian-alat", name: "Pembelian Alat" },
      { id: "renovasi", name: "Renovasi" },
    ],
  },
  {
    id: "kegiatan-siswa",
    name: "Kegiatan Siswa",
    types: [
      { id: "lomba", name: "Lomba" },
      { id: "study-tour-exp", name: "Study Tour" },
      { id: "upacara", name: "Upacara" },
    ],
  },
  {
    id: "lain-lain-exp",
    name: "Lain-lain",
    types: [
      { id: "pajak", name: "Pajak" },
      { id: "asuransi", name: "Asuransi" },
      { id: "lainnya-exp", name: "Lainnya" },
    ],
  },
];

// Sample data for the table
const sampleIncomeData = [
  {
    id: "1",
    date: "2025-12-18",
    categoryId: "spp",
    categoryName: "SPP",
    typeId: "spp-bulan-berjalan",
    typeName: "SPP Bulan Berjalan",
    name: "Budi Santoso",
    amount: 1500000,
    method: "CASH",
    status: "PAID",
    petugas: "Bendahara",
    createdBy: "Siti Rahayu",
    createdAt: "2025-12-18T09:30:00",
    updatedBy: "Siti Rahayu",
    updatedAt: "2025-12-18T09:30:00",
  },
  {
    id: "2",
    date: "2025-12-17",
    categoryId: "donasi",
    categoryName: "Donasi",
    typeId: "donasi-alumni",
    typeName: "Donasi Alumni",
    name: "Alumni 2010",
    amount: 5000000,
    method: "BANK_TRANSFER",
    status: "PAID",
    petugas: "Admin TU",
    createdBy: "Ahmad Fauzi",
    createdAt: "2025-12-17T14:15:00",
    updatedBy: "Siti Rahayu",
    updatedAt: "2025-12-17T16:30:00",
  },
  {
    id: "3",
    date: "2025-12-16",
    categoryId: "iuran-kegiatan",
    categoryName: "Iuran Kegiatan",
    typeId: "try-out",
    typeName: "Try Out",
    name: "Panitia Try Out",
    amount: 750000,
    method: "CASH",
    status: "PENDING",
    petugas: "Bendahara",
    createdBy: "Siti Rahayu",
    createdAt: "2025-12-16T10:00:00",
    updatedBy: "Siti Rahayu",
    updatedAt: "2025-12-16T10:00:00",
  },
  {
    id: "4",
    date: "2025-12-15",
    categoryId: "usaha-sekolah",
    categoryName: "Usaha Sekolah",
    typeId: "kantin",
    typeName: "Kantin",
    name: "Kantin Sekolah",
    amount: 300000,
    method: "CASH",
    status: "PAID",
    petugas: "Admin TU",
    createdBy: "Ahmad Fauzi",
    createdAt: "2025-12-15T08:45:00",
    updatedBy: "Ahmad Fauzi",
    updatedAt: "2025-12-15T08:45:00",
  },
];

// List of petugas for filter
const petugasList = [
  { id: "semua", name: "Semua Petugas" },
  { id: "bendahara", name: "Bendahara" },
  { id: "admin-tu", name: "Admin TU" },
  { id: "kepala-sekolah", name: "Kepala Sekolah" },
];

export function TransactionContent() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<TransactionType>("INCOME");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("bulan-ini");
  const [filterPetugas, setFilterPetugas] = useState("semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    date: "2025-12-18",
    amount: "1500000",
    categoryId: "spp",
    typeId: "spp-bulan-berjalan",
    namaPembayar: "Budi Santoso",
    periode: "2025-12",
    paymentMethod: "CASH" as PaymentMethod,
    status: "PAID" as PaymentStatus,
    proof: null as File | null,
    notes: "",
    schoolId: "",
  });

  // Get available types based on selected category
  const currentCategories = activeTab === "INCOME" ? incomeCategories : expenseCategories;
  const selectedCategory = currentCategories.find(cat => cat.id === formData.categoryId);
  const availableTypes = selectedCategory?.types || [];

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
      typeId: "",
      namaPembayar: "",
      periode: "",
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

  const handleSubmit = async (printReceipt: boolean = false) => {
    if (schools.length > 0 && !formData.schoolId) {
      toast.error("Pilih sekolah terlebih dahulu");
      return;
    }

    if (!formData.categoryId || !formData.amount || !formData.namaPembayar) {
      toast.error("Mohon lengkapi semua field yang diperlukan");
      return;
    }

    setLoading(true);
    try {
      const selectedCat = currentCategories.find(c => c.id === formData.categoryId);
      const selectedType = selectedCat?.types.find(t => t.id === formData.typeId);
      
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          type: activeTab,
          amount: parseFloat(formData.amount),
          description: formData.namaPembayar,
          fromTo: formData.namaPembayar,
          categoryName: selectedCat?.name,
          typeName: selectedType?.name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const typeText = activeTab === "INCOME" ? "Pemasukan" : "Pengeluaran";
        toast.success(`${typeText} berhasil ditambahkan`);
        
        if (printReceipt && data.transaction?.id) {
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PAID":
        return "Lunas";
      case "PENDING":
        return "Menunggu";
      case "VOID":
        return "Void";
      default:
        return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700 border-green-200 hover:bg-green-100";
      case "PENDING":
        return "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100";
      case "VOID":
        return "bg-red-100 text-red-700 border-red-200 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "CASH":
        return "Tunai";
      case "BANK_TRANSFER":
        return "Transfer";
      case "E_WALLET":
        return "E-Wallet";
      default:
        return method;
    }
  };

  // Combine API data with sample data for display
  const displayTransactions = transactions.length > 0 ? transactions : sampleIncomeData;

  const filteredTransactions = displayTransactions.filter((transaction) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      transaction.name?.toLowerCase().includes(searchLower) ||
      transaction.description?.toLowerCase().includes(searchLower) ||
      transaction.categoryName?.toLowerCase().includes(searchLower) ||
      transaction.category?.name?.toLowerCase().includes(searchLower);
    
    // Filter by petugas
    const matchesPetugas = filterPetugas === "semua" || 
      transaction.petugas?.toLowerCase().replace(/\s+/g, '-') === filterPetugas;
    
    return matchesSearch && matchesPetugas;
  });

  const handleViewTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const itemsPerPage = 4;
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50/80 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transaksi</h1>
      </div>

      {/* Tabs - Pill Style */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TransactionType)}>
        <TabsList className="inline-flex h-11 items-center justify-center rounded-full bg-gray-100 p-1">
          <TabsTrigger
            value="INCOME"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-6 py-2 text-sm font-medium transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            Pemasukan
          </TabsTrigger>
          <TabsTrigger
            value="EXPENSE"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-6 py-2 text-sm font-medium transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            Pengeluaran
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Two Column Grid - 56% / 44% */}
          <div className="grid grid-cols-1 lg:grid-cols-[56fr_44fr] gap-6">
            {/* Left Side - Form Card */}
            <Card className="rounded-2xl border-0 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">
                  {activeTab === "INCOME" ? "Input Pemasukan" : "Input Pengeluaran"}
                </CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  {activeTab === "INCOME" 
                    ? "Catat transaksi pemasukan sekolah" 
                    : "Catat transaksi pengeluaran sekolah"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Row 1: Tanggal & Nominal */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                      Tanggal
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="pl-10 h-11 rounded-lg border-gray-200"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                      Nominal
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded">
                        Rp
                      </span>
                      <Input
                        id="amount"
                        type="text"
                        value={formData.amount ? Number(formData.amount).toLocaleString('id-ID') : ''}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setFormData({ ...formData, amount: value });
                        }}
                        placeholder="0"
                        className="pl-14 h-11 rounded-lg border-gray-200"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Kategori & Jenis */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      {activeTab === "INCOME" ? "Kategori Pemasukan" : "Kategori Pengeluaran"}
                    </Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) => {
                        setFormData({ ...formData, categoryId: value, typeId: "" });
                      }}
                    >
                      <SelectTrigger className="h-11 rounded-lg border-gray-200">
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      {activeTab === "INCOME" ? "Jenis Pemasukan" : "Jenis Pengeluaran"}
                    </Label>
                    <Select
                      value={formData.typeId}
                      onValueChange={(value) => setFormData({ ...formData, typeId: value })}
                      disabled={!formData.categoryId}
                    >
                      <SelectTrigger className="h-11 rounded-lg border-gray-200">
                        <SelectValue placeholder={formData.categoryId ? "Pilih jenis" : "Pilih kategori dulu"} />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 3: Nama Pembayar (full width) */}
                <div className="space-y-2">
                  <Label htmlFor="namaPembayar" className="text-sm font-medium text-gray-700">
                    {activeTab === "INCOME" ? "Nama Pembayar" : "Nama Penerima"}
                  </Label>
                  <Input
                    id="namaPembayar"
                    value={formData.namaPembayar}
                    onChange={(e) => setFormData({ ...formData, namaPembayar: e.target.value })}
                    placeholder={activeTab === "INCOME" ? "Masukkan nama pembayar" : "Masukkan nama penerima"}
                    className="h-11 rounded-lg border-gray-200"
                  />
                </div>

                {/* Row 4: Periode & Metode Pembayaran */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="periode" className="text-sm font-medium text-gray-700">
                      Periode
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="periode"
                        type="month"
                        value={formData.periode}
                        onChange={(e) => setFormData({ ...formData, periode: e.target.value })}
                        className="pl-10 h-11 rounded-lg border-gray-200"
                      />
                    </div>
                    <p className="text-xs text-gray-400">khusus SPP/iuran</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Metode Pembayaran</Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value: PaymentMethod) => setFormData({ ...formData, paymentMethod: value })}
                    >
                      <SelectTrigger className="h-11 rounded-lg border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">Tunai</SelectItem>
                        <SelectItem value="BANK_TRANSFER">Transfer</SelectItem>
                        <SelectItem value="E_WALLET">E-Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 5: Status Chips */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: "PAID" })}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.status === "PAID"
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Lunas
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: "PENDING" })}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.status === "PENDING"
                          ? "bg-gray-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Menunggu
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, status: "VOID" })}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.status === "VOID"
                          ? "bg-gray-700 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Void
                    </button>
                  </div>
                </div>

                {/* Row 6: Upload Bukti */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Upload Bukti</Label>
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50/50"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-1">
                      Tarik & lepas foto bukti atau klik untuk unggah
                    </p>
                    <p className="text-xs text-gray-400">File types: JPG/PNG/PDF. Max 5MB</p>
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

                {/* Row 7: Catatan */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                    Catatan
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Contoh: pembayaran SPP bulan Desember"
                    rows={3}
                    className="rounded-lg border-gray-200 resize-none"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => handleSubmit(false)}
                    disabled={loading}
                    className="flex-1 h-11 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium"
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
                  <Button
                    onClick={() => handleSubmit(true)}
                    disabled={loading}
                    variant="outline"
                    className="flex-1 h-11 rounded-xl font-medium border-gray-900 text-gray-900 hover:bg-gray-100"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan & Buat Kwitansi"
                    )}
                  </Button>
                </div>

                {/* Helper note */}
                <p className="text-xs text-gray-400 text-center">
                  Kwitansi dibuat otomatis jika status Lunas.
                </p>
              </CardContent>
            </Card>

            {/* Right Side - Transaction History Card */}
            <Card className="rounded-2xl border-0 shadow-sm bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">
                  Riwayat {activeTab === "INCOME" ? "Pemasukan" : "Pengeluaran"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Filter */}
                <div className="flex flex-wrap gap-3">
                  <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Cari nama/nomor..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-10 rounded-lg border-gray-200"
                    />
                  </div>
                  <Select value={filterPetugas} onValueChange={setFilterPetugas}>
                    <SelectTrigger className="w-[140px] h-10 rounded-lg border-gray-200">
                      <User className="h-4 w-4 mr-2 text-gray-400" />
                      <SelectValue placeholder="Petugas" />
                    </SelectTrigger>
                    <SelectContent>
                      {petugasList.map((petugas) => (
                        <SelectItem key={petugas.id} value={petugas.id}>
                          {petugas.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                    <SelectTrigger className="w-[130px] h-10 rounded-lg border-gray-200">
                      <Filter className="h-4 w-4 mr-2 text-gray-400" />
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bulan-ini">Bulan ini</SelectItem>
                      <SelectItem value="minggu-ini">Minggu ini</SelectItem>
                      <SelectItem value="hari-ini">Hari ini</SelectItem>
                      <SelectItem value="semua">Semua</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table */}
                <div className="border rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="font-semibold text-xs text-gray-600 py-3">Tanggal</TableHead>
                        <TableHead className="font-semibold text-xs text-gray-600">Kategori</TableHead>
                        <TableHead className="font-semibold text-xs text-gray-600">Jenis</TableHead>
                        <TableHead className="font-semibold text-xs text-gray-600">Nama</TableHead>
                        <TableHead className="font-semibold text-xs text-gray-600">Nominal</TableHead>
                        <TableHead className="font-semibold text-xs text-gray-600">Metode</TableHead>
                        <TableHead className="font-semibold text-xs text-gray-600">Petugas</TableHead>
                        <TableHead className="font-semibold text-xs text-gray-600">Status</TableHead>
                        <TableHead className="font-semibold text-xs text-gray-600 text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                            <FileText className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm">Belum ada transaksi</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedTransactions.map((transaction) => (
                          <TableRow key={transaction.id} className="hover:bg-gray-50/50">
                            <TableCell className="text-sm py-3">
                              {formatDate(transaction.date)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {transaction.categoryName || transaction.category?.name || "-"}
                            </TableCell>
                            <TableCell className="text-sm max-w-[100px] truncate">
                              {transaction.typeName || transaction.description || "-"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {transaction.name || transaction.fromTo || "-"}
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                              {formatCurrency(parseFloat(transaction.amount))}
                            </TableCell>
                            <TableCell className="text-sm">
                              {getPaymentMethodLabel(transaction.method || transaction.paymentMethod || "CASH")}
                            </TableCell>
                            <TableCell className="text-sm">
                              <span className="inline-flex items-center gap-1 text-gray-600">
                                <User className="h-3 w-3" />
                                {transaction.petugas || "Bendahara"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`text-xs px-2 py-0.5 rounded-md ${getStatusBadgeClass(transaction.status)}`}
                              >
                                {getStatusLabel(transaction.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <button 
                                onClick={() => handleViewTransaction(transaction)}
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs font-medium"
                              >
                                <Eye className="h-3 w-3" />
                                Lihat
                              </button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {filteredTransactions.length > 0 && (
                  <div className="flex items-center justify-center gap-1 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "ghost"}
                        size="sm"
                        className={`w-8 h-8 p-0 text-xs ${
                          currentPage === page
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Transaction Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0 rounded-2xl">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-lg font-semibold">Detail Transaksi</DialogTitle>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="p-6 space-y-6">
              {/* Transaction Info */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tanggal</p>
                    <p className="text-sm font-medium">{formatDate(selectedTransaction.date)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Nominal</p>
                    <p className="text-sm font-bold text-blue-600">
                      {formatCurrency(parseFloat(selectedTransaction.amount))}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Kategori</p>
                    <p className="text-sm font-medium">
                      {selectedTransaction.categoryName || selectedTransaction.category?.name || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Jenis</p>
                    <p className="text-sm font-medium">
                      {selectedTransaction.typeName || selectedTransaction.description || "-"}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      {activeTab === "INCOME" ? "Nama Pembayar" : "Nama Penerima"}
                    </p>
                    <p className="text-sm font-medium">
                      {selectedTransaction.name || selectedTransaction.fromTo || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Metode Pembayaran</p>
                    <p className="text-sm font-medium">
                      {getPaymentMethodLabel(selectedTransaction.method || selectedTransaction.paymentMethod || "CASH")}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <Badge
                      variant="outline"
                      className={`text-xs px-2 py-0.5 rounded-md ${getStatusBadgeClass(selectedTransaction.status)}`}
                    >
                      {getStatusLabel(selectedTransaction.status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Petugas</p>
                    <p className="text-sm font-medium">
                      {selectedTransaction.petugas || "Bendahara"}
                    </p>
                  </div>
                </div>

                {selectedTransaction.notes && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Catatan</p>
                    <p className="text-sm text-gray-700">{selectedTransaction.notes}</p>
                  </div>
                )}
              </div>
              
              {/* Info Sistem Section */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Info Sistem
                </h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Dibuat oleh</span>
                    <span className="font-medium text-gray-700">
                      {selectedTransaction.createdBy || "Siti Rahayu"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Dibuat pada</span>
                    <span className="text-gray-700">
                      {formatDateTime(selectedTransaction.createdAt || selectedTransaction.date)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Terakhir diubah oleh</span>
                    <span className="font-medium text-gray-700">
                      {selectedTransaction.updatedBy || selectedTransaction.createdBy || "Siti Rahayu"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Terakhir diubah pada</span>
                    <span className="text-gray-700">
                      {formatDateTime(selectedTransaction.updatedAt || selectedTransaction.createdAt || selectedTransaction.date)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 h-10 rounded-lg"
                  onClick={() => setShowDetailModal(false)}
                >
                  Tutup
                </Button>
                <Button
                  className="flex-1 h-10 rounded-lg bg-blue-600 hover:bg-blue-700"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Cetak Kwitansi
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
