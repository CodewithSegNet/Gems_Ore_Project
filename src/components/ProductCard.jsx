/* eslint-disable react/prop-types */
import { memo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useFavorites } from "../contexts/FavoritesContext";
import { useCart } from "../contexts/cartContext";

const icon2 = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113210/gems_ore/icon2.png";
const stock = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113260/gems_ore/stock.png";

// Helper to determine if a URL is a video
const isVideoUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url) || url.includes("/video/upload/");
};

// 1. Isolated Heart Button: Preserves exact original style while isolating state subscriptions
export const HeartButton = memo(function HeartButton({ product, className = "" }) {
  const { isFavorited, toggleFavorite } = useFavorites();
  const filled = isFavorited(product.id);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product.id, product);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={filled ? "Remove from wishlist" : "Add to wishlist"}
      className={
        className ||
        "w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95"
      }
    >
      <svg
        className={`w-8 h-8 transition-colors duration-300 ${
          filled ? "text-tertiary fill-tertiary" : "text-white fill-transparent"
        }`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
});

// 2. Isolated Cart Button: Preserves exact original style while isolating state subscriptions
export const CartButton = memo(function CartButton({
  product,
  compact = false,
  className = "",
}) {
  const { addToCart } = useCart();

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <button
      onClick={handleClick}
      className={
        className ||
        (compact
          ? "flex items-center gap-1 sm:gap-2 absolute top-2 sm:top-3 right-2 sm:right-3 bg-transparent border border-white hover:bg-[rgba(88,57,49,1)] hover:text-white text-white text-[10px] sm:text-xs font-light px-2 sm:px-4 py-1.5 sm:py-3 rounded-md sm:rounded-lg transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
          : "flex items-center gap-2 absolute top-3 right-3 bg-transparent border border-white hover:bg-[rgba(88,57,49,1)] hover:text-white text-white text-xs font-light px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95")
      }
    >
      <img className={compact ? "h-3.5 sm:h-5 w-3.5 sm:w-5" : "h-5 w-5"} src={icon2} alt="" />
      {compact ? (
        <>
          <span className="hidden sm:inline">Shop Now</span>
          <span className="sm:hidden">Shop</span>
        </>
      ) : (
        <span>Shop Now</span>
      )}
    </button>
  );
});

// 3. Isolated Media Renderer (Prevents video restarts and frame drops)
const CardMedia = memo(function CardMedia({ src, alt }) {
  const videoRef = useRef(null);
  const isVideo = isVideoUrl(src);

  useEffect(() => {
    if (!isVideo || !videoRef.current) return;
    let isVisible = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;
        isVisible = entry.isIntersecting;
        if (isVisible && !document.body.classList.contains("modal-open")) {
          videoRef.current.play().catch(() => {});
        } else {
          videoRef.current.pause();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(videoRef.current);

    const handleModalToggle = (e) => {
      if (!videoRef.current) return;
      const isOpen = e?.detail?.isOpen ?? document.body.classList.contains("modal-open");
      if (isOpen) {
        videoRef.current.pause();
      } else if (isVisible) {
        videoRef.current.play().catch(() => {});
      }
    };
    window.addEventListener("gems:modal-toggle", handleModalToggle);

    return () => {
      observer.disconnect();
      window.removeEventListener("gems:modal-toggle", handleModalToggle);
    };
  }, [isVideo, src]);

  if (isVideo) {
    return (
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        style={{ willChange: "transform", transform: "translateZ(0)" }}
      />
    );
  }

  if (src) {
    return (
      <img
        src={src}
        alt={alt || "Product image"}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    );
  }

  return <div className="w-full h-full bg-gray-200" />;
});

// 4. Rating Component: Preserves exact original style and typography
const CardRating = memo(function CardRating({ rating = 5.0, showMax = false }) {
  const num = typeof rating === "number" ? rating : (parseFloat(rating) || 0.0);
  const formatted = num.toFixed(1);
  return (
    <div className="flex items-center gap-1">
      <svg className={`w-5 h-5 ${num > 0 ? "text-tertiary" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <h5 className="text-xs md:text-base font-light text-gray-500">
        Rating <span className="text-gray-500 font-bold">{showMax ? `${formatted}/5.0` : formatted}</span>
      </h5>
    </div>
  );
});

// 5. Fully Memoized ProductCard
// Prevents re-rendering when other items are liked or added to cart
const ProductCard = memo(function ProductCard({
  product,
  formatPrice,
  isNewlyRevealed = false,
  staggerDelay = 0,
  aspectRatio = "aspect-[3/4]",
  height = null,
  compact = false,
  showMaxRating = false,
}) {
  const linkStyle = isNewlyRevealed ? { animationDelay: `${staggerDelay}ms` } : {};
  const displayMax = showMaxRating || Boolean(product?.showMaxRating);

  return (
    <Link
      to={`/product/${product.id}`}
      className={`group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 block no-underline ${
        isNewlyRevealed ? "animate-slide-up" : ""
      }`}
      style={linkStyle}
    >
      {/* Media Container */}
      <div
        className={`relative overflow-hidden ${height ? "" : aspectRatio}`}
        style={height ? { height } : {}}
      >
        <CardMedia src={product.image} alt={product.name} />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300 pointer-events-none" />

        {/* Isolated Cart Button */}
        <CartButton product={product} compact={compact} />

        {/* Out of Stock Ribbon */}
        {!product.inStock && (
          <img
            src={stock}
            alt="Out of Stock"
            className={
              compact
                ? "absolute top-0 left-2 sm:left-3 w-[50px] sm:w-[80px] h-auto pointer-events-none"
                : "absolute top-0 left-3 w-[80px] h-auto pointer-events-none"
            }
          />
        )}

        {/* Isolated Like Button */}
        <div className={compact ? "absolute bottom-2 sm:bottom-3 right-2 sm:right-3" : "absolute bottom-3 right-3"}>
          <HeartButton product={product} />
        </div>
      </div>

      {/* Product Details: Name, Rating, Price */}
      <div className={compact ? "p-2 sm:p-4 space-y-1 sm:space-y-2" : "p-4 space-y-2"}>
        <p
          className={
            compact
              ? "text-[rgba(68,68,68,1)] text-xs sm:text-sm md:text-xl font-medium line-clamp-1"
              : "text-[rgba(68,68,68,1)] text-sm md:text-xl font-medium"
          }
        >
          {product.name}
        </p>
        <CardRating rating={product.rating} showMax={displayMax} />
        <p
          className={
            compact
              ? "text-[rgba(68,68,68,1)] text-sm sm:text-base font-bold"
              : "text-[rgba(68,68,68,1)] text-base font-bold"
          }
        >
          {formatPrice ? formatPrice(product.price) : product.price}
        </p>
      </div>
    </Link>
  );
});

export default ProductCard;
