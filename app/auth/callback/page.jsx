"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // Save accessToken in localStorage
      localStorage.setItem("accessToken", token);

      // ✅ fetch user profile with that token
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setUser(data.user);

          // 👉 redirect using same logic as email/password login
          if (!data.user.isVerified) {
            router.push("/verify-email");
          } else if (data.user.role === "admin") {
            router.push("/admin/dashboard");
          } else if (data.user.role === "caregiver") {
            router.push("/caregiver/dashboard");
          } else {
            router.push("/dashboard");
          }
        })
        .catch(() => {
          router.push("/login");
        });
    } else {
      router.push("/login");
    }
  }, [searchParams, router, setUser]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg">Signing you in with Google...</p>
    </div>
  );
}
