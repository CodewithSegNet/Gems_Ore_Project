import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

const sections = [
  {
    title: "Eligibility Window",
    items: [
      "Eligible returns are accepted within 14 days of delivery.",
      "Returned items must be received by us within 7 days after return authorization is issued.",
    ],
  },
  {
    title: "Eligible Items",
    content: "Eligible items must be:",
    items: [
      "Unworn, unaltered, and in original condition",
      "Returned with all original packaging, certificates, and documentation",
      "Returned with all security tags, seals, and serial-number identifiers intact (if applicable)",
    ],
    note: "Items that show signs of wear, damage, or alteration may be denied or subject to a restocking/repair fee.",
  },
  {
    title: "Non-Refundable / Final Sale Items",
    content: "The following are final sale and not eligible for refund:",
    items: [
      "Custom, bespoke, or made-to-order pieces",
      "Engraved or personalized items",
      "Resized or otherwise modified items (including special orders)",
      "Loose stones, special-order diamonds/gemstones, and investment-grade pieces (where applicable)",
      "Gift cards and store credit",
      "Items marked Final Sale",
    ],
  },
  {
    title: "Refund Method & Timing",
    items: [
      "Approved refunds are issued to the original payment method only.",
      "Refunds are processed within 7–10 business days after inspection and acceptance of the return.",
      "Banks and card issuers may require additional time to post the credit.",
    ],
  },
  {
    title: "Return Authorization & Shipping",
    items: [
      "A return authorization is required before sending any item back.",
      "For security, returns must be shipped using our provided insured label or shipping instructions.",
      "Packages shipped without authorization or without required insurance may be refused.",
    ],
  },
  {
    title: "Shipping Costs",
    items: [
      "Original shipping charges (if any) are non-refundable.",
      "Return shipping costs are the customer's responsibility unless the item is defective or we made an error.",
      "If we provide a prepaid return label for convenience, the label cost may be deducted from your refund unless the return is due to our error.",
    ],
  },
  {
    title: "Exchanges & Store Credit",
    items: [
      "Exchanges are subject to availability and verification.",
      "If a refund is not available under this policy, we may offer store credit at our discretion where permitted by law.",
    ],
  },
  {
    title: "Damaged, Defective or Incorrect Items",
    items: [
      "If your order arrives damaged, defective, or incorrect, notify us within 48 hours of delivery.",
      "Please retain all packaging and provide photos; we will arrange return/shipping and, where applicable, repair, replacement, or refund.",
    ],
  },
  {
    title: "Fraud Prevention & Compliance",
    items: [
      "We may require identity verification for high-value refunds.",
      "We reserve the right to refuse returns that do not meet this policy, or that appear fraudulent or abusive, to the extent permitted by law.",
    ],
  },
];

const RefundPolicyPage = () => {
  return (
    <HelmetProvider>
      <Helmet>
        <title>Refund Policy | Gems Ore – Premium Jewelry Store Nigeria</title>
        <meta name="description" content="Gems Ore refund policy — eligibility windows, return authorization, refund methods, and policies for damaged or defective jewelry items." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.gemsore.com/refund-policy" />
      </Helmet>

      <div className="bg-[#f2ebe3] min-h-screen">
        <Navbar dark={false} />

        {/* Hero */}
        <div className="pt-32 pb-12 md:pt-40 md:pb-16 text-center px-4">
          <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-[#958169] mb-3">Gems Ore</p>
          <h1 className="text-3xl md:text-5xl font-bold text-[rgba(68,68,68,1)]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
            Refund Policy
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
                <div className="pl-10">
                  {section.content && (
                    <p className="text-sm md:text-[15px] leading-relaxed text-[rgba(68,68,68,0.75)] mb-3" style={{ fontFamily: "'Helvetica', 'Arial', sans-serif", fontWeight: 300 }}>
                      {section.content}
                    </p>
                  )}
                  <ul className="space-y-3">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#958169] mt-2 shrink-0" />
                        <p className="text-sm md:text-[15px] leading-relaxed text-[rgba(68,68,68,0.75)]" style={{ fontFamily: "'Helvetica', 'Arial', sans-serif", fontWeight: 300 }}>
                          {item}
                        </p>
                      </li>
                    ))}
                  </ul>
                  {section.note && (
                    <p className="text-sm md:text-[15px] leading-relaxed text-[rgba(68,68,68,0.55)] mt-3 italic" style={{ fontFamily: "'Helvetica', 'Arial', sans-serif", fontWeight: 300 }}>
                      {section.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
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

export default RefundPolicyPage;
