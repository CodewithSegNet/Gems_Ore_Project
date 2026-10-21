import { Outlet, Link, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  FolderTree, 
  Package, 
  ShoppingCart, 
  Percent, 
  FileText, 
  Settings as SettingsIcon,
  LogOut,
  Star,
  MessageSquare
} from "lucide-react";
import { cn } from "./ui/utils";
import logoImage from "figma:asset/8b100cb084f53bd6ca886dc70702039132e6b5e7.png";
import { useNavigate } from "react-router";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { mockReviews, mockOrders, mockCustomRequests } from "../utils/mock-data";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Categories", href: "/categories", icon: FolderTree },
  { name: "Products", href: "/products", icon: Package },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Reviews", href: "/reviews", icon: Star },
  { name: "Custom Requests", href: "/custom-requests", icon: MessageSquare },
  { name: "Discounts", href: "/discounts", icon: Percent },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
];

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [pendingReviewsCount, setPendingReviewsCount] = useState(() => {
    const stored = localStorage.getItem('gemsore_reviews');
    if (stored) {
      const reviews = JSON.parse(stored);
      return reviews.filter((r: any) => r.status === 'pending').length;
    }
    return mockReviews.filter(r => r.status === 'pending').length;
  });

  const [pendingOrdersCount, setPendingOrdersCount] = useState(() => {
    const stored = localStorage.getItem('gemsore_orders');
    if (stored) {
      const orders = JSON.parse(stored);
      return orders.filter((o: any) => o.status === 'pending' || o.status === 'awaiting_payment').length;
    }
    return mockOrders.filter(o => o.status === 'pending' || o.status === 'awaiting_payment').length;
  });

  const [pendingRequestsCount, setPendingRequestsCount] = useState(() => {
    const stored = localStorage.getItem('gemsore_custom_requests');
    if (stored) {
      const requests = JSON.parse(stored);
      return requests.filter((r: any) => r.status === 'pending').length;
    }
    return mockCustomRequests.filter(r => r.status === 'pending').length;
  });

  // Listen for changes
  useEffect(() => {
    const updatePendingCounts = () => {
      // Reviews
      const storedReviews = localStorage.getItem('gemsore_reviews');
      if (storedReviews) {
        const reviews = JSON.parse(storedReviews);
        setPendingReviewsCount(reviews.filter((r: any) => r.status === 'pending').length);
      }

      // Orders
      const storedOrders = localStorage.getItem('gemsore_orders');
      if (storedOrders) {
        const orders = JSON.parse(storedOrders);
        setPendingOrdersCount(orders.filter((o: any) => o.status === 'pending' || o.status === 'awaiting_payment').length);
      }

      // Custom Requests
      const storedRequests = localStorage.getItem('gemsore_custom_requests');
      if (storedRequests) {
        const requests = JSON.parse(storedRequests);
        setPendingRequestsCount(requests.filter((r: any) => r.status === 'pending').length);
      }
    };

    // Check for updates every 500ms
    const interval = setInterval(updatePendingCounts, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white flex flex-col">
        {/* Logo */}
        <div className="px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src={logoImage} alt="Gems Ore" className="w-full h-full object-contain" />
            </div>
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
              const isActive = location.pathname === item.href;
              
              // Determine which badge to show
              let badgeCount = 0;
              if (item.name === "Reviews" && pendingReviewsCount > 0) {
                badgeCount = pendingReviewsCount;
              } else if (item.name === "Orders" && pendingOrdersCount > 0) {
                badgeCount = pendingOrdersCount;
              } else if (item.name === "Custom Requests" && pendingRequestsCount > 0) {
                badgeCount = pendingRequestsCount;
              }
              
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}