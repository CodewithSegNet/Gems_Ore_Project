import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Search, Eye, CheckCircle, XCircle } from "lucide-react";
import { mockOrders, Order } from "../utils/mock-data";
import { formatCurrency, formatDate } from "../utils/export-utils";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";

type OrderTab = 'all' | 'awaiting_payment' | 'pending' | 'processing' | 'completed' | 'cancelled';

export function Orders() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<OrderTab>('all');
  const [filterPayment, setFilterPayment] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [, setCurrencyRefresh] = useState(0);
  
  // Cancellation reason dialog state
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [selectedCancelReason, setSelectedCancelReason] = useState("");
  const [isFromPaymentRejection, setIsFromPaymentRejection] = useState(false);

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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || order.status === activeTab;
    const matchesPayment = filterPayment === "all" || order.paymentMethod === filterPayment;
    return matchesSearch && matchesTab && matchesPayment;
  });

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    const order = orders.find(o => o.id === orderId);
    
    // Prevent status change for crypto orders awaiting payment approval
    if (order && (order.paymentMethod === 'BTC' || order.paymentMethod === 'USDT') && 
        order.status === 'awaiting_payment' && !order.paymentApproved) {
      toast.error('Please approve or reject the payment proof first');
      return;
    }
    
    // If trying to cancel, show cancellation reason dialog
    if (newStatus === 'cancelled') {
      setOrderToCancel(order || null);
      setIsFromPaymentRejection(false);
      setIsCancelDialogOpen(true);
      return;
    }
    
    setOrders(orders.map(o =>
      o.id === orderId ? { ...o, status: newStatus } : o
    ));
    
    // Auto-switch to the tab of the new status
    setActiveTab(newStatus);
    
    toast.success(`Order ${orderId} moved to ${newStatus.replace('_', ' ')} tab`, {
      description: `Status updated successfully`
    });
  };

  const handleCancelOrder = () => {
    if (!orderToCancel) return;
    
    const reason = selectedCancelReason === 'other' ? cancellationReason : selectedCancelReason;
    
    if (!reason || reason.trim() === '') {
      toast.error('Please provide a cancellation reason');
      return;
    }

    setOrders(orders.map(order =>
      order.id === orderToCancel.id 
        ? { ...order, status: 'cancelled', cancellationReason: reason, paymentApproved: isFromPaymentRejection ? false : order.paymentApproved } 
        : order
    ));
    
    setActiveTab('cancelled');
    
    if (isFromPaymentRejection) {
      toast.error('Payment rejected. Order cancelled', {
        description: `Reason: ${reason}`
      });
    } else {
      toast.success(`Order ${orderToCancel.id} cancelled`, {
        description: `Reason: ${reason}`
      });
    }
    
    // Reset states
    setIsCancelDialogOpen(false);
    setOrderToCancel(null);
    setCancellationReason('');
    setSelectedCancelReason('');
    setIsFromPaymentRejection(false);
    setIsDetailOpen(false);
  };

  const handleApprovePayment = (orderId: string) => {
    setOrders(orders.map(order =>
      order.id === orderId 
        ? { ...order, paymentApproved: true, status: 'pending' } 
        : order
    ));
    toast.success('Payment approved! Order status updated to pending');
  };

  const handleRejectPayment = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    setOrderToCancel(order || null);
    setIsFromPaymentRejection(true);
    setSelectedCancelReason('payment_rejected');
    setIsCancelDialogOpen(true);
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-red';
      case 'awaiting_payment': return 'bg-orange-100 text-orange-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const formatCryptoAmount = (order: Order) => {
    if (!order.cryptoAmount) return null;
    
    if (order.paymentMethod === 'BTC') {
      return `${order.cryptoAmount.toFixed(8)} BTC`;
    } else if (order.paymentMethod === 'USDT') {
      return `${order.cryptoAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT`;
    }
    return null;
  };

  const getTabCount = (tab: OrderTab) => {
    if (tab === 'all') return orders.length;
    return orders.filter(o => o.status === tab).length;
  };

  const tabs: { key: OrderTab; label: string; color: string }[] = [
    { key: 'all', label: 'All Orders', color: 'border-amber-500' },
    { key: 'awaiting_payment', label: 'Awaiting Payment Confirmation', color: 'border-orange-500' },
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

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Orders</h1>
        <p className="text-slate-500 mt-1.5">Manage and track customer orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-600 mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-slate-900">{orders.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-orange-50/50">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-600 mb-1">Awaiting Payment</p>
            <p className="text-3xl font-bold text-orange-600">
              {orders.filter(o => o.status === 'awaiting_payment').length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-yellow-50/50">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-600 mb-1">Pending</p>
            <p className="text-3xl font-bold text-blue-600">
              {orders.filter(o => o.status === 'pending').length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-blue-50/50">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-600 mb-1">Processing</p>
            <p className="text-3xl font-bold text-blue-600">
              {orders.filter(o => o.status === 'processing').length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-green-50/50">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-600 mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-600">
              {orders.filter(o => o.status === 'completed').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? `text-slate-900 border-b-2 ${tab.color}`
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label} ({getTabCount(tab.key)})
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200"
              />
            </div>
            <Select value={filterPayment} onValueChange={setFilterPayment}>
              <SelectTrigger className="border-slate-200">
                <SelectValue placeholder="All Payment Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payment Methods</SelectItem>
                <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                <SelectItem value="USDT">Tether (USDT)</SelectItem>
                <SelectItem value="Paystack">Paystack</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900">
            {tabs.find(t => t.key === activeTab)?.label} ({filteredOrders.length})
          </CardTitle>
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
                <TableHead className="text-slate-600">Date</TableHead>
                <TableHead className="text-right text-slate-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="border-slate-100">
                  <TableCell className="font-mono text-sm text-slate-600">{order.id}</TableCell>
                  <TableCell className="font-medium text-slate-900">{order.customer}</TableCell>
                  <TableCell className="text-slate-600">{order.email}</TableCell>
                  <TableCell className="text-slate-600">{order.items}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold text-slate-900">{formatCurrency(order.total)}</p>
                      {(order.paymentMethod === 'BTC' || order.paymentMethod === 'USDT') && order.cryptoAmount && (
                        <p className="text-xs text-amber-600 font-medium">{formatCryptoAmount(order)}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-slate-200">{order.paymentMethod}</Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(value: Order['status']) => handleStatusChange(order.id, value)}
                    >
                      <SelectTrigger className={`w-36 border-0 ${getStatusColor(order.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-slate-600">{formatDate(order.date)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewOrderDetails(order)}
                      className="hover:bg-slate-50"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-slate-500">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Cancellation Reason Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="border-0 shadow-xl">
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling this order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="cancel-reason">Cancellation Reason</Label>
              <Select
                value={selectedCancelReason}
                onValueChange={setSelectedCancelReason}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {cancellationReasons.map(reason => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCancelReason === 'other' && (
              <div>
                <Label htmlFor="other-reason">Please specify the reason</Label>
                <Textarea
                  id="other-reason"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Enter the cancellation reason..."
                  className="mt-1.5"
                  rows={3}
                />
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
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsCancelDialogOpen(false);
                  setOrderToCancel(null);
                  setCancellationReason('');
                  setSelectedCancelReason('');
                  setIsFromPaymentRejection(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCancelOrder}
                variant="destructive"
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl border-0 shadow-xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>View detailed information about the order.</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Order ID</p>
                  <p className="font-semibold text-slate-900">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Date</p>
                  <p className="font-semibold text-slate-900">{formatDate(selectedOrder.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Customer</p>
                  <p className="font-semibold text-slate-900">{selectedOrder.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="font-semibold text-slate-900">{selectedOrder.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Payment Method</p>
                  <Badge variant="outline" className="mt-1">{selectedOrder.paymentMethod}</Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium inline-block mt-1 ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status === 'awaiting_payment' ? 'awaiting payment confirmation' : selectedOrder.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Cancellation Reason Display */}
              {selectedOrder.status === 'cancelled' && selectedOrder.cancellationReason && (
                <div className="border-t border-slate-100 pt-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-semibold text-red-900 mb-1">Cancellation Reason:</p>
                    <p className="text-sm text-red-700">{selectedOrder.cancellationReason}</p>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm text-slate-600 mb-3">Order Summary</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-slate-900">Total Items:</p>
                    <p className="font-semibold text-slate-900">{selectedOrder.items}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-slate-900">Total Amount:</p>
                    <p className="text-2xl font-bold text-amber-600">{formatCurrency(selectedOrder.total)}</p>
                  </div>
                  {(selectedOrder.paymentMethod === 'BTC' || selectedOrder.paymentMethod === 'USDT') && selectedOrder.cryptoAmount && (
                    <div className="flex justify-between items-center">
                      <p className="text-slate-900">Crypto Amount:</p>
                      <p className="text-xl font-bold text-amber-600">{formatCryptoAmount(selectedOrder)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Proof Section for BTC/USDT */}
              {(selectedOrder.paymentMethod === 'BTC' || selectedOrder.paymentMethod === 'USDT') && selectedOrder.paymentProof && (
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-sm text-slate-600 mb-3">Payment Proof</p>
                  <div className="space-y-3">
                    {/* Screenshot Preview */}
                    <div className="relative rounded-lg border-2 border-slate-200 overflow-hidden bg-slate-50">
                      <img
                        src={selectedOrder.paymentProof}
                        alt="Payment proof screenshot"
                        className="w-full h-auto max-h-96 object-contain"
                      />
                    </div>

                    {/* Approval Buttons */}
                    {selectedOrder.status === 'awaiting_payment' && !selectedOrder.paymentApproved && (
                      <div className="flex gap-3">
                        <Button
                          onClick={() => {
                            handleApprovePayment(selectedOrder.id);
                            setIsDetailOpen(false);
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve Payment
                        </Button>
                        <Button
                          onClick={() => {
                            handleRejectPayment(selectedOrder.id);
                          }}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject Payment
                        </Button>
                      </div>
                    )}

                    {/* Payment Status */}
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
