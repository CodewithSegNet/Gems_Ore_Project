import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Plus, Pencil, Trash2, Percent, Gift, ShoppingBag, Tag, Sparkles, Search, X } from "lucide-react";
import adminApi from "../utils/api";
import { formatCurrency, formatDate } from "../utils/export-utils";
import { toast } from "sonner";
import { ConfirmModal } from "../components/confirm-modal";
import { StatusModal } from "../components/status-modal";

interface Discount {
  id: string;
  name: string;
  discountType: string;
  code?: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  orderMinAmount?: number;
  productId?: string;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  status: 'active' | 'inactive';
  autoApply?: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  gender?: string;
}

type DiscountTab = 'new_customer' | 'order_amount' | 'general' | 'product';

export function Discounts() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DiscountTab>('new_customer');
  const [genderTab, setGenderTab] = useState<'female' | 'male'>('female');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [selectedProductForDiscount, setSelectedProductForDiscount] = useState<Product | null>(null);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    minPurchase: "",
    orderMinAmount: "",
    productId: "",
    maxUses: "",
    expiresAt: "",
    autoApply: false,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusModal, setStatusModal] = useState<{ open: boolean; type: "success" | "error"; message: string }>({ open: false, type: "success", message: "" });

  const showStatus = (type: "success" | "error", message: string) => {
    setStatusModal({ open: true, type, message });
  };

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const [discountsData, productsData, categoriesData] = await Promise.all([
        adminApi.discounts.getAll(),
        adminApi.products.getAll(),
        adminApi.categories.getAll(),
      ]);
      setDiscounts(discountsData.map((d: any) => ({
        id: d.id, name: d.name, discountType: d.discount_type,
        code: d.code, type: d.type, value: d.value,
        minPurchase: d.min_purchase, orderMinAmount: d.order_min_amount,
        productId: d.product_id, maxUses: d.max_uses, usedCount: d.used_count || 0,
        expiresAt: d.expires_at, status: d.status, autoApply: d.auto_apply,
      })));
      setProducts(productsData.map((p: any) => ({
        id: p.id, name: p.name, price: p.price,
        image: p.image || p.images?.[0]?.image_url || "",
        category: p.category_name?.toLowerCase() || "",
        gender: p.gender,
      })));
      setCategories(categoriesData || []);
    } catch (e) {
      console.error("Failed to load discounts data:", e);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredDiscounts = discounts.filter(d => d.discountType === activeTab);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      discount_type: activeTab,
      code: formData.code || null,
      type: formData.type,
      value: parseFloat(formData.value),
      min_purchase: formData.minPurchase ? parseFloat(formData.minPurchase) : null,
      order_min_amount: formData.orderMinAmount ? parseFloat(formData.orderMinAmount) : null,
      product_id: formData.productId || null,
      max_uses: formData.maxUses ? parseInt(formData.maxUses) : null,
      expires_at: formData.expiresAt || null,
      auto_apply: formData.autoApply,
      status: 'active',
    };
    try {
      if (editingDiscount) {
        await adminApi.discounts.update(editingDiscount.id, payload);
        showStatus("success", "Discount updated successfully.");
      } else {
        await adminApi.discounts.create(payload);
        showStatus("success", "Discount created successfully.");
      }
      await fetchData();
      resetForm();
    } catch (e) {
      console.error("Failed to save discount:", e);
      showStatus("error", "Failed to save discount.");
    }
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    setFormData({
      name: discount.name,
      code: discount.code || "",
      type: discount.type,
      value: discount.value.toString(),
      minPurchase: discount.minPurchase?.toString() || "",
      orderMinAmount: discount.orderMinAmount?.toString() || "",
      productId: discount.productId || "",
      maxUses: discount.maxUses?.toString() || "",
      expiresAt: discount.expiresAt || "",
      autoApply: discount.autoApply || false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id?: string) => {
    const targetId = id || deleteId;
    if (!targetId) return;
    setDeleting(true);
    try {
      await adminApi.discounts.delete(targetId);
      showStatus("success", "Discount deleted successfully.");
      await fetchData();
    } catch (e) {
      console.error("Failed to delete discount:", e);
      showStatus("error", "Failed to delete discount.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const toggleStatus = async (id: string) => {
    const discount = discounts.find(d => d.id === id);
    if (!discount) return;
    const newStatus = discount.status === 'active' ? 'inactive' : 'active';
    try {
      await adminApi.discounts.update(id, { status: newStatus });
      showStatus("success", "Discount status updated.");
      await fetchData();
    } catch (e) {
      console.error("Failed to update status:", e);
      showStatus("error", "Failed to update status.");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      type: "percentage",
      value: "",
      minPurchase: "",
      orderMinAmount: "",
      productId: "",
      maxUses: "",
      expiresAt: "",
      autoApply: activeTab !== 'general', // Auto-apply by default for non-general discounts
    });
    setEditingDiscount(null);
    setIsDialogOpen(false);
  };

  const getTabIcon = (tab: DiscountTab) => {
    switch (tab) {
      case 'new_customer': return <Gift className="h-4 w-4" />;
      case 'order_amount': return <ShoppingBag className="h-4 w-4" />;
      case 'general': return <Tag className="h-4 w-4" />;
      case 'product': return <Sparkles className="h-4 w-4" />;
    }
  };

  const getTabLabel = (tab: DiscountTab) => {
    switch (tab) {
      case 'new_customer': return 'New Customer';
      case 'order_amount': return 'Order Amount';
      case 'general': return 'General Discount';
      case 'product': return 'Product Discount';
    }
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.name || productId;
  };

  const filteredProducts = products.filter(product => {
    if (productCategoryFilter !== "all" && product.category !== productCategoryFilter) {
      return false;
    }
    return product.name.toLowerCase().includes(productSearchTerm.toLowerCase());
  });

  const getProductDiscount = (productId: string) => {
    return discounts.find(d => d.discountType === 'product' && d.productId === productId && d.status === 'active');
  };

  const handleAddProductDiscount = (product: Product) => {
    setSelectedProductForDiscount(product);
    setFormData({
      name: `${product.name} Discount`,
      code: "",
      type: "percentage",
      value: "",
      minPurchase: "",
      orderMinAmount: "",
      productId: product.id,
      maxUses: "",
      expiresAt: "",
      autoApply: true,
    });
    setIsDialogOpen(true);
  };

  const handleEditProductDiscount = (product: Product, discount: Discount) => {
    setSelectedProductForDiscount(product);
    setEditingDiscount(discount);
    setFormData({
      name: discount.name,
      code: "",
      type: discount.type,
      value: discount.value.toString(),
      minPurchase: "",
      orderMinAmount: "",
      productId: product.id,
      maxUses: "",
      expiresAt: discount.expiresAt || "",
      autoApply: true,
    });
    setIsDialogOpen(true);
  };

  const handleRemoveProductDiscount = (productId: string) => {
    const discount = discounts.find(d => d.discountType === 'product' && d.productId === productId);
    if (discount) {
      setDeleteId(discount.id);
    }
  };

  const maleProducts = filteredProducts.filter(p => p.gender === 'male');
  const femaleProducts = filteredProducts.filter(p => p.gender === 'female');

  return (
    <>
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Discounts</h1>
          <p className="text-slate-500 mt-1.5">Manage all discount types for your jewelry store</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="bg-black text-white hover:bg-slate-800">
              <Plus className="h-4 w-4 mr-2" />
              Create Discount
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md border-0 shadow-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingDiscount ? 'Edit Discount' : `Create ${getTabLabel(activeTab)}`}</DialogTitle>
              <DialogDescription>
                {editingDiscount ? 'Update discount details below' : `Configure a new ${getTabLabel(activeTab).toLowerCase()}`}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Discount Name */}
              <div>
                <Label htmlFor="name">Discount Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Spring Sale 2026"
                  required
                  className="mt-1.5"
                />
              </div>

              {/* Discount Code - Only for General Discounts */}
              {activeTab === 'general' && (
                <div>
                  <Label htmlFor="code">Discount Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., SPRING2026"
                    required
                    className="mt-1.5"
                  />
                </div>
              )}

              {/* Product Selection - Only for Product Discounts */}
              {activeTab === 'product' && (
                <div>
                  <Label htmlFor="productId">Select Product</Label>
                  <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Choose a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredProducts.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Discount Type and Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value: "percentage" | "fixed") => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="value">
                    Value {formData.type === 'percentage' ? '(%)' : '(₦)'}
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder="0"
                    required
                    className="mt-1.5"
                  />
                </div>
              </div>

              {/* Order Minimum Amount - Only for Order Amount Discount */}
              {activeTab === 'order_amount' && (
                <div>
                  <Label htmlFor="orderMinAmount">Minimum Order Amount (₦)</Label>
                  <Input
                    id="orderMinAmount"
                    type="number"
                    step="0.01"
                    value={formData.orderMinAmount}
                    onChange={(e) => setFormData({ ...formData, orderMinAmount: e.target.value })}
                    placeholder="e.g., 5000"
                    required
                    className="mt-1.5"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">Discount applies when order total reaches this amount</p>
                </div>
              )}

              {/* Minimum Purchase - For General and New Customer */}
              {(activeTab === 'general' || activeTab === 'new_customer') && (
                <div>
                  <Label htmlFor="minPurchase">Minimum Purchase (₦)</Label>
                  <Input
                    id="minPurchase"
                    type="number"
                    step="0.01"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                    placeholder="0.00"
                    className="mt-1.5"
                  />
                </div>
              )}

              {/* Maximum Uses - For General and New Customer */}
              {(activeTab === 'general' || activeTab === 'new_customer') && (
                <div>
                  <Label htmlFor="maxUses">Maximum Uses</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    placeholder="Unlimited"
                    className="mt-1.5"
                  />
                </div>
              )}

              {/* Expiry Date */}
              <div>
                <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-black text-white hover:bg-slate-800">
                  {editingDiscount ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm bg-white rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500 rounded-2xl">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 ">New Customer</p>
                <p className="text-2xl font-bold text-slate-900">
                  {discounts.filter(d => d.discountType === 'new_customer' && d.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500 rounded-2xl">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Order Amount</p>
                <p className="text-2xl font-bold text-slate-900">
                  {discounts.filter(d => d.discountType === 'order_amount' && d.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500 rounded-2xl">
                <Tag className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">General</p>
                <p className="text-2xl font-bold text-slate-900">
                  {discounts.filter(d => d.discountType === 'general' && d.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-white rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500 rounded-2xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Product</p>
                <p className="text-2xl font-bold text-slate-900">
                  {discounts.filter(d => d.discountType === 'product' && d.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="border-0 shadow-sm bg-white rounded-xl">
        <CardContent className="p-0">
          <div className="border-b border-slate-200">
            <div className="flex overflow-x-auto">
              {(['new_customer', 'order_amount', 'general', 'product'] as DiscountTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-black text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {getTabIcon(tab)}
                  {getTabLabel(tab)}
                  <Badge variant="secondary" className="ml-1 bg-slate-100 text-slate-700">
                    {discounts.filter(d => d.discountType === tab).length}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Discount View - Special Layout */}
      {activeTab === 'product' ? (
        <>
          {/* Search and Filter */}
          <Card className="border-0 shadow-sm bg-white rounded-xl">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search products..."
                    value={productSearchTerm}
                    onChange={(e) => setProductSearchTerm(e.target.value)}
                    className="pl-10 border-slate-200"
                  />
                  {productSearchTerm && (
                    <button
                      onClick={() => setProductSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Select value={productCategoryFilter} onValueChange={setProductCategoryFilter}>
                  <SelectTrigger className="border-slate-200">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Description for Product Discount */}
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-500 rounded-lg mt-0.5">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Product-Specific Discounts</h3>
                <p className="text-sm text-slate-600">
                  Set individual discounts for specific products. These discounts automatically apply to the selected product at checkout, making them perfect for flash sales, clearance items, or promotional pricing on featured jewelry pieces.
                </p>
              </div>
            </div>
          </div>

          {/* Gender Tabs */}
          <Card className="border-0 shadow-sm bg-white rounded-xl">
            <CardContent className="p-0">
              <div className="border-b border-slate-200">
                <div className="flex">
                  <button
                    onClick={() => setGenderTab('female')}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      genderTab === 'female'
                        ? 'border-pink-500 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Female Products
                    <Badge variant="secondary" className="ml-1 bg-slate-100 text-slate-700">
                      {femaleProducts.length}
                    </Badge>
                  </button>
                  <button
                    onClick={() => setGenderTab('male')}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      genderTab === 'male'
                        ? 'border-blue-500 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Male Products
                    <Badge variant="secondary" className="ml-1 bg-slate-100 text-slate-700">
                      {maleProducts.length}
                    </Badge>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          {(genderTab === 'female' ? femaleProducts : maleProducts).length > 0 ? (
            <Card className="border-0 shadow-sm bg-white rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900">
                  {genderTab === 'female' ? 'Female' : 'Male'} Products ({(genderTab === 'female' ? femaleProducts : maleProducts).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-100">
                      <TableHead className="text-slate-600">Product</TableHead>
                      <TableHead className="text-slate-600">Category</TableHead>
                      <TableHead className="text-slate-600">Price</TableHead>
                      <TableHead className="text-slate-600">Discount</TableHead>
                      <TableHead className="text-slate-600">Final Price</TableHead>
                      <TableHead className="text-right text-slate-600">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(genderTab === 'female' ? femaleProducts : maleProducts).map((product) => {
                      const discount = getProductDiscount(product.id);
                      const discountAmount = discount
                        ? discount.type === 'percentage'
                          ? (product.price * discount.value) / 100
                          : discount.value
                        : 0;
                      const finalPrice = product.price - discountAmount;

                      return (
                        <TableRow key={product.id} className="border-slate-100">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div>
                                <p className="font-medium text-slate-900">{product.name}</p>
                                <p className="text-sm text-slate-500">{product.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600">{product.category}</TableCell>
                          <TableCell className="font-semibold text-slate-900">
                            {formatCurrency(product.price)}
                          </TableCell>
                          <TableCell>
                            {discount ? (
                              <Badge className="bg-purple-100 text-purple-700 border-0">
                                {discount.type === 'percentage' ? `${discount.value}%` : formatCurrency(discount.value)} OFF
                              </Badge>
                            ) : (
                              <span className="text-slate-400 text-sm">No discount</span>
                            )}
                          </TableCell>
                          <TableCell className="font-bold text-green-600">
                            {formatCurrency(finalPrice)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              {discount ? (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditProductDiscount(product, discount)}
                                    className="hover:bg-slate-50"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemoveProductDiscount(product.id)}
                                    className="hover:bg-red-50 hover:border-red-200"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddProductDiscount(product)}
                                  className="hover:bg-purple-50 hover:border-purple-200"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add Discount
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm bg-white rounded-xl">
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">No products found</h3>
                  <p className="text-slate-500">Try adjusting your search or filter criteria</p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        /* Standard Discount Table for Other Tabs */
        <>
          {/* Description for New Customer */}
          {activeTab === 'new_customer' && (
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-500 rounded-lg mt-0.5">
                  <Gift className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">New Customer Welcome Discounts</h3>
                  <p className="text-sm text-slate-600">
                    Automatically applied to first-time customers to encourage their initial purchase. Perfect for building your customer base and creating a memorable first impression. Set minimum purchase requirements and usage limits to control costs.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Description for Order Amount */}
          {activeTab === 'order_amount' && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500 rounded-lg mt-0.5">
                  <ShoppingBag className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Order Amount-Based Discounts</h3>
                  <p className="text-sm text-slate-600">
                    Automatically applied when a customer's order reaches a specific amount. Great for encouraging larger purchases and increasing average order value. For example, "Get ₦100 off orders above ₦500" is applied automatically at checkout.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Description for General */}
          {activeTab === 'general' && (
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500 rounded-lg mt-0.5">
                  <Tag className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">General Promotional Discounts</h3>
                  <p className="text-sm text-slate-600">
                    Seasonal and promotional discount codes that customers manually enter at checkout. Perfect for marketing campaigns, holiday sales, VIP promotions, and special events. Track usage with limits and expiry dates for better campaign management.
                  </p>
                </div>
              </div>
            </div>
          )}

          <Card className="border-0 shadow-sm bg-white rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">
                {getTabLabel(activeTab)} Discounts ({filteredDiscounts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredDiscounts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                    <Percent className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">No discounts yet</h3>
                  <p className="text-slate-500 mb-4">Create your first {getTabLabel(activeTab).toLowerCase()} to get started</p>
                  <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-black text-white hover:bg-slate-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Discount
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-100">
                      <TableHead className="text-slate-600">Name</TableHead>
                      {activeTab === 'general' && <TableHead className="text-slate-600">Code</TableHead>}
                      {activeTab === 'product' && <TableHead className="text-slate-600">Product</TableHead>}
                      <TableHead className="text-slate-600">Type</TableHead>
                      <TableHead className="text-slate-600">Value</TableHead>
                      {activeTab === 'order_amount' && <TableHead className="text-slate-600">Min Order</TableHead>}
                      {(activeTab === 'general' || activeTab === 'new_customer') && <TableHead className="text-slate-600">Min Purchase</TableHead>}
                      {(activeTab === 'general' || activeTab === 'new_customer') && <TableHead className="text-slate-600">Usage</TableHead>}
                      <TableHead className="text-slate-600">Expires</TableHead>
                      <TableHead className="text-slate-600">Status</TableHead>
                      <TableHead className="text-right text-slate-600">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDiscounts.map((discount) => {
                      const usagePercent = discount.maxUses ? (discount.usedCount / discount.maxUses) * 100 : 0;
                      return (
                        <TableRow key={discount.id} className="border-slate-100">
                          <TableCell className="font-medium text-slate-900">{discount.name}</TableCell>
                          {activeTab === 'general' && (
                            <TableCell className="font-mono font-medium text-slate-900">{discount.code}</TableCell>
                          )}
                          {activeTab === 'product' && (
                            <TableCell className="text-slate-600">{getProductName(discount.productId || '')}</TableCell>
                          )}
                          <TableCell>
                            <Badge variant="outline" className="border-slate-200">
                              {discount.type === 'percentage' ? 'Percentage' : 'Fixed'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-slate-900">
                            {discount.type === 'percentage' 
                              ? `${discount.value}%` 
                              : formatCurrency(discount.value)
                            }
                          </TableCell>
                          {activeTab === 'order_amount' && (
                            <TableCell className="text-slate-600">
                              {formatCurrency(discount.orderMinAmount || 0)}
                            </TableCell>
                          )}
                          {(activeTab === 'general' || activeTab === 'new_customer') && (
                            <TableCell className="text-slate-600">
                              {discount.minPurchase ? formatCurrency(discount.minPurchase) : 'None'}
                            </TableCell>
                          )}
                          {(activeTab === 'general' || activeTab === 'new_customer') && (
                            <TableCell>
                              {discount.maxUses ? (
                                <div className="space-y-1.5 min-w-[120px]">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">{discount.usedCount} / {discount.maxUses}</span>
                                    <span className="text-slate-500 font-medium">{usagePercent.toFixed(0)}%</span>
                                  </div>
                                  <Progress value={usagePercent} className="h-1.5" />
                                </div>
                              ) : (
                                <span className="text-slate-500 text-sm">Unlimited</span>
                              )}
                            </TableCell>
                          )}
                          <TableCell className="text-slate-600">
                            {discount.expiresAt ? formatDate(discount.expiresAt) : 'No expiry'}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleStatus(discount.id)}
                              className={discount.status === 'active' 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200 border-0' 
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-0'
                              }
                            >
                              {discount.status}
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(discount)}
                                className="hover:bg-slate-50"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteId(discount.id)}
                                className="hover:bg-red-50 hover:border-red-200"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>

    <ConfirmModal
      open={!!deleteId}
      onClose={() => setDeleteId(null)}
      onConfirm={() => handleDelete()}
      title="Delete Discount?"
      description="Are you sure you want to delete this discount? This action cannot be undone."
      confirmText="Yes, delete"
      loading={deleting}
    />
    <StatusModal
      open={statusModal.open}
      onClose={() => setStatusModal({ ...statusModal, open: false })}
      type={statusModal.type}
      message={statusModal.message}
    />
    </>
  );
}