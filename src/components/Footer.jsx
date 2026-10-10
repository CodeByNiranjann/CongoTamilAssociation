// src/components/Footer.jsx
import { Link } from "react-router-dom";
import { Video, Mail, Phone, MapPin } from "lucide-react";

// Fill these in only with verified CTA details.
// Anything left empty is hidden automatically.
// Later, the contact details will come from the admin "Contact Information" section.
const youtubeUrl = "";
const contactEmail = "";
const contactPhone = "";
const contactAddress = "";

const quickLinks = [
  { path: "/about", label: "About CTA" },
  { path: "/committee", label: "Committee" },
  { path: "/festivals", label: "Festivals" },
  { path: "/gallery", label: "Gallery" },
  { path: "/publications", label: "Publications" },
];

const moreLinks = [
  { path: "/tamil-school", label: "Tamil School" },
  { path: "/africa-tamil-charal", label: "Africa Tamil Charal" },
  { path: "/anthem", label: "CTA Anthem" },
  { path: "/job-seeking", label: "Job Seeking" },
  { path: "/by-laws", label: "By-Laws" },
  { path: "/contact", label: "Contact" },
];

function Footer() {
  const currentYear = new Date().getFullYear();

  let youtubeLink = null;
  if (youtubeUrl) {
    youtubeLink = (
      <a
        href={youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="footer-social"
        aria-label="CTA on YouTube"
      >
        <Video size={20} />
        <span>YouTube</span>
      </a>
    );
  }

  let emailItem = null;
  if (contactEmail) {
    emailItem = (
      <li>
        <Mail size={16} />
        <a href={"mailto:" + contactEmail}>{contactEmail}</a>
      </li>
    );
  }

  let phoneItem = null;
  if (contactPhone) {
    phoneItem = (
      <li>
        <Phone size={16} />
        <a href={"tel:" + contactPhone}>{contactPhone}</a>
      </li>
    );
  }

  let addressItem = null;
  if (contactAddress) {
    addressItem = (
      <li>
        <MapPin size={16} />
        <span>{contactAddress}</span>
      </li>
    );
  }

  let hasContactDetails = false;
  if (contactEmail || contactPhone || contactAddress) {
    hasContactDetails = true;
  }

  return (
    <footer className="footer">
      <div className="container footer-grid">
        {/* About column */}
        <div className="footer-column">
          <h3 className="footer-heading">Congo Tamil Association</h3>
          <p className="footer-text">
            A community of Tamil people living in the Democratic Republic of the
            Congo, keeping our language, culture, and friendships alive.
          </p>
          {youtubeLink}
        </div>

        {/* Quick links column */}
        <div className="footer-column">
          <h3 className="footer-heading">Quick Links</h3>
          <ul className="footer-list">
            {quickLinks.map(function (link) {
              return (
                <li key={link.path}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* More links column */}
        <div className="footer-column">
          <h3 className="footer-heading">Explore</h3>
          <ul className="footer-list">
            {moreLinks.map(function (link) {
              return (
                <li key={link.path}>
                  <Link to={link.path}>{link.label}</Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Contact column */}
        <div className="footer-column">
          <h3 className="footer-heading">Get in Touch</h3>
          <ul className="footer-list footer-contact">
            {emailItem}
            {phoneItem}
            {addressItem}
            {hasContactDetails === false && (
              <li>
                <Link to="/contact">Contact us</Link>
              </li>
            )}
            <li>
              <Link to="/join-cta" className="btn btn-accent footer-join">
                Join CTA
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>
            &copy; {currentYear} Congo Tamil Association. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;