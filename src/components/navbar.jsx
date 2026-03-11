import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/cartContext";
import { useGender } from "../contexts/genderContext";
import { useAuth } from "../contexts/AuthContext";
import { useFavorites } from "../contexts/FavoritesContext";
import { useCurrency } from "../contexts/CurrencyContext";
import storefrontApi from "../services/api";
import logo from "../assets/logos.png";
import search from "../assets/search.png";
import icon2 from "../assets/icon2.png";
import icon1 from "../assets/icon1.png";
import icon3 from "../assets/heart1.png";

import darksearch from "../assets/iconsearch.png";
import darkcart from "../assets/iconcart.png";
import darklove from "../assets/iconlove.png";
import darkaccount from "../assets/iconprofile.png";
import fast from "../assets/fast.png";
import bar from "../assets/Rectangle2.svg";


const bannerItems = ["earrings", "bracelets", "necklaces", "rings", "watches", "anklets"];

const recommendedSearches = [
  "Male Rings",
  "Female Rings",
  "Bracelets",
  "Earrings",
  "Anklets",
  "Wrist Watches",
  "Diamond Rings",
];


const getStatusColor = (s) => {
  const m = { pending: "#eab308", processing: "#3b82f6", completed: "#22c55e", cancelled: "#ef4444" };
  return m[s] || "#94a3b8";
};
const getDeliveryLabel = (s) => {
  const m = { not_shipped: "Not Shipped", shipped: "Shipped", in_transit: "In Transit", delivered: "Delivered" };
  return m[s] || s;
};
const ORDER_STEPS = [
  { key: "placed", label: "Placed" },
  { key: "payment", label: "Payment" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];
const getStepIndex = (order) => {
  if (order.status === "cancelled") return -1;
  if (order.delivery_status === "delivered") return 4;
  if (order.delivery_status === "in_transit" || order.delivery_status === "shipped") return 3;
  if (order.status === "processing") return 2;
  if (order.status === "pending" || order.payment_approved) return 1;
  return 0;
};
const OrderTimeline = ({ order }) => {
  const activeIdx = getStepIndex(order);
  if (order.status === "cancelled") return (
    <div className="mt-3 bg-red-50 rounded-lg p-3">
      <p className="text-xs font-semibold text-red-600">❌ Order Cancelled</p>
      {order.cancellation_reason && <p className="text-xs text-red-500 mt-1">{order.cancellation_reason}</p>}
    </div>
  );
  return (
    <div className="mt-3 flex items-center gap-0.5">
      {ORDER_STEPS.map((step, i) => (
        <div key={step.key} className="flex-1 flex flex-col items-center">
          <div className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold ${i <= activeIdx ? 'bg-[rgba(88,57,49,1)]' : 'bg-gray-200'}`}>
            {i <= activeIdx ? '✓' : ''}
          </div>
          <p className={`text-[8px] mt-0.5 text-center leading-tight ${i <= activeIdx ? 'text-[rgba(88,57,49,1)] font-semibold' : 'text-gray-400'}`}>{step.label}</p>
        </div>
      ))}
    </div>
  );
};

const Navbar = ({ dark = true }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [wishlistTab, setWishlistTab] = useState("Favorites");
  const [myOrders, setMyOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const { formatPrice } = useCurrency();
  const [orderSearch, setOrderSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [wishlistQuantities, setWishlistQuantities] = useState({});
  const [deleteModalOrderId, setDeleteModalOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const navigate = useNavigate();

  const { cartItems, addToCart, cartCount, removeFromCart, updateQuantity, subtotal, discount, vat, total, appliedDiscount } = useCart();
  const { gender, setGender } = useGender();
  const { user, isAuthenticated, logout } = useAuth();
  const { favoriteItems, toggleFavorite, clearAllFavorites, fetchFavorites, loading: favoritesLoading, favoritesCount } = useFavorites();

  // Random but consistent color for user initial
  const initialColors = ['#E53E3E','#DD6B20','#D69E2E','#38A169','#319795','#3182CE','#5A67D8','#805AD5','#D53F8C','#2B6CB0','#C05621','#2F855A'];
  const userInitialColor = useMemo(() => {
    const str = user?.first_name || user?.email || 'U';
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return initialColors[Math.abs(hash) % initialColors.length];
  }, [user?.first_name, user?.email]);

  const isLoggedIn = isAuthenticated;

  // Fetch orders when profile opens
  useEffect(() => {
    if (profileOpen && isLoggedIn) {
      setOrdersLoading(true);
      storefrontApi.orders.getMyOrders()
        .then((data) => setMyOrders(data || []))
        .catch(() => setMyOrders([]))
        .finally(() => setOrdersLoading(false));
    }
  }, [profileOpen, isLoggedIn]);

  // Fetch full favorites when wishlist panel opens on Favorites tab
  useEffect(() => {
    if (wishlistOpen && wishlistTab === "Favorites") {
      fetchFavorites();
    }
  }, [wishlistOpen, wishlistTab]);

  const iconBg = dark ? "bg-[rgba(255,255,255,0.1)]" : "bg-[rgba(68,68,68,0.1)]";
  const textColor = dark ? "text-white" : "text-[rgba(68,68,68,1)]";

  const searchIcon = dark ? search : darksearch;
  const wishlistIcon = dark ? icon3 : darklove;
  const accountIcon = dark ? icon2 : darkcart;
  const cartIcon = dark ? icon1 : darkaccount;

  const closeAll = () => {
    setSearchOpen(false);
    setCartOpen(false);
    setWishlistOpen(false);
    setProfileOpen(false);
    setMobileMenuOpen(false);
  };

  const togglePanel = (panel) => {
    const isOpen = panel === "search" ? searchOpen : panel === "cart" ? cartOpen : panel === "wishlist" ? wishlistOpen : profileOpen;
    closeAll();
    if (!isOpen) {
      if (panel === "search") setSearchOpen(true);
      else if (panel === "cart") setCartOpen(true);
      else if (panel === "wishlist") setWishlistOpen(true);
      else if (panel === "profile") {
        if (!isLoggedIn) {
          navigate("/login", { replace: true });
          return;
        }
        setProfileOpen(true);
      }
    }
  };

  // Close search dropdown on outside click (desktop only)
  useEffect(() => {
    const handler = (e) => {
      if (
        searchOpen &&
        searchRef.current &&
        !searchRef.current.contains(e.target) &&
        (!mobileSearchRef.current || !mobileSearchRef.current.contains(e.target))
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

  // Debounced product search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await storefrontApi.products.getAll({ search: searchQuery.trim(), status: 'active' });
        const items = res?.data || res || [];
        setSearchResults(Array.isArray(items) ? items.slice(0, 6) : []);
      } catch { setSearchResults([]); }
      setSearchLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Clear search when panel closes
  useEffect(() => { if (!searchOpen) { setSearchQuery(""); setSearchResults([]); } }, [searchOpen]);

  // Delete awaiting_payment order
  const handleDeleteOrder = async (orderId) => {
    try {
      await storefrontApi.orders.delete(orderId);
      setMyOrders(prev => prev.filter(o => o.id !== orderId));
      setDeleteModalOrderId(null);
    } catch (e) {
      alert(e.message || 'Failed to delete order');
    }
  };

  // Wishlist quantity helpers
  const getWishlistQty = (productId) => wishlistQuantities[productId] || 1;
  const setWishlistQty = (productId, qty) => setWishlistQuantities(prev => ({ ...prev, [productId]: Math.max(1, qty) }));

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:7001";
  const getImg = (p) => {
    // images is an array of {id, image_url, sort_order} objects
    let img = p?.image || (p?.images?.[0]?.image_url) || (p?.images?.[0]);
    if (!img) return null;
    if (typeof img === 'object') img = img.image_url || img.url || img.src || '';
    if (typeof img !== 'string' || !img) return null;
    return img.startsWith('http') ? img : `${API_BASE}${img}`;
  };

  return (
    <>
      {/* Top Flowing Banner */}
      <div className="bg-[#958169] overflow-hidden w-full">
        <div className="marquee-track py-2">
          {[...Array(4)].flatMap(() => bannerItems).concat([...Array(4)].flatMap(() => bannerItems)).map((item, index) => (
            <div key={index} className="marquee-item">
              <span className="inline-block w-[6px] h-[6px] rounded-full bg-[rgba(88,57,49,1)]"></span>
              <p className="text-[rgba(88,57,49,1)] text-sm">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navbar */}
      <nav className={`absolute top-10 max-w-screen-2xl mx-auto left-1/2 -translate-x-1/2 w-full z-30 flex justify-between items-center px-4 lg:px-8 py-4 ${textColor}`}>
        <Link to="/">
          <img className="text-xl font-bold w-[55px] cursor-pointer h-[50px] lg:w-[85px] lg:h-[80px]" src={logo} alt="Gems Ore - Premium Jewelry Store Nigeria" />
        </Link>

        <ul className={`flex lg:ml-[8.5rem] items-center justify-center gap-4 md:gap-6 rounded-md md:rounded-lg duration-75 transition-underline py-1 px-2 md:py-1.5 md:px-4 ${iconBg}`}>
          
                   <li onClick={() => setGender("women")} className={`cursor-pointer mb-1.5 lg:mb-0 duration-300 ${gender === "women" ? "underline underline-offset-4" : "hover:underline"}`}>
            <span className="font-thin text-[10px] md:text-sm">Women</span>
          </li>
          <li onClick={() => setGender("men")} className={`cursor-pointer mb-1.5 lg:mb-0 duration-300 ${gender === "men" ? "underline underline-offset-4" : "hover:underline"}`}>
            <span className="font-thin text-[10px] md:text-sm">Men</span>
          </li>
 
        </ul>

        {/* Desktop Nav Icons */}
        <ul className="hidden lg:flex gap-6">
          {/* Search */}
          <li className="relative" ref={searchRef}>
            <div
              onClick={() => togglePanel("search")}
              className={`rounded-full w-[40px] h-[40px] duration-75 transition-color p-2.5 ${iconBg} cursor-pointer hover:bg-[#958169]`}
            >
              <img className="w-full h-full" src={searchIcon} alt="Search jewelry" />
            </div>

            {/* Search Dropdown — directly under icon */}
            {searchOpen && (
              <div className="absolute right-0 top-[52px] w-[90vw] max-w-[360px] z-50 animate-slide-up bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-[rgba(68,68,68,0.11)] mx-3 mt-3 rounded-lg px-4 py-3 flex items-center gap-3">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="rgba(68,68,68,0.6)" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search for anything"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && searchQuery.trim()) { navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`); setSearchOpen(false); } }}
                    className="flex-1 bg-transparent outline-none text-[rgba(68,68,68,1)] placeholder:text-gray-400 text-sm"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                    </button>
                  )}
                </div>

                <div className="max-h-[380px] overflow-y-auto">
                  {searchQuery.trim() ? (
                    <div className="p-3">
                      {searchLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <div className="w-5 h-5 border-2 border-[#958169] border-t-transparent rounded-full animate-spin"></div>
                          <span className="ml-2 text-sm text-gray-400">Searching...</span>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <>
                          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-medium px-1">{searchResults.length} result{searchResults.length > 1 ? 's' : ''}</p>
                          {searchResults.map((product) => (
                            <Link
                              key={product.id}
                              to={`/product/${product.id}`}
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                            >
                              <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                {getImg(product) ? (
                                  <img src={getImg(product)} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-300"><svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[rgba(68,68,68,1)] truncate">{product.name}</p>
                                <p className="text-xs text-[rgba(88,57,49,1)] font-semibold">{formatPrice(product.price)}</p>
                              </div>
                            </Link>
                          ))}
                          {searchResults.length >= 6 && (
                            <Link
                              to={`/products?search=${encodeURIComponent(searchQuery.trim())}`}
                              onClick={() => setSearchOpen(false)}
                              className="block text-center text-sm text-[rgba(88,57,49,1)] font-medium mt-2 py-2 hover:underline"
                            >
                              View all results →
                            </Link>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-sm text-gray-400">No products found for "{searchQuery}"</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">Recommended Searches</p>
                      <ul className="flex flex-wrap gap-x-4 gap-y-3">
                        {recommendedSearches.map((term) => (
                          <li key={term}>
                            <Link
                              to={`/products?category=${term.toLowerCase().replace(/\s+/g, '-')}`}
                              onClick={() => setSearchOpen(false)}
                              className="text-sm text-[rgba(68,68,68,1)] underline hover:text-[rgba(88,57,49,1)] transition-colors duration-200"
                            >
                              {term}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </li>

          {/* Wishlist */}
          <li
            onClick={() => togglePanel("wishlist")}
            className={`relative rounded-full w-[40px] h-[40px] duration-75 transition-color p-2.5 ${iconBg} cursor-pointer hover:bg-[#958169]`}
          >
            <img className="w-full h-full" src={wishlistIcon} alt="Wishlist" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#958169] text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </li>

          {/* Cart with badge */}
          <li
            onClick={() => togglePanel("cart")}
            className={`relative rounded-full w-[40px] h-[40px] duration-75 transition-color p-2.5 ${iconBg} cursor-pointer hover:bg-[#958169]`}
          >
            <img className="w-full h-full" src={accountIcon} alt="Account" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#958169] text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center animate-bounce-once">
                {cartCount}
              </span>
            )}
          </li>

          {/* Profile */}
          <li
            onClick={() => togglePanel("profile")}
            className={`rounded-full w-[40px] h-[40px] duration-75 transition-color ${isLoggedIn ? '' : 'p-2.5 ' + iconBg} cursor-pointer hover:opacity-80 flex items-center justify-center`}
            style={isLoggedIn ? { backgroundColor: userInitialColor } : undefined}
          >
            {isLoggedIn ? (
              <span className="text-sm font-bold text-white">
                {(user?.first_name || user?.email || "U").charAt(0).toUpperCase()}
              </span>
            ) : (
              <img className="w-full h-full" src={cartIcon} alt="Profile" />
            )}
          </li>
        </ul>

        {/* Mobile Burger Button */}
        <button
          className={`lg:hidden flex flex-col justify-center items-center w-[40px] h-[40px] rounded-full ${iconBg} cursor-pointer z-50`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-[18px] h-[2px] ${dark ? 'bg-white' : 'bg-[rgba(68,68,68,1)]'} rounded-full transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'rotate-45 translate-y-[3px]' : ''}`}></span>
          <span className={`block w-[18px] h-[2px] ${dark ? 'bg-white' : 'bg-[rgba(68,68,68,1)]'} rounded-full mt-[4px] transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}></span>
          <span className={`block w-[18px] h-[2px] ${dark ? 'bg-white' : 'bg-[rgba(68,68,68,1)]'} rounded-full mt-[4px] transition-all duration-300 ease-in-out ${mobileMenuOpen ? '-rotate-45 -translate-y-[9px]' : ''}`}></span>
        </button>
      </nav>

      {/* ==================== WISHLIST ASIDE ==================== */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${wishlistOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setWishlistOpen(false)}></div>
        <aside
          className={`absolute right-0 top-0 h-full bg-white shadow-2xl overflow-y-auto transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${wishlistOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ width: "min(541px, 90vw)" }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-normal text-[rgba(68,68,68,1)]">Wishlist</h2>
              <button onClick={() => setWishlistOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1L13 13M1 13L13 1" stroke="rgba(68,68,68,1)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {favoritesLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
              </div>
            ) : favoriteItems.length > 0 ? (
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">{favoriteItems.length} item{favoriteItems.length > 1 ? 's' : ''}</p>
                  <button onClick={() => clearAllFavorites()} className="text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer underline">Clear All</button>
                </div>
                {favoriteItems.map((fav) => {
                  const productImage = fav.product?.image || fav.product?.images?.[0]?.image_url || "";
                  const productName = fav.product?.name || "Product";
                  const productPrice = fav.product?.price || 0;
                  const shareUrl = `${window.location.origin}/product/${fav.product_id}`;
                  return (
                    <>
                    <div key={fav.id} className="flex flex-col gap-4 pb-5 border-b border-gray-100">
                      <div className="flex gap-4">
                      <Link to={`/product/${fav.product_id}`} onClick={() => setWishlistOpen(false)} className="w-[50px] h-[90px] lg:w-[180px] lg:h-[120px] rounded-lg overflow-hidden shrink-0">
                        <img src={productImage} alt={productName} className="w-full h-full object-cover" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${fav.product_id}`} onClick={() => setWishlistOpen(false)} className="text-sm font-medium text-[rgba(68,68,68,1)] truncate block no-underline hover:text-[rgba(88,57,49,1)] transition-colors">
                          {productName}
                        </Link>
                        <div className="flex items-center gap-1 lg:mt-1">
                          <span className="text-xs text-gray-700 md:text-gray-400">Price:</span>
                          <p className="text-base font-bold text-[rgba(68,68,68,1)]">{formatPrice(productPrice)}</p>
                        </div>
                        <div className="flex flex-col gap-2 mt-1 lg:mt-3">
                          <div className="flex items-center gap-2">
                                 <div className="flex items-center border border-black rounded-md overflow-hidden">
                  <button onClick={() => setWishlistQty(fav.product_id, getWishlistQty(fav.product_id) - 1)} className="px-3 py-2 lg:py-3 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">−</button>
                  <span className="px-1 lg:px-4 py-2 lg:py-3 text-sm font-medium ">{getWishlistQty(fav.product_id)}</span>
                  <button onClick={() => setWishlistQty(fav.product_id, getWishlistQty(fav.product_id) + 1)} className="px-3 py-2 lg:py-3 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">+</button>
                </div>
                            <button
                              onClick={() => { addToCart({ id: fav.product_id, name: productName, price: productPrice, image: productImage }, getWishlistQty(fav.product_id)); setWishlistOpen(false); setCartOpen(true); }}
                              className="flex w-fit px-4 py-[13px] lg:py-[1.1rem] bg-black text-white text-[10px] lg:text-xs font-medium rounded-md hover:bg-[rgba(68,47,39,1)] transition-colors duration-300 cursor-pointer"
                            >
                              Add to Cart
                            </button>
                
                            <button
                              onClick={() => {
                                if (navigator.share) {
                                  navigator.share({ title: productName, text: `Check out ${productName} on Gems Ore!`, url: shareUrl });
                                } else {
                                  navigator.clipboard.writeText(shareUrl);
                                  alert("Link copied to clipboard!");
                                }
                              }}
                              className="w-9 h-9 rounded-full border bg-gray-300 border-gray-300 flex items-center justify-center hover:bg-primary transition-all duration-300 cursor-pointer shrink-0"
                            >
                              <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                              </svg>
                            </button>
                          </div>
</div>
                        </div>
                      </div>
                                                <button
                            onClick={() => { addToCart({ id: fav.product_id, name: productName, price: productPrice, image: productImage }, getWishlistQty(fav.product_id)); setWishlistOpen(false); navigate('/checkout'); }}
                            className="w-full py-[1.1rem] text-center border border-black text-black text-xs font-medium rounded-md hover:bg-[rgba(88,57,49,1)] hover:border-[rgba(88,57,49,1)] hover:text-white transition-all duration-300 cursor-pointer"
                          >
                            Buy Outright
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); toggleFavorite(fav.product_id); }} className="text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer underline mt-1">Remove from Wishlist</button>
                    </div>
                    </>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="rgba(200,200,200,1)" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
                <p className="mt-3 text-sm font-medium text-[rgba(68,68,68,1)]">No items in wishlist</p>
                <p className="text-xs text-gray-400 mt-1">Items you love will appear here</p>
                <Link to="/products" onClick={() => setWishlistOpen(false)} className="mt-4 text-sm text-[rgba(88,57,49,1)] underline hover:text-[rgba(68,47,39,1)] transition-colors">
                  Browse Products
                </Link>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ==================== PROFILE ASIDE ==================== */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${profileOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setProfileOpen(false)}></div>
        <aside
          className={`absolute right-0 top-0 h-full bg-white shadow-2xl overflow-y-auto transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${profileOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ width: "min(541px, 90vw)" }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[rgba(68,68,68,1)]">Profile</h2>
              <button onClick={() => setProfileOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1L13 13M1 13L13 1" stroke="rgba(68,68,68,1)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-6 py-6">
            {isLoggedIn ? (
              /* Logged-in User */
              <>
                {/* User Info */}
                <div className="flex items-center gap-2 mb-8 bg-black p-2 md:p-4 rounded-lg">
                 <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: userInitialColor }}>
                    {(user?.first_name || user?.email || "U").charAt(0).toUpperCase()}
                  </div>
              

                  <div className="">
                  <div className="flex items-center justify-between gap-[1rem] lg:gap-[11rem]">
                    <p className="text-sm md:text-base font-bold text-white">Welcome, {user?.first_name || user?.email?.split("@")[0] || "User"}</p>

      <button onClick={() => { logout(); setProfileOpen(false); }} className="text-sm md:text-md text-red-400 hover:text-red-600 text-bold underline transition-colors cursor-pointer">
                  Sign out
                </button>
                  </div>
                    <p className="text-sm text-gray-400">{user?.email}</p>
                  </div>
                </div>

          

                {/* Orders */}
                <div className="flex flex-col" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-[rgba(68,68,68,1)] uppercase tracking-wider">My Orders</h3>
                    <Link to="/transaction-history" onClick={() => setProfileOpen(false)} className="text-xs text-[rgba(88,57,49,1)] font-medium hover:underline">View All</Link>
                  </div>

                  {/* Search */}
                  <div className="mb-3">
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      <input
                        type="text"
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        placeholder="Search by order ID, item name..."
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[rgba(88,57,49,1)] transition-colors bg-gray-50"
                      />
                    </div>
                  </div>

                  {/* Status Filter Pills */}
                  <div className="flex gap-1.5 mb-3 flex-wrap">
                    {['all', 'pending', 'processing', 'completed', 'cancelled'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setOrderFilter(s)}
                        className={`text-[10px] font-medium px-2.5 py-1 rounded-full transition-colors cursor-pointer capitalize ${
                          orderFilter === s
                            ? 'bg-[rgba(88,57,49,1)] text-white'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  {ordersLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-6 h-6 border-2 border-gray-200 border-t-[rgba(88,57,49,1)] rounded-full animate-spin" />
                    </div>
                  ) : myOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-lg">
                      <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="rgba(200,200,200,1)" strokeWidth="1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p className="mt-3 text-sm font-medium text-[rgba(68,68,68,1)]">You haven't made any orders yet</p>
                      <Link to="/products" onClick={() => setProfileOpen(false)} className="mt-2 text-sm text-[rgba(88,57,49,1)] underline hover:text-[rgba(68,68,68,1)] transition-colors">
                        Find an Item to Order
                      </Link>
                    </div>
                  ) : (() => {
                    const filtered = myOrders.filter((order) => {
                      const matchesFilter = orderFilter === 'all' || order.status === orderFilter;
                      if (!matchesFilter) return false;
                      if (!orderSearch.trim()) return true;
                      const q = orderSearch.toLowerCase();
                      if (order.id?.toLowerCase().includes(q)) return true;
                      if (order.status?.toLowerCase().includes(q)) return true;
                      // Search in items
                      try {
                        const items = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : (order.items_json || []);
                        if (items.some(item => item.name?.toLowerCase().includes(q))) return true;
                      } catch {}
                      return false;
                    });
                    return filtered.length === 0 ? (
                      <div className="flex flex-col items-center py-8 text-center">
                        <p className="text-sm text-gray-400">No orders match your search</p>
                      </div>
                    ) : (
                      <div className="space-y-3 overflow-y-auto pr-1 flex-1" style={{ maxHeight: 'calc(100vh - 380px)' }}>
                        {filtered.map((order) => {
                          let orderItems = [];
                          try {
                            orderItems = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : (order.items_json || []);
                          } catch {}
                          const itemNames = orderItems.map(it => it.name).filter(Boolean);
                          return (
                            <div key={order.id}
                              className="bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 hover:scale-[1.02] transition-all duration-200"
                              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                              <div className="flex items-start gap-3">
                                {/* Item thumbnails */}
                                <div className="flex -space-x-2 shrink-0">
                                  {orderItems.slice(0, 3).map((item, idx) => (
                                    <div key={idx} className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white shadow-sm">
                                      {item.image ? (
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[8px] text-gray-400">N/A</div>
                                      )}
                                    </div>
                                  ))}
                                  {orderItems.length > 3 && (
                                    <div className="w-10 h-10 rounded-lg bg-gray-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-gray-500">
                                      +{orderItems.length - 3}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-mono text-gray-400">#{order.id?.slice(0, 8)}</p>
                                  {itemNames.length > 0 && (
                                    <p className="text-sm font-medium text-[rgba(68,68,68,1)] mt-0.5 truncate" title={itemNames.join(', ')}>
                                      {itemNames.length <= 2 ? itemNames.join(', ') : `${itemNames.slice(0, 2).join(', ')} +${itemNames.length - 2} more`}
                                    </p>
                                  )}
                                  <p className="text-sm font-bold text-[rgba(68,68,68,1)] mt-0.5">{formatPrice(order.total)}</p>
                                  <p className="text-xs text-gray-400 mt-0.5">{order.items_count} item{order.items_count !== 1 ? 's' : ''} · {new Date(order.created_at).toLocaleDateString()}</p>
                                  {order.estimated_delivery && (
                                    <p className="text-xs text-[rgba(88,57,49,0.8)] mt-0.5">🚚 Est. delivery: {order.estimated_delivery}</p>
                                  )}
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: getStatusColor(order.status) }}>
                                    {order.status?.replace('_', ' ')}
                                  </span>
                                  {order.delivery_status && order.delivery_status !== 'not_shipped' && (
                                    <span className="text-[9px] text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
                                      📦 {getDeliveryLabel(order.delivery_status)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {expandedOrder === order.id && (
                                <OrderTimeline order={order} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </>
            ) : (
              /* Non-logged-in User */
              <>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="rgba(200,200,200,1)" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[rgba(68,68,68,1)]">Welcome to Gems Ore</h3>
                  <p className="text-sm text-gray-400 mt-1 mb-6">Sign in to access your account, orders, and wishlist</p>

                  <Link to="/login" onClick={() => setProfileOpen(false)} className="w-full max-w-[280px] py-3 bg-[rgba(88,57,49,1)] text-white rounded-lg font-medium hover:bg-[rgba(68,47,39,1)] transition-colors duration-300 cursor-pointer mb-3 block text-center">
                    Sign In
                  </Link>
                  <Link to="/signup" onClick={() => setProfileOpen(false)} className="w-full max-w-[280px] py-3 border border-[rgba(88,57,49,1)] text-[rgba(88,57,49,1)] rounded-lg font-medium hover:bg-[rgba(88,57,49,0.05)] transition-colors duration-300 cursor-pointer block text-center">
                    Create Account
                  </Link>
                </div>

                {/* Browse suggestion */}
                <div className="mt-6 border-t border-gray-100 pt-6">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">Explore</p>
                  <ul className="flex flex-col gap-1">
                    {["Necklaces", "Rings", "Bracelets", "Earrings", "Watches"].map((cat) => (
                      <li key={cat}>
                        <Link
                          to={`/products?category=${cat.toLowerCase()}`}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm text-[rgba(68,68,68,1)] hover:text-[rgba(88,57,49,1)]"
                        >
                          {cat}
                          <svg className="ml-auto w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </aside>
      </div>

      {/* ==================== CART SIDEBAR ==================== */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${cartOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCartOpen(false)}></div>
        <aside
          className={`absolute right-0 top-0 h-full bg-white shadow-2xl overflow-y-auto transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ width: "min(541px, 90vw)" }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-normal text-[rgba(68,68,68,1)]">Shopping Cart</h2>
                <p className="text-sm text-gray-400 mt-0.5">{cartCount} items</p>
              </div>
              <button onClick={() => setCartOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1L13 13M1 13L13 1" stroke="rgba(68,68,68,1)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="mt-3 bg-transparent rounded-md border-[3px] border-dotted border-[rgba(68,68,68,1)] px-3 py-2">
<div className="flex items-center justify-between w-full">
  <p className="text-sm">FREE Shipping Within Abuja (FCT)</p>
  <img className="w-5 h-5" src={fast} alt="" />
</div>

<div className="w-full pt-3 rounded-full">
    <img className="w-[100%] h-4 rounded-full" src={bar} alt="" />
</div>
            </div>
          </div>

          {/* Cart Body */}
          <div className="px-6 py-4 flex-1 flex flex-col">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center">
                <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="rgba(200,200,200,1)" strokeWidth="1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                <p className="mt-2 text-lg font-medium text-[rgba(68,68,68,1)]">Your Cart is Empty</p>
                <p className="text-sm text-gray-400 mt-1"></p>

                <div className="mt-2 bg-white rounded-lg w-fit max-w-[232px]">
                  <ul className="flex justify-center items-center py-3 px-6 border text-black border-black hover:bg-primary hover:border-primary hover:text-white transition-colors rounded-md">
                    {["Add Item to Cart"].map((cat) => (
                      <li key={cat}>
                        <Link to={`/products?category=${cat.toLowerCase()}`} onClick={() => setCartOpen(false)} className="text-sm hover:text-white transition-colors">
                          {cat}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-5 border-b border-gray-100">
                    <div className="w-[100px] h-[100px] rounded-lg overflow-hidden shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[rgba(68,68,68,1)] truncate">{item.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-gray-400">Price:</span>
                        <p className="text-base font-bold text-[rgba(68,68,68,1)]">{formatPrice(item.price)}</p>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 border border-gray-200 rounded-md">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer rounded-l-md">−</button>
                          <span className="text-sm font-medium text-[rgba(68,68,68,1)] min-w-[20px] text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer rounded-r-md">+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer underline">
                          Remove from Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {cartItems.length > 0 && (
              <>
            <div className="sticky bg-[#f4f4f4] bottom-0 mx-2 rounded-lg border-t border-gray-100 px-6 py-5">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">SubTotal</span>
                  <span className="font-bold text-[rgba(68,68,68,1)]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">VAT (7.5%)</span>
                  <span className="text-[rgba(68,68,68,1)]">{formatPrice(vat)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[rgba(68,68,68,1)]">{appliedDiscount ? (appliedDiscount.name || 'Discount') : 'Discount'}</span>
                  <span className="text-[rgba(68,68,68,1)]">{discount > 0 ? `−${formatPrice(discount)}` : 'None'}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-gray-100 pt-3 mt-2">
                  <span className="text-[rgba(68,68,68,1)]">Total</span>
                  <span className="text-[rgba(68,68,68,1)]">{formatPrice(total)}</span>
                </div>
              </div>
  
            </div>

<div className="mx-5 my-5">
                        <Link to="/checkout" onClick={() => setCartOpen(false)} className="w-full py-5 bg-black text-white rounded-lg font-medium hover:bg-[rgba(68,47,39,1)] transition-colors duration-300 cursor-pointer block text-center">
                Proceed to CheckOut
              </Link>
              <Link to="/cart" onClick={() => setCartOpen(false)} className="w-full py-5 bg-transparent border border-black text-black rounded-lg font-medium hover:bg-[rgba(68,47,39,1)] transition-colors duration-300 cursor-pointer block text-center mt-3 text-sm text-[rgba(88,57,49,1)] hover:text-white">
                View Cart
              </Link>
</div>

             </>
          )}
        </aside>
      </div>

      {/* ==================== MOBILE SEARCH OVERLAY ==================== */}
      <div ref={mobileSearchRef} className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${searchOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSearchOpen(false)}></div>
        <div className={`absolute top-0 left-0 right-0 bg-white shadow-xl transition-transform duration-300 ${searchOpen ? 'translate-y-0' : '-translate-y-full'}`}>
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-[rgba(68,68,68,0.11)] rounded-lg px-4 py-3 flex items-center gap-3">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="rgba(68,68,68,0.6)" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search for anything"
                  autoFocus={searchOpen}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && searchQuery.trim()) { navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`); setSearchOpen(false); } }}
                  className="flex-1 bg-transparent outline-none text-[rgba(68,68,68,1)] placeholder:text-gray-400 text-sm"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  </button>
                )}
              </div>
              <button onClick={() => setSearchOpen(false)} className="text-gray-500 text-sm font-medium cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-5">
            {searchQuery.trim() ? (
              <div>
                {searchLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-[#958169] border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2 text-sm text-gray-400">Searching...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-medium">{searchResults.length} result{searchResults.length > 1 ? 's' : ''}</p>
                    {searchResults.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        onClick={() => setSearchOpen(false)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                      >
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {getImg(product) ? (
                            <img src={getImg(product)} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300"><svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[rgba(68,68,68,1)] truncate">{product.name}</p>
                          <p className="text-xs text-[rgba(88,57,49,1)] font-semibold">{formatPrice(product.price)}</p>
                        </div>
                      </Link>
                    ))}
                    {searchResults.length >= 6 && (
                      <Link
                        to={`/products?search=${encodeURIComponent(searchQuery.trim())}`}
                        onClick={() => setSearchOpen(false)}
                        className="block text-center text-sm text-[rgba(88,57,49,1)] font-medium mt-2 py-2 hover:underline"
                      >
                        View all results →
                      </Link>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-400">No products found for "{searchQuery}"</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">Recommended Searches</p>
                <ul className="flex flex-wrap gap-x-4 gap-y-3">
                  {recommendedSearches.map((term) => (
                    <li key={term}>
                      <button
                        onClick={() => setSearchQuery(term)}
                        className="text-sm text-[rgba(68,68,68,1)] underline hover:text-[rgba(88,57,49,1)] transition-colors duration-200 cursor-pointer"
                      >
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* ==================== MOBILE MENU ==================== */}
      <div className={`fixed inset-0 z-40 transition-all duration-500 ease-in-out ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileMenuOpen(false)}
        ></div>

        <div className={`absolute right-0 top-0 h-full w-[80px] md:w-[90px] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-6 left-1/2 -translate-x-1/2 w-[35px] h-[35px] rounded-full bg-[rgba(255,255,255,0.1)] hover:bg-[#958169] transition-colors duration-300 flex items-center justify-center cursor-pointer"
            aria-label="Close menu"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L13 13M1 13L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <ul className="flex flex-col items-center gap-6 pt-24">
            {[
              { src: search, alt: "Search jewelry", action: () => { togglePanel("search"); setMobileMenuOpen(false); } },
              { src: icon3, alt: "Wishlist", action: () => { togglePanel("wishlist"); setMobileMenuOpen(false); }, badge: favoritesCount },
              { src: icon2, alt: "Account", action: () => { togglePanel("cart"); setMobileMenuOpen(false); } },
              { src: icon1, alt: "Cart", action: () => { togglePanel("profile"); setMobileMenuOpen(false); }, showInitial: isLoggedIn },
            ].map((item, i) => (
              <li
                key={item.alt}
                onClick={item.action}
                className={`relative rounded-full w-[40px] h-[40px] duration-75 transition-all ${item.showInitial ? '' : 'p-2.5 bg-[rgba(255,255,255,0.1)]'} cursor-pointer hover:opacity-80 flex items-center justify-center ${mobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                style={{ ...(item.showInitial ? { backgroundColor: userInitialColor } : {}), transitionDelay: mobileMenuOpen ? `${200 + i * 100}ms` : '0ms' }}
              >
                {item.showInitial ? (
                  <span className="text-sm font-bold text-white">
                    {(user?.first_name || user?.email || "U").charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <img className="w-full h-full" src={item.src} alt={item.alt} />
                )}
                {item.alt === "Account" && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#958169] text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#958169] text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Navbar;