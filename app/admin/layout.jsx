// app/admin/layout.tsx - Admin Layout
import AuthGuard from "../components/AuthGuard";

export default function AdminLayout({ children }) {
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <div className="admin-layout">
        <nav className="admin-nav">
          <h1>Admin Dashboard</h1>
          {/* Admin navigation */}
        </nav>
        <main>{children}</main>
      </div>
    </AuthGuard>
  );
}