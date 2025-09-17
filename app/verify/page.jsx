"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyOtp, resendOtp, loading } = useAuth();
  
  const email = searchParams.get("email");
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [counter, setCounter] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      router.push("/register");
    }
  }, [email, router]);

  // Countdown timer
  useEffect(() => {
    if (counter > 0) {
      const timer = setTimeout(() => setCounter(counter - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [counter]);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setOtp(value);
      // Clear errors when user starts typing
      if (error) setError("");
      if (success) setSuccess("");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    setError("");
    setSuccess("");

    try {
      const result = await verifyOtp(email, otp);
      
      if (result?.success) {
        setSuccess(result.message || "Email verified successfully!");
        
        // Clear OTP and redirect after success
        setOtp("");
        setTimeout(() => {
          // The auth context will handle role-based redirection
        }, 1500);
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      
      // Handle specific error cases
      if (err.message.includes("expired")) {
        setError("OTP has expired. Please request a new one.");
        setCounter(0); // Allow immediate resend
      } else if (err.message.includes("Invalid OTP")) {
        setError("Invalid OTP. Please check and try again.");
        setOtp(""); // Clear invalid OTP
      } else {
        setError(err.message || "Verification failed. Please try again.");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setError("");
    setSuccess("");

    try {
      const result = await resendOtp(email);
      
      if (result?.success) {
        setSuccess(result.message || "New OTP sent to your email!");
        setCounter(60); // Reset countdown
        setOtp(""); // Clear current OTP
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600 text-sm">
            We sent a verification code to
          </p>
          <p className="text-gray-900 font-medium break-all">
            {email}
          </p>
          <p className="text-gray-600 text-sm mt-2">
            Enter the 6-digit code below to continue
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm text-center">{success}</p>
          </div>
        )}

        {/* OTP Form */}
        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <div>
            <label htmlFor="otp" className="sr-only">
              Enter OTP
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={handleOtpChange}
              placeholder="000000"
              maxLength={6}
              className={`w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                error 
                  ? "border-red-300 focus:ring-red-500" 
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              disabled={isVerifying || loading}
              autoComplete="one-time-code"
            />
            <p className="text-xs text-gray-500 text-center mt-1">
              Enter the 6-digit code from your email
            </p>
          </div>

          <button
            type="submit"
            disabled={!otp || otp.length !== 6 || isVerifying || loading}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              !otp || otp.length !== 6 || isVerifying || loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
            }`}
          >
            {isVerifying ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying...
              </div>
            ) : (
              "Verify Email"
            )}
          </button>
        </form>

        {/* Resend Section */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">
            Didn't receive the code?
          </p>
          
          {counter > 0 ? (
            <p className="text-sm text-gray-500">
              Resend code in {counter} seconds
            </p>
          ) : (
            <button
              onClick={handleResendOtp}
              disabled={isResending}
              className={`text-sm font-medium transition-colors ${
                isResending
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:text-blue-800 hover:underline"
              }`}
            >
              {isResending ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                  Sending...
                </span>
              ) : (
                "Resend Code"
              )}
            </button>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-500">
              Having trouble? Check your spam folder or
            </p>
            <div className="flex justify-center space-x-4 text-xs">
              <Link 
                href="/login" 
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Back to Login
              </Link>
              <span className="text-gray-300">|</span>
              <Link 
                href="/register" 
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Register Again
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}