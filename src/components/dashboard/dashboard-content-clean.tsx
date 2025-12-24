"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Wallet, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  Scale,
  Plus,
  TrendingUp
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface DashboardStats {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  incomeCount: number;
  expenseCount: number;
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export default function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Dummy data untuk chart
  const chartData = [
    { month: 'Juli', pemasukan: 400000000, pengeluaran: 250000000 },
    { month: 'Agustus', pemasukan: 350000000, pengeluaran: 280000000 },
    { month: 'September', pemasukan: 380000000, pengeluaran: 300000000 },
    { month: 'Oktober', pemasukan: 420000000, pengeluaran: 270000000 },
    { month: 'November', pemasukan: 450000000, pengeluaran: 300000000 },
    { month: 'Desember', pemasukan: 450000000, pengeluaran: 300000000 },
  ];

  const pieData = [
    { name: 'Pemasukan', value: 60, color: '#10b981' },
    { name: 'Pengeluaran', value: 40, color: '#ef4444' },
  ];

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

      {/* Link to Transactions Page */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-base font-semibold">Transaksi Terbaru</CardTitle>
            <p className="text-xs text-gray-500 mt-1">
              Menampilkan ringkasan transaksi terbaru
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm"
              variant="outline"
              onClick={() => window.location.href = '/dashboard/transactions'}
            >
              Lihat Semua Transaksi
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-center py-12 text-gray-500">
          <div className="flex flex-col items-center gap-3">
            <TrendingUp className="h-12 w-12 text-gray-300" />
            <p className="font-medium">Kelola Transaksi</p>
            <p className="text-sm">Klik "Lihat Semua Transaksi" untuk mengelola data transaksi lengkap</p>
            <div className="flex gap-2 mt-2">
              <Button 
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => window.location.href = '/dashboard/transactions'}
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah Pemasukan
              </Button>
              <Button 
                size="sm"
                variant="destructive"
                onClick={() => window.location.href = '/dashboard/transactions'}
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah Pengeluaran
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}