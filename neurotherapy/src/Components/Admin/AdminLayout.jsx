import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import AdminHeader from "./AdminHeader";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Sessions",
    path: "/admin/sessions",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: "Reports",
    path: "/admin/reports",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) =>
    path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(path);

  return (
    <div className="al-root">
      <AdminHeader
        onMenuToggle={() => setSidebarOpen((p) => !p)}
        sidebarOpen={sidebarOpen}
      />

      <div className="al-body">
        {/* Sidebar */}
        <aside className={`al-sidebar ${sidebarOpen ? "al-sidebar--open" : "al-sidebar--closed"}`}>
          <nav className="al-nav">
            {NAV_ITEMS.map(({ label, path, icon }) => (
              <button
                key={path}
                className={`al-nav-item ${isActive(path) ? "al-nav-item--active" : ""}`}
                onClick={() => navigate(path)}
                title={!sidebarOpen ? label : undefined}
              >
                <span className="al-nav-icon">{icon}</span>
                {sidebarOpen && <span className="al-nav-label">{label}</span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="al-main">
          <Outlet />
        </main>
      </div>

      <style>{`
        .al-root {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: #0f172a;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .al-body {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        /* Sidebar */
        .al-sidebar {
          background: #1e293b;
          border-right: 1px solid #334155;
          display: flex;
          flex-direction: column;
          transition: width .25s ease;
          overflow: hidden;
          flex-shrink: 0;
        }
        .al-sidebar--open  { width: 220px; }
        .al-sidebar--closed { width: 60px; }

        .al-nav {
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .al-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 8px;
          border: none;
          background: none;
          cursor: pointer;
          color: #94a3b8;
          font-size: 13px;
          font-weight: 500;
          text-align: left;
          white-space: nowrap;
          transition: background .15s, color .15s;
          width: 100%;
        }
        .al-nav-item:hover {
          background: rgba(255,255,255,.07);
          color: #f1f5f9;
        }
        .al-nav-item--active {
          background: rgba(99,102,241,.18);
          color: #818cf8;
        }
        .al-nav-item--active:hover {
          background: rgba(99,102,241,.25);
          color: #818cf8;
        }
        .al-nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .al-nav-label { overflow: hidden; text-overflow: ellipsis; }

        /* Main */
        .al-main {
          flex: 1;
          overflow-y: auto;
          padding: 28px;
          color: #f1f5f9;
          min-height: calc(100vh - 60px);
        }

        @media (max-width: 768px) {
          .al-sidebar--open  { width: 60px; }
          .al-sidebar--closed { width: 0; border: none; }
          .al-nav-label { display: none; }
          .al-main { padding: 16px; }
        }
      `}</style>
    </div>
  );
}
