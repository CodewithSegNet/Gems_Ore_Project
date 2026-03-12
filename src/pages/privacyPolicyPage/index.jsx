import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

const sections = [
  {
    title: "Personal Information We Collect",
    items: [
      { label: "Contact and account details", desc: "name, email, phone, addresses, login details" },
      { label: "Order and service details", desc: "purchases, returns, repairs, warranties, correspondence" },
      { label: "Payment details", desc: "processed by our payment providers; we typically do not store full card numbers" },
      { label: "Device/usage data", desc: "IP address, device identifiers, browser data, pages viewed, cookies" },
      { label: "Verification/fraud data", desc: "information needed to confirm identity, prevent fraud, and secure delivery" },
    ],
  },
  {
    title: "How We Use Your Information",
    content: "We use personal information to:",
    items: [
      "Process payments, fulfill orders, and provide customer support",
      "Arrange insured delivery and manage returns/repairs",
      "Prevent fraud and protect our customers and business",
      "Improve the Site, products, and customer experience",
      "Send service messages and, if you opt in, marketing communications",
    ],
  },
  {
    title: "How We Share Your Information",
    content: "We share personal information only as needed with:",
    items: [
      "Service providers (payment processors, shipping carriers, insurers, fraud-prevention, IT, analytics, email/SMS tools)",
      "Professional advisors and authorities (as required by law or to protect rights and safety)",
      "A buyer or successor in a business transfer (subject to appropriate safeguards)",
    ],
    note: "We do not sell personal information for money.",
  },
  {
    title: "Cookies & Marketing",
    items: [
      "We use cookies and similar technologies for Site functionality, security, analytics, and (where enabled) advertising.",
      "You can control cookies in your browser and opt out of marketing via unsubscribe links.",
    ],
  },
  {
    title: "Data Retention & Security",
    items: [
      "We retain information as needed for orders, services, legal/tax obligations, and fraud prevention.",
      "We use reasonable safeguards to ensure our system is secure to standard.",
    ],
  },
  {
    title: "Your Choices & Rights",
    items: [
      "You may request access, correction, deletion, or objection/restriction, and opt out of certain advertising-related processing.",
      "We may verify your identity before responding.",
    ],
  },
];

const PrivacyPolicyPage = () => {
  return (
    <HelmetProvider>
      <Helmet>
        <title>Privacy Policy | Gems Ore – Premium Jewelry Store Nigeria</title>
        <meta name="description" content="Learn how Gems Ore Limited collects, uses, and protects your personal information when using our website and services." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.gemsore.com/privacy-policy" />
      </Helmet>

      <div className="bg-[#f2ebe3] min-h-screen">
        <Navbar dark={false} />

        {/* Hero */}
        <div className="pt-32 pb-12 md:pt-40 md:pb-16 text-center px-4">
          <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-[#958169] mb-3">Gems Ore</p>
          <h1 className="text-3xl md:text-5xl font-bold text-[rgba(68,68,68,1)]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
            Privacy Policy
          </h1>
          <div className="w-16 h-[2px] bg-[#958169] mx-auto mt-5" />
          <p className="text-sm text-[rgba(68,68,68,0.6)] mt-4 max-w-lg mx-auto" style={{ fontFamily: "'Helvetica', 'Arial', sans-serif", fontWeight: 300 }}>
            This Privacy Policy explains how Gems Ore Limited ("we," "us") collects, uses, and shares personal information when you use our website, place an order, or contact us.
          </p>
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
                          {typeof item === "string" ? item : (
                            <>
                              <span className="font-medium text-[rgba(68,68,68,0.9)]">{item.label}:</span>{" "}
                              {item.desc}
                            </>
                          )}
                        </p>
                      </li>
                    ))}
                  </ul>
                  {section.note && (
                    <p className="text-sm md:text-[15px] leading-relaxed text-[rgba(88,57,49,0.8)] mt-4 font-medium" style={{ fontFamily: "'Helvetica', 'Arial', sans-serif" }}>
                      {section.note}
                    </p>
                  )}
                </div>
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
              <div className="pl-10 space-y-2">
                <p className="text-sm md:text-[15px] leading-relaxed text-[rgba(68,68,68,0.75)]" style={{ fontFamily: "'Helvetica', 'Arial', sans-serif", fontWeight: 300 }}>
                  Email:{" "}
                  <a href="mailto:contact@gemsore.com" className="text-[#958169] underline hover:text-[rgba(88,57,49,1)] transition-colors">
                    contact@gemsore.com
                  </a>
                </p>
                <p className="text-sm md:text-[15px] leading-relaxed text-[rgba(68,68,68,0.75)]" style={{ fontFamily: "'Helvetica', 'Arial', sans-serif", fontWeight: 300 }}>
                  Phone:{" "}
                  <a href="tel:08052842509" className="text-[#958169] underline hover:text-[rgba(88,57,49,1)] transition-colors">
                    08052842509
                  </a>
                </p>
                <p className="text-sm md:text-[15px] leading-relaxed text-[rgba(68,68,68,0.75)]" style={{ fontFamily: "'Helvetica', 'Arial', sans-serif", fontWeight: 300 }}>
                  Address: Gems Ore Limited, No. 2 Sakono Street, Royalty Square Mall, Wuse II, Abuja, FCT, Nigeria
                </p>
              </div>
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

export default PrivacyPolicyPage;
