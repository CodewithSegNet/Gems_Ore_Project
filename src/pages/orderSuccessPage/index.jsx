import React from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Navbar from "../../components/navbar";

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const method = searchParams.get("method") || "Paystack";
  const ref = searchParams.get("ref") || "";

  return (
    <>
      <Navbar dark={false} />
      <div className="min-h-screen bg-[#faf9f7] pt-32 pb-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[rgba(68,68,68,1)] mb-3">Order Placed!</h1>
          <p className="text-gray-500 mb-2">Your order has been placed successfully.</p>
          <p className="text-sm text-gray-400 mb-2">
            Order ID: <span className="font-mono text-[rgba(88,57,49,1)]">{orderId?.slice(0, 12)}...</span>
          </p>
          {ref && (
            <p className="text-sm text-gray-400 mb-6">
              Payment Ref: <span className="font-mono text-green-600">{ref}</span>
            </p>
          )}

          <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-8 text-left">
            <p className="font-semibold text-green-800 mb-2">✅ Payment Confirmed via {method}</p>
            <p className="text-sm text-green-700">
              Your payment was successful and your order is now being processed. You can track your order status from your account.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link to="/products" className="w-full py-4 bg-[rgba(88,57,49,1)] text-white rounded-lg font-medium hover:bg-[rgba(68,47,39,1)] transition-colors duration-300 block text-center">Continue Shopping</Link>
            <Link to="/" className="w-full py-4 border border-[rgba(88,57,49,1)] text-[rgba(88,57,49,1)] rounded-lg font-medium hover:bg-[rgba(88,57,49,0.05)] transition-colors duration-300 block text-center">Back to Home</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderSuccessPage;
