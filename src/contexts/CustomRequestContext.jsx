/* eslint-disable react/prop-types, react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import storefrontApi from "../services/api";
import { useGender } from "./genderContext";

const fullnameIcon = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113296/gems_ore/fullname.svg";
const phonenumberIcon = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113298/gems_ore/phonenumber.svg";
const eemailIcon = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113294/gems_ore/eemail.svg";
const successImg = "https://res.cloudinary.com/wruetqvx/image/upload/v1792113254/gems_ore/favorite11.png";

const CustomRequestContext = createContext(null);

export const CustomRequestProvider = ({ children }) => {
  const { gender } = useGender();
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    category: "",
    categoryName: "",
    requestType: "general_custom",
    customTitle: "",
    customMessage: "",
  });

  const [customStep, setCustomStep] = useState(1); // 1 = form, 2 = success, 3 = error
  const [customForm, setCustomForm] = useState({ name: "", email: "", phone: "", description: "" });
  const [formErrors, setFormErrors] = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);

  // Fetch categories with product counts (updated when gender changes)
  const fetchCategoryCounts = useCallback(async () => {
    try {
      setCategoriesLoading(true);
      const data = await storefrontApi.categories.getAll({ gender });
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load category counts:", err);
    } finally {
      setCategoriesLoading(false);
    }
  }, [gender]);

  useEffect(() => {
    fetchCategoryCounts();
  }, [fetchCategoryCounts]);

  // Check if a category currently has any items in the DB
  const isCategoryAvailable = useCallback(
    (categoryIdentifier) => {
      if (!categoryIdentifier || categories.length === 0) return false;
      const normalized = categoryIdentifier.trim().toLowerCase();
      const match = categories.find((c) => {
        const cName = c.name.trim().toLowerCase();
        return (
          cName === normalized ||
          cName.includes(normalized) ||
          normalized.includes(cName)
        );
      });
      return Boolean(match && match.product_count > 0);
    },
    [categories]
  );

  const openCustomModal = useCallback((config = {}) => {
    const isCategoryReq = Boolean(config.category);
    const catName = config.categoryName || (config.category ? config.category.charAt(0).toUpperCase() + config.category.slice(1) : "");

    setModalConfig({
      category: config.category || "",
      categoryName: catName,
      requestType: config.requestType || (isCategoryReq ? "category_custom" : "general_custom"),
      customTitle: config.customTitle || "",
      customMessage: config.customMessage || "",
    });

    setCustomForm({
      name: "",
      email: "",
      phone: "",
      description: isCategoryReq ? `I would like to request a bespoke custom ${catName.toLowerCase()} piece.` : "",
    });
    setFormErrors({ name: "", email: "", phone: "" });
    setCustomStep(1);
    setShowModal(true);
  }, []);

  const closeCustomModal = useCallback(() => {
    setShowModal(false);
  }, []);

  useEffect(() => {
    if (showModal) {
      document.body.classList.add("modal-open");
      window.dispatchEvent(new CustomEvent("gems:modal-toggle", { detail: { isOpen: true } }));
    } else {
      const hasOtherModal = document.querySelector(".fixed.inset-0.z-50:not([class*='invisible'])");
      if (!hasOtherModal) {
        document.body.classList.remove("modal-open");
        window.dispatchEvent(new CustomEvent("gems:modal-toggle", { detail: { isOpen: false } }));
      }
    }
  }, [showModal]);

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
    setCustomForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  const handleFieldBlur = (field) => {
    setFormErrors((prev) => ({ ...prev, [field]: validateField(field, customForm[field]) }));
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
        category: modalConfig.categoryName || modalConfig.category || "General",
        request_type: modalConfig.requestType || (modalConfig.category ? "category_custom" : "general_custom"),
      });
      setCustomStep(2);
    } catch (e) {
      console.error("Custom request failed:", e);
      setCustomStep(3);
    } finally {
      setSubmitting(false);
    }
  };

  const isCategoryRequest = Boolean(modalConfig.category);

  return (
    <CustomRequestContext.Provider
      value={{
        categories,
        categoriesLoading,
        isCategoryAvailable,
        openCustomModal,
        closeCustomModal,
        refreshCategories: fetchCategoryCounts,
      }}
    >
      {children}

      {/* Global Custom Request Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={closeCustomModal}
        >
          <div className="absolute inset-0 bg-black/75 transition-opacity" />
          <div
            className="relative bg-white rounded-xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto z-10 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {customStep === 1 ? (
              <>
                <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                  <div>
                    {isCategoryRequest && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#f5ede4] text-[rgba(88,57,49,1)] mb-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[rgba(88,57,49,1)]"></span>
                        Request
                      </span>
                    )}
                    <h3 className="text-xl font-bold text-[rgba(68,68,68,1)]">
                      {modalConfig.customTitle ||
                        (isCategoryRequest
                          ? `Custom ${modalConfig.categoryName} Request`
                          : "Custom Jewelry Request")}
                    </h3>
                  </div>
                  <button
                    onClick={closeCustomModal}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors duration-200 cursor-pointer shrink-0"
                    aria-label="Close modal"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Professional message block */}
                {isCategoryRequest ? (
                  <div className="my-4 p-4 rounded-lg bg-[rgba(247,243,238,0.9)] border border-[rgba(215,199,185,0.6)]">
                    <div className="flex gap-3">
                      <svg className="w-5 h-5 text-[rgba(88,57,49,1)] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="text-xs space-y-1">
                        <p className="font-semibold text-[rgba(68,68,68,1)]">
                          Collection Currently Unavailable
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                          {modalConfig.customMessage ||
                            "This collection is currently unavailable in our catalog, but our master jewelers can handcraft an exclusive custom piece tailored specifically to your desires."}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 my-4 leading-relaxed">
                    {modalConfig.customMessage ||
                      "Kindly fill out the form below with your details, and a dedicated sales representative will contact you to discuss your custom jewelry order."}
                  </p>
                )}

                <div className="space-y-4">
                  {isCategoryRequest && (
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md border border-gray-200">
                      <span className="text-xs text-gray-500">Requested Category:</span>
                      <span className="text-xs font-semibold text-[rgba(88,57,49,1)]">{modalConfig.categoryName}</span>
                    </div>
                  )}

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
                        className={`w-full border rounded-md pl-10 pr-4 py-3 text-xs bg-[rgba(68,68,68,0.06)] transition-colors focus:outline-none focus:border-[rgba(88,57,49,1)] ${formErrors.name ? "border-red-400" : "border-gray-300"}`}
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
                        className={`w-full border rounded-md pl-10 pr-4 py-3 text-xs bg-[rgba(68,68,68,0.06)] focus:outline-none focus:border-[rgba(88,57,49,1)] transition-colors ${formErrors.email ? "border-red-400" : "border-gray-300"}`}
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
                        className={`w-full border rounded-md pl-10 pr-4 py-3 text-xs bg-[rgba(68,68,68,0.06)] focus:outline-none focus:border-[rgba(88,57,49,1)] transition-colors ${formErrors.phone ? "border-red-400" : "border-gray-300"}`}
                      />
                    </div>
                    {formErrors.phone && <p className="text-[10px] text-red-500 mt-1">{formErrors.phone}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[rgba(68,68,68,1)] mb-1 block">
                      Request Description / Specifications
                    </label>
                    <div className="relative">
                      <textarea
                        value={customForm.description}
                        onChange={(e) => {
                          if (e.target.value.length <= 500) {
                            setCustomForm((prev) => ({ ...prev, description: e.target.value }));
                          }
                        }}
                        placeholder={
                          isCategoryRequest
                            ? `Describe details for your custom ${modalConfig.categoryName.toLowerCase()} (metal, stone, size, design preference)...`
                            : "Describe your custom jewelry request..."
                        }
                        className="w-full border border-gray-300 rounded-md p-3 pb-7 text-xs resize-none h-28 focus:outline-none focus:border-[rgba(88,57,49,1)] bg-[rgba(68,68,68,0.06)] transition-colors"
                      />
                      <span className="absolute bottom-2.5 right-3 text-[10px] text-gray-400">
                        {customForm.description.length}/500
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCustomSubmit}
                  disabled={
                    submitting ||
                    !customForm.name.trim() ||
                    !customForm.email.trim() ||
                    !customForm.phone.trim() ||
                    !customForm.description.trim()
                  }
                  className="w-full mt-6 py-3.5 rounded-lg bg-black text-white font-medium hover:bg-black/85 active:scale-[0.99] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md"
                >
                  {submitting ? "Submitting Request..." : "Submit Custom Request"}
                </button>
              </>
            ) : customStep === 2 ? (
              <div className="text-center py-6">
                <img src={successImg} alt="Success" className="w-24 h-24 mx-auto mb-4 object-contain animate-bounce" />
                <h3 className="text-xl font-bold text-[rgba(68,68,68,1)] mb-2">Request Submitted</h3>
                <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
                  Thank you for your custom request! A dedicated Gems Ore design specialist will review your specifications and contact you shortly.
                </p>
                <button
                  onClick={closeCustomModal}
                  className="w-full mt-6 py-3 rounded-lg bg-black text-white font-medium hover:bg-black/80 transition-colors duration-200 cursor-pointer"
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
                <h3 className="text-lg font-bold text-[rgba(68,68,68,1)] mb-2">Something went wrong</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  We could not process your request at this moment. Please try again or reach out to us directly.
                </p>
                <button
                  onClick={() => setCustomStep(1)}
                  className="mt-4 text-sm text-[rgba(88,57,49,1)] font-medium underline cursor-pointer hover:text-[rgba(68,47,39,1)]"
                >
                  Try Again
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </CustomRequestContext.Provider>
  );
};

export const useCustomRequest = () => {
  const context = useContext(CustomRequestContext);
  if (!context) {
    throw new Error("useCustomRequest must be used within a CustomRequestProvider");
  }
  return context;
};

export default CustomRequestContext;
