import { deleteUsers, fetchAllUsers } from "@/store/adminSlice/adminSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

function StatusBadge({ status }) {
  const colors = {
    Active: { color: "#34d399", bg: "rgba(52,211,153,.12)" },
    Pending: { color: "#f59e0b", bg: "rgba(245,158,11,.12)" },
    Inactive: { color: "#94a3b8", bg: "rgba(148,163,184,.12)" },
  };

  const { color, bg } = colors[status] || colors.Inactive;

  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        padding: "3px 9px",
        borderRadius: 999,
        color,
        background: bg,
        border: `1px solid ${color}33`,
      }}
    >
      {status}
    </span>
  );
}

export default function Dashboard() {
  const { Users, loading } = useSelector((state) => state.admin);
  const dispatch = useDispatch();

const handleDelete = async (id) => {
  const confirmDelete = confirm("Are you sure you want to delete this user?");
  if (!confirmDelete) return;

  try {
    await dispatch(deleteUsers(id)).unwrap();

    toast.success("User deleted successfully ✅");

    // 🔥 re-fetch users (forces UI refresh)
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
          <p className="db-sub">
            Welcome back — here's what's happening today.
          </p>
        </div>

        <span className="db-date">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
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
            <p style={{ padding: "20px", color: "#94a3b8" }}>
              Loading users...
            </p>
          ) : (
            <table className="db-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {Users.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                      No users found
                    </td>
                  </tr>
                ) : (
                  Users.map((u) => (
                    <tr key={u._id || u.id}>
                      <td>
                        <div className="db-user-cell">
                          <span className="db-user-avatar">
                            {u.firstName?.[0] || "U"}
                          </span>
                          {u.firstName} {u.lastName}
                        </div>
                      </td>

                      <td className="db-muted">{u.email}</td>

                      <td className="db-muted">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>

                      <td>
                        <StatusBadge status="Active" />
                      </td>

                      {/* 🔥 REMOVE BUTTON */}
                      <td>
                        <button
                          onClick={() => handleDelete(u._id || u.id)}
                          style={{
                            background: "#ef4444",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style>{`
        .db-root {
          max-width: 1100px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .db-head {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
        }

        .db-title {
          font-size: 22px;
          font-weight: 700;
          color: #f1f5f9;
        }

        .db-sub {
          font-size: 13px;
          color: #94a3b8;
        }

        .db-date {
          font-size: 12px;
          color: #64748b;
        }

        .db-stats {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
        }

        .db-card {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 20px;
        }

        .db-card-label {
          font-size: 12px;
          color: #94a3b8;
        }

        .db-card-value {
          font-size: 26px;
          color: #f1f5f9;
          font-weight: 700;
        }

        .db-section {
          background: #1e293b;
          border-radius: 12px;
          overflow: hidden;
        }

        .db-section-head {
          padding: 16px;
          border-bottom: 1px solid #334155;
        }

        .db-section-title {
          color: #f1f5f9;
        }

        .db-table {
          width: 100%;
          border-collapse: collapse;
        }

        .db-table th {
          padding: 10px;
          color: #64748b;
          text-align: left;
        }

        .db-table td {
          padding: 12px;
          color: #e2e8f0;
        }

        .db-user-cell {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .db-user-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #6366f1;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .db-muted {
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}