"use client";

import { memo, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Chart loading skeleton with exact height match
export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="w-full" style={{ height, minHeight: height }}>
      <div className="flex flex-col h-full justify-end p-4 gap-2">
        <div className="flex items-end gap-2 h-full">
          {[40, 60, 45, 80, 55, 70].map((h, i) => (
            <Skeleton 
              key={i} 
              className="flex-1 rounded-t-md animate-pulse" 
              style={{ height: `${h}%` }} 
            />
          ))}
        </div>
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}

// Pie chart skeleton with exact dimensions
export function PieChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="w-full flex items-center justify-center" style={{ height, minHeight: height }}>
      <Skeleton className="w-44 h-44 rounded-full animate-pulse" />
    </div>
  );
}

interface AreaChartData {
  month: string;
  pemasukan: number;
  pengeluaran: number;
  [key: string]: string | number;
}

interface AreaChartComponentProps {
  data: AreaChartData[];
}

// Area Chart Component - loads recharts only when needed
export const AreaChartComponent = memo(function AreaChartComponent({ 
  data 
}: AreaChartComponentProps) {
  const [ChartModule, setChartModule] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Lazy load recharts only when component mounts
    import("recharts").then((mod) => {
      if (mounted) {
        setChartModule(mod);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-gray-400">
        Tidak ada data chart
      </div>
    );
  }

  if (isLoading || !ChartModule) {
    return <ChartSkeleton height={300} />;
  }

  const { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } = ChartModule;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
            <stop offset="50%" stopColor="#10b981" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
          </linearGradient>
          <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
            <stop offset="50%" stopColor="#ef4444" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="2 2" stroke="#f1f5f9" opacity={0.7} />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={{ stroke: '#e2e8f0' }}
          tickLine={{ stroke: '#e2e8f0' }}
        />
        <YAxis 
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={{ stroke: '#e2e8f0' }}
          tickLine={{ stroke: '#e2e8f0' }}
          label={{ value: 'Jutaan (Rp)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fontSize: '11px', fill: '#64748b' } }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.96)', 
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            fontSize: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: any, name: any) => [
            `Rp ${value}M`, 
            name === 'pemasukan' ? '💰 Pemasukan' : '💸 Pengeluaran'
          ]}
          labelStyle={{ fontWeight: 600, color: '#1e293b' }}
        />
        <Legend 
          wrapperStyle={{ fontSize: '12px', fontWeight: '500', paddingTop: '10px' }}
          iconType="circle"
        />
        <Area
          type="monotone"
          dataKey="pemasukan"
          stackId="1"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#colorPemasukan)"
          name="Pemasukan"
        />
        <Area
          type="monotone"
          dataKey="pengeluaran"
          stackId="2"
          stroke="#ef4444"
          strokeWidth={2}
          fill="url(#colorPengeluaran)"
          name="Pengeluaran"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});

interface PieChartData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface PieChartComponentProps {
  data: PieChartData[];
}

// Pie Chart Component - loads recharts only when needed
export const PieChartComponent = memo(function PieChartComponent({ 
  data 
}: PieChartComponentProps) {
  const [ChartModule, setChartModule] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Lazy load recharts only when component mounts
    import("recharts").then((mod) => {
      if (mounted) {
        setChartModule(mod);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-gray-400">
        Tidak ada data kategori
      </div>
    );
  }

  if (isLoading || !ChartModule) {
    return <PieChartSkeleton height={300} />;
  }

  const { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } = ChartModule;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: any, name: any, props: any) => [`${value}%`, props?.payload?.name || name]}
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '12px',
            padding: '8px 12px'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
});
