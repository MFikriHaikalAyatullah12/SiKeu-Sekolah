"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [selectedMonth, setSelectedMonth] = useState("Bulan Ini");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (amount: number) => {
    if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(0)}.${((amount % 1000000) / 100000).toFixed(0).padStart(2, "0")}${((amount % 100000) / 10000).toFixed(0).padStart(2, "0")}.${((amount % 10000) / 1000).toFixed(0).padStart(3, "000")}`;
    }
    return formatCurrency(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Ringkasan keuangan sekolah</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pemasukan
          </Button>
          <Button variant="destructive">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pengeluaran
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Saldo Saat Ini</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNumber(mockData.stats.currentBalance)}
                </p>
                <p className="text-xs text-gray-500">+Rp 150.000.000 (Bulan ini)</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Pemasukan Bulan Ini</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatNumber(mockData.stats.monthlyIncome)}
                </p>
                <p className="text-xs text-gray-500">Berdasarkan 125 transaksi</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <ArrowUpIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Pengeluaran Bulan Ini</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatNumber(mockData.stats.monthlyExpense)}
                </p>
                <p className="text-xs text-gray-500">Berdasarkan 80 transaksi</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <ArrowDownIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Surplus/Defisit</p>
                <p className="text-2xl font-bold text-purple-600">
                  +{formatNumber(mockData.stats.surplus)}
                </p>
                <p className="text-xs text-gray-500">Surplus (Bulan ini)</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-full">
                <Scale className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pemasukan vs Pengeluaran (6 Bulan)</span>
              <TrendingUp className="h-5 w-5 text-gray-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockData.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [value + " juta", ""]} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="pemasukan" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Pemasukan"
                />
                <Line 
                  type="monotone" 
                  dataKey="pengeluaran" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  name="Pengeluaran"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Kategori Terbesar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={mockData.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mockData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value + "%", ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {mockData.pieData.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex-1 text-sm">
                      <div className="font-medium">{item.value}%</div>
                      <div className="text-gray-500 text-xs">{item.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transaksi Terbaru</CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Menampilkan 1-5 dari 150 transaksi
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              Lihat Semua
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Deskripsi/Nama</TableHead>
                  <TableHead>Nominal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockData.recentTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.date}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={transaction.type === "PEMASUKAN" ? "default" : "secondary"}
                        className={
                          transaction.type === "PEMASUKAN" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {transaction.type === "PEMASUKAN" ? "Pemasukan" : "Pengeluaran"}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={transaction.status === "LUNAS" ? "default" : "secondary"}
                        className={
                          transaction.status === "LUNAS" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {transaction.status === "LUNAS" ? "Lunas" : "Tertunda"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}