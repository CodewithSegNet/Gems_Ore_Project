import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Search, Eye, CheckCircle, XCircle, Package, MapPin, User, Mail, Phone, Truck } from "lucide-react";
import { formatCurrency, formatDate } from "../utils/export-utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import adminApi from "../utils/api";

type Order = {
  id: string;
  customer: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  notes?: string;
  items: number;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  deliveryStatus: string;
  paymentMethod: string;
  paymentProof?: string;
  paymentApproved?: boolean;
  cryptoAmount?: number;
  cancellationReason?: string;
  discountCode?: string;
  discountAmount?: number;
  itemsJson?: string;
  date: string;
  created_at?: string;
};

type OrderTab = 'all' | 'pending' | 'processing' | 'completed' | 'cancelled';

export function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<OrderTab>('all');
  const [filterPayment, setFilterPayment] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [, setCurrencyRefresh] = useState(0);
  
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [selectedCancelReason, setSelectedCancelReason] = useState("");
  const [isFromPaymentRejection, setIsFromPaymentRejection] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ORDERS_PER_PAGE = 10;

  useEffect(() => {
    const handleCurrencyChange = () => setCurrencyRefresh(prev => prev + 1);
    window.addEventListener('storage', handleCurrencyChange);
    return () => window.removeEventListener('storage', handleCurrencyChange);
  }, []);

  const fetchOrders = async () => {
    try {
      const params: Record<string, string> = {};
      if (activeTab !== 'all') params.status = activeTab;
      if (filterPayment !== 'all') params.payment_method = filterPayment;
      const data = await adminApi.orders.getAll(Object.keys(params).length > 0 ? params : undefined);
      const mapped = data.map((o: any) => ({
        id: o.id,
        customer: o.customer_name || 'Unknown',
        email: o.email || '',
        phone: o.phone || '',
        address: o.address || '',
        city: o.city || '',
        notes: o.notes || '',
        items: o.items_count || 0,
        total: o.total || 0,
        status: o.status || 'pending',
        deliveryStatus: o.delivery_status || 'not_shipped',
        paymentMethod: o.payment_method || 'Unknown',
        paymentProof: o.payment_proof,
        paymentApproved: o.payment_approved,
        cryptoAmount: o.crypto_amount,
        cancellationReason: o.cancellation_reason,
        discountCode: o.discount_code,
        discountAmount: o.discount_amount || 0,
        itemsJson: o.items_json,
        date: o.created_at || new Date().toISOString(),
      }));
      setOrders(mapped);
    } catch {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [activeTab, filterPayment]);

  const filteredOrders = orders.filter(order => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = order.id.toLowerCase().includes(s) || order.customer.toLowerCase().includes(s) || order.email.toLowerCase().includes(s);
    if (!matchesSearch) return false;
    if (dateFrom) {
      const orderDate = new Date(order.date).toISOString().split('T')[0];
      if (orderDate < dateFrom) return false;
    }
    if (dateTo) {
      const orderDate = new Date(order.date).toISOString().split('T')[0];
      if (orderDate > dateTo) return false;
    }
    return true;
  });

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [searchTerm, activeTab, filterPayment, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * ORDERS_PER_PAGE, currentPage * ORDERS_PER_PAGE);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    const order = orders.find(o => o.id === orderId);
    if (order && order.status === 'pending' && !order.paymentApproved && (newStatus === 'processing' || newStatus === 'completed')) {
      toast.error('Please approve the payment proof before moving to this status');
      return;
    }
    if (newStatus === 'cancelled') {
      setOrderToCancel(order || null);
      setIsFromPaymentRejection(false);
      setIsCancelDialogOpen(true);
      return;
    }
    try {
      await adminApi.orders.updateStatus(orderId, newStatus);
      await fetchOrders();
      toast.success(`Order moved to ${newStatus.replace('_', ' ')}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to update order status");
    }
  };

  const handleDeliveryStatusChange = async (orderId: string, deliveryStatus: string) => {
    try {
      await adminApi.orders.updateDeliveryStatus(orderId, deliveryStatus);
      await fetchOrders();
      // Update selected order if open
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, deliveryStatus: deliveryStatus } : null);
      }
      toast.success(`Delivery status updated to ${deliveryStatus.replace('_', ' ')}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to update delivery status");
    }
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    const reason = selectedCancelReason === 'other' ? cancellationReason : selectedCancelReason;
    if (!reason || reason.trim() === '') { toast.error('Please provide a cancellation reason'); return; }
    try {
      await adminApi.orders.updateStatus(orderToCancel.id, 'cancelled', reason);
      await fetchOrders();
      toast[isFromPaymentRejection ? 'error' : 'success'](isFromPaymentRejection ? 'Payment rejected. Order cancelled' : `Order cancelled`, { description: `Reason: ${reason}` });
    } catch (e: any) { toast.error(e.message || "Failed to cancel order"); }
    setIsCancelDialogOpen(false); setOrderToCancel(null); setCancellationReason(''); setSelectedCancelReason(''); setIsFromPaymentRejection(false); setIsDetailOpen(false);
  };

  const handleApprovePayment = async (orderId: string) => {
    try { await adminApi.orders.approvePayment(orderId); await fetchOrders(); toast.success('Payment approved!'); } catch (e: any) { toast.error(e.message || "Failed to approve payment"); }
  };

  const handleRejectPayment = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    setOrderToCancel(order || null); setIsFromPaymentRejection(true); setSelectedCancelReason('payment_rejected'); setIsCancelDialogOpen(true);
  };

  const viewOrderDetails = (order: Order) => { setSelectedOrder(order); setIsDetailOpen(true); };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getDeliveryColor = (s: string) => {
    switch (s) {
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'in_transit': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const formatCryptoAmount = (order: Order) => {
    if (!order.cryptoAmount) return null;
    return order.paymentMethod === 'BTC' ? `${order.cryptoAmount.toFixed(8)} BTC` : `${order.cryptoAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`;
  };

  const getTabCount = (tab: OrderTab) => tab === 'all' ? orders.length : orders.filter(o => o.status === tab).length;

  const tabs: { key: OrderTab; label: string; color: string }[] = [
    { key: 'all', label: 'All Orders', color: 'border-amber-500' },
    { key: 'pending', label: 'Pending', color: 'border-yellow-500' },
    { key: 'processing', label: 'Processing', color: 'border-blue-500' },
    { key: 'completed', label: 'Completed', color: 'border-green-500' },
    { key: 'cancelled', label: 'Cancelled', color: 'border-red-500' },
  ];

  const cancellationReasons = [
    { value: 'payment_rejected', label: 'Payment Proof Rejected' },
    { value: 'customer_request', label: 'Customer Request' },
    { value: 'out_of_stock', label: 'Product Out of Stock' },
    { value: 'fraudulent', label: 'Suspected Fraudulent Order' },
    { value: 'payment_failed', label: 'Payment Failed' },
    { value: 'duplicate_order', label: 'Duplicate Order' },
    { value: 'other', label: 'Other (Specify below)' },
  ];

  const parseItems = (json?: string) => {
    if (!json) return [];
    try { return JSON.parse(json); } catch { return []; }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Orders</h1>
        <p className="text-slate-500 mt-1.5">Manage and track customer orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/50"><CardContent className="p-6"><p className="text-sm font-medium text-slate-600 mb-1">Total Orders</p><p className="text-3xl font-bold text-slate-900">{orders.length}</p></CardContent></Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-yellow-50/50"><CardContent className="p-6"><p className="text-sm font-medium text-slate-600 mb-1">Pending</p><p className="text-3xl font-bold text-yellow-600">{orders.filter(o => o.status === 'pending').length}</p></CardContent></Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-blue-50/50"><CardContent className="p-6"><p className="text-sm font-medium text-slate-600 mb-1">Processing</p><p className="text-3xl font-bold text-blue-600">{orders.filter(o => o.status === 'processing').length}</p></CardContent></Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-green-50/50"><CardContent className="p-6"><p className="text-sm font-medium text-slate-600 mb-1">Completed</p><p className="text-3xl font-bold text-green-600">{orders.filter(o => o.status === 'completed').length}</p></CardContent></Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.key ? `text-slate-900 border-b-2 ${tab.color}` : 'text-slate-500 hover:text-slate-700'}`}>
              {tab.label} ({getTabCount(tab.key)})
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm bg-white rounded-xl">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search orders..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-slate-200" />
            </div>
            <Select value={filterPayment} onValueChange={setFilterPayment}>
              <SelectTrigger className="border-slate-200"><SelectValue placeholder="All Payment Methods" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Methods</SelectItem>
                <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                <SelectItem value="USDT">Tether (USDT)</SelectItem>
                <SelectItem value="Paystack">Paystack</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 whitespace-nowrap">From</label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border-slate-200" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 whitespace-nowrap">To</label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border-slate-200" />
              {(dateFrom || dateTo) && (
                <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="text-xs text-red-500 hover:text-red-700 whitespace-nowrap">Clear</button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-0 shadow-sm bg-white rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900">{tabs.find(t => t.key === activeTab)?.label} ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100">
                <TableHead className="text-slate-600">Order ID</TableHead>
                <TableHead className="text-slate-600">Customer</TableHead>
                <TableHead className="text-slate-600">Email</TableHead>
                <TableHead className="text-slate-600">Items</TableHead>
                <TableHead className="text-slate-600">Total</TableHead>
                <TableHead className="text-slate-600">Payment</TableHead>
                <TableHead className="text-slate-600">Status</TableHead>
                <TableHead className="text-slate-600">Delivery</TableHead>
                <TableHead className="text-slate-600">Date</TableHead>
                <TableHead className="text-right text-slate-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map(order => (
                <TableRow key={order.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="font-mono text-xs text-slate-400">#{order.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-slate-900">{order.customer}</p>
                    </div>
                  </TableCell>

                  <TableCell className="font-bold text-slate-900">{order.email}</TableCell>
                  <TableCell className="font-bold text-slate-900">₦{order.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-slate-800">{order.items} item{order.items !== 1 ? 's' : ''}</p>
                      {(order.paymentMethod === 'BTC' || order.paymentMethod === 'USDT') && order.cryptoAmount && (
                        <p className="text-xs text-amber-600 font-medium">{formatCryptoAmount(order)}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="border-slate-200">{order.paymentMethod}</Badge></TableCell>
                  <TableCell>
                    <Select value={order.status} onValueChange={(value: Order['status']) => handleStatusChange(order.id, value)}>
                      <SelectTrigger className={`w-36 border-0 ${getStatusColor(order.status)}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select value={order.deliveryStatus} onValueChange={(value) => handleDeliveryStatusChange(order.id, value)}>
                      <SelectTrigger className={`w-36 border-0 ${getDeliveryColor(order.deliveryStatus)}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_shipped">Not Shipped</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="in_transit">In Transit</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-slate-600">{formatDate(order.date)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => viewOrderDetails(order)} className="hover:bg-slate-50">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedOrders.length === 0 && (
                <TableRow><TableCell colSpan={9} className="text-center py-12 text-slate-500">No orders found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-400">
                Showing {(currentPage - 1) * ORDERS_PER_PAGE + 1}–{Math.min(currentPage * ORDERS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Prev</Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce<(number | string)[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`dots-${i}`} className="px-2 text-slate-400">…</span>
                    ) : (
                      <Button key={p} variant={currentPage === p ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(p as number)} className={currentPage === p ? 'bg-slate-900 text-white' : ''}>
                        {p}
                      </Button>
                    )
                  )}
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next →</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancellation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="border-0 shadow-xl">
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>Please provide a reason for cancelling this order.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cancel-reason">Cancellation Reason</Label>
              <Select value={selectedCancelReason} onValueChange={setSelectedCancelReason}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select a reason" /></SelectTrigger>
                <SelectContent>
                  {cancellationReasons.map(reason => (
                    <SelectItem key={reason.value} value={reason.value}>{reason.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedCancelReason === 'other' && (
              <div>
                <Label htmlFor="other-reason">Please specify the reason</Label>
                <Textarea id="other-reason" value={cancellationReason} onChange={(e) => setCancellationReason(e.target.value)} placeholder="Enter the cancellation reason..." className="mt-1.5" rows={3} />
              </div>
            )}
            {orderToCancel && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">Order Details:</p>
                <p className="text-sm"><span className="font-semibold">Order ID:</span> {orderToCancel.id}</p>
                <p className="text-sm"><span className="font-semibold">Customer:</span> {orderToCancel.customer}</p>
                <p className="text-sm"><span className="font-semibold">Total:</span> {formatCurrency(orderToCancel.total)}</p>
              </div>
            )}
            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => { setIsCancelDialogOpen(false); setOrderToCancel(null); setCancellationReason(''); setSelectedCancelReason(''); setIsFromPaymentRejection(false); }}>Cancel</Button>
              <Button onClick={handleCancelOrder} variant="destructive">Confirm Cancellation</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== FULL ORDER DETAILS DIALOG ===== */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl border-0 shadow-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Complete order information and checkout details.</DialogDescription>
          </DialogHeader>
          {selectedOrder && (() => {
            const items = parseItems(selectedOrder.itemsJson);
            return (
              <div className="space-y-5">
                {/* Row 1: Customer + Delivery */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Customer Info */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Customer Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-slate-500">Name:</span> <span className="font-semibold text-slate-900">{selectedOrder.customer}</span></p>
                      <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> <span className="text-slate-900">{selectedOrder.email}</span></p>
                      {selectedOrder.phone && <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> <span className="text-slate-900">{selectedOrder.phone}</span></p>}
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Delivery Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-slate-500">Address:</span> <span className="font-semibold text-slate-900">{selectedOrder.address || 'Not provided'}</span></p>
                      <p><span className="text-slate-500">City:</span> <span className="text-slate-900">{selectedOrder.city || 'Not provided'}</span></p>
                      {selectedOrder.notes && (
                        <div className="mt-2 p-2.5 bg-white rounded-lg border border-slate-200">
                          <p className="text-xs text-slate-400 mb-1">Order Notes:</p>
                          <p className="text-slate-700">{selectedOrder.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 2: Status + Payment + Delivery Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Order Status</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1">Payment Method</p>
                    <Badge variant="outline" className="mt-1 text-sm">{selectedOrder.paymentMethod}</Badge>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 mb-1.5 flex items-center gap-1"><Truck className="w-3 h-3" /> Delivery Status</p>
                    <Select value={selectedOrder.deliveryStatus} onValueChange={(v) => handleDeliveryStatusChange(selectedOrder.id, v)}>
                      <SelectTrigger className={`w-full border-0 ${getDeliveryColor(selectedOrder.deliveryStatus)}`}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_shipped">Not Shipped</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="in_transit">In Transit</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 3: Order Items */}
                {items.length > 0 && (
                  <div className="border-t border-slate-100 pt-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> Ordered Items ({items.length})</h4>
                    <div className="space-y-3">
                      {items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                          {item.image && (
                            <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-white border border-slate-200">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                            <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-bold text-slate-900 shrink-0">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Row 4: Order Totals */}
                <div className="border-t border-slate-100 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Total Items:</span>
                      <span className="font-semibold text-slate-900">{selectedOrder.items}</span>
                    </div>
                    {selectedOrder.discountCode && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Discount ({selectedOrder.discountCode}):</span>
                        <span className="text-green-600 font-medium">-{formatCurrency(selectedOrder.discountAmount || 0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-slate-900 font-medium">Total Amount:</span>
                      <span className="text-2xl font-bold text-amber-600">{formatCurrency(selectedOrder.total)}</span>
                    </div>
                    {(selectedOrder.paymentMethod === 'BTC' || selectedOrder.paymentMethod === 'USDT') && selectedOrder.cryptoAmount && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Crypto Amount:</span>
                        <span className="text-lg font-bold text-amber-600">{formatCryptoAmount(selectedOrder)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cancellation Reason */}
                {selectedOrder.status === 'cancelled' && selectedOrder.cancellationReason && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-semibold text-red-900 mb-1">Cancellation Reason:</p>
                    <p className="text-sm text-red-700">{selectedOrder.cancellationReason}</p>
                  </div>
                )}

                {/* Payment Proof */}
                {(selectedOrder.paymentMethod === 'BTC' || selectedOrder.paymentMethod === 'USDT') && selectedOrder.paymentProof && (
                  <div className="border-t border-slate-100 pt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Payment Proof</p>
                    <div className="space-y-3">
                      <div className="relative rounded-lg border-2 border-slate-200 overflow-hidden bg-slate-50">
                        <img src={selectedOrder.paymentProof} alt="Payment proof" className="w-full h-auto max-h-96 object-contain" />
                      </div>
                      {selectedOrder.status === 'pending' && !selectedOrder.paymentApproved && (
                        <div className="flex gap-3">
                          <Button onClick={() => { handleApprovePayment(selectedOrder.id); setIsDetailOpen(false); }} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                            <CheckCircle className="h-4 w-4 mr-2" /> Approve Payment
                          </Button>
                          <Button onClick={() => handleRejectPayment(selectedOrder.id)} variant="destructive" className="flex-1">
                            <XCircle className="h-4 w-4 mr-2" /> Reject Payment
                          </Button>
                        </div>
                      )}
                      {selectedOrder.paymentApproved && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <p className="text-sm font-medium text-green-700">Payment Approved</p>
                        </div>
                      )}
                      {selectedOrder.paymentApproved === false && selectedOrder.status === 'cancelled' && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <XCircle className="h-5 w-5 text-red-600" />
                          <p className="text-sm font-medium text-red-700">Payment Rejected</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Meta */}
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>Order ID: {selectedOrder.id}</span>
                  <span>Created: {formatDate(selectedOrder.date)}</span>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
