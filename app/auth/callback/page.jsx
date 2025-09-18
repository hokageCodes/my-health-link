"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

function AuthCallbackContent() {
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Processing authentication...");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");
        const userParam = searchParams.get("user");
        const error = searchParams.get("error");

        // Handle error cases
        if (error) {
          let errorMessage = "Authentication failed";
          switch (error) {
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

          setStatus("error");
          setMessage(errorMessage);

          setTimeout(() => {
            router.push("/login");
          }, 3000);
          return;
        }

        // Validate required parameters
        if (!accessToken || !refreshToken || !userParam) {
          setStatus("error");
          setMessage("Invalid authentication response. Missing required data.");
          setTimeout(() => {
            router.push("/login");
          }, 3000);
          return;
        }

        // Parse user data
        let userData;
        try {
          userData = JSON.parse(decodeURIComponent(userParam));
        } catch (parseError) {
          console.error("Failed to parse user data:", parseError);
          setStatus("error");
          setMessage("Invalid user data format.");
          setTimeout(() => {
            router.push("/login");
          }, 3000);
          return;
        }

        // Store tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        // Set user in context
        setUser(userData);

        setStatus("success");
        setMessage("Authentication successful! Redirecting...");

        // Redirect based on role & verification
        setTimeout(() => {
          if (!userData.isVerified) {
            router.push(`/verify?email=${encodeURIComponent(userData.email)}`);
          } else {
            switch (userData.role) {
              case "admin":
                router.push("/admin/dashboard");
                break;
              case "caregiver":
                router.push("/caregiver/dashboard");
                break;
              case "patient":
              case "user":
                router.push("/user/dashboard");
                break;
              default:
                router.push("/dashboard");
                break;
            }
          }
        }, 1500);
      } catch (error) {
        console.error("OAuth callback error:", error);
        setStatus("error");
        setMessage("An unexpected error occurred during authentication.");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === "processing" && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <h2 className="mt-6 text-xl font-semibold text-gray-900">
                Completing Authentication
              </h2>
              <p className="mt-2 text-gray-600">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto h-12 w-12 text-green-500">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="mt-6 text-xl font-semibold text-green-700">
                Authentication Successful
              </h2>
              <p className="mt-2 text-gray-600">{message}</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto h-12 w-12 text-red-500">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="mt-6 text-xl font-semibold text-red-700">
                Authentication Failed
              </h2>
              <p className="mt-2 text-gray-600">{message}</p>
              <p className="mt-1 text-sm text-gray-500">
                You will be redirected to the login page shortly.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
