import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/cartContext";
import { useGender } from "../contexts/genderContext";
import { bestSellerProducts, formatPrice } from "../data/products";

import icon2 from "../assets/icon2.png";
import MobileSwiper from "./MobileSwiper";

const ITEMS_PER_PAGE = 6;

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

const BestSellers = () => {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [favorites, setFavorites] = useState(new Set());
  const [newlyRevealed, setNewlyRevealed] = useState(new Set());
  const { addToCart } = useCart();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const { gender } = useGender();
  const genderFiltered = bestSellerProducts.filter((p) => p.gender === gender);
  const visible = genderFiltered.slice(0, visibleCount);
  const hasMore = visibleCount < genderFiltered.length;

  const toggleFavorite = (productId) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleShowMore = () => {
    const prevCount = visibleCount;
    const nextCount = Math.min(prevCount + ITEMS_PER_PAGE, genderFiltered.length);
    const revealed = new Set();
    for (let i = prevCount; i < nextCount; i++) {
      revealed.add(i);
    }
    setNewlyRevealed(revealed);
    setVisibleCount(nextCount);
    setTimeout(() => setNewlyRevealed(new Set()), 800);
  };

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

        {/* Product Grid / Mobile Swiper */}
        {isMobile ? (
          <MobileSwiper
            items={visible}
            autoPlay={0}
            renderItem={(product) => (
              <Link
                to={`/product/${product.id}`}
                key={product.id}
                className="group rounded-lg overflow-hidden shadow-sm block no-underline"
              >
                <div className="relative overflow-hidden" style={{ height: "380px" }}>
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
                    className="flex items-center gap-2 absolute top-3 right-3 bg-transparent border border-white hover:bg-[rgba(88,57,49,1)] hover:text-white text-white text-xs font-light px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer"
                  >
                    <img className="h-5 w-5" src={icon2} alt="" />
                    Shop Now
                  </button>
                  <div className="absolute bottom-3 right-3">
                    <HeartIcon filled={favorites.has(product.id)} onClick={() => toggleFavorite(product.id)} />
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-[rgba(68,68,68,1)] text-sm font-medium">{product.name}</p>
                  <StarRating rating={product.rating} />
                  <p className="text-[rgba(68,68,68,1)] text-base font-bold">₦{formatPrice(product.price)}</p>
                </div>
              </Link>
            )}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <div className="relative overflow-hidden" style={{ height: "380px" }}>
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
                      className="flex items-center gap-2 absolute top-3 right-3 bg-transparent border border-white hover:bg-[rgba(88,57,49,1)] hover:text-white text-white text-xs font-light px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <img className="h-5 w-5" src={icon2} alt="" />
                      Shop Now
                    </button>
                    <div className="absolute bottom-3 right-3">
                      <HeartIcon filled={favorites.has(product.id)} onClick={() => toggleFavorite(product.id)} />
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-[rgba(68,68,68,1)] text-sm md:text-xl font-medium">{product.name}</p>
                    <StarRating rating={product.rating} />
                    <p className="text-[rgba(68,68,68,1)] text-base font-bold">₦{formatPrice(product.price)}</p>
                  </div>
                </Link>
              );
            })}
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
