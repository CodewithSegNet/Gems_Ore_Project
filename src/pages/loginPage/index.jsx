import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import mbg from "../../assets/mbg.avif";
import logo from "../../assets/logos.png";
import emailIcon from "../../assets/email1.png";

const LoginPage = () => {
  const navigate = useNavigate();
  // Steps: 1 = Sign In, 2 = Verify OTP, 3 = Resend OTP
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(59);

  // Countdown timer for step 3
  useEffect(() => {
    if (step !== 3 || resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleSignIn = (e) => {
    e.preventDefault();
    if (email) setStep(2);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    // In a real app, verify OTP here
    alert("OTP Verified! (replace with real auth)");
  };

  const handleResendOtp = () => {
    setResendTimer(59);
    setStep(3);
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    // Auto-focus next input
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      if (next) next.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      if (prev) prev.focus();
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Background Image */}
      <img
        src={mbg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200 group"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transition-transform duration-200 group-hover:-translate-x-1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m0 0l7 7m-7-7l7-7" />
        </svg>
        <span className="text-sm font-medium">Back to Home</span>
      </button>

      {/* Auth Modal */}
      <div className="relative z-10 w-[90%] max-w-[540px] bg-white rounded-md shadow-2xl overflow-hidden">
        {/* Logo */}
        <div className="flex justify-center pt-8 pb-4">
          <img src={logo} alt="Gems Ore" className="w-[70px] h-[65px]" />
        </div>

        <div className="px-8 pb-8">
          {/* ============ STEP 1: Sign In ============ */}
          {step === 1 && (
            <>
              <div className="text-left mb-6">
                <h2 className="text-xl font-bold text-[rgba(68,68,68,1)]">Sign in</h2>
                <p className="text-sm text-gray-400 mt-1">Sign in back to your Gems Ore account</p>
              </div>

              <form onSubmit={handleSignIn}>
                <div className="mb-5">
                  <div className="flex items-center gap-1 w-full px-4 py-4 border border-gray-200 bg-gray-200 rounded-md focus-within:border-[rgba(88,57,49,1)] transition-colors duration-200">
                    <img src={emailIcon} alt="" className="w-5 h-5 shrink-0 opacity-50" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="enter your email address"
                      required
                      className="flex-1 bg-transparent outline-none text-sm text-[rgba(68,68,68,1)] placeholder:text-[rgba(68,68,68,0.5);
]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-4 text-sm bg-black text-white rounded-md font-light hover:bg-[rgba(68,47,39,1)] transition-colors duration-300 cursor-pointer"
                >
                  Sign in
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-400">Or</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Social Buttons */}
              <div className="flex flex-col gap-3">
                <button className="w-full py-4 border border-black rounded-md text-sm font-medium text-[rgba(68,68,68,1)] hover:bg-gray-50 transition-colors duration-200 cursor-pointer flex items-center justify-center gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </button>
                <button className="w-full py-4 border border-black rounded-md text-sm font-medium text-[rgba(68,68,68,1)] hover:bg-gray-50 transition-colors duration-200 cursor-pointer flex items-center justify-center gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(68,68,68,1)">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Sign in with Apple
                </button>
              </div>

              {/* Create Account */}
              <p className="text-center text-sm text-gray-400 mt-6">
                Don't have an account?{" "}
                <span className="text-[rgba(88,57,49,1)] font-medium underline cursor-pointer hover:text-[rgba(68,47,39,1)] transition-colors">
                  Create account
                </span>
              </p>
            </>
          )}

          {/* ============ STEP 2: Verify OTP ============ */}
          {step === 2 && (
            <>
              <div className="text-left mb-6">
                <h2 className="text-xl font-bold text-[rgba(68,68,68,1)]">Verify Sign in</h2>
                <p className="text-sm text-gray-400 mt-1">
                  A 6-digit OTP was sent to <span className="font-medium text-[rgba(68,68,68,1)]">{email}</span>, enter OTP to Sign in
                </p>
              </div>

              <form onSubmit={handleVerifyOtp}>
                {/* OTP Inputs */}
                <div className="flex justify-center gap-3 mb-5">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-[70px] h-[72px] text-center text-lg font-bold bg-[rgba(68,68,68,0.11)] rounded-lg text-[rgba(68,68,68,1)] outline-none focus:border-[rgba(88,57,49,1)] transition-colors duration-200"
                    />
                  ))}
                </div>

                <p className="text-center text-sm text-gray-400 mb-5">
                  Didn't receive OTP?{" "}
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-[rgba(88,57,49,1)] font-medium underline cursor-pointer hover:text-[rgba(68,47,39,1)] transition-colors"
                  >
                    Resend OTP
                  </button>
                </p>

                <button
                  type="submit"
                  className="w-full py-4 text-sm font-light bg-black text-white rounded-md hover:bg-[rgba(68,47,39,1)] transition-colors duration-300 cursor-pointer"
                >
                  Verify OTP
                </button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-400">Or</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <div className="flex flex-col gap-3">
                <button className="w-full py-4 border border-black rounded-md text-sm font-medium text-[rgba(68,68,68,1)] hover:bg-gray-50 transition-colors duration-200 cursor-pointer flex items-center justify-center gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </button>
                <button className="w-full py-4 border border-black rounded-md text-sm font-medium text-[rgba(68,68,68,1)] hover:bg-gray-50 transition-colors duration-200 cursor-pointer flex items-center justify-center gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(68,68,68,1)">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Sign in with Apple
                </button>
              </div>

              <p className="text-center text-sm text-gray-400 mt-6">
                Don't have an account?{" "}
                <span className="text-[rgba(88,57,49,1)] font-medium underline cursor-pointer hover:text-[rgba(68,47,39,1)] transition-colors">
                  Create account
                </span>
              </p>
            </>
          )}

          {/* ============ STEP 3: Resend OTP (with timer) ============ */}
          {step === 3 && (
            <>
              {/* Back to step 2 */}
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-[rgba(68,68,68,1)] transition-colors mb-4 cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m0 0l7 7m-7-7l7-7" />
                </svg>
                Back
              </button>

              <div className="text-left mb-6">
                <h2 className="text-xl font-bold text-[rgba(68,68,68,1)]">Verify Sign in</h2>
                <p className="text-sm text-gray-400 mt-1">
                  A 6-digit OTP was sent to <span className="font-medium text-[rgba(68,68,68,1)]">{email}</span>, enter OTP to Sign in
                </p>
              </div>

              <form onSubmit={handleVerifyOtp}>
                <div className="flex justify-center gap-3 mb-5">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-r-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-11 h-12 text-center text-lg font-bold border border-gray-200 rounded-lg text-[rgba(68,68,68,1)] outline-none focus:border-[rgba(88,57,49,1)] transition-colors duration-200"
                    />
                  ))}
                </div>

                <p className="text-center text-sm mb-5">
                  <span className="text-[rgba(88,57,49,1)] font-medium">
                    Resending OTP {String(Math.floor(resendTimer / 60)).padStart(2, "0")}:{String(resendTimer % 60).padStart(2, "0")}
                  </span>
                </p>

                <button
                  type="submit"
                  className="w-full py-3 bg-[rgba(88,57,49,1)] text-white rounded-lg font-medium hover:bg-[rgba(68,47,39,1)] transition-colors duration-300 cursor-pointer"
                >
                  Verify OTP
                </button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-400">Or</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <div className="flex flex-col gap-3">
                <button className="w-full py-3 border border-gray-200 rounded-lg text-sm font-medium text-[rgba(68,68,68,1)] hover:bg-gray-50 transition-colors duration-200 cursor-pointer flex items-center justify-center gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </button>
                <button className="w-full py-3 border border-gray-200 rounded-lg text-sm font-medium text-[rgba(68,68,68,1)] hover:bg-gray-50 transition-colors duration-200 cursor-pointer flex items-center justify-center gap-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(68,68,68,1)">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Sign in with Apple
                </button>
              </div>

              <p className="text-center text-sm text-gray-400 mt-6">
                Don't have an account?{" "}
                <span className="text-[rgba(88,57,49,1)] font-medium underline cursor-pointer hover:text-[rgba(68,47,39,1)] transition-colors">
                  Create account
                </span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
