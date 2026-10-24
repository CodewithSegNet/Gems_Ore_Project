import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import HomePage from "./features/homepage/pages/HomePage";
import ProductPage from "./features/products/pages/ProductListPage";
import ProductDetailPage from "./features/products/pages/ProductDetailPage";
import LoginPage from "./features/auth/pages/LoginPage";
import SignUpPage from "./features/auth/pages/SignUpPage";
import CheckoutPage from "./features/checkout/pages/CheckoutPage";
import CartPage from "./features/cart/pages/CartPage";
import CryptoPaymentPage from "./features/payment/pages/CryptoPaymentPage";
import OrderSuccessPage from "./features/orders/pages/OrderSuccessPage";
import TransactionHistory from "./features/orders/pages/TransactionHistoryPage";
import ShippingPolicyPage from "./features/legal/pages/ShippingPolicyPage";
import RefundPolicyPage from "./features/legal/pages/RefundPolicyPage";
import TermsPage from "./features/legal/pages/TermsPage";
import PrivacyPolicyPage from "./features/legal/pages/PrivacyPolicyPage";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CartProvider } from "./contexts/cartContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import ScrollToTop from "./features/homepage/utils/ScrollToTop";
import WhatsAppWidget from "./features/homepage/utils/WhatsAppWidget";
import { Toaster } from "sonner";
import FloatingActivityDock from "./components/FloatingActivityDock";


// Admin Dashboard - Lazy loaded
const AdminDashboardLayout = lazy(() =>
  import("./features/admin/components/dashboard-layout").then((m) => ({ default: m.DashboardLayout }))
);
const AdminLogin = lazy(() =>
  import("./features/admin/pages/login").then((m) => ({ default: m.Login }))
);
const AdminDashboardOverview = lazy(() =>
  import("./features/admin/pages/dashboard-overview").then((m) => ({ default: m.DashboardOverview }))
);
const AdminCategories = lazy(() =>
  import("./features/admin/pages/categories").then((m) => ({ default: m.Categories }))
);
const AdminProducts = lazy(() =>
  import("./features/admin/pages/products").then((m) => ({ default: m.Products }))
);
const AdminOrders = lazy(() =>
  import("./features/admin/pages/orders").then((m) => ({ default: m.Orders }))
);
const AdminReviews = lazy(() =>
  import("./features/admin/pages/reviews").then((m) => ({ default: m.Reviews }))
);
const AdminCustomRequests = lazy(() =>
  import("./features/admin/pages/custom-requests").then((m) => ({ default: m.CustomRequests }))
);
const AdminDiscounts = lazy(() =>
  import("./features/admin/pages/discounts").then((m) => ({ default: m.Discounts }))
);
const AdminFinancialReports = lazy(() =>
  import("./features/admin/pages/financial-reports").then((m) => ({ default: m.FinancialReports }))
);
const AdminSettings = lazy(() =>
  import("./features/admin/pages/settings").then((m) => ({ default: m.Settings }))
);
const AdminShipping = lazy(() =>
  import("./features/admin/pages/shipping").then((m) => ({ default: m.Shipping }))
);
const AdminSubscribers = lazy(() =>
  import("./features/admin/pages/subscribers").then((m) => ({ default: m.Subscribers }))
);

// Admin auth guard
function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("admin_access_token");
  return token ? <>{children}</> : <Navigate to="/admin/login" replace />;
}

// Customer auth guard – redirects to login if not authenticated
function CustomerProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("customer_access_token");
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

// Only render WhatsApp widget on non-admin pages
function ConditionalWhatsApp() {
  const location = useLocation();
  if (location.pathname.startsWith("/admin")) return null;
  return <WhatsAppWidget />;
}

// Only render Toaster on non-auth pages (hide on /login and /signup)
function ConditionalToaster() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";
  if (isAuthPage) return null;
  return <Toaster position="top-right" theme="dark" closeButton richColors />;
}

// Only render FloatingActivityDock on non-auth pages (hide on /login and /signup)
function ConditionalFloatingActivityDock() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";
  if (isAuthPage) return null;
  return <FloatingActivityDock />;
}

// Loading fallback for lazy-loaded admin pages
function AdminLoading() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId="493910047901-febc082scanlgjm838apfhq93qupj50q.apps.googleusercontent.com">
      <CurrencyProvider>
      <CartProvider>
        <ConditionalToaster />
        <ScrollToTop />
        <ConditionalWhatsApp />
        <ConditionalFloatingActivityDock />
        <Routes>
          {/* Customer-facing routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/checkout" element={<CustomerProtectedRoute><CheckoutPage /></CustomerProtectedRoute>} />
          <Route path="/transaction-history" element={<CustomerProtectedRoute><TransactionHistory /></CustomerProtectedRoute>} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/crypto-payment/:orderId" element={<CustomerProtectedRoute><CryptoPaymentPage /></CustomerProtectedRoute>} />
          <Route path="/order-success/:orderId" element={<CustomerProtectedRoute><OrderSuccessPage /></CustomerProtectedRoute>} />
          <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

          {/* Admin Dashboard routes */}
          <Route
            path="/admin/login"
            element={
              <Suspense fallback={<AdminLoading />}>
                <AdminLogin />
              </Suspense>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <Suspense fallback={<AdminLoading />}>
                  <AdminDashboardLayout />
                </Suspense>
              </AdminProtectedRoute>
            }
          >
            <Route
              index
              element={
                <Suspense fallback={<AdminLoading />}>
                  <AdminDashboardOverview />
                </Suspense>
              }
            />
            <Route
              path="categories"
              element={
                <Suspense fallback={<AdminLoading />}>
                  <AdminCategories />
                </Suspense>
              }
            />
            <Route
              path="products"
              element={
                <Suspense fallback={<AdminLoading />}>
                  <AdminProducts />
                </Suspense>
              }
            />
            <Route
              path="orders"
              element={
                <Suspense fallback={<AdminLoading />}>
                  <AdminOrders />
                </Suspense>
              }
            />
            <Route
              path="reviews"
              element={
                <Suspense fallback={<AdminLoading />}>
                  <AdminReviews />
                </Suspense>
              }
            />
            <Route
              path="custom-requests"
              element={
                <Suspense fallback={<AdminLoading />}>
                  <AdminCustomRequests />
                </Suspense>
              }
            />
            <Route
              path="discounts"
              element={
                <Suspense fallback={<AdminLoading />}>
                  <AdminDiscounts />
                </Suspense>
              }
            />
            <Route
              path="shipping"
              element={
                <Suspense fallback={<AdminLoading />}>
                  <AdminShipping />
                </Suspense>
              }
            />
            <Route
              path="reports"
              element={
                <Suspense fallback={<AdminLoading />}>
                  <AdminFinancialReports />
                </Suspense>
              }
            />
            <Route
              path="subscribers"
              element={
                <Suspense fallback={<AdminLoading />}>
                  <AdminSubscribers />
                </Suspense>
              }
            />
            <Route
              path="settings"
              element={
                <Suspense fallback={<AdminLoading />}>
                  <AdminSettings />
                </Suspense>
              }
            />
          </Route>

          {/* Dashboard route aliases & compatibility */}
          <Route path="/dashboard/login" element={<Navigate to="/admin/login" replace />} />
          <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="/dashboard/*" element={<Navigate to="/admin" replace />} />
          <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="/admin-dashboard/*" element={<Navigate to="/admin" replace />} />
          <Route path="/super-admin-dashboard" element={<Navigate to="/admin" replace />} />
        </Routes>
      </CartProvider>
      </CurrencyProvider>
    </GoogleOAuthProvider>
  );
}

export default App;