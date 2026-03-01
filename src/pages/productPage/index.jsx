import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useCart } from "../../contexts/cartContext";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

import watches from "../../assets/watches.avif";
import rings from "../../assets/rings.avif";
import earringsImg from "../../assets/earrings.avif";
import necklace from "../../assets/neckless.avif";
import bracelet from "../../assets/bracklet.avif";
import icon2 from "../../assets/icon2.png";
import stock from "../../assets/stock.png";


// Mock product data — will be replaced by dashboard/API data later
// Each category has 20 items = 5 rows of 4 columns
const watchNames = ["Classic Gold Watch", "Luxury Chronograph", "Dress Watch", "Smart Watch", "Diver Watch", "Aviator Watch", "Skeleton Watch", "Rose Gold Watch", "Minimalist Watch", "Sport Watch", "Diamond Watch", "Platinum Watch", "Vintage Watch", "Automatic Watch", "Moonphase Watch", "Tourbillon Watch", "Field Watch", "Racing Watch", "GMT Watch", "Pilot Watch"];
const ringNames = ["Diamond Ring", "Engagement Ring", "Signet Ring", "Wedding Band", "Eternity Ring", "Solitaire Ring", "Cocktail Ring", "Stackable Ring", "Promise Ring", "Birthstone Ring", "Sapphire Ring", "Ruby Ring", "Emerald Ring", "Pearl Ring", "Halo Ring", "Vintage Ring", "Celtic Ring", "Infinity Ring", "Cluster Ring", "Dome Ring"];
const necklaceNames = ["Pearl Necklace", "Layered Necklace", "Choker Necklace", "Pendant Necklace", "Chain Necklace", "Lariat Necklace", "Bar Necklace", "Statement Necklace", "Tennis Necklace", "Charm Necklace", "Beaded Necklace", "Diamond Necklace", "Gold Chain", "Silver Chain", "Rope Necklace", "Box Chain", "Figaro Necklace", "Cuban Link", "Collar Necklace", "Bib Necklace"];
const earringNames = ["Silver Stud Earrings", "Drop Earrings", "Hoop Earrings", "Stud Earrings Gold", "Chandelier Earrings", "Dangle Earrings", "Huggie Earrings", "Clip-On Earrings", "Pearl Earrings", "Diamond Studs", "Threader Earrings", "Crawler Earrings", "Tassel Earrings", "Geometric Earrings", "Cuff Earrings", "Statement Earrings", "Lever-Back Earrings", "Ball Earrings", "Crystal Earrings", "Chain Earrings"];
const braceletNames = ["Gold Bracelet", "Tennis Bracelet", "Charm Bracelet", "Cuff Bracelet", "Bangle Bracelet", "Link Bracelet", "Chain Bracelet", "Beaded Bracelet", "Wrap Bracelet", "Hinged Bracelet", "Pearl Bracelet", "Diamond Bracelet", "Leather Bracelet", "Rope Bracelet", "Slider Bracelet", "ID Bracelet", "Station Bracelet", "Bar Bracelet", "Mesh Bracelet", "Stretch Bracelet"];

const generateProducts = () => {
  const products = [];
  let id = 1;
  const cats = [
    { names: watchNames, image: watches, category: "watches", gender: "men" },
    { names: ringNames, image: rings, category: "rings", gender: "women" },
    { names: necklaceNames, image: necklace, category: "necklaces", gender: "women" },
    { names: earringNames, image: earringsImg, category: "earrings", gender: "women" },
    { names: braceletNames, image: bracelet, category: "bracelets", gender: "women" },
  ];
  cats.forEach(({ names, image, category, gender }) => {
    names.forEach((name, i) => {
      products.push({
        id: id++,
        name,
        rating: 5.0,
        price: 650000,
        image,
        category,
        gender: i % 3 === 0 ? "men" : "women",
        inStock: i < 17,
      });
    });
  });
  return products;
};

const allProducts = generateProducts();

const categories = ["all", "men", "women"];
const productTypes = ["all", "watches", "rings", "necklaces", "earrings", "bracelets"];

const ITEMS_PER_PAGE = 20;

const formatPrice = (price) => {
  return new Intl.NumberFormat("en-NG").format(price);
};

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-1">
    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
    <h5 className="text-xs md:text-base font-light text-gray-500">Rating  <span className="text-gray-500 font-bold">{rating.toFixed(1)}</span></h5>
  </div>
);

const ProductPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialCategory = searchParams.get("category") || "all";

  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedType, setSelectedType] = useState(initialCategory);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [outOfStockOnly, setOutOfStockOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newlyRevealed, setNewlyRevealed] = useState(new Set());

  const { addToCart } = useCart();

  const inStockCount = allProducts.filter((p) => p.inStock).length;
  const outOfStockCount = allProducts.filter((p) => !p.inStock).length;

  const filtered = useMemo(() => {
    return allProducts.filter((p) => {
      if (selectedGender !== "all" && p.gender !== selectedGender) return false;
      if (selectedType !== "all" && p.category !== selectedType) return false;
      if (inStockOnly && !p.inStock) return false;
      if (outOfStockOnly && p.inStock) return false;
      return true;
    });
  }, [selectedGender, selectedType, inStockOnly, outOfStockOnly]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleShowMore = () => {
    const prevCount = visibleCount;
    const nextCount = Math.min(prevCount + ITEMS_PER_PAGE, filtered.length);
    // Mark newly revealed indices for staggered animation
    const revealed = new Set();
    for (let i = prevCount; i < nextCount; i++) {
      revealed.add(i);
    }
    setNewlyRevealed(revealed);
    setVisibleCount(nextCount);
    // Clear animation flags after animations complete
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

          {/* Page Title */}
          {/* <div className="mb-8">
            <h1 className="text-[rgba(68,68,68,1)] text-2xl lg:text-4xl font-normal">All Products</h1>
            <p className="text-gray-400 text-sm lg:text-xl font-light mt-1">{filtered.length} products</p>
          </div> */}

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex items-center gap-2 mb-6 px-4 py-2.5 rounded-lg bg-[rgba(88,57,49,0.1)] text-[rgba(88,57,49,1)] text-sm font-medium"
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
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

                {/* Collections Header */}
                <div>
                  <h2 className="text-sm font-bold text-[rgba(68,68,68,1)] border-b-2 pb-6 mb-3 uppercase tracking-wider">Categories</h2>
                  <div className="flex flex-col gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => { setSelectedGender(cat); setSidebarOpen(false); }}
                        className={`text-left text-sm py-1.5 px-3 transition-colors duration-200 capitalize ${
                          selectedGender === cat
                            ? "border-l-2 border-[rgba(217,176,62,1)] text-black"
                            : "text-gray-600 hover:bg-[rgba(88,57,49,0.1)]"
                        }`}
                      >
                        {cat === "all" ? "All" : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product Types */}
                <div>
                  <h2 className="text-sm font-bold text-[rgba(68,68,68,1)] border-b-2 pb-6 mb-3 uppercase tracking-wider">Products</h2>
                  <div className="flex flex-col gap-2">
                    {productTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => { setSelectedType(type); setSidebarOpen(false); }}
                        className={`text-left text-sm py-1.5 px-3 transition-colors duration-200 capitalize ${
                          selectedType === type
                            ? "border-l-2 border-[rgba(217,176,62,1)] text-black"
                            : "text-gray-600 hover:bg-[rgba(88,57,49,0.1)]"
                        }`}
                      >
                        {type === "all" ? "All" : type}
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
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>₦0</span>
                    <input
                      type="range"
                      min="0"
                      max="1000000000"
                      defaultValue="1000000000"
                      className="w-full accent-[rgba(88,57,49,1)]"
                    />
                    <span>₦1BN</span>
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


              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {visible.map((product, index) => {
                  const isNewlyRevealed = newlyRevealed.has(index);
                  const staggerDelay = isNewlyRevealed ? (index % ITEMS_PER_PAGE) * 80 : 0;

                  return (
                    <div
                      key={`${product.id}-${index}`}
                      className={`group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 ${
                        isNewlyRevealed ? "animate-slide-up" : ""
                      }`}
                      style={isNewlyRevealed ? { animationDelay: `${staggerDelay}ms` } : {}}
                    >
                      {/* Product Image */}
                      <div className="relative overflow-hidden" style={{ height: "380px" }}>
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Shop Now Button - always visible */}
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex items-center gap-2 absolute top-3 right-3 bg-transparent border border-white hover:bg-primary hover:text-white text-white text-xs font-light px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
                        >
                          <img className="h-5 w-5" src={icon2} alt="" />
                          Shop Now
                        </button>
                        {/* Out of stock badge */}
                        {!product.inStock && (
                          <img src={stock} alt="Out of Stock" className="absolute top-0 left-3 w-[80px] h-auto" />
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-4 space-y-2">
                        <p className="text-[rgba(68,68,68,1)] text-sm md:text-xl font-medium">{product.name}</p>
                        <StarRating rating={product.rating} />
                        <p className="text-[rgba(68,68,68,1)] text-base font-bold">₦{formatPrice(product.price)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty State */}
              {visible.length === 0 && (
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
