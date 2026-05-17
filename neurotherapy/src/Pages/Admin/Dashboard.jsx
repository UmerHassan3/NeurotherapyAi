import { deleteUsers, fetchAllUsers } from "@/store/adminSlice/adminSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { X, MessageSquare, Brain, ChevronDown, ChevronUp } from "lucide-react";

function StatusBadge({ status }) {
  const colors = {
    Active: { color: "#34d399", bg: "rgba(52,211,153,.12)" },
    Pending: { color: "#f59e0b", bg: "rgba(245,158,11,.12)" },
    Inactive: { color: "#94a3b8", bg: "rgba(148,163,184,.12)" },
  };
  const { color, bg } = colors[status] || colors.Inactive;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 999, color, background: bg, border: `1px solid ${color}33` }}>
      {status}
    </span>
  );
}

function SessionMessage({ msg }) {
  const isBot = msg.role === "bot";
  return (
    <div className={`flex gap-2 ${isBot ? "justify-start" : "justify-end"}`}>
      {isBot && (
        <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Brain size={10} color="white" />
        </div>
      )}
      <div
        style={{
          maxWidth: "75%",
          borderRadius: 12,
          padding: "8px 12px",
          fontSize: 12,
          lineHeight: 1.5,
          background: isBot ? "#1e293b" : "#6d28d9",
          color: isBot ? "#cbd5e1" : "white",
          borderTopLeftRadius: isBot ? 4 : 12,
          borderTopRightRadius: isBot ? 12 : 4,
        }}
        dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }}
      />
    </div>
  );
}

function SessionItem({ session }) {
  const [open, setOpen] = useState(false);
  const date = new Date(session.createdAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const time = new Date(session.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  return (
    <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 10, overflow: "hidden", marginBottom: 8 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "none", border: "none", cursor: "pointer", color: "#e2e8f0", textAlign: "left" }}
      >
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(139,92,246,.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <MessageSquare size={14} color="#a78bfa" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {session.summary || "Meditation session"}
          </p>
          <p style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
            {date} · {time} · {session.messages?.length || 0} messages
          </p>
        </div>
        {open ? <ChevronUp size={14} color="#64748b" /> : <ChevronDown size={14} color="#64748b" />}
      </button>
      {open && (
        <div style={{ borderTop: "1px solid #334155", padding: 12, maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          {session.messages?.map((m, i) => <SessionMessage key={i} msg={m} />)}
        </div>
      )}
    </div>
  );
}

function SessionHistoryModal({ user, onClose }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/admin/users/${user._id || user.id}/sessions`)
      .then((r) => r.json())
      .then((data) => setSessions(data?.data || []))
      .catch(() => setError("Failed to load sessions"))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 14, width: "100%", maxWidth: 560, maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Modal header */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #334155", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(139,92,246,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MessageSquare size={16} color="#a78bfa" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 15 }}>
              {user.firstName} {user.lastName}
            </p>
            <p style={{ color: "#64748b", fontSize: 12 }}>Session History</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {/* Modal body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          {loading ? (
            <p style={{ color: "#64748b", textAlign: "center", padding: 24, fontSize: 13 }}>Loading sessions…</p>
          ) : error ? (
            <p style={{ color: "#ef4444", textAlign: "center", padding: 24, fontSize: 13 }}>{error}</p>
          ) : sessions.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32, color: "#64748b" }}>
              <MessageSquare size={28} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
              <p style={{ fontSize: 13 }}>No saved sessions for this user.</p>
            </div>
          ) : (
            <div>
              <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 10 }}>
                {sessions.length} session{sessions.length !== 1 ? "s" : ""} found
              </p>
              {sessions.map((s) => <SessionItem key={s._id} session={s} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { Users, loading } = useSelector((state) => state.admin);
  const dispatch = useDispatch();
  const [sessionUser, setSessionUser] = useState(null);

  const handleDelete = async (id) => {
    const confirmDelete = confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;
    try {
      await dispatch(deleteUsers(id)).unwrap();
      toast.success("User deleted successfully ✅");
      dispatch(fetchAllUsers());
    } catch (error) {
      toast.error(error?.message || "Failed to delete user ❌");
    }
  };

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  return (
    <div className="db-root">
      {/* Header */}
      <div className="db-head">
        <div>
          <h1 className="db-title">Dashboard</h1>
          <p className="db-sub">Welcome back — here's what's happening today.</p>
        </div>
        <span className="db-date">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </span>
      </div>

      {/* Stats */}
      <div className="db-stats">
        <div className="db-card">
          <div className="db-card-body">
            <p className="db-card-label">Total Users</p>
            <p className="db-card-value">{Users.length}</p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="db-section">
        <div className="db-section-head">
          <h2 className="db-section-title">Users</h2>
        </div>
        <div className="db-table-wrap">
          {loading ? (
            <p style={{ padding: "20px", color: "#94a3b8" }}>Loading users...</p>
          ) : (
            <table className="db-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Users.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>No users found</td>
                  </tr>
                ) : (
                  Users.map((u) => (
                    <tr key={u._id || u.id}>
                      <td>
                        <div className="db-user-cell">
                          <span className="db-user-avatar">{u.firstName?.[0] || "U"}</span>
                          {u.firstName} {u.lastName}
                        </div>
                      </td>
                      <td className="db-muted">{u.email}</td>
                      <td className="db-muted">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td><StatusBadge status="Active" /></td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => setSessionUser(u)}
                            style={{ background: "#6d28d9", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: 4 }}
                          >
                            <MessageSquare size={12} />
                            Session History
                          </button>
                          <button
                            onClick={() => handleDelete(u._id || u.id)}
                            style={{ background: "#ef4444", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Session History Modal */}
      {sessionUser && (
        <SessionHistoryModal user={sessionUser} onClose={() => setSessionUser(null)} />
      )}

      <style>{`
        .db-root { max-width: 1100px; display: flex; flex-direction: column; gap: 28px; }
        .db-head { display: flex; justify-content: space-between; flex-wrap: wrap; }
        .db-title { font-size: 22px; font-weight: 700; color: #f1f5f9; }
        .db-sub { font-size: 13px; color: #94a3b8; }
        .db-date { font-size: 12px; color: #64748b; }
        .db-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); }
        .db-card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; }
        .db-card-label { font-size: 12px; color: #94a3b8; }
        .db-card-value { font-size: 26px; color: #f1f5f9; font-weight: 700; }
        .db-section { background: #1e293b; border-radius: 12px; overflow: hidden; }
        .db-section-head { padding: 16px; border-bottom: 1px solid #334155; }
        .db-section-title { color: #f1f5f9; }
        .db-table { width: 100%; border-collapse: collapse; }
        .db-table th { padding: 10px; color: #64748b; text-align: left; }
        .db-table td { padding: 12px; color: #e2e8f0; }
        .db-user-cell { display: flex; gap: 10px; align-items: center; }
        .db-user-avatar { width: 30px; height: 30px; border-radius: 50%; background: #6366f1; color: white; display: flex; align-items: center; justify-content: center; }
        .db-muted { color: #94a3b8; }
      `}</style>
    </div>
  );
}
