import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Plus, Pencil, Trash2, Search, Truck, Globe, MapPin, Gift, Calendar } from "lucide-react";
import { toast } from "sonner";
import adminApi from "../utils/api";
import { ConfirmModal } from "../components/confirm-modal";
import { StatusModal } from "../components/status-modal";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

interface ShippingLocation {
  id: string;
  country: string;
  state: string | null;
  shipping_price: number;
  is_free_shipping: boolean;
  delivery_days: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function Shipping() {
  const [locations, setLocations] = useState<ShippingLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCountry, setFilterCountry] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ShippingLocation | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusModal, setStatusModal] = useState<{ open: boolean; type: "success" | "error"; message: string }>({ open: false, type: "success", message: "" });

  const showStatus = (type: "success" | "error", message: string) => {
    setStatusModal({ open: true, type, message });
  };

  const [formData, setFormData] = useState({
    country: "Nigeria",
    state: "",
    shipping_price: "",
    is_free_shipping: false,
    delivery_days: "",
  });

  const fetchLocations = async () => {
    try {
      const data = await adminApi.shipping.getAll();
      setLocations(data);
    } catch {
      toast.error("Failed to fetch shipping locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const filtered = locations.filter((loc) => {
    const matchesSearch =
      loc.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (loc.state && loc.state.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCountry =
      filterCountry === "all" ||
      (filterCountry === "nigeria" && loc.country === "Nigeria") ||
      (filterCountry === "international" && loc.country !== "Nigeria");
    return matchesSearch && matchesCountry;
  });

  const nigeriaCount = locations.filter((l) => l.country === "Nigeria").length;
  const intlCount = locations.filter((l) => l.country !== "Nigeria").length;
  const freeCount = locations.filter((l) => l.is_free_shipping).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      country: formData.country,
      state: formData.state || null,
      shipping_price: parseFloat(formData.shipping_price) || 0,
      is_free_shipping: formData.is_free_shipping,
      delivery_days: formData.delivery_days || null,
    };
    try {
      if (editing) {
        await adminApi.shipping.update(editing.id, payload);
        showStatus("success", "Shipping rule updated successfully.");
      } else {
        await adminApi.shipping.create(payload);
        showStatus("success", "Shipping rule created successfully.");
      }
      resetForm();
      fetchLocations();
    } catch {
      showStatus("error", "Failed to save shipping rule.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (loc: ShippingLocation) => {
    setEditing(loc);
    setFormData({
      country: loc.country,
      state: loc.state || "",
      shipping_price: loc.shipping_price.toString(),
      is_free_shipping: loc.is_free_shipping,
      delivery_days: loc.delivery_days || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.shipping.delete(deleteId);
      showStatus("success", "Shipping rule deleted successfully.");
      fetchLocations();
    } catch {
      showStatus("error", "Failed to delete shipping rule.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleBulkAddNigeria = async () => {
    const existing = locations
      .filter((l) => l.country === "Nigeria")
      .map((l) => l.state?.toLowerCase());
    const toAdd = NIGERIAN_STATES.filter(
      (s) => !existing.includes(s.toLowerCase())
    );
    if (toAdd.length === 0) {
      toast.info("All Nigerian states already have shipping rules");
      return;
    }
    setSaving(true);
    try {
      for (const state of toAdd) {
        await adminApi.shipping.create({
          country: "Nigeria",
          state,
          shipping_price: 0,
          is_free_shipping: false,
        });
      }
      showStatus("success", `Added ${toAdd.length} Nigerian states successfully.`);
      fetchLocations();
    } catch {
      showStatus("error", "Failed to add some states.");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      country: "Nigeria",
      state: "",
      shipping_price: "",
      is_free_shipping: false,
      delivery_days: "",
    });
    setEditing(null);
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
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Shipping</h1>
            <p className="text-slate-500 mt-1.5">
              Manage delivery pricing for Nigerian states and international locations
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleBulkAddNigeria} disabled={saving}>
              <MapPin className="h-4 w-4 mr-2" />
              Add All States
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => resetForm()}
                  className="bg-black text-white hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md border-0 shadow-xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editing ? "Edit Shipping Rule" : "Add Shipping Rule"}
                  </DialogTitle>
                  <DialogDescription>
                    {editing
                      ? "Update shipping pricing for this location"
                      : "Set delivery pricing for a location"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Country</Label>
                    <Input
                      value={formData.country}
                      onChange={(e) =>
                        setFormData({ ...formData, country: e.target.value, state: "" })
                      }
                      placeholder="e.g. Nigeria, United States"
                      required
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label>State / Region</Label>
                    {formData.country === "Nigeria" ? (
                      <Select
                        value={formData.state}
                        onValueChange={(v) => setFormData({ ...formData, state: v })}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Select a state" />
                        </SelectTrigger>
                        <SelectContent position="popper" className="max-h-60 overflow-y-auto">
                          {NIGERIAN_STATES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                        placeholder="e.g. California, London (optional)"
                        className="mt-1.5"
                      />
                    )}
                  </div>

                  <div>
                    <Label>Shipping Price (₦)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.shipping_price}
                      onChange={(e) =>
                        setFormData({ ...formData, shipping_price: e.target.value })
                      }
                      placeholder="0.00"
                      disabled={formData.is_free_shipping}
                      className="mt-1.5"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                    <div className="space-y-0.5">
                      <Label className="text-slate-900">Free Shipping</Label>
                      <p className="text-sm text-slate-500">
                        Enable free delivery for this location
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_free_shipping}
                      onCheckedChange={(v) =>
                        setFormData({ ...formData, is_free_shipping: v })
                      }
                    />
                  </div>

                  <div>
                    <Label>Estimated Delivery</Label>
                    <Input
                      value={formData.delivery_days}
                      onChange={(e) =>
                        setFormData({ ...formData, delivery_days: e.target.value })
                      }
                      placeholder="e.g. 3-5 days"
                      className="mt-1.5"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="bg-black text-white hover:bg-slate-800"
                    >
                      {saving
                        ? "Saving..."
                        : editing
                        ? "Update"
                        : "Create"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm bg-white rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-800 rounded-2xl">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Rules</p>
                  <p className="text-2xl font-bold text-slate-900">{locations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-white rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500 rounded-2xl">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Nigeria</p>
                  <p className="text-2xl font-bold text-slate-900">{nigeriaCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-white rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500 rounded-2xl">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">International</p>
                  <p className="text-2xl font-bold text-slate-900">{intlCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-white rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500 rounded-2xl">
                  <Gift className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Free Shipping</p>
                  <p className="text-2xl font-bold text-slate-900">{freeCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm bg-white rounded-xl">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-200"
                />
              </div>
              <Select value={filterCountry} onValueChange={setFilterCountry}>
                <SelectTrigger className="border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="nigeria">Nigeria Only</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-0 shadow-sm bg-white rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900">
              Shipping Rules ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No shipping rules found</p>
                <p className="text-sm text-slate-400 mt-1">
                  Create your first rule or use &quot;Add All States&quot; to bulk-add Nigerian states
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100">
                    <TableHead className="text-slate-600">Country</TableHead>
                    <TableHead className="text-slate-600">State / Region</TableHead>
                    <TableHead className="text-slate-600">Price</TableHead>
                    <TableHead className="text-slate-600">Delivery</TableHead>
                    <TableHead className="text-slate-600">Status</TableHead>
                    <TableHead className="text-right text-slate-600">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((loc) => (
                    <TableRow key={loc.id} className="border-slate-100">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {loc.country === "Nigeria" ? (
                            <MapPin className="h-4 w-4 text-green-600" />
                          ) : (
                            <Globe className="h-4 w-4 text-blue-600" />
                          )}
                          <span className="font-medium text-slate-900">
                            {loc.country}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {loc.state || "—"}
                      </TableCell>
                      <TableCell>
                        {loc.is_free_shipping ? (
                          <Badge className="bg-green-100 text-green-700 border-0">
                            FREE
                          </Badge>
                        ) : (
                          <span className="font-semibold text-slate-900">
                            ₦{loc.shipping_price.toLocaleString()}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {loc.delivery_days ? (
                          <span className="text-sm text-slate-600 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {loc.delivery_days}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {loc.is_free_shipping ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border-0">
                            Free Shipping
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-700 border-0">
                            Paid
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(loc)}
                            className="hover:bg-slate-50"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteId(loc.id)}
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
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Shipping Rule?"
        description="Are you sure you want to delete this shipping rule? This action cannot be undone."
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