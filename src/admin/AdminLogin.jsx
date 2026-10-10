// src/admin/AdminLogin.jsx
import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { ShieldCheck, LogIn, ArrowLeft } from "lucide-react";

import Notification from "../components/Notification.jsx";

// Backend address. Set VITE_API_URL in a .env file for production.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// Same key that ProtectedRoute in App.jsx checks
const TOKEN_KEY = "cta_admin_token";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState({ type: "error", message: "" });

  // Already logged in: go straight to the dashboard
  if (localStorage.getItem(TOKEN_KEY)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  function handleChange(event) {
    const fieldName = event.target.name;
    const fieldValue = event.target.value;

    setFormData({ ...formData, [fieldName]: fieldValue });
  }

  function validateForm() {
    const newErrors = {};

    if (formData.email.trim() === "") {
      newErrors.email = "Email or username is required.";
    }

    if (formData.password === "") {
      newErrors.password = "Password is required.";
    }

    return newErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice({ type: "error", message: "" });

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(API_URL + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok === false || !data.token) {
        setNotice({
          type: "error",
          message: data.message || "Login failed. Check your details.",
        });
        setSubmitting(false);
        return;
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      navigate("/admin/dashboard", { replace: true });
    } catch (error) {
      setNotice({
        type: "error",
        message: "Cannot reach the server. Please try again later.",
      });
      setSubmitting(false);
    }
  }

  function clearNotice() {
    setNotice({ type: "error", message: "" });
  }

  function renderError(name) {
    if (!errors[name]) {
      return null;
    }
    return <span className="form-error">{errors[name]}</span>;
  }

  function invalid(name) {
    if (errors[name]) {
      return "true";
    }
    return "false";
  }

  let buttonText = "Log In";
  if (submitting) {
    buttonText = "Logging in...";
  }

  return (
    <main className="login-page">
      <div className="login-card">
        <span className="login-icon" aria-hidden="true">
          <ShieldCheck size={34} />
        </span>
        <h1 className="login-title">Admin Login</h1>
        <p className="login-subtitle">Congo Tamil Association</p>

        <Notification
          type={notice.type}
          message={notice.message}
          onClose={clearNotice}
        />

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="admin-email">Email or username</label>
            <input
              id="admin-email"
              name="email"
              type="text"
              autoComplete="username"
              value={formData.email}
              onChange={handleChange}
              aria-invalid={invalid("email")}
            />
            {renderError("email")}
          </div>

          <div className="form-field">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              aria-invalid={invalid("password")}
            />
            {renderError("password")}
          </div>

          <button
            type="submit"
            className="btn btn-primary login-button"
            disabled={submitting}
          >
            <LogIn size={18} /> {buttonText}
          </button>
        </form>

        <Link to="/" className="login-back">
          <ArrowLeft size={16} /> Back to website
        </Link>
      </div>
    </main>
  );
}

export default AdminLogin;