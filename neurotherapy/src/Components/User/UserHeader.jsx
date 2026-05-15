import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function UserHeader({ user, onSignout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  const NAV_LINKS = [
    { label: "Contact", path: "/contact" },
    { label: "Therapy", path: "/therapy" },
    { label: "Profile", path: "/profile" },
  ];

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  // close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // close on ESC
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setDropdownOpen(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const handleLogout = async () => {
    try {
      await onSignout?.();
      navigate("/auth/signin");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="header">
      <div className="container">

        {/* Logo */}
        <div className="logo" onClick={() => navigate("/")}>
          NeuroTherapy
        </div>

        {/* Desktop Nav */}
        <nav className="nav">
          {NAV_LINKS.map((item) => (
            <button
              key={item.path}
              className={`navLink ${
                location.pathname === item.path ? "active" : ""
              }`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Side */}
        <div className="right">

          {/* Avatar Dropdown */}
          <div className="dropdown" ref={dropdownRef}>
            <button
              className="avatar"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="circle">{initials}</div>
              <span className="name">{user?.name || "User"}</span>
            </button>

            {dropdownOpen && (
              <div className="menu">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/settings");
                  }}
                >
                  Settings
                </button>

                <button className="danger" onClick={handleLogout}>
                  Sign out
                </button>
              </div>
            )}
          </div>

          {/* Mobile Button */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobileMenu">
          {NAV_LINKS.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setMenuOpen(false);
              }}
            >
              {item.label}
            </button>
          ))}

          <button onClick={() => navigate("/settings")}>
            Settings
          </button>

          <button className="danger" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .header {
          position: sticky;
          top: 0;
          background: white;
          border-bottom: 1px solid #eee;
          z-index: 1000;
        }

        .container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
        }

        .logo {
          font-weight: bold;
          font-size: 18px;
          cursor: pointer;
        }

        .nav {
          display: flex;
          gap: 16px;
        }

        .navLink {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          color: #555;
        }

        .active {
          color: #2563eb;
          font-weight: 600;
        }

        .right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .dropdown {
          position: relative;
        }

        .avatar {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid #ddd;
          padding: 5px 10px;
          border-radius: 999px;
          background: white;
          cursor: pointer;
        }

        .circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #2563eb;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        .menu {
          position: absolute;
          right: 0;
          top: 45px;
          background: white;
          border: 1px solid #eee;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          border-radius: 10px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .menu button {
          padding: 10px 14px;
          border: none;
          background: white;
          text-align: left;
          cursor: pointer;
        }

        .menu button:hover {
          background: #f5f5f5;
        }

        .danger {
          color: red;
        }

        .hamburger {
          display: none;
          font-size: 22px;
          background: none;
          border: none;
          cursor: pointer;
        }

        .mobileMenu {
          display: none;
          flex-direction: column;
          padding: 10px;
          border-top: 1px solid #eee;
        }

        .mobileMenu button {
          padding: 10px;
          border: none;
          background: none;
          text-align: left;
        }

        @media (max-width: 768px) {
          .nav {
            display: none;
          }

          .hamburger {
            display: block;
          }

          .mobileMenu {
            display: flex;
          }
        }
      `}</style>
    </header>
  );
}