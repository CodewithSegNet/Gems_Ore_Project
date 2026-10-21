import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../../contexts/cartContext";
import { useAuth } from "../../../contexts/AuthContext";
import storefrontApi from "../../../services/api";
import { usePaystackPayment } from "react-paystack";
import { useCurrency } from "../../../contexts/CurrencyContext";
const icon1 = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113211/gems_ore/iconcart.png";

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

const Checkout = () => {
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
      } finally {
        setShippingLoading(false);
      }
    };
    fetchShipping();
  }, [shippingCountry, shippingState]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Valid email is required";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (!form.address.trim()) errs.address = "Delivery address is required";
    if (shippingCountry === "Nigeria" && !shippingState) errs.state = "Please select your state";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePaystackSuccess = async (reference) => {
    setLoading(true);
    setError("");
    try {
      const orderPayload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        shipping_address: form.address.trim(),
        shipping_city: shippingState || "",
        shipping_state: shippingState || "",
        shipping_country: shippingCountry,
        shipping_cost: shippingCost,
        payment_method: "Paystack",
        payment_reference: reference.reference || reference.trxref,
        items: cartItems.map((item) => ({
          product_id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
        })),
        customer_id: user?.id || null,
        subtotal,
        discount_amount: discount,
        applied_discount_id: appliedDiscount?.id || null,
        vat_amount: vat,
        vat_percent: vatPercent,
        total: grandTotal,
        note: form.note.trim() || undefined,
      };

      const res = await storefrontApi.orders.create(orderPayload);
      clearCart();
      navigate(`/order-success/${res.id}?method=Paystack&ref=${reference.reference}`);
    } catch (err) {
      setError(err.message || "Failed to create order. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  const handleCryptoSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      const pendingOrderData = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        shipping_address: form.address.trim(),
        shipping_city: shippingState || "",
        shipping_state: shippingState || "",
        shipping_country: shippingCountry,
        shipping_cost: shippingCost,
        payment_method: paymentMethod,
        items: cartItems.map((item) => ({
          product_id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
        })),
        customer_id: user?.id || null,
        subtotal,
        discount_amount: discount,
        applied_discount_id: appliedDiscount?.id || null,
        vat_amount: vat,
        vat_percent: vatPercent,
        total: grandTotal,
        note: form.note.trim() || undefined,
      };
      localStorage.setItem("gemsore_pending_crypto_order", JSON.stringify(pendingOrderData));
      navigate(`/crypto-payment/new?method=${paymentMethod}`);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf9f7] pt-32 pb-16 px-4">
        <div className="max-w-md mx-auto text-center py-16">
          <img src={icon1} alt="" className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h2 className="text-2xl font-bold text-[rgba(68,68,68,1)] mb-2">Your Cart is Empty</h2>
          <p className="text-gray-400 text-sm mb-6">Add some exquisite pieces before checking out.</p>
          <Link to="/products" className="px-8 py-3.5 bg-[rgba(88,57,49,1)] text-white rounded-xl font-semibold hover:bg-[rgba(68,47,39,1)] transition-colors inline-block">Explore Collections</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] pt-28 md:pt-32 pb-16 px-4">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-[rgba(88,57,49,1)] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/cart" className="hover:text-[rgba(88,57,49,1)] transition-colors">Cart</Link>
          <span>/</span>
          <span className="text-[rgba(68,68,68,1)]">Checkout</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-[rgba(68,68,68,1)] mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT — Shipping & Payment Info */}
          <div className="lg:col-span-7 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-[rgba(68,68,68,1)] mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[rgba(88,57,49,0.1)] text-[rgba(88,57,49,1)] text-xs flex items-center justify-center font-bold">1</span>
                Delivery Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Full Name *</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Adebayo Ogunlesi"
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(88,57,49,0.2)] transition-all ${fieldErrors.name ? "border-red-400 bg-red-50/30" : "border-gray-200"}`} />
                  {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Email Address *</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="adebayo@example.com"
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(88,57,49,0.2)] transition-all ${fieldErrors.email ? "border-red-400 bg-red-50/30" : "border-gray-200"}`} />
                    {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Phone Number *</label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+234 801 234 5678"
                      className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(88,57,49,0.2)] transition-all ${fieldErrors.phone ? "border-red-400 bg-red-50/30" : "border-gray-200"}`} />
                    {fieldErrors.phone && <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>}
                  </div>
                </div>

                {/* Country Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Country *</label>
                    <select value={shippingCountry} onChange={(e) => { setShippingCountry(e.target.value); setShippingState(""); }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(88,57,49,0.2)] bg-white cursor-pointer">
                      <option value="Nigeria">Nigeria</option>
                      <option value="International">International</option>
                    </select>
                  </div>

                  {/* State (if Nigeria) */}
                  {shippingCountry === "Nigeria" ? (
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">State *</label>
                      <select value={shippingState} onChange={(e) => { setShippingState(e.target.value); if (fieldErrors.state) setFieldErrors({ ...fieldErrors, state: "" }); }}
                        className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(88,57,49,0.2)] bg-white cursor-pointer ${fieldErrors.state ? "border-red-400 bg-red-50/30" : "border-gray-200"}`}>
                        <option value="">Select your state</option>
                        {NIGERIAN_STATES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                      {fieldErrors.state && <p className="text-xs text-red-500 mt-1">{fieldErrors.state}</p>}
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">City / Region *</label>
                      <input type="text" value={shippingState} onChange={(e) => setShippingState(e.target.value)} placeholder="e.g. London, New York"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(88,57,49,0.2)]" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Street Address *</label>
                  <textarea name="address" value={form.address} onChange={handleChange} rows={2} placeholder="House number, street name, apartment/suite"
                    className={`w-full px-4 py-3 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[rgba(88,57,49,0.2)] transition-all ${fieldErrors.address ? "border-red-400 bg-red-50/30" : "border-gray-200"}`} />
                  {fieldErrors.address && <p className="text-xs text-red-500 mt-1">{fieldErrors.address}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Order Notes (optional)</label>
                  <input type="text" name="note" value={form.note} onChange={handleChange} placeholder="Special delivery instructions, gate code, etc."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(88,57,49,0.2)]" />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-base font-bold text-[rgba(68,68,68,1)] mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[rgba(88,57,49,0.1)] text-[rgba(88,57,49,1)] text-xs flex items-center justify-center font-bold">2</span>
                Payment Method
              </h2>

              <div className="space-y-3">
                {/* Paystack */}
                <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "Paystack" ? "border-[rgba(88,57,49,1)] bg-[rgba(88,57,49,0.03)] ring-1 ring-[rgba(88,57,49,1)]" : "border-gray-200 hover:border-gray-300"}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="paymentMethod" value="Paystack" checked={paymentMethod === "Paystack"} onChange={() => setPaymentMethod("Paystack")} className="accent-[rgba(88,57,49,1)] w-4 h-4" />
                    <div>
                      <p className="text-sm font-semibold text-[rgba(68,68,68,1)]">Paystack (Cards, Bank Transfer, USSD)</p>
                      <p className="text-xs text-gray-400">Pay securely with Debit/Credit Card, Bank Transfer, or USSD</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded">VISA</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-red-50 text-red-600 rounded">MC</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-green-50 text-green-600 rounded">VERVE</span>
                  </div>
                </label>

                {/* Crypto — BTC */}
                <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "BTC" ? "border-[rgba(88,57,49,1)] bg-[rgba(88,57,49,0.03)] ring-1 ring-[rgba(88,57,49,1)]" : "border-gray-200 hover:border-gray-300"}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="paymentMethod" value="BTC" checked={paymentMethod === "BTC"} onChange={() => setPaymentMethod("BTC")} className="accent-[rgba(88,57,49,1)] w-4 h-4" />
                    <div>
                      <p className="text-sm font-semibold text-[rgba(68,68,68,1)]">Bitcoin (BTC)</p>
                      <p className="text-xs text-gray-400">Pay directly to our Bitcoin wallet with proof of payment</p>
                    </div>
                  </div>
                  <span className="text-lg">₿</span>
                </label>

                {/* Crypto — USDT */}
                <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === "USDT" ? "border-[rgba(88,57,49,1)] bg-[rgba(88,57,49,0.03)] ring-1 ring-[rgba(88,57,49,1)]" : "border-gray-200 hover:border-gray-300"}`}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="paymentMethod" value="USDT" checked={paymentMethod === "USDT"} onChange={() => setPaymentMethod("USDT")} className="accent-[rgba(88,57,49,1)] w-4 h-4" />
                    <div>
                      <p className="text-sm font-semibold text-[rgba(68,68,68,1)]">Tether (USDT)</p>
                      <p className="text-xs text-gray-400">TRC20, ERC20 or BEP20 with proof of payment</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-600 rounded-md">₮ USDT</span>
                </label>
              </div>

              {/* Mobile Crypto Submit Button */}
              {paymentMethod !== "Paystack" && (
                <div className="mt-6 lg:hidden">
                  <button type="button" onClick={handleCryptoSubmit} disabled={loading}
                    className="w-full py-4 bg-[rgba(88,57,49,1)] text-white rounded-xl font-semibold hover:bg-[rgba(68,47,39,1)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer">
                    {loading ? "Processing..." : `Place Order — ${formatPrice(grandTotal)}`}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-32">
              <h2 className="text-base font-bold text-[rgba(68,68,68,1)] mb-4">Order Summary ({cartCount} item{cartCount !== 1 ? "s" : ""})</h2>

              {/* Items List */}
              <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto pr-1 mb-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {item.image && (/\.(mp4|webm|mov|avi)(\?|$)/i.test(item.image) || item.image.includes('/video/')) ? (
                        <video src={item.image} className="w-full h-full object-cover" muted playsInline />
                      ) : (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[rgba(68,68,68,1)] truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-semibold text-[rgba(68,68,68,1)] shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 border-t border-gray-100 pt-4 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount</span>
                    <span>−{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-500">
                  <span>VAT ({vatPercent}%)</span>
                  <span>{formatPrice(vat)}</span>
                </div>

                <div className="flex justify-between text-gray-500 items-center">
                  <span>Shipping</span>
                  <span>
                    {shippingLoading ? (
                      <span className="text-xs text-gray-400">Calculating...</span>
                    ) : shippingCost === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>

                {deliveryDays && (
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Est. Delivery</span>
                    <span>{deliveryDays}</span>
                  </div>
                )}

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
  );
};

export default Checkout;
