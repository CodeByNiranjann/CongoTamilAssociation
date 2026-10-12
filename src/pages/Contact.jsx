// src/pages/Contact.jsx
import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send, Link as LinkIcon } from "lucide-react";

import SectionTitle from "../components/SectionTitle.jsx";
import Notification from "../components/Notification.jsx";
import { apiGet, apiPost } from "../api.js";

const emptyContactInfo = {
  email: "",
  phone: "",
  address: "",
  socialLinks: [],
};

const emptyForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

function Contact() {
  const [contactInfo, setContactInfo] = useState(emptyContactInfo);
  const [infoLoading, setInfoLoading] = useState(true);

  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState({ type: "info", message: "" });

  // Load the real contact details from the backend
  useEffect(function loadContactInfo() {
    let isCancelled = false;

    async function fetchInfo() {
      try {
        const result = await apiGet("/contact");

        if (isCancelled === false) {
          setContactInfo({
            email: result.data.email || "",
            phone: result.data.phone || "",
            address: result.data.address || "",
            socialLinks: result.data.socialLinks || [],
          });
        }
      } catch (err) {
        // Contact details are optional, so the form still works without them
      } finally {
        if (isCancelled === false) {
          setInfoLoading(false);
        }
      }
    }

    fetchInfo();

    return function cleanup() {
      isCancelled = true;
    };
  }, []);

  function handleChange(event) {
    const fieldName = event.target.name;
    const fieldValue = event.target.value;

    setFormData({ ...formData, [fieldName]: fieldValue });
  }

  function validateForm() {
    const newErrors = {};

    if (formData.name.trim() === "") {
      newErrors.name = "Name is required.";
    }

    if (/^\S+@\S+\.\S+$/.test(formData.email.trim()) === false) {
      newErrors.email = "Enter a valid email address.";
    }

    if (formData.subject.trim() === "") {
      newErrors.subject = "Subject is required.";
    }

    if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters.";
    }

    if (formData.message.length > 2000) {
      newErrors.message = "Message must be 2000 characters or fewer.";
    }

    return newErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice({ type: "info", message: "" });

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setNotice({
        type: "error",
        message: "Please fix the highlighted fields and try again.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const result = await apiPost("/contact/message", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      setNotice({ type: "success", message: result.message });
      setFormData(emptyForm);
      setErrors({});
    } catch (err) {
      setNotice({ type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  function clearNotice() {
    setNotice({ type: "info", message: "" });
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

  let emailItem = null;
  if (contactInfo.email) {
    emailItem = (
      <li className="contact-item">
        <span className="about-icon" aria-hidden="true">
          <Mail size={24} />
        </span>
        <div>
          <h3 className="contact-label">Email</h3>
          <a href={"mailto:" + contactInfo.email}>{contactInfo.email}</a>
        </div>
      </li>
    );
  }

  let phoneItem = null;
  if (contactInfo.phone) {
    phoneItem = (
      <li className="contact-item">
        <span className="about-icon" aria-hidden="true">
          <Phone size={24} />
        </span>
        <div>
          <h3 className="contact-label">Phone</h3>
          <a href={"tel:" + contactInfo.phone}>{contactInfo.phone}</a>
        </div>
      </li>
    );
  }

  let addressItem = null;
  if (contactInfo.address) {
    addressItem = (
      <li className="contact-item">
        <span className="about-icon" aria-hidden="true">
          <MapPin size={24} />
        </span>
        <div>
          <h3 className="contact-label">Address</h3>
          <p className="contact-address">{contactInfo.address}</p>
        </div>
      </li>
    );
  }

  let socialItem = null;
  if (contactInfo.socialLinks.length > 0) {
    socialItem = (
      <li className="contact-item">
        <span className="about-icon" aria-hidden="true">
          <LinkIcon size={24} />
        </span>
        <div>
          <h3 className="contact-label">Follow us</h3>
          <ul className="contact-social">
            {contactInfo.socialLinks.map(function (link) {
              return (
                <li key={link._id || link.url}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    {link.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </li>
    );
  }

  let hasContactDetails = false;
  if (emailItem || phoneItem || addressItem || socialItem) {
    hasContactDetails = true;
  }

  let infoContent = (
    <p className="empty-state">Contact details will be added soon.</p>
  );

  if (infoLoading) {
    infoContent = <p className="loading-state">Loading contact details...</p>;
  } else if (hasContactDetails) {
    infoContent = (
      <ul className="contact-list">
        {emailItem}
        {phoneItem}
        {addressItem}
        {socialItem}
      </ul>
    );
  }

  let buttonText = "Send Message";
  if (submitting) {
    buttonText = "Sending...";
  }

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1 className="page-header-title">Contact Us</h1>
          <p className="page-header-text">We would love to hear from you.</p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-layout">
          <div className="contact-info">
            <SectionTitle title="Get in Touch" align="left" />
            {infoContent}
          </div>

          <form
            className="public-form contact-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <h2 className="contact-form-title">Send a Message</h2>

            <Notification
              type={notice.type}
              message={notice.message}
              onClose={clearNotice}
            />

            <div className="form-field">
              <label htmlFor="ct-name">Name *</label>
              <input
                id="ct-name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                aria-invalid={invalid("name")}
              />
              {renderError("name")}
            </div>

            <div className="form-field">
              <label htmlFor="ct-email">Email *</label>
              <input
                id="ct-email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                aria-invalid={invalid("email")}
              />
              {renderError("email")}
            </div>

            <div className="form-field">
              <label htmlFor="ct-subject">Subject *</label>
              <input
                id="ct-subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                aria-invalid={invalid("subject")}
              />
              {renderError("subject")}
            </div>

            <div className="form-field">
              <label htmlFor="ct-message">Message *</label>
              <textarea
                id="ct-message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                aria-invalid={invalid("message")}
              ></textarea>
              {renderError("message")}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              <Send size={18} /> {buttonText}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

export default Contact;