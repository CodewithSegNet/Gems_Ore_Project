import React, { useState, useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import storefrontApi from "../../services/api";
import Navbar from "../../components/navbar";
import { useCurrency } from "../../contexts/CurrencyContext";



const CryptoPaymentPage = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const method = searchParams.get("method") || "BTC";
  const { formatPrice } = useCurrency();

  const [order, setOrder] = useState(null);
  const [wallets, setWallets] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [orderData, settingsData] = await Promise.all([
          storefrontApi.orders.getById(orderId),
          storefrontApi.settings.getPublic(),
        ]);
        setOrder(orderData);
        setWallets(settingsData);
      } catch (err) {
        setError("Failed to load order details.");
      }
    })();
  }, [orderId]);

  const getWalletAddress = () => {
    if (method === "BTC") return wallets.btc_address || "";
    return wallets.usdt_erc20 || "";
  };

  const getWalletLabel = () => {
    if (method === "BTC") return "Bitcoin (BTC)";
    return "USDT (ERC-20)";
  };

  const copyAddress = (addr, key) => {
    navigator.clipboard.writeText(addr);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
  };

  const handleDeleteFile = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setError("");
  };

  const handleSubmitUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadProgress(0);
    setError("");
    try {
      // Upload image with progress tracking
      const formData = new FormData();
      formData.append("file", selectedFile);
      const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:7001";
      const uploadUrl = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${apiBase}/api/v1/upload/image`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const json = JSON.parse(xhr.responseText);
            resolve(json.data?.url || json.url);
          } else { reject(new Error("Upload failed")); }
        };
        xhr.onerror = () => reject(new Error("Upload failed"));
        xhr.send(formData);
      });
      const fullUrl = uploadUrl.startsWith("http") ? uploadUrl : `${apiBase}${uploadUrl}`;
      await storefrontApi.orders.uploadPaymentProof(orderId, fullUrl);
      setUploaded(true);
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (error && !order) {
    return (
      <>
        <Navbar dark={false} />
        <div className="min-h-screen bg-[#faf9f7] pt-32 pb-16 px-4 text-center">
          <p className="text-red-500">{error}</p>
          <Link to="/" className="mt-4 inline-block text-[rgba(88,57,49,1)] underline">Go Home</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar dark={false} />
      <div className="min-h-screen bg-[#faf9f7] pt-28 md:pt-32 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
              {method === "BTC" ? (
                <svg width="64" height="64" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="18" fill="#F7931A"/><path d="M23.5 15.9c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.6-.4-.7 2.7c-.4-.1-.8-.2-1.3-.3l.7-2.7-1.6-.4-.7 2.7c-.3-.1-.7-.2-1-.3l-2.2-.5-.4 1.7s1.2.3 1.2.3c.7.2.8.6.8 1l-.8 3.2c0 0 .1 0 .2.1h-.2l-1.1 4.5c-.1.2-.3.5-.7.4 0 0-1.2-.3-1.2-.3l-.8 1.8 2.1.5c.4.1.8.2 1.2.3l-.7 2.8 1.6.4.7-2.7c.4.1.9.2 1.3.3l-.7 2.7 1.6.4.7-2.8c2.8.5 4.9.3 5.8-2.2.7-2-.1-3.2-1.5-3.9 1.1-.3 1.9-1 2.1-2.5zm-3.7 5.2c-.5 2-4 .9-5.1.7l.9-3.7c1.1.3 4.7.8 4.2 3zm.5-5.3c-.5 1.8-3.3.9-4.3.7l.8-3.3c1 .2 4 .7 3.5 2.6z" fill="white"/></svg>
              ) : (
                <svg width="64" height="64" viewBox="0 0 36 36" fill="none"><circle cx="18" cy="18" r="18" fill="#50AF95"/><path d="M20.2 17.8c-.1 0-.7.1-2.2.1-1.2 0-1.9-.1-2.1-.1-4.2-.2-7.3-1-7.3-2s3.1-1.8 7.3-2v3.2c.3 0 1 .1 2.2.1 1.4 0 2-.1 2.2-.1v-3.2c4.2.2 7.3 1 7.3 2s-3.2 1.8-7.4 2zm0-4.3v-2.9h6.1V7.5H9.7v3.1h6.1v2.9c-4.7.2-8.3 1.3-8.3 2.5s3.5 2.3 8.3 2.5v8.9h4.4v-8.9c4.7-.2 8.2-1.3 8.2-2.5s-3.5-2.3-8.2-2.5z" fill="white"/></svg>
              )}
            </div>
            <h1 className="text-2xl font-bold text-[rgba(68,68,68,1)]">
              {uploaded ? "Receipt Uploaded!" : `Complete Your ${getWalletLabel()} Payment`}
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              Order ID: <span className="font-mono text-[rgba(88,57,49,1)]">{orderId?.slice(0, 12)}...</span>
            </p>
          </div>

          {uploaded ? (
            /* Success state */
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
              </div>
              <h2 className="text-xl font-bold text-[rgba(68,68,68,1)] mb-2">Payment Proof Submitted</h2>
              <p className="text-sm text-gray-500 mb-6">
                We'll verify your payment and update your order status. You can track your order from your account.
              </p>
              <div className="flex flex-col gap-3">
                <Link to="/products" className="w-full py-4 bg-[rgba(88,57,49,1)] text-white rounded-lg font-medium hover:bg-[rgba(68,47,39,1)] transition-colors block text-center">Continue Shopping</Link>
                <Link to="/" className="w-full py-4 border border-[rgba(88,57,49,1)] text-[rgba(88,57,49,1)] rounded-lg font-medium hover:bg-[rgba(88,57,49,0.05)] transition-colors block text-center">Back to Home</Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Amount to Pay */}
              {order && (
                <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                  <p className="text-sm text-gray-500 mb-1">Amount to Pay</p>
                  <p className="text-3xl font-bold text-[rgba(88,57,49,1)]">{formatPrice(order.total)}</p>
                  <p className="text-xs text-gray-400 mt-2">Send the {method} equivalent of this amount</p>
                </div>
              )}

              {/* Wallet Address */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
                  Send {method} to this address
                </h3>

                {/* Main address */}
                <div className="bg-gray-50 rounded-xl p-4 mb-3">
                  <p className="text-xs text-gray-500 mb-1">{getWalletLabel()} Address</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm text-[rgba(68,68,68,1)] break-all flex-1">{getWalletAddress()}</p>
                    <button onClick={() => copyAddress(getWalletAddress(), "main")}
                      className="shrink-0 px-3 py-1.5 bg-[rgba(88,57,49,1)] text-white text-xs rounded-lg hover:bg-[rgba(68,47,39,1)] transition-colors cursor-pointer">
                      {copied === "main" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* USDT additional networks */}
                {method === "USDT" && (
                  <>
                    {wallets.usdt_bep20 && (
                      <div className="bg-gray-50 rounded-xl p-4 mb-3">
                        <p className="text-xs text-gray-500 mb-1">USDT (BEP-20) Address</p>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm text-[rgba(68,68,68,1)] break-all flex-1">{wallets.usdt_bep20}</p>
                          <button onClick={() => copyAddress(wallets.usdt_bep20, "bep20")}
                            className="shrink-0 px-3 py-1.5 bg-[rgba(88,57,49,1)] text-white text-xs rounded-lg hover:bg-[rgba(68,47,39,1)] transition-colors cursor-pointer">
                            {copied === "bep20" ? "Copied!" : "Copy"}
                          </button>
                        </div>
                      </div>
                    )}
                    {wallets.usdt_trc20 && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">USDT (TRC-20) Address</p>
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-sm text-[rgba(68,68,68,1)] break-all flex-1">{wallets.usdt_trc20}</p>
                          <button onClick={() => copyAddress(wallets.usdt_trc20, "trc20")}
                            className="shrink-0 px-3 py-1.5 bg-[rgba(88,57,49,1)] text-white text-xs rounded-lg hover:bg-[rgba(68,47,39,1)] transition-colors cursor-pointer">
                            {copied === "trc20" ? "Copied!" : "Copy"}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Upload Receipt */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
                  Upload Payment Proof
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  After making the transfer, upload a screenshot of your transaction as proof of payment.
                </p>

                {!selectedFile ? (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors border-gray-200 hover:border-[rgba(88,57,49,0.5)] hover:bg-[rgba(88,57,49,0.02)]">
                    <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                    </svg>
                    <p className="text-sm font-medium text-[rgba(68,68,68,1)]">Click to upload receipt</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — Max 5MB</p>
                    <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                  </label>
                ) : (
                  <div className="border-2 border-[rgba(88,57,49,0.3)] rounded-xl overflow-hidden">
                    <div className="relative">
                      <img src={previewUrl} alt="Receipt preview" className="w-full max-h-64 object-contain bg-gray-50" />
                      <button
                        onClick={handleDeleteFile}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-4 bg-white flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[rgba(68,68,68,1)] truncate">{selectedFile.name}</p>
                        <p className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={handleDeleteFile}
                          className="px-4 py-2 border border-red-300 text-red-500 text-sm rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                        <button
                          onClick={handleSubmitUpload}
                          disabled={uploading}
                          className="px-5 py-2 bg-[rgba(88,57,49,1)] text-white text-sm rounded-lg hover:bg-[rgba(68,47,39,1)] transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-2"
                        >
                          {uploading ? (
                            <>
                              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                              Uploading...
                            </>
                          ) : "Submit"}
                        </button>
                      </div>
                    </div>
                    {/* Upload Progress Bar */}
                    {uploading && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
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
                  <li>• Send the exact {method} equivalent of {order ? formatPrice(order.total) : "..."}</li>
                  <li>• Double-check the wallet address before sending</li>
                  <li>• Upload proof after completing the transfer</li>
                  <li>• Your order will be processed once payment is verified</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CryptoPaymentPage;