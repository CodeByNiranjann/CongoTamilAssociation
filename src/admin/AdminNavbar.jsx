// src/admin/AdminNavbar.jsx
import { Link } from "react-router-dom";
import { Menu, LogOut, Bell, Globe } from "lucide-react";

// Props: onMenuClick, onLogout, notificationCount

function AdminNavbar(props) {
  const count = props.notificationCount || 0;

  let badge = null;
  if (count > 0) {
    badge = <span className="admin-badge">{count}</span>;
  }

  return (
    <header className="admin-topbar">
      <button
        type="button"
        className="admin-menu-button"
        aria-label="Open menu"
        onClick={props.onMenuClick}
      >
        <Menu size={24} />
      </button>

      <h1 className="admin-topbar-title">CTA Admin</h1>

      <div className="admin-topbar-actions">
        <span
          className="admin-bell"
          title={count + " new notifications"}
          aria-label={count + " new notifications"}
        >
          <Bell size={20} />
          {badge}
        </span>

        <Link to="/" className="admin-btn" target="_blank" rel="noopener noreferrer">
          <Globe size={16} /> View site
        </Link>

        <button
          type="button"
          className="admin-btn admin-btn-danger"
          onClick={props.onLogout}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </header>
  );
}

export default AdminNavbar;