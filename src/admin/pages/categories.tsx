import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { formatDate } from "../utils/export-utils";
import { toast } from "sonner";
import adminApi from "../utils/api";
import { ConfirmModal } from "../components/confirm-modal";
import { StatusModal } from "../components/status-modal";

interface Category {
  id: string;
  name: string;
  description: string;
  product_count: number;
  created_at: string;
}

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusModal, setStatusModal] = useState<{ open: boolean; type: "success" | "error"; message: string }>({ open: false, type: "success", message: "" });

  const showStatus = (type: "success" | "error", message: string) => {
    setStatusModal({ open: true, type, message });
  };

  const fetchCategories = async () => {
    try {
      const data = await adminApi.categories.getAll(searchTerm ? { search: searchTerm } : undefined);
      setCategories(data);
    } catch (e) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await adminApi.categories.update(editingCategory.id, formData);
        showStatus("success", "Category updated successfully.");
      } else {
        await adminApi.categories.create(formData);
        showStatus("success", "Category created successfully.");
      }
      resetForm();
      fetchCategories();
    } catch (e: any) {
      showStatus("error", e.message || "Failed to save category.");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || "" });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.categories.delete(deleteId);
      showStatus("success", "Category deleted successfully.");
      fetchCategories();
    } catch (e: any) {
      showStatus("error", e.message || "Failed to delete category.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setEditingCategory(null);
    setIsDialogOpen(false);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Categories</h1>
          <p className="text-slate-500 mt-1.5">Manage your product categories</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} className="bg-black text-white hover:bg-slate-800">
              <Plus className="h-4 w-4 mr-2" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="border-0 shadow-xl">
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
              <DialogDescription>{editingCategory ? "Make changes to your category." : "Add a new category to your catalog."}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Rings" required className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description" required className="mt-1.5" />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" className="bg-black text-white hover:bg-slate-800">{editingCategory ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-sm bg-white rounded-xl">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search categories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-slate-200" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-white rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-slate-900">All Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100">
                <TableHead className="text-slate-600">Name</TableHead>
                <TableHead className="text-slate-600">Description</TableHead>
                <TableHead className="text-slate-600">Products</TableHead>
                <TableHead className="text-slate-600">Created Date</TableHead>
                <TableHead className="text-right text-slate-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id} className="border-slate-100">
                  <TableCell className="font-medium text-slate-900">{category.name}</TableCell>
                  <TableCell className="text-slate-600">{category.description}</TableCell>
                  <TableCell>
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-medium">{category.product_count}</span>
                  </TableCell>
                  <TableCell className="text-slate-600">{formatDate(category.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(category)} className="hover:bg-slate-50"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="outline" size="sm" onClick={() => setDeleteId(category.id)} className="hover:bg-red-50 hover:border-red-200"><Trash2 className="h-4 w-4 text-red-600" /></Button>
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
      title="Delete Category?"
      description="Are you sure you want to delete this category? This action cannot be undone."
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