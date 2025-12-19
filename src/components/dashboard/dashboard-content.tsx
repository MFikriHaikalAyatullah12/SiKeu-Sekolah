"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  Scale,
  Wallet,
  Plus,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Sample data - in real app this would come from API
const mockData = {
  stats: {
    currentBalance: 2550000000,
    monthlyIncome: 450000000,
    monthlyExpense: 300000000,
    surplus: 150000000,
  },
  chartData: [
    { month: "Jun 2024", pemasukan: 80, pengeluaran: 65 },
    { month: "Jul 2024", pemasukan: 200, pengeluaran: 95 },
    { month: "Aug 2024", pemasukan: 190, pengeluaran: 160 },
    { month: "Sep 2024", pemasukan: 310, pengeluaran: 150 },
    { month: "Oct 2024", pemasukan: 270, pengeluaran: 180 },
    { month: "Nov 2024", pemasukan: 370, pengeluaran: 200 },
  ],
  pieData: [
    { name: "Gaji Guru & Staf", value: 45, color: "#3b82f6" },
    { name: "Fasilitas Sekolah", value: 25, color: "#f59e0b" },
    { name: "Operasional Harian", value: 15, color: "#10b981" },
    { name: "Kegiatan Siswa", value: 10, color: "#8b5cf6" },
    { name: "Lainnya", value: 5, color: "#6b7280" },
  ],
  recentTransactions: [
    {
      id: "1",
      date: "18 Des 2024",
      type: "PEMASUKAN",
      category: "SPP Siswa",
      description: "Budi Santoso (Kls 10A)",
      amount: 1500000,
      status: "LUNAS",
    },
    {
      id: "2",
      date: "17 Des 2024",
      type: "PENGELUARAN",
      category: "Operasional Harian",
      description: "Pembelian ATK",
      amount: 750000,
      status: "LUNAS",
    },
    {
      id: "3",
      date: "16 Des 2024",
      type: "PEMASUKAN",
      category: "Donasi",
      description: "Alumni Angkatan 2010",
      amount: 5000000,
      status: "LUNAS",
    },
    {
      id: "4",
      date: "15 Des 2024",
      type: "PENGELUARAN",
      category: "Fasilitas Sekolah",
      description: "Perbaikan AC Ruang Guru",
      amount: 2200000,
      status: "LUNAS",
    },
    {
      id: "5",
      date: "14 Des 2024",
      type: "PEMASUKAN",
      category: "SPP Siswa",
      description: "Siti Aminah (Kls 11B)",
      amount: 1500000,
      status: "TERTUNDA",
    },
  ],
};

export function DashboardContent() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState("Bulan Ini");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
  
  const [formData, setFormData] = useState({
    categoryId: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    status: "PAID",
    schoolId: ""
  });

  useEffect(() => {
    fetchDashboardData(true); // Show toast on first load
    fetchSchools();
  }, []);

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

  const fetchDashboardData = async (showToast = false) => {
    try {
      const [categoriesRes, transactionsRes, statsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/transactions?limit=5"),
        fetch("/api/dashboard/stats")
      ]);

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.categories || []);
        
        // Jika tidak ada kategori, tampilkan pesan hanya di load pertama
        if (showToast && (!data.categories || data.categories.length === 0)) {
          if (data.message) {
            toast.info(data.message);
          }
        }
      }

      if (transactionsRes.ok) {
        const data = await transactionsRes.json();
        setTransactions(data.transactions || []);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats); // Extract stats object
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  };

  const handleOpenDialog = (type: "INCOME" | "EXPENSE") => {
    setTransactionType(type);
    setFormData({
      categoryId: "",
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      status: "PAID",
      schoolId: selectedSchoolId || ""
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData({
      categoryId: "",
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      status: "PAID",
      schoolId: ""
    });
  };

  const handleSubmit = async () => {
    // Validasi untuk Super Admin yang harus pilih sekolah
    if (schools.length > 0 && !formData.schoolId) {
      toast.error("Pilih sekolah terlebih dahulu");
      return;
    }

    // Validasi kategori hanya jika sudah pilih sekolah (untuk Super Admin) atau user biasa
    if (schools.length === 0 || formData.schoolId) {
      if (filteredCategories.length === 0) {
        toast.error("Tidak ada kategori tersedia untuk sekolah ini. Hubungi administrator untuk menambahkan kategori.");
        return;
      }
    }

    if (!formData.categoryId || !formData.amount || !formData.description) {
      toast.error("Mohon lengkapi semua field");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          type: transactionType,
          amount: parseFloat(formData.amount)
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`${transactionType === "INCOME" ? "Pemasukan" : "Pengeluaran"} berhasil ditambahkan`);
        handleCloseDialog();
        await fetchDashboardData(false); // Don't show toast after save
      } else {
        toast.error(data.error || "Gagal menambahkan transaksi");
      }
    } catch (error) {
      toast.error("Gagal menambahkan transaksi");
    } finally {
      setLoading(false);
    }
  };

  const handleViewTransaction = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsViewDialogOpen(true);
  };

  const handleEditTransaction = (transaction: any) => {
    router.push(`/dashboard/transactions?edit=${transaction.id}`);
  };

  const handleDeleteTransaction = async (id: string, description: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus transaksi "${description}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        toast.success("Transaksi berhasil dihapus");
        fetchDashboardData(false); // Don't show toast after delete
      } else {
        const data = await response.json();
        toast.error(data.error || "Gagal menghapus transaksi");
      }
    } catch (error) {
      toast.error("Gagal menghapus transaksi");
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === transactionType);

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (amount: number | string) => {
    // Convert to number and handle invalid cases
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (!numAmount || isNaN(numAmount) || numAmount === 0) return "Rp 0";
    
    if (numAmount >= 1000000000) {
      // Format untuk milyaran
      const billions = Math.floor(numAmount / 1000000000);
      const millions = Math.floor((numAmount % 1000000000) / 1000000);
      const thousands = Math.floor((numAmount % 1000000) / 1000);
      return `Rp ${billions}.${millions.toString().padStart(3, "0")}.${thousands.toString().padStart(4, "0")}.000`;
    } else if (numAmount >= 1000000) {
      // Format untuk jutaan
      const millions = Math.floor(numAmount / 1000000);
      const thousands = Math.floor((numAmount % 1000000) / 1000);
      return `Rp ${millions}.${thousands.toString().padStart(4, "0")}.000`;
    }
    return formatCurrency(numAmount);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Ringkasan keuangan sekolah Anda</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button 
            className="bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transition-all"
            onClick={() => handleOpenDialog("INCOME")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pemasukan
          </Button>
          <Button 
            variant="destructive" 
            className="shadow-md hover:shadow-lg transition-all"
            onClick={() => handleOpenDialog("EXPENSE")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pengeluaran
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-bl-full"></div>
          <CardContent className="p-6 relative">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Saldo Saat Ini</p>
              <p className="text-2xl font-bold text-gray-900 tracking-tight">
                {stats ? formatNumber(stats.balance) : "Rp 2550.0000.000"}
              </p>
              <p className="text-xs text-green-600 font-medium">
                {stats && stats.balance > 0 ? `Surplus (Bulan ini)` : "Defisit (Bulan ini)"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full"></div>
          <CardContent className="p-6 relative">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <ArrowUpIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Pemasukan Bulan Ini</p>
              <p className="text-2xl font-bold text-green-600 tracking-tight">
                {stats ? formatNumber(stats.totalIncome) : "Rp 450.0000.000"}
              </p>
              <p className="text-xs text-gray-500">
                {stats ? `Berdasarkan ${stats.incomeCount || 0} transaksi` : "Berdasarkan 125 transaksi"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-bl-full"></div>
          <CardContent className="p-6 relative">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-red-50 rounded-lg">
                <ArrowDownIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Pengeluaran Bulan Ini</p>
              <p className="text-2xl font-bold text-red-600 tracking-tight">
                {stats ? formatNumber(stats.totalExpense) : "Rp 300.0000.000"}
              </p>
              <p className="text-xs text-gray-500">
                {stats ? `Berdasarkan ${stats.expenseCount || 0} transaksi` : "Berdasarkan 80 transaksi"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-bl-full"></div>
          <CardContent className="p-6 relative">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Scale className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Surplus/Defisit</p>
              <p className={`text-2xl font-bold tracking-tight ${stats && stats.balance >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                {stats ? (stats.balance >= 0 ? '+' : '') + formatNumber(stats.balance) : "+Rp 150.0000.000"}
              </p>
              <p className="text-xs text-gray-500">
                {stats && stats.balance >= 0 ? "Surplus (Bulan ini)" : "Defisit (Bulan ini)"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-lg">
              <span>Pemasukan vs Pengeluaran (6 Bulan)</span>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockData.chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [value + " juta", ""]} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="pemasukan" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Pemasukan"
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="pengeluaran" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  name="Pengeluaran"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Kategori Terbesar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={mockData.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {mockData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value + "%", ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3 flex flex-col justify-center">
                {mockData.pieData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg">Transaksi Terbaru</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Menampilkan 5 transaksi terakhir
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="hover:bg-gray-50"
              onClick={() => router.push("/dashboard/transactions")}
            >
              <Eye className="mr-2 h-4 w-4" />
              Lihat Semua
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Tanggal</TableHead>
                  <TableHead className="font-semibold">Tipe</TableHead>
                  <TableHead className="font-semibold">Kategori</TableHead>
                  <TableHead className="font-semibold">Deskripsi</TableHead>
                  <TableHead className="font-semibold">Nominal</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Belum ada transaksi. Klik "Tambah Pemasukan" atau "Tambah Pengeluaran" untuk memulai.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => {
                    // Format date properly
                    let formattedDate = "Invalid Date";
                    if (transaction.date) {
                      try {
                        const date = new Date(transaction.date);
                        if (!isNaN(date.getTime())) {
                          formattedDate = date.toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          });
                        }
                      } catch (e) {
                        formattedDate = transaction.date;
                      }
                    }
                    
                    return (
                      <TableRow key={transaction.id} className="hover:bg-gray-50 transition-colors">
                        <TableCell className="font-medium text-gray-700">
                          {formattedDate}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              (transaction.type === "INCOME" || transaction.type === "PEMASUKAN")
                                ? "bg-green-50 text-green-700 border-green-200" 
                                : "bg-red-50 text-red-700 border-red-200"
                            }
                          >
                            {(transaction.type === "INCOME" || transaction.type === "PEMASUKAN") ? "Pemasukan" : "Pengeluaran"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-700">{transaction.category?.name || transaction.category}</TableCell>
                        <TableCell className="text-gray-600">{transaction.description}</TableCell>
                        <TableCell className="font-semibold text-gray-900">
                          {formatCurrency(Number(transaction.amount))}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              (transaction.status === "PAID" || transaction.status === "LUNAS")
                                ? "bg-blue-50 text-blue-700 border-blue-200" 
                                : "bg-yellow-50 text-yellow-700 border-yellow-200"
                            }
                          >
                            {(transaction.status === "PAID" || transaction.status === "LUNAS") ? "Lunas" : "Tertunda"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hover:bg-blue-50"
                              onClick={() => handleViewTransaction(transaction)}
                            >
                              <Eye className="h-4 w-4 text-gray-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hover:bg-blue-50"
                              onClick={() => handleEditTransaction(transaction)}
                            >
                              <Edit className="h-4 w-4 text-gray-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hover:bg-red-50"
                              onClick={() => handleDeleteTransaction(transaction.id, transaction.description)}
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

      {/* Dialog for Add Transaction */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Tambah {transactionType === "INCOME" ? "Pemasukan" : "Pengeluaran"}
            </DialogTitle>
            <DialogDescription>
              Isi form di bawah untuk menambahkan transaksi baru
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {schools.length > 0 && (
              <div className="grid gap-2">
                <Label htmlFor="school">Sekolah</Label>
                <Select
                  value={formData.schoolId}
                  onValueChange={async (value) => {
                    setFormData({ ...formData, schoolId: value, categoryId: "" });
                    setSelectedSchoolId(value);
                    // Fetch categories for selected school
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
                    {schools.map((school: any) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="category">Kategori</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                disabled={filteredCategories.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={filteredCategories.length === 0 ? "Tidak ada kategori tersedia" : "Pilih kategori"} />
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
              {filteredCategories.length === 0 && formData.schoolId && (
                <p className="text-xs text-amber-600">
                  Tidak ada kategori untuk sekolah ini. Hubungi administrator untuk menambahkan kategori.
                </p>
              )}
              {!formData.schoolId && schools.length > 0 && (
                <p className="text-xs text-blue-600">
                  Pilih sekolah terlebih dahulu untuk melihat kategori.
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Nominal (Rp)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Masukkan nominal"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Masukkan deskripsi transaksi"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PAID">Lunas</SelectItem>
                  <SelectItem value="PENDING">Tertunda</SelectItem>
                  <SelectItem value="VOID">Void</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={loading}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for View Transaction */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="font-semibold">Tanggal:</Label>
                <div className="col-span-2">
                  {(() => {
                    if (!selectedTransaction.date) return "-";
                    try {
                      const date = new Date(selectedTransaction.date);
                      if (isNaN(date.getTime())) return selectedTransaction.date;
                      return date.toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      });
                    } catch (e) {
                      return selectedTransaction.date;
                    }
                  })()}
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="font-semibold">Tipe:</Label>
                <div className="col-span-2">
                  <Badge 
                    variant="outline"
                    className={
                      (selectedTransaction.type === "INCOME" || selectedTransaction.type === "PEMASUKAN")
                        ? "bg-green-50 text-green-700 border-green-200" 
                        : "bg-red-50 text-red-700 border-red-200"
                    }
                  >
                    {(selectedTransaction.type === "INCOME" || selectedTransaction.type === "PEMASUKAN") ? "Pemasukan" : "Pengeluaran"}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="font-semibold">Kategori:</Label>
                <div className="col-span-2">{selectedTransaction.category?.name || selectedTransaction.category}</div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="font-semibold">Nominal:</Label>
                <div className="col-span-2 text-lg font-bold">
                  {formatCurrency(Number(selectedTransaction.amount))}
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label className="font-semibold">Status:</Label>
                <div className="col-span-2">
                  <Badge 
                    variant="outline"
                    className={
                      (selectedTransaction.status === "PAID" || selectedTransaction.status === "LUNAS")
                        ? "bg-blue-50 text-blue-700 border-blue-200" 
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }
                  >
                    {(selectedTransaction.status === "PAID" || selectedTransaction.status === "LUNAS") ? "Lunas" : "Tertunda"}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 items-start gap-4">
                <Label className="font-semibold">Deskripsi:</Label>
                <div className="col-span-2">{selectedTransaction.description}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}