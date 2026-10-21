import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useGender } from "../../../contexts/genderContext";
import storefrontApi from "../../../services/api";
import { getCached, setCache } from "../utils/cache";
import { useCurrency } from "../../../contexts/CurrencyContext";
import ProductCard from "../../../components/ProductCard";

const ITEMS_PER_PAGE = 6;

const BestSellers = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [newlyRevealed, setNewlyRevealed] = useState(new Set());
  const { formatPrice } = useCurrency();
  const { gender } = useGender();

  // Fetch best seller products from API (with sessionStorage cache)
  useEffect(() => {
    const fetchBestSellers = async () => {
      setLoading(true);
      try {
        const cacheKey = `gem_bestsellers_${gender}`;
        const cached = getCached(cacheKey);

        let rawData;
        if (cached) {
          rawData = cached;
        } else {
          rawData = await storefrontApi.products.getAll({
            is_best_seller: "true",
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
        console.error("Failed to fetch best sellers:", e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBestSellers();
    setVisibleCount(ITEMS_PER_PAGE);
  }, [gender]);


  const visible = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;



  const handleShowMore = () => {
    const prevCount = visibleCount;
    const nextCount = Math.min(prevCount + ITEMS_PER_PAGE, products.length);
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
              <h1 className="text-[rgba(68,68,68,1)] lg:text-4xl text-2xl font-normal">Best Sellers</h1>
              <p className="text-gray-600 lg:text-xl text-sm font-light">Client favorites, crafted to captivate</p>
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
            <h1 className="text-[rgba(68,68,68,1)] lg:text-4xl text-2xl font-normal">
              Best Sellers
            </h1>
            <p className="text-gray-600 lg:text-xl text-sm font-light">
              Client favorites, crafted to captivate
            </p>
          </div>
          <Link
            to="/products"
            className="text-[rgba(88,57,49,1)] hover:text-[rgba(68,68,68,1)] text-sm lg:text-base font-medium transition-colors duration-200 underline underline-offset-4"
          >
            View All
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((product, index) => {
            const isNewlyRevealed = newlyRevealed.has(index);
            const staggerDelay = isNewlyRevealed ? (index % ITEMS_PER_PAGE) * 80 : 0;
            return (
              <ProductCard
                key={`${product.id}-${index}`}
                product={product}
                formatPrice={formatPrice}
                isNewlyRevealed={isNewlyRevealed}
                staggerDelay={staggerDelay}
                height="380px"
              />
            );
          })}
        </div>

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

export default BestSellers;