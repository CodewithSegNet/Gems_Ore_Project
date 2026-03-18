import React, { useState } from "react";
import { Link } from "react-router-dom";
import backgroundVideo from "../assets/video.mp4";
import { useGender } from "../contexts/genderContext";
import watch from "../assets/watch.png";
import ring from "../assets/ring.png";
import necklace from "../assets/necklace.png";
import earringsImg from "../assets/earrings.png";
import bracelet from "../assets/bracelet.png";
import male from "../assets/male_video.mp4"

const Home = () => {
  const [btnHovered, setBtnHovered] = useState(false);
  const { gender } = useGender();

  return (
    <>
      {/* Hero Section */}
      <section className="relative w-full h-[90vh] overflow-hidden">
        {/* Background Video */}
        {gender === "women" ? (
          <video key="women-video" autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        ) : (
          <video key="men-video" autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src={male} type="video/mp4" />
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
            className="mt-10 relative"
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
          >
            {/* Main Button */}
            <button className={`border border-white font-bold text-lg rounded-lg py-4 px-6 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${btnHovered ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}`}>
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
