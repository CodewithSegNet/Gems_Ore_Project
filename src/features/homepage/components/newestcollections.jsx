import { useState, useRef, useEffect } from "react";
import { useGender } from "../../../contexts/genderContext";
import storefrontApi from "../../../services/api";
import { getCached, setCache } from "../utils/cache";
import { useCurrency } from "../../../contexts/CurrencyContext";
import ProductCard from "../../../components/ProductCard";

const filterIcon = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113257/gems_ore/filter.png";
const news = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113261/gems_ore/foundation.png";

const ITEMS_PER_PAGE = 6;

const NewestCollections = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [newlyRevealed, setNewlyRevealed] = useState(new Set());
  const [filterOpen, setFilterOpen] = useState(false);

  // Applied filter state (what's actually active)
  const [appliedPriceRange, setAppliedPriceRange] = useState(20000000);
  const [appliedPriceMin, setAppliedPriceMin] = useState(0);
  const [appliedInStockOnly, setAppliedInStockOnly] = useState(false);
  const [appliedOutOfStockOnly, setAppliedOutOfStockOnly] = useState(false);

  // Pending filter state (what the user is adjusting in the dropdown)
  const [pendingPriceRange, setPendingPriceRange] = useState(20000000);
  const [pendingPriceMin, setPendingPriceMin] = useState(0);
  const [pendingInStockOnly, setPendingInStockOnly] = useState(false);
  const [pendingOutOfStockOnly, setPendingOutOfStockOnly] = useState(false);
  const PRICE_MAX = 20000000;

  const filterRef = useRef(null);
  const { gender } = useGender();
  const { formatPrice } = useCurrency();
  // Fetch newest collection products from API (with sessionStorage cache)
  useEffect(() => {
    const fetchNewest = async () => {
      setLoading(true);
      try {
        const cacheKey = `gem_newest_${gender}`;
        const cached = getCached(cacheKey);

        let rawData;
        if (cached) {
          rawData = cached;
        } else {
          rawData = await storefrontApi.products.getAll({
            is_new_collection: "true",
            gender: gender === "men" ? "male" : "female",
            status: "active",
          });
          setCache(cacheKey, rawData);
        }

        setProducts(rawData.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: (p.video_position === 0 && p.video_url) ? p.video_url : (p.image || (p.images?.[0]?.image_url) || p.video_url || ""),
          video_url: p.video_url || null,
          video_position: p.video_position,
          rating: 5.0,
          inStock: p.stock > 0,
          category: p.category_name?.toLowerCase() || "",
          gender: p.gender === "unisex" ? gender : (p.gender === "male" ? "men" : "women"),
        })));
      } catch (e) {
        console.error("Failed to fetch newest collections:", e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNewest();
    setVisibleCount(ITEMS_PER_PAGE);
  }, [gender]);


  const inStockCount = products.filter((p) => p.inStock).length;
  const outOfStockCount = products.filter((p) => !p.inStock).length;

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleApplyFilter = () => {
    setAppliedPriceRange(pendingPriceRange);
    setAppliedPriceMin(pendingPriceMin);
    setAppliedInStockOnly(pendingInStockOnly);
    setAppliedOutOfStockOnly(pendingOutOfStockOnly);
    setVisibleCount(ITEMS_PER_PAGE);
    setFilterOpen(false);
  };

  const handleClearFilter = () => {
    setPendingPriceRange(PRICE_MAX);
    setPendingPriceMin(0);
    setPendingInStockOnly(false);
    setPendingOutOfStockOnly(false);
    setAppliedPriceRange(PRICE_MAX);
    setAppliedPriceMin(0);
    setAppliedInStockOnly(false);
    setAppliedOutOfStockOnly(false);
    setVisibleCount(ITEMS_PER_PAGE);
    setFilterOpen(false);
  };

  // Filter products using applied values
  const filteredProducts = products.filter((p) => {
    if (p.price < appliedPriceMin || p.price > appliedPriceRange) return false;
    if (appliedInStockOnly && !p.inStock) return false;
    if (appliedOutOfStockOnly && p.inStock) return false;
    return true;
  });

  const visible = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;



  const handleShowMore = () => {
    const prevCount = visibleCount;
    const nextCount = Math.min(prevCount + ITEMS_PER_PAGE, filteredProducts.length);
    const revealed = new Set();
    for (let i = prevCount; i < nextCount; i++) {
      revealed.add(i);
    }
    setNewlyRevealed(revealed);
    setVisibleCount(nextCount);
    setTimeout(() => setNewlyRevealed(new Set()), 800);
  };

  if (loading) {
    return (
      <section className="max-w-screen-2xl mx-auto my-[64px]">
        <div className="mx-4">
          <div className="flex items-center justify-between mb-[34px]">
            <div className="text-start">
              <div className="flex items-center gap-2">
                <h1 className="text-[rgba(68,68,68,1)] lg:text-4xl text-2xl font-normal">Newest Collections</h1>
                <img className="h-14 w-14" src={news} alt="" />
              </div>
              <p className="text-gray-600 lg:text-xl text-sm font-light">Discover our latest expressions of brilliance</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden shadow-sm animate-pulse">
                <div className="bg-gray-200" style={{ height: "380px" }} />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="max-w-screen-2xl mx-auto my-[64px]">
      <div className="mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-[34px]">
          <div className="text-start">
            <div className="flex items-center gap-2">
     <h1 className="text-[rgba(68,68,68,1)] lg:text-4xl text-2xl font-normal">
              Newest Collections
            </h1>
              <img className="h-14 w-14" src={news} alt="" />
            </div>
       
            <p className="text-gray-600 lg:text-xl text-sm font-light">
              Discover our latest expressions of brilliance
            </p>
          </div>

          {/* Filter Icon */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="cursor-pointer hover:opacity-80 transition-opacity duration-200"
            >
              <img src={filterIcon} alt="Filter" className="w-12 h-12" />
            </button>

            {/* Filter Dropdown */}
            {filterOpen && (
              <div
                className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg z-50"
                style={{
                  width: "338px",
                  padding: "16px",
                }}
              >
                <h3 className="text-sm font-bold text-[rgba(68,68,68,1)] mb-4">
                  Filter Products
                </h3>

                  <button
                    onClick={handleClearFilter}
                    className="w-full flex text-left items-end justify-end rounded-lg underline text-gray-600 text-sm font-light transition-all duration-300 cursor-pointer"
                  >
                    Clear Filter
                  </button>

                {/* Price Range */}
                <div className="mb-4">
                  <h4 className="text-xs font-light text-[rgba(68,68,68,1)] tracking-wider mb-2">
                    By Price
                  </h4>
                  <div className="relative w-full h-8 mt-1">
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
                </div>

                {/* Availability */}
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-[rgba(68,68,68,1)] uppercase tracking-wider mb-2">
                    Availability
                  </h4>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pendingInStockOnly}
                        onChange={(e) => {
                          setPendingInStockOnly(e.target.checked);
                          setPendingOutOfStockOnly(false);
                        }}
                        className="w-4 h-4 rounded accent-[rgba(88,57,49,1)]"
                      />
                      In stock ({inStockCount})
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pendingOutOfStockOnly}
                        onChange={(e) => {
                          setPendingOutOfStockOnly(e.target.checked);
                          setPendingInStockOnly(false);
                        }}
                        className="w-4 h-4 rounded accent-[rgba(88,57,49,1)]"
                      />
                      Out of stock ({outOfStockCount})
                    </label>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleApplyFilter}
                    className="flex-1 py-3 rounded-lg text-black text-sm border border-[rgba(68,68,68,1)] font-medium transition-all duration-300 cursor-pointer hover:opacity-90"
                    style={{ backgroundColor: "transparent" }}
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((product, index) => {
            const isNewlyRevealed = newlyRevealed.has(index);
            const staggerDelay = isNewlyRevealed ? (index % ITEMS_PER_PAGE) * 80 : 0;

            return (
              <ProductCard
                key={product.id}
                product={product}
                formatPrice={formatPrice}
                isNewlyRevealed={isNewlyRevealed}
                staggerDelay={staggerDelay}
                height="380px"
              />
            );
          })}
        </div>

        {/* Empty State */}
        {visible.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="mt-4 text-lg">No products match your filters</p>
            <p className="text-sm">Try adjusting your price range or availability</p>
          </div>
        )}

        {/* Show More / Show Less */}
        <div className="flex justify-center gap-4 mt-10">
          {hasMore && (
            <button
              onClick={handleShowMore}
              className="px-8 py-3 border-2 border-[rgba(88,57,49,1)] text-[rgba(88,57,49,1)] rounded-lg hover:bg-[rgba(88,57,49,1)] hover:text-white transition-colors duration-300 font-medium"
            >
              Show More
            </button>
          )}
          {!hasMore && visibleCount > ITEMS_PER_PAGE && (
            <button
              onClick={() => setVisibleCount(ITEMS_PER_PAGE)}
              className="px-8 py-3 border-2 border-dashed border-gray-400 text-gray-500 rounded-lg hover:bg-gray-500 hover:text-white transition-colors duration-300 font-medium"
            >
              Show Less
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewestCollections;