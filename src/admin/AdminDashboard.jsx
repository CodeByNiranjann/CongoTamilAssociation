// src/admin/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import AdminNavbar from "./AdminNavbar.jsx";
import AdminSidebar from "./AdminSidebar.jsx";
import { apiGet } from "../api.js";

const TOKEN_KEY = "cta_admin_token";

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Real counts from the backend. null means "not loaded yet".
  const [newJoinCount, setNewJoinCount] = useState(0);
  const [newJobCount, setNewJobCount] = useState(0);
  const [visitorStats, setVisitorStats] = useState({
    today: null,
    month: null,
    total: null,
  });
  const [statsError, setStatsError] = useState("");

  // Reload the counts every time the admin moves to another page,
  // so the badges drop after statuses are changed.
  useEffect(
    function loadDashboardData() {
      let isCancelled = false;

      async function fetchAll() {
        const results = await Promise.allSettled([
          apiGet("/join-enquiries/new-count", true),
          apiGet("/job-seekers/new-count", true),
          apiGet("/visitors/stats", true),
        ]);

        if (isCancelled) {
          return;
        }

        if (results[0].status === "fulfilled") {
          setNewJoinCount(results[0].value.count);
        }

        if (results[1].status === "fulfilled") {
          setNewJobCount(results[1].value.count);
        }

        if (results[2].status === "fulfilled") {
          setVisitorStats({
            today: results[2].value.today,
            month: results[2].value.month,
            total: results[2].value.total,
          });
          setStatsError("");
        } else {
          setStatsError("Could not load visitor statistics.");
        }
      }

      fetchAll();

      return function cleanup() {
        isCancelled = true;
      };
    },
    [location.pathname]
  );

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

        {statsError && <div className="alert alert-error">{statsError}</div>}

        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-label">Visits today</span>
            <span className="stat-value">{showStat(visitorStats.today)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Visits this month</span>
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
          Visits are counted once per browser session, so they are not a count
          of unique people. Choose a section from the menu to manage the
          website content.
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