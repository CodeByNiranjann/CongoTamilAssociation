// src/admin/AdminSidebar.jsx
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Megaphone,
  Calendar,
  Sparkles,
  Images,
  BookOpen,
  Users,
  Music,
  GraduationCap,
  Newspaper,
  Briefcase,
  UserPlus,
  FileText,
  Phone,
  X,
} from "lucide-react";

// Props: isOpen, onClose, newJoinCount, newJobCount

function AdminSidebar(props) {
  const joinCount = props.newJoinCount || 0;
  const jobCount = props.newJobCount || 0;

  const links = [
    { path: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} />, end: true },
    { path: "/admin/dashboard/banners", label: "Homepage Banners", icon: <ImageIcon size={18} /> },
    { path: "/admin/dashboard/announcements", label: "Announcements", icon: <Megaphone size={18} /> },
    { path: "/admin/dashboard/events", label: "Upcoming Events", icon: <Calendar size={18} /> },
    { path: "/admin/dashboard/festivals", label: "Festivals", icon: <Sparkles size={18} /> },
    { path: "/admin/dashboard/gallery", label: "Gallery", icon: <Images size={18} /> },
    { path: "/admin/dashboard/publications", label: "Publications", icon: <BookOpen size={18} /> },
    { path: "/admin/dashboard/committee", label: "Committee", icon: <Users size={18} /> },
    { path: "/admin/dashboard/anthem", label: "CTA Anthem", icon: <Music size={18} /> },
    { path: "/admin/dashboard/tamil-school", label: "Tamil School", icon: <GraduationCap size={18} /> },
    { path: "/admin/dashboard/africa-tamil-charal", label: "Africa Tamil Charal", icon: <Newspaper size={18} /> },
    { path: "/admin/dashboard/job-seekers", label: "Job Seekers", icon: <Briefcase size={18} />, count: jobCount },
    { path: "/admin/dashboard/join-enquiries", label: "Join Enquiries", icon: <UserPlus size={18} />, count: joinCount },
    { path: "/admin/dashboard/by-laws", label: "By-Laws", icon: <FileText size={18} /> },
    { path: "/admin/dashboard/contact-info", label: "Contact Info", icon: <Phone size={18} /> },
  ];

  function getLinkClass(navState) {
    if (navState.isActive) {
      return "admin-link active";
    }
    return "admin-link";
  }

  let sidebarClass = "admin-sidebar";
  if (props.isOpen) {
    sidebarClass = "admin-sidebar open";
  }

  let overlay = null;
  if (props.isOpen) {
    overlay = (
      <div
        className="admin-overlay"
        onClick={props.onClose}
        aria-hidden="true"
      ></div>
    );
  }

  return (
    <>
      {overlay}

      <aside className={sidebarClass} aria-label="Admin navigation">
        <div className="admin-sidebar-head">
          <span className="admin-sidebar-brand">CTA Admin</span>
          <button
            type="button"
            className="admin-sidebar-close"
            aria-label="Close menu"
            onClick={props.onClose}
          >
            <X size={22} />
          </button>
        </div>

        <nav className="admin-links">
          {links.map(function (link) {
            let badge = null;
            if (link.count > 0) {
              badge = <span className="admin-badge">{link.count}</span>;
            }

            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end === true}
                className={getLinkClass}
                onClick={props.onClose}
              >
                {link.icon}
                <span className="admin-link-label">{link.label}</span>
                {badge}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export default AdminSidebar;