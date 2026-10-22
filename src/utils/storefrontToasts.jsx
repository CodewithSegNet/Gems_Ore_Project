import { toast } from "sonner";

// ─── Cart Icon ───────────────────────────────────────────────────────────────
const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ width: 14, height: 14, flexShrink: 0 }}>
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

// ─── Heart Icon ───────────────────────────────────────────────────────────────
const HeartIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ width: 14, height: 14, flexShrink: 0 }}>
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

// ─── Shared image-side toast renderer ────────────────────────────────────────
const renderProductToast = ({ image, title, subtitle, accentColor, icon, toastId }) => {
  const pill = {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    background: accentColor,
    color: "#fff",
    borderRadius: 20,
    padding: "2px 8px 2px 6px",
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 0.4,
    marginBottom: 4,
    width: "fit-content",
  };

  const wrapper = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#1a1a1a",
    borderRadius: 14,
    padding: "10px 14px 10px 10px",
    minWidth: 280,
    maxWidth: 340,
    boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
    border: "1px solid rgba(255,255,255,0.08)",
    position: "relative",
    overflow: "hidden",
  };

  const imgStyle = {
    width: 58,
    height: 58,
    borderRadius: 10,
    objectFit: "cover",
    flexShrink: 0,
    border: "1.5px solid rgba(255,255,255,0.12)",
  };

  const fallback = {
    ...imgStyle,
    background: "linear-gradient(135deg, #2a2a2a, #3a3a3a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
  };

  const content = {
    flex: 1,
    minWidth: 0,
  };

  const titleStyle = {
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 1.3,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    marginBottom: 2,
    fontFamily: "inherit",
  };

  const subtitleStyle = {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    fontWeight: 400,
    fontFamily: "inherit",
  };

  const glow = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
    opacity: 0.8,
  };

  return toast.custom(
    () => (
      <div style={wrapper}>
        <div style={glow} />
        {image ? (
          <img src={image} alt="" style={imgStyle} />
        ) : (
          <div style={fallback}>💎</div>
        )}
        <div style={content}>
          <div style={pill}>
            {icon}
            <span>{subtitle}</span>
          </div>
          <p style={titleStyle}>{title}</p>
          <p style={subtitleStyle}>Gems &amp; Ore</p>
        </div>
      </div>
    ),
    { id: toastId, duration: 3500 }
  );
};

// ─── Add to Cart Toast ────────────────────────────────────────────────────────
export const showAddToCartToast = (product, quantity = 1) => {
  const name = product?.name || "Item";
  const image =
    product?.image ||
    product?.images?.[0]?.image_url ||
    product?.images?.[0]?.thumb_url ||
    null;
  const qtyText = quantity > 1 ? `${quantity}× added to bag` : "Added to bag";

  renderProductToast({
    image,
    title: name,
    subtitle: qtyText,
    accentColor: "#c5952a",
    icon: <CartIcon />,
    toastId: `cart-${product?.id || Date.now()}`,
  });
};

// ─── Wishlist Toast ───────────────────────────────────────────────────────────
export const showWishlistToast = (product, isAdded) => {
  const name = product?.name || "Item";
  const image =
    product?.image ||
    product?.images?.[0]?.image_url ||
    product?.images?.[0]?.thumb_url ||
    null;

  renderProductToast({
    image,
    title: name,
    subtitle: isAdded ? "Saved to wishlist" : "Removed from wishlist",
    accentColor: isAdded ? "#c5952a" : "#6b6b6b",
    icon: <HeartIcon filled={isAdded} />,
    toastId: `wish-${product?.id || Date.now()}`,
  });
};

export default {
  showAddToCartToast,
  showWishlistToast,
};
