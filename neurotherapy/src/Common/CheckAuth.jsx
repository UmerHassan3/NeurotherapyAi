import { Navigate, useLocation } from "react-router-dom";

export default function CheckAuth({ User, isAuthenticated, children }) {
  const location = useLocation();
  const path = location.pathname;

  const role = User?.role;

  const isAuthRoute = path.startsWith("/auth");
  const isAdminRoute = path.startsWith("/admin");

  // ---------------------------
  // 1. NOT AUTHENTICATED USERS
  // ---------------------------
  if (!isAuthenticated) {
    // only "/" and "/auth/*" allowed
    if (path === "/" || isAuthRoute) {
      return <>{children}</>;
    }

    return <Navigate to="/auth/signin" replace />;
  }

  // ---------------------------
  // 2. AUTHENTICATED USERS CANNOT ACCESS AUTH PAGES
  // ---------------------------
  if (isAuthRoute) {
    return <Navigate to="/" replace />;
  }

  // ---------------------------
  // 3. ADMIN RULES
  // ---------------------------
  if (role === "admin") {
    // admin only inside /admin/*
    if (isAdminRoute) {
      return <>{children}</>;
    }

    return <Navigate to="/admin/dashboard" replace />;
  }

  // ---------------------------
  // 4. USER RULES
  // ---------------------------
  if (role === "user") {
    // block admin routes
    if (isAdminRoute) {
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  }

  return <>{children}</>;
}