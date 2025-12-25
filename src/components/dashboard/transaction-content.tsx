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
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type TransactionType = "INCOME" | "EXPENSE";
type PaymentMethod = "CASH" | "BANK_TRANSFER" | "E_WALLET";
type PaymentStatus = "PAID" | "PENDING" | "VOID";

// Kategori Pemasukan dengan Jenis terkait (Chart of Accounts)
const incomeCategories = [
  {
    id: "1100",
    name: "1100 - Aktiva Lancar",
    types: [
      { id: "1110", name: "1110 - Kas di Bendahara" },
      { id: "1120", name: "1120 - Bank (Bank Sekolah)" },
      { id: "1130", name: "1130 - Piutang SPP Siswa" },
    ],
  },
  {
    id: "1200",
    name: "1200 - Aktiva Tetap",
    types: [
      { id: "1210", name: "1210 - Tanah" },
      { id: "1220", name: "1220 - Bangunan" },
      { id: "1230", name: "1230 - Peralatan dan Mesin" },
    ],
  },
  {
    id: "3100",
    name: "3100 - Modal (Ekuitas)",
    types: [
      { id: "3100", name: "3100 - Modal Awal Sekolah" },
      { id: "3200", name: "3200 - Saldo Laba/Rugi" },
    ],
  },
  {
    id: "4100",
    name: "4100 - Pendapatan (Revenue)",
    types: [
      { id: "4100", name: "4100 - Pendapatan SPP Siswa" },
      { id: "4200", name: "4200 - Dana Bantuan Operasional Sekolah (BOS)" },
      { id: "4300", name: "4300 - Pendapatan Lain-lain (Donasi, Ekstrakurikuler)" },
    ],
  },
];

// Kategori Pengeluaran dengan Jenis terkait (Chart of Accounts)
const expenseCategories = [
  {
    id: "2100",
    name: "2100 - Kewajiban",
    types: [
      { id: "2110", name: "2110 - Utang Gaji Guru" },
      { id: "2120", name: "2120 - Utang Pemasok (ATK, dll.)" },
      { id: "2210", name: "2210 - Utang Bank (Jika ada)" },
    ],
  },
  {
    id: "5100",
    name: "5100 - Beban",
    types: [
      { id: "5100", name: "5100 - Beban Gaji dan Kesejahteraan Guru/Karyawan" },
      { id: "5200", name: "5200 - Beban Operasional (Listrik, Air, Telepon)" },
      { id: "5300", name: "5300 - Beban Perlengkapan (ATK, Kebersihan)" },
      { id: "5400", name: "5400 - Beban Pemeliharaan (Gedung, Peralatan)" },
      { id: "5500", name: "5500 - Beban Penyusutan Aktiva Tetap" },
    ],
  },
];

// Sample data for the table - using COA codes
const sampleIncomeData = [
  {
    id: "1",
    date: "2025-12-18",
    categoryId: "4100",
    categoryName: "4100 - Pendapatan",
    typeId: "4100",
    typeName: "4100 - Pendapatan SPP Siswa",
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
    categoryId: "3100",
    categoryName: "3100 - Modal",
    typeId: "3100",
    typeName: "3100 - Modal Awal Sekolah",
    name: "Yayasan Pendidikan",
    amount: 10000000,
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
    categoryId: "1100",
    categoryName: "1100 - Aktiva Lancar",
    typeId: "1110",
    typeName: "1110 - Kas di Bendahara",
    name: "Dana Kas Awal Bulan",
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
    categoryId: "4100",
    categoryName: "4100 - Pendapatan",
    typeId: "4300",
    typeName: "4300 - Pendapatan Lain-lain",
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
  const [mounted, setMounted] = useState(false);
  
  // State untuk dialog form transaksi seperti di dashboard
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType>("INCOME");
  const [dialogFormData, setDialogFormData] = useState({
    categoryId: "",
    typeId: "",
    amount: "",
    description: "",
    date: "",
    status: "PAID" as PaymentStatus,
    schoolId: ""
  });
  
  // Form state - initialize with empty values to prevent hydration mismatch
  const [formData, setFormData] = useState({
    date: "",
    amount: "",
    categoryId: "",
    typeId: "",
    namaPembayar: "",
    periode: "",
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
  
  // Categories for dialog form
  const dialogCategories = transactionType === "INCOME" ? incomeCategories : expenseCategories;

  // Debug info
  console.log("Categories from DB:", categories.length);
  console.log("Dialog categories:", dialogCategories.length);
  console.log("Transaction type:", transactionType);

  // Set initial values on client-side only
  useEffect(() => {
    console.log("Component mounting, setting mounted to true");
    setMounted(true);
    const today = new Date().toISOString().split("T")[0];
    const currentMonth = new Date().toISOString().slice(0, 7);
    setFormData(prev => ({
      ...prev,
      date: today,
      periode: currentMonth,
    }));
  }, []);

  useEffect(() => {
    console.log("Main useEffect triggered - mounted:", mounted, "activeTab:", activeTab);
    if (mounted) {
      console.log("Calling fetchTransactions, fetchCategories, fetchSchools...");
      fetchTransactions();
      fetchCategories();
      fetchSchools();
      
      // Reset category and type when tab changes
      setFormData(prev => ({
        ...prev,
        categoryId: "",
        typeId: ""
      }));
    }
  }, [activeTab, mounted]);
  
  // Separate effect for periodic refresh
  useEffect(() => {
    if (mounted) {
      const interval = setInterval(() => {
        console.log("Periodic refresh of transactions");
        fetchTransactions();
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [mounted]); // Removed fetchTransactions from dependencies to prevent infinite loop

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
      setLoading(true);
      console.log("🔄 Fetching all transactions");
      
      // Fetch semua transaksi tanpa filter type di API
      const response = await fetch(`/api/transactions`);
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Fetched transactions:", data.transactions?.length || 0);
        console.log("📊 Transaction data sample:", data.transactions?.slice(0, 2)); // Log first 2 transactions for debug
        console.log("🏢 Current active tab:", activeTab);
        setTransactions(data.transactions || []);
      } else {
        console.error("❌ Failed to fetch transactions:", response.status);
        const errorData = await response.json();
        console.error("❌ Error data:", errorData);
        setTransactions([]);
      }
    } catch (error) {
      console.error("❌ Failed to fetch transactions:", error);
      toast.error("Gagal mengambil data transaksi");
      setTransactions([]);
    } finally {
      setLoading(false);
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
          type: activeTab,
          date: formData.date,
          amount: parseInt(formData.amount) || 0, // Pastikan sebagai integer penuh
          categoryId: formData.categoryId, // Gunakan categoryId langsung seperti dashboard
          description: `${selectedCat?.name} - ${selectedType?.name || ''} - ${formData.namaPembayar}`,
          fromTo: formData.namaPembayar,
          paymentMethod: formData.paymentMethod,
          status: formData.status,
          schoolId: formData.schoolId,
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
        // FORCE refresh data dari database dengan delay
        setTimeout(async () => {
          console.log("Force refreshing transactions after form submit...");
          await fetchTransactions();
        }, 500);
      } else {
        console.error("API Error:", data);
        toast.error(data.error || "Gagal menambahkan transaksi");
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast.error("Gagal menambahkan transaksi");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | string) => {
    // Konversi ke number dan pastikan valid
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (!numAmount || isNaN(numAmount) || numAmount === 0) return "Rp 0";
    
    // Format dengan pemisah titik untuk ribuan Indonesia
    return `Rp ${numAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
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

  // Filter transactions berdasarkan activeTab - pastikan filtering benar
  const displayTransactions = transactions.filter(transaction => {
    const matches = transaction.type === activeTab;
    console.log(`Transaction ${transaction.id} type: ${transaction.type}, activeTab: ${activeTab}, matches: ${matches}`);
    return matches;
  });
  
  console.log("Total transactions:", transactions.length);
  console.log("Display transactions for", activeTab + ":", displayTransactions.length);

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

  const handleDeleteTransaction = async (transaction: any) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus transaksi ini?\n\nNominal: ${formatCurrency(transaction.amount)}\nTanggal: ${formatDate(transaction.date)}`)) {
      return;
    }

    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Transaksi berhasil dihapus');
        // Langsung hapus dari state tanpa refresh halaman
        setTransactions(prevTransactions => 
          prevTransactions.filter(t => t.id !== transaction.id)
        );
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Gagal menghapus transaksi');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Terjadi kesalahan saat menghapus transaksi');
    }
  };

  // Fungsi untuk membuka dialog form transaksi seperti di dashboard
  const handleOpenDialog = (type: TransactionType) => {
    setTransactionType(type);
    setDialogFormData({
      categoryId: "",
      typeId: "",
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      status: "PAID",
      schoolId: schools.length > 0 ? schools[0].id : ""
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    // Reset form data
    setDialogFormData({
      categoryId: "",
      typeId: "",
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      status: "PAID",
      schoolId: ""
    });
  };



  const handleSubmitDialog = async () => {
    if (!dialogFormData.categoryId || !dialogFormData.amount) {
      toast.error("Mohon lengkapi semua field yang diperlukan");
      return;
    }

    // Validasi deskripsi - jika kosong, gunakan nama kategori sebagai default
    const finalDescription = dialogFormData.description || "Transaksi";

    setLoading(true);
    try {
      const selectedCat = dialogCategories.find(c => c.id === dialogFormData.categoryId);
      const selectedType = selectedCat?.types.find(t => t.id === dialogFormData.typeId);

      console.log("Form data:", dialogFormData);
      console.log("Selected category:", selectedCat);
      console.log("Transaction type:", transactionType);

      // Gunakan format yang sama seperti dashboard yang berhasil - SIMPLIFIED
      const requestBody = {
        type: transactionType,
        amount: parseFloat(dialogFormData.amount),
        description: `${selectedType?.name || selectedCat?.name} - ${finalDescription}`,
        date: dialogFormData.date,
        status: dialogFormData.status,
        fromTo: finalDescription,
        paymentMethod: "CASH",
        schoolId: dialogFormData.schoolId || undefined,
        categoryId: dialogFormData.categoryId // Gunakan categoryId langsung - API akan handle mapping
      };

      console.log("Request body:", requestBody);

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log("API Response:", response.status, data);

      if (response.ok) {
        toast.success(`${transactionType === "INCOME" ? "Pemasukan" : "Pengeluaran"} berhasil ditambahkan`);
        
        // Tutup dialog dan switch tab
        handleCloseDialog();
        setActiveTab(transactionType);
        
        // FORCE REFETCH data dari database dengan delay untuk memastikan data sudah tersimpan
        setTimeout(async () => {
          console.log("Force refreshing transactions after dialog submit...");
          await fetchTransactions();
        }, 500);
      } else {
        console.error("API Error:", data);
        toast.error(data.error || data.message || "Gagal menambahkan transaksi");
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Terjadi kesalahan saat menambahkan transaksi");
    } finally {
      setLoading(false);
    }
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

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50/80 min-h-screen">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48 sm:w-64"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50/80 min-h-screen">
      {/* Recent Transactions */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base font-semibold">Transaksi Terbaru</CardTitle>
            <p className="text-xs text-gray-500 mt-1">
              Menampilkan 1-5 dari {transactions.length} transaksi
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm"
              className="bg-green-600 hover:bg-green-700 h-9"
              onClick={() => handleOpenDialog("INCOME")}
            >
              <Plus className="h-4 w-4 mr-1" />
              Tambah Pemasukan
            </Button>
            <Button 
              size="sm"
              variant="destructive"
              className="h-9"
              onClick={() => handleOpenDialog("EXPENSE")}
            >
              <Plus className="h-4 w-4 mr-1" />
              Tambah Pengeluaran
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">Tanggal</TableHead>
                  <TableHead className="font-semibold text-gray-700">Tipe</TableHead>
                  <TableHead className="font-semibold text-gray-700">Kategori</TableHead>
                  <TableHead className="font-semibold text-gray-700">Nama</TableHead>
                  <TableHead className="font-semibold text-gray-700">Nominal</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="text-right font-semibold text-gray-700">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-12 w-12 text-gray-300" />
                        <p className="font-medium">Belum ada transaksi</p>
                        <p className="text-sm">Klik tombol di atas untuk menambahkan transaksi</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.slice(0, 5).map((transaction) => {
                    const formattedDate = transaction.date 
                      ? new Date(transaction.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })
                      : "Tidak ada tanggal";
                    
                    return (
                      <TableRow key={transaction.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-sm">
                          {formattedDate}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              transaction.type === "INCOME"
                                ? "bg-green-50 text-green-700 border-green-200 text-xs" 
                                : "bg-red-50 text-red-700 border-red-200 text-xs"
                            }
                          >
                            {transaction.type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{transaction.category?.name || transaction.categoryName || "Tidak ada kategori"}</TableCell>
                        <TableCell className="text-sm text-gray-600">{transaction.fromTo || transaction.description || transaction.name || "Tidak ada deskripsi"}</TableCell>
                        <TableCell className="font-semibold text-sm">
                          {formatCurrency(Number(transaction.amount))}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              transaction.status === "PAID"
                                ? "bg-blue-50 text-blue-700 border-blue-200 text-xs" 
                                : "bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                            }
                          >
                            {transaction.status === "PAID" ? "Lunas" : "Tertunda"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 hover:bg-blue-50"
                              onClick={() => handleViewTransaction(transaction)}
                              title="Lihat Detail"
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 hover:bg-red-50"
                              onClick={() => handleDeleteTransaction(transaction)}
                              title="Hapus Transaksi"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transaksi</h1>
      </div>

      {/* Tabs - Pill Style */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TransactionType)} key={`transaction-tabs-${activeTab}`}>
        <TabsList className="inline-flex h-11 items-center justify-center rounded-full bg-gray-100 p-1">
          <TabsTrigger
            key="tab-income"
            value="INCOME"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-6 py-2 text-sm font-medium transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
            suppressHydrationWarning
          >
            Pemasukan
          </TabsTrigger>
          <TabsTrigger
            key="tab-expense"
            value="EXPENSE"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-6 py-2 text-sm font-medium transition-all data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
            suppressHydrationWarning
          >
            Pengeluaran
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Two Column Grid - Better responsive layout */}
          <div className="grid grid-cols-1 xl:grid-cols-[56fr_44fr] gap-4 sm:gap-6">
            {/* Left Side - Form Card */}
            <Card className="rounded-2xl border-0 shadow-sm bg-white order-2 xl:order-1">
              <CardHeader className="pb-4 px-6">
                <CardTitle className="text-lg font-semibold">
                  {activeTab === "INCOME" ? "Input Pemasukan" : "Input Pengeluaran"}
                </CardTitle>
                <CardDescription className="text-sm text-gray-500">
                  {activeTab === "INCOME" 
                    ? "Catat transaksi pemasukan sekolah" 
                    : "Catat transaksi pengeluaran sekolah"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 px-6">
                {/* Row 1: Tanggal & Nominal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                            Tanggal Transaksi
                          </Label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="date"
                              type="date"
                              value={formData.date}
                              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                              className="pl-10 h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                            Nominal (Rupiah)
                          </Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded">
                              Rp
                            </span>
                            <Input
                              id="amount"
                              type="text"
                              value={formData.amount ? Number(formData.amount).toLocaleString('id-ID').replace(/,/g, '.') : ''}
                              onChange={(e) => {
                                // Hapus semua karakter selain angka untuk mendapat raw value
                                const rawValue = e.target.value.replace(/[^0-9]/g, '');
                                // Update state dengan raw value, tapi display akan terformat otomatis
                                setFormData({ ...formData, amount: rawValue });
                              }}
                              onFocus={(e) => {
                                // Saat focus, tampilkan raw value untuk editing
                                e.target.value = formData.amount;
                              }}
                              onBlur={(e) => {
                                // Saat blur, kembali ke format display
                                const rawValue = e.target.value.replace(/[^0-9]/g, '');
                                setFormData({ ...formData, amount: rawValue });
                              }}
                              placeholder="0"
                              className="pl-14 h-11 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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

                {/* Row 5: Status Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Status Pembayaran</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: "PAID", label: "Lunas", bgClass: "bg-green-500", hoverClass: "hover:bg-green-600" },
                      { key: "PENDING", label: "Menunggu", bgClass: "bg-yellow-500", hoverClass: "hover:bg-yellow-600" },
                      { key: "VOID", label: "Void", bgClass: "bg-gray-500", hoverClass: "hover:bg-gray-600" }
                    ].map((status, index) => (
                      <button
                        key={`status-button-${status.key}-${index}`}
                        type="button"
                        onClick={() => setFormData({ ...formData, status: status.key as PaymentStatus })}
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                          formData.status === status.key
                            ? `${status.bgClass} text-white shadow-md transform scale-105`
                            : `bg-gray-100 text-gray-600 hover:bg-gray-200 ${status.hoverClass} hover:text-white`
                        }`}
                        suppressHydrationWarning
                      >
                        {status.label}
                      </button>
                    ))}
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
            <Card className="rounded-2xl border-0 shadow-sm bg-white order-1 xl:order-2">
              <CardHeader className="pb-4 px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      Riwayat {activeTab === "INCOME" ? "Pemasukan" : "Pengeluaran"}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500 mt-1">
                      Data transaksi terbaru
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="px-3 py-1 text-xs">
                    {filteredTransactions.length} Data
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 px-6">
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Cari nama/nomor..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-10 rounded-lg border-gray-200 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex gap-2 sm:w-auto w-full">
                    <Select value={filterPetugas} onValueChange={setFilterPetugas}>
                      <SelectTrigger className="flex-1 sm:w-[140px] h-10 rounded-lg border-gray-200">
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
                      <SelectTrigger className="flex-1 sm:w-[130px] h-10 rounded-lg border-gray-200">
                        <Filter className="h-4 w-4 mr-2 text-gray-400" />
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bulan-ini">Bulan ini</SelectItem>
                        <SelectItem value="minggu-ini">Minggu ini</SelectItem>
                        <SelectItem value="hari-ini">Hari ini</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Table - ULTRA COMPACT */}
                <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                  <div className="w-full">
                    <Table className="w-full table-fixed text-xs">
                      <TableHeader>
                        <TableRow className="bg-gray-100 hover:bg-gray-100 border-b h-6">
                          <TableHead className="font-bold text-[10px] text-gray-900 py-0.5 px-1 h-6 bg-gray-100 w-16">Tgl</TableHead>
                          <TableHead className="font-bold text-[10px] text-gray-900 px-1 h-6 bg-gray-100 w-12">Tipe</TableHead>
                          <TableHead className="font-bold text-[10px] text-gray-900 px-1 h-6 bg-gray-100 w-20">Kategori</TableHead>
                          <TableHead className="font-bold text-[10px] text-gray-900 px-1 h-6 bg-gray-100 w-16">Nama</TableHead>
                          <TableHead className="font-bold text-[10px] text-gray-900 px-1 text-right h-6 bg-gray-100 w-20">Nominal</TableHead>
                          <TableHead className="font-bold text-[10px] text-gray-900 px-1 h-6 bg-gray-100 w-12">Bayar</TableHead>
                          <TableHead className="font-bold text-[10px] text-gray-900 px-1 h-6 bg-gray-100 w-12">Status</TableHead>
                          <TableHead className="font-bold text-[10px] text-gray-900 px-1 text-center h-6 bg-gray-100 w-8">Act</TableHead>
                        </TableRow>
                      </TableHeader>
                    <TableBody>
                      {paginatedTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                            <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-xs">Belum ada transaksi</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedTransactions.map((transaction) => (
                          <TableRow key={transaction.id} className="hover:bg-blue-50/50 border-b border-gray-200 h-7">
                            <TableCell className="text-[10px] py-0.5 px-1 h-7 border-r border-gray-200 font-medium">
                              {formatDate(transaction.date).split('/')[0]}/{formatDate(transaction.date).split('/')[1]}
                            </TableCell>
                            <TableCell className="text-[10px] py-0.5 px-1 h-7 border-r border-gray-200">
                              <span className={`text-[9px] px-1 py-0.5 rounded-sm font-bold ${
                                transaction.type === 'INCOME' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                              }`}>
                                {transaction.type === 'INCOME' ? 'IN' : 'OUT'}
                              </span>
                            </TableCell>
                            <TableCell className="text-[10px] py-0.5 px-1 h-7 border-r border-gray-200">
                              <div className="text-[10px] truncate">
                                {(transaction.categoryName || transaction.category?.name || "-").substring(0, 6)}
                              </div>
                            </TableCell>
                            <TableCell className="text-[10px] py-0.5 px-1 h-7 border-r border-gray-200">
                              <div className="text-[10px] truncate">
                                {(transaction.name || transaction.fromTo || "N/A").substring(0, 6)}
                              </div>
                            </TableCell>
                            <TableCell className="text-[10px] font-bold text-right py-0.5 px-1 h-7 border-r border-gray-200 text-green-800">
                              {formatCurrency(transaction.amount)}
                            </TableCell>
                            <TableCell className="text-[10px] py-0.5 px-1 h-7 border-r border-gray-200">
                              <span className="text-[9px] px-0.5 py-0.5 bg-blue-200 rounded-sm text-blue-800 font-medium">
                                {getPaymentMethodLabel(transaction.method || transaction.paymentMethod || "CASH").substring(0, 3)}
                              </span>
                            </TableCell>
                            <TableCell className="py-0.5 px-1 h-7 border-r border-gray-200">
                              <Badge
                                variant="outline"
                                className={`text-[9px] px-0.5 py-0.5 rounded-sm border font-bold ${getStatusBadgeClass(transaction.status)}`}
                              >
                                {getStatusLabel(transaction.status).substring(0, 4)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center py-0.5 px-0.5 h-7">
                              <div className="flex items-center justify-center gap-1">
                                <button 
                                  onClick={() => handleViewTransaction(transaction)}
                                  className="inline-flex items-center justify-center w-4 h-4 text-blue-700 hover:text-blue-900 hover:bg-blue-200 rounded-sm transition-all duration-150"
                                  title="Lihat Detail"
                                >
                                  <Eye className="h-2.5 w-2.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteTransaction(transaction)}
                                  className="inline-flex items-center justify-center w-4 h-4 text-red-700 hover:text-red-900 hover:bg-red-200 rounded-sm transition-all duration-150"
                                  title="Hapus Transaksi"
                                >
                                  <Trash2 className="h-2.5 w-2.5" />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                  </div>
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
                      {formatCurrency(selectedTransaction.amount)}
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

      {/* Dialog Form Transaksi */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Tambah {transactionType === "INCOME" ? "Pemasukan" : "Pengeluaran"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            {schools.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="school" className="text-sm font-medium">Sekolah</Label>
                <Select
                  value={dialogFormData.schoolId}
                  onValueChange={(value) => setDialogFormData({ ...dialogFormData, schoolId: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Pilih sekolah" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school: any) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* Row 1: Kategori dan Sub Kategori */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="category" className="text-sm font-medium">Kategori</Label>
                <Select
                  value={dialogFormData.categoryId}
                  onValueChange={(value) => setDialogFormData({ ...dialogFormData, categoryId: value, typeId: "" })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {dialogCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type" className="text-sm font-medium">Sub Kategori (Jenis)</Label>
                <Select
                  value={dialogFormData.typeId}
                  onValueChange={(value) => setDialogFormData({ ...dialogFormData, typeId: value })}
                  disabled={!dialogFormData.categoryId}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={dialogFormData.categoryId ? "Pilih sub kategori" : "Pilih kategori dulu"} />
                  </SelectTrigger>
                  <SelectContent>
                    {dialogCategories
                      .find(c => c.id === dialogFormData.categoryId)
                      ?.types.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Row 2: Nominal dan Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="amount" className="text-sm font-medium">Nominal (Rp)</Label>
                <Input
                  id="amount"
                  type="text"
                  placeholder="Masukkan jumlah"
                  value={dialogFormData.amount ? Number(dialogFormData.amount).toLocaleString('id-ID').replace(/,/g, '.') : ''}
                  onChange={(e) => {
                    // Hapus semua karakter selain angka untuk mendapat raw value
                    const rawValue = e.target.value.replace(/[^0-9]/g, '');
                    // Update state dengan raw value, tapi display akan terformat otomatis
                    setDialogFormData({ ...dialogFormData, amount: rawValue });
                  }}
                  className="h-9"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                <Select
                  value={dialogFormData.status}
                  onValueChange={(value) => setDialogFormData({ ...dialogFormData, status: value as PaymentStatus })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAID">Lunas</SelectItem>
                    <SelectItem value="PENDING">Tertunda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Row 3: Tanggal dan Deskripsi */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="date" className="text-sm font-medium">Tanggal</Label>
                <Input
                  id="date"
                  type="date"
                  value={dialogFormData.date}
                  onChange={(e) => setDialogFormData({ ...dialogFormData, date: e.target.value })}
                  className="h-9"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-sm font-medium">Deskripsi</Label>
                <Input
                  id="description"
                  placeholder="Masukkan deskripsi transaksi"
                  value={dialogFormData.description}
                  onChange={(e) => setDialogFormData({ ...dialogFormData, description: e.target.value })}
                  className="h-9"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={handleCloseDialog} className="h-9">
              Batal
            </Button>
            <Button onClick={handleSubmitDialog} disabled={loading} className="h-9">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
