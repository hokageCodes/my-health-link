// app/caregiver/layout.tsx - Caregiver Layout
import AuthGuard from "../../app/components/AuthGuard";

export default function CaregiverLayout({ children }) {
  return (
    <AuthGuard allowedRoles={["caregiver", "admin"]}>
      <div className="caregiver-layout">
        <nav className="caregiver-nav">
          <h1>Caregiver Dashboard</h1>
          {/* Caregiver navigation */}
        </nav>
        <main>{children}</main>
      </div>
    </AuthGuard>
  );
}