// src/components/Footer.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Video, Mail, Phone, MapPin } from "lucide-react";

import { apiGet } from "../api.js";

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

  const [contact, setContact] = useState({
    email: "",
    phone: "",
    address: "",
    youtubeUrl: "",
  });

  // Real contact details from the backend. If the request fails,
  // the footer simply shows no contact details.
  useEffect(function loadContact() {
    let isCancelled = false;

    async function fetchContact() {
      try {
        const result = await apiGet("/contact");

        if (isCancelled === false) {
          setContact({
            email: result.data.email || "",
            phone: result.data.phone || "",
            address: result.data.address || "",
            youtubeUrl: result.data.youtubeUrl || "",
          });
        }
      } catch (err) {
        // Nothing to show
      }
    }

    fetchContact();

    return function cleanup() {
      isCancelled = true;
    };
  }, []);

  let youtubeLink = null;
  if (contact.youtubeUrl) {
    youtubeLink = (
      <a
        href={contact.youtubeUrl}
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
  if (contact.email) {
    emailItem = (
      <li>
        <Mail size={16} />
        <a href={"mailto:" + contact.email}>{contact.email}</a>
      </li>
    );
  }

  let phoneItem = null;
  if (contact.phone) {
    phoneItem = (
      <li>
        <Phone size={16} />
        <a href={"tel:" + contact.phone}>{contact.phone}</a>
      </li>
    );
  }

  let addressItem = null;
  if (contact.address) {
    addressItem = (
      <li>
        <MapPin size={16} />
        <span>{contact.address}</span>
      </li>
    );
  }

  let hasContactDetails = false;
  if (contact.email || contact.phone || contact.address) {
    hasContactDetails = true;
  }

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-column">
          <h3 className="footer-heading">Congo Tamil Association</h3>
          <p className="footer-text">
            A community of Tamil people living in the Democratic Republic of the
            Congo, keeping our language, culture, and friendships alive.
          </p>
          {youtubeLink}
        </div>

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