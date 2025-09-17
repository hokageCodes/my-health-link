"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children, allowedRoles = null, requireAuth = true }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // Wait for auth to load

    // Define public routes that don't require authentication
    const publicRoutes = [
      "/",
      "/login", 
      "/register", 
      "/verify", 
      "/forgot-password", 
      "/reset-password",
      "/about",
      "/contact",
      "/privacy",
      "/terms"
    ];

    // Check if current route is public or matches public pattern
    const isPublicRoute = publicRoutes.includes(pathname) || 
                         pathname.startsWith("/reset-password/") ||
                         pathname.startsWith("/auth/");

    // If route doesn't require auth and it's public, allow access
    if (!requireAuth || isPublicRoute) {
      return;
    }

    // If user is not authenticated, redirect to login
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // If user is not verified, redirect to verification
    if (!user.isVerified) {
      router.push(`/verify?email=${encodeURIComponent(user.email)}`);
      return;
    }

    // If specific roles are required, check user's role
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on user's actual role
        switch (user.role) {
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
            router.push("/unauthorized");
            break;
        }
        return;
      }
    }

    // Auto-redirect from generic /dashboard to role-specific dashboard
    if (pathname === "/dashboard" && user) {
      switch (user.role) {
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
      }
    }

  }, [user, loading, allowedRoles, requireAuth, router, pathname]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user && requireAuth && !["/", "/login", "/register", "/verify", "/forgot-password"].includes(pathname) && !pathname.startsWith("/reset-password/")) {
    return null;
  }

  return <>{children}</>;
}

// Higher-order component for specific role protection
export const withRoleGuard = (Component, allowedRoles) => {
  return function ProtectedComponent(props) {
    return (
      <AuthGuard allowedRoles={allowedRoles}>
        <Component {...props} />
      </AuthGuard>
    );
  };
};

// Predefined guards for common use cases
export const AdminGuard = ({ children }) => (
  <AuthGuard allowedRoles={["admin"]}>{children}</AuthGuard>
);

export const CaregiverGuard = ({ children }) => (
  <AuthGuard allowedRoles={["caregiver", "admin"]}>{children}</AuthGuard>
);

export const PatientGuard = ({ children }) => (
  <AuthGuard allowedRoles={["patient", "user"]}>{children}</AuthGuard>
);

export const DoctorGuard = ({ children }) => (
  <AuthGuard allowedRoles={["doctor", "admin"]}>{children}</AuthGuard>
);