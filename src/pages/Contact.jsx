// src/pages/Contact.jsx
import { useState } from "react";
import { Mail, Phone, MapPin, Send, Link as LinkIcon } from "lucide-react";

import SectionTitle from "../components/SectionTitle.jsx";
import Notification from "../components/Notification.jsx";

// TEMPORARY content. I have not invented any contact details.
// Fill these in only with verified CTA information.
// Anything left empty is hidden.
// Later, all of this comes from the admin "Contact Information" section.
//
// socialLinks example: [{ name: "Facebook", url: "https://..." }]
const contactInfo = {
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
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState({ type: "info", message: "" });

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

  function handleSubmit(event) {
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

    // Backend is not connected yet, so nothing is sent or saved.
    // Later: send formData to the contact API here.
    setSubmitting(true);
    setNotice({
      type: "info",
      message:
        "Form is valid. It is not sent yet because the backend is not connected.",
    });
    setSubmitting(false);
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
                <li key={link.url}>
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

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1 className="page-header-title">Contact Us</h1>
          <p className="page-header-text">
            We would love to hear from you.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-layout">
          <div className="contact-info">
            <SectionTitle title="Get in Touch" align="left" />
            {hasContactDetails ? (
              <ul className="contact-list">
                {emailItem}
                {phoneItem}
                {addressItem}
                {socialItem}
              </ul>
            ) : (
              <p className="empty-state">
                Contact details will be added soon.
              </p>
            )}
          </div>

          <form className="public-form contact-form" onSubmit={handleSubmit} noValidate>
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
              <Send size={18} /> Send Message
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

export default Contact;