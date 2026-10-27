import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useGender } from "../../../contexts/genderContext";
import { useCustomRequest } from "../../../contexts/CustomRequestContext";
// ── Category icons ─────────────────────────────────────────────────────────
const watch = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113201/gems_ore/watch.png";
const ring = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113202/gems_ore/ring.png";
const necklace = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113203/gems_ore/necklace.png";
const earringsImg = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113205/gems_ore/earrings.png";
const bracelet = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113206/gems_ore/bracelet.png";
// ── Video sources ──────────────────────────────────────────────────────────
// HLS streams: sp_full_hd = full 1080p profile; q_auto:best = highest quality
// MP4 fallbacks: vc_h264,q_auto:best for maximum quality on non-iOS browsers
const backgroundVideoHls = "https://res.cloudinary.com/wruetqvx/video/upload/sp_full_hd,q_auto:best/v1792113306/gems_ore/video.m3u8";
const backgroundVideoMp4 = "https://res.cloudinary.com/wruetqvx/video/upload/vc_h264,q_auto:best/v1792113306/gems_ore/video.mp4";
const maleHls = "https://res.cloudinary.com/wruetqvx/video/upload/sp_full_hd,q_auto:best/v1792113306/gems_ore/male_video.m3u8";
const maleMp4 = "https://res.cloudinary.com/wruetqvx/video/upload/vc_h264,q_auto:best/v1792113306/gems_ore/male_video.mp4";
// ── Poster images ──────────────────────────────────────────────────────────
// so_0 = grab frame at 0s; q_auto:best,f_auto,w_1920 = max quality at full HD
const womenPoster = "https://res.cloudinary.com/wruetqvx/image/upload/so_0,q_auto:best,f_auto,w_1920/v1792113306/gems_ore/video.jpg";
const menPoster = "https://res.cloudinary.com/wruetqvx/image/upload/so_0,q_auto:best,f_auto,w_1920/v1792113306/gems_ore/male_video.jpg";

const Home = () => {
  const [btnHovered, setBtnHovered] = useState(false);
  const { gender } = useGender();
  const { isCategoryAvailable, openCustomModal } = useCustomRequest();
  const videoRef = useRef(null);
  const heroRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ctaRef.current && !ctaRef.current.contains(e.target)) {
        setBtnHovered(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Attempt to play the video — safe on iOS (muted + playsInline allows autoplay)
  const tryPlay = () => {
    if (!videoRef.current) return;
    const playPromise = videoRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay was prevented — video will stay paused (poster still shows)
      });
    }
  };

  useEffect(() => {
    let isVisible = true;

    // Pause video when scrolled out of view to save GPU cycles
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;
        isVisible = entry.isIntersecting;
        if (isVisible && !document.body.classList.contains("modal-open")) {
          tryPlay();
        } else {
          videoRef.current.pause();
        }
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    // Immediately pause when ANY modal or drawer is open
    const handleModalToggle = (e) => {
      if (!videoRef.current) return;
      const isOpen = e?.detail?.isOpen ?? document.body.classList.contains("modal-open");
      if (isOpen) {
        videoRef.current.pause();
      } else if (isVisible) {
        tryPlay();
      }
    };

    window.addEventListener("gems:modal-toggle", handleModalToggle);

    return () => {
      observer.disconnect();
      window.removeEventListener("gems:modal-toggle", handleModalToggle);
    };
  }, [gender]);

  // When gender changes, the video element is replaced — try to play the new one
  // Also set x-webkit-airplay as a real DOM attribute (not valid as a JSX prop)
  useEffect(() => {
    const t = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.setAttribute("x-webkit-airplay", "allow");
        videoRef.current.setAttribute("webkit-playsinline", "");
        tryPlay();
      }
    }, 100);
    return () => clearTimeout(t);
  }, [gender]);

  const handleCategoryClick = (e, categoryLabel) => {
    if (!isCategoryAvailable(categoryLabel)) {
      e.preventDefault();
      const formattedName = categoryLabel.charAt(0).toUpperCase() + categoryLabel.slice(1);
      openCustomModal({
        category: categoryLabel,
        categoryName: formattedName,
        requestType: "category_custom",
      });
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section ref={heroRef} className="relative w-full h-[90vh] overflow-hidden">
        {/* Background Video */}
        {gender === "women" ? (
          <video
            ref={videoRef}
            key="women-video"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster={womenPoster}
            style={{ willChange: "transform", transform: "translateZ(0)" }}
            className="absolute inset-0 w-full h-full object-cover"
            onCanPlay={tryPlay}
            onLoadedData={tryPlay}
          >
            {/* HLS first — iOS Safari native support; mp4 fallback for all others */}
            <source src={backgroundVideoHls} type="application/x-mpegURL" />
            <source src={backgroundVideoMp4} type="video/mp4" />
          </video>
        ) : (
          <video
            ref={videoRef}
            key="men-video"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster={menPoster}
            style={{ willChange: "transform", transform: "translateZ(0)" }}
            className="absolute inset-0 w-full h-full object-cover"
            onCanPlay={tryPlay}
            onLoadedData={tryPlay}
          >
            {/* HLS first — iOS Safari native support; mp4 fallback for all others */}
            <source src={maleHls} type="application/x-mpegURL" />
            <source src={maleMp4} type="video/mp4" />
          </video>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-[rgba(30,30,30,0.7)]"></div>

        {/* Centered Content */}
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {gender === "women" ? "Timeless Elegance" : "Bold Elegance"}
          </h1>
          <p className="text-lg md:text-[22px]">
            {gender === "women"
              ? "Shop extraordinary jewelry crafted for life's most precious moments"
              : "Premium men's jewelry for the modern gentleman"}
          </p>

          {/* Animated CTA Button */}
          <div
            ref={ctaRef}
            className="mt-10 relative"
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
          >
            {/* Main Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setBtnHovered((prev) => !prev);
              }}
              className={`border border-white font-bold text-lg rounded-lg py-4 px-6 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer ${btnHovered ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}
            >
              Start Shopping
            </button>

            {/* Expanded Icon Buttons */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-4 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${btnHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}>
              {[
                { img: watch, alt: "watches", label: "watches" },
                { img: necklace, alt: "necklaces", label: "necklaces" },
                { img: ring, alt: "rings", label: "rings" },
                { img: earringsImg, alt: "earrings", label: "earrings" },
                { img: bracelet, alt: "bracelets", label: "bracelets" },
              ].map((btn, i) => (
                <Link
                  to={`/products?category=${btn.label}`}
                  key={btn.alt}
                  onClick={(e) => handleCategoryClick(e, btn.label)}
                  className={`group flex flex-col items-center gap-1 transition-all duration-500 ease-out no-underline ${btnHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: btnHovered ? `${i * 80}ms` : '0ms' }}
                >
                  <div className="rounded-full w-[49px] h-[49px] md:w-[55px] md:h-[55px] p-3 bg-[rgba(255,255,255,0.15)] cursor-pointer hover:bg-[#958169] transition-all duration-300 hover:scale-110">
                    <img className="w-full h-full" src={btn.img} alt={btn.alt} />
                  </div>
                  <span className="text-[14px] md:text-[14px] text-white/70 group-hover:text-white transition-colors duration-300">{btn.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
