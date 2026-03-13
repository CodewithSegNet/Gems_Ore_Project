import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../contexts/cartContext";
import { useAuth } from "../../contexts/AuthContext";
import storefrontApi from "../../services/api";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import bar from "../../assets/Rectangle2.svg";
import fast from "../../assets/fast.png";
import shield from "../../assets/shield.svg";
import { useCurrency } from "../../contexts/CurrencyContext";
import darkcart from "../../assets/iconcart.png";


const CartPage = () => {
  const { cartItems, cartCount, removeFromCart, updateQuantity, subtotal, discount, vat, vatPercent, total, appliedDiscount, setAppliedDiscount } = useCart();
  const { formatPrice } = useCurrency();
  const { user, isAuthenticated } = useAuth();
  const [couponCode, setCouponCode] = useState("");
  const [sellerNote, setSellerNote] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponResult, setCouponResult] = useState(null);
  const [couponError, setCouponError] = useState("");

  // Fetch auto-discounts when cart items change
  useEffect(() => {
    if (cartItems.length === 0) {
      // Clear auto-discount if cart is empty, but keep coupon if user had one
      if (appliedDiscount?.source === "auto") setAppliedDiscount(null);
      return;
    }
    // Don't override a manual coupon
    if (couponResult?.valid) return;

    const fetchAuto = async () => {
      try {
        const productIds = cartItems.map(i => i.id);
        const productPrices = cartItems.map(i => i.price * i.quantity);
        const result = await storefrontApi.discounts.getAutoDiscounts(
          subtotal,
          isAuthenticated ? user?.email : null,
          productIds,
          productPrices
        );
        if (result.applied) {
          setAppliedDiscount({ ...result, source: "auto" });
        } else {
          if (appliedDiscount?.source === "auto") setAppliedDiscount(null);
        }
      } catch {
        // Silently fail
      }
    };
    fetchAuto();
  }, [subtotal, cartItems.length, isAuthenticated]);

  // When coupon is applied manually, override auto-discount
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    setCouponResult(null);
    try {
      const result = await storefrontApi.discounts.validate(couponCode.trim(), subtotal);
      if (result.valid) {
        setCouponResult(result);
        setCouponError("");
        // Override any auto-discount with the coupon
        setAppliedDiscount({
          ...result,
          id: null,
          discount_type: result.discount_type || "general",
          source: "coupon",
        });
      } else {
        setCouponError(result.message || "Invalid coupon code");
        setCouponResult(null);
      }
    } catch (err) {
      setCouponError(err.message || "Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponResult(null);
    setCouponCode("");
    setCouponError("");
    // Remove the coupon from appliedDiscount so auto-discounts can re-apply
    setAppliedDiscount(null);
  };

  return (
    <>
      <Navbar dark={false} />

      <div className="min-h-screen bg-[#faf9f7] pt-28 md:pt-32 pb-16 px-4">
        <div className="max-w-screen-2xl mx-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link to="/" className="hover:text-[rgba(88,57,49,1)] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[rgba(68,68,68,1)]">Shopping Cart</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-[rgba(68,68,68,1)]">Shopping Cart</h1>

          {cartItems.length === 0 ? (
            <>
            
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                                      <img className="w-8 h-8" src={darkcart} alt="" />
              <p className="text-xl font-semibold text-[rgba(68,68,68,1)] mb-2">Your Cart is Empty</p>
              <p className="text-sm text-gray-400 mb-6">Looks like you haven't added any items yet.</p>
              <Link to="/products" className="px-8 py-3.5 bg-[rgba(88,57,49,1)] text-white rounded-lg font-medium hover:bg-[rgba(68,47,39,1)] transition-colors duration-300">Continue Shopping</Link>
            </div>
            

            </>

            
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* LEFT — Product Table */}
              <div className="lg:col-span-2">
                <p className="text-sm text-gray-400 mb-4">{cartCount} item{cartCount !== 1 ? "s" : ""}</p>


            <div className="mt-3 bg-transparent rounded-md border-[3px] my-5 border-dotted border-[rgba(68,68,68,1)] px-3 py-2">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm"> <span className="font-bold">FREE</span>  Shipping Within Abuja (FCT)</p>
            <img className="w-5 h-5" src={fast} alt="" />
          </div>
          
          <div className="w-full pt-3 rounded-full">
              <img className="w-[100%] h-4 rounded-full" src={bar} alt="" />
          </div>
                      </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-400">
                        <th className="text-left text-xs font-bold uppercase tracking-wider text-black px-6 py-4">Product</th>
                        <th className="text-center text-xs font-bold uppercase tracking-wider text-black px-4 py-4">Price</th>
                        <th className="text-center text-xs font-bold uppercase tracking-wider text-black px-4 py-4">Quantity</th>
                        <th className="text-right text-xs font-bold uppercase tracking-wider text-black px-6 py-4">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item) => (
                        <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <Link to={`/product/${item.id}`} className="w-[80px] h-[100px] rounded-xl overflow-hidden shrink-0 bg-gray-100">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </Link>
                              <div>
                                <Link to={`/product/${item.id}`} className="text-sm lg:text-base font-normal font-helvetica text-[rgba(68,68,68,1)] hover:text-[rgba(88,57,49,1)] transition-colors no-underline line-clamp-2">{item.name}</Link>
                                <button onClick={() => removeFromCart(item.id)} className="mt-2 text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer underline">Remove</button>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-5 text-center"><span className="text-sm lg:text-xl font-normal text-[rgba(68,68,68,1)]">{formatPrice(item.price)}</span></td>
                          <td className="px-4 py-5">
                            <div className="flex items-center justify-center">
                              <div className="flex items-center border border-gray-400 rounded-lg overflow-hidden">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer text-lg">−</button>
                                <span className="w-10 text-center text-sm font-semibold text-[rgba(68,68,68,1)]">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-12 h-12 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer text-lg">+</button>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right"><span className="text-sm lg:text-xl font-normal text-[rgba(68,68,68,1)]">{formatPrice(item.price * item.quantity)}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm flex gap-4">
                      <Link to={`/product/${item.id}`} className="w-[90px] h-[90px] rounded-xl overflow-hidden shrink-0 bg-gray-100">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </Link>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <Link to={`/product/${item.id}`} className="text-sm font-semibold text-[rgba(68,68,68,1)] no-underline line-clamp-2">{item.name}</Link>
                          <p className="text-sm font-bold text-[rgba(88,57,49,1)] mt-1">{formatPrice(item.price)}</p>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 cursor-pointer">−</button>
                            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 cursor-pointer">+</button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-400 hover:text-red-600 cursor-pointer underline">Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                

                {/* Additional Comments */}
                <div className="mt-6 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-black mb-3">Additional Comments</h3>
                  <textarea value={sellerNote} onChange={(e) => setSellerNote(e.target.value)} rows={5}
                    placeholder="Special instruction for seller..."
                    className="w-full px-4 bg-transparent py-3 border border-gray-400 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[rgba(88,57,49,0.2)] focus:border-[rgba(88,57,49,1)] transition-all placeholder:text-gray-400" />

                    <div className="flex items-center gap-3 pt-5">
                      <img src={shield} alt="" />
                      <p className="text-sm">Secure Shopping Guarantee</p>
                    </div>
                </div>
              </div>

              {/* RIGHT — Order Summary */}
              <div className="lg:col-span-1">
                <div className="rounded-2xl p-6 sticky top-32">
                  <h2 className="text-sm font-bold uppercase tracking-wider border-b border-slate-950 pb-5 text-black mb-5">Order Summary</h2>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-black">Subtotal</span>
                      <span className="text-base font-normal text-black">{formatPrice(subtotal)}</span>
                    </div>

                    {/* Coupon Code */}
                    <div className="pt-3 border-gray-100">
                      <label className="text-xs font-bold uppercase tracking-wider text-black mb-2 block">Coupon Code</label>
                      {couponResult?.valid ? (
                        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
                          <div>
                            <p className="text-sm font-semibold text-green-700">{couponResult.code}</p>
                            <p className="text-xs text-green-600">{couponResult.name} — {couponResult.type === "percentage" ? `${couponResult.value}% off` : `${formatPrice(couponResult.value)} off`}</p>
                          </div>
                          <button onClick={removeCoupon} className="text-xs text-red-500 hover:text-red-700 cursor-pointer font-medium">Remove</button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                            placeholder="Enter Coupon Code"
                            className="flex-1 px-3 py-3 border border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(88,57,49,0.2)] focus:border-[rgba(88,57,49,1)] transition-all placeholder:text-[rgba(0,0,0,0.5)] bg-transparent" />
                          <button onClick={handleApplyCoupon} disabled={couponLoading}
                            className="px-4 py-2.5 bg-black text-white text-xs font-bold rounded-lg hover:bg-[rgba(68,47,39,1)] transition-colors cursor-pointer disabled:opacity-50">
                            {couponLoading ? "..." : "Apply"}
                          </button>
                        </div>
                      )}
                      {couponError && <p className="text-xs text-red-500 mt-1.5">{couponError}</p>}
                      {!couponResult?.valid && !couponError && (
                        <p className="text-xs text-gray-700 mt-2">Coupon code will be applied on the checkout page</p>
                      )}
                    </div>

                    {/* Discount */}
                    <div className="pt-3 border-t border-gray-100">
                      {couponResult?.valid ? (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Coupon ({couponResult.code})</span>
                          <span className="text-green-600 font-medium">−{formatPrice(couponResult.discount_amount)}</span>
                        </div>
                      ) : appliedDiscount && discount > 0 ? (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                            </span>
                            <span className="text-xs font-bold text-green-600 uppercase">
                              {appliedDiscount.name || (appliedDiscount.type === 'percentage' ? `${appliedDiscount.value}% OFF` : 'Discount Applied')}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">{appliedDiscount.name || 'Discount'}</span>
                            <span className="text-green-600 font-medium">−{formatPrice(discount)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Discount</span>
                          <span className="text-gray-400">None</span>
                        </div>
                      )}
                    </div>

                    {/* VAT */}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">VAT ({vatPercent}%)</span>
                      <span className="text-[rgba(68,68,68,1)]">{formatPrice(vat)}</span>
                    </div>

                    {/* Total */}
                    <div className="pt-4 border-t border-gray-200 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold text-black">TOTAL:</span>
                        <span className="text-xl font-bold text-black">{formatPrice(total)}</span>
                      </div>
                      <p className="text-xs text-gray-700 mt-2">Tax included and shipping calculated at checkout</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 space-y-3">
                    <Link to="/checkout" className="w-full py-4 bg-black text-white rounded-lg font-semibold hover:bg-[rgba(68,47,39,1)] transition-colors duration-300 cursor-pointer block text-center">Proceed To Checkout</Link>
                    <Link to="/products" className="w-full py-4 border border-[rgba(68,68,68,1)] text-[rgba(68,68,68,1)] rounded-lg font-medium hover:bg-[rgba(88,57,49,1)] hover:text-white hover:border-[rgba(88,57,49,1)] transition-colors duration-300 cursor-pointer block text-center text-sm">Continue Shopping</Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CartPage;
