import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { AreaChart, Area, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { DollarSign, ShoppingCart, Package, TrendingUp } from "lucide-react";
import { formatCurrency } from "../utils/export-utils";
import { useState, useEffect } from "react";
import adminApi from "../utils/api";

export function DashboardOverview() {
  const [stats, setStats] = useState<any>({
    total_revenue: 0,
    total_orders: 0,
    active_products: 0,
    total_products: 0,
    avg_order_value: 0,
  });
  const [chartData, setChartData] = useState<{ sales_trend: any[]; category_breakdown: any[] }>({
    sales_trend: [],
    category_breakdown: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, charts] = await Promise.all([
          adminApi.dashboard.getStats(),
          adminApi.dashboard.getChartData(),
        ]);
        setStats(statsData);
        setChartData(charts);
      } catch (e) {
        console.error("Failed to fetch dashboard data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

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
          <CardContent className="p-6 bg-white rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-600">Total Revenue</p>
              <DollarSign className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-3xl font-semibold text-slate-900">{formatCurrency(stats.total_revenue)}</p>
            <p className="text-sm text-slate-500 mt-2">From completed orders</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="p-6 bg-white rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-600">Total Orders</p>
              <ShoppingCart className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-3xl font-semibold text-slate-900">{stats.total_orders}</p>
            <p className="text-sm text-slate-500 mt-2">
              <span className="text-amber-600">{stats.pending_orders} pending</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="p-6 bg-white rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-600">Active Products</p>
              <Package className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-3xl font-semibold text-slate-900">{stats.active_products}</p>
            <p className="text-sm text-slate-500 mt-2">Out of {stats.total_products} total</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="p-6 bg-white rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-600">Avg Order Value</p>
              <TrendingUp className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-3xl font-semibold text-slate-900">{formatCurrency(stats.avg_order_value)}</p>
            <p className="text-sm text-slate-500 mt-2">Per completed order</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <Card className="border-0 shadow-sm bg-white rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900">Sales Trend</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Revenue performance over the last 6 months</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.sales_trend} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="salesGradient-unique" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                  labelFormatter={(label) => `${label}`}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#f59e0b" fill="url(#salesGradient-unique)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders Trend */}
        <Card className="border-0 shadow-sm bg-white rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900">Order Volume</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Number of orders per month</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.sales_trend} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
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