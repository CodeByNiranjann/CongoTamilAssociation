// src/components/Navbar.jsx
import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, ShieldCheck } from "lucide-react";

const mainLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/committee", label: "Committee" },
  { to: "/festivals", label: "Festivals" },
  { to: "/gallery", label: "Gallery" },
  { to: "/publications", label: "Publications" },
];

const moreLinks = [
  { to: "/tamil-school", label: "Tamil School" },
  { to: "/africa-tamil-charal", label: "Africa Tamil Charal" },
  { to: "/anthem", label: "CTA Anthem" },
  { to: "/job-seeking", label: "Job Seeking" },
  { to: "/by-laws", label: "By-Laws" },
  { to: "/contact", label: "Contact" },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { pathname } = useLocation();

  // Close menus when the page changes
  useEffect(() => {
    setMenuOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  // Close menus with the Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setMoreOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const linkClass = ({ isActive }) =>
    isActive ? "nav-link active" : "nav-link";

  return (
    <header className="navbar">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand" aria-label="Congo Tamil Association home">
          <span className="navbar-logo">CTA</span>
          <span className="navbar-title">
            Congo Tamil
            <br />
            Association
          </span>
        </Link>

        <nav
          className={menuOpen ? "navbar-links open" : "navbar-links"}
          aria-label="Main navigation"
        >
          {mainLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === "/"} className={linkClass}>
              {link.label}
            </NavLink>
          ))}

          {/* Desktop dropdown */}
          <div className="nav-more">
            <button
              type="button"
              className="nav-link nav-more-btn"
              aria-expanded={moreOpen}
              aria-haspopup="true"
              onClick={() => setMoreOpen((open) => !open)}
            >
              More <ChevronDown size={16} />
            </button>
            <div className={moreOpen ? "nav-dropdown open" : "nav-dropdown"}>
              {moreLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className={linkClass}>
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>

          <Link to="/join-cta" className="btn btn-accent nav-join">
            Join CTA
          </Link>
        </nav>

        <div className="navbar-actions">
          {/* Shortcut to the login page only. It does not grant any access. */}
          <Link
            to="/admin/login"
            className="admin-icon"
            aria-label="Admin Login"
            title="Admin Login"
          >
            <ShieldCheck size={22} />
          </Link>

          <button
            type="button"
            className="menu-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;