// app/user/dashboard/page.tsx - User Dashboard Page
"use client";
import { useAuth } from "../../../context/AuthContext";

export default function UserDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1>My Health Dashboard</h1>
      <p>Hello, {user?.name}!</p>
      {/* User dashboard content */}
    </div>
  );
}
