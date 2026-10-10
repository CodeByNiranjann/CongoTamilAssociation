
import "./css/global.css";
import "./css/navbar.css";
import "./css/home.css";
import "./css/pages.css";
import "./css/cards.css";
import "./css/forms.css";
import "./css/admin.css";

import { Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";

// Public layout components
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";

// Public pages
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Committee from "./pages/Committee.jsx";
import Festivals from "./pages/Festivals.jsx";
import Gallery from "./pages/Gallery.jsx";
import Publications from "./pages/Publications.jsx";
import TamilSchool from "./pages/TamilSchool.jsx";
import AfricaTamilCharal from "./pages/AfricaTamilCharal.jsx";
import Anthem from "./pages/Anthem.jsx";
import JobSeeking from "./pages/JobSeeking.jsx";
import ByLaws from "./pages/ByLaws.jsx";
import Contact from "./pages/Contact.jsx";
import JoinCTAPage from "./pages/JoinCTA.jsx";

// Admin layout and pages
import AdminLogin from "./admin/AdminLogin.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";

// Admin sections
import AdminBanners from "./admin/sections/Banners.jsx";
import AdminAnnouncements from "./admin/sections/Announcements.jsx";
import AdminEvents from "./admin/sections/Events.jsx";
import AdminFestivals from "./admin/sections/Festivals.jsx";
import AdminGallery from "./admin/sections/Gallery.jsx";
import AdminPublications from "./admin/sections/Publications.jsx";
import AdminCommittee from "./admin/sections/Committee.jsx";
import AdminAnthem from "./admin/sections/Anthem.jsx";
import AdminTamilSchool from "./admin/sections/TamilSchool.jsx";
import AdminAfricaTamilCharal from "./admin/sections/AfricaTamilCharal.jsx";
import AdminJobSeekers from "./admin/sections/JobSeekers.jsx";
import AdminJoinEnquiries from "./admin/sections/JoinEnquiries.jsx";
import AdminByLaws from "./admin/sections/ByLaws.jsx";
import AdminContactInfo from "./admin/sections/ContactInfo.jsx";

// Public layout: Navbar + page + Footer
function PublicLayout() {
  const { pathname } = useLocation();

  // Scroll to top on every page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Navbar />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

// Frontend route guard only. The backend verifies the token on every admin API.
// The final auth method is set when we build AdminLogin.jsx.
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("cta_admin_token");
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      {/* Public website */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/committee" element={<Committee />} />
        <Route path="/festivals" element={<Festivals />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/publications" element={<Publications />} />
        <Route path="/tamil-school" element={<TamilSchool />} />
        <Route path="/africa-tamil-charal" element={<AfricaTamilCharal />} />
        <Route path="/anthem" element={<Anthem />} />
        <Route path="/job-seeking" element={<JobSeeking />} />
        <Route path="/by-laws" element={<ByLaws />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/join-cta" element={<JoinCTAPage />} />
      </Route>

      {/* Admin (no public Navbar/Footer) */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      >
        <Route path="banners" element={<AdminBanners />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="festivals" element={<AdminFestivals />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="publications" element={<AdminPublications />} />
        <Route path="committee" element={<AdminCommittee />} />
        <Route path="anthem" element={<AdminAnthem />} />
        <Route path="tamil-school" element={<AdminTamilSchool />} />
        <Route path="africa-tamil-charal" element={<AdminAfricaTamilCharal />} />
        <Route path="job-seekers" element={<AdminJobSeekers />} />
        <Route path="join-enquiries" element={<AdminJoinEnquiries />} />
        <Route path="by-laws" element={<AdminByLaws />} />
        <Route path="contact-info" element={<AdminContactInfo />} />
      </Route>
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;