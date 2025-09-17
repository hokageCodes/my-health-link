// app/caregiver/dashboard/page.tsx - Caregiver Dashboard Page
"use client";
import { useAuth } from "@/context/AuthContext";

export default function CaregiverDashboard() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Caregiver Dashboard</h1>
      <p>Welcome back, {user?.name}!</p>
      {/* Caregiver dashboard content */}
    </div>
  );
}