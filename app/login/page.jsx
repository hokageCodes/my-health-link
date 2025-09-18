"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginPageContent() {
  const { login, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle OAuth errors from URL params
  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError) {
      let errorMessage = "Authentication failed";
      switch (oauthError) {
        case "oauth_failed":
          errorMessage = "Google authentication failed. Please try again.";
          break;
        case "oauth_no_user":
          errorMessage = "No user data received from Google.";
          break;
        case "token_generation_failed":
          errorMessage = "Failed to generate authentication tokens.";
          break;
        case "oauth_callback_error":
          errorMessage = "Authentication callback error occurred.";
          break;
        default:
          errorMessage = "An unknown authentication error occurred.";
      }
      setError(errorMessage);

      // Clean up URL after showing error
      const newUrl =
        window.location.pathname +
        (redirectUrl ? `?redirect=${redirectUrl}` : "");
      window.history.replaceState({}, "", newUrl);
    }
  }, [searchParams, redirectUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await login(formData.email, formData.password);

      if (redirectUrl) {
        router.push(redirectUrl);
      }
      // Otherwise, login function will handle role-based redirect
    } catch (err) {
      console.error("❌ Login form error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = () => {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
    let authUrl = `${baseUrl}/auth/google`;

    if (redirectUrl) {
      authUrl += `?redirect=${encodeURIComponent(redirectUrl)}`;
    }

    window.location.href = authUrl;
  };

  const GoogleIcon = () => (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );

  const isFormValid = formData.email && formData.password;
  const isButtonDisabled = !isFormValid || isSubmitting || loading;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-2">
            Sign in to your MyHealthLink account
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isSubmitting || loading}
              autoComplete="email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isSubmitting || loading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={isButtonDisabled}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              isButtonDisabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Signing In...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Google OAuth */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handleGoogleAuth}
              disabled={isSubmitting || loading}
              className={`w-full flex items-center justify-center gap-3 border border-gray-300 py-3 px-4 rounded-lg transition-colors ${
                isSubmitting || loading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }`}
              type="button"
            >
              <GoogleIcon />
              <span className="text-gray-700 font-medium">
                Continue with Google
              </span>
            </button>
          </div>
        </div>

        {/* Links */}
        <div className="mt-6 space-y-2 text-sm text-center">
          <div>
            <Link
              href="/forgot-password"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <div className="text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
            >
              Sign up here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
