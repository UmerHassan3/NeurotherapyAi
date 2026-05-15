const STATS = [
  {
    label: "Total Users",
    value: "1,284",
    delta: "+12% this month",
    positive: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: "#6366f1",
    bg: "rgba(99,102,241,.12)",
  },
  {
    label: "Active Sessions",
    value: "342",
    delta: "+8% today",
    positive: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    color: "#22d3ee",
    bg: "rgba(34,211,238,.12)",
  },
  {
    label: "Therapy Reports",
    value: "89",
    delta: "+5 this week",
    positive: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    color: "#34d399",
    bg: "rgba(52,211,153,.12)",
  },
  {
    label: "Flagged Issues",
    value: "7",
    delta: "-3 from last week",
    positive: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    color: "#f59e0b",
    bg: "rgba(245,158,11,.12)",
  },
];

const RECENT_USERS = [
  { name: "Sarah Ahmed", email: "sarah@example.com", joined: "May 14, 2026", status: "Active" },
  { name: "James Carter", email: "james@example.com", joined: "May 13, 2026", status: "Active" },
  { name: "Lena Müller", email: "lena@example.com", joined: "May 12, 2026", status: "Pending" },
  { name: "Omar Hassan", email: "omar@example.com", joined: "May 11, 2026", status: "Active" },
  { name: "Priya Nair", email: "priya@example.com", joined: "May 10, 2026", status: "Inactive" },
];

function StatusBadge({ status }) {
  const colors = {
    Active:   { color: "#34d399", bg: "rgba(52,211,153,.12)" },
    Pending:  { color: "#f59e0b", bg: "rgba(245,158,11,.12)" },
    Inactive: { color: "#94a3b8", bg: "rgba(148,163,184,.12)" },
  };
  const { color, bg } = colors[status] || colors.Inactive;
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "3px 9px",
      borderRadius: 999, color, background: bg,
      border: `1px solid ${color}33`,
    }}>
      {status}
    </span>
  );
}

export default function Dashboard() {
  return (
    <div className="db-root">
      {/* Page title */}
      <div className="db-head">
        <div>
          <h1 className="db-title">Dashboard</h1>
          <p className="db-sub">Welcome back — here's what's happening today.</p>
        </div>
        <span className="db-date">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </span>
      </div>

      {/* Stat cards */}
      <div className="db-stats">
        {STATS.map(({ label, value, delta, positive, icon, color, bg }) => (
          <div key={label} className="db-card">
            <div className="db-card-icon" style={{ color, background: bg }}>
              {icon}
            </div>
            <div className="db-card-body">
              <p className="db-card-label">{label}</p>
              <p className="db-card-value">{value}</p>
              <p className="db-card-delta" style={{ color: positive ? "#34d399" : "#f59e0b" }}>
                {delta}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent users table */}
      <div className="db-section">
        <div className="db-section-head">
          <h2 className="db-section-title">Recent Users</h2>
        </div>
        <div className="db-table-wrap">
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
              {RECENT_USERS.map((u) => (
                <tr key={u.email}>
                  <td>
                    <div className="db-user-cell">
                      <span className="db-user-avatar">
                        {u.name[0]}
                      </span>
                      {u.name}
                    </div>
                  </td>
                  <td className="db-muted">{u.email}</td>
                  <td className="db-muted">{u.joined}</td>
                  <td><StatusBadge status={u.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .db-root {
          max-width: 1100px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        /* Head */
        .db-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
        }
        .db-title {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          color: #f1f5f9;
        }
        .db-sub {
          margin: 4px 0 0;
          font-size: 13px;
          color: #94a3b8;
        }
        .db-date {
          font-size: 12px;
          color: #64748b;
          padding-top: 6px;
          white-space: nowrap;
        }

        /* Stat cards */
        .db-stats {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 16px;
        }
        .db-card {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          transition: border-color .2s;
        }
        .db-card:hover { border-color: #475569; }
        .db-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .db-card-body { flex: 1; min-width: 0; }
        .db-card-label {
          margin: 0 0 4px;
          font-size: 12px;
          font-weight: 500;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: .04em;
        }
        .db-card-value {
          margin: 0 0 4px;
          font-size: 26px;
          font-weight: 700;
          color: #f1f5f9;
          line-height: 1;
        }
        .db-card-delta {
          margin: 0;
          font-size: 12px;
          font-weight: 500;
        }

        /* Section */
        .db-section {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          overflow: hidden;
        }
        .db-section-head {
          padding: 16px 20px;
          border-bottom: 1px solid #334155;
        }
        .db-section-title {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: #f1f5f9;
        }

        /* Table */
        .db-table-wrap { overflow-x: auto; }
        .db-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .db-table th {
          text-align: left;
          padding: 10px 20px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .05em;
          text-transform: uppercase;
          color: #64748b;
          border-bottom: 1px solid #334155;
        }
        .db-table td {
          padding: 12px 20px;
          color: #e2e8f0;
          border-bottom: 1px solid #1e293b;
        }
        .db-table tbody tr:last-child td { border-bottom: none; }
        .db-table tbody tr:hover td { background: rgba(255,255,255,.03); }
        .db-muted { color: #94a3b8 !important; }

        .db-user-cell {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
        }
        .db-user-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        @media (max-width: 640px) {
          .db-stats { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 400px) {
          .db-stats { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
