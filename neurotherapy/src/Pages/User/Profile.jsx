import React from "react";
import { useSelector } from "react-redux";

const Profile = () => {
  const { User, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-slate-400 animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (!isAuthenticated || !User) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-red-400">User not found / not logged in</p>
      </div>
    );
  }

  const initials =
    `${User?.firstName?.[0] || ""}${User?.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">

      {/* Card */}
      <div className="w-full max-w-lg bg-slate-900/60 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-8">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">

          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
            {initials || "U"}
          </div>

          {/* Name + Email */}
          <div>
            <h2 className="text-xl font-semibold text-white">
              {User?.firstName} {User?.lastName}
            </h2>
            <p className="text-sm text-slate-400">{User?.email}</p>
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-4">

          <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <span className="text-slate-400 text-sm">First Name</span>
            <span className="text-white font-medium">
              {User?.firstName || "-"}
            </span>
          </div>

          <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <span className="text-slate-400 text-sm">Last Name</span>
            <span className="text-white font-medium">
              {User?.lastName || "-"}
            </span>
          </div>

          <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <span className="text-slate-400 text-sm">Email</span>
            <span className="text-white font-medium break-all">
              {User?.email || "-"}
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Secure Profile • NeuroTherapy
        </div>

      </div>
    </div>
  );
};

export default Profile;