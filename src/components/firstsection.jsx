import React, { useState } from "react";
import storefrontApi from "../services/api";
import first from "../assets/Frame01.png";
import second from "../assets/jewels.png";
import fullnameIcon from "../assets/fullname.svg";
import phonenumberIcon from "../assets/phonenumber.svg";
import eemailIcon from "../assets/eemail.svg";
import successImg from "../assets/favorite11.png";

const FirstSection = () => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customStep, setCustomStep] = useState(1); // 1=form, 2=success, 3=error
  const [customForm, setCustomForm] = useState({ name: "", email: "", phone: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({ name: "", email: "", phone: "" });

  const validateField = (field, value) => {
    if (field === "name") {
      if (!value.trim()) return "Full name is required";
      if (value.trim().length < 2) return "Name must be at least 2 characters";
      return "";
    }
    if (field === "email") {
      if (!value.trim()) return "Email address is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Please enter a valid email address";
      return "";
    }
    if (field === "phone") {
      if (!value.trim()) return "Phone number is required";
      const digits = value.replace(/[^\d]/g, "");
      if (digits.length < 7) return "Phone number must have at least 7 digits";
      if (digits.length > 15) return "Phone number is too long";
      return "";
    }
    return "";
  };

  const handleFieldChange = (field, value) => {
    setCustomForm({ ...customForm, [field]: value });
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: validateField(field, value) });
    }
  };

  const handleFieldBlur = (field) => {
    setFormErrors({ ...formErrors, [field]: validateField(field, customForm[field]) });
  };

  const handleCustomSubmit = async () => {
    const errors = {
      name: validateField("name", customForm.name),
      email: validateField("email", customForm.email),
      phone: validateField("phone", customForm.phone),
    };
    setFormErrors(errors);
    if (errors.name || errors.email || errors.phone) return;

    setSubmitting(true);
    try {
      await storefrontApi.customRequests.create({
        full_name: customForm.name,
        email: customForm.email,
        phone_number: customForm.phone,
        description: customForm.description,
      });
      setCustomStep(2);
    } catch (e) {
      console.error("Custom request failed:", e);
      setCustomStep(3);
    } finally {
      setSubmitting(false);
    }
  };

  const openCustomModal = () => {
    setCustomForm({ name: "", email: "", phone: "", description: "" });
    setFormErrors({ name: "", email: "", phone: "" });
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
            className="relative bg-white rounded-md p-6 md:p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
        

            {customStep === 1 ? (
              <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[rgba(68,68,68,1)] mb-2">Custom Jewelry Request</h3>
    <button
              onClick={() => setShowCustomModal(false)}
              className="absolute top-7 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
              </div>
                <p className="text-xs text-gray-500 mb-5 leading-relaxed">
                  Kindly fill out the form below with your details, and a sales representative will contact you to discuss your custom jewelry order.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-[rgba(68,68,68,1)] mb-1 block">Full Name</label>
                    <div className="relative">
                      <img src={fullnameIcon} alt="" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                      <input
                        type="text"
                        value={customForm.name}
                        onChange={(e) => handleFieldChange("name", e.target.value)}
                        onBlur={() => handleFieldBlur("name")}
                        placeholder="Enter your full name"
                        className={`w-full border rounded-md pl-10 pr-4 py-3.5 text-xs bg-[rgba(68,68,68,0.11)] transition-colors focus:outline-none focus:border-[rgba(88,57,49,1)] ${formErrors.name ? 'border-red-400' : 'border-gray-300'}`}
                      />
                    </div>
                    {formErrors.name && <p className="text-[10px] text-red-500 mt-1">{formErrors.name}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[rgba(68,68,68,1)] mb-1 block">Email Address</label>
                    <div className="relative">
                      <img src={eemailIcon} alt="" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                      <input
                        type="email"
                        value={customForm.email}
                        onChange={(e) => handleFieldChange("email", e.target.value)}
                        onBlur={() => handleFieldBlur("email")}
                        placeholder="Enter your email address"
                        className={`w-full border rounded-md pl-10 pr-4 py-3.5 text-xs bg-[rgba(68,68,68,0.11)] focus:outline-none focus:border-[rgba(88,57,49,1)] transition-colors ${formErrors.email ? 'border-red-400' : 'border-gray-300'}`}
                      />
                    </div>
                    {formErrors.email && <p className="text-[10px] text-red-500 mt-1">{formErrors.email}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[rgba(68,68,68,1)] mb-1 block">Phone Number</label>
                    <div className="relative">
                      <img src={phonenumberIcon} alt="" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                      <input
                        type="tel"
                        value={customForm.phone}
                        onChange={(e) => handleFieldChange("phone", e.target.value)}
                        onBlur={() => handleFieldBlur("phone")}
                        placeholder="Enter your phone number"
                        className={`w-full border rounded-md pl-10 pr-4 py-3.5 text-xs bg-[rgba(68,68,68,0.11)] focus:outline-none focus:border-[rgba(88,57,49,1)] transition-colors ${formErrors.phone ? 'border-red-400' : 'border-gray-300'}`}
                      />
                    </div>
                    {formErrors.phone && <p className="text-[10px] text-red-500 mt-1">{formErrors.phone}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[rgba(68,68,68,1)] mb-1 block">Request Description</label>
                    <div className="relative">
                      <textarea
                        value={customForm.description}
                        onChange={(e) => {
                          if (e.target.value.length <= 500) setCustomForm({ ...customForm, description: e.target.value });
                        }}
                        placeholder="Describe your custom jewelry request..."
                        className="w-full border border-gray-300 rounded-md p-3 pb-7 text-xs resize-none h-28 focus:outline-none focus:border-[rgba(88,57,49,1)] bg-[rgba(68,68,68,0.11)] transition-colors"
                      />
                      <span className="absolute bottom-2.5 right-3 text-[10px] text-gray-400">{customForm.description.length}/500</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCustomSubmit}
                  disabled={submitting || !customForm.name.trim() || !customForm.email.trim() || !customForm.phone.trim() || !customForm.description.trim()}
                  className="w-full mt-5 py-3 rounded-lg bg-black text-white font-medium hover:bg-black/80 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
               </>
            ) : customStep === 2 ? (
              <div className="text-center py-4">
                <img src={successImg} alt="Success" className="w-28 h-28 mx-auto mb-5 object-contain" />
                <h3 className="text-lg font-bold text-[rgba(68,68,68,1)] mb-3">Request Submitted</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Thank you for your custom jewelry request! A dedicated Gems Ore sales representative will contact you shortly to discuss your bespoke design.
                </p>
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="w-full mt-5 py-3 rounded-lg bg-black text-white font-medium hover:bg-black/80 transition-colors duration-200 cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : customStep === 3 ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[rgba(68,68,68,1)] mb-3">Something went wrong</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Please try again or contact us directly.</p>
                <button onClick={() => setCustomStep(1)} className="mt-4 text-sm text-[rgba(88,57,49,1)] underline cursor-pointer hover:text-[rgba(68,47,39,1)]">Try Again</button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};

export default FirstSection;