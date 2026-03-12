import React, { useState } from "react";
import { Link } from "react-router-dom";
import storefrontApi from "../services/api";
import callIcon from "../assets/call.png";
import whatsappIcon from "../assets/whatsapp.png";
import emailIcon from "../assets/email.png";
import instagramIcon from "../assets/instagram.png";
import facebookIcon from "../assets/facebook.png";
import tiktokIcon from "../assets/tiktok.png";
import paystack from "../assets/pay.png";
import bitcoin from "../assets/bitcoin.png";
import usdt from "../assets/usdt.png";
import twitterIcon from "../assets/twitter.png";
import snapchat from "../assets/snapchat.png";

const shopItems = [
  { label: "Watches", slug: "watches" },
  { label: "Rings", slug: "rings" },
  { label: "Earrings", slug: "earrings" },
  { label: "Bracelets", slug: "bracelets" },
  { label: "Necklaces", slug: "necklaces" },
  { label: "Anklets", slug: "anklets" },
];
const policyItems = [
  { label: "Refund Policy", to: "/refund-policy" },
  { label: "Shipping Policy", to: "/shipping-policy" },
  { label: "Terms of Service", to: "/terms" },
  { label: "Privacy Policy", to: "/privacy-policy" },
];
const locationItems = ["Abuja (FCT)"];

const contactItems = [
  { icon: callIcon, label: "+234 8052842509", href: "tel:+2348052842509" },
//   { icon: whatsappIcon, label: "+234 80383828292", href: "https://wa.me/23480383828292" },
  { icon: emailIcon, label: "contact@gemsore.com", href: "mailto:contact@gemsore.com" },
];

const followItems = [
  { icon: instagramIcon, label: "GEMS ORE", href: "https://www.instagram.com/gems.ore?igsh=aGZ2djQxcm9hcjgz" },
  { icon: facebookIcon, label: "GEMS ORE", href: "https://www.facebook.com/gems_ore" },
  { icon: tiktokIcon, label: "gems.ore", href: "https://www.tiktok.com/@gems.ore?_r=1&_t=ZS-94FSLj30eyT" },
    { icon: snapchat, label: "gems.ore", href: "https://www.snapchat.com/@gems_ore" },
  { icon: twitterIcon, label: "gemsorelimited", href: "https://x.com/gemsorelimited?s=21" },

];

const Footer = () => {
  const [subEmail, setSubEmail] = useState("");
  const [subLoading, setSubLoading] = useState(false);
  const [subMessage, setSubMessage] = useState("");
  const [subError, setSubError] = useState(false);

  const handleSubscribe = async () => {
    if (!subEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(subEmail)) {
      setSubMessage("Please enter a valid email");
      setSubError(true);
      return;
    }
    setSubLoading(true);
    setSubMessage("");
    setSubError(false);
    try {
      const res = await storefrontApi.subscribers.subscribe(subEmail);
      setSubMessage(res?.message || "Successfully subscribed!");
      setSubError(false);
      setSubEmail("");
    } catch (err) {
      setSubMessage(err.message || "Subscription failed");
      setSubError(true);
    } finally {
      setSubLoading(false);
      setTimeout(() => setSubMessage(""), 5000);
    }
  };

  return (
    <footer className="bg-black text-white">
      {/* Newsletter */}
      <div className="mx-auto px-4 lg:px-8 py-10 flex flex-col md:flex-row items-center justify-center  border-b border-white/10">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row items-center gap-5 lg:gap-32 justify-center">
        <div>
          <p className="text-2xl md:text-3xl font-normal">Sign up for our newsletter</p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex w-full gap-5 md:w-auto">
            <input
              type="email"
              placeholder="Your Email Address"
              value={subEmail}
              onChange={(e) => setSubEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
              className="bg-black border-[1px] border-white rounded-lg px-4 py-3 text-sm text-white placeholder-white/40 outline-none w-full md:w-[300px] focus:border-[#958169] transition-colors duration-300"
            />
            <button
              onClick={handleSubscribe}
              disabled={subLoading}
              className="hover:bg-[#7a6a56] border-[1px] border-white transition-colors duration-300 text-white font-bold text-sm px-6 py-3 rounded-lg whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {subLoading ? "..." : "Subscribe"}
            </button>
          </div>
          {subMessage && (
            <p className={`text-xs ${subError ? "text-red-400" : "text-green-400"}`}>{subMessage}</p>
          )}
        </div>

        </div>

      </div>

      {/* Footer Columns */}
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">

        {/* Shop */}
        <div className="bg-[rgba(255,255,255,0.07)] rounded-xl p-4 md:p-5 lg:pb-24 shadow-lg overflow-hidden">
          <div className="flex items-center justify-center bg-[rgba(255,255,255,0.07)] mb-8 rounded-[4px] py-2 px-4">
            <h1 className="text-sm md:text-base text-center font-bold text-white">Shop</h1>
          </div>
          <ul className="flex flex-col gap-2.5">
            {shopItems.map((item, i) => (
              <li key={i}>
                <Link to={`/products?category=${item.slug}`} className="text-white/60 text-sm hover:text-[#958169] cursor-pointer transition-colors duration-300">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Policies */}
        <div className="bg-[rgba(255,255,255,0.07)] rounded-xl p-4 md:p-5 shadow-lg overflow-hidden">
          <div className="flex items-center justify-center bg-[rgba(255,255,255,0.07)] mb-8 rounded-[4px] py-2 px-4">
            <h1 className="text-sm md:text-base text-center font-bold text-white">Policies</h1>
          </div>
          <ul className="flex flex-col gap-2.5">
            {policyItems.map((item, i) => (
              <li key={i}>
                <Link to={item.to} className="text-white/60 text-sm hover:text-[#958169] cursor-pointer transition-colors duration-300">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="bg-[rgba(255,255,255,0.07)] rounded-xl p-4 md:p-5 shadow-lg overflow-hidden">
          <div className="flex items-center justify-center bg-[rgba(255,255,255,0.07)] mb-8 rounded-[4px] py-2 px-4">
            <h1 className="text-sm md:text-base text-center font-bold text-white">Contact</h1>
          </div>
          <ul className="flex flex-col gap-2.5">
            {contactItems.map((item, i) => (
              <li key={i}>
                <a
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 underline text-white/60 text-sm hover:text-[#958169] cursor-pointer transition-colors duration-300"
                >
                  <img src={item.icon} alt="" className="w-[16px] h-[16px] shrink-0" />
                  <span className="break-all">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Location */}
        <div className="bg-[rgba(255,255,255,0.07)] rounded-xl p-4 md:p-5 shadow-lg overflow-hidden">
          <div className="flex items-center justify-center bg-[rgba(255,255,255,0.07)] mb-8 rounded-[4px] py-2 px-4">
            <h1 className="text-sm md:text-base text-center font-bold text-white">Location</h1>
          </div>
          <ul className="flex flex-col gap-2.5">
            {locationItems.map((item, i) => (
              <li key={i} className="text-white/60 text-sm hover:text-[#958169] cursor-pointer transition-colors duration-300">
                {item}
              </li>
            ))}
          </ul>
          <p style={{ fontFamily: "'Helvetica', 'Arial', sans-serif", fontWeight: 300, fontStyle: 'normal', fontSize: '12px', lineHeight: '100%', letterSpacing: '0%' }} className="text-[#797979] mt-1 ">
            No.2 Sakono Street, Royalty Square Mall, Wuse II
          </p>
        </div>

        {/* Follow Us */}
        <div className="bg-[rgba(255,255,255,0.07)] rounded-xl p-4 md:p-5 shadow-lg overflow-hidden">
          <div className="flex items-center justify-center bg-[rgba(255,255,255,0.07)] mb-8 rounded-[4px] py-2 px-4">
            <h1 className="text-sm md:text-base text-center font-bold text-white">Follow Us</h1>
          </div>
          <ul className="flex flex-col gap-2.5">
            {followItems.map((item, i) => (
              <li key={i}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white/60 text-sm hover:text-[#958169] cursor-pointer transition-colors duration-300"
                >
                  <img src={item.icon} alt="" className="w-[16px] h-[16px] shrink-0" />
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Copyright */}
      <div className="border-t border-white/10 py-6 text-center">
        
        <div className="max-w-screen-2xl px-5 mx-auto flex items-center justify-between">
        
        <p className="text-white text-xs md:text-sm">© {new Date().getFullYear()} GemsOre2026. All rights reserved.</p>

        <div className="flex items-center gap-2">
            <img src={paystack} alt="" className="w-[2s0px] h-[20px]" />
            <img src={bitcoin} alt="" className="w-[20px] h-[20px]" />
            <img src={usdt} alt="" className="w-[20px] h-[20px]" />

        </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;