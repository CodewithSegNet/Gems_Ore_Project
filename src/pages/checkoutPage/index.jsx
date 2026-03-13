import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/cartContext";
import { useAuth } from "../../contexts/AuthContext";
import storefrontApi from "../../services/api";
import Navbar from "../../components/navbar";
import { usePaystackPayment } from "react-paystack";
import { useCurrency } from "../../contexts/CurrencyContext";

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];



const PAYSTACK_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_3c9322588fe7083852cbbee6a92aa29a9221bf5d";

function PaystackButton({ email, amount, onSuccess, onClose, disabled, total, onValidate, formatPrice }) {
  const config = {
    reference: `GO_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    email,
    amount: Math.round(amount * 100), // kobo
    publicKey: PAYSTACK_KEY,
    currency: "NGN",
  };
  const initializePayment = usePaystackPayment(config);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (onValidate && !onValidate()) return;
        initializePayment({ onSuccess, onClose });
      }}
      className="w-full py-4 bg-[rgba(88,57,49,1)] text-white rounded-xl font-semibold hover:bg-[rgba(68,47,39,1)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer"
    >
      {disabled ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Processing...
        </span>
      ) : (
        `Pay with Paystack — ${formatPrice(total)}`
      )}
    </button>
  );
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, subtotal, discount, vat, vatPercent, total, clearCart, cartCount, appliedDiscount } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { formatPrice } = useCurrency();

  const [form, setForm] = useState({
    name: user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "",
    email: user?.email || "",
    phone: "",
    address: "",
    note: "",
  });

  const [shippingCountry, setShippingCountry] = useState("Nigeria");
  const [shippingState, setShippingState] = useState("");
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingFound, setShippingFound] = useState(false);
  const [deliveryDays, setDeliveryDays] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("Paystack");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const grandTotal = total + shippingCost;

  // Fetch shipping cost when location changes
  useEffect(() => {
    if (!shippingState && shippingCountry === "Nigeria") {
      setShippingCost(0);
      setShippingFound(false);
      return;
    }
    const fetchShipping = async () => {
      setShippingLoading(true);
      try {
        const data = await storefrontApi.shipping.calculate(shippingCountry, shippingState || undefined);
        setShippingCost(data.shipping_price || 0);
        setShippingFound(data.found || false);
        setDeliveryDays(data.delivery_days || "");
      } catch {
        setShippingCost(0);
        setShippingFound(false);
        setDeliveryDays("");
      } finally {
        setShippingLoading(false);
      }
    };
    fetchShipping();
  }, [shippingCountry, shippingState]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const buildOrderData = () => ({
    customer_name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim() || null,
    address: form.address.trim() || null,
    city: shippingState || shippingCountry,
    notes: form.note.trim() || null,
    total: Math.round(grandTotal * 100) / 100,
    payment_method: paymentMethod,
    items_count: cartCount,
    items_json: JSON.stringify(
      cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      }))
    ),
    status: "pending",
    discount_code: appliedDiscount?.code || appliedDiscount?.name || null,
    discount_amount: Math.round(discount * 100) / 100,
    shipping_country: shippingCountry,
    shipping_state: shippingState || null,
    shipping_cost: Math.round(shippingCost * 100) / 100,
    estimated_delivery: deliveryDays || null,
  });

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Full name is required";
    if (!form.email.trim()) errors.email = "Email is required";
    if (!form.phone.trim()) errors.phone = "Phone number is required";
    if (!form.address.trim()) errors.address = "Delivery address is required";
    if (shippingCountry === "Nigeria" && !shippingState) errors.state = "Please select your state";
    if (shippingCountry !== "Nigeria" && !shippingState.trim()) errors.state = "State / region is required";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("");
      return false;
    }
    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return false;
    }
    setError("");
    return true;
  };

  // Paystack success
  const handlePaystackSuccess = async (reference) => {
    setLoading(true);
    try {
      const orderData = buildOrderData();
      orderData.status = "pending";
      orderData.payment_approved = true;
      const result = await storefrontApi.orders.create(orderData);
      // Record discount usage
      if (appliedDiscount) {
        storefrontApi.discounts.recordUse(appliedDiscount.id, appliedDiscount.code).catch(() => {});
      }
      clearCart();
      navigate(`/order-success/${result.id}?method=Paystack&ref=${reference.reference}`);
    } catch (err) {
      setError(err.message || "Failed to create order after payment.");
    } finally {
      setLoading(false);
    }
  };

  // Crypto submit
  const handleCryptoSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const orderData = buildOrderData();
      const result = await storefrontApi.orders.create(orderData);
      // Record discount usage
      if (appliedDiscount) {
        storefrontApi.discounts.recordUse(appliedDiscount.id, appliedDiscount.code).catch(() => {});
      }
      clearCart();
      navigate(`/crypto-payment/${result.id}?method=${paymentMethod}`);
    } catch (err) {
      setError(err.message || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <>
        <Navbar dark={false} />
        <div className="min-h-screen bg-[#faf9f7] pt-32 pb-16 px-4">
          <div className="max-w-lg mx-auto text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <h2 className="text-xl font-bold text-[rgba(68,68,68,1)] mb-2">Your cart is empty</h2>
            <p className="text-gray-400 mb-6">Add items to your cart to proceed with checkout.</p>
            <Link to="/products" className="inline-block px-8 py-3 bg-[rgba(88,57,49,1)] text-white rounded-lg font-medium hover:bg-[rgba(68,47,39,1)] transition-colors">Browse Products</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar dark={false} />
      <div className="min-h-screen bg-[#faf9f7] pt-28 md:pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-8">
            <Link to="/" className="hover:text-[rgba(88,57,49,1)] transition-colors">Home</Link>
            <span>/</span>
            <Link to="/cart" className="hover:text-[rgba(88,57,49,1)] transition-colors">Cart</Link>
            <span>/</span>
            <span className="text-[rgba(68,68,68,1)]">Checkout</span>
          </div>

          <h1 className="text-3xl font-bold text-[rgba(68,68,68,1)] mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left: Form */}
            <form onSubmit={handleCryptoSubmit} className="lg:col-span-3 space-y-6">
              {/* Customer Info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-[rgba(68,68,68,1)] mb-5">Customer Information</h2>
                {!isAuthenticated && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                    <p className="text-sm text-amber-700">
                      <Link to="/login" className="font-semibold underline text-[rgba(88,57,49,1)]">Sign in</Link> to auto-fill your details and track your orders.
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} required placeholder="Enter your full name"
                      className={`w-full px-4 py-3 border ${fieldErrors.name ? 'border-red-400' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(88,57,49,0.3)] focus:border-[rgba(88,57,49,1)] transition-all`} />
                    {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@email.com"
                      className={`w-full px-4 py-3 border ${fieldErrors.email ? 'border-red-400' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(88,57,49,0.3)] focus:border-[rgba(88,57,49,1)] transition-all`} />
                    {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} required placeholder="+234 800 000 0000"
                      className={`w-full px-4 py-3 border ${fieldErrors.phone ? 'border-red-400' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(88,57,49,0.3)] focus:border-[rgba(88,57,49,1)] transition-all`} />
                    {fieldErrors.phone && <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>}
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-[rgba(68,68,68,1)] mb-5">Delivery Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Delivery Address <span className="text-red-500">*</span></label>
                    <input type="text" name="address" value={form.address} onChange={handleChange} required placeholder="Street address"
                      className={`w-full px-4 py-3 border ${fieldErrors.address ? 'border-red-400' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(88,57,49,0.3)] focus:border-[rgba(88,57,49,1)] transition-all`} />
                    {fieldErrors.address && <p className="text-xs text-red-500 mt-1">{fieldErrors.address}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">Country <span className="text-red-500">*</span></label>
                      <select
                        value={shippingCountry}
                        onChange={(e) => {
                          setShippingCountry(e.target.value);
                          setShippingState("");
                        }}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(88,57,49,0.3)] focus:border-[rgba(88,57,49,1)] transition-all bg-white cursor-pointer"
                      >
                        <option value="Nigeria">Nigeria</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Ghana">Ghana</option>
                        <option value="South Africa">South Africa</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">
                        {shippingCountry === "Nigeria" ? "State" : "State / Region"} <span className="text-red-500">*</span>
                      </label>
                      {shippingCountry === "Nigeria" ? (
                        <>
                        <select
                          value={shippingState}
                          onChange={(e) => setShippingState(e.target.value)}
                          required
                          className={`w-full px-4 py-3 border ${fieldErrors.state ? 'border-red-400' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(88,57,49,0.3)] focus:border-[rgba(88,57,49,1)] transition-all bg-white cursor-pointer`}
                        >
                          <option value="">Select a state</option>
                          {NIGERIAN_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {fieldErrors.state && <p className="text-xs text-red-500 mt-1">{fieldErrors.state}</p>}
                        </>
                      ) : (
                        <>
                        <input
                          type="text"
                          value={shippingState}
                          onChange={(e) => setShippingState(e.target.value)}
                          placeholder="e.g. California"
                          required
                          className={`w-full px-4 py-3 border ${fieldErrors.state ? 'border-red-400' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(88,57,49,0.3)] focus:border-[rgba(88,57,49,1)] transition-all`}
                        />
                        {fieldErrors.state && <p className="text-xs text-red-500 mt-1">{fieldErrors.state}</p>}
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">Order Notes (optional)</label>
                    <textarea name="note" value={form.note} onChange={handleChange} rows={3} placeholder="Any special instructions for your order..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[rgba(88,57,49,0.3)] focus:border-[rgba(88,57,49,1)] transition-all" />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-[rgba(68,68,68,1)] mb-5">Payment Method</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "Paystack", label: "Paystack", desc: "Card / Bank", icon: (
                      <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="18" fill="#0A1F44"/><rect x="9" y="11" width="18" height="3.5" rx="1.5" fill="#00C3F7"/><rect x="9" y="16.5" width="18" height="3.5" rx="1.5" fill="#00C3F7"/><rect x="9" y="22" width="13" height="3.5" rx="1.5" fill="#00C3F7"/></svg>
                    )},
                    { id: "BTC", label: "Bitcoin", desc: "BTC Transfer", icon: (
                      <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="18" fill="#F7931A"/><path d="M23.5 15.9c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.6-.4-.7 2.7c-.4-.1-.8-.2-1.3-.3l.7-2.7-1.6-.4-.7 2.7c-.3-.1-.7-.2-1-.3l-2.2-.5-.4 1.7s1.2.3 1.2.3c.7.2.8.6.8 1l-.8 3.2c0 0 .1 0 .2.1h-.2l-1.1 4.5c-.1.2-.3.5-.7.4 0 0-1.2-.3-1.2-.3l-.8 1.8 2.1.5c.4.1.8.2 1.2.3l-.7 2.8 1.6.4.7-2.7c.4.1.9.2 1.3.3l-.7 2.7 1.6.4.7-2.8c2.8.5 4.9.3 5.8-2.2.7-2-.1-3.2-1.5-3.9 1.1-.3 1.9-1 2.1-2.5zm-3.7 5.2c-.5 2-4 .9-5.1.7l.9-3.7c1.1.3 4.7.8 4.2 3zm.5-5.3c-.5 1.8-3.3.9-4.3.7l.8-3.3c1 .2 4 .7 3.5 2.6z" fill="white"/></svg>
                    )},
                    { id: "USDT", label: "USDT", desc: "Tether Transfer", icon: (
                      <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="18" fill="#50AF95"/><path d="M20.2 17.8c-.1 0-.7.1-2.2.1-1.2 0-1.9-.1-2.1-.1-4.2-.2-7.3-1-7.3-2s3.1-1.8 7.3-2v3.2c.3 0 1 .1 2.2.1 1.4 0 2-.1 2.2-.1v-3.2c4.2.2 7.3 1 7.3 2s-3.2 1.8-7.4 2zm0-4.3v-2.9h6.1V7.5H9.7v3.1h6.1v2.9c-4.7.2-8.3 1.3-8.3 2.5s3.5 2.3 8.3 2.5v8.9h4.4v-8.9c4.7-.2 8.2-1.3 8.2-2.5s-3.5-2.3-8.2-2.5z" fill="white"/></svg>
                    )},
                  ].map((method) => (
                    <button key={method.id} type="button" onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer ${
                        paymentMethod === method.id ? "border-[rgba(88,57,49,1)] bg-[rgba(88,57,49,0.04)]" : "border-gray-200 hover:border-gray-300"
                      }`}>
                      {method.icon}
                      <p className="font-semibold text-[rgba(68,68,68,1)] mt-2 text-sm">{method.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{method.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Crypto submit button (mobile only) */}
              {paymentMethod !== "Paystack" && (
                <button type="submit" disabled={loading}
                  className="lg:hidden w-full py-4 bg-[rgba(88,57,49,1)] text-white rounded-xl font-semibold hover:bg-[rgba(68,47,39,1)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer">
                  {loading ? "Processing..." : `Place Order — ${formatPrice(grandTotal)}`}
                </button>
              )}
            </form>

            {/* Right: Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-32">
                <h2 className="text-lg font-semibold text-[rgba(68,68,68,1)] mb-5">Order Summary</h2>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[rgba(68,68,68,1)] truncate">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-[rgba(68,68,68,1)] mt-1">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 mt-5 pt-5 space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-medium text-[rgba(68,68,68,1)]">{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">{appliedDiscount ? (appliedDiscount.name || 'Discount') : 'Discount'}</span><span className="text-green-600">{discount > 0 ? `−${formatPrice(discount)}` : 'None'}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-500">VAT ({vatPercent}%)</span><span className="text-[rgba(68,68,68,1)]">{formatPrice(vat)}</span></div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping{shippingState ? ` (${shippingState})` : ""}</span>
                    {shippingLoading ? (
                      <span className="text-gray-400 text-xs">Calculating...</span>
                    ) : shippingCost === 0 ? (
                      <span className="text-green-600 font-medium">FREE</span>
                    ) : (
                      <span className="text-[rgba(68,68,68,1)]">{formatPrice(shippingCost)}</span>
                    )}
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-100 pt-3 mt-1">
                    <span className="text-[rgba(68,68,68,1)]">Total</span>
                    <span className="text-[rgba(88,57,49,1)]">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                {/* Payment Button */}
                <div className="mt-6">
                  {paymentMethod === "Paystack" ? (
                    <PaystackButton
                      email={form.email || "customer@gemsore.com"}
                      amount={grandTotal}
                      total={grandTotal}
                      disabled={loading}
                      onValidate={validate}
                      onSuccess={handlePaystackSuccess}
                      onClose={() => setError("")}
                      formatPrice={formatPrice}
                    />
                  ) : (
                    <button type="button" onClick={handleCryptoSubmit} disabled={loading}
                      className="hidden lg:block w-full py-4 bg-[rgba(88,57,49,1)] text-white rounded-xl font-semibold hover:bg-[rgba(68,47,39,1)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer">
                      {loading ? "Processing..." : `Place Order — ${formatPrice(grandTotal)}`}
                    </button>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                  <span>Secured with SSL encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
