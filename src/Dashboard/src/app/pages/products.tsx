import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import { Plus, Pencil, Trash2, Search, ImageIcon, Upload } from "lucide-react";
import { mockProducts, mockCategories, Product, Category } from "../utils/mock-data";
import { formatCurrency, formatDate } from "../utils/export-utils";
import { toast } from "sonner";

type GenderTab = 'all' | 'male' | 'female';

export function Products() {
  const [products, setProducts] = useState<Product[]>(() => {
    const stored = localStorage.getItem('gemsore_products');
    return stored ? JSON.parse(stored) : mockProducts;
  });
  const [categories, setCategories] = useState<Category[]>(() => {
    const stored = localStorage.getItem('gemsore_categories');
    return stored ? JSON.parse(stored) : mockCategories;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeGenderTab, setActiveGenderTab] = useState<GenderTab>('all');
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    images: [] as string[],
    gender: "female" as "male" | "female",
    status: "active" as "active" | "inactive",
    isBestSeller: false,
    isNewCollection: false,
  });
  const [, setCurrencyRefresh] = useState(0);

  // Persist products to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('gemsore_products', JSON.stringify(products));
  }, [products]);

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

  // Listen for category changes from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('gemsore_categories');
      if (stored) {
        setCategories(JSON.parse(stored));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check on mount and when dialog opens
    const checkCategories = setInterval(() => {
      const stored = localStorage.getItem('gemsore_categories');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (JSON.stringify(parsed) !== JSON.stringify(categories)) {
          setCategories(parsed);
        }
      }
    }, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkCategories);
    };
  }, [categories]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || product.category === filterCategory;
    const matchesStatus = filterStatus === "all" || product.status === filterStatus;
    const matchesGender = activeGenderTab === 'all' || product.gender === activeGenderTab;
    return matchesSearch && matchesCategory && matchesStatus && matchesGender;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.images.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }
    
    if (editingProduct) {
      setProducts(products.map(product =>
        product.id === editingProduct.id
          ? {
              ...product,
              name: formData.name,
              category: formData.category,
              price: parseFloat(formData.price),
              stock: parseInt(formData.stock),
              status: formData.status,
              image: formData.images[0], // First image as main
              images: formData.images, // All images
              gender: formData.gender,
              isBestSeller: formData.isBestSeller,
              isNewCollection: formData.isNewCollection,
            }
          : product
      ));
      toast.success("Product updated successfully");
    } else {
      const newProduct: Product = {
        id: `P${String(products.length + 1).padStart(3, '0')}`,
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        status: formData.status,
        image: formData.images[0], // First image as main
        images: formData.images, // All images
        createdAt: new Date().toISOString().split('T')[0],
        gender: formData.gender,
        isBestSeller: formData.isBestSeller,
        isNewCollection: formData.isNewCollection,
      };
      setProducts([...products, newProduct]);
      toast.success("Product created successfully");
    }
    
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    // Convert old single image to array format
    const images = product.images || (product.image ? [product.image] : []);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      images: images,
      status: product.status,
      gender: product.gender,
      isBestSeller: product.isBestSeller || false,
      isNewCollection: product.isNewCollection || false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter(product => product.id !== id));
    toast.success("Product deleted successfully");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      price: "",
      stock: "",
      images: [],
      status: "active",
      gender: "female",
      isBestSeller: false,
      isNewCollection: false,
    });
    setEditingProduct(null);
    setIsDialogOpen(false);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Products</h1>
          <p className="text-slate-500 mt-1.5">Manage your jewelry inventory</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="bg-black hover:bg-slate-800">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md border-0 shadow-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              <DialogDescription>Enter product details below</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Diamond Ring"
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="image">Product Images (up to 4)</Label>
                <div className="mt-1.5 space-y-3">
                  {/* Image Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative aspect-square rounded-lg border-2 border-slate-200 overflow-hidden bg-slate-50">
                        <img
                          src={img}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2 h-7 w-7 p-0 bg-white hover:bg-red-50 hover:border-red-300 shadow-sm"
                          onClick={() => {
                            const newImages = formData.images.filter((_, i) => i !== index);
                            setFormData({ ...formData, images: newImages });
                          }}
                        >
                          <Trash2 className="h-3 w-3 text-red-600" />
                        </Button>
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                    
                    {/* Add more images button */}
                    {formData.images.length < 4 && (
                      <label 
                        htmlFor="image-upload" 
                        className="relative aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <Upload className="w-6 h-6 mb-1.5 text-slate-400" />
                        <p className="text-xs text-slate-600 font-medium">Add Image</p>
                        <p className="text-xs text-slate-500 mt-0.5">{formData.images.length}/4</p>
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file && formData.images.length < 4) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormData({ ...formData, images: [...formData.images, reader.result as string] });
                              };
                              reader.readAsDataURL(file);
                            }
                            // Reset input to allow re-uploading
                            e.target.value = '';
                          }}
                        />
                      </label>
                    )}
                  </div>
                  
                  {formData.images.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-2">
                      Upload at least one product image
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (₦)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                    required
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value: "male" | "female") => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Homepage Sections */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <Label className="text-sm font-medium text-slate-700">Homepage Sections</Label>
                <p className="text-xs text-slate-500">Select where this product should appear on the website</p>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="bestSeller"
                      checked={formData.isBestSeller}
                      onCheckedChange={(checked) => setFormData({ ...formData, isBestSeller: checked as boolean })}
                    />
                    <label
                      htmlFor="bestSeller"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Best Sellers Section
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="newCollection"
                      checked={formData.isNewCollection}
                      onCheckedChange={(checked) => setFormData({ ...formData, isNewCollection: checked as boolean })}
                    />
                    <label
                      htmlFor="newCollection"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Newest Collections Section
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-black hover:bg-slate-800">
                  {editingProduct ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="border-slate-200">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="border-slate-200">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={activeGenderTab} onValueChange={setActiveGenderTab}>
              <SelectTrigger className="border-slate-200">
                <SelectValue placeholder="All Genders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900">All Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100">
                <TableHead className="text-slate-600">ID</TableHead>
                <TableHead className="text-slate-600">Product</TableHead>
                <TableHead className="text-slate-600">Category</TableHead>
                <TableHead className="text-slate-600">Price</TableHead>
                <TableHead className="text-slate-600">Stock</TableHead>
                <TableHead className="text-slate-600">Status</TableHead>
                <TableHead className="text-slate-600">Created</TableHead>
                <TableHead className="text-right text-slate-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} className="border-slate-100">
                  <TableCell className="font-mono text-sm text-slate-600">{product.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="h-10 w-10 object-cover rounded-lg border border-slate-200"
                          onError={(e) => {
                            // Fallback to icon if image fails to load
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`h-10 w-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center ${product.image ? 'hidden' : ''}`}>
                        <ImageIcon className="h-5 w-5 text-slate-400" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-900">{product.name}</span>
                        <div className="flex gap-1.5">
                          {product.isBestSeller && (
                            <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 hover:bg-amber-100 px-1.5 py-0">
                              Best Seller
                            </Badge>
                          )}
                          {product.isNewCollection && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100 px-1.5 py-0">
                              New
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{product.category}</TableCell>
                  <TableCell className="font-semibold text-slate-900">{formatCurrency(product.price)}</TableCell>
                  <TableCell>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      product.stock === 0 ? 'bg-red-100 text-red-700' :
                      product.stock < 10 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.status === 'active' ? 'default' : 'secondary'} className={product.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">{formatDate(product.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                        className="hover:bg-slate-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="hover:bg-red-50 hover:border-red-200"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}