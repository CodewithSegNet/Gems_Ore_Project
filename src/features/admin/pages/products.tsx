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
import { Plus, Pencil, Trash2, Search, ImageIcon, Upload, Video } from "lucide-react";
import { formatCurrency, formatDate } from "../utils/export-utils";
import { toast } from "sonner";
import adminApi from "../utils/api";
import { ConfirmModal } from "../components/confirm-modal";
import { StatusModal } from "../components/status-modal";

type GenderTab = "all" | "male" | "female" | "unisex";

interface Category {
  id: string;
  name: string;
}

export function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeGenderTab, setActiveGenderTab] = useState<GenderTab>("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    price: "",
    stock: "",
    images: [] as string[],
    video: "",
    gender: "female" as "male" | "female" | "unisex",
    status: "active" as "active" | "inactive",
    isBestSeller: false,
    isNewCollection: false,
    videoPosition: undefined as number | undefined,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusModal, setStatusModal] = useState<{ open: boolean; type: "success" | "error"; message: string }>({ open: false, type: "success", message: "" });

  const showStatus = (type: "success" | "error", message: string) => {
    setStatusModal({ open: true, type, message });
  };

  const fetchProducts = async () => {
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (activeGenderTab !== "all") params.gender = activeGenderTab;
      if (filterCategory !== "all") params.category_id = filterCategory;
      if (filterStatus !== "all") params.status = filterStatus;
      const data = await adminApi.products.getAll(Object.keys(params).length > 0 ? params : undefined);
      setProducts(data);
    } catch (e) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await adminApi.categories.getAll();
      setCategories(data);
    } catch (e) { /* silent */ }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, activeGenderTab, filterCategory, filterStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.images.length === 0 && !formData.video) {
      toast.error("Please upload at least one product image or video");
      return;
    }
    try {
      const payload = {
        name: formData.name,
        category_id: formData.category_id || null,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        gender: formData.gender,
        status: formData.status,
        is_best_seller: formData.isBestSeller,
        is_new_collection: formData.isNewCollection,
        image_urls: formData.images,
        video_url: formData.video || null,
        video_position: formData.videoPosition ?? null,
      };
      if (editingProduct) {
        await adminApi.products.update(editingProduct.id, payload);
        showStatus("success", "Product updated successfully.");
      } else {
        await adminApi.products.create(payload);
        showStatus("success", "Product created successfully.");
      }
      resetForm();
      fetchProducts();
    } catch (e: any) {
      showStatus("error", e.message || "Failed to save product.");
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    const images = product.images?.map((img: any) => img.image_url) || (product.image ? [product.image] : []);
    setFormData({
      name: product.name,
      category_id: product.category_id || "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      images: images,
      video: product.video_url || "",
      status: product.status,
      gender: product.gender,
      isBestSeller: product.is_best_seller || false,
      isNewCollection: product.is_new_collection || false,
      videoPosition: product.video_position ?? undefined,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.products.delete(deleteId);
      showStatus("success", "Product deleted successfully.");
      fetchProducts();
    } catch (e: any) {
      showStatus("error", e.message || "Failed to delete product.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);

  const handleImageUpload = async (file: File) => {
    setImageUploading(true);
    setImageUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const apiBase = (window as any).__ADMIN_API_BASE || import.meta.env.VITE_API_BASE_URL || "http://localhost:7001";
      const url: string = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${apiBase}/api/v1/upload/image`);
        const token = localStorage.getItem("admin_access_token");
        if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setImageUploadProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const json = JSON.parse(xhr.responseText);
            resolve(json.data?.url || json.url);
          } else { reject(new Error("Upload failed")); }
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(formData);
      });
      setFormData((prev) => ({ ...prev, images: [...prev.images, url] }));
    } catch (e: any) {
      toast.error(e.message || "Failed to upload image");
    } finally {
      setImageUploading(false);
      setImageUploadProgress(0);
    }
  };

  const [videoUploading, setVideoUploading] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);

  const handleVideoUpload = async (file: File) => {
    setVideoUploading(true);
    setVideoUploadProgress(0);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const apiBase = (window as any).__ADMIN_API_BASE || import.meta.env.VITE_API_BASE_URL || "http://localhost:7001";
      const url: string = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${apiBase}/api/v1/upload/video`);
        const token = localStorage.getItem("admin_access_token");
        if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setVideoUploadProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const json = JSON.parse(xhr.responseText);
            resolve(json.data?.url || json.url);
          } else {
            try {
              const err = JSON.parse(xhr.responseText);
              reject(new Error(err.detail || "Upload failed"));
            } catch { reject(new Error("Upload failed")); }
          }
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(fd);
      });
      setFormData((prev) => ({ ...prev, video: url }));
    } catch (e: any) {
      toast.error(e.message || "Failed to upload video");
    } finally {
      setVideoUploading(false);
      setVideoUploadProgress(0);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", category_id: "", price: "", stock: "", images: [], video: "", status: "active", gender: "female", isBestSeller: false, isNewCollection: false, videoPosition: undefined });
    setEditingProduct(null);
    setIsDialogOpen(false);
  };

  if (loading) {
    return <div className="p-8 flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>;
  }

  return (
    <>
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Products</h1>
          <p className="text-slate-500 mt-1.5">Manage your jewelry inventory</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="bg-black text-white hover:bg-slate-800"><Plus className="h-4 w-4 mr-2" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md border-0 shadow-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              <DialogDescription>Enter product details below</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Diamond Ring" required className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="image">Product Media (images + video)</Label>
                <p className="text-xs text-slate-500 mt-0.5 mb-2">Drag order matters — first item is the primary display. Up to 4 images + 1 video.</p>
                <div className="mt-1.5 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {(() => {
                      // Build combined media list: images with video inserted at its position
                      const mediaItems: { type: 'image' | 'video'; url: string; originalIndex?: number }[] = formData.images.map((img, i) => ({ type: 'image' as const, url: img, originalIndex: i }));
                      if (formData.video) {
                        const vPos = formData.videoPosition ?? mediaItems.length;
                        mediaItems.splice(Math.min(vPos, mediaItems.length), 0, { type: 'video', url: formData.video });
                      }
                      return mediaItems.map((item, index) => (
                        <div key={`${item.type}-${index}`} className={`relative aspect-square rounded-lg border-2 ${item.type === 'video' ? 'border-blue-300' : 'border-slate-200'} overflow-hidden bg-slate-50`}>
                          {item.type === 'video' ? (
                            <video src={item.url} className="w-full h-full object-cover" muted />
                          ) : (
                            <img src={item.url} alt={`Media ${index + 1}`} className="w-full h-full object-cover" />
                          )}
                          {/* Delete */}
                          <Button type="button" variant="outline" size="sm" className="absolute top-2 right-2 h-7 w-7 p-0 bg-white hover:bg-red-50 hover:border-red-300 shadow-sm" onClick={() => {
                            if (item.type === 'video') {
                              setFormData({ ...formData, video: "", videoPosition: undefined });
                            } else {
                              // Remove this image and adjust video position
                              const newImages = formData.images.filter((_, i) => i !== item.originalIndex!);
                              let newVPos = formData.videoPosition;
                              if (newVPos !== undefined && index < newVPos) newVPos = Math.max(0, newVPos - 1);
                              setFormData({ ...formData, images: newImages, videoPosition: newVPos });
                            }
                          }}>
                            <Trash2 className="h-3 w-3 text-red-600" />
                          </Button>
                          {/* Reorder buttons */}
                          <div className="absolute top-2 left-2 flex flex-col gap-0.5">
                            {index > 0 && (
                              <Button type="button" variant="outline" size="sm" className="h-6 w-6 p-0 bg-white/90 shadow-sm" onClick={(e) => {
                                e.stopPropagation();
                                // Swap with previous item in the combined list
                                const prev = mediaItems[index - 1];
                                const curr = mediaItems[index];
                                if (curr.type === 'video' && prev.type === 'image') {
                                  setFormData({ ...formData, videoPosition: (formData.videoPosition ?? formData.images.length) - 1 });
                                } else if (curr.type === 'image' && prev.type === 'video') {
                                  setFormData({ ...formData, videoPosition: (formData.videoPosition ?? 0) + 1 });
                                } else {
                                  // Both images — swap in images array
                                  const newImages = [...formData.images];
                                  [newImages[prev.originalIndex!], newImages[curr.originalIndex!]] = [newImages[curr.originalIndex!], newImages[prev.originalIndex!]];
                                  setFormData({ ...formData, images: newImages });
                                }
                              }}>
                                <span className="text-[10px]">▲</span>
                              </Button>
                            )}
                            {index < mediaItems.length - 1 && (
                              <Button type="button" variant="outline" size="sm" className="h-6 w-6 p-0 bg-white/90 shadow-sm" onClick={(e) => {
                                e.stopPropagation();
                                const next = mediaItems[index + 1];
                                const curr = mediaItems[index];
                                if (curr.type === 'video' && next.type === 'image') {
                                  setFormData({ ...formData, videoPosition: (formData.videoPosition ?? 0) + 1 });
                                } else if (curr.type === 'image' && next.type === 'video') {
                                  setFormData({ ...formData, videoPosition: (formData.videoPosition ?? formData.images.length) - 1 });
                                } else {
                                  const newImages = [...formData.images];
                                  [newImages[curr.originalIndex!], newImages[next.originalIndex!]] = [newImages[next.originalIndex!], newImages[curr.originalIndex!]];
                                  setFormData({ ...formData, images: newImages });
                                }
                              }}>
                                <span className="text-[10px]">▼</span>
                              </Button>
                            )}
                          </div>
                          <div className="absolute bottom-2 left-2 flex gap-1">
                            <span className={`text-white text-xs px-2 py-0.5 rounded-full ${item.type === 'video' ? 'bg-blue-500/80' : 'bg-black/60'}`}>
                              {index === 0 ? 'Primary' : index + 1}{item.type === 'video' ? ' · Video' : ''}
                            </span>
                          </div>
                        </div>
                      ));
                    })()}
                    {/* Add Image button */}
                    {formData.images.length < 4 && (
                      <label htmlFor="image-upload" className={`relative aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors ${imageUploading ? 'pointer-events-none opacity-60' : ''}`}>
                        {imageUploading ? (
                          <>
                            <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-1.5" />
                            <p className="text-xs text-slate-600 font-medium">{imageUploadProgress}%</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 mb-1.5 text-slate-400" />
                            <p className="text-xs text-slate-600 font-medium">Add Image</p>
                            <p className="text-xs text-slate-500 mt-0.5">{formData.images.length}/4</p>
                          </>
                        )}
                        <Input id="image-upload" type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleImageUpload(file); e.target.value = ""; }} />
                      </label>
                    )}
                    {/* Add Video button */}
                    {!formData.video && (
                      <label htmlFor="video-upload" className={`relative aspect-square flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50/50 hover:bg-blue-100/50 transition-colors ${videoUploading ? 'pointer-events-none opacity-60' : ''}`}>
                        {videoUploading ? (
                          <>
                            <div className="w-6 h-6 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin mb-1.5" />
                            <p className="text-xs text-blue-600 font-medium">{videoUploadProgress}%</p>
                          </>
                        ) : (
                          <>
                            <Video className="w-6 h-6 mb-1.5 text-blue-400" />
                            <p className="text-xs text-blue-600 font-medium">Add Video</p>
                            <p className="text-[10px] text-blue-400 mt-0.5">MP4, WebM, MOV</p>
                          </>
                        )}
                        <Input id="video-upload" type="file" accept="video/mp4,video/webm,video/quicktime,video/x-msvideo" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleVideoUpload(file); e.target.value = ""; }} />
                      </label>
                    )}
                  </div>
                  {/* Upload Progress Bars */}
                  {imageUploading && (
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1"><span>Uploading image...</span><span>{imageUploadProgress}%</span></div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-slate-800 to-slate-600 rounded-full transition-all duration-300 ease-out" style={{ width: `${imageUploadProgress}%` }} /></div>
                    </div>
                  )}
                  {videoUploading && (
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1"><span>Uploading video...</span><span>{videoUploadProgress}%</span></div>
                      <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-300 ease-out" style={{ width: `${videoUploadProgress}%` }} /></div>
                    </div>
                  )}
                  {formData.images.length === 0 && !formData.video && <p className="text-xs text-slate-500 text-center py-2">Upload at least one product image or video</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="price">Price (₦)</Label><Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0.00" required className="mt-1.5" /></div>
                <div><Label htmlFor="stock">Stock</Label><Input id="stock" type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} placeholder="0" required className="mt-1.5" /></div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value: "male" | "female" | "unisex") => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="unisex">Unisex (Both)</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <Label className="text-sm font-medium text-slate-700">Homepage Sections</Label>
                <p className="text-xs text-slate-500">Select where this product should appear on the website</p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Checkbox id="bestSeller" checked={formData.isBestSeller} onCheckedChange={(checked) => setFormData({ ...formData, isBestSeller: checked as boolean })} />
                    <label htmlFor="bestSeller" className="text-sm font-medium leading-none cursor-pointer">Best Sellers Section</label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Checkbox id="newCollection" checked={formData.isNewCollection} onCheckedChange={(checked) => setFormData({ ...formData, isNewCollection: checked as boolean })} />
                    <label htmlFor="newCollection" className="text-sm font-medium leading-none cursor-pointer">Newest Collections Section</label>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" className="bg-black text-white hover:bg-slate-800">{editingProduct ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-sm bg-white rounded-xl">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-slate-200" />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="border-slate-200"><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="border-slate-200"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
            </Select>
            <Select value={activeGenderTab} onValueChange={(v) => setActiveGenderTab(v as GenderTab)}>
              <SelectTrigger className="border-slate-200"><SelectValue placeholder="All Genders" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Genders</SelectItem><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="unisex">Unisex</SelectItem></SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-white rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900">All Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100">
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
              {products.map((product) => (
                <TableRow key={product.id} className="border-slate-100">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="h-10 w-10 object-cover rounded-lg border border-slate-200" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                      ) : product.video_url ? (
                        <video src={product.video_url} className="h-10 w-10 object-cover rounded-lg border border-slate-200" muted />
                      ) : (
                        <div className="h-10 w-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center"><ImageIcon className="h-5 w-5 text-slate-400" /></div>
                      )}
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-900">{product.name}</span>
                        <div className="flex gap-1.5">
                          {product.is_best_seller && <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 hover:bg-amber-100 px-1.5 py-0">Best Seller</Badge>}
                          {product.is_new_collection && <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-100 px-1.5 py-0">New</Badge>}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{product.category_name || "—"}</TableCell>
                  <TableCell className="font-semibold text-slate-900">{formatCurrency(product.price)}</TableCell>
                  <TableCell>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${product.stock === 0 ? "bg-red-100 text-red-700" : product.stock < 10 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>{product.stock}</span>
                  </TableCell>
                  <TableCell><Badge variant={product.status === "active" ? "default" : "secondary"} className={product.status === "active" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>{product.status}</Badge></TableCell>
                  <TableCell className="text-slate-600">{formatDate(product.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(product)} className="hover:bg-slate-50"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="outline" size="sm" onClick={() => setDeleteId(product.id)} className="hover:bg-red-50 hover:border-red-200"><Trash2 className="h-4 w-4 text-red-600" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>

    <ConfirmModal
      open={!!deleteId}
      onClose={() => setDeleteId(null)}
      onConfirm={handleDelete}
      title="Delete Product?"
      description="Are you sure you want to delete this product? This action cannot be undone."
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