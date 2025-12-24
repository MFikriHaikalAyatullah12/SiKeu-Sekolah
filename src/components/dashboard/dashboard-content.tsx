"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Calendar,
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

// Chart of Accounts - Kategori Pemasukan
const incomeCategories = [
  {
    id: "1100",
    name: "1100 - Aktiva Lancar",
    types: [
      { id: "1110", name: "1110 - Kas di Bendahara" },
      { id: "1120", name: "1120 - Bank (Rekening Sekolah)" },
      { id: "1130", name: "1130 - Piutang SPP" },
    ],
  },
  {
    id: "1200",
    name: "1200 - Aktiva Tetap",
    types: [
      { id: "1210", name: "1210 - Tanah" },
      { id: "1220", name: "1220 - Bangunan Gedung Sekolah" },
      { id: "1230", name: "1230 - Peralatan Sekolah" },
    ],
  },
  {
    id: "3100",
    name: "3100 - Modal",
    types: [
      { id: "3100", name: "3100 - Modal Awal" },
      { id: "3200", name: "3200 - Laba Ditahan" },
    ],
  },
  {
    id: "4100",
    name: "4100 - Pendapatan",
    types: [
      { id: "4100", name: "4100 - Pendapatan SPP Siswa" },
      { id: "4200", name: "4200 - Dana BOS" },
      { id: "4300", name: "4300 - Pendapatan Lain-lain" },
    ],
  },
];

// Chart of Accounts - Kategori Pengeluaran
const expenseCategories = [
  {
    id: "2100",
    name: "2100 - Kewajiban",
    types: [
      { id: "2110", name: "2110 - Utang Gaji Guru" },
      { id: "2120", name: "2120 - Utang Pemasok" },
      { id: "2210", name: "2210 - Utang Bank" },
    ],
  },
  {
    id: "5100",
    name: "5100 - Beban",
    types: [
      { id: "5100", name: "5100 - Beban Gaji Guru" },
      { id: "5200", name: "5200 - Beban Operasional" },
      { id: "5300", name: "5300 - Beban Perlengkapan" },
      { id: "5400", name: "5400 - Beban Pemeliharaan" },
      { id: "5500", name: "5500 - Beban Penyusutan" },
    ],
  },
];

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
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    categoryId: "",
    typeId: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    status: "PAID",
    schoolId: ""
  });

  // Get current COA categories based on transaction type
  const coaCategories = transactionType === "INCOME" ? incomeCategories : expenseCategories;
  const selectedCategory = coaCategories.find(cat => cat.id === formData.categoryId);
  const availableTypes = selectedCategory?.types || [];

  useEffect(() => {
    fetchDashboardData(true);
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
        setStats(data.stats);
      }

      // Mock chart data - replace with real API data
      setChartData([
        { month: "Jun 2024", pemasukan: 80, pengeluaran: 65 },
        { month: "Jul 2024", pemasukan: 200, pengeluaran: 95 },
        { month: "Agust 2024", pemasukan: 190, pengeluaran: 160 },
        { month: "Sept 2024", pemasukan: 310, pengeluaran: 150 },
        { month: "Okt 2024", pemasukan: 270, pengeluaran: 180 },
        { month: "Nov 2024", pemasukan: 370, pengeluaran: 200 },
      ]);

      setPieData([
        { name: "Gaji Guru & Staf", value: 45, color: "#3b82f6" },
        { name: "Fasilitas Sekolah", value: 25, color: "#f59e0b" },
        { name: "Operasional Harian", value: 15, color: "#10b981" },
        { name: "Kegiatan Siswa", value: 10, color: "#8b5cf6" },
        { name: "Lainnya", value: 5, color: "#6b7280" },
      ]);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  };

  const handleOpenDialog = (type: "INCOME" | "EXPENSE") => {
    setTransactionType(type);
    setFormData({
      categoryId: "",
      typeId: "",
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
      typeId: "",
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      status: "PAID",
      schoolId: ""
    });
  };

  const handleSubmit = async () => {
    if (schools.length > 0 && !formData.schoolId) {
      toast.error("Pilih sekolah terlebih dahulu");
      return;
    }

    if (!formData.categoryId || !formData.typeId || !formData.amount || !formData.description) {
      toast.error("Mohon lengkapi semua field");
      return;
    }

    setLoading(true);
    try {
      // Get category and type names for database
      const selectedCat = coaCategories.find(c => c.id === formData.categoryId);
      const selectedType = selectedCat?.types.find(t => t.id === formData.typeId);
      
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          type: transactionType,
          amount: parseFloat(formData.amount),
          description: `${selectedType?.name || formData.categoryId} - ${formData.description}`,
          date: formData.date,
          status: formData.status,
          schoolId: formData.schoolId || undefined,
          categoryId: formData.categoryId,
          categoryName: selectedCat?.name,
          typeId: formData.typeId,
          typeName: selectedType?.name
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`${transactionType === "INCOME" ? "Pemasukan" : "Pengeluaran"} berhasil ditambahkan`);
        handleCloseDialog();
        await fetchDashboardData(false);
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
        fetchDashboardData(false);
      } else {
        const data = await response.json();
        toast.error(data.error || "Gagal menghapus transaksi");
      }
    } catch (error) {
      toast.error("Gagal menghapus transaksi");
    }
  };

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
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (!numAmount || isNaN(numAmount) || numAmount === 0) return "Rp 0";
    
    if (numAmount >= 1000000000) {
      const billions = Math.floor(numAmount / 1000000000);
      const millions = Math.floor((numAmount % 1000000000) / 1000000);
      const thousands = Math.floor((numAmount % 1000000) / 1000);
      return `Rp ${billions}.${millions.toString().padStart(3, "0")}.${thousands.toString().padStart(3, "0")}.000`;
    } else if (numAmount >= 1000000) {
      const millions = Math.floor(numAmount / 1000000);
      const thousands = Math.floor((numAmount % 1000000) / 1000);
      return `Rp ${millions}.${thousands.toString().padStart(3, "0")}.000`;
    }
    return formatCurrency(numAmount);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50/50">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Saldo Saat Ini */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 bg-green-100 rounded-lg">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Saldo Saat Ini</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats ? formatNumber(stats.balance) : "Rp 2.550.000.000"}
              </p>
              <p className="text-xs text-green-600">
                +Rp 150.000.000 (Bulan ini)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pemasukan Bulan Ini */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 bg-blue-100 rounded-lg">
                <ArrowUpIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Pemasukan Bulan Ini</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats ? formatNumber(stats.totalIncome) : "Rp 450.000.000"}
              </p>
              <p className="text-xs text-gray-500">
                Berdasarkan {stats ? stats.incomeCount || 0 : 125} transaksi
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pengeluaran Bulan Ini */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 bg-red-100 rounded-lg">
                <ArrowDownIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Pengeluaran Bulan Ini</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats ? formatNumber(stats.totalExpense) : "Rp 300.000.000"}
              </p>
              <p className="text-xs text-gray-500">
                Berdasarkan {stats ? stats.expenseCount || 0 : 80} transaksi
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Surplus/Defisit */}
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 bg-purple-100 rounded-lg">
                <Scale className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">Surplus/Defisit</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats ? (stats.balance >= 0 ? '+' : '') + formatNumber(Math.abs(stats.balance)) : "+Rp 150.000.000"}
              </p>
              <p className="text-xs text-gray-500">
                Surplus (Bulan ini)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart - 2 columns */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">
              Pemasukan vs Pengeluaran (6 Bulan)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                  iconType="circle"
                />
                <Line 
                  type="monotone" 
                  dataKey="pemasukan" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  name="Pemasukan"
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                  fill="url(#colorPemasukan)"
                />
                <Line 
                  type="monotone" 
                  dataKey="pengeluaran" 
                  stroke="#ef4444" 
                  strokeWidth={2.5}
                  name="Pengeluaran"
                  dot={{ fill: '#ef4444', r: 4 }}
                  activeDot={{ r: 6 }}
                  fill="url(#colorPengeluaran)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - 1 column */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Kategori Terbesar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value}%`, '']}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-sm" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base font-semibold">Transaksi Terbaru</CardTitle>
            <p className="text-xs text-gray-500 mt-1">
              Menampilkan 1-5 dari 150 transaksi
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[140px] h-9 text-sm">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bulan Ini">Bulan Ini</SelectItem>
                <SelectItem value="3 Bulan">3 Bulan</SelectItem>
                <SelectItem value="6 Bulan">6 Bulan</SelectItem>
                <SelectItem value="Tahun Ini">Tahun Ini</SelectItem>
              </SelectContent>
            </Select>
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
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <TrendingUp className="h-12 w-12 text-gray-300" />
                        <p className="font-medium">Belum ada transaksi</p>
                        <p className="text-sm">Klik tombol di atas untuk menambahkan transaksi</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => {
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
                      <TableRow key={transaction.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-sm">
                          {formattedDate}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              (transaction.type === "INCOME" || transaction.type === "PEMASUKAN")
                                ? "bg-green-50 text-green-700 border-green-200 text-xs" 
                                : "bg-red-50 text-red-700 border-red-200 text-xs"
                            }
                          >
                            {(transaction.type === "INCOME" || transaction.type === "PEMASUKAN") ? "Pemasukan" : "Pengeluaran"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{transaction.category?.name || transaction.category}</TableCell>
                        <TableCell className="text-sm text-gray-600">{transaction.description}</TableCell>
                        <TableCell className="font-semibold text-sm">
                          {formatCurrency(Number(transaction.amount))}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={
                              (transaction.status === "PAID" || transaction.status === "LUNAS")
                                ? "bg-blue-50 text-blue-700 border-blue-200 text-xs" 
                                : "bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                            }
                          >
                            {(transaction.status === "PAID" || transaction.status === "LUNAS") ? "Lunas" : "Tertunda"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 hover:bg-blue-50"
                              onClick={() => handleViewTransaction(transaction)}
                            >
                              <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 hover:bg-gray-100"
                              onClick={() => handleEditTransaction(transaction)}
                            >
                              <Edit className="h-4 w-4 text-gray-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 hover:bg-red-50"
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
                onValueChange={(value) => setFormData({ ...formData, categoryId: value, typeId: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {coaCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Sub Kategori (Jenis)</Label>
              <Select
                value={formData.typeId}
                onValueChange={(value) => setFormData({ ...formData, typeId: value })}
                disabled={!formData.categoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.categoryId ? "Pilih sub kategori" : "Pilih kategori dulu"} />
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
