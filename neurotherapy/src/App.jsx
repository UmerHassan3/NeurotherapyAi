import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./Components/ui/sonner";

import Home from "./Pages/User/Home";
import Contact from "./Pages/User/Contact";
import Profile from "./Pages/User/Profile";
import Therapy from "./Pages/User/Threapy";
import UserLayout from "./Components/User/UserLayout";

import Auth from "./Components/Auth/Auth";
import Signin from "./Pages/Auth/Signin";
import Signup from "./Pages/Auth/Signup";
import Forgot from "./Pages/Auth/Forgot";
import ResetPassword from "./Pages/Auth/Reset-password";

import CheckAuth from "./Common/CheckAuth";

import AdminLayout from "./Components/Admin/AdminLayout";
import Dashboard from "./Pages/Admin/Dashboard";
import { useSelector } from "react-redux";
import Users from "./Pages/Admin/Users";
import Settings from "./Pages/Admin/Settings";
import Reports from "./Pages/Admin/Reports";

export default function App() {
  const { User, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <BrowserRouter>

      {/* 🔥 THIS IS REQUIRED FOR TOAST */}
      <Toaster richColors position="top-right" />

      <Routes>

        {/* USER ROUTES */}
        <Route
          path="/"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} User={User}>
              <UserLayout />
            </CheckAuth>
          }
        >
          <Route index element={<Home />} />
          <Route path="contact" element={<Contact />} />
          <Route path="profile" element={<Profile />} />
          <Route path="therapy" element={<Therapy />} />
        </Route>

        <Route
          path="/admin"
          element={
            <CheckAuth User={User} isAuthenticated={isAuthenticated}>
              <AdminLayout />
            </CheckAuth>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="settings" element={<Settings />} />
          <Route path="reports" element={<Reports />} />

        </Route>

        {/* AUTH ROUTES */}
        <Route
          path="/auth"
          element={
            <CheckAuth isAuthenticated={isAuthenticated} User={User}>
              <Auth />
            </CheckAuth>
          }
        >
          <Route path="signin" element={<Signin />} />
          <Route path="signup" element={<Signup />} />
          <Route path="forgot-password" element={<Forgot />} />
          <Route path="reset-password" element={<ResetPassword />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}