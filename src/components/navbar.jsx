import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logos.png";
import search from "../assets/search.png";
import icon2 from "../assets/icon2.png";
import icon1 from "../assets/icon1.png";
import icon3 from "../assets/heart1.png";

// ✅ Just add or remove items here — no need to touch the JSX
const bannerItems = [
  "earrings",
  "bracelets",
  "necklaces",
  "rings",
  "watches",
  "anklets",
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top Flowing Banner */}
      <div className="bg-[#958169] overflow-hidden w-full">
        <div className="marquee-track py-2">
          {[...Array(4)].flatMap(() => bannerItems).concat([...Array(4)].flatMap(() => bannerItems)).map((item, index) => (
            <div key={index} className="marquee-item">
              <span className="inline-block w-[6px] h-[6px] rounded-full bg-[rgba(88,57,49,1)]"></span>
              <p className="text-[rgba(88,57,49,1)] text-sm">{item}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navbar */}
      <nav className="absolute top-10 max-w-screen-2xl mx-auto left-1/2 -translate-x-1/2 w-full z-30 flex justify-between items-center px-4 lg:px-8 py-4 text-white">
        <Link to="/">
          <img className="text-xl font-bold w-[55px] cursor-pointer h-[50px] lg:w-[85px] lg:h-[80px]" src={logo} alt="Gems Ore - Premium Jewelry Store Nigeria" />
        </Link>

        {/* Desktop Nav Icons */}
        <ul className="hidden md:flex gap-6">
          <li className="rounded-full w-[40px] h-[40px] duration-75 transition-color  p-2.5 bg-[rgba(255,255,255,0.1)] cursor-pointer hover:bg-[#958169]">
            <img className="w-full h-full" src={search} alt="Search jewelry" />
          </li>
          <li className="rounded-full w-[40px] h-[40px] duration-75 transition-color p-2.5 bg-[rgba(255,255,255,0.1)] cursor-pointer hover:bg-[#958169]">
            <img className="w-full h-full" src={icon3} alt="Wishlist" />
          </li>
          <li className="rounded-full w-[40px] h-[40px]  duration-75 transition-color p-2.5 bg-[rgba(255,255,255,0.1)] cursor-pointer hover:bg-[#958169]">
            <img className="w-full h-full" src={icon2} alt="Account" />
          </li>
          <li className="rounded-full w-[40px] h-[40px] duration-75 transition-color p-2.5 bg-[rgba(255,255,255,0.1)] cursor-pointer hover:bg-[#958169]">
            <img className="w-full h-full" src={icon1} alt="Cart" />
          </li>
        </ul>

        {/* Mobile Burger Button */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-[40px] h-[40px] rounded-full bg-[rgba(255,255,255,0.1)] cursor-pointer z-50"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-[18px] h-[2px] bg-white rounded-full transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'rotate-45 translate-y-[3px]' : ''}`}></span>
          <span className={`block w-[18px] h-[2px] bg-white rounded-full mt-[4px] transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}></span>
          <span className={`block w-[18px] h-[2px] bg-white rounded-full mt-[4px] transition-all duration-300 ease-in-out ${mobileMenuOpen ? '-rotate-45 -translate-y-[9px]' : ''}`}></span>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-40 transition-all duration-500 ease-in-out ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileMenuOpen(false)}
        ></div>

        {/* Slide-in Panel */}
        <div className={`absolute right-0 top-0 h-full w-[80px] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Close Button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-6 left-1/2 -translate-x-1/2 w-[35px] h-[35px] rounded-full bg-[rgba(255,255,255,0.1)] hover:bg-[#958169] transition-colors duration-300 flex items-center justify-center cursor-pointer"
            aria-label="Close menu"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L13 13M1 13L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <ul className="flex flex-col items-center gap-6 pt-24">
            {[
              { src: search, alt: "Search jewelry" },
              { src: icon3, alt: "Wishlist" },
              { src: icon2, alt: "Account" },
              { src: icon1, alt: "Cart" },
            ].map((item, i) => (
              <li
                key={item.alt}
                className={`rounded-full w-[40px] h-[40px] duration-75 transition-all p-2.5 bg-[rgba(255,255,255,0.1)] cursor-pointer hover:bg-[#958169] ${mobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                style={{ transitionDelay: mobileMenuOpen ? `${200 + i * 100}ms` : '0ms' }}
              >
                <img className="w-full h-full" src={item.src} alt={item.alt} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Navbar;