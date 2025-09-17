"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Check for existing session on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          console.log("🔍 Checking existing session...");
          // Verify token is still valid by fetching current user
          const res = await api.get("/auth/me");
          
          console.log("Session check response:", res.data);
          
          if (res.data?.success && res.data?.data?.user) {
            setUser(res.data.data.user);
            console.log("✅ Valid session found");
          } else if (res.data?.success && res.data?.user) {
            setUser(res.data.user);
            console.log("✅ Valid session found (alt structure)");
          } else {
            console.log("❌ Invalid session response structure");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
          }
        } else {
          console.log("ℹ️ No access token found");
        }
      } catch (error) {
        console.log("❌ Session check failed:", error.message);
        // Don't clear tokens here - let the interceptor handle it if it's a 401
        if (error.response?.status !== 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    checkAuth();
  }, []);

  const handleRedirect = (userData) => {
    if (!userData) return;

    if (!userData.isVerified) {
      router.push(`/verify?email=${encodeURIComponent(userData.email)}`);
      return;
    }

    // Role-based routing
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
  };

  const register = async (form) => {
    try {
      setLoading(true);
      console.log("📝 Starting registration...");

      // Validate form data
      if (!form.name || !form.email || !form.password) {
        throw new Error("Name, email, and password are required");
      }

      if (form.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      const res = await api.post("/auth/register", form);
      console.log("Registration response:", res.data);

      if (res.data?.success) {
        const userData = res.data.data?.user;
        if (userData) {
          setUser(userData);
          console.log("✅ Registration successful");
          return {
            success: true,
            user: userData,
            message: res.data.message || "Registration successful! Please check your email for OTP."
          };
        } else {
          throw new Error("Invalid response structure from server");
        }
      } else {
        throw new Error(res.data?.message || "Registration failed");
      }
    } catch (err) {
      console.error("❌ Registration error:", err);
      let errorMessage = "Registration failed";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log("🔑 Starting login for:", email);

      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      const res = await api.post("/auth/login", { email, password });
      console.log("Full login response:", res.data);

      if (res.data?.success) {
        const { accessToken, refreshToken, user: userData } = res.data.data;
        
        console.log("Extracted from response:", {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          hasUserData: !!userData
        });

        if (!accessToken || !userData) {
          throw new Error("Invalid login response from server - missing tokens or user data");
        }

        // Store tokens
        localStorage.setItem("accessToken", accessToken);
        console.log("✅ Access token stored");

        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
          console.log("✅ Refresh token stored");
        } else {
          console.warn("⚠️ No refresh token in response!");
        }

        // Verify tokens were stored
        const storedAccess = localStorage.getItem("accessToken");
        const storedRefresh = localStorage.getItem("refreshToken");
        console.log("Storage verification:", {
          accessStored: !!storedAccess,
          refreshStored: !!storedRefresh
        });

        // Set user state
        setUser(userData);
        console.log("✅ User state updated");

        // Redirect based on role and verification status
        handleRedirect(userData);

        return {
          success: true,
          user: userData,
          message: res.data.message || "Login successful!"
        };
      } else {
        throw new Error(res.data?.message || "Login failed");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      let errorMessage = "Login failed";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      console.log("🚪 Starting logout...");

      // Call logout endpoint if user exists
      if (user?.id) {
        try {
          await api.post("/auth/logout", { userId: user.id });
          console.log("✅ Server logout successful");
        } catch (error) {
          console.warn("⚠️ Server logout failed:", error.message);
        }
      }

      // Clear tokens and user state
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      console.log("✅ Local state cleared");

      // Redirect to login
      router.push("/login");
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Still clear local state even if there are errors
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      setLoading(true);
      console.log("🔐 Verifying OTP for:", email);

      if (!email || !otp) {
        throw new Error("Email and OTP are required");
      }

      const res = await api.post("/auth/verify-otp", { email, otp });
      console.log("OTP verification response:", res.data);

      if (res.data?.success) {
        // Update user verification status if this is the current user
        if (user && user.email === email) {
          const updatedUser = { ...user, isVerified: true };
          setUser(updatedUser);
          handleRedirect(updatedUser);
        }

        return {
          success: true,
          message: res.data.message || "Account verified successfully!"
        };
      } else {
        throw new Error(res.data?.message || "OTP verification failed");
      }
    } catch (err) {
      console.error("❌ OTP verification error:", err);
      let errorMessage = "OTP verification failed";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (email) => {
    try {
      console.log("📩 Resending OTP to:", email);

      if (!email) {
        throw new Error("Email is required");
      }

      const res = await api.post("/auth/resend-otp", { email });
      console.log("Resend OTP response:", res.data);

      if (res.data?.success) {
        return {
          success: true,
          message: res.data.message || "New OTP sent to your email!"
        };
      } else {
        throw new Error(res.data?.message || "Failed to resend OTP");
      }
    } catch (err) {
      console.error("❌ Resend OTP error:", err);
      let errorMessage = "Failed to resend OTP";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  const forgotPassword = async (email) => {
    try {
      console.log("🔒 Forgot password for:", email);

      if (!email) {
        throw new Error("Email is required");
      }

      const res = await api.post("/auth/forgot-password", { email });
      console.log("Forgot password response:", res.data);

      if (res.data?.success) {
        return {
          success: true,
          message: res.data.message || "Password reset link sent to your email!"
        };
      } else {
        throw new Error(res.data?.message || "Failed to send reset email");
      }
    } catch (err) {
      console.error("❌ Forgot password error:", err);
      let errorMessage = "Failed to send reset email";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  const resetPassword = async (token, password) => {
    try {
      console.log("🔑 Resetting password with token");

      if (!token || !password) {
        throw new Error("Token and password are required");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      const res = await api.post(`/auth/reset-password/${token}`, { password });
      console.log("Reset password response:", res.data);

      if (res.data?.success) {
        return {
          success: true,
          message: res.data.message || "Password reset successful! You can now log in."
        };
      } else {
        throw new Error(res.data?.message || "Password reset failed");
      }
    } catch (err) {
      console.error("❌ Password reset error:", err);
      let errorMessage = "Password reset failed";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  // Method to refresh user data
  const refreshUser = async () => {
    try {
      console.log("🔄 Refreshing user data...");
      const res = await api.get("/auth/me");
      
      if (res.data?.success && res.data?.data?.user) {
        setUser(res.data.data.user);
        return res.data.data.user;
      } else if (res.data?.success && res.data?.user) {
        setUser(res.data.user);
        return res.data.user;
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      console.error("❌ Failed to refresh user data:", error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isInitialized,
    login,
    register,
    logout,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};