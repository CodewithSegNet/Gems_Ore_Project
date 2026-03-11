/**
 * Admin API Client
 * All admin dashboard pages use this to communicate with the FastAPI backend
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7001";

function getToken(): string | null {
  return localStorage.getItem("admin_access_token");
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const url = `${API_BASE}/api/v1${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (response.status === 401) {
    localStorage.removeItem("admin_access_token");
    localStorage.removeItem("admin_user");
    window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  const json = await response.json();
  return json.data !== undefined ? json.data : json;
}

export const adminApi = {
  // Auth
  auth: {
    login: (email: string, password: string) =>
      request<any>("/auth/admin-login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    me: () => request<any>("/auth/me"),
    signup: (data: { email: string; password: string; first_name?: string; last_name?: string }) =>
      request<any>("/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // Products
  products: {
    getAll: (params?: Record<string, string>) => {
      const query = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<any[]>(`/products${query}`);
    },
    getById: (id: string) => request<any>(`/products/${id}`),
    create: (data: any) =>
      request<any>("/products", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/products/${id}`, { method: "DELETE" }),
  },

  // Categories
  categories: {
    getAll: (params?: Record<string, string>) => {
      const query = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<any[]>(`/categories${query}`);
    },
    getById: (id: string) => request<any>(`/categories/${id}`),
    create: (data: any) =>
      request<any>("/categories", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/categories/${id}`, { method: "DELETE" }),
  },

  // Orders
  orders: {
    getAll: (params?: Record<string, string>) => {
      const query = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<any[]>(`/orders${query}`);
    },
    getById: (id: string) => request<any>(`/orders/${id}`),
    create: (data: any) =>
      request<any>("/orders", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/orders/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    updateStatus: (id: string, status: string, reason?: string) => {
      const params = new URLSearchParams({ new_status: status });
      if (reason) params.set("reason", reason);
      return request<any>(`/orders/${id}/status?${params}`, { method: "PATCH" });
    },
    updateDeliveryStatus: (id: string, deliveryStatus: string) =>
      request<any>(`/orders/${id}/delivery-status?delivery_status=${encodeURIComponent(deliveryStatus)}`, { method: "PATCH" }),
    approvePayment: (id: string) =>
      request<any>(`/orders/${id}/approve-payment`, { method: "PATCH" }),
    delete: (id: string) =>
      request<void>(`/orders/${id}`, { method: "DELETE" }),
  },

  // Settings
  settings: {
    getAll: () => request<Record<string, string>>("/settings"),
    update: (data: Record<string, string>) =>
      request<any>("/settings", { method: "PUT", body: JSON.stringify(data) }),
  },

  // Shipping
  shipping: {
    getAll: () => request<any[]>("/shipping"),
    create: (data: any) =>
      request<any>("/shipping", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/shipping/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/shipping/${id}`, { method: "DELETE" }),
  },

  // Discounts
  discounts: {
    getAll: (params?: Record<string, string>) => {
      const query = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<any[]>(`/discounts${query}`);
    },
    create: (data: any) =>
      request<any>("/discounts", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      request<any>(`/discounts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<void>(`/discounts/${id}`, { method: "DELETE" }),
  },

  // Reviews
  reviews: {
    getAll: (params?: Record<string, string>) => {
      const query = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<any[]>(`/reviews${query}`);
    },
    create: (data: any) =>
      request<any>("/reviews", { method: "POST", body: JSON.stringify(data) }),
    updateStatus: (id: string, status: string) =>
      request<any>(`/reviews/${id}/status?new_status=${status}`, { method: "PATCH" }),
    delete: (id: string) =>
      request<void>(`/reviews/${id}`, { method: "DELETE" }),
  },

  // Custom Requests
  customRequests: {
    getAll: (params?: Record<string, string>) => {
      const query = params ? "?" + new URLSearchParams(params).toString() : "";
      return request<any[]>(`/custom-requests${query}`);
    },
    create: (data: any) =>
      request<any>("/custom-requests", { method: "POST", body: JSON.stringify(data) }),
    updateStatus: (id: string, status: string) =>
      request<any>(`/custom-requests/${id}/status?new_status=${status}`, { method: "PATCH" }),
    delete: (id: string) =>
      request<void>(`/custom-requests/${id}`, { method: "DELETE" }),
  },

  // Dashboard
  dashboard: {
    getStats: () => request<any>("/dashboard/stats"),
    getChartData: () => request<any>("/dashboard/chart-data"),
    getFinancialReportData: (range: string = "6months") =>
      request<any>(`/dashboard/financial-report-data?range=${range}`),
  },

  // Subscribers
  subscribers: {
    getAll: () => request<any[]>("/subscribers"),
  },

  // Upload
  upload: {
    image: async (file: File): Promise<string> => {
      const formData = new FormData();
      formData.append("file", file);
      const result = await request<{ url: string }>("/upload/image", {
        method: "POST",
        body: formData,
      });
      return `${API_BASE}${result.url}`;
    },
    images: async (files: File[]): Promise<string[]> => {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      const result = await request<{ urls: string[] }>("/upload/images", {
        method: "POST",
        body: formData,
      });
      return result.urls.map((url) => `${API_BASE}${url}`);
    },
  },
};

export default adminApi;
