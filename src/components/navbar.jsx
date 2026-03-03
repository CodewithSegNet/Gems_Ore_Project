import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/cartContext";
import { useGender } from "../contexts/genderContext";
import logo from "../assets/logos.png";
import search from "../assets/search.png";
import icon2 from "../assets/icon2.png";
import icon1 from "../assets/icon1.png";
import icon3 from "../assets/heart1.png";

import darksearch from "../assets/iconsearch.png";
import darkcart from "../assets/iconcart.png";
import darklove from "../assets/iconlove.png";
import darkaccount from "../assets/iconprofile.png";
import fast from "../assets/fast.png";
import bar from "../assets/Rectangle2.svg";


const bannerItems = ["earrings", "bracelets", "necklaces", "rings", "watches", "anklets"];

const recommendedSearches = [
  "Male Rings",
  "Female Rings",
  "Bracelets",
  "Earrings",
  "Anklets",
  "Wrist Watches",
  "Diamond Rings",
];

const formatPrice = (price) => new Intl.NumberFormat("en-NG").format(price);

const Navbar = ({ dark = true }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [wishlistTab, setWishlistTab] = useState("Favorites");
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const { cartItems, cartCount, removeFromCart, updateQuantity, subtotal, discount, vat, total } = useCart();
  const { gender, setGender } = useGender();

  // Mock auth state — replace with real auth later
  const [isLoggedIn] = useState(false);
  const mockUser = { name: "Valentine", email: "valentine@gmail.com" };

  const iconBg = dark ? "bg-[rgba(255,255,255,0.1)]" : "bg-[rgba(68,68,68,0.1)]";
  const textColor = dark ? "text-white" : "text-[rgba(68,68,68,1)]";

  const searchIcon = dark ? search : darksearch;
  const wishlistIcon = dark ? icon3 : darklove;
  const accountIcon = dark ? icon2 : darkcart;
  const cartIcon = dark ? icon1 : darkaccount;

  const closeAll = () => {
    setSearchOpen(false);
    setCartOpen(false);
    setWishlistOpen(false);
    setProfileOpen(false);
    setMobileMenuOpen(false);
  };

  const togglePanel = (panel) => {
    const isOpen = panel === "search" ? searchOpen : panel === "cart" ? cartOpen : panel === "wishlist" ? wishlistOpen : profileOpen;
    closeAll();
    if (!isOpen) {
      if (panel === "search") setSearchOpen(true);
      else if (panel === "cart") setCartOpen(true);
      else if (panel === "wishlist") setWishlistOpen(true);
      else if (panel === "profile") {
        if (!isLoggedIn) {
          navigate("/login");
          return;
        }
        setProfileOpen(true);
      }
    }
  };

  // Close search dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchOpen && searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

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
      <nav className={`absolute top-10 max-w-screen-2xl mx-auto left-1/2 -translate-x-1/2 w-full z-30 flex justify-between items-center px-4 lg:px-8 py-4 ${textColor}`}>
        <Link to="/">
          <img className="text-xl font-bold w-[55px] cursor-pointer h-[50px] lg:w-[85px] lg:h-[80px]" src={logo} alt="Gems Ore - Premium Jewelry Store Nigeria" />
        </Link>

        <ul className={`flex md:ml-[8.5rem] items-center justify-center gap-6 rounded-md md:rounded-lg duration-75 transition-underline py-1 px-2 md:py-1.5 md:px-4 ${iconBg}`}>
          
                   <li onClick={() => setGender("women")} className={`cursor-pointer mb-1.5 md:mb-0 duration-300 ${gender === "women" ? "underline underline-offset-4" : "hover:underline"}`}>
            <span className="font-thin text-[10px] md:text-sm">Women</span>
          </li>
          <li onClick={() => setGender("men")} className={`cursor-pointer mb-1.5 md:mb-0 duration-300 ${gender === "men" ? "underline underline-offset-4" : "hover:underline"}`}>
            <span className="font-thin text-[10px] md:text-sm">Men</span>
          </li>
 
        </ul>

        {/* Desktop Nav Icons */}
        <ul className="hidden md:flex gap-6">
          {/* Search */}
          <li className="relative" ref={searchRef}>
            <div
              onClick={() => togglePanel("search")}
              className={`rounded-full w-[40px] h-[40px] duration-75 transition-color p-2.5 ${iconBg} cursor-pointer hover:bg-[#958169]`}
            >
              <img className="w-full h-full" src={searchIcon} alt="Search jewelry" />
            </div>

            {/* Search Dropdown — directly under icon */}
            {searchOpen && (
              <div className="absolute right-0 top-[52px] w-[320px] z-50 animate-slide-up bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-[rgba(68,68,68,0.11)] mx-3 mt-3 rounded-lg px-4 py-3 flex items-center gap-3">
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="rgba(68,68,68,0.6)" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search for anything"
                    autoFocus
                    className="flex-1 bg-transparent outline-none text-[rgba(68,68,68,1)] placeholder:text-gray-400 text-sm"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">Recommended Searches</p>
                  <ul className="flex flex-wrap gap-x-4 gap-y-3">
                    {recommendedSearches.map((term) => (
                      <li key={term}>
                        <Link
                          to={`/products?category=${term.toLowerCase().replace(/\s+/g, '-')}`}
                          onClick={() => setSearchOpen(false)}
                          className="text-sm text-[rgba(68,68,68,1)] underline hover:text-[rgba(88,57,49,1)] transition-colors duration-200"
                        >
                          {term}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </li>

          {/* Wishlist */}
          <li
            onClick={() => togglePanel("wishlist")}
            className={`rounded-full w-[40px] h-[40px] duration-75 transition-color p-2.5 ${iconBg} cursor-pointer hover:bg-[#958169]`}
          >
            <img className="w-full h-full" src={wishlistIcon} alt="Wishlist" />
          </li>

          {/* Cart with badge */}
          <li
            onClick={() => togglePanel("cart")}
            className={`relative rounded-full w-[40px] h-[40px] duration-75 transition-color p-2.5 ${iconBg} cursor-pointer hover:bg-[#958169]`}
          >
            <img className="w-full h-full" src={accountIcon} alt="Account" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#958169] text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center animate-bounce-once">
                {cartCount}
              </span>
            )}
          </li>

          {/* Profile */}
          <li
            onClick={() => togglePanel("profile")}
            className={`rounded-full w-[40px] h-[40px] duration-75 transition-color p-2.5 ${iconBg} cursor-pointer hover:bg-[#958169]`}
          >
            <img className="w-full h-full" src={cartIcon} alt="Cart" />
          </li>
        </ul>

        {/* Mobile Burger Button */}
        <button
          className={`md:hidden flex flex-col justify-center items-center w-[40px] h-[40px] rounded-full ${iconBg} cursor-pointer z-50`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-[18px] h-[2px] ${dark ? 'bg-white' : 'bg-[rgba(68,68,68,1)]'} rounded-full transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'rotate-45 translate-y-[3px]' : ''}`}></span>
          <span className={`block w-[18px] h-[2px] ${dark ? 'bg-white' : 'bg-[rgba(68,68,68,1)]'} rounded-full mt-[4px] transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}></span>
          <span className={`block w-[18px] h-[2px] ${dark ? 'bg-white' : 'bg-[rgba(68,68,68,1)]'} rounded-full mt-[4px] transition-all duration-300 ease-in-out ${mobileMenuOpen ? '-rotate-45 -translate-y-[9px]' : ''}`}></span>
        </button>
      </nav>

      {/* ==================== WISHLIST / FAVORITES ASIDE ==================== */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${wishlistOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setWishlistOpen(false)}></div>
        <aside
          className={`absolute right-0 top-0 h-full bg-white shadow-2xl overflow-y-auto transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${wishlistOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ width: "min(541px, 90vw)" }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-normal text-[rgba(68,68,68,1)]">Favorites</h2>
              <button onClick={() => setWishlistOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1L13 13M1 13L13 1" stroke="rgba(68,68,68,1)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs + Content */}
          <div className="px-6 py-4">
            <div className="flex gap-0 border-b border-gray-200">
              {["Favorites", "Orders", "Profile"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setWishlistTab(tab)}
                  className={`flex-1 py-3 text-sm font-medium text-center transition-all duration-200 cursor-pointer ${
                    wishlistTab === tab
                      ? "text-[rgba(88,57,49,1)] border-b-2 border-[rgba(88,57,49,1)]"
                      : "text-gray-400 hover:text-[rgba(68,68,68,1)]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="py-6">
              {wishlistTab === "Favorites" && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="rgba(200,200,200,1)" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                  <p className="mt-3 text-sm font-medium text-[rgba(68,68,68,1)]">No favorites yet</p>
                  <p className="text-xs text-gray-400 mt-1">Items you love will appear here</p>
                  <Link to="/products" onClick={() => setWishlistOpen(false)} className="mt-4 text-sm text-[rgba(88,57,49,1)] underline hover:text-[rgba(68,47,39,1)] transition-colors">
                    Browse Products
                  </Link>
                </div>
              )}

              {wishlistTab === "Orders" && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="rgba(200,200,200,1)" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="mt-3 text-sm font-medium text-[rgba(68,68,68,1)]">No orders yet</p>
                  <p className="text-xs text-gray-400 mt-1">Your orders will appear here</p>
                  <Link to="/products" onClick={() => setWishlistOpen(false)} className="mt-4 text-sm text-[rgba(88,57,49,1)] underline hover:text-[rgba(68,47,39,1)] transition-colors">
                    Find an Item to Order
                  </Link>
                </div>
              )}

              {wishlistTab === "Profile" && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="rgba(200,200,200,1)" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <p className="mt-3 text-sm font-medium text-[rgba(68,68,68,1)]">Sign in to view profile</p>
                  <Link to="/login" onClick={() => setWishlistOpen(false)} className="mt-4 text-sm text-[rgba(88,57,49,1)] underline hover:text-[rgba(68,47,39,1)] transition-colors">
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* ==================== PROFILE ASIDE ==================== */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${profileOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setProfileOpen(false)}></div>
        <aside
          className={`absolute right-0 top-0 h-full bg-white shadow-2xl overflow-y-auto transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${profileOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ width: "min(541px, 90vw)" }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[rgba(68,68,68,1)]">Profile</h2>
              <button onClick={() => setProfileOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1L13 13M1 13L13 1" stroke="rgba(68,68,68,1)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-6 py-6">
            {isLoggedIn ? (
              /* Logged-in User */
              <>
                {/* User Info */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-full bg-[rgba(88,57,49,1)] flex items-center justify-center text-white text-xl font-bold">
                    {mockUser.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-base font-bold text-[rgba(68,68,68,1)]">Welcome, {mockUser.name}</p>
                    <p className="text-sm text-gray-400">{mockUser.email}</p>
                  </div>
                </div>

                <button className="text-sm text-red-400 hover:text-red-600 underline transition-colors cursor-pointer mb-8">
                  Sign out
                </button>

                {/* Orders */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-[rgba(68,68,68,1)] uppercase tracking-wider">Orders</h3>
                    <Link to="#" className="text-xs text-[rgba(88,57,49,1)] underline hover:text-[rgba(68,68,68,1)] transition-colors">View All</Link>
                  </div>

                  {/* Empty Orders */}
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 rounded-lg">
                    <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="rgba(200,200,200,1)" strokeWidth="1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="mt-3 text-sm font-medium text-[rgba(68,68,68,1)]">You haven't made any orders yet</p>
                    <Link to="/products" onClick={() => setProfileOpen(false)} className="mt-2 text-sm text-[rgba(88,57,49,1)] underline hover:text-[rgba(68,68,68,1)] transition-colors">
                      Find an Item to Order
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              /* Non-logged-in User */
              <>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="rgba(200,200,200,1)" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[rgba(68,68,68,1)]">Welcome to Gems Ore</h3>
                  <p className="text-sm text-gray-400 mt-1 mb-6">Sign in to access your account, orders, and wishlist</p>

                  <button className="w-full max-w-[280px] py-3 bg-[rgba(88,57,49,1)] text-white rounded-lg font-medium hover:bg-[rgba(68,47,39,1)] transition-colors duration-300 cursor-pointer mb-3">
                    Sign In
                  </button>
                  <button className="w-full max-w-[280px] py-3 border border-[rgba(88,57,49,1)] text-[rgba(88,57,49,1)] rounded-lg font-medium hover:bg-[rgba(88,57,49,0.05)] transition-colors duration-300 cursor-pointer">
                    Create Account
                  </button>
                </div>

                {/* Browse suggestion */}
                <div className="mt-6 border-t border-gray-100 pt-6">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">Explore</p>
                  <ul className="flex flex-col gap-1">
                    {["Necklaces", "Rings", "Bracelets", "Earrings", "Watches"].map((cat) => (
                      <li key={cat}>
                        <Link
                          to={`/products?category=${cat.toLowerCase()}`}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm text-[rgba(68,68,68,1)] hover:text-[rgba(88,57,49,1)]"
                        >
                          {cat}
                          <svg className="ml-auto w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </aside>
      </div>

      {/* ==================== CART SIDEBAR ==================== */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${cartOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setCartOpen(false)}></div>
        <aside
          className={`absolute right-0 top-0 h-full bg-white shadow-2xl overflow-y-auto transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ width: "min(541px, 90vw)" }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-normal text-[rgba(68,68,68,1)]">Shopping Cart</h2>
                <p className="text-sm text-gray-400 mt-0.5">{cartCount} items</p>
              </div>
              <button onClick={() => setCartOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1L13 13M1 13L13 1" stroke="rgba(68,68,68,1)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="mt-3 bg-transparent rounded-md border-[3px] border-dotted border-[rgba(68,68,68,1)] px-3 py-2">
<div className="flex items-center justify-between w-full">
  <p className="text-sm">FREE Shipping Within Abuja (FCT)</p>
  <img className="w-5 h-5" src={fast} alt="" />
</div>

<div className="w-full pt-3 rounded-full">
    <img className="w-[100%] h-4 rounded-full" src={bar} alt="" />
</div>
            </div>
          </div>

          {/* Cart Body */}
          <div className="px-6 py-4 flex-1 flex flex-col">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center">
                <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="rgba(200,200,200,1)" strokeWidth="1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                <p className="mt-2 text-lg font-medium text-[rgba(68,68,68,1)]">Your Cart is Empty</p>
                <p className="text-sm text-gray-400 mt-1"></p>

                <div className="mt-2 bg-white rounded-lg w-fit max-w-[232px]">
                  <ul className="flex justify-center items-center py-3 px-6 border text-black border-black hover:bg-primary hover:border-primary hover:text-white transition-colors rounded-md">
                    {["Add Item to Cart"].map((cat) => (
                      <li key={cat}>
                        <Link to={`/products?category=${cat.toLowerCase()}`} onClick={() => setCartOpen(false)} className="text-sm hover:text-white transition-colors">
                          {cat}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-5 border-b border-gray-100">
                    <div className="w-[100px] h-[100px] rounded-lg overflow-hidden shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[rgba(68,68,68,1)] truncate">{item.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-gray-400">Price:</span>
                        <p className="text-base font-bold text-[rgba(68,68,68,1)]">₦{formatPrice(item.price)}</p>
                      </div>
                      {item.quantity > 0 && (
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs text-gray-400">Discount (10%)</span>
                          <span className="text-xs font-medium text-[rgba(68,68,68,1)]">₦{formatPrice(item.price * 0.10)}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 border border-gray-200 rounded-md">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer rounded-l-md">−</button>
                          <span className="text-sm font-medium text-[rgba(68,68,68,1)] min-w-[20px] text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer rounded-r-md">+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer underline">
                          Remove from Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {cartItems.length > 0 && (
              <>
            <div className="sticky bg-[#f4f4f4] bottom-0 mx-2 rounded-lg border-t border-gray-100 px-6 py-5">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">SubTotal</span>
                  <span className="font-bold text-[rgba(68,68,68,1)]">₦{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">VAT (7.5%)</span>
                  <span className="text-[rgba(68,68,68,1)]">₦{formatPrice(vat)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-  gba(68,68,68,1)]">Discount</span>
                  <span className="text-[rgba(68,68,68,1)]">−₦{formatPrice(discount)}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-gray-100 pt-3 mt-2">
                  <span className="text-[rgba(68,68,68,1)]">Total</span>
                  <span className="text-[rgba(68,68,68,1)]">₦{formatPrice(total)}</span>
                </div>
              </div>
  
            </div>

<div className="mx-5 my-5">
                        <button className="w-full py-5 bg-black text-white rounded-lg font-medium hover:bg-[rgba(68,47,39,1)] transition-colors duration-300 cursor-pointer">
                Proceed to CheckOut
              </button>
              <Link to="/products" onClick={() => setCartOpen(false)} className="w-full py-5 bg-transparent border border-black text-black rounded-lg font-medium hover:bg-[rgba(68,47,39,1)] transition-colors duration-300 cursor-pointer block text-center mt-3 text-sm text-[rgba(88,57,49,1)] hover:text-white">
                View Cart
              </Link>
</div>

             </>
          )}
        </aside>
      </div>

      {/* ==================== MOBILE SEARCH OVERLAY ==================== */}
      <div className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${searchOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSearchOpen(false)}></div>
        <div className={`absolute top-0 left-0 right-0 bg-white shadow-xl transition-transform duration-300 ${searchOpen ? 'translate-y-0' : '-translate-y-full'}`}>
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-[rgba(68,68,68,0.11)] rounded-lg px-4 py-3 flex items-center gap-3">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="rgba(68,68,68,0.6)" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search for anything"
                  autoFocus={searchOpen}
                  className="flex-1 bg-transparent outline-none text-[rgba(68,68,68,1)] placeholder:text-gray-400 text-sm"
                />
              </div>
              <button onClick={() => setSearchOpen(false)} className="text-gray-500 text-sm font-medium cursor-pointer">
                Cancel
              </button>
            </div>
          </div>
          <div className="px-4 pb-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-medium">Recommended Searches</p>
            <ul className="flex flex-wrap gap-x-4 gap-y-3">
              {recommendedSearches.map((term) => (
                <li key={term}>
                  <Link
                    to={`/products?category=${term.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setSearchOpen(false)}
                    className="text-sm text-[rgba(68,68,68,1)] underline hover:text-[rgba(88,57,49,1)] transition-colors duration-200"
                  >
                    {term}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ==================== MOBILE MENU ==================== */}
      <div className={`fixed inset-0 z-40 transition-all duration-500 ease-in-out ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileMenuOpen(false)}
        ></div>

        <div className={`absolute right-0 top-0 h-full w-[80px] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
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
              { src: searchIcon, alt: "Search jewelry", action: () => { togglePanel("search"); setMobileMenuOpen(false); } },
              { src: wishlistIcon, alt: "Wishlist", action: () => { togglePanel("wishlist"); setMobileMenuOpen(false); } },
              { src: accountIcon, alt: "Account", action: () => { togglePanel("cart"); setMobileMenuOpen(false); } },
              { src: cartIcon, alt: "Cart", action: () => { togglePanel("profile"); setMobileMenuOpen(false); } },
            ].map((item, i) => (
              <li
                key={item.alt}
                onClick={item.action}
                className={`relative rounded-full w-[40px] h-[40px] duration-75 transition-all p-2.5 bg-[rgba(255,255,255,0.1)] cursor-pointer hover:bg-[#958169] ${mobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                style={{ transitionDelay: mobileMenuOpen ? `${200 + i * 100}ms` : '0ms' }}
              >
                <img className="w-full h-full" src={item.src} alt={item.alt} />
                {item.alt === "Account" && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#958169] text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Navbar;