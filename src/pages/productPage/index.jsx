import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useCart } from "../../contexts/cartContext";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
import filter from "../../assets/filter.png"; 
import icon2 from "../../assets/icon2.png";
import stock from "../../assets/stock.png";
import storefrontApi from "../../services/api";
import { getCached, setCache } from "../../utils/cache";



import { useGender } from "../../contexts/genderContext";
import { useFavorites } from "../../contexts/FavoritesContext";
import { useCurrency } from "../../contexts/CurrencyContext";


const isVideoUrl = (url) => url && (/\.(mp4|webm|mov|avi)(\?|$)/i.test(url) || url.includes('/video/'));

const ITEMS_PER_PAGE = 20;

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-1">
    <svg className="w-5 h-5 text-tertiary" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
    <h5 className="text-xs md:text-base font-light text-gray-500">Rating  <span className="text-gray-500 font-bold">{rating.toFixed(1)}</span></h5>
  </div>
);

const HeartIcon = ({ filled, onClick }) => (
  <button
    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
    className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95"
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

const ProductPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialCategory = searchParams.get("category") || "all";
  const initialGender = searchParams.get("gender") || "all";

  const [allProducts, setAllProducts] = useState([]);
  const { formatPrice, symbol } = useCurrency();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(initialCategory);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [outOfStockOnly, setOutOfStockOnly] = useState(false);
  const [appliedPriceRange, setAppliedPriceRange] = useState(1000000000);
  const [pendingPriceRange, setPendingPriceRange] = useState(1000000000);
  const [appliedPriceMin, setAppliedPriceMin] = useState(0);
  const [pendingPriceMin, setPendingPriceMin] = useState(0);
  const PRICE_MAX = 1000000000;
  const [favorites, setFavorites] = useState(new Set());
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newlyRevealed, setNewlyRevealed] = useState(new Set());
  const [genderFilter, setGenderFilter] = useState(initialGender);

  const { addToCart } = useCart();
  const { gender } = useGender();
  const { isFavorited, toggleFavorite } = useFavorites();

  // Fetch products and categories from API (with sessionStorage cache)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const productCacheKey = `gem_products_${genderFilter}`;
        const categoryCacheKey = "gem_categories";

        const cachedProducts  = getCached(productCacheKey);
        const cachedCategories = getCached(categoryCacheKey);

        const params = { status: "active" };
        if (genderFilter !== "all") {
          params.gender = genderFilter === "men" ? "male" : "female";
        }

        const [productsData, categoriesData] = await Promise.all([
          cachedProducts
            ? Promise.resolve(cachedProducts)
            : storefrontApi.products.getAll(params).then((data) => {
                setCache(productCacheKey, data);
                return data;
              }),
          cachedCategories
            ? Promise.resolve(cachedCategories)
            : storefrontApi.categories.getAll().then((data) => {
                setCache(categoryCacheKey, data);
                return data;
              }),
        ]);

        setAllProducts(productsData.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: (p.video_position === 0 && p.video_url) ? p.video_url : (p.image || (p.images?.[0]?.image_url) || p.video_url || ""),
          video_url: p.video_url || null,
          rating: 5.0,
          inStock: p.stock > 0,
          category: p.category_name?.toLowerCase() || "",
          category_id: p.category_id,
          gender: p.gender === "unisex" ? "unisex" : (p.gender === "male" ? "men" : "women"),
        })));
        setCategories(categoriesData || []);
      } catch (e) {
        console.error("Failed to fetch products/categories:", e);
        setAllProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    setVisibleCount(ITEMS_PER_PAGE);
  }, [genderFilter]);


  const categoryNames = ["all", ...categories.map((c) => c.name.toLowerCase())];



  const inStockCount = allProducts.filter((p) => p.inStock).length;
  const outOfStockCount = allProducts.filter((p) => !p.inStock).length;

  const handleApplyPriceFilter = () => {
    setAppliedPriceRange(pendingPriceRange);
    setAppliedPriceMin(pendingPriceMin);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleClearPriceFilter = () => {
    setPendingPriceRange(PRICE_MAX);
    setAppliedPriceRange(PRICE_MAX);
    setPendingPriceMin(0);
    setAppliedPriceMin(0);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      if (selectedType !== "all" && p.category !== selectedType) return false;
      if (inStockOnly && !p.inStock) return false;
      if (outOfStockOnly && p.inStock) return false;
      if (p.price < appliedPriceMin || p.price > appliedPriceRange) return false;
      return true;
    });
  }, [allProducts, selectedType, inStockOnly, outOfStockOnly, appliedPriceRange, appliedPriceMin]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleShowMore = () => {
    const prevCount = visibleCount;
    const nextCount = Math.min(prevCount + ITEMS_PER_PAGE, filtered.length);
    const revealed = new Set();
    for (let i = prevCount; i < nextCount; i++) {
      revealed.add(i);
    }
    setNewlyRevealed(revealed);
    setVisibleCount(nextCount);
    setTimeout(() => setNewlyRevealed(new Set()), 800);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  return (
    <HelmetProvider>
      <Helmet>
        <title>Shop All Jewelry | Gems Ore Nigeria</title>
        <meta name="description" content="Browse our full collection of premium jewelry — watches, rings, necklaces, earrings & bracelets. Shop online at Gems Ore Nigeria." />
      </Helmet>

      <Navbar dark={false} />

      <div className="bg-white min-h-screen">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-8 mt-28">
          {/* Back Button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 mb-6 text-[rgba(88,57,49,1)] hover:text-[rgba(68,68,68,1)] transition-colors duration-200 group"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-200 group-hover:-translate-x-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m0 0l7 7m-7-7l7-7" />
            </svg>
            <span className="text-sm font-medium">Back to Home</span>
          </button>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex items-center gap-2 mb-6 p-2 rounded-lg bg-[rgba(88,57,49,0.1)] text-[rgba(88,57,49,1)] text-sm font-medium"
          >
<img className="h-10 w-10" src={filter} alt="filter" />
          </button>

          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className={`lg:block lg:w-[260px] shrink-0 ${sidebarOpen ? "fixed inset-0 z-50 bg-black/50 lg:static lg:bg-transparent" : "hidden"}`}>
              {sidebarOpen && (
                <div className="absolute inset-0 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
              )}

              <div className={`${sidebarOpen ? "absolute left-0 top-0 h-full w-[280px] bg-white p-6 overflow-y-auto z-10 shadow-2xl" : ""} lg:static lg:shadow-none lg:p-0 space-y-8`}>
                {sidebarOpen && (
                  <button onClick={() => setSidebarOpen(false)} className="lg:hidden mb-4 text-gray-500 hover:text-gray-800">
                    <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
                      <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                )}

                {/* Gender Filter */}
                <div>
                  <h2 className="text-sm font-bold text-[rgba(68,68,68,1)] border-b-2 pb-6 mb-3 uppercase tracking-wider">CATEGORIES</h2>
                  <div className="flex flex-col gap-2">
                    {["all", "men", "women"].map((g) => (
                      <button
                        key={g}
                        onClick={() => { setGenderFilter(g); setSidebarOpen(false); }}
                        className={`text-left text-sm py-1.5 px-3 transition-colors duration-200 capitalize ${
                          genderFilter === g
                            ? "border-l-2 border-[rgba(217,176,62,1)] text-black"
                            : "text-gray-600 hover:bg-[rgba(88,57,49,0.1)]"
                        }`}
                      >
                        {g === "all" ? "All" : g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h2 className="text-sm font-bold text-[rgba(68,68,68,1)] border-b-2 pb-6 mb-3 uppercase tracking-wider">Product</h2>
                  <div className="flex flex-col gap-2">
                    {categoryNames.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => { setSelectedType(cat); setSidebarOpen(false); }}
                        className={`text-left text-sm py-1.5 px-3 transition-colors duration-200 capitalize ${
                          selectedType === cat
                            ? "border-l-2 border-[rgba(217,176,62,1)] text-black"
                            : "text-gray-600 hover:bg-[rgba(88,57,49,0.1)]"
                        }`}
                      >
                        {cat === "all" ? "All" : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h2 className="text-sm font-bold text-[rgba(68,68,68,1)]  border-b-2 pb-6 mb-3 uppercase tracking-wider">Availability</h2>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inStockOnly}
                        onChange={(e) => { setInStockOnly(e.target.checked); setOutOfStockOnly(false); }}
                        className="w-4 h-4 rounded accent-[rgba(88,57,49,1)]"
                      />
                      In stock ({inStockCount})
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={outOfStockOnly}
                        onChange={(e) => { setOutOfStockOnly(e.target.checked); setInStockOnly(false); }}
                        className="w-4 h-4 rounded accent-[rgba(88,57,49,1)]"
                      />
                      Out of stock ({outOfStockCount})
                    </label>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <h2 className="text-sm font-bold text-[rgba(68,68,68,1)] border-b-2 pb-6 mb-3 uppercase tracking-wider">Price</h2>
                  <div className="relative w-full h-8 mt-2">
                    {/* Track background */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[4px] rounded-full bg-gray-200" />
                    {/* Active range fill */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 h-[4px] rounded-full"
                      style={{
                        backgroundColor: 'rgba(88,57,49,1)',
                        left: `${(pendingPriceMin / PRICE_MAX) * 100}%`,
                        right: `${100 - (pendingPriceRange / PRICE_MAX) * 100}%`,
                      }}
                    />
                    {/* Min handle */}
                    <input
                      type="range"
                      min="0"
                      max={PRICE_MAX}
                      value={pendingPriceMin}
                      onChange={(e) => {
                        const v = Math.min(Number(e.target.value), pendingPriceRange - 1000);
                        setPendingPriceMin(v);
                      }}
                      className="absolute w-full top-0 h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[rgba(88,57,49,1)] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[rgba(88,57,49,1)] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
                      style={{ zIndex: pendingPriceMin > PRICE_MAX * 0.5 ? 5 : 3 }}
                    />
                    {/* Max handle */}
                    <input
                      type="range"
                      min="0"
                      max={PRICE_MAX}
                      value={pendingPriceRange}
                      onChange={(e) => {
                        const v = Math.max(Number(e.target.value), pendingPriceMin + 1000);
                        setPendingPriceRange(v);
                      }}
                      className="absolute w-full top-0 h-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[rgba(88,57,49,1)] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[rgba(88,57,49,1)] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
                      style={{ zIndex: pendingPriceMin > PRICE_MAX * 0.5 ? 3 : 5 }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Min: {formatPrice(pendingPriceMin)}</span>
                    <span>Max: {formatPrice(pendingPriceRange)}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleApplyPriceFilter}
                      className="flex-1 py-2 rounded-lg text-white text-xs font-medium transition-all duration-300 cursor-pointer hover:opacity-90"
                      style={{ backgroundColor: "rgba(68, 68, 68, 1)" }}
                    >
                      Apply Filter
                    </button>
                    <button
                      onClick={handleClearPriceFilter}
                      className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-all duration-300 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Product Grid */}
            <main className="flex-1">
      <div className="text-start mb-5">
            <h1 className="text-[rgba(68,68,68,1)] lg:text-2xl border-b-2 pb-4 text-2xl font-normal">COLLECTIONS</h1>

            <p className="text-gray-400 lg:text-lg text-sm py-4 font-light">All Product</p>
          </div>

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="rounded-lg overflow-hidden shadow-sm animate-pulse">
                      <div className="bg-gray-200 aspect-[3/4]" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {visible.map((product, index) => {
                    const isNewlyRevealed = newlyRevealed.has(index);
                    const staggerDelay = isNewlyRevealed ? (index % ITEMS_PER_PAGE) * 80 : 0;
                    return (
                      <Link
                        to={`/product/${product.id}`}
                        key={`${product.id}-${index}`}
                        className={`group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 block no-underline ${
                          isNewlyRevealed ? "animate-slide-up" : ""
                        }`}
                        style={isNewlyRevealed ? { animationDelay: `${staggerDelay}ms` } : {}}
                      >
                        <div className="relative overflow-hidden aspect-[3/4]">
                          {isVideoUrl(product.image) ? (
                            <video src={product.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" autoPlay loop muted playsInline />
                          ) : product.image ? (
                          <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : null}
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300"></div>
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(product); }}
                            className="flex items-center gap-1 sm:gap-2 absolute top-2 sm:top-3 right-2 sm:right-3 bg-transparent border border-white hover:bg-primary hover:text-white text-white text-[10px] sm:text-xs font-light px-2 sm:px-4 py-1.5 sm:py-3 rounded-md sm:rounded-lg transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
                          >
                            <img className="h-3.5 sm:h-5 w-3.5 sm:w-5" src={icon2} alt="" />
                            <span className="hidden sm:inline">Shop Now</span>
                            <span className="sm:hidden">Shop</span>
                          </button>
                          {!product.inStock && (
                            <img src={stock} alt="Out of Stock" className="absolute top-0 left-2 sm:left-3 w-[50px] sm:w-[80px] h-auto" />
                          )}
                          <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3">
                            <HeartIcon filled={isFavorited(product.id)} onClick={() => toggleFavorite(product.id)} />
                          </div>
                        </div>
                        <div className="p-2 sm:p-4 space-y-1 sm:space-y-2">
                          <p className="text-[rgba(68,68,68,1)] text-xs sm:text-sm md:text-xl font-medium line-clamp-1">{product.name}</p>
                          <StarRating rating={product.rating} />
                          <p className="text-[rgba(68,68,68,1)] text-sm sm:text-base font-bold">{formatPrice(product.price)}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Empty State */}
              {!loading && visible.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="mt-4 text-lg">No products found</p>
                  <p className="text-sm">Try adjusting your filters</p>
                </div>
              )}

              {/* Show More / Show Less */}
              <div className="flex justify-center gap-4 mt-10">
                {hasMore && (
                  <button
                    onClick={handleShowMore}
                    className="px-8 py-3 border-2 border-dashed border-[rgba(88,57,49,1)] text-[rgba(88,57,49,1)] rounded-lg hover:bg-[rgba(88,57,49,1)] hover:text-white transition-colors duration-300 font-medium"
                  >
                    Show More
                  </button>
                )}
                {visibleCount > ITEMS_PER_PAGE && (
                  <button
                    onClick={() => { setVisibleCount(ITEMS_PER_PAGE); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="px-8 py-3 border-2 border-dashed border-gray-400 text-gray-500 rounded-lg hover:bg-gray-500 hover:text-white transition-colors duration-300 font-medium"
                  >
                    Show Less
                  </button>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>

      <Footer />
    </HelmetProvider>
  );
};

export default ProductPage;