// app/admin/dashboard/page.tsx - Admin Dashboard Page
"use client";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Welcome to Admin Dashboard</h1>
      <p>Hello, {user?.name}!</p>
      {/* Admin dashboard content */}
    </div>
  );
}