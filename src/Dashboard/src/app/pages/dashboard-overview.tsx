import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { DollarSign, ShoppingCart, Package, TrendingUp } from "lucide-react";
import { salesData, categoryData, mockOrders, mockProducts } from "../utils/mock-data";
import { formatCurrency } from "../utils/export-utils";
import { useState, useEffect } from "react";

const COLORS = ['#f59e0b', '#84cc16', '#3b82f6', '#8b5cf6', '#ec4899'];

export function DashboardOverview() {
  const [, setRefresh] = useState(0);

  // Listen for currency changes
  useEffect(() => {
    const handleStorageChange = () => {
      setRefresh(prev => prev + 1);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const totalRevenue = mockOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, order) => sum + order.total, 0);
  
  const totalOrders = mockOrders.length;
  const activeProducts = mockProducts.filter(p => p.status === 'active').length;
  const avgOrderValue = totalRevenue / mockOrders.filter(o => o.status === 'completed').length;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1.5">Welcome back! Here's what's happening with your jewelry store.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-600">Total Revenue</p>
              <DollarSign className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-3xl font-semibold text-slate-900">{formatCurrency(totalRevenue)}</p>
            <p className="text-sm text-slate-500 mt-2">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-600">Total Orders</p>
              <ShoppingCart className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-3xl font-semibold text-slate-900">{totalOrders}</p>
            <p className="text-sm text-slate-500 mt-2">
              <span className="text-green-600">+8.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-600">Active Products</p>
              <Package className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-3xl font-semibold text-slate-900">{activeProducts}</p>
            <p className="text-sm text-slate-500 mt-2">Out of {mockProducts.length} total</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-600">Avg Order Value</p>
              <TrendingUp className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-3xl font-semibold text-slate-900">{formatCurrency(avgOrderValue)}</p>
            <p className="text-sm text-slate-500 mt-2">
              <span className="text-green-600">+5.7%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900">Sales Trend</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Revenue performance over the last 6 months</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="salesGradient-unique" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `${label}`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#f59e0b" fill="url(#salesGradient-unique)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders Trend */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900">Order Volume</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Number of orders per month</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <Tooltip 
                  labelFormatter={(label) => `${label}`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="orders" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}