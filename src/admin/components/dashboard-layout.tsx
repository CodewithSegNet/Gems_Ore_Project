import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Star, Settings as SettingsIcon, LogOut, FolderTree, MessageSquare, Percent, FileText, Menu, X, Truck, Mail } from "lucide-react";
import logo from "../../assets/logoreview.png";
import { cn } from "./ui/utils";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Categories", href: "/admin/categories", icon: FolderTree },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  { name: "Custom Requests", href: "/admin/custom-requests", icon: MessageSquare },
  { name: "Discounts", href: "/admin/discounts", icon: Percent },
  { name: "Shipping", href: "/admin/shipping", icon: Truck },
  { name: "Reports", href: "/admin/reports", icon: FileText },
  { name: "Subscribers", href: "/admin/subscribers", icon: Mail },
  { name: "Settings", href: "/admin/settings", icon: SettingsIcon },
];

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7001";

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fetch pending counts from API
  useEffect(() => {
    const fetchCounts = async () => {
      const token = localStorage.getItem("admin_access_token");
      if (!token) return;
      
      try {
        const res = await fetch(`${API_BASE}/api/v1/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          const data = json.data || {};
          setPendingReviewsCount(data.pending_reviews || 0);
          setPendingOrdersCount(data.pending_orders || 0);
          setPendingRequestsCount(data.pending_requests || 0);
        }
      } catch (e) {
        // Silent fail for dashboard stats
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("admin_access_token");
    localStorage.removeItem("admin_user");
    navigate("/admin/login");
  };

  const getBadgeCount = (name: string) => {
    if (name === "Reviews" && pendingReviewsCount > 0) return pendingReviewsCount;
    if (name === "Orders" && pendingOrdersCount > 0) return pendingOrdersCount;
    if (name === "Custom Requests" && pendingRequestsCount > 0) return pendingRequestsCount;
    return 0;
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-6 py-8">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Gems Ore" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="font-semibold text-lg text-slate-900">Gems Ore</h1>
            <p className="text-xs text-slate-500">Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <div className="space-y-0.5">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== "/admin" && location.pathname.startsWith(item.href));
            const badgeCount = getBadgeCount(item.name);
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative group",
                  isActive
                    ? "text-slate-900"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-500 rounded-r-full" />
                )}
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.name}</span>
                {badgeCount > 0 && (
                  <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-red-600 rounded-full">
                    {badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-slate-100 space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
        <p className="text-xs text-slate-400">© 2026 Gems Ore</p>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white flex flex-col shadow-2xl z-10">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu className="h-5 w-5 text-slate-700" />
          </button>
          <div className="flex items-center gap-2">
            <img src={logo} alt="Gems Ore" className="w-8 h-8 object-contain" />
            <h1 className="font-semibold text-slate-900">Gems Ore</h1>
          </div>
          {/* Mobile notification badges */}
          <div className="ml-auto flex items-center gap-2">
            {(pendingOrdersCount + pendingReviewsCount + pendingRequestsCount) > 0 && (
              <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-red-600 rounded-full">
                {pendingOrdersCount + pendingReviewsCount + pendingRequestsCount}
              </span>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}