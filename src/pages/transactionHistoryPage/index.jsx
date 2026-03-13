import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import storefrontApi from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useCurrency } from "../../contexts/CurrencyContext";
import CheckCircle from "../../assets/CheckCircle.svg";
import Truck from "../../assets/Truck.svg";
import Package from "../../assets/Package.svg";
import Clock1 from "../../assets/Clock1.svg";

const ITEMS_PER_PAGE = 10;

const getStatusColor = (s) => {
  const m = { pending: "#d97706", processing: "#3b82f6", completed: "#22c55e", cancelled: "#ef4444" };
  return m[s] || "#94a3b8";
};

const TransactionHistory = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) { navigate("/login", { replace: true }); return; }
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await storefrontApi.orders.getMyOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (e) { console.error(e); setOrders([]); }
      setLoading(false);
    };
    fetchOrders();
  }, [isAuthenticated, navigate]);



  const filtered = useMemo(() => {
    let result = orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        if (!o.id?.toLowerCase().includes(q)) {
          try {
            const items = typeof o.items_json === "string" ? JSON.parse(o.items_json) : o.items_json || [];
            if (!items.some((it) => it.name?.toLowerCase().includes(q))) return false;
          } catch { return false; }
        }
      }
      return true;
    });
    if (sortBy === "newest") result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    else if (sortBy === "oldest") result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    else if (sortBy === "highest") result.sort((a, b) => b.total - a.total);
    else if (sortBy === "lowest") result.sort((a, b) => a.total - b.total);
    return result;
  }, [orders, statusFilter, searchTerm, sortBy]);

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [statusFilter, searchTerm, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginatedOrders = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const statusCounts = useMemo(() => {
    const c = { all: orders.length };
    orders.forEach((o) => { c[o.status] = (c[o.status] || 0) + 1; });
    return c;
  }, [orders]);

  return (
    <HelmetProvider>
      <Helmet><title>Transaction History | Gems Ore</title></Helmet>
      <Navbar dark={false} />
      <div className="bg-[#faf9f7] min-h-screen">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-8 py-8 mt-28">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[rgba(88,57,49,1)] hover:text-[rgba(68,68,68,1)] transition-colors mb-2 cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m0 0l7 7m-7-7l7-7" /></svg>
                <span className="text-sm font-medium">Back</span>
              </button>
              <h1 className="text-2xl font-bold text-[rgba(68,68,68,1)]">Transaction History</h1>
              <p className="text-sm text-gray-400 mt-1">{orders.length} total order{orders.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {/* Search + Sort bar */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by order ID or item name..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[rgba(88,57,49,1)] bg-gray-50"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[rgba(88,57,49,1)] bg-gray-50 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
              </select>
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {["all", "pending", "processing", "completed", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs font-medium px-4 py-2 rounded-full transition-colors cursor-pointer capitalize ${
                  statusFilter === s
                    ? "bg-[rgba(88,57,49,1)] text-white"
                    : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {s} ({statusCounts[s] || 0})
              </button>
            ))}
          </div>

          {/* Orders */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-[rgba(88,57,49,1)] rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="rgba(200,200,200,1)" strokeWidth="1" className="mx-auto">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="mt-4 text-gray-500 font-medium">No orders found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {paginatedOrders.map((order) => {
                  let items = [];
                  try { items = typeof order.items_json === "string" ? JSON.parse(order.items_json) : order.items_json || []; } catch {}
                  const statusStyles = {
                    pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: Clock1 },
                    processing: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: "⚙️" },
                    confirmed: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: Package },
                    shipped: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200", icon: Truck },
                    delivered: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle },
                    completed: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: "✅" },
                    cancelled: { bg: "bg-red-50", text: "text-red-600", border: "border-red-200", icon: "✕" },
                  };
                  const st = statusStyles[order.status] || statusStyles.pending;
                  return (
                    <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                      <div className="p-5 sm:p-6">
                        {/* Row 1: Order ID + Status | Total */}
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-base font-bold text-[rgba(68,68,68,1)]">Order #{order.id?.slice(0, 8).toUpperCase()}</h3>

                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[11px] text-gray-400">Total</p>
                            <p className="text-xl font-bold text-[rgba(68,68,68,1)]">{formatPrice(order.total)}</p>
                          </div>
                        </div>

                        {/* Row 2: Date + Payment Method */}
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
                          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                          <span>{new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                          {order.payment_method && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span>{order.payment_method}</span>
                            </>
                          )}
                        </div>

                        {/* Items */}
                        {items.length > 0 && (
                          <div className="space-y-4 mb-5">
                            {items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-4">
                                {item.image && (
                                  <img src={item.image} alt={item.name} className="w-[60px] h-[60px] rounded-lg object-cover border border-gray-100 shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-[rgba(68,68,68,1)] truncate">{item.name}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">Quantity: {item.quantity}</p>
                                  <p className="text-xs text-gray-500">Price: {formatPrice(item.price)}</p>
                                </div>
                                <p className="text-sm font-semibold text-[rgba(68,68,68,1)] shrink-0">{formatPrice((item.price || 0) * (item.quantity || 1))}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Delivery Info */}
                        {(order.estimated_delivery || order.shipping_state || (order.shipping_cost > 0)) && (
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-5 text-xs text-gray-500">
                            {order.shipping_state && (
                              <span className="inline-flex items-center gap-1">📍 {order.shipping_state}{order.shipping_country && order.shipping_country !== "Nigeria" ? `, ${order.shipping_country}` : ""}</span>
                            )}
                            {order.estimated_delivery && (
                              <span className="text-[rgba(88,57,49,0.9)] font-medium inline-flex items-center gap-1">🚚 Est. delivery: {order.estimated_delivery}</span>
                            )}
                            {order.shipping_cost > 0 && (
                              <span>Shipping: {formatPrice(order.shipping_cost)}</span>
                            )}
                          </div>
                        )}

                        {/* Expanded Details */}
                        {expandedOrder === order.id && (
                          <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Order ID</span>
                              <span className="font-mono text-xs text-gray-700">{order.id}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Status</span>
                              <span className="capitalize font-medium text-[rgba(68,68,68,1)]">{order.status?.replace("_", " ")}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Date</span>
                              <span className="text-gray-700">{new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Payment Method</span>
                              <span className="text-gray-700">{order.payment_method || "N/A"}</span>
                            </div>
                            {order.subtotal && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="text-gray-700">{formatPrice(order.subtotal)}</span>
                              </div>
                            )}
                            {order.vat_amount > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">VAT</span>
                                <span className="text-gray-700">{formatPrice(order.vat_amount)}</span>
                              </div>
                            )}
                            {order.discount_amount > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Discount</span>
                                <span className="text-green-600">-{formatPrice(order.discount_amount)}</span>
                              </div>
                            )}
                            {order.shipping_cost > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-500">Shipping</span>
                                <span className="text-gray-700">{formatPrice(order.shipping_cost)}</span>
                              </div>
                            )}
                            <div className="flex justify-between border-t pt-2 mt-1">
                              <span className="font-semibold text-[rgba(68,68,68,1)]">Total</span>
                              <span className="font-bold text-[rgba(68,68,68,1)]">{formatPrice(order.total)}</span>
                            </div>
                            {order.shipping_address && (
                              <div className="pt-2 border-t">
                                <span className="text-gray-500">Shipping Address</span>
                                <p className="text-gray-700 mt-1">{order.shipping_address}{order.shipping_city ? `, ${order.shipping_city}` : ""}{order.shipping_state ? `, ${order.shipping_state}` : ""}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            className="text-sm font-medium px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-[rgba(68,68,68,1)] cursor-pointer"
                          >
                            {expandedOrder === order.id ? "Hide Details" : "View Details"}
                          </button>
                          {(order.status === "completed" || order.status === "delivered") && (
                            <button
                              onClick={() => {
                                items.forEach((item) => {
                                  if (item.id) {
                                    navigate(`/product/${item.id}`);
                                  }
                                });
                              }}
                              className="text-sm font-medium px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-[rgba(68,68,68,1)] cursor-pointer"
                            >
                              Order Again
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 bg-white rounded-xl shadow-sm p-4">
                  <p className="text-sm text-gray-400">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                      .reduce((acc, p, i, arr) => {
                        if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, i) =>
                        p === "..." ? (
                          <span key={`dots-${i}`} className="px-2 text-gray-400">…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setCurrentPage(p)}
                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                              currentPage === p
                                ? "bg-[rgba(88,57,49,1)] text-white"
                                : "text-gray-500 hover:bg-gray-100"
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}


        </div>
      </div>
      <Footer />
    </HelmetProvider>
  );
};

export default TransactionHistory;