import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useCart } from "../../contexts/cartContext";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import { allProductsLookup, formatPrice, customerReviews } from "../../data/products";
import icon2 from "../../assets/icon2.png";
import hot from "../../assets/hot.png";
import watchesImg from "../../assets/watches.avif";
import ringsImg from "../../assets/rings.avif";
import earringsImg from "../../assets/earrings.avif";
import necklaceImg from "../../assets/neckless.avif";
import braceletImg from "../../assets/bracklet.avif";
import nigeriaFlag from "../../assets/nigeria.png";
import MobileSwiper from "../../components/MobileSwiper";

// Map category to gallery images so each product gets varied thumbnails
const categoryGallery = {
  watches: [watchesImg, ringsImg, braceletImg, necklaceImg, earringsImg, watchesImg],
  rings: [ringsImg, watchesImg, necklaceImg, braceletImg, earringsImg, ringsImg],
  necklaces: [necklaceImg, earringsImg, ringsImg, watchesImg, braceletImg, necklaceImg],
  earrings: [earringsImg, necklaceImg, watchesImg, ringsImg, braceletImg, earringsImg],
  bracelets: [braceletImg, watchesImg, earringsImg, necklaceImg, ringsImg, braceletImg],
};
const defaultGallery = [watchesImg, ringsImg, earringsImg, necklaceImg, braceletImg, watchesImg];

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-1">
    <svg className="w-5 h-5 text-tertiary" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
    <h5 className="text-xs md:text-base font-light text-gray-500">
      Rating <span className="text-gray-500 font-bold">{rating.toFixed(1)}</span>
    </h5>
  </div>
);

const sizes = ["4.5in", "5.0in"];

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const product = allProductsLookup.find((p) => p.id === Number(id));

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [cardFavorites, setCardFavorites] = useState(new Set());
  const [thumbStart, setThumbStart] = useState(0);
  const THUMBS_VISIBLE = 3;
  const [reviewStart, setReviewStart] = useState(0);
  const [reviewsVisible, setReviewsVisible] = useState(typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 3);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [focusReviewIndex, setFocusReviewIndex] = useState(null);
  const [showDropReview, setShowDropReview] = useState(false);
  const [dropReviewStep, setDropReviewStep] = useState(1);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 640);

  // Touch swipe support
  const touchStartX = React.useRef(0);
  const touchStartY = React.useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const createTouchEnd = (onSwipeLeft, onSwipeRight) => (e) => {
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;
    // Only trigger horizontal swipe if horizontal movement > vertical (prevents blocking scroll)
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) onSwipeLeft();
      else onSwipeRight();
    }
  };

  const handleThumbSwipeEnd = createTouchEnd(
    () => setThumbStart((prev) => Math.min(images.length - THUMBS_VISIBLE, prev + 1)),
    () => setThumbStart((prev) => Math.max(0, prev - 1))
  );

  const handleReviewSwipeEnd = createTouchEnd(
    () => setReviewStart((prev) => Math.min(customerReviews.length - reviewsVisible, prev + 1)),
    () => setReviewStart((prev) => Math.max(0, prev - 1))
  );

  // Responsive: 1 review on mobile, 3 on desktop
  useEffect(() => {
    const handleResize = () => {
      const count = window.innerWidth < 768 ? 1 : 3;
      setReviewsVisible(count);
      setReviewStart((prev) => Math.min(prev, Math.max(0, customerReviews.length - count)));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Also track isMobile in the same resize listener
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleCardFavorite = (productId) => {
    setCardFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  // Related products (same category, different id)
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProductsLookup
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 3);
  }, [product]);

  // Recently Viewed — just pick 3 random different products
  const recentlyViewed = useMemo(() => {
    if (!product) return [];
    return allProductsLookup
      .filter((p) => p.id !== product.id && !relatedProducts.find((r) => r.id === p.id))
      .slice(0, 3);
  }, [product, relatedProducts]);

  if (!product) {
    return (
      <HelmetProvider>
        <Navbar dark={false} />
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-700 mb-4">Product Not Found</h1>
            <button onClick={() => navigate("/")} className="text-[rgba(88,57,49,1)] underline">
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </HelmetProvider>
    );
  }

  // Gallery images — product image first, then related category images (6 total)
  const images = categoryGallery[product.category]
    ? [product.image, ...categoryGallery[product.category].filter(img => img !== product.image).slice(0, 5)]
    : [product.image, ...defaultGallery.filter(img => img !== product.image).slice(0, 5)];

  const vatRate = 0.075;
  const subtotal = product.price;
  const vat = subtotal * vatRate;
  const total = subtotal + vat;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  const ProductCard = ({ item }) => (
    <Link
      to={`/product/${item.id}`}
      className="group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 block bg-transparent no-underline"
    >
      <div className="relative overflow-hidden" style={{ height: "400px" }}>
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Shop Now Button */}
        <button
          onClick={(e) => { e.preventDefault(); addToCart(item); }}
          className="flex items-center gap-2 absolute top-3 right-3 bg-transparent border border-white hover:bg-[rgba(88,57,49,1)] hover:text-white text-white text-xs font-light px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
        >
          <img className="h-5 w-5" src={icon2} alt="" />
          Shop Now
        </button>
        {/* Favorite Button — bottom right */}
        <div className="absolute bottom-3 right-3">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCardFavorite(item.id); }}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95"
          >
            <svg
              className={`w-8 h-8 transition-colors duration-300 ${
                cardFavorites.has(item.id) ? "text-tertiary fill-tertiary" : "text-white fill-transparent"
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
        </div>
      </div>
      <div className="p-4 space-y-2">
        <p className="text-[rgba(68,68,68,1)] text-sm md:text-lg font-medium">{item.name}</p>
        <StarRating rating={item.rating} />
        <p className="text-[rgba(68,68,68,1)] text-base font-bold">₦{formatPrice(item.price)}</p>
      </div>
    </Link>
  );

  return (
    <HelmetProvider>
      <Helmet>
        <title>{product.name} | Gems Ore Nigeria</title>
        <meta name="description" content={product.description?.slice(0, 160)} />
      </Helmet>

      <Navbar dark={false} />

      <div className="bg-white min-h-screen">
        <div className="max-w-screen-xl mx-auto px-4 lg:px-8 py-8 mt-28">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-6 text-[rgba(88,57,49,1)] hover:text-[rgba(68,68,68,1)] transition-colors duration-200 group"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-200 group-hover:-translate-x-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m0 0l7 7m-7-7l7-7" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </button>

          {/* ===== MAIN PRODUCT SECTION ===== */}
          <div className="max-w-screen-xl mx-auto flex flex-col lg:flex-row gap-10 mb-16">
            {/* Left — Images */}
            <div className="lg:w-1/2">
              {/* Main Image */}
              <div className="rounded-lg overflow-hidden mb-4" style={{ height: "600px" }}>
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Thumbnails Slider */}
              <div className="relative">
                {/* Thumbnails */}
                <div className="flex gap-3 overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleThumbSwipeEnd}>
                  {images.slice(thumbStart, thumbStart + THUMBS_VISIBLE).map((img, i) => {
                    const actualIndex = thumbStart + i;
                    return (
                      <button
                        key={actualIndex}
                        onClick={() => setSelectedImage(actualIndex)}
                        className={`flex-1 h-[170px] rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                          selectedImage === actualIndex ? "border-[rgba(217,176,62,1)]" : "border-transparent"
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>

                {/* Left Arrow — only when not at start */}
                {thumbStart > 0 && (
                  <button
                    onClick={() => setThumbStart(Math.max(0, thumbStart - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white transition-all duration-200 cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}

                {/* Right Arrow — only when not at end */}
                {thumbStart < images.length - THUMBS_VISIBLE && (
                  <button
                    onClick={() => setThumbStart(Math.min(images.length - THUMBS_VISIBLE, thumbStart + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white transition-all duration-200 cursor-pointer"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Right — Product Info */}
            <div className="lg:w-1/2">
              <h2 className="text-[rgba(68,68,68,1)] text-2xl mb-[19px] lg:text-3xl font-normal">
                {product.name}
              </h2>

              <span className="flex items-center gap-1 text-[rgba(247,120,8,1)] text-sm font-light mb-4 md:mb-[43px]"><span><img className="w-5 h-5" src={hot} alt="" /></span>5 sold in the last 17 hours</span>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 mb-2">
                  <p className="text-sm text-gray-600">Rating:</p>
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[rgba(247,120,8,1)]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-400"></span>
              </div>

              {/* Availability & Type */}
              <div className="space-y-1 text-sm text-gray-600">
                <p>Availability: <span className={product.inStock ? "text-green-600 font-medium" : "text-red-500 font-medium"}>{product.inStock ? "In Stock" : "Out of Stock"}</span></p>
                <p>Product Type: <span className="capitalize font-medium">{product.category}</span></p>
              </div>

              {/* Price */}
              <div className="flex items-center gap-1 mt-4 md:mt-[40px]">
                <p className="text-xs text-gray-500">Price:</p>
                <p className="text-[rgba(68,68,68,1)] text-2xl font-bold">₦{formatPrice(product.price)}</p>
              </div>

              {/* Size */}
              <div className="mt-4 md:mt-[40px]">
                <p className="text-xs text-gray-400 mb-2">Size: {selectedSize}</p>
                <div className="flex gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-md text-sm border transition-all duration-200 cursor-pointer ${
                        selectedSize === size
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300 text-gray-600 hover:border-[rgba(88,57,49,1)]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtotal */}
              <div className="text-sm text-gray-500 py-2 mt-4 md:mt-[40px]">
                SubTotal + VAT (7.5%): <span className="font-bold text-[rgba(68,68,68,1)]">₦{formatPrice(total)}</span>
              </div>

              {/* Quantity + Add to Cart + Wishlist + Share */}
              <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-[40px] mb-4">
                {/* Quantity */}
                <div className="flex items-center border border-black rounded-md overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-3 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                  >−</button>
                  <span className="px-4 py-3 text-sm font-medium ">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-3 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                  >+</button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  // disabled={!product.inStock}
                  className="flex items-center gap-2 bg-black hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-4 rounded-md transition-all duration-300 cursor-pointer"
                >
                  Add to Cart
                </button>

                {/* Wishlist */}
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="w-9 h-9 md:w-11 md:h-11 rounded-full border bg-gray-300 border-gray-300 flex items-center justify-center hover:bg-primary transition-all duration-300 cursor-pointer"
                >
                  <svg
                    className={`w-5 h-5 md:w-7 md:h-7 transition-colors duration-300 ${
                      isFavorite ? "text-tertiary fill-tertiary" : "text-gray-700 fill-transparent"
                    }`}
                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>

                {/* Share */}
                <button className="w-11 h-11 rounded-full border bg-gray-300 border-gray-300 flex items-center justify-center hover:bg-primary transition-all duration-300 cursor-pointer">
                  <svg className="w-7 h-7 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>

              {/* Buy Outright */}
              <button
                // disabled={!product.inStock}
                className="w-[360px] py-4 border border-black text-black hover:bg-primary hover:border-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-light transition-all duration-300 cursor-pointer"
              >
                Buy Outrightlg
              </button>

              {/* Social proof */}
              <div className="flex items-center gap-2 text-sm my-4 text-gray-500">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                120 customers are viewing this product
              </div>

              {/* Shipping Info */}
              <div className="space-y-2 text-sm text-gray-500 border-t pt-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Free shipping within Abuja (FCT)
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Shipping time: 1-2 days
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
                  </svg>
                  Shipping fee charged on orders outside Abuja (FCT)
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Shipping items ~5 days
                </div>
              </div>
            </div>
          </div>

          {/* ===== DESCRIPTION ===== */}
          <div className="mb-16 border-t pt-10">
            <h2 className="text-xl font-bold text-[rgba(68,68,68,1)] mb-4">Description</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {product.description}
            </p>

            {product.features && (
              <>
                <h3 className="text-sm font-bold text-[rgba(68,68,68,1)] mb-3">Key Features:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {product.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* ===== CUSTOMER REVIEWS ===== */}
          <div className="mb-16 border-t pt-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[rgba(68,68,68,1)] mb-6">Customer Reviews</h2>
              <button onClick={() => { setFocusReviewIndex(null); setShowAllReviews(true); }} className="underline mb-6 hover:text-primary transition-colors duration-300 cursor-pointer">View All</button>
            </div>
            <div className="relative">
              {/* Review Cards */}
              <div className="flex gap-6 overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleReviewSwipeEnd}>
                {customerReviews.slice(reviewStart, reviewStart + reviewsVisible).map((review, i) => {
                  const colors = ["bg-yellow-500", "bg-blue-500", "bg-red-500", "bg-purple-500", "bg-green-500", "bg-pink-500", "bg-orange-500", "bg-teal-500"];
                  const actualIndex = reviewStart + i;
                  return (
                    <div key={actualIndex} className="flex-1 min-w-0 bg-transparent border rounded-xl p-5 text-black">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${colors[actualIndex % colors.length]}`}>
                            {review.name[0]}
                          </div>
                          <div>
                            <p className="flex items-center gap-2 text-sm font-medium">{review.name} | <span className="text-black/60 font-normal inline-flex items-center gap-1"><img src={nigeriaFlag} alt="NG" className="w-4 h-4" />{review.location}</span></p>
                          </div>
                        </div>
                        <div className="flex items-center flex-col ">
                          <span className="text-md text-center font-bold">{review.rating}</span>
                                     <div className="flex items-center gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-2.5 h-2.5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                        </div>
                      </div>
                      <p className="text-black/70 text-xs leading-relaxed mb-2 line-clamp-3">{review.text}</p>
                      <button
                        onClick={() => { setFocusReviewIndex(actualIndex); setShowAllReviews(true); }}
                        className="text-black text-xs font-medium underline underline-offset-2 hover:text-primary transition-colors duration-200 cursor-pointer"
                      >
                        Read More
                      </button>
                      <p className="text-black font-bold text-xs mt-2">{review.date}</p>
                    </div>
                  );
                })}
              </div>

              {/* Left Arrow */}
              {reviewStart > 0 && (
                <button
                  onClick={() => setReviewStart(Math.max(0, reviewStart - 1))}
                  className="absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              {/* Right Arrow */}
              {reviewStart < customerReviews.length - reviewsVisible && (
                <button
                  onClick={() => setReviewStart(Math.min(customerReviews.length - reviewsVisible, reviewStart + 1))}
                  className="absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>


            <div className="flex items-center mt-8">
              <button onClick={() => { setDropReviewStep(1); setReviewRating(0); setReviewText(""); setShowDropReview(true); }} className="border border-black hover:border-primary hover:bg-primary hover:text-white transition-all duration-200 cursor-pointer text-black text-sm px-4 py-2 rounded-md">
                Drop review
              </button>
            </div>
          </div>

          {/* ===== RELATED PRODUCTS ===== */}
          {relatedProducts.length > 0 && (
            <div className="mb-16 border-t pt-10">
              <h2 className="text-xl font-bold text-[rgba(68,68,68,1)] mb-6">Related Products</h2>
              {isMobile ? (
                <MobileSwiper
                  items={relatedProducts}
                  autoPlay={0}
                  renderItem={(item) => <ProductCard key={item.id} item={item} />}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedProducts.map((item) => (
                    <ProductCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== RECENTLY VIEWED ===== */}
          {recentlyViewed.length > 0 && (
            <div className="mb-16 border-t pt-10">
              <h2 className="text-xl font-bold text-[rgba(68,68,68,1)] mb-6">Recently Viewed Products</h2>
              {isMobile ? (
                <MobileSwiper
                  items={recentlyViewed}
                  autoPlay={0}
                  renderItem={(item) => <ProductCard key={item.id} item={item} />}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentlyViewed.map((item) => (
                    <ProductCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* View All Reviews Modal */}
      {showAllReviews && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAllReviews(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAllReviews(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 cursor-pointer z-10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-lg font-bold text-[rgba(68,68,68,1)] mb-1">Customer Reviews About This Product</h3>
            <p className="text-sm text-gray-400 mb-4">Most Recent</p>

            <div className="overflow-y-auto flex-1 space-y-4 pr-1">
              {(() => {
                const colors = ["bg-yellow-500", "bg-blue-500", "bg-red-500", "bg-purple-500", "bg-green-500", "bg-pink-500", "bg-orange-500", "bg-teal-500"];
                const ordered = focusReviewIndex !== null
                  ? [customerReviews[focusReviewIndex], ...customerReviews.filter((_, i) => i !== focusReviewIndex)]
                  : customerReviews;
                return ordered.map((review, i) => {
                  const origIndex = focusReviewIndex !== null
                    ? (i === 0 ? focusReviewIndex : customerReviews.indexOf(review))
                    : i;
                  return (
                    <div key={origIndex} className={`border rounded-xl p-4 ${i === 0 && focusReviewIndex !== null ? 'border-[rgba(217,176,62,0.5)] bg-[rgba(217,176,62,0.05)]' : ''}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${colors[origIndex % colors.length]}`}>
                            {review.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{review.name}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1"><img src={nigeriaFlag} alt="NG" className="w-4 h-3" />{review.location}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-bold">{review.rating}</span>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, s) => (
                              <svg key={s} className="w-2 h-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-black/70 text-xs leading-relaxed mb-2">{review.text}</p>
                      <p className="text-black font-bold text-xs">{review.date}</p>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Drop a Review Modal */}
      {showDropReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDropReview(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDropReview(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {dropReviewStep === 1 ? (
              <>
                <h3 className="text-lg font-bold text-[rgba(68,68,68,1)] mb-2">Make a Review</h3>
                <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                  To keep reviews clear and helpful for all users, please note that each review must not exceed 100 words. Reviews over this limit may be trimmed or not published.
                </p>
                <p className="text-sm text-gray-600 mb-3">Take a moment to rate your previous order, we'd love to hear what you think!</p>

                {/* Rating Buttons */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-[rgba(68,68,68,1)]">{reviewRating.toFixed(1)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-between">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <button
                        key={n}
                        onClick={() => setReviewRating(n)}
                        className={`flex items-center justify-center cursor-pointer text-sm font-medium transition-all duration-200 ${
                          reviewRating === n
                            ? 'bg-[rgba(217,176,62,1)] text-white'
                            : 'bg-[rgba(51,51,51,0.05)] text-[rgba(68,68,68,1)] hover:bg-[rgba(51,51,51,0.12)]'
                        }`}
                        style={{ width: '50px', height: '50px', borderRadius: '32px', padding: '16px', gap: '8px' }}
                      >
                        {n}.0
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <div className="mb-5">
                  <textarea
                    value={reviewText}
                    onChange={(e) => {
                      const words = e.target.value.split(/\s+/).filter(Boolean);
                      if (words.length <= 100) setReviewText(e.target.value);
                    }}
                    placeholder="Write your review here..."
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none h-24 focus:outline-none focus:border-[rgba(217,176,62,1)] transition-colors"
                  />
                  <p className="text-xs text-gray-400 text-right mt-1">{reviewText.split(/\s+/).filter(Boolean).length}/100</p>
                </div>

                <button
                  onClick={() => setDropReviewStep(2)}
                  disabled={reviewText.trim().length === 0}
                  className="w-full py-3 rounded-lg bg-black text-white font-medium hover:bg-black/80 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Submit Review
                </button>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[rgba(68,68,68,1)] mb-3">Review Submitted</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Thank you for your thoughtful review! Your insights are invaluable, and we'll use your feedback to refine our offerings and provide an even better experience for our valued customers.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </HelmetProvider>
  );
};

export default ProductDetailPage;
