import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const DEFAULT_RATE = 1500;

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    const stored = localStorage.getItem("gemsore_currency");
    return stored === "USD" ? "USD" : "NGN";
  });

  const [exchangeRate, setExchangeRate] = useState(() => {
    const stored = localStorage.getItem("gemsore_exchange_rate");
    return stored ? Number(stored) || DEFAULT_RATE : DEFAULT_RATE;
  });

  // Fetch the exchange rate from backend on mount
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:7001"}/api/v1/settings/public`);
        const json = await res.json();
        const rate = json?.data?.ngn_to_usd_rate;
        if (rate && Number(rate) > 0) {
          const numRate = Number(rate);
          setExchangeRate(numRate);
          localStorage.setItem("gemsore_exchange_rate", String(numRate));
        }
      } catch (e) {
        // Silently fail — use localStorage/default
      }
    };
    fetchRate();
  }, []);

  // Listen for currency and rate changes
  useEffect(() => {
    // Cross-tab storage events
    const handleStorage = (e) => {
      if (e.key === "gemsore_currency") {
        setCurrency(e.newValue === "USD" ? "USD" : "NGN");
      }
      if (e.key === "gemsore_exchange_rate") {
        const val = Number(e.newValue);
        if (val > 0) setExchangeRate(val);
      }
    };

    // Same-tab custom events (dispatched by admin settings)
    const handleCurrencyChange = () => {
      const stored = localStorage.getItem("gemsore_currency");
      setCurrency(stored === "USD" ? "USD" : "NGN");
    };

    const handleRateChange = () => {
      const stored = localStorage.getItem("gemsore_exchange_rate");
      const val = Number(stored);
      if (val > 0) setExchangeRate(val);
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("gemsore_currency_change", handleCurrencyChange);
    window.addEventListener("gemsore_rate_change", handleRateChange);

    // Fallback poll for any missed events
    const interval = setInterval(() => {
      const storedCurrency = localStorage.getItem("gemsore_currency");
      const valCurrency = storedCurrency === "USD" ? "USD" : "NGN";
      setCurrency((prev) => (prev !== valCurrency ? valCurrency : prev));

      const storedRate = localStorage.getItem("gemsore_exchange_rate");
      const valRate = Number(storedRate) || DEFAULT_RATE;
      setExchangeRate((prev) => (prev !== valRate ? valRate : prev));
    }, 3000);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("gemsore_currency_change", handleCurrencyChange);
      window.removeEventListener("gemsore_rate_change", handleRateChange);
      clearInterval(interval);
    };
  }, []);

  const symbol = currency === "USD" ? "$" : "₦";

  const convertPrice = useCallback(
    (amountInNGN) => {
      const amount = Number(amountInNGN) || 0;
      if (currency === "USD") return amount / exchangeRate;
      return amount;
    },
    [currency, exchangeRate]
  );

  const formatPrice = useCallback(
    (amountInNGN) => {
      const amount = Number(amountInNGN) || 0;
      const converted = convertPrice(amount);
      if (currency === "USD") {
        return "$" + new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(converted);
      }
      return "₦" + new Intl.NumberFormat("en-NG").format(converted);
    },
    [currency, convertPrice]
  );

  return (
    <CurrencyContext.Provider value={{ currency, symbol, formatPrice, convertPrice, exchangeRate }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
};

export default CurrencyContext;
