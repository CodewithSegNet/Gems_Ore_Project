import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useCart } from "../../contexts/cartContext";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import storefrontApi from "../../services/api";
import { useFavorites } from "../../contexts/FavoritesContext";
import icon2 from "../../assets/icon2.png";
import hot from "../../assets/hot.png";
import nigeriaFlag from "../../assets/nigeria.png";
import MobileSwiper from "../../components/MobileSwiper";
import warning from "../../assets/material.png";
import star from "../../assets/Star1.png";
import favoriteImg from "../../assets/favorite11.png";
import { useCurrency } from "../../contexts/CurrencyContext";



const StarRating = ({ rating }) => (
  <div className="flex items-center gap-1">
    <svg className="w-5 h-5 text-tertiary" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
    <h5 className="text-xs md:text-base font-light text-gray-500">
      Rating <span className="text-gray-500 font-bold">{rating.toFixed(1)}</span><span className="text-gray-400">/10</span>
    </h5>
  </div>
);

const sizes = ["4.5in", "5.0in"];

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const { formatPrice } = useCurrency();
  const [relatedProducts, setRelatedProducts] = useState([]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const favCtx = useFavorites();
  const [thumbStart, setThumbStart] = useState(0);
  const THUMBS_VISIBLE = 3;
  const [reviewStart, setReviewStart] = useState(0);
  const [reviewsVisible, setReviewsVisible] = useState(typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 3);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [focusReviewIndex, setFocusReviewIndex] = useState(null);
  const [reviewSort, setReviewSort] = useState('most_recent');
  const [reviewSortOpen, setReviewSortOpen] = useState(false);
  const [showDropReview, setShowDropReview] = useState(false);
  const [dropReviewStep, setDropReviewStep] = useState(1);
  const [reviewRating, setReviewRating] = useState(1);
  const [reviewText, setReviewText] = useState("");
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 640);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchaseCheckDone, setPurchaseCheckDone] = useState(false);
  const [myReviewId, setMyReviewId] = useState(null);
  const [hasExistingReview, setHasExistingReview] = useState(false);
  const [isDelivered, setIsDelivered] = useState(false);

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
    if (Math.abs(diffX) > 50 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) onSwipeLeft();
      else onSwipeRight();
    }
  };

  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await storefrontApi.products.getById(id);
        const images = data.images?.map((img) => img.image_url) || (data.image ? [data.image] : []);
        setProduct({
          id: data.id,
          name: data.name,
          price: data.price,
          image: images[0] || "",
          images: images,
          rating: 8.0,
          inStock: data.stock > 0,
          stock: data.stock,
          category: data.category_name?.toLowerCase() || "",
          category_id: data.category_id,
          gender: data.gender,
          description: data.description || "",
          is_best_seller: data.is_best_seller,
          is_new_collection: data.is_new_collection,
        });
        setSelectedImage(0);
        setThumbStart(0);

        // Fetch related products
        if (data.category_id) {
          try {
            const related = await storefrontApi.products.getAll({
              category_id: data.category_id,
              status: "active",
            });
            setRelatedProducts(
              related
                .filter((p) => p.id !== data.id)
                .slice(0, 3)
                .map((p) => ({
                  id: p.id,
                  name: p.name,
                  price: p.price,
                  image: p.image || (p.images?.[0]?.image_url) || "",
                  rating: 8.0,
                  inStock: p.stock > 0,
                }))
            );
          } catch { setRelatedProducts([]); }
        }

        // Fetch reviews
        try {
          const reviewsData = await storefrontApi.reviews.getByProduct(data.id);
          setReviews(reviewsData.map((r) => ({
            name: r.customer_name || "Customer",
            location: "Nigeria",
            rating: r.rating || 8,
            text: r.comment || "",
            date: r.created_at ? new Date(r.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "",
          })));
        } catch { setReviews([]); }
      } catch (e) {
        console.error("Failed to fetch product:", e);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Check if user has purchased this product
  useEffect(() => {
    if (isAuthenticated && id) {
      storefrontApi.orders.hasPurchasedProduct(id)
        .then((data) => {
          setHasPurchased(data?.purchased === true);
          setIsDelivered(data?.delivered === true);
        })
        .catch(() => { setHasPurchased(false); setIsDelivered(false); })
        .finally(() => setPurchaseCheckDone(true));
      // Check for existing review
      storefrontApi.reviews.getMyReview(id)
        .then((data) => {
          if (data) {
            setMyReviewId(data.id);
            setHasExistingReview(true);
            setReviewRating(data.rating || 8);
            setReviewText(data.comment || "");
          }
        })
        .catch(() => {});
    } else {
      setHasPurchased(false);
      setIsDelivered(false);
      setPurchaseCheckDone(true);
    }
  }, [id, isAuthenticated]);

  // Auto-show review modal for delivered orders that haven't been reviewed
  useEffect(() => {
    if (purchaseCheckDone && isDelivered && !hasExistingReview && product) {
      const key = `reviewed_prompt_${id}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        setShowDropReview(true);
        setDropReviewStep(1);
      }
    }
  }, [purchaseCheckDone, isDelivered, hasExistingReview, product, id]);

  const handleThumbSwipeEnd = createTouchEnd(
    () => setThumbStart((prev) => Math.min((product?.images?.length || 1) - THUMBS_VISIBLE, prev + 1)),
    () => setThumbStart((prev) => Math.max(0, prev - 1))
  );

  const handleReviewSwipeEnd = createTouchEnd(
    () => setReviewStart((prev) => Math.min(reviews.length - reviewsVisible, prev + 1)),
    () => setReviewStart((prev) => Math.max(0, prev - 1))
  );

  useEffect(() => {
    const handleResize = () => {
      const count = window.innerWidth < 768 ? 1 : 3;
      setReviewsVisible(count);
      setReviewStart((prev) => Math.min(prev, Math.max(0, reviews.length - count)));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [reviews.length]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);



  const handleSubmitReview = async () => {
    setSubmittingReview(true);
    try {
      const reviewData = {
        product_id: product.id,
        product_name: product.name,
        customer_name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email?.split('@')[0] : 'Customer',
        email: user?.email || 'anonymous@gemsore.com',
        rating: Math.min(Math.max(reviewRating, 1), 10),
        comment: reviewText,
        status: "pending",
      };
      if (hasExistingReview && myReviewId) {
        await storefrontApi.reviews.update(myReviewId, { rating: reviewData.rating, comment: reviewData.comment });
      } else {
        const res = await storefrontApi.reviews.create(reviewData);
        if (res?.id) {
          setMyReviewId(res.id);
          setHasExistingReview(true);
        }
      }
      setDropReviewStep(2);
    } catch (e) {
      console.error("Failed to submit review:", e);
      setDropReviewStep(2);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <HelmetProvider>
        <Navbar dark={false} />
        <div className="bg-white min-h-screen">
          <div className="max-w-screen-xl mx-auto px-4 lg:px-8 py-8 mt-28">
            <div className="flex flex-col lg:flex-row gap-10 animate-pulse">
              <div className="lg:w-1/2">
                <div className="bg-gray-200 rounded-lg" style={{ height: "600px" }} />
                <div className="flex gap-3 mt-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex-1 h-[170px] bg-gray-200 rounded-lg" />
                  ))}
                </div>
              </div>
              <div className="lg:w-1/2 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-8 bg-gray-200 rounded w-1/4 mt-8" />
                <div className="h-12 bg-gray-200 rounded w-full mt-8" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </HelmetProvider>
    );
  }

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

  const images = product.images?.length > 0 ? product.images : [product.image];

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
        <button
          onClick={(e) => { e.preventDefault(); addToCart(item); }}
          className="flex items-center gap-2 absolute top-3 right-3 bg-transparent border border-white hover:bg-[rgba(88,57,49,1)] hover:text-white text-white text-xs font-light px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
        >
          <img className="h-5 w-5" src={icon2} alt="" />
          Shop Now
        </button>
        <div className="absolute bottom-3 right-3">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); favCtx.toggleFavorite(item.id); }}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95"
          >
            <svg
              className={`w-8 h-8 transition-colors duration-300 ${
                favCtx.isFavorited(item.id) ? "text-tertiary fill-tertiary" : "text-white fill-transparent"
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
        <StarRating rating={item.rating || 5.0} />
        <p className="text-[rgba(68,68,68,1)] text-base font-bold">{formatPrice(item.price)}</p>
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
              <div className="rounded-lg overflow-hidden mb-4" style={{ height: "600px" }}>
                <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
              </div>
              {images.length > 1 && (
                <div className="relative">
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
                  {thumbStart > 0 && (
                    <button onClick={() => setThumbStart(Math.max(0, thumbStart - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white transition-all duration-200 cursor-pointer">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                  )}
                  {thumbStart < images.length - THUMBS_VISIBLE && (
                    <button onClick={() => setThumbStart(Math.min(images.length - THUMBS_VISIBLE, thumbStart + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white transition-all duration-200 cursor-pointer">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right — Product Info */}
            <div className="lg:w-1/2">
              <h2 className="text-[rgba(68,68,68,1)] text-2xl mb-[19px] lg:text-3xl font-normal">{product.name}</h2>
              <span className="flex items-center gap-1 text-[rgba(247,120,8,1)] text-sm font-light mb-4 md:mb-[43px]"><span><img className="w-5 h-5" src={hot} alt="" /></span>5 sold in the last 17 hours</span>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 mb-2">
                  <p className="text-sm text-gray-600">Rating:</p>
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[rgba(247,120,8,1)]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <p>Availability: <span className={product.inStock ? "text-green-600 font-medium" : "text-red-500 font-medium"}>{product.inStock ? "In Stock" : "Out of Stock"}</span></p>
                <p>Product Type: <span className="capitalize font-medium">{product.category}</span></p>
              </div>

              <div className="flex items-center gap-1 mt-4 md:mt-[40px]">
                <p className="text-xs text-gray-500">Price:</p>
                <p className="text-[rgba(68,68,68,1)] text-2xl font-bold">{formatPrice(product.price)}</p>
              </div>



              <div className="text-sm text-gray-500 py-2 mt-4 md:mt-[40px]">
                SubTotal + VAT (7.5%): <span className="font-bold text-[rgba(68,68,68,1)]">{formatPrice(total)}</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-[40px] mb-4">
                <div className="flex items-center border border-black rounded-md overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-3 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">−</button>
                  <span className="px-4 py-3 text-sm font-medium ">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-3 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">+</button>
                </div>
                <button onClick={handleAddToCart} className="flex items-center gap-2 bg-black hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-4 rounded-md transition-all duration-300 cursor-pointer">Add to Cart</button>
                <button onClick={() => { favCtx.toggleFavorite(product?.id); setIsFavorite(!isFavorite); }} className="w-9 h-9 md:w-11 md:h-11 rounded-full border bg-gray-200 border-gray-300 flex items-center justify-center hover:bg-primary transition-all bg-[rgba(255,255,255,0.1)] duration-300 cursor-pointer">
                  <svg className={`w-5 h-5 md:w-7 md:h-7 bg-[rgba(255,255,255,0.1)] transition-colors duration-300 ${favCtx.isFavorited(product?.id) ? "text-tertiary fill-tertiary" : "text-gray-700 fill-transparent"}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                <button onClick={() => {
                  const shareUrl = `${window.location.origin}/product/${product.id}`;
                  if (navigator.share) {
                    navigator.share({ title: product.name, text: `Check out ${product.name} on Gems Ore!`, url: shareUrl });
                  } else {
                    navigator.clipboard.writeText(shareUrl);
                    alert("Link copied to clipboard!");
                  }
                }} className="w-9 h-9 md:w-11 md:h-11 rounded-full border bg-gray-200 border-gray-300 flex items-center justify-center hover:bg-primary transition-all duration-300 cursor-pointer bg-[rgba(255,255,255,0.1)]">
                  <svg className="w-5 h-5 md:w-7 md:h-7 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>

              <button onClick={() => { handleAddToCart(); navigate('/checkout'); }} className="w-full md:w-[360px] py-4 border border-black text-black hover:bg-primary hover:border-primary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-light transition-all duration-300 cursor-pointer">Buy Outright</button>

              <div className="flex items-center gap-2 text-sm my-4 text-gray-500">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {product.view_count || Math.floor(50 + (product.name?.length || 5) * 7 + (product.price % 100))} customers are viewing this product
              </div>

              <div className="space-y-2 text-sm text-gray-500 border-t pt-4">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  {product.free_shipping_note || "Free shipping within Abuja (FCT)"}
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Shipping time: {product.shipping_time || "1-2 days"}
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" /></svg>
                  {product.shipping_fee_note || "Shipping fee charged on orders outside Abuja (FCT)"}
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  {product.delivery_estimate || "Shipping items ~5 days"}
                </div>
              </div>
            </div>
          </div>

          {/* ===== DESCRIPTION ===== */}
          {product.description && (
            <div className="mb-16 border-t pt-10">
              <h2 className="text-xl font-bold text-[rgba(68,68,68,1)] mb-4">Description</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>
            </div>
          )}

          {/* ===== CUSTOMER REVIEWS ===== */}
          {reviews.length > 0 && (
            <div className="mb-16 border-t pt-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[rgba(68,68,68,1)] mb-6">Customer Reviews</h2>
                <button onClick={() => { setFocusReviewIndex(null); setShowAllReviews(true); }} className="underline mb-6 hover:text-primary transition-colors duration-300 cursor-pointer">View All</button>
              </div>
              <div className="relative">
                <div className="flex gap-6 overflow-hidden" onTouchStart={handleTouchStart} onTouchEnd={handleReviewSwipeEnd}>
                  {reviews.slice(reviewStart, reviewStart + reviewsVisible).map((review, i) => {
                    const colors = ["bg-yellow-500", "bg-blue-500", "bg-red-500", "bg-purple-500", "bg-green-500", "bg-pink-500", "bg-orange-500", "bg-teal-500"];
                    const actualIndex = reviewStart + i;
                    const starValue = Math.min(5, review.rating / 2);
                    return (
                      <div key={actualIndex} className="flex-1 min-w-0 bg-transparent border rounded-xl p-5 text-black">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${colors[actualIndex % colors.length]}`}>{review.name[0]}</div>
                            <div><p className="flex items-center gap-2 text-sm font-medium">{review.name} | <span className="text-black/60 font-normal inline-flex items-center gap-1"><img src={nigeriaFlag} alt="NG" className="w-4 h-4" />{review.location}</span></p></div>
                          </div>
                          <div className="flex items-center flex-col">
                            <span className="text-lg font-bold">{Number(review.rating).toFixed(1)}</span>
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => {
                                const isFull = starValue >= i + 1;
                                const isHalf = !isFull && starValue >= i + 0.5;
                                return (
                                  <div key={i} className="relative w-3 h-3">
                                    <svg className="w-3 h-3 text-gray-300 absolute inset-0" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    {(isFull || isHalf) && (
                                      <svg className="w-3 h-3 text-amber-500 absolute inset-0" fill="currentColor" viewBox="0 0 20 20" style={isHalf ? { clipPath: 'inset(0 50% 0 0)' } : undefined}><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        <p className="text-black/70 text-xs leading-relaxed mb-2 line-clamp-3">{review.text}</p>
                        <button onClick={() => { setFocusReviewIndex(actualIndex); setShowAllReviews(true); }} className="text-black text-xs font-medium underline underline-offset-2 hover:text-primary transition-colors duration-200 cursor-pointer">Read More</button>
                        <p className="text-black font-bold text-xs mt-2">{review.date}</p>
                      </div>
                    );
                  })}
                </div>
                {reviewStart > 0 && (
                  <button onClick={() => setReviewStart(Math.max(0, reviewStart - 1))} className="absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 cursor-pointer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                  </button>
                )}
                {reviewStart < reviews.length - reviewsVisible && (
                  <button onClick={() => setReviewStart(Math.min(reviews.length - reviewsVisible, reviewStart + 1))} className="absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 cursor-pointer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </button>
                )}
              </div>
              <div className="flex items-center mt-8">
                {hasPurchased ? (
                  <button onClick={() => { setDropReviewStep(1); if (!hasExistingReview) { setReviewRating(1); setReviewText(""); } setShowDropReview(true); }} className="border border-black hover:border-primary hover:bg-primary hover:text-white transition-all duration-200 cursor-pointer text-black text-sm px-4 py-2 rounded-md">{hasExistingReview ? 'Edit review' : 'Drop review'}</button>
                ) : isAuthenticated ? (
                  <p className="text-sm text-gray-400 italic">Purchase this product to leave a review</p>
                ) : (
                  <Link to="/login" className="text-sm text-[rgba(88,57,49,1)] underline hover:text-[rgba(68,68,68,1)] transition-colors">Sign in to leave a review</Link>
                )}
              </div>
            </div>
          )}

          {/* Drop review button when no reviews */}
          {reviews.length === 0 && (
            <div className="mb-16 border-t pt-10">
              <h2 className="text-xl font-bold text-[rgba(68,68,68,1)] mb-6">Customer Reviews</h2>
              <p className="text-gray-400 text-sm mb-4">No reviews yet. Be the first to review this product!</p>
              {hasPurchased ? (
                <button onClick={() => { setDropReviewStep(1); if (!hasExistingReview) { setReviewRating(1); setReviewText(""); } setShowDropReview(true); }} className="border border-black hover:border-primary hover:bg-primary hover:text-white transition-all duration-200 cursor-pointer text-black text-sm px-4 py-2 rounded-md">{hasExistingReview ? 'Edit review' : 'Drop review'}</button>
              ) : isAuthenticated ? (
                <p className="text-sm text-gray-400 italic">Purchase this product to leave a review</p>
              ) : (
                <Link to="/login" className="text-sm text-[rgba(88,57,49,1)] underline hover:text-[rgba(68,68,68,1)] transition-colors">Sign in to leave a review</Link>
              )}
            </div>
          )}

          {/* ===== RELATED PRODUCTS ===== */}
          {relatedProducts.length > 0 && (
            <div className="mb-16 border-t pt-10">
              <h2 className="text-xl font-bold text-[rgba(68,68,68,1)] mb-6">Related Products</h2>
              {isMobile ? (
                <MobileSwiper items={relatedProducts} autoPlay={0} renderItem={(item) => <ProductCard key={item.id} item={item} />} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedProducts.map((item) => (<ProductCard key={item.id} item={item} />))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* View All Reviews Modal */}
      {showAllReviews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => { setShowAllReviews(false); setReviewSortOpen(false); }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl max-h-[80vh] flex flex-col" onClick={(e) => { e.stopPropagation(); setReviewSortOpen(false); }}>
            <button onClick={() => setShowAllReviews(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 cursor-pointer z-10">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h3 className="text-lg font-bold text-[rgba(68,68,68,1)] mb-4 pr-10">Customer Reviews About This Product</h3>

            {/* Sort dropdown + label */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-[rgba(68,68,68,1)]">Customer Reviews</p>
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setReviewSortOpen(!reviewSortOpen)} className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                  {reviewSort === 'most_recent' ? 'Most Recent' : 'All Reviews'}
                  <svg className={`w-3.5 h-3.5 transition-transform ${reviewSortOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {reviewSortOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[140px]">
                    <button onClick={() => { setReviewSort('most_recent'); setReviewSortOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors cursor-pointer rounded-t-lg ${reviewSort === 'most_recent' ? 'font-semibold text-[rgba(68,68,68,1)]' : 'text-gray-600'}`}>Most Recent</button>
                    <button onClick={() => { setReviewSort('all'); setReviewSortOpen(false); }} className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors cursor-pointer rounded-b-lg ${reviewSort === 'all' ? 'font-semibold text-[rgba(68,68,68,1)]' : 'text-gray-600'}`}>All Reviews</button>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-100" />

            <div className="overflow-y-auto space-y-0 pr-1 mt-2" style={{ maxHeight: '450px' }}>
              {(() => {
                const colors = ["bg-yellow-500", "bg-blue-500", "bg-red-500", "bg-purple-500", "bg-green-500", "bg-pink-500", "bg-orange-500", "bg-teal-500"];
                let ordered = focusReviewIndex !== null ? [reviews[focusReviewIndex], ...reviews.filter((_, i) => i !== focusReviewIndex)] : [...reviews];
                if (reviewSort === 'most_recent') {
                  ordered = [...ordered].sort((a, b) => new Date(b.date) - new Date(a.date));
                }
                return ordered.map((review, i) => {
                  const origIndex = reviews.indexOf(review);
                  const starValue = Math.min(5, review.rating / 2);
                  return (
                    <div key={origIndex} className={`py-5 ${i > 0 ? 'border-t border-gray-100' : ''} ${i === 0 && focusReviewIndex !== null ? 'bg-[rgba(217,176,62,0.03)]' : ''}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${colors[origIndex % colors.length]}`}>{review.name[0]}</div>
                          <div>
                            <p className="text-sm font-semibold text-[rgba(68,68,68,1)] flex items-center gap-2">{review.name} <span className="text-gray-400 font-normal">|</span> <span className="text-gray-500 font-normal inline-flex items-center gap-1"><img src={nigeriaFlag} alt="NG" className="w-4 h-3" />{review.location}</span></p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <p className="text-xs text-gray-400">{review.date}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-lg font-bold text-[rgba(68,68,68,1)]">{Number(review.rating).toFixed(1)}</span>
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, s) => {
                                const isFull = starValue >= s + 1;
                                const isHalf = !isFull && starValue >= s + 0.5;
                                return (
                                  <div key={s} className="relative w-2.5 h-2.5">
                                    <svg className="w-2.5 h-2.5 text-gray-300 absolute inset-0" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    {(isFull || isHalf) && (
                                      <svg className="w-2.5 h-2.5 text-amber-500 absolute inset-0" fill="currentColor" viewBox="0 0 20 20" style={isHalf ? { clipPath: 'inset(0 50% 0 0)' } : undefined}><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{review.text}</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowDropReview(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl p-6 md:p-8 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowDropReview(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            {dropReviewStep === 1 ? (
              <>
                <h3 className="text-lg font-bold text-[rgba(68,68,68,1)] mb-2">{hasExistingReview ? 'Edit Your Review' : 'Make a Review'}</h3>
                <p className="flex items-start gap-1 text-xs text-gray-500 mb-5 leading-relaxed"><span><img className="w-5 h-5" src={warning} alt="" /></span>To keep reviews clear and helpful for all users, please note that each review must not exceed 100 words.</p>                

                      <div className="my-3 bg-transparent rounded-md border-[3px] border-dotted border-[rgba(68,68,68,1)] px-3 py-2 flex items-center gap-3">
                        <img src={images[0]} alt={product.name} className="w-14 h-14 rounded-md object-cover" />
                        <span className="text-sm font-medium text-[rgba(68,68,68,1)]">{product.name}</span>
                      </div>
                                <p className="flex items-center gap-1 text-xs text-gray-600 my-3"><span><img className="w-4 h-4" src={star} alt="" /></span> Take a moment to rate your previous order, we'd love to hear what you think!</p>

                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-[rgba(68,68,68,1)]">{reviewRating.toFixed(1)}</span>
                  </div>
                  <div className="flex gap-2 justify-between shadow-md rounded-lg p-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <button key={n} onClick={() => setReviewRating(n)} className={`flex items-center justify-center cursor-pointer text-xs font-medium transition-all duration-200 ${reviewRating === n ? 'bg-[rgba(217,176,62,1)] text-white' : 'bg-[rgba(51,51,51,0.05)] text-[rgba(68,68,68,1)] hover:bg-[rgba(51,51,51,0.12)]'}`} style={{ width: '32px', height: '32px', borderRadius: '32px', padding: '16px', gap: '8px' }}>
                        {n}.0
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-5">
                  <div className="relative">
                    <textarea value={reviewText} onChange={(e) => { const words = e.target.value.split(/\s+/).filter(Boolean); if (words.length <= 100) setReviewText(e.target.value); }} placeholder="Write your review here..." className="w-full border border-gray-300 rounded-lg p-3 pb-7 text-sm resize-none h-28 focus:outline-none focus:border-[rgba(217,176,62,1)] transition-colors" />
                    <span className="absolute bottom-2 right-3 text-xs text-gray-400">{reviewText.split(/\s+/).filter(Boolean).length}/100</span>
                  </div>
                </div>
                <button onClick={handleSubmitReview} disabled={reviewText.trim().length === 0 || submittingReview} className="w-full py-3 rounded-lg bg-black text-white font-medium hover:bg-black/80 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">
                  {submittingReview ? "Submitting..." : hasExistingReview ? "Update Review" : "Submit Review"}
                </button>
              </>
            ) : (
              <div className="text-center py-6">
                <img src={favoriteImg} alt="Review Submitted" className="w-24 h-24 mx-auto mb-5 object-contain" />
                <h3 className="text-lg font-bold text-[rgba(68,68,68,1)] mb-3">Review Submitted</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Thank you for your thoughtful review! Your insights are invaluable, and we'll use your feedback to refine our offerings and provide an even better experience for our valued customers.</p>
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
