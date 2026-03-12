import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

const sections = [
  {
    title: "Order Processing",
    items: [
      "Orders are processed Monday–Friday, excluding holidays.",
      "In-stock items typically ship within 1–3 business days after payment verification.",
      "Made-to-order, personalized, or resized pieces ship within the timeframe shown on the product page or order confirmation.",
    ],
  },
  {
    title: "Shipping Methods & Delivery Times",
    items: [
      "We offer complimentary insured shipping on all orders, unless otherwise stated at checkout.",
      "Estimated transit times are shown at checkout and begin once your order ships.",
      "Delivery dates are estimates and may be affected by carrier delays, weather, or customs processing.",
    ],
  },
  {
    title: "Signature, Insurance & Secure Delivery",
    items: [
      "All shipments are fully insured while in transit.",
      "Signature is required upon delivery for security.",
      "We cannot ship to P.O. boxes. For some destinations, a carrier-access point pickup may be required.",
    ],
  },
  {
    title: "Shipping Addresses & Changes",
    items: [
      "Please review your shipping address carefully before placing your order.",
      "Address changes may be possible before shipment. Once shipped, we may be unable to redirect the package.",
    ],
  },
  {
    title: "International Shipping, Duties & Taxes",
    items: [
      "International shipping may be available to select countries.",
      "Duties, taxes, and customs fees (if applicable) are the customer's responsibility unless explicitly included at checkout.",
      "Customs authorities may require identification or additional information to release a shipment.",
    ],
  },
  {
    title: "Order Tracking",
    items: [
      "Tracking details are sent by email once your order ships.",
      "If tracking has not updated within 48 hours, please contact us for assistance.",
    ],
  },
  {
    title: "Lost, Stolen or Damaged Packages",
    items: [
      "If your package arrives damaged, contact us within 48 hours of delivery and keep all packaging.",
      "If a package is marked delivered but not received, notify us within 48 hours so we can initiate a carrier trace.",
      "For security, we may require a signature confirmation record, a written statement, or a police report for certain claims.",
    ],
  },
  {
    title: "Returns & Shipping",
    items: [
      "If your purchase qualifies for return under our return policy, return shipping instructions will be provided.",
      "Original shipping fees (if any) are non-refundable unless the return is due to our error.",
    ],
  },
];

const ShippingPolicyPage = () => {
  return (
    <HelmetProvider>
      <Helmet>
        <title>Shipping Policy | Gems Ore – Premium Jewelry Store Nigeria</title>
        <meta name="description" content="Learn about Gems Ore shipping methods, delivery times, insurance, tracking, and international shipping policies for premium jewelry orders." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.gemsore.com/shipping-policy" />
      </Helmet>

      <div className="bg-[#f2ebe3] min-h-screen">
        <Navbar dark={false} />

        {/* Hero */}
        <div className="pt-32 pb-12 md:pt-40 md:pb-16 text-center px-4">
          <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-[#958169] mb-3">Gems Ore</p>
          <h1 className="text-3xl md:text-5xl font-bold text-[rgba(68,68,68,1)]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
            Shipping Policy
          </h1>
          <div className="w-16 h-[2px] bg-[#958169] mx-auto mt-5" />
        </div>

        {/* Content */}
        <div className="max-w-screen-md mx-auto px-4 lg:px-8 pb-20">
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
            {sections.map((section, idx) => (
              <div
                key={idx}
                className={`px-6 md:px-10 py-8 ${idx !== sections.length - 1 ? "border-b border-black/5" : ""}`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#958169]/10 text-[#958169] text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <h2 className="text-lg md:text-xl font-bold text-[rgba(68,68,68,1)]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                    {section.title}
                  </h2>
                </div>
                <ul className="space-y-3 pl-10">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#958169] mt-2 shrink-0" />
                      <p className="text-sm md:text-[15px] leading-relaxed text-[rgba(68,68,68,0.75)]" style={{ fontFamily: "'Helvetica', 'Arial', sans-serif", fontWeight: 300 }}>
                        {item}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Contact */}
            <div className="px-6 md:px-10 py-8 bg-[rgba(149,129,105,0.05)]">
              <div className="flex items-start gap-3 mb-4">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#958169]/10 text-[#958169] text-xs font-bold shrink-0 mt-0.5">
                  ✉
                </span>
                <h2 className="text-lg md:text-xl font-bold text-[rgba(68,68,68,1)]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                  Contact
                </h2>
              </div>
              <p className="text-sm md:text-[15px] leading-relaxed text-[rgba(68,68,68,0.75)] pl-10" style={{ fontFamily: "'Helvetica', 'Arial', sans-serif", fontWeight: 300 }}>
                For shipping assistance, contact Customer Care with your order number and delivery address at{" "}
                <a href="mailto:contact@gemsore.com" className="text-[#958169] underline hover:text-[rgba(88,57,49,1)] transition-colors">
                  contact@gemsore.com
                </a>
              </p>
            </div>
          </div>

          {/* Back link */}
          <div className="text-center mt-10">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-[#958169] hover:text-[rgba(88,57,49,1)] transition-colors">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              Back to Home
            </Link>
          </div>
        </div>

        <Footer />
      </div>
    </HelmetProvider>
  );
};

export default ShippingPolicyPage;
