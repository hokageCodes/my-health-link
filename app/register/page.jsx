"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "patient",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  // ✅ Check for OAuth errors from URL params (no Suspense issues)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");

    if (error) {
      let errorMessage = "Authentication failed";
      switch (error) {
        case "token_generation_failed":
          errorMessage = "Failed to generate authentication tokens.";
          break;reak;
        default:
          errorMessage = "An unknown authentication error occurred.";
      }
      setErrors({ general: errorMessage });
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    } else if (form.name.trim().length > 100) {
      newErrors.name = "Name cannot exceed 100 characters";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please provide a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    } else if (form.password.length > 100) {
      newErrors.password = "Password cannot exceed 100 characters";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!["patient", "caregiver"].includes(form.role)) {
      newErrors.role = "Please select a valid role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (success) setSuccess("");
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSuccess("");

    try {
      const { confirmPassword, ...submitData } = form;
      const result = await register(submitData);

      if (result?.success) {
        setSuccess(result.message || "Registration successful! Please check your email for OTP.");

        const emailForRedirect = form.email;

        setForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          role: "patient",
        });

        setTimeout(() => {
          router.push(`/verify?email=${encodeURIComponent(emailForRedirect)}`);
        }, 2000);
      }
    } catch (err) {
      console.error("Registration error:", err);

      if (err.message.includes("email already exists")) {
        setErrors({ email: "An account with this email already exists" });
      } else if (err.message.includes("Invalid role")) {
        setErrors({ role: "Please select a valid role" });
      } else {
        setErrors({
          general: err.message || "Registration failed. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };



  const isFormValid = form.name && form.email && form.password && form.confirmPassword && form.role;
  const isButtonDisabled = !isFormValid || isSubmitting || loading;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join MyHealthLink today</p>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{errors.general}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                errors.name ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
              value={form.name}
              onChange={handleChange}
              disabled={isSubmitting || loading}
              autoComplete="name"
            />
            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                errors.email ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
              value={form.email}
              onChange={handleChange}
              disabled={isSubmitting || loading}
              autoComplete="email"
            />
            {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Create a password (min. 6 characters)"
              className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                errors.password ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
              value={form.password}
              onChange={handleChange}
              disabled={isSubmitting || loading}
              autoComplete="new-password"
            />
            {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                errors.confirmPassword ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
              value={form.confirmPassword}
              onChange={handleChange}
              disabled={isSubmitting || loading}
              autoComplete="new-password"
            />
            {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              I am registering as a
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 ${
                errors.role ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
              disabled={isSubmitting || loading}
            >
              <option value="patient">Patient</option>
              <option value="caregiver">Caregiver</option>
            </select>
            {errors.role && <p className="text-red-600 text-xs mt-1">{errors.role}</p>}
          </div>

          {/* Submit */}
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
                Creating Account...
              </div>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
