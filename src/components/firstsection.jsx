import React, { useState } from "react";
import first from "../assets/Frame01.png";
import second from "../assets/jewels.png";

const FirstSection = () => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customStep, setCustomStep] = useState(1);
  const [customForm, setCustomForm] = useState({ name: "", email: "", phone: "", description: "" });

  const handleCustomSubmit = () => {
    setCustomStep(2);
  };

  const openCustomModal = () => {
    setCustomForm({ name: "", email: "", phone: "", description: "" });
    setCustomStep(1);
    setShowCustomModal(true);
  };

  return (
    <>
      <section className="max-w-screen-2xl mx-auto my-[64px] ">
        <div className="mx-4 ">
          <div className="flex mb-[34px] flex-col h-full text-start text-white">
            <h1 className="text-[rgba(68,68,68,1)] lg:text-4xl text-2xl font-normal">Specially Crafted For You</h1>
            <p className="text-gray-600 lg:text-xl text-sm font-light">Crafted with intention - Designed around you</p>
          </div>

          {/* Desktop */}
          <div
            className="hidden px-4 lg:flex items-center overflow-hidden pl-[5rem]  mx-auto"
            style={{
              backgroundImage: `url(${first})`,
              backgroundSize: "100% 100%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              width: "auto",
              height: "434px",
              opacity: 1,
            }}
          >
            <div className="flex relative items-center overflow-hidden justify-between gap-24">
              <img className="w-full h-[900px] mb-[160px]" src={second} alt="" />
              <div className="text-white max-w-xl space-y-4">
                <h1 className="text-white lg:text-4xl text-2xl font-normal">Get a Custom-Crafted Masterpiece</h1>
                <p className="text-white lg:text-xl text-sm font-light">
                  Experience the beauty of a piece designed entirely around you,
                  from the first sketch to the final setting, thoughtfully crafted
                  to reflect your personality, your milestones, and the brilliance
                  you carry every day.
                </p>
                <button onClick={openCustomModal} className="py-3 px-7 rounded-lg border hover:bg-primary duration-300 border-white cursor-pointer">
                  Get One Now
                </button>
              </div>
            </div>
          </div>

          {/* Mobile & Tablet */}
          <div className="lg:hidden flex flex-col rounded-2xl overflow-hidden"
            style={{
              backgroundImage: `url(${first})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Jewels image centered on top */}
            <div className="flex justify-center md:pt-6 -mt-6 overflow-hidden">
              <img
                src={second}
                alt=""
                className="w-[350px] md:w-[280px] md:object-contain object-fill -mt-[9rem]"
              />
            </div>

            {/* Text content below */}
            <div className="text-white px-6 pb-8  md:pt-4 space-y-4">
              <h1 className="text-white text-2xl md:text-3xl font-normal">
                Get a Custom-Crafted Masterpiece
              </h1>
              <p className="text-white/80 text-sm md:text-base font-light">
                Experience the beauty of a piece designed entirely around you,
                from the first sketch to the final setting, thoughtfully crafted
                to reflect your personality, your milestones, and the brilliance
                you carry every day.
              </p>
              <button onClick={openCustomModal} className="py-3 px-7 rounded-lg border hover:bg-primary duration-300 border-white cursor-pointer">
                Get One Now
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Custom Jewelry Request Modal */}
      {showCustomModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowCustomModal(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCustomModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {customStep === 1 ? (
              <>
                <h3 className="text-lg font-bold text-[rgba(68,68,68,1)] mb-2">Custom Jewelry Request</h3>
                <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                  Kindly fill out the form below with your details, and a sales representative will contact you to discuss your custom jewelry order.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[rgba(68,68,68,1)] mb-1 block">Full Name</label>
                    <input
                      type="text"
                      value={customForm.name}
                      onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                      placeholder="Enter your full name"
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[rgba(217,176,62,1)] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[rgba(68,68,68,1)] mb-1 block">Email Address</label>
                    <input
                      type="email"
                      value={customForm.email}
                      onChange={(e) => setCustomForm({ ...customForm, email: e.target.value })}
                      placeholder="Enter your email address"
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[rgba(217,176,62,1)] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[rgba(68,68,68,1)] mb-1 block">Phone Number</label>
                    <input
                      type="tel"
                      value={customForm.phone}
                      onChange={(e) => setCustomForm({ ...customForm, phone: e.target.value })}
                      placeholder="Enter your phone number"
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-[rgba(217,176,62,1)] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[rgba(68,68,68,1)] mb-1 block">Request Description</label>
                    <textarea
                      value={customForm.description}
                      onChange={(e) => {
                        if (e.target.value.length <= 500) setCustomForm({ ...customForm, description: e.target.value });
                      }}
                      placeholder="Describe your custom jewelry request..."
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none h-24 focus:outline-none focus:border-[rgba(217,176,62,1)] transition-colors"
                    />
                    <p className="text-xs text-gray-400 text-right mt-1">{customForm.description.length}/500</p>
                  </div>
                </div>

                <button
                  onClick={handleCustomSubmit}
                  disabled={!customForm.name.trim() || !customForm.email.trim() || !customForm.phone.trim() || !customForm.description.trim()}
                  className="w-full mt-5 py-3 rounded-lg bg-black text-white font-medium hover:bg-black/80 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Submit Request
                </button>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[rgba(68,68,68,1)] mb-3">Request Submitted</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Thank you for your interest! A sales representative will contact you shortly to discuss your custom jewelry order.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FirstSection;