const API_BASE = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:7001"}/api/v1`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("customer_access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const request = async (path, options = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json();
  if (res.status === 401) {
    // Token expired or invalid — auto logout
    const hadToken = localStorage.getItem("customer_access_token");
    localStorage.removeItem("customer_access_token");
    localStorage.removeItem("customer_user");
    if (hadToken && window.location.pathname !== "/login") {
      window.location.replace("/login");
    }
    throw new Error(data.message || "Session expired. Please log in again.");
  }
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data.data;
};

const storefrontApi = {
  // Products
  products: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/products${query ? `?${query}` : ""}`)
        .then((data) => (Array.isArray(data) ? data : data.items || []));
    },
    getById: (id) => request(`/products/${id}`),
  },

  // Categories
  categories: {
    getAll: () => request("/categories"),
  },

  // Auth
  auth: {
    checkEmail: (email) =>
      request("/auth/check-email", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    login: (email) =>
      request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    signup: (data) =>
      request("/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    sendOtp: (email) =>
      request("/auth/send-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    verifyOtp: (email, otp) =>
      request("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      }),
    me: () => request("/auth/me"),
    googleAuth: (data) =>
      request("/auth/google", { method: "POST", body: JSON.stringify(data) }),
  },

  // Reviews
  reviews: {
    getByProduct: (productId) => request(`/reviews?product_id=${productId}&status=approved`),
    getMyReview: (productId) => request(`/reviews/my-review/${productId}`),
    create: (data) =>
      request("/reviews", { method: "POST", body: JSON.stringify(data) }),
    update: (reviewId, data) =>
      request(`/reviews/${reviewId}`, { method: "PUT", body: JSON.stringify(data) }),
  },

  // Custom Requests
  customRequests: {
    create: (data) =>
      request("/custom-requests", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // Subscribers
  subscribers: {
    subscribe: (email) =>
      request("/subscribers", { method: "POST", body: JSON.stringify({ email }) }),
  },

  // Favorites
  favorites: {
    getAll: () => request("/favorites"),
    getIds: () => request("/favorites/ids"),
    add: (productId) => request(`/favorites/${productId}`, { method: "POST" }),
    remove: (productId) => request(`/favorites/${productId}`, { method: "DELETE" }),
  },

  // Orders (checkout)
  orders: {
    create: (data) =>
      request("/orders", { method: "POST", body: JSON.stringify(data) }),
    getMyOrders: () => request("/orders/my-orders"),
    getById: (id) => request(`/orders/${id}`),
    delete: (id) => request(`/orders/${id}`, { method: "DELETE" }),
    hasPurchasedProduct: (productId) =>
      request(`/orders/has-purchased/${productId}`).catch(() => ({ purchased: false })),
    uploadPaymentProof: (orderId, proofUrl) =>
      request(`/orders/${orderId}/payment-proof?proof_url=${encodeURIComponent(proofUrl)}`, { method: "PATCH" }),
  },

  // Discounts / Coupons
  discounts: {
    validate: (code, subtotal) =>
      request("/discounts/validate", {
        method: "POST",
        body: JSON.stringify({ code, subtotal }),
      }),
    getAutoDiscounts: (subtotal, email, productIds, productPrices) =>
      request("/discounts/apply-auto", {
        method: "POST",
        body: JSON.stringify({
          subtotal,
          email: email || null,
          product_ids: productIds || [],
          product_prices: productPrices || [],
        }),
      }),
    recordUse: (discountId, code) =>
      request("/discounts/use", {
        method: "POST",
        body: JSON.stringify({
          discount_id: discountId || null,
          code: code || null,
        }),
      }),
  },

  // Settings (public)
  settings: {
    getPublic: () => request("/settings/public"),
  },

  // Shipping
  shipping: {
    calculate: (country, state) => {
      const params = new URLSearchParams({ country });
      if (state) params.append("state", state);
      return request(`/shipping/calculate?${params.toString()}`);
    },
    getAll: () => request("/shipping"),
  },

  // Upload
  upload: {
    image: async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/upload/image`, {
        method: "POST",
        headers: { ...getAuthHeaders() },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      return data.data;
    },
  },
};

export default storefrontApi;
