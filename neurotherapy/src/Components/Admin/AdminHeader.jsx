import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useDispatch, useSelector } from "react-redux";
import { SignOutUser } from "@/store/authSlice/authSlice";

function getInitials(name = "", email = "") {
  if (name) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : parts[0][0].toUpperCase();
  }
  return email ? email[0].toUpperCase() : "A";
}

export default function AdminHeader({ onMenuToggle, sidebarOpen }) {
  const navigate = useNavigate();
  const { User, isAuthenticated } = useSelector((state) => state.auth);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") setDropdownOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const dispatch = useDispatch();
  const handleLogout = async () => {
    if (loggingOut) return;
    try {
      setLoggingOut(true);
      setDropdownOpen(false);
      dispatch(SignOutUser());
    } catch {
      setLoggingOut(false);
    }
  };

  const initials = getInitials(User?.name, User?.email);
  const displayName = User?.name || User?.email || "Admin";

  return (
    <header className="ah-header">
      <div className="ah-inner">
        {/* Sidebar toggle */}
        <button
          className="ah-toggle"
          onClick={onMenuToggle}
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <span className="ah-toggle-bar" />
          <span className="ah-toggle-bar" />
          <span className="ah-toggle-bar" />
        </button>

        {/* Logo + label */}
        <div
          className="ah-brand"
          onClick={() => navigate("/admin")}
          role="button"
          tabIndex={0}
          aria-label="Go to admin dashboard"
        >
          <img src={logo} alt="logo" className="ah-logo" />
          <span className="ah-brand-label">Admin Panel</span>
        </div>

        <div className="ah-spacer" />

        <span className="ah-role-badge">Administrator</span>

        {/* Avatar + dropdown */}
        <div className="ah-dropdown-wrapper" ref={dropdownRef}>
          <button
            className="ah-avatar-btn"
            onClick={() => setDropdownOpen((p) => !p)}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            aria-label={`Admin menu for ${displayName}`}
          >
            <span className="ah-avatar-initials">{initials}</span>
            <span className="ah-avatar-name">{displayName}</span>
            <svg
              className={`ah-chevron ${dropdownOpen ? "ah-chevron--open" : ""}`}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="ah-dropdown" role="menu">
              <div className="ah-dropdown-header">
                <p className="ah-dropdown-name">{displayName}</p>
                <p className="ah-dropdown-email">{User?.email}</p>
                <span className="ah-dropdown-role">Administrator</span>
              </div>
              <div className="ah-dropdown-divider" />
              <button
                className="ah-dropdown-item ah-dropdown-item--danger"
                role="menuitem"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <>
                    <span className="ah-spinner" aria-hidden="true" />
                    Signing out…
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .ah-header {
          --ah-bg: #1e293b;
          --ah-border: #334155;
          --ah-text: #f1f5f9;
          --ah-muted: #94a3b8;
          --ah-accent: #6366f1;
          --ah-accent-light: rgba(99,102,241,.15);
          --ah-danger: #ef4444;
          --ah-danger-light: rgba(239,68,68,.12);

          position: sticky;
          top: 0;
          z-index: 200;
          background: var(--ah-bg);
          border-bottom: 1px solid var(--ah-border);
          box-shadow: 0 1px 4px rgba(0,0,0,.3);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .ah-inner {
          display: flex;
          align-items: center;
          gap: 12px;
          height: 60px;
          padding: 0 20px;
        }

        /* Toggle button */
        .ah-toggle {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          width: 36px;
          height: 36px;
          background: none;
          border: none;
          cursor: pointer;
          border-radius: 6px;
          padding: 0;
          flex-shrink: 0;
        }
        .ah-toggle:hover { background: rgba(255,255,255,.07); }
        .ah-toggle-bar {
          display: block;
          width: 20px;
          height: 2px;
          background: var(--ah-muted);
          border-radius: 2px;
          margin: 0 auto;
        }

        /* Brand */
        .ah-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          border-radius: 6px;
          padding: 4px 8px;
          flex-shrink: 0;
        }
        .ah-brand:hover { background: rgba(255,255,255,.05); }
        .ah-logo { height: 28px; width: auto; }
        .ah-brand-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--ah-text);
          white-space: nowrap;
        }
        .ah-spacer { flex: 1; }

        /* Role badge */
        .ah-role-badge {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: .05em;
          text-transform: uppercase;
          color: var(--ah-accent);
          background: var(--ah-accent-light);
          border: 1px solid rgba(99,102,241,.3);
          padding: 3px 10px;
          border-radius: 999px;
        }

        /* Avatar button */
        .ah-dropdown-wrapper { position: relative; }
        .ah-avatar-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: 1px solid var(--ah-border);
          cursor: pointer;
          padding: 4px 10px 4px 4px;
          border-radius: 999px;
          transition: border-color .15s, background .15s;
        }
        .ah-avatar-btn:hover { border-color: #475569; background: rgba(255,255,255,.05); }
        .ah-avatar-initials {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .ah-avatar-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--ah-text);
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .ah-chevron { color: var(--ah-muted); transition: transform .2s; }
        .ah-chevron--open { transform: rotate(180deg); }

        /* Dropdown */
        .ah-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 220px;
          background: #1e293b;
          border: 1px solid var(--ah-border);
          border-radius: 10px;
          box-shadow: 0 12px 28px rgba(0,0,0,.4);
          overflow: hidden;
          animation: ah-fade .15s ease;
        }
        @keyframes ah-fade {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ah-dropdown-header { padding: 12px 14px; background: #0f172a; }
        .ah-dropdown-name { margin: 0; font-size: 13px; font-weight: 600; color: var(--ah-text); }
        .ah-dropdown-email { margin: 2px 0 6px; font-size: 12px; color: var(--ah-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ah-dropdown-role {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: .05em;
          color: var(--ah-accent);
          background: var(--ah-accent-light);
          padding: 2px 8px;
          border-radius: 4px;
        }
        .ah-dropdown-divider { height: 1px; background: var(--ah-border); }
        .ah-dropdown-item {
          width: 100%;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 500;
          color: var(--ah-text);
          text-align: left;
          transition: background .12s;
        }
        .ah-dropdown-item:hover { background: rgba(255,255,255,.05); }
        .ah-dropdown-item--danger { color: var(--ah-danger); }
        .ah-dropdown-item--danger:hover { background: var(--ah-danger-light); }
        .ah-dropdown-item:disabled { opacity: .6; cursor: not-allowed; }
        .ah-spinner {
          width: 14px; height: 14px;
          border: 2px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: ah-spin .6s linear infinite;
          flex-shrink: 0;
        }
        @keyframes ah-spin { to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .ah-brand-label { display: none; }
          .ah-role-badge { display: none; }
          .ah-avatar-name { display: none; }
        }
      `}</style>
    </header>
  );
}
