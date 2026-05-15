import { Navigate, useLocation } from "react-router-dom";

export default function CheckAuth({ isAuthenticated, User, children }) {
  const location = useLocation();
  const path = location.pathname;

  const isAuthRoute = path.startsWith("/auth");
  const isAdminRoute = path.startsWith("/admin");

  // ---------------------------
  // 1. NOT LOGGED IN
  // ---------------------------
  if (!isAuthenticated) {
    if (isAuthRoute) return <>{children}</>;

    return <Navigate to="/auth/signin" replace />;
  }

  // ---------------------------
  // 2. LOGGED IN USER
  // ---------------------------

  const role = User?.role;

  // ---------------------------
  // 3. ADMIN LOGIC
  // ---------------------------
  if (role === "admin") {
    if (isAdminRoute) return <>{children}</>;

    return <Navigate to="/admin/dashboard" replace />;
  }

  if(role==="admin"){
    if(!isAdminRoute||!isAuthRoute){
      return <Navigate to="/admin/dashboard" replace />
    }
  }

  // ---------------------------
  // 4. NORMAL USER
  // ---------------------------
  if (role === "user") {
    if (isAdminRoute) {
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  }

  return <>{children}</>;
}