// app/user/layout.tsx - User/Patient Layout
import AuthGuard from "../components/AuthGuard";

export default function UserLayout({ children }) {
  return (
    <AuthGuard allowedRoles={["patient", "user"]}>
      <div className="user-layout">
        <nav className="user-nav">
          <h1>My Dashboard</h1>
          {/* Patient navigation */}
        </nav>
        <main>{children}</main>
      </div>
    </AuthGuard>
  );
}
