import { Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import HomePage from "./pages/homePage";
import ProductPage from "./pages/productPage";
import ProductDetailPage from "./pages/productDetailPage";
import LoginPage from "./pages/loginPage";
import SignUpPage from "./pages/signUpPage";
import CheckoutPage from "./pages/checkoutPage";
import CartPage from "./pages/cartPage";
import CryptoPaymentPage from "./pages/cryptoPaymentPage";
import OrderSuccessPage from "./pages/orderSuccessPage";
import TransactionHistory from "./pages/transactionHistoryPage";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CartProvider } from "./contexts/cartContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import ScrollToTop from "./components/ScrollToTop";

// Admin Dashboard - Lazy loaded
const AdminDashboardLayout = lazy(() =>
  import("./admin/components/dashboard-layout").then((m) => ({ default: m.DashboardLayout }))
);
const AdminLogin = lazy(() =>
  import("./admin/pages/login").then((m) => ({ default: m.Login }))
);
const AdminDashboardOverview = lazy(() =>
  import("./admin/pages/dashboard-overview").then((m) => ({ default: m.DashboardOverview }))
);
const AdminCategories = lazy(() =>
  import("./admin/pages/categories").then((m) => ({ default: m.Categories }))
);
const AdminProducts = lazy(() =>
  import("./admin/pages/products").then((m) => ({ default: m.Products }))
);
const AdminOrders = lazy(() =>
  import("./admin/pages/orders").then((m) => ({ default: m.Orders }))
);
const AdminReviews = lazy(() =>
  import("./admin/pages/reviews").then((m) => ({ default: m.Reviews }))
);
const AdminCustomRequests = lazy(() =>
  import("./admin/pages/custom-requests").then((m) => ({ default: m.CustomRequests }))
);
const AdminDiscounts = lazy(() =>
  import("./admin/pages/discounts").then((m) => ({ default: m.Discounts }))
);
const AdminFinancialReports = lazy(() =>
  import("./admin/pages/financial-reports").then((m) => ({ default: m.FinancialReports }))
);
const AdminSettings = lazy(() =>
  import("./admin/pages/settings").then((m) => ({ default: m.Settings }))
);
const AdminShipping = lazy(() =>
  import("./admin/pages/shipping").then((m) => ({ default: m.Shipping }))
);

// Admin auth guard
function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("admin_access_token");
  return token ? <>{children}</> : <Navigate to="/admin/login" replace />;
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
        <ScrollToTop />
        <Routes>
          {/* Customer-facing routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/transaction-history" element={<TransactionHistory />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/crypto-payment/:orderId" element={<CryptoPaymentPage />} />
          <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />

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
              path="settings"
              element={
                <Suspense fallback={<AdminLoading />}>
                  <AdminSettings />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </CartProvider>
      </CurrencyProvider>
    </GoogleOAuthProvider>
  );
}

export default App;