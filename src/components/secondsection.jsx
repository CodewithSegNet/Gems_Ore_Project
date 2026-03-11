import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useGender } from "../contexts/genderContext";
import watches from "../assets/watches.avif";
import rings from "../assets/rings.avif";
import earringsImg from "../assets/earrings.avif";
import necklace from "../assets/neckless.avif";
import bracelet from "../assets/bracklet.avif";
import maleCol1 from "../assets/male_collection_1.png";
import maleCol2 from "../assets/male_collection_2.png";
import maleCol3 from "../assets/male_collection_3.png";
import maleCol4 from "../assets/male_collection_4.png";
import maleCol5 from "../assets/male_collection_5.png";
import maleCol6 from "../assets/male_collection_6.png";

const womenPages = [
  [
    { name: "Watches", image: watches, category: "watches" },
    { name: "Necklaces", image: necklace, category: "necklaces" },
    { name: "Rings", image: rings, category: "rings" },
  ],
  [
    { name: "Earrings", image: earringsImg, category: "earrings" },
    { name: "Bracelets", image: bracelet, category: "bracelets" },
    { name: "Rings", image: rings, category: "rings" },
  ],
];

const menPages = [
  [
    { name: "Chains", image: maleCol1, category: "necklaces" },
    { name: "Watches", image: maleCol2, category: "watches" },
    { name: "Earrings", image: maleCol3, category: "earrings" },
  ],
  [
    { name: "Pendants", image: maleCol4, category: "necklaces" },
    { name: "Rings", image: maleCol5, category: "rings" },
    { name: "Anklets", image: maleCol6, category: "bracelets" },
  ],
];

const SecondSection = () => {
  const { gender } = useGender();
  const pages = gender === "men" ? menPages : womenPages;
  const [activePage, setActivePage] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [mobileSlide, setMobileSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const sliderRef = useRef(null);
  const trackRef = useRef(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const currentDragOffset = useRef(0);
  const isHorizontal = useRef(null);
  const mobileSlideRef = useRef(0);
  const [showGesture, setShowGesture] = useState(false);
  const sectionRef = useRef(null);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Show gesture when section scrolls into view on mobile
  useEffect(() => {
    if (!isMobile || !sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowGesture(true);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [isMobile]);

  // Auto-hide gesture after 3.5 seconds
  useEffect(() => {
    if (showGesture) {
      const timer = setTimeout(() => setShowGesture(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [showGesture]);

  // Auto-slide on mobile every 4 seconds
  useEffect(() => {
    if (!isMobile) return;
    const total = pages[0].length + pages[1].length;
    const interval = setInterval(() => {
      setMobileSlide((prev) => {
        const next = (prev + 1) % total;
        mobileSlideRef.current = next;
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [isMobile]);

  // Reset mobile slide when page switches and re-trigger gesture
  useEffect(() => {
    setMobileSlide(0);
    mobileSlideRef.current = 0;
    if (isMobile) setShowGesture(true);
  }, [activePage]);

  // Reset slide when gender changes
  useEffect(() => {
    setMobileSlide(0);
    mobileSlideRef.current = 0;
    setActivePage(0);
    setAnimKey((prev) => prev + 1);
  }, [gender]);

  const handlePageSwitch = (page) => {
    if (page === activePage) return;
    setActivePage(page);
    setAnimKey((prev) => prev + 1);
  };

  const items = pages[activePage];
  const allMobileItems = [...pages[0], ...pages[1]];

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    currentDragOffset.current = 0;
    isHorizontal.current = null;
  };

  const handleTouchMove = (e) => {
    const diffX = e.touches[0].clientX - touchStartX.current;
    const diffY = e.touches[0].clientY - touchStartY.current;

    if (isHorizontal.current === null && (Math.abs(diffX) > 5 || Math.abs(diffY) > 5)) {
      isHorizontal.current = Math.abs(diffX) > Math.abs(diffY);
    }

    if (!isHorizontal.current) return;

    e.preventDefault();
    currentDragOffset.current = diffX;

    // Move the track directly via DOM — no React re-render needed
    if (trackRef.current) {
      const base = -(mobileSlideRef.current * 100);
      trackRef.current.style.transition = "none";
      trackRef.current.style.transform = `translateX(calc(${base}% + ${diffX}px))`;
    }
  };

  const handleTouchEnd = () => {
    if (!isHorizontal.current) return;

    const offset = currentDragOffset.current;
    const containerWidth = sliderRef.current?.offsetWidth || 300;
    const elapsed = Date.now() - touchStartTime.current;
    const velocity = Math.abs(offset) / elapsed;
    const total = allMobileItems.length;
    const shouldChange = Math.abs(offset) > containerWidth * 0.2 || velocity > 0.3;

    let next = mobileSlideRef.current;
    if (shouldChange) {
      if (offset < 0 && next < total - 1) next += 1;
      else if (offset > 0 && next > 0) next -= 1;
    }

    mobileSlideRef.current = next;

    // Animate to final position via DOM
    if (trackRef.current) {
      trackRef.current.style.transition = "transform 380ms cubic-bezier(0.25, 0.1, 0.25, 1)";
      trackRef.current.style.transform = `translateX(-${next * 100}%)`;
    }

    // Sync React state for dots
    setMobileSlide(next);
    if (next !== mobileSlideRef.current - offset) setShowGesture(false);
    isHorizontal.current = null;
    currentDragOffset.current = 0;
  };

  // Register touch listeners with passive:false so we can call preventDefault
  useEffect(() => {
    const el = sliderRef.current;
    if (!el || !isMobile) return;
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobile, mobileSlide]);

  // Sync track position when slide changes from dots or auto-slide
  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transition = "transform 380ms cubic-bezier(0.25, 0.1, 0.25, 1)";
      trackRef.current.style.transform = `translateX(-${mobileSlide * 100}%)`;
    }
  }, [mobileSlide]);

  const CollectionCard = ({ item, i, noAnim = false }) => (
    <div
      key={`${animKey}-${i}`}
      className={`relative rounded-lg overflow-hidden group cursor-pointer shrink-0 w-full ${noAnim ? "" : "animate-card-rise"}`}
      style={{
        height: "clamp(400px, 50vw, 792px)",
        animationDelay: noAnim ? "0ms" : `${i * 150}ms`,
        animationFillMode: "both",
      }}
    >
      <img
        src={item.image}
        alt={item.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300"></div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
        <span className="text-white text-3xl md:text-4xl font-thin">{item.name}</span>
        <Link
          to={`/products?category=${item.category}`}
          className="border px-6 py-3 text-sm hover:bg-primary duration-300 transition-colors rounded-md border-white text-white bg-transparent"
        >
          View Collection
        </Link>
      </div>
    </div>
  );

  return (
    <section ref={sectionRef} className="max-w-screen-2xl mx-auto my-[64px]">
      <div className="mx-4">
        {/* Header */}
        <div className="flex items-center w-full justify-between mb-[34px]">
          <div className="text-start">
            <h1 className="text-[rgba(68,68,68,1)] lg:text-4xl text-2xl font-normal">Our Collections</h1>
            <p className="text-gray-600 lg:text-xl text-sm font-light">Curated for discerning tastes</p>
          </div>

          {/* Pagination — desktop only */}
          {!isMobile && (
            <div className="flex items-center gap-4">
              {[0, 1].map((page) => {
                const isActive = activePage === page;
                const circumference = 2 * Math.PI * 22;
                const segment = circumference / 8;
                const dash = segment * 0.6;
                const gap = segment * 0.4;

                return (
                  <button
                    key={page}
                    onClick={() => handlePageSwitch(page)}
                    className="relative w-[52px] h-[52px] flex items-center justify-center cursor-pointer transition-all duration-300"
                  >
                    {isActive && (
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 52 52">
                        <circle
                          cx="26" cy="26" r="22"
                          fill="none"
                          stroke="rgba(88,57,49,1)"
                          strokeWidth="2.5"
                          strokeDasharray={`${dash} ${gap}`}
                          strokeLinecap="round"
                          transform="rotate(-90 26 26)"
                        />
                      </svg>
                    )}
                    <span className={`w-[40px] h-[40px] rounded-full flex items-center justify-center transition-all duration-300 text-sm font-bold ${
                      isActive ? "bg-white text-black" : "bg-white text-[rgba(88,57,49,1)]"
                    }`}>
                      {page + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop: Grid | Mobile: Slider */}
        {!isMobile ? (
          /* Desktop Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, i) => (
              <CollectionCard key={`${animKey}-${i}`} item={item} i={i} />
            ))}
          </div>
        ) : (
          /* Mobile Touch Slider — all items combined */
          <div className="relative">
            <div
              ref={sliderRef}
              className="overflow-hidden rounded-lg"
            >
              <div
                ref={trackRef}
                className="flex"
                style={{
                  transform: `translateX(-${mobileSlide * 100}%)`,
                  transition: "transform 380ms cubic-bezier(0.25, 0.1, 0.25, 1)",
                  willChange: "transform",
                }}
              >
                {allMobileItems.map((item, i) => (
                  <div key={i} className="w-full shrink-0 px-1">
                    <CollectionCard item={item} i={i} noAnim={true} />
                  </div>
                ))}
              </div>
            </div>

            {/* Slide Indicators (dots) */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {allMobileItems.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setMobileSlide(i); setShowGesture(false); }}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    mobileSlide === i
                      ? "w-6 h-2 bg-[rgba(88,57,49,1)]"
                      : "w-2 h-2 bg-gray-300"
                  }`}
                />
              ))}
            </div>

            {/* Swipe Gesture Hint */}
            {showGesture && (
              <div className="absolute inset-0 flex items-end justify-center pb-16 pointer-events-none z-20">
                <div className="animate-gesture-hint flex flex-col items-center gap-3">
                  <div className="animate-swipe-hand">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="white" opacity="0.9">
                      <path d="M20 16v-6a2 2 0 00-4 0v-1a2 2 0 00-4 0v-1a2 2 0 00-4 0V5a2 2 0 00-4 0v10.5c0 .28.11.55.29.75l3.42 3.75H20v-4z"/>
                      <path d="M18 16h2v4h-2z" fill="rgba(255,255,255,0.4)"/>
                    </svg>
                  </div>
                  <span className="text-white text-sm font-medium bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-sm">
                    Swipe to explore
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default SecondSection;