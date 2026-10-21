import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import storefrontApi from "../../../services/api";
const callIcon = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113271/gems_ore/call.png";
const emailIcon = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113271/gems_ore/email.png";
const instagramIcon = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113273/gems_ore/instagram.png";
const facebookIcon = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113274/gems_ore/facebook.png";
const tiktokIcon = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113275/gems_ore/tiktok.png";
const paystack = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113267/gems_ore/pay.png";
const bitcoin = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113269/gems_ore/bitcoin.png";
const usdt = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113270/gems_ore/usdt.png";
const twitterIcon = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113276/gems_ore/twitter.png";
const snapchat = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113277/gems_ore/snapchat.png";

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
  const [subState, setSubState] = useState(null); // null | { type: "success" | "info" | "error", title: string, message: string }

  const handleSubscribe = async () => {
    const trimmed = subEmail.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setSubState({
        type: "error",
        title: "Invalid Email Address",
        message: "Please enter a valid email address (e.g., name@domain.com) to join our private mailing list.",
      });
      return;
    }

    setSubLoading(true);
    setSubState(null);

    try {
      const res = await storefrontApi.subscribers.subscribe(trimmed);
      const rawMsg = (res?.message || "").toLowerCase();

      if (rawMsg.includes("already")) {
        setSubState({
          type: "info",
          title: "Already Subscribed",
          message: "You are already a valued member of our private client list. Please check your inbox for our latest collection updates.",
        });
        toast.info("You're already part of the Gems & Ore Circle.");
      } else if (rawMsg.includes("welcome back") || rawMsg.includes("resubscribed")) {
        setSubState({
          type: "success",
          title: "Welcome Back",
          message: "Your subscription has been successfully reinstated. We look forward to sharing our latest bespoke collections with you.",
        });
        toast.success("Welcome back to Gems & Ore!");
        setSubEmail("");
      } else {
        setSubState({
          type: "success",
          title: "Welcome to Gems & Ore",
          message: "Thank you for joining our private circle. You will receive exclusive collection previews, bespoke craftsmanship stories, and VIP invitations.",
        });
        toast.success("Subscription confirmed! Welcome to Gems & Ore.");
        setSubEmail("");
      }
    } catch (err) {
      setSubState({
        type: "error",
        title: "Subscription Unavailable",
        message: err.message || "We were unable to complete your subscription at this time. Please check your connection and try again.",
      });
      toast.error("Unable to subscribe at this moment.");
    } finally {
      setSubLoading(false);
      setTimeout(() => {
        setSubState((prev) => (prev?.type === "success" ? null : prev));
      }, 7000);
    }
  };

  return (
    <footer className="bg-black text-white">
      {/* Newsletter */}
      <div className="mx-auto px-4 lg:px-8 py-12 flex flex-col md:flex-row items-center justify-center border-b border-white/10">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row items-center gap-6 lg:gap-24 justify-center w-full">
          <div>
            <p className="text-2xl md:text-3xl font-normal tracking-wide">Sign up for our newsletter</p>
            <p className="text-xs text-white/50 mt-1.5 font-light">
              Receive curated private previews, bespoke releases, and fine jewelry insights.
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <div className="flex w-full gap-3 sm:gap-4 md:w-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                value={subEmail}
                onChange={(e) => {
                  setSubEmail(e.target.value);
                  if (subState) setSubState(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                className="bg-black border-[1px] border-white rounded-lg px-4 py-3 text-sm text-white placeholder-white/40 outline-none w-full md:w-[300px] focus:border-[#958169] transition-colors duration-300"
              />
              <button
                onClick={handleSubscribe}
                disabled={subLoading}
                className="hover:bg-[#7a6a56] border-[1px] border-white transition-colors duration-300 text-white font-bold text-sm px-6 py-3 rounded-lg whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center min-w-[120px]"
              >
                {subLoading ? (
                  <span className="flex items-center gap-2 text-xs">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Subscribing...
                  </span>
                ) : (
                  "Subscribe"
                )}
              </button>
            </div>

            {/* Professional Luxury Feedback Card */}
            {subState && (
              <div
                className={`mt-1.5 p-3.5 rounded-xl border text-xs transition-all duration-300 flex items-start gap-3 max-w-md animate-in fade-in ${
                  subState.type === "success"
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                    : subState.type === "info"
                    ? "bg-[#958169]/20 border-[#958169]/50 text-[#e4d5be]"
                    : "bg-rose-950/40 border-rose-500/40 text-rose-200"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold mt-0.5 ${
                    subState.type === "success"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : subState.type === "info"
                      ? "bg-[#958169]/30 text-[#d4af37] border border-[#958169]/40"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  }`}
                >
                  {subState.type === "success" ? "✓" : subState.type === "info" ? "✦" : "!"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs text-white">
                    {subState.title}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">
                    {subState.message}
                  </p>
                </div>
              </div>
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
        
        <p className="text-white text-xs md:text-sm">Gems Ore Limited {new Date().getFullYear()} ©. All Rights Reserved.</p>

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