import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";
import { DashboardLayout } from "./components/dashboard-layout";
import { Loading } from "./components/loading";
import { Navigate } from "react-router";

// Lazy load page components for code splitting
const DashboardOverview = lazy(() => 
  import("./pages/dashboard-overview").then(module => ({ default: module.DashboardOverview }))
);
const Categories = lazy(() => 
  import("./pages/categories").then(module => ({ default: module.Categories }))
);
const Products = lazy(() => 
  import("./pages/products").then(module => ({ default: module.Products }))
);
const Orders = lazy(() => 
  import("./pages/orders").then(module => ({ default: module.Orders }))
);
const Reviews = lazy(() => 
  import("./pages/reviews").then(module => ({ default: module.Reviews }))
);
const CustomRequests = lazy(() => 
  import("./pages/custom-requests").then(module => ({ default: module.CustomRequests }))
);
const Discounts = lazy(() => 
  import("./pages/discounts").then(module => ({ default: module.Discounts }))
);
const FinancialReports = lazy(() => 
  import("./pages/financial-reports").then(module => ({ default: module.FinancialReports }))
);
const Settings = lazy(() => 
  import("./pages/settings").then(module => ({ default: module.Settings }))
);
const Login = lazy(() => 
  import("./pages/login").then(module => ({ default: module.Login }))
);

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// Wrapper component for Suspense
function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <SuspenseWrapper>
        <Login />
      </SuspenseWrapper>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { 
        index: true, 
        element: (
          <SuspenseWrapper>
            <DashboardOverview />
          </SuspenseWrapper>
        ),
      },
      { 
        path: "categories", 
        element: (
          <SuspenseWrapper>
            <Categories />
          </SuspenseWrapper>
        ),
      },
      { 
        path: "products", 
        element: (
          <SuspenseWrapper>
            <Products />
          </SuspenseWrapper>
        ),
      },
      { 
        path: "orders", 
        element: (
          <SuspenseWrapper>
            <Orders />
          </SuspenseWrapper>
        ),
      },
      { 
        path: "reviews", 
        element: (
          <SuspenseWrapper>
            <Reviews />
          </SuspenseWrapper>
        ),
      },
      { 
        path: "custom-requests", 
        element: (
          <SuspenseWrapper>
            <CustomRequests />
          </SuspenseWrapper>
        ),
      },
      { 
        path: "discounts", 
        element: (
          <SuspenseWrapper>
            <Discounts />
          </SuspenseWrapper>
        ),
      },
      { 
        path: "reports", 
        element: (
          <SuspenseWrapper>
            <FinancialReports />
          </SuspenseWrapper>
        ),
      },
      { 
        path: "settings", 
        element: (
          <SuspenseWrapper>
            <Settings />
          </SuspenseWrapper>
        ),
      },
    ],
  },
]);