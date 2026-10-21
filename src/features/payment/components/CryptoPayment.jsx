import React, { useState, useEffect } from "react";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import storefrontApi from "../../../services/api";
import { useCurrency } from "../../../contexts/CurrencyContext";
import { useCart } from "../../../contexts/cartContext";
import { QRCodeSVG } from "qrcode.react";

const CryptoPayment = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const method = searchParams.get("method") || "BTC";
  const { formatPrice } = useCurrency();
  const { clearCart } = useCart();

  const [order, setOrder] = useState(null);
  const [wallets, setWallets] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedNetwork, setSelectedNetwork] = useState("erc20"); // erc20, bep20, trc20

  // Crypto price state
  const [cryptoPrice, setCryptoPrice] = useState(null);
  const [cryptoLoading, setCryptoLoading] = useState(true);

  const isNewOrder = orderId === "new";

  useEffect(() => {
    (async () => {
      try {
        if (isNewOrder) {
          // Read pending order data from localStorage
          const saved = localStorage.getItem("gemsore_pending_crypto_order");
          if (saved) {
            const parsed = JSON.parse(saved);
            setOrder({ ...parsed, id: null });
          } else {
            setError("No pending order found. Please go back to checkout.");
            return;
          }
          const settingsData = await storefrontApi.settings.getPublic();
          setWallets(settingsData);
        } else {
          // Existing order — fetch from backend
          const [orderData, settingsData] = await Promise.all([
            storefrontApi.orders.getById(orderId),
            storefrontApi.settings.getPublic(),
          ]);
          setOrder(orderData);
          setWallets(settingsData);
        }
      } catch (err) {
        setError("Failed to load order details.");
      }
    })();
  }, [orderId, isNewOrder]);

  // Set crypto price from admin settings
  useEffect(() => {
    if (!wallets || Object.keys(wallets).length === 0) return;

    const adminRate = parseFloat(wallets.ngn_to_usd_rate);

    if (method === "USDT") {
      if (adminRate && adminRate > 0) {
        setCryptoPrice(adminRate);
        setCryptoLoading(false);
      } else {
        setCryptoPrice(null);
        setCryptoLoading(false);
      }
    } else {
      if (!adminRate || adminRate <= 0) {
        setCryptoPrice(null);
        setCryptoLoading(false);
        return;
      }
      (async () => {
        setCryptoLoading(true);
        try {
          const res = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`
          );
          const data = await res.json();
          const btcUsdPrice = data.bitcoin?.usd;
          if (btcUsdPrice) {
            setCryptoPrice(btcUsdPrice * adminRate);
          }
        } catch {
          // Keep null
        } finally {
          setCryptoLoading(false);
        }
      })();
    }
  }, [wallets, method]);

  // Calculate crypto equivalent
  const getCryptoEquivalent = () => {
    if (!order?.total || !cryptoPrice || cryptoPrice <= 0) return null;
    if (method === "USDT") {
      return (order.total / cryptoPrice).toFixed(2);
    }
    return (order.total / cryptoPrice).toFixed(6);
  };

  const getCryptoSymbol = () => {
    return method === "USDT" ? "USDT" : "BTC";
  };

  const getWalletAddress = () => {
    if (method === "BTC") return wallets.btc_wallet_address || "Wallet address not set";
    if (method === "USDT") {
      if (selectedNetwork === "trc20") return wallets.usdt_trc20_address || wallets.usdt_wallet_address || "TRC20 address not set";
      if (selectedNetwork === "bep20") return wallets.usdt_bep20_address || wallets.usdt_wallet_address || "BEP20 address not set";
      return wallets.usdt_erc20_address || wallets.usdt_wallet_address || "ERC20 address not set";
    }
    return wallets.crypto_wallet_address || "Wallet address not set";
  };

  const getNetworkName = () => {
    if (method === "BTC") return "Bitcoin Network";
    if (method === "USDT") {
      if (selectedNetwork === "trc20") return "Tron (TRC20)";
      if (selectedNetwork === "bep20") return "BNB Smart Chain (BEP20)";
      return "Ethereum (ERC20)";
    }
    return "";
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleUploadProof = async () => {
    if (!selectedFile) {
      setError("Please select a proof of payment file.");
      return;
    }
    setUploading(true);
    setError("");
    setUploadProgress(0);

    // Simulate progress animation
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 200);

    try {
      let finalOrderId = orderId;

      // If new order, create order first
      if (isNewOrder) {
        const saved = localStorage.getItem("gemsore_pending_crypto_order");
        if (!saved) throw new Error("Order data not found. Please redo checkout.");
        const orderPayload = JSON.parse(saved);
        const created = await storefrontApi.orders.create(orderPayload);
        finalOrderId = created.id;
        localStorage.removeItem("gemsore_pending_crypto_order");
        clearCart();
      }

      await storefrontApi.orders.uploadPaymentProof(finalOrderId, selectedFile);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => {
        setUploaded(true);
      }, 400);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message || "Failed to upload proof. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const walletAddr = getWalletAddress();

  return (
    <div className="min-h-screen bg-[#faf9f7] pt-28 md:pt-32 pb-16 px-4">
      <div className="max-w-xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to="/" className="hover:text-[rgba(88,57,49,1)] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/checkout" className="hover:text-[rgba(88,57,49,1)] transition-colors">Checkout</Link>
          <span>/</span>
          <span className="text-[rgba(68,68,68,1)]">Crypto Payment</span>
        </div>

        {uploaded ? (
          /* Success Screen */
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-[rgba(68,68,68,1)] mb-2">Proof Uploaded!</h2>
            <p className="text-gray-500 text-sm mb-6">
              Thank you! We've received your payment proof for{" "}
              {order?.id ? <span className="font-semibold text-[rgba(88,57,49,1)]">Order #{order.id.slice(0, 8)}</span> : "your order"}.
              Our team will verify the transaction and process your order shortly.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left text-xs text-amber-800 space-y-1">
              <p className="font-semibold">What happens next?</p>
              <p>• Blockchain confirmations usually take 10–30 minutes.</p>
              <p>• You'll receive an email confirmation once payment is confirmed.</p>
              <p>• You can check the status anytime from your account.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/transaction-history" className="flex-1 py-3.5 bg-[rgba(88,57,49,1)] text-white rounded-xl font-semibold hover:bg-[rgba(68,47,39,1)] transition-colors text-center text-sm">
                View My Orders
              </Link>
              <Link to="/products" className="flex-1 py-3.5 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors text-center text-sm">
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          /* Payment Instructions */
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-xl">
                    {method === "BTC" ? "₿" : "₮"}
                  </span>
                  <div>
                    <h1 className="text-lg font-bold text-[rgba(68,68,68,1)]">
                      Pay with {method === "BTC" ? "Bitcoin" : "USDT"}
                    </h1>
                    <p className="text-xs text-gray-400">
                      {order?.id ? `Order #${order.id.slice(0, 8)}` : "Complete your payment"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Amount Due</p>
                  <p className="text-lg font-bold text-[rgba(88,57,49,1)]">
                    {order ? formatPrice(order.total) : "..."}
                  </p>
                  {/* Live Crypto Equivalent */}
                  {order && (
                    <div className="mt-1">
                      {cryptoLoading ? (
                        <span className="text-xs text-gray-400 animate-pulse">Calculating crypto rate...</span>
                      ) : cryptoPrice ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg">
                          <span className="text-xs font-bold text-amber-800">
                            ≈ {getCryptoEquivalent()} {getCryptoSymbol()}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>

              {/* USDT Network Selector */}
              {method === "USDT" && (
                <div className="mb-4">
                  <label className="text-xs font-semibold text-gray-500 block mb-2">Select Network</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "erc20", label: "ERC20", sub: "Ethereum" },
                      { id: "trc20", label: "TRC20", sub: "Tron" },
                      { id: "bep20", label: "BEP20", sub: "BNB Chain" },
                    ].map((net) => (
                      <button
                        key={net.id}
                        type="button"
                        onClick={() => setSelectedNetwork(net.id)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedNetwork === net.id
                            ? "border-[rgba(88,57,49,1)] bg-[rgba(88,57,49,0.05)] text-[rgba(88,57,49,1)] font-semibold"
                            : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <p className="text-xs font-bold">{net.label}</p>
                        <p className="text-[10px] text-gray-400">{net.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* QR Code */}
              <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl mb-4">
                {walletAddr && walletAddr !== "Wallet address not set" ? (
                  <div className="p-3 bg-white rounded-xl shadow-sm">
                    <QRCodeSVG
                      value={walletAddr}
                      size={180}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                ) : (
                  <div className="w-44 h-44 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-xs">
                    QR Not Available
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-3 text-center">
                  Scan QR code or copy address below
                </p>
                {getNetworkName() && (
                  <span className="mt-1 text-[11px] font-medium px-2.5 py-0.5 bg-gray-200 text-gray-600 rounded-full">
                    Network: {getNetworkName()}
                  </span>
                )}
              </div>

              {/* Wallet Address */}
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">
                  {method} Wallet Address
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="font-mono text-xs text-gray-700 break-all flex-1 select-all">
                    {walletAddr}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(walletAddr)}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors shrink-0 cursor-pointer"
                  >
                    {copied === walletAddr ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
            </div>

            {/* Upload Proof Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-[rgba(68,68,68,1)] mb-1">
                Upload Payment Proof
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                After making the transfer, take a screenshot or download the receipt and upload it here.
              </p>

              {/* File Drop Area */}
              <label className="block border-2 border-dashed border-gray-200 hover:border-[rgba(88,57,49,0.5)] rounded-xl p-6 text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-gray-50">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {previewUrl ? (
                  <div className="space-y-2">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-40 mx-auto rounded-lg object-contain"
                    />
                    <p className="text-xs text-gray-500 font-medium">{selectedFile?.name}</p>
                    <p className="text-[10px] text-[rgba(88,57,49,1)]">Click to change file</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                    </div>
                    <p className="text-xs font-semibold text-gray-600">Click to upload receipt / screenshot</p>
                    <p className="text-[10px] text-gray-400">PNG, JPG, or PDF up to 10MB</p>
                  </div>
                )}
              </label>

              {selectedFile && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleUploadProof}
                    disabled={uploading}
                    className="w-full py-3.5 bg-[rgba(88,57,49,1)] text-white rounded-xl font-semibold hover:bg-[rgba(68,47,39,1)] disabled:opacity-50 transition-colors text-sm cursor-pointer"
                  >
                    {uploading ? "Uploading Proof..." : "Submit Payment Proof"}
                  </button>

                  {/* Upload Progress Bar */}
                  {uploading && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[rgba(88,57,49,1)] to-[rgba(122,82,72,1)] rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
            </div>

            {/* Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <h4 className="font-semibold text-amber-800 mb-2">⚠️ Important</h4>
              <ul className="text-sm text-amber-700 space-y-1.5">
                <li>• Send the exact {method} equivalent of {order ? formatPrice(order.total) : "..."}{cryptoPrice && order ? ` (≈ ${getCryptoEquivalent()} ${getCryptoSymbol()})` : ""}</li>
                <li>• Double-check the wallet address before sending</li>
                <li>• Upload proof after completing the transfer</li>
                <li>• Your order will be processed once payment is verified</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoPayment;
