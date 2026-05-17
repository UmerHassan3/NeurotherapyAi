import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { MessageSquare, ChevronDown, ChevronUp, Brain } from "lucide-react";

function SessionCard({ session }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(session.createdAt).toLocaleDateString("en-US", {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
  });
  const time = new Date(session.createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });
  const msgCount = session.messages?.length || 0;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-700/30 transition"
      >
        <div className="w-9 h-9 rounded-lg bg-violet-600/20 flex items-center justify-center flex-shrink-0">
          <MessageSquare className="w-4 h-4 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">
            {session.summary || "Meditation session"}
          </p>
          <p className="text-slate-400 text-xs mt-0.5">
            {date} · {time} · {msgCount} messages
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-slate-700 p-4 space-y-3 max-h-72 overflow-y-auto">
          {session.messages?.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === "bot" ? "justify-start" : "justify-end"}`}>
              {m.role === "bot" && (
                <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Brain className="w-3 h-3 text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  m.role === "bot"
                    ? "bg-slate-700 text-slate-200 rounded-tl-none"
                    : "bg-violet-600 text-white rounded-tr-none"
                }`}
                dangerouslySetInnerHTML={{
                  __html: m.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const Profile = () => {
  const { User, isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    setSessionsLoading(true);
    fetch("/api/session/my", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setSessions(data?.data || []))
      .catch(() => setSessions([]))
      .finally(() => setSessionsLoading(false));
  }, [isAuthenticated]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-lg mx-auto space-y-6">

        {/* Profile Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
              {initials || "U"}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                {User?.firstName} {User?.lastName}
              </h2>
              <p className="text-sm text-slate-400">{User?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700">
              <span className="text-slate-400 text-sm">First Name</span>
              <span className="text-white font-medium">{User?.firstName || "-"}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700">
              <span className="text-slate-400 text-sm">Last Name</span>
              <span className="text-white font-medium">{User?.lastName || "-"}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700">
              <span className="text-slate-400 text-sm">Email</span>
              <span className="text-white font-medium break-all">{User?.email || "-"}</span>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Secure Profile · NeuroTherapy
          </div>
        </div>

        {/* Session History */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-violet-400" />
            <h3 className="text-white font-semibold">Meditation Chat History</h3>
            {sessions.length > 0 && (
              <span className="ml-auto text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
                {sessions.length} session{sessions.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {sessionsLoading ? (
            <p className="text-slate-400 text-sm text-center py-4 animate-pulse">Loading sessions...</p>
          ) : sessions.length === 0 ? (
            <div className="text-center py-6 text-slate-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No saved sessions yet.</p>
              <p className="text-xs mt-1">Start a Meditation Chat and save it to see it here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <SessionCard key={s._id} session={s} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;
