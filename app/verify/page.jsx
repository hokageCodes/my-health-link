"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
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

  // If no email param, send user back to register
  useEffect(() => {
    if (!email) {
      router.push("/register");
    }
  }, [email, router]);

  // Countdown timer for resend
  useEffect(() => {
    if (counter > 0) {
      const timer = setTimeout(() => setCounter((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [counter]);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // digits only
    if (value.length <= 6) {
      setOtp(value);
      setError("");
      setSuccess("");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setIsVerifying(true);
    setError("");
    setSuccess("");

    try {
      const result = await verifyOtp(email, otp);

      if (result?.success) {
        setSuccess(result.message || "Email verified successfully!");
        setOtp("");

        // Short delay then redirect
        setTimeout(() => {
          router.push("/login"); // or auto redirect to dashboard
        }, 1500);
      }
    } catch (err) {
      console.error("OTP verification error:", err);

      if (err.message.includes("expired")) {
        setError("Code has expired. Please request a new one.");
        setCounter(0);
      } else if (err.message.includes("Invalid OTP")) {
        setError("Invalid code. Please try again.");
        setOtp("");
      } else {
        setError(err.message || "Verification failed. Try again.");
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
        setSuccess(result.message || "New code sent to your email!");
        setCounter(60);
        setOtp("");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError(err.message || "Failed to resend code. Try again.");
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-600 text-sm">We sent a 6-digit code to:</p>
          <p className="text-gray-900 font-medium break-all">{email}</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center text-red-700 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center text-green-700 text-sm">
            {success}
          </div>
        )}

        {/* OTP form */}
        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <input
            type="text"
            value={otp}
            onChange={handleOtpChange}
            placeholder="000000"
            maxLength={6}
            className={`w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border rounded-lg focus:outline-none focus:ring-2 ${
              error
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            disabled={isVerifying || loading}
          />
          <button
            type="submit"
            disabled={otp.length !== 6 || isVerifying || loading}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              otp.length !== 6 || isVerifying || loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
            }`}
          >
            {isVerifying ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        {/* Resend */}
        <div className="mt-6 text-center">
          {counter > 0 ? (
            <p className="text-sm text-gray-500">
              Resend code in {counter} seconds
            </p>
          ) : (
            <button
              onClick={handleResendOtp}
              disabled={isResending}
              className={`text-sm font-medium ${
                isResending
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:text-blue-800 hover:underline"
              }`}
            >
              {isResending ? "Sending..." : "Resend Code"}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
          <p>
            Trouble? Check spam folder or{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Register again
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
