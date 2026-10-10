// src/admin/AdminDashboard.jsx
import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import AdminNavbar from "./AdminNavbar.jsx";
import AdminSidebar from "./AdminSidebar.jsx";

const TOKEN_KEY = "cta_admin_token";

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Later: load these from the backend (new join enquiries and new job applications).
  // They stay 0 until the real API is connected, so nothing is faked.
  const [newJoinCount] = useState(0);
  const [newJobCount] = useState(0);

  // Later: load these from the visitor statistics API.
  // null means "not available yet".
  const [visitorStats] = useState({ today: null, month: null, total: null });

  function openSidebar() {
    setIsSidebarOpen(true);
  }

  function closeSidebar() {
    setIsSidebarOpen(false);
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    navigate("/admin/login", { replace: true });
  }

  function showStat(value) {
    if (value === null) {
      return "--";
    }
    return value;
  }

  // The overview only shows on /admin/dashboard itself, not on the sections
  let isOverview = false;
  if (
    location.pathname === "/admin/dashboard" ||
    location.pathname === "/admin/dashboard/"
  ) {
    isOverview = true;
  }

  let content = <Outlet />;

  if (isOverview) {
    content = (
      <div className="admin-section">
        <h2 className="admin-section-title">Dashboard</h2>

        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-label">Visitors today</span>
            <span className="stat-value">{showStat(visitorStats.today)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Visitors this month</span>
            <span className="stat-value">{showStat(visitorStats.month)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total recorded visits</span>
            <span className="stat-value">{showStat(visitorStats.total)}</span>
          </div>
        </div>

        <div className="stat-grid">
          <div className="stat-card stat-card-alert">
            <span className="stat-label">New Join CTA enquiries</span>
            <span className="stat-value">{newJoinCount}</span>
          </div>
          <div className="stat-card stat-card-alert">
            <span className="stat-label">New job applications</span>
            <span className="stat-value">{newJobCount}</span>
          </div>
        </div>

        <p className="admin-note">
          Visitor numbers show "--" until the visitor API is connected. Choose a
          section from the menu to manage the website content.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        newJoinCount={newJoinCount}
        newJobCount={newJobCount}
      />

      <div className="admin-main">
        <AdminNavbar
          onMenuClick={openSidebar}
          onLogout={handleLogout}
          notificationCount={newJoinCount + newJobCount}
        />
        <div className="admin-content">{content}</div>
      </div>
    </div>
  );
}

export default AdminDashboard;