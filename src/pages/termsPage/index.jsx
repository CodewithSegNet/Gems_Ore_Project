import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Link } from "react-router-dom";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

const sections = [
  {
    num: 1,
    title: "Definitions",
    items: [
      { label: "Company, we, us, our", desc: "Gems Ore Limited, No. 2 Sakono Street, Royalty Square Mall, Wuse II, Abuja, FCT, Nigeria." },
      { label: "You, your", desc: "any visitor, customer, or account holder." },
      { label: "Products", desc: "Jewelry, watches, customisation, accessories, services, gift cards, and related items offered on the Site." },
      { label: "Site", desc: "the Gems Ore Limited website and related checkout pages." },
    ],
  },
  {
    num: 2,
    title: "Acceptance & Eligibility",
    items: [
      "By using the Site or placing an order, you agree to these Terms and our Privacy Policy.",
      "You must be at least 18 years old (or the age of majority where you live) and able to form a binding contract.",
    ],
  },
  {
    num: 3,
    title: "Account Security",
    items: [
      "You are responsible for maintaining the confidentiality of your account credentials.",
      "You agree to provide accurate, current information and to notify us of unauthorized use.",
    ],
  },
  {
    num: 4,
    title: "Product Information & Availability",
    items: [
      "We aim to describe Products accurately; however, images, sizes, color, gemstones, and finishes may vary due to photography, lighting, and natural material characteristics.",
      "Product availability may change without notice. Items may be limited, one-of-a-kind, or discontinued.",
      "We may correct errors or omissions (including after an order is placed) as permitted by law.",
    ],
  },
  {
    num: 5,
    title: "Pricing, Taxes & Duties",
    items: [
      "Prices are shown in Naira. Prices may change at any time without notice.",
      "Applicable taxes are calculated at checkout where required.",
      "International orders may be subject to duties, VAT, and customs fees unless explicitly included at checkout; you are responsible for such charges.",
    ],
  },
  {
    num: 6,
    title: "Orders, Acceptance & Cancellation",
    items: [
      "An order confirmation email acknowledges receipt; it does not constitute acceptance.",
      "We accept an order when we ship the Product (or when we confirm availability for pickup, if offered).",
      "We may decline, cancel, or limit orders at our discretion, including for suspected fraud, pricing errors, inventory issues, export restrictions, or verification requirements.",
      "Requests to cancel or change an order must be made promptly; once an order is processed or shipped, changes may not be possible.",
    ],
  },
  {
    num: 7,
    title: "Payment & Verification",
    items: [
      "You authorize us (and our payment providers) to charge your selected payment method for the total shown at checkout.",
      "For high-value transactions, we may require additional verification (including government-issued ID, proof of address, or payment validation) before shipment.",
      "If verification is not completed within a reasonable time, we may cancel the order and issue a refund to the original payment method.",
    ],
  },
  {
    num: 8,
    title: "Shipping, Delivery & Risk of Loss",
    items: [
      "Shipping options, estimated delivery windows, and any signature requirements are shown at checkout or in your order confirmation.",
      "Title and risk of loss transfer to you upon delivery and signature confirmation (or as otherwise required by applicable law).",
      "You are responsible for providing a correct delivery address and ensuring someone is available to receive and sign, where required.",
    ],
  },
  {
    num: 9,
    title: "Returns, Exchanges & Refunds",
    items: [
      "Returns are subject to our Return and Refund Policy, which is incorporated into these Terms by reference.",
      "Products must be returned in their original condition, with all packaging, documentation, certificates, and any security tags/seals intact (if applicable).",
      "Custom, bespoke, made-to-order, engraved/personalized, resized, altered items, and final sale items are not eligible for return except where required by law.",
    ],
  },
  {
    num: 10,
    title: "Sizing, Resizing & Alterations",
    items: [
      "Size guides are estimates. You are responsible for confirming ring size and wrist size before ordering.",
      "Resizing or alterations performed by anyone other than us (or an authorized service provider) may void return eligibility and any applicable warranty.",
    ],
  },
  {
    num: 11,
    title: "Watches: Condition, Servicing & Water Resistance",
    items: [
      "Watch specifications (including year, condition, included box/papers, and service history) are listed on the product page and form part of the Product description.",
      "Water resistance is not permanent and can be affected by wear, impact, seals, and servicing; we do not guarantee water resistance unless explicitly stated in writing.",
      "Manufacturer warranties (if any) apply only where stated and may require registration or service through authorized centers.",
    ],
  },
  {
    num: 12,
    title: "Authenticity & Provenance",
    items: [
      "We represent that Products are sourced and sold in accordance with applicable law and our stated authenticity standards.",
      "For pre-owned or vintage items, normal wear, replacement parts, and prior servicing may exist and may affect collectability or manufacturer warranty eligibility.",
    ],
  },
  {
    num: 13,
    title: "Promotions & Gift Cards",
    items: [
      "Promotional codes are subject to stated terms, may be modified or withdrawn, and cannot be applied retroactively.",
      "Gift cards (if offered) are non-refundable except where required by law and are subject to any additional gift card terms.",
    ],
  },
  {
    num: 14,
    title: "Intellectual Property",
    items: [
      "The Site content (including trademarks, logos, text, images, videos, and design) is owned by or licensed to us and is protected by intellectual property laws.",
      "You may not copy, reproduce, distribute, modify, or exploit any Site content without our prior written consent.",
    ],
  },
  {
    num: 15,
    title: "User Content & Reviews",
    items: [
      "If you submit content (e.g., reviews, photos), you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, and display it for business purposes.",
      "You represent you have the rights to submit such content and that it does not violate any law or third-party rights.",
      "We may remove content at our discretion.",
    ],
  },
  {
    num: 16,
    title: "Prohibited Use",
    content: "You agree not to:",
    items: [
      "Use the Site for unlawful, fraudulent, or abusive purposes.",
      "Interfere with Site security, scrape data, or attempt unauthorized access.",
      "Misrepresent your identity or payment authorization.",
    ],
  },
  {
    num: 17,
    title: "Privacy",
    items: [
      "Our collection and use of personal information are described in our Privacy Policy.",
    ],
  },
  {
    num: 18,
    title: "Compliance, Export Controls & Sanctions",
    items: [
      "You agree to comply with all applicable laws, including anti-money laundering, anti-bribery, export controls, and sanctions regulations.",
      "We may refuse service or cancel orders where compliance concerns arise.",
    ],
  },
  {
    num: 19,
    title: "Disclaimers",
    items: [
      "To the maximum extent permitted by law, the Site and Products are provided \"as is\" and \"as available,\" except as expressly stated in writing.",
      "Natural gemstones and precious metals may have inherent variations; such variations are not defects.",
    ],
  },
  {
    num: 20,
    title: "Limitation of Liability",
    items: [
      "To the maximum extent permitted by law, we will not be liable for indirect, incidental, special, consequential, or punitive damages.",
      "Our total liability for any claim related to a Product will not exceed the amount you paid for that Product, except where prohibited by law.",
    ],
  },
  {
    num: 21,
    title: "Indemnification",
    items: [
      "You agree to indemnify and hold us harmless from claims arising out of your misuse of the Site, violation of these Terms, or infringement of any rights of a third party.",
    ],
  },
  {
    num: 22,
    title: "Force Majeure",
    items: [
      "We are not responsible for delays or failures caused by events beyond our reasonable control (including carrier disruptions, natural disasters, labor disputes, or governmental actions).",
    ],
  },
  {
    num: 23,
    title: "Governing Law & Disputes",
    items: [
      "These Terms are governed by the laws of Abuja FCT Nigeria, without regard to conflict-of-law rules.",
      "Venue for disputes is Abuja, FCT Nigeria, unless mandatory consumer protection laws provide otherwise.",
    ],
  },
  {
    num: 24,
    title: "Changes to These Terms",
    items: [
      "We may update these Terms from time to time. The \"Last Updated\" date will reflect changes.",
      "Continued use of the Site after changes means you accept the updated Terms.",
    ],
  },
  {
    num: 25,
    title: "Contact",
    isContact: true,
  },
];

const TermsPage = () => {
  return (
    <HelmetProvider>
      <Helmet>
        <title>Terms & Conditions | Gems Ore – Premium Jewelry Store Nigeria</title>
        <meta name="description" content="Terms and Conditions governing the use of the Gems Ore Limited website and purchases. Read about orders, payments, returns, shipping, and more." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.gemsore.com/terms" />
      </Helmet>

      <div className="bg-[#f2ebe3] min-h-screen">
        <Navbar dark={false} />

        {/* Hero */}
        <div className="pt-32 pb-12 md:pt-40 md:pb-16 text-center px-4">
          <p className="text-xs md:text-sm uppercase tracking-[0.3em] text-[#958169] mb-3">Gems Ore</p>
          <h1 className="text-3xl md:text-5xl font-bold text-[rgba(68,68,68,1)]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
            Terms & Conditions
          </h1>
          <div className="w-16 h-[2px] bg-[#958169] mx-auto mt-5" />
          <p className="text-sm text-[rgba(68,68,68,0.6)] mt-4 max-w-xl mx-auto" style={{ fontFamily: "'Helvetica', 'Arial', sans-serif", fontWeight: 300 }}>
            These Terms and Conditions govern your use of the Gems Ore Limited website{" "}
            <a href="https://www.gemsore.com" className="text-[#958169] underline">www.gemsore.com</a>{" "}
            and any purchases made through it.
          </p>
        </div>

        {/* Content */}
        <div className="max-w-screen-md mx-auto px-4 lg:px-8 pb-20">
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
            {sections.map((section, idx) => (
              <div
                key={idx}
                className={`px-6 md:px-10 py-8 ${idx !== sections.length - 1 ? "border-b border-black/5" : ""} ${section.isContact ? "bg-[rgba(149,129,105,0.05)]" : ""}`}
              >
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#958169]/10 text-[#958169] text-xs font-bold shrink-0 mt-0.5">
                    {section.isContact ? "✉" : section.num}
                  </span>
                  <h2 className="text-lg md:text-xl font-bold text-[rgba(68,68,68,1)]" style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}>
                    {section.title}
                  </h2>
                </div>

                {section.isContact ? (
                  <div className="pl-10 space-y-2">
                    <p className="text-sm md:text-[15px] leading-relaxed text-[rgba(68,68,68,0.75)]" style={{ fontFamily: "'Helvetica', 'Arial', sans-serif", fontWeight: 300 }}>
                      Customer Care:{" "}
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
                      Address: No. 2 Sakono Street, Royalty Square Mall, Wuse II, Abuja, FCT, Nigeria
                    </p>
                  </div>
                ) : (
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
                  </div>
                )}
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

export default TermsPage;
