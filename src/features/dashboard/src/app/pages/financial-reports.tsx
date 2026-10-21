import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Download, TrendingUp, DollarSign, ShoppingBag, Percent } from "lucide-react";
import { mockOrders, salesData, categoryData } from "../utils/mock-data";
import { formatCurrency, formatDate, exportToCSV, exportToPDF } from "../utils/export-utils";
import { toast } from "sonner";

export function FinancialReports() {
  const [reportType, setReportType] = useState("sales");
  const [dateRange, setDateRange] = useState("6months");
  const [, setCurrencyRefresh] = useState(0);

  // Listen for currency changes to refresh display
  useEffect(() => {
    const handleCurrencyChange = () => {
      setCurrencyRefresh(prev => prev + 1);
    };

    window.addEventListener('storage', handleCurrencyChange);
    return () => {
      window.removeEventListener('storage', handleCurrencyChange);
    };
  }, []);

  // Calculate financial metrics
  const totalRevenue = mockOrders
    .filter(o => o.status === 'completed')
    .reduce((sum, order) => sum + order.total, 0);
  
  const totalOrders = mockOrders.filter(o => o.status === 'completed').length;
  const avgOrderValue = totalRevenue / totalOrders;
  const btcRevenue = mockOrders
    .filter(o => o.status === 'completed' && o.paymentMethod === 'BTC')
    .reduce((sum, order) => sum + order.total, 0);
  const usdtRevenue = mockOrders
    .filter(o => o.status === 'completed' && o.paymentMethod === 'USDT')
    .reduce((sum, order) => sum + order.total, 0);

  // Prepare export data
  const salesReportData = mockOrders.map(order => ({
    'Order ID': order.id,
    'Customer': order.customer,
    'Email': order.email,
    'Total': order.total,
    'Status': order.status,
    'Payment Method': order.paymentMethod,
    'Date': order.date,
  }));

  const categoryReportData = categoryData.map(cat => ({
    'Category': cat.name,
    'Percentage': `${cat.value}%`,
    'Revenue': cat.revenue,
  }));

  const handleExportCSV = () => {
    const data = reportType === 'sales' ? salesReportData : categoryReportData;
    const filename = `${reportType}-report-${new Date().toISOString().split('T')[0]}`;
    exportToCSV(data, filename);
    toast.success("Report exported as CSV");
  };

  const handleExportPDF = () => {
    const data = reportType === 'sales' ? salesReportData : categoryReportData;
    const title = reportType === 'sales' ? 'Sales Report' : 'Category Performance Report';
    const filename = `${reportType}-report-${new Date().toISOString().split('T')[0]}`;
    exportToPDF(data, filename, title);
    toast.success("Report exported as PDF");
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Financial Reports</h1>
        <p className="text-slate-500 mt-1.5">Comprehensive financial analytics and export tools</p>
      </div>

      {/* Key Metrics */}
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
              <ShoppingBag className="h-5 w-5 text-slate-400" />
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
              <p className="text-sm text-slate-600">Avg Order Value</p>
              <TrendingUp className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-3xl font-semibold text-slate-900">{formatCurrency(avgOrderValue)}</p>
            <p className="text-sm text-slate-500 mt-2">
              <span className="text-green-600">+5.7%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-600">Growth Rate</p>
              <Percent className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-3xl font-semibold text-slate-900">+12.5%</p>
            <p className="text-sm text-slate-500 mt-2">
              <span className="text-green-600">+2.1%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Export Controls */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-slate-700">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="mt-1.5 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales Report</SelectItem>
                    <SelectItem value="category">Category Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700">Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="mt-1.5 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1month">Last Month</SelectItem>
                    <SelectItem value="3months">Last 3 Months</SelectItem>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                    <SelectItem value="1year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExportCSV} variant="outline" className="border-slate-200">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button onClick={handleExportPDF} className="bg-black hover:bg-slate-800">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales Details</TabsTrigger>
          <TabsTrigger value="payment">Payment Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Revenue Trend */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">Revenue Trend (6 Months)</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Monthly revenue performance</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#f59e0b" strokeWidth={3} name="Sales" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Performance */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">Category Performance</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Revenue by product category</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">Sales Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100">
                    <TableHead className="text-slate-600">Order ID</TableHead>
                    <TableHead className="text-slate-600">Customer</TableHead>
                    <TableHead className="text-slate-600">Email</TableHead>
                    <TableHead className="text-slate-600">Total</TableHead>
                    <TableHead className="text-slate-600">Payment</TableHead>
                    <TableHead className="text-slate-600">Status</TableHead>
                    <TableHead className="text-slate-600">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockOrders.map((order) => (
                    <TableRow key={order.id} className="border-slate-100">
                      <TableCell className="font-mono text-slate-600">{order.id}</TableCell>
                      <TableCell className="text-slate-900">{order.customer}</TableCell>
                      <TableCell className="text-slate-600">{order.email}</TableCell>
                      <TableCell className="font-semibold text-slate-900">{formatCurrency(order.total)}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-slate-100 rounded-lg text-sm font-medium text-slate-700">
                          {order.paymentMethod}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600">{formatDate(order.date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Method Distribution */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900">Payment Method Revenue</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-amber-500 rounded-full" />
                        <span className="font-medium text-slate-900">Bitcoin (BTC)</span>
                      </div>
                      <span className="font-semibold text-slate-900">{formatCurrency(btcRevenue)}</span>
                    </div>
                    <div className="text-sm text-slate-600">
                      {mockOrders.filter(o => o.paymentMethod === 'BTC').length} transactions
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <span className="font-medium text-slate-900">Tether (USDT)</span>
                      </div>
                      <span className="font-semibold text-slate-900">{formatCurrency(usdtRevenue)}</span>
                    </div>
                    <div className="text-sm text-slate-600">
                      {mockOrders.filter(o => o.paymentMethod === 'USDT').length} transactions
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-900">Total Revenue</span>
                    <span className="text-2xl font-bold text-amber-600">
                      {formatCurrency(btcRevenue + usdtRevenue)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Stats */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900">Payment Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 font-medium">BTC Percentage</span>
                  <span className="font-semibold text-slate-900">
                    {((btcRevenue / totalRevenue) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 font-medium">USDT Percentage</span>
                  <span className="font-semibold text-slate-900">
                    {((usdtRevenue / totalRevenue) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 font-medium">Avg BTC Transaction</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(btcRevenue / mockOrders.filter(o => o.paymentMethod === 'BTC').length)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
                  <span className="text-slate-600 font-medium">Avg USDT Transaction</span>
                  <span className="font-semibold text-slate-900">
                    {formatCurrency(usdtRevenue / mockOrders.filter(o => o.paymentMethod === 'USDT').length)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}