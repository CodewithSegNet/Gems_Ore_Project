import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import storefrontApi from "../../services/api";
import mbg from "../../assets/mbg.avif";
import logo from "../../assets/logos.png";
import emailIcon from "../../assets/email1.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const googleBtnRef = useRef(null);
  const googleBtnRef2 = useRef(null);

  const handleGoogleResponse = useCallback(async (response) => {
    setLoading(true);
    setError("");
    try {
      await googleLogin(response.credential);
      navigate("/");
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }, [googleLogin, navigate]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const initGoogle = () => {
      if (!window.google) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
      });
      if (googleBtnRef.current) {
        googleBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline", size: "large", width: googleBtnRef.current.offsetWidth, text: "signin_with",
        });
      }
      if (googleBtnRef2.current) {
        googleBtnRef2.current.innerHTML = '';
        window.google.accounts.id.renderButton(googleBtnRef2.current, {
          theme: "outline", size: "large", width: googleBtnRef2.current.offsetWidth, text: "signin_with",
        });
      }
    };

    // If script already loaded, just init
    if (window.google?.accounts?.id) {
      initGoogle();
      return;
    }

    // Check if script tag already exists
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', initGoogle);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initGoogle;
    document.body.appendChild(script);
  }, [handleGoogleResponse]);

  // OTP state
  const [step, setStep] = useState("credentials"); // "credentials" | "otp"
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSending, setOtpSending] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Timer countdown
  useEffect(() => {
    if (otpTimer <= 0) return;
    const t = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
    return () => clearTimeout(t);
  }, [otpTimer]);

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // First check if the email is registered
      await storefrontApi.auth.checkEmail(email);
      // Email exists, now send OTP
      setOtpSending(true);
      await storefrontApi.auth.sendOtp(email);
      setStep("otp");
      setOtpTimer(60);
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
      setOtpSending(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(""));
      otpRefs[5].current?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    setOtpSending(true);
    setError("");
    try {
      await storefrontApi.auth.sendOtp(email);
      setOtpTimer(60);
    } catch (err) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) { setError("Please enter the full 6-digit code"); return; }
    setLoading(true);
    setError("");
    try {
      await storefrontApi.auth.verifyOtp(email, code);
      await login(email);
      navigate("/");
    } catch (err) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.576c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 6.293C4.672 4.166 6.656 3.576 9 3.576z" fill="#EA4335"/>
    </svg>
  );

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <img src={mbg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/50"></div>

      <button
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200 group"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-200 group-hover:-translate-x-1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m0 0l7 7m-7-7l7-7" />
        </svg>
        <span className="text-sm font-medium">Back to Home</span>
      </button>

      <div className="relative z-10 w-[90%] max-w-[540px] bg-white rounded-md shadow-2xl overflow-hidden">
        <div className="flex justify-center pt-8 pb-4">
          <img src={logo} alt="Gems Ore" className="w-[70px] h-[65px]" />
        </div>

        <div className="px-8 pb-8">
          {step === "credentials" ? (
            <>
              <div className="text-left mb-6">
                <h2 className="text-xl font-bold text-[rgba(68,68,68,1)]">Sign in</h2>
                <p className="text-sm text-gray-400 mt-1">Sign in back to your Gems Ore account</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">{error}</div>
              )}

              <form onSubmit={handleCredentialsSubmit}>
                <div className="mb-4">
                  <div className="flex items-center gap-1 w-full px-4 py-4 border border-gray-200 bg-gray-200 rounded-md focus-within:border-[rgba(88,57,49,1)] transition-colors duration-200">
                    <img src={emailIcon} alt="" className="w-5 h-5 shrink-0 opacity-50" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="enter your email address" required className="flex-1 bg-transparent outline-none text-sm text-[rgba(68,68,68,1)] placeholder:text-[rgba(68,68,68,0.5)]" />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="w-full py-4 text-sm bg-black text-white rounded-md font-light hover:bg-[rgba(68,47,39,1)] transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? "Sending OTP..." : "Sign in"}
                </button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-400">Or</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Google Button 1 — custom styled */}
              <div className="relative w-full">
                <div ref={googleBtnRef} className="absolute inset-0 opacity-0 overflow-hidden pointer-events-none" />
                <button
                  type="button"
                  onClick={() => googleBtnRef.current?.querySelector("div[role=button]")?.click()}
                  className="w-full flex items-center justify-center gap-3 py-4 border border-gray-200 bg-white rounded-md hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                >
                  <GoogleIcon />
                  <span className="text-sm font-medium text-[rgba(68,68,68,1)]">Sign in with Google</span>
                </button>
              </div>

              <p className="text-center text-sm text-gray-400 mt-6">
                Don't have an account?{" "}
                <Link to="/signup" className="text-[rgba(88,57,49,1)] font-medium underline hover:text-[rgba(68,47,39,1)] transition-colors">
                  Create account
                </Link>
              </p>
            </>
          ) : (
            /* ===== OTP VERIFICATION STEP ===== */
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[rgba(68,68,68,1)]">Verify Sign in</h2>
                <p className="text-sm text-gray-400 mt-1">
                  A 6-digit OTP was sent to <span className="font-medium text-[rgba(68,68,68,1)]">{email}</span>, enter OTP to sign in
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">{error}</div>
              )}

              {/* OTP Inputs */}
              <div className="flex justify-between mb-6" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={otpRefs[i]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-10 h-10 md:w-16 md:h-16 text-center text-xl font-bold border-2 border-gray-200 bg-gray-100 rounded-lg focus:border-[rgba(88,57,49,1)] focus:bg-white outline-none transition-all duration-200"
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              <div className="flex justify-center items-center my-2 gap-1">
                <p className="text-normal">Didn't receive OTP?</p>
                <button
                  onClick={handleResendOtp}
                  disabled={otpTimer > 0 || otpSending}
                  className="text-sm text-black hover:text-[rgba(68,47,39,1)] transition-colors cursor-pointer disabled:text-gray-300 disabled:cursor-not-allowed"
                >
                  {otpSending ? "Sending..." : otpTimer > 0 ? `Resend in ${otpTimer}s` : "Resend OTP"}
                </button>
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.join("").length < 6}
                className="w-full py-4 text-sm bg-black font-bold text-white rounded-md hover:bg-[rgba(68,47,39,1)] transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-400">Or</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Google Button 2 — custom styled */}
              <div className="relative w-full">
                <div ref={googleBtnRef2} className="absolute inset-0 opacity-0 overflow-hidden pointer-events-none" />
                <button
                  type="button"
                  onClick={() => googleBtnRef2.current?.querySelector("div[role=button]")?.click()}
                  className="w-full flex items-center justify-center gap-3 py-4 border border-gray-200 bg-white rounded-md hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                >
                  <GoogleIcon />
                  <span className="text-sm font-medium text-[rgba(68,68,68,1)]">Sign in with Google</span>
                </button>
              </div>

              <div className="flex text-center justify-center pt-2">
                <p className="text-center text-sm text-gray-400 mt-6">
                  Don't have an account?{" "}
                  <Link to="/signup" className="text-[rgba(88,57,49,1)] font-medium underline hover:text-[rgba(68,47,39,1)] transition-colors">
                    Create account
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;