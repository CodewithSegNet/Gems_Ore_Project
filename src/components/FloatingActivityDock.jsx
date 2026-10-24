import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useCart } from "../contexts/cartContext";
import { useFavorites } from "../contexts/FavoritesContext";
import { useCurrency } from "../contexts/CurrencyContext";

const icon2 = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113210/gems_ore/icon2.png";
const icon3 = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113217/gems_ore/heart1.png";

export default function FloatingActivityDock() {
  const location = useLocation();
  const { cartCount, subtotal } = useCart();
  const { favoritesCount } = useFavorites();
  const { formatPrice } = useCurrency();
  const [bounce, setBounce] = useState(false);

  const totalCount = (cartCount || 0) + (favoritesCount || 0);

  useEffect(() => {
    if (totalCount > 0) {
      setBounce(true);
      const timer = setTimeout(() => setBounce(false), 800);
      return () => clearTimeout(timer);
    }
  }, [totalCount]);

  // Hide on admin routes, auth routes (/login, /signup), or if no items liked/carted
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";
  if (location.pathname.startsWith("/admin") || isAuthPage || totalCount === 0) {
    return null;
  }

  const openDrawer = (panel) => {
    window.dispatchEvent(
      new CustomEvent("gemsore_open_panel", { detail: panel })
    );
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 select-none">
      <div
        className={`flex items-center gap-2 sm:gap-3 bg-[#181614]/90 hover:bg-[#181614]/98 backdrop-blur-xl border border-[#958169]/40 hover:border-[#958169] p-1.5 sm:p-2 rounded-full shadow-[0_12px_45px_rgba(0,0,0,0.55)] transition-all duration-300 ${
          bounce ? "scale-105 border-[#958169]" : "scale-100"
        }`}
      >
        {/* Wishlist Button - using navbar icon3 */}
        <button
          onClick={() => openDrawer("wishlist")}
          className="relative rounded-full w-[40px] h-[40px] p-2.5 bg-white/10 hover:bg-[#958169] transition-all cursor-pointer flex items-center justify-center active:scale-95 group"
          title="Open Wishlist"
          aria-label="Wishlist"
        >
          <img
            className="w-full h-full object-contain transition-transform group-hover:scale-110"
            src={icon3}
            alt="Wishlist"
          />
          {favoritesCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#958169] text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-md">
              {favoritesCount}
            </span>
          )}
        </button>

        {/* Cart Button - using navbar icon2 */}
        <button
          onClick={() => openDrawer("cart")}
          className="relative rounded-full w-[40px] h-[40px] p-2.5 bg-white/10 hover:bg-[#958169] transition-all cursor-pointer flex items-center justify-center active:scale-95 group"
          title="Open Bag"
          aria-label="Bag"
        >
          <img
            className="w-full h-full object-contain transition-transform group-hover:scale-110"
            src={icon2}
            alt="Bag"
          />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#958169] text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-md animate-bounce-once">
              {cartCount}
            </span>
          )}
        </button>

        {/* Live formatted price indicator if items in cart */}
        {cartCount > 0 && (
          <button
            onClick={() => openDrawer("cart")}
            className="hidden sm:flex flex-col pr-3 pl-1 text-left cursor-pointer group"
          >
            <span className="text-[9px] uppercase tracking-wider text-white/50 group-hover:text-white/80 transition-colors">
              Bag Total
            </span>
            <span className="text-xs font-bold text-[#d4af37] group-hover:text-amber-300 transition-colors">
              {formatPrice(subtotal)}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
